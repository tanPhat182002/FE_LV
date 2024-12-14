import { createRouter, createWebHistory } from "vue-router";
import userRoutes from "./userRoutes";
import authRoutes from "./authRoutes";
import adminRoutes from "./adminRoutes";

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: [...userRoutes, ...authRoutes, ...adminRoutes],
});

router.beforeEach((to, from, next) => {
  const userToken = localStorage.getItem('token')
  const adminToken = localStorage.getItem('admin_token')
  
  // Kiểm tra route có phải của admin không
  const isAdminRoute = to.path.startsWith('/admin')
  
  // Kiểm tra route yêu cầu authentication
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (isAdminRoute) {
    // Xử lý route admin
    if (to.path === '/admin/login') {
      // Nếu đã có admin token, chuyển về dashboard
      if (adminToken) {
        next('/admin/dashboard')
      } else {
        next()
      }
    } else {
      // Các route admin khác cần token
      if (!adminToken) {
        next('/admin/login')
      } else {
        next()
      }
    }
  } else {
    // Xử lý route user
    if (requiresAuth && !userToken) {
      next('/login')
    } else {
      next()
    }
  }
})

export default router;
