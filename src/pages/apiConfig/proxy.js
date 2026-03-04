import http from '@/api/httpInstance'
var gateWayUrl = '/v1/inspect' // 网关的url

// 查询qps表格
export function apideploys (data) {
  return http({
    url: gateWayUrl + `/algorithm/apideploys`,
    method: 'get',
    data: data
  })
}
// 查询qps部署详细信息
export function apideploysDetail (id) {
  return http({
    url: gateWayUrl + `/algorithm/apideploys/${id}`,
    method: 'get',
  })
}
// 新建api部署
export function addApiProxy (data) {
  return http({
    url: gateWayUrl + `/algorithm/apideploys`,
    method: 'post',
    data: data
  })
}
// 修改api配置部署
export function editApiProxy (data) {
  return http({
    url: gateWayUrl + `/algorithm/apideploys/${data.id}`,
    method: 'put',
    data: data
  })
}
export function getModelVersion (data) {
  return http({
    url: gateWayUrl + '/algorithm/versionsCloud/info',
    method: 'get',
    data: data
  })
}
export function getAlgorithmsList (data) {
  return http({
    url: gateWayUrl + '/algorithm/models/nameLike',
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
// 删除
export function delAPI (data) {
  return http({
    url: gateWayUrl + `/algorithm/apideploys/actions/batchDelete`,
    method: 'post',
    data: data
  })
}
// qps授权量量查询
export function getQpsAuthNum (data) {
  return http({
    url: gateWayUrl + '/taskconfig/tenantAuth/actions/getAuthInfo',
    method: 'get',
    data: data
  })
}
export function changeState (data) {
  return http({
    url: '/v1/inspect/algorithm/apideploys/actions/enable',
    method: 'post',
    data: data
  })
}