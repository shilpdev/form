import type {
  FieldErrors,
  FormContext,
  FormState,
  OperationResponse,
  OperationConfig,
  OperationError,
  Values,
} from '@shared'
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
  error: OperationError | null
  response: OperationResponse | null
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
    create,
    read,
    update,
    delete: remove,
    modeDetector,
    fieldsGenerator,
    schemaValidator,
    ref,
    children,
  } = props

  const mode = modeDetector({ itemId })
  const isCreateMode = mode === 'create'
  const isUpdateMode = mode === 'update'
  const targetSchema = resolveSchema(mode, { create, update })

  // Memoized on the schema so an inline `fieldsGenerator` does not rebuild the fields every render.
  const fields = useMemo(() => {
    return fieldsGenerator({ schema: targetSchema })
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
    schema: targetSchema,
    fields,
    values: data.values,
    initialValues: data.initialValues,
    dirtyValues: getDirtyValues(data.dirty, data.values),
    touched: data.touched,
    dirty: data.dirty,
    error: data.error,
    fieldErrors: data.fieldErrors,
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

  /** The rendered state with the latest form data and the schema and meta of the operation being run. */
  const getState = (operation: OperationConfig): FormState => {
    const current = dataRef.current
    return {
      ...stateRef.current,
      schema: operation.schema,
      meta: operation.meta,
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

  const setError = (error: OperationError | null) => {
    if (error) {
      commit({ error, fieldErrors: { ...error.fieldErrors } })
    } else {
      commit({ error: null, fieldErrors: {} })
    }
  }

  const onError = (operation: OperationConfig) => {
    return (error: unknown) => {
      // A TypeError is a bug in the consumer's code, not an API error, so it is logged too.
      if (error instanceof TypeError) {
        console.error(error)
      }
      const operationError = operation.onError?.(error, getState(operation))
      if (operationError) {
        setError(operationError)
      }
    }
  }

  const onResponse = (operation: OperationConfig) => {
    return (response: OperationResponse) => {
      let patch: Partial<FormData> = { response }
      if (response.values) {
        patch = { ...patch, ...loadValues(response.values) }
      }
      commit(patch)
      operation.onSuccess?.(response, getState(operation))
    }
  }

  const readItem = () => {
    _setIsReading(true)
    setError(null)
    return read!
      .handler(getState(read!))
      .then(onResponse(read!))
      .catch(onError(read!))
      .finally(() => {
        _setIsReading(false)
      })
  }

  const createItem = () => {
    _setIsCreating(true)
    setError(null)
    return schemaValidator(getState(create!))
      .then(() => create!.handler(getState(create!)))
      .then(onResponse(create!))
      .catch(onError(create!))
      .finally(() => {
        _setIsCreating(false)
      })
  }

  const updateItem = () => {
    _setIsUpdating(true)
    setError(null)
    return schemaValidator(getState(update!))
      .then(() => update!.handler(getState(update!)))
      .then(onResponse(update!))
      .catch(onError(update!))
      .finally(() => {
        _setIsUpdating(false)
      })
  }

  const deleteItem = () => {
    _setIsDeleting(true)
    setError(null)
    return remove!
      .handler(getState(remove!))
      .then(onResponse(remove!))
      .catch(onError(remove!))
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
