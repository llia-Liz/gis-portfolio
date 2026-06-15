import{_ as s,c as t,a,y as c,t as v,l as n,o as i}from"./index-Cu_5cJW_.js";const o={class:"about-view"},l={class:"about-content"},b={class:"info-card"},p={class:"dev-info"},r={class:"dev-item"},u={__name:"AboutView",setup(h){const d=n(()=>new Date().toLocaleDateString("zh-CN",{year:"numeric",month:"long",day:"numeric"}));return(m,e)=>(i(),t("div",o,[e[5]||(e[5]=a("div",{class:"view-header"},[a("h1",null,"ℹ️ 关于系统"),a("p",null,"GIS 应用框架技术文档")],-1)),a("div",l,[e[4]||(e[4]=c(`<div class="info-card" data-v-7c3ebd60><h2 data-v-7c3ebd60>系统概述</h2><p data-v-7c3ebd60> 本系统是一个基于 Vue3 + Vite 构建的现代化 GIS 应用框架，提供完整的地图展示、数据管理和空间分析功能。 </p><p data-v-7c3ebd60> 系统采用组件化架构设计，支持主题切换、响应式布局和多端适配，是开发 GIS 应用的理想基础框架。 </p></div><div class="info-card" data-v-7c3ebd60><h2 data-v-7c3ebd60>技术栈</h2><div class="tech-stack" data-v-7c3ebd60><div class="tech-item" data-v-7c3ebd60><span class="tech-icon" data-v-7c3ebd60>💚</span><div data-v-7c3ebd60><strong data-v-7c3ebd60>Vue 3</strong><span class="tech-version" data-v-7c3ebd60>v3.4+</span></div></div><div class="tech-item" data-v-7c3ebd60><span class="tech-icon" data-v-7c3ebd60>⚡</span><div data-v-7c3ebd60><strong data-v-7c3ebd60>Vite</strong><span class="tech-version" data-v-7c3ebd60>v5.4+</span></div></div><div class="tech-item" data-v-7c3ebd60><span class="tech-icon" data-v-7c3ebd60>🍍</span><div data-v-7c3ebd60><strong data-v-7c3ebd60>Pinia</strong><span class="tech-version" data-v-7c3ebd60>v2.1+</span></div></div><div class="tech-item" data-v-7c3ebd60><span class="tech-icon" data-v-7c3ebd60>🚦</span><div data-v-7c3ebd60><strong data-v-7c3ebd60>Vue Router</strong><span class="tech-version" data-v-7c3ebd60>v4.2+</span></div></div><div class="tech-item" data-v-7c3ebd60><span class="tech-icon" data-v-7c3ebd60>🍃</span><div data-v-7c3ebd60><strong data-v-7c3ebd60>Leaflet</strong><span class="tech-version" data-v-7c3ebd60>v1.9+</span></div></div><div class="tech-item" data-v-7c3ebd60><span class="tech-icon" data-v-7c3ebd60>🎨</span><div data-v-7c3ebd60><strong data-v-7c3ebd60>Tailwind CSS</strong><span class="tech-version" data-v-7c3ebd60>v3.4+</span></div></div></div></div><div class="info-card" data-v-7c3ebd60><h2 data-v-7c3ebd60>功能特性</h2><div class="features-grid" data-v-7c3ebd60><div class="feature-item" data-v-7c3ebd60><span class="feature-icon" data-v-7c3ebd60>🗺️</span><h3 data-v-7c3ebd60>地图展示</h3><p data-v-7c3ebd60>支持多种底图服务，包括高德地图、OpenStreetMap 等</p></div><div class="feature-item" data-v-7c3ebd60><span class="feature-icon" data-v-7c3ebd60>📊</span><h3 data-v-7c3ebd60>数据管理</h3><p data-v-7c3ebd60>图层管理、数据统计、批量操作等功能</p></div><div class="feature-item" data-v-7c3ebd60><span class="feature-icon" data-v-7c3ebd60>🛠️</span><h3 data-v-7c3ebd60>测量工具</h3><p data-v-7c3ebd60>距离测量、面积测量、角度测量等工具</p></div><div class="feature-item" data-v-7c3ebd60><span class="feature-icon" data-v-7c3ebd60>🎨</span><h3 data-v-7c3ebd60>主题切换</h3><p data-v-7c3ebd60>支持深色/浅色主题切换，自动保存用户偏好</p></div><div class="feature-item" data-v-7c3ebd60><span class="feature-icon" data-v-7c3ebd60>📱</span><h3 data-v-7c3ebd60>响应式设计</h3><p data-v-7c3ebd60>完美适配桌面端、平板和移动设备</p></div><div class="feature-item" data-v-7c3ebd60><span class="feature-icon" data-v-7c3ebd60>⚡</span><h3 data-v-7c3ebd60>高性能</h3><p data-v-7c3ebd60>组件懒加载、虚拟滚动、缓存优化</p></div></div></div><div class="info-card" data-v-7c3ebd60><h2 data-v-7c3ebd60>项目结构</h2><pre class="code-block" data-v-7c3ebd60>src/
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
        </pre></div>`,4)),a("div",b,[e[3]||(e[3]=a("h2",null,"开发信息",-1)),a("div",p,[e[1]||(e[1]=a("div",{class:"dev-item"},[a("label",null,"项目版本"),a("span",null,"v1.0.0")],-1)),e[2]||(e[2]=a("div",{class:"dev-item"},[a("label",null,"开发框架"),a("span",null,"Vue 3 + Vite")],-1)),a("div",r,[e[0]||(e[0]=a("label",null,"最后更新",-1)),a("span",null,v(d.value),1)])])])])]))}},g=s(u,[["__scopeId","data-v-7c3ebd60"]]);export{g as default};
