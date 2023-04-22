import { mount, VueWrapper } from '@vue/test-utils'
import { createMemoryHistory, createRouter, Router } from 'vue-router'
import { routes } from '@/router/index'

// Component
import App from '@/App.vue'

// Constant
import { PAGES } from '@/constant/router.names'

// Store
import { useAuthUserStore } from '@/stores/auth/useAuthUserStore'
import { defaultConfig, plugin } from '@formkit/vue'
import { Mock } from 'vitest'

// Mocks
vi.mock('@/stores/auth/useAuthUserStore', () => ({
  useAuthUserStore: vi.fn(() => ({
    user: vi.fn(),
    logout: vi.fn(),
    updateAccessToken: vi.fn()
  }))
}))

const mockedUseAuthUserStore = useAuthUserStore as unknown as Mock

let router: Router

const createWrapper = (isAuth = false): VueWrapper => {
  const wrapper = mount(App, {
    global: {
      plugins: [router, [plugin, defaultConfig]],
      mocks: {
        $store: {
          getters: {
            isAuth
          }
        }
      }
    }
  })

  return wrapper
}

describe('Dashboard.vue', () => {
  beforeEach(() => {
    router = createRouter({
      history: createMemoryHistory(),
      routes
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Protected pages', () => {
    it('renders the dashboard when authenticated', async () => {
      // Mock the authentication state
      mockedUseAuthUserStore.mockImplementationOnce(() => ({
        user: { isUserLoggedIn: true, token: 'someToken' }
      }))

      router.push('/')
      await router.isReady()

      createWrapper(true)

      expect(router.currentRoute.value.name).toBe(PAGES.DASHBOARD)
    })

    it('redirects to login page when not authenticated', async () => {
      router.push('/')
      await router.isReady()

      createWrapper()

      expect(router.currentRoute.value.name).toBe(PAGES.CUSTOMERLOGIN)
    })
  })

  describe('Non Protected pages', () => {
    it('should be able to navigate to login page without authentication', async () => {
      router.push('/login')
      await router.isReady()

      createWrapper()

      expect(router.currentRoute.value.name).toBe(PAGES.CUSTOMERLOGIN)
    })

    it('should be able to navigate to register page without authentication', async () => {
      router.push('/register')
      await router.isReady()

      createWrapper()

      expect(router.currentRoute.value.name).toBe(PAGES.CUSTOMERREGISTER)
    })
  })
})
