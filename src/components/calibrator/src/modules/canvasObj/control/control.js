/*
 * @Description: control:
 * @Author: liushijie
 * @Date:2021-09-13 11:25
 * @Last Modified by: liushijie
 * @Last Modified Date:2021-09-13 11:25
 */
import cfg from '../../../config';
import geometryUtil from '../../../utils/geometry';
import commonUtil from '../../../utils/common';
class Control {
  constructor(point, index, id, status) {
    this[cfg.control.DEFAULT_KEY] = id || geometryUtil.guid();
    this.point = point;
    this.index = index;
    this.hotRadius = cfg.control.HOT_RADIUS;
    this.status = status || cfg.status.NORMAL;
  }
}
Control.prototype.copy = function() {
  const point = {
    x: this.point.x,
    y: this.point.y
  };
  const { index } = this;
  const id = this[cfg.control.DEFAULT_KEY];
  const { status } = this;
  return new Control(point, index, id, status);
};
Control.prototype.getPoint = function() {
  return {
    x: this.point.x,
    y: this.point.y
  };
};
Control.prototype.setPoint = function(point) {
  this.point = commonUtil.copy(point);
};

Control.prototype.enlarge = function({ newRatio, oldRatio, newPoint, oldPoint }) {
  this.point = geometryUtil.enlargeByPoint(this.point, newRatio, oldRatio, newPoint, oldPoint);
};

export default Control;
