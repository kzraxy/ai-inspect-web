/*
 * @Description: Dom:
 * @Author: liushijie
 * @Date:2021-10-18 16:26
 * @Last Modified by: liushijie
 * @Last Modified Date:2021-10-18 16:26
 */
class Dom {
  constructor ({ element, parentDom }) {
    this.element = element
    parentDom && (this.parentDom = parentDom)
    this.element.onselectstart = function () {
      return false // 禁止文本选中
    }
    this.updatePosition()
  }
}
Dom.prototype.setObserver = function (observer) {
  this.observer = observer
}
Dom.prototype.updatePosition = function () {
  this.width = this.element.clientWidth
  this.height = this.element.clientHeight
  this.left = this.element.offsetLeft
  this.top = this.element.offsetTop
  if (this.updateContext) {
    this.updateContext()
  }
}
Dom.prototype.setStyle = function (style) {
  for (const key in style) {
    this.element.style[key] = style[key]
  }
}
Dom.create = function ({ type = 'div', parentDom, text, background, style, confidence }) {
  const element = document.createElement(type)
  if (typeof text === 'string') {
    this.text = text
    element.textContent = text
  }
  if (typeof confidence === 'string') {
    this.confidence = confidence
  }
  if (typeof parentDom.element === 'object') {
    parentDom.element.appendChild(element)
  }
  element.style = {}
  if (typeof background === 'string') {
    element.style.background = background
  }
  if (!style) {
    element.style.width = '100%'
    element.style.height = '100%'
    element.style.position = 'absolute'
    element.style.left = '0'
    element.style.right = '0'
    element.style.top = '0'
    element.style.bottom = '0'
    element.style.margin = '0'
    element.style.padding = '0'
  } else {
    Object.keys(style).forEach(key => {
      element.style[key] = style[key]
    })
  }
  return element
}
Dom.prototype.updateStyle = function (style) {
  const keys = Object.keys(style)
  for (let i = 0, len = keys.length; i < len; i++) {
    this.element.style[keys[i]] = style[keys[i]]
  }
  if (
    typeof style.left !== 'undefined' ||
    typeof style.top !== 'undefined' ||
    typeof style.display !== 'undefined' ||
    typeof style.position !== 'undefined' ||
    typeof style.width !== 'undefined' ||
    typeof style.height !== 'undefined' ||
    typeof style.maxWidth !== 'undefined' ||
    typeof style.maxHeight !== 'undefined'
  ) {
    this.updatePosition()
  }
}
Dom.prototype.updateText = function (text, confidence) {
  if (this.text !== text) {
    this.text = text
    this.confidence = confidence
    this.element.textContent = text
  }
}
export default Dom
