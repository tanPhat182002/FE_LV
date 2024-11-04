import { createRouter, createWebHistory } from "vue-router";
import userRoutes from "./userRoutes";
import authRoutes from "./authRoutes";
import adminRoutes from "./adminRoutes";
const router = createRouter({
  history: createWebHistory(),
  routes: [...userRoutes, ...authRoutes, ...adminRoutes],
});

export default router;
