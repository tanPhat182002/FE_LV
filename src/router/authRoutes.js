const authRoutes = [
    {
        path: '/login',
        name: 'login',
        component: () => import('../views/auth/LoginPage.vue'),
        meta: { 
            guest: true // Chỉ cho phép guest truy cập
        }
    },
    {
        path: '/register',
        name: 'register',
        component: () => import('../views/auth/RegisterPage.vue'),
        meta: {
            guest: true
        }
    },
    {
        path: '/forgot-password',
        name: 'forgot-password',
        component: () => import('../views/auth/ForgotPasswordPage.vue'),
        meta: {
            guest: true
        }
    },
    {
        path: '/verify-otp',
        name: 'verify-otp',
        component: () => import('../views/auth/VerifyOTPPage.vue'),
        meta: {
            guest: true
        }
    },
    {
        path: '/reset-password',
        name: 'reset-password',
        component: () => import('../views/auth/ResetPasswordPage.vue'),
        meta: {
            guest: true
        }
    },
    
    {
        path: '/auth/google/callback',
        name: 'google-callback',
        component: () => import('../views/auth/SocialCallbackPage.vue')
    },
    {
        path: '/auth/facebook/callback',
        name: 'facebook-callback',
        component: () => import('../views/auth/SocialCallbackPage.vue')
    }
]

export default authRoutes