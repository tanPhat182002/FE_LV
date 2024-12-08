import { createStore } from "vuex";
import categoriesStore from "./modules/categoriesStore";
import brandsStore from "./modules/brandsStore";  // Sửa tên biến cho nhất quán
import productsStore from "./modules/productsStore";
import colorsStore from "./modules/colorsStore";
import sizesStore from "./modules/sizesStore";
import homeStore from './modules/homeStore'
import promotionStore from './modules/promotionStore'
import userStore from './modules/userStore'
import discountsStore from './modules/discountsStore'
import orderStore from "./modules/orderStore";
import ratingStore from './modules/ratingStore'
import dashboardStore from './modules/dashboardStore'


const store = createStore({
  modules: {
    categories: categoriesStore,
    brands: brandsStore,         
    products: productsStore,
    colors: colorsStore,
    sizes: sizesStore,
    home: homeStore,
    promotions: promotionStore,
    user: userStore,
    discounts: discountsStore,
    order: orderStore,
    rating: ratingStore,
    dashboard:dashboardStore
  },
});

export default store;