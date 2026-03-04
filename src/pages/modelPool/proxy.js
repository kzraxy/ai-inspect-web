import http from '@/api/httpInstance'

var gateWayUrl = '/v1/inspect' // 网关的url
var solutionGateWayUrl = '/v1/event/center'

export function getIndustryList (data) {
  return http({
    url: gateWayUrl + `/algorithm/domainModel/getIndustryList`,
    method: 'get',
    data: data
  })
}
export function searchKeyList (data) {
  return http({
    url: gateWayUrl + `/algorithm/domainModel/searchKeyList`,
    method: 'get',
    data: data
  })
}
export function searchModelPool (data) {
  return http({
    url: gateWayUrl + `/algorithm/domainModel/search`,
    method: 'post',
    data: data
  })
}
export function details (data) {
  return http({
    url: gateWayUrl + `/algorithm/domainModel/details`,
    method: 'get',
    data: data
  })
}
export function bindModel (data) {
  return http({
    url: gateWayUrl + `/algorithm/domainModel/bind`,
    method: 'get',
    data: data
  })
}
export function getPlatformTypeList (data) {
  return http({
    url: gateWayUrl + `/algorithm/domainModel/getPlatformTypeList`,
    method: 'get',
    data: data
  })
}
// 分页查询所有方案信息
export function getSolutionPage (data) {
  return http({
    url: `${solutionGateWayUrl}/web/solution/page`,
    method: 'post',
    data: data
  })
}
// 获取方案名称下拉列表
export function getSolutionList (data) {
  return http({
    url: `${solutionGateWayUrl}/web/solution/list`,
    method: 'get',
    data: data
  })
}
// 获取方案所有行业类型
export function getAllIndustry (data) {
  return http({
    url: `${solutionGateWayUrl}/web/solution/getAllIndustry`,
    method: 'get',
    data: data
  })
}
// 获取方案所有行业类型
export function getSolutionDetail (data) {
  return http({
    url: `${solutionGateWayUrl}/web/solution/detail`,
    method: 'get',
    data: data
  })
}
