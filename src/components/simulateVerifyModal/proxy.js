import http from '@/api/httpInstance'
// 获取设备验证码
export function getDeviceValidateCode (data) {
  return http({
    url: '/v1/chain/device/devices/actions/getDeviceValidateCode',
    method: 'get',
    data: data
  })
}
export function getMonitors (data) {
  return http({
    url: '/v1/inspect/taskconfig/taskConfigs/orgs/channels',
    method: 'get',
    data: data
  })
}

export function getCaptureImageList (data) {
  return http({
    url: '/v1/inspect/taskconfig/taskConfigs/actions/getCaptureImageList',
    method: 'get',
    data: data
  })
}

export function saveCaptureImage (data) {
  return http({
    url: '/v1/inspect/taskconfig/taskConfigs/actions/saveCaptureImage',
    method: 'post',
    data: data
  })
}
export function deleteCaptureImage (data) {
  return http({
    url: '/v1/inspect/taskconfig/taskConfigs/actions/deleteCaptureImage',
    method: 'post',
    data: data
  })
}

export function solutionApi (data) {
  return http({
    url: `/v1/event/center/web/solutionTasks/actions/submitAlgorithmTest`,
    method: 'post',
    data: data
  })
}

export function customizedApi (data) {
  return http({
    url: `/v1/inspect/taskconfig/taskConfigs/taskReanalysis`,
    method: 'post',
    data: data
  })
}