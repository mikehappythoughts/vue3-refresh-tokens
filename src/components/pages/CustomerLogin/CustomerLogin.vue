<script setup lang="ts">
  import { useRouter } from 'vue-router'
  import { useAuthUserStore } from '@/stores/auth/useAuthUserStore'
  import { FormKitFrameworkContext } from '@formkit/core'
  import { FormKit } from '@formkit/vue'
  import { onMounted, ref } from 'vue'
  import { focusInput } from '@/utils/focusInput'

  const { user, login } = useAuthUserStore()
  const router = useRouter()

  // redirect to home if already logged in with a valid token
  // and not logged out and refreshed the page
  if (user.token) {
    router.push('/')
  }

  const firstInput = ref<FormKitFrameworkContext | null>(null)

  const submitHandler = (fields: Record<string, unknown>) => {
    login(fields)
  }

  onMounted(() => {
    focusInput(firstInput.value?.node.context?.id)
  })
</script>

<template>
  <main>
    <section class="w-full min-h-screen flex items-center justify-center">
      <div class="login">
        <FormKit
          id="form"
          data-test="form"
          type="form"
          submit-label="Login"
          @submit="submitHandler"
          :value="{
            username: '',
            password: ''
          }"
        >
          <h1 data-test="form-title" class="login__title">login</h1>

          <FormKit
            ref="firstInput"
            data-test="username"
            type="text"
            name="username"
            label="Username"
            placeholder="Username"
            validation="required"
          />

          <FormKit
            data-test="password"
            type="password"
            id="password"
            name="password"
            label="Password"
            placeholder="Password"
            validation="required"
          />
        </FormKit>
        <!-- register / sign up -->
        <Router-link data-test="register-now-link" to="/register">Not registered sign up</Router-link>
      </div>
    </section>
  </main>
</template>
