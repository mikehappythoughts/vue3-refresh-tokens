import { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { useAuthUserStore } from '@/stores/auth/useAuthUserStore'
import { requireAuth } from '@/middlewares/auth'
import { Mock } from 'vitest'

// Mock the router `to` and `from` location objects
const to: RouteLocationNormalized = {} as RouteLocationNormalized
const from: RouteLocationNormalized = {} as RouteLocationNormalized

// Mock the `next` function to check if it's called correctly
const next: NavigationGuardNext = vi.fn() as Mock

// Mock the `useAuthUserStore` function to return a user object with `isUserLoggedIn` and `token` properties
vi.mock('@/stores/auth/useAuthUserStore', () => ({
  useAuthUserStore: vi.fn(() => ({
    user: {
      isUserLoggedIn: true,
      token: 'fakeToken'
    }
  }))
}))

const mockedUseAuthUserStore = useAuthUserStore as unknown as Mock

describe('requireAuth middleware', () => {
  afterEach(() => {
    // Restore the router
    vi.restoreAllMocks()
  })

  it('should call next with no arguments if the user is authenticated', async () => {
    await requireAuth(to, from, next)

    expect(next).toHaveBeenCalledWith()
  })

  it('should call next with "/login" argument if the user is not authenticated', async () => {
    mockedUseAuthUserStore.mockImplementation(() => ({
      user: { isUserLoggedIn: false, token: '' }
    }))

    await requireAuth(to, from, next)

    expect(next).toHaveBeenCalledWith('/login')
  })
})
