import http from '@/api/httpInstance'


export function getIndustryList (data) {
  return http({
    url: '/v1/event/center/web/solution/getAllIndustry',
    method: 'get',
    data: data
  })
}
export function getSolutionPage (data) {
  return http({
    url: `/v1/event/center/web/solution/page`,
    method: 'post',
    data: data
  })
}
export function searchSolutionKeyList (data) {
  return http({
    url: `/v1/event/center/web/solution/list`,
    method: 'get',
    data: data
  })
}
export function exportEventDetail(data) {
  return http({
    method: 'post',
    url: '/v1/inspect/analysis/diana/results/export',
    data,
  })
}
export function getSolutionTaskList (data) {
  return http({
    url: '/v1/event/center/web/solutionTasks',
    method: 'get',
    data: data
  })
}
export function getDetailBySolutionId (data) {
  return http({
    url: '/v1/event/center/web/solution/detail',
    method: 'get',
    data: data
  })
}
export function readParamAndDefault (data) {
  return http({
    url: '/v1/event/center/web/solutionTasks/actions/readParamAndDefault',
    method: 'get',
    data: data
  })
}
// 不分页图集
export function getImageLibraryList (data) {
  return http({
    method: 'get',
    url: '/v1/inspect/taskconfig/deviceRcImage/getImageLibraryList',
    data
  })
}
// 分页图集
export function pageImageLibraryList (params) {
  return http({
    method: 'get',
    url: '/v1/inspect/taskconfig/deviceRcImage/pageImageLibraryList',
    data: params
  })
}
export function getSolutionTaskConfigInfo (data) {
  return http({
    method: 'get',
    url: `/v1/event/center/web/solutionTasks/${data.solutionTaskId}`,
    data
  })
}
export function enableSolutionTask (data) {
  return http({
    method: 'put',
    url: `/v1/event/center/web/solutionTasks/${data.solutionTaskId}/actions/enable`,
    data
  })
}
export function addChannels (data) {
  return http({
    url: `/v1/event/center/web/solutionTasks/channels/actions/addChannels`,
    method: 'post',
    data: data
  })
}
export function delChannels (data) {
  return http({
    url: `/v1/event/center/web/solutionTasks/channels/actions/delChannels`,
    method: 'post',
    data: data
  })
}
export function addSolutionTask (data) {
  return http({
    url: `/v1/event/center/web/solutionTasks`,
    method: 'post',
    data: data
  })
}
export function editSolutionTask (data) {
  return http({
    url: `/v1/event/center/web/solutionTasks/${data.solutionTaskId}`,
    method: 'put',
    data: data
  })
}
export function copySolutionTask (data) {
  return http({
    url: `/v1/event/center/web/solutionTasks/${data.solutionTaskId}`,
    method: 'put',
    data: data
  })
}
export function checkRepeatSolutuonTaskName (data) {
  return http({
    url: `/v1/event/center/web/solutionTasks/actions/checkSolutionTaskNameExist`,
    method: 'get',
    data: data
  })
}

export function getAllChannelsPage (data) {
  return http({
    method: 'POST',
    url: `/v1/event/center/web/solutionTasks/${data.solutionTaskId}/channels/actions/allChannelsWithSelectedLabel`,
    data
  })
}
export function getUsedChannelsPage (data) {
  return http({
    method: 'POST',
    url: `/v1/event/center/web/solutionTasks/${data.solutionTaskId}/channels/actions/getSelectedChannels`,
    data
  })
}
export function getNoUsedChannelsPage (data) {
  return http({
    method: 'POST',
    url: `/v1/event/center/web/solutionTasks/${data.solutionTaskId}/channels/actions/getUnselectedChannels`,
    data
  })
}

export function deleteSolutionTask (data) {
  return http({
    method: 'delete',
    url: `/v1/event/center/web/solutionTasks/${data.solutionTaskId}`,
  })
}
export function getEnableDisableCount (data) {
  return http({
    url: `/v1/event/center/web/solutionTasks/actions/getEnableDisableCount`,
    method: 'get',
    data: data
  })
}
export function getOrgs (data) {
  return http({
    url: `/v1/inspect/taskconfig/taskConfigs/orgsForLine`,
    method: 'get',
    data: data
  })
}
export function getOnlyLabelList (data) {
  return http({
    method: 'get',
    url: '/v1/inspect/taskconfig/channelArea/getOnlyLabelList',
    data: data
  })
}

export function checkEnough (data) {
  return http({
    url: `/v1/event/center/web/solutionTasks/actions/checkEnough`,
    method: 'get',
    data: data
  })
}
export function addPreset (data) {
  return http({
    method: 'POST',
    url: `/v1/event/center/web/solutionTasks/channels/actions/addChannelPresets`,
    data
  })
}
export function delPreset (data) {
  return http({
    method: 'POST',
    url: `/v1/event/center/web/solutionTasks/channels/actions/delChannelPresets`,
    data
  })
}

export function getRelationGroupList (data) {
  return http({
    url: `/v1/event/center/web/solutionTasks/${data.solutionTaskId}/groups/actions/relationGroup`,
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

export function submitAlgorithmTest (data) {
  return http({
    url: `/v1/event/center/web/solutionTasks/actions/submitAlgorithmTest`,
    method: 'post',
    data: data
  })
}
export function queryTestChannelList (data) {
  return http({
    url: `/v1/inspect/analysis/search/channelsTest`,
    method: 'post',
    data: data
  })
}
export function getDisplayPicNewInfo (data) {
  return http({
    url: `/v1/inspect/analysis/getOneAIResultTest`,
    method: 'get',
    data
  })
}
export function getRelDianaTaskId (data) {
  return http({
    url: `/v1/event/center/web/solutionTasks/actions/getRelDianaTaskId`,
    method: 'get',
    data: data
  })
}
export function signResultStatus (data) {
  return http({
    url: `/v1/inspect/analysis/signResultStatus`,
    method: 'post',
    data
  })
}
export function getImageMarkResult (data) {
  return http({
    url: `/v1/inspect/analysis/pic/verify/report`,
    method: 'post',
    data
  })
}
export function getTargetMarkResult (data) {
  return http({
    url: `/v1/inspect/analysis/target/verify/report`,
    method: 'post',
    data
  })
}
export function markResultProxy (data) {
  return http({
    url: `/v1/inspect/analysis/markResult`,
    method: 'post',
    data
  })
}
export function markTargetResult (data) {
  return http({
    url: `/v1/inspect/analysis/markTargetResult`,
    method: 'post',
    data
  })
}
export function getRedirectUrl (data) {
  return http({
    url: `/v1/inspect/taskconfig/taskConfigs/get/download/url`,
    method: 'post',
    data
  })
}
export function convertToDianaRule (data) {
  return http({
    url: `/v1/event/center/web/solutionTasks/actions/convertToDianaRule`,
    method: 'post',
    data
  })
}
export function getDownLoadUrl () {
  return http({
    url: `/v1/event/center/web/solutionTasks/channels/actions/downLoad`,
    method: 'get'
  })
}
export function exportChannels (data) {
  return http({
    url: `/v1/event/center/web/solutionTasks/channels/actions/export`,
    method: 'post',
    data
  })
}