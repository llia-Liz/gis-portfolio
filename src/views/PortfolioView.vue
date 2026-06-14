<template>
  <div class="portfolio-container">
    <!-- 头部导航 -->
    <header class="portfolio-header">
      <div class="header-left">
        <h1>🌍 GIS 作品集</h1>
        <p>我的地理探索之旅</p>
      </div>
      <div class="header-right">
        <select v-model="currentBasemap" class="basemap-select" @change="switchBasemap">
          <option value="vec">🗺️ 矢量底图</option>
          <option value="satellite">🛰️ 卫星遥感</option>
        </select>
      </div>
    </header>
    
    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 左侧面板 -->
      <aside class="sidebar">
        <div class="nav-section">
          <h3>📁 作品集模块</h3>
          <nav class="module-nav">
            <button 
              v-for="module in modules" 
              :key="module.id"
              :class="['nav-btn', { active: activeModule === module.id }]"
              @click="switchModule(module.id)"
            >
              {{ module.icon }} {{ module.name }}
            </button>
          </nav>
        </div>
        
        <!-- 个人足迹信息面板 -->
        <div class="info-panel" v-if="activeModule === 'timeline'">
          <div class="panel-header">
            <h3>📊 旅行统计</h3>
            <button class="add-btn" @click="openAddTripDialog">➕ 添加</button>
          </div>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-value">{{ travelStats.cities }}</span>
              <span class="stat-label">到访城市</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ travelStats.provinces }}</span>
              <span class="stat-label">走过省份</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ travelStats.days }}</span>
              <span class="stat-label">旅行天数</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ travelStats.photos }}</span>
              <span class="stat-label">照片记录</span>
            </div>
          </div>
        </div>
        
        <!-- 兴趣点信息面板 -->
        <div class="info-panel" v-if="activeModule === 'points'">
          <div class="panel-header">
            <h3>⭐ 兴趣点</h3>
            <button class="add-btn" @click="openAddPointDialog">➕ 添加</button>
          </div>
          <div class="category-filter">
            <button 
              v-for="cat in pointCategories" 
              :key="cat.id"
              :class="['cat-btn', { active: activeCategory === cat.id }]"
              @click="filterPoints(cat.id)"
            >
              {{ cat.icon }}
            </button>
          </div>
        </div>
        
        <!-- 专题图信息面板 -->
        <div class="info-panel" v-if="activeModule === 'thematic'">
          <h3>📈 专题数据</h3>
          <select v-model="dataField" class="field-select" @change="updateThematicStyle">
            <option value="population">人口数量</option>
            <option value="gdp">GDP总量</option>
            <option value="density">人口密度</option>
          </select>
        </div>
      </aside>
      
      <!-- 右侧地图区域 -->
      <main class="map-area">
        <!-- 地图容器 -->
        <div class="map-wrapper">
          <!-- 图层控制面板 -->
          <div class="layer-control-panel">
            <h4>🗺️ 图层叠加</h4>
            <label class="layer-checkbox">
              <input type="checkbox" v-model="layerVisibility.travel" @change="refreshAllLayers">
              <span>👣 个人足迹</span>
            </label>
            <label class="layer-checkbox">
              <input type="checkbox" v-model="layerVisibility.points" @change="refreshAllLayers">
              <span>⭐ 兴趣点</span>
            </label>
            <label class="layer-checkbox">
              <input type="checkbox" v-model="layerVisibility.thematic" @change="refreshAllLayers">
              <span>📊 专题图</span>
            </label>
          </div>
          
          <!-- 底图切换面板 -->
          <div class="basemap-switch-panel">
            <h4>🛰️ 底图切换</h4>
            <button 
              v-for="(style, key) in basemapStyles" 
              :key="key"
              :class="['basemap-btn', { active: currentBasemap === key }]"
              @click="currentBasemap = key; switchBasemap()"
            >
              {{ key === 'vec' ? '🗺️' : key === 'satellite' ? '🛰️' : '🌙' }}
            </button>
          </div>

          <!-- 标注编辑器面板 -->
          <div class="marker-editor-panel">
            <h4>📍 标注编辑器</h4>
            <button 
              :class="['editor-btn', { active: editorMode }]"
              @click="toggleEditorMode"
            >
              {{ editorMode ? '🔴 退出编辑' : '✏️ 编辑标注' }}
            </button>
            
            <div v-if="editorMode" class="editor-tools">
              <button class="tool-btn" @click="setEditorTool('marker')" :class="{ active: editorTool === 'marker' }">
                📍 标注点
              </button>
              <button class="tool-btn" @click="setEditorTool('circle')" :class="{ active: editorTool === 'circle' }">
                ⭕ 圆形区域
              </button>
              <button class="tool-btn" @click="setEditorTool('line')" :class="{ active: editorTool === 'line' }">
                ➖ 绘制线条
              </button>
              <button class="tool-btn" @click="setEditorTool('polygon')" :class="{ active: editorTool === 'polygon' }">
                🔷 绘制多边形
              </button>
            </div>

            <div v-if="customMarkers.length > 0" class="marker-list">
              <div class="marker-list-header">
                <span>已添加标注 ({{ customMarkers.length }})</span>
                <button class="small-btn" @click="exportMarkers">💾 导出</button>
              </div>
              <div 
                v-for="(marker, index) in customMarkers" 
                :key="index"
                class="marker-item"
                @click="focusMarker(index)"
              >
                <span class="marker-icon">{{ marker.type === 'marker' ? '📍' : marker.type === 'circle' ? '⭕' : marker.type === 'line' ? '➖' : '🔷' }}</span>
                <span class="marker-name">{{ marker.name || '未命名' }}</span>
                <button class="delete-btn" @click.stop="deleteMarker(index)">×</button>
              </div>
            </div>

            <div v-if="editorMode" class="editor-actions">
              <button class="action-btn primary" @click="saveAllMarkers">💾 保存</button>
              <button class="action-btn" @click="clearAllMarkers">🗑️ 清空</button>
            </div>
          </div>
          
          <div id="portfolio-map" class="map-container"></div>
          
          <!-- 弹出信息窗口 -->
          <div v-if="popupVisible" class="custom-popup" :style="{ left: popupX + 'px', top: popupY + 'px' }">
            <div class="popup-header">
              <h4>{{ popupData.title }}</h4>
              <button class="popup-close" @click="closePopup">×</button>
            </div>
            <div class="popup-content">
              <img v-if="popupData.image" :src="popupData.image" :alt="popupData.title" class="popup-image">
              <p>{{ popupData.description }}</p>
              <div class="popup-meta">
                <span v-if="popupData.date">📅 {{ popupData.date }}</span>
                <span v-if="popupData.rating">⭐ {{ popupData.rating }}/5</span>
              </div>
              <div class="popup-actions" v-if="popupData.type">
                <button class="action-btn edit" @click="editItem(popupData)">✏️ 编辑</button>
                <button class="action-btn delete" @click="deleteItem(popupData)">🗑️ 删除</button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 个人足迹时间线 -->
        <div v-if="activeModule === 'timeline'" class="timeline-container">
          <div class="panel-header">
            <h3>🚶 旅行时间线</h3>
            <button class="add-btn" @click="openAddTripDialog">➕ 添加旅行</button>
          </div>
          <div class="timeline">
            <div 
              v-for="(trip, index) in travelTimeline" 
              :key="index" 
              class="timeline-item"
              :class="{ active: selectedTrip === index }"
              @click="selectTrip(index)"
            >
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <h4>{{ trip.city }} · {{ trip.province }}</h4>
                <p class="timeline-date">{{ trip.date }}</p>
                <p class="timeline-desc">{{ trip.description }}</p>
              </div>
              <div class="timeline-actions">
                <button class="icon-btn" @click.stop="editTrip(trip, index)" title="编辑">✏️</button>
                <button class="icon-btn delete" @click.stop="deleteTrip(index)" title="删除">🗑️</button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 兴趣点列表 -->
        <div v-if="activeModule === 'points'" class="points-list">
          <div class="panel-header">
            <h3>📍 我的兴趣点</h3>
            <button class="add-btn" @click="openAddPointDialog">➕ 添加兴趣点</button>
          </div>
          <div class="points-grid">
            <div 
              v-for="(point, index) in filteredPoints" 
              :key="index" 
              class="point-card"
              @click="showPointInfo(point, index)"
            >
              <div class="point-image-placeholder">
                <img :src="point.image" :alt="point.name" class="point-image">
              </div>
              <div class="point-info">
                <h4>{{ point.name }}</h4>
                <p>{{ point.location }}</p>
                <div class="point-rating">
                  <span v-for="i in 5" :key="i" :class="['star', { filled: i <= point.rating }]">★</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 专题图面板 -->
        <div v-if="activeModule === 'thematic'" class="thematic-panel">
          <div class="panel-header">
            <h3>🗺️ 中国省份专题图</h3>
          </div>
          <div class="thematic-info">
            <p>📊 当前显示：<strong>{{ fieldLabels[dataField] }}</strong></p>
            <div class="legend-items">
              <div v-for="(item, index) in legendItems" :key="index" class="legend-item">
                <span class="legend-color" :style="{ background: item.color }"></span>
                <span class="legend-label">{{ item.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    
    <!-- 添加/编辑旅行对话框 -->
    <div v-if="showTripDialog" class="dialog-overlay" @click="closeTripDialog">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <h3>{{ editingTripIndex >= 0 ? '✏️ 编辑旅行' : '➕ 添加旅行' }}</h3>
          <button class="popup-close" @click="closeTripDialog">×</button>
        </div>
        <div class="dialog-content">
          <div class="form-group">
            <label>城市名称</label>
            <input v-model="tripForm.city" type="text" placeholder="例如：北京">
          </div>
          <div class="form-group">
            <label>所属省份</label>
            <input v-model="tripForm.province" type="text" placeholder="例如：北京">
          </div>
          <div class="form-group">
            <label>旅行日期</label>
            <input v-model="tripForm.date" type="month">
          </div>
          <div class="form-group">
            <label>旅行描述</label>
            <textarea v-model="tripForm.description" rows="3" placeholder="描述你的旅行经历..."></textarea>
          </div>
          <div class="form-group">
            <label>经度</label>
            <input v-model.number="tripForm.lng" type="number" step="0.01" placeholder="116.40">
          </div>
          <div class="form-group">
            <label>纬度</label>
            <input v-model.number="tripForm.lat" type="number" step="0.01" placeholder="39.90">
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn cancel" @click="closeTripDialog">取消</button>
          <button class="btn confirm" @click="saveTrip">{{ editingTripIndex >= 0 ? '保存' : '添加' }}</button>
        </div>
      </div>
    </div>
    
    <!-- 添加/编辑兴趣点对话框 -->
    <div v-if="showPointDialog" class="dialog-overlay" @click="closePointDialog">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <h3>{{ editingPointIndex >= 0 ? '✏️ 编辑兴趣点' : '➕ 添加兴趣点' }}</h3>
          <button class="popup-close" @click="closePointDialog">×</button>
        </div>
        <div class="dialog-content">
          <div class="form-group">
            <label>地点名称</label>
            <input v-model="pointForm.name" type="text" placeholder="例如：故宫博物院">
          </div>
          <div class="form-group">
            <label>所在城市</label>
            <input v-model="pointForm.location" type="text" placeholder="例如：北京">
          </div>
          <div class="form-group">
            <label>分类</label>
            <select v-model="pointForm.category">
              <option value="scenic">🏞️ 景点</option>
              <option value="food">🍜 美食</option>
              <option value="culture">🏛️ 文化</option>
              <option value="nature">🌲 自然</option>
            </select>
          </div>
          <div class="form-group">
            <label>评分（1-5星）</label>
            <div class="rating-input">
              <button 
                v-for="i in 5" 
                :key="i" 
                :class="['star-btn', { active: i <= pointForm.rating }]"
                @click="pointForm.rating = i"
              >★</button>
            </div>
          </div>
          <div class="form-group">
            <label>图片URL</label>
            <input v-model="pointForm.image" type="text" placeholder="输入图片网址">
          </div>
          <div class="form-group">
            <label>经度</label>
            <input v-model.number="pointForm.lng" type="number" step="0.01" placeholder="116.40">
          </div>
          <div class="form-group">
            <label>纬度</label>
            <input v-model.number="pointForm.lat" type="number" step="0.01" placeholder="39.90">
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn cancel" @click="closePointDialog">取消</button>
          <button class="btn confirm" @click="savePoint">{{ editingPointIndex >= 0 ? '保存' : '添加' }}</button>
        </div>
      </div>
    </div>
    
    <!-- 页脚 -->
    <footer class="portfolio-footer">
      <p>© 2026 GIS 作品集 | 用 MapLibre GL JS 构建</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import maplibregl from 'maplibre-gl'

// ============ 响应式状态 ============
const activeModule = ref('timeline')
const activeCategory = ref('all')
const dataField = ref('population')
const selectedTrip = ref(-1)
const selectedPoint = ref(-1)
const popupVisible = ref(false)
const popupX = ref(0)
const popupY = ref(0)
const popupData = ref({})
const currentBasemap = ref('vec')

// 图层可见性状态（多图层叠加）
const layerVisibility = ref({
  travel: true,    // 个人足迹层
  points: false,   // 兴趣点层
  thematic: false  // 专题图层
})

// 标注编辑器状态
const editorMode = ref(false)
const editorTool = ref('marker')
const customMarkers = ref([])
const drawMode = ref(false)
const tempCoordinates = ref([])
const tempCircles = ref([])
let drawSource = null
let drawLayer = null

// 对话框状态
const showTripDialog = ref(false)
const showPointDialog = ref(false)
const editingTripIndex = ref(-1)
const editingPointIndex = ref(-1)

// 表单数据
const tripForm = ref({ city: '', province: '', date: '', description: '', lng: 0, lat: 0 })
const pointForm = ref({ name: '', location: '', category: 'scenic', rating: 5, image: '', lng: 0, lat: 0 })

let map = null

// ============ 配置数据 ============
const modules = [
  { id: 'timeline', name: '个人足迹', icon: '🚶' },
  { id: 'points', name: '兴趣点', icon: '⭐' },
  { id: 'thematic', name: '专题图', icon: '🗺️' }
]

const pointCategories = [
  { id: 'all', name: '全部', icon: '📌' },
  { id: 'scenic', name: '景点', icon: '🏞️' },
  { id: 'food', name: '美食', icon: '🍜' },
  { id: 'culture', name: '文化', icon: '🏛️' },
  { id: 'nature', name: '自然', icon: '🌲' }
]

const fieldLabels = {
  population: '人口数量（万）',
  gdp: 'GDP总量（亿元）',
  density: '人口密度（人/km²）'
}

// ============ 旅行时间线数据（2023-2026.6） ============
const travelTimeline = ref([
  { city: '北京', province: '北京', date: '2023-01', description: '元旦假期，游览故宫、天安门广场', coordinates: [116.4, 39.9] },
  { city: '西安', province: '陕西', date: '2023-04', description: '清明假期，探索兵马俑、古城墙', coordinates: [108.95, 34.27] },
  { city: '成都', province: '四川', date: '2023-07', description: '暑假旅行，熊猫基地、宽窄巷子', coordinates: [104.06, 30.57] },
  { city: '杭州', province: '浙江', date: '2023-10', description: '国庆假期，西湖美景、龙井茶园', coordinates: [120.15, 30.28] },
  { city: '上海', province: '上海', date: '2024-02', description: '春节假期，外滩、豫园', coordinates: [121.47, 31.23] },
  { city: '重庆', province: '重庆', date: '2024-05', description: '五一假期，洪崖洞、解放碑', coordinates: [106.54, 29.59] },
  { city: '广州', province: '广东', date: '2024-08', description: '暑假旅行，白云山、珠江夜游', coordinates: [113.23, 23.13] },
  { city: '武汉', province: '湖北', date: '2024-11', description: '秋游武汉大学、黄鹤楼', coordinates: [114.31, 30.52] },
  { city: '南京', province: '江苏', date: '2025-02', description: '春节南京之旅，中山陵、夫子庙', coordinates: [118.78, 32.06] },
  { city: '厦门', province: '福建', date: '2025-06', description: '端午节假期，鼓浪屿、环岛路', coordinates: [118.1, 24.48] },
  { city: '青岛', province: '山东', date: '2025-10', description: '国庆假期栈桥、崂山', coordinates: [120.38, 36.07] },
  { city: '哈尔滨', province: '黑龙江', date: '2026-02', description: '春节冰雪之旅，中央大街、索菲亚教堂', coordinates: [126.53, 45.8] }
])

// ============ 兴趣点数据（真实地标图片） ============
const pointsOfInterest = ref([
  { name: '故宫博物院', location: '北京', category: 'culture', rating: 5, image: 'https://images.unsplash.com/photo-1595534648403-897a98919b99?w=400&h=300&fit=crop', coordinates: [116.397, 39.916] },
  { name: '天安门广场', location: '北京', category: 'culture', rating: 5, image: 'https://images.unsplash.com/photo-1552531604-10006e1e3a44?w=400&h=300&fit=crop', coordinates: [116.397, 39.904] },
  { name: '西湖', location: '杭州', category: 'nature', rating: 5, image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop', coordinates: [120.15, 30.28] },
  { name: '龙井村', location: '杭州', category: 'food', rating: 4, image: 'https://images.unsplash.com/photo-1523416474461-16964db7955e?w=400&h=300&fit=crop', coordinates: [120.08, 30.23] },
  { name: '宽窄巷子', location: '成都', category: 'culture', rating: 4, image: 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=400&h=300&fit=crop', coordinates: [104.04, 30.67] },
  { name: '成都大熊猫繁育研究基地', location: '成都', category: 'nature', rating: 5, image: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400&h=300&fit=crop', coordinates: [104.14, 30.73] },
  { name: '兵马俑', location: '西安', category: 'culture', rating: 5, image: 'https://images.unsplash.com/photo-1585126606897-937271570d61?w=400&h=300&fit=crop', coordinates: [109.27, 34.38] },
  { name: '大雁塔', location: '西安', category: 'culture', rating: 4, image: 'https://images.unsplash.com/photo-1580283487696-3467b7f81132?w=400&h=300&fit=crop', coordinates: [108.96, 34.22] },
  { name: '外滩', location: '上海', category: 'scenic', rating: 5, image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=300&fit=crop', coordinates: [121.49, 31.24] },
  { name: '豫园', location: '上海', category: 'culture', rating: 4, image: 'https://images.unsplash.com/photo-1540206351-d64654c68348?w=400&h=300&fit=crop', coordinates: [121.49, 31.23] },
  { name: '洪崖洞', location: '重庆', category: 'scenic', rating: 5, image: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400&h=300&fit=crop', coordinates: [106.58, 29.61] },
  { name: '解放碑', location: '重庆', category: 'culture', rating: 4, image: 'https://images.unsplash.com/photo-1534356719629-77646fdf7333?w=400&h=300&fit=crop', coordinates: [106.57, 29.56] }
])

// ============ 省份专题数据 ============
const provinceData = ref([
  { name: '北京', population: 2184, gdp: 41611, density: 1323 },
  { name: '上海', population: 2487, gdp: 47218, density: 3923 },
  { name: '天津', population: 1387, gdp: 16311, density: 1159 },
  { name: '重庆', population: 3212, gdp: 29129, density: 390 },
  { name: '河北', population: 7424, gdp: 42370, density: 396 },
  { name: '山西', population: 3481, gdp: 25698, density: 223 },
  { name: '辽宁', population: 4229, gdp: 28975, density: 289 },
  { name: '吉林', population: 2375, gdp: 13070, density: 126 },
  { name: '黑龙江', population: 3125, gdp: 15901, density: 68 },
  { name: '江苏', population: 8515, gdp: 122876, density: 794 },
  { name: '浙江', population: 6577, gdp: 77715, density: 620 },
  { name: '安徽', population: 6121, gdp: 45045, density: 437 },
  { name: '福建', population: 4188, gdp: 53109, density: 334 },
  { name: '江西', population: 4528, gdp: 32074, density: 271 },
  { name: '山东', population: 10152, gdp: 87435, density: 642 },
  { name: '河南', population: 9872, gdp: 61345, density: 590 },
  { name: '湖北', population: 5830, gdp: 53734, density: 314 },
  { name: '湖南', population: 6604, gdp: 47050, density: 312 },
  { name: '广东', population: 12684, gdp: 129119, density: 705 },
  { name: '海南', population: 1020, gdp: 6818, density: 289 },
  { name: '四川', population: 8372, gdp: 56749, density: 172 },
  { name: '贵州', population: 3856, gdp: 20165, density: 219 },
  { name: '云南', population: 4721, gdp: 28954, density: 120 },
  { name: '陕西', population: 3956, gdp: 32773, density: 193 },
  { name: '甘肃', population: 2502, gdp: 10243, density: 56 },
  { name: '青海', population: 594, gdp: 36230, density: 8 },
  { name: '内蒙古', population: 2405, gdp: 23159, density: 20 },
  { name: '广西', population: 5037, gdp: 24717, density: 212 },
  { name: '西藏', population: 364, gdp: 2206, density: 3 },
  { name: '宁夏', population: 720, gdp: 5314, density: 108 },
  { name: '新疆', population: 2587, gdp: 17741, density: 16 },
  { name: '香港', population: 750, gdp: 28663, density: 6800 },
  { name: '澳门', population: 68, gdp: 4347, density: 21350 },
  { name: '台湾', population: 2356, gdp: 53000, density: 673 }
])

const provinceCenters = {
  '北京': [116.4, 39.9], '上海': [121.47, 31.23], '天津': [117.2, 39.13], '重庆': [106.54, 29.59],
  '河北': [114.5, 38.0], '山西': [112.5, 37.9], '辽宁': [123.0, 41.8], '吉林': [126.5, 43.8],
  '黑龙江': [128.5, 47.5], '江苏': [118.78, 32.04], '浙江': [120.15, 30.28], '安徽': [117.27, 31.86],
  '福建': [119.3, 26.08], '江西': [115.9, 28.68], '山东': [117.0, 36.65], '河南': [113.65, 34.76],
  '湖北': [114.31, 30.52], '湖南': [112.94, 28.23], '广东': [113.26, 23.13], '海南': [110.35, 20.02],
  '四川': [104.06, 30.57], '贵州': [106.71, 26.6], '云南': [101.5, 25.04], '陕西': [108.95, 34.27],
  '甘肃': [103.83, 36.06], '青海': [101.78, 36.56], '内蒙古': [111.7, 40.8], '广西': [108.33, 22.84],
  '西藏': [91.1, 29.65], '宁夏': [106.26, 38.47], '新疆': [87.6, 43.79], '香港': [114.1, 22.4],
  '澳门': [113.5, 22.2], '台湾': [121.0, 24.0]
}

// ============ 计算属性 ============
const travelStats = computed(() => {
  const cities = new Set(travelTimeline.value.map(t => t.city))
  const provinces = new Set(travelTimeline.value.map(t => t.province))
  return {
    cities: cities.size,
    provinces: provinces.size,
    days: travelTimeline.value.length * 3,
    photos: travelTimeline.value.length * 280
  }
})

const filteredPoints = computed(() => {
  if (activeCategory.value === 'all') {
    return pointsOfInterest.value
  }
  return pointsOfInterest.value.filter(p => p.category === activeCategory.value)
})

const legendItems = computed(() => {
  const field = dataField.value
  const data = provinceData.value
  const values = data.map(p => p[field]).sort((a, b) => a - b)
  const min = values[0]
  const max = values[values.length - 1]
  const colors = ['#fee5d9', '#fcae91', '#fb6a4a', '#de2d26', '#a50f15']
  
  const thresholds = []
  for (let i = 0; i < 5; i++) {
    const val = min + (max - min) * i / 4
    thresholds.push(val)
  }
  
  return [
    { color: colors[4], label: `> ${Math.round(thresholds[4])}` },
    { color: colors[3], label: `${Math.round(thresholds[3])} - ${Math.round(thresholds[4])}` },
    { color: colors[2], label: `${Math.round(thresholds[2])} - ${Math.round(thresholds[3])}` },
    { color: colors[1], label: `${Math.round(thresholds[1])} - ${Math.round(thresholds[2])}` },
    { color: colors[0], label: `< ${Math.round(thresholds[1])}` }
  ]
})

// ============ 地图功能 ============
const basemapStyles = {
  vec: {
    version: 8,
    sources: {
      'gaode-vec': {
        type: 'raster',
        tiles: [
          'https://wprd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}',
          'https://wprd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}',
          'https://wprd03.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}',
          'https://wprd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}'
        ],
        tileSize: 256,
        attribution: '© 高德地图',
        maxzoom: 19
      }
    },
    layers: [
      {
        id: 'gaode-vec-tiles',
        type: 'raster',
        source: 'gaode-vec',
        minzoom: 0,
        maxzoom: 19
      }
    ]
  },
  satellite: {
    version: 8,
    sources: {
      'gaode-satellite': {
        type: 'raster',
        tiles: [
          'https://webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
          'https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
          'https://webst03.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
          'https://webst04.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}'
        ],
        tileSize: 256,
        attribution: '© 高德地图',
        maxzoom: 19
      }
    },
    layers: [
      {
        id: 'gaode-satellite-tiles',
        type: 'raster',
        source: 'gaode-satellite',
        minzoom: 0,
        maxzoom: 19
      }
    ]
  },
}

const switchBasemap = () => {
  if (map) {
    map.setStyle(basemapStyles[currentBasemap.value])
    
    // 等待新样式加载完成后，添加数据图层
    map.once('style.load', () => {
      refreshAllLayers()
    })
  }
}

const initMap = () => {
  map = new maplibregl.Map({
    container: 'portfolio-map',
    style: basemapStyles[currentBasemap.value],
    center: [104.1954, 35.8617],
    zoom: 4
  })
  
  // 添加导航控件（缩放按钮）
  map.addControl(new maplibregl.NavigationControl(), 'top-right')
  
  // 添加比例尺控件
  map.addControl(new maplibregl.ScaleControl({
    maxWidth: 100,
    unit: 'metric'
  }), 'bottom-left')
  
  // 添加坐标显示控件
  map.on('load', () => {
    const coords = document.createElement('div')
    coords.className = 'coords-control'
    coords.innerHTML = '<div>经纬度: --, --</div>'
    map.getContainer().appendChild(coords)
    
    map.on('mousemove', (e) => {
      coords.innerHTML = `<div>经纬度: ${e.lngLat.lng.toFixed(4)}, ${e.lngLat.lat.toFixed(4)}</div>`
    })
  })
}

const clearMapLayers = (layerType = null) => {
  if (!map) return
  
  const layerMap = {
    travel: { layers: ['travel-markers', 'travel-labels'], sources: ['travel-points'] },
    points: { layers: ['interest-markers', 'interest-labels'], sources: ['interest-points'] },
    thematic: { layers: ['province-circles', 'province-labels'], sources: ['province-data'] }
  }
  
  if (layerType && layerMap[layerType]) {
    // 清除特定类型的图层
    try {
      layerMap[layerType].layers.forEach(layer => {
        if (map.getLayer(layer)) map.removeLayer(layer)
      })
      layerMap[layerType].sources.forEach(source => {
        if (map.getSource(source)) map.removeSource(source)
      })
    } catch (e) {
      console.warn('清除图层时出错:', e)
    }
  } else {
    // 清除所有数据图层（不涉及底图）
    try {
      Object.values(layerMap).forEach(({ layers, sources }) => {
        layers.forEach(layer => {
          if (map.getLayer(layer)) map.removeLayer(layer)
        })
        sources.forEach(source => {
          if (map.getSource(source)) map.removeSource(source)
        })
      })
    } catch (e) {
      console.warn('清除图层时出错:', e)
    }
  }
}

// ============ 标注编辑器功能 ============
// 切换编辑模式
const toggleEditorMode = () => {
  editorMode.value = !editorMode.value
  if (editorMode.value) {
    // 启用编辑模式时，添加地图点击监听
    map.getCanvas().style.cursor = 'crosshair'
    map.on('click', handleMapClick)
  } else {
    // 退出编辑模式时，移除监听并恢复光标
    map.getCanvas().style.cursor = ''
    map.off('click', handleMapClick)
    // 清除临时绘制
    if (drawSource) {
      map.removeLayer('draw-layer')
      map.removeSource('draw-source')
      drawSource = null
      drawLayer = null
    }
  }
}

// 设置编辑工具
const setEditorTool = (tool) => {
  editorTool.value = tool
  drawMode.value = false
  tempCoordinates.value = []
}

// 处理地图点击
const handleMapClick = (e) => {
  if (!editorMode.value) return
  
  const { lng, lat } = e.lngLat
  
  switch (editorTool.value) {
    case 'marker':
      // 添加标注点
      addMarkerPoint(lng, lat)
      break
    case 'circle':
      // 添加圆形区域（需要两次点击：中心点和半径点）
      addCirclePoint(lng, lat)
      break
    case 'line':
      // 添加线条（可多次点击添加点）
      addLinePoint(lng, lat)
      break
    case 'polygon':
      // 添加多边形（可多次点击添加顶点）
      addPolygonPoint(lng, lat)
      break
  }
}

// 添加标注点
const addMarkerPoint = (lng, lat) => {
  const marker = {
    type: 'marker',
    name: `标注点 ${customMarkers.value.length + 1}`,
    coordinates: [lng, lat],
    color: '#' + Math.floor(Math.random()*16777215).toString(16)
  }
  customMarkers.value.push(marker)
  renderCustomMarker(marker)
}

// 添加圆形区域
const addCirclePoint = (lng, lat) => {
  if (tempCoordinates.value.length === 0) {
    // 第一次点击：设置圆心
    tempCoordinates.value.push([lng, lat])
    alert('圆心已设置，请再次点击确定半径')
  } else {
    // 第二次点击：计算半径并创建圆
    const center = tempCoordinates.value[0]
    const radius = getDistanceFromLatLng(center[1], center[0], lat, lng)
    
    const circle = {
      type: 'circle',
      name: `圆形区域 ${tempCircles.value.length + 1}`,
      center: center,
      radius: radius,
      color: '#' + Math.floor(Math.random()*16777215).toString(16)
    }
    customMarkers.value.push(circle)
    tempCoordinates.value = []
    renderCustomCircle(circle)
  }
}

// 添加线条点
const addLinePoint = (lng, lat) => {
  tempCoordinates.value.push([lng, lat])
  
  if (tempCoordinates.value.length >= 2) {
    // 至少两个点后可以完成线条
    const line = {
      type: 'line',
      name: `线条 ${customMarkers.value.filter(m => m.type === 'line').length + 1}`,
      coordinates: [...tempCoordinates.value],
      color: '#' + Math.floor(Math.random()*16777215).toString(16)
    }
    customMarkers.value.push(line)
    tempCoordinates.value = []
    renderCustomLine(line)
  }
}

// 添加多边形点
const addPolygonPoint = (lng, lat) => {
  tempCoordinates.value.push([lng, lat])
  renderTempPolygon()
}

// 渲染临时多边形
const renderTempPolygon = () => {
  if (tempCoordinates.value.length < 2) return
  
  if (!drawSource) {
    map.addSource('draw-source', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] }
    })
    map.addLayer({
      id: 'draw-layer',
      type: 'line',
      source: 'draw-source',
      paint: {
        'line-color': '#ff0000',
        'line-width': 2,
        'line-dasharray': [2, 2]
      }
    })
    drawSource = true
  }
  
  const coordinates = [...tempCoordinates.value]
  if (editorTool.value === 'polygon') {
    coordinates.push(coordinates[0]) // 闭合多边形
  }
  
  map.getSource('draw-source').setData({
    type: 'Feature',
    geometry: {
      type: editorTool.value === 'polygon' ? 'Polygon' : 'LineString',
      coordinates: editorTool.value === 'polygon' ? [coordinates] : coordinates
    }
  })
}

// 完成多边形绘制
const finishPolygon = () => {
  if (tempCoordinates.value.length < 3) {
    alert('多边形至少需要3个顶点')
    return
  }
  
  const polygon = {
    type: 'polygon',
    name: `多边形 ${customMarkers.value.filter(m => m.type === 'polygon').length + 1}`,
    coordinates: [...tempCoordinates.value],
    color: '#' + Math.floor(Math.random()*16777215).toString(16)
  }
  customMarkers.value.push(polygon)
  tempCoordinates.value = []
  
  if (drawSource) {
    map.removeLayer('draw-layer')
    map.removeSource('draw-source')
    drawSource = null
  }
  
  renderCustomPolygon(polygon)
}

// 渲染自定义标注点
const renderCustomMarker = (marker) => {
  const el = document.createElement('div')
  el.className = 'custom-map-marker'
  el.style.backgroundColor = marker.color
  el.style.width = '20px'
  el.style.height = '20px'
  el.style.borderRadius = '50%'
  el.style.border = '2px solid white'
  el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'
  
  new maplibregl.Marker(el)
    .setLngLat(marker.coordinates)
    .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(`<h3>${marker.name}</h3>`))
    .addTo(map)
}

// 渲染自定义线条
const renderCustomLine = (line) => {
  map.addSource(`line-${customMarkers.value.indexOf(line)}`, {
    type: 'geojson',
    data: {
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: line.coordinates }
    }
  })
  
  map.addLayer({
    id: `line-layer-${customMarkers.value.indexOf(line)}`,
    type: 'line',
    source: `line-${customMarkers.value.indexOf(line)}`,
    paint: {
      'line-color': line.color,
      'line-width': 3
    }
  })
}

// 渲染自定义多边形
const renderCustomPolygon = (polygon) => {
  const coordinates = [...polygon.coordinates]
  coordinates.push(coordinates[0])
  
  map.addSource(`polygon-${customMarkers.value.indexOf(polygon)}`, {
    type: 'geojson',
    data: {
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [coordinates] }
    }
  })
  
  map.addLayer({
    id: `polygon-layer-${customMarkers.value.indexOf(polygon)}`,
    type: 'fill',
    source: `polygon-${customMarkers.value.indexOf(polygon)}`,
    paint: {
      'fill-color': polygon.color,
      'fill-opacity': 0.3
    }
  })
  
  map.addLayer({
    id: `polygon-outline-${customMarkers.value.indexOf(polygon)}`,
    type: 'line',
    source: `polygon-${customMarkers.value.indexOf(polygon)}`,
    paint: {
      'line-color': polygon.color,
      'line-width': 2
    }
  })
}

// 渲染自定义圆形
const renderCustomCircle = (circle) => {
  const points = 64
  const km = circle.radius / 1000
  const coordinates = []
  
  for (let i = 0; i < points; i++) {
    const bearing = (i * 360) / points
    coordinates.push(destinationPoint(circle.center[1], circle.center[0], km, bearing))
  }
  coordinates.push(coordinates[0])
  
  map.addSource(`circle-${customMarkers.value.indexOf(circle)}`, {
    type: 'geojson',
    data: {
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [coordinates] }
    }
  })
  
  map.addLayer({
    id: `circle-layer-${customMarkers.value.indexOf(circle)}`,
    type: 'fill',
    source: `circle-${customMarkers.value.indexOf(circle)}`,
    paint: {
      'fill-color': circle.color,
      'fill-opacity': 0.3
    }
  })
  
  map.addLayer({
    id: `circle-outline-${customMarkers.value.indexOf(circle)}`,
    type: 'line',
    source: `circle-${customMarkers.value.indexOf(circle)}`,
    paint: {
      'line-color': circle.color,
      'line-width': 2
    }
  })
}

// 工具函数：计算两点间距离（米）
const getDistanceFromLatLng = (lat1, lng1, lat2, lng2) => {
  const R = 6371000 // 地球半径（米）
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// 工具函数：基于起点、距离和方位角计算目标点
const destinationPoint = (lat, lng, dist, bearing) => {
  const R = 6371 // 地球半径（公里）
  const d = dist / R
  const brng = bearing * Math.PI / 180
  const lat1 = lat * Math.PI / 180
  const lng1 = lng * Math.PI / 180
  
  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(brng))
  const lng2 = lng1 + Math.atan2(Math.sin(brng) * Math.sin(d) * Math.cos(lat1), Math.cos(d) - Math.sin(lat1) * Math.sin(lat2))
  
  return [lng2 * 180 / Math.PI, lat2 * 180 / Math.PI]
}

// 聚焦标注
const focusMarker = (index) => {
  const marker = customMarkers.value[index]
  if (!marker) return
  
  if (marker.type === 'marker') {
    map.flyTo({ center: marker.coordinates, zoom: 12 })
  } else if (marker.center) {
    map.flyTo({ center: marker.center, zoom: 10 })
  } else if (marker.coordinates && marker.coordinates.length > 0) {
    map.flyTo({ center: marker.coordinates[0], zoom: 10 })
  }
}

// 删除标注
const deleteMarker = (index) => {
  const marker = customMarkers.value[index]
  if (!marker) return
  
  // 移除地图上的渲染
  if (marker.type === 'marker') {
    // 标注点已通过DOM添加，需要特殊处理
  } else {
    const idx = customMarkers.value.indexOf(marker)
    if (marker.type === 'line') {
      if (map.getLayer(`line-layer-${idx}`)) map.removeLayer(`line-layer-${idx}`)
      if (map.getSource(`line-${idx}`)) map.removeSource(`line-${idx}`)
    } else if (marker.type === 'polygon' || marker.type === 'circle') {
      if (map.getLayer(`${marker.type}-layer-${idx}`)) map.removeLayer(`${marker.type}-layer-${idx}`)
      if (map.getLayer(`${marker.type}-outline-${idx}`)) map.removeLayer(`${marker.type}-outline-${idx}`)
      if (map.getSource(`${marker.type}-${idx}`)) map.removeSource(`${marker.type}-${idx}`)
    }
  }
  
  customMarkers.value.splice(index, 1)
}

// 清空所有标注
const clearAllMarkers = () => {
  if (!confirm('确定要清空所有标注吗？')) return
  
  customMarkers.value.forEach((marker, idx) => {
    if (marker.type === 'marker') {
      // DOM标注点清理
    } else {
      if (map.getLayer(`${marker.type}-layer-${idx}`)) map.removeLayer(`${marker.type}-layer-${idx}`)
      if (map.getLayer(`${marker.type}-outline-${idx}`)) map.removeLayer(`${marker.type}-outline-${idx}`)
      if (map.getSource(`${marker.type}-${idx}`)) map.removeSource(`${marker.type}-${idx}`)
    }
  })
  
  customMarkers.value = []
}

// 保存所有标注（导出JSON）
const saveAllMarkers = () => {
  const dataStr = JSON.stringify(customMarkers.value, null, 2)
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
  
  const exportFileDefaultName = 'custom-markers.json'
  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', exportFileDefaultName)
  linkElement.click()
  
  alert(`已保存 ${customMarkers.value.length} 个标注到文件`)
}

// 导出标注
const exportMarkers = () => {
  saveAllMarkers()
}

// 切换图层可见性
const toggleLayer = (layerType) => {
  layerVisibility.value[layerType] = !layerVisibility.value[layerType]
  refreshAllLayers()
}

// 刷新所有图层
const refreshAllLayers = () => {
  // 先清除所有图层
  clearMapLayers()
  
  // 然后根据可见性状态添加图层
  if (layerVisibility.value.travel) {
    addTravelMarkers()
  }
  if (layerVisibility.value.points) {
    addInterestPoints()
  }
  if (layerVisibility.value.thematic) {
    addThematicLayer()
  }
}

const addTravelMarkers = () => {
  const geojsonData = {
    type: 'FeatureCollection',
    features: travelTimeline.value.map((trip, index) => ({
      type: 'Feature',
      properties: { name: trip.city, date: trip.date, index, description: trip.description },
      geometry: { type: 'Point', coordinates: trip.coordinates }
    }))
  }
  
  map.addSource('travel-points', { type: 'geojson', data: geojsonData })
  
  map.addLayer({
    id: 'travel-markers',
    type: 'circle',
    source: 'travel-points',
    paint: {
      'circle-color': ['case', ['==', ['get', 'index'], selectedTrip.value], '#ef4444', '#3b82f6'],
      'circle-radius': ['case', ['==', ['get', 'index'], selectedTrip.value], 20, 12],
      'circle-opacity': 0.9,
      'circle-stroke-width': 3,
      'circle-stroke-color': '#ffffff'
    }
  })
  
  map.addLayer({
    id: 'travel-labels',
    type: 'symbol',
    source: 'travel-points',
    layout: {
      'text-field': '{name}',
      'text-size': 12,
      'text-offset': [0, 1.5]
    },
    paint: { 'text-color': '#374151' }
  })
}

const showTravelMarkers = () => {
  layerVisibility.value.travel = true
  layerVisibility.value.points = false
  layerVisibility.value.thematic = false
  refreshAllLayers()
}

const addInterestPoints = () => {
  const geojsonData = {
    type: 'FeatureCollection',
    features: filteredPoints.value.map((point, index) => ({
      type: 'Feature',
      properties: { name: point.name, rating: point.rating, index, location: point.location },
      geometry: { type: 'Point', coordinates: point.coordinates }
    }))
  }
  
  map.addSource('interest-points', { type: 'geojson', data: geojsonData })
  
  const colorExpression = [
    'interpolate', ['linear'], ['get', 'rating'],
    1, '#ef4444', 2, '#f97316', 3, '#eab308', 4, '#22c55e', 5, '#3b82f6'
  ]
  
  map.addLayer({
    id: 'interest-markers',
    type: 'circle',
    source: 'interest-points',
    paint: {
      'circle-color': colorExpression,
      'circle-radius': ['interpolate', ['linear'], ['get', 'rating'], 1, 8, 5, 16],
      'circle-opacity': 0.9,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff'
    }
  })
  
  map.addLayer({
    id: 'interest-labels',
    type: 'symbol',
    source: 'interest-points',
    layout: {
      'text-field': '{name}',
      'text-size': 11,
      'text-offset': [0, 1.2]
    },
    paint: { 'text-color': '#1f2937' }
  })
}

const showInterestPoints = () => {
  layerVisibility.value.travel = false
  layerVisibility.value.points = true
  layerVisibility.value.thematic = false
  refreshAllLayers()
}

const addThematicLayer = () => {
  const features = provinceData.value.map(region => ({
    type: 'Feature',
    properties: {
      name: region.name,
      population: region.population,
      gdp: region.gdp,
      density: region.density
    },
    geometry: {
      type: 'Point',
      coordinates: provinceCenters[region.name] || [105, 35]
    }
  }))
  
  map.addSource('province-data', { 
    type: 'geojson', 
    data: { type: 'FeatureCollection', features } 
  })
  
  const field = dataField.value
  const colorRamp = ['#fee5d9', '#fcae91', '#fb6a4a', '#de2d26', '#a50f15']
  const values = provinceData.value.map(p => p[field])
  const maxValue = Math.max(...values)
  
  map.addLayer({
    id: 'province-circles',
    type: 'circle',
    source: 'province-data',
    paint: {
      'circle-color': ['interpolate', ['linear'], ['get', field], 0, colorRamp[0], maxValue * 0.25, colorRamp[1], maxValue * 0.5, colorRamp[2], maxValue * 0.75, colorRamp[3], maxValue, colorRamp[4]],
      'circle-radius': ['interpolate', ['linear'], ['get', field], 0, 8, maxValue, 30],
      'circle-opacity': 0.85,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff'
    }
  })
  
  map.addLayer({
    id: 'province-labels',
    type: 'symbol',
    source: 'province-data',
    layout: {
      'text-field': '{name}',
      'text-size': 10,
      'text-offset': [0, 1.5]
    },
    paint: { 'text-color': '#1f2937' }
  })
}

const showThematicMap = () => {
  layerVisibility.value.travel = false
  layerVisibility.value.points = false
  layerVisibility.value.thematic = true
  refreshAllLayers()
}

const updateThematicStyle = () => {
  layerVisibility.value.thematic = true
  refreshAllLayers()
}

// ============ 交互功能 ============
const switchModule = (moduleId) => {
  activeModule.value = moduleId
  selectedTrip.value = -1
  selectedPoint.value = -1
  closePopup()
  
  nextTick(() => {
    if (map) map.resize()
    if (moduleId === 'timeline') showTravelMarkers()
    else if (moduleId === 'points') showInterestPoints()
    else if (moduleId === 'thematic') showThematicMap()
  })
}

const filterPoints = (category) => {
  activeCategory.value = category
  showInterestPoints()
}

const selectTrip = (index) => {
  selectedTrip.value = index
  const trip = travelTimeline.value[index]
  map.flyTo({ center: trip.coordinates, zoom: 10 })
  
  popupData.value = {
    title: trip.city,
    description: trip.description,
    date: trip.date,
    type: 'trip',
    index,
    image: `https://picsum.photos/seed/${trip.city}/400/300`
  }
  
  popupX.value = 20
  popupY.value = 20
  popupVisible.value = true
}

const showPointInfo = (point, index) => {
  selectedPoint.value = index
  map.flyTo({ center: point.coordinates, zoom: 13 })
  
  popupData.value = {
    title: point.name,
    description: `位于${point.location}，评分为${point.rating}/5星`,
    rating: point.rating,
    type: 'point',
    index,
    image: point.image
  }
  
  popupX.value = 20
  popupY.value = 20
  popupVisible.value = true
}

const editItem = (data) => {
  closePopup()
  if (data.type === 'trip') {
    editTrip(data, data.index)
  } else if (data.type === 'point') {
    editPoint(data, data.index)
  }
}

const deleteItem = (data) => {
  closePopup()
  if (data.type === 'trip') {
    deleteTrip(data.index)
  } else if (data.type === 'point') {
    deletePoint(data.index)
  }
}

const closePopup = () => {
  popupVisible.value = false
}

// ============ 旅行 CRUD ============
const openAddTripDialog = () => {
  editingTripIndex.value = -1
  tripForm.value = { city: '', province: '', date: '', description: '', lng: 0, lat: 0 }
  showTripDialog.value = true
}

const editTrip = (trip, index) => {
  editingTripIndex.value = index
  tripForm.value = {
    city: trip.city,
    province: trip.province,
    date: trip.date,
    description: trip.description,
    lng: trip.coordinates[0],
    lat: trip.coordinates[1]
  }
  showTripDialog.value = true
}

const saveTrip = () => {
  if (!tripForm.value.city) {
    alert('请填写完整信息')
    return
  }
  
  const tripData = {
    city: tripForm.value.city,
    province: tripForm.value.province,
    date: tripForm.value.date,
    description: tripForm.value.description,
    coordinates: [tripForm.value.lng || 105, tripForm.value.lat || 35]
  }
  
  if (editingTripIndex.value >= 0) {
    travelTimeline.value[editingTripIndex.value] = tripData
  } else {
    travelTimeline.value.push(tripData)
  }
  
  travelTimeline.value.sort((a, b) => a.date.localeCompare(b.date))
  closeTripDialog()
  showTravelMarkers()
}

const deleteTrip = (index) => {
  if (confirm('确定要删除这条旅行记录吗？')) {
    travelTimeline.value.splice(index, 1)
    selectedTrip.value = -1
    showTravelMarkers()
  }
}

const closeTripDialog = () => {
  showTripDialog.value = false
  editingTripIndex.value = -1
}

// ============ 兴趣点 CRUD ============
const openAddPointDialog = () => {
  editingPointIndex.value = -1
  pointForm.value = { name: '', location: '', category: 'scenic', rating: 5, image: '', lng: 0, lat: 0 }
  showPointDialog.value = true
}

const editPoint = (point, index) => {
  editingPointIndex.value = index
  pointForm.value = {
    name: point.name,
    location: point.location,
    category: point.category,
    rating: point.rating,
    image: point.image,
    lng: point.coordinates[0],
    lat: point.coordinates[1]
  }
  showPointDialog.value = true
}

const savePoint = () => {
  if (!pointForm.value.name || !pointForm.value.location) {
    alert('请填写完整信息')
    return
  }
  
  const pointData = {
    name: pointForm.value.name,
    location: pointForm.value.location,
    category: pointForm.value.category,
    rating: pointForm.value.rating,
    image: pointForm.value.image || `https://picsum.photos/seed/${pointForm.value.name}/400/300`,
    coordinates: [pointForm.value.lng || 105, pointForm.value.lat || 35]
  }
  
  if (editingPointIndex.value >= 0) {
    pointsOfInterest.value[editingPointIndex.value] = pointData
  } else {
    pointsOfInterest.value.push(pointData)
  }
  
  closePointDialog()
  showInterestPoints()
}

const deletePoint = (index) => {
  if (confirm('确定要删除这个兴趣点吗？')) {
    pointsOfInterest.value.splice(index, 1)
    selectedPoint.value = -1
    showInterestPoints()
  }
}

const closePointDialog = () => {
  showPointDialog.value = false
  editingPointIndex.value = -1
}

// ============ 生命周期 ============
onMounted(() => {
  initMap()
  
  // 等待地图加载完成后刷新所有可见图层
  const loadLayers = () => {
    if (map && map.loaded()) {
      refreshAllLayers()
    } else if (map) {
      map.once('load', refreshAllLayers)
    }
  }
  
  // 延迟执行确保地图实例已创建
  setTimeout(loadLayers, 100)
  
  window.addEventListener('resize', () => {
    if (map) map.resize()
  })
})
</script>

<style scoped>
.portfolio-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

.portfolio-header {
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  flex-shrink: 0;
}

.header-left h1 {
  margin: 0;
  font-size: 1.4rem;
  color: #1f2937;
}

.header-left p {
  margin: 2px 0 0;
  color: #6b7280;
  font-size: 0.8rem;
}

.basemap-select {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.85rem;
  background: white;
}

.main-content {
  flex: 1;
  display: flex;
  width: 100%;
  padding: 12px;
  gap: 12px;
  overflow: hidden;
  box-sizing: border-box;
}

.sidebar {
  width: 240px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex-shrink: 0;
}

.nav-section h3 {
  margin: 0 0 10px;
  color: #374151;
  font-size: 0.9rem;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 8px;
}

.module-nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.nav-btn {
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  background: #f3f4f6;
  cursor: pointer;
  font-size: 0.85rem;
  text-align: left;
  transition: all 0.3s;
}

.nav-btn:hover { background: #e5e7eb; }
.nav-btn.active { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }

.info-panel {
  margin-top: 12px;
  padding: 10px;
  background: #f9fafb;
  border-radius: 8px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.panel-header h3 {
  margin: 0;
  font-size: 0.85rem;
  color: #4b5563;
}

.add-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  background: #3b82f6;
  color: white;
  font-size: 0.75rem;
  cursor: pointer;
}

.add-btn:hover { background: #2563eb; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.stat-item {
  text-align: center;
  padding: 8px;
  background: white;
  border-radius: 6px;
}

.stat-value {
  display: block;
  font-size: 1.2rem;
  font-weight: bold;
  color: #667eea;
}

.stat-label {
  font-size: 0.65rem;
  color: #9ca3af;
}

.category-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.cat-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 20px;
  background: #e5e7eb;
  cursor: pointer;
  font-size: 0.8rem;
}

.cat-btn:hover { background: #d1d5db; }
.cat-btn.active { background: #667eea; color: white; }

.field-select {
  width: 100%;
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.85rem;
}

.map-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
  min-width: 0;
}

.map-wrapper {
  position: relative;
  flex: 1;
  min-height: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  overflow: hidden;
}

.map-container {
  width: 100%;
  height: 100%;
  display: block;
}

.custom-popup {
  position: absolute;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  max-width: 260px;
  z-index: 1000;
  overflow: hidden;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.popup-header h4 {
  margin: 0;
  font-size: 0.9rem;
}

.popup-close {
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
}

.popup-content {
  padding: 10px;
}

.popup-image {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 8px;
}

.popup-content p {
  margin: 0 0 6px;
  color: #4b5563;
  font-size: 0.8rem;
}

.popup-meta {
  display: flex;
  gap: 10px;
  font-size: 0.75rem;
  color: #6b7280;
}

.popup-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.action-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
}

.action-btn.edit { background: #e5e7eb; }
.action-btn.delete { background: #fee2e2; color: #dc2626; }

.timeline-container, .points-list, .thematic-panel {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  flex-shrink: 0;
  height: 180px;
  overflow-y: auto;
}

.panel-header h3 {
  margin: 0 0 10px;
  color: #1f2937;
  font-size: 0.9rem;
}

.timeline {
  position: relative;
  padding-left: 15px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 4px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e5e7eb;
}

.timeline-item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 8px 10px;
  margin-bottom: 6px;
  background: #f9fafb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.timeline-item:hover { background: #f3f4f6; }
.timeline-item.active { background: linear-gradient(135deg, #eef2ff 0%, #f3e8ff 100%); border-left: 3px solid #667eea; }

.timeline-dot {
  position: absolute;
  left: -14px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #d1d5db;
  border: 2px solid white;
}

.timeline-item.active .timeline-dot { background: #667eea; }

.timeline-content {
  flex: 1;
}

.timeline-content h4 {
  margin: 0 0 2px;
  color: #1f2937;
  font-size: 0.85rem;
}

.timeline-date {
  margin: 0;
  font-size: 0.7rem;
  color: #667eea;
}

.timeline-desc {
  margin: 2px 0 0;
  font-size: 0.7rem;
  color: #9ca3af;
}

.timeline-actions {
  display: flex;
  gap: 4px;
}

.icon-btn {
  padding: 2px 4px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.7rem;
  opacity: 0.5;
}

.icon-btn:hover { opacity: 1; }
.icon-btn.delete:hover { color: #dc2626; }

.points-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
}

.point-card {
  background: #f9fafb;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s;
}

.point-card:hover { transform: translateY(-2px); }

.point-image-placeholder {
  width: 100%;
  height: 70px;
  background: #e5e7eb;
  overflow: hidden;
}

.point-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.point-info {
  padding: 8px;
}

.point-info h4 {
  margin: 0 0 2px;
  color: #1f2937;
  font-size: 0.8rem;
}

.point-info p {
  margin: 0 0 4px;
  font-size: 0.7rem;
  color: #6b7280;
}

.point-rating {
  font-size: 0.75rem;
}

.star { color: #e5e7eb; }
.star.filled { color: #eab308; }

.thematic-info p {
  margin: 0 0 8px;
  font-size: 0.85rem;
  color: #4b5563;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
}

.legend-color {
  width: 20px;
  height: 14px;
  border-radius: 2px;
  border: 1px solid #ddd;
}

.legend-label {
  color: #6b7280;
}

/* 对话框样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.dialog {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.dialog-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #1f2937;
}

.dialog-content {
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-size: 0.85rem;
  color: #4b5563;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.85rem;
  box-sizing: border-box;
}

.form-group textarea {
  resize: vertical;
}

.rating-input {
  display: flex;
  gap: 4px;
}

.star-btn {
  padding: 4px 8px;
  border: none;
  background: none;
  font-size: 1.2rem;
  color: #e5e7eb;
  cursor: pointer;
}

.star-btn.active { color: #eab308; }

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 15px 20px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
}

.btn.cancel { background: #e5e7eb; color: #4b5563; }
.btn.confirm { background: #667eea; color: white; }
.btn.confirm:hover { background: #5a67d8; }

.portfolio-footer {
  padding: 8px;
  text-align: center;
  background: rgba(255, 255, 255, 0.95);
  color: #6b7280;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.layer-control-panel {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  padding: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  z-index: 1000;
  min-width: 150px;
}

.layer-control-panel h4 {
  margin: 0 0 10px;
  font-size: 0.85rem;
  color: #1f2937;
  font-weight: 600;
}

.layer-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.2s;
  margin-bottom: 4px;
}

.layer-checkbox:hover {
  background: #f3f4f6;
}

.layer-checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.layer-checkbox span {
  font-size: 0.8rem;
  color: #374151;
}

/* 标注编辑器面板样式 */
.marker-editor-panel {
  position: absolute;
  top: 10px;
  right: 200px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  padding: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
}

.marker-editor-panel h4 {
  margin: 0 0 5px;
  font-size: 0.85rem;
  color: #1f2937;
  font-weight: 600;
}

.editor-btn {
  padding: 8px 12px;
  border: 2px solid #3b82f6;
  border-radius: 6px;
  background: white;
  color: #3b82f6;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.editor-btn:hover {
  background: #eff6ff;
}

.editor-btn.active {
  background: #3b82f6;
  color: white;
}

.editor-tools {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 5px;
}

.tool-btn {
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 5px;
  background: white;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.tool-btn:hover {
  background: #f3f4f6;
}

.tool-btn.active {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.marker-list {
  margin-top: 10px;
  border-top: 1px solid #e5e7eb;
  padding-top: 10px;
}

.marker-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.8rem;
  color: #6b7280;
}

.small-btn {
  padding: 3px 8px;
  border: 1px solid #3b82f6;
  border-radius: 4px;
  background: white;
  color: #3b82f6;
  cursor: pointer;
  font-size: 0.75rem;
}

.small-btn:hover {
  background: #eff6ff;
}

.marker-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background 0.2s;
}

.marker-item:hover {
  background: #f3f4f6;
}

.marker-icon {
  font-size: 1rem;
}

.marker-name {
  flex: 1;
  color: #374151;
}

.delete-btn {
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 50%;
  background: #ef4444;
  color: white;
  cursor: pointer;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn:hover {
  background: #dc2626;
}

.editor-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.editor-actions .action-btn {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.editor-actions .action-btn.primary {
  background: #3b82f6;
  color: white;
}

.editor-actions .action-btn.primary:hover {
  background: #2563eb;
}

.editor-actions .action-btn:not(.primary) {
  background: #e5e7eb;
  color: #374151;
}

.editor-actions .action-btn:not(.primary):hover {
  background: #d1d5db;
}

.basemap-switch-panel {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  padding: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.basemap-switch-panel h4 {
  margin: 0 0 5px;
  font-size: 0.85rem;
  color: #1f2937;
  font-weight: 600;
}

.basemap-btn {
  width: 45px;
  height: 45px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.basemap-btn:hover {
  border-color: #3b82f6;
  transform: scale(1.05);
}

.basemap-btn.active {
  border-color: #3b82f6;
  background: #eff6ff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.coords-control {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.9);
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.7rem;
  color: #374151;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  pointer-events: none;
}

/* 比例尺控件样式 */
.maplibregl-scale {
  background: rgba(255, 255, 255, 0.9) !important;
  border-radius: 6px !important;
  padding: 6px !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
}
</style>