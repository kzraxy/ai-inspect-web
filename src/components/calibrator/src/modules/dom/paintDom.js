/*
 * @Description: paintBoard:
 * @Author: liushijie
 * @Date:2021-09-13 11:23
 * @Last Modified by: liushijie
 * @Last Modified Date:2021-09-13 11:23
 */
import cfg from '../../config';
import Dom from './dom';

class PaintDom extends Dom {
  constructor({ parentDom, background = '', style }) {
    super({ parentDom, element: Dom.create({ parentDom, type: 'canvas', background, style }) });
    // 初始化画布上下文和缩放比例
    this.observer = null;
    this.ctx = this.element.getContext('2d');
    this.updateContext();
  }
}
PaintDom.prototype.setObserver = function(observer) {
  this.observer = observer;
};
PaintDom.prototype.updateContext = function() {
  this.width = this.element.clientWidth;
  this.height = this.element.clientHeight;
  this.element.width = this.width;
  this.element.height = this.height;
  // 在浏览器缩放的时候需要重新计算
  this.ctx && this.initRenderRatio();
};
PaintDom.prototype.initRenderRatio = function(ratio = cfg.board.STYLE_RATIO) {
  const backingStore =
    this.ctx.backingStorePixelRatio ||
    this.ctx.webkitBackingStorePixelRatio ||
    this.ctx.mozBackingStorePixelRatio ||
    this.ctx.msBackingStorePixelRatio ||
    this.ctx.oBackingStorePixelRatio ||
    this.ctx.backingStorePixelRatio ||
    1;
  PaintDom.renderRatio = ((window.devicePixelRatio || 1) / backingStore) * ratio;
};
PaintDom.prototype.clearAll = function() {
  this.ctx.clearRect(0, 0, this.width, this.height);
};
PaintDom.prototype.drawImage = function(showMask = false, data) {
  const {
    imageObj,
    scope: { ratio, height, width, basePoint },
    tailorScope: {
      status,
      controls,
      coordinates,
      // maskCoordinates,
      style: { mask: maskStyle, control: controlStyle }
    }
  } = data;
  if (showMask) {
    // 如果显示裁剪遮罩
    // 整个图片区域先画满灰色蒙层
    if (controls) {
      this.drawPath({
        ...maskStyle[status],
        coordinates: [
          { x: 0, y: 0 },
          { x: this.width, y: 0 },
          { x: this.width, y: this.height },
          { x: 0, y: this.height }
        ]
      });
      // 用纯黑色擦去灰色蒙层中的裁剪有效区域
      this.ctx.globalCompositeOperation = 'destination-out';
      this.drawPath({
        coordinates,
        color: 'black'
      });
      // 然后在整个图片区域最底图层画上图片
      this.ctx.globalCompositeOperation = 'destination-over';
    }

    this.ctx.drawImage(
      imageObj,
      0,
      0,
      imageObj.width,
      imageObj.height,
      basePoint.x,
      basePoint.y,
      width,
      height
    );
    if (controls) {
      this.ctx.globalCompositeOperation = 'source-over';
      this.drawPath({
        coordinates,
        borderColor: maskStyle[status].borderColor,
        borderWidth: maskStyle[status].borderWidth
      });
      // 绘制控制点
      for (let i = 0; i < controls.length; i++) {
        // 默认使用裁剪框的状态
        const style =
          status === cfg.status.ILLEGAL ? controlStyle[status] : controlStyle[controls[i].status];
        this.drawPath({
          ...style,
          coordinates: controls[i].coordinates
        });
      }
    }
  } else {
    const clipX = (coordinates[0].x - basePoint.x) / ratio;
    const clipY = (coordinates[0].y - basePoint.y) / ratio;
    const clipW = (coordinates[1].x - coordinates[0].x) / ratio;
    const clipH = (coordinates[2].y - coordinates[1].y) / ratio;
    const left = coordinates[0].x;
    const top = coordinates[0].y;
    const width = coordinates[1].x - coordinates[0].x;
    const height = coordinates[2].y - coordinates[1].y;
    this.ctx.drawImage(imageObj, clipX, clipY, clipW, clipH, left, top, width, height);
  }
};
PaintDom.prototype.drawAxes = function(data, { height, width }) {
  const {
    scope: { point },
    style
  } = data;
  const dist = 0.5;
  const xCoordinates = [
    { x: Math.round(point.x) - dist, y: 0 },
    { x: Math.round(point.x) - dist, y: Math.round(height) - dist }
  ];
  const yCoordinates = [
    { x: 0, y: Math.round(point.y) - dist },
    { x: Math.round(width) - dist, y: Math.round(point.y) - dist }
  ];
  this.drawPath({ ...style, coordinates: xCoordinates, closePath: false });
  this.drawPath({ ...style, coordinates: yCoordinates, closePath: false });
};
PaintDom.prototype.drawRectObj = function(params, editable) {
  const {
    style,
    scope: { controls, coordinates },
    status,
    isHidden
  } = params;
  if (!isHidden) {
    this.drawPath({ ...style.shape[status], coordinates });
    editable && this.drawControls(status, controls, style);
  }
};
PaintDom.prototype.drawRectProcessObj = function({ style, scope, status }) {
  const { controls, coordinates } = scope;
  if (coordinates.length > 1) {
    this.drawPath({
      ...style.shape[status],
      coordinates
    });
  }
  for (let i = 0; i < controls.length; i++) {
    const controlStyle = {
      ...style.shape[status],
      ...style.control[cfg.status.NORMAL]
    };
    this.drawSolidCircle({
      point: controls[i],
      ...controlStyle
    });
  }
};
PaintDom.prototype.drawPolygonProcessObj = function({ style, scope, status }) {
  const { controls, coordinates } = scope;
  // 绘制虚线部分
  if (coordinates.length > 1) {
    this.drawPath({
      ...style.shape[status],
      dashArray: [5, 5],
      closePath: false,
      coordinates: [coordinates[coordinates.length - 1], coordinates[coordinates.length - 2]]
    });
  }
  // 绘制实线部分
  if (controls.length > 1) {
    this.drawPath({
      ...style.shape[status],
      closePath: false,
      color: 'rgba(0,0,0,0)',
      coordinates: controls
    });
  }
  // 绘制颜色层
  this.drawPath({
    ...style.shape[status],
    borderColor: 'rgba(0,0,0,0)',
    coordinates
  });
  for (let i = 0; i < controls.length; i++) {
    const controlStyle = {
      ...style.shape[status],
      ...style.control[cfg.status.NORMAL]
    };
    this.drawSolidCircle({
      point: controls[i],
      ...controlStyle
    });
  }
};
PaintDom.prototype.drawLineProcessObj = function({ style, scope, status }) {
  const { maskCoordinates, coordinates } = scope;
  if (coordinates.length > 1) {
    this.drawPath({
      ...style.shape[status],
      borderColor: 'rgba(0,0,0,0)',
      coordinates: maskCoordinates
    });
  }
  this.drawPath({
    ...style.shape[status],
    coordinates
  });
  for (let i = 0; i < coordinates.length; i++) {
    const controlStyle = {
      ...style.shape[status],
      ...style.control[cfg.status.NORMAL]
    };
    this.drawSolidCircle({
      point: coordinates[i],
      ...controlStyle
    });
  }
};
PaintDom.prototype.drawChainProcessObj = function({ style, scope, status }) {
  const { maskCoordinates, coordinates } = scope;
  if (coordinates.length > 1) {
    this.drawPath({
      ...style.shape[status],
      borderColor: 'rgba(0,0,0,0)',
      coordinates: maskCoordinates
    });
    const angle = Math.atan2(
      coordinates[0].y - coordinates[1].y,
      coordinates[0].x - coordinates[1].x
    );
    const midPoint = {
      x: (coordinates[0].x + coordinates[1].x) / 2,
      y: (coordinates[0].y + coordinates[1].y) / 2
    };
    const long = 80 * PaintDom.renderRatio;
    const dx = Math.sin(angle) * (long / 2);
    const dy = Math.cos(angle) * (long / 2);
    const directionPoints = [
      { x: midPoint.x + dx, y: midPoint.y - dy },
      { x: midPoint.x - dx, y: midPoint.y + dy }
    ];
    this.drawArrow({
      x: coordinates[0].x,
      y: coordinates[0].y,
      toX: coordinates[1].x,
      toY: coordinates[1].y,
      ...style.shape[status]
    });
    // 绘制虚线及箭头
    this.drawPath({
      coordinates: directionPoints,
      ...style.shape[status],
      color: 'rgba(0,0,0,0)',
      dashArray: [5, 5],
      closePath: false
    });
    this.drawArrow({
      x: directionPoints[0].x,
      y: directionPoints[0].y,
      toX: directionPoints[1].x,
      toY: directionPoints[1].y,
      ...style.shape[status]
    });
    this.drawArrow({
      x: directionPoints[1].x,
      y: directionPoints[1].y,
      toX: directionPoints[0].x,
      toY: directionPoints[0].y,
      ...style.shape[status]
    });
  }
  this.drawPath({
    ...style.shape[status],
    coordinates
  });
  for (let i = 0; i < coordinates.length; i++) {
    const controlStyle = {
      ...style.shape[status],
      ...style.control[cfg.status.NORMAL]
    };
    this.drawSolidCircle({
      point: coordinates[i],
      ...controlStyle
    });
  }
};
PaintDom.prototype.drawABChainProcessObj = function({ style, scope, status }) {
  const { maskCoordinates, coordinates } = scope;
  if (coordinates.length > 1) {
    this.drawPath({
      ...style.shape[status],
      borderColor: 'rgba(0,0,0,0)',
      coordinates: maskCoordinates
    });
    const angle = Math.atan2(
      coordinates[0].y - coordinates[1].y,
      coordinates[0].x - coordinates[1].x
    );
    const midPoint = {
      x: (coordinates[0].x + coordinates[1].x) / 2,
      y: (coordinates[0].y + coordinates[1].y) / 2
    };
    const long = 80 * PaintDom.renderRatio;
    const dx = Math.sin(angle) * (long / 2);
    const dy = Math.cos(angle) * (long / 2);
    const directionPoints = [
      { x: midPoint.x + dx, y: midPoint.y - dy },
      { x: midPoint.x, y: midPoint.y}
    ];
    this.drawArrow({
      x: coordinates[0].x,
      y: coordinates[0].y,
      toX: coordinates[1].x,
      toY: coordinates[1].y,
      ...style.shape[status]
    });
    // 绘制虚线及箭头
    this.drawPath({
      coordinates: directionPoints,
      ...style.shape[status],
      color: 'rgba(0,0,0,0)',
      dashArray: [5, 5],
      closePath: false
    });
    this.drawArrow({
      x: directionPoints[1].x,
      y: directionPoints[1].y,
      toX: directionPoints[0].x,
      toY: directionPoints[0].y,
      ...style.shape[status]
    });
  }
  this.drawPath({
    ...style.shape[status],
    coordinates
  });
  for (let i = 0; i < coordinates.length; i++) {
    const controlStyle = {
      ...style.shape[status],
      ...style.control[cfg.status.NORMAL]
    };
    this.drawSolidCircle({
      point: coordinates[i],
      ...controlStyle
    });
  }
};
PaintDom.prototype.drawBAChainProcessObj = function({ style, scope, status }) {
  const { maskCoordinates, coordinates } = scope;
  if (coordinates.length > 1) {
    this.drawPath({
      ...style.shape[status],
      borderColor: 'rgba(0,0,0,0)',
      coordinates: maskCoordinates
    });
    const angle = Math.atan2(
      coordinates[0].y - coordinates[1].y,
      coordinates[0].x - coordinates[1].x
    );
    const midPoint = {
      x: (coordinates[0].x + coordinates[1].x) / 2,
      y: (coordinates[0].y + coordinates[1].y) / 2
    };
    const long = 80 * PaintDom.renderRatio;
    const dx = Math.sin(angle) * (long / 2);
    const dy = Math.cos(angle) * (long / 2);
    const directionPoints = [
      { x: midPoint.x, y: midPoint.y },
      { x: midPoint.x - dx, y: midPoint.y + dy }
    ];
    this.drawArrow({
      x: coordinates[0].x,
      y: coordinates[0].y,
      toX: coordinates[1].x,
      toY: coordinates[1].y,
      ...style.shape[status]
    });
    // 绘制虚线及箭头
    this.drawPath({
      coordinates: directionPoints,
      ...style.shape[status],
      color: 'rgba(0,0,0,0)',
      dashArray: [5, 5],
      closePath: false
    });
    this.drawArrow({
      x: directionPoints[0].x,
      y: directionPoints[0].y,
      toX: directionPoints[1].x,
      toY: directionPoints[1].y,
      ...style.shape[status]
    });
  }
  this.drawPath({
    ...style.shape[status],
    coordinates
  });
  for (let i = 0; i < coordinates.length; i++) {
    const controlStyle = {
      ...style.shape[status],
      ...style.control[cfg.status.NORMAL]
    };
    this.drawSolidCircle({
      point: coordinates[i],
      ...controlStyle
    });
  }
};
PaintDom.prototype.drawEllipseProcessObj = function({ style, scope, status }) {
  const { controls, center, axisX, axisY, angle } = scope;
  // 绘制椭圆主体
  this.drawEllipse({
    ...style.shape[status],
    center: center || controls[0],
    axisX,
    axisY,
    angle
  });
  const controlStyle = {
    ...style.shape[status],
    ...style.control[cfg.status.NORMAL]
  };
  this.drawSolidCircle({
    point: controls[0],
    ...controlStyle
  });
};
PaintDom.prototype.drawPolygonObj = function(params, editable) {
  const {
    style,
    scope: { controls, coordinates },
    status,
    isHidden
  } = params;
  if (!isHidden) {
    this.drawPath({ ...style.shape[status], coordinates });
    editable && this.drawControls(status, controls, style);
  }
};
PaintDom.prototype.drawEllipseObj = function(params, editable) {
  const { style, scope, status, isHidden } = params;
  const { controls, coordinates, rotation, angle, center, axisX, axisY } = scope;
  if (isHidden) {
    return;
  }
  // 绘制椭圆主体
  this.drawEllipse({
    ...style.shape[status],
    center,
    axisX,
    axisY,
    angle
  });
  if (status === cfg.status.NORMAL || status === cfg.status.HOVER) {
    return;
  }
  const dashArray = [5, 5];
  // 绘制边框
  this.drawPath({ ...style.shape[status], coordinates, dashArray, color: 'rgba(0,0,0,0)' });
  // 绘制旋转点连线
  editable &&
    this.drawPath({
      dashArray,
      closePath: false,
      ...style.shape[status],
      coordinates: [controls[1].point, rotation.point]
    });
  // 绘制控制点
  editable && this.drawControls(status, controls, style);
  // 绘制旋转点及旋转点连线
  const rotationStyle = {
    ...style.shape[status],
    ...style.control[rotation.status]
  };
  editable &&
    this.drawCircle({
      point: rotation.point,
      ...rotationStyle
    });
};
PaintDom.prototype.drawLineObj = function(params, editable) {
  const {
    style,
    scope: { controls, coordinates },
    status,
    isHidden
  } = params;
  if (isHidden) {
    return;
  }
  // 绘制边框
  this.drawPath({ ...style.shape[status], coordinates, borderColor: 'rgba(0,0,0,0)' });
  // 绘制线主体
  this.drawPath({
    ...style.shape[status],
    coordinates: controls.map(co => co.point)
  });
  // 绘制控制点
  editable && this.drawControls(status, controls, style);
};
PaintDom.prototype.drawChainObj = function(params, editable) {
  const {
    style,
    scope: { controls, coordinates },
    status,
    isHidden
  } = params;
  if (isHidden) {
    return;
  }
  const simpleCoordinates = controls.map(co => co.point)
  const angle = Math.atan2(
    simpleCoordinates[0].y - simpleCoordinates[1].y,
    simpleCoordinates[0].x - simpleCoordinates[1].x
  );
  const midPoint = {
    x: (simpleCoordinates[0].x + simpleCoordinates[1].x) / 2,
    y: (simpleCoordinates[0].y + simpleCoordinates[1].y) / 2
  };
  const long = 80 * PaintDom.renderRatio;
  const dx = Math.sin(angle) * (long / 2);
  const dy = Math.cos(angle) * (long / 2);
  const directionPoints = [
    { x: midPoint.x + dx, y: midPoint.y - dy },
    { x: midPoint.x - dx, y: midPoint.y + dy }
  ];
/*   this.drawArrow({
    x: simpleCoordinates[0].x,
    y: simpleCoordinates[0].y,
    toX: simpleCoordinates[1].x,
    toY: simpleCoordinates[1].y,
    ...style.shape[status]
  }); */
  // 绘制线主体
  this.drawPath({
    ...style.shape[status],
    coordinates: controls.map(co => co.point),
    closePath: false,
  });
  // 绘制虚线及箭头
  this.drawPath({
    coordinates: directionPoints,
    ...style.shape[status],
    closePath: false,
    dashArray: [5, 5]
  });
  this.drawArrow({
    x: directionPoints[0].x,
    y: directionPoints[0].y,
    toX: directionPoints[1].x,
    toY: directionPoints[1].y,
    ...style.shape[status]
  });
  this.drawArrow({
    x: directionPoints[1].x,
    y: directionPoints[1].y,
    toX: directionPoints[0].x,
    toY: directionPoints[0].y,
    ...style.shape[status]
  });
  // 绘制边框
  this.drawPath({ ...style.shape[status], coordinates, borderColor: 'rgba(0,0,0,0)',closePath: false });
  // 绘制控制点
  editable && this.drawControls(status, controls, style);
};
PaintDom.prototype.drawABChainObj = function(params, editable) {
  const {
    style,
    scope: { controls, coordinates },
    status,
    isHidden
  } = params;
  if (isHidden) {
    return;
  }
  const simpleCoordinates = controls.map(co => co.point)
  const angle = Math.atan2(
    simpleCoordinates[0].y - simpleCoordinates[1].y,
    simpleCoordinates[0].x - simpleCoordinates[1].x
  );
  const midPoint = {
    x: (simpleCoordinates[0].x + simpleCoordinates[1].x) / 2,
    y: (simpleCoordinates[0].y + simpleCoordinates[1].y) / 2
  };
  const long = 80 * PaintDom.renderRatio;
  const dx = Math.sin(angle) * (long / 2);
  const dy = Math.cos(angle) * (long / 2);
  const directionPoints = [
    { x: midPoint.x + dx, y: midPoint.y - dy },
    { x: midPoint.x, y: midPoint.y}
  ];
  /* this.drawArrow({
    x: simpleCoordinates[0].x,
    y: simpleCoordinates[0].y,
    toX: simpleCoordinates[1].x,
    toY: simpleCoordinates[1].y,
    ...style.shape[status]
  }); */
  // 绘制线主体
  this.drawPath({
    ...style.shape[status],
    coordinates: controls.map(co => co.point),
    closePath: false,
  });
  // 绘制虚线及箭头
  this.drawPath({
    coordinates: directionPoints,
    ...style.shape[status],
    closePath: false,
    dashArray: [5, 5]
  });
  this.drawArrow({
    x: directionPoints[1].x,
    y: directionPoints[1].y,
    toX: directionPoints[0].x,
    toY: directionPoints[0].y,
    ...style.shape[status]
  });
  // 绘制边框
  this.drawPath({ ...style.shape[status], coordinates, borderColor: 'rgba(0,0,0,0)',closePath: false });
  // 绘制控制点
  editable && this.drawControls(status, controls, style);
};
PaintDom.prototype.drawBAChainObj = function(params, editable) {
  const {
    style,
    scope: { controls, coordinates },
    status,
    isHidden
  } = params;
  if (isHidden) {
    return;
  }
  const simpleCoordinates = controls.map(co => co.point)
  const angle = Math.atan2(
    simpleCoordinates[0].y - simpleCoordinates[1].y,
    simpleCoordinates[0].x - simpleCoordinates[1].x
  );
  const midPoint = {
    x: (simpleCoordinates[0].x + simpleCoordinates[1].x) / 2,
    y: (simpleCoordinates[0].y + simpleCoordinates[1].y) / 2
  };
  const long = 80 * PaintDom.renderRatio;
  const dx = Math.sin(angle) * (long / 2);
  const dy = Math.cos(angle) * (long / 2);
  const directionPoints = [
    { x: midPoint.x, y: midPoint.y },
    { x: midPoint.x - dx, y: midPoint.y + dy }
  ];
  /* this.drawArrow({
    x: simpleCoordinates[0].x,
    y: simpleCoordinates[0].y,
    toX: simpleCoordinates[1].x,
    toY: simpleCoordinates[1].y,
    ...style.shape[status]
  }); */
  // 绘制线主体
  this.drawPath({
    ...style.shape[status],
    coordinates: controls.map(co => co.point),
    closePath: false,
  });
  // 绘制虚线及箭头
  this.drawPath({
    coordinates: directionPoints,
    ...style.shape[status],
    closePath: false,
    dashArray: [5, 5]
  });
  this.drawArrow({
    x: directionPoints[0].x,
    y: directionPoints[0].y,
    toX: directionPoints[1].x,
    toY: directionPoints[1].y,
    ...style.shape[status]
  });
  // 绘制边框
  this.drawPath({ ...style.shape[status], coordinates, borderColor: 'rgba(0,0,0,0)',closePath: false });
  // 绘制控制点
  editable && this.drawControls(status, controls, style);
};
PaintDom.prototype.drawPixelObj = function({ scope: { basePoint, canvas }, status }) {
  if (!canvas.width || !canvas.height) {
    return;
  }
  const opacity = status === cfg.status.NORMAL ? 0.3 : status === cfg.status.HOVER ? 0.5 : 0.7;
  this.drawCanvas({
    canvas,
    left: basePoint.x,
    top: basePoint.y,
    opacity
  });
};
PaintDom.prototype.drawControls = function(status, controls, style) {
  if (status === cfg.status.NORMAL || status === cfg.status.HOVER) {
    return;
  }
  for (let i = 0; i < controls.length; i++) {
    const controlStyle = {
      ...style.shape[status],
      ...style.control[controls[i].status]
    };
    this.drawSolidCircle({
      point: controls[i].point,
      ...controlStyle
    });
  }
};
PaintDom.prototype.drawPath = function(params) {
  const {
    coordinates,
    borderWidth = 1,
    borderColor = 'rgba(0,0,0,0)',
    color = 'rgba(0,0,0,0)',
    dashArray = [1, 0],
    closePath = true
  } = params;
  this.ctx.beginPath();
  this.ctx.moveTo(Math.round(coordinates[0].x), Math.round(coordinates[0].y));
  this.ctx.lineWidth = borderWidth * PaintDom.renderRatio;
  this.ctx.fillStyle = color;
  this.ctx.strokeStyle = borderColor;
  this.ctx.setLineDash([dashArray[0] * PaintDom.renderRatio, dashArray[1] * PaintDom.renderRatio]);
  for (let i = 1; i < coordinates.length; i++) {
    this.ctx.lineTo(coordinates[i].x, coordinates[i].y);
  }
  this.ctx.fill();
  closePath && this.ctx.closePath();
  this.ctx.stroke(); // 进行绘制
  this.ctx.setLineDash([1, 0]);
};
PaintDom.prototype.drawArrow = function({ x, y, toX, toY, borderColor, borderWidth }) {
  const theta = 30;
  const headlen = borderWidth * PaintDom.renderRatio * 5;
  // 计算各角度和对应的P2,P3坐标
  const angle = (Math.atan2(y - toY, x - toX) * 180) / Math.PI;
  const angle1 = ((angle + theta) * Math.PI) / 180;
  const angle2 = ((angle - theta) * Math.PI) / 180;
  const topY = headlen * Math.sin(angle1);
  const topX = headlen * Math.cos(angle1);
  const botX = headlen * Math.cos(angle2);
  const botY = headlen * Math.sin(angle2);

  this.ctx.save();
  this.ctx.beginPath();

  this.ctx.moveTo(toX, toY);
  let arrowX = toX + topX;
  let arrowY = toY + topY;
  this.ctx.moveTo(arrowX, arrowY);
  this.ctx.lineTo(toX, toY);
  arrowX = toX + botX;
  arrowY = toY + botY;
  this.ctx.lineTo(arrowX, arrowY);
  this.ctx.strokeStyle = borderColor;
  this.ctx.lineWidth = borderWidth;
  this.ctx.stroke();
};
PaintDom.prototype.drawSolidCircle = function(data) {
  this.ctx.globalCompositeOperation = 'destination-out';
  this.drawCircle({ ...data, color: 'black' });
  this.ctx.globalCompositeOperation = 'source-over';
  this.drawCircle({ ...data });
};
PaintDom.prototype.drawCircle = function({ point, radius, borderWidth, borderColor, color }) {
  this.ctx.beginPath();
  this.ctx.lineWidth = borderWidth * PaintDom.renderRatio;
  this.ctx.strokeStyle = borderColor;
  this.ctx.fillStyle = color;
  this.ctx.arc(
    Math.round(point.x),
    Math.round(point.y),
    radius * PaintDom.renderRatio,
    0,
    2 * Math.PI
  );
  this.ctx.fill();
  this.ctx.stroke();
};
PaintDom.prototype.drawEllipse = function(params) {
  const { center, axisX, axisY, angle, borderWidth, borderColor, color } = params;
  this.ctx.translate(center.x, center.y);
  this.ctx.rotate(angle);
  const k = 0.5522848;
  const ox = axisX * k; // 水平控制点偏移量
  const oy = axisY * k; // 垂直控制点偏移量</p> <p> ctx.beginPath();
  // 从椭圆的左端点开始顺时针绘制四条三次贝塞尔曲线
  this.ctx.beginPath();
  this.ctx.lineWidth = borderWidth * PaintDom.renderRatio;
  this.ctx.strokeStyle = borderColor;
  this.ctx.fillStyle = color;
  this.ctx.moveTo(0 - axisX, 0);
  this.ctx.bezierCurveTo(0 - axisX, 0 - oy, 0 - ox, 0 - axisY, 0, 0 - axisY);
  this.ctx.bezierCurveTo(0 + ox, 0 - axisY, 0 + axisX, 0 - oy, 0 + axisX, 0);
  this.ctx.bezierCurveTo(0 + axisX, 0 + oy, 0 + ox, 0 + axisY, 0, 0 + axisY);
  this.ctx.bezierCurveTo(0 - ox, 0 + axisY, 0 - axisX, 0 + oy, 0 - axisX, 0);
  this.ctx.closePath();
  this.ctx.stroke();
  this.ctx.fill();
  this.ctx.rotate(-angle);
  this.ctx.translate(-center.x, -center.y);
};
PaintDom.prototype.drawTextBox = function(params) {
  const { text, left, top, fontSize, fontColor, width, height } = params;
  const fz = Number(fontSize.replace('px', ''));
  this.ctx.beginPath();
  this.ctx.font = `${fz * PaintDom.renderRatio}px Microsoft Yahei`;
  this.ctx.fillStyle = fontColor;
  this.ctx.textAlign = 'center';
  this.ctx.fillText(text, left + width / 2, top - (height - fz * PaintDom.renderRatio), width);
  this.ctx.stroke(); // 进行绘制
};
PaintDom.prototype.drawCanvas = function({ canvas, left, top, opacity = 1 }) {
  opacity !== 1 && (this.ctx.globalAlpha = opacity);
  this.ctx.drawImage(canvas, left, top);
  this.ctx.globalAlpha !== 1 && (this.ctx.globalAlpha = 1);
};
export default PaintDom;
