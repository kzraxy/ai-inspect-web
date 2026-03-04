/*
 * @Description: rectProcess:
 * @Author: liushijie
 * @Date:2021-10-30 22:49
 * @Last Modified by: liushijie
 * @Last Modified Date:2021-10-30 22:49
 */
import CalibrationProcess from './calibrationProcess';
import geometryUtil from '../../../utils/geometry';
import commonUtil from '../../../utils/common';
class RectProcess extends CalibrationProcess {
  constructor(params) {
    super(params);
    this.updateProcessData(this.scope.coordinates[0]);
  }
}
RectProcess.prototype.updateProcessData = function(point, limit = {}) {
  const { x, y } = this.scope.coordinates[0];
  let X = point.x;
  let Y = point.y;
  X > limit.maxX && (X = limit.maxX);
  Y > limit.maxY && (Y = limit.maxY);
  X < limit.minX && (X = limit.minX);
  Y < limit.minY && (Y = limit.minY);
  this.scope.coordinates = [
    { x, y },
    { x: X, y },
    { x: X, y: Y },
    { x, y: Y }
  ];
};
RectProcess.prototype.enlarge = function({ newRatio, oldRatio, newPoint, oldPoint }) {
  const { coordinates, controls } = this.scope;
  for (let i = 0; i < coordinates.length; i++) {
    coordinates[i] = geometryUtil.enlargeByPoint(
      coordinates[i],
      newRatio,
      oldRatio,
      newPoint,
      oldPoint
    );
  }
  for (let i = 0; i < controls.length; i++) {
    controls[i] = geometryUtil.enlargeByPoint(controls[i], newRatio, oldRatio, newPoint, oldPoint);
  }
};
RectProcess.prototype.getScope = function() {
  const {
    scope: { controls, coordinates, type }
  } = this;
  const scope = {};
  scope.controls = commonUtil.copy(controls);
  scope.coordinates = commonUtil.copy(coordinates);
  scope.type = type;
  return scope;
};
RectProcess.prototype.setScope = function(scope) {
  const { controls, coordinates, type } = scope;
  this.scope.controls = commonUtil.copy(controls);
  this.scope.coordinates = commonUtil.copy(coordinates);
  this.scope.type = type;
};
RectProcess.prototype.unFormat = function(image, calibrationKey, indexKey) {
  const { _data, id, index, status, isProcess } = this;
  const { type, coordinates: propCoordinates } = this.scope;
  const {
    imageObj: { width: imageWidth, height: imageHeight },
    scope: { basePoint, ratio }
  } = image;
  let coordinates = geometryUtil.getRelative(
    propCoordinates,
    basePoint,
    ratio,
    imageWidth,
    imageHeight
  );
  coordinates = geometryUtil.getLeftTopClockWise(coordinates);
  return {
    ..._data,
    [calibrationKey]: id,
    [indexKey || 'index']: index,
    status,
    isProcess,
    scope: { type, coordinates }
  };
};
RectProcess.prototype.move = function(distX, distY) {
  this.moveControlsAndCoordinates(distX, distY);
};
export default RectProcess;
