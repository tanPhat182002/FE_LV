<template>
  <v-footer
    class="bg-grey-lighten-1"
  >
    <v-container>
      <v-row>
        <!-- Company Info -->
        <v-col cols="12" md="4">
          <h3 class="text-h6 mb-4">About Us</h3>
          <p class="text-body-2">
            We are committed to providing our customers with the best shopping
            experience and highest quality products.
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
          <h3 class="text-h6 mb-4">Quick Links</h3>
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
          <h3 class="text-h6 mb-4">Contact Us</h3>
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
            © {{ new Date().getFullYear() }} Your Company Name. All rights reserved.
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
        { title: 'Home', route: '/' },
        { title: 'Products', route: '/products' },
        { title: 'About Us', route: '/about' },
        { title: 'Contact', route: '/contact' },
        { title: 'Privacy Policy', route: '/privacy' }
      ],
      contactInfo: [
        { icon: 'mdi-map-marker', text: '123 Store Street, City, Country' },
        { icon: 'mdi-phone', text: '+1 234 567 890' },
        { icon: 'mdi-email', text: 'support@yourstore.com' }
      ]
    }
  }
}
</script>