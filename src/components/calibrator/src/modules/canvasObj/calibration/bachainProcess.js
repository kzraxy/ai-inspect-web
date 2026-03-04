/*
 * @Description: bachainProcess:
 * @Author: liushijie
 * @Date:2021-10-30 22:49
 * @Last Modified by: liushijie
 * @Last Modified Date:2021-10-30 22:49
 */
import CalibrationProcess from './calibrationProcess';
import geometryUtil from '../../../utils/geometry';
import commonUtil from '../../../utils/common';
class BAChainProcess extends CalibrationProcess {
  constructor(params) {
    super(params);
    this.updateProcessData(this.scope.coordinates[0]);
  }
}
BAChainProcess.prototype.updateProcessData = function(point, limit) {
  let X = point.x;
  let Y = point.y;
  if (limit) {
    X > limit.maxX && (X = limit.maxX);
    Y > limit.maxY && (Y = limit.maxY);
    X < limit.minX && (X = limit.minX);
    Y < limit.minY && (Y = limit.minY);
  }
  this.scope.coordinates[1] = { x: X, y: Y }
  // this.scope.coordinates[1] = point;
  this.scope.maskCoordinates = geometryUtil.getLineCoordinates(
    this.scope.coordinates,
    this.scope.width
  );
};
BAChainProcess.prototype.enlarge = function({ newRatio, oldRatio, newPoint, oldPoint }) {
  const { coordinates, controls, maskCoordinates, width } = this.scope;
  this.scope.width = (width / oldRatio) * newRatio;
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
  for (let i = 0; i < maskCoordinates.length; i++) {
    maskCoordinates[i] = geometryUtil.enlargeByPoint(
      maskCoordinates[i],
      newRatio,
      oldRatio,
      newPoint,
      oldPoint
    );
  }
};
BAChainProcess.prototype.getScope = function() {
  const {
    scope: { type, controls, coordinates, maskCoordinates, width }
  } = this;
  const scope = {};
  scope.controls = commonUtil.copy(controls);
  scope.coordinates = commonUtil.copy(coordinates);
  maskCoordinates && (scope.maskCoordinates = commonUtil.copy(maskCoordinates));
  scope.type = type;
  scope.width = width;
  return scope;
};
BAChainProcess.prototype.setScope = function(scope) {
  const { type, controls, coordinates, maskCoordinates, width } = scope;
  this.scope.controls = commonUtil.copy(controls);
  this.scope.coordinates = commonUtil.copy(coordinates);
  maskCoordinates && (this.scope.maskCoordinates = commonUtil.copy(maskCoordinates));
  this.scope.width = width;
  this.scope.type = type;
};
BAChainProcess.prototype.unFormat = function(image, calibrationKey, indexKey) {
  const { _data, id, index, status, isProcess } = this;
  const {
    type,
    coordinates: propCoordinates,
    maskCoordinates: propMaskCoordinates = [],
    width: propWidth
  } = this.scope;
  const {
    imageObj: { width: imageWidth, height: imageHeight },
    scope: { basePoint, ratio }
  } = image;
  const coordinates = geometryUtil.getRelative(
    propCoordinates,
    basePoint,
    ratio,
    imageWidth,
    imageHeight
  );
  const maskCoordinates = geometryUtil.getRelative(
    propMaskCoordinates,
    basePoint,
    ratio,
    imageWidth,
    imageHeight
  );
  const width = propWidth / ratio / imageHeight;
  return {
    ..._data,
    [calibrationKey]: id,
    [indexKey || 'index']: index,
    isProcess,
    status,
    scope: { type, width, coordinates, maskCoordinates }
  };
};
BAChainProcess.prototype.move = function(distX, distY) {
  this.moveControlsAndCoordinates(distX, distY);
};
export default BAChainProcess;
