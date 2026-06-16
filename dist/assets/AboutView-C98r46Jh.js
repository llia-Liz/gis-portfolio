import{_ as t,c as v,a as e,y as d,t as n,l as i,o as f}from"./index-BGi5PhrM.js";const o={class:"about-view"},c={class:"about-content"},l={class:"info-card"},p={class:"dev-info"},r={class:"dev-item"},u={__name:"AboutView",setup(h){const s=i(()=>new Date().toLocaleDateString("zh-CN",{year:"numeric",month:"long",day:"numeric"}));return(m,a)=>(f(),v("div",o,[a[5]||(a[5]=e("div",{class:"view-header"},[e("h1",null,"ℹ️ 关于系统"),e("p",null,"GIS 应用框架技术文档")],-1)),e("div",c,[a[4]||(a[4]=d(`<div class="info-card" data-v-92fe933e><h2 data-v-92fe933e>系统概述</h2><p data-v-92fe933e> 本系统是一个基于 Vue3 + Vite 构建的现代化 GIS 应用框架，提供完整的地图展示、数据管理和空间分析功能。 </p><p data-v-92fe933e> 系统采用组件化架构设计，支持主题切换、响应式布局和多端适配，是开发 GIS 应用的理想基础框架。 </p></div><div class="info-card" data-v-92fe933e><h2 data-v-92fe933e>技术栈</h2><div class="tech-stack" data-v-92fe933e><div class="tech-item" data-v-92fe933e><span class="tech-icon" data-v-92fe933e>💚</span><div data-v-92fe933e><strong data-v-92fe933e>Vue 3</strong><span class="tech-version" data-v-92fe933e>v3.4+</span></div></div><div class="tech-item" data-v-92fe933e><span class="tech-icon" data-v-92fe933e>⚡</span><div data-v-92fe933e><strong data-v-92fe933e>Vite</strong><span class="tech-version" data-v-92fe933e>v5.4+</span></div></div><div class="tech-item" data-v-92fe933e><span class="tech-icon" data-v-92fe933e>🍍</span><div data-v-92fe933e><strong data-v-92fe933e>Pinia</strong><span class="tech-version" data-v-92fe933e>v2.1+</span></div></div><div class="tech-item" data-v-92fe933e><span class="tech-icon" data-v-92fe933e>🚦</span><div data-v-92fe933e><strong data-v-92fe933e>Vue Router</strong><span class="tech-version" data-v-92fe933e>v4.2+</span></div></div><div class="tech-item" data-v-92fe933e><span class="tech-icon" data-v-92fe933e>🍃</span><div data-v-92fe933e><strong data-v-92fe933e>Leaflet</strong><span class="tech-version" data-v-92fe933e>v1.9+</span></div></div><div class="tech-item" data-v-92fe933e><span class="tech-icon" data-v-92fe933e>🎨</span><div data-v-92fe933e><strong data-v-92fe933e>Tailwind CSS</strong><span class="tech-version" data-v-92fe933e>v3.4+</span></div></div></div></div><div class="info-card" data-v-92fe933e><h2 data-v-92fe933e>功能特性</h2><div class="features-grid" data-v-92fe933e><div class="feature-item" data-v-92fe933e><span class="feature-icon" data-v-92fe933e>🗺️</span><h3 data-v-92fe933e>地图展示</h3><p data-v-92fe933e>支持多种底图服务，包括高德地图、OpenStreetMap 等</p></div><div class="feature-item" data-v-92fe933e><span class="feature-icon" data-v-92fe933e>📊</span><h3 data-v-92fe933e>数据管理</h3><p data-v-92fe933e>图层管理、数据统计、批量操作等功能</p></div><div class="feature-item" data-v-92fe933e><span class="feature-icon" data-v-92fe933e>🛠️</span><h3 data-v-92fe933e>测量工具</h3><p data-v-92fe933e>距离测量、面积测量、角度测量等工具</p></div><div class="feature-item" data-v-92fe933e><span class="feature-icon" data-v-92fe933e>🎨</span><h3 data-v-92fe933e>主题切换</h3><p data-v-92fe933e>支持深色/浅色主题切换，自动保存用户偏好</p></div><div class="feature-item" data-v-92fe933e><span class="feature-icon" data-v-92fe933e>📱</span><h3 data-v-92fe933e>响应式设计</h3><p data-v-92fe933e>完美适配桌面端、平板和移动设备</p></div><div class="feature-item" data-v-92fe933e><span class="feature-icon" data-v-92fe933e>⚡</span><h3 data-v-92fe933e>高性能</h3><p data-v-92fe933e>组件懒加载、虚拟滚动、缓存优化</p></div></div></div><div class="info-card" data-v-92fe933e><h2 data-v-92fe933e>项目结构</h2><pre class="code-block" data-v-92fe933e>src/
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
        </pre></div>`,4)),e("div",l,[a[3]||(a[3]=e("h2",null,"开发信息",-1)),e("div",p,[a[1]||(a[1]=e("div",{class:"dev-item"},[e("label",null,"项目版本"),e("span",null,"v1.0.0")],-1)),a[2]||(a[2]=e("div",{class:"dev-item"},[e("label",null,"开发框架"),e("span",null,"Vue 3 + Vite")],-1)),e("div",r,[a[0]||(a[0]=e("label",null,"最后更新",-1)),e("span",null,n(s.value),1)])])])])]))}},V=t(u,[["__scopeId","data-v-92fe933e"]]);export{V as default};
