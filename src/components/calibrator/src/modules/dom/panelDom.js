/*
 * @Description: paintBoard:
 * @Author: liushijie
 * @Date:2021-09-13 11:23
 * @Last Modified by: liushijie
 * @Last Modified Date:2021-09-13 11:23
 */
import config from '../../config';
import Dom from './dom';
class PanelDom extends Dom {
  constructor({ parentDom, hotKeyDisableList }) {
    super({ parentDom, element: Dom.create({ parentDom }) });
    this.init({ hotKeyDisableList });
  }
}
PanelDom.prototype.init = function({ hotKeyDisableList = [] }) {
  this.element.tabIndex = '1'; // 设置tabIndex使操作面板可以获得焦点
  this.element.style.outline = 'none'; // 禁用outline，避免获得焦点时视觉不对
  this.THROTTLE_TIME = config.board.THROTTLE_TIME; // 防抖、节流
  this.isThrottle = false; // 防抖、节流参数
  this.areaActive = false; // 热区是否激活（鼠标是否在区域内）
  this.mouseIsDown = false; // 鼠标是否在区域内按下
  this.downKeys = {}; // 已按下按键列表
  this._observer = null; // 已按下按键列表
  this._left = 0; // 已按下按键列表
  this._top = 0; // 已按下按键列表
  // 可用配置 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  this.updateHotKeyDisableList({ hotKeyDisableList });
  this.initListener();
  this.updatePosition();
};
PanelDom.prototype.getMouseEvent = function(e) {
  const event = window.event || e;
  const value = event.button;
  const { screenX, screenY, clientX, clientY, offsetX, offsetY } = event;
  const x = offsetX;
  const y = offsetY;
  return {
    x,
    y,
    screenX,
    screenY,
    clientX,
    clientY,
    isLeft: value !== 2 && value !== 3,
    $event: event
  };
};
PanelDom.prototype.getKeyboardEvent = function(e) {
  return {
    $event: e
  };
};
PanelDom.prototype.setObserver = function(observer) {
  this._observer = observer;
};
PanelDom.prototype.updateCursor = function(cursor) {
  this.updateStyle({
    cursor
  });
};
PanelDom.prototype.initListener = function() {
  this.removeListener();
  const _this = this;
  this.mouseMove = (...params) => {
    this.handleMouseMove.call(_this, ...params);
  };
  this.contextMenu = (...params) => {
    this.handleContextMenu.call(_this, ...params);
  };
  this.mouseDown = (...params) => {
    this.handleMouseDown.call(_this, ...params);
  };
  this.mouseDoubleClick = (...params) => {
    this.handleMouseDoubleClick.call(_this, ...params);
  };
  this.mouseUp = (...params) => {
    this.handleMouseUp.call(_this, ...params);
  };
  this.mouseMove = (...params) => {
    this.handleMouseMove.call(_this, ...params);
  };
  this.mouseWheel = (...params) => {
    this.handleMouseWheel.call(_this, ...params);
  };
  this.keyDown = (...params) => {
    this.handleKeyDown.call(_this, ...params);
  };
  this.keyUp = (...params) => {
    this.handleKeyUp.call(_this, ...params);
  };
  this.mouseLeave = (...params) => {
    this.handleMouseLeave.call(_this, ...params);
  };
  this.mouseEnter = (...params) => {
    this.handleMouseEnter.call(_this, ...params);
  };
  window.addEventListener('contextmenu', this.contextMenu, { passive: false });
  window.addEventListener('mousedown', this.mouseDown, { passive: false });
  window.addEventListener('dblclick', this.mouseDoubleClick, { passive: false });
  window.addEventListener('mouseup', this.mouseUp, { passive: false });
  window.addEventListener('mousemove', this.mouseMove, { passive: false });
  window.addEventListener('wheel', this.mouseWheel, { passive: false });
  this.element.addEventListener('keydown', this.keyDown);
  this.element.addEventListener('keyup', this.keyUp);
  this.element.addEventListener('mouseleave', this.mouseLeave, { passive: false });
  this.element.addEventListener('mouseenter', this.mouseEnter, { passive: false });
};
PanelDom.prototype.removeListener = function() {
  window.removeEventListener('contextmenu', this.contextMenu, { passive: false });
  window.removeEventListener('mousedown', this.mouseDown, { passive: false });
  window.removeEventListener('dblclick', this.mouseDoubleClick, { passive: false });
  window.removeEventListener('mouseup', this.mouseUp, { passive: false });
  window.removeEventListener('mousemove', this.mouseMove, { passive: false });
  window.removeEventListener('wheel', this.mouseWheel, { passive: false });
  window.removeEventListener('keydown', this.keyDown, { passive: false });
  window.removeEventListener('keyup', this.keyUp, { passive: false });
  this.element.removeEventListener('mouseleave', this.mouseLeave, { passive: false });
  this.element.removeEventListener('mouseenter', this.mouseEnter, { passive: false });
};
PanelDom.prototype.updateContext = function() {
  const position = this.element.getBoundingClientRect();
  this._left = position.left;
  this._top = position.top;
};
PanelDom.prototype.updateEvents = function(events) {
  PanelDom.events = events;
};
PanelDom.prototype.updateHotKeyDisableList = function({ hotKeyDisableList }) {
  PanelDom.hotKeyDisableList = hotKeyDisableList;
};
PanelDom.prototype.handleContextMenu = function(e) {
  e.preventDefault();
};
PanelDom.prototype.handleMouseDown = function(e) {
  if (!this.areaActive) {
    // 鼠标未在热区内不可用
    return;
  }
  this.mouseIsDown = true;
  const event = this.getMouseEvent(e);
  const data = {
    event,
    areaActive: this.areaActive,
    mouseDown: this.mouseIsDown,
    downKeys: this.downKeys
  };
  if (event.isLeft) {
    this._observer && this._observer.send('panel:handleMouseLeftDown', data);
  } else {
    this._observer && this._observer.send('panel:handleMouseRightDown', data);
  }
};
PanelDom.prototype.handleMouseUp = function(e) {
  if (!this.areaActive && !this.mouseIsDown) {
    // 鼠标未在热区内不可用
    return;
  }
  this.mouseIsDown = false;
  const event = this.getMouseEvent(e);
  const data = {
    event,
    areaActive: this.areaActive,
    mouseDown: this.mouseIsDown,
    downKeys: this.downKeys
  };
  if (event.isLeft) {
    this._observer && this._observer.send('panel:handleMouseLeftUp', data);
  } else {
    this._observer && this._observer.send('panel:handleMouseRightUp', data);
  }
};
PanelDom.prototype.handleMouseDoubleClick = function(e) {
  if (!this.areaActive) {
    // 鼠标未在热区内不可用
    return;
  }
  const data = {
    event: this.getMouseEvent(e),
    areaActive: this.areaActive,
    mouseDown: this.mouseIsDown,
    downKeys: this.downKeys
  };
  this._observer && this._observer.send('panel:handleMouseDoubleClick', data);
};
PanelDom.prototype.handleMouseMove = function(e) {
  if (!this.areaActive) {
    return;
  }
  // 判断是否截流中
  if (this.isThrottle) {
    return;
  }
  // 初始化节流
  setTimeout(() => {
    this.isThrottle = false;
  }, this.THROTTLE_TIME);
  this.isThrottle = true;
  // 执行逻辑
  const data = {
    event: this.getMouseEvent(e),
    areaActive: this.areaActive,
    mouseDown: this.mouseIsDown,
    downKeys: this.downKeys
  };
  this._observer.send('panel:handleMouseMove', data);
};
PanelDom.prototype.handleMouseEnter = function(e) {
  this.element.focus({ preventScroll: true }); // 操作面板获得焦点
  this.areaActive = true;
  const data = {
    event: this.getMouseEvent(e),
    areaActive: this.areaActive,
    mouseDown: this.mouseIsDown,
    downKeys: this.downKeys
  };
  this._observer && this._observer.send('handleMouseEnter', data);
};
PanelDom.prototype.handleMouseLeave = function(e) {
  this.element.blur(); // 操作面板失去焦点
  this.areaActive = false;
  this.downKeys = {};
  const data = {
    event: this.getMouseEvent(e),
    areaActive: this.areaActive,
    mouseDown: this.mouseIsDown,
    downKeys: this.downKeys
  };
  this._observer && this._observer.send('handleMouseLeave', data);
};
PanelDom.prototype.handleMouseWheel = function(e) {
  // 只要有标注组件的地方全局禁用滚动

  if (e.ctrlKey) {
    if (e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }
    e.returnValue = false;
  }
  if (!this.areaActive) {
    // 鼠标未在热区内不可用
    return;
  }
  const data = {
    event: this.getMouseEvent(e),
    areaActive: this.areaActive,
    mouseDown: this.mouseIsDown,
    downKeys: this.downKeys
  };
  this._observer && this._observer.send('handleMouseWheel', data);
};
PanelDom.prototype.handleKeyDown = function(e) {
  if (!this.areaActive) {
    // 鼠标未在热区内不可用
    return;
  }
  const { keyCode: code } = e;
  if (PanelDom.hotKeyDisableList.includes(code)) {
    // 热键不可用
    return;
  }
  this.downKeys[`${code}`] = true;
  const data = {
    event: this.getKeyboardEvent(e),
    areaActive: this.areaActive,
    mouseDown: this.mouseIsDown,
    downKeys: this.downKeys
  };
  this._observer && this._observer.send('handleKeyDown', data);
};
PanelDom.prototype.handleKeyUp = function(e) {
  if (!this.areaActive) {
    // 鼠标未在热区内不可用
    return;
  }
  const { keyCode: code } = e;
  delete this.downKeys[`${code}`];
  const data = {
    event: this.getKeyboardEvent(e),
    areaActive: this.areaActive,
    mouseDown: this.mouseIsDown,
    downKeys: this.downKeys
  };
  this._observer.send('handleKeyUp', data);
};

export default PanelDom;
