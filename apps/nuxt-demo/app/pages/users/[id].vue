<template>
  <div class="flex flex-col gap-6">
    <UButton to="/" variant="link" color="neutral" icon="i-mdi-arrow-left" label="All users" class="self-start px-0" />

    <ClientOnly>
      <Form
        :item-id="itemId"
        :schema="userSchema"
        :read="(state) => readUser(state.itemId)"
        :create="create"
        :update="(state) => updateUser(state.itemId, state.values)"
        :delete="remove"
        :archive="(state) => setArchived(state.itemId, true)"
        :unarchive="(state) => setArchived(state.itemId, false)"
      >
        <template #default="{ context }">
          <UCard>
            <template #header>
              <div class="flex items-center gap-3">
                <h1 class="text-2xl font-semibold">
                  {{ context.isCreateMode ? 'New user' : 'Edit user' }}
                </h1>
                <UBadge v-if="context.isArchived" color="neutral" variant="subtle">Archived</UBadge>
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
                      <USelect v-bind="model" :items="ROLES" placeholder="Select a role" class="w-full" />
                    </UFormField>
                  </FormField>
                </div>
              </FormFields>

              <FormError v-slot="{ context: { error } }">
                <UAlert color="error" variant="subtle" :title="error?.message" />
              </FormError>

              <div class="flex flex-wrap gap-2">
                <FormCreate v-slot="{ context: scope }">
                  <UButton :loading="scope.isCreating" :disabled="scope.isLoading" label="Create" @click="scope.createItem" />
                </FormCreate>
                <FormUpdate v-slot="{ context: scope }">
                  <UButton :loading="scope.isUpdating" :disabled="scope.isLoading" label="Update" @click="scope.updateItem" />
                </FormUpdate>
                <FormArchive v-slot="{ context: scope }">
                  <UButton color="neutral" variant="outline" :loading="scope.isArchiving" :disabled="scope.isLoading" label="Archive" @click="scope.archiveItem" />
                </FormArchive>
                <FormUnarchive v-slot="{ context: scope }">
                  <UButton color="neutral" variant="outline" :loading="scope.isUnarchiving" :disabled="scope.isLoading" label="Unarchive" @click="scope.unarchiveItem" />
                </FormUnarchive>
                <FormDelete v-slot="{ context: scope }">
                  <UButton color="error" variant="outline" :loading="scope.isDeleting" :disabled="scope.isLoading" label="Delete" @click="scope.deleteItem" />
                </FormDelete>
              </div>

              <pre class="overflow-auto rounded-md bg-elevated p-3 text-xs">{{
                JSON.stringify({ dirtyValues: context.dirtyValues, touched: context.touched }, null, 2)
              }}</pre>
            </div>
          </UCard>
        </template>
      </Form>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import {
  Form,
  FormArchive,
  FormCreate,
  FormDelete,
  FormError,
  FormField,
  FormFields,
  FormUnarchive,
  FormUpdate,
  type FormState,
} from '@shilp.dev/vue-form'
import {
  createUser,
  deleteUser,
  readUser,
  setArchived,
  updateUser,
} from '~/utils/users-api'
import { ROLES, userSchema } from '~/utils/user-schema'

const route = useRoute()
// `+` in the URL is the "new user" id, which the default `resolveMode` treats as create mode.
const itemId = computed(() => {
  return String(route.params.id)
})

async function create(state: FormState) {
  const response = await createUser(state.values)
  await navigateTo(`/users/${response.id}`)
  return response
}

async function remove(state: FormState) {
  const response = await deleteUser(state.itemId)
  await navigateTo('/')
  return response
}
</script>
