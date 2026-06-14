/**
 * 路由权限控制
 * 实现登录状态检查和页面访问控制
 */
import router from './index.js'

/**
 * 检查用户是否已登录
 * @returns {boolean}
 */
const isAuthenticated = () => {
  return localStorage.getItem('userToken') !== null
}

/**
 * 无需登录的路由白名单
 */
const whiteList = ['/login', '/about']

/**
 * 全局前置守卫
 * 在路由跳转前进行权限检查
 */
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - GIS 应用框架`
  }

  // 检查是否在白名单中
  if (whiteList.includes(to.path)) {
    next()
    return
  }

  // 检查用户是否登录
  if (isAuthenticated()) {
    next()
  } else {
    // 未登录时重定向到登录页
    next('/login')
  }
})

/**
 * 全局后置钩子
 * 路由跳转完成后的处理
 */
router.afterEach(() => {
  // 可以在这里添加页面访问日志等功能
})

export default router