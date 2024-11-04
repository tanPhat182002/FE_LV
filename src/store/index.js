import { createStore } from "vuex";
import categoriesStore from "./modules/categoriesStore";
import brandsStore from "./modules/brandsStore";  // Sửa tên biến cho nhất quán
import productsStore from "./modules/productsStore";
import colorsStore from "./modules/colorsStore";
import sizesStore from "./modules/sizesStore";
import homeStore from './modules/homeStore'

const store = createStore({
  modules: {
    categories: categoriesStore,
    brands: brandsStore,         
    products: productsStore,
    colors: colorsStore,
    sizes: sizesStore,
    home: homeStore,
  },
});

export default store;