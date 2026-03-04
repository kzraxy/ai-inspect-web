/*
 * @Description: calibration:
 * @Author: liushijie
 * @Date:2021-09-13 11:23
 * @Last Modified by: liushijie
 * @Last Modified Date:2021-09-13 11:23
 */
import cfg from '../../../config'
import commonUtil from '../../../utils/common'
import geometryUtil from '../../../utils/geometry'
import LabelDom from '../../dom/labelPointDom'
import Observer from '../../observer/observer'
class Calibration {
  constructor (params) {
    const { data, image, calibrationKey, indexKey, labelKey, index, parentDom, storage } = params
    this._data = data // 原始数据
    this.id = this._formatId(data, calibrationKey) // 标注框唯一标志
    this.index = this._formatIndex(data, indexKey, index) // 标注层级标识
    this.status = this._formatStatus(data) // 标注状态
    this.deletable = typeof data.deletable !== 'undefined' ? data.deletable : true // 标注框是否允许删除
    this.style = this._formatStyle(data.style) // 样式表
    this.isHidden = false // 是否隐藏标注框
    // 试试看是不是这样
    // this.style = this._formatStyle({
    //   shape: { focus: { borderWidth: 1, color: 'rgba(48,143,240,0.3)' } }
    // });

    this._storage = storage
    this._initChildObserver()
    // 标注标签

    this.labelListDom = new LabelDom({
      fixLabel: storage.fixLabel,
      showLabelList: storage.showLabelList,
      observer: this.childObserver,
      labelList: data.labelList,
      defaultStyle: this.style,
      status: this.status,
      parentDom,
      labelKey
    })
    this.format && (this.scope = this.format({ ...data.scope, image })) // 标注图形
    this.updateLabelPoint && this.updateLabelPoint()
  }
}
Calibration.prototype.updateLabelVisible = function (visible) {
  const isVisible = !this.isHidden && visible
  this.labelListDom.updateLabelVisible(isVisible)
}
Calibration.prototype._initChildObserver = function () {
  this.childObserver = new Observer()
  const _this = this
  this.mouseHover = async () => {
    await _this._storage.updateHoverCalibration({ calibration: this })
  }
  this.mouseFocus = async () => {
    await _this._storage.updateFocusCalibrations({
      calibrationsMap: {
        [this.id]: this
      }
    })
  }
  this.mouseDownDelete = async label => {
    await _this._storage.deleteCalibrationLabels({
      calibrationKey: _this.id,
      labelIds: [label.id]
    })
  }
  this.childObserver.addListener('mouseEnterLabel', { name: 'mouseHover', context: this })
  this.childObserver.addListener('mouseDownLabel', { name: 'mouseFocus', context: this })
  this.childObserver.addListener('mouseDownDelete', { name: 'mouseDownDelete', context: this })
}
Calibration.prototype._formatId = function (data, calibrationKey) {
  return typeof data[calibrationKey] !== 'undefined' ? data[calibrationKey] : geometryUtil.guid()
}
Calibration.prototype._formatIndex = function (data, indexKey, index) {
  return typeof data[indexKey] !== 'undefined' ? data[indexKey] : index
}
Calibration.prototype._formatStatus = function (data) {
  return data.status || cfg.status.NORMAL
}
Calibration.prototype._formatStyle = function (style = {}) {
  return commonUtil.formatObj(style, cfg.style.CALIBRATION)
}
Calibration.prototype.copy = function (params) {
  const { parentDom, storage, calibrationKey, indexKey, labelKey, index, image } = params
  const data = {
    id: geometryUtil.guid(),
    index,
    status: this.status,
    style: commonUtil.copy(this.style),
    labelListDom: this.labelListDom.copy(),
    scope: {
      type: this.scope.type
    }
  }
  const obj = Calibration.getObj({
    parentDom,
    storage,
    calibrationKey,
    indexKey,
    labelKey,
    index,
    data,
    image
  })
  const scope = this.getScope()
  obj.setScope(scope)
  return obj
}
Calibration.prototype.delete = function () {
  this.childObserver = null
  this._storage = null
  this.labelListDom.delete()
  this.labelListDom.delete()
}
// 更新标注框的隐藏状态：隐藏/展示
Calibration.prototype.updateCalibrationVisible = function (visible) {
  this.isHidden = !visible
  this.updateLabelVisible(visible)
}
Calibration.prototype.moveControlsAndCoordinates = function (distX, distY) {
  // 更新控制点位置
  if (this.scope.controls) {
    for (let i = 0; i < this.scope.controls.length; i++) {
      this.scope.controls[i].point.x += distX
      this.scope.controls[i].point.y += distY
    }
  }
  // 更新标注范围坐标
  if (this.scope.coordinates) {
    for (let i = 0; i < this.scope.coordinates.length; i++) {
      this.scope.coordinates[i].x += distX
      this.scope.coordinates[i].y += distY
    }
  }
}
Calibration.prototype.getExternal = function () {
  return this.scope.coordinates
}
Calibration.prototype.updateLabelPoint = function () {
  if (this.scope?.controls) {
    this.labelPoint = geometryUtil.getLeftTop((this.scope?.controls || []).map(con => con.point))
    this.labelListDom && this.labelListDom.updateLabelPoint(this.labelPoint)
  }
}
Calibration.prototype.updateStatus = function (status) {
  if (this.status !== status) {
    this.status = status
    this.labelListDom.updateStatus(status)
  }
}
export default Calibration
