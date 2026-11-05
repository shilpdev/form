import type {
  FieldErrors,
  FormContext,
  FormError,
  FormState,
  ItemHandler,
  ItemResponse,
  Values,
} from '@shared'
import { CLASS_PREFIX } from '@shared/constants'
import {
  addTouched,
  cloneValues,
  getDefaultValues,
  getDirtyValues,
  mergeWithDefaults,
  normalizeFields,
  resolveOptions,
  resolveSchema,
  runItemAction,
  setFieldErrorIn,
  setFieldErrorsIn,
  toggleDirty,
} from '@shared/utils'
import { useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { FormContextProvider, useFormOptions } from '../context/form-context'
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
  isArchived: boolean
}

const EMPTY_DATA: FormData = {
  values: {},
  initialValues: {},
  touched: [],
  dirty: [],
  fieldErrors: {},
  error: null,
  response: null,
  isArchived: false,
}

export function Form<Schema = unknown>(props: FormProps<Schema>) {
  const {
    itemId,
    schema,
    createSchema,
    updateSchema,
    read,
    create,
    update,
    delete: remove,
    archive,
    unarchive,
    meta,
    resolveMode,
    schemaToFields,
    validateSchema,
    errorAdapter,
    isArchivedItemCheck,
    ref,
    children,
  } = props

  const globalOptions = useFormOptions<Schema>()
  const options = resolveOptions(globalOptions, {
    resolveMode,
    schemaToFields,
    validateSchema,
    errorAdapter,
    isArchivedItemCheck,
  })

  const mode = options.resolveMode({ itemId })
  const isCreateMode = mode === 'create'
  const isUpdateMode = mode === 'update'
  const targetSchema = resolveSchema(mode, { schema, createSchema, updateSchema })

  // Memoized on the schema so an inline `schemaToFields` does not rebuild the fields every render.
  const fields = useMemo(() => {
    return normalizeFields(options.schemaToFields(targetSchema))
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
  const [isArchiving, _setIsArchiving] = useState(false)
  const [isUnarchiving, _setIsUnarchiving] = useState(false)
  const isLoading =
    isReading || isCreating || isUpdating || isDeleting || isArchiving || isUnarchiving

  const state: FormState<Schema> = {
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
    isArchived: data.isArchived,
    isLoading,
    isReading,
    isCreating,
    isUpdating,
    isDeleting,
    isArchiving,
    isUnarchiving,
  }
  const stateRef = useRef(state)
  stateRef.current = state

  /** The rendered state with the latest form data, for handlers that run after an `await`. */
  const getState = (): FormState<Schema> => {
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
      isArchived: current.isArchived,
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

  const onResponse = (response: ItemResponse) => {
    let patch: Partial<FormData> = {
      response,
      isArchived: isUpdateMode && options.isArchivedItemCheck(response),
    }
    if (response.values) {
      patch = { ...patch, ...loadValues(response.values) }
    }
    commit(patch)
  }

  const run = (
    name: string,
    handler: ItemHandler<Schema> | undefined,
    isValidated: boolean,
    setIsRunning: (isRunning: boolean) => void,
  ) => {
    return runItemAction({
      name,
      handler,
      isValidated,
      options,
      getState,
      setIsRunning,
      setError,
      onResponse,
    })
  }

  const readItem = () => {
    return run('read', read, false, _setIsReading)
  }
  const createItem = () => {
    return run('create', create, true, _setIsCreating)
  }
  const updateItem = () => {
    return run('update', update, true, _setIsUpdating)
  }
  const deleteItem = () => {
    return run('delete', remove, false, _setIsDeleting)
  }
  const archiveItem = () => {
    return run('archive', archive, false, _setIsArchiving)
  }
  const unarchiveItem = () => {
    return run('unarchive', unarchive, false, _setIsUnarchiving)
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

  // 1. Setup: read the item in update mode, load the field defaults in create mode.
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

  // 2. Runs on mount and whenever `itemId` changes, like the Vue `watch`.
  useEffect(() => {
    initRef.current()
  }, [itemId])

  const context: FormContext<Schema> = {
    ...state,
    readItem,
    createItem,
    updateItem,
    deleteItem,
    archiveItem,
    unarchiveItem,
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
        className={CLASS_PREFIX}
        scope={{ context }}
        children={children}
        fallback={() => {
          return null
        }}
      />
    </FormContextProvider>
  )
}
