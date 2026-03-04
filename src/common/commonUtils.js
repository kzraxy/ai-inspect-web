exports.setServiceType = function () {
  let href = window.location.href
  let serviceType = href.substring(href.lastIndexOf('/') + 1, href.length)
  return serviceType
}
exports.judgeEnv = () => { // 判断环境
  let env = window.location.origin ? window.location.origin : window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '')
  return env
}
