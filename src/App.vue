<template>
  <v-app>
    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script>

export default {
  name: 'App',

  data: () => ({
    //
  }),
}
</script>

<style>
/* Suppress ResizeObserver warnings */
iframe#webpack-dev-server-client-overlay {
  display: none !important;
}
</style>
