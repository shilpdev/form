import type {
  FieldErrors,
  FormContext,
  FormState,
  OperationResponse,
  OperationConfig,
  OperationError,
  OperationItem,
  Values,
} from '@shared'
import { getDuplicateOperationKeyMessage } from '@shared/constants/messages'
import {
  addTouched,
  getDefaultValues,
  getDirtyValues,
  getOperations,
  mergeWithDefaults,
  resolveSchema,
  generateFieldErrors,
  toggleDirty,
} from '@shared/utils'
import { useEffect, useImperativeHandle, useRef, useState } from 'react'
import { FormContextProvider } from '../context/form-context'
import type { FormProps } from '../types'
import { Slot } from './slot'

/*
 * Everything the user edits plus what the last response set. Changed together, so kept together.
 */
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

/** The `FormState` keys that come from which operations are running: `running` and its flags. */
const getRunningState = (running: Record<string, boolean>) => {
  return {
    running,
    isLoading: Object.values(running).some(Boolean),
    isReading: Boolean(running.read),
    isCreating: Boolean(running.create),
    isUpdating: Boolean(running.update),
    isDeleting: Boolean(running.delete),
  }
}

export function Form(props: FormProps) {
  const {
    itemId,
    create,
    read,
    update,
    delete: remove,
    operations: customOperations,
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
  const operations = getOperations({
    create,
    read,
    update,
    delete: remove,
    operations: customOperations,
  })

  const fields = fieldsGenerator({ schema: targetSchema })

  /*
   * `dataRef` is the source of truth and is updated synchronously, so an action called in the same
   * event as `setFieldValue` sends the new value. `_setData` only triggers the render.
   */
  const dataRef = useRef<FormData>(EMPTY_DATA)
  const [data, _setData] = useState<FormData>(EMPTY_DATA)
  const commit = (patch: Partial<FormData>) => {
    dataRef.current = { ...dataRef.current, ...patch }
    _setData(dataRef.current)
  }

  /*
   * Same pattern as `dataRef`: `runningRef` is updated synchronously, so `getState` and `isRunning`
   * see an operation as running from the moment `runOperation` is called. `_setRunning` only
   * triggers the render.
   */
  const runningRef = useRef<Record<string, boolean>>({})
  const [running, _setRunning] = useState<Record<string, boolean>>({})
  const setRunning = (key: string, isKeyRunning: boolean) => {
    runningRef.current = { ...runningRef.current, [key]: isKeyRunning }
    _setRunning(runningRef.current)
  }

  const state: FormState = {
    mode,
    itemId,
    operations,
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
    ...getRunningState(running),
  }
  const stateRef = useRef(state)
  stateRef.current = state

  /** The rendered state with the latest form data and flags, for callbacks that run before a render. */
  const getState = (): FormState => {
    const current = dataRef.current
    return {
      ...stateRef.current,
      ...getRunningState(runningRef.current),
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
    return { values: merged, initialValues: structuredClone(merged), touched: [], dirty: [] }
  }

  const setError = (error: OperationError | null) => {
    commit({ error })
    if (error) {
      setFieldErrors(error.fieldErrors)
    } else {
      setFieldErrors({})
    }
  }

  const onError = ({ error, operation }: { error: unknown; operation: OperationConfig }) => {
    // A TypeError is a bug in the consumer's code, not an API error, so it is logged too.
    if (error instanceof TypeError) {
      console.error(error)
    }
    const operationError = operation.onError?.(error, getState())
    if (operationError) {
      setError(operationError)
    }
  }

  const validate = (operation: OperationItem) => {
    if (operation.schema) {
      return schemaValidator(getState(), operation)
    }
    return Promise.resolve()
  }

  const getOperation = (key: string) => {
    const matches = operations.filter((item) => {
      return item.key === key
    })
    if (matches.length > 1) {
      console.warn(getDuplicateOperationKeyMessage(key))
    }
    return matches[0]
  }

  const runOperation = (key: string) => {
    const operation = getOperation(key)
    setRunning(key, true)
    setError(null)
    return validate(operation)
      .then(() => operation.handler(getState()))
      .then((response) => {
        let patch: Partial<FormData> = { response }
        if (response.values) {
          patch = { ...patch, ...loadValues(response.values) }
        }
        commit(patch)
        operation.onSuccess?.(getState())
      })
      .catch((error) => {
        return onError({ error, operation })
      })
      .finally(() => {
        setRunning(key, false)
      })
  }

  const isRunning = (key: string) => {
    return Boolean(runningRef.current[key])
  }

  const setFieldValue = (name: string, value: unknown) => {
    const current = dataRef.current
    commit({
      values: { ...current.values, [name]: value },
      touched: addTouched(current.touched, name),
      dirty: toggleDirty(current.dirty, name, value, current.initialValues),
    })
    setFieldError(name, null)
  }

  const setFieldError = (name: string, message: string | null) => {
    commit({ fieldErrors: generateFieldErrors(dataRef.current.fieldErrors, { [name]: message }) })
  }

  const setFieldErrors = (errors: FieldErrors) => {
    commit({ fieldErrors: generateFieldErrors({}, errors) })
  }

  const clearErrors = () => {
    commit({ error: null, fieldErrors: generateFieldErrors() })
  }

  const reset = () => {
    const current = dataRef.current
    let values = getDefaultValues(fields)
    if (isUpdateMode) {
      values = current.initialValues
    }
    commit({
      ...loadValues(structuredClone(values)),
      error: null,
      fieldErrors: generateFieldErrors(),
    })
  }

  const init = () => {
    if (isUpdateMode) {
      runOperation('read')
    } else {
      commit(loadValues(getDefaultValues(fields)))
    }
  }

  const refresh = () => {
    commit({ response: null })
    setError(null)
    init()
  }

  const initRef = useRef(init)
  initRef.current = init

  useEffect(() => {
    initRef.current()
  }, [itemId])

  const context: FormContext = {
    ...state,
    runOperation,
    isRunning,
    setFieldValue,
    setFieldError,
    setFieldErrors,
    clearErrors,
    reset,
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
