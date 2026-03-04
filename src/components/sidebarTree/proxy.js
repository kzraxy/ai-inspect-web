import http from '@/api/httpInstance'
// 获取区域树数据
export function getAreaTree (data) {
  return http({
    method: 'get',
    url: '/v1/chain/basic/areas/actions/findAreaStoreTreeForBusiness',
    data: data
  })
}
// 通过区域名称获取区域Id
export function findAreaListByAreaName (data) {
  return http({
    method: 'get',
    url: '/v1/chain/basic/areas/actions/findAreaPageList',
    data: data
  })
}
// 搜索接口
export function searchPagedStore (data) {
  return http({
    method: 'get',
    url: '/v1/chain/basic/stores/actions/findStoresForBusiness',
    data: data
  })
}
