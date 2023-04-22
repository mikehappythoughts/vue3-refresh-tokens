import { setActivePinia, createPinia, Store } from 'pinia'
import { useAuthUserStore } from '@/stores/auth/useAuthUserStore'
import axios from '@/api/axios'
import { Mock, MockedFunction } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import router from '@/router'

// Mocks
vi.mock('@/api/axios')

const mockedAxios = axios as unknown as MockedFunction<typeof axios>

const mockUsernamePassword = { username: 'tester', password: '12345' }

const mockInitalUserData = {
  username: '',
  isUserLoggedIn: false,
  token: ''
}

describe('useAuthUserStore', () => {
  let authUserStore: any
  const push = vi.spyOn(router, 'push')

  beforeEach(() => {
    // creates a fresh pinia and make it active so it's automatically picked
    // up by any useStore() call without having to pass it to it:
    // `useStore(pinia)`
    setActivePinia(createPinia())

    // create the store ready for the tests
    authUserStore = useAuthUserStore()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should login the user when credentials are valid', async () => {
      ;(mockedAxios.post as Mock).mockResolvedValue({ data: { accessToken: 'testToken' } })

      authUserStore.login({ ...mockUsernamePassword })
      expect(authUserStore.loadingSession).toBeTruthy()

      await flushPromises()

      expect(authUserStore.user).toStrictEqual({
        username: 'tester',
        isUserLoggedIn: true,
        token: 'testToken'
      })

      expect(push).toHaveBeenCalledOnce()
      expect(push).toHaveBeenLastCalledWith('/')
      expect(authUserStore.loadingSession).toBeFalsy()
    })

    it('should not login the user when credentials are invalid', async () => {
      ;(mockedAxios.post as Mock).mockRejectedValue({ response: { status: 403 } })
      console.log = vi.fn()

      authUserStore.login({ ...mockUsernamePassword })
      expect(authUserStore.loadingSession).toBeTruthy()

      await flushPromises()

      expect(authUserStore.user).toStrictEqual(mockInitalUserData)

      expect(push).not.toHaveBeenCalledOnce()
      expect(authUserStore.loadingSession).toBeFalsy()
      expect(console.log).toHaveBeenCalledWith('error')
    })
  })

  describe('register', () => {
    it('should register user when user is successfully registered', async () => {
      ;(mockedAxios.post as Mock).mockResolvedValue({ response: { status: 200 } })

      authUserStore.register({ ...mockUsernamePassword })

      await flushPromises()

      expect(authUserStore.user).toStrictEqual(mockInitalUserData)

      expect(push).toHaveBeenCalledOnce()
      expect(push).toHaveBeenLastCalledWith('/login')
    })

    it('should error when register is unsuccessfull', async () => {
      ;(mockedAxios.post as Mock).mockRejectedValue({ response: { status: 403 } })
      console.log = vi.fn()

      authUserStore.register({ ...mockUsernamePassword })

      await flushPromises()

      expect(authUserStore.user).toStrictEqual(mockInitalUserData)

      expect(push).not.toHaveBeenCalledOnce()
      // NOTE: if you have more than one console log you may get the first one instead
      expect(console.log).toHaveBeenCalledWith('error')
    })
  })

  describe('logout', () => {
    it('should logout user and clear all user details', async () => {
      const storageSpy = vi.spyOn(Object.getPrototypeOf(window.localStorage), 'setItem')

      const dateNowString = 1530518207007

      const realDateNow = Date.now.bind(global.Date)
      const dateNowStub = vi.fn(() => dateNowString)
      global.Date.now = dateNowStub

      authUserStore.logout()

      expect(authUserStore.user).toStrictEqual(mockInitalUserData)

      expect(storageSpy).toHaveBeenCalledOnce()
      expect(storageSpy).toHaveBeenLastCalledWith('logout', `${dateNowString}`)

      // rest the global date back to normal
      global.Date.now = realDateNow

      expect(push).toHaveBeenCalledOnce()
      expect(push).toHaveBeenCalledWith('/login')
    })
  })

  describe('getEmployees', () => {
    it('should return the employees details', async () => {
      const mockData = [
        {
          id: 1,
          firstname: 'Dave',
          lastname: 'Gray'
        },
        {
          id: 2,
          firstname: 'John',
          lastname: 'Smith'
        }
      ]

      ;(mockedAxios.get as Mock).mockResolvedValue({ data: mockData })
      console.log = vi.fn()

      authUserStore.getEmployees()
      await flushPromises()

      expect(console.log).toHaveBeenCalledWith(mockData)
    })

    it('should not return the employees details when there is an error response', async () => {
      ;(mockedAxios.get as Mock).mockRejectedValue({ response: 403 })
      console.log = vi.fn()

      authUserStore.getEmployees()
      await flushPromises()

      expect(console.log).toHaveBeenCalledWith('error')
    })
  })

  describe('updateAccessToken', () => {
    it('should update access token on successful token refresh', async () => {
      ;(mockedAxios.get as Mock).mockResolvedValue({ data: { accessToken: 'newToken' } })

      authUserStore.updateAccessToken('newToken')

      expect(authUserStore.user).toStrictEqual({
        username: '',
        isUserLoggedIn: true,
        token: 'newToken'
      })
    })
  })

  describe('refreshToken', () => {
    it('should update access token on successful token refresh', async () => {
      ;(mockedAxios.get as Mock).mockResolvedValue({ data: { accessToken: 'newToken' } })
      const spyUpdateAccessToken = vi.spyOn(authUserStore, 'updateAccessToken')

      authUserStore.refreshToken()

      await flushPromises()

      expect(spyUpdateAccessToken).toHaveBeenCalledWith('newToken')
    })

    it('should not update access token on unsuccessful token refresh', async () => {
      ;(mockedAxios.get as Mock).mockRejectedValue({ response: { status: 403 } })
      const spyUpdateAccessToken = vi.spyOn(authUserStore, 'updateAccessToken')
      console.log = vi.fn()

      authUserStore.refreshToken()

      await flushPromises()

      expect(spyUpdateAccessToken).not.toHaveBeenCalled()
      expect(console.log).toHaveBeenCalledWith('error')
    })
  })
})
