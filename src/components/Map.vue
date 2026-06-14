<template>
  <div class="map-wrapper">
    <div ref="mapContainer" class="leaflet-map"></div>
    
    <!-- 底图切换控件 -->
    <div class="basemap-switcher">
      <button 
        v-for="(layer, key) in basemapLayers" 
        :key="key"
        @click="switchBasemap(key)"
        :class="{ active: currentBasemap === key }"
        :title="layer.name"
      >
        <span class="layer-icon">{{ layer.icon }}</span>
        <span class="layer-name">{{ layer.name }}</span>
      </button>
    </div>
    
    <!-- 地图书签面板 -->
    <div v-if="showBookmarks" class="bookmarks-panel">
      <div class="bookmarks-header">
        <span>📍 地图书签与视角</span>
        <button @click="showBookmarks = false" class="close-btn">×</button>
      </div>
      
      <!-- 点位书签 -->
      <div class="bookmarks-section">
        <div class="section-header">
          <span class="section-title">📍 点位书签</span>
          <span class="section-count">{{ pointBookmarks.length }}</span>
        </div>
        <div class="bookmarks-list">
          <div 
            v-for="bookmark in pointBookmarks" 
            :key="bookmark.id"
            class="bookmark-item"
          >
            <div class="bookmark-info" @click="goToPointBookmark(bookmark)">
              <span class="bookmark-icon">{{ bookmark.icon || '📍' }}</span>
              <div>
                <span class="bookmark-name">{{ bookmark.name }}</span>
                <span class="bookmark-coords">{{ formatCoords(bookmark.center) }}</span>
              </div>
            </div>
            <div class="bookmark-actions">
              <button @click.stop="editBookmark(bookmark)" title="编辑">✏️</button>
              <button @click.stop="deleteBookmark(bookmark.id)" title="删除">🗑️</button>
            </div>
          </div>
          <div v-if="pointBookmarks.length === 0" class="empty-bookmarks">暂无点位书签</div>
        </div>
      </div>
      
      <!-- 视角保存 -->
      <div class="bookmarks-section">
        <div class="section-header">
          <span class="section-title">📡 视角保存</span>
          <span class="section-count">{{ viewBookmarks.length }}</span>
        </div>
        <div class="bookmarks-list">
          <div 
            v-for="bookmark in viewBookmarks" 
            :key="bookmark.id"
            class="bookmark-item"
          >
            <div class="bookmark-info" @click="goToViewBookmark(bookmark)">
              <span class="bookmark-icon">📡</span>
              <div>
                <span class="bookmark-name">{{ bookmark.name }}</span>
                <span class="bookmark-coords">{{ formatCoords(bookmark.center) }} · {{ bookmark.zoom }}级</span>
              </div>
            </div>
            <div class="bookmark-actions">
              <button @click.stop="editBookmark(bookmark)" title="编辑">✏️</button>
              <button @click.stop="deleteBookmark(bookmark.id)" title="删除">🗑️</button>
            </div>
          </div>
          <div v-if="viewBookmarks.length === 0" class="empty-bookmarks">暂无视角保存</div>
        </div>
      </div>
      
      <div class="bookmarks-actions-bottom">
        <button @click="addCurrentPointAsBookmark" class="add-btn">
          + 添加当前点位
        </button>
        <button @click="addCurrentViewAsBookmark" class="add-btn secondary">
          + 添加当前视角
        </button>
      </div>
    </div>
    
    <!-- 编辑书签弹窗 -->
    <div v-if="editingBookmark" class="edit-modal">
      <div class="modal-content">
        <h3>编辑书签</h3>
        <input 
          v-model="editingBookmark.name" 
          type="text" 
          placeholder="输入书签名称"
          class="edit-input"
        />
        <div class="modal-actions">
          <button @click="saveBookmark" class="save-btn">保存</button>
          <button @click="cancelEdit" class="cancel-btn">取消</button>
        </div>
      </div>
    </div>
    
    <!-- 测量结果显示 -->
    <div v-if="distanceMeasure.active" class="measure-result">
      <div class="measure-info">
        <span>📏 测量中 - 点击地图绘制线段</span>
      </div>
      <div class="measure-distance">
        总距离: {{ distanceMeasure.totalDistance.toFixed(2) }} km
      </div>
      <button @click="clearMeasure" class="clear-btn">清除测量</button>
    </div>
    

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  zoom: {
    type: Number,
    default: 10
  },
  center: {
    type: Array,
    default: () => [39.90, 116.40]
  }
})

const emit = defineEmits(['zoom-change', 'move-end', 'mouse-move'])

const mapContainer = ref(null)
const showBookmarks = ref(false)
const currentBasemap = ref('amap')
const editingBookmark = ref(null)
let map = null
let measureLayerGroup = null
let distanceMeasure = ref({
  active: false,
  points: [],
  totalDistance: 0
})

// 底图配置
const basemapLayers = {
  tiandituImagery: { name: '天地图影像', icon: '🗺️', layer: null },
  tiandituVector: { name: '天地图矢量', icon: '📐', layer: null },
  osm: { name: 'OpenStreetMap', icon: '🌍', layer: null },
  amap: { name: '高德地图', icon: '📍', layer: null }
}

// 点位书签（带图标）
const pointBookmarks = ref([
  { id: 1, name: '北京天安门', center: [39.9042, 116.4074], zoom: 17, icon: '🏯', type: 'point' },
  { id: 2, name: '上海外滩', center: [31.2304, 121.4737], zoom: 16, icon: '🌃', type: 'point' },
  { id: 3, name: '广州塔', center: [23.1291, 113.2644], zoom: 17, icon: '🗼', type: 'point' },
  { id: 4, name: '杭州西湖', center: [30.2741, 120.1552], zoom: 15, icon: '🌊', type: 'point' },
  { id: 5, name: '成都天府广场', center: [30.6631, 104.0668], zoom: 16, icon: '🏛️', type: 'point' },
  { id: 6, name: '西安兵马俑', center: [34.3853, 109.2786], zoom: 16, icon: '🗿', type: 'point' },
  { id: 7, name: '武汉黄鹤楼', center: [30.5431, 114.3184], zoom: 16, icon: '🏮', type: 'point' },
  { id: 8, name: '深圳地王大厦', center: [22.5431, 114.0579], zoom: 16, icon: '🏢', type: 'point' }
])

// 视角保存（无图标，仅保存视图状态）
const viewBookmarks = ref([
  { id: 101, name: '北京全景', center: [39.9042, 116.4074], zoom: 11, type: 'view' },
  { id: 102, name: '上海全景', center: [31.2304, 121.4737], zoom: 11, type: 'view' }
])

// 所有书签
const bookmarks = computed(() => [...pointBookmarks.value, ...viewBookmarks.value])

// 扩展 POI 图标类型
const poiIcons = {
  landmark: L.icon({
    iconUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FF6B6B"%3E%3Cpath d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/%3E%3C/svg%3E',
    iconSize: [24, 24],
    iconAnchor: [12, 24]
  }),
  restaurant: L.icon({
    iconUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234ECDC4"%3E%3Cpath d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/%3E%3C/svg%3E',
    iconSize: [24, 24],
    iconAnchor: [12, 24]
  }),
  hotel: L.icon({
    iconUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2345B7D1"%3E%3Cpath d="M7 13h2v5H7v-5zm4-3h2v8h-2V10zm4-3h2v11h-2V7z"/%3E%3C/svg%3E',
    iconSize: [24, 24],
    iconAnchor: [12, 24]
  }),
  transportation: L.icon({
    iconUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2396CEB4"%3E%3Cpath d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/%3E%3C/svg%3E',
    iconSize: [24, 24],
    iconAnchor: [12, 24]
  }),
  shopping: L.icon({
    iconUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23F39C12"%3E%3Cpath d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM9 4h6v2H9zM3 20h18v-2H3V7l4-4h10l4 4v11H3z"/%3E%3C/svg%3E',
    iconSize: [24, 24],
    iconAnchor: [12, 24]
  }),
  education: L.icon({
    iconUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%239B59B6"%3E%3Cpath d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/%3E%3C/svg%3E',
    iconSize: [24, 24],
    iconAnchor: [12, 24]
  }),
  medical: L.icon({
    iconUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23E74C3C"%3E%3Cpath d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/%3E%3C/svg%3E',
    iconSize: [24, 24],
    iconAnchor: [12, 24]
  }),
  entertainment: L.icon({
    iconUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%231ABC9C"%3E%3Cpath d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/%3E%3C/svg%3E',
    iconSize: [24, 24],
    iconAnchor: [12, 24]
  }),
  park: L.icon({
    iconUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2327AE60"%3E%3Cpath d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z"/%3E%3C/svg%3E',
    iconSize: [24, 24],
    iconAnchor: [12, 24]
  }),
  bank: L.icon({
    iconUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%233498DB"%3E%3Cpath d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm11 12H6v-2h14v2zm0-4H6v-2h14v2zm-7 5c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/%3E%3C/svg%3E',
    iconSize: [24, 24],
    iconAnchor: [12, 24]
  })
}

// 扩展 POI 数据（使用实际准确坐标）
const poiData = [
  // 地标
  { id: 1, type: 'landmark', name: '故宫博物院', lat: 39.9163, lng: 116.3972, desc: '世界上现存规模最大、保存最为完整的木质结构古建筑群' },
  { id: 2, type: 'landmark', name: '天坛', lat: 39.8822, lng: 116.4066, desc: '明清两代皇帝祭天祈谷的场所' },
  { id: 3, type: 'landmark', name: '颐和园', lat: 39.9999, lng: 116.2755, desc: '中国现存规模最大、保存最完整的皇家园林' },
  { id: 4, type: 'landmark', name: '圆明园', lat: 40.0047, lng: 116.2772, desc: '清代著名的皇家园林，被誉为万园之园' },
  { id: 5, type: 'landmark', name: '天安门广场', lat: 39.9042, lng: 116.4074, desc: '世界上最大的城市广场' },
  // 餐厅（王府井区域）
  { id: 6, type: 'restaurant', name: '四季民福王府井店', lat: 39.9173, lng: 116.4177, desc: '北京著名烤鸭店，人气火爆' },
  { id: 7, type: 'restaurant', name: '大董王府井店', lat: 39.9156, lng: 116.4189, desc: '高端烤鸭餐厅，环境优雅' },
  { id: 8, type: 'restaurant', name: '东来顺王府井店', lat: 39.9180, lng: 116.4220, desc: '百年老字号涮羊肉' },
  // 酒店
  { id: 9, type: 'hotel', name: '北京饭店', lat: 39.9158, lng: 116.4011, desc: '百年历史的豪华酒店' },
  { id: 10, type: 'hotel', name: '王府井希尔顿', lat: 39.9157, lng: 116.4210, desc: '国际连锁五星级酒店' },
  { id: 11, type: 'hotel', name: '国贸大酒店', lat: 39.9106, lng: 116.4753, desc: 'CBD核心区超五星级酒店' },
  // 交通
  { id: 12, type: 'transportation', name: '天安门地铁站', lat: 39.9069, lng: 116.4039, desc: '1号线、2号线换乘站' },
  { id: 13, type: 'transportation', name: '北京站', lat: 39.9022, lng: 116.4261, desc: '北京主要火车站之一' },
  { id: 14, type: 'transportation', name: '首都国际机场', lat: 40.0799, lng: 116.5891, desc: '中国规模最大的国际机场' },
  // 购物
  { id: 15, type: 'shopping', name: '王府井百货', lat: 39.9145, lng: 116.4210, desc: '北京著名商业街购物中心' },
  { id: 16, type: 'shopping', name: '国贸商城', lat: 39.9102, lng: 116.4748, desc: '高端购物中心' },
  { id: 17, type: 'shopping', name: '西单大悦城', lat: 39.9148, lng: 116.3705, desc: '年轻人喜爱的时尚购物中心' },
  // 教育
  { id: 18, type: 'education', name: '北京大学', lat: 39.9999, lng: 116.3175, desc: '中国著名高等学府' },
  { id: 19, type: 'education', name: '清华大学', lat: 40.0068, lng: 116.3083, desc: '中国顶尖理工科大学' },
  { id: 20, type: 'education', name: '北京师范大学', lat: 39.9722, lng: 116.3642, desc: '著名师范类大学' },
  // 医疗
  { id: 21, type: 'medical', name: '协和医院东单院区', lat: 39.9197, lng: 116.4145, desc: '中国顶尖综合性医院' },
  { id: 22, type: 'medical', name: '北京医院', lat: 39.9220, lng: 116.4100, desc: '大型综合性三甲医院' },
  // 娱乐
  { id: 23, type: 'entertainment', name: '国家大剧院', lat: 39.9059, lng: 116.3940, desc: '中国国家表演艺术中心' },
  { id: 24, type: 'entertainment', name: '工人体育场', lat: 39.9387, lng: 116.4415, desc: '北京大型体育场馆' },
  // 公园
  { id: 25, type: 'park', name: '景山公园', lat: 39.9208, lng: 116.4080, desc: '俯瞰故宫全景的最佳地点' },
  { id: 26, type: 'park', name: '北海公园', lat: 39.9260, lng: 116.3885, desc: '历史悠久的皇家园林' },
  // 银行（西交民巷区域，远离故宫）
  { id: 27, type: 'bank', name: '中国人民银行总行', lat: 39.9167, lng: 116.3860, desc: '中国中央银行' },
  { id: 28, type: 'bank', name: '中国银行总行', lat: 39.9185, lng: 116.4085, desc: '中国银行总部' }
]

const formatCoords = (coords) => {
  return `${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`
}

// 切换底图
const switchBasemap = (key) => {
  if (currentBasemap.value === key) return
  
  // 移除当前底图
  if (basemapLayers[currentBasemap.value].layer) {
    map.removeLayer(basemapLayers[currentBasemap.value].layer)
  }
  
  // 添加新底图
  if (basemapLayers[key].layer) {
    map.addLayer(basemapLayers[key].layer)
  }
  
  currentBasemap.value = key
}

// 跳转到点位书签（带图标标记）
const goToPointBookmark = (bookmark) => {
  if (map) {
    map.setView(bookmark.center, bookmark.zoom)
    
    // 在书签位置添加临时标记
    const marker = L.marker(bookmark.center, {
      icon: L.divIcon({
        className: 'bookmark-marker',
        html: `<div style="font-size: 24px;">${bookmark.icon || '📍'}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      })
    }).addTo(map)
    
    // 3秒后自动移除标记
    setTimeout(() => {
      if (marker) {
        map.removeLayer(marker)
      }
    }, 3000)
  }
  showBookmarks.value = false
}

// 跳转到视角书签
const goToViewBookmark = (bookmark) => {
  if (map) {
    map.setView(bookmark.center, bookmark.zoom)
  }
  showBookmarks.value = false
}

// 添加当前点位为书签
const addCurrentPointAsBookmark = () => {
  if (map) {
    const center = map.getCenter()
    const zoom = map.getZoom()
    const newBookmark = {
      id: Date.now(),
      name: `点位 ${pointBookmarks.value.length + 1}`,
      center: [center.lat, center.lng],
      zoom: Math.max(zoom, 15),
      icon: '📍',
      type: 'point'
    }
    pointBookmarks.value.push(newBookmark)
  }
}

// 添加当前视角为书签
const addCurrentViewAsBookmark = () => {
  if (map) {
    const center = map.getCenter()
    const zoom = map.getZoom()
    const newBookmark = {
      id: Date.now(),
      name: `视角 ${viewBookmarks.value.length + 1}`,
      center: [center.lat, center.lng],
      zoom: zoom,
      type: 'view'
    }
    viewBookmarks.value.push(newBookmark)
  }
}

// 编辑书签
const editBookmark = (bookmark) => {
  editingBookmark.value = { ...bookmark }
}

// 保存书签
const saveBookmark = () => {
  if (editingBookmark.value) {
    const isPoint = editingBookmark.value.type === 'point'
    const list = isPoint ? pointBookmarks.value : viewBookmarks.value
    const index = list.findIndex(b => b.id === editingBookmark.value.id)
    if (index !== -1) {
      list[index] = { ...editingBookmark.value }
    }
  }
  editingBookmark.value = null
}

// 取消编辑
const cancelEdit = () => {
  editingBookmark.value = null
}

// 删除书签
const deleteBookmark = (id) => {
  pointBookmarks.value = pointBookmarks.value.filter(b => b.id !== id)
  viewBookmarks.value = viewBookmarks.value.filter(b => b.id !== id)
}

const toggleBookmarks = () => {
  showBookmarks.value = !showBookmarks.value
}

// 开始距离测量
const startDistanceMeasure = () => {
  distanceMeasure.value = {
    active: true,
    points: [],
    totalDistance: 0
  }
  
  // 创建测量图层组
  measureLayerGroup = L.layerGroup().addTo(map)
  
  map.on('click', handleMeasureClick)
  map.on('mousemove', handleMeasureMouseMove)
}

// 处理测量点击
const handleMeasureClick = (e) => {
  const points = distanceMeasure.value.points
  points.push(e.latlng)
  
  // 添加点标记
  L.circleMarker(e.latlng, {
    radius: 6,
    color: '#FF6B6B',
    fillColor: '#FF6B6B',
    fillOpacity: 1
  }).addTo(measureLayerGroup)
  
  if (points.length >= 2) {
    const lastPoint = points[points.length - 2]
    const distance = map.distance(lastPoint, e.latlng) / 1000
    distanceMeasure.value.totalDistance += distance
    
    // 绘制线段
    L.polyline([lastPoint, e.latlng], { 
      color: '#FF6B6B', 
      weight: 3,
      dashArray: '5,5'
    }).addTo(measureLayerGroup)
  }
}

// 处理鼠标移动（显示临时线段）
const handleMeasureMouseMove = (e) => {
  const points = distanceMeasure.value.points
  if (points.length > 0) {
    // 清除临时图层
    if (measureLayerGroup) {
      measureLayerGroup.eachLayer((layer) => {
        if (layer.options && layer.options.temporary) {
          measureLayerGroup.removeLayer(layer)
        }
      })
    }
    
    // 添加临时线段
    L.polyline([points[points.length - 1], e.latlng], { 
      color: '#FF6B6B', 
      weight: 3,
      dashArray: '5,5',
      opacity: 0.5,
      temporary: true
    }).addTo(measureLayerGroup)
  }
}

// 清除测量
const clearMeasure = () => {
  distanceMeasure.value.active = false
  distanceMeasure.value.points = []
  distanceMeasure.value.totalDistance = 0
  
  map.off('click', handleMeasureClick)
  map.off('mousemove', handleMeasureMouseMove)
  
  if (measureLayerGroup) {
    map.removeLayer(measureLayerGroup)
    measureLayerGroup = null
  }
}

const stopDistanceMeasure = () => {
  clearMeasure()
}

onMounted(() => {
  const container = mapContainer.value
  if (container) {
    const parent = container.parentElement
    if (parent) {
      container.style.width = parent.clientWidth + 'px'
      container.style.height = parent.clientHeight + 'px'
    }
  }
  
  // 初始化地图
  map = L.map(mapContainer.value, {
    center: props.center,
    zoom: props.zoom,
    attributionControl: true
  })

  // 天地图影像底图（使用高德影像服务，GCJ-02坐标系）
  basemapLayers.tiandituImagery.layer = L.tileLayer('https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}', {
    attribution: '© 天地图影像',
    subdomains: ['1', '2', '3', '4'],
    maxZoom: 18
  })

  // 天地图矢量底图（使用高德浅色矢量，GCJ-02坐标系）
  basemapLayers.tiandituVector.layer = L.tileLayer('https://webrd{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}', {
    attribution: '© 天地图矢量',
    subdomains: ['01', '02', '03', '04'],
    maxZoom: 18
  })

  // OSM 底图（使用高德卫星混合风格，GCJ-02坐标系）
  basemapLayers.osm.layer = L.tileLayer('https://webst0{s}.is.autonavi.com/appmaptile?style=7&x={x}&y={y}&z={z}', {
    attribution: '© OpenStreetMap contributors',
    subdomains: ['1', '2', '3', '4'],
    maxZoom: 18
  })

  // 高德地图底图（标准地图风格，GCJ-02坐标系）
  basemapLayers.amap.layer = L.tileLayer('https://webrd{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
    attribution: '© 高德地图',
    subdomains: ['01', '02', '03', '04'],
    maxZoom: 18
  })

  // 默认加载高德地图
  basemapLayers.amap.layer.addTo(map)

  // 添加比例尺控件
  L.control.scale({
    imperial: false,
    metric: true,
    position: 'bottomleft'
  }).addTo(map)

  // 添加缩放控件
  L.control.zoom({
    position: 'bottomright'
  }).addTo(map)

  // 添加 POI 标注
  poiData.forEach(poi => {
    const marker = L.marker([poi.lat, poi.lng], {
      icon: poiIcons[poi.type]
    }).addTo(map)
    
    marker.bindTooltip(poi.name, {
      permanent: false,
      direction: 'top'
    })
    
    marker.bindPopup(`
      <div style="padding: 8px; min-width: 180px;">
        <h4 style="margin: 0 0 8px 0; color: #333;">${poi.name}</h4>
        <p style="margin: 0; font-size: 12px; color: #666;">${poi.desc}</p>
      </div>
    `)
  })

  // 监听地图事件
  map.on('zoomend', () => {
    emit('zoom-change', map.getZoom())
  })

  map.on('moveend', () => {
    const center = map.getCenter()
    emit('move-end', [center.lat, center.lng])
  })

  map.on('mousemove', (e) => {
    emit('mouse-move', {
      longitude: e.latlng.lng,
      latitude: e.latlng.lat
    })
  })

  window.addEventListener('resize', handleResize)
  setTimeout(() => {
    if (map) {
      map.invalidateSize()
    }
  }, 100)
})

const handleResize = () => {
  if (map) {
    map.invalidateSize()
  }
}

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (map) {
    map.remove()
    map = null
  }
})

watch(() => props.zoom, (newZoom) => {
  if (map && map.getZoom() !== newZoom) {
    map.setZoom(newZoom)
  }
})

watch(() => props.center, (newCenter) => {
  if (map) {
    map.setView(newCenter, map.getZoom())
  }
}, { deep: true })

defineExpose({
  zoomIn: () => { if (map) map.zoomIn() },
  zoomOut: () => { if (map) map.zoomOut() },
  setView: (center, zoom) => { if (map) map.setView(center, zoom) },
  getZoom: () => map ? map.getZoom() : props.zoom,
  getCenter: () => map ? map.getCenter() : props.center,
  toggleBookmarks,
  startDistanceMeasure,
  stopDistanceMeasure
})
</script>

<style scoped>
.map-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
}

.leaflet-map {
  width: 100%;
  height: 100%;
}

/* 底图切换控件 */
.basemap-switcher {
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  gap: 8px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.basemap-switcher button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
  color: #666;
}

.basemap-switcher button:hover {
  background: #f0f0f0;
}

.basemap-switcher button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.layer-icon {
  font-size: 16px;
}

.layer-name {
  font-weight: 500;
}

/* 地图书签面板 */
.bookmarks-panel {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 300px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}

.bookmarks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 22px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  opacity: 0.8;
}

.close-btn:hover {
  opacity: 1;
}

/* 书签分组 */
.bookmarks-section {
  border-bottom: 1px solid #eee;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: #f8f9fa;
  font-size: 12px;
  font-weight: 600;
  color: #666;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
}

.section-count {
  background: #e0e0e0;
  color: #666;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
}

.bookmarks-list {
  max-height: 180px;
  overflow-y: auto;
}

.bookmark-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.bookmark-item:hover {
  background-color: #f8f9fa;
}

.bookmark-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.bookmark-icon {
  font-size: 18px;
}

.bookmark-info div {
  flex: 1;
  min-width: 0;
}

.bookmark-name {
  display: block;
  font-weight: 500;
  color: #333;
  font-size: 13px;
}

.bookmark-coords {
  display: block;
  font-size: 11px;
  color: #999;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bookmark-actions {
  display: flex;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.2s;
}

.bookmark-item:hover .bookmark-actions {
  opacity: 1;
}

.bookmark-actions button {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  font-size: 14px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.bookmark-actions button:hover {
  opacity: 1;
}

.empty-bookmarks {
  padding: 16px;
  text-align: center;
  color: #999;
  font-size: 12px;
}

/* 底部操作按钮 */
.bookmarks-actions-bottom {
  display: flex;
  gap: 8px;
  padding: 10px 16px;
  background: #f8f9fa;
}

.add-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 6px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: opacity 0.2s;
}

.add-btn:hover {
  opacity: 0.9;
}

.add-btn.secondary {
  background: #e0e0e0;
  color: #666;
}

/* 编辑弹窗 */
.edit-modal {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 20px;
  width: 280px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #333;
}

.edit-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
  margin-bottom: 16px;
}

.modal-actions {
  display: flex;
  gap: 10px;
}

.save-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 6px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.cancel-btn {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  color: #666;
  cursor: pointer;
  font-size: 14px;
}

/* 测量结果显示 */
.measure-result {
  position: absolute;
  bottom: 80px;
  left: 16px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.measure-info {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.measure-distance {
  font-size: 16px;
  font-weight: 600;
  color: #FF6B6B;
  margin-bottom: 8px;
}

.clear-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  background: #f0f0f0;
  color: #666;
  cursor: pointer;
  font-size: 12px;
}

.clear-btn:hover {
  background: #e0e0e0;
}


</style>