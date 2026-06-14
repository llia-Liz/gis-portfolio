<template>
  <div class="layer-list">
    <!-- 搜索框 -->
    <div class="search-box">
      <input 
        v-model="searchQuery"
        type="text"
        placeholder="搜索图层..."
        class="search-input"
      />
      <span class="search-icon">🔍</span>
    </div>

    <!-- 图层统计信息 -->
    <div class="layer-stats">
      <span>可见: {{ layerStats.visible }} / {{ layerStats.total }}</span>
    </div>

    <!-- 图层列表 -->
    <ul class="layer-items">
      <li 
        v-for="layer in filteredLayers"
        :key="layer.id"
        class="layer-item"
        :class="{ 
          visible: layer.visible,
          selected: layer.selected,
          disabled: layer.disabled
        }"
      >
        <!-- 图层可见性控制 -->
        <input 
          v-model="layer.visible"
          type="checkbox"
          class="layer-checkbox"
          :disabled="layer.disabled"
          @change="toggleVisibility(layer.id)"
        />
        
        <!-- 图层图标 -->
        <span class="layer-icon">{{ getLayerIcon(layer.type) }}</span>
        
        <!-- 图层名称 -->
        <span class="layer-name">{{ layer.name }}</span>
        
        <!-- 图层类型标签 -->
        <span class="layer-type-tag">{{ formatType(layer.type) }}</span>
        
        <!-- 操作按钮 -->
        <div class="layer-actions">
          <button 
            class="action-btn"
            :class="{ active: layer.selected }"
            @click="selectLayer(layer.id)"
            title="选择"
          >
            👆
          </button>
          <button 
            class="action-btn"
            @click="handleZoomTo(layer)"
            title="定位"
          >
            📍
          </button>
          <button 
            class="action-btn"
            @click="handleInfo(layer)"
            title="信息"
          >
            ℹ️
          </button>
        </div>
      </li>
    </ul>

    <!-- 无搜索结果提示 -->
    <div v-if="filteredLayers.length === 0 && searchQuery" class="no-results">
      <span>未找到匹配的图层</span>
    </div>

    <!-- 批量操作 -->
    <div class="batch-actions">
      <button class="batch-btn" @click="batchToggle('show-all')">全部显示</button>
      <button class="batch-btn" @click="batchToggle('hide-all')">全部隐藏</button>
      <button class="batch-btn" @click="batchToggle('invert')">反选</button>
    </div>
  </div>
</template>

<script setup>
import { useLayers } from '../composables/useLayers'

const {
  searchQuery,
  filteredLayers,
  layerStats,
  toggleVisibility,
  selectLayer,
  batchToggle
} = useLayers()

const getLayerIcon = (type) => {
  const icons = {
    vector: '📐',
    raster: '🗺️',
    point: '📍',
    line: '📏',
    polygon: '⬡',
    tile: '🧩',
    wms: '🌐',
    wfs: '📊',
    default: '📑'
  }
  return icons[type] || icons.default
}

const formatType = (type) => {
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

const handleZoomTo = (layer) => {
  console.log(`定位到图层: ${layer.id}`)
}

const handleInfo = (layer) => {
  alert(`图层信息:\n名称: ${layer.name}\n类型: ${formatType(layer.type)}\n可见: ${layer.visible}`)
}
</script>

<style scoped>
.layer-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 32px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.85rem;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-color);
}

.search-icon {
  position: absolute;
  left: 8px;
  color: var(--text-muted);
}

.layer-stats {
  font-size: 0.75rem;
  color: var(--text-muted);
  padding: 4px 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
}

.layer-items {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.layer-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg-primary);
  border-radius: 4px;
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.layer-item:hover {
  background: var(--bg-tertiary);
}

.layer-item.visible {
  border-left: 3px solid var(--accent-color);
}

.layer-item.selected {
  background: var(--accent-color);
  color: white;
}

.layer-item.selected .layer-icon,
.layer-item.selected .layer-name,
.layer-item.selected .layer-type-tag {
  color: white;
}

.layer-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.layer-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--accent-color);
}

.layer-icon {
  font-size: 1rem;
}

.layer-name {
  flex: 1;
  font-size: 0.85rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.layer-type-tag {
  font-size: 0.7rem;
  padding: 2px 6px;
  background: var(--bg-tertiary);
  color: var(--text-muted);
  border-radius: 4px;
}

.layer-actions {
  display: flex;
  gap: 4px;
  margin-left: auto;
}

.action-btn {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.7rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: var(--accent-color);
  color: white;
}

.action-btn.active {
  background: var(--accent-color);
  color: white;
}

.no-results {
  text-align: center;
  padding: 16px;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.batch-actions {
  display: flex;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--border-color);
}

.batch-btn {
  flex: 1;
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s ease;
}

.batch-btn:hover {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

@media (max-width: 480px) {
  .layer-actions {
    display: none;
  }
  
  .batch-actions {
    flex-wrap: wrap;
  }
  
  .batch-btn {
    flex: none;
    width: calc(50% - 4px);
  }
}
</style>