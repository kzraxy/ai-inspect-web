import http from '@/api/httpInstance'
var chainBaseUrl = '' // 连锁接口
// 刷新token
export function refreshWebToken () {
  return http({
    url: chainBaseUrl + '/v1/chain/basic/mainPages/actions/refreshWebToken',
    method: 'get'
  })
}
export function getDeviceRamAccount (data) {
  return http({
    url: '/v1/inspect/analysis/video/deviceRamAccount',
    method: 'get',
    data: data
  })
}
export function uploadVideoEventLog (data) {
  return http({
    url: chainBaseUrl + '/v1/chain/videoplugin/log/actions/writeLog',
    method: 'post',
    data: { ...data, hideErrorMsg: true }
  })
}
// 查询租户使用哪种类型的token用于设备播放
export function getTokenStrategy(params) {
  return http({
    url: '/device-api/v1/carrier/account/tkToken/getTokenStrategy',
    method: 'get',
    data: params
  })
}
// 根据设备序列号和通道号查询设备的tkToken
export function getTkToken(data) {
  return http({
    url: `/device-api/v1/carrier/account/tkToken/getTkToken`,
    method: 'post',
    data: data
  })
}
// 获取设备验证码
export function getDeviceValidateCode (data) {
  return http({
    url: '/v1/chain/device/devices/actions/getDeviceValidateCode',
    method: 'get',
    data: data
  })
}