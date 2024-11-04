// src/plugins/vuetify.js
import { createVuetify } from 'vuetify'
import 'vuetify/styles'

// Import icons
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'

export default createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#1867C0',
          secondary: '#5CBBF6',
          accent: '#FF4081',
        },
      },
    },
  },
  // Thêm cấu hình icons
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
})