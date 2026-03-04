/*
 * @Description: labelList:
 * @Author: liushijie
 * @Date:2021-11-17 0:10
 * @Last Modified by: liushijie
 * @Last Modified Date:2021-11-17 0:10
 */
import geometryUtil from '../../utils/geometry'
import commonUtil from '../../utils/common'
import cfg from '../../config'
import LabelDom from './labelDom'
import Dom from './dom'
class LabelPointDom extends Dom {
  constructor (params) {
    const { parentDom } = params
    super({ parentDom, element: Dom.create({ parentDom, type: 'div', style: {} }) })
    this.showMaxNum = 3
    this.init(params)
  }
}
LabelPointDom.prototype.init = function (params) {
  const { status, observer, labelKey, labelList, defaultStyle, fixLabel, showLabelList } = params
  this.fixLabel = fixLabel
  this.observer = observer
  this.style = this._formatWrapperStyle(defaultStyle)
  this.updateStyle(this.style.labelPoint || cfg.style.DEFAULT_STYLE.labelPoint)
  this.labelsWrap = new Dom({
    parentDom: this,
    element: Dom.create({ parentDom: this, type: 'div', style: {} })
  })
  this.labelList = this._formatLabelList({ labelList, labelKey })
  this.updateStatus(status)
  this.initEvent()
  this.updateLabelVisible(showLabelList)
}
LabelPointDom.prototype._formatWrapperStyle = function (propStyle) {
  const style = {}
  style.labelPoint = commonUtil.formatObj(
    propStyle?.labelPoint || {},
    cfg.style.DEFAULT_STYLE.labelPoint
  )
  style.labelsWrap = commonUtil.formatObj(
    propStyle?.labelsWrap || {},
    cfg.style.CALIBRATION.labelsWrap
  )
  style.label = commonUtil.formatObj(propStyle?.label || {}, cfg.style.CALIBRATION.label)
  return style
}
LabelPointDom.prototype.initEvent = function () {
  const _this = this
  this.mouseEnter = () => {
    _this.observer && _this.observer.send('mouseEnterLabel')
  }
  this.mouseDown = () => {
    _this.observer && _this.observer.send('mouseDownLabel')
  }
  this.mouseDownDelete = () => {
    _this.showMore.labelSpan.updateText(`更多...(${this.labelList.length - this.showMaxNum})`)
  }
  this.element.addEventListener('mouseenter', this.mouseEnter, { passive: false })
  this.element.addEventListener('mousedown', this.mouseDown, { passive: false })
  this.observer.addListener('mouseDownDelete', { name: 'mouseDownDelete', context: this })
}
LabelPointDom.prototype.removeEvent = function () {
  const _this = this
  this.mouseEnter = () => {
    _this.observer && _this.observer.send('mouseEnterLabel')
  }
  this.mouseDown = () => {
    _this.observer && _this.observer.send('mouseDownLabel')
  }
  this.element.removeEventListener('mouseenter', this.mouseEnter, { passive: false })
  this.element.removeEventListener('mousedown', this.mouseDown, { passive: false })
}
// 更新标签的状态
LabelPointDom.prototype.updateStatus = function (status) {
  if (this.status !== status) {
    this.status = status
    this.updateLabelWrapStyle(status)
    this.updateLabelsStyle(status)
  }
  this.updatePosition()
  this.fixPosition()
  if (this.status === cfg.status.FOCUS) {
    this.element.style.zIndex = 9
    // this.element.style.zIndex = 999999999999999
  }
}
// 更新标签容器的状态样式
LabelPointDom.prototype.updateLabelWrapStyle = function (status) {
  let hasContent = false
  for (let i = 0, len = this.labelList.length; i < len; i++) {
    if (this.labelList[i].text || this.labelList[i].deletable) {
      hasContent = true
      break
    }
  }
  const style = { ...this.style.labelsWrap[status] }
  // 如果没有内容，则不显示整个标签体
  !hasContent && (style.display = 'none')
  this.labelsWrap && this.labelsWrap.updateStyle(style)
}
// 更新标签的状态样式
LabelPointDom.prototype.updateLabelsStyle = async function (status) {
  for (let i = 0, len = this.labelList.length; i < len; i++) {
    this.labelList[i].dom.updateStyle(this.labelList[i].style[status])
    switch (status) {
    case cfg.status.NORMAL: {
      if (i > 2 || !this.labelList[i].text) {
        this.labelList[i].dom.updateStyle({
          display: 'none'
        })
      }
    }
    case cfg.status.ILLEGAL:
    case cfg.status.HOVER: {
      !this.labelList[i].text &&
          this.labelList[i].dom.updateStyle({
            display: 'none'
          })
      this.labelList[i].deletable &&
          this.labelList[i].dom.deleteButton.updateStyle({
            display: 'none'
          })
      break
    }
    case cfg.status.FOCUS: {
      if (
          this.labelList[i]?.dom?.deleteButton?.updateStyle &&
          (this.labelList[i].text || this.labelList[i].deletable)
      ) {
        this.labelList[i].dom.deleteButton.updateStyle({
          display: this.style.label[cfg.status.FOCUS].display
        })
      }
      break
    }
    }
  }
  if (status === cfg.status.NORMAL && this.labelList.length > this.showMaxNum) {
    this.showMore.updateStyle(this.style.label[status])
    this.showMore.updateStyle({
      display: this.style.label[cfg.status.FOCUS].display
    })
  } else {
    this.showMore.updateStyle({
      display: 'none'
    })
  }
}
LabelPointDom.prototype._formatLabelList = function ({ labelList = [], labelKey }) {
  const list = []
  for (let i = 0; i < labelList.length; i++) {
    const label = {}
    label._data = labelList[i]
    label.id =
      typeof labelList[i][labelKey] !== 'undefined' ? labelList[i][labelKey] : geometryUtil.guid()
    label.style = commonUtil.formatObj(labelList[i].style || {}, this.style.label)
    label.text = labelList[i].text
    label.confidence = labelList[i].confidence ? labelList[i].confidence : ''
    label.deletable = typeof labelList[i].deletable === 'undefined' ? true : labelList[i].deletable
    // 生成无样式的标签DOM
    label.dom = new LabelDom({
      observer: this.observer,
      parentDom: this.labelsWrap,
      deletable: label.deletable,
      text: label.text,
      confidence: label.confidence,
      id: label.id
    })
    list.push(label)
  }
  this.showMore = new LabelDom({
    observer: this.observer,
    parentDom: this.labelsWrap,
    deletable: false
  })
  this.showMore.labelSpan.updateText(`更多...(${list.length - this.showMaxNum})`)
  return list
}
LabelPointDom.prototype.updateLabelPoint = function (labelPoint) {
  if (
    !this.labelPoint ||
    this.labelPoint.x !== labelPoint.x ||
    this.labelPoint.y !== labelPoint.y
  ) {
    this.labelPoint = labelPoint
    this.updateStyle({
      left: `${labelPoint.x}px`,
      top: `${labelPoint.y}px`
    })
    this.fixPosition()
  }
}
LabelPointDom.prototype.updateLabelVisible = function (visible) {
  this.visible = visible
  this.fixPosition()
  this.fixPosition()
}
LabelPointDom.prototype.fixPosition = function () {
  let labelPointStyle = { ...this.style.labelPoint }
  if (this.fixLabel) {
    if (Math.round(this.left + this.width) > Math.round(this.parentDom.width)) {
      // 超出宽，反左
      labelPointStyle = { ...labelPointStyle, ...cfg.style.DEFAULT_STYLE.labelPointReverse }
      for (const key of Object.keys(this.style.labelsWrap)) {
        this.style.labelsWrap[key].alignItems = 'flex-end'
      }
      this.updateLabelWrapStyle(this.status)
    } else {
      // 否则恢复
      for (const key of Object.keys(this.style.labelsWrap)) {
        this.style.labelsWrap[key].alignItems = cfg.style.CALIBRATION.labelsWrap[key].alignItems
      }
      this.updateLabelWrapStyle(this.status)
    }
    if (Math.round(this.top - this.height) < 0) {
      // 超出高，向下
      labelPointStyle = { ...labelPointStyle, ...cfg.style.DEFAULT_STYLE.labelPointDown }
    }
    if (!this.visible) {
      labelPointStyle.display = 'none'
    }
  }
  this.updateStyle(labelPointStyle)
}
LabelPointDom.prototype.updatePosition = function () {
  if (!this.visible) {
    return
  }
  this.left = this.element.offsetLeft
  this.top = this.element.offsetTop
  let marginY = Number((this.labelsWrap?.element?.style?.marginTop || '').split('px')?.[0])
  if (typeof marginY !== 'number' || isNaN(marginY)) {
    marginY = 0
  }
  this.width = this.labelsWrap?.element?.offsetWidth || 0
  this.height = (this.labelsWrap?.element?.offsetHeight || 0) + marginY
}
LabelPointDom.prototype.delete = function () {
  this.observer = null
  this.style = null
  this.labelsWrap.element.remove()
  this.element.remove()
  this.removeEvent()
}
LabelPointDom.prototype._unFormatLabelList = function () {
  return this.labelList.map(label => {
    const item = { ...label._data, ...label }
    delete item.dom
    delete item._data
    return item
  })
}
export default LabelPointDom
