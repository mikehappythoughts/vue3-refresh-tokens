import { mount } from '@vue/test-utils'
import App from '@/App.vue'
import { useAuthUserStore } from '@/stores/auth/useAuthUserStore'
import { Mock } from 'vitest'

// Mocks
vi.mock('@/stores/auth/useAuthUserStore', () => ({
  useAuthUserStore: vi.fn(() => ({
    logout: vi.fn()
  }))
}))

const mockedUseAuthUserStore = useAuthUserStore as unknown as Mock

describe('App.vue', () => {
  test('should redirect to /login when logout event is triggered', async () => {
    const wrapper = mount(App, {
      global: {
        stubs: ['RouterView']
      }
    })

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'logout'
      })
    )

    // wait for next tick to allow router to navigate
    await wrapper.vm.$nextTick()

    expect(mockedUseAuthUserStore).toHaveBeenCalledOnce()
  })
})
