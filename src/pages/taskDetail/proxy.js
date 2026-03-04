// import axios from 'axios'
import http from '@/api/httpInstance'

var gateWayUrl = '/v1/inspect' // 网关的url

// 模糊匹配组织
export function queryStore (taskId) {
  return http({
    url: `${gateWayUrl}/taskconfig/taskConfigs/${taskId}/taskGroups`,
    method: 'get'
  })
}
// 获取通道列表
export function queryChannelList (data) {
  return http({
    url: `${gateWayUrl}/analysis/search/channels`,
    method: 'post',
    data: data
  })
}
// 获取标签集合
export function queryLabelList (taskId) {
  return http({
    url: `${gateWayUrl}/analysis/labels/${taskId}`,
    method: 'get'
  })
}
// 获取语义分割的渲染标签
export function getDetectionObjectList (id) {
  return http({
    url: gateWayUrl + `/algorithm/models/trainVersion/${id}/labelInfoTree`,
    method: 'get'
  })
}
// 获取视频播放的参数
export function getChannelParams (data) {
  return http({
    url: gateWayUrl + `/tasks/channels/${data.channelId}`,
    method: 'get'
  })
}

// 获取任务详情
export function queryTaskDetail (taskId) {
  return http({
    url: gateWayUrl + `/taskconfig/taskConfigs/${taskId}`,
    method: 'get'
  })
}

// 获取设备下发状态列表
export function queryDeviceStatusList (data) {
  return http({
    url: gateWayUrl + `/taskconfig/taskConfigs/deviceTaskInfos`,
    method: 'get',
    data: data
  })
}

// 重新下发设备
export function sendDeivceAjax (data) {
  return http({
    url: gateWayUrl + `/taskconfig/taskConfigs/deviceTaskInfos/actions/rePublish`,
    method: 'post',
    data: data
  })
}

// 作废照片
export function invalidAjax (data) {
  return http({
    url: gateWayUrl + `/analysis/feedback/${data.rowKey}`,
    method: 'post',
    data: data
  })
}

// 删除任务
export function deleteTaskAjax (data) {
  return http({
    url: gateWayUrl + `/taskconfig/taskConfigs/actions/deleteTask`,
    method: 'post',
    data: data
  })
}

// 修改状态
export function changeStatus (data) {
  return http({
    url: gateWayUrl + `/taskconfig/taskConfigs/actions/enable`,
    method: 'post',
    data: data
  })
}

// 获取萤石Token
export function getEZUIKitToken (data) {
  return http({
    url: gateWayUrl + `/analysis/actions/getCameraReplayToken`,
    method: 'post',
    data: data
  })
}

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
// 设置用户标签选择偏好（添加标签弹框的确认接口）
export function addLabel (data) {
  return http({
    url: gateWayUrl + `/analysis/userPreference/tasks/${data.taskId}/labels`,
    method: 'put',
    data: data
  })
}
// 获取用户标签筛选偏好（详情页获取标签的接口）
export function getLabel (data) {
  return http({
    url: gateWayUrl + `/analysis/count/results`,
    method: 'post',
    data: data
  })
}
// 数据批量回传
export function feedback (data) {
  return http({
    url: gateWayUrl + `/analysis/feedback`,
    method: 'post',
    data: data
  })
}
// 更新算法优化状态的接口
export function updateFeedback (data) {
  return http({
    url: gateWayUrl + `/analysis/feedback/${data.rowKey}?feedback=${data.feedback}`,
    method: 'get'
  })
}
// 作废某通道的某个图片分析结果
export function invalidPic (data) {
  return http({
    url: gateWayUrl + `/analysis/feedback/invalidPic`,
    method: 'get',
    data: data
  })
}
// 回传图片数据
export function backPic (data) {
  return http({
    url: gateWayUrl + `/analysis/feedback/backPic`,
    method: 'get',
    data: data
  })
}
// 配置回传不再提示的接口
export function updateFeedbackConfig (data) {
  return http({
    url: gateWayUrl + `/taskconfig/taskConfigs/${data.taskId}/actions/updateFeedbackConfig`,
    method: 'put',
    data: data
  })
}
// 是否存在回传中的任务
export function existsRunningFeedback () {
  return http({
    url: gateWayUrl + `/analysis/feedback/actions/existsRunningFeedback`,
    method: 'get'
  })
}
// 导出数据
export function exportTask (data) {
  return http({
    url: gateWayUrl + `/analysis/results/actions/export`,
    method: 'post',
    data: data
  })
}
// 获取导出数据的url
export function getUrl (data) {
  return http({
    url: gateWayUrl + `/analysis/results/actions/getExportTaskInfo`,
    method: 'get',
    data: data
  })
}

// 获取任务详情
export function editPolygonDisplay (taskId, data) {
  return http({
    url: gateWayUrl + `/taskconfig/taskConfigs/${taskId}/polygonDisplay`,
    method: 'put',
    data
  })
}

// 查询任务已配置的算法版本列表
export function getAlgorithmVersionList (taskId, data) {
  return http({
    url: gateWayUrl + `/analysis/${taskId}/algorithmVersion`,
    method: 'post',
    data
  })
}

// DCT4算法查询任务下发状态
export function queryDCT4Status (data) {
  return http({
    url: gateWayUrl + `/taskconfig/taskConfigs/DCT4/status`,
    method: 'get',
    data
  })
}

// DCT4算法任务重新下发
export function republishDCT4 (data) {
  return http({
    url: gateWayUrl + `/taskconfig/taskConfigs/DCT4/rePublish`,
    method: 'post',
    data
  })
}
// 获取数据回传的门店树
export function getStoreTree (data) {
  return http({
    url: gateWayUrl + `/taskconfig/channels/storelist`,
    method: 'get',
    data: data
  })
}
// 获取数据回传的门店对应的通道数据
export function getDeviceOptions (data) {
  return http({
    url: gateWayUrl + `/taskconfig/channels/channellist`,
    method: 'get',
    data: data
  })
}
export function controlApp (data) {
  return http({
    url: gateWayUrl + `/taskconfig/deviceInfo/controlApp`,
    method: 'get',
    data: data
  })
}
export function getAppInfo (data) {
  return http({
    url: gateWayUrl + `/taskconfig/deviceInfo/getAppInfo`,
    method: 'get',
    data: data
  })
}
export function getHEOPResource (data) {
  return http({
    url: gateWayUrl + `/taskconfig/deviceInfo/getHEOPResource`,
    method: 'get',
    data: data
  })
}
export function getSystemDeviceInfo (data) {
  return http({
    url: gateWayUrl + `/taskconfig/deviceInfo/getSystemDeviceInfo`,
    method: 'get',
    data: data
  })
}
export function getBasicDeviceInfo (data) {
  return http({
    url: gateWayUrl + `/taskconfig/deviceInfo/getDeviceInfo`,
    method: 'get',
    data: data
  })
}
// 获取重定向后图片url
export function getRedirectUrl (data) {
  return http({
    url: gateWayUrl + `/taskconfig/taskConfigs/get/download/url`,
    method: 'post',
    data
  })
}
export function getTaskNewPic (data) {
  return http({
    url: gateWayUrl + `/taskconfig/channels/getNewPic`,
    method: 'get',
    data: data
  })
}
export function returnTaskNewPic (data) {
  return http({
    url: gateWayUrl + `/taskconfig/channels/returnNewPic`,
    method: 'get',
    data: data
  })
}
export function exportCaptureInfo (data) {
  return http({
    url: gateWayUrl + `/taskconfig/channels/exportCaptureInfo`,
    method: 'get',
    data
  })
}
export function getExportTaskInfo (data) {
  return http({
    url: gateWayUrl + `/taskconfig/channels/getExportTaskInfo`,
    method: 'get',
    data
  })
}
export function getCaptureQualityType () {
  return http({
    url: gateWayUrl + `/taskconfig/channels/captureQuality`,
    method: 'get'
  })
}
export function getCaptureStatus (data) {
  return http({
    url: gateWayUrl + `/taskconfig/channels/captureStatus`,
    method: 'get',
    data
  })
}
export function captureInfo (data) {
  return http({
    url: gateWayUrl + `/taskconfig/channels/captureInfo`,
    method: 'get',
    data
  })
}
export function resetCaptureInfo (data) {
  return http({
    url: gateWayUrl + `/taskconfig/channels/resetCaptureInfo`,
    method: 'post',
    data
  })
}
export function getAllRecognition (data) {
  return http({
    url: gateWayUrl + `/analysis/single/alg/all/result`,
    method: 'post',
    data
  })
}
export function getPicInfo (data) {
  return http({
    url: gateWayUrl + `/taskconfig/channels/getPic`,
    method: 'get',
    data
  })
}
export function uploadApp (data) {
  return http({
    url: gateWayUrl + `/algorithm/models/upload/app`,
    method: 'post',
    data: data
  })
}
export function taskReanalysis (data) {
  return http({
    url: gateWayUrl + `/taskconfig/taskConfigs/taskReanalysis`,
    method: 'post',
    data: data
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
export function feedbackV2 (data) {
  return http({
    url: gateWayUrl + `/analysis/feedbackV2`,
    method: 'post',
    data
  })
}
export function getRuleList (data) {
  return http({
    url: gateWayUrl + `/analysis/taskRules`,
    method: 'get',
    data
  })
}
export function markResultProxy (data) {
  return http({
    url: gateWayUrl + `/analysis/markResult`,
    method: 'post',
    data
  })
}
export function getDisplayPicNewInfo (data) {
  return http({
    url: gateWayUrl + `/analysis/getOneAIResult`,
    method: 'get',
    data
  })
}
export function getImageMarkResult (data) {
  return http({
    url: gateWayUrl + `/analysis/pic/verify/report`,
    method: 'post',
    data
  })
}
export function getTargetMarkResult (data) {
  return http({
    url: gateWayUrl + `/analysis/target/verify/report`,
    method: 'post',
    data
  })
}
export function markTargetResult (data) {
  return http({
    url: gateWayUrl + `/analysis/markTargetResult`,
    method: 'post',
    data
  })
}
export function markTargetMiss (data) {
  return http({
    url: gateWayUrl + `/analysis/target/verify/single/row/miss/update`,
    method: 'post',
    data
  })
}
export function getMiss (data) {
  return http({
    url: gateWayUrl + `/analysis/target/verify/single/row/miss`,
    method: 'post',
    data
  })
}
export function getAlgorithmLabelInfoTreeByTaskId (data) {
  return http({
    url: `/v1/event/center/web/rules/aiinput/task/actions/getAlgorithmLabelInfoTreeByTaskId`,
    method: 'get',
    data
  })
}
export function searchTaskInfos (data) {
  return http({
    url: `/v1/inspect/analysis/aiconfidence/action/searchTaskInfos`,
    method: 'post',
    data
  })
}
export function addSearchTask (data) {
  return http({
    url: `/v1/inspect/analysis/aiconfidence/action/addSearchTask`,
    method: 'post',
    data
  })
}
export function searchTaskDetail (data) {
  return http({
    url: `/v1/inspect/analysis/aiconfidence/action/searchTaskDetail`,
    method: 'post',
    data
  })
}