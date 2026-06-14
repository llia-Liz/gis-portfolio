<template>
  <footer class="gis-status">
    <div class="status-left">
      <StatusItem 
        icon="📍"
        label="图层"
        :value="visibleLayerCount"
        suffix="个"
      />
      
      <StatusItem 
        icon="📐"
        label="比例尺"
        :value="scaleRatio"
        prefix="1:"
      />
      
      <StatusItem 
        v-if="currentTool"
        icon="🔧"
        label="工具"
        :value="currentToolLabel"
      />
    </div>
    
    <div class="status-right">
      <CoordinateDisplay 
        :coordinates="coordinates"
        :showFormatToggle="false"
        @format-change="handleFormatChange"
      />
      
      <StatusItem 
        icon="⏱️"
        :value="currentTime"
      />
    </div>
  </footer>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import CoordinateDisplay from './CoordinateDisplay.vue'
import StatusItem from './StatusItem.vue'

const props = defineProps({
  layers: {
    type: Array,
    default: () => []
  },
  zoomLevel: {
    type: Number,
    default: 10
  },
  coordinates: {
    type: Object,
    default: () => ({ longitude: 0, latitude: 0 })
  },
  currentTool: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['format-change'])

const currentTime = ref('')
const coordFormat = ref('DD')

const visibleLayerCount = computed(() => {
  return props.layers.filter(layer => layer.visible).length
})

const scaleRatio = computed(() => {
  return Math.pow(2, 18 - props.zoomLevel)
})

const currentToolLabel = computed(() => {
  const toolLabels = {
    pan: '平移',
    zoom: '缩放',
    select: '选择',
    'draw-point': '绘制点',
    'draw-line': '绘制线',
    'draw-polygon': '绘制多边形',
    delete: '删除'
  }
  return toolLabels[props.currentTool] || ''
})

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const handleFormatChange = (format) => {
  coordFormat.value = format
  emit('format-change', format)
}

let timer = null

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.gis-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  font-size: 0.85rem;
  flex-shrink: 0;
}

.status-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

@media (max-width: 768px) {
  .gis-status {
    flex-wrap: wrap;
    padding: 6px 12px;
    gap: 8px;
  }
  
  .status-left,
  .status-right {
    flex-wrap: wrap;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .gis-status {
    font-size: 0.75rem;
  }
}
</style>