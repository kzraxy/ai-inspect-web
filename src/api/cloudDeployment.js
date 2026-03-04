import http from '@/api/httpInstance'
var gateWayUrl = '/v1/inspect' // 网关的url

// 获取模型云部署信息
export function getCloudDeploymentNum () {
  return http({
    url: gateWayUrl + '/taskconfig/serviceManage',
    method: 'get'
  })
}

export function getCloudDeploymentList (data) {
  return http({
    url: gateWayUrl + '/taskconfig/modelsCloud/search',
    method: 'post',
    data: data
  })
}

export function offlineModel (data) {
  return http({
    url: gateWayUrl + '/algorithm/modelsCloud/deploy/actions/offline',
    method: 'post',
    data: data
  })
}
// 模糊查询关注的算法模型
export function queryModel (data) {
  return http({
    url: gateWayUrl + '/algorithm/models/nameLike',
    method: 'get',
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

export function deploymentModel (data) {
  return http({
    url: gateWayUrl + '/algorithm/modelsCloud/deploy',
    method: 'post',
    data: data
  })
}

export function setQPS (data) {
  return http({
    url: gateWayUrl + '/algorithm/modelsCloud/set/qps',
    method: 'post',
    data: data
  })
}
export function getAuthNum (data) {
  return http({
    url: gateWayUrl + '/taskconfig/tenantAuth/actions/getAuthInfo',
    method: 'get',
    data: data
  })
}