const authRoutes = [
    {
        path: '/login',
        name: 'login',
        component: () => import('../views/auth/LoginPage.vue')
    },
    {
        path: '/register',
        name: 'register',
        component: () => import('../views/auth/RegisterPage.vue')
    },
    {
        path: '/forgot-password',
        name: 'forgot-password',
        component: () => import('../views/auth/RePasswordPage.vue')
    }
]

export default authRoutes