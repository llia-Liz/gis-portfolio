/**
 * Pinia 地图状态管理 Store
 * 管理全局地图与图层状态
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMapStore = defineStore('map', () => {
  // ==================== 地图状态 ====================
  // 当前缩放级别
  const zoomLevel = ref(10)
  
  // 地图中心坐标 [lat, lng]
  const mapCenter = ref([39.90, 116.40])
  
  // 当前活动工具
  const activeTool = ref('pan')
  
  // 当前鼠标坐标
  const mouseCoordinates = ref({ longitude: 0, latitude: 0 })
  
  // 主题模式
  const isDarkTheme = ref(false)
  
  // ==================== 图层状态 ====================
  // 图层列表
  const layers = ref([
    { id: 'base', name: '基础底图', type: 'tile', visible: true, disabled: true, selected: false },
    { id: 'roads', name: '道路图层', type: 'line', visible: true, disabled: false, selected: false },
    { id: 'buildings', name: '建筑物', type: 'polygon', visible: false, disabled: false, selected: false },
    { id: 'landuse', name: '土地利用', type: 'polygon', visible: true, disabled: false, selected: false },
    { id: 'water', name: '水系', type: 'polygon', visible: true, disabled: false, selected: false },
    { id: 'poi', name: '兴趣点', type: 'point', visible: true, disabled: false, selected: false },
    { id: 'admin', name: '行政区划', type: 'polygon', visible: false, disabled: false, selected: false }
  ])
  
  // ==================== 计算属性 ====================
  // 可见图层数量
  const visibleLayerCount = computed(() => {
    return layers.value.filter(layer => layer.visible).length
  })
  
  // 比例尺
  const scaleRatio = computed(() => {
    return Math.pow(2, 18 - zoomLevel.value)
  })
  
  // 当前工具标签
  const currentToolLabel = computed(() => {
    const toolLabels = {
      pan: '平移',
      zoom: '缩放',
      select: '选择',
      'draw-point': '绘制点',
      'draw-line': '绘制线',
      'draw-polygon': '绘制多边形',
      delete: '删除',
      distance: '距离测量',
      area: '面积测量',
      angle: '角度测量'
    }
    return toolLabels[activeTool.value] || ''
  })
  
  // ==================== 地图操作 ====================
  // 设置缩放级别
  const setZoom = (zoom) => {
    zoomLevel.value = Math.max(1, Math.min(18, zoom))
  }
  
  // 放大
  const zoomIn = () => {
    setZoom(zoomLevel.value + 1)
  }
  
  // 缩小
  const zoomOut = () => {
    setZoom(zoomLevel.value - 1)
  }
  
  // 设置地图中心
  const setCenter = (center) => {
    mapCenter.value = center
  }
  
  // 复位视图
  const resetView = () => {
    zoomLevel.value = 10
    mapCenter.value = [39.90, 116.40]
  }
  
  // 更新鼠标坐标
  const updateMouseCoordinates = (coords) => {
    mouseCoordinates.value = coords
  }
  
  // 设置活动工具
  const setActiveTool = (toolId) => {
    activeTool.value = toolId
  }
  
  // ==================== 图层操作 ====================
  // 切换图层可见性
  const toggleLayerVisibility = (layerId) => {
    const layer = layers.value.find(l => l.id === layerId)
    if (layer && !layer.disabled) {
      layer.visible = !layer.visible
    }
  }
  
  // 设置图层可见性
  const setLayerVisibility = (layerId, visible) => {
    const layer = layers.value.find(l => l.id === layerId)
    if (layer && !layer.disabled) {
      layer.visible = visible
    }
  }
  
  // 选择图层
  const selectLayer = (layerId) => {
    layers.value.forEach(l => {
      l.selected = l.id === layerId
    })
  }
  
  // 全部显示
  const showAllLayers = () => {
    layers.value.forEach(l => {
      if (!l.disabled) l.visible = true
    })
  }
  
  // 全部隐藏
  const hideAllLayers = () => {
    layers.value.forEach(l => {
      if (!l.disabled) l.visible = false
    })
  }
  
  // 反选图层
  const invertLayerVisibility = () => {
    layers.value.forEach(l => {
      if (!l.disabled) l.visible = !l.visible
    })
  }
  
  // 添加图层
  const addLayer = (layer) => {
    layers.value.push({
      id: layer.id || crypto.randomUUID(),
      name: layer.name || '未命名图层',
      type: layer.type || 'vector',
      visible: layer.visible !== undefined ? layer.visible : true,
      disabled: layer.disabled || false,
      selected: false
    })
  }
  
  // 删除图层
  const removeLayer = (layerId) => {
    const index = layers.value.findIndex(l => l.id === layerId)
    if (index > -1) {
      layers.value.splice(index, 1)
    }
  }
  
  // 搜索图层
  const searchLayers = (query) => {
    if (!query.trim()) return layers.value
    const lowerQuery = query.toLowerCase()
    return layers.value.filter(layer => 
      layer.name.toLowerCase().includes(lowerQuery) ||
      layer.type.toLowerCase().includes(lowerQuery)
    )
  }
  
  // ==================== 主题操作 ====================
  // 切换主题
  const toggleTheme = () => {
    isDarkTheme.value = !isDarkTheme.value
    document.documentElement.setAttribute('data-theme', isDarkTheme.value ? 'dark' : 'light')
    localStorage.setItem('theme', isDarkTheme.value ? 'dark' : 'light')
  }
  
  // 设置主题
  const setTheme = (dark) => {
    isDarkTheme.value = dark
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }
  
  // ==================== 初始化 ====================
  // 从本地存储恢复状态
  const initFromStorage = () => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme !== null) {
      setTheme(savedTheme === 'dark')
    }
  }
  
  return {
    // 状态
    zoomLevel,
    mapCenter,
    activeTool,
    mouseCoordinates,
    isDarkTheme,
    layers,
    
    // 计算属性
    visibleLayerCount,
    scaleRatio,
    currentToolLabel,
    
    // 地图操作
    setZoom,
    zoomIn,
    zoomOut,
    setCenter,
    resetView,
    updateMouseCoordinates,
    setActiveTool,
    
    // 图层操作
    toggleLayerVisibility,
    setLayerVisibility,
    selectLayer,
    showAllLayers,
    hideAllLayers,
    invertLayerVisibility,
    addLayer,
    removeLayer,
    searchLayers,
    
    // 主题操作
    toggleTheme,
    setTheme,
    initFromStorage
  }
}, {
  // Pinia 持久化配置
  persist: {
    key: 'gis-map-store',
    storage: localStorage,
    paths: ['zoomLevel', 'mapCenter', 'activeTool', 'isDarkTheme', 'layers']
  }
})