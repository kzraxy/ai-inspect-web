/*
 * @Description: operator:
 * @Author: liushijie
 * @Date:2021-10-14 16:21
 * @Last Modified by: liushijie
 * @Last Modified Date:2021-10-14 16:21
 */

const OPERATION_TYPES = {
  DRAW: 'draw',
  EDIT: 'edit'
};
const OPERATION_STATUS = {
  UNDO: 'undo',
  DOING: 'doing'
};
const SHORT_CUT = {
  CTRL: '17',
  SHIFT: '16'
};
const EDIT_TYPES = {
  RESET: 'reset', // 全局复位（默认一直可用，不可配置）
  ENLARGE: 'enlarge', // 全局缩放（默认一直可用，不可配置）
  ROTATE_IMAGE: 'rotateImage', // 旋转底图（默认一直可用，不可配置）
  MOVE_ALL: 'moveAll', // 全局移动
  DRAW_TAILOR: 'drawTailor', // 绘制裁剪
  ADJUST_IMAGE: 'adjustImage', // 调整裁剪
  MOVE_CALIBRATIONS: 'moveCalibrations', // 移动选中标注框
  ADJUST_CALIBRATION: 'adjustCalibration', // 调整标注框
  ROTATE_CALIBRATION: 'rotateCalibration', // 旋转标注框
  MOVE_IMAGE_AND_CALIBRATIONS: 'moveImageAndCalibrations', // 移动底图和所有标注框
  ADD_ANCHOR: 'addAnchor', // 增加锚点
  DELETE_ANCHOR: 'deleteAnchor' // 删除锚点
};
const EDIT_TYPES_INFO = {
  [EDIT_TYPES.MOVE_ALL]: { hideLabelList: false },
  [EDIT_TYPES.DRAW_TAILOR]: { hideLabelList: true },
  [EDIT_TYPES.ADJUST_IMAGE]: { hideLabelList: true },
  [EDIT_TYPES.MOVE_CALIBRATIONS]: { hideLabelList: true },
  [EDIT_TYPES.ADJUST_CALIBRATION]: { hideLabelList: true },
  [EDIT_TYPES.ROTATE_CALIBRATION]: { hideLabelList: true },
  [EDIT_TYPES.MOVE_IMAGE_AND_CALIBRATIONS]: { hideLabelList: true },
  [EDIT_TYPES.DELETE_ANCHOR]: { hideLabelList: true },
  [EDIT_TYPES.ADD_ANCHOR]: { hideLabelList: true }
};
const MAX_RATIO = 10; // 最大缩放比例（以复位时的比例为1）
const MIN_RATIO = 0.1; // 最小缩放比例（以复位时的比例为1）
// 操作动作
const MOTION_TYPES = {
  START: 'start',
  UPDATE: 'update',
  CONFIRM: 'confirm',
  FINISH: 'finish'
};
export default {
  OPERATION_TYPES,
  OPERATION_STATUS,
  SHORT_CUT,
  EDIT_TYPES,
  MAX_RATIO,
  MIN_RATIO,
  MOTION_TYPES,
  EDIT_TYPES_INFO
};
