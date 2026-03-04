import http from '@/api/httpInstance'
var gateWayUrl = '/v1/inspect' // 网关的url
var chainBaseUrl = ''
// export default {
// 异步树
// getTreeNext (data) {
//   if (data.method === 'post') {
//     return axios('post', data.url, data.params ? data.params : '')
//   } else {
//     return axios('get', data.url, {
//       params: data.params ? data.params : ''
//     })
//   }
// },
// 搜索列表
// getStoreList (data) {
//   if (data.method === 'post') {
//     return axios('post', data.url, data.params ? data.params : '')
//   } else {
//     return axios('get', data.url, {
//       params: data.params ? data.params : ''
//     })
//   }
// }
export function getTreeNext (data) {
  return http({
    url: data.url,
    method: 'get',
    data: data.params
  })
  // return axios.get(data.url, {data: data.params ? data.params : ''})
}
// 搜索列表
export function getStoreList (data) {
  return http({
    url: data.url,
    method: 'get',
    data: data.params
  })
  // return axios.get(data.url, {data: data.params ? data.params : ''})
}
// 预置点通道平铺列表
export function getChannelPresetList (data) {
  return http({
    url: gateWayUrl + '/taskconfig/background/single/choice/list',
    method: 'post',
    data: data
  })
}
