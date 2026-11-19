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
const isReading = ref(false)
const isCreating = ref(false)
const isUpdating = ref(false)
const isDeleting = ref(false)

const isLoading = computed(() => {
  return isReading.value || isCreating.value || isUpdating.value || isDeleting.value
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

/** The state keys of the context, defined once. The context spreads it, `getState` snapshots it. */
const state: FormState = reactive({
  itemId: computed(() => {
    return props.itemId
  }),
  schema: computed(() => {
    return resolveSchema(mode.value, props)
  }),
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
  isLoading,
  isReading,
  isCreating,
  isUpdating,
  isDeleting,
})

/*
 * A plain snapshot (no methods, no proxies) for the handlers and `schemaValidator`,
 * with the schema and meta of the operation being run.
 */
const getState = (operation: OperationConfig): FormState => {
  return {
    ...state,
    schema: operation.schema,
    meta: operation.meta,
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
  initialValues.value = cloneValues(merged)
  touched.value = []
  dirty.value = []
}

function setError(newError: OperationError | null) {
  error.value = newError
  if (newError) {
    fieldErrors.value = { ...newError.fieldErrors }
  } else {
    fieldErrors.value = {}
  }
}

function onError(operation: OperationConfig) {
  return (newError: unknown) => {
    // A TypeError is a bug in the consumer's code, not an API error, so it is logged too.
    if (newError instanceof TypeError) {
      console.error(newError)
    }
    const operationError = operation.onError?.(newError, getState(operation))
    if (operationError) {
      setError(operationError)
    }
  }
}

function onResponse(operation: OperationConfig) {
  return (newResponse: OperationResponse) => {
    response.value = newResponse
    if (newResponse.values) {
      loadValues(newResponse.values)
    }
    operation.onSuccess?.(newResponse, getState(operation))
  }
}

function readItem() {
  isReading.value = true
  setError(null)
  return props
    .read!.handler(getState(props.read!))
    .then(onResponse(props.read!))
    .catch(onError(props.read!))
    .finally(() => {
      isReading.value = false
    })
}

function createItem() {
  isCreating.value = true
  setError(null)
  return props
    .schemaValidator(getState(props.create!))
    .then(() => props.create!.handler(getState(props.create!)))
    .then(onResponse(props.create!))
    .catch(onError(props.create!))
    .finally(() => {
      isCreating.value = false
    })
}

function updateItem() {
  isUpdating.value = true
  setError(null)
  return props
    .schemaValidator(getState(props.update!))
    .then(() => props.update!.handler(getState(props.update!)))
    .then(onResponse(props.update!))
    .catch(onError(props.update!))
    .finally(() => {
      isUpdating.value = false
    })
}

function deleteItem() {
  isDeleting.value = true
  setError(null)
  return props
    .delete!.handler(getState(props.delete!))
    .then(onResponse(props.delete!))
    .catch(onError(props.delete!))
    .finally(() => {
      isDeleting.value = false
    })
}

function setValue(name: string, value: unknown) {
  values.value = { ...values.value, [name]: value }
  touched.value = addTouched(touched.value, name)
  dirty.value = toggleDirty(dirty.value, name, value, initialValues.value)
  fieldErrors.value = setFieldErrorIn(fieldErrors.value, name, null)
}

function setFieldError(name: string, message: string | null) {
  fieldErrors.value = setFieldErrorIn(fieldErrors.value, name, message)
}

function setFieldErrors(errors: FieldErrors) {
  fieldErrors.value = setFieldErrorsIn(fieldErrors.value, errors)
}

function clearErrors() {
  setError(null)
}

function resetForm() {
  let source = getDefaultValues(fields.value)
  if (isUpdateMode.value) {
    source = toRaw(initialValues.value)
  }
  loadValues(cloneValues(source))
  setError(null)
}

function init() {
  if (isUpdateMode.value) {
    readItem()
    return
  }
  response.value = null
  setError(null)
  loadValues(getDefaultValues(fields.value))
}

function refresh() {
  init()
}

const context: FormContext = reactive({
  ...toRefs(state),
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
})

provide('shilp-form-context', context)

watch(() => {
  return props.itemId
}, init)
init()

defineExpose(toRefs(context))
</script>
