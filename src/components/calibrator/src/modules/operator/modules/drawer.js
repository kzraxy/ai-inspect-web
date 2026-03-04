/*
 * @Description: drawer.js:
 * @Author: liushijie
 * @Date:2021-09-08 16:28
 * @Last Modified by: liushijie
 * @Last Modified Date:2021-09-08 16:28
 */
import cfg from '../../../config';
import commonUtil from '../../../utils/common';
import Calibration from '../../canvasObj/calibration';
import geometryUtil from '../../../utils/geometry';
class Drawer {
  constructor() {
    this._drawTypeList = Object.values(cfg.drawer.DRAW_TYPES); // 可用画笔类型
    this._drawType = ''; // 当前画笔类型
    this._penWidth = -1; // 绘制类型为直线时画笔的粗细
    this._borderWidth = -1; // 绘制框的粗细
    this._storage = null;
    this._observer = null;
    this.resetCache();
    this._limitCalibrations = false;
  }
}
// 设置存储引用
Drawer.prototype.setStorage = function(storage) {
  this._storage = storage;
};
// 设置观察者引用
Drawer.prototype.setObserver = function(observer) {
  this._observer = observer;
};
// 设置限制
Drawer.prototype.setLimit = function(limitCalibrations) {
  this._limitCalibrations = limitCalibrations;
};
// 更新绘制类型列表
Drawer.prototype.updateDrawTypeList = function({ drawTypeList }) {
  this._drawTypeList =
    typeof drawTypeList !== 'undefined' ? drawTypeList : Object.values(cfg.drawer.DRAW_TYPES); // 可用画笔类型
  if (!this._drawTypeList.includes(this._drawType)) {
    this.updateDrawType({
      drawType: this._drawTypeList[0] || ''
    });
  }
};
// 更新绘制类型
Drawer.prototype.updateDrawType = function({ drawType: propType }) {
  let drawType = propType;
  if (!this._drawTypeList.includes(drawType)) {
    drawType = this._drawTypeList[0] || '';
  }
  if (drawType !== this._drawType) {
    this._drawType = drawType;
    this._observer.send('drawer:drawTypeChanged', this._drawType);
  }
};
// 更新画笔宽度
Drawer.prototype.updatePenWidth = function({ penWidth: propWidth }) {
  const penWidth =
    (propWidth && propWidth > 0 ? propWidth : cfg.drawer.DEFAULT_PEN_WIDTH) *
    (this._storage?.image?.imageObj?.height || 1);
  if (penWidth !== this._penWidth) {
    this._penWidth = penWidth; // 当前画笔类型
    this._observer.send('drawer:penWidthChanged', this._penWidth);
  }
  return this._penWidth;
};
// 更新标注框的框线的宽度
Drawer.prototype.updateBorderWidth = function({ borderWidth: propBorderWidth }) {
  if (propBorderWidth !== this._borderWidth) {
    this._borderWidth = propBorderWidth; // 当前画笔类型
    this._observer.send('drawer:borderWidthChanged', this._borderWidth);
  }
  return this._borderWidth;
};
// 重置绘制的缓存
Drawer.prototype.resetCache = function() {
  this.isIllegal = false;
  this.cache = {
    step: 0,
    calibration: null, // 正在绘制的标注框对象
    scopeList: [] // 正在绘制的标注框对象阶段性缓存
  };
};
// 尝试绘制的回调
Drawer.prototype.tryDraw = async function(motionType, hover) {
  const params = {
    image: this._storage.image,
    drawType: this._drawType,
    ...this.cache,
    motionType,
    hover
  };
  const tryRes = await this._observer.send('draw:try', params);

  if (tryRes.code !== cfg.observer.CODE.SUCCESS) {
    // 不合法则改变样式
    this.isIllegal = true;
    this.cache.calibration.updateStatus(cfg.status.ILLEGAL);
  } else if (this.isIllegal) {
    this.isIllegal = false;
    this.cache.calibration.updateStatus(cfg.status.FOCUS);
  }
  return tryRes;
};
// 开始绘制
Drawer.prototype.startDraw = async function({ data }) {
  const point = {
    x: data.event.x,
    y: data.event.y
  };
  // 如果有标签框在图片内的限制
  if (this._limitCalibrations) {
    if (point.x > this._storage.image.tailorScope.coordinates[2].x) {
      point.x = this._storage.image.tailorScope.coordinates[2].x;
    }
    if (point.x < this._storage.image.tailorScope.coordinates[0].x) {
      point.x = this._storage.image.tailorScope.coordinates[0].x;
    }
    if (point.y > this._storage.image.tailorScope.coordinates[2].y) {
      point.y = this._storage.image.tailorScope.coordinates[2].y;
    }
    if (point.y < this._storage.image.tailorScope.coordinates[0].y) {
      point.y = this._storage.image.tailorScope.coordinates[0].y;
    }
  }

  const outerStyle =
    this._borderWidth === -1
      ? {}
      : {
          focus: { borderWidth: this._borderWidth },
          normal: { borderWidth: this._borderWidth },
          hover: { borderWidth: this._borderWidth }
        };
  // 生成一个绘制中的标注框
  const drawObj = Calibration.getProcessObj({
    index: (this._storage.calibrations.slice(-1)[0]?.index || 0) + 1,
    calibrationKey: this._storage._calibrationKey,
    indexKey: this._storage._indexKey,
    labelKey: this._storage._labelKey,
    image: this._storage.image,
    parentDom: this._storage._dom.panel,
    storage: this._storage,
    data: {
      status: cfg.status.FOCUS,
      scope: {
        type: this._drawType,
        width: this._penWidth * (this._storage?.image?.scope?.ratio || 1),
        coordinates: [{ x: point.x, y: point.y }]
      },
      // TODO
      style: { shape: outerStyle }
    }
  });
  // 缓存绘制的数据
  this.cache.calibration = drawObj; // 缓存绘制的标注对象索引
  this.cache.scope = this.cache.calibration.getScope(); // 缓存绘制的标注对象图形数据
  this.cache.scopeList.push(commonUtil.copy(this.cache.scope)); // 缓存当前步骤的图形数据
  // 触发绘制前回调
  // 先更新列表
  await this._storage.updateCalibrations({
    calibrations: [drawObj],
    isMerge: true
  });
  const drawRes = await this.tryDraw(cfg.operator.MOTION_TYPES.START);
  if (drawRes.code !== cfg.observer.CODE.SUCCESS) {
    // 不成功，则删除建立的对象及缓存
    this.cancelDraw();
  }
  return drawRes;
};
// 更新绘制
Drawer.prototype.updateDraw = async function(params) {
  const { data, motionType = cfg.operator.MOTION_TYPES.UPDATE, hover = {} } = params;
  let res = null;
  const point = {
    x: data.event.x,
    y: data.event.y
  };
  const limit = {};
  // 如果有标签框在图片内的限制
  if (this._limitCalibrations) {
    limit.minX = this._storage.image.tailorScope.coordinates[0].x;
    limit.minY = this._storage.image.tailorScope.coordinates[0].y;
    limit.maxX = this._storage.image.tailorScope.coordinates[2].x;
    limit.maxY = this._storage.image.tailorScope.coordinates[2].y;
  }
  // 每次更新前，都还原原始图形，方可保证每次的移动计算不是累加的
  this.cache.calibration.setScope(this.cache.scope);

  // 如果是更新动态视图的操作
  switch (this.cache.calibration.scope.type) {
    case cfg.calibration.TYPES.RECT:
    case cfg.calibration.TYPES.POLYGON:
    case cfg.calibration.TYPES.LINE:
    case cfg.calibration.TYPES.CHAIN:
    case cfg.calibration.TYPES.ABCHAIN:
    case cfg.calibration.TYPES.BACHAIN:
    case cfg.calibration.TYPES.ELLIPSE: {
      // 更新动态视图
      this.cache.calibration.updateProcessData(point, limit);
      if (motionType === cfg.operator.MOTION_TYPES.CONFIRM) {
        // 如果是确认点位的操作，则把坐标转化为控制点

        this.cache.calibration.updateControls();
        this.cache.scopeList = this.cache.scopeList.slice(0, this.cache.step + 1);
        this.cache.scopeList.push(this.cache.calibration.getScope());
        this.cache.step = this.cache.scopeList.length - 1;
        this.cache.scope = this.cache.calibration.getScope();
      }
      break;
    }
  }
  res = await this.tryDraw(motionType, hover);

  if (res.code === cfg.observer.CODE.FINISH) {
    return await this.finishDraw(true, motionType);
  }
  if (res.code !== cfg.observer.CODE.SUCCESS && motionType === cfg.operator.MOTION_TYPES.CONFIRM) {
    // 不允许绘制
    this.cache.step--;
    const scope = this.cache.scopeList[this.cache.step];
    this.cache.scopeList.pop();
    this.cache.calibration.setScope(scope);
    this.cache.scope = this.cache.calibration.getScope();
  }
  await this._observer.send('calibrations:viewChanged');
  return res;
};
// 完成绘制
Drawer.prototype.finishDraw = async function(byCode, motionType) {
  const { index, ...params } = this.cache.calibration.getData();
  const drawingObj = this.cache.calibration;
  const validateRes = await this._observer.send('draw: beforeFinish', {
    drawType: this._drawType,
    calibration: this.cache.calibration
  });

  if (validateRes.code !== cfg.observer.CODE.SUCCESS) {
    // 不允许绘制 FIX BY MAOYINING 2023/2/22 解决绘制四边形外接矩形结束前小于8*8px但依旧落点的情况
    if (motionType === cfg.operator.MOTION_TYPES.CONFIRM) {
      this.cache.step--;
      const scope = this.cache.scopeList[this.cache.step];
      this.cache.scopeList.pop();
      this.cache.calibration.setScope(scope);
      this.cache.scope = this.cache.calibration.getScope();
    }

    return validateRes;
  }

  // 生成一个完成了的标注框
  this.cache.calibration = Calibration.getObj({
    calibrationKey: this._storage._calibrationKey,
    parentDom: this._storage._dom.root,
    indexKey: this._storage._indexKey,
    labelKey: this._storage._labelKey,
    storage: this._storage,
    data: { ...params },
    index
  });

  const tryRes = await this.tryDraw(cfg.operator.MOTION_TYPES.FINISH);
  if (tryRes.code !== cfg.observer.CODE.SUCCESS) {
    // 不成功，则无法结束
    this.cache.calibration = drawingObj;
    if (byCode) {
      // const scope =
      this.cache.scopeList.pop();
      this.cache.calibration.setScope(this.cache.scopeList[this.cache.scopeList.length - 1]);
      this.cache.scope = this.cache.calibration.getScope();
    }
    // 不成功，则无法结束
    return tryRes;
  }
  // 成功则替换标注列表中的绘制中的标注框

  await this._storage.updateCalibrationById(this.cache.calibration);

  await this._observer.send('calibrations:changed');
  await this._observer.send('draw:finish', this.cache.calibration);
  this.resetCache();
  return tryRes;
};
// 取消绘制
Drawer.prototype.cancelDraw = async function() {
  const { id } = this.cache.calibration;
  await this._storage.deleteCalibrations({ calibrationKeys: [id] });
  this.resetCache();
};
// 撤销绘制
Drawer.prototype.undoDraw = async function() {
  if (this.cache.step === 0) {
    return;
  }
  this.cache.step--;
  const scope = this.cache.scopeList[this.cache.step];
  this.cache.calibration.setScope(scope);
  this.cache.scope = this.cache.calibration.getScope();
  await this._observer.send('calibrations:viewChanged');
};
// 恢复绘制
Drawer.prototype.redoDraw = async function() {
  if (this.cache.step === this.cache.scopeList.length - 1) {
    return;
  }
  this.cache.step++;
  const scope = this.cache.scopeList[this.cache.step];
  this.cache.calibration.setScope(scope);
  this.cache.scope = this.cache.calibration.getScope();
  await this._observer.send('calibrations:viewChanged');
};
// 获取状态
Drawer.prototype.getStatuses = function() {
  return {
    drawType: this._drawType,
    penWidth: this._penWidth
  };
};
// 获取状态
Drawer.prototype.enlargeCache = function(params) {
  const { oldPoint, newPoint, oldRatio } = params;
  const newRatio = this._storage.image.scope.ratio;
  const list = [...this.cache.scopeList, this.cache.scope];
  for (let i = 0, len = list.length; i < len; i++) {
    for (let k = 0, l = list[i]?.coordinates?.length || 0; k < l; k++) {
      list[i].coordinates[k] = geometryUtil.enlargeByPoint(
        list[i].coordinates[k],
        newRatio,
        oldRatio,
        newPoint,
        oldPoint
      );
    }
    for (let k = 0, l = list[i]?.controls?.length || 0; k < l; k++) {
      list[i].controls[k] = geometryUtil.enlargeByPoint(
        list[i].controls[k],
        newRatio,
        oldRatio,
        newPoint,
        oldPoint
      );
    }
    for (let k = 0, l = list[i]?.maskCoordinates?.length || 0; k < l; k++) {
      list[i].maskCoordinates[k] = geometryUtil.enlargeByPoint(
        list[i].maskCoordinates[k],
        newRatio,
        oldRatio,
        newPoint,
        oldPoint
      );
    }
    if (list?.[i]?.width) {
      list[i].width = (list[i].width / oldRatio) * newRatio;
    }
  }
};
// 获取光标
Drawer.prototype.getDrawCursor = function() {
  return cfg.board.CURSOR.DRAW?.[this._drawType] || cfg.board.CURSOR.DRAW.DEFAULT;
};

// 在绘制过程中移动图片后更新drawer对象标注框cache的状态
Drawer.prototype.updateCacheAfterMoveAll = function() {
  const { controls, coordinates } = this.cache.calibration.getScope();
  this.cache.scope.controls = controls;
  this.cache.scope.coordinates = coordinates;
};
export default Drawer;
