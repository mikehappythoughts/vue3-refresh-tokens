<script setup lang="ts">
  import { useAuthUserStore } from '@/stores/auth/useAuthUserStore.js'

  const { user, logout, getEmployees } = useAuthUserStore()
</script>
<template>
  <header class="">
    <h3><strong>Dasboard</strong> {{ user.username }}</h3>
    <button class="btn mr-4" @click="logout">logout</button>
    <button class="btn" @click="getEmployees">get employees</button>
  </header>
  <main>
    <section></section>
  </main>
</template>
