<template>
  <div :class="CLASS_PREFIX">
    <slot :context="context" />
  </div>
</template>

<script setup lang="ts">
import type {
  FieldErrors,
  FormContext,
  FormError,
  FormOptions,
  FormPropsBase,
  FormState,
  ItemHandler,
  ItemResponse,
  Values,
} from '@shared'
import { CLASS_PREFIX, CONTEXT_KEY, OPTIONS_KEY } from '@shared/constants'
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
import { computed, inject, provide, reactive, ref, toRaw, toRefs, watch } from 'vue'

defineOptions({
  // `Form` (PascalCase) resolves to this component in SFC templates; lowercase `<form>` stays native.
  // eslint-disable-next-line vue/multi-word-component-names, vue/no-reserved-component-names
  name: 'Form',
})

const props = defineProps<FormPropsBase>()

const globalOptions = inject<Partial<FormOptions> | null>(OPTIONS_KEY, null)
const options = computed(() => {
  return resolveOptions(globalOptions, {
    resolveMode: props.resolveMode,
    schemaToFields: props.schemaToFields,
    validateSchema: props.validateSchema,
    errorAdapter: props.errorAdapter,
    isArchivedItemCheck: props.isArchivedItemCheck,
  })
})

const values = ref<Values>({})
const initialValues = ref<Values>({})
const touched = ref<string[]>([])
const dirty = ref<string[]>([])
const fieldErrors = ref<FieldErrors>({})
const error = ref<FormError | null>(null)
const response = ref<ItemResponse | null>(null)
const isArchived = ref(false)
const isReading = ref(false)
const isCreating = ref(false)
const isUpdating = ref(false)
const isDeleting = ref(false)
const isArchiving = ref(false)
const isUnarchiving = ref(false)

const isLoading = computed(() => {
  return (
    isReading.value ||
    isCreating.value ||
    isUpdating.value ||
    isDeleting.value ||
    isArchiving.value ||
    isUnarchiving.value
  )
})

const mode = computed(() => {
  return options.value.resolveMode({ itemId: props.itemId })
})

const isCreateMode = computed(() => {
  return mode.value === 'create'
})

const isUpdateMode = computed(() => {
  return mode.value === 'update'
})

const fields = computed(() => {
  const targetSchema = resolveSchema(mode.value, props)
  return normalizeFields(options.value.schemaToFields(targetSchema))
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
    isArchived: isArchived.value,
    isLoading: isLoading.value,
    isReading: isReading.value,
    isCreating: isCreating.value,
    isUpdating: isUpdating.value,
    isDeleting: isDeleting.value,
    isArchiving: isArchiving.value,
    isUnarchiving: isUnarchiving.value,
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
  isArchived.value = isUpdateMode.value && options.value.isArchivedItemCheck(newResponse)
  if (newResponse.values) {
    loadValues(newResponse.values)
  }
}

function run(
  name: string,
  handler: ItemHandler | undefined,
  isValidated: boolean,
  flag: { value: boolean },
) {
  return runItemAction({
    name,
    handler,
    isValidated,
    options: options.value,
    getState,
    setIsRunning: (isRunning) => {
      flag.value = isRunning
    },
    setError,
    onResponse,
  })
}

function readItem() {
  return run('read', props.read, false, isReading)
}

function createItem() {
  return run('create', props.create, true, isCreating)
}

function updateItem() {
  return run('update', props.update, true, isUpdating)
}

function deleteItem() {
  return run('delete', props.delete, false, isDeleting)
}

function archiveItem() {
  return run('archive', props.archive, false, isArchiving)
}

function unarchiveItem() {
  return run('unarchive', props.unarchive, false, isUnarchiving)
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
  isArchived.value = false
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
  isArchived,
  isLoading,
  isReading,
  isCreating,
  isUpdating,
  isDeleting,
  isArchiving,
  isUnarchiving,
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
})

provide(CONTEXT_KEY, context)

// 2. Runs on setup and whenever `itemId` changes.
watch(() => {
  return props.itemId
}, init)
init()

defineExpose(toRefs(context))
</script>
