/*
 * @Description: callback:
 * @Author: liushijie
 * @Date:2021-10-28 20:29
 * @Last Modified by: liushijie
 * @Last Modified Date:2021-10-28 20:29
 */
const CALLBACK_MAP = {
  beforeDraw: 'draw:try', // 绘制前
  beforeEdit: 'edit:try', // 编辑前
  beforeDrawFinish: 'draw: beforeFinish', // 绘制即将完成，即介于绘制前和绘制后中间的时间点
  beforeCalibrationsDelete: 'calibrations:beforeDelete',
  afterDraw: 'draw:finish', // 绘制后
  afterEdit: 'edit:finish', // 编辑后
  afterMouseMove: 'operator:mouseMove', // 移动后
  afterMouseLeftDown: 'operator:mouseLeftDown', // 单击后
  afterMouseDoubleClick: 'operator:mouseDoubleClick', // 双击后
  afterImageChange: 'image:changed', // 底图或裁剪改变后
  afterCalibrationsChange: 'calibrations:changed', // 标注列表改变后
  afterCalibrationsStatusChange: 'calibrations:statusChanged', // 标注列表对象状态改变后
  afterCalibrationsLabelChange: 'calibrations:labelListChanged', // 标注列表对象标签改变后
  afterOperationTypeChange: 'operator:operationTypeChange', // 操作类型改变后
  afterOperationStatusChange: 'operator:operationStatusChanged', // 操作状态改变后
  afterPenWidthChange: 'drawer:penWidthChanged', // 画笔宽度改变后
  afterBorderWidthChange: 'drawer:borderWidthChanged',
  afterDrawTypeChange: 'drawer:drawTypeChanged', // 画笔类型改变后
  afterEditAnchor: 'operator:anchorChanged' // 完成增删锚点的操作后
};
export default {
  CALLBACK_MAP
};
