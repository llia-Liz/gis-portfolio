<template>
  <div class="geojson-view">
    <GeoJsonMap />
  </div>
</template>

<script setup>
import GeoJsonMap from '../components/GeoJsonMap.vue'
</script>

<style scoped>
.geojson-view {
  width: 100%;
  height: 100vh;
}
</style>