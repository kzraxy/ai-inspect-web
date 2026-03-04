/*
 * @Description: polygon:
 * @Author: liushijie
 * @Date:2021-10-14 21:49
 * @Last Modified by: liushijie
 * @Last Modified Date:2021-10-14 21:49
 */
import Calibration from './calibration';
import Control from '../control/control';
import geometryUtil from '../../../utils/geometry';
import commonUtil from '../../../utils/common';

class Polygon extends Calibration {
  constructor(data) {
    super(data);
  }
}
Polygon.prototype.getScope = function () {
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
Polygon.prototype.setScope = function (scope) {
  const { controls, coordinates, type, labelPoint } = scope;
  for (let i = 0; i < this.scope.controls.length; i++) {
    this.scope.controls[i].setPoint(controls[i].point);
  }
  this.scope.coordinates = commonUtil.copy(coordinates);
  this.scope.type = type;
  this.labelPoint = commonUtil.copy(labelPoint);
  this.labelListDom && this.labelListDom.updateLabelPoint(this.labelPoint);
};
Polygon.prototype.format = function (data) {
  const { type: propType, coordinates: propCoordinates, image = {} } = data;
  const { basePoint = { x: 0, y: 0 }, width = 1, height = 1 } = image?.scope || {};
  const type = propType;
  let coordinates = geometryUtil.getAbsolute(propCoordinates, basePoint, width, height);
  // 左上角顺时针格式化多边形坐标
  coordinates = geometryUtil.getClockWise(coordinates);
  const controls = coordinates.map((point, index) => new Control(point, index));
  return { type, coordinates, controls };
};
Polygon.prototype.unFormat = function (image, calibrationKey, indexKey) {
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
  // 左上角顺时针格式化多边形坐标
  coordinates = geometryUtil.getClockWise(coordinates);
  return {
    ..._data,
    [calibrationKey]: id,
    [indexKey || 'index']: index,
    status,
    labelList,
    scope: { type, coordinates },
    isHidden
  };
};
Polygon.prototype.enlarge = function ({ newRatio, oldRatio, newPoint, oldPoint }) {
  const { coordinates, controls } = this.scope;
  for (let i = 0; i < controls.length; i++) {
    controls[i].enlarge({ newRatio, oldRatio, newPoint, oldPoint });
  }
  for (let i = 0; i < coordinates.length; i++) {
    coordinates[i] = geometryUtil.enlargeByPoint(
      coordinates[i],
      newRatio,
      oldRatio,
      newPoint,
      oldPoint
    );
  }
  this.updateLabelPoint();
};
Polygon.prototype.move = function (distX, distY) {
  this.moveControlsAndCoordinates(distX, distY);
  this.updateLabelPoint();
};
Polygon.prototype.adjustControl = function (index, { distX: dx, distY: dy }, limit) {
  let distX = dx;
  let distY = dy;
  const { controls } = this.scope;
  distX = geometryUtil.changeInLimit(distX, controls[index].point.x, limit.minX, limit.maxX);
  distY = geometryUtil.changeInLimit(distY, controls[index].point.y, limit.minY, limit.maxY);
  controls[index].point.x += distX;
  controls[index].point.y += distY;
  // 调整坐标
  this.scope.coordinates = controls.map(con => commonUtil.copy(con.point));
  this.updateLabelPoint();
};
Polygon.prototype.addAnchorPoint = function (point, lineInfo) {
  const pos = lineInfo[0];
  const arr = [
    ...this.scope.coordinates.slice(0, pos + 1),
    { x: point.x, y: point.y },
    ...this.scope.coordinates.slice(pos + 1)
  ];
  this.scope.coordinates = arr;
  this.scope.controls = arr.map((point, index) => new Control(point, index));
};
Polygon.prototype.deleteAnchorPoint = function (control) {
  const controlIndex = this.scope.controls.findIndex(item => item.$$id === control.$$id);
  // if (this.scope.controls.length === 3) {
  //   return {
  //     code: 'fail',
  //     msg: '锚点的下限为3，当少于3个锚点时，自动清除标注框'
  //   };
  // }
  this.scope.controls.splice(controlIndex, 1);
  this.scope.coordinates.splice(controlIndex, 1);
  this.updateLabelPoint();

  // return {
  //   code: 'success',
  //   msg: ''
  // };
};
export default Polygon;
