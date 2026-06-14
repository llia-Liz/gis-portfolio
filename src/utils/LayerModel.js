/**
 * GIS 图层数据模型类
 * 封装图层的基本属性和方法
 */

import {
  parseGeoJSON,
  validateGeoJSON,
  calculateStatistics,
  calculateCollectionBounds,
  filterFeatures,
  mapFeatures,
  groupByProperty
} from './geoParser.js';

import {
  calculateDistance,
  calculatePolygonArea,
  calculateLineLength,
  formatDistance,
  formatArea
} from './geoUtils.js';

/**
 * GIS 要素类
 */
export class Feature {
  constructor(geoJSON) {
    this.id = geoJSON.id || crypto.randomUUID();
    this.geometry = geoJSON.geometry;
    this.properties = geoJSON.properties || {};
    this.selected = false;
    this.visible = true;
  }
  
  /**
   * 获取要素几何类型
   */
  getGeometryType() {
    return this.geometry?.type;
  }
  
  /**
   * 获取坐标
   */
  getCoordinates() {
    return this.geometry?.coordinates || [];
  }
  
  /**
   * 计算要素长度/面积
   */
  getSpatialMeasure() {
    const coords = this.getCoordinates();
    const type = this.getGeometryType();
    
    switch (type) {
      case 'Polygon':
        return { value: calculatePolygonArea(coords), unit: 'm²', type: 'area' };
      case 'LineString':
        return { value: calculateLineLength(coords), unit: 'm', type: 'length' };
      case 'Point':
        return { value: 0, unit: '', type: 'point' };
      default:
        return { value: 0, unit: '', type: 'unknown' };
    }
  }
  
  /**
   * 设置属性
   */
  setProperty(key, value) {
    this.properties[key] = value;
  }
  
  /**
   * 获取属性
   */
  getProperty(key) {
    return this.properties[key];
  }
  
  /**
   * 转换为 GeoJSON
   */
  toGeoJSON() {
    return {
      type: 'Feature',
      id: this.id,
      geometry: this.geometry,
      properties: this.properties
    };
  }
}

/**
 * GIS 图层类
 */
export class Layer {
  constructor(options = {}) {
    this.id = options.id || crypto.randomUUID();
    this.name = options.name || '未命名图层';
    this.type = options.type || 'vector';
    this.visible = options.visible !== undefined ? options.visible : true;
    this.opacity = options.opacity || 1;
    this.features = [];
    this.style = options.style || {};
    this.metadata = options.metadata || {};
    this.filterExpression = null;
  }
  
  /**
   * 添加要素
   */
  addFeature(feature) {
    if (feature instanceof Feature) {
      this.features.push(feature);
    } else {
      this.features.push(new Feature(feature));
    }
  }
  
  /**
   * 批量添加要素
   */
  addFeatures(features) {
    features.forEach(f => this.addFeature(f));
  }
  
  /**
   * 移除要素
   */
  removeFeature(featureId) {
    this.features = this.features.filter(f => f.id !== featureId);
  }
  
  /**
   * 清空所有要素
   */
  clearFeatures() {
    this.features = [];
  }
  
  /**
   * 获取可见要素
   */
  getVisibleFeatures() {
    return this.features.filter(f => f.visible);
  }
  
  /**
   * 获取选中的要素
   */
  getSelectedFeatures() {
    return this.features.filter(f => f.selected);
  }
  
  /**
   * 选择要素
   */
  selectFeature(featureId) {
    const feature = this.features.find(f => f.id === featureId);
    if (feature) feature.selected = true;
  }
  
  /**
   * 取消选择
   */
  deselectFeature(featureId) {
    const feature = this.features.find(f => f.id === featureId);
    if (feature) feature.selected = false;
  }
  
  /**
   * 全选
   */
  selectAll() {
    this.features.forEach(f => f.selected = true);
  }
  
  /**
   * 取消全选
   */
  deselectAll() {
    this.features.forEach(f => f.selected = false);
  }
  
  /**
   * 过滤要素
   */
  filter(predicate) {
    return this.features.filter(predicate);
  }
  
  /**
   * 按属性过滤
   */
  filterByProperty(propertyName, value) {
    return this.filter(f => f.getProperty(propertyName) === value);
  }
  
  /**
   * 映射要素
   */
  map(transformFn) {
    return this.features.map(transformFn);
  }
  
  /**
   * 获取统计信息
   */
  getStatistics() {
    const features = this.getVisibleFeatures();
    const total = features.length;
    
    // 按类型统计
    const byType = features.reduce((acc, f) => {
      const type = f.getGeometryType();
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    
    // 计算总长度和总面积
    let totalLength = 0;
    let totalArea = 0;
    
    features.forEach(f => {
      const measure = f.getSpatialMeasure();
      if (measure.type === 'length') totalLength += measure.value;
      if (measure.type === 'area') totalArea += measure.value;
    });
    
    return {
      total,
      byType,
      totalLength,
      formattedLength: formatDistance(totalLength),
      totalArea,
      formattedArea: formatArea(totalArea)
    };
  }
  
  /**
   * 获取边界框
   */
  getBounds() {
    const visibleFeatures = this.getVisibleFeatures();
    if (!visibleFeatures.length) return null;
    
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    
    visibleFeatures.forEach(f => {
      const coords = f.getCoordinates();
      if (Array.isArray(coords[0])) {
        // 多点坐标
        coords.forEach(([x, y]) => {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        });
      } else {
        // 单点坐标
        minX = Math.min(minX, coords[0]);
        minY = Math.min(minY, coords[1]);
        maxX = Math.max(maxX, coords[0]);
        maxY = Math.max(maxY, coords[1]);
      }
    });
    
    return { minX, minY, maxX, maxY };
  }
  
  /**
   * 从 GeoJSON 加载
   */
  static fromGeoJSON(geoJSON, options = {}) {
    const parsed = parseGeoJSON(geoJSON);
    
    if (!validateGeoJSON(parsed)) {
      throw new Error('无效的 GeoJSON 数据');
    }
    
    const layer = new Layer(options);
    
    // 处理 FeatureCollection
    if (parsed.type === 'FeatureCollection') {
      parsed.features.forEach(f => layer.addFeature(f));
    } else {
      // 处理单个要素
      layer.addFeature(parsed);
    }
    
    return layer;
  }
  
  /**
   * 转换为 GeoJSON
   */
  toGeoJSON() {
    return {
      type: 'FeatureCollection',
      features: this.features.map(f => f.toGeoJSON())
    };
  }
  
  /**
   * 设置图层样式
   */
  setStyle(style) {
    this.style = { ...this.style, ...style };
  }
  
  /**
   * 设置透明度
   */
  setOpacity(opacity) {
    this.opacity = Math.max(0, Math.min(1, opacity));
  }
  
  /**
   * 切换可见性
   */
  toggleVisibility() {
    this.visible = !this.visible;
  }
  
  /**
   * 获取图层信息摘要
   */
  getSummary() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      featureCount: this.features.length,
      visible: this.visible,
      opacity: this.opacity
    };
  }
}

/**
 * 数据管理器类
 */
export class DataManager {
  constructor() {
    this.layers = new Map();
    this.activeLayerId = null;
  }
  
  /**
   * 添加图层
   */
  addLayer(layer) {
    if (!(layer instanceof Layer)) {
      layer = new Layer(layer);
    }
    this.layers.set(layer.id, layer);
    if (!this.activeLayerId) {
      this.activeLayerId = layer.id;
    }
    return layer;
  }
  
  /**
   * 移除图层
   */
  removeLayer(layerId) {
    this.layers.delete(layerId);
    if (this.activeLayerId === layerId) {
      this.activeLayerId = this.layers.keys().next().value || null;
    }
  }
  
  /**
   * 获取图层
   */
  getLayer(layerId) {
    return this.layers.get(layerId);
  }
  
  /**
   * 获取所有图层
   */
  getAllLayers() {
    return Array.from(this.layers.values());
  }
  
  /**
   * 获取可见图层
   */
  getVisibleLayers() {
    return this.getAllLayers().filter(l => l.visible);
  }
  
  /**
   * 设置活动图层
   */
  setActiveLayer(layerId) {
    if (this.layers.has(layerId)) {
      this.activeLayerId = layerId;
    }
  }
  
  /**
   * 获取活动图层
   */
  getActiveLayer() {
    return this.layers.get(this.activeLayerId);
  }
}
