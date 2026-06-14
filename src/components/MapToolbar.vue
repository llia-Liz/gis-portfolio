<template>
  <div class="map-toolbar">
    <!-- 工具按钮列表 -->
    <button 
      v-for="tool in tools"
      :key="tool.id"
      class="toolbar-btn"
      :class="{ 
        active: activeTool === tool.id,
        disabled: tool.disabled
      }"
      :disabled="tool.disabled"
      :title="tool.label"
      @click="handleToolClick(tool)"
      @mouseenter="handleToolHover(tool)"
      @mouseleave="handleToolLeave"
    >
      <span class="tool-icon">{{ tool.icon }}</span>
    </button>
    
    <!-- 工具提示（悬停显示） -->
    <div v-if="hoveredTool" class="tool-tooltip">
      {{ hoveredTool.label }}
      <span v-if="hoveredTool.shortcut" class="shortcut">({{ hoveredTool.shortcut }})</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useMapStore } from '../stores/mapStore'

const mapStore = useMapStore()

// 工具列表（与地图联动）
const tools = [
  { id: 'pan', label: '平移', icon: '✋', shortcut: 'P', disabled: false },
  { id: 'zoom', label: '缩放', icon: '🔍', shortcut: 'Z', disabled: false },
  { id: 'select', label: '选择', icon: '👆', shortcut: 'S', disabled: false },
  { id: 'draw-point', label: '绘制点', icon: '📍', shortcut: '1', disabled: false },
  { id: 'draw-line', label: '绘制线', icon: '📝', shortcut: '2', disabled: false },
  { id: 'draw-polygon', label: '绘制多边形', icon: '⬡', shortcut: '3', disabled: false },
  { id: 'distance', label: '距离测量', icon: '📏', shortcut: 'D', disabled: false },
  { id: 'area', label: '面积测量', icon: '📐', shortcut: 'A', disabled: false },
  { id: 'delete', label: '删除', icon: '🗑️', shortcut: 'Del', disabled: false }
]

// 当前活动工具（从 store 获取）
const activeTool = mapStore.activeTool

// 当前悬停的工具
const hoveredTool = ref(null)

// 处理工具按钮点击
const handleToolClick = (tool) => {
  if (tool.disabled) return
  
  // 更新全局工具状态
  mapStore.setActiveTool(tool.id)
  
  // 触发地图联动效果
  triggerMapAction(tool.id)
}

// 触发地图联动动作
const triggerMapAction = (toolId) => {
  // 可以通过事件或 store 通知地图组件执行相应操作
  console.log(`工具 ${toolId} 已激活，通知地图执行对应操作`)
  
  switch (toolId) {
    case 'pan':
      // 地图进入平移模式
      break
    case 'zoom':
      // 地图进入缩放模式
      break
    case 'select':
      // 地图进入选择模式
      break
    case 'draw-point':
    case 'draw-line':
    case 'draw-polygon':
      // 地图进入绘制模式
      break
    case 'distance':
    case 'area':
      // 地图进入测量模式
      break
    case 'delete':
      // 地图进入删除模式
      break
    default:
      break
  }
}

// 处理工具按钮悬停
const handleToolHover = (tool) => {
  hoveredTool.value = tool
}

// 处理工具按钮离开
const handleToolLeave = () => {
  hoveredTool.value = null
}
</script>

<style scoped>
.map-toolbar {
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  padding: 8px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  z-index: 1000;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: var(--border-radius);
  background: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.toolbar-btn:hover:not(.disabled) {
  background: var(--accent-color);
  color: white;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.toolbar-btn.active {
  background: var(--accent-color);
  color: white;
}

.toolbar-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tool-icon {
  font-size: 1.2rem;
}

.tool-tooltip {
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: 8px;
  padding: 6px 12px;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 0.75rem;
  border-radius: 4px;
  white-space: nowrap;
  box-shadow: var(--shadow-md);
}

.shortcut {
  color: var(--text-muted);
  font-size: 0.7rem;
}

@media (max-width: 768px) {
  .toolbar-btn {
    width: 36px;
    height: 36px;
  }
  
  .tool-icon {
    font-size: 1rem;
  }
}
</style>