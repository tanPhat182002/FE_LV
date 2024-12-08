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
            path: "checkout",
            name: "checkout",
            component: () => import("../views/user/CheckoutPage.vue"),
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
        },
        {
            path: "/orders/vnpay-return",
            name: "vnpay-return",
            component: () => import("../views/user/VNPayReturn.vue")
        },
        {
            path: "/orders/success",
            name: "order-success",
            component: () => import("../views/user/VNPayReturn.vue")
        },
        {
            path: "/orders/momo-return",
            name: "momo-return",
            component: () => import("../views/user/MomoReturn.vue")
        },
        {
            path: "/orders",
            name: "order-user",
            component: () => import("../views/user/OrderUser.vue")
        },
        {
            path: "/orders/:id",
            name: "order-detail-user",
            component: () => import("../views/user/OrderDetailUser.vue")
        },
        {
            path:"/products",
            name:"product",
            component: () => import("../views/user/ProductAll.vue")

        }

    ],
}]

export default userRoutes