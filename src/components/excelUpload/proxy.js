import http from '@/api/httpInstance'
var gateWayUrl = '/v1/inspect' // 网关的url
// 获取导入的轮询id
export function importRuleChannelData (data) {
  return http({
    url: gateWayUrl + `/taskconfig/channels/importRuleChannelData`,
    method: 'post',
    data: data
  })
}
// 获取后端处理导入的结果
export function getImportResult (data) {
  return http({
    url: gateWayUrl + `/taskconfig/channels/getImportRuleChannelData`,
    method: 'get',
    data: data
  })
}

export function importAPI (data) {
  return http({
    url: data.url,
    method: 'post',
    data: data.params
  })
}