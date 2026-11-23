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
        :operations="customOperations"
      >
        <template #default="{ context }">
          <UCard>
            <template #header>
              <div class="flex items-center gap-3">
                <h1 class="text-2xl font-semibold">
                  {{ context.isCreateMode ? 'New user' : 'Edit user' }}
                </h1>
                <span v-if="context.isReading" class="text-sm text-muted">Loading...</span>
                <span v-if="context.response?.isArchived" class="text-sm text-muted">
                  Archived
                </span>
              </div>
            </template>

            <div class="flex flex-col gap-6">
              <FormFields>
                <div class="flex flex-col gap-4">
                  <FormField v-slot="{ label, error, model }" name="name">
                    <UserField :label="label" :error="error">
                      <UInput v-bind="model" class="w-full" />
                    </UserField>
                  </FormField>
                  <FormField v-slot="{ label, error, model }" name="email">
                    <UserField :label="label" :error="error">
                      <UInput v-bind="model" type="email" class="w-full" />
                    </UserField>
                  </FormField>
                  <FormField v-slot="{ label, error, model }" name="role">
                    <UserField :label="label" :error="error">
                      <USelect
                        v-bind="model"
                        :items="ROLES"
                        placeholder="Select a role"
                        class="w-full"
                      />
                    </UserField>
                  </FormField>
                </div>
              </FormFields>

              <FormError v-slot="{ context: { error } }">
                <UAlert color="error" variant="subtle" :title="error?.message" />
              </FormError>

              <div class="flex flex-wrap gap-2">
                <FormCreate v-slot="{ context: scope, run }">
                  <UButton
                    :loading="scope.isCreating"
                    :disabled="scope.isLoading"
                    label="Create"
                    @click="run"
                  />
                </FormCreate>
                <FormUpdate v-slot="{ context: scope, run }">
                  <UButton
                    :loading="scope.isUpdating"
                    :disabled="scope.isLoading"
                    label="Update"
                    @click="run"
                  />
                </FormUpdate>
                <FormDelete v-slot="{ context: scope, run }">
                  <UButton
                    color="error"
                    variant="outline"
                    :loading="scope.isDeleting"
                    :disabled="scope.isLoading"
                    label="Delete"
                    @click="run"
                  />
                </FormDelete>
                <FormOperation
                  v-if="context.isUpdateMode && !context.isReading && !context.response?.isArchived"
                  v-slot="{ context: scope, run }"
                  operation="archive"
                >
                  <UButton
                    color="warning"
                    variant="outline"
                    :loading="scope.isRunning('archive')"
                    :disabled="scope.isLoading"
                    label="Archive"
                    @click="run"
                  />
                </FormOperation>
                <FormOperation
                  v-if="context.isUpdateMode && context.response?.isArchived"
                  v-slot="{ context: scope, run }"
                  operation="restore"
                >
                  <UButton
                    :loading="scope.isRunning('restore')"
                    :disabled="scope.isLoading"
                    label="Restore"
                    @click="run"
                  />
                </FormOperation>
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
  FormOperation,
  FormUpdate,
  type OperationConfig,
  type OperationError,
  type OperationItem,
  type OperationResponse,
} from '@shilp.dev/vue-form'
import { createUser, deleteUser, readUser, setUserArchived, updateUser } from '~/utils/users-api'
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
    const { id, name, email, role, isArchived } = await readUser(state.itemId)
    return { values: { name, email, role }, id, isArchived }
  },
}

const createOperation: OperationConfig = {
  schema: userSchema,
  onError,
  onSuccess: (state) => {
    navigateTo(`/users/${state.response!.id}`)
  },
  handler: async (state): Promise<OperationResponse> => {
    const { id, name, email, role, isArchived } = await createUser(state.values)
    return { values: { name, email, role }, id, isArchived }
  },
}

const updateOperation: OperationConfig = {
  schema: userSchema,
  onError,
  handler: async (state): Promise<OperationResponse> => {
    const { id, name, email, role, isArchived } = await updateUser(state.itemId, state.values)
    return { values: { name, email, role }, id, isArchived }
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

function createArchiveOperation(key: 'archive' | 'restore', isArchived: boolean): OperationItem {
  return {
    key,
    onError,
    onSuccess: () => {
      void navigateTo('/')
    },
    handler: async (state): Promise<OperationResponse> => {
      const user = await setUserArchived(state.itemId, isArchived)
      return {
        id: user.id,
        isArchived: user.isArchived,
        values: { name: user.name, email: user.email, role: user.role },
      }
    },
  }
}

const customOperations = [
  createArchiveOperation('archive', true),
  createArchiveOperation('restore', false),
]
</script>
