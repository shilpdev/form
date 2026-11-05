<script setup lang="ts">
/*
 * Layout shared by every page: header (navigation + links) and page content.
 * Only Nuxt UI components are used. UApp is required by Nuxt UI for overlays and tooltips.
 */
const navItems = [{ label: 'Users', to: '/' }]
</script>

<template>
  <UApp>
    <UHeader title="Shilp Form - Vue Demo">
      <UNavigationMenu :items="navItems" />

      <template #right>
        <UColorModeButton />
        <UButton
          to="https://github.com/shilpdev/form"
          target="_blank"
          icon="i-mdi-github"
          color="neutral"
          variant="ghost"
          label="GitHub"
        />
        <UButton
          to="https://www.npmjs.com/package/@shilp.dev/vue-form"
          target="_blank"
          icon="i-mdi-npm"
          color="neutral"
          variant="ghost"
          aria-label="npm"
        />
      </template>
    </UHeader>

    <UMain>
      <UContainer class="max-w-3xl py-8">
        <NuxtPage />
      </UContainer>
    </UMain>
  </UApp>
</template>
