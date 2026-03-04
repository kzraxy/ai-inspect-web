/*
 * @Description: storage:
 * @Author: liushijie
 * @Date:2021-10-25 16:04
 * @Last Modified by: liushijie
 * @Last Modified Date:2021-10-25 16:04
 */
import cfg from '../../config';
import commonUtil from '../../utils/common';

class Storage {
  constructor() {
    this._observer = null;
    this._dom = null;
    this.image = null;
    this.calibrations = [];

    this.hoverCalibration = null; // 悬停的标注框
    this.hoverImageControl = null; // 悬停的标注框
    this.hoverControl = null; // 悬停的控制点
    this.hoverRotation = null; // 悬停旋转点
    this.focusCalibrationMap = {}; // 状态为FOCUS标注框Map
    this.statusChangeDisabled = false; // 是否可改变状态
    this.showLabelList = true; // 是否默认显示标签

    this._calibrationKey = '';
    this._indexKey = '';
    this._labelKey = '';
  }
}
// 设置key
Storage.prototype.setKeys = function (calibrationKey, indexKey, labelKey, fixLabel, showLabelList) {
  this._calibrationKey = calibrationKey || cfg.calibration.DEFAULT_CALIBRATION_KEY;
  this._indexKey = indexKey || cfg.calibration.DEFAULT_INDEX_KEY;
  this._labelKey = labelKey || cfg.calibration.DEFAULT_LABEL_KEY;
  this.fixLabel = typeof fixLabel !== 'undefined' ? fixLabel : true;
  this.showLabelList = typeof showLabelList !== 'undefined' ? showLabelList : true;
};
// 设置观察者
Storage.prototype.setObserver = function (observer) {
  this._observer = observer;
};
// 设置提示对象
Storage.prototype.setDom = function (dom) {
  this._dom = dom;
};
// 更新底图
Storage.prototype.updateImage = async function (image) {
  this.image = image;
  await this._observer.send('image:changed');
};
// 删除标注列表
Storage.prototype.deleteCalibrations = async function (data) {
  const { calibrationKeys } = data;
  const res = await this._observer.send('calibrations:beforeDelete', {
    calibrationKey: calibrationKeys
  });
  if (res.code === 'fail') {
    return;
  }

  const calibrations = [];
  for (let i = 0, len = this.calibrations.length; i < len; i++) {
    let isDelete = false;
    for (let k = 0, { length } = calibrationKeys; k < length; k++) {
      if (calibrationKeys[k] === this.calibrations[i].id && this.calibrations[i].deletable) {
        isDelete = true;
        this.calibrations[i].delete();
        break;
      }
    }
    !isDelete && calibrations.push(this.calibrations[i]);
  }
  this.calibrations = calibrations;
  this.initStatusMap();

  await this._observer.send('calibrations:changed');
};
// 隐藏or展示标注列表
Storage.prototype.updateCalibrationsVisible = async function (data) {
  const { calibrationKeys, visible } = data;
  for (let i = 0, len = this.calibrations.length; i < len; i++) {
    for (let k = 0, { length } = calibrationKeys; k < length; k++) {
      if (calibrationKeys[k] === this.calibrations[i].id) {
        this.calibrations[i].updateCalibrationVisible(visible);
      }
    }
  }
  await this._observer.send('calibrations:changed');
};
// 更新标注列表
Storage.prototype.updateCalibrations = async function (data) {
  const { calibrations: list, isMerge = false } = data;
  const idMap = {};
  const indexMap = {};
  let idLegal = true;
  let indexLegal = true;
  let currentList = [];

  if (isMerge) {
    // 如果是合并,则遍历并覆盖
    currentList = this.calibrations;
  } else {
    for (let i = 0, len = this.calibrations.length; i < len; i++) {
      this.calibrations[i].delete();
    }
  }
  for (let i = 0, len = currentList.length; i < len; i++) {
    indexMap[currentList[i].index] = { item: currentList[i], listIndex: i };
    idMap[currentList[i].id] = { item: currentList[i], listIndex: i };
  }

  for (let i = 0, len = list.length; i < len; i++) {
    const { id, index } = list[i] || {};

    // 校验id是否存在
    if (typeof id !== 'string' && typeof id !== 'number') {
      // id不是字符串或数字，则id无效的适合不加载
      idLegal = false;
      break;
    }
    if (typeof index !== 'number') {
      // index不是数字，则index无效
      indexLegal = false;
      break;
    }
    if (typeof indexMap[index] !== 'undefined' && id !== indexMap[index].item?.id) {
      // index已经存在且存在的标注框id不一样，index无效
      indexLegal = false;
      break;
    }
    if (typeof idMap[id] !== 'undefined') {
      // 如果该id的框已经有了
      if (isMerge) {
        // 如果是合并
        const { listIndex } = idMap[id];
        const newIndex = i + currentList.length;
        idMap[id].item = list[i]; // 替换idMap里的元素
        idMap[id].index = newIndex;
        currentList[listIndex].delete();
        currentList[listIndex] = list[i]; // 替换currentList里的元素
      } else {
        // id无效的适合不加载
        idLegal = false;
      }
    } else {
      // 如果还没有,直接加入
      idMap[id] = { item: list[i], listIndex: i };
      indexMap[index] = { item: list[i], listIndex: i };
      currentList.push(list[i]);
    }
  }
  if (!idLegal || !indexLegal) {
    for (let i = 0, len = list.length; i < len; i++) {
      list[i] && list[i].delete();
    }
  }
  if (!idLegal) {

    return;
  }
  if (!indexLegal) {
    return;
  }
  this.calibrations = commonUtil.sort(currentList, 'index');
  this.initStatusMap();
  await this._observer.send('calibrations:changed');
};
// 更新标尺
Storage.prototype.updateAxes = async function (axes) {
  this.axes = axes;
};
// 更新标签列表
// Storage.prototype.updateCalibrationLabelsList = async function(data) {
//   const { calibrationKey, labelList } = data;
//   const list = [];
//   for (let k = 0, length = this._storage.calibrations.length; k < length; k++) {
//     if (this._storage.calibrations[k].id === calibrationKey) {
//       for (let i = 0; i < labelList.length; i++) {
//         const label = {};
//         label._data = labelList[i];
//         label.text = labelList[i].text;
//         label.id = labelList[i][this._storage._labelKey] ?? geometryUtil.guid();
//         label.deletable = labelList[i].deletable ?? true;
//         label.style = commonUtil.formatObj(
//           labelList[i].style || {},
//           this._storage.calibrations[k].style.label
//         );
//         list.push(label);
//       }
//       this._storage.calibrations[k].labelList = list;
//     }
//   }
//   await this._observer.send('calibrations:labelListChanged', {
//     calibrationKey,
//     labelList: list
//   });
// };
// 删除标签
Storage.prototype.deleteCalibrationLabels = async function ({ calibrationKey, labelIds }) {
  const calibration = this.calibrations.find(cal => cal.id === calibrationKey);
  const labelList = calibration?.labelListDom.labelList || [];
  const list = [];
  const deleteList = [];
  for (let k = 0, { length } = labelList; k < length; k++) {
    let needDel = false;
    for (let i = 0, len = labelIds.length; i < len; i++) {
      if (labelList[k].id === labelIds[i]) {
        needDel = true;
      }
    }
    if (!needDel) {
      deleteList.push(labelList[k]);
    }
  }
  const res = await this._observer.send('calibrations:beforeDelete', {
    calibrationKey: [calibrationKey],
    labelList: deleteList,
    type: 'deleteLabel'
  });

  if (res.code === 'fail') {
    return;
  }
  for (let k = 0, { length } = labelList; k < length; k++) {
    let needDel = false;
    for (let i = 0, len = labelIds.length; i < len; i++) {
      if (labelList[k].id === labelIds[i]) {
        needDel = true;
      }
    }
    if (needDel) {
      labelList[k].dom.delete();
    } else {
      list.push(labelList[k]);
    }
  }
  calibration.labelListDom.labelList = list;

  await this._observer.send('calibrations:labelListChanged', {
    calibrationKey,
    labelList: list
  });
};
// 更新标注对象
Storage.prototype.updateCalibrationById = function (calibration) {
  for (let i = 0, len = this.calibrations.length; i < len; i++) {
    if (this.calibrations[i].id === calibration.id) {
      this.calibrations[i] = calibration;
    }
  }
  this.initStatusMap();
};
// 更新状态索引表
Storage.prototype.initStatusMap = function () {
  this.hoverCalibration = null;
  this.focusCalibrationMap = {};
  for (let i = 0; i < this.calibrations.length; i++) {
    // 处理状态数据
    if (this.calibrations[i].status === cfg.status.HOVER && !this.hoverCalibration) {
      this.hoverCalibration = this.calibrations[i];
    }
    if (this.calibrations[i].status === cfg.status.FOCUS) {
      this.focusCalibrationMap[this.calibrations[i].id] = this.calibrations[i];
    }
  }
};
// 更新悬停标注框
Storage.prototype.updateHoverCalibration = async function (params) {
  if (this.statusChangeDisabled) {
    return;
  }

  const { image, imageControl, calibration, control, rotation } = params;

  // 重置状态
  let calibrationsViewChanged = false;
  let labelsViewChanged = false;
  let imageViewChanged = false;
  // HOVER : 图片------------------------------------------------------------------------------
  if (image && this.image.tailorScope.status === cfg.status.NORMAL) {
    this.image.tailorScope.status = cfg.status.HOVER;
    imageViewChanged = true;
  } else if (!image && this.image?.tailorScope?.status === cfg.status.HOVER) {
    this.image.tailorScope.status = cfg.status.NORMAL;
    imageViewChanged = true;
  }
  // HOVER : 图片控制点------------------------------------------------------------------------------
  if (
    this.hoverImageControl?.[cfg.control.DEFAULT_KEY] !== imageControl?.[cfg.control.DEFAULT_KEY]
  ) {
    if (this.hoverImageControl) {
      if (this.hoverImageControl.status === cfg.status.HOVER) {
        this.hoverImageControl.status = cfg.status.NORMAL;
        imageViewChanged = true;
      }
      this.hoverImageControl = null;
    }
    if (imageControl && imageControl.status === cfg.status.NORMAL) {
      imageControl.status = cfg.status.HOVER;
      this.hoverImageControl = imageControl;
      imageViewChanged = true;
    }
  }
  // HOVER : 标注框------------------------------------------------------------------------------
  if (this.hoverCalibration?.id !== calibration?.id) {
    if (this.hoverCalibration) {
      if (this.hoverCalibration.status === cfg.status.HOVER) {
        this.hoverCalibration.updateStatus(cfg.status.NORMAL);
        labelsViewChanged = true;
        calibrationsViewChanged = true;
      }
      this.hoverCalibration = null;
    }
    // 如果存在hover的标注框
    if (calibration) {
      if (calibration.status === cfg.status.NORMAL) {
        // 如果标注框是normal态
        calibration.updateStatus(cfg.status.HOVER);
        labelsViewChanged = true;
        calibrationsViewChanged = true;
      }
      // 无论标注框是什么态，都会记录hoverCalibration
      this.hoverCalibration = calibration;
    }
  }
  // HOVER : 标注框控制点------------------------------------------------------------------------------
  if (this.hoverControl?.[cfg.control.DEFAULT_KEY] !== control?.[cfg.control.DEFAULT_KEY]) {
    if (this.hoverControl) {
      this.hoverControl.status = cfg.status.NORMAL;
      this.hoverControl = null;
      calibrationsViewChanged = true;
    }
    if (control) {
      control.status = cfg.status.HOVER;
      this.hoverControl = control;
      calibrationsViewChanged = true;
    }
  }
  // HOVER : 标注框旋转点------------------------------------------------------------------------------
  if (this.hoverRotation?.[cfg.control.DEFAULT_KEY] !== rotation?.[cfg.control.DEFAULT_KEY]) {
    if (this.hoverRotation) {
      this.hoverRotation.status = cfg.status.NORMAL;
      this.hoverRotation = null;
      calibrationsViewChanged = true;
    }
    if (rotation) {
      rotation.status = cfg.status.HOVER;
      this.hoverRotation = rotation;
      calibrationsViewChanged = true;
    }
  }
  if (labelsViewChanged) {
    await this._observer.send('calibrations:statusChanged', {
      calibrationKeys: this.hoverCalibration ? [this.hoverCalibration.id] : [],
      status: cfg.status.HOVER
    });
  }
  if (calibrationsViewChanged) {
    await this._observer.send('calibrations:viewChanged', {
      calibrationKeys: this.hoverCalibration ? [this.hoverCalibration.id] : [],
      status: cfg.status.HOVER
    });
  }
  if (imageViewChanged) {
    await this._observer.send('image:viewChanged');
  }
};
// 更新标注列表框状态
Storage.prototype.updateFocusCalibrations = async function ({ calibrationsMap }) {
  if (this.statusChangeDisabled) {
    return;
  }
  let calibrationsViewChanged = false;
  for (const id in this.focusCalibrationMap) {
    if (!calibrationsMap[id]) {
      this.focusCalibrationMap[id].updateStatus(cfg.status.NORMAL);
      calibrationsViewChanged = true;
    }
  }
  for (const id in calibrationsMap) {
    if (calibrationsMap[id].status !== cfg.status.FOCUS) {
      calibrationsMap[id].updateStatus(cfg.status.FOCUS);
      calibrationsViewChanged = true;
    }
  }
  this.focusCalibrationMap = calibrationsMap;
  if (calibrationsViewChanged) {
    await this._observer.send('calibrations:statusChanged', {
      calibrationKeys: Object.keys(this.focusCalibrationMap),
      status: cfg.status.FOCUS
    });
    await this._observer.send('calibrations:viewChanged');
  }
};
// 更新标注列表框层级
Storage.prototype.updateCalibrationsIndex = async function () {
  // const { calibrationIndexAndKeys: list, calibrationKey, indexKey } = data;
};
// 更新默认标注框标签显隐
Storage.prototype.updateCalibrationsLabelVisible = function (params) {
  const { visible } = params;
  this.showLabelList = visible;

  this.updateLabelVisible(params);
};
// 更新标注框标签显隐
Storage.prototype.updateLabelVisible = function (params) {
  const { visible = this.showLabelList } = params || {};
  // 默认使用全局的showLabelList
  for (let i = 0, len = this.calibrations.length; i < len; i++) {
    this.calibrations[i].updateLabelVisible(visible);
  }
};
// 查询图片是否加载
Storage.prototype.getIsImageLoaded = function () {
  return this.image && typeof this.image === 'object';
};
// 获取标注列表
Storage.prototype.getCalibrations = function () {
  return this.calibrations;
};
// 获取图片
Storage.prototype.getImageScope = function () {
  return commonUtil.copy(this.image.scope);
};
export default Storage;
