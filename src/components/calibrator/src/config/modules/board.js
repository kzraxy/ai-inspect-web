/*
 * @Description: board:
 * @Author: liushijie
 * @Date:2021-09-13 15:26
 * @Last Modified by: liushijie
 * @Last Modified Date:2021-09-13 15:26
 */
import calibrationCfg from './calibration';
import operatorCfg from './operator';

const STYLE_RATIO = 1; // 样式与canvas缩放比
const THROTTLE_TIME = 20; // 节流的间隔
const HOT_KEYS = {
  SHIFT: '16', // shift
  CTRL: '17', // ctrl
  ESC: '27', // ESC
  V: '86', // v
  R: '82', // r
  C: '67', // c
  Z: '90', // z
  X: '88', // x
  DELETE: '46', // delete
  BACKSPACE: '8', // backspace
  SPACE: '32' // 空格
}; // 热键
const CURSOR = {
  DEFAULT: `url('${require('../../assets/mouse/mouse_select.cur')}') 4 0, auto`,
  CONTROL: {
    DEFAULT: `url('${require('../../assets/mouse/mouse_edit_point.cur')}') 2 0, auto`,
    0: `url('${require('../../assets/mouse/mouse_deform_0.cur')}') 12 12, auto`,
    1: `url('${require('../../assets/mouse/mouse_deform_1.cur')}') 12 12, auto`,
    2: `url('${require('../../assets/mouse/mouse_deform_2.cur')}') 12 12, auto`,
    3: `url('${require('../../assets/mouse/mouse_deform_3.cur')}') 12 12, auto`,
    4: `url('${require('../../assets/mouse/mouse_deform_4.cur')}') 12 12, auto`,
    5: `url('${require('../../assets/mouse/mouse_deform_5.cur')}') 12 12, auto`,
    6: `url('${require('../../assets/mouse/mouse_deform_6.cur')}') 12 12, auto`,
    7: `url('${require('../../assets/mouse/mouse_deform_7.cur')}') 12 12, auto`,
    8: `url('${require('../../assets/mouse/mouse_deform_8.cur')}') 12 12, auto`,
    9: `url('${require('../../assets/mouse/mouse_deform_9.cur')}') 12 12, auto`,
    10: `url('${require('../../assets/mouse/mouse_deform_10.cur')}') 12 12, auto`,
    11: `url('${require('../../assets/mouse/mouse_deform_11.cur')}') 12 12, auto`,
    12: `url('${require('../../assets/mouse/mouse_deform_12.cur')}') 12 12, auto`,
    13: `url('${require('../../assets/mouse/mouse_deform_13.cur')}') 12 12, auto`,
    14: `url('${require('../../assets/mouse/mouse_deform_14.cur')}') 12 12, auto`,
    15: `url('${require('../../assets/mouse/mouse_deform_15.cur')}') 12 12, auto`
  },
  ROTATE: {
    DEFAULT: `url('${require('../../assets/mouse/mouse_edit_point.cur')}') 5 5, auto`,
    0: `url('${require('../../assets/mouse/mouse_spin_0.cur')}') 12 12, auto`,
    1: `url('${require('../../assets/mouse/mouse_spin_1.cur')}') 12 12, auto`,
    2: `url('${require('../../assets/mouse/mouse_spin_2.cur')}') 12 12, auto`,
    3: `url('${require('../../assets/mouse/mouse_spin_3.cur')}') 12 12, auto`,
    4: `url('${require('../../assets/mouse/mouse_spin_4.cur')}') 12 12, auto`,
    5: `url('${require('../../assets/mouse/mouse_spin_5.cur')}') 12 12, auto`,
    6: `url('${require('../../assets/mouse/mouse_spin_6.cur')}') 12 12, auto`,
    7: `url('${require('../../assets/mouse/mouse_spin_7.cur')}') 12 12, auto`,
    8: `url('${require('../../assets/mouse/mouse_spin_8.cur')}') 12 12, auto`,
    9: `url('${require('../../assets/mouse/mouse_spin_9.cur')}') 12 12, auto`,
    10: `url('${require('../../assets/mouse/mouse_spin_10.cur')}') 12 12, auto`,
    11: `url('${require('../../assets/mouse/mouse_spin_11.cur')}') 12 12, auto`,
    12: `url('${require('../../assets/mouse/mouse_spin_12.cur')}') 12 12, auto`,
    13: `url('${require('../../assets/mouse/mouse_spin_13.cur')}') 12 12, auto`,
    14: `url('${require('../../assets/mouse/mouse_spin_14.cur')}') 12 12, auto`,
    15: `url('${require('../../assets/mouse/mouse_spin_15.cur')}') 12 12, auto`
  },
  EDIT: {
    DEFAULT: `url('${require('../../assets/mouse/mouse_select.cur')}') 4 0, auto`,
    [`${operatorCfg.EDIT_TYPES.MOVE_ALL}`]: `url('${require('../../assets/mouse/mouse_move.cur')}') 10 13, auto`,
    [`${operatorCfg.EDIT_TYPES.DRAW_TAILOR}`]: `url('${require('../../assets/mouse/mouse_draw_rect.cur')}') 10 13, auto`,
    [`${operatorCfg.EDIT_TYPES.MOVE_CALIBRATIONS}`]: `url('${require('../../assets/mouse/mouse_move.cur')}') 10 13, auto`,
    [`${operatorCfg.EDIT_TYPES.MOVE_IMAGE_AND_CALIBRATIONS}`]: `url('${require('../../assets/mouse/mouse_move.cur')}') 10 13, auto`,
    [`${operatorCfg.EDIT_TYPES.ADD_ANCHOR}`]: `url('${require('../../assets/mouse/mouse_add_anchor.svg')}') 8 0, auto`,
    [`${operatorCfg.EDIT_TYPES.DELETE_ANCHOR}`]: `url('${require('../../assets/mouse/mouse_delete_anchor.svg')}') 8 4, auto`
  },
  DRAW: {
    DEFAULT: `url('${require('../../assets/mouse/mouse_select.cur')}') 4 0, auto`,
    [calibrationCfg.TYPES
      .RECT]: `url('${require('../../assets/mouse/mouse_draw_rect.cur')}') 10 13, auto`,
    [calibrationCfg.TYPES
      .POLYGON]: `url('${require('../../assets/mouse/mouse_draw_polygon.cur')}') 8 0, auto`,
    [calibrationCfg.TYPES
      .ELLIPSE]: `url('${require('../../assets/mouse/mouse_draw_ellipse.cur')}') 10 13, auto`,
    [calibrationCfg.TYPES
      .LINE]: `url('${require('../../assets/mouse/mouse_draw_polygon.cur')}') 8 0, auto`,
    [calibrationCfg.TYPES
      .CHAIN]: `url('${require('../../assets/mouse/mouse_draw_polygon.cur')}') 8 0, auto`,
    [calibrationCfg.TYPES
      .ABCHAIN]: `url('${require('../../assets/mouse/mouse_draw_polygon.cur')}') 8 0, auto`,
    [calibrationCfg.TYPES
      .BACHAIN]: `url('${require('../../assets/mouse/mouse_draw_polygon.cur')}') 8 0, auto`,
    [calibrationCfg.TYPES
      .PIXEL]: `url('${require('../../assets/mouse/mouse_hand.cur')}') 10 13, auto`
  }
};
export default {
  STYLE_RATIO,
  THROTTLE_TIME,
  HOT_KEYS,
  CURSOR
};
