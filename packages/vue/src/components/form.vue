<template>
  <div class="shilp-form">
    <slot :context="context" />
  </div>
</template>

<script setup lang="ts">
import type {
  FieldErrors,
  FormContext,
  FormPropsBase,
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
  generateFieldErrors,
  resolveSchema,
  toggleDirty,
} from '@shared/utils'
import { computed, provide, reactive, ref, toRaw, toRefs, watch } from 'vue'

defineOptions({
  // eslint-disable-next-line vue/multi-word-component-names, vue/no-reserved-component-names
  name: 'Form',
})

const props = defineProps<FormPropsBase>()

const values = ref<Values>({})
const initialValues = ref<Values>({})
const touched = ref<string[]>([])
const dirty = ref<string[]>([])
const fieldErrors = ref<FieldErrors>({})
const error = ref<OperationError | null>(null)
const response = ref<OperationResponse | null>(null)
const running = ref<Record<string, boolean>>({})

const isReading = computed(() => {
  return Boolean(running.value.read)
})

const isCreating = computed(() => {
  return Boolean(running.value.create)
})

const isUpdating = computed(() => {
  return Boolean(running.value.update)
})

const isDeleting = computed(() => {
  return Boolean(running.value.delete)
})

const isLoading = computed(() => {
  return Object.values(running.value).some(Boolean)
})

const operations = computed(() => {
  return getOperations(props)
})

const mode = computed(() => {
  return props.modeDetector({ itemId: props.itemId })
})

const isCreateMode = computed(() => {
  return mode.value === 'create'
})

const isUpdateMode = computed(() => {
  return mode.value === 'update'
})

const fields = computed(() => {
  return props.fieldsGenerator({ schema: resolveSchema(mode.value, props) })
})

const dirtyValues = computed(() => {
  return getDirtyValues(dirty.value, values.value)
})

/*
 * The state keys of the context, defined once. The context spreads it, `getState` snapshots it.
 */
const state: FormState = reactive({
  itemId: computed(() => {
    return props.itemId
  }),
  operations,
  fields,

  mode,
  values,
  initialValues,
  dirtyValues,
  touched,
  dirty,
  error,
  fieldErrors,
  response,
  isCreateMode,
  isUpdateMode,
  running,
  isLoading,
  isReading,
  isCreating,
  isUpdating,
  isDeleting,
})

/*
 * A plain snapshot (no methods, no proxies) for the handlers, `schemaValidator` and the
 * callbacks.
 */
const getState = (): FormState => {
  return {
    ...state,
    values: toRaw(state.values),
    initialValues: toRaw(state.initialValues),
    touched: toRaw(state.touched),
    dirty: toRaw(state.dirty),
    fieldErrors: toRaw(state.fieldErrors),
  }
}

function loadValues(newValues: Values | undefined) {
  const merged = mergeWithDefaults(fields.value, newValues)
  values.value = merged
  initialValues.value = structuredClone(merged)
  touched.value = []
  dirty.value = []
}

function setError(newError: OperationError | null) {
  error.value = newError
  if (newError) {
    setFieldErrors(newError.fieldErrors)
  } else {
    setFieldErrors({})
  }
}

function onError({ error: newError, operation }: { error: unknown; operation: OperationConfig }) {
  // A TypeError is a bug in the consumer's code, not an API error, so it is logged too.
  if (newError instanceof TypeError) {
    console.error(newError)
  }
  const operationError = operation.onError?.(newError, getState())
  if (operationError) {
    setError(operationError)
  }
}

function validate(operation: OperationItem) {
  if (operation.schema) {
    return props.schemaValidator(getState(), operation)
  }
  return Promise.resolve()
}

function getOperation(key: string) {
  const matches = operations.value.filter((item) => {
    return item.key === key
  })
  if (matches.length > 1) {
    console.warn(getDuplicateOperationKeyMessage(key))
  }
  return matches[0]
}

function runOperation(key: string) {
  const operation = getOperation(key)
  running.value = { ...running.value, [key]: true }
  setError(null)
  return validate(operation)
    .then(() => operation.handler(getState()))
    .then((newResponse) => {
      response.value = newResponse
      if (newResponse.values) {
        loadValues(newResponse.values)
      }
      operation.onSuccess?.(getState())
    })
    .catch((error) => {
      return onError({ error, operation })
    })
    .finally(() => {
      running.value = { ...running.value, [key]: false }
    })
}

function isRunning(key: string) {
  return Boolean(running.value[key])
}

function setFieldValue(name: string, value: unknown) {
  values.value = { ...values.value, [name]: value }
  touched.value = addTouched(touched.value, name)
  dirty.value = toggleDirty(dirty.value, name, value, initialValues.value)
  setFieldError(name, null)
}

function setFieldError(name: string, message: string | null) {
  fieldErrors.value = generateFieldErrors(fieldErrors.value, { [name]: message })
}

function setFieldErrors(errors: FieldErrors) {
  fieldErrors.value = generateFieldErrors({}, errors)
}

function clearErrors() {
  setError(null)
}

function reset() {
  let source = getDefaultValues(fields.value)
  if (isUpdateMode.value) {
    source = toRaw(initialValues.value)
  }
  loadValues(structuredClone(source))
  setError(null)
}

function init() {
  if (isUpdateMode.value) {
    runOperation('read')
  } else {
    loadValues(getDefaultValues(fields.value))
  }
}

function refresh() {
  response.value = null
  setError(null)
  init()
}

const context: FormContext = reactive({
  ...toRefs(state),
  runOperation,
  isRunning,
  setFieldValue,
  setFieldError,
  setFieldErrors,
  clearErrors,
  reset,
  refresh,
})

provide('shilp-form', context)

watch(() => {
  return props.itemId
}, init)

init()

defineExpose(toRefs(context))
</script>
