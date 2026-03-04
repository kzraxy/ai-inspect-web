import http from '@/api/httpInstance'
var gateWayUrl = '/v1/inspect' // 网关的url

// 获取租户的所有算法模型，即所有表格等数据
export function getTablesData (data) {
  return http({
    url: gateWayUrl + '/algorithm/models/versions/pages',
    method: 'post',
    data: data
  })
}
// 更新算法模型及标签信息
export function editAlgorithmsModels (data) {
  return http({
    url: gateWayUrl + `/algorithm/models/trainVersion/${data.trainId}/labelInfos`,
    method: 'put',
    data: data.labelInfos
  })
}
// 获取租户列表
export function getTenantIdOptions () {
  return http({
    url: gateWayUrl + '/algorithm/manage/tenants',
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

export function getFocusAlgorithmList () {
  return http({
    url: gateWayUrl + `/algorithm/models/followedType`,
    method: 'get'
  })
}

// 获取所有关注的模型
export function getAlgorithmsListByName (data) {
  return http({
    url: gateWayUrl + `/algorithm/models/nameLike`,
    method: 'get',
    data: data
  })
}
// 获取所有算法列表
export function getAllAlgorithmsList () {
  return http({
    url: gateWayUrl + `/algorithm/models/info`,
    method: 'get'
  })
}
// 模型关注算法改变
export function changeFocusModelList (data) {
  return http({
    url: gateWayUrl + `/algorithm/models/info`,
    method: 'put',
    data: data
  })
}

// 按算法版本查询任务下发详情
export function getDeployDetail (data) {
  return http({
    url: gateWayUrl + `/taskconfig/self/upgrade/deployDetail`,
    method: 'post',
    data: data
  })
}

// 按算法版本查询自主进化详情
export function getUpgradeDetail (data) {
  return http({
    url: gateWayUrl + `/algorithm/self/upgrade/upgradeDetail`,
    method: 'get',
    data: data
  })
}

// 手动开启迭代任务
export function manualStart (data) {
  return http({
    url: gateWayUrl + `/algorithm/self/upgrade/manualStart`,
    method: 'post',
    data: data
  })
}

// 按算法版本查询测试集
export function getDataSet (data) {
  return http({
    url: gateWayUrl + `/algorithm/self/upgrade/dataSet`,
    method: 'get',
    data: data
  })
}

// 按算法版本查询测试集版本
export function getDataSetVersion (data) {
  return http({
    url: gateWayUrl + `/algorithm/self/upgrade/dataSetVersion`,
    method: 'get',
    data: data
  })
}

// 保存自主学习任务编辑结果
export function saveMission (data) {
  return http({
    url: gateWayUrl + `/algorithm/self/upgrade/mission`,
    method: 'post',
    data: data
  })
}

// 按算法版本查询测试集版本
export function getMission (data) {
  return http({
    url: gateWayUrl + `/algorithm/self/upgrade/mission`,
    method: 'get',
    data: data
  })
}
// 删除测试模型
export function deleteModel (data) {
  return http({
    url: gateWayUrl + `/algorithm/models/${data}`,
    method: 'delete'
  })
}
// 上传Jar文件接口
export function uploadApp (data) {
  return http({
    url: gateWayUrl + `/algorithm/models/upload/app`,
    method: 'post',
    data: data
  })
}
// 获取上传模型类型列表
export function getModelTypelList () {
  return http({
    url: gateWayUrl + `/algorithm/models/upload/modelType`,
    method: 'get'
  })
}
