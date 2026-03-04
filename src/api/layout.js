import http from '@/api/httpInstance'
var gateWayUrl = '/v1/inspect' // 网关的url
// 获取租户的所有算法模型，即所有表格等数据
export function getTablesData () {
  return http({
    url: gateWayUrl + '/algorithm/models/versions',
    method: 'get'
  })
}
// 获取Appkey等平台账号信息
export function getAccount () {
  return http({
    url: gateWayUrl + '/algorithm/accounts',
    method: 'get'
  })
}
// 添加平台账号
export function addAccount (data) {
  return http({
    url: gateWayUrl + `/algorithm/accounts`,
    method: 'post',
    data: data
  })
}
// 编辑平台账号
export function editAccount (data) {
  return http({
    url: gateWayUrl + `/algorithm/accounts/${data.accountId}`,
    method: 'put',
    data: data
  })
}
// 删除/重置平台账号
export function deleteAccount (data) {
  return http({
    url: gateWayUrl + `/algorithm/accounts/${data}`,
    method: 'delete'
  })
}
// 同步模型
export function synchronousModel (data) {
  return http({
    url: gateWayUrl + `/algorithm/accounts/models/actions/sync`,
    method: 'post',
    data: data
  })
}
// 是否展示一些提示信息
export function getShowTips () {
  return http({
    url: gateWayUrl + `/taskconfig/taskConfigs/isGotIt`,
    method: 'get'
  })
}
// 不再展示提示信息
export function neverNotify () {
  return http({
    url: gateWayUrl + `/taskconfig/taskConfigs/gotIt`,
    method: 'post'
  })
}
// 获取后台自定义的推理迁移日期
export function getStepDate () {
  return http({
    url: gateWayUrl + `/taskconfig/taskConfigs/getStepDate`,
    method: 'get'
  })
}
// 不再展示左侧菜单的提示信息
export function knowSideTips () {
  return http({
    url: gateWayUrl + `/algorithm/image/compare/know`,
    method: 'post'
  })
}
export function isGotIt () {
  return http({
    url: gateWayUrl + `/algorithm/tenantConfig/isGotIt`,
    method: 'get'
  })
}
export function knowTips (data) {
  return http({
    url: gateWayUrl + `/algorithm/tenantConfig/know`,
    method: 'post',
    data: data
  })
}
export function supportExtraTask () {
  return http({
    url: gateWayUrl + `/zyy/common/supportExtraTask`,
    method: 'get'
  })
}
export function getTenantDetail () {
  return http({
    method: 'get',
    url: '/v1/chain/basic/tenant/actions/getTenantDetail'
  })
}
export function refreshToken () {
  return http({
    method: 'get',
    url: gateWayUrl + '/taskconfig/taskConfigs/actions/refreshToken'
  })
}
export function getUserInfo () {
  return http({
    url: '/safe-center/v1/auth/personal',
    method: 'get'
  })
}
export function taskReanalysis (data) {
  return http({
    url: gateWayUrl + `/taskconfig/taskConfigs/taskReanalysis`,
    method: 'post',
    data: data
  })
}

export function getOSSOptionAPI (data) {
  return http({
    url: data.proxyUrl,
    method: 'get',
    data: data.params
  })
}

export function saveImgAPI (data) {
  return http({
    url: data.proxyUrl,
    method: 'post',
    data: data.params
  })
}

export function supportAiService () {
  return http({
    url: '/v1/event/center/web/manage/aiService/actions/support',
    method: 'get'
  })
}

export function exists (data) {
  return http({
    url: '/v1/inspect/taskconfig/serviceManage/action/exists',
    method: 'get',
    data
  })
}
export function getJumpInfo (data) {
  return http({
    method: 'get',
    url: `/v1/event/center/web/solutionTasks/actions/getJumpInfo`,
    data
  })
}

export function judgeAgreeAuthPopUp (data) {
  return http({
    method: 'get',
    url: `/v1/inspect/taskconfig/protocolAuth/actions/judgePopUp`,
    data
  })
}
export function agreeAuth (data) {
  return http({
    method: 'post',
    url: `/v1/inspect/taskconfig/protocolAuth/actions/agreeAuth`,
    data
  })
}

export function getConfiguration (data) {
  return http({
    url: `/safe-center/v1/auth/ssoConfiguration/actions/getConfiguration`,
    method: 'get',
    data
  })
}
export function getServiceType (data) {
  return http({
    url: `/safe-center/v1/auth/homepage/actions/getUserInfo`,
    method: 'get',
    data
  })
}