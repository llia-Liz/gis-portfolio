<template>
  <div class="coordinate-display">
    <div class="coord-item">
      <span class="coord-label">经度:</span>
      <span class="coord-value">{{ formattedLongitude }}</span>
    </div>
    <div class="coord-item">
      <span class="coord-label">纬度:</span>
      <span class="coord-value">{{ formattedLatitude }}</span>
    </div>
    <div class="coord-item coord-format">
      <button 
        class="format-btn" 
        :class="{ active: format === 'DD' }"
        @click="setFormat('DD')"
      >
        度
      </button>
      <button 
        class="format-btn" 
        :class="{ active: format === 'DMS' }"
        @click="setFormat('DMS')"
      >
        度分秒
      </button>
    </div>
  </div>
</template>

<script setup>
/**
 * 坐标显示组件
 * 功能：实时显示鼠标在地图上的经纬度坐标
 * 使用组合式 API (Composition API) 实现
 */
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { formatCoordinateDD, formatCoordinateDMS } from '../utils/geoUtils.js'

// ==================== Props 定义 ====================
/**
 * 接收父组件传递的坐标数据
 * @param {Object} coordinates - 坐标对象 { longitude, latitude }
 */
const props = defineProps({
  coordinates: {
    type: Object,
    default: () => ({ longitude: 0, latitude: 0 })
  },
  // 是否显示坐标格式切换按钮
  showFormatToggle: {
    type: Boolean,
    default: true
  }
})

// ==================== Emits 定义 ====================
/**
 * 向父组件发送事件
 * @event format-change - 坐标格式变更事件
 */
const emit = defineEmits(['format-change'])

// ==================== 响应式状态 ====================
// 坐标格式：DD（度）或 DMS（度分秒）
const format = ref('DD')

// ==================== 计算属性 ====================
/**
 * 格式化后的经度显示
 * 根据当前选择的格式自动转换
 */
const formattedLongitude = computed(() => {
  const lng = props.coordinates.longitude
  if (format.value === 'DMS') {
    return formatCoordinateDMS(lng, false) // 经度，isLat = false
  }
  return formatCoordinateDD(lng, 4)
})

/**
 * 格式化后的纬度显示
 * 根据当前选择的格式自动转换
 */
const formattedLatitude = computed(() => {
  const lat = props.coordinates.latitude
  if (format.value === 'DMS') {
    return formatCoordinateDMS(lat, true) // 纬度，isLat = true
  }
  return formatCoordinateDD(lat, 4)
})

// ==================== 方法 ====================
/**
 * 设置坐标显示格式
 * @param {string} newFormat - 新格式 ('DD' 或 'DMS')
 */
const setFormat = (newFormat) => {
  format.value = newFormat
  emit('format-change', newFormat)
}

// ==================== 生命周期 ====================
// 监听格式变化，持久化到本地存储
watch(format, (newFormat) => {
  localStorage.setItem('coordFormat', newFormat)
})

onMounted(() => {
  // 从本地存储恢复格式设置
  const savedFormat = localStorage.getItem('coordFormat')
  if (savedFormat) {
    format.value = savedFormat
  }
})
</script>

<style scoped>
/* 坐标显示容器 */
.coordinate-display {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  font-size: 0.85rem;
}

/* 单个坐标项 */
.coord-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 坐标标签 */
.coord-label {
  color: var(--text-muted);
  font-weight: 500;
}

/* 坐标值 */
.coord-value {
  color: var(--accent-primary);
  font-weight: 600;
  min-width: 120px;
}

/* 格式切换区域 */
.coord-format {
  margin-left: 8px;
}

/* 格式切换按钮 */
.format-btn {
  padding: 4px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s ease;
}

.format-btn:hover {
  background: var(--bg-tertiary);
}

.format-btn.active {
  background: var(--accent-primary);
  color: white;
  border-color: var(--accent-primary);
}

/* 响应式适配 */
@media (max-width: 480px) {
  .coordinate-display {
    flex-wrap: wrap;
    padding: 6px 12px;
  }
  
  .coord-value {
    min-width: 80px;
  }
}
</style>