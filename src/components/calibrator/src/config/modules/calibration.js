/*
 * @Description: calibration:
 * @Author: liushijie
 * @Date:2021-10-14 21:26
 * @Last Modified by: liushijie
 * @Last Modified Date:2021-10-14 21:26
 */
const TYPES = {
  RECT: 'rect', // 矩形标注
  POLYGON: 'polygon', // 多边形标注
  ELLIPSE: 'ellipse', // 圆、椭圆形标注
  LINE: 'line', // 线段标注
  CHAIN: 'chain', // 双向线段标注
  ABCHAIN: 'abchain', // A to B线段标注
  BACHAIN: 'bachain', // B to A线段标注
  BRUSH: 'brush', // 笔刷标注
  PIXEL: 'pixel', // 像素标注,
};
const DEFAULT_CALIBRATION_KEY = 'id';
const DEFAULT_INDEX_KEY = 'index';
const DEFAULT_LABEL_KEY = 'id';
const DELETE_ICON = require('../../assets/icon_24_delete.png');

export default {
  TYPES,
  DELETE_ICON,
  DEFAULT_CALIBRATION_KEY,
  DEFAULT_INDEX_KEY,
  DEFAULT_LABEL_KEY
};
