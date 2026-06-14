<template>
  <div class="not-found-view">
    <div class="not-found-container">
      <div class="error-icon">
        <svg viewBox="0 0 128 128" fill="none">
          <circle cx="64" cy="64" r="56" stroke="var(--accent-primary)" stroke-width="4" stroke-linecap="round"/>
          <path d="M40 40L88 88M88 40L40 88" stroke="var(--accent-primary)" stroke-width="4" stroke-linecap="round"/>
          <circle cx="64" cy="92" r="12" fill="var(--accent-primary)"/>
        </svg>
      </div>
      
      <h1>404</h1>
      <p class="error-message">页面未找到</p>
      <p class="error-description">抱歉，您访问的页面不存在或已被删除</p>
      
      <div class="actions">
        <button class="btn btn-primary" @click="goHome">返回首页</button>
        <button class="btn btn-secondary" @click="goBack">返回上一页</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const goHome = () => {
  window.location.href = '/'
}

const goBack = () => {
  if (window.history.length > 1) {
    window.history.back()
  } else {
    goHome()
  }
}
</script>

<style scoped>
.not-found-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
}

.not-found-container {
  text-align: center;
  padding: 40px;
}

.error-icon {
  width: 128px;
  height: 128px;
  margin: 0 auto 30px;
}

h1 {
  font-size: 4rem;
  font-weight: 700;
  color: var(--accent-primary);
  margin: 0 0 16px 0;
}

.error-message {
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.error-description {
  font-size: 1rem;
  color: var(--text-muted);
  margin: 0 0 30px 0;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--accent-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--accent-primary-dark);
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.btn-secondary:hover {
  background: var(--bg-tertiary);
}
</style>