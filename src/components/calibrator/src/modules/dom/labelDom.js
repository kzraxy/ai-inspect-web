/*
 * @Description: index:
 * @Author: liushijie
 * @Date:2021-10-19 14:10
 * @Last Modified by: liushijie
 * @Last Modified Date:2021-10-19 14:10
 */
import Dom from './dom'
import cfg from '../../config'
class LabelDom extends Dom {
  constructor ({ parentDom, text, observer, deletable, id, confidence }) {
    super({
      element: Dom.create({ parentDom, type: 'div', style: {} }),
      parentDom
    })
    this.observer = observer
    this.id = id
    this.labelSpan = new Dom({
      element: Dom.create({
        style: cfg.style.DEFAULT_STYLE.labelSpan,
        parentDom: this,
        type: 'span',
        text,
        confidence
      }),
      parentDom: this
    })
    this.labelSpan.element.title = confidence ? (text + confidence): text
    if (deletable) {
      this.deleteButton = new Dom({
        element: Dom.create({
          parentDom: this,
          type: 'img',
          style: cfg.style.DEFAULT_STYLE.labelDelete
        }),
        parentDom: this
      })
      this.deleteButton.element.src = cfg.calibration.DELETE_ICON
      this.initEvent()
    }
  }
}
LabelDom.prototype.initEvent = function () {
  const _this = this
  this.mouseDown = () => {
    _this.observer.send('mouseDownDelete', _this)
  }
  this.deleteButton.element.addEventListener('mousedown', this.mouseDown, { passive: false })
}
LabelDom.prototype.delete = function () {
  this.element.remove()
}
export default LabelDom
