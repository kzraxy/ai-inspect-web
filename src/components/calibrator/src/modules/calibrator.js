/* eslint-disable prefer-destructuring */
/*
 * @Description: painter:
 * @Author: liushijie
 * @Date:2021-09-08 17:28
 * @Last Modified by: liushijie
 * @Last Modified Date:2021-09-08 17:28
 */
import cfg from '../config'
import Operator from './operator/operator'
import ImageObj from './canvasObj/image'
import Axes from './canvasObj/axes/axes'
import Calibration from './canvasObj/calibration'
import Prompt from './canvasObj/prompt/prompt'
import commonUtil from '../utils/common'
import Dom from './dom/dom'
import Storage from './storage/storage'
import PanelDom from './dom/panelDom'
import PaintDom from './dom/paintDom'
import LoadingDom from './dom/loadingDom'
import Observer from './observer/observer'

class Calibrator {
  /*
   * 构造函数
   * @param rootDom // 组件加载的容器ID
   * @param image // 底图,默认为空
   * @param calibrationList // 标注列表,默认为[]
   * @param operationTypeList //  可用操作列表 'draw':绘制 'edit':编辑 'tailor':裁剪
   * @param operationType // 默认操作,默认为绘制
   * @param drawTypeList // 可用画笔类型列表 'rect':矩形 'polygon':多边形 'ellipse':圆 'line': 线 'pixel':像素,默认为全部 'chain': 双向方向线 'abchain': A to B方向线 'bachain': B to A方向线 
   * @param drawType // 默认画笔类型,默认为矩形
   * @param defaultStyle // 全局性样式,默认为默认样式
   * @param calibrationKey  // 标注的唯一键名，默认为'id'
   * @param indexKey  // 标注的层级键名，默认为'id'
   * @param layoutMode  // 底图默认布局模式 'cover':铺满 'fix':撑满,默认为撑满
   * @param hotKeyDisableList  // 禁用的快捷键列表,默认为[]
   * @param callback // 鼠标/键盘事件回调,默认为空方法
   * */
  constructor (data) {
    this.loading = this.$init(data)
    // 初始化逻辑层
  }
}
// 初始化回调函数
Calibrator.prototype._initCallback = function (callback) {
  for (const name in callback) {
    const { func, context } = callback[name]
    this._observer.addListener(cfg.callback.CALLBACK_MAP[name], { func, name, context })
  }
  // this._observer.write('', 'handle');
}
// 初始化视图层
Calibrator.prototype._initDom = function ({ rootDom, background, hotKeyDisableList }) {
  // 初始化视图层
  this._dom.root = new Dom({
    element: Dom.create({
      parentDom: new Dom({ element: rootDom }),
      background: `url(${background})`,
      type: 'div'
    })
  })
  const parentDom = this._dom.root
  this._dom.canvases = {
    tools: new PaintDom({ parentDom, style: { opacity: 0 } }),
    image: new PaintDom({ parentDom }),
    normal: new PaintDom({ parentDom }),
    focus: new PaintDom({ parentDom }),
    handle: new PaintDom({ parentDom })
  }
  this._dom.panel = new PanelDom({ parentDom: this._dom.root, hotKeyDisableList })
  this._dom.prompt = new Prompt({ parentDom: this._dom.root }) // 文字提示对象
  this._dom.loading = new LoadingDom({
    parentDom: this._dom.root
  }) // 文字提示对象
}
// 更新视图层
Calibrator.prototype._updateDom = function () {
  // 初始化视图层
  this._dom.root.updatePosition()
  this._dom.canvases.tools.updatePosition()
  this._dom.canvases.image.updatePosition()
  this._dom.canvases.normal.updatePosition()
  this._dom.canvases.focus.updatePosition()
  this._dom.canvases.handle.updatePosition()
  this._dom.panel.updatePosition()
}
// 初始化操作者
Calibrator.prototype._initOperator = function (params) {
  const {
    operationTypeList,
    operationType,
    editTypeList,
    drawTypeList,
    drawType,
    limitCalibrations
  } = params
  this._operator.setStorage({ storage: this._storage })
  this._operator.setCanvases({ canvases: this._dom.canvases })
  this._operator.setLimit({ limitCalibrations })
  this._operator.updateOperationTypeList({ operationTypeList })
  this._operator.updateOperationType({ operationType })
  this._operator.drawer.updateDrawTypeList({ drawTypeList })
  this._operator.drawer.updateDrawType({ drawType })
  this._operator.editor.updateEditTypeList({ editTypeList })
}
// 初始化观察者
Calibrator.prototype._initObserver = function () {
  // 初始化视图层
  this._storage.setObserver(this._observer)
  this._dom.panel.setObserver(this._observer)
  this._dom.canvases.image.setObserver(this._observer)
  this._dom.canvases.normal.setObserver(this._observer)
  this._dom.canvases.focus.setObserver(this._observer)
  this._dom.canvases.handle.setObserver(this._observer)
  this._operator.setObserver(this._observer)
}
// 初始化数据层
Calibrator.prototype._initStorage = async function (params) {
  const {
    calibrationKey,
    indexKey,
    labelKey,
    image,
    calibrationList,
    fixLabel,
    style,
    showLabelList
  } = params
  this._storage.setKeys(calibrationKey, indexKey, labelKey, fixLabel, showLabelList)
  this._storage.setDom(this._dom)
  // 生成底图
  this._dom.loading.open()
  const img = await ImageObj.getObj({ image, defaultStyle: style.IMAGE, ...this._dom.root })
  // 更新底图
  await this._storage.updateImage(img)

  this._dom.loading.close()

  // 生成标注列表
  const calibrations = this._getObjects({
    calibrationList,
    image: img
  })
  // 更新标注列表

  await this._storage.updateCalibrations({ calibrations })

  // 生成标尺对象
  const axes = new Axes()
  // 更新标尺
  await this._storage.updateAxes(axes)
}
// 生成标注列表
Calibrator.prototype._getObjects = function (params) {
  const { calibrationList, image } = params
  // 生成标注列表渲染数据
  const calibrations = []
  const index = this._storage?.calibrations?.length || 0
  for (let i = 0; i < calibrationList.length; i++) {
    // 创建标注对象
    const cal = Calibration.getObj({
      calibrationKey: this._storage._calibrationKey,
      labelKey: this._storage._labelKey,
      indexKey: this._storage._indexKey,
      parentDom: this._dom.root,
      data: calibrationList[i],
      storage: this._storage,
      index: i + index,
      image
    })

    calibrations.push(cal)
  }
  return calibrations
}
// 初始化
Calibrator.prototype.$init = async function (data) {
  const {
    rootDom,
    indexKey,
    labelKey,
    calibrationKey,
    image = {},
    defaultStyle = {},
    calibrationList = [],
    background = require('../assets/img_32_bg.png'),
    hotKeyDisableList,
    callback,
    fixLabel,
    showLabelList = true,
    ...params
  } = data
  this._defaultStyle = {}
  this._dom = {}
  this._storage = new Storage()
  this._operator = new Operator()
  this._observer = new Observer()
  // 初始化全局基础样式，上层style是下层的defaultStyle入参
  this._defaultStyle = commonUtil.formatObj(defaultStyle, cfg.style)
  // 初始化视图层
  this._initDom({ rootDom, background, hotKeyDisableList })
  // 初始化观察者
  this._initObserver()
  // 初始化回调
  this._initCallback(callback)
  // 初始化操作者
  this._initOperator({ ...params })
  // 初始化数据层

  await this._initStorage({
    showLabelList,
    style: this._defaultStyle,
    calibrationList,
    calibrationKey,
    indexKey,
    labelKey,
    fixLabel,
    image
  })
}
// 更新底图
Calibrator.prototype.$updateImage = async function (data) {
  const { image } = data
  const defaultStyle = this._defaultStyle.IMAGE
  // const imageObj = await ImageObj.getObj({ image, defaultStyle, ...this._dom.root })
  // await this._storage.updateImage(imageObj)
  try {
    const imageObj = await ImageObj.getObj({ image, defaultStyle, ...this._dom.root })
    await this._storage.updateImage(imageObj)
  } catch (error) {
    console.error(error)
  } finally {
    // 确保 loading 被关闭
    this._dom.loading.close()
  }
}
// 更新裁剪区域
Calibrator.prototype.$updateTailorScope = async function (data) {
  await this._operator.editor.updateTailorScope({
    image: data,
    defaultStyle: this._defaultStyle.IMAGE
  })
}

Calibrator.prototype.$clearTailorScope = async function () {
  await this._operator.editor.clearTailorScope()
}

// 隐藏or展示标注列表
Calibrator.prototype.$updateCalibrationsVisible = async function (data) {
  await this._storage.updateCalibrationsVisible(data)
}

// 刪除标注列表
Calibrator.prototype.$deleteCalibrations = async function (data) {
  if (this._operator._operationStatus === cfg.operator.OPERATION_STATUS.DOING) {
    let operationId = ''
    switch (this._operator._operationType) {
    case cfg.operator.OPERATION_TYPES.DRAW:
      operationId = this._operator?.drawer?.cache?.calibration?.id
      if ((data?.calibrationKeys || []).includes(operationId)) {
        await this._operator.drawer.resetCache()
        this._operator.updateOperationStatus(cfg.operator.OPERATION_STATUS.UNDO)
      }
      break
    case cfg.operator.OPERATION_TYPES.EDIT:
      operationId = this._operator?.editor?.cache?.calibration?.id
      if ((data?.calibrationKeys || []).includes(operationId)) {
        await this._operator.editor.resetCache()
        this._operator.updateOperationStatus(cfg.operator.OPERATION_STATUS.UNDO)
      }
      break
    }
  }
  await this._storage.deleteCalibrations(data)
}
// 模拟键盘点击事件
Calibrator.prototype.$triggerKeyboard = async function (data) {
  this._operator.handleKeyDown(data)
}
// 更新标注列表
Calibrator.prototype.$updateCalibrations = async function (data) {
  const { calibrationList, isMerge = false } = data

  const calibrations = this._getObjects({
    image: this._storage.image,
    calibrationList
  })

  await this._storage.updateCalibrations({ calibrations, isMerge })
}
// 更新标注列表层级
Calibrator.prototype.$updateCalibrationsIndex = async function ({ calibrationList }) {
  for (let i = 0; i < calibrationList.length; i++) {
    for (let k = 0; k < this._storage.calibrations.length; k++) {
      if (this._storage.calibrations[k].id === calibrationList[i][this._storage._calibrationKey]) {
        if (
          typeof this._storage._indexKey === 'undefined' ||
          typeof calibrationList[i][this._storage._indexKey] === 'undefined'
        ) {
          this._storage.calibrations[k].index = i
        } else {
          this._storage.calibrations[k].index = calibrationList[i][this._storage._indexKey]
        }
      }
    }
  }
  this._storage.calibrations = commonUtil.sort(this._storage.calibrations, 'index')
  await this._observer.send('calibrations:changed')
}
// 更新标注框标签显隐
Calibrator.prototype.$updateCalibrationsLabelVisible = async function (params) {
  this._storage.updateCalibrationsLabelVisible(params)
}
// 更新标注列表选中状态
Calibrator.prototype.$updateFocusCalibrations = async function ({ calibrationKeys }) {
  const calibrationsMap = {}
  for (let i = 0, len = this._storage.calibrations.length; i < len; i++) {
    for (let k = 0, length = calibrationKeys.length; k < length; k++) {
      if (calibrationKeys[k] === this._storage.calibrations[i].id) {
        calibrationsMap[calibrationKeys[k]] = this._storage.calibrations[i]
        break
      }
    }
  }
  await this._storage.updateFocusCalibrations({ calibrationsMap })
}
// 更新标注列表选中状态
Calibrator.prototype.$updateHoverCalibration = async function ({ calibrationKey }) {
  let calibration = null
  for (let i = 0, len = this._storage.calibrations.length; i < len; i++) {
    if (calibrationKey === this._storage.calibrations[i].id) {
      calibration = this._storage.calibrations[i]
      break
    }
  }
  await this._storage.updateHoverCalibration({ image: this._storage.image, calibration })
}
// 更新可用操作列表
Calibrator.prototype.$updateOperationTypeList = function ({ operationTypeList }) {
  this._operator.updateOperationTypeList({ operationTypeList })
}
// 更新操作
Calibrator.prototype.$updateOperationType = function ({ operationType }) {
  this._operator && this._operator.updateOperationType({ operationType })
}
// 更新可用画笔类型
Calibrator.prototype.$updateDrawTypeList = function ({ drawTypeList }) {
  this._operator && this._operator.drawer.updateDrawTypeList({ drawTypeList })
}
// 更新可用编辑类型
Calibrator.prototype.$updateEditTypeList = function ({ editTypeList }) {
  this._operator && this._operator.editor.updateEditTypeList({ editTypeList })
}
// 更新画笔
Calibrator.prototype.$updateDrawType = function ({ drawType }) {
  this._operator && this._operator.drawer.updateDrawType({ drawType })
}
// 更新画笔宽度
Calibrator.prototype.$updatePenWidth = function (params) {
  return this._operator.drawer && this._operator.drawer.updatePenWidth(params)
}
// 更新标注框粗细
Calibrator.prototype.$updateBorderWidth = function ({ borderWidth }) {
  return this._operator.drawer && this._operator.drawer.updateBorderWidth({ borderWidth })
}
// 更新底图旋转角度
Calibrator.prototype.$rotateImage = async function ({ angle }) {
  if (!this._storage.getIsImageLoaded()) {
    return
  }
  // 缩放
  const defaultStyle = this._defaultStyle.IMAGE
  await this._operator.handleRotateImageOperation({ defaultStyle, ...this._dom, angle })
}
// 更新缩放
Calibrator.prototype.$enlarge = async function ({ ratio: newRatio, point }) {
  if (!this._storage.getIsImageLoaded()) {
    return
  }
  // 缩放
  await this._operator.handleEnlargeOperation({
    oldRatio: this._storage.image.scope.ratio,
    ...this._storage.image.scope,
    newRatio,
    point
  })
}
// 更新复位
Calibrator.prototype.$reset = async function () {
  if (!this._storage.getIsImageLoaded()) {
    return
  }
  if (this._operator._operationStatus === cfg.operator.OPERATION_STATUS.DOING) {
    switch (this._operator._operationType) {
    case cfg.operator.OPERATION_TYPES.DRAW:
      break
    case cfg.operator.OPERATION_TYPES.EDIT:
      await this._operator.editor.finishEdit()
      this._operator.updateOperationStatus(cfg.operator.OPERATION_STATUS.UNDO)
      break
    }
  }
  this._updateDom()
  // 复位DOM
  await this._operator.handleResetOperation()
}
// 获取组件状态
Calibrator.prototype.$getStatuses = function () {
  return this._operator.getStatuses()
}
// 获取底图位置信息
Calibrator.prototype.$getImageScope = function () {
  return this._storage.image && this._storage.image.unFormatImageScope()
}
// 获取裁剪信息
Calibrator.prototype.$getTailorScope = function () {
  return this._storage.image && this._storage.image.unFormatTailorScope()
}
// 获取标注框列表
Calibrator.prototype.$getCalibrations = function (calibrationKeys) {
  const calibrations = []

  for (let i = 0; i < this._storage.calibrations.length; i++) {
    if (!calibrationKeys?.length || calibrationKeys.includes(this._storage.calibrations[i].id)) {
      calibrations.push(
        this._storage.calibrations[i].unFormat(
          this._storage.image,
          this._storage._calibrationKey,
          this._storage._indexKey
        )
      )
    }
  }
  return { calibrations }
}
// 根据状态获取标注框列表
Calibrator.prototype.$getCalibrationsByStatus = function ({ status }) {
  const calibrations = []
  for (let i = 0; i < this._storage.calibrations.length; i++) {
    if (this._storage.calibrations[i].status === status) {
      calibrations.push(
        this._storage.calibrations[i].unFormat(
          this._storage.image,
          this._storage._calibrationKey,
          this._storage._indexKey
        )
      )
    }
  }

  return { calibrations }
}
// 获取标注框裁剪出来的图像
Calibrator.prototype.$getImageInCalibration = function ({ calibrationKey }) {
  // 获取目标标注框
  let calibration = null
  const image = this._storage.image
  for (let i = 0, len = this._storage.calibrations.length; i < len; i++) {
    if (this._storage.calibrations[i].id === calibrationKey) {
      calibration = this._storage.calibrations[i]
    }
  }
  // 获取标注框的上下左右
  let left = Number.MAX_SAFE_INTEGER
  let top = Number.MAX_SAFE_INTEGER
  let right = Number.MIN_SAFE_INTEGER
  let bottom = Number.MIN_SAFE_INTEGER
  calibration.scope.coordinates.forEach(co => {
    left = Math.min(left, co.x)
    top = Math.min(top, co.y)
    right = Math.max(right, co.x)
    bottom = Math.max(bottom, co.y)
  })
  // 获取相对坐标的上、左、宽、高
  const leftReal = (left - image.scope.basePoint.x) / image.scope.ratio
  const topReal = (top - image.scope.basePoint.y) / image.scope.ratio
  const widthReal = (right - left) / image.scope.ratio
  const heightReal = (bottom - top) / image.scope.ratio
  // 创建和裁剪框同尺寸的canvas
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  canvas.width = widthReal
  canvas.height = heightReal
  canvas.style.width = `${widthReal}px`
  canvas.style.height = `${heightReal}px`
  // 将标注框左边转为相对坐标
  const coordinates = calibration.scope.coordinates.map(co => ({
    x: (co.x - left) / image.scope.ratio,
    y: (co.y - top) / image.scope.ratio
  }))
  ctx.beginPath()
  ctx.moveTo(coordinates[0].x, coordinates[0].y)
  for (let i = 1; i < coordinates.length; i++) {
    ctx.lineTo(coordinates[i].x, coordinates[i].y)
  }
  ctx.strokeStyle = cfg.style.CALIBRATION.shape[cfg.status.NORMAL].borderColor
  ctx.closePath()
  ctx.stroke()
  ctx.clip()
  ctx.drawImage(
    image.imageObj,
    0,
    0,
    image.imageObj.width,
    image.imageObj.height,
    -leftReal,
    -topReal,
    image.imageObj.width,
    image.imageObj.height
  )
  return {
    url: canvas.toDataURL(),
    clipWidth: widthReal,
    clipHeight: heightReal
  }
}
// 销毁组件
Calibrator.prototype.$destroyed = function () {
  const { prompt, root, panel, canvases } = this._dom
  this._dom.panel.removeListener()
  this._destroyDom([prompt, panel, root, ...Object.values(canvases)])
}
Calibrator.prototype._destroyDom = function (domList) {
  for (let i = 0, len = domList.length; i < len; i++) {
    domList[i].element.remove()
  }
}
export default Calibrator
