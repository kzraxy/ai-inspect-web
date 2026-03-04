import http from '@/api/httpInstance'
export function getTreeNext (data) {
  return http({
    url: data.url,
    method: 'get',
    data: data.params
  })
}
// 搜索列表
export function getStoreList (data) {
  return http({
    url: data.url,
    method: 'get',
    data: data.params
  })
}