/*
 * @Description: polygon:
 * @Author: liushijie
 * @Date:2021-10-14 21:49
 * @Last Modified by: liushijie
 * @Last Modified Date:2021-10-14 21:49
 */
import Calibration from './calibration';
import geometryUtil from '../../../utils/geometry';
import commonUtil from '../../../utils/common';
class Pixel extends Calibration {
  constructor(data) {
    super(data);
  }
}
Pixel.prototype.getScope = function() {
  const {
    scope: { type, basePoint },
    labelPoint
  } = this;
  const scope = {};
  scope.type = type;
  scope.basePoint = commonUtil.copy(basePoint);
  scope.labelPoint = labelPoint;
  return scope;
};
Pixel.prototype.setScope = function(scope) {
  const { type, basePoint, labelPoint } = scope;
  this.scope.type = type;
  this.scope.basePoint = commonUtil.copy(basePoint);
  this.labelPoint = commonUtil.copy(labelPoint);
  this.labelListDom && this.labelListDom.updateLabelPoint(this.labelPoint);
};
Pixel.prototype.format = function(data) {
  const { type: propType, imageData: propImageData, left, top, image = {} } = data;
  const { basePoint: imageBasePoint = { x: 0, y: 0 }, width = 1, height = 1, ratio } =
    image.scope || {};
  const type = propType;
  // 反归一化
  const basePoint = geometryUtil.getAbsolute(
    [{ x: left, y: top }],
    imageBasePoint,
    width,
    height
  )[0];
  // imageData缩放处理
  const { imageData, leftTop } = geometryUtil.reSizePixel(1, ratio, propImageData);
  // 创建canvas缓存
  const canvas = document.createElement('canvas');
  canvas.width = propImageData.width * ratio;
  canvas.height = propImageData.height * ratio;
  const ctx = canvas.getContext('2d');
  ctx.putImageData(imageData, 0, 0);
  return { type, basePoint, leftTop, canvas, ctx, imageData };
};
Pixel.prototype.unFormat = function(image, calibrationKey, indexKey) {
  const { _data, id, index, status, labelListDom } = this;
  const labelList = labelListDom._unFormatLabelList();
  const { type } = this.scope;
  return {
    ..._data,
    [calibrationKey]: id,
    [indexKey || 'index']: index,
    status,
    labelList,
    scope: { type }
  };
};
Pixel.prototype.enlarge = function({ newRatio, oldRatio, newPoint, oldPoint }) {
  const { _data, scope } = this;
  const { canvas, basePoint: oldBasePoint, ctx, imageData } = scope;
  const basePoint = geometryUtil.enlargeByPoint(
    oldBasePoint,
    newRatio,
    oldRatio,
    newPoint,
    oldPoint
  );
  const w = _data.scope.imageData.width * newRatio;
  const h = _data.scope.imageData.height * newRatio;
  const { imageData: newData, leftTop } = geometryUtil.reSizePixel(oldRatio, newRatio, imageData);
  canvas.width = w;
  canvas.height = h;
  ctx.putImageData(newData, 0, 0);
  this.scope.imageData = newData;
  this.scope.ctx = ctx;
  this.scope.leftTop = leftTop;
  this.scope.basePoint = basePoint;

  this.updateLabelPoint();
};
Pixel.prototype.move = function(distX, distY) {
  this.scope.basePoint.x += distX;
  this.scope.basePoint.y += distY;
  this.updateLabelPoint();
};
Pixel.prototype.updateLabelPoint = function() {
  this.labelPoint = {
    x: this.scope.leftTop.x + this.scope.basePoint.x,
    y: this.scope.leftTop.y + this.scope.basePoint.y
  };
  this.labelListDom && this.labelListDom.updateLabelPoint(this.labelPoint);
};
Pixel.prototype.adjustControl = function() {};
export default Pixel;
