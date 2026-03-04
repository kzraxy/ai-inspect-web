/* eslint-disable prefer-destructuring */
/*
 * @Description: editor:
 * @Author: liushijie
 * @Date:2021-10-25 14:49
 * @Last Modified by: liushijie
 * @Last Modified Date:2021-10-25 14:49
 */
import cfg from '../../../config';
import geometryUtil from '../../../utils/geometry';
import TailorControl from '../../canvasObj/control/tailorControl';

class Editor {
  constructor() {
    this._editTypeList = []; // 允许的编辑类型
    this._editType = ''; // 编辑类型
    this.maxRatio = 1; // 编辑类型
    this.minRatio = 1; // 编辑类型
    this._storage = null; // 引用全局存储
    this._observer = null; // 引用全局消息中心
    this._limitCalibrations = false; // 是否限制标注框
    // this.copyCalibrations = [];
    this.resetCache(); // 编辑状态缓存
  }
}
// 设置存储引用
Editor.prototype.setStorage = function (storage) {
  this._storage = storage;
};
// 设置观察者引用
Editor.prototype.setObserver = function (observer) {
  this._observer = observer;
};
// 设置限制
Editor.prototype.setLimit = function (limitCalibrations) {
  this._limitCalibrations = limitCalibrations;
};
// 更新编辑类型列表
Editor.prototype.updateEditTypeList = function ({ editTypeList = [] }) {
  let imageViewChange = false;
  if (
    ((this._editTypeList.includes(cfg.operator.EDIT_TYPES.DRAW_TAILOR) ||
      this._editTypeList.includes(cfg.operator.EDIT_TYPES.ADJUST_IMAGE)) &&
      !editTypeList.includes(cfg.operator.EDIT_TYPES.DRAW_TAILOR) &&
      !editTypeList.includes(cfg.operator.EDIT_TYPES.ADJUST_IMAGE)) ||
    (!this._editTypeList.includes(cfg.operator.EDIT_TYPES.DRAW_TAILOR) &&
      !this._editTypeList.includes(cfg.operator.EDIT_TYPES.ADJUST_IMAGE) &&
      editTypeList.includes(cfg.operator.EDIT_TYPES.DRAW_TAILOR)) ||
    editTypeList.includes(cfg.operator.EDIT_TYPES.ADJUST_IMAGE)
  ) {
    imageViewChange = true;
  }
  this._editTypeList =
    typeof editTypeList !== 'undefined' ? editTypeList : Object.values(cfg.operator.EDIT_TYPES); // 可用画笔类型
  imageViewChange && this._observer.send('image:viewChanged');
};
// 更新编辑类型列表
Editor.prototype.updateEditType = function (params) {
  const { image, imageControl, calibration, control, rotation, data } = params;
  // 判断编辑的类型  this._storage.image?.tailorScope?.controls表示图片已经裁剪过
  if (
    this._editTypeList.includes(cfg.operator.EDIT_TYPES.DRAW_TAILOR) &&
    (!this._storage.image?.tailorScope?.controls || this.isDrawTailor) &&
    ((image && !calibration) || !image)
  ) {
    // 绘制裁剪框：在裁剪状态，在图片内，且没有碰到标注框，且图片上没有裁剪框
    this._editType = cfg.operator.EDIT_TYPES.DRAW_TAILOR;
  } else if (
    this._editTypeList.includes(cfg.operator.EDIT_TYPES.ADJUST_IMAGE) &&
    image &&
    imageControl
  ) {
    // 调整图片：在裁剪状态，且碰到了图片控制点
    this._editType = cfg.operator.EDIT_TYPES.ADJUST_IMAGE;
  } else if (
    this._editTypeList.includes(cfg.operator.EDIT_TYPES.MOVE_IMAGE_AND_CALIBRATIONS) &&
    image &&
    (!calibration ||
      (!this._editTypeList.includes(cfg.operator.EDIT_TYPES.ADJUST_CALIBRATION) &&
        !this._editTypeList.includes(cfg.operator.EDIT_TYPES.ROTATE_CALIBRATION) &&
        !this._editTypeList.includes(cfg.operator.EDIT_TYPES.MOVE_CALIBRATIONS)))
  ) {
    // 移动图片和标注框：裁剪启用，触碰到图片，且没有触碰到标注框
    this._editType = cfg.operator.EDIT_TYPES.MOVE_IMAGE_AND_CALIBRATIONS;
  } else if (
    this._editTypeList.includes(cfg.operator.EDIT_TYPES.ADJUST_CALIBRATION) &&
    calibration &&
    control
  ) {
    // 调整标注框：碰到了标注框控制点
    this._editType = cfg.operator.EDIT_TYPES.ADJUST_CALIBRATION;
  } else if (
    this._editTypeList.includes(cfg.operator.EDIT_TYPES.ROTATE_CALIBRATION) &&
    calibration &&
    rotation
  ) {
    // 旋转标注框：碰到了标注框的旋转点
    this._editType = cfg.operator.EDIT_TYPES.ROTATE_CALIBRATION;
  } else if (
    this._editTypeList.includes(cfg.operator.EDIT_TYPES.MOVE_CALIBRATIONS) &&
    calibration &&
    !data?.downKeys[cfg.board.HOT_KEYS.SPACE]
  ) {
    // 移动选中标注框：碰到了标注框的控制点
    this._editType = cfg.operator.EDIT_TYPES.MOVE_CALIBRATIONS;
  } else if (this._editTypeList.includes(cfg.operator.EDIT_TYPES.MOVE_ALL)) {
    // 移动所有：不在裁剪状态，或者碰到了图，但没有碰到图的控制点和标注框，且图上有裁剪框
    this._editType = cfg.operator.EDIT_TYPES.MOVE_ALL;
  } else if (this._editTypeList.includes(cfg.operator.EDIT_TYPES.ADD_ANCHOR) && calibration) {
    // 新增锚点
    this._editType = cfg.operator.EDIT_TYPES.ADD_ANCHOR;
  } else if (this._editTypeList.includes(cfg.operator.EDIT_TYPES.DELETE_ANCHOR) && calibration) {
    // 删除锚点
    this._editType = cfg.operator.EDIT_TYPES.DELETE_ANCHOR;
  }
};
// 重置编辑缓存
Editor.prototype.resetCache = function () {
  this._editType = '';
  this.isDrawTailor = false;
  this.isUseAnchor = false;
  this.cache = {
    point: {}, // 开始编辑鼠标点位
    scopeMap: {}, // 备份的正在操作的标注框列表的图形数据
    processScopeMap: {}, // 备份的正在操作的标注框列表的图形数据
    image: null, // 正在操作的底图引用
    calibrations: [], // 正在操作的标注框列表引用
    control: null, // 正在操作的控制点引用
    rotation: null // 正在操作的旋转点引用
  };
};
// 缓存元素的scope信息
Editor.prototype.cacheElement = function (elements) {
  for (let i = 0, len = elements.length; i < len; i++) {
    this.cache.scopeMap[elements[i].id] = elements[i].getScope();
  }
  return this.cache.scopeMap;
};
// 编辑回调
Editor.prototype.tryEdit = async function (motionType, hover) {
  const params = {
    calibrations: this._storage.calibrations,
    rotation: this.cache.rotation,
    control: this.cache.control,
    image: this._storage.image,
    editType: this._editType,
    motionType,
    hover
  };

  switch (this._editType) {
    case cfg.operator.EDIT_TYPES.MOVE_IMAGE_AND_CALIBRATIONS:
    case cfg.operator.EDIT_TYPES.ADJUST_CALIBRATION:
    case cfg.operator.EDIT_TYPES.ROTATE_CALIBRATION:
    case cfg.operator.EDIT_TYPES.MOVE_CALIBRATIONS:
    case cfg.operator.EDIT_TYPES.MOVE_ALL:
    case cfg.operator.EDIT_TYPES.ADD_ANCHOR:
    case cfg.operator.EDIT_TYPES.DELETE_ANCHOR: {
      params.calibrations = this.cache.calibrations;
      break;
    }
  }

  const tryRes = await this._observer.send('edit:try', params);

  await this.updateIllegal(tryRes);
  return tryRes;
};
// 更新禁用视图
Editor.prototype.updateIllegal = async function (tryRes) {
  const { calibrations } = this.cache;
  if (tryRes.code !== cfg.observer.CODE.SUCCESS && !this.cache.isIllegal) {
    switch (this._editType) {
      case cfg.operator.EDIT_TYPES.ADJUST_IMAGE:
      case cfg.operator.EDIT_TYPES.DRAW_TAILOR:
        this.cache.image.tailorScope.status = cfg.status.ILLEGAL;
        break;
      case cfg.operator.EDIT_TYPES.MOVE_IMAGE_AND_CALIBRATIONS:
      case cfg.operator.EDIT_TYPES.ADJUST_CALIBRATION:
      case cfg.operator.EDIT_TYPES.ROTATE_CALIBRATION:
      case cfg.operator.EDIT_TYPES.MOVE_CALIBRATIONS:
      case cfg.operator.EDIT_TYPES.MOVE_ALL:
      case cfg.operator.EDIT_TYPES.ADD_ANCHOR:
      case cfg.operator.EDIT_TYPES.DELETE_ANCHOR:
        for (let i = 0, len = calibrations.length; i < len; i++) {
          calibrations[i].updateStatus(cfg.status.ILLEGAL);
        }
    }
    this.cache.isIllegal = true;
    await this._observer.send('calibrations:statusChanged');
  } else if (tryRes.code === cfg.observer.CODE.SUCCESS && this.cache.isIllegal) {
    switch (this._editType) {
      case cfg.operator.EDIT_TYPES.ADJUST_IMAGE:
      case cfg.operator.EDIT_TYPES.DRAW_TAILOR:
        this.cache.image.tailorScope.status = cfg.status.NORMAL;
        break;
      case cfg.operator.EDIT_TYPES.MOVE_ALL:
      case cfg.operator.EDIT_TYPES.ADJUST_CALIBRATION:
      case cfg.operator.EDIT_TYPES.ROTATE_CALIBRATION:
      case cfg.operator.EDIT_TYPES.MOVE_CALIBRATIONS: {
        for (let i = 0, len = calibrations.length; i < len; i++) {
          calibrations[i].updateStatus(cfg.status.FOCUS);
        }
        break;
      }
      case cfg.operator.EDIT_TYPES.MOVE_IMAGE_AND_CALIBRATIONS: {
        for (let i = 0, len = calibrations.length; i < len; i++) {
          calibrations[i].updateStatus(cfg.status.NORMAL);
        }
      }
    }
    this.cache.isIllegal = false;
    await this._observer.send('calibrations:statusChanged');
  }
};
// 开始编辑
Editor.prototype.startEdit = async function (params) {
  const { image, imageControl, calibration, control, rotation, data } = params;
  this.updateEditType(params);

  // 根据不同的编辑类型缓存数据
  switch (this._editType) {
    case cfg.operator.EDIT_TYPES.ADJUST_CALIBRATION:
    case cfg.operator.EDIT_TYPES.ROTATE_CALIBRATION: {
      // 调整、旋转标注框
      this.cache.point = { x: data.event.x, y: data.event.y }; // 缓存初始鼠标点位
      this.cache.calibrations = [calibration];
      this.cache.control = control;
      this.cache.rotation = rotation;
    }
    // eslint-disable-next-line no-fallthrough
    case cfg.operator.EDIT_TYPES.MOVE_CALIBRATIONS: {
      // 移动选中标注框
      this.cache.point = { x: data.event.x, y: data.event.y }; // 缓存初始鼠标点位
      for (const id in this._storage.focusCalibrationMap) {
        this.cache.calibrations.push(this._storage.focusCalibrationMap[id]);
        this.cacheElement([this._storage.focusCalibrationMap[id]]);
      }
      break;
    }
    case cfg.operator.EDIT_TYPES.ADJUST_IMAGE: {
      // 调整图片
      this.cache.point = { x: data.event.x, y: data.event.y }; // 缓存初始鼠标点位
      this.cacheElement([this._storage.image]);
      this.cache.image = image;
      this.cache.control = imageControl;
      break;
    }
    case cfg.operator.EDIT_TYPES.MOVE_IMAGE_AND_CALIBRATIONS:
    case cfg.operator.EDIT_TYPES.MOVE_ALL:
      {
        // 移动全部、移动底图和所有标注框
        this.cache.point = { x: data.event.x, y: data.event.y }; // 缓存初始鼠标点位
        this.cache.image = this._storage.image;
        this.cache.calibrations = this._storage.calibrations;
        this.cacheElement([this.cache.image]);
        this.cacheElement(this.cache.calibrations);
      }
      break;
    case cfg.operator.EDIT_TYPES.DRAW_TAILOR: {
      if (!this.isDrawTailor) {
        const x = geometryUtil.getInLimit(
          data.event.x,
          this._storage.image.scope.basePoint.x,
          this._storage.image.scope.basePoint.x +
            this._storage.image.scope.ratio * this._storage.image.imageObj.width
        );
        const y = geometryUtil.getInLimit(
          data.event.y,
          this._storage.image.scope.basePoint.y,
          this._storage.image.scope.basePoint.y +
            this._storage.image.scope.ratio * this._storage.image.imageObj.height
        );
        this.cache.point = { x, y }; // 缓存初始鼠标点位
        this.cache.image = this._storage.image;
        this.cacheElement([this.cache.image]);
        this.isDrawTailor = true;
        this.drawTailor(0, 0, this.cache.image);
      }
      break;
    }
    case cfg.operator.EDIT_TYPES.ADD_ANCHOR: {
      if (calibration && !this.isUseAnchor) {
        this.cache.calibrations = [calibration];
        this.cache.image = image;
        this.isUseAnchor = true;
      }
      break;
    }
    case cfg.operator.EDIT_TYPES.DELETE_ANCHOR: {
      if (calibration && !this.isUseAnchor) {
        this.cache.calibrations = [calibration];
        this.isUseAnchor = true;
      }
      break;
    }
  }
  // 触发开始编辑前的回调
  const tryRes = await this.tryEdit(cfg.operator.MOTION_TYPES.START);
  if (this._editType === cfg.operator.EDIT_TYPES.DRAW_TAILOR) {
    await this._observer.send('image:changed');
    if (!this.isDrawTailor) {
      tryRes.code = 'finish';
    }
  }
  // 如果使用了锚点工具
  if (
    this._editType === cfg.operator.EDIT_TYPES.ADD_ANCHOR ||
    this._editType === cfg.operator.EDIT_TYPES.DELETE_ANCHOR
  ) {
    await this._observer.send('image:changed');
    if (!this.isUseAnchor) {
      tryRes.code = 'finish';
    }
  }
  return tryRes;
};
// 更新编辑
Editor.prototype.updateEdit = async function ({ data, hover }) {
  const { event } = data;
  let distX = event.x - this.cache.point.x;
  let distY = event.y - this.cache.point.y;
  const point = {
    x: event.x,
    y: event.y
  };

  // 如果超出图片范围则为0
  switch (this._editType) {
    case cfg.operator.EDIT_TYPES.ADJUST_CALIBRATION:
      // 调整标注框
      this.adjustCalibration(point, distX, distY, this.cache.calibrations[0]);
      break;
    case cfg.operator.EDIT_TYPES.ROTATE_CALIBRATION:
      // 旋转标注框
      this.rotateCalibration(event, this.cache.calibrations[0]);
      break;
    case cfg.operator.EDIT_TYPES.MOVE_CALIBRATIONS:
      // 移动选中标注框

      this.moveCalibrations(distX, distY, this.cache.calibrations);
      break;
    case cfg.operator.EDIT_TYPES.DRAW_TAILOR: {
      this.drawTailor(distX, distY, this.cache.image);
      break;
    }
    case cfg.operator.EDIT_TYPES.ADJUST_IMAGE: {
      // 调整底图
      this.adjustImage(distX, distY, this.cache.image);
      break;
    }
    case cfg.operator.EDIT_TYPES.MOVE_IMAGE_AND_CALIBRATIONS: {
      // 移动底图和所有标注框
      const moveData = this.moveImage(distX, distY, this.cache.image);
      distX = moveData.distX;
      distY = moveData.distY;

      this.moveCalibrations(distX, distY, this.cache.calibrations);
      break;
    }
    case cfg.operator.EDIT_TYPES.MOVE_ALL: {
      // 移动全部元素
      await this.moveImageAndTailorScope(distX, distY, this.cache.image);
      await this.moveCalibrations(distX, distY, this.cache.calibrations);
      break;
    }
    case cfg.operator.EDIT_TYPES.ADD_ANCHOR: {
      if (data.mouseDown) {
        const res = await this.addAnchor(data);
        await this.tryEdit(cfg.operator.MOTION_TYPES.UPDATE, hover);
        await this._observer.send('image:changed');
        await this._observer.send('calibrations:viewChanged');

        return res;
      }
      break;
    }
    case cfg.operator.EDIT_TYPES.DELETE_ANCHOR: {
      if (data.mouseDown) {
        const res = await this.deleteAnchor(hover);
        await this.tryEdit(cfg.operator.MOTION_TYPES.UPDATE, hover);
        await this._observer.send('image:changed');
        await this._observer.send('calibrations:viewChanged');
        return res;
        // hover.calibration = this._storage.calibrations[0];
      }
      break;
    }
  }

  const tryRes = await this.tryEdit(cfg.operator.MOTION_TYPES.UPDATE, hover);

  await this._observer.send('image:changed');
  await this._observer.send('calibrations:viewChanged');
  return tryRes;
};
// 结束编辑
Editor.prototype.finishEdit = async function () {
  let tryRes = { code: cfg.observer.CODE.SUCCESS };
  if (
    this._editType !== cfg.operator.EDIT_TYPES.RESET &&
    this._editType !== cfg.operator.EDIT_TYPES.ENLARGE &&
    this._editType !== cfg.operator.EDIT_TYPES.ROTATE_IMAGE &&
    this._editType !== cfg.operator.EDIT_TYPES.DELETE_ANCHOR
  ) {
    tryRes = await this.tryEdit(cfg.operator.MOTION_TYPES.FINISH);
    if (tryRes.code !== cfg.observer.CODE.SUCCESS) {
      for (let i = 0, len = this.cache.calibrations.length; i < len; i++) {
        this.cache.calibrations[i].setScope(this.cache.scopeMap[this.cache.calibrations[i].id]);
      }
      if (this.cache.image) {
        this.cache.image.setScope(this.cache.scopeMap[this.cache.image.id]);
      }
    }
    await this.updateIllegal({ code: 'success' });
  }
  if (this._editType !== cfg.operator.EDIT_TYPES.ROTATE_IMAGE) {
    await this._observer.send('calibrations:viewChanged');
  }
  await this._observer.send('image:changed');
  this._observer.send('edit:finish', {
    calibrations: this.cache.calibrations,
    rotation: this.cache.rotation,
    control: this.cache.control,
    image: this._storage.image,
    editType: this._editType,
    event
  });
  this.resetCache();
  return tryRes;
};
// 旋转标注框
Editor.prototype.rotateCalibration = function (event, calibration) {
  const distX = event.x - calibration.scope.center.x;
  const distY = event.y - calibration.scope.center.y;
  const dAngle = (Math.atan2(distY, distX) * 180) / Math.PI + 90;
  const scope = this.cache.scopeMap[calibration.id];
  calibration.setScope(scope);
  calibration.rotate(dAngle);
};
// 调整标注框
Editor.prototype.adjustCalibration = function (point, distX, distY, calibration) {
  const scope = this.cache.scopeMap[calibration.id];
  calibration.setScope(scope);
  const limit = {};
  if (this._limitCalibrations) {
    limit.minX = this._storage.image.tailorScope.coordinates[0].x;
    limit.minY = this._storage.image.tailorScope.coordinates[0].y;
    limit.maxX = this._storage.image.tailorScope.coordinates[2].x;
    limit.maxY = this._storage.image.tailorScope.coordinates[2].y;
  }
  calibration.adjustControl(this.cache.control.index, { point, distX, distY }, limit);
};
// 绘制裁剪区域
Editor.prototype.drawTailor = function (dx, dy, image) {
  const distX = geometryUtil.changeInLimit(
    dx,
    this.cache.point.x,
    image.scope.basePoint.x,
    image.scope.basePoint.x + image.scope.width
  );
  const distY = geometryUtil.changeInLimit(
    dy,
    this.cache.point.y,
    image.scope.basePoint.y,
    image.scope.basePoint.y + image.scope.height
  );
  let coordinates = [
    { x: this.cache.point.x, y: this.cache.point.y },
    { x: this.cache.point.x + distX, y: this.cache.point.y },
    { x: this.cache.point.x + distX, y: this.cache.point.y + distY },
    { x: this.cache.point.x, y: this.cache.point.y + distY }
  ];
  // 根据左上右下格式化矩形，并转为左上角顺时针
  coordinates = geometryUtil.formatRectCoordinates(coordinates);
  const scope = this.cache.scopeMap[this.cache.image.id];
  this.cache.image.setScope(scope);
  this.cache.image.tailorScope.coordinates = coordinates;
  this.cache.image.tailorScope.controls = geometryUtil
    // 扩充中点
    .getMidExpandCoordinates(coordinates)
    .map((point, index) => new TailorControl(point, index));
};
// 调整底图
Editor.prototype.adjustImage = function (dx, dy, image) {
  const distX = dx;
  const distY = dy;
  const imageScope = this.cache.scopeMap[image.id];

  // 将突破还原到初始位置
  image.setScope(imageScope);
  image.adjustControl(this.cache.control.index, distX, distY);
};
// 移动底图
Editor.prototype.moveImage = function (distX, distY, image) {
  const scope = this.cache.scopeMap[image.id];
  this._storage.image.setScope(scope);
  return this._storage.image.move(distX, distY);
};
// 移动标注框
Editor.prototype.moveCalibrations = function (distX, distY, calibrations) {
  // if (this._limitCalibrations) {
  //  对编辑的移动范围进行限制和自适应
  //   const { minX, minY, maxX, maxY } = this.getCalibrationsExternal(calibrations);
  //   const imageLeftTop = this._storage.image.tailorScope.controls[0].point;
  //   const imageRightBottom = this._storage.image.tailorScope.controls[4].point;
  //   if (distX > 0) {
  //     distX = geometryUtil.changeInLimit(distX, maxX, imageLeftTop.x, imageRightBottom.x);
  //   } else if (distX < 0) {
  //     distX = validateUtil.changeInLimit(distX, minX, imageLeftTop.x, imageRightBottom.x);
  //   }
  //   if (distY > 0) {
  //     distY = geometryUtil.changeInLimit(distY, maxY, imageLeftTop.y, imageRightBottom.y);
  //   } else if (distY < 0) {
  //     distY = validateUtil.changeInLimit(distY, minY, imageLeftTop.y, imageRightBottom.y);
  //   }
  // }
  for (let i = 0; i < calibrations.length; i++) {
    // !this._limitCalibrations &&
    calibrations[i].setScope(this.cache.scopeMap[calibrations[i].id]);
    calibrations[i].move && calibrations[i].move(distX, distY);
  }
};
// 移动底图与裁剪框
Editor.prototype.moveImageAndTailorScope = async function (distX, distY, image) {
  const scope = this.cache.scopeMap[image.id];
  this._storage.image.setScope(scope);
  this._storage.image.moveAll(distX, distY);
};
// 调整裁剪框
Editor.prototype.updateTailorScope = async function (data) {
  // 缓存数据
  this._editType = cfg.operator.EDIT_TYPES.ADJUST_IMAGE;
  this.cacheElement([this._storage.image]);
  this.cache.image = this._storage.image;
  this._storage.image.updateTailorScope(data);
  await this.finishEdit();
  await this._observer.send('image:changed');
};
Editor.prototype.clearTailorScope = async function () {
  this._editType = cfg.operator.EDIT_TYPES.ADJUST_IMAGE;
  this.cacheElement([this._storage.image]);
  this.cache.image = this._storage.image;
  this._storage.image.clearTailorScope();
  await this.finishEdit();
  await this._observer.send('image:changed');
};
// 复位所有画布元素，默认传递操作类型reset，且不支持回调校验
Editor.prototype.reset = async function (dom) {
  const editType = this._editType;
  this._editType = cfg.operator.EDIT_TYPES.RESET;
  // 缓存数据
  this.cacheElement([this._storage.image]);
  this.cacheElement(this._storage.calibrations);
  const {
    scope: { basePoint: oldPoint, ratio: oldRatio }
  } = this.cache.scopeMap[this._storage.image.id];
  // 复位底图
  this._storage.image.reset(dom);
  const {
    scope: { basePoint: newPoint, ratio: newRatio }
  } = this._storage.image;
  // 缩放标注框
  for (let i = 0; i < this._storage.calibrations.length; i++) {
    this._storage.calibrations[i].enlarge({ newRatio, oldRatio, newPoint, oldPoint });
  }
  await this.finishEdit();
  this._editType = editType;
};
// 旋转底图，默认传递操作类型rotateImage，且不支持回调校验
Editor.prototype.rotateImage = async function ({ imageObj }) {
  // 缓存当前的图片对象
  const editType = this._editType;
  this._editType = cfg.operator.EDIT_TYPES.ROTATE_IMAGE;
  this.cacheElement([this._storage.image], true);
  await this._storage.updateImage(imageObj);
  await this.finishEdit();
  this._editType = editType;
};
// 缩放，默认传递操作类型enlarge，且不支持回调校验
Editor.prototype.enlarge = async function (params) {
  // 设置操作类型
  const editType = this._editType;
  this._editType = cfg.operator.EDIT_TYPES.ENLARGE;
  const { newPoint, newRatio: propRatio, minRatio, maxRatio } = params;
  const newRatio = Math.min(Math.max(propRatio, minRatio), maxRatio);
  this.cacheElement([this._storage.image]);
  this.cacheElement(this._storage.calibrations);
  // 缩放底图
  const {
    scope: { ratio: oldRatio }
  } = this._storage.image;
  const enlargeList = [];
  enlargeList.push(this._storage.image.enlarge({ newRatio, newPoint }));
  // 缩放标注框
  for (let i = 0; i < this._storage.calibrations.length; i++) {
    enlargeList.push(this._storage.calibrations[i].enlarge({ newRatio, oldRatio, newPoint }));
  }
  await Promise.all(enlargeList);
  await this.finishEdit();
  this._editType = editType;
};
Editor.prototype.getCalibrationsExternal = function (calibrations) {
  let minX = Number.MAX_SAFE_INTEGER;
  let minY = Number.MAX_SAFE_INTEGER;
  let maxX = Number.MIN_SAFE_INTEGER;
  let maxY = Number.MIN_SAFE_INTEGER;
  for (let i = 0; i < calibrations.length; i++) {
    this.cache.scopeMap[calibrations[i].id] &&
      calibrations[i].setScope(this.cache.scopeMap[calibrations[i].id]);
    const coordinates = calibrations[i].getExternal();
    for (let k = 0, { length } = coordinates; k < length; k++) {
      coordinates[k].x < minX && (minX = coordinates[k].x);
      coordinates[k].x > maxX && (maxX = coordinates[k].x);
      coordinates[k].y < minY && (minY = coordinates[k].y);
      coordinates[k].y > maxY && (maxY = coordinates[k].y);
    }
  }
  return { minX, minY, maxX, maxY };
};
// 获取编辑者的信息
Editor.prototype.getStatuses = function () {
  return {
    editTypeList: this._editTypeList,
    editType: this._editType
  };
};
// 获取编辑者的信息
Editor.prototype.getEditCursor = function ({ operationStatus }) {
  let cursor = cfg.board.CURSOR.EDIT.DEFAULT;
  switch (this._editType) {
    case cfg.operator.EDIT_TYPES.MOVE_ALL:
    case cfg.operator.EDIT_TYPES.DRAW_TAILOR:
    case cfg.operator.EDIT_TYPES.MOVE_CALIBRATIONS:
    case cfg.operator.EDIT_TYPES.MOVE_IMAGE_AND_CALIBRATIONS: {
      cursor = cfg.board.CURSOR.EDIT[this._editType];
      break;
    }
    case cfg.operator.EDIT_TYPES.ADJUST_IMAGE: {
      const index = `${2 * this._storage.hoverImageControl?.index}`;
      cursor = cfg.board.CURSOR.CONTROL[index];
      break;
    }
    case cfg.operator.EDIT_TYPES.ADJUST_CALIBRATION: {
      cursor = cfg.board.CURSOR.CONTROL.DEFAULT;
      if (this._storage.hoverCalibration.scope.type === cfg.calibration.TYPES.RECT) {
        const index = `${2 * this._storage.hoverControl?.index}`;
        cursor = cfg.board.CURSOR.CONTROL[index];
      }
      if (this._storage.hoverCalibration.scope.type === cfg.calibration.TYPES.ELLIPSE) {
        const index = geometryUtil.getAngleIndex(
          this._storage.hoverCalibration.scope.angle,
          this._storage.hoverControl?.index
        );
        cursor = cfg.board.CURSOR.CONTROL[index];
      }
      break;
    }
    case cfg.operator.EDIT_TYPES.ROTATE_CALIBRATION: {
      const index = geometryUtil.getAngleIndex(this._storage.hoverCalibration.scope.angle);
      cursor = cfg.board.CURSOR.ROTATE[`${index}`];
      break;
    }
    case cfg.operator.EDIT_TYPES.ADD_ANCHOR: {
      if (operationStatus === 'doing') {
        cursor = cfg.board.CURSOR.EDIT[this._editType];
      } else {
        cursor = cfg.board.CURSOR.EDIT.moveAll;
      }
      break;
    }
    case cfg.operator.EDIT_TYPES.DELETE_ANCHOR: {
      if (operationStatus === 'doing') {
        cursor = cfg.board.CURSOR.EDIT[this._editType];
      } else {
        cursor = cfg.board.CURSOR.EDIT.moveAll;
      }
      break;
    }
  }
  return cursor;
};

// 新增锚点
Editor.prototype.addAnchor = async function (data) {
  // 更新坐标
  // 更新对象
  let res = { code: cfg.observer.CODE.SUCCESS };
  const point = { x: data.event.x, y: data.event.y };
  const coordinates = this.cache?.calibrations[0]?.scope?.coordinates || [];
  const { dist, lineInfo } = geometryUtil.getMinDistInCalibration(coordinates, point.x, point.y);
  const image = this.cache.image.scope;
  if (
    point.x < image.basePoint.x ||
    point.x > image.basePoint.x + image.width ||
    point.y < image.basePoint.y ||
    point.y > image.basePoint.y + image.height
  ) {
    res = {
      code: cfg.observer.CODE.FAIL,
      msg: '绘制的锚点不可超出图片的有效区域'
    };
  } else if (dist > 5 || dist === 'init') {
    res = {
      code: cfg.observer.CODE.FAIL,
      msg: '请将锚点绘制在路径上'
    };
  } else {
    this.cache.calibrations[0].addAnchorPoint(point, lineInfo);

    // TODO
    this._observer.send('edit:finish', {
      calibrations: this.cache.calibrations,
      rotation: this.cache.rotation,
      control: this.cache.control,
      image: this._storage.image,
      editType: this._editType,
      event
    });
    res = {
      code: cfg.observer.CODE.SUCCESS
    };
  }
  return res;
};
Editor.prototype.deleteAnchor = async function (data) {
  if (data.control) {
    this.cache.calibrations[0].deleteAnchorPoint(data.control);
    const tryRes = await this.tryEdit(cfg.operator.MOTION_TYPES.FINISH, {
      calibration: this._storage.calibrations[0]
    });

    // TODO
    if (tryRes.code === cfg.observer.CODE.SUCCESS) {
      this._observer.send('edit:finish', {
        calibrations: this.cache.calibrations,
        rotation: this.cache.rotation,
        control: this.cache.control,
        image: this._storage.image,
        editType: this._editType,
        event
      });
    }
    return tryRes;
  }
  return {
    code: cfg.observer.CODE.SUCCESS
  };
};
export default Editor;
