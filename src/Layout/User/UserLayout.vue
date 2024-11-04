<template>
  <v-app>
    <UserHeader />
    
    <v-main>
      <UserBaner v-if="showBanner" />
      
      <v-fade-transition mode="out-in">
        <router-view></router-view>
      </v-fade-transition>
      
      <UserFooter />
    </v-main>

    <!-- Scroll to top button -->
    <v-btn
      v-show="showScrollTop"
      color="primary"
      icon="mdi-chevron-up"
      size="large"
      class="scroll-to-top"
      @click="scrollToTop"
    ></v-btn>
  </v-app>
</template>

<script>
import UserHeader from '@/Layout/User/UserHeader.vue'
import UserBaner from '@/Layout/User/UserBaner.vue'
import UserFooter from '@/Layout/User/UserFooter.vue'

export default {
  name: 'UserLayout',
  components: {
    UserHeader,
    UserBaner,
    UserFooter
  },
  data() {
    return {
      showScrollTop: false
    }
  },
  computed: {
    showBanner() {
      // Chỉ hiện banner ở trang chủ
      return this.$route.path === '/'
    }
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll)
  },
  unmounted() {
    window.removeEventListener('scroll', this.handleScroll)
  },
  methods: {
    handleScroll() {
      this.showScrollTop = window.scrollY > 300
    },
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  }
}
</script>

<style scoped>
.scroll-to-top {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 99;
}
</style>