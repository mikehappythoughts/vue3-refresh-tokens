// Pinia store
import { defineStore } from 'pinia'

// Router
import router from '@/router'

// Api
import axios from '@/api/axios'

// Interface
import { IAuthUserInterface, IEmployees, IUserInterface, TokenResponse } from '@/interface'

const initalUserState: Partial<IUserInterface> = {
  username: '',
  isUserLoggedIn: false,
  token: ''
}

export const useAuthUserStore = defineStore('authUser', {
  state: () => {
    return {
      user: initalUserState,
      loadingSession: false
    }
  },
  getters: {
    getAccessToken: (state): string | undefined => state.user.token
  },
  actions: {
    async login(userDetails: Partial<IAuthUserInterface>): Promise<void> {
      const { username: user, password: pwd } = userDetails
      this.loadingSession = true

      try {
        const { data } = await axios.post('/auth', JSON.stringify({ user, pwd }))
        // set the current user
        this.user = {
          username: user,
          isUserLoggedIn: true,
          token: data.accessToken
        }
        this.loadingSession = false

        router.push('/')
      } catch (error: unknown) {
        console.log('error')
      } finally {
        this.loadingSession = false
      }
    },
    async register(userDetails: Partial<IAuthUserInterface>): Promise<void> {
      try {
        const { username: user, password: pwd } = userDetails

        await axios.post('/register', JSON.stringify({ user, pwd }))
        // once created we redirect the user back to the login page to login
        router.push('/login')
      } catch (error: unknown) {
        console.log('error')
      }
    },
    async logout(): Promise<void> {
      this.user = initalUserState

      // logout of any other tabs that are open
      window.localStorage.setItem('logout', Date.now().toString())
      router.push('/login')
      window.localStorage.removeItem('logout')
    },
    async getEmployees() {
      try {
        const { data } = await axios.get<IEmployees>('/employees')

        console.log(data)
      } catch (error: unknown) {
        console.log('error')
      }
    },
    updateAccessToken(accessToken: string) {
      this.user = {
        ...this.user,
        token: accessToken,
        isUserLoggedIn: true
      }
    },
    async refreshToken() {
      // check if the user still has a valid token
      try {
        const { data } = await axios.get<TokenResponse>('/refresh')

        // save new access token in memory
        this.updateAccessToken(data.accessToken)
      } catch (error) {
        console.log('error')
      }
    }
  }
})
