import http from '@/api/httpInstance'
export function getChannels (data) {
  return http({
    url: '/v1/inspect/taskconfig/channels/captureInfo',
    method: 'get',
    data: data
  })
}

export function getRootNode (data) {
  return http({
    url: `/safe-center/v1/auth/centerOrganization/actions/listOrganizationsByParentId`,
    method: 'get',
    data
  })
}