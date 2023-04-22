import { DOMWrapper, flushPromises, mount, VueWrapper } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import CustomerRegister from '@/components/pages/CustomerRegister/CustomerRegister.vue'
import { plugin, defaultConfig } from '@formkit/vue'
import { focusInput } from '@/utils/focusInput'
import { useAuthUserStore } from '@/stores/auth/useAuthUserStore'

// Mocks
vi.mock('@/utils/focusInput')

// Factory
const createWrapper = (state = {}): VueWrapper => {
  const wrapper = mount(CustomerRegister, {
    global: {
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

describe('CustomerRegister', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    wrapper = createWrapper()
  })

  // Component Helpers
  const formTitle = (): DOMWrapper<Element> => wrapper.find('[data-test="form-title"]')
  const usernameLabel = (): DOMWrapper<Element> => wrapper.findAll('label')[0]
  const usernameInput = (): DOMWrapper<Element> => wrapper.find('[data-test="username"]')
  const passwordLabel = (): DOMWrapper<Element> => wrapper.findAll('label')[1]
  const passwordInput = (): DOMWrapper<Element> => wrapper.find('[data-test="password"]')
  const passwordConfirmLabel = (): DOMWrapper<Element> => wrapper.findAll('label')[2]
  const passwordConfirmInput = (): DOMWrapper<Element> => wrapper.find('[data-test="password_confirm"]')
  const submitButton = (): DOMWrapper<Element> => wrapper.find('[data-test="form"]')
  const usernameErrorMessage = (): DOMWrapper<Element> => wrapper.findAll('[data-message-type="validation"]')[0]
  const passwordErrorMessage = (): DOMWrapper<Element> => wrapper.findAll('[data-message-type="validation"]')[1]
  const passwordConfirmErrorMessage = (): DOMWrapper<Element> => wrapper.findAll('[data-message-type="validation"]')[2]

  describe('render component', () => {
    it('renders elements correctly', () => {
      expect(formTitle().exists()).toBe(true)
      expect(formTitle().text()).toBe('register')

      expect(usernameLabel().exists()).toBe(true)
      expect(usernameInput().exists()).toBe(true)
      expect(usernameInput().attributes('placeholder')).toBe('Username')

      expect(passwordLabel().exists()).toBe(true)
      expect(passwordInput().exists()).toBe(true)
      expect(passwordInput().attributes('placeholder')).toBe('Password')

      expect(passwordConfirmLabel().exists()).toBe(true)
      expect(passwordConfirmInput().exists()).toBe(true)
      expect(passwordConfirmInput().attributes('placeholder')).toBe('Confirm password')

      expect(submitButton().exists()).toBe(true)

      expect(usernameErrorMessage()).toBeUndefined()
      expect(passwordErrorMessage()).toBeUndefined()
      expect(passwordConfirmErrorMessage()).toBeUndefined()
    })
  })

  describe('when the submit button is clicked', () => {
    it('shows input errors when all inputs are left empty', async () => {
      expect(usernameErrorMessage()).toBeUndefined()
      expect(passwordErrorMessage()).toBeUndefined()
      expect(passwordConfirmErrorMessage()).toBeUndefined()

      await submitButton().trigger('submit')

      expect(usernameErrorMessage().exists()).toBe(true)
      expect(passwordErrorMessage().exists()).toBe(true)
      expect(passwordConfirmErrorMessage().exists()).toBe(true)
    })

    it('should submit the form data when all inputs are valid', async () => {
      const store = useAuthUserStore()

      const mockUser = {
        username: 'mike33',
        password: 'mikeAbre33@',
        passwordConfirm: 'mikeAbre33@'
      }

      await usernameInput().setValue(mockUser.username)
      await passwordInput().setValue(mockUser.password)
      await passwordConfirmInput().setValue(mockUser.passwordConfirm)
      await new Promise((r) => setTimeout(r, 20))

      await submitButton().trigger('submit')
      await flushPromises()

      expect(store.register).toHaveBeenCalledOnce()
      expect(store.register).toHaveBeenCalledWith({
        password: mockUser.password,
        username: mockUser.username,
        password_confirm: mockUser.password
      })
    })
  })

  it('focuses on the first input field on mount', async () => {
    // Expect focusInput to be called with the username field id
    expect(focusInput).toHaveBeenCalledWith('input_0')
  })
})
