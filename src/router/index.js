import { createRouter, createWebHistory } from "vue-router";
import userRoutes from "./userRoutes";
import authRoutes from "./authRoutes";
import adminRoutes from "./adminRoutes";
const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: [...userRoutes, ...authRoutes, ...adminRoutes],
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router;
