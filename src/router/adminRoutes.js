const adminRoutes = [
  {
    path: "/admin",
    redirect: "/admin/dashboard",
    component: () => import("../Layout/Admin/AdminLayout.vue"),
    children: [
      {
        path: "dashboard",
        name: "admin-dashboard",
        component: () => import("@/views/admin/DashBoardPage.vue"),
      },
      {
        path: "categories",
        component: () =>
          import("@/views/admin/Categories/CategoriesLayout.vue"),

        children: [
          {
            path: "", // path trống sẽ match với parent
            name: "admin-categories",
            component: () => import("@/views/admin/Categories/IndexPage.vue"),
          },
          {
            path: "create",
            name: "admin-categories-create",
            component: () => import("@/views/admin/Categories/CreatePage.vue"),
          },
          {
            path: "edit/:id",
            name: "admin-categories-edit",
            component: () => import("@/views/admin/Categories/EditPage.vue"),
          },
        ],
      },
      {
        path: "brands",
        component: () => import("@/views/admin/Brands/BrandsLayout.vue"),
        children: [
          {
            path: "",
            name: "admin-brands",
            component: () => import("@/views/admin/Brands/IndexPage.vue"),
          },
          {
            path: "create",
            name: "admin-brands-create",
            component: () => import("@/views/admin/Brands/CreatePage.vue"),
          },
          {
            path: "edit/:id",
            name: "admin-brands-edit",
            component: () => import("@/views/admin/Brands/EditPage.vue"),
          },
        ],
      },
      {
        path: "products",
        component: () => import("@/views/admin/Products/ProductsLayout.vue"),
        children: [
          {
            path: "",
            name: "admin-products",
            component: () => import("@/views/admin/Products/IndexPage.vue"),
          },
          {
            path: "create",
            name: "admin-products-create",
            component: () => import("@/views/admin/Products/CreatePage.vue"),
          },
          {
            path: "edit/:id",
            name: "admin-products-edit",
            component: () => import("@/views/admin/Products/EditPage.vue"),
          },
          {
            path: "detail/:id",
            name: "admin-products-detail",
            component: () => import("@/views/admin/Products/DetailPage.vue"),
          }
        ],
      },
      {
        path: "colors",
        component: () => import("@/views/admin/Colors/ColorsLayout.vue"),
        children: [
          {
            path: "", // path trống sẽ match với parent
            name: "admin-colors",
            component: () => import("@/views/admin/Colors/IndexPage.vue"),
          },
          {
            path: "create",
            name: "admin-colors-create",
            component: () => import("@/views/admin/Colors/CreatePage.vue"),
          },
          {
            path: "edit/:id",
            name: "admin-colors-edit",
            component: () => import("@/views/admin/Colors/EditPage.vue"), 
          }
        ],
      },
      {
        path: "sizes",
        component: () => import("@/views/admin/Sizes/SizesLayout.vue"),
        children: [
          {
            path: "", // path trống sẽ match với parent
            name: "admin-sizes",
            component: () => import("@/views/admin/Sizes/IndexPage.vue"),
          },
          {
            path: "create",
            name: "admin-sizes-create", 
            component: () => import("@/views/admin/Sizes/CreatePage.vue"),
          },
          {
            path: "edit/:id",
            name: "admin-sizes-edit",
            component: () => import("@/views/admin/Sizes/EditPage.vue"),
          }
        ],
      },
    ],
  },
];
export default adminRoutes;
