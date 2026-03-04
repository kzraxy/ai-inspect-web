/*
 * @Description: calibrationProcess:
 * @Author: liushijie
 * @Date:2021-10-30 23:36
 * @Last Modified by: liushijie
 * @Last Modified Date:2021-10-30 23:36
 */
import Calibration from './calibration';
import commonUtil from '../../../utils/common';
import geometryUtil from '../../../utils/geometry';
class CalibrationProcess extends Calibration {
  constructor(params) {
    super(params);
    this.scope = params.data.scope;
    this.scope.controls = commonUtil.copy(this.scope.coordinates);
    this.isProcess = true;
  }
}
CalibrationProcess.prototype.getData = function() {
  const data = {};
  data.id = this.id;
  data.status = this.status;

  data.index = this.index;
  data.scope = this.getScope();
  data.style = commonUtil.copy(this.style);
  return data;
};
CalibrationProcess.prototype.getScope = function() {
  return JSON.parse(JSON.stringify(this.scope));
};
CalibrationProcess.prototype.setScope = function(scope) {
  this.scope = JSON.parse(JSON.stringify(scope));
};
CalibrationProcess.prototype.updateControls = function() {
  this.scope.controls = JSON.parse(JSON.stringify(this.scope.coordinates));
};
CalibrationProcess.prototype.unFormat = function(image, calibrationKey, indexKey) {
  const { id, index, status, isProcess } = this;
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
    [calibrationKey]: id,
    [indexKey || 'index']: index,
    status,
    isProcess,
    scope: { type, coordinates }
  };
};
CalibrationProcess.prototype.moveControlsAndCoordinates = function(distX, distY) {
  // 更新控制点位置
  if (this.scope.controls) {
    for (let i = 0; i < this.scope.controls.length; i++) {
      this.scope.controls[i].x += distX;
      this.scope.controls[i].y += distY;
    }
  }
  // 更新标注范围坐标
  if (this.scope.coordinates) {
    for (let i = 0; i < this.scope.coordinates.length; i++) {
      this.scope.coordinates[i].x += distX;
      this.scope.coordinates[i].y += distY;
    }
  }
  // 更新线条的标注范围坐标
  if (this.scope.maskCoordinates) {
    for (let i = 0; i < this.scope.maskCoordinates.length; i++) {
      this.scope.maskCoordinates[i].x += distX;
      this.scope.maskCoordinates[i].y += distY;
    }
  }
};

export default CalibrationProcess;
