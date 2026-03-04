import http from '@/api/httpInstance'
var gateWayUrl = '/v1/inspect' // 网关的url

// 获取合规分析配置的列表
export function getInspectionConfigList (data) {
  return http({
    url: gateWayUrl + '/zyy/extraTasks',
    method: 'get',
    data: data
  })
}
// 删除合规分析的列表项
export function delTask (data) {
  return http({
    url: gateWayUrl + `/zyy/extraTasks/actions/deleteTask`,
    method: 'post',
    data: data
  })
}
// 获取绘制区域规则、通道、预置点等信息
export function polygonRules (data) {
  return http({
    url: gateWayUrl + `/zyy/area/actions/getExtraTaskAreaPage`,
    method: 'get',
    data: data
  })
}
// 发起刷新抓图的请求
export function getNewPic (data) {
  return http({
    url: gateWayUrl + `/zyy/area/${data.extraTaskId}/${data.channelId}/actions/getNewPic`,
    method: 'get'
  })
}
// 获取刷新抓图图片的请求
export function returnNewPic (data) {
  return http({
    url: gateWayUrl + `/zyy/area/${data.channelId}/actions/returnNewPic`,
    method: 'get'
  })
}
// 获取当前图片信息
export function getCurrentDrawInfo (data) {
  return http({
    url: gateWayUrl + `/zyy/area/${data.channelId}/${data.areaTypeId}`,
    method: 'get'
  })
}
// 保存并下发绘制规则
export function saveDrawImg (data) {
  return http({
    url: gateWayUrl + `/zyy/area/${data.channelId}/${data.areaTypeId}`,
    method: 'post',
    data: data
  })
}
// 设备下发绘制规则
export function publishPolygonRules (data) {
  return http({
    url: gateWayUrl + `/taskconfig/polygonRules/actions/publishPolygonRules?taskId=${data.taskId}`,
    method: 'post',
    data: data
  })
}
// 创建合规检查任务
export function addExtraTasks (data) {
  return http({
    url: gateWayUrl + `/zyy/extraTasks`,
    method: 'post',
    data: data
  })
}
// 编辑合规检查任务
export function editExtraTasks (data) {
  return http({
    url: gateWayUrl + `/zyy/extraTasks/${data.extraTaskId}/edit`,
    method: 'post',
    data: data
  })
}
// 获取配置的详情
export function getExtraTasks (data) {
  return http({
    url: gateWayUrl + `/zyy/extraTasks/${data.extraTaskId}`,
    method: 'get'
  })
}
// 启用/禁用任务
export function changeState (data) {
  return http({
    url: gateWayUrl + `/zyy/extraTasks/${data.extraTaskId}/enable`,
    method: 'post',
    data: data
  })
}
export function getTriggerTaskIdList (data) {
  return http({
    url: gateWayUrl + `/taskconfig/taskConfigs/taskAndRule`,
    method: 'post'
  })
}
