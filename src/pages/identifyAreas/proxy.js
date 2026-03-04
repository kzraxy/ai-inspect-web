import http from '@/api/httpInstance'
var gateWayUrl = '/v1/inspect' // 网关的url

export function getIdentifyAreasParamList () {
  return http({
    method: 'get',
    url: gateWayUrl + '/taskconfig/channelArea/paramList',
  })
}
export function getLabelList (data) {
  return http({
    method: 'get',
    url: gateWayUrl + '/taskconfig/channelArea/getLabelList',
    data: data
  })
}
export function modifyLabelClass (data) {
  return http({
    url: gateWayUrl + `/taskconfig/channelArea/modifyLabelClass`,
    method: 'post',
    data
  })
}
export function modifyLabel (data) {
  return http({
    url: gateWayUrl + `/taskconfig/channelArea/modifyLabel`,
    method: 'post',
    data
  })
}
export function modifyArea (data) {
  return http({
    url: gateWayUrl + `/taskconfig/channelArea/modifyArea`,
    method: 'post',
    data
  })
}
export function getAreaPicSatus (data) {
  return http({
    url: gateWayUrl + `/taskconfig/channelAreaConnect/background/pic/status`,
    method: 'post',
    data
  })
}
export function getNewDrawRulePic (data) {
  return http({
    url: gateWayUrl + `/taskconfig/channelAreaConnect/background/pic/start`,
    method: 'post',
    data
  })
}
export function getLeftChannelListList (data) {
  return http({
    url: gateWayUrl + `/taskconfig/channelArea/channelList`,
    method: 'post',
    data
  })
}
export function getArea (data) {
  return http({
    method: 'post',
    url: gateWayUrl + '/taskconfig/channelArea/getArea',
    data: data
  })
}
export function deleteLabel (data) {
  return http({
    method: 'get',
    url: gateWayUrl + '/taskconfig/channelArea/deleteLabel',
    data: data
  })
}
export function deleteLabelClass (data) {
  return http({
    method: 'get',
    url: gateWayUrl + '/taskconfig/channelArea/deleteLabelClass',
    data: data
  })
}

export function getDrawCount () {
  return http({
    method: 'get',
    url: gateWayUrl + '/taskconfig/channelArea/drawCount',
  })
}

export function getTaskList (data) {
  return http({
    method: 'get',
    url: gateWayUrl + '/taskconfig/taskConfigs/getTaskListByDrawArea',
    data: data
  })
}
export function getSolutionTaskList (data) {
  return http({
    method: 'get',
    url: '/v1/event/center/web/solutionTasks/actions/getSolutionTaskOptionalPage',
    data: data
  })
}
export function areaDrawingStatistics (data) {
  return http({
    url: gateWayUrl + `/taskconfig/channelArea/areaDrawingStatistics`,
    method: 'post',
    data: data
  })
}

export function areaDrawingConfig () {
  return http({
    method: 'get',
    url: '/v1/inspect/taskconfig/channelArea/areaDrawingConfig',
  })
}


export function areaDrawingExport (data) {
  return http({
    url: gateWayUrl + `/taskconfig/channelArea/areaDrawingExport`,
    method: 'post',
    data: data
  })
}