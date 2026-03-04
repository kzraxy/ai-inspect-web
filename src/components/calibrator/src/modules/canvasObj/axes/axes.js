/*
 * @Description: axes:
 * @Author: liushijie
 * @Date:2021-11-12 13:09
 * @Last Modified by: liushijie
 * @Last Modified Date:2021-11-12 13:09
 */
import cfg from '../../../config';

class Axes {
  constructor() {
    this.scope = {
      point: { x: 0, y: 0 }
    };
    this.style = cfg.style.AXES;
  }
}
Axes.prototype.updatePoint = function (point) {
  const { x = 0, y = 0 } = point || {};
  this.scope.point = { x, y };
};
export default Axes;
