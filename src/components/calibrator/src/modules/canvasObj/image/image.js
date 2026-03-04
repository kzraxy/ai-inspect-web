/*
 * @Description: image:
 * @Author: liushijie
 * @Date:2021-09-13 11:25
 * @Last Modified by: liushijie
 * @Last Modified Date:2021-09-13 11:25
 */
import TailorControl from '../control/tailorControl';
import geometryUtil from '../../../utils/geometry';
import commonUtil from '../../../utils/common';
import cfg from '../../../config';

async function getRotateImageSrc(src, angle) {
  const rotateImage = new Image();
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.style.position = 'absolute';
  canvas.style.zIndex = '999';
  canvas.style.left = '0';
  canvas.style.top = '0';
  // document.body.appendChild(canvas);
  rotateImage.src = src;
  const rotateSrc = await new Promise(resolve => {
    rotateImage.onload = () => {
      if (angle === 180) {
        canvas.width = rotateImage.width;
        canvas.height = rotateImage.height;
        canvas.style.width = `${rotateImage.width}px`;
        canvas.style.height = `${rotateImage.height}px`;
        ctx.translate(rotateImage.width, rotateImage.height);
      } else if (angle === 90 || angle === 270) {
        canvas.width = rotateImage.height;
        canvas.height = rotateImage.width;
        canvas.style.width = `${rotateImage.height}px`;
        canvas.style.height = `${rotateImage.width}px`;
        if (angle === 270) {
          ctx.translate(0, rotateImage.width);
        } else if (angle === 90) {
          ctx.translate(rotateImage.height, 0);
        }
      }
      ctx.rotate((Math.PI * angle) / 180);
      ctx.drawImage(rotateImage, 0, 0);
      return resolve(canvas.toDataURL());
    };
  });
  return rotateSrc;
}
// 更新默认样式
const _formatStyle = function (tailorScope, defaultStyle) {
  // 根据calibrator的defaultStyle初始化image的defaultStyle
  return commonUtil.formatObj(commonUtil.copy(tailorScope?.style || {}), defaultStyle);
};
// 初始化图片对象
const _formatImageObj = async function (context, src, angle) {
  // 读取图片对象
  if (!context.imageObj) {
    context.imageObj = new Image();
  }
  if (src) {
    if (angle === 90 || angle === 180 || angle === 270) {
      context.imageObj.src = await getRotateImageSrc(src, angle);
    } else {
      context.imageObj.src = src;
    }
    await new Promise(resolve => {
      context.imageObj.onload = function () {
        resolve();
      };
    });
  }
  return context.imageObj;
};
// 外部图片数据转化为内部格式
const _formatImageScope = function ({ imageData, imageObj, domWidth, domHeight }) {
  const { left, top, width, height, ratio } = geometryUtil.getLayoutDirection(
    imageData,
    imageObj,
    domWidth,
    domHeight
  );
  const minRatio = ratio * cfg.operator.MIN_RATIO;
  const maxRatio = ratio * cfg.operator.MAX_RATIO;
  const basePoint = { x: left, y: top };
  return {
    ratio,
    minRatio,
    maxRatio,
    width,
    height,
    basePoint,
    type: cfg.imageObj.TYPE
  };
};

class ImageObj {
  constructor(imageData, defaultStyle, width, height) {
    this._loaded = false;
    this._defaultStyle = {};
    imageData && (this.loading = this.initImage({ imageData, defaultStyle, width, height }));
  }
}
// 外部裁剪数据格式转化为内部格式
ImageObj.prototype._formatTailorScope = function (data, oldScope) {
  const { style: propStyle, status: propStatus, coordinates: propCoordinates } = data || {};
  const { basePoint, width, height } = oldScope;
  const tailorScope = {};
  tailorScope.status = propStatus || cfg.status.NORMAL;
  tailorScope.style = commonUtil.formatObj(commonUtil.copy(propStyle || {}), this._defaultStyle);
  const coordinates = geometryUtil.getAbsolute(propCoordinates, basePoint, width, height);
  // 根据左上右下格式化矩形，并转为左上角顺时针
  tailorScope.coordinates = geometryUtil.formatRectCoordinates(coordinates);

  if (data) {
    tailorScope.controls = geometryUtil
      // 扩充中点
      .getMidExpandCoordinates(tailorScope.coordinates)
      .map((point, index) => new TailorControl(point, index));
  }

  return tailorScope;
};
// 初始化图片
ImageObj.prototype.initImage = async function (data) {
  this._loaded = false;
  const { imageData, defaultStyle, width: domWidth, height: domHeight } = data;
  if (imageData?.tailorScope?.coordinates) {
    imageData.tailorScope.coordinates = geometryUtil.getCoordinatesLimitInRect(
      imageData.tailorScope.coordinates
    );
  }

  const { tailorScope, src, angle = 0 } = imageData;
  this.id = geometryUtil.guid();
  this._data = imageData;
  this._defaultStyle = _formatStyle(tailorScope, defaultStyle);
  this.imageObj = await _formatImageObj(this, src, angle);
  this.scope = _formatImageScope({ imageData, imageObj: this.imageObj, domWidth, domHeight }); // 格式化图片绘制数据
  this.tailorScope = this._formatTailorScope(tailorScope, this.scope); // 格式化裁剪框绘制数据

  this._loaded = true;
};
// 获取图形数据
ImageObj.prototype.getScope = function () {
  const {
    scope,
    tailorScope: { controls, coordinates, style }
  } = this;
  const newObj = {};
  newObj.scope = commonUtil.copy(scope);
  newObj.tailorScope = {};
  newObj.tailorScope.coordinates = commonUtil.copy(coordinates);
  newObj.tailorScope.style = commonUtil.copy(style);
  controls && (newObj.tailorScope.controls = controls.map(col => col.copy()));

  return newObj;
};
// 设置图形数据
ImageObj.prototype.setScope = function ({ scope, tailorScope }) {
  const { controls, coordinates, style } = tailorScope;
  this.scope = commonUtil.copy(scope);
  if (controls) {
    for (let i = 0; i < this.tailorScope.controls.length; i++) {
      this.tailorScope.controls[i].setPoint(controls[i].point);
    }
  } else {
    delete this.tailorScope.controls;
  }
  this.tailorScope.coordinates = commonUtil.copy(coordinates);
  this.tailorScope.style = commonUtil.copy(style);
};
// 外部图片数据转化为内部格式
ImageObj.prototype.unFormatImageScope = function () {
  const {
    _data,
    scope: { basePoint: propPoint, ratio, maxRatio, minRatio },
    imageObj
  } = this;
  const basePoint = geometryUtil.getRelative([propPoint], {}, ratio);
  const { tailorScope } = this.unFormatTailorScope();
  return {
    _data,
    scope: {
      ratio,
      basePoint,
      maxRatio,
      minRatio
    },
    imageObj,
    tailorScope
  };
};
// 外部裁剪数据格式转化为内部格式
ImageObj.prototype.unFormatTailorScope = function () {
  const {
    imageObj: { width: imageWidth, height: imageHeight },
    tailorScope: { status, controls, coordinates: propCoordinates },
    scope: { basePoint, ratio }
  } = this;
  const imageScope = { tailorScope: { status } };
  if (controls) {
    // 转为相对坐标
    const coordinates = geometryUtil.getRelative(
      propCoordinates,
      basePoint,
      ratio,
      imageWidth,
      imageHeight
    );
    // 根据左上右下格式化矩形，并转为左上角顺时针
    imageScope.tailorScope.coordinates = geometryUtil.formatRectCoordinates(coordinates);
  }
  return imageScope;
};
// 根据坐标和图片原点更新裁剪框
ImageObj.prototype.updateTailorScope = function (params) {
  const {
    image: { style, status, coordinates },
    defaultStyle
  } = params;
  _formatStyle({ style }, defaultStyle);
  this.tailorScope = this._formatTailorScope({ style, status, coordinates }, this.scope);
};

ImageObj.prototype.clearTailorScope = function () {
  this.tailorScope = this._formatTailorScope(undefined, this.scope);
};

// 图片缩放
ImageObj.prototype.enlarge = async function ({ newRatio, newPoint }) {
  const { ratio: oldRatio, height, width, basePoint } = this.scope;
  const { controls, coordinates } = this.tailorScope;
  this.scope.height = (height / oldRatio) * newRatio;
  this.scope.width = (width / oldRatio) * newRatio;
  this.scope.basePoint = geometryUtil.enlargeByPoint(basePoint, newRatio, oldRatio, newPoint);
  for (let i = 0; i < coordinates.length; i++) {
    coordinates[i] = geometryUtil.enlargeByPoint(coordinates[i], newRatio, oldRatio, newPoint);
    if (controls) {
      controls[2 * i].enlarge({ newRatio, oldRatio, newPoint });
      controls[2 * i + 1].enlarge({ newRatio, oldRatio, newPoint });
    }
  }
  this.scope.ratio = newRatio;
};
// 图片复位
ImageObj.prototype.reset = function (data) {
  // 格式化图片绘制数据
  const { width: domWidth, height: domHeight } = data;
  const oldPoint = commonUtil.copy(this.scope.basePoint);
  const oldRatio = this.scope.ratio;
  const layoutData = { ...this._data };
  delete layoutData.basePoint;
  delete layoutData.ratio;
  this.scope = _formatImageScope({
    imageObj: this.imageObj,
    imageData: {
      ...layoutData,
      tailorScope: {
        coordinates: this.tailorScope.coordinates.map(co => ({
          x: (co.x - this.scope.basePoint.x) / this.scope.width,
          y: (co.y - this.scope.basePoint.y) / this.scope.height
        }))
      }
    },
    domWidth,
    domHeight
  });
  const newPoint = commonUtil.copy(this.scope.basePoint);
  const newRatio = this.scope.ratio;
  // 格式化裁剪框绘制数据
  for (let i = 0; i < this.tailorScope.coordinates.length; i++) {
    this.tailorScope.coordinates[i] = geometryUtil.enlargeByPoint(
      this.tailorScope.coordinates[i],
      newRatio,
      oldRatio,
      newPoint,
      oldPoint
    );
    if (this.tailorScope.controls) {
      this.tailorScope.controls[2 * i].enlarge({ newRatio, oldRatio, newPoint, oldPoint });
      this.tailorScope.controls[2 * i + 1].enlarge({ newRatio, oldRatio, newPoint, oldPoint });
    }
  }
};
// 图片移动
ImageObj.prototype.move = function (distX, distY) {
  let dx = distX;
  let dy = distY;
  const distLeft = this.tailorScope.coordinates[0].x - this.scope.basePoint.x;
  const distTop = this.tailorScope.coordinates[0].y - this.scope.basePoint.y;
  const distRight = this.scope.basePoint.x + this.scope.width - this.tailorScope.coordinates[2].x;
  const distBottom = this.scope.basePoint.y + this.scope.height - this.tailorScope.coordinates[2].y;
  if (distLeft < dx) {
    dx = distLeft;
  }
  if (distTop < dy) {
    dy = distTop;
  }
  if (dx < -distRight) {
    dx = -distRight;
  }
  if (dy < -distBottom) {
    dy = -distBottom;
  }
  this.scope.basePoint.x += dx;
  this.scope.basePoint.y += dy;
  // // 更新控制点位置
  return {
    distX: dx,
    distY: dy
  };
};
// 图片及裁剪框移动
ImageObj.prototype.moveAll = function (distX, distY) {
  this.scope.basePoint.x += distX;
  this.scope.basePoint.y += distY;
  if (this.tailorScope.controls) {
    for (let i = 0; i < this.tailorScope.controls.length; i++) {
      this.tailorScope.controls[i].move(distX, distY);
    }
  }
  for (let i = 0; i < this.tailorScope.coordinates.length; i++) {
    this.tailorScope.coordinates[i].x += distX;
    this.tailorScope.coordinates[i].y += distY;
  }
};
// 调整图片裁剪点
ImageObj.prototype.adjustControl = function (index, dx, dy, limit = {}) {
  if (!this.tailorScope.controls) {
    return;
  }
  const {
    maxX = Number.MIN_SAFE_INTEGER,
    maxY = Number.MIN_SAFE_INTEGER,
    minX = Number.MAX_SAFE_INTEGER,
    minY = Number.MAX_SAFE_INTEGER
  } = limit;
  const { controls } = this.tailorScope;
  let distX = dx;
  let distY = dy;
  let left = 0;
  let right = 0;
  let top = 0;
  let bottom = 0;
  if (index === 0 || index === 6 || index === 7) {
    left = this.scope.basePoint.x;
    right = Math.min(controls[4].point.x, minX);
  }
  if (index === 2 || index === 3 || index === 4) {
    left = Math.max(controls[0].point.x, maxX);
    right = this.scope.basePoint.x + this.scope.width;
  }
  if (index === 0 || index === 1 || index === 2) {
    top = this.scope.basePoint.y;
    bottom = Math.min(controls[4].point.y, minY);
  }
  if (index === 4 || index === 5 || index === 6) {
    top = Math.max(controls[0].point.y, maxY);
    bottom = this.scope.basePoint.y + this.scope.height;
  }
  distX = geometryUtil.changeInLimit(distX, controls[index].point.x, left, right);
  distY = geometryUtil.changeInLimit(distY, controls[index].point.y, top, bottom);
  // 根据index、angle调整矩形的坐标点集，并按左上顺时针排序
  const points = geometryUtil.getLeftTopClockWise(
    geometryUtil.getRectAdjustPoints(
      controls.map(con => con.point),
      index,
      distX,
      distY
    )
  );
  for (let i = 0, len = points.length; i < len; i++) {
    controls[i].setPoint(points[i]);
    controls[i].updateHotCoordinates();
    controls[i].updateCoordinates();
  }
  // 调整坐标
  this.tailorScope.coordinates = commonUtil.copy([
    controls[0].point,
    controls[2].point,
    controls[4].point,
    controls[6].point
  ]);
};

export default ImageObj;
