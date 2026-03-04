/*
 * @Description: line:
 * @Author: liushijie
 * @Date:2021-10-14 21:50
 * @Last Modified by: liushijie
 * @Last Modified Date:2021-10-14 21:50
 */
import Calibration from './calibration';
import Control from '../control/control';
import geometryUtil from '../../../utils/geometry';
import commonUtil from '../../../utils/common';

class Line extends Calibration {
  constructor(data) {
    super(data);
  }
}

Line.prototype.getScope = function () {
  const {
    scope: { controls, coordinates, type, width },
    labelPoint
  } = this;
  const scope = {};
  scope.controls = controls.map(col => col.copy());
  scope.coordinates = commonUtil.copy(coordinates);
  scope.width = width;
  scope.type = type;
  scope.labelPoint = commonUtil.copy(labelPoint);
  return scope;
};
Line.prototype.setScope = function (scope) {
  const { controls, coordinates, type, width, labelPoint } = scope;
  for (let i = 0; i < this.scope.controls.length; i++) {
    this.scope.controls[i].setPoint(controls[i].point);
  }
  this.scope.coordinates = commonUtil.copy(coordinates);
  this.scope.width = width;
  this.scope.type = type;
  this.labelPoint = commonUtil.copy(labelPoint);
  this.labelListDom && this.labelListDom.updateLabelPoint(this.labelPoint);
};
Line.prototype.format = function (data) {
  const {
    type: propType,
    coordinates: propCoordinates = [],
    width: propWidth = 0,
    image = {}
  } = data;
  const {
    basePoint = { x: 0, y: 0 },
    width: imgWidth = 1,
    height: imgHeight = 1
  } = image?.scope || {};
  const type = propType;
  try {
    const controlPoints = geometryUtil.getAbsolute(propCoordinates, basePoint, imgWidth, imgHeight);
    const controls = controlPoints.map((co, index) => new Control(co, index));
    const width = propWidth * imgHeight;
    let coordinates = geometryUtil.getLineCoordinates(controlPoints, width);
    coordinates = geometryUtil.getLeftTopClockWise(coordinates);
    return { type, width, coordinates, controls };
  } catch (e) {
    return {
      type,
      width: 0,
      coordinates: [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 }
      ],
      controls: [new Control({ x: 0, y: 0 }), new Control({ x: 0, y: 0 })]
    };
  }
};
Line.prototype.unFormat = function (image, calibrationKey, indexKey) {
  const { _data, id, index, status, labelListDom, isHidden } = this;
  const labelList = labelListDom._unFormatLabelList();
  const {
    type,
    controls: propCoordinates,
    coordinates: propMaskCoordinates,
    width: propWidth
  } = this.scope;
  const {
    imageObj: { width: imageWidth, height: imageHeight },
    scope: { basePoint, ratio }
  } = image || { imageObj: {}, scope: {} };
  const coordinates = geometryUtil.getRelative(
    propCoordinates.map(co => co.point),
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
    status,
    labelList,
    scope: { type, coordinates, maskCoordinates, width },
    isHidden
  };
};
Line.prototype.enlarge = function ({ newRatio, oldRatio, newPoint, oldPoint }) {
  const { coordinates, controls, width } = this.scope;
  this.scope.width = (width / oldRatio) * newRatio;
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
Line.prototype.move = function (distX, distY) {
  this.moveControlsAndCoordinates(distX, distY);
  this.updateLabelPoint();
};
Line.prototype.adjustControl = function (index, { distX, distY }) {
  const { controls } = this.scope;
  controls[index].point.x += distX;
  controls[index].point.y += distY;
  // 调整坐标
  const { width } = this.scope;
  const a = width / 2;
  const b = Math.sqrt(
    (controls[0].point.x - controls[1].point.x) ** 2 +
      (controls[0].point.y - controls[1].point.y) ** 2
  );
  // const ha= Math.sqrt(Math.pow(b, 2) + Math.pow(a, 2));
  const cos = (controls[0].point.x - controls[1].point.x) / b;
  const sin = (controls[0].point.y - controls[1].point.y) / b;
  const x = sin * a;
  const y = cos * a;
  const coordinates = [
    { x: controls[0].point.x + x, y: controls[0].point.y - y },
    { x: controls[1].point.x + x, y: controls[1].point.y - y },
    { x: controls[1].point.x - x, y: controls[1].point.y + y },
    { x: controls[0].point.x - x, y: controls[0].point.y + y }
  ];
  this.scope.coordinates = coordinates;

  this.updateLabelPoint();
};
export default Line;
