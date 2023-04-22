import { useAuthUserStore } from '@/stores/auth/useAuthUserStore'
import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

export const requireAuth = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
): Promise<void> => {
  const { user } = useAuthUserStore()

  if (user.isUserLoggedIn && user.token) {
    next()
  } else {
    next('/login')
  }
}
