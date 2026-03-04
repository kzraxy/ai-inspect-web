/*
 * @Description: operator:
 * @Author: liushijie
 * @Date:2021-09-13 11:23
 * @Last Modified by: liushijie
 * @Last Modified Date:2021-09-13 11:23
 */
import { Message } from 'hui';
import Drawer from './modules/drawer';
import Editor from './modules/editor';
import cfg from '../../config';
import geometryUtil from '../../utils/geometry';
import operator from '../../config/modules/operator';
import ImageObj from '../canvasObj/image';

class Operator {
  constructor() {
    this._operationTypeList = Object.values(cfg.operator.OPERATION_TYPES);
    this._operationType = '';
    this._operationStatus = '';
    this._drawEditStatus = ''; // 绘制过程中Edit的status，记录在绘制过程中编辑状态是否开启，这个字段听起来有点变态，是因为有个需求是边绘制边按住空格键移动图片，那我们需要记录绘制过程中有没有调用过开启的函数
    this._operatingType = '';

    this._observer = null;
    this._canvases = {};
    this._storage = {};
    this._limitCalibrations = false;

    this.editor = new Editor();
    this.drawer = new Drawer();
  }
}
// 设置观察者引用
Operator.prototype.setObserver = function (observer) {
  this._observer = observer;
  this.editor.setObserver(observer);
  this.drawer.setObserver(observer);
  const context = this;
  this._observer.addListener('calibrations:changed', {
    name: 'reRenderCalibrations',
    context
  });
  this._observer.addListener('calibrations:viewChanged', {
    name: 'reRenderCalibrations',
    context
  });
  this._observer.addListener('image:changed', { name: 'reRenderImage', context });
  this._observer.addListener('image:viewChanged', { name: 'reRenderImage', context });
  this._observer.addListener('panel:handleMouseLeftDown', { name: 'handleMouseLeftDown', context });
  this._observer.addListener('panel:handleMouseLeftUp', { name: 'handleMouseLeftUp', context });
  this._observer.addListener('panel:handleMouseRightDown', {
    name: 'handleMouseRightDown',
    context
  });
  this._observer.addListener('panel:handleMouseRightUp', { name: 'handleMouseRightUp', context });
  this._observer.addListener('panel:handleMouseDoubleClick', {
    name: 'handleMouseDoubleClick',
    context
  });
  this._observer.addListener('panel:handleMouseMove', { name: 'handleMouseMove', context });
  this._observer.addListener('handleMouseLeave', { name: 'handleMouseLeave', context });
  this._observer.addListener('handleMouseEnter', { name: 'handleMouseEnter', context });
  this._observer.addListener('handleMouseWheel', { name: 'handleMouseWheel', context });
  this._observer.addListener('handleKeyDown', { name: 'handleKeyDown', context });
  this._observer.addListener('handleKeyUp', { name: 'handleKeyUp', context });
};
// 设置存储引用
Operator.prototype.setStorage = function ({ storage }) {
  this._storage = storage;
  this.editor.setStorage(storage);
  this.drawer.setStorage(storage);
};
// 设置画板
Operator.prototype.setCanvases = function ({ canvases }) {
  this._canvases = canvases;
};
// 设置限制
Operator.prototype.setLimit = function ({ limitCalibrations }) {
  this._limitCalibrations = limitCalibrations;
  this.editor.setLimit(limitCalibrations);
  this.drawer.setLimit(limitCalibrations);
};
// 更新可用操作列表
Operator.prototype.updateOperationTypeList = function ({ operationTypeList: propList }) {
  const operationTypeList = propList || Object.values(cfg.operator.OPERATION_TYPES);
  this._operationTypeList =
    operationTypeList && Array.isArray(operationTypeList) ? operationTypeList : [];
  if (!this._operationTypeList.includes(this._operationType)) {
    this.updateOperationType({
      operationType: this._operationTypeList[0] || ''
    });
  }
  this._storage.statusChangeDisabled = !this._operationTypeList.includes(
    cfg.operator.OPERATION_TYPES.EDIT
  );
};
// 更新操作类型
Operator.prototype.updateOperationType = function ({ operationType: propType }) {
  if (this._operationStatus === cfg.operator.OPERATION_STATUS.DOING) {
    // 如果正在操作，则不允许切换
    return;
  }
  let operationType = propType || '';
  if (!this._operationTypeList.includes(operationType)) {
    operationType = this._operationTypeList[0] || '';
  }

  if (this._operationType !== operationType) {
    this._operationType = operationType;
    this._observer.send('operator:operationTypeChange', this._operationType);
    this.updateOperationStatus(cfg.operator.OPERATION_STATUS.UNDO);
  }
};
// 更新操作状态
Operator.prototype.updateOperationStatus = function (status) {
  const operationStatus = status || cfg.operator.OPERATION_STATUS.UNDO;
  if (this._operationStatus !== operationStatus) {
    if (operationStatus === cfg.operator.OPERATION_STATUS.UNDO) {
      // 显示标签在切换状态时，隐藏，在开始操作但第一次移动的时候
      this._storage.updateLabelVisible();
    }
    this._operationStatus = operationStatus;
    this._observer.send('operator:operationStatusChanged', this._operationStatus);
  }
};
// 鼠标事件
Operator.prototype.handleMouseLeftDown = async function (data) {
  if (!this._operationTypeList?.length) {
    // 禁用状态则返回
    return;
  }
  let res = null;
  let elements = {};
  // 如果是在进行删除锚点操作，则获取上层元素
  if (this.editor._editType === cfg.operator.EDIT_TYPES.DELETE_ANCHOR) {
    elements = this.getUpperElement(data.event);

    // const { calibration } = elements;
  }
  if (this._operationStatus !== cfg.operator.OPERATION_STATUS.DOING) {
    // 如果是未操作的状态，获取点击到的元素，并更新FOCUS视图
    elements = this.getUpperElement(data.event);
    const { calibration } = elements;
    // 处理选中状态
    let calibrationsMap = {};
    // 如果是绘制状态，创建一个新的Process对象，并选中
    if (this._operationType === cfg.operator.OPERATION_TYPES.DRAW) {
      // 取消所有的FOCUS元素
      await this._storage.updateFocusCalibrations({
        calibrationsMap: {}
      });
    } else {
      // 如果是编辑状态，根据Shift和Control选中
      if (data.downKeys[cfg.board.HOT_KEYS.CTRL]) {
        // ctrl为接连多选
        calibrationsMap = this._storage.focusCalibrationMap;
      }
      if (data.downKeys[cfg.board.HOT_KEYS.SHIFT]) {
        // shift为按列表顺序批量选中
        calibrationsMap = this._storage.focusCalibrationMap;
        let min = 0;
        let max = 0;
        // 先找到目标标注框的索引
        for (let i = 0; i < this._storage.calibrations.length; i++) {
          if (this._storage.calibrations[i].id === calibration.id) {
            min = i;
            max = i;
          }
        }
        // 再获得最大最小索引
        for (let i = 0; i < this._storage.calibrations.length; i++) {
          if (this._storage.calibrations[i].status === cfg.status.FOCUS) {
            if (i < min) {
              min = i;
            }
            if (i > max) {
              max = i;
            }
          }
        }
        // 根据最大最小索引更新选中的框
        for (let i = min; i < max; i++) {
          if (!calibrationsMap[this._storage.calibrations[i].id]) {
            calibrationsMap[this._storage.calibrations[i].id] = this._storage.calibrations[i];
          }
        }
      }
      if (calibration) {
        if (calibration.status !== cfg.status.FOCUS) {
          calibrationsMap[calibration.id] = calibration;
          await this._storage.updateFocusCalibrations({
            calibrationsMap
          });
        }
      } else {
        await this._storage.updateFocusCalibrations({
          calibrationsMap
        });
      }
    }
  }
  // 根据操作类型执行操作
  res = await this.handleOperationClick({ ...elements, data });
  if (res.code !== cfg.observer.CODE.SUCCESS) {
    return;
  }
  // 触发完成点击后的回调

  res = await this._observer.send('operator:mouseLeftDown', {
    status: this.getStatuses(),
    $event: data.event.$event
  });
  this.updatePrompt({ ...res, event: data.event });
};
Operator.prototype.handleOperationClick = async function (params) {
  let res = null;
  const { image, imageControl, calibration, rotation, control, data } = params;
  switch (this._operationType) {
    case cfg.operator.OPERATION_TYPES.DRAW:
      if (this.drawer._drawType) {
        if (this._operationStatus !== cfg.operator.OPERATION_STATUS.DOING) {
          // 开始绘制
          this.updateOperationStatus(cfg.operator.OPERATION_STATUS.DOING);
          res = await this.drawer.startDraw({ data });
          if (res.code !== cfg.observer.CODE.SUCCESS) {
            // 更新提示文字与操作状态
            this.updatePrompt({ ...res, ...(res?.data || {}) });
            this.updateOperationStatus(cfg.operator.OPERATION_STATUS.UNDO);
          }
        } else if (this.drawer._drawType === cfg.drawer.DRAW_TYPES.POLYGON) {
          if (data.downKeys[cfg.board.HOT_KEYS.SPACE]) {
            res = {
              code: cfg.observer.CODE.SUCCESS
            };
          } else {
            // 在绘制中，是多边形则更新绘制
            res = await this.drawer.updateDraw({
              motionType: cfg.operator.MOTION_TYPES.CONFIRM,
              data
            });
            if (!this.drawer.cache.calibration) {
              // 如果绘制中的缓存被清空，则说明被动完成了
              this.updateOperationStatus(cfg.operator.OPERATION_STATUS.UNDO);
            }
          }
        } else if (data.downKeys[cfg.board.HOT_KEYS.SPACE]) {
          res = {
            code: cfg.observer.CODE.SUCCESS
          };
        } else {
          // 在绘制中，不是多边形则完成绘制
          res = await this.drawer.finishDraw();
          if (res.code === cfg.observer.CODE.SUCCESS) {
            this.updateOperationStatus(cfg.operator.OPERATION_STATUS.UNDO);
          }
        }
      } else {
        res = {
          code: cfg.observer.CODE.SUCCESS
        };
      }
      break;
    case cfg.operator.OPERATION_TYPES.EDIT:
      if (this._operationStatus !== cfg.operator.OPERATION_STATUS.DOING) {
        // 开始编辑
        // 如果没有选择多边形标注框就直接开启了，则提示只支持多边形标注框的增删锚点
        if (
          calibration?.scope?.type !== 'polygon' &&
          (this.editor._editType === cfg.operator.EDIT_TYPES.DELETE_ANCHOR ||
            this.editor._editType === cfg.operator.EDIT_TYPES.ADD_ANCHOR)
        ) {
          res = { code: 'fail', msg: '请选择多边形标注框' };
          break;
        }
        this.updateOperationStatus(cfg.operator.OPERATION_STATUS.DOING);
        this._operatingType = cfg.operator.OPERATION_TYPES.EDIT;

        res = await this.editor.startEdit({
          imageControl,
          calibration,
          rotation,
          control,
          image,
          data
        });
      } else if (!this.editor.isUseAnchor) {
        res = await this.editor.finishEdit({ data });
      } else {
        res = await this.editor.updateEdit({
          hover: { image, imageControl, calibration, control, rotation },
          data
        });
      }
      break;
  }

  if (res.code !== cfg.observer.CODE.SUCCESS) {
    // 如果不成功，则提示文字
    if (this.editor._editType === cfg.operator.EDIT_TYPES.DELETE_ANCHOR && res?.data?.isDelete) {
      this._storage.deleteCalibrations({ calibrationKeys: [this.editor.cache.calibrations[0].id] });
      await this.editor.finishEdit();

      Message.error(res.msg);
    } else {
      this.updatePrompt({ ...res, event: data.event });
    }
  }
  return res;
};
Operator.prototype.handleMouseLeftUp = async function (data) {
  switch (this._operationType) {
    case cfg.operator.OPERATION_TYPES.DRAW:
      break;
    case cfg.operator.OPERATION_TYPES.EDIT:
      if (this._operationStatus === cfg.operator.OPERATION_STATUS.DOING) {
        if (
          (this.editor._editType !== cfg.operator.EDIT_TYPES.DRAW_TAILOR &&
            !this.editor.isDrawTailor &&
            this.editor._editType !== cfg.operator.EDIT_TYPES.ADD_ANCHOR &&
            this.editor._editType !== cfg.operator.EDIT_TYPES.DELETE_ANCHOR) ||
          !this.editor.isUseAnchor
        ) {
          await this.editor.finishEdit({ data });

          this.updateOperationStatus(cfg.operator.OPERATION_STATUS.UNDO);
        }
      }
      break;
  }
};
Operator.prototype.handleMouseRightUp = function () {};
Operator.prototype.handleMouseRightDown = async function (data) {
  // 禁用
  if (!this._operationTypeList?.length) {
    return;
  }
  let res = {
    code: 'success'
  };
  switch (this._operationType) {
    case cfg.operator.OPERATION_TYPES.DRAW:
      if (
        this._operationStatus === cfg.operator.OPERATION_STATUS.DOING &&
        this.drawer._drawType === cfg.drawer.DRAW_TYPES.POLYGON &&
        (this.drawer.cache.calibration?.scope?.coordinates?.length || 0) > 2
      ) {
        // 正在绘制多边形，则完成绘制
        res = await this.drawer.finishDraw();
        if (res.code === cfg.observer.CODE.SUCCESS) {
          this.updateOperationStatus(cfg.operator.OPERATION_STATUS.UNDO);
        }
      }
      break;
    case cfg.operator.OPERATION_TYPES.EDIT:
      if (
        this._operationStatus === cfg.operator.OPERATION_STATUS.DOING &&
        (this.editor._editType === cfg.operator.EDIT_TYPES.ADD_ANCHOR ||
          this.editor._editType === cfg.operator.EDIT_TYPES.DELETE_ANCHOR)
      ) {
        this.updateOperationStatus(cfg.operator.OPERATION_STATUS.UNDO);
        this.editor.finishEdit();
        await this._observer.send('operator:anchorChanged');
        // await this._storage.updateFocusCalibrations({
        //   calibrationsMap: {}
        // });
      } else if (
        this.editor._editType === cfg.operator.EDIT_TYPES.ADD_ANCHOR ||
        this.editor._editType === cfg.operator.EDIT_TYPES.DELETE_ANCHOR
      ) {
        await this._observer.send('operator:anchorChanged');
      }
      break;
  }
  if (res.code !== cfg.observer.CODE.SUCCESS) {
    // 如果开始不成功，则提示文字
    this.updatePrompt({ ...res, ...res.data, event: data.event });
  }
};
Operator.prototype.handleMouseMove = async function (data) {
  if (!this._operationTypeList?.length) {
    // 禁用
    return;
  }
  let res = null;
  // 更新标尺视图
  this.reRenderAxes(data.event);
  // 获取鼠标悬停到的元素
  const { image, imageControl, calibration, control, rotation } = this.getUpperElement(data.event);

  // 更新悬停视图
  await this._storage.updateHoverCalibration({
    image,
    imageControl,
    calibration,
    control,
    rotation
  });
  // 如果是编辑状态，且未编辑
  if (
    this._operationType === cfg.operator.OPERATION_TYPES.EDIT &&
    this._operationStatus !== cfg.operator.OPERATION_STATUS.DOING
  ) {
    this.editor.updateEditType({ image, imageControl, calibration, control, rotation });
  }
  // 触发鼠标移动事件回调
  res = await this._observer.send('operator:mouseMove', {
    $event: data.event.$event,
    image,
    calibration
  });
  if (this._operationStatus === cfg.operator.OPERATION_STATUS.DOING) {
    // 根据状态完成视图更新，获取更新后的回调结果
    switch (this._operationType) {
      case cfg.operator.OPERATION_TYPES.DRAW:
        // 如果在绘制的过程中按下空格键
        if (data.downKeys[cfg.board.HOT_KEYS.SPACE]) {
          res = await this.handleMoveWhileDrawing(data);
        } else {
          res = await this.drawer.updateDraw({
            hover: { image, imageControl, calibration, control, rotation },
            data
          });
        }
        break;
      case cfg.operator.OPERATION_TYPES.EDIT:
        if (
          data.mouseDown &&
          (this.editor._editType === cfg.operator.EDIT_TYPES.ADD_ANCHOR ||
            this.editor._editType === cfg.operator.EDIT_TYPES.DELETE_ANCHOR)
        ) {
          break;
        }
        res = await this.editor.updateEdit({
          hover: { image, imageControl, calibration, control, rotation },
          data
        });

        break;
    }
    if (
      this._storage.showLabelList &&
      (this._operationType === cfg.operator.OPERATION_TYPES.DRAW ||
        cfg.operator.EDIT_TYPES_INFO?.[this.editor._editType]?.hideLabelList)
    ) {
      // 隐藏标签在第一次移动时，但显示在接触操作状态改变时立刻显示
      this._storage.updateLabelVisible({
        visible: false
      });
    }
  }
  if (
    (res.code !== cfg.observer.CODE.SUCCESS && this.editor._editType) ===
      cfg.operator.EDIT_TYPES.DELETE_ANCHOR &&
    res?.data?.isDelete
  ) {
    // 如果不成功且是删除锚点
    this._storage.deleteCalibrations({ calibrationKeys: [this.editor.cache.calibrations[0].id] });
    await this.editor.finishEdit();
    Message.error(res.msg);
    return;
  }
  // 根据结果更新提示
  this.updatePrompt({ ...res, event: data.event });
  // 更新光标
  this.updateCursor();
};
// Operator.prototype.handleMovingWhileEditing = async function(data) {
//   const { image, imageControl, calibration, control, rotation } = this.getUpperElement(data.event);
//   this.editor.updateEditTypeList({
//     editTypeList: [cfg.operator.EDIT_TYPES.MOVE_ALL]
//   });
//   let res = null;
//   // 如果此时鼠标按下并且没有开启编辑则调用startEdit
//   res = await this.editor.updateEdit({
//     hover: { image, imageControl, calibration, control, rotation },
//     data
//   });
//   return res;
// };
// 当用户在绘制时移动
Operator.prototype.handleMoveWhileDrawing = async function (data) {
  const { image, imageControl, calibration, control, rotation } = this.getUpperElement(data.event);
  this.editor.updateEditTypeList({
    editTypeList: [cfg.operator.EDIT_TYPES.MOVE_ALL]
  });
  let res = null;
  // 如果此时鼠标按下并且没有开启编辑则调用startEdit
  if (data.mouseDown && this._drawEditStatus !== cfg.operator.OPERATION_STATUS.DOING) {
    this._drawEditStatus = cfg.operator.OPERATION_STATUS.DOING;
    res = await this.editor.startEdit({
      imageControl,
      calibration,
      rotation,
      control,
      image,
      data
    });
  } else if (data.mouseDown && this._drawEditStatus === cfg.operator.OPERATION_STATUS.DOING) {
    // 如果鼠标按下且正在编辑，则更新编辑信息
    res = await this.editor.updateEdit({
      hover: { image, imageControl, calibration, control, rotation },
      data
    });
  } else {
    res = await this.editor.finishEdit({ data });
    this._drawEditStatus = cfg.operator.OPERATION_STATUS.UNDO;
  }
  this.drawer.updateCacheAfterMoveAll();
  return res;
};
Operator.prototype.handleMouseDoubleClick = async function (data) {
  const elements = this.getUpperElement(data.event);
  await this._observer.send('operator:mouseDoubleClick', {
    status: this.getStatuses(),
    $event: data.event.$event,
    elements
  });
};
Operator.prototype.handleMouseLeave = function () {
  this.updatePrompt({ msg: '' });
  this.reRenderAxes({ x: -10, y: -10 });
};
Operator.prototype.handleMouseEnter = function () {};
Operator.prototype.handleMouseWheel = async function (data) {
  if (
    !data.downKeys[cfg.board.HOT_KEYS.CTRL] ||
    this._storage.image.tailorScope.status !== cfg.status.HOVER
  ) {
    return;
  }
  // 在绘制区域内，且CTRL，则缩放
  const { event } = data;
  const e = event.$event;
  const oldRatio = this._storage.image.scope.ratio;
  const newRatio = this._storage.image.scope.ratio * ((-e.detail || e.wheelDelta) > 0 ? 2 : 1 / 2);
  const newPoint = {
    x: event.x,
    y: event.y
  };
  await this.handleEnlargeOperation({ oldRatio, newRatio, newPoint });
};
Operator.prototype.handleRotateImageOperation = async function (params) {
  const {
    defaultStyle,
    root: { height = 0, width = 0 },
    loading,
    angle = 0
  } = params;
  if (this._operationStatus === cfg.operator.OPERATION_STATUS.DOING) {
    return;
  }
  // 开启加载蒙层
  loading.open();
  // this._storage.image?.tailorScope?.controls表示图片已经裁剪过
  if (this._storage.calibrations.length || this._storage.image?.tailorScope?.controls) {
    return;
  }
  // 开始编辑
  this.updateOperationStatus(cfg.operator.OPERATION_STATUS.DOING);
  const operationType = this._operatingType;
  this._operatingType = cfg.operator.OPERATION_TYPES.EDIT;
  // 生成底图
  const imageObj = await ImageObj.getObj({
    image: { ...this._storage?.image?._data, angle },
    defaultStyle,
    height,
    width
  });
  await this.editor.rotateImage({
    imageObj
  });
  // 还原操作状态
  this._operatingType = operationType;
  this.updateOperationStatus(cfg.operator.OPERATION_STATUS.UNDO);
  loading.close();
};
Operator.prototype.handleEnlargeOperation = async function (params = {}) {
  const { oldRatio, newRatio, newPoint = {} } = params;
  if (
    this._operationStatus === cfg.operator.OPERATION_STATUS.DOING &&
    this._operationType === cfg.operator.OPERATION_TYPES.EDIT
  ) {
    // 如果正在缩放则不触发
    return;
  }
  // 开启加载蒙层
  this._storage._dom.loading.open();
  if (
    (this?._storage?.calibrations ?? []).some(cal => cal.scope.type === cfg.drawer.DRAW_TYPES.PIXEL)
  ) {
    // 如果存在像素标注，则需要加载蒙层
    await new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 20);
    });
  }
  // 开始编辑
  // 备份当前操作状态
  const currentOperationStatus = this._operationStatus;
  const currentOperationType = this._operationType;
  // 设置当前操作状态为缩放中
  this._operatingType = cfg.operator.OPERATION_TYPES.EDIT;
  this.updateOperationStatus(cfg.operator.OPERATION_STATUS.DOING);
  // 开始执行逻辑
  newPoint.x = typeof newPoint.x === 'number' ? newPoint.x : this._storage._dom.root.width / 2;
  newPoint.y = typeof newPoint.y === 'number' ? newPoint.y : this._storage._dom.root.height / 2;
  await this.editor.enlarge({
    ...this._storage.image.scope,
    newRatio,
    newPoint
  });
  if (
    this._operationType === cfg.operator.OPERATION_TYPES.DRAW &&
    this._operationStatus === cfg.operator.OPERATION_STATUS.DOING
  ) {
    // 绘制中的话缩放绘制的步骤
    await this.drawer.enlargeCache({
      ...this._storage.image.scope,
      newRatio,
      newPoint,
      oldRatio
    });
  }
  // 恢复之前的操作类型和状态
  this._operatingType = currentOperationType;
  this.updateOperationStatus(currentOperationStatus);
  // 关闭加载蒙层
  this._storage._dom.loading.close();
};
Operator.prototype.handleResetOperation = async function () {
  if (
    this._operationStatus === cfg.operator.OPERATION_STATUS.DOING &&
    this._operationType === cfg.operator.OPERATION_TYPES.EDIT
  ) {
    // 如果正在缩放则不触发
    return;
  }
  // 开启加载蒙层
  this._storage._dom.loading.open();
  if (
    (this?._storage?.calibrations ?? []).some(cal => cal.scope.type === cfg.drawer.DRAW_TYPES.PIXEL)
  ) {
    // 如果存在像素标注，则需要加载蒙层
    await new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 20);
    });
  }
  // 开始编辑
  // 备份当前操作状态
  const currentOperationStatus = this._operationStatus;
  const currentOperationType = this._operationType;
  // 设置当前操作状态为缩放中
  this._operatingType = cfg.operator.OPERATION_TYPES.EDIT;
  this.updateOperationStatus(cfg.operator.OPERATION_STATUS.DOING);
  // 开始执行逻辑
  const oldRatio = this._storage.image.scope.ratio;
  const oldPoint = this._storage.image.scope.basePoint;
  await this.editor.reset(this._storage._dom.root);
  if (
    this._operationType === cfg.operator.OPERATION_TYPES.DRAW &&
    this._operationStatus === cfg.operator.OPERATION_STATUS.DOING
  ) {
    const {
      scope: { basePoint: newPoint, ratio: newRatio }
    } = this._storage.image;
    // 绘制中的话缩放绘制的步骤
    this.drawer.enlargeCache({
      ...this._storage.image.scope,
      newRatio,
      newPoint,
      oldRatio,
      oldPoint
    });
  }
  // 恢复之前的操作类型和状态
  this._operatingType = currentOperationType;
  this.updateOperationStatus(currentOperationStatus);
  // 关闭加载蒙层
  this._storage._dom.loading.close();
};
Operator.prototype.handleKeyDown = async function (data) {
  const downKeyCount = Object.keys(data.downKeys).length;
  let somethingDone = false;
  switch (this._operationType) {
    case cfg.operator.OPERATION_TYPES.DRAW: {
      if (this._operationStatus === cfg.operator.OPERATION_STATUS.DOING) {
        // 绘制中的操作
        if (
          data.downKeys[cfg.board.HOT_KEYS.CTRL] &&
          data.downKeys[cfg.board.HOT_KEYS.SHIFT] &&
          data.downKeys[cfg.board.HOT_KEYS.Z] &&
          downKeyCount === 3
        ) {
          // Ctrl + X 恢复
          await this.drawer.redoDraw();
          somethingDone = true;
        } else if (
          data.downKeys[cfg.board.HOT_KEYS.CTRL] &&
          data.downKeys[cfg.board.HOT_KEYS.Z] &&
          downKeyCount === 2
        ) {
          // Ctrl + Z 撤销
          await this.drawer.undoDraw();
          somethingDone = true;
        }
        if (data.downKeys[cfg.board.HOT_KEYS.ESC] && downKeyCount === 1) {
          // ESC 取消绘制
          await this.drawer.cancelDraw();
          this.updateOperationStatus(cfg.operator.OPERATION_STATUS.UNDO);
          // somethingDone = true;
        }
      }
    }
    // eslint-disable-next-line no-fallthrough
    case cfg.operator.OPERATION_TYPES.EDIT: {
      if (this._operationStatus !== cfg.operator.OPERATION_STATUS.DOING) {
        if (
          (data.downKeys[cfg.board.HOT_KEYS.BACKSPACE] ||
            data.downKeys[cfg.board.HOT_KEYS.DELETE]) &&
          downKeyCount === 1
        ) {
          // 删除标注框
          const calibrationKeys = Object.keys(this._storage.focusCalibrationMap);
          await this._storage.deleteCalibrations({ calibrationKeys });
          // somethingDone = true;
        }
        // if (data.downKeys[cfg.board.HOT_KEYS.CTRL] && data.downKeys[cfg.board.HOT_KEYS.C]) {
        //   // Ctrl + C 复制
        //   this.editor.copy();
        // }
        // if (data.downKeys[cfg.board.HOT_KEYS.CTRL] && data.downKeys[cfg.board.HOT_KEYS.V]) {
        //   // Ctrl + V 粘贴
        //   this.editor.paste();
        // }
      }
    }
  }
  if (somethingDone) {
    // 阻止事件冒泡
    const e = data.event.$event;
    e.preventDefault();
    e.stopPropagation();
    e.returnValue = false;
    e.cancelBubble = false;
  }
};
Operator.prototype.handleKeyUp = function () {};
// 获取最上层元素
Operator.prototype.getUpperElement = function (point) {
  let image = null;
  let imageControl = null;
  let calibration = null;
  let control = null;
  let rotation = null;
  const focusMapEmpty = (Object.keys(this._storage.focusCalibrationMap || {}).length || 0) === 0;
  if (this._operationStatus === cfg.operator.OPERATION_STATUS.DOING) {
    // 如果是正在操作，则默认返回操作中的元素和操作点
    // if (this._storage.image.tailorScope.status === cfg.status.HOVER) {
    //   image = this._storage.image;
    // }
    imageControl = this._storage.hoverImageControl;
    calibration = this._storage.hoverCalibration;
    control = this._storage.hoverControl;
    rotation = this._storage.hoverRotation;
    if (
      this._operationType === cfg.operator.OPERATION_TYPES.EDIT &&
      this.editor._editType === cfg.operator.EDIT_TYPES.DELETE_ANCHOR
    ) {
      const { focusControl } = geometryUtil.isInShape(
        this.editor.cache.calibrations[0],
        point,
        this._canvases.tools
      );
      control = focusControl;
      calibration = this.editor.cache.calibrations[0];
    }
  } else {
    // 校验标注列表-------------------------------------------------------------------------------------------
    // eslint-disable-next-line no-lonely-if
    if (this._operationType === cfg.operator.OPERATION_TYPES.EDIT) {
      for (let i = this._storage.calibrations.length - 1; i >= 0; i--) {
        // 反向依次校验鼠标点位是否在框体内
        const { focus, focusControl, focusRotation } = geometryUtil.isInShape(
          this._storage.calibrations[i],
          point,
          this._canvases.tools
        );
        if (focus && !this._storage.calibrations[i].isHidden) {
          const cal = this._storage.calibrations[i];
          if (!calibration || (!focusMapEmpty && this._storage.focusCalibrationMap[cal.id])) {
            // 如果还没有赋值第一个,或者当前标注框是focus,都可以赋值（其中存在focus框时，循环不会因赋值立刻打破）
            calibration = cal;
          }
        }

        if (focusControl && !this._storage.calibrations[i].isHidden) {
          !control && (control = focusControl);
        }
        if (focusRotation && !this._storage.calibrations[i].isHidden) {
          !rotation && (rotation = focusRotation);
        }
        if (calibration) {
          if (focusMapEmpty) {
            // 没有focus,则返回第一个标注框
            break;
          } else if (
            !focusMapEmpty &&
            this._storage.focusCalibrationMap[calibration.id] &&
            !this._storage.calibrations[i].isHidden
          ) {
            calibration = this._storage.calibrations[i];
            control = focusControl;
            rotation = focusRotation;
            // 有focus,循环到第一个focus的标注框打破,否则循环完以后返回第一次赋值的标注框
            break;
          }
        }
      }
    }
    // 编辑状态不需要考虑是否悬停到底图
  }
  // 校验底图-------------------------------------------------------------------------------------------
  if (this._storage.image) {
    const { focus: imageFocus, focusControl: imageFocusControl } = geometryUtil.isInShape(
      this._storage.image,
      point,
      this._canvases.tools
    );
    // eslint-disable-next-line prefer-destructuring
    imageFocus && (image = this._storage.image);
    if (
      (this.editor._editTypeList.includes(cfg.operator.EDIT_TYPES.ADJUST_IMAGE) ||
        this.editor._editTypeList.includes(cfg.operator.EDIT_TYPES.DRAW_TAILOR)) &&
      imageFocusControl
    ) {
      imageControl = imageFocusControl;
    }
  }
  return { image, imageControl, calibration, control, rotation };
};
// 更新操作事件
Operator.prototype.updateEvents = function (events) {
  this.panel && this.panel.updateEvents(events);
};
// 清除画板
Operator.prototype.cleanCalibrations = function () {
  this._canvases.normal.clearAll();
  this._canvases.focus.clearAll();
};
// 重新渲染底图
Operator.prototype.reRenderImage = function () {
  this._canvases.image.clearAll();
  this._storage.image &&
    this._canvases.image.drawImage(
      this.editor._editTypeList.includes(cfg.operator.EDIT_TYPES.ADJUST_IMAGE) ||
        this.editor._editTypeList.includes(cfg.operator.EDIT_TYPES.DRAW_TAILOR),
      this._storage.image
    );
};
// 重新渲染标注框
Operator.prototype.reRenderCalibrations = function (data) {
  if (!this._storage.calibrations) {
    return;
  }
  const isReRender = typeof data?.isReRender !== 'undefined' ? data.isReRender : true;
  isReRender && this.cleanCalibrations();
  this.renderCalibrations(this._storage.calibrations);
};
// 重新标尺
Operator.prototype.reRenderAxes = function (event) {
  if (!this._storage.axes) {
    return;
  }
  if (
    this._operationTypeList.includes(operator.OPERATION_TYPES.DRAW) ||
    this.editor._editTypeList.includes(cfg.operator.EDIT_TYPES.ADJUST_CALIBRATION) ||
    this.editor._editTypeList.includes(cfg.operator.EDIT_TYPES.DRAW_TAILOR) ||
    this.editor._editTypeList.includes(cfg.operator.EDIT_TYPES.ADJUST_IMAGE)
  ) {
    this._canvases.handle.clearAll();
    this._storage.axes.updatePoint(event);
    this._canvases.handle.drawAxes(this._storage.axes, this._storage._dom.root);
  }
};
// 重新标尺
Operator.prototype.updatePrompt = function ({ code, msg, event, keepTime }) {
  if (!this._storage._dom.prompt) {
    return;
  }
  this._storage._dom.prompt.set({
    text: msg,
    status: code === cfg.observer.CODE.SUCCESS ? cfg.status.NORMAL : cfg.status.ILLEGAL,
    keepTime
  });
  if (msg) {
    this._storage._dom.prompt.setPosition(event?.x || 0, event?.y || 0);
  }
};
// 重新标尺
Operator.prototype.updateCursor = function () {
  let cursor = cfg.board.CURSOR.DEFAULT;
  if (this._operationType === cfg.operator.OPERATION_TYPES.EDIT) {
    cursor = this.editor.getEditCursor({ operationStatus: this._operationStatus });
  }
  if (this._operationType === cfg.operator.OPERATION_TYPES.DRAW) {
    cursor = this.drawer.getDrawCursor();
  }
  this._storage._dom.panel.updateCursor(cursor);
};
// 渲染标注框
Operator.prototype.renderCalibrations = function (calibrations) {
  for (let i = 0; i < calibrations.length; i++) {
    const board =
      calibrations[i].status === cfg.status.NORMAL || calibrations[i].status === cfg.status.HOVER
        ? this._canvases.normal
        : this._canvases.focus;
    // 标注框是否可编辑
    const editable = this.isCalibrationEditable();
    if (!calibrations[i].isProcess) {
      switch (calibrations[i].scope.type) {
        case cfg.calibration.TYPES.RECT:
          board.drawRectObj(calibrations[i], editable);
          break;
        case cfg.calibration.TYPES.POLYGON:
          board.drawPolygonObj(calibrations[i], editable);
          break;
        case cfg.calibration.TYPES.ELLIPSE:
          board.drawEllipseObj(calibrations[i], editable);
          break;
        case cfg.calibration.TYPES.LINE:
          board.drawLineObj(calibrations[i], editable);
          break;
        case cfg.calibration.TYPES.CHAIN:
          board.drawChainObj(calibrations[i], editable);
          break;
        case cfg.calibration.TYPES.ABCHAIN:
          board.drawABChainObj(calibrations[i], editable);
          break;
        case cfg.calibration.TYPES.BACHAIN:
          board.drawBAChainObj(calibrations[i], editable);
          break;
        case cfg.calibration.TYPES.PIXEL:
          board.drawPixelObj(calibrations[i], editable);
          break;
      }
    } else {
      switch (calibrations[i].scope.type) {
        case cfg.calibration.TYPES.RECT:
          board.drawRectProcessObj(calibrations[i]);
          break;
        case cfg.calibration.TYPES.POLYGON:
          board.drawPolygonProcessObj(calibrations[i]);
          break;
        case cfg.calibration.TYPES.LINE:
          board.drawLineProcessObj(calibrations[i]);
          break;
        case cfg.calibration.TYPES.CHAIN:
          board.drawChainProcessObj(calibrations[i]);
          break;
        case cfg.calibration.TYPES.ABCHAIN:
          board.drawABChainProcessObj(calibrations[i]);
          break;
        case cfg.calibration.TYPES.BACHAIN:
          board.drawBAChainProcessObj(calibrations[i]);
          break;
        case cfg.calibration.TYPES.ELLIPSE:
          board.drawEllipseProcessObj(calibrations[i]);
          break;
      }
    }
  }
};
Operator.prototype.getStatuses = function () {
  return {
    operationStatus: this._operationStatus,
    operationType: this._operationType,
    operationTypeList: this._operationTypeList,
    showLabelList: this._storage.showLabelList,
    ...this.drawer.getStatuses(),
    ...this.editor.getStatuses()
  };
};
Operator.prototype.isCalibrationEditable = function () {
  if (this._operationType === cfg.operator.OPERATION_TYPES.DRAW) {
    return false;
  }
  return (
    this._operationTypeList.includes(cfg.operator.OPERATION_TYPES.EDIT) &&
    (this.editor._editTypeList.includes(cfg.operator.EDIT_TYPES.ADJUST_CALIBRATION) ||
      this.editor._editTypeList.includes(cfg.operator.EDIT_TYPES.MOVE_CALIBRATIONS) ||
      this.editor._editTypeList.includes(cfg.operator.EDIT_TYPES.ADD_ANCHOR) ||
      this.editor._editTypeList.includes(cfg.operator.EDIT_TYPES.DELETE_ANCHOR))
  );
};
export default Operator;
