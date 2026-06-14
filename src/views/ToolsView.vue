<template>
  <div class="tools-view">
    <div class="view-header">
      <h1>🛠️ 工具集</h1>
      <p>空间分析和测量工具</p>
    </div>
    
    <div class="tools-content">
      <!-- GIS 工具 -->
      <div class="tools-section">
        <h2>测量工具</h2>
        <div class="tools-grid">
          <div class="tool-card" :class="{ active: activeTool === 'distance' }" @click="setTool('distance')">
            <span class="tool-icon">📏</span>
            <h3>距离测量</h3>
            <p>测量两点之间的距离</p>
          </div>
          <div class="tool-card" :class="{ active: activeTool === 'area' }" @click="setTool('area')">
            <span class="tool-icon">📐</span>
            <h3>面积测量</h3>
            <p>测量多边形区域面积</p>
          </div>
          <div class="tool-card" :class="{ active: activeTool === 'angle' }" @click="setTool('angle')">
            <span class="tool-icon">📐</span>
            <h3>角度测量</h3>
            <p>测量三点之间的角度</p>
          </div>
        </div>
      </div>
      
      <!-- 绘图工具 -->
      <div class="tools-section">
        <h2>绘图工具</h2>
        <div class="tools-grid">
          <div class="tool-card" :class="{ active: activeTool === 'draw-point' }" @click="setTool('draw-point')">
            <span class="tool-icon">📍</span>
            <h3>绘制点</h3>
            <p>在地图上添加点标记</p>
          </div>
          <div class="tool-card" :class="{ active: activeTool === 'draw-line' }" @click="setTool('draw-line')">
            <span class="tool-icon">📝</span>
            <h3>绘制线</h3>
            <p>在地图上绘制折线</p>
          </div>
          <div class="tool-card" :class="{ active: activeTool === 'draw-polygon' }" @click="setTool('draw-polygon')">
            <span class="tool-icon">🔲</span>
            <h3>绘制多边形</h3>
            <p>在地图上绘制多边形</p>
          </div>
        </div>
      </div>
      
      <!-- 操作工具 -->
      <div class="tools-section">
        <h2>操作工具</h2>
        <div class="tools-grid">
          <div class="tool-card" :class="{ active: activeTool === 'pan' }" @click="setTool('pan')">
            <span class="tool-icon">✋</span>
            <h3>平移工具</h3>
            <p>拖动地图查看不同区域</p>
          </div>
          <div class="tool-card" :class="{ active: activeTool === 'select' }" @click="setTool('select')">
            <span class="tool-icon">👆</span>
            <h3>选择工具</h3>
            <p>选择地图上的要素</p>
          </div>
          <div class="tool-card" :class="{ active: activeTool === 'delete' }" @click="setTool('delete')">
            <span class="tool-icon">🗑️</span>
            <h3>删除工具</h3>
            <p>删除地图上的要素</p>
          </div>
        </div>
      </div>
      
      <!-- 当前工具状态 -->
      <div class="tools-section">
        <h2>当前工具状态</h2>
        <div class="current-tool">
          <div class="tool-info">
            <span class="tool-icon-large">{{ getToolIcon(activeTool) }}</span>
            <div>
              <h3>{{ getToolName(activeTool) }}</h3>
              <p>{{ getToolDescription(activeTool) }}</p>
            </div>
          </div>
          <button class="btn-reset" @click="resetTool">重置工具</button>
        </div>
      </div>
      
      <!-- 使用说明 -->
      <div class="tools-section">
        <h2>使用说明</h2>
        <div class="instructions">
          <div class="instruction-item">
            <span class="step">1</span>
            <p>点击左侧工具选择所需功能</p>
          </div>
          <div class="instruction-item">
            <span class="step">2</span>
            <p>在地图上点击或拖动进行操作</p>
          </div>
          <div class="instruction-item">
            <span class="step">3</span>
            <p>双击或按 Esc 键完成操作</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useMapStore } from '../stores/mapStore'

const mapStore = useMapStore()

const activeTool = mapStore.activeTool

const setTool = (toolId) => {
  mapStore.setActiveTool(toolId)
}

const resetTool = () => {
  mapStore.setActiveTool('pan')
}

const getToolIcon = (toolId) => {
  const icons = {
    pan: '✋',
    zoom: '🔍',
    select: '👆',
    'draw-point': '📍',
    'draw-line': '📝',
    'draw-polygon': '🔲',
    delete: '🗑️',
    distance: '📏',
    area: '📐',
    angle: '📐'
  }
  return icons[toolId] || '🛠️'
}

const getToolName = (toolId) => {
  const names = {
    pan: '平移工具',
    zoom: '缩放工具',
    select: '选择工具',
    'draw-point': '绘制点',
    'draw-line': '绘制线',
    'draw-polygon': '绘制多边形',
    delete: '删除工具',
    distance: '距离测量',
    area: '面积测量',
    angle: '角度测量'
  }
  return names[toolId] || '未知工具'
}

const getToolDescription = (toolId) => {
  const descriptions = {
    pan: '拖动地图查看不同区域',
    zoom: '放大或缩小地图视图',
    select: '选择地图上的要素对象',
    'draw-point': '在地图上添加点标记',
    'draw-line': '在地图上绘制折线',
    'draw-polygon': '在地图上绘制多边形区域',
    delete: '删除地图上选中的要素',
    distance: '测量两点之间的直线距离',
    area: '测量多边形区域的面积',
    angle: '测量三点之间形成的角度'
  }
  return descriptions[toolId] || ''
}
</script>

<style scoped>
.tools-view {
  display: flex;
  flex-direction: column;
  padding: 20px;
  height: 100%;
  width: 100%;
}

.view-header {
  margin-bottom: 24px;
  flex-shrink: 0;
}

.view-header h1 {
  font-size: 1.8rem;
  margin: 0 0 8px 0;
}

.view-header p {
  color: var(--text-secondary);
  margin: 0;
}

.tools-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
  overflow-y: auto;
}

.tools-section {
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  padding: 20px;
}

.tools-section h2 {
  margin: 0 0 16px 0;
  font-size: 1.2rem;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.tool-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: var(--bg-primary);
  border-radius: 12px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tool-card:hover {
  border-color: var(--accent-color);
  transform: translateY(-2px);
}

.tool-card.active {
  border-color: var(--accent-color);
  background: rgba(59, 130, 246, 0.1);
}

.tool-icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
}

.tool-card h3 {
  margin: 0 0 8px 0;
  font-size: 1rem;
}

.tool-card p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
  text-align: center;
}

.current-tool {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: var(--bg-primary);
  border-radius: 12px;
}

.tool-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.tool-icon-large {
  font-size: 3rem;
}

.tool-info h3 {
  margin: 0 0 4px 0;
}

.tool-info p {
  margin: 0;
  color: var(--text-secondary);
}

.btn-reset {
  padding: 10px 20px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.btn-reset:hover {
  background: var(--accent-color-dark);
}

.instructions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.instruction-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.step {
  width: 28px;
  height: 28px;
  background: var(--accent-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.instruction-item p {
  margin: 0;
  color: var(--text-secondary);
  padding-top: 4px;
}

@media (max-width: 768px) {
  .tools-view {
    padding: 12px;
  }
  
  .current-tool {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .tool-info {
    flex-direction: column;
  }
}
</style>