/*
 * @Description: tailorControl:
 * @Author: liushijie
 * @Date:2021-09-13 11:25
 * @Last Modified by: liushijie
 * @Last Modified Date:2021-09-13 11:25
 */
import Control from './control';
import cfg from '../../../config';
import geometryUtil from '../../../utils/geometry';
import commonUtil from '../../../utils/common';

const _getCoordinates = function(index, x, y, l, w) {
  let coordinates = [];
  switch (`${index}`) {
    case '0':
      coordinates = [
        { x, y },
        { x: x + l, y },
        { x: x + l, y: y + w },
        { x: x + w, y: y + w },
        { x: x + w, y: y + l },
        { x, y: y + l }
      ];
      break;
    case '1':
      coordinates = [
        { x: x - l / 2, y },
        { x: x + l / 2, y },
        { x: x + l / 2, y: y + w },
        { x: x - l / 2, y: y + w }
      ];
      break;
    case '2':
      coordinates = [
        { x: x - l, y },
        { x, y },
        { x, y: y + l },
        { x: x - w, y: y + l },
        { x: x - w, y: y + w },
        { x: x - l, y: y + w }
      ];
      break;
    case '3':
      coordinates = [
        { x: x - w, y: y - l / 2 },
        { x, y: y - l / 2 },
        { x, y: y + l / 2 },
        { x: x - w, y: y + l / 2 }
      ];
      break;
    case '4':
      coordinates = [
        { x: x - w, y: y - l },
        { x, y: y - l },
        { x, y },
        { x: x - l, y },
        { x: x - l, y: y - w },
        { x: x - w, y: y - w }
      ];
      break;
    case '5':
      coordinates = [
        { x: x - l / 2, y: y - w },
        { x: x + l / 2, y: y - w },
        { x: x + l / 2, y },
        { x: x - l / 2, y }
      ];
      break;
    case '6':
      coordinates = [
        { x, y: y - l },
        { x: x + w, y: y - l },
        { x: x + w, y: y - w },
        { x: x + l, y: y - w },
        { x: x + l, y },
        { x, y }
      ];
      break;
    case '7':
      coordinates = [
        { x, y: y - l / 2 },
        { x: x + w, y: y - l / 2 },
        { x: x + w, y: y + l / 2 },
        { x, y: y + l / 2 }
      ];
      break;
  }
  return coordinates;
};
class TailorControl extends Control {
  constructor(point, index, id, status) {
    super(point, index, id, status);
    delete this.hotRadius;
    this.update();
  }
}
TailorControl.prototype.copy = function() {
  return new TailorControl(
    commonUtil.copy(this.point),
    this.index,
    this[cfg.control.DEFAULT_KEY],
    this.status
  );
};
TailorControl.prototype.setPoint = function(point) {
  this.point = commonUtil.copy(point);
  this.update();
};
TailorControl.prototype.move = function(distX, distY) {
  this.point.x += distX;
  this.point.y += distY;
  if (this.coordinates) {
    for (let i = 0; i < this.coordinates.length; i++) {
      this.coordinates[i].x += distX;
      this.coordinates[i].y += distY;
    }
  }
  if (this.hotCoordinates) {
    for (let i = 0; i < this.hotCoordinates.length; i++) {
      this.hotCoordinates[i].x += distX;
      this.hotCoordinates[i].y += distY;
    }
  }
};
TailorControl.prototype.enlarge = function({ newRatio, oldRatio, newPoint, oldPoint }) {
  this.point = geometryUtil.enlargeByPoint(this.point, newRatio, oldRatio, newPoint, oldPoint);
  this.updateCoordinates();
  this.updateHotCoordinates();
};
TailorControl.prototype.update = function() {
  this.updateCoordinates();
  this.updateHotCoordinates();
};
TailorControl.prototype.updateCoordinates = function() {
  const { x, y } = this.point;
  const l = cfg.control.TAILOR_LONG;
  const w = cfg.control.TAILOR_WIDTH;
  this.coordinates = _getCoordinates(this.index, x, y, l, w);
};
TailorControl.prototype.updateHotCoordinates = function() {
  const { x, y } = this.point;
  const l = cfg.control.HOT_TAILOR_LONG;
  const w = cfg.control.HOT_TAILOR_WIDTH;
  this.hotCoordinates = _getCoordinates(this.index, x, y, l, w);
};
export default TailorControl;
