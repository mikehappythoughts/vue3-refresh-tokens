import { describe, it, expect, beforeEach, vi, afterEach, Mock, MockedFunction } from 'vitest'
import { setUpRefreshTokenInterceptor } from '@/services/refreshInterceptors'
import axios from '@/api/axios'
import { useAuthUserStore } from '@/stores/auth/useAuthUserStore'
import { flushPromises } from '@vue/test-utils'
import { AxiosError } from 'axios'

// Mocks
vi.mock('@/api/axios')

vi.mock('@/stores/auth/useAuthUserStore', () => ({
  useAuthUserStore: vi.fn(() => ({
    user: vi.fn(),
    logout: vi.fn(),
    updateAccessToken: vi.fn()
  }))
}))

const mockedUseAuthUserStore = useAuthUserStore as unknown as Mock
const mockedAxios = axios as unknown as MockedFunction<typeof axios>

describe('setUpRefreshTokenInterceptor', async () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedAxios.interceptors.request.use = vi.fn().mockReturnValue({ headers: {} })

    mockedAxios.interceptors.response.use = vi.fn().mockReturnValue({ data: { success: true } })

    setUpRefreshTokenInterceptor()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should add an Authorization header to the request if the user is logged in', () => {
    mockedUseAuthUserStore.mockImplementation(() => ({
      user: { token: 'someToken' }
    }))

    expect(mockedAxios.interceptors.request.use).toHaveBeenCalled()
    expect(mockedAxios.interceptors.response.use).toHaveBeenCalled()
    expect((mockedAxios.interceptors.request.use as Mock).mock.calls[0][0]({ headers: {} })).toHaveProperty(
      'headers.Authorization',
      'Bearer someToken'
    )
  })

  it('should retry the request with a new access token if the access token has expired and a new access token is successfully fetched', async () => {
    const mockRefreshToken = vi.fn().mockResolvedValue({ data: { accessToken: 'newAccessToken' } })
    const mockLogout = vi.fn()

    // mock the authStore
    mockedUseAuthUserStore.mockImplementation(() => ({
      user: { isUserLoggedIn: true, token: 'someToken' },
      logout: mockLogout,
      refreshToken: mockRefreshToken,
      getAccessToken: 'newAccessToken'
    }))

    const originalRequest = {
      headers: { Authorization: 'Bearer someToken' },
      _retry: false
    }
    // create fake error response
    await (mockedAxios.interceptors.response.use as Mock).mock.calls[0][1]({
      response: { status: 403 },
      config: originalRequest
    })

    expect(originalRequest._retry).toEqual(true)
    expect(originalRequest).toHaveProperty('headers.Authorization', 'Bearer newAccessToken')
    expect(mockLogout).not.toHaveBeenCalled()
  })

  it('should log out the user and reject the promise if fetching a new access token fails', async () => {
    const originalRequest = { _retry: false }
    const mockLogout = vi.fn()
    const mockUpdateAccessToken = vi.fn()
    const mockRefreshToken = vi.fn().mockRejectedValue(new Error('Failed to refresh token'))

    // mock the authStore
    mockedUseAuthUserStore.mockImplementation(() => ({
      user: { token: 'someToken' },
      logout: mockLogout,
      updateAccessToken: mockUpdateAccessToken,
      refreshToken: mockRefreshToken
    }))

    await expect(
      (mockedAxios.interceptors.response.use as Mock).mock.calls[0][1]({
        response: { status: 403 },
        config: originalRequest
      })
    ).rejects.toThrow('Failed to refresh token')

    expect(originalRequest._retry).toEqual(true)
    expect(mockLogout).toHaveBeenCalled()
  })

  // it('should retry the request with a new access token if the access token has expired and a new access token is successfully fetched', async () => {
  //   const mockRefreshToken = vi.fn()
  //   const mockGetAccessToken = 'newAccessToken'

  //   // mock the authStore
  //   mockedUseAuthUserStore.mockImplementation(() => ({
  //     user: { isUserLoggedIn: true, token: 'someToken' },
  //     refreshToken: mockRefreshToken,
  //     getAccessToken: mockGetAccessToken
  //   }))

  //   const originalRequest = {
  //     headers: { Authorization: 'Bearer someToken' },
  //     _retry: false
  //   }

  //   // mock refreshToken function
  //   mockRefreshToken.mockResolvedValueOnce({ data: { accessToken: mockGetAccessToken } })

  //   const axiosSpy = vi.spyOn(axios, 'request')

  //   mockedAxios.get.mockResolvedValue(() => {
  //     return { data: { accessToken: mockGetAccessToken } }
  //   })

  //   // trigger the interceptor
  //   await (mockedAxios.interceptors.response.use as Mock).mock.calls[0][1]({
  //     response: { status: 403 },
  //     config: originalRequest
  //   })

  //   await flushPromises()

  //   expect(mockRefreshToken).toHaveBeenCalled()
  //   expect(originalRequest._retry).toEqual(true)
  //   expect(axiosSpy).toHaveBeenCalledWith({
  //     headers: { Authorization: 'Bearer newAccessToken' },
  //     _retry: true
  //   })
  //   expect(axiosSpy).toHaveBeenCalledTimes(1)
  //   expect(originalRequest.headers?.Authorization).toEqual(`Bearer ${mockGetAccessToken}`)
  //   // expect(mockLogout).not.toHaveBeenCalled()
  // })
})
