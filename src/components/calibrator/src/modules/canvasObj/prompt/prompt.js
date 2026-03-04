/*
 * @Description: prompt:
 * @Author: liushijie
 * @Date:2021-10-29 15:12
 * @Last Modified by: liushijie
 * @Last Modified Date:2021-10-29 15:12
 */
import cfg from '../../../config'
import Dom from '../../dom/dom'
class Prompt extends Dom {
  constructor ({ parentDom, text, status, confidence }) {
    const style = {}
    super({ element: Dom.create({ type: 'span', parentDom, style }) })

    this.status = cfg.status.NORMAL
    this.style = cfg.style.PROMPT
    this.parentDom = parentDom
    this.keep = false // 是否保持中
    this.set({ text, status, confidence })
    this.setPosition(0, 0)
  }
}
Prompt.prototype.set = function ({ text, status, keepTime = 0, confidence }) {
  if (this.keep) {
    return
  }
  this.keep = true
  this.keep = setTimeout(() => {
    this.keep = false
  }, keepTime * 1000)
  this.setText(text, keepTime, confidence)
  this.setStatus(status)
}
Prompt.prototype.setText = function (text = '', confidence = '') {
  if (text !== this.text) {
    this.text = text ?? ''
    this.confidence = confidence ?? ''
    this.element.textContent = text
  }
}
Prompt.prototype.setStatus = function (status = cfg.style.NORMAL) {
  if (status !== this.status) {
    this.status = status
    const style = this.style[status]
    this.setStyle(style)
  }
}
Prompt.prototype.setPosition = function (x, y) {
  if (x !== this.left) {
    this.left = x
    this.element.style.left = `${x + 20}px`
  }
  if (y !== this.top) {
    this.top = y
    this.element.style.top = `${y + 20}px`
  }
}
export default Prompt
