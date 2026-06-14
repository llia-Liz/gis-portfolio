<template>
  <div class="gis-panel" :class="{ collapsed: isCollapsed }">
    <div class="panel-header">
      <h3>📊 GIS 数据工具</h3>
      <button class="toggle-btn" @click="isCollapsed = !isCollapsed">
        {{ isCollapsed ? '▶' : '◀' }}
      </button>
    </div>
    
    <div class="panel-content" v-if="!isCollapsed">
      <!-- 数据加载 -->
      <section class="panel-section">
        <h4>1️⃣ 异步加载 GeoJSON</h4>
        <button class="btn" @click="loadSampleGeoJSON" :disabled="loading">
          {{ loading ? '加载中...' : '加载示例数据' }}
        </button>
        <div v-if="loading" class="loading-spinner">⏳</div>
      </section>

      <!-- 距离计算 -->
      <section class="panel-section">
        <h4>2️⃣ 距离计算工具</h4>
        <div class="input-group">
          <label>点1 (经度, 纬度):</label>
          <input v-model="point1Input" placeholder="116.397, 39.914" />
        </div>
        <div class="input-group">
          <label>点2 (经度, 纬度):</label>
          <input v-model="point2Input" placeholder="116.478, 39.928" />
        </div>
        <button class="btn" @click="calcDistance">计算距离</button>
        <div v-if="distanceResult" class="result">
          📏 距离: {{ distanceResult }}
        </div>
      </section>

      <!-- 坐标格式化 -->
      <section class="panel-section">
        <h4>3️⃣ 坐标格式化</h4>
        <div class="input-group">
          <label>经度:</label>
          <input v-model="coordInput" placeholder="116.397" type="number" />
        </div>
        <div class="format-options">
          <button class="btn small" @click="formatDD">度 (DD)</button>
          <button class="btn small" @click="formatDMS">度分秒 (DMS)</button>
        </div>
        <div v-if="formattedCoord" class="result">
          📍 {{ formattedCoord }}
        </div>
      </section>

      <!-- 面积统计 -->
      <section class="panel-section">
        <h4>4️⃣ 面积统计</h4>
        <div class="area-info">
          <p>总面积: {{ totalArea || '0' }} 平方米</p>
          <p>{{ formattedTotalArea || '(加载数据后计算)' }}</p>
        </div>
      </section>

      <!-- 要素统计 -->
      <section class="panel-section" v-if="statistics">
        <h4>5️⃣ 要素统计</h4>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">总计:</span>
            <span class="stat-value">{{ statistics.total }}</span>
          </div>
          <div v-for="(count, type) in statistics.types" :key="type" class="stat-item">
            <span class="stat-label">{{ type }}:</span>
            <span class="stat-value">{{ count }}</span>
          </div>
        </div>
      </section>

      <!-- 过滤功能 -->
      <section class="panel-section" v-if="layer">
        <h4>6️⃣ 要素过滤</h4>
        <select v-model="filterType" class="select">
          <option value="">全部</option>
          <option value="Point">点</option>
          <option value="LineString">线</option>
          <option value="Polygon">面</option>
        </select>
        <button class="btn" @click="applyFilter">应用过滤</button>
        <p>过滤后数量: {{ filteredCount }}</p>
      </section>

      <!-- 数据操作 -->
      <section class="panel-section" v-if="layer">
        <h4>7️⃣ 数据操作</h4>
        <div class="action-buttons">
          <button class="btn small" @click="showBounds">显示边界</button>
          <button class="btn small" @click="exportData">导出 GeoJSON</button>
          <button class="btn small" @click="clearData">清空数据</button>
        </div>
      </section>

      <!-- 加载的数据列表 -->
      <section class="panel-section" v-if="loadedFeatures.length > 0">
        <h4>📋 加载的数据 ({{ loadedFeatures.length }})</h4>
        <ul class="feature-list">
          <li v-for="(feature, index) in displayedFeatures" :key="index" class="feature-item">
            <span class="feature-type">{{ feature.geometry?.type }}</span>
            <span class="feature-name">{{ feature.properties?.name || '未命名' }}</span>
          </li>
        </ul>
        <button v-if="loadedFeatures.length > 5" class="btn small" @click="showAll = !showAll">
          {{ showAll ? '收起' : `显示全部(${loadedFeatures.length})` }}
        </button>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import {
  calculateDistance,
  formatCoordinateDD,
  formatCoordinateDMS,
  calculatePolygonArea,
  formatArea,
  loadSampleData,
  calculateStatistics,
  calculateCollectionBounds,
  filterFeatures,
  getGeometryType,
  Layer,
  DataManager
} from '../utils/index.js';

// 状态
const isCollapsed = ref(false);
const loading = ref(false);
const point1Input = ref('116.397, 39.914');
const point2Input = ref('116.478, 39.928');
const coordInput = ref('116.397');
const distanceResult = ref('');
const formattedCoord = ref('');
const totalArea = ref(0);
const formattedTotalArea = ref('');
const statistics = ref(null);
const filterType = ref('');
const filteredCount = ref(0);
const showAll = ref(false);
const loadedFeatures = ref([]);

// 创建数据管理器
const dataManager = new DataManager();
const layer = ref(null);

// 计算显示的要素
const displayedFeatures = computed(() => {
  return showAll.value ? loadedFeatures.value : loadedFeatures.value.slice(0, 5);
});

// 加载示例 GeoJSON 数据
const loadSampleGeoJSON = async () => {
  loading.value = true;
  
  try {
    const data = await loadSampleData('all');
    
    // 合并所有数据
    const allFeatures = [
      ...data.points.features,
      ...data.lines.features,
      ...data.polygons.features
    ];
    
    loadedFeatures.value = allFeatures;
    
    // 创建图层
    const newLayer = new Layer({
      name: '示例数据',
      type: 'vector'
    });
    
    newLayer.addFeatures(allFeatures);
    layer.value = newLayer;
    dataManager.addLayer(newLayer);
    
    // 计算统计
    statistics.value = newLayer.getStatistics();
    
    // 计算总面积
    calculateTotalArea(newLayer);
    
  } catch (error) {
    console.error('加载失败:', error);
    alert('加载失败: ' + error.message);
  } finally {
    loading.value = false;
  }
};

// 计算距离
const calcDistance = () => {
  const [lon1, lat1] = point1Input.value.split(',').map(s => parseFloat(s.trim()));
  const [lon2, lat2] = point2Input.value.split(',').map(s => parseFloat(s.trim()));
  
  if ([lon1, lat1, lon2, lat2].some(isNaN)) {
    alert('请输入有效的坐标');
    return;
  }
  
  const distance = calculateDistance([lon1, lat1], [lon2, lat2]);
  distanceResult.value = distance < 1000 
    ? `${distance.toFixed(2)} 米`
    : `${(distance / 1000).toFixed(2)} 公里`;
};

// 格式化坐标为度
const formatDD = () => {
  const coord = parseFloat(coordInput.value);
  if (isNaN(coord)) {
    alert('请输入有效数字');
    return;
  }
  formattedCoord.value = formatCoordinateDD(coord);
};

// 格式化坐标为度分秒
const formatDMS = () => {
  const coord = parseFloat(coordInput.value);
  if (isNaN(coord)) {
    alert('请输入有效数字');
    return;
  }
  const isLat = coord >= -90 && coord <= 90;
  formattedCoord.value = formatCoordinateDMS(coord, isLat);
};

// 计算总面积
const calculateTotalArea = (layer) => {
  const features = layer.getVisibleFeatures();
  let area = 0;
  
  features.forEach(f => {
    const type = f.getGeometryType();
    if (type === 'Polygon') {
      const coords = f.getCoordinates();
      area += calculatePolygonArea(coords);
    }
  });
  
  totalArea.value = area;
  formattedTotalArea.value = formatArea(area);
};

// 应用过滤
const applyFilter = () => {
  if (!layer.value) return;
  
  if (!filterType.value) {
    filteredCount.value = layer.value.features.length;
    return;
  }
  
  const filtered = layer.value.features.filter(f => 
    f.getGeometryType() === filterType.value
  );
  filteredCount.value = filtered.length;
};

// 显示边界
const showBounds = () => {
  if (!layer.value) return;
  const bounds = layer.value.getBounds();
  alert(`边界框:\n最小: [${bounds.minX.toFixed(4)}, ${bounds.minY.toFixed(4)}]\n最大: [${bounds.maxX.toFixed(4)}, ${bounds.maxY.toFixed(4)}]`);
};

// 导出 GeoJSON
const exportData = () => {
  if (!layer.value) return;
  const geojson = layer.value.toGeoJSON();
  console.log('导出的 GeoJSON:', geojson);
  alert('GeoJSON 已打印到控制台');
};

// 清空数据
const clearData = () => {
  if (layer.value) {
    layer.value.clearFeatures();
    loadedFeatures.value = [];
    statistics.value = null;
    totalArea.value = 0;
    formattedTotalArea.value = '';
    filteredCount.value = 0;
  }
};
</script>

<style scoped>
.gis-panel {
  position: fixed;
  right: 16px;
  top: 80px;
  width: 280px;
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  z-index: 1000;
  transition: all 0.3s ease;
}

.gis-panel.collapsed {
  width: 40px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-tertiary);
  border-radius: var(--border-radius) var(--border-radius) 0 0;
}

.panel-header h3 {
  margin: 0;
  font-size: 0.9rem;
  white-space: nowrap;
}

.toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 4px;
}

.panel-content {
  padding: 12px;
}

.panel-section {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.panel-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.panel-section h4 {
  margin: 0 0 8px 0;
  font-size: 0.85rem;
  color: var(--text-primary);
}

.btn {
  display: block;
  width: 100%;
  padding: 8px 12px;
  background: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  margin-top: 8px;
  transition: background 0.2s;
}

.btn:hover:not(:disabled) {
  background: #2563eb;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn.small {
  padding: 6px 10px;
  width: auto;
  margin-right: 4px;
}

.input-group {
  margin-bottom: 8px;
}

.input-group label {
  display: block;
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.input-group input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.8rem;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.format-options {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.result {
  margin-top: 8px;
  padding: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  font-size: 0.8rem;
  color: var(--accent-primary);
}

.area-info {
  background: var(--bg-tertiary);
  padding: 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.area-info p {
  margin: 4px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.stat-item {
  background: var(--bg-tertiary);
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  display: flex;
  justify-content: space-between;
}

.stat-label {
  color: var(--text-secondary);
}

.stat-value {
  color: var(--accent-primary);
  font-weight: bold;
}

.select {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.8rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  margin-top: 4px;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 8px 0 0 0;
}

.feature-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  margin-bottom: 4px;
  font-size: 0.75rem;
}

.feature-type {
  color: var(--accent-primary);
  font-weight: bold;
}

.feature-name {
  color: var(--text-secondary);
}

.loading-spinner {
  text-align: center;
  padding: 12px;
  font-size: 1.5rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .gis-panel {
    right: 8px;
    top: 70px;
    width: 240px;
  }
}
</style>
