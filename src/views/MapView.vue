<template>
  <div class="map-view">
    <!-- 主内容区域 -->
    <div class="map-container">
      <!-- 左侧面板（可折叠） -->
      <aside class="side-panel" :class="{ collapsed: isPanelCollapsed }">
        <button class="collapse-btn" @click="togglePanel">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="15" y1="19" x2="9" y2="12"/>
            <line x1="9" y1="5" x2="15" y2="12"/>
          </svg>
        </button>
        <div class="panel-content" v-show="!isPanelCollapsed">
          <LayerList />
        </div>
      </aside>
      
      <!-- 地图区域 -->
      <main class="map-area">
        <!-- 地图组件 -->
        <Map 
          ref="mapRef"
          :zoom="mapStore.zoomLevel"
          :center="mapStore.mapCenter"
          @zoom-change="handleZoomChange"
          @move-end="handleMoveEnd"
          @mouse-move="handleMouseMove"
        />
        
        <!-- 功能工具按钮 -->
        <div class="function-tools">
          <button 
            class="tool-btn" 
            @click="toggleBookmarks" 
            title="地图书签"
            :class="{ active: isBookmarkActive }"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 21l-6-3.5 6-3.5 6 3.5-6 3.5zM18 17.5l-6-3.5-6 3.5V5a2 2 0 012-2h8a2 2 0 012 2v12.5z"/>
            </svg>
          </button>
          <button 
            class="tool-btn" 
            @click="toggleDistanceMeasure" 
            title="距离测量"
            :class="{ active: isMeasureActive }"
          >
            <span class="tool-emoji">📏</span>
          </button>
        </div>
        
        <!-- 缩放控制 -->
        <div class="zoom-control">
          <button class="zoom-btn" @click="zoomIn" title="放大">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
          <span class="zoom-level">{{ mapStore.zoomLevel }}</span>
          <button class="zoom-btn" @click="zoomOut" title="缩小">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
            </svg>
          </button>
          <button class="zoom-btn" @click="resetView" title="复位">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12l3-9 9 3 9-3-3 9-9-3-9 3z"/>
            </svg>
          </button>
        </div>
      </main>
      
      <!-- 右侧面板（可折叠） -->
      <aside class="side-panel-right" :class="{ collapsed: isRightPanelCollapsed }">
        <button class="collapse-btn-right" @click="toggleRightPanel">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="9" y1="5" x2="15" y2="12"/>
            <line x1="15" y1="19" x2="9" y2="12"/>
          </svg>
        </button>
        <div class="panel-content" v-show="!isRightPanelCollapsed">
          <GISPanel />
        </div>
      </aside>
    </div>
    
    <!-- 状态栏 -->
    <StatusBar 
      :layers="mapStore.layers"
      :zoom-level="mapStore.zoomLevel"
      :coordinates="currentCoordinates"
      :current-tool="mapStore.activeTool"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useMapStore } from '../stores/mapStore'
import LayerList from '../components/LayerList.vue'
import Map from '../components/Map.vue'
import GISPanel from '../components/GISPanel.vue'
import StatusBar from '../components/StatusBar.vue'

const mapStore = useMapStore()
const mapRef = ref(null)

// 面板折叠状态
const isPanelCollapsed = ref(false)
const isRightPanelCollapsed = ref(false)

// 工具激活状态
const isBookmarkActive = ref(false)
const isMeasureActive = ref(false)

// 当前鼠标坐标
const currentCoordinates = ref({
  longitude: 0,
  latitude: 0
})

// 切换左侧面板
const togglePanel = () => {
  isPanelCollapsed.value = !isPanelCollapsed.value
}

// 切换右侧面板
const toggleRightPanel = () => {
  isRightPanelCollapsed.value = !isRightPanelCollapsed.value
}

// 放大
const zoomIn = () => {
  mapStore.zoomIn()
}

// 缩小
const zoomOut = () => {
  mapStore.zoomOut()
}

// 复位视图
const resetView = () => {
  mapStore.resetView()
}

// 处理缩放变化
const handleZoomChange = (zoom) => {
  mapStore.zoomLevel = zoom
}

// 处理地图移动结束
const handleMoveEnd = (center) => {
  mapStore.mapCenter = center
}

// 处理鼠标移动
const handleMouseMove = (coords) => {
  currentCoordinates.value = {
    longitude: coords.longitude,
    latitude: coords.latitude
  }
}

// 切换地图书签
const toggleBookmarks = () => {
  isBookmarkActive.value = !isBookmarkActive.value
  if (mapRef.value) {
    mapRef.value.toggleBookmarks()
  }
}

// 切换距离测量
const toggleDistanceMeasure = () => {
  isMeasureActive.value = !isMeasureActive.value
  if (mapRef.value) {
    if (isMeasureActive.value) {
      mapRef.value.startDistanceMeasure()
    } else {
      mapRef.value.stopDistanceMeasure()
    }
  }
}
</script>

<style scoped>
.map-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  min-height: 0;
}

.map-container {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-width: 0;
}

/* 左侧面板 */
.side-panel {
  width: 250px;
  flex-shrink: 0;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
  display: flex;
  transition: width 0.3s ease;
}

.side-panel.collapsed {
  width: 40px;
}

.collapse-btn {
  background: var(--bg-primary);
  border: none;
  border-right: 1px solid var(--border-color);
  padding: 8px;
  cursor: pointer;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  writing-mode: vertical-rl;
  height: 100%;
  width: 40px;
  flex-shrink: 0;
}

.collapse-btn:hover {
  background: var(--bg-tertiary);
}

.collapse-btn svg {
  width: 18px;
  height: 18px;
  transform: rotate(180deg);
}

.panel-content {
  flex: 1;
  padding: 8px;
}

/* 地图区域 */
.map-area {
  flex: 1;
  position: relative;
  overflow: hidden;
  min-width: 0;
  min-height: 0;
  background-color: var(--bg-primary);
}

/* 功能工具按钮 */
.function-tools {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1000;
}

.tool-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-md);
}

.tool-btn:hover {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.tool-btn.active {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.tool-btn svg {
  width: 20px;
  height: 20px;
}

.tool-emoji {
  font-size: 1.2rem;
}

/* 右侧面板 */
.side-panel-right {
  width: 280px;
  flex-shrink: 0;
  background: var(--bg-secondary);
  border-left: 1px solid var(--border-color);
  overflow-y: auto;
  display: flex;
  flex-direction: row-reverse;
  transition: width 0.3s ease;
}

.side-panel-right.collapsed {
  width: 40px;
}

.collapse-btn-right {
  background: var(--bg-primary);
  border: none;
  border-left: 1px solid var(--border-color);
  padding: 8px;
  cursor: pointer;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  writing-mode: vertical-rl;
  height: 100%;
  width: 40px;
  flex-shrink: 0;
}

.collapse-btn-right:hover {
  background: var(--bg-tertiary);
}

.collapse-btn-right svg {
  width: 18px;
  height: 18px;
}

/* 缩放控制 */
.zoom-control {
  position: absolute;
  bottom: 80px;
  right: 16px;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius);
  padding: 4px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  z-index: 1000;
}

.zoom-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 4px;
  background-color: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.zoom-btn:hover {
  background-color: var(--accent-color);
  color: white;
}

.zoom-btn svg {
  width: 18px;
  height: 18px;
}

.zoom-level {
  text-align: center;
  padding: 4px 0;
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* 响应式适配 */
@media (max-width: 1024px) {
  .side-panel-right {
    display: none;
  }
  
  .side-panel {
    width: 220px;
  }
}

@media (max-width: 768px) {
  .side-panel {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 2000;
    box-shadow: var(--shadow-lg);
    width: 240px;
    transform: translateX(0);
    transition: transform 0.3s ease;
  }
  
  .side-panel.collapsed {
    transform: translateX(-100%);
    width: 240px;
  }
  
  .collapse-btn {
    display: none;
  }
  
  .zoom-control {
    bottom: 70px;
  }
}

@media (max-width: 480px) {
  .side-panel {
    width: 200px;
  }
  
  .zoom-control {
    right: 8px;
  }
}
</style>