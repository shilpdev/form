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
import { getMissingHandlerMessage } from '@shared/messages'
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

/** A plain snapshot (no methods, no proxies) for the handlers, `validateSchema` and `errorAdapter`. */
const getState = (): FormState => {
  return {
    mode: mode.value,
    itemId: props.itemId,
    schema: props.schema,
    createSchema: props.createSchema,
    updateSchema: props.updateSchema,
    fields: fields.value,
    values: toRaw(values.value),
    initialValues: toRaw(initialValues.value),
    dirtyValues: dirtyValues.value,
    touched: toRaw(touched.value),
    dirty: toRaw(dirty.value),
    error: error.value,
    fieldErrors: toRaw(fieldErrors.value),
    meta: props.meta,
    response: response.value,
    isCreateMode: isCreateMode.value,
    isUpdateMode: isUpdateMode.value,
    isLoading: isLoading.value,
    isReading: isReading.value,
    isCreating: isCreating.value,
    isUpdating: isUpdating.value,
    isDeleting: isDeleting.value,
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

function onResponse(newResponse: ItemResponse) {
  response.value = newResponse
  if (newResponse.values) {
    loadValues(newResponse.values)
  }
}

async function readItem() {
  isReading.value = true
  setError(null)
  try {
    if (!props.read) {
      throw new Error(getMissingHandlerMessage('read'))
    }
    const response = await props.read(getState())
    onResponse(response ?? {})
  } catch (error) {
    // A TypeError is a bug in the consumer's code, not an API error, so it is logged too.
    if (error instanceof TypeError) {
      console.error(error)
    }
    setError(props.errorAdapter(error, getState()))
  } finally {
    isReading.value = false
  }
}

async function createItem() {
  isCreating.value = true
  setError(null)
  try {
    if (!props.create) {
      throw new Error(getMissingHandlerMessage('create'))
    }
    await props.validateSchema(getState())
    const response = await props.create(getState())
    onResponse(response ?? {})
  } catch (error) {
    // A TypeError is a bug in the consumer's code, not an API error, so it is logged too.
    if (error instanceof TypeError) {
      console.error(error)
    }
    setError(props.errorAdapter(error, getState()))
  } finally {
    isCreating.value = false
  }
}

async function updateItem() {
  isUpdating.value = true
  setError(null)
  try {
    if (!props.update) {
      throw new Error(getMissingHandlerMessage('update'))
    }
    await props.validateSchema(getState())
    const response = await props.update(getState())
    onResponse(response ?? {})
  } catch (error) {
    // A TypeError is a bug in the consumer's code, not an API error, so it is logged too.
    if (error instanceof TypeError) {
      console.error(error)
    }
    setError(props.errorAdapter(error, getState()))
  } finally {
    isUpdating.value = false
  }
}

async function deleteItem() {
  isDeleting.value = true
  setError(null)
  try {
    if (!props.delete) {
      throw new Error(getMissingHandlerMessage('delete'))
    }
    const response = await props.delete(getState())
    onResponse(response ?? {})
  } catch (error) {
    // A TypeError is a bug in the consumer's code, not an API error, so it is logged too.
    if (error instanceof TypeError) {
      console.error(error)
    }
    setError(props.errorAdapter(error, getState()))
  } finally {
    isDeleting.value = false
  }
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

// 1. Setup: read the item in update mode, load the field defaults in create mode.
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
  mode,
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
  fields,
  values,
  initialValues,
  dirtyValues,
  touched,
  dirty,
  error,
  fieldErrors,
  meta: computed(() => {
    return props.meta
  }),
  response,
  isCreateMode,
  isUpdateMode,
  isLoading,
  isReading,
  isCreating,
  isUpdating,
  isDeleting,
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

// 2. Runs on setup and whenever `itemId` changes.
watch(() => {
  return props.itemId
}, init)
init()

defineExpose(toRefs(context))
</script>
