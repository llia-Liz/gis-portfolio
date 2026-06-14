<template>
  <div class="status-item">
    <span v-if="icon" class="status-icon">{{ icon }}</span>
    <span v-if="label" class="status-label">{{ label }}:</span>
    <span class="status-value">
      <span v-if="prefix" class="prefix">{{ prefix }}</span>
      {{ displayValue }}
      <span v-if="suffix" class="suffix">{{ suffix }}</span>
    </span>
  </div>
</template>

<script setup>
/**
 * 状态项组件
 * 功能：显示单个状态信息项
 * Props：icon, label, value, prefix, suffix
 */
import { computed } from 'vue'

// ==================== Props 定义 ====================
const props = defineProps({
  // 图标
  icon: {
    type: String,
    default: ''
  },
  // 标签文本
  label: {
    type: String,
    default: ''
  },
  // 数值
  value: {
    type: [String, Number],
    default: ''
  },
  // 前缀（如 "1:"）
  prefix: {
    type: String,
    default: ''
  },
  // 后缀（如 "个"、"米"）
  suffix: {
    type: String,
    default: ''
  }
})

// ==================== 计算属性 ====================
/**
 * 格式化后的显示值
 */
const displayValue = computed(() => {
  if (typeof props.value === 'number') {
    // 大数字使用科学计数法或简化显示
    if (props.value >= 1000000) {
      return (props.value / 1000000).toFixed(1) + 'M'
    }
    if (props.value >= 1000) {
      return (props.value / 1000).toFixed(1) + 'K'
    }
    return props.value.toLocaleString()
  }
  return props.value
})
</script>

<style scoped>
/* 状态项容器 */
.status-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 状态图标 */
.status-icon {
  font-size: 0.9rem;
}

/* 状态标签 */
.status-label {
  color: var(--text-muted);
  font-weight: 500;
}

/* 状态值 */
.status-value {
  color: var(--accent-primary);
  font-weight: 600;
}

/* 前缀和后缀 */
.prefix,
.suffix {
  color: var(--text-secondary);
  font-weight: normal;
}
</style>