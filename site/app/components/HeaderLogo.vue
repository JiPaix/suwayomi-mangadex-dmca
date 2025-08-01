<template>
  <!-- Header / Logo -->
        <div class="flex flex-col sm:flex-row items-center gap-6 bg-gray-200 dark:bg-gray-700 p-5 rounded-sm">
          <NuxtImg class="w-20 h-20 sm:w-28 sm:h-28" src="/faviconlogo.png" alt="Logo" />
          <div class="text-center sm:text-left">
            <h1 class="text-2xl sm:text-3xl font-mono uppercase text-foreground">{{ title }}</h1>
            <p class="text-muted-foreground mt-2">{{ description }}</p>
          </div>
        </div>
</template>

<script lang="ts" setup>
defineProps<{
  title: string,
  description: string,
}>()
</script>