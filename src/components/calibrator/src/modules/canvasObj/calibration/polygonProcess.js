/*
 * @Description: rectProcess:
 * @Author: liushijie
 * @Date:2021-10-30 22:49
 * @Last Modified by: liushijie
 * @Last Modified Date:2021-10-30 22:49
 */
import CalibrationProcess from './calibrationProcess';
import geometryUtil from '../../../utils/geometry';
class PolygonProcess extends CalibrationProcess {
  constructor(params) {
    super(params);
  }
}
PolygonProcess.prototype.updateProcessData = function(point, limit) {
  const count = this.scope.controls.length;
  let X = point.x;
  let Y = point.y;
  X > limit.maxX && (X = limit.maxX);
  Y > limit.maxY && (Y = limit.maxY);
  X < limit.minX && (X = limit.minX);
  Y < limit.minY && (Y = limit.minY);
  if (this.scope.coordinates[count]) {
    this.scope.coordinates[count] = { x: X, y: Y };
  } else {
    this.scope.coordinates.push({ x: X, y: Y });
  }
};
PolygonProcess.prototype.enlarge = function({ newRatio, oldRatio, newPoint, oldPoint }) {
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
PolygonProcess.prototype.move = function(distX, distY) {
  this.moveControlsAndCoordinates(distX, distY);
};
export default PolygonProcess;
