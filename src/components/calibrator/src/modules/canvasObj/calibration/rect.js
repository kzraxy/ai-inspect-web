/*
 * @Description: rect:
 * @Author: liushijie
 * @Date:2021-10-14 21:49
 * @Last Modified by: liushijie
 * @Last Modified Date:2021-10-14 21:49
 */
import Calibration from './calibration';
import Control from '../control/control';
import geometryUtil from '../../../utils/geometry';
import commonUtil from '../../../utils/common';

class Rect extends Calibration {
  constructor(data) {
    super(data);
  }
}

Rect.prototype.getScope = function () {
  const {
    scope: { controls, coordinates, type },
    labelPoint
  } = this;
  const scope = {};
  scope.controls = controls.map(col => col.copy());
  scope.coordinates = commonUtil.copy(coordinates);
  scope.type = type;
  scope.labelPoint = commonUtil.copy(labelPoint);
  return scope;
};
Rect.prototype.setScope = function (scope) {
  const { controls, coordinates, type, labelPoint } = scope;
  for (let i = 0; i < this.scope.controls.length; i++) {
    this.scope.controls[i].setPoint(controls[i].point);
  }
  this.scope.coordinates = commonUtil.copy(coordinates);
  this.scope.type = type;
  this.labelPoint = commonUtil.copy(labelPoint);
  this.labelListDom && this.labelListDom.updateLabelPoint(this.labelPoint);
};
Rect.prototype.format = function (data) {
  const { type: propType, coordinates: propCoordinates, image = {} } = data;
  const { basePoint = { x: 0, y: 0 }, width = 1, height = 1 } = image?.scope || {};
  const type = propType;
  try {
    let coordinates = geometryUtil.getAbsolute(propCoordinates, basePoint, width, height);
    // 根据左上右下格式化矩形，并转为左上角顺时针
    coordinates = geometryUtil.formatRectCoordinates(coordinates);
    // 扩充中点
    const controls = geometryUtil
      .getMidExpandCoordinates(coordinates)
      .map((point, index) => new Control(point, index));
    return { type, coordinates, controls };
  } catch (e) {
    return {
      type,
      coordinates: [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 }
      ],
      controls: [
        new Control({ x: 0, y: 0 }),
        new Control({ x: 0, y: 0 }),
        new Control({ x: 0, y: 0 }),
        new Control({ x: 0, y: 0 }),
        new Control({ x: 0, y: 0 }),
        new Control({ x: 0, y: 0 }),
        new Control({ x: 0, y: 0 }),
        new Control({ x: 0, y: 0 })
      ]
    };
  }
};
Rect.prototype.unFormat = function (image, calibrationKey, indexKey) {
  const { _data, id, index, status, labelListDom, isHidden } = this;
  const labelList = labelListDom._unFormatLabelList();
  const { type, coordinates: propCoordinates } = this.scope;
  const {
    imageObj: { width: imageWidth, height: imageHeight },
    scope: { basePoint, ratio }
  } = image || { imageObj: {}, scope: {} };
  let coordinates = geometryUtil.getRelative(
    propCoordinates,
    basePoint,
    ratio,
    imageWidth,
    imageHeight
  );
  // 根据左上右下格式化矩形，并转为左上角顺时针
  coordinates = geometryUtil.formatRectCoordinates(coordinates);
  return {
    ..._data,
    isHidden,
    [calibrationKey]: id,
    [indexKey || 'index']: index,
    status,
    labelList,
    scope: { type, coordinates }
  };
};
/*
 * 根据两点对矩形进行缩放
 * @params newRatio 新的比例
 * @params oldRatio 旧的比例
 * @params newPoint 新的点
 * @params oldPoint 旧的点
 * */
Rect.prototype.enlarge = function ({ newRatio, oldRatio, newPoint, oldPoint }) {
  const { coordinates, controls } = this.scope;
  // 对八个操作点进行缩放
  for (let i = 0; i < controls.length; i++) {
    controls[i].enlarge({ newRatio, oldRatio, newPoint, oldPoint });
  }
  for (let i = 0; i < coordinates.length; i++) {
    // 对矩形的四个坐标点进行缩放
    coordinates[i] = geometryUtil.enlargeByPoint(
      coordinates[i],
      newRatio,
      oldRatio,
      newPoint,
      oldPoint
    );
  }
  // 更新标签的所在点
  this.updateLabelPoint();
};
Rect.prototype.move = function (distX, distY) {
  this.moveControlsAndCoordinates(distX, distY);
  this.updateLabelPoint();
};
Rect.prototype.adjustControl = function (index, { distX: dx, distY: dy }, limit) {
  let distX = dx;
  let distY = dy;
  const { controls } = this.scope;
  distX = geometryUtil.changeInLimit(distX, controls[index].point.x, limit.minX, limit.maxX);
  distY = geometryUtil.changeInLimit(distY, controls[index].point.y, limit.minY, limit.maxY);
  // 根据index、angle调整矩形的坐标点集，并按左上顺时针排序
  const points = geometryUtil.getLeftTopClockWise(
    geometryUtil.getRectAdjustPoints(
      controls.map(con => con.point),
      index,
      distX,
      distY
    )
  );
  this.scope.controls.forEach((con, index) => {
    con.setPoint(points[index]);
  });
  // 根据左上右下格式化矩形，并转为左上角顺时针
  this.scope.coordinates = geometryUtil.formatRectCoordinates(
    geometryUtil.removeMidCoordinates(points)
  );
  this.updateLabelPoint();
};
export default Rect;
