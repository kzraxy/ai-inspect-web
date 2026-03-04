import http from '@/api/httpInstance'

export function delLabelCode(labelCodeId) {
  return http({
    url: `/v1/inspect/algorithm/labelCode/labelRelConfig/${labelCodeId}`,
    method: 'delete',
  })
}
export function getLabelRelConfigList(data) {
  return http({
    url: '/v1/inspect/algorithm/labelCode/getLabelRelConfigList',
    method: 'get',
    data: data
  })
}

export function labelRelConfig(data) {
  return http({
    url: `/v1/inspect/algorithm/labelCode/labelRelConfig`,
    method: 'post',
    data: data
  })
}
export function getLabelRelConfigInfo(labelCodeId) {
  return http({
    url: `/v1/inspect/algorithm/labelCode/getLabelRelConfigInfo/${labelCodeId}`,
    method: 'get',
  })
}
export function modelVersionLabelList() {
  return http({
    url: `/v1/inspect/algorithm/models/modelVersionLabelList`,
    method: 'get',
  })
}