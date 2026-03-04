/*
 * @Description: status:
 * @Author: liushijie
 * @Date:2021-10-14 11:42
 * @Last Modified by: liushijie
 * @Last Modified Date:2021-10-14 11:42
 */
const NORMAL = 'normal';
const HOVER = 'hover';
const FOCUS = 'focus';
const ILLEGAL = 'illegal';
const STATUS_INFO = {
  [NORMAL]: { level: 1 },
  [HOVER]: { level: 2 },
  [FOCUS]: { level: 3 },
  [ILLEGAL]: { level: 4 }
};
export default {
  NORMAL,
  HOVER,
  FOCUS,
  ILLEGAL,
  STATUS_INFO
};
