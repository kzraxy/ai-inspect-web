import Vue from 'vue'
Vue.directive('dragWidth', {
  bind(el, binding, vnode, oldVnode) {
    // 定义最小宽度
    const minW = binding.value?.minWidth || 240;
    // 定义最大宽度
    const maxW = binding.value?.maxWidth || 560;
    // 最大宽度不能小于最小宽度
    if (maxW>-1 && maxW < minW) {
      return
    }
    // 定义边框大小
    const borderSize = 10;
    // 初始化起始位置和尺寸
    let startX = 0;
    let startWidth = 0;
    // 获取弹窗内容元素
    const dragDom = el
    if (!dragDom) return
    // 初始化是否正在调整大小的标志
    let isResizing = false;
    // 获取Vue实例对象
    const that = vnode.context;
    // 定义垂直和水平调整大小的光标样式
    const handleCursorHorizontal = 'ew-resize';

    // 设置初始光标样式为垂直调整大小
    dragDom.style.cursor = 'ns-resize';

    // 监听鼠标移动事件，根据光标位置确定光标样式，并修改调整`大小标志
    dragDom.addEventListener('mousemove', e => {
        let h = dragDom.clientHeight, w = dragDom.clientWidth;
        let isOnHorizontalBorder = w - e.offsetX < borderSize, isOnVerticalBorder = h - e.offsetY < borderSize;

        // 根据光标位置设置光标样式
        if (isOnHorizontalBorder) dragDom.style.cursor = handleCursorHorizontal;
        if (!isOnHorizontalBorder && !isOnVerticalBorder) dragDom.style.cursor = '';
        
        // 修改调整大小标志
        if (isOnHorizontalBorder || isOnVerticalBorder) isResizing = true;
    })

    // 监听鼠标按下事件，保存起始位置和尺寸，并添加鼠标移动和鼠标释放事件监听器
    dragDom.addEventListener('mousedown', e => {
      // 获取弹窗内容元素的位置和尺寸信息
      const rect = dragDom.getBoundingClientRect();
      startX = e.clientX;
      startWidth = rect.width;

      // 如果不处于调整大小状态，直接返回
      if(!isResizing) return;
      //解决拖动会选中文字的问题
      document.onselectstart = function() { return false; };
      
      // 添加鼠标移动和鼠标释放事件监听器
      document.addEventListener('mousemove', resizeWidthHeight, false);
      document.addEventListener('mouseup', removeResize, false);
    });

    // 调整元素的宽度和高度
    function resizeWidthHeight(e) {
      if (!isResizing) return;

      // 计算新的宽度和高度
      let width = startWidth + e.clientX - startX;
      
      // 如果宽度小于最小宽度，则使用最小宽度
      if(width < minW) width = minW;
      // 如果宽度大于最大宽度，则使用最大宽度
      if(maxW > -1 && width > maxW) width = maxW
      
      // 设置元素的新宽度和高度
      dragDom.style.width = `${width}px`;
      dragDom.style.minWidth = `${width}px`;
    }

    // 移除调整大小事件监听器，并重置光标样式，并通过 Vue 实例传递元素新的尺寸信息
    function removeResize() {
      isResizing = false;
      document.removeEventListener('mousemove', resizeWidthHeight, false);
      document.removeEventListener('mouseup', removeResize, false);
      document.onselectstart = null
      dragDom.style.cursor = '';
      
      // 如果存在 setTablewH 方法，则调用该方法并传递元素位置和尺寸信息
      that.setTablewH && that.setTablewH(dragDom.getBoundingClientRect());
    }
  }
}
)