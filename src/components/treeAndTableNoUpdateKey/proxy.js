import http from '@/api/httpInstance'
var gateWayUrl = '/v1/inspect' // 网关的url
var chainBaseUrl = ''

// 获取ocx初始化数据，萤石token等
export function getInitData (data) {
  return http({
    url: gateWayUrl + '/analysis/video/initParam',
    method: 'get',
    data: data
  })
}
// 获取播放信息的验证码
export function getPlayInfoVerifyCode (data) {
  return http({
    url: gateWayUrl + '/analysis/video/playback/verifyCode',
    method: 'get',
    data: data
  })
}
// ocx 初始化接口
export function capPicture (data) {
  return http({
    url: gateWayUrl + '/patrol/inspectionComments/actions/synchronizedCapPicture',
    method: 'post',
    data: data
  })
}
// 获取设备验证码
export function getDeviceValidateCode (data) {
  return http({
    url: chainBaseUrl + '/v1/chain/device/devices/actions/getDeviceValidateCode',
    method: 'get',
    data: data
  })
}
// 获取和后端实时同步通道的key
export function getKey (data) {
  return http({
    url: gateWayUrl + `/taskconfig/channels/key`,
    method: 'get',
    data: data
  })
}
// 获取通道弹框里的设备和通道列表
export function getMonitors (data) {
  return http({
    url: gateWayUrl + '/taskconfig/taskConfigs/orgs/channels',
    method: 'get',
    data: data
  })
}
// 修改通道时实时保存数据
export function updateChannel (data) {
  return http({
    url: gateWayUrl + `/taskconfig/channels/channel`,
    method: 'post',
    data: data
  })
}
// 后端实时更新通道配置弹框的确定和取消操作
export function updateChoose (data) {
  return http({
    url: gateWayUrl + `/taskconfig/channels/confirm`,
    method: 'post',
    data: data
  })
}
// 修改预置点时实时保存数据
export function updatePreset (data) {
  return http({
    url: gateWayUrl + `/taskconfig/channels/preset`,
    method: 'post',
    data: data
  })
}
