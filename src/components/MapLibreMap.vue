<template>
  <div class="maplibre-container">
    <!-- MapLibre地图容器 -->
    <div ref="mapContainer" class="maplibre-map" :class="{ 'dark-theme': currentStyleIndex === 1 }"></div>
    
    <!-- 控制面板 -->
    <div class="control-panel">
      <div class="panel-section">
        <h3>底图切换</h3>
        <div class="button-group">
          <button 
            v-for="(style, index) in mapStyles" 
            :key="index"
            :class="{ active: currentStyleIndex === index }"
            @click="switchStyle(index)"
          >
            {{ style.name }}
          </button>
        </div>
      </div>
      
      <div class="panel-section">
        <h3>数据驱动样式</h3>
        <div class="field-selector">
          <label>
            <input type="radio" v-model="dataDrivenField" value="population" @change="updateDataDrivenStyle">
            人口
          </label>
          <label>
            <input type="radio" v-model="dataDrivenField" value="gdp" @change="updateDataDrivenStyle">
            GDP
          </label>
          <label>
            <input type="radio" v-model="dataDrivenField" value="density" @change="updateDataDrivenStyle">
            人口密度
          </label>
        </div>
      </div>
      
      <div class="panel-section">
        <h3>3D建筑拉伸</h3>
        <label class="switch-label">
          <input type="checkbox" v-model="show3DBuildings" @change="toggle3DBuildings">
          <span class="switch-slider"></span>
        </label>
        <span>{{ show3DBuildings ? '开启' : '关闭' }}</span>
        <div v-if="show3DBuildings" class="slider-container">
          <span>高度:</span>
          <input 
            type="range" 
            v-model.number="buildingHeight" 
            min="10" 
            max="500" 
            @input="updateBuildingHeight"
          >
          <span>{{ buildingHeight }}m</span>
        </div>
      </div>
      
      <div class="panel-section">
        <h3>3D视角控制</h3>
        <div class="slider-container">
          <span>倾斜角度:</span>
          <input 
            type="range" 
            v-model.number="mapPitch" 
            min="0" 
            max="60" 
            @input="updateView"
          >
          <span>{{ mapPitch }}°</span>
        </div>
        <div class="slider-container">
          <span>旋转角度:</span>
          <input 
            type="range" 
            v-model.number="mapBearing" 
            min="0" 
            max="360" 
            step="1"
            @input="updateView"
          >
          <span>{{ mapBearing }}°</span>
        </div>
        <button @click="resetView" class="reset-btn">重置视角</button>
      </div>
      
      <div class="panel-section">
        <h3>点聚合</h3>
        <label class="switch-label">
          <input type="checkbox" v-model="showCluster" @change="toggleCluster">
          <span class="switch-slider"></span>
        </label>
        <span>{{ showCluster ? '开启' : '关闭' }}</span>
      </div>
      
      <div class="panel-section">
        <h3>配色方案</h3>
        <select v-model="colorScheme" @change="updateColorScheme" class="color-scheme-select">
          <option value="blue">蓝色系</option>
          <option value="red">红色系</option>
          <option value="green">绿色系</option>
          <option value="purple">紫色系</option>
        </select>
      </div>
      
      <div class="panel-section info-section">
        <h3>图例</h3>
        <div class="legend-items">
          <div v-for="(item, index) in legendItems" :key="index" class="legend-item">
            <span class="legend-color" :style="{ background: item.color }"></span>
            <span class="legend-label">{{ item.label }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 地图信息 -->
    <div class="map-info">
      <span>坐标: {{ mouseLngLat.lng.toFixed(4) }}, {{ mouseLngLat.lat.toFixed(4) }}</span>
      <span>缩放: {{ mapZoom.toFixed(1) }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

// 地图实例
let map = null

// DOM引用
const mapContainer = ref(null)

// 地图状态
const currentStyleIndex = ref(0)
const mouseLngLat = reactive({ lng: 0, lat: 0 })
const mapZoom = ref(4)
const mapPitch = ref(0)
const mapBearing = ref(0)

// 数据驱动样式
const dataDrivenField = ref('population')
const show3DBuildings = ref(false)
const buildingHeight = ref(100)
const showCluster = ref(true)
const colorScheme = ref('blue')

// 图例数据
const legendItems = ref([
  { color: '#08519c', label: '高' },
  { color: '#6baed6', label: '中' },
  { color: '#deebf7', label: '低' }
])

// MapLibre样式配置 - 使用国内稳定的高德栅格瓦片服务
// 说明：由于国内网络环境限制，无法直接使用OSM/Mapbox等矢量瓦片服务
// 因此使用高德地图栅格瓦片作为底图，确保稳定访问
const mapStyles = [
  {
    name: '矢量底图',
    style: {
      version: 8,
      sources: {
        'gaode-vec': {
          type: 'raster',
          tiles: [
            'https://wprd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}',
            'https://wprd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}',
            'https://wprd03.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}',
            'https://wprd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}'
          ],
          tileSize: 256,
          attribution: '© 高德地图',
          maxzoom: 19
        }
      },
      layers: [
        {
          id: 'gaode-vec-tiles',
          type: 'raster',
          source: 'gaode-vec',
          minzoom: 0,
          maxzoom: 19
        }
      ]
    }
  },
  {
    name: '深色主题',
    style: {
      version: 8,
      sources: {
        'gaode-dark': {
          type: 'raster',
          tiles: [
            'https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=8&x={x}&y={y}&z={z}',
            'https://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=8&x={x}&y={y}&z={z}',
            'https://webrd03.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=8&x={x}&y={y}&z={z}',
            'https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=8&x={x}&y={y}&z={z}'
          ],
          tileSize: 256,
          attribution: '© 高德地图',
          maxzoom: 19
        }
      },
      layers: [
        {
          id: 'gaode-dark-tiles',
          type: 'raster',
          source: 'gaode-dark',
          minzoom: 0,
          maxzoom: 19
        }
      ]
    }
  },
  {
    name: '卫星遥感',
    style: {
      version: 8,
      sources: {
        'gaode-satellite': {
          type: 'raster',
          tiles: [
            'https://webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
            'https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
            'https://webst03.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
            'https://webst04.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}'
          ],
          tileSize: 256,
          attribution: '© 高德地图',
          maxzoom: 19
        }
      },
      layers: [
        {
          id: 'gaode-satellite-tiles',
          type: 'raster',
          source: 'gaode-satellite',
          minzoom: 0,
          maxzoom: 19
        }
      ]
    }
  }
]

// 配色方案
const colorSchemes = {
  blue: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c'],
  red: ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#99000d'],
  green: ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c'],
  purple: ['#fcfbfd', '#efedf5', '#dadaeb', '#bcbddc', '#9e9ac8', '#807dba', '#6a51a3', '#4a148c']
}

// 省份数据（用于数据驱动样式）
const provinceData = {
  '北京': { population: 2189, gdp: 41610, density: 1334 },
  '天津': { population: 1387, gdp: 15695, density: 1207 },
  '河北': { population: 7461, gdp: 40391, density: 398 },
  '山西': { population: 3492, gdp: 17652, density: 223 },
  '内蒙古': { population: 2405, gdp: 20514, density: 20 },
  '辽宁': { population: 4259, gdp: 27584, density: 291 },
  '吉林': { population: 2407, gdp: 13069, density: 145 },
  '黑龙江': { population: 3185, gdp: 13612, density: 68 },
  '上海': { population: 2487, gdp: 43215, density: 3927 },
  '江苏': { population: 8475, gdp: 116364, density: 785 },
  '浙江': { population: 6457, gdp: 73516, density: 605 },
  '安徽': { population: 6103, gdp: 42959, density: 438 },
  '福建': { population: 4154, gdp: 48810, density: 337 },
  '江西': { population: 4519, gdp: 29620, density: 271 },
  '山东': { population: 10153, gdp: 83096, density: 652 },
  '河南': { population: 9937, gdp: 58887, density: 594 },
  '湖北': { population: 5775, gdp: 50013, density: 311 },
  '湖南': { population: 6644, gdp: 46063, density: 313 },
  '广东': { population: 12601, gdp: 124370, density: 701 },
  '广西': { population: 5013, gdp: 24741, density: 211 },
  '海南': { population: 1008, gdp: 64752, density: 289 },
  '重庆': { population: 3205, gdp: 27894, density: 389 },
  '四川': { population: 8367, gdp: 53851, density: 172 },
  '贵州': { population: 3852, gdp: 19586, density: 219 },
  '云南': { population: 4721, gdp: 27147, density: 120 },
  '西藏': { population: 364, gdp: 2080, density: 3 },
  '陕西': { population: 3953, gdp: 29801, density: 192 },
  '甘肃': { population: 2502, gdp: 10243, density: 56 },
  '青海': { population: 594, gdp: 3347, density: 8 },
  '宁夏': { population: 720, gdp: 4522, density: 94 },
  '新疆': { population: 2585, gdp: 16000, density: 16 },
  '台湾': { population: 2357, gdp: 61130, density: 673 },
  '香港': { population: 741, gdp: 28660, density: 6680 },
  '澳门': { population: 68, gdp: 4347, density: 21350 }
}

// 初始化地图
onMounted(() => {
  initializeMap()
})

// 销毁地图
onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})

const initializeMap = () => {
  map = new maplibregl.Map({
    container: mapContainer.value,
    style: mapStyles[currentStyleIndex.value].style,
    center: [105, 35],  // 中国中心
    zoom: 5,  // 提高初始缩放级别，让用户能看到省份圆圈
    minZoom: 2,
    maxZoom: 18
  })

  // 添加导航控件
  map.addControl(new maplibregl.NavigationControl(), 'top-right')
  
  // 添加比例尺
  map.addControl(new maplibregl.ScaleControl({
    maxWidth: 200,
    unit: 'metric'
  }))

  // 地图加载完成后
  map.on('load', () => {
    console.log('Map loaded, starting to add layers...')
    
    // 添加GeoJSON数据源
    addGeoJSONSource()
    
    // 添加数据驱动样式图层
    addDataDrivenLayers()
    
    // 添加点聚合图层
    addClusterLayer()
    
    // 添加3D建筑图层
    add3DBuildings()
  })

  // 鼠标移动事件
  map.on('mousemove', (e) => {
    mouseLngLat.lng = e.lngLat.lng
    mouseLngLat.lat = e.lngLat.lat
  })

  // 缩放事件
  map.on('zoom', () => {
    mapZoom.value = map.getZoom()
  })
}

// 添加GeoJSON数据源
const addGeoJSONSource = () => {
  // 准备GeoJSON数据 - 使用全部省份数据
  const geojsonData = {
    type: 'FeatureCollection',
    features: Object.entries(provinceData).map(([name, data]) => ({
      type: 'Feature',
      properties: {
        name,
        population: data.population,
        gdp: data.gdp,
        density: data.density
      },
      geometry: {
        type: 'Point',
        coordinates: getProvinceCenter(name)
      }
    }))
  }

  console.log('Adding GeoJSON source with', geojsonData.features.length, 'provinces')
  
  map.addSource('provinces', {
    type: 'geojson',
    data: geojsonData,
    cluster: showCluster.value,  // 根据开关状态决定是否启用聚合
    clusterMaxZoom: 6,  // 缩放级别超过6时展开聚合
    clusterRadius: 50
  })
  
  console.log('Source added successfully')
}

// 获取省份中心点坐标
const getProvinceCenter = (name) => {
  const centers = {
    '北京': [116.4, 39.9],
    '天津': [117.2, 39.1],
    '河北': [114.5, 38.0],
    '山西': [112.5, 37.9],
    '内蒙古': [111.7, 40.8],
    '辽宁': [123.0, 41.8],
    '吉林': [125.3, 43.9],
    '黑龙江': [126.5, 45.8],
    '上海': [121.5, 31.2],
    '江苏': [118.8, 32.1],
    '浙江': [120.2, 29.3],
    '安徽': [117.3, 31.9],
    '福建': [118.0, 26.1],
    '江西': [115.9, 28.7],
    '山东': [118.0, 36.3],
    '河南': [113.6, 34.8],
    '湖北': [114.3, 30.6],
    '湖南': [112.0, 28.2],
    '广东': [113.3, 23.4],
    '广西': [108.3, 23.8],
    '海南': [110.3, 20.0],
    '重庆': [106.5, 29.5],
    '四川': [104.0, 30.6],
    '贵州': [106.7, 26.6],
    '云南': [101.5, 25.0],
    '西藏': [91.1, 29.6],
    '陕西': [108.9, 36.3],
    '甘肃': [103.8, 36.1],
    '青海': [101.8, 36.6],
    '宁夏': [106.3, 37.0],
    '新疆': [87.6, 43.8],
    '台湾': [121.0, 23.5],
    '香港': [114.1, 22.4],
    '澳门': [113.5, 22.2]
  }
  
  return centers[name] || [105, 35]
}

// 添加数据驱动样式图层
const addDataDrivenLayers = () => {
  // 获取当前配色方案
  const colors = colorSchemes[colorScheme.value]
  
  console.log('Adding data-driven layers, field:', dataDrivenField.value)
  
  // 添加填充图层 - 确保添加在底图之上
  map.addLayer({
    id: 'province-circles',
    type: 'circle',
    source: 'provinces',
    paint: {
      // 使用固定颜色和大小先确保能显示
      'circle-color': '#2563eb',  // 蓝色
      'circle-radius': 25,  // 固定半径25
      'circle-opacity': 0.9,
      'circle-stroke-width': 3,
      'circle-stroke-color': '#ffffff'
    }
  })  // 添加到地图
  
  // 然后立即更新为数据驱动样式
  updateDataDrivenStyle()
  
  // 添加标签图层
  map.addLayer({
    id: 'province-labels',
    type: 'symbol',
    source: 'provinces',
    filter: ['!', ['has', 'point_count']],
    layout: {
      'text-field': ['get', 'name'],
      'text-font': ['Open Sans Regular'],
      'text-size': 12,
      'text-anchor': 'center'
    },
    paint: {
      'text-color': '#333',
      'text-halo-color': '#fff',
      'text-halo-width': 2
    },
    minzoom: 5
  })

  // 添加Popup弹窗
  map.on('click', 'province-circles', (e) => {
    const properties = e.features[0].properties
    const coordinates = e.features[0].geometry.coordinates.slice()
    
    new maplibregl.Popup()
      .setLngLat(coordinates)
      .setHTML(`
        <div style="font-size: 14px;">
          <h3 style="margin: 0 0 10px 0; color: #333;">${properties.name}</h3>
          <p><strong>人口:</strong> ${properties.population}万</p>
          <p><strong>GDP:</strong> ${properties.gdp}亿元</p>
          <p><strong>人口密度:</strong> ${properties.density}人/km²</p>
        </div>
      `)
      .addTo(map)
  })

  // 鼠标悬停效果
  map.on('mouseenter', 'province-circles', () => {
    map.getCanvas().style.cursor = 'pointer'
  })

  map.on('mouseleave', 'province-circles', () => {
    map.getCanvas().style.cursor = ''
  })

  // 更新图例
  updateLegend()
}

// 添加点聚合图层
const addClusterLayer = () => {
  // 聚合圆圈
  map.addLayer({
    id: 'clusters',
    type: 'circle',
    source: 'provinces',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': [
        'step',
        ['get', 'point_count'],
        '#51bbd6',
        10, '#f1f075',
        30, '#f28cb1'
      ],
      'circle-radius': [
        'step',
        ['get', 'point_count'],
        20,
        10, 30,
        30, 40
      ],
      'circle-stroke-width': 2,
      'circle-stroke-color': '#fff'
    }
  })

  // 聚合数量标签
  map.addLayer({
    id: 'cluster-count',
    type: 'symbol',
    source: 'provinces',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 12
    },
    paint: {
      'text-color': '#ffffff'
    }
  })

  // 点击聚合放大
  map.on('click', 'clusters', (e) => {
    const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] })
    const clusterId = features[0].properties.cluster_id
    map.getSource('provinces').getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err) return
      
      map.easeTo({
        center: features[0].geometry.coordinates,
        zoom: zoom
      })
    })
  })

  // 鼠标悬停效果
  map.on('mouseenter', 'clusters', () => {
    map.getCanvas().style.cursor = 'pointer'
  })

  map.on('mouseleave', 'clusters', () => {
    map.getCanvas().style.cursor = ''
  })
}

// 添加3D建筑图层（使用模拟数据）
const add3DBuildings = () => {
  // 创建模拟建筑数据
  const buildingsData = {
    type: 'FeatureCollection',
    features: [
      { type: 'Feature', properties: { height: buildingHeight.value, base: 0 }, geometry: { type: 'Polygon', coordinates: [[[116.39, 39.91], [116.40, 39.91], [116.40, 39.90], [116.39, 39.90], [116.39, 39.91]]] } },
      { type: 'Feature', properties: { height: buildingHeight.value * 1.5, base: 0 }, geometry: { type: 'Polygon', coordinates: [[[116.40, 39.90], [116.41, 39.90], [116.41, 39.89], [116.40, 39.89], [116.40, 39.90]]] } },
      { type: 'Feature', properties: { height: buildingHeight.value * 0.8, base: 0 }, geometry: { type: 'Polygon', coordinates: [[[116.38, 39.90], [116.39, 39.90], [116.39, 39.89], [116.38, 39.89], [116.38, 39.90]]] } },
      { type: 'Feature', properties: { height: buildingHeight.value * 2, base: 0 }, geometry: { type: 'Polygon', coordinates: [[[121.47, 31.23], [121.48, 31.23], [121.48, 31.22], [121.47, 31.22], [121.47, 31.23]]] } },
      { type: 'Feature', properties: { height: buildingHeight.value * 1.3, base: 0 }, geometry: { type: 'Polygon', coordinates: [[[121.48, 31.22], [121.49, 31.22], [121.49, 31.21], [121.48, 31.21], [121.48, 31.22]]] } },
      { type: 'Feature', properties: { height: buildingHeight.value * 1.8, base: 0 }, geometry: { type: 'Polygon', coordinates: [[[113.26, 23.13], [113.27, 23.13], [113.27, 23.12], [113.26, 23.12], [113.26, 23.13]]] } },
      { type: 'Feature', properties: { height: buildingHeight.value * 0.6, base: 0 }, geometry: { type: 'Polygon', coordinates: [[[113.25, 23.12], [113.26, 23.12], [113.26, 23.11], [113.25, 23.11], [113.25, 23.12]]] } },
      { type: 'Feature', properties: { height: buildingHeight.value * 1.2, base: 0 }, geometry: { type: 'Polygon', coordinates: [[[106.54, 29.59], [106.55, 29.59], [106.55, 29.58], [106.54, 29.58], [106.54, 29.59]]] } }
    ]
  }

  // 添加建筑数据源
  map.addSource('buildings', {
    type: 'geojson',
    data: buildingsData
  })

  // 添加3D建筑图层
  map.addLayer({
    id: '3d-buildings',
    type: 'fill-extrusion',
    source: 'buildings',
    paint: {
      'fill-extrusion-color': '#8899aa',
      'fill-extrusion-height': buildingHeight.value,
      'fill-extrusion-base': 0,
      'fill-extrusion-opacity': 0.8
    }
  })
}

// 切换底图样式
const switchStyle = (index) => {
  currentStyleIndex.value = index
  map.setStyle(mapStyles[index].style)
  
  // 重新添加图层（样式切换后会清除所有图层）
  map.once('style.load', () => {
    addGeoJSONSource()
    addDataDrivenLayers()
    if (showCluster.value) {
      addClusterLayer()
    }
    if (show3DBuildings.value) {
      add3DBuildings()
    }
  })
}

// 更新数据驱动样式
const updateDataDrivenStyle = () => {
  if (!map) {
    console.log('Map not ready')
    return
  }
  
  if (!map.getLayer('province-circles')) {
    console.log('Layer province-circles not found, re-adding...')
    // 如果图层不存在，重新添加
    if (!map.getSource('provinces')) {
      addGeoJSONSource()
    }
    addDataDrivenLayers()
    return
  }
  
  console.log('Updating data-driven style for field:', dataDrivenField.value)
  
  const colors = colorSchemes[colorScheme.value]
  
  // 根据不同字段设置不同的阈值
  let colorExpression, radiusExpression
  
  if (dataDrivenField.value === 'gdp') {
    // GDP范围：0-130000亿
    colorExpression = [
      'interpolate', ['linear'], ['get', 'gdp'],
      0, colors[0],
      10000, colors[1],
      30000, colors[2],
      50000, colors[3],
      80000, colors[4],
      100000, colors[5],
      120000, colors[6],
      130000, colors[7]
    ]
    radiusExpression = ['interpolate', ['linear'], ['get', 'gdp'], 0, 6, 10000, 10, 30000, 14, 50000, 18, 80000, 22, 100000, 28, 130000, 35]
  } else if (dataDrivenField.value === 'density') {
    // 人口密度范围：0-20000人/km²
    colorExpression = [
      'interpolate', ['linear'], ['get', 'density'],
      0, colors[0],
      100, colors[1],
      500, colors[2],
      1000, colors[3],
      5000, colors[4],
      10000, colors[5],
      15000, colors[6],
      20000, colors[7]
    ]
    radiusExpression = ['interpolate', ['linear'], ['get', 'density'], 0, 6, 100, 8, 500, 12, 1000, 16, 5000, 22, 10000, 28, 20000, 35]
  } else {
    // 人口范围：0-13000万
    colorExpression = [
      'interpolate', ['linear'], ['get', 'population'],
      0, colors[0],
      1000, colors[1],
      3000, colors[2],
      5000, colors[3],
      7000, colors[4],
      9000, colors[5],
      11000, colors[6],
      13000, colors[7]
    ]
    radiusExpression = ['interpolate', ['linear'], ['get', 'population'], 0, 6, 1000, 10, 3000, 14, 5000, 18, 7000, 22, 9000, 28, 13000, 35]
  }
  
  map.setPaintProperty('province-circles', 'circle-color', colorExpression)
  map.setPaintProperty('province-circles', 'circle-radius', radiusExpression)
  
  // 更新图例
  updateLegend()
}

// 更新建筑高度
const updateBuildingHeight = () => {
  if (map && map.getLayer('3d-buildings')) {
    map.setPaintProperty('3d-buildings', 'fill-extrusion-height', buildingHeight.value)
  }
}

// 切换点聚合
const toggleCluster = () => {
  if (showCluster.value) {
    // 启用聚合：创建带聚合功能的数据源
    // 移除所有旧图层
    if (map.getLayer('province-circles')) {
      map.removeLayer('province-circles')
    }
    if (map.getLayer('province-labels')) {
      map.removeLayer('province-labels')
    }
    if (map.getLayer('cluster-count')) {
      map.removeLayer('cluster-count')
    }
    if (map.getLayer('clusters')) {
      map.removeLayer('clusters')
    }
    if (map.getSource('provinces')) {
      map.removeSource('provinces')
    }
    
    const geojsonData = {
      type: 'FeatureCollection',
      features: Object.entries(provinceData).map(([name, data]) => ({
        type: 'Feature',
        properties: { name, population: data.population, gdp: data.gdp, density: data.density },
        geometry: { type: 'Point', coordinates: getProvinceCenter(name) }
      }))
    }
    
    map.addSource('provinces', { 
      type: 'geojson', 
      data: geojsonData, 
      cluster: true,
      clusterMaxZoom: 8,  // 缩放级别>8时展开
      clusterRadius: 40
    })
    
    // 添加聚合图层（深色聚合点）
    map.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'provinces',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#1e40af',
        'circle-radius': ['interpolate', ['linear'], ['get', 'point_count'], 2, 20, 50, 40]
      }
    })
    
    // 添加聚合数量标签
    map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'provinces',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 14
      },
      paint: {
        'text-color': '#ffffff'
      }
    })
    
    // 添加非聚合的省份点图层（只显示未聚合的点）
    const colors = colorSchemes[colorScheme.value]
    map.addLayer({
      id: 'province-circles',
      type: 'circle',
      source: 'provinces',
      filter: ['!', ['has', 'point_count']],  // 只显示非聚合点
      paint: {
        'circle-color': '#2563eb',
        'circle-radius': 15,
        'circle-opacity': 0.9,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    })
    
  } else {
    // 禁用聚合：移除聚合图层，确保所有省份点始终显示
    if (map.getLayer('cluster-count')) {
      map.removeLayer('cluster-count')
    }
    if (map.getLayer('clusters')) {
      map.removeLayer('clusters')
    }
    if (map.getLayer('province-circles')) {
      map.removeLayer('province-circles')
    }
    if (map.getLayer('province-labels')) {
      map.removeLayer('province-labels')
    }
    if (map.getSource('provinces')) {
      map.removeSource('provinces')
    }
    
    // 创建完全不聚合的数据源
    const geojsonData = {
      type: 'FeatureCollection',
      features: Object.entries(provinceData).map(([name, data]) => ({
        type: 'Feature',
        properties: { name, population: data.population, gdp: data.gdp, density: data.density },
        geometry: { type: 'Point', coordinates: getProvinceCenter(name) }
      }))
    }
    
    // 关键：cluster: false 确保完全不聚合
    map.addSource('provinces', { 
      type: 'geojson', 
      data: geojsonData, 
      cluster: false 
    })
    
    // 添加省份点图层（始终显示，不受缩放级别影响）
    addDataDrivenLayers()
  }
}

// 切换3D建筑
const toggle3DBuildings = () => {
  if (show3DBuildings.value) {
    add3DBuildings()
  } else {
    if (map.getLayer('3d-buildings')) {
      map.removeLayer('3d-buildings')
    }
    if (map.getSource('buildings')) {
      map.removeSource('buildings')
    }
  }
}

// 更新视角
const updateView = () => {
  if (map) {
    map.easeTo({
      pitch: mapPitch.value,
      bearing: mapBearing.value,
      duration: 300
    })
  }
}

// 重置视角
const resetView = () => {
  mapPitch.value = 0
  mapBearing.value = 0
  if (map) {
    map.easeTo({
      pitch: 0,
      bearing: 0,
      duration: 500
    })
  }
}

// 更新配色方案
const updateColorScheme = () => {
  updateDataDrivenStyle()
}

// 更新图例
const updateLegend = () => {
  const colors = colorSchemes[colorScheme.value]
  const unit = getFieldUnit()
  
  legendItems.value = [
    { color: colors[7], label: `> ${getFieldThreshold(7)}${unit}` },
    { color: colors[6], label: `${getFieldThreshold(6)} - ${getFieldThreshold(7)}${unit}` },
    { color: colors[5], label: `${getFieldThreshold(5)} - ${getFieldThreshold(6)}${unit}` },
    { color: colors[4], label: `${getFieldThreshold(4)} - ${getFieldThreshold(5)}${unit}` },
    { color: colors[3], label: `${getFieldThreshold(3)} - ${getFieldThreshold(4)}${unit}` },
    { color: colors[2], label: `${getFieldThreshold(2)} - ${getFieldThreshold(3)}${unit}` },
    { color: colors[1], label: `${getFieldThreshold(1)} - ${getFieldThreshold(2)}${unit}` },
    { color: colors[0], label: `< ${getFieldThreshold(1)}${unit}` }
  ]
}

const getFieldThreshold = (index) => {
  const thresholds = {
    population: [0, 1000, 3000, 5000, 7000, 9000, 11000, 13000],
    gdp: [0, 10000, 30000, 50000, 80000, 100000, 120000, 130000],
    density: [0, 100, 500, 1000, 5000, 10000, 15000, 20000]
  }
  return thresholds[dataDrivenField.value]?.[index] || thresholds.population[index] || '0'
}

const getFieldUnit = () => {
  const units = {
    population: '万',      // 人口单位：万
    gdp: '亿',           // GDP单位：亿元
    density: '人/km²'    // 人口密度单位
  }
  return units[dataDrivenField.value] || ''
}
</script>

<style scoped>
.maplibre-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.maplibre-map {
  width: 100%;
  height: 100%;
  background-color: #1a1a2e;
}

.maplibre-map.dark-theme {
  filter: invert(90%) hue-rotate(180deg) saturate(90%) brightness(90%);
  background-color: #1a1a2e;
}

.control-panel {
  position: absolute;
  top: 20px;
  right: 100px;  /* 移到右侧，给导航控件留出空间 */
  background: white;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  width: 220px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  z-index: 1000;
}

.panel-section {
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.panel-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.panel-section h3 {
  margin: 0 0 6px 0;
  font-size: 12px;
  font-weight: 600;
  color: #333;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.button-group button {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.button-group button:hover {
  background: #f0f0f0;
}

.button-group button.active {
  background: #4a90e2;
  color: white;
  border-color: #4a90e2;
}

.field-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-selector label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  cursor: pointer;
}

.field-selector input[type="radio"] {
  cursor: pointer;
}

.switch-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.switch-label input {
  display: none;
}

.switch-slider {
  width: 40px;
  height: 20px;
  background: #ccc;
  border-radius: 10px;
  position: relative;
  margin-right: 10px;
  transition: background 0.3s;
}

.switch-slider::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: transform 0.3s;
}

.switch-label input:checked + .switch-slider {
  background: #4a90e2;
}

.switch-label input:checked + .switch-slider::after {
  transform: translateX(20px);
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.slider-container input[type="range"] {
  flex: 1;
  cursor: pointer;
}

.color-scheme-select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
}

.reset-btn {
  width: 100%;
  padding: 8px 12px;
  margin-top: 10px;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.2s;
}

.reset-btn:hover {
  background: #3a7bc8;
}

.info-section {
  background: #f9f9f9;
  margin: 0;
  margin-top: 10px;
  padding: 10px;
  border-radius: 4px;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
}

.legend-color {
  width: 20px;
  height: 14px;
  border-radius: 2px;
  border: 1px solid #ddd;
}

.legend-label {
  color: #666;
}

.map-info {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  gap: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.map-info span {
  color: #333;
}
</style>
