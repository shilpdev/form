<template>
  <div class="shilp-form">
    <slot :context="context" />
  </div>
</template>

<script setup lang="ts">
import type {
  FieldErrors,
  FormContext,
  FormError,
  FormPropsBase,
  FormState,
  ItemResponse,
  Values,
} from '@shared'
import {
  defaultErrorAdapter,
  defaultResolveMode,
  defaultSchemaToFields,
  defaultValidateSchema,
} from '@shared/options'
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

const props = withDefaults(defineProps<FormPropsBase>(), {
  resolveMode: defaultResolveMode,
  schemaToFields: defaultSchemaToFields,
  validateSchema: defaultValidateSchema,
  errorAdapter: defaultErrorAdapter,
})

const values = ref<Values>({})
const initialValues = ref<Values>({})
const touched = ref<string[]>([])
const dirty = ref<string[]>([])
const fieldErrors = ref<FieldErrors>({})
const error = ref<FormError | null>(null)
const response = ref<ItemResponse | null>(null)
const isReading = ref(false)
const isCreating = ref(false)
const isUpdating = ref(false)
const isDeleting = ref(false)

const isLoading = computed(() => {
  return isReading.value || isCreating.value || isUpdating.value || isDeleting.value
})

const mode = computed(() => {
  return props.resolveMode({ itemId: props.itemId })
})

const isCreateMode = computed(() => {
  return mode.value === 'create'
})

const isUpdateMode = computed(() => {
  return mode.value === 'update'
})

const fields = computed(() => {
  const targetSchema = resolveSchema(mode.value, props)
  return props.schemaToFields(targetSchema)
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
    return props.schema
  }),
  createSchema: computed(() => {
    return props.createSchema
  }),
  updateSchema: computed(() => {
    return props.updateSchema
  }),
  meta: computed(() => {
    return props.meta
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

/** A plain snapshot (no methods, no proxies) for the handlers, `validateSchema` and `errorAdapter`. */
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
  initialValues.value = cloneValues(merged)
  touched.value = []
  dirty.value = []
}

function setError(newError: FormError | null) {
  error.value = newError
  if (newError) {
    fieldErrors.value = { ...newError.fieldErrors }
  } else {
    fieldErrors.value = {}
  }
}

function onError(newError: unknown) {
  // A TypeError is a bug in the consumer's code, not an API error, so it is logged too.
  if (newError instanceof TypeError) {
    console.error(newError)
  }
  setError(props.errorAdapter(newError, getState()))
}

function onResponse(newResponse: ItemResponse) {
  response.value = newResponse
  if (newResponse.values) {
    loadValues(newResponse.values)
  }
}

function readItem() {
  isReading.value = true
  setError(null)
  return props.read!(getState())
    .then(onResponse)
    .catch(onError)
    .finally(() => {
      isReading.value = false
    })
}

function createItem() {
  isCreating.value = true
  setError(null)
  return props
    .validateSchema(getState())
    .then(() => props.create!(getState()))
    .then(onResponse)
    .catch(onError)
    .finally(() => {
      isCreating.value = false
    })
}

function updateItem() {
  isUpdating.value = true
  setError(null)
  return props
    .validateSchema(getState())
    .then(() => props.update!(getState()))
    .then(onResponse)
    .catch(onError)
    .finally(() => {
      isUpdating.value = false
    })
}

function deleteItem() {
  isDeleting.value = true
  setError(null)
  return props.delete!(getState())
    .then(onResponse)
    .catch(onError)
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
