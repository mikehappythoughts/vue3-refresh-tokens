import { createRouter, createWebHistory } from 'vue-router'

// Component
import DashBoard from '@/components/pages/DashBoard/DashBoard.vue'

//Constant
import { PAGES } from '@/constant/router.names'

// Middleware
import { requireAuth } from '@/middlewares/auth'

export const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: DashBoard,
    beforeEnter: requireAuth
  },

  {
    path: '/login',
    name: PAGES.CUSTOMERLOGIN,
    // route level code-splitting
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "login" */ '@/components/pages/CustomerLogin/CustomerLogin.vue')
  },
  {
    path: '/register',
    name: PAGES.CUSTOMERREGISTER,
    component: () =>
      import(/* webpackChunkName: "register" */ '@/components/pages/CustomerRegister/CustomerRegister.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: PAGES.PAGENOTFOUND,
    component: () => import(/* webpackChunkName: "pageNotFound" */ '@/components/pages/PageNotFound/PageNotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
