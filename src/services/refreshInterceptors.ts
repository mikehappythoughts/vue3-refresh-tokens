import axios from '../api/axios'

import { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { useAuthUserStore } from '@/stores/auth/useAuthUserStore'

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean
}

let isRefreshingToken = false

const setUpRefreshTokenInterceptor = (): void => {
  axios.interceptors.request.use(
    (config) => {
      const { user } = useAuthUserStore()

      if (user.token) {
        config.headers.Authorization = `Bearer ${user.token}`
      }
      return config
    },
    async (error: AxiosError) => {
      return Promise.reject(error)
    }
  )

  axios.interceptors.response.use(
    (response: AxiosResponse) => {
      return response
    },
    async (error: AxiosError) => {
      const { logout, refreshToken, getAccessToken } = useAuthUserStore()
      const originalRequest = error.config as CustomAxiosRequestConfig

      if (error.response?.status === 403 && !originalRequest._retry && !isRefreshingToken) {
        originalRequest._retry = true
        isRefreshingToken = true

        try {
          await refreshToken()

          const newAccessToken = getAccessToken

          if (newAccessToken) {
            // update access token in original response
            if (originalRequest.headers !== undefined) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
            }
          }
          // retry the original request
          return axios(originalRequest)
        } catch (error: unknown) {
          // logout the user and redirect to login page
          logout()

          return Promise.reject(error)
        } finally {
          isRefreshingToken = false
        }
      }
      // logout the user and redirect to login page
      logout()
      return Promise.reject(error)
    }
  )
}
export { setUpRefreshTokenInterceptor }
