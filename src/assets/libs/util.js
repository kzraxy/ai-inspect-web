// 获取时间
exports.getDate = (timenow) => {
  let time = new Date(timenow) || new Date()
  let y = time.getFullYear()
  let m = time.getMonth() + 1
  m = m < 10 ? '0' + m : m
  let d = time.getDate()
  d = d < 10 ? '0' + d : d
  return (y + '-' + m + '-' + d)
}

// 获取URL搜索字符串
exports.getSearchParams = () => {
  // let queryStr = window.location.search.substring(1)
  let queryStr = window.location.href.split('?')[1] || ''
  let queryArr = queryStr.split('&')
  let result = {}
  for (let item of queryArr) {
    let arr = item.split('=')
    result[arr[0]] = arr[1]
  }
  return result
}

// 时间格式转成:2018-06-16 12:06:25
exports.getFormatTime = (time) => {
  time = time || null
  let date = new Date(time)
  let nowDate = date.getFullYear() + '-' + (date.getMonth() + 1 > 9 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1)) + '-' + (date.getDate() > 9 ? date.getDate() : '0' + date.getDate())
  let nowTime = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':' + (date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes()) + ':' + (date.getSeconds() > 9 ? date.getSeconds() : '0' + date.getSeconds())
  return nowDate + ' ' + nowTime
}

// 可以含有指定的特殊字符和中文英文数字
exports.checkSomeSpecial = (rule, value, callback) => {
  let pattern = new RegExp("[`!%$^&*=|{}':;',/?！￥……&*;———|{}‘；：”“'。，？\\\\]+")
  if (pattern.test(value)) {
    callback(new Error('不能包含. 、-_[]【】()（）#@~<>以外的特殊字符'))
  } else {
    callback()
  }
}
