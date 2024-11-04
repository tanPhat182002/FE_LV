<template>
  <v-carousel
    cycle
    height="550"
    hide-delimiter-background
    show-arrows="hover"
  >
    <v-carousel-item
      v-for="(slide, i) in slides"
      :key="i"
      :src="slide.image"
      cover
    >
      <v-sheet
        height="100%"
        class="d-flex align-center justify-center"
        style="background: rgba(0,0,0,0.3)"
      >
        <div class="text-center">
          <h2 class="text-h3 font-weight-bold white--text mb-4">
            {{ slide.title }}
          </h2>
          <p class="text-h6 white--text mb-6">
            {{ slide.subtitle }}
          </p>
          <!-- <v-btn
            color="primary"
            size="large"
            :to="slide.buttonLink"
          >
            {{ slide.buttonText }}
          </v-btn> -->
        </div>
      </v-sheet>
    </v-carousel-item>
  </v-carousel>
</template>

<script>
export default {
  name: 'UserBanner',
  data() {
    return {
      slides: [
        {
          image: 'https://theme.hstatic.net/1000197303/1001046599/14/slideshow_1.jpg?v=9956',
          // title: 'Welcome to Our Store',
          // subtitle: 'Discover Amazing Products',
          // buttonText: 'Shop Now',
          // buttonLink: '/products'
        },
        {
          image: 'https://theme.hstatic.net/1000197303/1001046599/14/slideshow_2.jpg?v=9978',
          // title: 'Special Offers',
          // subtitle: 'Up to 50% Off',
          // buttonText: 'View Deals',
          // buttonLink: '/deals'
        },
        {
          image: 'https://theme.hstatic.net/1000197303/1001046599/14/slideshow_3.jpg?v=9978',
          // title: 'New Collection',
          // subtitle: 'Check Out Our Latest Items',
          // buttonText: 'Explore',
          // buttonLink: '/new-arrivals'
        }
      ]
    }
  }
}
</script>