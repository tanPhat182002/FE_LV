<template>
  <v-footer
    class="bg-grey-lighten-1"
  >
    <v-container>
      <v-row>
        <!-- Company Info -->
        <v-col cols="12" md="4">
          <h3 class="text-h6 mb-4">Về chúng tôi</h3>
          <p class="text-body-2">
            Chúng tôi là một công ty thương mại điện tử, chuyên cung cấp các sản phẩm điện tử chất lượng cao và dịch vụ chăm sóc khách hàng tốt nhất.
          </p>
          <div class="mt-4">
            <v-btn
              v-for="icon in socialIcons"
              :key="icon.icon"
              :icon="icon.icon"
              variant="text"
              class="mr-2"
            ></v-btn>
          </div>
        </v-col>

        <!-- Quick Links -->
        <v-col cols="12" md="4">
          <h3 class="text-h6 mb-4">Liên kết nhanh</h3>
          <v-list density="compact" bg-color="transparent">
            <v-list-item
              v-for="link in quickLinks"
              :key="link.title"
              :to="link.route"
              class="px-0"
            >
              <v-list-item-title>{{ link.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-col>

        <!-- Contact Info -->
        <v-col cols="12" md="4">
          <h3 class="text-h6 mb-4">Liên hệ chúng tôi</h3>
          <v-list density="compact" bg-color="transparent">
            <v-list-item
              v-for="contact in contactInfo"
              :key="contact.text"
              :prepend-icon="contact.icon"
              class="px-0"
            >
              <v-list-item-title>{{ contact.text }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-col>
      </v-row>

      <!-- Copyright -->
      <v-row>
        <v-col cols="12" class="text-center mt-4">
          <v-divider class="mb-4"></v-divider>
          <span class="text-body-2">
            © {{ new Date().getFullYear() }} Công ty TNHH Thương mại và Dịch vụ Điện tử. All rights reserved.
          </span>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script>
export default {
  name: 'UserFooter',
  data() {
    return {
      socialIcons: [
        { icon: 'mdi-facebook' },
        { icon: 'mdi-twitter' },
        { icon: 'mdi-instagram' },
        { icon: 'mdi-youtube' }
      ],
      quickLinks: [
        { title: 'Trang chủ', route: '/' },
        { title: 'Sản phẩm', route: '/products' },
        { title: 'Về chúng tôi', route: '/about' },
        { title: 'Liên hệ', route: '/contact' },
        { title: 'Chính sách bảo mật', route: '/privacy' }
      ],
      contactInfo: [
        { icon: 'mdi-map-marker', text: '180 Cao lỗ, phường 4, quận 8, TP.HCM' },
        { icon: 'mdi-phone', text: '+84 987 654 321' },
        { icon: 'mdi-email', text: 'trantanphat2002ks@gmail.com' }

      ]
    }
  }
}
</script>