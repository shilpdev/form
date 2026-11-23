<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Users</h1>
      <div class="flex items-center gap-2">
        <UButton
          v-if="hasArchivedUsers"
          color="neutral"
          variant="ghost"
          :label="showArchived ? 'Hide archived' : 'Show archived'"
          @click="showArchived = !showArchived"
        />
        <UButton to="/users/+" label="New user" icon="i-mdi-plus" />
      </div>
    </div>

    <p v-if="!visibleUsers" class="text-muted">Loading...</p>
    <UCard v-else :ui="{ body: 'p-0 sm:p-0' }">
      <ul class="divide-y divide-default">
        <li v-for="user in visibleUsers" :key="user.id">
          <NuxtLink :to="`/users/${user.id}`" class="flex items-center gap-3 px-4 py-3">
            <span class="font-medium">{{ user.name }}</span>
            <span class="text-sm text-muted">{{ user.email }}</span>
            <UBadge v-if="user.isArchived" label="Archived" color="neutral" variant="subtle" />
          </NuxtLink>
        </li>
      </ul>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { listUsers, type User } from '~/utils/users-api'

const users = ref<User[] | null>(null)
const showArchived = ref(false)

const hasArchivedUsers = computed(() => {
  if (!users.value) {
    return false
  }
  return users.value.some((user) => {
    return user.isArchived
  })
})

const visibleUsers = computed(() => {
  if (!users.value) {
    return null
  }
  return users.value.filter((user) => {
    if (showArchived.value) {
      return true
    }
    return !user.isArchived
  })
})

onMounted(async () => {
  users.value = await listUsers()
})
</script>
