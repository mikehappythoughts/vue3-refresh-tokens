import { createApp } from 'vue'
import App from './App.vue'
import '@formkit/themes/genesis'
import { generateClasses } from '@formkit/themes'
import { plugin, defaultConfig } from '@formkit/vue'
import './index.css'
import router from './router'
import { createPinia } from 'pinia'
import { setUpRefreshTokenInterceptor } from '@/services/refreshInterceptors'
import { useAuthUserStore } from './stores/auth/useAuthUserStore'

const formInputConfig = {
  outer: 'mb-5',
  label: 'block mb-1 font-bold text-base text-left',
  inner: 'max-w-md border border-gray-400 rounded-lg mb-1 overflow-hidden focus-within:border-blue-500',
  input: 'w-full h-10 px-3 border-none text-base text-gray-700 placeholder-gray-400',
  help: 'text-xs text-gray-500 sr-only',
  messages: 'list-none p-0 mt-1 mb-0',
  message: 'text-red-500 mb-1 text-xs'
}

startApp()

// async start function to enable waiting for refresh token call
async function startApp(): Promise<void> {
  // call the interceptors
  setUpRefreshTokenInterceptor()

  const app = createApp(App)
    .use(createPinia())
    .use(router)
    .use(
      plugin,
      defaultConfig({
        config: {
          classes: generateClasses({
            text: formInputConfig,
            password: formInputConfig
          })
        }
      })
    )

  // attempt to auto refresh token before startup
  // in case user refreshed page without logging out
  try {
    const authStore = useAuthUserStore()
    await authStore.refreshToken()
  } catch (err: unknown) {
    // catch error to start app on success or failure
    console.log(err)
  }

  app.mount('#app')
}
