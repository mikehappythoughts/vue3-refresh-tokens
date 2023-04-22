<script setup lang="ts">
  // Router
  import { useAuthUserStore } from '@/stores/auth/useAuthUserStore'

  const { logout } = useAuthUserStore()

  // logout all window instances
  const syncLogout = (event: StorageEvent) => {
    if (event.key === 'logout') {
      window.removeEventListener('storage', syncLogout)
      logout()
    }
  }

  window.addEventListener('storage', syncLogout)
</script>
<template>
  <RouterView />
</template>
