import type { FieldErrors, FormContext, FormError, FormState, ItemResponse, Values } from '@shared'
import {
  addTouched,
  cloneValues,
  getDefaultValues,
  getDirtyValues,
  mergeWithDefaults,
  resolveSchema,
  setFieldErrorIn,
  setFieldErrorsIn,
  toggleDirty,
} from '@shared/utils'
import { useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import {
  defaultErrorAdapter,
  defaultResolveMode,
  defaultSchemaToFields,
  defaultValidateSchema,
} from '@shared/options'
import { FormContextProvider } from '../context/form-context'
import type { FormProps } from '../types'
import { Slot } from './slot'

/** Everything the user edits plus what the last response set. Changed together, so kept together. */
interface FormData {
  values: Values
  initialValues: Values
  touched: string[]
  dirty: string[]
  fieldErrors: FieldErrors
  error: FormError | null
  response: ItemResponse | null
}

const EMPTY_DATA: FormData = {
  values: {},
  initialValues: {},
  touched: [],
  dirty: [],
  fieldErrors: {},
  error: null,
  response: null,
}

export function Form(props: FormProps) {
  const {
    itemId,
    schema,
    createSchema,
    updateSchema,
    read,
    create,
    update,
    delete: remove,
    meta,
    resolveMode = defaultResolveMode,
    schemaToFields = defaultSchemaToFields,
    validateSchema = defaultValidateSchema,
    errorAdapter = defaultErrorAdapter,
    ref,
    children,
  } = props

  const mode = resolveMode({ itemId })
  const isCreateMode = mode === 'create'
  const isUpdateMode = mode === 'update'
  const targetSchema = resolveSchema(mode, { schema, createSchema, updateSchema })

  // Memoized on the schema so an inline `schemaToFields` does not rebuild the fields every render.
  const fields = useMemo(() => {
    return schemaToFields(targetSchema)
  }, [targetSchema])

  /*
   * `dataRef` is the source of truth and is updated synchronously, so an action called in the same
   * event as `setValue` sends the new value. `_setData` only triggers the render.
   */
  const dataRef = useRef<FormData>(EMPTY_DATA)
  const [data, _setData] = useState<FormData>(EMPTY_DATA)
  const commit = (patch: Partial<FormData>) => {
    dataRef.current = { ...dataRef.current, ...patch }
    _setData(dataRef.current)
  }

  const [isReading, _setIsReading] = useState(false)
  const [isCreating, _setIsCreating] = useState(false)
  const [isUpdating, _setIsUpdating] = useState(false)
  const [isDeleting, _setIsDeleting] = useState(false)
  const isLoading = isReading || isCreating || isUpdating || isDeleting

  const state: FormState = {
    mode,
    itemId,
    schema,
    createSchema,
    updateSchema,
    fields,
    values: data.values,
    initialValues: data.initialValues,
    dirtyValues: getDirtyValues(data.dirty, data.values),
    touched: data.touched,
    dirty: data.dirty,
    error: data.error,
    fieldErrors: data.fieldErrors,
    meta,
    response: data.response,
    isCreateMode,
    isUpdateMode,
    isLoading,
    isReading,
    isCreating,
    isUpdating,
    isDeleting,
  }
  const stateRef = useRef(state)
  stateRef.current = state

  /** The rendered state with the latest form data, for handlers that run after an `await`. */
  const getState = (): FormState => {
    const current = dataRef.current
    return {
      ...stateRef.current,
      values: current.values,
      initialValues: current.initialValues,
      dirtyValues: getDirtyValues(current.dirty, current.values),
      touched: current.touched,
      dirty: current.dirty,
      error: current.error,
      fieldErrors: current.fieldErrors,
      response: current.response,
    }
  }

  const loadValues = (values: Values | undefined): Partial<FormData> => {
    const merged = mergeWithDefaults(fields, values)
    return { values: merged, initialValues: cloneValues(merged), touched: [], dirty: [] }
  }

  const setError = (error: FormError | null) => {
    if (error) {
      commit({ error, fieldErrors: { ...error.fieldErrors } })
    } else {
      commit({ error: null, fieldErrors: {} })
    }
  }

  const onError = (error: unknown) => {
    // A TypeError is a bug in the consumer's code, not an API error, so it is logged too.
    if (error instanceof TypeError) {
      console.error(error)
    }
    setError(errorAdapter(error, getState()))
  }

  const onResponse = (response: ItemResponse) => {
    let patch: Partial<FormData> = { response }
    if (response.values) {
      patch = { ...patch, ...loadValues(response.values) }
    }
    commit(patch)
  }

  const readItem = () => {
    _setIsReading(true)
    setError(null)
    return read!(getState())
      .then(onResponse)
      .catch(onError)
      .finally(() => {
        _setIsReading(false)
      })
  }

  const createItem = () => {
    _setIsCreating(true)
    setError(null)
    return validateSchema(getState())
      .then(() => create!(getState()))
      .then(onResponse)
      .catch(onError)
      .finally(() => {
        _setIsCreating(false)
      })
  }

  const updateItem = () => {
    _setIsUpdating(true)
    setError(null)
    return validateSchema(getState())
      .then(() => update!(getState()))
      .then(onResponse)
      .catch(onError)
      .finally(() => {
        _setIsUpdating(false)
      })
  }

  const deleteItem = () => {
    _setIsDeleting(true)
    setError(null)
    return remove!(getState())
      .then(onResponse)
      .catch(onError)
      .finally(() => {
        _setIsDeleting(false)
      })
  }

  const setValue = (name: string, value: unknown) => {
    const current = dataRef.current
    commit({
      values: { ...current.values, [name]: value },
      touched: addTouched(current.touched, name),
      dirty: toggleDirty(current.dirty, name, value, current.initialValues),
      fieldErrors: setFieldErrorIn(current.fieldErrors, name, null),
    })
  }

  const setFieldError = (name: string, message: string | null) => {
    commit({ fieldErrors: setFieldErrorIn(dataRef.current.fieldErrors, name, message) })
  }

  const setFieldErrors = (errors: FieldErrors) => {
    commit({ fieldErrors: setFieldErrorsIn(dataRef.current.fieldErrors, errors) })
  }

  const clearErrors = () => {
    commit({ error: null, fieldErrors: {} })
  }

  const resetForm = () => {
    const current = dataRef.current
    let values = getDefaultValues(fields)
    if (isUpdateMode) {
      values = current.initialValues
    }
    commit({ ...loadValues(cloneValues(values)), error: null, fieldErrors: {} })
  }

  const init = () => {
    if (isUpdateMode) {
      readItem()
      return
    }
    commit({ ...EMPTY_DATA, ...loadValues(getDefaultValues(fields)) })
  }

  const refresh = () => {
    init()
  }

  const initRef = useRef(init)
  initRef.current = init

  useEffect(() => {
    initRef.current()
  }, [itemId])

  const context: FormContext = {
    ...state,
    readItem,
    createItem,
    updateItem,
    deleteItem,
    setValue,
    setFieldError,
    setFieldErrors,
    clearErrors,
    resetForm,
    refresh,
  }

  useImperativeHandle(ref, () => {
    return context
  })

  return (
    <FormContextProvider value={context}>
      <Slot
        className="shilp-form"
        scope={{ context }}
        children={children}
        fallback={() => {
          return null
        }}
      />
    </FormContextProvider>
  )
}
