<template>
  <div class="geojson-map-wrapper">
    <div ref="mapContainer" class="leaflet-map"></div>
    
    <!-- 地图工具面板 -->
    <div class="geojson-panel">
      <div class="panel-header">
        <span>📊 GeoJSON 专题地图</span>
      </div>
      
      <!-- 图层切换 -->
      <div class="layer-switch-section">
        <div class="section-title">图层控制</div>
        <div class="layer-switch">
          <label>
            <input type="checkbox" v-model="showChoropleth" @change="toggleChoropleth" />
            <span>分级设色图</span>
          </label>
          <label>
            <input type="checkbox" v-model="showProportional" @change="toggleProportional" />
            <span>比例符号图</span>
          </label>
        </div>
      </div>
      
      <!-- 属性选择 -->
      <div class="attr-select-section">
        <div class="section-title">分级字段</div>
        <select v-model="choroplethField" @change="updateChoropleth">
          <option value="population">人口（人）</option>
          <option value="area">面积（km²）</option>
          <option value="gdp">GDP（亿元）</option>
          <option value="density">人口密度（人/km²）</option>
        </select>
      </div>
      
      <!-- 比例符号字段选择 -->
      <div class="attr-select-section">
        <div class="section-title">比例符号字段</div>
        <select v-model="proportionalField" @change="toggleProportional">
          <option value="population">人口（人）</option>
          <option value="gdp">GDP（亿元）</option>
          <option value="area">面积（km²）</option>
          <option value="density">人口密度（人/km²）</option>
        </select>
      </div>
      
      <!-- 配色方案 -->
      <div class="color-scheme-section">
        <div class="section-title">配色方案</div>
        <div class="color-schemes">
          <button 
            v-for="scheme in colorSchemes" 
            :key="scheme.name"
            @click="selectColorScheme(scheme)"
            :class="{ active: selectedScheme.name === scheme.name }"
            :title="scheme.desc"
          >
            <div class="color-preview" :style="{ background: scheme.gradient }"></div>
            <span>{{ scheme.name }}</span>
          </button>
        </div>
      </div>
      
      <!-- 图例 -->
      <div class="legend-section">
        <div class="section-title">图例</div>
        <div class="legend" v-if="showChoropleth">
          <div 
            v-for="(range, index) in legendRanges" 
            :key="index"
            class="legend-item"
          >
            <span class="legend-color" :style="{ backgroundColor: getColorForRange(index) }"></span>
            <span class="legend-text">{{ range }}</span>
          </div>
        </div>
        <div class="legend proportional-legend" v-if="showProportional">
          <div class="legend-title">{{ proportionalField === 'population' ? '人口' : proportionalField === 'gdp' ? 'GDP' : proportionalField === 'area' ? '面积' : '人口密度' }}比例符号</div>
          <div class="circle-scales">
            <div class="circle-item">
              <div class="scale-circle" :style="{ width: '20px', height: '20px' }"></div>
              <span>小</span>
            </div>
            <div class="circle-item">
              <div class="scale-circle" :style="{ width: '40px', height: '40px' }"></div>
              <span>中</span>
            </div>
            <div class="circle-item">
              <div class="scale-circle" :style="{ width: '60px', height: '60px' }"></div>
              <span>大</span>
            </div>
          </div>
        </div>
        
        <!-- 比例尺显示 -->
        <div class="scale-bar-section" v-if="map">
          <div class="section-title">比例尺</div>
          <div class="scale-bar">
            <div class="scale-bar-inner" :style="{ width: scaleBarWidth + 'px' }"></div>
            <span class="scale-label">{{ scaleBarLabel }}</span>
          </div>
        </div>
      </div>
      
      <!-- 配色说明 -->
      <div class="color-explanation">
        <div class="section-title">配色方案说明</div>
        <div class="explanation-text">
          <p><strong>顺序色带（Sequential）：</strong>适用于表示数值从低到高的渐进变化，如人口、GDP等。颜色从浅色渐变到深色，便于识别数值大小。</p>
          <p><strong>发散色带（Diverging）：</strong>适用于表示偏离某个中心值的数据，颜色从两端向中间过渡，突出极端值。</p>
          <p><strong>定性色带（Qualitative）：</strong>适用于分类数据，使用不同颜色区分不同类别，无数值含义。</p>
        </div>
      </div>
    </div>
    
    <!-- 信息弹窗 -->
    <div v-if="popupInfo" class="info-popup" :style="popupStyle">
      <div class="popup-header">{{ popupInfo.name }}</div>
      <div class="popup-content">
        <p>面积：{{ popupInfo.area }} km²</p>
        <p>人口：{{ popupInfo.population.toLocaleString() }} 人</p>
        <p>GDP：{{ popupInfo.gdp }} 亿元</p>
        <p>密度：{{ popupInfo.density }} 人/km²</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const mapContainer = ref(null)
let map = null
let geojsonLayer = null
let proportionalLayer = null

// 图层显示状态
const showChoropleth = ref(true)
const showProportional = ref(true)

// 属性字段
const choroplethField = ref('population')
const proportionalField = ref('population')

// 配色方案（增加颜色数量使分级更明显）
const colorSchemes = [
  { 
    name: '浅蓝-深蓝', 
    type: 'sequential',
    colors: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c'],
    gradient: 'linear-gradient(to right, #f7fbff, #08519c)',
    desc: '顺序色带 - 适合数值递增数据'
  },
  { 
    name: '浅红-深红', 
    type: 'sequential',
    colors: ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#99000d'],
    gradient: 'linear-gradient(to right, #fff5f0, #99000d)',
    desc: '顺序色带 - 适合突出高值'
  },
  { 
    name: '发散色', 
    type: 'diverging',
    colors: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#f7f7f7', '#e0e0e0', '#bababa', '#878787', '#4d4d4d', '#1a1a1a'],
    gradient: 'linear-gradient(to right, #67001f, #f7f7f7, #1a1a1a)',
    desc: '发散色带 - 适合偏离中心值的数据'
  },
  { 
    name: '彩虹色', 
    type: 'qualitative',
    colors: ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf'],
    gradient: 'linear-gradient(to right, #e41a1c, #377eb8, #4daf4a, #984ea3, #ff7f00, #ffff33, #a65628, #f781bf)',
    desc: '定性色带 - 适合分类数据'
  }
]

const selectedScheme = ref(colorSchemes[0])

// 地图数据
const geojsonData = ref(null)
const popupInfo = ref(null)
const popupStyle = ref({})

// 比例尺数据
const scaleBarWidth = ref(100)
const scaleBarLabel = ref('1000 km')

// 更新比例尺
const updateScaleBar = () => {
  if (!map) return
  const zoom = map.getZoom()
  // 根据缩放级别计算比例尺
  const scale = Math.pow(2, 18 - zoom) * 156543.0339
  const kmPerPixel = scale / 1000
  const width = 150 // 固定宽度
  const distance = kmPerPixel * width
  
  if (distance >= 1000) {
    scaleBarLabel.value = (distance / 1000).toFixed(0) + ' km'
  } else if (distance >= 1) {
    scaleBarLabel.value = distance.toFixed(0) + ' km'
  } else {
    scaleBarLabel.value = (distance * 1000).toFixed(0) + ' m'
  }
  scaleBarWidth.value = width
}

// 监听地图缩放变化
let scaleBarListener = null

// 图例范围（根据实际数据分布动态调整）
const legendRanges = computed(() => {
  if (!geojsonData.value) return []
  
  // 过滤有效数值
  let values = geojsonData.value.features
    .map(f => {
      let v = f.properties[choroplethField.value]
      if (v === undefined && f.properties.name && provinceStats[f.properties.name]) {
        v = provinceStats[f.properties.name][choroplethField.value]
      }
      return v
    })
    .filter(v => v !== undefined && v !== null && !isNaN(v))
  
  if (values.length === 0) return ['暂无数据']
  
  // 根据字段类型使用不同的分级策略
  const formatValue = (v) => {
    if (choroplethField.value === 'population') {
      return (v / 10000).toFixed(0) + '万'
    } else if (choroplethField.value === 'gdp') {
      return v.toFixed(0)
    } else if (choroplethField.value === 'area') {
      return v.toFixed(0)
    } else if (choroplethField.value === 'density') {
      return v.toFixed(0)
    }
    return v.toFixed(0)
  }
  
  // 自定义分级区间
  const customRanges = {
    'population': [0, 5000000, 10000000, 30000000, 50000000, 80000000, 100000000, 130000000],
    'gdp': [0, 10000, 30000, 50000, 80000, 100000, 120000, 130000],
    'area': [0, 50000, 100000, 200000, 400000, 600000, 1000000, 1700000],
    'density': [0, 50, 100, 200, 400, 600, 1000, 7000]  // 人口密度使用对数分布
  }
  
  const ranges = []
  const breaks = customRanges[choroplethField.value]
  
  if (breaks) {
    // 使用自定义区间
    for (let i = 0; i < breaks.length - 1; i++) {
      const start = breaks[i]
      const end = breaks[i + 1]
      ranges.push(`${formatValue(start)} - ${formatValue(end)}`)
    }
  } else {
    // 默认均分
    const min = Math.min(...values)
    const max = Math.max(...values)
    const step = (max - min) / 8
    for (let i = 0; i < 8; i++) {
      const start = min + i * step
      const end = i === 7 ? max : min + (i + 1) * step
      if (start < max) {
        ranges.push(`${formatValue(start)} - ${formatValue(end)}`)
      }
    }
  }
  
  return ranges
})

// 根据索引获取颜色
const getColorForRange = (index) => {
  return selectedScheme.value.colors[index] || '#ccc'
}

// getColor 分级函数（使用自定义分级区间）
const getColor = (value) => {
  if (!geojsonData.value) return '#ccc'
  if (value === undefined || value === null || isNaN(value)) return '#ccc'
  
  // 自定义分级区间
  const customRanges = {
    'population': [0, 5000000, 10000000, 30000000, 50000000, 80000000, 100000000, 130000000],
    'gdp': [0, 10000, 30000, 50000, 80000, 100000, 120000, 130000],
    'area': [0, 50000, 100000, 200000, 400000, 600000, 1000000, 1700000],
    'density': [0, 50, 100, 200, 400, 600, 1000, 7000]
  }
  
  const breaks = customRanges[choroplethField.value]
  const colors = selectedScheme.value.colors
  
  if (breaks) {
    // 使用自定义区间
    for (let i = 0; i < breaks.length - 1; i++) {
      if (value >= breaks[i] && value < breaks[i + 1]) {
        return colors[i] || colors[colors.length - 1]
      }
    }
    // 如果值超过最大区间，使用最后一种颜色
    return colors[colors.length - 1]
  } else {
    // 默认均分
    const values = geojsonData.value.features
      .map(f => {
        let v = f.properties[choroplethField.value]
        if (v === undefined && f.properties.name && provinceStats[f.properties.name]) {
          v = provinceStats[f.properties.name][choroplethField.value]
        }
        return v
      })
      .filter(v => v !== undefined && v !== null && !isNaN(v))
    
    if (values.length === 0) return '#ccc'
    
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min
    
    if (range === 0) return colors[0]
    
    const normalized = (value - min) / range
    const index = Math.min(Math.floor(normalized * colors.length), colors.length - 1)
    
    return colors[index]
  }
}

// style 回调函数
const style = (feature) => {
  const value = feature.properties[choroplethField.value]
  return {
    fillColor: getColor(value),
    weight: 2,
    opacity: 1,
    color: '#fff',
    dashArray: '3',
    fillOpacity: 0.7
  }
}

// onEachFeature 绑定交互
const onEachFeature = (feature, layer) => {
  layer.on({
    mouseover: (e) => {
      layer.setStyle({
        weight: 3,
        color: '#333',
        fillOpacity: 0.9
      })
      
      // 显示信息弹窗
      const bounds = e.target.getBounds()
      const center = bounds.getCenter()
      const point = map.latLngToContainerPoint(center)
      
      popupInfo.value = feature.properties
      popupStyle.value = {
        left: `${point.x + 15}px`,
        top: `${point.y - 50}px`
      }
    },
    mouseout: (e) => {
      geojsonLayer.resetStyle(e.target)
      popupInfo.value = null
    },
    click: (e) => {
      map.fitBounds(e.target.getBounds())
    }
  })
}

// pointToLayer 渲染点要素
const pointToLayer = (feature, latlng) => {
  // 获取当前字段值
  const field = proportionalField.value
  // 尝试多种可能的字段名
  let value = feature.properties[field]
  if (value === undefined) {
    // 尝试其他可能的字段名
    const altFields = {
      'population': ['pop', 'pop_total', '人口'],
      'gdp': ['GDP', 'gdp_total', '地区生产总值'],
      'area': ['Area', 'AREA', '面积'],
      'density': ['pop_density', 'Density', '人口密度']
    }
    if (altFields[field]) {
      for (const alt of altFields[field]) {
        if (feature.properties[alt] !== undefined) {
          value = feature.properties[alt]
          break
        }
      }
    }
  }
  
  // 如果仍未找到值，尝试从provinceStats获取
  if (value === undefined && feature.properties.name && provinceStats[feature.properties.name]) {
    value = provinceStats[feature.properties.name][field]
  }
  
  // 过滤有效数值
  let values = geojsonData.value.features
    .map(f => {
      let v = f.properties[field]
      if (v === undefined && f.properties.name && provinceStats[f.properties.name]) {
        v = provinceStats[f.properties.name][field]
      }
      return v
    })
    .filter(v => v !== undefined && v !== null && !isNaN(v))
  
  // 如果没有有效数据，返回默认灰色圆圈
  if (values.length === 0 || value === undefined || value === null || isNaN(value)) {
    return L.circleMarker(latlng, {
      radius: 8,
      fillColor: '#999',
      color: '#666',
      weight: 2,
      opacity: 0.7,
      fillOpacity: 0.4
    })
  }
  
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  
  // 映射符号大小（半径 8-50 像素）
  const normalized = (value - min) / range
  const radius = 8 + normalized * 42
  
  return L.circleMarker(latlng, {
    radius: radius,
    fillColor: '#e74c3c',
    color: '#c0392b',
    weight: 2,
    opacity: 0.9,
    fillOpacity: 0.7
  })
}

// filter 过滤要素
const filter = (feature, layer) => {
  // 过滤人口少于50万的区域（仅演示）
  return feature.properties.population >= 500000
}

// 省份统计数据（与真实边界数据合并）
const provinceStats = {
  '北京市': { area: 16410, population: 21886000, gdp: 41610.9, density: 1334 },
  '天津市': { area: 11966, population: 13730000, gdp: 15695.05, density: 1147 },
  '河北省': { area: 188800, population: 74480000, gdp: 40391.3, density: 394 },
  '山西省': { area: 156700, population: 34813800, gdp: 25642.6, density: 222 },
  '内蒙古自治区': { area: 1183000, population: 24000000, gdp: 20514.2, density: 20 },
  '辽宁省': { area: 148000, population: 42294100, gdp: 27584.1, density: 286 },
  '吉林省': { area: 187400, population: 24073400, gdp: 13239.8, density: 128 },
  '黑龙江省': { area: 473000, population: 31850088, gdp: 14879.2, density: 67 },
  '上海市': { area: 6340, population: 24870895, gdp: 47218.7, density: 3922 },
  '江苏省': { area: 107200, population: 85054000, gdp: 122875.6, density: 793 },
  '浙江省': { area: 105500, population: 65400000, gdp: 87751.7, density: 620 },
  '安徽省': { area: 140100, population: 61130000, gdp: 45045.0, density: 436 },
  '福建省': { area: 121400, population: 41540086, gdp: 53109.8, density: 342 },
  '江西省': { area: 166900, population: 45180000, gdp: 32074.7, density: 271 },
  '山东省': { area: 157100, population: 101699945, gdp: 96542.3, density: 647 },
  '河南省': { area: 167000, population: 98830000, gdp: 61345.0, density: 592 },
  '湖北省': { area: 185900, population: 58300000, gdp: 53734.9, density: 314 },
  '湖南省': { area: 211800, population: 66220000, gdp: 48670.4, density: 313 },
  '广东省': { area: 179700, population: 126840000, gdp: 129118.6, density: 706 },
  '广西壮族自治区': { area: 236700, population: 50130000, gdp: 26300.9, density: 212 },
  '海南省': { area: 35400, population: 10200000, gdp: 6818.2, density: 288 },
  '重庆市': { area: 82400, population: 32124300, gdp: 30704.0, density: 390 },
  '四川省': { area: 486000, population: 83720000, gdp: 56749.8, density: 172 },
  '贵州省': { area: 176100, population: 38562148, gdp: 20164.6, density: 219 },
  '云南省': { area: 394100, population: 47216000, gdp: 28954.2, density: 120 },
  '西藏自治区': { area: 1228000, population: 3648100, gdp: 2132.6, density: 3 },
  '陕西省': { area: 205600, population: 39562000, gdp: 33276.8, density: 192 },
  '甘肃省': { area: 454000, population: 24900000, gdp: 11201.6, density: 55 },
  '青海省': { area: 722300, population: 5940000, gdp: 3346.6, density: 8 },
  '宁夏回族自治区': { area: 66400, population: 7250000, gdp: 5312.0, density: 109 },
  '新疆维吾尔自治区': { area: 1664900, population: 25852300, gdp: 17741.3, density: 16 },
  '香港特别行政区': { area: 1106, population: 7413070, gdp: 3681.4, density: 6699 },
  '澳门特别行政区': { area: 32.9, population: 683218, gdp: 1927.0, density: 20766 },
  '台湾省': { area: 36000, population: 23561236, gdp: 6114.5, density: 654 }
}

// 加载GeoJSON数据（从阿里云DataV获取真实行政区划边界）
const loadGeoJson = async () => {
  try {
    // 优先尝试从阿里云DataV获取真实边界数据
    let data = null
    try {
      const response = await fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json')
      if (response.ok) {
        data = await response.json()
      }
    } catch (e) {
      console.log('在线数据获取失败，回退到本地数据')
    }
    
    // 如果在线获取失败，使用本地数据
    if (!data) {
      const response = await fetch('/data/china_provinces.geojson')
      data = await response.json()
    }
    
    // 合并统计数据到边界数据
    if (data && data.features) {
      data.features.forEach(feature => {
        const name = feature.properties.name
        if (provinceStats[name]) {
          Object.assign(feature.properties, provinceStats[name])
        }
        // 确保center字段存在（用于比例符号图）
        if (!feature.properties.center && feature.properties.centroid) {
          feature.properties.center = feature.properties.centroid
        }
      })
    }
    
    geojsonData.value = data
    renderLayers()
  } catch (error) {
    console.error('加载GeoJSON数据失败:', error)
  }
}

// 渲染图层
const renderLayers = () => {
  // 分级设色图
  if (geojsonLayer) {
    map.removeLayer(geojsonLayer)
  }
  
  if (showChoropleth.value && geojsonData.value) {
    geojsonLayer = L.geoJSON(geojsonData.value, {
      style: style,
      onEachFeature: onEachFeature,
      filter: filter
    }).addTo(map)
  }
  
  // 比例符号图
  if (proportionalLayer) {
    map.removeLayer(proportionalLayer)
    proportionalLayer = null
  }
  
  if (showProportional.value && geojsonData.value) {
    console.log('渲染比例符号图...')
    console.log('数据特征数:', geojsonData.value.features.length)
    
    // 创建一个独立的图层来渲染比例符号
    proportionalLayer = L.layerGroup().addTo(map)
    
    // 遍历每个特征，手动添加圆圈
    geojsonData.value.features.forEach((feature) => {
      if (!feature.properties || !feature.properties.name) return
      
      // 获取中心点坐标
      let centerLat, centerLng
      
      // 优先使用properties中的center
      if (feature.properties.center) {
        [centerLng, centerLat] = feature.properties.center
      } else if (feature.properties.centroid) {
        [centerLng, centerLat] = feature.properties.centroid
      } else if (feature.geometry && feature.geometry.coordinates) {
        // 计算多边形中心点
        const coords = feature.geometry.coordinates
        if (coords && coords.length > 0) {
          let allCoords = []
          
          const flattenCoords = (arr) => {
            arr.forEach(item => {
              if (Array.isArray(item) && typeof item[0] === 'number') {
                allCoords.push(item)
              } else if (Array.isArray(item)) {
                flattenCoords(item)
              }
            })
          }
          
          flattenCoords(coords)
          
          if (allCoords.length > 0) {
            centerLng = allCoords.reduce((sum, c) => sum + c[0], 0) / allCoords.length
            centerLat = allCoords.reduce((sum, c) => sum + c[1], 0) / allCoords.length
          } else {
            centerLng = 105
            centerLat = 35
          }
        } else {
          centerLng = 105
          centerLat = 35
        }
      } else {
        centerLng = 105
        centerLat = 35
      }
      
      // 获取字段值
      const field = proportionalField.value
      let value = feature.properties[field]
      
      // 尝试从provinceStats获取
      if (value === undefined && feature.properties.name && provinceStats[feature.properties.name]) {
        value = provinceStats[feature.properties.name][field]
      }
      
      console.log(`省份: ${feature.properties.name}, 中心点: (${centerLat}, ${centerLng}), 值: ${value}`)
      
      // 计算圆圈大小
      if (value === undefined || value === null || isNaN(value)) {
        value = 0
      }
      
      // 获取所有值用于归一化
      const allValues = geojsonData.value.features
        .map(f => {
          let v = f.properties[field]
          if (v === undefined && f.properties.name && provinceStats[f.properties.name]) {
            v = provinceStats[f.properties.name][field]
          }
          return v
        })
        .filter(v => v !== undefined && v !== null && !isNaN(v))
      
      const min = Math.min(...allValues)
      const max = Math.max(...allValues)
      const range = max - min || 1
      
      // 计算半径 (10-50像素)
      const normalized = value > max ? 1 : value < min ? 0 : (value - min) / range
      const radius = 10 + normalized * 40
      
      // 创建圆圈
      const circle = L.circleMarker([centerLat, centerLng], {
        radius: radius,
        fillColor: '#e74c3c',
        color: '#c0392b',
        weight: 2,
        opacity: 0.9,
        fillOpacity: 0.7
      }).addTo(proportionalLayer)
      
      // 添加tooltip
      circle.bindTooltip(`${feature.properties.name}: ${value}`, {
        permanent: false,
        direction: 'top'
      })
    })
    
    console.log('比例符号图渲染完成')
  }
}

// 切换分级设色图
const toggleChoropleth = () => {
  renderLayers()
}

// 切换比例符号图
const toggleProportional = () => {
  renderLayers()
}

// 更新分级设色图
const updateChoropleth = () => {
  if (geojsonLayer) {
    geojsonLayer.setStyle(style)
  }
}

// 选择配色方案
const selectColorScheme = (scheme) => {
  selectedScheme.value = scheme
  updateChoropleth()
}

onMounted(() => {
  // 初始化地图（中国区域）
  map = L.map(mapContainer.value, {
    center: [35.0, 105.0],
    zoom: 4,
    attributionControl: true
  })
  
  // 添加底图
  L.tileLayer('https://webrd{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}', {
    attribution: '© 高德地图',
    subdomains: ['01', '02', '03', '04'],
    maxZoom: 18
  }).addTo(map)
  
  // 添加比例尺（放在bottomright避免被遮挡）
  L.control.scale({
    imperial: false,
    position: 'bottomright'
  }).addTo(map)
  
  // 添加比例尺监听器
  scaleBarListener = map.on('zoomend', updateScaleBar)
  updateScaleBar()
  
  // 加载GeoJSON数据
  loadGeoJson()
})

onUnmounted(() => {
  if (map) {
    map.remove()
  }
})

// 监听配色方案变化
watch(selectedScheme, () => {
  updateChoropleth()
})
</script>

<style scoped>
.geojson-map-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.leaflet-map {
  width: 100%;
  height: 100%;
}

.geojson-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 280px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 20px;
  z-index: 1000;
  overflow-y: auto;
  max-height: calc(100% - 40px);
}

.panel-header {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #666;
  margin-bottom: 10px;
}

.layer-switch-section,
.attr-select-section,
.color-scheme-section,
.legend-section,
.color-explanation {
  margin-bottom: 20px;
}

.layer-switch label {
  display: block;
  margin-bottom: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
}

.layer-switch input[type="checkbox"] {
  margin-right: 8px;
  cursor: pointer;
}

.attr-select-section select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.color-schemes {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.color-schemes button {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.color-schemes button:hover {
  border-color: #3182ce;
}

.color-schemes button.active {
  border-color: #3182ce;
  background: #f0f7ff;
}

.color-preview {
  width: 60px;
  height: 12px;
  border-radius: 4px;
  margin-bottom: 5px;
}

.color-schemes span {
  font-size: 11px;
  color: #666;
}

.legend {
  background: #fafafa;
  border-radius: 8px;
  padding: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.legend-item:last-child {
  margin-bottom: 0;
}

.legend-color {
  width: 20px;
  height: 14px;
  border-radius: 3px;
  margin-right: 10px;
}

.legend-text {
  font-size: 12px;
  color: #555;
}

.proportional-legend {
  text-align: center;
}

.legend-title {
  font-size: 12px;
  color: #666;
  margin-bottom: 10px;
}

.circle-scales {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
}

.circle-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.scale-circle {
  border-radius: 50%;
  background: rgba(231, 76, 60, 0.6);
  border: 2px solid #c0392b;
  margin-bottom: 5px;
}

.circle-item span {
  font-size: 11px;
  color: #666;
}

/* 比例尺样式 */
.scale-bar-section {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.scale-bar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.scale-bar-inner {
  height: 4px;
  background: linear-gradient(to right, #3182ce, #6baed6);
  border-radius: 2px;
  border: 1px solid #9ecae1;
}

.scale-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.color-explanation {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
}

.explanation-text p {
  font-size: 12px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 8px;
}

.explanation-text p:last-child {
  margin-bottom: 0;
}

.info-popup {
  position: absolute;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  padding: 12px 16px;
  z-index: 1001;
  pointer-events: none;
  min-width: 160px;
}

.popup-header {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid #eee;
}

.popup-content p {
  font-size: 12px;
  color: #555;
  margin: 4px 0;
}
</style>