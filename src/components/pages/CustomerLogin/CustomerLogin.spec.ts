import { DOMWrapper, flushPromises, mount, VueWrapper } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import CustomerLogin from '@/components/pages/CustomerLogin/CustomerLogin.vue'
import { plugin, defaultConfig } from '@formkit/vue'
import { focusInput } from '@/utils/focusInput'
import { useRouter } from 'vue-router'
import { useAuthUserStore } from '@/stores/auth/useAuthUserStore'
import { Mock } from 'vitest'

// Mocks
vi.mock('vue-router')

vi.mock('@/utils/focusInput')

const mockedUseRouter = useRouter as Mock

// Factory
const createWrapper = (state = {}): VueWrapper => {
  const wrapper = mount(CustomerLogin, {
    global: {
      stubs: ['RouterLink'],
      plugins: [
        createTestingPinia({
          createSpy: vi.fn,
          initialState: state
        }),
        [plugin, defaultConfig]
      ]
    }
  })

  return wrapper
}

describe('CustomerLogin', () => {
  let wrapper: VueWrapper
  ;(mockedUseRouter as Mock).mockReturnValue({
    push: vi.fn()
  })

  beforeEach(() => {
    ;(mockedUseRouter as Mock)().push.mockReset()

    wrapper = createWrapper({
      authUser: {
        user: { token: '' }
      }
    })
  })

  // Component Helpers
  const formTitle = (): DOMWrapper<Element> => wrapper.find('[data-test="form-title"]')
  const usernameLabel = (): DOMWrapper<Element> => wrapper.findAll('label')[0]
  const usernameInput = (): DOMWrapper<Element> => wrapper.find('[data-test="username"]')
  const passwordLabel = (): DOMWrapper<Element> => wrapper.findAll('label')[1]
  const passwordInput = (): DOMWrapper<Element> => wrapper.find('[data-test="password"]')
  const submitButton = (): DOMWrapper<Element> => wrapper.find('[data-test="form"]')
  const usernameErrorMessage = (): DOMWrapper<Element> => wrapper.findAll('[data-message-type="validation"]')[0]
  const passwordErrorMessage = (): DOMWrapper<Element> => wrapper.findAll('[data-message-type="validation"]')[1]
  const registerNowLink = (): DOMWrapper<Element> => wrapper.find('[data-test="register-now-link"]')

  describe('render component', () => {
    it('renders elements correctly', () => {
      expect(formTitle().exists()).toBe(true)
      expect(formTitle().text()).toBe('login')

      expect(usernameLabel().exists()).toBe(true)
      expect(usernameInput().exists()).toBe(true)
      expect(usernameInput().attributes('placeholder')).toBe('Username')

      expect(passwordLabel().exists()).toBe(true)
      expect(passwordInput().exists()).toBe(true)
      expect(passwordInput().attributes('placeholder')).toBe('Password')

      expect(submitButton().exists()).toBe(true)
      expect(registerNowLink().exists()).toBe(true)

      expect(usernameErrorMessage()).toBeUndefined()
      expect(passwordErrorMessage()).toBeUndefined()

      expect(registerNowLink().attributes('to')).toBe('/register')
    })
  })

  it('redirects to home page if user refreshed page but was already logged in with valid token', async () => {
    wrapper = createWrapper({
      authUser: {
        user: { token: 'abc123' }
      }
    })

    expect(useRouter().push).toHaveBeenCalledOnce()
    expect(useRouter().push).toHaveBeenCalledWith('/')
  })

  describe('when the submit button is clicked', () => {
    it('shows input errors when all inputs are left empty', async () => {
      expect(usernameErrorMessage()).toBeUndefined()
      expect(passwordErrorMessage()).toBeUndefined()

      await submitButton().trigger('submit')

      expect(usernameErrorMessage().exists()).toBe(true)
      expect(passwordErrorMessage().exists()).toBe(true)
    })

    it('should submit the form data when all inputs are valid', async () => {
      const store = useAuthUserStore()
      const mockUser = {
        username: 'test@tesr.com',
        password: '12345678002'
      }

      await usernameInput().setValue(mockUser.username)
      await passwordInput().setValue(mockUser.password)
      await new Promise((r) => setTimeout(r, 20))

      await submitButton().trigger('submit')
      await flushPromises()

      expect(store.login).toHaveBeenCalledOnce()
      expect(store.login).toHaveBeenCalledWith({
        password: mockUser.password,
        username: mockUser.username
      })
    })
  })

  it('focuses on the first input field on mount', async () => {
    // Expect focusInput to be called with the username field id
    expect(focusInput).toHaveBeenCalledWith('input_0')
  })
})
