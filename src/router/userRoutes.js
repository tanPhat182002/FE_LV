import UserLayout from "../Layout/User/UserLayout.vue"
import HomePage from "../views/user/HomePage.vue"
import UserPrivate from "../views/user/UserPrivate.vue"
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
            path: "user",
            component: UserPrivate,
        },
        {
            path: "cart",
            name: "cart",
            component: CartPage,
        },
          // Thêm route chi tiết sản phẩm
          {
            path: "products/:id",
            name: "product-detail", 
            component: () => import("../views/user/ProductDetailPage.vue")
        }
    ],
}]

export default userRoutes