
import http from '@/api/httpInstance'

export function getAreaTree (data) {
  return http({
    url: '/v1/chain/basic/areas/actions/findAreaStoreTreeForBusiness',
    method: 'get',
    data: data
  })
}
export function findAreaListByAreaName (data) {
  return http({
    url: '/v1/chain/basic/areas/actions/findAreaPageList',
    method: 'get',
    data: data
  })
}
export function searchPagedStore (data) {
  return http({
    url: '/v1/chain/basic/stores/actions/findStoresForBusiness',
    method: 'get',
    data: data
  })
}
