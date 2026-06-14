<template>
  <div class="about-view">
    <div class="view-header">
      <h1>ℹ️ 关于系统</h1>
      <p>GIS 应用框架技术文档</p>
    </div>
    
    <div class="about-content">
      <!-- 系统介绍 -->
      <div class="info-card">
        <h2>系统概述</h2>
        <p>
          本系统是一个基于 Vue3 + Vite 构建的现代化 GIS 应用框架，提供完整的地图展示、数据管理和空间分析功能。
        </p>
        <p>
          系统采用组件化架构设计，支持主题切换、响应式布局和多端适配，是开发 GIS 应用的理想基础框架。
        </p>
      </div>
      
      <!-- 技术栈 -->
      <div class="info-card">
        <h2>技术栈</h2>
        <div class="tech-stack">
          <div class="tech-item">
            <span class="tech-icon">💚</span>
            <div>
              <strong>Vue 3</strong>
              <span class="tech-version">v3.4+</span>
            </div>
          </div>
          <div class="tech-item">
            <span class="tech-icon">⚡</span>
            <div>
              <strong>Vite</strong>
              <span class="tech-version">v5.4+</span>
            </div>
          </div>
          <div class="tech-item">
            <span class="tech-icon">🍍</span>
            <div>
              <strong>Pinia</strong>
              <span class="tech-version">v2.1+</span>
            </div>
          </div>
          <div class="tech-item">
            <span class="tech-icon">🚦</span>
            <div>
              <strong>Vue Router</strong>
              <span class="tech-version">v4.2+</span>
            </div>
          </div>
          <div class="tech-item">
            <span class="tech-icon">🍃</span>
            <div>
              <strong>Leaflet</strong>
              <span class="tech-version">v1.9+</span>
            </div>
          </div>
          <div class="tech-item">
            <span class="tech-icon">🎨</span>
            <div>
              <strong>Tailwind CSS</strong>
              <span class="tech-version">v3.4+</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 功能特性 -->
      <div class="info-card">
        <h2>功能特性</h2>
        <div class="features-grid">
          <div class="feature-item">
            <span class="feature-icon">🗺️</span>
            <h3>地图展示</h3>
            <p>支持多种底图服务，包括高德地图、OpenStreetMap 等</p>
          </div>
          <div class="feature-item">
            <span class="feature-icon">📊</span>
            <h3>数据管理</h3>
            <p>图层管理、数据统计、批量操作等功能</p>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🛠️</span>
            <h3>测量工具</h3>
            <p>距离测量、面积测量、角度测量等工具</p>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🎨</span>
            <h3>主题切换</h3>
            <p>支持深色/浅色主题切换，自动保存用户偏好</p>
          </div>
          <div class="feature-item">
            <span class="feature-icon">📱</span>
            <h3>响应式设计</h3>
            <p>完美适配桌面端、平板和移动设备</p>
          </div>
          <div class="feature-item">
            <span class="feature-icon">⚡</span>
            <h3>高性能</h3>
            <p>组件懒加载、虚拟滚动、缓存优化</p>
          </div>
        </div>
      </div>
      
      <!-- 项目结构 -->
      <div class="info-card">
        <h2>项目结构</h2>
        <pre class="code-block">
src/
├── components/          # 组件目录
│   ├── Map.vue         # 地图组件
│   ├── LayerList.vue   # 图层列表
│   ├── CoordinateDisplay.vue  # 坐标显示
│   ├── MapToolbar.vue  # 地图工具栏
│   ├── StatusBar.vue   # 状态栏
│   └── ...
├── views/              # 页面视图
│   ├── MapView.vue     # 地图页面
│   ├── DataView.vue    # 数据管理
│   ├── ToolsView.vue   # 工具页面
│   └── AboutView.vue   # 关于页面
├── stores/             # Pinia 状态管理
│   └── mapStore.js     # 地图状态
├── composables/        # 组合式函数
│   └── useLayers.js    # 图层逻辑复用
├── router/             # 路由配置
│   └── index.js        # 路由定义
├── utils/              # 工具函数
│   ├── geoUtils.js     # GIS 工具函数
│   ├── geoParser.js    # GeoJSON 解析
│   └── ...
├── App.vue             # 根组件
├── main.js             # 入口文件
└── style.css           # 全局样式
        </pre>
      </div>
      
      <!-- 开发团队 -->
      <div class="info-card">
        <h2>开发信息</h2>
        <div class="dev-info">
          <div class="dev-item">
            <label>项目版本</label>
            <span>v1.0.0</span>
          </div>
          <div class="dev-item">
            <label>开发框架</label>
            <span>Vue 3 + Vite</span>
          </div>
          <div class="dev-item">
            <label>最后更新</label>
            <span>{{ currentDate }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const currentDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})
</script>

<style scoped>
.about-view {
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

.about-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
  overflow-y: auto;
}

.info-card {
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  padding: 24px;
}

.info-card h2 {
  margin: 0 0 16px 0;
  font-size: 1.3rem;
}

.info-card p {
  margin: 0 0 12px 0;
  line-height: 1.6;
  color: var(--text-secondary);
}

.info-card p:last-child {
  margin-bottom: 0;
}

.tech-stack {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.tech-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-primary);
  border-radius: 8px;
}

.tech-icon {
  font-size: 1.5rem;
}

.tech-item div {
  display: flex;
  flex-direction: column;
}

.tech-item strong {
  font-size: 0.95rem;
}

.tech-version {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.feature-item {
  padding: 20px;
  background: var(--bg-primary);
  border-radius: 12px;
  text-align: center;
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
}

.feature-item h3 {
  margin: 0 0 8px 0;
  font-size: 1rem;
}

.feature-item p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.code-block {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 20px;
  border-radius: 8px;
  overflow-x: auto;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.85rem;
  line-height: 1.5;
  margin: 0;
}

.dev-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.dev-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--bg-primary);
  border-radius: 8px;
}

.dev-item label {
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .about-view {
    padding: 12px;
  }
  
  .info-card {
    padding: 16px;
  }
}
</style>