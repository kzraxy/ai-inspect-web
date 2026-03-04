/*
 * @Description: lineProcess:
 * @Author: liushijie
 * @Date:2021-10-30 22:49
 * @Last Modified by: liushijie
 * @Last Modified Date:2021-10-30 22:49
 */
import CalibrationProcess from './calibrationProcess';
import commonUtil from '../../../utils/common';
import geometryUtil from '../../../utils/geometry';
class EllipseProcess extends CalibrationProcess {
  constructor(params) {
    super(params);
    this.updateProcessData(this.scope.controls[0]);
  }
}
EllipseProcess.prototype.updateProcessData = function(point) {
  this.scope.controls[1] = point;
  this.scope.center = {
    x: (this.scope.controls[0].x + this.scope.controls[1].x) / 2,
    y: (this.scope.controls[0].y + this.scope.controls[1].y) / 2
  };
  const radius =
    Math.sqrt(
      Math.pow(this.scope.controls[1].x - this.scope.controls[0].x, 2) +
        Math.pow(this.scope.controls[1].y - this.scope.controls[0].y, 2)
    ) / 2;
  this.scope.axisX = radius;
  this.scope.axisY = radius;
  this.scope.angle = 0;
};
EllipseProcess.prototype.enlarge = function({ newRatio, oldRatio, newPoint, oldPoint }) {
  const { axisX, axisY, center, controls, coordinates } = this.scope;
  this.scope.axisY = (axisY / oldRatio) * newRatio;
  this.scope.axisX = (axisX / oldRatio) * newRatio;
  for (let i = 0; i < controls.length; i++) {
    controls[i] = geometryUtil.enlargeByPoint(controls[i], newRatio, oldRatio, newPoint, oldPoint);
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
  this.scope.center = geometryUtil.enlargeByPoint(center, newRatio, oldRatio, newPoint, oldPoint);
};
EllipseProcess.prototype.getScope = function() {
  const {
    scope: { center, axisX, axisY, controls, coordinates, type, angle }
  } = this;
  const scope = {};
  scope.controls = commonUtil.copy(controls);
  scope.coordinates = commonUtil.copy(coordinates);
  center && (scope.center = commonUtil.copy(center));
  scope.type = type;
  scope.axisX = axisX;
  scope.axisY = axisY;
  scope.angle = angle;
  return scope;
};
EllipseProcess.prototype.setScope = function(scope) {
  const { axisX, axisY, center, controls, coordinates, type, angle } = scope;
  this.scope.controls = commonUtil.copy(controls);
  this.scope.coordinates = commonUtil.copy(coordinates);
  center && (scope.center = commonUtil.copy(center));
  this.scope.type = type;
  this.scope.axisY = axisY;
  this.scope.axisX = axisX;
  this.scope.angle = angle;
};
EllipseProcess.prototype.unFormat = function(image, calibrationKey, indexKey) {
  const { _data, id, index, status, isProcess } = this;
  const {
    type,
    angle: propAngle,
    axisX: propAxisX,
    axisY: propAxisY,
    center: propCenter
  } = this.scope;
  const {
    imageObj: { width: imageWidth, height: imageHeight },
    scope: { basePoint, ratio }
  } = image;
  const center = geometryUtil.getRelative(
    [propCenter],
    basePoint,
    ratio,
    imageWidth,
    imageHeight
  )[0];
  const axisX = propAxisX / ratio / imageHeight;
  const axisY = propAxisY / ratio / imageHeight;
  const angle = (propAngle * 180) / Math.PI;
  return {
    ..._data,
    [calibrationKey]: id,
    [indexKey || 'index']: index,
    isProcess,
    status,
    scope: { type, angle, axisX, axisY, center }
  };
};
EllipseProcess.prototype.move = function(distX, distY) {
  this.moveControlsAndCoordinates(distX, distY);
  this.scope.center.x = (this.scope.controls[0].x + this.scope.controls[1].x) / 2;
  this.scope.center.y = (this.scope.controls[0].y + this.scope.controls[1].y) / 2;
};
export default EllipseProcess;
