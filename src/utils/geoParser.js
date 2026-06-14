/**
 * GeoJSON 处理模块
 * 提供解析、过滤、统计等功能，支持 ES6 模块化导出
 */

import {
  calculateDistance,
  calculatePolygonArea,
  calculateLineLength,
  calculateCentroid,
  calculateBounds,
  formatDistance,
  formatArea
} from './geoUtils.js';

/**
 * GeoJSON 类型常量
 */
export const GeometryTypes = {
  POINT: 'Point',
  LINE_STRING: 'LineString',
  POLYGON: 'Polygon',
  MULTI_POINT: 'MultiPoint',
  MULTI_LINE_STRING: 'MultiLineString',
  MULTI_POLYGON: 'MultiPolygon',
  FEATURE: 'Feature',
  FEATURE_COLLECTION: 'FeatureCollection',
  GEOMETRY_COLLECTION: 'GeometryCollection'
};

/**
 * 解析 GeoJSON 数据
 * @param {Object|string} geoData - GeoJSON 对象或 JSON 字符串
 * @returns {Object} 解析后的 GeoJSON 对象
 */
export const parseGeoJSON = (geoData) => {
  if (typeof geoData === 'string') {
    try {
      return JSON.parse(geoData);
    } catch (error) {
      throw new Error(`GeoJSON 解析失败: ${error.message}`);
    }
  }
  return geoData;
};

/**
 * 验证 GeoJSON 格式是否有效
 * @param {Object} geojson - GeoJSON 对象
 * @returns {boolean} 是否有效
 */
export const validateGeoJSON = (geojson) => {
  if (!geojson || typeof geojson !== 'object') return false;
  if (!['Feature', 'FeatureCollection', 'Point', 'LineString', 'Polygon',
        'MultiPoint', 'MultiLineString', 'MultiPolygon', 'GeometryCollection']
        .includes(geojson.type)) {
    return false;
  }
  return true;
};

/**
 * 获取要素的几何类型
 * @param {Object} feature - GeoJSON 要素
 * @returns {string} 几何类型
 */
export const getGeometryType = (feature) => {
  if (feature.geometry) {
    return feature.geometry.type;
  }
  return feature.type;
};

/**
 * 获取要素的属性列表
 * @param {Object} feature - GeoJSON 要素
 * @returns {Object} 属性对象
 */
export const getProperties = (feature) => {
  return feature.properties || {};
};

/**
 * 从要素集合中提取所有坐标
 * @param {Object} feature - GeoJSON 要素
 * @returns {number[][]} 坐标数组
 */
export const extractCoordinates = (feature) => {
  const geometry = feature.geometry || feature;
  
  switch (geometry.type) {
    case GeometryTypes.POINT:
      return [geometry.coordinates];
    case GeometryTypes.LINE_STRING:
      return geometry.coordinates;
    case GeometryTypes.POLYGON:
      // 返回外边框坐标
      return geometry.coordinates[0];
    case GeometryTypes.MULTI_POINT:
      return geometry.coordinates;
    case GeometryTypes.MULTI_LINE_STRING:
      return geometry.coordinates.flat();
    case GeometryTypes.MULTI_POLYGON:
      return geometry.coordinates[0][0];
    default:
      return [];
  }
};

/**
 * 过滤要素（基于属性）
 * @param {Object} features - GeoJSON FeatureCollection
 * @param {Function} predicate - 过滤函数
 * @returns {Object} 过滤后的 FeatureCollection
 */
export const filterFeatures = (features, predicate) => {
  if (!features.features) {
    throw new Error('无效的 FeatureCollection');
  }
  
  return {
    ...features,
    features: features.features.filter(predicate)
  };
};

/**
 * 按属性值过滤要素
 * @param {Object} features - GeoJSON FeatureCollection
 * @param {string} propertyName - 属性名
 * @param {*} propertyValue - 属性值
 * @returns {Object} 过滤后的 FeatureCollection
 */
export const filterByProperty = (features, propertyName, propertyValue) => {
  return filterFeatures(features, (feature) => {
    const props = getProperties(feature);
    return props[propertyName] === propertyValue;
  });
};

/**
 * 按属性值范围过滤要素
 * @param {Object} features - GeoJSON FeatureCollection
 * @param {string} propertyName - 属性名
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {Object} 过滤后的 FeatureCollection
 */
export const filterByRange = (features, propertyName, min, max) => {
  return filterFeatures(features, (feature) => {
    const props = getProperties(feature);
    const value = props[propertyName];
    return value >= min && value <= max;
  });
};

/**
 * 映射要素（转换属性）
 * @param {Object} features - GeoJSON FeatureCollection
 * @param {Function} transform - 转换函数
 * @returns {Object} 转换后的 FeatureCollection
 */
export const mapFeatures = (features, transform) => {
  if (!features.features) {
    throw new Error('无效的 FeatureCollection');
  }
  
  return {
    ...features,
    features: features.features.map(transform)
  };
};

/**
 * 统计要素集合信息
 * @param {Object} features - GeoJSON FeatureCollection
 * @returns {Object} 统计信息
 */
export const calculateStatistics = (features) => {
  if (!features.features) {
    throw new Error('无效的 FeatureCollection');
  }
  
  const featureList = features.features;
  
  // 使用 reduce 统计
  const stats = featureList.reduce((acc, feature) => {
    const geometry = feature.geometry || feature;
    const props = getProperties(feature);
    
    // 统计几何类型
    const type = geometry.type;
    acc.types[type] = (acc.types[type] || 0) + 1;
    
    // 计算总要素数
    acc.total++;
    
    // 收集所有数值属性
    Object.entries(props).forEach(([key, value]) => {
      if (typeof value === 'number') {
        if (!acc.numericProperties[key]) {
          acc.numericProperties[key] = { sum: 0, min: value, max: value, count: 0 };
        }
        const prop = acc.numericProperties[key];
        prop.sum += value;
        prop.min = Math.min(prop.min, value);
        prop.max = Math.max(prop.max, value);
        prop.count++;
      }
    });
    
    return acc;
  }, { total: 0, types: {}, numericProperties: {} });
  
  // 计算平均值
  Object.keys(stats.numericProperties).forEach(key => {
    const prop = stats.numericProperties[key];
    prop.avg = prop.sum / prop.count;
  });
  
  return stats;
};

/**
 * 计算集合的总体边界
 * @param {Object} features - GeoJSON FeatureCollection
 * @returns {Object} 边界 { minX, minY, maxX, maxY }
 */
export const calculateCollectionBounds = (features) => {
  if (!features.features || !features.features.length) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }
  
  let bounds = null;
  
  features.features.forEach(feature => {
    const coords = extractCoordinates(feature);
    const featureBounds = calculateBounds(coords);
    
    if (!bounds) {
      bounds = { ...featureBounds };
    } else {
      bounds = {
        minX: Math.min(bounds.minX, featureBounds.minX),
        minY: Math.min(bounds.minY, featureBounds.minY),
        maxX: Math.max(bounds.maxX, featureBounds.maxX),
        maxY: Math.max(bounds.maxY, featureBounds.maxY)
      };
    }
  });
  
  return bounds;
};

/**
 * 按属性分组要素
 * @param {Object} features - GeoJSON FeatureCollection
 * @param {string} propertyName - 分组属性名
 * @returns {Map} 分组后的 Map
 */
export const groupByProperty = (features, propertyName) => {
  if (!features.features) {
    throw new Error('无效的 FeatureCollection');
  }
  
  const groups = new Map();
  
  features.features.forEach(feature => {
    const props = getProperties(feature);
    const key = props[propertyName];
    
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(feature);
  });
  
  return groups;
};

/**
 * 计算每个要素的空间属性（面积、长度等）
 * @param {Object} features - GeoJSON FeatureCollection
 * @returns {Object} 添加了计算属性的 FeatureCollection
 */
export const calculateSpatialProperties = (features) => {
  return mapFeatures(features, (feature) => {
    const geometry = feature.geometry || feature;
    const coords = extractCoordinates(feature);
    const props = { ...feature.properties };
    
    switch (geometry.type) {
      case GeometryTypes.POLYGON:
        props.area = calculatePolygonArea(coords);
        props.formattedArea = formatArea(props.area);
        props.perimeter = calculateLineLength(coords);
        props.formattedPerimeter = formatDistance(props.perimeter);
        break;
      case GeometryTypes.LINE_STRING:
        props.length = calculateLineLength(coords);
        props.formattedLength = formatDistance(props.length);
        break;
      case GeometryTypes.POINT:
        props.lng = coords[0];
        props.lat = coords[1];
        break;
    }
    
    // 添加中心点
    props.centroid = calculateCentroid(coords);
    
    return {
      ...feature,
      properties: props
    };
  });
};

/**
 * 创建新的要素
 * @param {string} type - 几何类型
 * @param {number[][]} coordinates - 坐标
 * @param {Object} properties - 属性
 * @returns {Object} GeoJSON 要素
 */
export const createFeature = (type, coordinates, properties = {}) => {
  return {
    type: GeometryTypes.FEATURE,
    geometry: {
      type,
      coordinates
    },
    properties
  };
};

/**
 * 创建要素集合
 * @param {Array} features - 要素数组
 * @returns {Object} GeoJSON FeatureCollection
 */
export const createFeatureCollection = (features = []) => {
  return {
    type: GeometryTypes.FEATURE_COLLECTION,
    features
  };
};
