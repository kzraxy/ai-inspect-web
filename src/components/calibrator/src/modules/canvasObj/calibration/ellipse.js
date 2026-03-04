/*
 * @Description: ellipse:
 * @Author: liushijie
 * @Date:2021-10-14 21:49
 * @Last Modified by: liushijie
 * @Last Modified Date:2021-10-14 21:49
 */
import Calibration from './calibration';
import Control from '../control/control';
import geometryUtil from '../../../utils/geometry';
import commonUtil from '../../../utils/common';

class Ellipse extends Calibration {
  constructor(data) {
    super(data);
  }
}
Ellipse.prototype.getScope = function () {
  const {
    scope: { angle, axisX, axisY, center, controls, coordinates, rotation, type },
    labelPoint
  } = this;
  const scope = {};
  scope.controls = controls.map(col => col.copy());
  scope.rotation = rotation.copy();
  scope.coordinates = commonUtil.copy(coordinates);
  scope.angle = angle;
  scope.axisX = axisX;
  scope.axisY = axisY;
  scope.center = commonUtil.copy(center);
  scope.type = type;
  scope.labelPoint = commonUtil.copy(labelPoint);
  return scope;
};
Ellipse.prototype.setScope = function (scope) {
  const { angle, axisX, axisY, center, controls, coordinates, rotation, type, labelPoint } = scope;
  for (let i = 0; i < this.scope.controls.length; i++) {
    this.scope.controls[i].setPoint(controls[i].point);
  }
  this.scope.rotation.setPoint(rotation.point);
  this.scope.coordinates = commonUtil.copy(coordinates);
  this.scope.angle = angle;
  this.scope.axisX = axisX;
  this.scope.axisY = axisY;
  this.scope.center = commonUtil.copy(center);
  this.scope.type = type;
  this.labelPoint = commonUtil.copy(labelPoint);
  this.labelListDom && this.labelListDom.updateLabelPoint(this.labelPoint);
};
Ellipse.prototype.format = function (data) {
  const {
    type: propType,
    center: propCenter,
    axisX: propAxisX,
    axisY: propAxisY,
    angle: propAngle,
    image = {}
  } = data;
  const { basePoint = { x: 0, y: 0 }, width = 1, height = 1 } = image?.scope || {};
  const type = propType;
  try {
    const center = geometryUtil.getAbsolute([propCenter], basePoint, width, height)[0];
    const axisX = propAxisX * height;
    const axisY = propAxisY * height;
    const angle = Math.PI * (propAngle / 180);
    const coordinates = geometryUtil.getEllipseCoordinates(center, axisX, axisY, angle);
    // 扩充中点
    const controls = geometryUtil
      .getMidExpandCoordinates(coordinates)
      .map((point, index) => new Control(point, index));
    const rotation = new Control(commonUtil.copy(controls[1].point));
    if (typeof angle === 'number') {
      rotation.point.x += Math.sin(angle) * 50;
      rotation.point.y -= Math.cos(angle) * 50;
    }
    return { type, center, axisX, axisY, angle, coordinates, controls, rotation };
  } catch (e) {
    return {
      type,
      center: { x: 0, y: 0 },
      axisX: 0,
      axisY: 0,
      angle: 0,
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
      ],
      rotation: new Control({ x: 0, y: 0 })
    };
  }
};
Ellipse.prototype.unFormat = function (image, calibrationKey, indexKey) {
  const { _data, id, index, status, labelListDom, isHidden } = this;
  const labelList = labelListDom._unFormatLabelList();
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
  } = image || { imageObj: {}, scope: {} };
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
    status,
    labelList,
    scope: { type, angle, axisX, axisY, center },
    isHidden
  };
};
Ellipse.prototype.enlarge = function ({ newRatio, oldRatio, newPoint, oldPoint }) {
  this.scope.center = geometryUtil.enlargeByPoint(
    this.scope.center,
    newRatio,
    oldRatio,
    newPoint,
    oldPoint
  );
  this.scope.rotation.enlarge({ newRatio, oldRatio, newPoint, oldPoint });
  this.scope.axisX = (this.scope.axisX / oldRatio) * newRatio;
  this.scope.axisY = (this.scope.axisY / oldRatio) * newRatio;
  for (let i = 0; i < this.scope.controls.length; i++) {
    this.scope.controls[i].enlarge({ newRatio, oldRatio, newPoint, oldPoint });
  }
  for (let i = 0; i < this.scope.coordinates.length; i++) {
    this.scope.coordinates[i] = geometryUtil.enlargeByPoint(
      this.scope.coordinates[i],
      newRatio,
      oldRatio,
      newPoint,
      oldPoint
    );
  }
  this.updateLabelPoint();
};
Ellipse.prototype.move = function (distX, distY) {
  this.moveControlsAndCoordinates(distX, distY);
  this.scope.center.x += distX;
  this.scope.center.y += distY;
  this.scope.rotation.point.x += distX;
  this.scope.rotation.point.y += distY;
  this.updateLabelPoint();
};
// 控制点
Ellipse.prototype.adjustControl = function (index, { distX, distY }) {
  // 根据index、angle调整矩形的坐标点集，并按左上顺时针排序
  const points = geometryUtil.getRectAdjustPoints(
    this.scope.controls.map(con => con.point),
    index,
    distX,
    distY,
    this.scope.angle
  );
  // 调整控制点
  for (let i = 0, len = points.length; i < len; i++) {
    this.scope.controls[i].setPoint(points[i]);
  }
  // 调整坐标;
  this.scope.coordinates = geometryUtil.removeMidCoordinates(points);
  // 调整横竖轴
  this.scope.axisX =
    Math.sqrt((points[0].x - points[2].x) ** 2 + (points[0].y - points[2].y) ** 2) / 2;
  this.scope.axisY =
    Math.sqrt((points[2].x - points[4].x) ** 2 + (points[2].y - points[4].y) ** 2) / 2;
  // 调整圆心
  this.scope.center.x = (points[0].x + points[2].x + points[4].x + points[6].x) / 4;
  this.scope.center.y = (points[0].y + points[2].y + points[4].y + points[6].y) / 4;
  // 调整旋转中心
  const an =
    Math.PI - Math.atan2(points[1].x - this.scope.center.x, points[1].y - this.scope.center.y);
  this.scope.rotation.point.x = points[1].x + Math.sin(an) * 50;
  this.scope.rotation.point.y = points[1].y - Math.cos(an) * 50;
  // 调整标签
  this.updateLabelPoint();
};
// 旋转
Ellipse.prototype.rotate = function (propAngle) {
  const angle = Math.PI * (propAngle / 180);
  const { center } = this.scope;
  const { axisX } = this.scope;
  const { axisY } = this.scope;
  // 获取椭圆的外接矩形
  const coordinates = geometryUtil.getEllipseCoordinates(center, axisX, axisY, angle);
  // 扩充中点
  const points = geometryUtil.getMidExpandCoordinates(coordinates);
  this.scope.controls.forEach((co, index) => {
    co.setPoint(points[index]);
  });
  // 生成旋转控制点
  const point = commonUtil.copy(points[1]);
  if (typeof angle === 'number') {
    point.x += Math.sin(angle) * 50;
    point.y -= Math.cos(angle) * 50;
  }
  this.scope.coordinates = coordinates;
  this.scope.rotation.setPoint(point);
  this.scope.angle = angle;
  this.updateLabelPoint();
};
Ellipse.prototype.updateLabelPoint = function () {
  if (this.scope?.controls) {
    this.labelPoint = commonUtil.copy(this.scope.controls[1].point);
    this.labelListDom && this.labelListDom.updateLabelPoint(this.labelPoint);
  }
};
export default Ellipse;
