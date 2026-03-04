let seed = 0
const ctx = '@@draggableContext'
function handleMousedown (event) {
  event.preventDefault()
  const el = this
  const rect = el.getBoundingClientRect()

  Object.assign(el[ctx], {
    type: 'mousedown',
    rect: rect,
    x: rect.x || rect.left,
    y: rect.y || rect.top,
    dragstartX: event.clientX, // 鼠标按下时坐标
    dragstartY: event.clientY,
    dragendX: void 0, // 鼠标松开时坐标
    dragendY: void 0,
    startX: event.clientX, // 起点坐标
    startY: event.clientY,
    dragging: true,
    isMove: false
  })

  callback(el)

  window.addEventListener('mousemove', el[ctx]._handleMousemove, false)
  window.addEventListener('mouseup', el[ctx]._handleMouseup, false)
}

function handleMousemove (el) {
  return function (event) {
    event.preventDefault()

    if (event.target === document.documentElement) return

    const current = {
      x: event.clientX,
      y: event.clientY
    }

    const diff = {
      x: current.x - el[ctx].startX,
      y: current.y - el[ctx].startY
    }

    if (el[ctx].binding.modifiers.sticky) {
      // 不会拖出屏幕边缘
      const clientWidth = document.documentElement.clientWidth
      const clientHeight = document.documentElement.clientHeight

      const {
        x,
        y,
        rect: { width, height }
      } = el[ctx]

      if (diff.x < 0 && x + diff.x <= 0) {
        el[ctx].x = 0
      } else if (diff.x > 0 && x + width - clientWidth >= 0) {
        el[ctx].x = clientWidth - width
      } else {
        el[ctx].x += diff.x
      }

      if (diff.y < 0 && y + diff.y <= 0) {
        el[ctx].y = 0
      } else if (diff.y > 0 && y + height - clientHeight >= 0) {
        el[ctx].y = clientHeight - height
      } else {
        el[ctx].y += diff.y
      }
    } else {
      el[ctx].x += diff.x
      el[ctx].y += diff.y
    }

    Object.assign(el[ctx], {
      type: 'mousemove',
      startX: current.x,
      startY: current.y,
      diffX: diff.x,
      diffY: diff.y,
      isMove: true
    })

    callback(el)
  }
}
function handleMouseup (el) {
  return function (event) {
    event.preventDefault()

    const lastType = el[ctx].type

    Object.assign(el[ctx], {
      type: 'mouseup',
      dragendX: event.clientX, // 鼠标按下时坐标
      dragendY: event.clientY,
      dragging: false,
      isMove: lastType === 'mousemove'
    })

    callback(el)

    window.removeEventListener('mousemove', el[ctx]._handleMousemove, false)
    window.removeEventListener('mouseup', el[ctx]._handleMouseup, false)
  }
}

function callback (el) {
  const bindingFn = el[ctx]?.binding?.value
  if (typeof bindingFn === 'function') {
    bindingFn({ ...el[ctx], target: el })
  } else {
    const { x, y, rect, dragging } = el[ctx]
    if (!dragging) return
    el.style.cssText = `
      left: ${x}px;
      top: ${y}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
    `
  }
}
/**
 * v-draggable
 * @desc
 * @example
 * ```vue
 * <div v-draggable>
 *
 * <div v-draggable.sticky>
 * <div v-draggable="handleDraggable">
 * ```
 */
export default {
  bind (el, binding, vnode) {
    const id = seed++
    el[ctx] = {
      id,
      binding,
      vnode,
      _handleMousemove: handleMousemove(el, binding, vnode),
      _handleMouseup: handleMouseup(el, binding, vnode)
    }

    el.addEventListener('mousedown', handleMousedown, false)
  },

  unbind (el) {
    window.removeEventListener('mousemove', el[ctx]._handleMousemove, false)
    window.removeEventListener('mouseup', el[ctx]._handleMouseup, false)
    el.removeEventListener('mousedown', handleMousedown, false)
    delete el[ctx]
  }
}