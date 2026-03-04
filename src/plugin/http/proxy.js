import http from '@/api/httpInstance'
var chainBaseUrl = '' // 连锁接口
var gateWayUrl = '/v1/inspect' // 网关的url
// 刷新token
export function refreshWebToken () {
  return http({
    url: chainBaseUrl + '/v1/chain/basic/mainPages/actions/refreshWebToken',
    method: 'get'
  })
}
// ocx 初始化接口
export function getInitData (data) {
  return http({
    url: gateWayUrl + '/analysis/video/initParam',
    // url: chainBaseUrl + '/v1/chain/device/OCX/actions/findInitPara',
    method: 'get',
    data: data
  })
}
// ocx 环境配置接口
export function getInitConfig (data) {
  return http({
    url: chainBaseUrl + '/v1/basic/fetchConfig',
    method: 'post',
    data: data
  })
}
