<template>
  <div class="maplibre-view">
    <h1>MapLibre矢量瓦片可视化</h1>
    <p class="description">
      展示MapLibre GL JS的高级功能，包括矢量瓦片底图、数据驱动样式、点聚合、3D建筑拉伸等。
    </p>
    <MapLibreMap />
  </div>
</template>

<script setup>
import MapLibreMap from '../components/MapLibreMap.vue'
</script>

<style scoped>
.maplibre-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

h1 {
  margin: 0;
  padding: 20px;
  font-size: 24px;
  color: #333;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.description {
  margin: 0;
  padding: 15px 20px;
  font-size: 14px;
  color: #666;
  background: #f9f9f9;
  border-bottom: 1px solid #e0e0e0;
}

.maplibre-view > :last-child {
  flex: 1;
}
</style>
