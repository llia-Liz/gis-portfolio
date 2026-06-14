/**
 * GIS 工具函数库
 * 包含距离计算、坐标格式化、面积统计等常用功能
 */

/**
 * 计算两点之间的球面距离（使用 Haversine 公式）
 * @param {number[]} point1 - [经度, 纬度]
 * @param {number[]} point2 - [经度, 纬度]
 * @returns {number} 距离（米）
 */
export const calculateDistance = (point1, point2) => {
  const [lon1, lat1] = point1;
  const [lon2, lat2] = point2;
  
  const R = 6371000; // 地球半径（米）
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * 角度转弧度
 */
const toRad = (deg) => deg * Math.PI / 180;

/**
 * 弧度转角度
 */
const toDeg = (rad) => rad * 180 / Math.PI;

/**
 * 格式化坐标为度分秒（DMS）格式
 * @param {number} coord - 经度或纬度
 * @param {boolean} isLat - 是否为纬度
 * @returns {string} 格式化后的坐标字符串
 */
export const formatCoordinateDMS = (coord, isLat = true) => {
  const absolute = Math.abs(coord);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(2);
  
  const direction = isLat
    ? (coord >= 0 ? 'N' : 'S')
    : (coord >= 0 ? 'E' : 'W');
  
  return `${degrees}°${minutes}'${seconds}"${direction}`;
};

/**
 * 格式化坐标为度（DD）格式
 * @param {number} coord - 经度或纬度
 * @param {number} precision - 小数位数
 * @returns {string} 格式化后的坐标字符串
 */
export const formatCoordinateDD = (coord, precision = 6) => {
  return `${Number(coord).toFixed(precision)}°`;
};

/**
 * 格式化距离
 * @param {number} meters - 距离（米）
 * @returns {string} 格式化后的距离字符串
 */
export const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${meters.toFixed(2)} 米`;
  }
  return `${(meters / 1000).toFixed(2)} 公里`;
};

/**
 * 计算多边形面积（使用 Shoelace 公式）
 * @param {number[][]} coordinates - 坐标数组 [[lon, lat], ...]
 * @returns {number} 面积（平方米）
 */
export const calculatePolygonArea = (coordinates) => {
  if (coordinates.length < 3) return 0;
  
  // 使用 Shoelace 公式
  let area = 0;
  const n = coordinates.length;
  
  for (let i = 0; i < n; i++) {
    const [x1, y1] = coordinates[i];
    const [x2, y2] = coordinates[(i + 1) % n];
    area += x1 * y2 - x2 * y1;
  }
  
  area = Math.abs(area) / 2;
  
  // 转换为平方米（粗略估计）
  const metersPerDegree = 111320;
  return area * metersPerDegree * metersPerDegree;
};

/**
 * 格式化面积
 * @param {number} sqMeters - 面积（平方米）
 * @returns {string} 格式化后的面积字符串
 */
export const formatArea = (sqMeters) => {
  if (sqMeters < 10000) {
    return `${sqMeters.toFixed(2)} 平方米`;
  }
  return `${(sqMeters / 10000).toFixed(2)} 平方公里`;
};

/**
 * 计算折线总长度
 * @param {number[][]} coordinates - 坐标数组
 * @returns {number} 总长度（米）
 */
export const calculateLineLength = (coordinates) => {
  if (coordinates.length < 2) return 0;
  
  let totalLength = 0;
  for (let i = 0; i < coordinates.length - 1; i++) {
    totalLength += calculateDistance(coordinates[i], coordinates[i + 1]);
  }
  return totalLength;
};

/**
 * 计算几何中心点
 * @param {number[][]} coordinates - 坐标数组
 * @returns {number[]} [经度, 纬度]
 */
export const calculateCentroid = (coordinates) => {
  if (!coordinates.length) return [0, 0];
  
  const sum = coordinates.reduce(
    ([sumX, sumY], [x, y]) => [sumX + x, sumY + y],
    [0, 0]
  );
  
  return [
    sum[0] / coordinates.length,
    sum[1] / coordinates.length
  ];
};

/**
 * 坐标边界框
 * @param {number[][]} coordinates - 坐标数组
 * @returns {Object} { minX, minY, maxX, maxY }
 */
export const calculateBounds = (coordinates) => {
  if (!coordinates.length) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }
  
  return coordinates.reduce(
    (bounds, [x, y]) => ({
      minX: Math.min(bounds.minX, x),
      minY: Math.min(bounds.minY, y),
      maxX: Math.max(bounds.maxX, x),
      maxY: Math.max(bounds.maxY, y)
    }),
    {
      minX: coordinates[0][0],
      minY: coordinates[0][1],
      maxX: coordinates[0][0],
      maxY: coordinates[0][1]
    }
  );
};

/**
 * 生成随机坐标点
 * @param {number} centerLng - 中心经度
 * @param {number} centerLat - 中心纬度
 * @param {number} radiusKm - 半径（公里）
 * @returns {number[]} [经度, 纬度]
 */
export const generateRandomPoint = (centerLng, centerLat, radiusKm = 1) => {
  const radiusDeg = radiusKm / 111;
  const u = Math.random();
  const v = Math.random();
  const w = radiusDeg * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const y = w * Math.sin(t);
  
  return [
    centerLng + x / Math.cos(toRad(centerLat)),
    centerLat + y
  ];
};

/**
 * 角度转弧度
 */
export const toRadians = toRad;

/**
 * 弧度转角度
 */
export const toDegrees = toDeg;
