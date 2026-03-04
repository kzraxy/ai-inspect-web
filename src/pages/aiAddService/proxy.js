import http from '@/api/httpInstance'
export function getAlarmMessages (data) {
  return http({
    url: '/v1/event/center/web/manage/aiService/message/actions/getTenantMsg',
    method: 'get',
    data: data
  })
}
export function getOperationPic (data) {
  return http({
    url: '/v1/event/center/web/messages/actions/readRefBaseOnInfo',
    method: 'get',
    data: data
  })
}
export function getScenariosTypeOptional (data) {
  return http({
    url: '/v1/event/center/web/addedService/actions/getScenariosTypeOptional',
    method: 'get',
    data: data
  })
}
export function getPaidOrderByProductType (data) {
  return http({
    url: '/v1/crain/tenant/clicense/web/manage/userOrder/actions/getPaidOrderByProductType',
    method: 'get',
    data: data
  })
}
export function getExportTaskId (data) {
  return http({
    method: 'post',
    url: '/v1/crain/tenant/clicense/web/manage/userOrder/actions/exportPaidOrderByProductType',
    data: data
  })
}
export function getExportUrl (data) {
  return http({
    url: `/v1/crain/tenant/clicense/web/manage/userOrder/actions/getExportStatus`,
    method: 'get',
    data
  })
}

export function getByBizType (data) {
  return http({
    url: `/v1/crain/tenant/clicense/web/manage/consumer/products/actions/getProductsByBizType`,
    method: 'get',
    data
  })
}

export function getStatisticData (data) {
  return http({
    url: `/v1/event/center/web/manage/aiscenarios/statistic/actions/overview`,
    method: 'get',
    data
  })
}

export function getRootNode (data) {
  return http({
    url: `/safe-center/v1/auth/centerOrganization/actions/listOrganizationsByParentId`,
    method: 'get',
    data
  })
}