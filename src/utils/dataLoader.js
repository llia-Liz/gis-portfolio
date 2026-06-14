/**
 * GeoJSON 数据异步加载模块
 * 使用 Promise/async-await 实现异步加载
 */

/**
 * 异步加载 GeoJSON 文件
 * @param {string} url - GeoJSON 文件 URL
 * @returns {Promise<Object>} GeoJSON 数据
 */
export const loadGeoJSON = async (url) => {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP 错误: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`加载 GeoJSON 失败: ${error.message}`);
  }
};

/**
 * 异步加载多个 GeoJSON 文件
 * @param {string[]} urls - URL 数组
 * @returns {Promise<Object[]>} GeoJSON 数据数组
 */
export const loadMultipleGeoJSON = async (urls) => {
  const promises = urls.map(url => loadGeoJSON(url));
  return Promise.all(promises);
};

/**
 * 带进度的异步加载
 * @param {string[]} urls - URL 数组
 * @param {Function} onProgress - 进度回调
 * @returns {Promise<Object[]>} GeoJSON 数据数组
 */
export const loadGeoJSONWithProgress = async (urls, onProgress) => {
  const results = [];
  let completed = 0;
  
  for (const url of urls) {
    const data = await loadGeoJSON(url);
    results.push(data);
    completed++;
    if (onProgress) {
      onProgress({
        completed,
        total: urls.length,
        percentage: Math.round((completed / urls.length) * 100),
        url
      });
    }
  }
  
  return results;
};

/**
 * 加载内置示例数据
 * @param {string} type - 数据类型 ('points' | 'lines' | 'polygons' | 'all')
 * @returns {Promise<Object>} GeoJSON 数据
 */
export const loadSampleData = async (type = 'all') => {
  // 模拟异步加载延迟
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const sampleData = {
    points: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [116.397, 39.914] },
          properties: { name: '天安门', type: 'landmark', population: 0 }
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [116.478, 39.928] },
          properties: { name: '故宫', type: 'heritage', population: 0 }
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [116.414, 39.936] },
          properties: { name: '雍和宫', type: 'temple', population: 0 }
        }
      ]
    },
    lines: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [116.397, 39.914],
              [116.408, 39.920],
              [116.418, 39.930],
              [116.428, 39.940]
            ]
          },
          properties: { name: '长安街', type: 'main_road', length: 0 }
        },
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [116.440, 39.900],
              [116.450, 39.910],
              [116.460, 39.920],
              [116.470, 39.930]
            ]
          },
          properties: { name: '二环路', type: 'ring_road', length: 0 }
        }
      ]
    },
    polygons: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [116.38, 39.90],
              [116.40, 39.90],
              [116.40, 39.92],
              [116.38, 39.92],
              [116.38, 39.90]
            ]]
          },
          properties: { name: '西城区', type: 'district', population: 1300000 }
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [116.40, 39.90],
              [116.42, 39.90],
              [116.42, 39.92],
              [116.40, 39.92],
              [116.40, 39.90]
            ]]
          },
          properties: { name: '东城区', type: 'district', population: 900000 }
        }
      ]
    }
  };
  
  if (type === 'all') {
    return {
      points: sampleData.points,
      lines: sampleData.lines,
      polygons: sampleData.polygons
    };
  }
  
  return sampleData[type] || sampleData.points;
};

/**
 * 创建演示用北京市数据
 * @returns {Promise<Object>} 包含多个图层的 GeoJSON 数据
 */
export const loadBeijingDemoData = async () => {
  return loadSampleData('all');
};

export default {
  loadGeoJSON,
  loadMultipleGeoJSON,
  loadGeoJSONWithProgress,
  loadSampleData,
  loadBeijingDemoData
};
