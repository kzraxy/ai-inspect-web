import http from '@/api/httpInstance'
var gateWayUrl = '/v1/inspect' // 网关的url

// 平台算法模型，获取通道弹框里的设备和通道列表
export function getMonitors (data) {
  return http({
    url: gateWayUrl + '/taskconfig/taskConfigs/orgs/channels',
    method: 'get',
    data: data
  })
}
// 本地算法模型，获取通道弹框里的设备和通道列表
export function getLocalTaskMonitors (data) {
  return http({
    url: gateWayUrl + '/taskconfig/taskConfigs/orgs/localTask/actions/channels',
    method: 'get',
    data: data
  })
}
// 获取智能算法下拉框——已关注的算法
export function getAlgorithmsList (data) {
  return http({
    url: gateWayUrl + '/algorithm/models/nameLike',
    method: 'get',
    data: data
  })
}
// 任务配置里的算法新接口
export function getAlgorithmsListNew (data) {
  return http({
    url: gateWayUrl + '/algorithm/models/modify/nameLike',
    method: 'get',
    data: data
  })
}
// 根据算法模型获取算法版本下拉框
export function getAlgorithmsVisionList (data) {
  return http({
    url: gateWayUrl + '/algorithm/versions/info',
    method: 'get',
    data: data
  })
}
// 根据算法模型获取算法版本下拉框带是否部署状态
export function getAlgorithmsVisionListWithDeploymentStatus (data) {
  return http({
    url: gateWayUrl + '/algorithm/versions/info/all',
    method: 'get',
    data: data
  })
}
// 获取列表页的任务类型的下拉框
export function taskTypeList () {
  return http({
    url: gateWayUrl + '/algorithm/platforms',
    method: 'get'
  })
}
// 启用/禁用云端服务
export function changeState (data) {
  return http({
    url: gateWayUrl + '/taskconfig/taskConfigs/actions/enable',
    method: 'post',
    data: data
  })
}
// 平台算法，智能分析任务配置的编辑
export function editTask (data) {
  return http({
    url: gateWayUrl + `/taskconfig/taskConfigs/${data.taskId}`,
    method: 'put',
    data: data
  })
}
// 平台算法，智能分析任务配置的添加
export function addTask (data) {
  return http({
    url: gateWayUrl + '/taskconfig/taskConfigs',
    method: 'post',
    data: data
  })
}
// 本地算法，智能分析任务配置的编辑
export function editLocalTask (data) {
  return http({
    url: gateWayUrl + `/taskconfig/taskConfigs/${data.taskId}/actions/editLocalTask`,
    method: 'put',
    data: data
  })
}
// 本地算法，智能分析任务配置的添加
export function addLocalTask (data) {
  return http({
    url: gateWayUrl + '/taskconfig/taskConfigs/actions/addLocalTask',
    method: 'post',
    data: data
  })
}
// 获取智能分析配置的列表
export function getInspectionConfigList (data) {
  return http({
    url: gateWayUrl + '/taskconfig/taskConfigs',
    method: 'get',
    data: data
  })
}
// 获取算法配置的详情
export function getCaptureConfig (data) {
  return http({
    url: gateWayUrl + `/taskconfig/taskConfigs/${data.taskId}`,
    method: 'get'
  })
}
// 删除智能点检配置的列表项
export function delTask (data) {
  return http({
    url: gateWayUrl + `/taskconfig/taskConfigs/actions/deleteTask`,
    method: 'post',
    data: data
  })
}
// 重新下发
export function publishAgain (data) {
  return http({
    url: gateWayUrl + `/taskconfig/taskConfigs/deviceTaskInfos/actions/rePublish`,
    method: 'post',
    data: data
  })
}
// 获取分析规则的检测对象和对象属性的数组列表
export function getDetectionObjectList (id) {
  return http({
    url: gateWayUrl + `/algorithm/models/trainVersion/${id}/labelInfoTree`,
    method: 'get'
  })
}
// 获取绘制区域规则、通道、预置点等信息
export function polygonRules (data) {
  return http({
    url: gateWayUrl + `/taskconfig/polygonRules`,
    method: 'get',
    data: data
  })
}
// 发起刷新抓图的请求
export function getNewPic (data) {
  return http({
    url: gateWayUrl + `/taskconfig/polygonRules/actions/getNewPic?taskId=${data.taskId}&ruleId=${data.ruleId}`,
    method: 'post'
  })
}
// 获取刷新抓图图片的请求
export function returnNewPic (data) {
  return http({
    url: gateWayUrl + `/taskconfig/polygonRules/actions/returnNewPic`,
    method: 'get',
    data: data
  })
}
// 获取当前图片信息
export function getCurrentDrawInfo (data) {
  return http({
    url: gateWayUrl + `/taskconfig/polygonRules/${data.taskId}/${data.ruleId}`,
    method: 'get'
  })
}
// 保存并下发绘制规则
export function saveDrawImg (data) {
  return http({
    url: gateWayUrl + `/taskconfig/polygonRules/${data.taskId}/actions/savePolygonRule`,
    method: 'post',
    data: data
  })
}
// 批量复制绘制规则
export function copyPolygon (data) {
  return http({
    url: gateWayUrl + `/taskconfig/polygonRules/actions/copyPolygon`,
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
// 获取是否超限
export function getServiceLimitedInfo () {
  return http({
    url: gateWayUrl + `/taskconfig/taskConfigs/actions/islimited`,
    method: 'post'
  })
}

export function checkRepeatTaskName (data) {
  return http({
    url: gateWayUrl + `/taskconfig/taskConfigs/actions/check/${data.taskName}?taskId=${data.taskId}`,
    method: 'post'
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
// 修改通道时实时保存数据
export function updateChannel (data) {
  return http({
    url: gateWayUrl + `/taskconfig/channels/channel`,
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
// 后端实时更新删除操作
export function updateDelete (data) {
  return http({
    url: gateWayUrl + `/taskconfig/channels/delete`,
    method: 'delete',
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
// 获取通道修改操作的提示
export function updateChangeInfo (data) {
  return http({
    url: gateWayUrl + `/taskconfig/channels/diff/${data.key}`,
    method: 'get',
    data: data
  })
}
// 判断指定层级是否存在组合规则
export function isUniteRule (data) {
  return http({
    url: gateWayUrl + `/taskconfig/taskConfigs/field/config/isUniteRule`,
    method: 'post',
    data: data
  })
}
// 获取组合规则子树所有内容
export function getUniteRule (data) {
  return http({
    url: gateWayUrl + `/taskconfig/taskConfigs/field/config/getUniteRule`,
    method: 'post',
    data: data
  })
}
// 切换分析模式，后端实时更新删除操作
export function clearUpdateKeyData (data) {
  return http({
    url: gateWayUrl + `/taskconfig/channels/clear`,
    method: 'delete',
    data: data
  })
}
// 切换算法版本后，规则能否兼容
export function compatibleRules (data) {
  return http({
    url: gateWayUrl + `/algorithm/models/checkAlgCompatibility`,
    method: 'post',
    data: data
  })
}
// 查询默认的联动布防呢能力
export function getLinkageArming () {
  return http({
    url: gateWayUrl + `/taskconfig/taskConfigs/field/config/linkageArming`,
    method: 'get'
  })
}
// 根据算法类型和设备类型获取分析模式
export function getAnalysisMode (data) {
  return http({
    url: gateWayUrl + `/taskconfig/systemDeviceSupport/analysis/mode`,
    method: 'post',
    data: data
  })
}
// 根据算法类型、设备类型、分析模式获取规则列表
export function getTriggerType (data) {
  return http({
    url: gateWayUrl + `/taskconfig/systemDeviceSupport/analysis/triggerType`,
    method: 'post',
    data: data
  })
}
// 复制通道能力-任务列表查询
export function getDuplicateTaskList (data) {
  return http({
    url: gateWayUrl + `/taskconfig/taskConfigs/channel/copy/task/list`,
    method: 'post',
    data: data
  })
}
// 复制通道能力-通道列表查询
export function getDuplicateTaskChannels (data) {
  return http({
    url: gateWayUrl + `/taskconfig/taskConfigs/channel/copy/channel/list`,
    method: 'post',
    data: data
  })
}
// 二次过滤-检查规则是否被二次分析引用
export function checkRuleIsRefBySecondaryAnalysis (data) {
  return http({
    url: gateWayUrl + `/taskconfig/taskConfigs/checkRuleIsRefBySecondaryAnalysis`,
    method: 'get',
    data: data
  })
}
// 二次过滤-检查任务是否被二次分析引用
export function checkTaskIsRefBySecondaryAnalysis (data) {
  return http({
    url: gateWayUrl + `/taskconfig/taskConfigs/checkTaskIsRefBySecondaryAnalysis`,
    method: 'post',
    data: data
  })
}
// 二次过滤-云端任务查询
export function getTasksBySeconaryFilter (data) {
  return http({
    url: gateWayUrl + `/taskconfig/taskConfigs/getTasksBySeconaryFilter`,
    method: 'get',
    data: data
  })
}
// 二次过滤-任务规则查询
export function getTaskRulesBySeconaryFilter (data) {
  return http({
    url: gateWayUrl + `/taskconfig/taskConfigs/getTaskRulesBySeconaryFilter`,
    method: 'get',
    data: data
  })
}

// 获取哪些门店未关联场景
export function mismatchScene (data) {
  return http({
    method: 'post',
    url: '/v1/chain/patrol/captureConfigs/actions/mismatchScene',
    data: data
  })
}
export function getScenes () {
  return http({
    url: '/v1/chain/patrol/scenes',
    method: 'get',
    data: { pageNo: 1, pageSize: 200 }
  })
}
export function getConfigFields (data) {
  return http({
    url: gateWayUrl + `/taskconfig/taskConfigs/getConfigFields`,
    method: 'post',
    data
  })
}

export function getTaskEnableStatusNum () {
  return http({
    url: gateWayUrl + `/taskconfig/taskConfigs/actions/getTaskEnableStatusNum`,
    method: 'get'
  })
}
export function exportChannelTask (data) {
  return http({
    method: 'get',
    url: gateWayUrl + '/taskconfig/channels/exportTaskChannelData',
    data: data
  })
}
export function getExportChannelUrl (data) {
  return http({
    method: 'get',
    url: gateWayUrl + '/taskconfig/channels/getExportTaskChannelData',
    data: data
  })
}
export function getPresetNameConfigList () {
  return http({
    method: 'get',
    url: gateWayUrl + '/taskconfig/taskConfigs/actions/getPresetNameList',
  })
}
export function getSelectDropdownParamList () {
  return http({
    method: 'get',
    url: gateWayUrl + '/taskconfig/channelAreaConnect/param/list',
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
    url: gateWayUrl + `/taskconfig/channelAreaConnect/private/area/save`,
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
    url: gateWayUrl + `/taskconfig/channelAreaConnect/channel/list`,
    method: 'post',
    data
  })
}
export function getArea (data) {
  return http({
    method: 'get',
    url: gateWayUrl + '/taskconfig/channelAreaConnect/node/detail',
    data: data
  })
}
export function getRulesListByTaskId (data) {
  return http({
    method: 'get',
    url: gateWayUrl + '/taskconfig/channelAreaConnect/rules',
    data: data
  })
}
export function getOnlyLabelList (data) {
  return http({
    method: 'get',
    url: gateWayUrl + '/taskconfig/channelArea/getOnlyLabelList',
    data: data
  })
}
export function saveToConnect (data) {
  return http({
    url: gateWayUrl + `/taskconfig/channelAreaConnect/transform`,
    method: 'post',
    data
  })
}
export function batchConnect (data) {
  return http({
    url: gateWayUrl + `/taskconfig/channelAreaConnect/batch/connect`,
    method: 'post',
    data
  })
}
export function singleConnect (data) {
  return http({
    url: gateWayUrl + `/taskconfig/channelAreaConnect/connect`,
    method: 'post',
    data
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
export function getConnectStatus (data) {
  return http({
    method: 'get',
    url: gateWayUrl + '/taskconfig/channelAreaConnect/batch/connect/status',
    data: data
  })
}
export function getArrangeAlgorithmTab (data) {
  return http({
    method: 'get',
    url: gateWayUrl + '/algorithm/models/arrange/nodeInfo',
    data: data
  })
}
export function getGroupChannelsByAreaLableIds (data) {
  return http({
    url: gateWayUrl + `/taskconfig/taskConfigs/actions/getGroupChannelsByAreaLableIds`,
    method: 'post',
    data
  })
}
export function getAreaLableList (data) {
  return http({
    method: 'get',
    url: gateWayUrl + '/taskconfig/taskConfigs/actions/getAreaLableList',
    data: data
  })
}
export function getAbnormalInfo (data) {
  return http({
    method: 'get',
    url: gateWayUrl + '/taskconfig/channels/abnormalList',
    data: data
  })
}
export function handleAbnormal (data) {
  return http({
    method: 'post',
    url: gateWayUrl + '/taskconfig/channels/actions/handleAbnormal',
    data: data
  })
}
export function batchHandleAbnormal (data) {
  return http({
    method: 'post',
    url: gateWayUrl + '/taskconfig/channels/actions/batchHandleAbnormal',
    data: data
  })
}

export function getImageLibraryCanUseList (data) {
  return http({
    method: 'get',
    url: gateWayUrl + '/taskconfig/deviceRcImage/getImageLibraryCanUseList',
    data: data
  })
}

export function arrangelabelInfoTree (data) {
  return http({
    method: 'get',
    url: gateWayUrl + '/algorithm/models/trainVersion/arrangelabelInfoTree',
    data: data
  })
}

export function checkTaskLibraryIsExists (data) {
  return http({
    method: 'post',
    url: gateWayUrl + '/taskconfig/deviceRcImage/checkTaskLibraryIsExists',
    data: data
  })
}
export function getExportTaskId (data) {
  return http({
    method: 'get',
    url: gateWayUrl + '/taskconfig/taskConfigs/actions/exportTaskList',
    data: data
  })
}

export function getExportUrl (data) {
  return http({
    url: gateWayUrl + `/taskconfig/channels/getExportTaskInfo`,
    method: 'get',
    data
  })
}
export function getChannels (data) {
  return http({
    url: '/v1/inspect/taskconfig/channels/captureInfo',
    method: 'get',
    data: data
  })
}
export function realTimeCopyChannelByTask (data) {
  return http({
    method: 'post',
    url: '/v1/inspect/taskconfig/channels/realTimeCopyChannelByTask',
    data: data
  })
}
export function relChannelsByScene (data) {
  return http({
    method: 'post',
    url: '/v1/inspect/taskconfig/channels/actions/relChannelsByScene',
    data: data
  })
}
export function realTimeCopyChannelByAreaLables (data) {
  return http({
    method: 'post',
    url: '/v1/inspect/taskconfig/channels/realTimeCopyChannelByAreaLables',
    data: data
  })
}
export function deleteTaskChannel (data) {
  return http({
    method: 'post',
    url: '/v1/inspect/taskconfig/channels/deleteTaskChannel',
    data: data
  })
}
export function getPageGroupChannelsByAreaLableIds (data) {
  return http({
    method: 'post',
    url: '/v1/inspect/taskconfig/taskConfigs/actions/getPageGroupChannelsByAreaLableIds',
    data: data
  })
}
export function getScoreFilterData (data) {
  return http({
    url: '/v1/inspect/algorithm/models/arrange/ability',
    method: 'get',
    data: data
  })
}
export function exportChannels (data) {
  return http({
    url: `/v1/inspect/taskconfig/channels/actions/export`,
    method: 'post',
    data
  })
}
export function getDownLoadUrl () {
  return http({
    url: `/v1/inspect/taskconfig/channels/actions/downLoad`,
    method: 'get'
  })
}