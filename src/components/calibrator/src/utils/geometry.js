/*
 * @Description: geometry:
 * @Author: liushijie
 * @Date:2021-09-29 16:35
 * @Last Modified by: liushijie
 * @Last Modified Date:2021-09-29 16:35
 */

// 获取图片居中位置
import cfg from '../config';
import commonUtil from './common';
// 获取标注框唯一id
function guid() {
  const len = 32;
  const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  const maxPos = chars.length;
  let str = '';
  for (let i = 0; i < len; i++) {
    str += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return str;
}
// 获取安全的数字
function getSafeNum(num) {
  return (
    Math.round(
      Math.min(Math.max(Number.MIN_SAFE_INTEGER, num), Number.MAX_SAFE_INTEGER) * 10000000
    ) / 10000000
  );
}
// 获取布局信息
function getLayoutDirection(imageData, tailorData, wrapperWidth, wrapperHeight) {
  const { tailorScope, layoutMode = cfg.imageObj.LAYOUT_MODE.FIX, ratio, basePoint } = imageData;
  const { width, height } = tailorData;
  let tailorWidth = width;
  let tailorHeight = height;

  try {
    const distW = tailorScope.coordinates[2].x - tailorScope.coordinates[0].x;
    const distH = tailorScope.coordinates[2].y - tailorScope.coordinates[0].y;
    if (distW === 0 || distH === 0) {
    }
    tailorWidth *= distW;
    tailorHeight *= distH;
  } catch (e) {
    tailorWidth = width;
    tailorHeight = height;
  }
  const ratioW = wrapperWidth / tailorWidth;
  const ratioH = wrapperHeight / tailorHeight;
  let r = 1;
  if (ratio) {
    // 如果传入了比例,则以外部传入比例为准
    r = ratio;
  } else if (layoutMode === cfg.imageObj.LAYOUT_MODE.FIX) {
    r = ratioW > ratioH ? ratioH : ratioW;
  } else if (layoutMode === cfg.imageObj.LAYOUT_MODE.COVER) {
    r = ratioW > ratioH ? ratioW : ratioH;
  }
  const distX =
    (wrapperWidth - tailorWidth * r) / 2 - (tailorScope?.coordinates?.[0]?.x || 0) * width * r;
  const distY =
    (wrapperHeight - tailorHeight * r) / 2 - (tailorScope?.coordinates?.[0]?.y || 0) * height * r;
  const direction = {
    width: width * r,
    height: height * r,
    left: typeof basePoint?.x === 'number' ? basePoint.x : distX, // 如果外部传入了basePoint,则以外部传入为准
    top: typeof basePoint?.y === 'number' ? basePoint.y : distY, // 如果外部传入了basePoint,则以外部传入为准
    ratio: r
  };
  return direction;
}
// 获取最大的X和Y
function getDist(coordinates) {
  let minX = coordinates[0].x;
  let minY = coordinates[0].y;
  let maxX = coordinates[0].x;
  let maxY = coordinates[0].y;
  for (let i = 0; i < coordinates.length; i++) {
    coordinates[i].x < minX && (minX = coordinates[i].x);
    coordinates[i].x > maxX && (maxX = coordinates[i].x);
    coordinates[i].y < minY && (minY = coordinates[i].y);
    coordinates[i].y > maxY && (maxY = coordinates[i].y);
  }
  return { minX, maxX, minY, maxY };
}
// 获取顺时针坐标（根据任意连续三个点）
function getClockWise(coordinates) {
  if (!coordinates.length || coordinates.length < 3) {
    return coordinates;
  }
  let cross = 0;
  for (let i = 0, len = coordinates.length - 2; i < len; i++) {
    // 使用向量叉乘判断是否为顺时针
    const x1 = getSafeNum(coordinates[i].x);
    const y1 = getSafeNum(coordinates[i].y);
    const x2 = getSafeNum(coordinates[i + 1].x);
    const y2 = getSafeNum(coordinates[i + 1].y);
    const x3 = getSafeNum(coordinates[i + 2].x);
    const y3 = getSafeNum(coordinates[i + 2].y);
    cross = (x2 - x1) * (y3 - y2) - (y2 - y1) * (x3 - x2);
    if (cross < 0) {
      // 由于坐标系Y是反的，所以cross<0的时候才是顺时针
      // commonUtil.write(coordinates, 1);
      coordinates = commonUtil.copy(coordinates).reverse();
      // commonUtil.write(coordinates, 1);
      break;
    }
  }
  return coordinates;
}
// 获取最右下侧点
function getRightBottom(coordinates) {
  let right = getSafeNum(coordinates[0].x);
  let bottom = getSafeNum(coordinates[0].y);
  let index = 0;
  for (let i = 0; i < coordinates.length; i++) {
    const x = getSafeNum(coordinates[i].x);
    const y = getSafeNum(coordinates[i].y);
    if (x >= right && y >= bottom) {
      // 因为是顺时针的，所以当两点一样时，当优先取索引大的那个
      right = getSafeNum(coordinates[i].x);
      bottom = getSafeNum(coordinates[i].y);
      index = i;
    }
  }
  return { x: right, y: bottom, index };
}
// 获取最左上侧点 topLeft:是否优先上然后左
function getLeftTop(coordinates) {
  let left = getSafeNum(coordinates[0].x);
  let top = getSafeNum(coordinates[0].y);
  let index = 0;
  for (let i = 0; i < coordinates.length; i++) {
    const x = getSafeNum(coordinates[i].x);
    const y = getSafeNum(coordinates[i].y);
    if (x <= left && y <= top && (x !== left || y !== top)) {
      // 因为是顺时针的，所以当两点一样时，当优先取索引小的哪个
      left = getSafeNum(coordinates[i].x);
      top = getSafeNum(coordinates[i].y);
      index = i;
    }
  }
  return { x: left, y: top, index };
}
// 返回左上角顺时针顺序 topLeft:是否先上后左
function getLeftTopClockWise(coordinates) {
  let path = getClockWise(coordinates);
  const { index } = getLeftTop(path);
  index && (path = path.slice(index).concat(path.slice(0, index)));
  return path;
}
// 获取扩充中点后的坐标集
function getMidExpandCoordinates(coordinates) {
  const newCoordinates = [];
  for (let k = 0; k < coordinates.length; k++) {
    const currentX = coordinates[k].x;
    const nextX = coordinates[k + 1 === coordinates.length ? 0 : k + 1].x;
    const currentY = coordinates[k].y;
    const nextY = coordinates[k + 1 === coordinates.length ? 0 : k + 1].y;
    newCoordinates.push({
      x: coordinates[k].x,
      y: coordinates[k].y
    });
    newCoordinates.push({
      x: currentX !== nextX ? (currentX + nextX) / 2 : nextX,
      y: currentY !== nextY ? (currentY + nextY) / 2 : nextY
    });
  }
  return newCoordinates;
}
// 移除中点坐标(左上角顺时针排序)
function removeMidCoordinates(coordinatesWithMid) {
  return getLeftTopClockWise(coordinatesWithMid.filter((co, index) => index % 2 === 0));
}
// 获取绝对坐标
function getAbsolute(propCoordinates, basePoint, width, height) {
  const coordinates = [];
  if (!propCoordinates) {
    return [
      basePoint,
      { x: basePoint.x + width, y: basePoint.y },
      { x: basePoint.x + width, y: basePoint.y + height },
      { x: basePoint.x, y: basePoint.y + height }
    ];
  }
  for (let i = 0; i < propCoordinates.length; i++) {
    coordinates.push({
      x: propCoordinates[i].x * width + basePoint.x,
      y: propCoordinates[i].y * height + basePoint.y
    });
  }
  return coordinates;
}
// 获取相对坐标
function getRelative(propCoordinates, basePoint, ratio, width = 1, height = 1) {
  const coordinates = [];
  for (let i = 0; i < propCoordinates.length; i++) {
    coordinates.push({
      x: (propCoordinates[i].x - (basePoint?.x || 0)) / ratio / width,
      y: (propCoordinates[i].y - (basePoint?.y || 0)) / ratio / height
    });
  }
  return coordinates;
}
// 根据左上右下格式化矩形，并转为左上角顺时针
function formatRectCoordinates(propCoordinates) {
  const coordinates = [
    { x: propCoordinates[0].x, y: propCoordinates[0].y },
    { x: propCoordinates[2].x, y: propCoordinates[0].y },
    { x: propCoordinates[2].x, y: propCoordinates[2].y },
    { x: propCoordinates[0].x, y: propCoordinates[2].y }
  ];
  return getLeftTopClockWise(coordinates);
}
// 获取椭圆的外接矩形
function getEllipseCoordinates(center, axisX, axisY, angle) {
  const coordinates = [
    { x: center.x - axisX, y: center.y - axisY },
    { x: center.x + axisX, y: center.y - axisY },
    { x: center.x + axisX, y: center.y + axisY },
    { x: center.x - axisX, y: center.y + axisY }
  ];
  for (const co of coordinates) {
    const dx = co.x - center.x;
    const dy = co.y - center.y;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    co.x = dx * cos - dy * sin + center.x;
    co.y = dx * sin + dy * cos + center.y;
  }
  return coordinates;
}
// 获取线的外接矩形
function getLineCoordinates(points, width) {
  const controls = commonUtil.copy(points);
  const a = width / 2;
  const b = Math.sqrt(
    Math.pow(points[0].x - points[1].x, 2) + Math.pow(points[0].y - points[1].y, 2)
  );
  // const c = Math.sqrt(Math.pow(b, 2) + Math.pow(a, 2));
  const cos = b ? (points[0].x - points[1].x) / b : 1;
  const sin = b ? (points[0].y - points[1].y) / b : 0;
  const dx = sin * a;
  const dy = cos * a;
  const coordinates = getClockWise([
    { x: controls[0].x + dx, y: controls[0].y - dy },
    { x: controls[1].x + dx, y: controls[1].y - dy },
    { x: controls[1].x - dx, y: controls[1].y + dy },
    { x: controls[0].x - dx, y: controls[0].y + dy }
  ]);
  return coordinates;
}
// 根据点对点进行缩放
function enlargeByPoint(point, newRatio, oldRatio, newPoint, oldPoint) {
  return {
    x: newPoint.x - (((oldPoint || newPoint).x - point.x) / oldRatio) * newRatio,
    y: newPoint.y - (((oldPoint || newPoint).y - point.y) / oldRatio) * newRatio
  };
}
// 对imageData进行缩放
function reSizePixel(oldRatio, ratio, oldImageData) {
  const newW = Math.floor((oldImageData.width / oldRatio) * ratio) || 1;
  const newH = Math.floor((oldImageData.height / oldRatio) * ratio) || 1;
  const newData = new Uint8ClampedArray(newW * newH * 4);
  // 记录leftTop和rightBottom
  let leftTopIndex = 0;
  let rightBottomIndex = 0;
  for (let i = 0; i < newData.length; i += 4) {
    const oldLeft = Math.floor((((i / 4) % newW) / ratio) * oldRatio);
    const oldTop = Math.floor((Math.floor(i / 4 / newW) / ratio) * oldRatio);
    const oldIndex = (oldLeft + oldImageData.width * oldTop) * 4;
    if (oldImageData.data[oldIndex + 3] > 0) {
      !leftTopIndex && (leftTopIndex = i);
      rightBottomIndex = i;
      newData[i] = oldImageData.data[oldIndex];
      newData[i + 1] = oldImageData.data[oldIndex + 1];
      newData[i + 2] = oldImageData.data[oldIndex + 2];
      newData[i + 3] = oldImageData.data[oldIndex + 3];
    }
    // 保存leftTop和rightBottom
  }
  const imageData = new ImageData(newData, newW, newH);
  return {
    imageData,
    leftTop: {
      x: (leftTopIndex / 4) % newW,
      y: leftTopIndex / 4 / newW
    },
    rightBottom: {
      x: (rightBottomIndex / 4) % newW,
      y: rightBottomIndex / 4 / newW
    }
  };
}
// 是否在矩形内
function isInPolygon(coordinates, point) {
  const total = coordinates.length;
  let i = '';
  let j = '';
  let c = false;
  for (i = 0, j = total - 1; i < total; j = i++) {
    if (
      coordinates[i].y > point.y !== coordinates[j].y > point.y &&
      point.x <
        ((coordinates[j].x - coordinates[i].x) * (point.y - coordinates[i].y)) /
          (coordinates[j].y - coordinates[i].y) +
          coordinates[i].x
    ) {
      c = !c;
    }
  }
  return c;
}
// 是否在园内
function isInCircle(center, point, radius) {
  return (
    Math.pow(radius, 2) - Math.pow(point.x - center.x, 2) - Math.pow(point.y - center.y, 2) > 0
  );
}
// 是否在椭圆内
function isInEllipse(shape, point, ctx) {
  ctx.beginPath();
  ctx.translate(shape.center.x, shape.center.y);
  ctx.rotate(shape.angle);
  const k = 0.5522848;
  const ox = shape.axisX * k; // 水平控制点偏移量
  const oy = shape.axisY * k; // 垂直控制点偏移量</p> <p> ctx.beginPath();
  // 从椭圆的左端点开始顺时针绘制四条三次贝塞尔曲线
  ctx.beginPath();
  ctx.fill();
  ctx.moveTo(0 - shape.axisX, 0);
  ctx.bezierCurveTo(0 - shape.axisX, 0 - oy, 0 - ox, 0 - shape.axisY, 0, 0 - shape.axisY);
  ctx.bezierCurveTo(0 + ox, 0 - shape.axisY, 0 + shape.axisX, 0 - oy, 0 + shape.axisX, 0);
  ctx.bezierCurveTo(0 + shape.axisX, 0 + oy, 0 + ox, 0 + shape.axisY, 0, 0 + shape.axisY);
  ctx.bezierCurveTo(0 - ox, 0 + shape.axisY, 0 - shape.axisX, 0 + oy, 0 - shape.axisX, 0);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
  ctx.rotate(-shape.angle);
  ctx.translate(-shape.center.x, -shape.center.y);
  return ctx.isPointInPath(point.x, point.y);
}
// 是否在路径上
function isOnPath({ scope, style, status }, point, staticCanvas) {
  const { ctx, renderRatio } = staticCanvas;
  ctx.beginPath();
  ctx.moveTo(Math.round(scope.coordinates[0].x), Math.round(scope.coordinates[0].y));
  ctx.lineWidth = (style.shape[status].borderWidth + 2) * renderRatio;
  for (let i = 1; i < scope.coordinates.length; i++) {
    ctx.lineTo(scope.coordinates[i].x, scope.coordinates[i].y);
  }
  ctx.stroke();
  return ctx.isPointInStroke(point.x, point.y);
}
// 是否在像素上
function isOnPixel({ imageData, basePoint }, point) {
  const dx = Math.round(point.x - basePoint.x);
  const dy = Math.round(point.y - basePoint.y);
  if (dx < 0 || dy < 0 || dx > imageData.width || dy > imageData.height) {
    return false;
  }
  const index = ((dy - 1) * imageData.width + dx - 1) * 4;
  return (
    imageData.data[index + 1] ||
    imageData.data[index + 2] ||
    imageData.data[index + 3] ||
    imageData.data[index + 4]
  );
}
// 判断点是否在标注元素内
function isInShape({ scope, tailorScope }, point, toolCanvas) {
  let focus = null;
  let focusControl = null;
  let focusRotation = null;
  // 判断是否在标注范围内
  switch (scope.type) {
    case cfg.calibration.TYPES.RECT: {
      focus = isInPolygon(scope.coordinates, point);
      break;
    }
    case cfg.calibration.TYPES.POLYGON: {
      focus = isInPolygon(scope.coordinates, point);
      break;
    }
    case cfg.calibration.TYPES.ELLIPSE: {
      focus = isInEllipse(scope, point, toolCanvas.ctx);
      break;
    }
    case cfg.calibration.TYPES.LINE: {
      focus = isInPolygon(scope.coordinates, point);
      break;
    }
    case cfg.calibration.TYPES.CHAIN: {
      focus = isInPolygon(scope.coordinates, point);
      break;
    }
    case cfg.calibration.TYPES.ABCHAIN: {
      focus = isInPolygon(scope.coordinates, point);
      break;
    }
    case cfg.calibration.TYPES.BACHAIN: {
      focus = isInPolygon(scope.coordinates, point);
      break;
    }
    case cfg.calibration.TYPES.PIXEL: {
      focus = isOnPixel(scope, point);
      break;
    }
    case cfg.imageObj.TYPE: {
      focus = isInPolygon(tailorScope.coordinates, point);
      break;
    }
  }
  // 判断是否在标注控制点上
  if (scope.type === cfg.imageObj.TYPE) {
    if (tailorScope.controls) {
      for (let i = 0; i < tailorScope.controls.length; i++) {
        if (isInPolygon(tailorScope.controls[i].hotCoordinates, point)) {
          focusControl = tailorScope.controls[i];
          !focus && (focus = true);
          break;
        }
      }
    }
  } else if (scope.type !== cfg.calibration.TYPES.PIXEL) {
    // 像素标注模式无控制点
    for (let i = 0; i < scope.controls.length; i++) {
      if (isInCircle(scope.controls[i].point, point, scope.controls[i].hotRadius)) {
        focusControl = scope.controls[i];
        !focus && (focus = true);
        break;
      }
    }
  }
  if (scope.rotation) {
    const radius = scope.rotation.hotRadius;
    if (isInCircle(scope.rotation.point, point, radius)) {
      focusRotation = scope.rotation;
      !focus && (focus = true);
    }
  }
  toolCanvas.clearAll();
  return {
    focus,
    focusControl,
    focusRotation
  };
}
function changeInLimit(d, co, min, max) {
  let dist = d;
  if (co + dist < min) {
    dist = min - co;
  }
  if (co + dist > max) {
    dist = max - co;
  }
  return dist;
}
// 获取受区间限制的数字
function getInLimit(number, min, max) {
  if (number < min) {
    return min;
  }
  if (number > max) {
    return max;
  }
  return number;
}
// 获取受矩形限制的坐标
function getCoordinatesLimitInRect(coordinates, minX = 0, maxX = 1, minY = 0, maxY = 1) {
  const list = [];
  for (let i = 0, len = coordinates.length; i < len; i++) {
    const x = getInLimit(coordinates[i].x, minX, maxX);
    const y = getInLimit(coordinates[i].y, minY, maxY);
    list.push({ x, y });
  }
  return list;
}
// 根据角度获取index，16等份，-11.5~11.5为2
function getAngleIndex(angle, index = 1) {
  return (Math.floor((((angle * 180) / Math.PI + 360 + 11.25) % 360) / 22.5) + 2 * index) % 16;
}
// 根据index调整斜度矩形的坐标点集
function getRectAdjustPoints(points, index, distX, distY, angle = 0) {
  const dAngle = Math.atan2(distY, distX) - angle;
  const d = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2));
  const dy = Math.sin(dAngle) * d;
  const dx = Math.cos(dAngle) * d;
  const sin = Math.sin(angle);
  const cos = Math.cos(angle);
  let deltaX1 = 0;
  let deltaY1 = 0;
  let deltaX2 = 0;
  let deltaY2 = 0;
  // 计算delta
  if (index % 2) {
    if (index === 1 || index === 5) {
      deltaX1 = -sin * dy;
      deltaY1 = cos * dy;
    } else {
      deltaX1 = cos * dx;
      deltaY1 = sin * dx;
    }
  } else if (index === 0 || index === 4) {
    deltaX1 = -sin * dy;
    deltaY1 = cos * dy;
    deltaX2 = cos * dx;
    deltaY2 = sin * dx;
  } else {
    deltaX1 = cos * dx;
    deltaY1 = sin * dx;
    deltaX2 = -sin * dy;
    deltaY2 = cos * dy;
  }
  // 调整控制点
  if (index % 2) {
    points[index].x += deltaX1;
    points[index].y += deltaY1;
    points[(index + 7) % 8].x += deltaX1;
    points[(index + 7) % 8].y += deltaY1;
    points[(index + 1) % 8].x += deltaX1;
    points[(index + 1) % 8].y += deltaY1;
    points[(index + 6) % 8].x = (points[(index + 7) % 8].x + points[(index + 5) % 8].x) / 2;
    points[(index + 6) % 8].y = (points[(index + 7) % 8].y + points[(index + 5) % 8].y) / 2;
    points[(index + 2) % 8].x = (points[(index + 1) % 8].x + points[(index + 3) % 8].x) / 2;
    points[(index + 2) % 8].y = (points[(index + 1) % 8].y + points[(index + 3) % 8].y) / 2;
  } else {
    points[index].x += distX;
    points[index].y += distY;
    points[(index + 2) % 8].x += deltaX1;
    points[(index + 2) % 8].y += deltaY1;
    points[(index + 6) % 8].x += deltaX2;
    points[(index + 6) % 8].y += deltaY2;
    points[(index + 1) % 8].x = (points[index].x + points[(index + 2) % 8].x) / 2;
    points[(index + 1) % 8].y = (points[index].y + points[(index + 2) % 8].y) / 2;
    points[(index + 5) % 8].x = (points[(index + 4) % 8].x + points[(index + 6) % 8].x) / 2;
    points[(index + 5) % 8].y = (points[(index + 4) % 8].y + points[(index + 6) % 8].y) / 2;
    points[(index + 7) % 8].x = (points[index].x + points[(index + 6) % 8].x) / 2;
    points[(index + 7) % 8].y = (points[index].y + points[(index + 6) % 8].y) / 2;
    points[(index + 3) % 8].x = (points[(index + 2) % 8].x + points[(index + 4) % 8].x) / 2;
    points[(index + 3) % 8].y = (points[(index + 2) % 8].y + points[(index + 4) % 8].y) / 2;
  }
  return points;
}

// 获取某个点距离标注框距离最短的那条边(注意，这条边是线段)以及最短距离
function getMinDistInCalibration(coordinates, x0, y0) {
  let minDist = 'init';
  let lineInfo = [];
  for (let i = 0; i < coordinates.length; i++) {
    const x1 = coordinates[i].x;
    const y1 = coordinates[i].y;
    const nextPointIndex = i === coordinates.length - 1 ? 0 : i + 1;
    const x2 = coordinates[nextPointIndex].x;
    const y2 = coordinates[nextPointIndex].y;

    let d = '';

    if (y1 === y2) {
      d = Math.abs(y0 - y2);
    } else if (x1 === x2) {
      d = Math.abs(x0 - x2);
    } else {
      d =
        Math.abs(x0 / (x2 - x1) - y0 / (y2 - y1) - x1 / (x2 - x1) + y1 / (y2 - y1)) /
        Math.sqrt(Math.pow(1 / (x2 - x1), 2) + Math.pow(1 / (y2 - y1), 2));
    }
    const A = (y2 - y1) / (x2 - x1);
    const B = y1 - (x1 * (y2 - y1)) / (x2 - x1);
    const xd = (x0 + A * y0 - A * B) / (A * A + 1); // 投影点的x坐标

    if (minDist === 'init' && ((xd >= x1 && xd <= x2) || (xd >= x2 && xd <= x1))) {
      minDist = d;
      lineInfo = [i, nextPointIndex];
    } else if (d < minDist && ((xd >= x1 && xd <= x2) || (xd >= x2 && xd <= x1))) {
      minDist = d;
      lineInfo = [i, nextPointIndex];
    }
  }
  return {
    dist: minDist,
    lineInfo
  };
}

export default {
  guid,
  getLayoutDirection,
  getClockWise,
  getRightBottom,
  getLeftTop,
  getLeftTopClockWise,
  getMidExpandCoordinates,
  removeMidCoordinates,
  getAbsolute,
  getRelative,
  formatRectCoordinates,
  getEllipseCoordinates,
  getLineCoordinates,
  enlargeByPoint,
  isInShape,
  changeInLimit,
  getDist,
  isOnPath,
  getCoordinatesLimitInRect,
  reSizePixel,
  getAngleIndex,
  getRectAdjustPoints,
  getInLimit,
  getMinDistInCalibration
};
