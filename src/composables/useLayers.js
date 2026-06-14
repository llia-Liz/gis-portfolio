/**
 * Composable: useLayers
 * 图层管理逻辑复用
 * 提供图层搜索、过滤、统计等可复用功能
 */
import { ref, computed, watch } from 'vue'
import { useMapStore } from '../stores/mapStore'

export function useLayers() {
  const mapStore = useMapStore()
  
  // 搜索关键词
  const searchQuery = ref('')
  
  // 图层类型过滤
  const selectedType = ref('all')
  
  // 计算属性：过滤后的图层列表
  const filteredLayers = computed(() => {
    let result = [...mapStore.layers]
    
    // 类型过滤
    if (selectedType.value !== 'all') {
      result = result.filter(layer => layer.type === selectedType.value)
    }
    
    // 搜索过滤
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(layer =>
        layer.name.toLowerCase().includes(query) ||
        layer.type.toLowerCase().includes(query)
      )
    }
    
    return result
  })
  
  // 计算属性：图层统计信息
  const layerStats = computed(() => {
    const total = mapStore.layers.length
    const visible = mapStore.layers.filter(l => l.visible).length
    const byType = mapStore.layers.reduce((acc, layer) => {
      acc[layer.type] = (acc[layer.type] || 0) + 1
      return acc
    }, {})
    
    return {
      total,
      visible,
      hidden: total - visible,
      byType
    }
  })
  
  // 计算属性：所有图层类型
  const allTypes = computed(() => {
    const types = new Set(mapStore.layers.map(l => l.type))
    return [{ id: 'all', label: '全部' }, ...Array.from(types).map(t => ({ id: t, label: formatType(t) }))]
  })
  
  // 方法：切换图层可见性
  const toggleVisibility = (layerId) => {
    mapStore.toggleLayerVisibility(layerId)
  }
  
  // 方法：选择图层
  const selectLayer = (layerId) => {
    mapStore.selectLayer(layerId)
  }
  
  // 方法：批量操作
  const batchToggle = (action) => {
    switch (action) {
      case 'show-all':
        mapStore.showAllLayers()
        break
      case 'hide-all':
        mapStore.hideAllLayers()
        break
      case 'invert':
        mapStore.invertLayerVisibility()
        break
      default:
        break
    }
  }
  
  // 方法：添加图层
  const addNewLayer = (options) => {
    mapStore.addLayer(options)
  }
  
  // 方法：删除图层
  const deleteLayer = (layerId) => {
    mapStore.removeLayer(layerId)
  }
  
  // 方法：清空搜索
  const clearSearch = () => {
    searchQuery.value = ''
    selectedType.value = 'all'
  }
  
  // 监听搜索变化（可选）
  watch(searchQuery, (newQuery) => {
    // 可以在这里添加搜索日志或其他副作用
    console.log('搜索关键词变化:', newQuery)
  })
  
  return {
    // 状态
    searchQuery,
    selectedType,
    
    // 计算属性
    filteredLayers,
    layerStats,
    allTypes,
    
    // 方法
    toggleVisibility,
    selectLayer,
    batchToggle,
    addNewLayer,
    deleteLayer,
    clearSearch
  }
}

/**
 * 格式化图层类型显示名称
 */
function formatType(type) {
  const typeMap = {
    'tile': '瓦片',
    'vector': '矢量',
    'point': '点',
    'line': '线',
    'polygon': '多边形',
    'raster': '栅格'
  }
  return typeMap[type] || type
}