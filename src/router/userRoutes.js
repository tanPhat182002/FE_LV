import UserLayout from "../Layout/User/UserLayout.vue"
import HomePage from "../views/user/HomePage.vue"
import CartPage from "../views/user/CartPage.vue"

const userRoutes = [{
    path: "/",
    component: UserLayout,
    children: [
        {
            path: "",
            name: "home",
            component: HomePage,
        },
        {
            path: '/profile',
            name: 'profile',
            component: () => import('../views/auth/ProfilePage.vue'),
            
        },
        {
            path: "cart",
            name: "cart",
            component: CartPage,
        },
        
          {
            path: "products/:id",
            name: "product-detail", 
            component: () => import("../views/user/ProductDetailPage.vue")
        },
        
        {
            path: "/forgot-password",
            name: "forgot-password",
            component: () => import("../views/auth/ForgotPasswordPage.vue")
        }

    ],
}]

export default userRoutes