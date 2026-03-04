/*
 * @Description: pen:
 * @Author: liushijie
 * @Date:2021-10-14 16:25
 * @Last Modified by: liushijie
 * @Last Modified Date:2021-10-14 16:25
 */
import calibration from './calibration';
// 绘制类型
const DRAW_TYPES = {
  ...calibration.TYPES
};
// 画笔宽度（归一化）
const DEFAULT_PEN_WIDTH = 0.1;

export default {
  DRAW_TYPES,
  DEFAULT_PEN_WIDTH
};
