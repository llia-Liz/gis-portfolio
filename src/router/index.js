/**
 * Vue Router 路由配置
 * 配置多页面路由：地图/数据/工具集/关于/登录
 */
import { createRouter, createWebHistory } from 'vue-router'

// 路由定义
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { title: '登录', icon: '🔐', requiresAuth: false }
  },
  {
    path: '/',
    name: 'Map',
    component: () => import('../views/MapView.vue'),
    meta: { title: '地图', icon: '🗺️', requiresAuth: true }
  },
  {
    path: '/data',
    name: 'Data',
    component: () => import('../views/DataView.vue'),
    meta: { title: '数据管理', icon: '📊', requiresAuth: true }
  },
  {
    path: '/tools',
    name: 'Tools',
    component: () => import('../views/ToolsView.vue'),
    meta: { title: '工具集', icon: '🛠️', requiresAuth: true }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/AboutView.vue'),
    meta: { title: '关于', icon: 'ℹ️', requiresAuth: false }
  },
  {
    path: '/geojson',
    name: 'GeoJson',
    component: () => import('../views/GeoJsonView.vue'),
    meta: { title: 'GeoJSON专题地图', icon: '🗺️', requiresAuth: true }
  },
  {
    path: '/maplibre',
    name: 'MapLibre',
    component: () => import('../views/MapLibreView.vue'),
    meta: { title: 'MapLibre矢量瓦片', icon: '🌍', requiresAuth: true }
  },
  {
    path: '/portfolio',
    name: 'Portfolio',
    component: () => import('../views/PortfolioView.vue'),
    meta: { title: 'GIS作品集', icon: '📁', requiresAuth: true }
  },
  // 404 页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue'),
    meta: { title: '页面未找到', requiresAuth: false }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
  linkActiveClass: 'active',
  linkExactActiveClass: 'exact-active'
})

export default router