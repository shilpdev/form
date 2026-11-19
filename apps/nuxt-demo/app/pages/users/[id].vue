<template>
  <div class="flex flex-col gap-6">
    <UButton
      to="/"
      variant="link"
      color="neutral"
      icon="i-mdi-arrow-left"
      label="All users"
      class="self-start px-0"
    />

    <ClientOnly>
      <AppForm
        :item-id="itemId"
        :read="readOperation"
        :create="createOperation"
        :update="updateOperation"
        :delete="deleteOperation"
      >
        <template #default="{ context }">
          <UCard>
            <template #header>
              <div class="flex items-center gap-3">
                <h1 class="text-2xl font-semibold">
                  {{ context.isCreateMode ? 'New user' : 'Edit user' }}
                </h1>
                <span v-if="context.isReading" class="text-sm text-muted">Loading...</span>
              </div>
            </template>

            <div class="flex flex-col gap-6">
              <FormFields>
                <div class="flex flex-col gap-4">
                  <FormField v-slot="{ label, error, model }" name="name">
                    <UFormField :label="label" :error="error ?? false">
                      <UInput v-bind="model" class="w-full" />
                    </UFormField>
                  </FormField>
                  <FormField v-slot="{ label, error, model }" name="email">
                    <UFormField :label="label" :error="error ?? false">
                      <UInput v-bind="model" type="email" class="w-full" />
                    </UFormField>
                  </FormField>
                  <FormField v-slot="{ label, error, model }" name="role">
                    <UFormField :label="label" :error="error ?? false">
                      <USelect
                        v-bind="model"
                        :items="ROLES"
                        placeholder="Select a role"
                        class="w-full"
                      />
                    </UFormField>
                  </FormField>
                </div>
              </FormFields>

              <FormError v-slot="{ context: { error } }">
                <UAlert color="error" variant="subtle" :title="error?.message" />
              </FormError>

              <div class="flex flex-wrap gap-2">
                <FormCreate v-slot="{ context: scope }">
                  <UButton
                    :loading="scope.isCreating"
                    :disabled="scope.isLoading"
                    label="Create"
                    @click="scope.createItem"
                  />
                </FormCreate>
                <FormUpdate v-slot="{ context: scope }">
                  <UButton
                    :loading="scope.isUpdating"
                    :disabled="scope.isLoading"
                    label="Update"
                    @click="scope.updateItem"
                  />
                </FormUpdate>
                <FormDelete v-slot="{ context: scope }">
                  <UButton
                    color="error"
                    variant="outline"
                    :loading="scope.isDeleting"
                    :disabled="scope.isLoading"
                    label="Delete"
                    @click="scope.deleteItem"
                  />
                </FormDelete>
              </div>

              <pre class="overflow-auto rounded-md bg-elevated p-3 text-xs">{{
                JSON.stringify(
                  { dirtyValues: context.dirtyValues, touched: context.touched },
                  null,
                  2,
                )
              }}</pre>
            </div>
          </UCard>
        </template>
      </AppForm>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import {
  FormCreate,
  FormDelete,
  FormError,
  FormField,
  FormFields,
  FormUpdate,
  type OperationConfig,
  type OperationError,
  type OperationResponse,
} from '@shilp.dev/vue-form'
import { createUser, deleteUser, readUser, updateUser } from '~/utils/users-api'
import { ROLES, userSchema } from '~/utils/user-schema'

const route = useRoute()
// `+` in the URL is the "new user" id, which `modeDetector` in `AppForm` treats as create mode.
const itemId = computed(() => {
  return String(route.params.id)
})

function onError(error: unknown): OperationError {
  const { name, message, errors } = error as {
    name?: string
    message?: string
    errors?: Record<string, string>
  }
  return {
    name: name ?? 'Error',
    message: message ?? 'Something went wrong. Please try again.',
    fieldErrors: errors ?? {},
  }
}

const readOperation: OperationConfig = {
  onError,
  handler: async (state): Promise<OperationResponse> => {
    const { id, name, email, role } = await readUser(state.itemId)
    return { values: { name, email, role }, id }
  },
}

const createOperation: OperationConfig = {
  schema: userSchema,
  onError,
  handler: async (state): Promise<OperationResponse> => {
    const { id, name, email, role } = await createUser(state.values)
    await navigateTo(`/users/${id}`)
    return { values: { name, email, role }, id }
  },
}

const updateOperation: OperationConfig = {
  schema: userSchema,
  onError,
  handler: async (state): Promise<OperationResponse> => {
    const { id, name, email, role } = await updateUser(state.itemId, state.values)
    return { values: { name, email, role }, id }
  },
}

const deleteOperation: OperationConfig = {
  onError,
  handler: async (state): Promise<OperationResponse> => {
    await deleteUser(state.itemId)
    await navigateTo('/')
    return {}
  },
}
</script>
