<script setup lang="ts">
  import { useAuthUserStore } from '@/stores/auth/useAuthUserStore'
  import { focusInput } from '@/utils/focusInput'
  import { FormKitFrameworkContext } from '@formkit/core'
  import { FormKit } from '@formkit/vue'
  import { onMounted, ref } from 'vue'

  const firstInput = ref<FormKitFrameworkContext | null>(null)

  const { register } = useAuthUserStore()

  const submitHandler = (fields: Record<string, unknown>) => {
    register(fields)
  }

  onMounted(() => {
    focusInput(firstInput.value?.node.context?.id)
  })
</script>

<template>
  <main>
    <section class="w-full min-h-screen flex items-center justify-center">
      <div class="register">
        <FormKit id="form" data-test="form" type="form" submit-label="Login" @submit="submitHandler">
          <h1 data-test="form-title" class="register__title">register</h1>

          <FormKit
            ref="firstInput"
            data-test="username"
            type="text"
            name="username"
            label="Username"
            placeholder="Username"
            validation="required|alphanumeric|length:3,24"
          />

          <FormKit
            data-test="password"
            type="password"
            id="password"
            name="password"
            label="Password"
            placeholder="Password"
            validation="required|length:8,24|matches:/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).+$/"
            :validation-messages="{
              matches:
                'Please include at least one symbol, one capital letter, one number and at least eight characters'
            }"
          />
          <FormKit
            data-test="password_confirm"
            type="password"
            name="password_confirm"
            label="Confirm password"
            placeholder="Confirm password"
            validation="required|confirm"
          />
        </FormKit>
      </div>
    </section>
  </main>
</template>
