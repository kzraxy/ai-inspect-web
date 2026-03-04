import http from './httpInstance'

export function getServiceManageInfo () {
  return http({
    method: 'get',
    url: '/v1/inspect/taskconfig/serviceManage'
  })
}

export function getQPSreport (data) {
  return http({
    url: '/v1/inspect/analysis/analysis/report',
    method: 'post',
    data: data
  })
}

export function getResourceDetail (data) {
  return http({
    url: `/v1/inspect/taskconfig/modelsCloud/${data.resourceId}/actions/getResourceDetail`,
    method: 'get',
    data: data
  })
}