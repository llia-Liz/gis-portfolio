<template>
  <div class="gis-layout">
    <!-- 登录页面不显示布局 -->
    <template v-if="!isAuthenticated && $route.name !== 'Login'">
      <router-view />
    </template>
    
    <!-- 已登录状态显示完整布局 -->
    <template v-else-if="isAuthenticated || $route.name === 'Login'">
      <!-- 登录页面单独显示 -->
      <template v-if="$route.name === 'Login'">
        <router-view />
      </template>
      
      <!-- 其他页面显示完整布局 -->
      <template v-else>
        <!-- 顶栏 -->
        <header class="gis-header">
          <div class="header-left">
            <h1 class="header-title">🌍 GIS 应用框架</h1>
          </div>
          
          <div class="header-right">
            <button class="theme-toggle" @click="toggleTheme">
              <span class="theme-icon">{{ isDarkTheme ? '🌙' : '☀️' }}</span>
              <span>{{ isDarkTheme ? '浅色' : '深色' }}</span>
            </button>
            <button class="logout-btn" @click="handleLogout">
              <span>🔓</span>
              <span>登出</span>
            </button>
          </div>
        </header>

        <!-- 主内容区域 -->
        <div class="gis-body">
          <!-- 左侧导航栏 -->
          <aside class="gis-sidebar">
            <nav class="sidebar-nav">
              <router-link 
                v-for="route in routes" 
                :key="route.name"
                :to="route.path"
                class="nav-item"
                :class="{ active: $route.name === route.name }"
              >
                <span class="nav-icon">{{ route.meta.icon }}</span>
                <span class="nav-label">{{ route.meta.title }}</span>
              </router-link>
            </nav>
            
            <!-- 分割线 -->
            <div class="sidebar-divider"></div>
            
            <!-- 工具按钮 -->
            <div class="sidebar-tools">
              <button 
                v-for="tool in tools" 
                :key="tool.id"
                class="tool-btn"
                :class="{ active: activeTool === tool.id }"
                :title="tool.label"
                @click="selectTool(tool.id)"
              >
                <span>{{ tool.icon }}</span>
              </button>
            </div>
          </aside>

          <!-- 主内容区域 - 路由视图 -->
          <main class="gis-content">
            <router-view />
          </main>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useMapStore } from './stores/mapStore'

const mapStore = useMapStore()

// 路由配置（与 router/index.js 同步）
const routes = [
  { path: '/', name: 'Map', meta: { title: '地图', icon: '🗺️' } },
  { path: '/geojson', name: 'GeoJson', meta: { title: 'GeoJSON专题', icon: '📈' } },
  { path: '/maplibre', name: 'MapLibre', meta: { title: 'MapLibre', icon: '🌍' } },
  { path: '/portfolio', name: 'Portfolio', meta: { title: 'GIS作品集', icon: '📁' } },
  { path: '/data', name: 'Data', meta: { title: '数据管理', icon: '📊' } },
  { path: '/tools', name: 'Tools', meta: { title: '工具集', icon: '🛠️' } },
  { path: '/about', name: 'About', meta: { title: '关于', icon: 'ℹ️' } }
]

// 工具列表
const tools = [
  { id: 'pan', label: '平移', icon: '✋' },
  { id: 'zoom-in', label: '放大', icon: '🔍+' },
  { id: 'zoom-out', label: '缩小', icon: '🔍-' },
  { id: 'measure-distance', label: '距离测量', icon: '📐' },
  { id: 'measure-area', label: '面积测量', icon: '📏' },
  { id: 'measure-angle', label: '角度测量', icon: '🔺' },
  { id: 'draw-point', label: '绘点', icon: '📍' },
  { id: 'draw-line', label: '绘线', icon: '📝' },
  { id: 'draw-polygon', label: '绘多边形', icon: '🔲' },
  { id: 'clear', label: '清除', icon: '🗑️' }
]

// 活动工具
const activeTool = ref('pan')

// 主题状态（从 store 获取）
const isDarkTheme = mapStore.isDarkTheme

// 登录状态
const isAuthenticated = computed(() => {
  return localStorage.getItem('userToken') !== null
})

// 切换主题
const toggleTheme = () => {
  mapStore.toggleTheme()
}

// 选择工具
const selectTool = (toolId) => {
  activeTool.value = toolId
  mapStore.setActiveTool(toolId)
}

// 登出
const handleLogout = () => {
  if (confirm('确定要登出吗？')) {
    // 清除登录状态
    localStorage.removeItem('userToken')
    localStorage.removeItem('username')
    
    // 跳转到登录页
    window.location.href = '/login'
  }
}

// 生命周期
onMounted(() => {
  // 初始化从本地存储恢复状态
  mapStore.initFromStorage()
})
</script>

<style scoped>
.gis-layout {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.gis-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.gis-sidebar {
  width: 60px;
  flex-shrink: 0;
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  overflow-y: auto;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 8px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 8px;
  border-radius: var(--border-radius);
  text-decoration: none;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.nav-item:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.nav-item.active {
  background-color: var(--accent-color);
  color: white;
}

.nav-icon {
  font-size: 1.25rem;
  margin-bottom: 4px;
}

.nav-label {
  font-size: 0.65rem;
  white-space: nowrap;
}

.sidebar-divider {
  height: 1px;
  background-color: var(--border-color);
  margin: 16px 8px;
}

.sidebar-tools {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 8px;
  flex: 1;
}

.tool-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 8px;
  border: none;
  border-radius: var(--border-radius);
  background-color: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: 1.1rem;
}

.tool-btn:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.tool-btn.active {
  background-color: var(--accent-color);
  color: white;
}

.gis-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%;
  min-height: 0;
}

.gis-content > * {
  flex: 1;
  width: 100%;
  min-height: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.theme-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: var(--border-radius);
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.theme-toggle:hover {
  background-color: var(--accent-color);
  color: white;
}

.theme-icon {
  font-size: 1rem;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: var(--border-radius);
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.logout-btn:hover {
  background-color: #ef4444;
  color: white;
}

@media (max-width: 768px) {
  .gis-sidebar {
    position: fixed;
    left: 0;
    top: 60px;
    bottom: 0;
    z-index: 100;
    transform: translateX(0);
    transition: transform var(--transition-normal);
  }
  
  .gis-sidebar.collapsed {
    transform: translateX(-100%);
  }
}
</style>