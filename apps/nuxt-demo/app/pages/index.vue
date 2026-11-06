<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Users</h1>
      <UButton to="/users/+" label="New user" icon="i-mdi-plus" />
    </div>

    <p v-if="!users" class="text-muted">Loading...</p>
    <UCard v-else :ui="{ body: 'p-0 sm:p-0' }">
      <ul class="divide-y divide-default">
        <li v-for="user in users" :key="user.id">
          <NuxtLink :to="`/users/${user.id}`" class="flex items-center gap-3 px-4 py-3">
            <span class="font-medium">{{ user.name }}</span>
            <span class="text-sm text-muted">{{ user.email }}</span>
          </NuxtLink>
        </li>
      </ul>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { listUsers, type User } from '~/utils/users-api'

const users = ref<User[] | null>(null)

onMounted(async () => {
  users.value = await listUsers()
})
</script>
