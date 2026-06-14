/**
 * GIS 工具函数统一导出
 */

// 导出地理计算工具
export {
  calculateDistance,
  formatCoordinateDMS,
  formatCoordinateDD,
  formatDistance,
  calculatePolygonArea,
  formatArea,
  calculateLineLength,
  calculateCentroid,
  calculateBounds,
  generateRandomPoint,
  toRadians,
  toDegrees
} from './geoUtils.js';

// 导出 GeoJSON 解析工具
export {
  GeometryTypes,
  parseGeoJSON,
  validateGeoJSON,
  getGeometryType,
  getProperties,
  extractCoordinates,
  filterFeatures,
  filterByProperty,
  filterByRange,
  mapFeatures,
  calculateStatistics,
  calculateCollectionBounds,
  groupByProperty,
  calculateSpatialProperties,
  createFeature,
  createFeatureCollection
} from './geoParser.js';

// 导出数据加载工具
export {
  loadGeoJSON,
  loadMultipleGeoJSON,
  loadGeoJSONWithProgress,
  loadSampleData,
  loadBeijingDemoData
} from './dataLoader.js';

// 导出图层模型
export { Feature, Layer, DataManager } from './LayerModel.js';
