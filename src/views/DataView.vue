<template>
  <div class="data-view">
    <div class="view-header">
      <h1>📊 数据管理</h1>
      <p>管理 GIS 数据资源和图层配置</p>
    </div>
    
    <div class="data-content">
      <!-- 数据统计卡片 -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">🗂️</div>
          <div class="stat-info">
            <div class="stat-value">{{ layerStats.total }}</div>
            <div class="stat-label">图层总数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">👁️</div>
          <div class="stat-info">
            <div class="stat-value">{{ layerStats.visible }}</div>
            <div class="stat-label">可见图层</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📁</div>
          <div class="stat-info">
            <div class="stat-value">{{ layerStats.byType.point || 0 }}</div>
            <div class="stat-label">点图层</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📏</div>
          <div class="stat-info">
            <div class="stat-value">{{ layerStats.byType.line || 0 }}</div>
            <div class="stat-label">线图层</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🔲</div>
          <div class="stat-info">
            <div class="stat-value">{{ layerStats.byType.polygon || 0 }}</div>
            <div class="stat-label">面图层</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🗺️</div>
          <div class="stat-info">
            <div class="stat-value">{{ layerStats.byType.tile || 0 }}</div>
            <div class="stat-label">瓦片图层</div>
          </div>
        </div>
      </div>
      
      <!-- 图层列表表格 -->
      <div class="data-section">
        <div class="section-header">
          <h2>图层列表</h2>
          <button class="btn-primary" @click="showAddModal = true">+ 添加图层</button>
        </div>
        
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th><input type="checkbox" @change="selectAll" /></th>
                <th>名称</th>
                <th>类型</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="layer in filteredLayers" :key="layer.id">
                <td><input type="checkbox" :checked="layer.selected" @change="selectLayer(layer.id)" /></td>
                <td>{{ layer.name }}</td>
                <td>{{ formatType(layer.type) }}</td>
                <td>
                  <span :class="['status-badge', layer.visible ? 'status-active' : 'status-inactive']">
                    {{ layer.visible ? '显示' : '隐藏' }}
                  </span>
                </td>
                <td class="actions">
                  <button class="btn-action" @click="toggleVisibility(layer.id)">
                    {{ layer.visible ? '隐藏' : '显示' }}
                  </button>
                  <button v-if="!layer.disabled" class="btn-action btn-danger" @click="deleteLayer(layer.id)">
                    删除
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- 添加图层弹窗 -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>添加新图层</h3>
          <button class="modal-close" @click="showAddModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>图层名称</label>
            <input v-model="newLayer.name" type="text" placeholder="请输入图层名称" />
          </div>
          <div class="form-group">
            <label>图层类型</label>
            <select v-model="newLayer.type">
              <option value="point">点</option>
              <option value="line">线</option>
              <option value="polygon">多边形</option>
              <option value="tile">瓦片</option>
              <option value="raster">栅格</option>
            </select>
          </div>
          <div class="form-group">
            <label>
              <input v-model="newLayer.visible" type="checkbox" /> 初始可见
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showAddModal = false">取消</button>
          <button class="btn-primary" @click="confirmAddLayer">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useLayers } from '../composables/useLayers'

const {
  filteredLayers,
  layerStats,
  toggleVisibility,
  selectLayer,
  deleteLayer,
  addNewLayer
} = useLayers()

const showAddModal = ref(false)

const newLayer = reactive({
  name: '',
  type: 'vector',
  visible: true
})

const selectAll = (event) => {
  filteredLayers.value.forEach(layer => {
    if (!layer.disabled) {
      layer.selected = event.target.checked
    }
  })
}

const confirmAddLayer = () => {
  if (!newLayer.name.trim()) {
    alert('请输入图层名称')
    return
  }
  
  addNewLayer(newLayer)
  showAddModal.value = false
  
  // 重置表单
  newLayer.name = ''
  newLayer.type = 'vector'
  newLayer.visible = true
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
</script>

<style scoped>
.data-view {
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

.data-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
  overflow-y: auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.stat-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-color);
  border-radius: 12px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: var(--text-primary);
}

.stat-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.data-section {
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}

.section-header h2 {
  margin: 0;
  font-size: 1.1rem;
}

.btn-primary {
  padding: 8px 16px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-primary:hover {
  background: var(--accent-color-dark);
}

.btn-secondary {
  padding: 8px 16px;
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-secondary:hover {
  background: var(--bg-hover);
}

.btn-action {
  padding: 4px 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  margin-right: 8px;
}

.btn-action:hover {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.btn-danger:hover {
  background: #dc3545;
  border-color: #dc3545;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.data-table th {
  background: var(--bg-primary);
  font-weight: 600;
  font-size: 0.9rem;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-active {
  background: #d4edda;
  color: #155724;
}

.status-inactive {
  background: #f8d7da;
  color: #721c24;
}

.actions {
  white-space: nowrap;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-secondary);
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary);
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 0.9rem;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
}
</style>