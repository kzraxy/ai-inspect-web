/*
 * @Description: common:
 * @Author: liushijie
 * @Date:2021-09-29 16:36
 * @Last Modified by: liushijie
 * @Last Modified Date:2021-09-29 16:36
 */

function copy(data) {
  return JSON.parse(JSON.stringify(data));
}
function formatObj(targetObj, defaultObj) {
  if (typeof defaultObj === 'object') {
    if (typeof targetObj !== 'object') {
      targetObj = copy(defaultObj);
      return;
    }
    for (const key in defaultObj) {
      if (typeof targetObj[key] !== 'undefined') {
        formatObj(targetObj[key], defaultObj[key]);
      } else {
        targetObj[key] = copy(defaultObj[key]);
      }
    }
  }
  return targetObj;
}
function write(coordinates, bit = 0) {
  // coordinates.map(co => `${co.x.toFixed(bit)},${co.y.toFixed(bit)}`).join(' - ')
}
function sort(list, key) {
  return list.sort((a, b) => {
    return a[key] - b[key];
  });
}
export default {
  formatObj,
  copy,
  write,
  sort
};
