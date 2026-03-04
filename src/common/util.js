// 数字格式化
export function numberCutter (number, precision = 2) {
  var reg = /\d{1,3}(?=(\d{3})+$)/g
  if (number > 99999) {
    return (((number / 10000).toFixed(precision)) + '').replace(reg, '$&,')
  } else {
    return (number + '').replace(reg, '$&,')
  }
}

// 三点坐标计算夹角
/**
 *
 * @param {第一个点坐标, [x, y]} a
 * @param {第二个点坐标, [x, y]} b
 * @param {第三个点坐标, [x, y]} c
 */
export function changePointCoordinatesToAngle (a, b, c) {
  var ab = Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2))
  var ac = Math.sqrt(Math.pow(a[0] - c[0], 2) + Math.pow(a[1] - c[1], 2))
  var bc = Math.sqrt(Math.pow(b[0] - c[0], 2) + Math.pow(b[1] - c[1], 2))
  var cosB = (Math.pow(ab, 2) + Math.pow(bc, 2) - Math.pow(ac, 2)) / (2 * ab * bc)
  var angle = Math.round(Math.acos(cosB) * 180 / Math.PI)
  return angle
}
// 获取日期时间
export function getDateTime (timenow) {
  let time = new Date(timenow) || new Date()
  let y = time.getFullYear()
  let m = time.getMonth() + 1
  m = m < 10 ? '0' + m : m
  let d = time.getDate()
  d = d < 10 ? '0' + d : d
  let h = time.getHours()
  h = h < 10 ? '0' + h : h
  let mi = time.getMinutes()
  mi = mi < 10 ? '0' + mi : mi
  let s = time.getSeconds()
  s = s < 10 ? '0' + s : s
  return y + '-' + m + '-' + d + ' ' + h + ':' + mi + ':' + s
}
// 流量大小换算
export function changeSize (size) {
  if (!size) return '0B'
  var num = 1024
  if (size < num) {
    return size + 'B'
  }
  if (size < Math.pow(num, 2)) {
    return (size / num).toFixed(2) + 'K'
  }
  if (size < Math.pow(num, 3)) {
    return (size / Math.pow(num, 2)).toFixed(2) + 'M'
  }
  if (size < Math.pow(num, 4)) {
    return (size / Math.pow(num, 3)).toFixed(2) + 'G'
  }
  return (size / Math.pow(num, 4)).toFixed(2) + 'T'
}
// 获取客户端oss
export function getClient (sign) {
  return new window.OSS.Wrapper({
    accessKeyId: sign.accessKeyId,
    stsToken: sign.securityToken,
    accessKeySecret: sign.accessKeySecret,
    endpoint: sign.endpoint,
    bucket: sign.bucketName || sign.bucket,
    cname: sign.cname === 1,
    domain: sign.domain
  })
}
export function deepMerge(targetObj, defaultObj) {
  if (typeof defaultObj === 'object') {
    if (typeof targetObj !== 'object') {
      targetObj = defaultObj
      return
    }
    for (const key in defaultObj) {
      if (targetObj[key]) {
        deepMerge(targetObj[key], defaultObj[key])
      } else {
        targetObj[key] = defaultObj[key]
      }
    }
  }
  return targetObj
}
// 格式化日期
export function dateFormat (localDatetime, type) {
  if (!localDatetime) return ''
  const y = localDatetime.getFullYear()
  let m = localDatetime.getMonth() + 1
  m = m < 10 ? '0' + m : m
  let d = localDatetime.getDate()
  d = d < 10 ? '0' + d : d
  let h = localDatetime.getHours()
  h = h < 10 ? '0' + h : h
  let mi = localDatetime.getMinutes()
  mi = mi < 10 ? '0' + mi : mi
  if (type === 'time') return h + ':' + mi
  else if (type === 'datetime') return y + '-' + m + '-' + d + ' ' + h + ':' + mi
  else return y + '-' + m + '-' + d
}
export function isContained (a, b) {
  // a和b其中一个不是数组，直接返回false
  if (!(a instanceof Array) || !(b instanceof Array)) return false
  const len = b.length
  // a的长度小于b的长度，直接返回false
  if (a.length < len) return false
  for (let i = 0; i < len; i++) {
    // 遍历b中的元素，遇到a没有包含某个元素的，直接返回false
    if (!a.includes(b[i])) return false
  }
  // 遍历结束，返回true
  return true
}

export const checkCommonName = /^[a-zA-Z0-9\u4e00-\u9fa5`~!@#$^&()_+\-={}[\]; ,.，。：“”；‘’【】（）、？○≤《》≥￥]{1,9999}$/

// Base64数据转Blob（二进制大对象）
export function dataURLtoBlob(dataurl) {
  let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  while(n--){
      u8arr[n] = bstr.charCodeAt(n);
   }
  return new Blob([u8arr], {type:mime});
}