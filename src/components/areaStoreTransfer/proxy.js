import http from '@/api/httpInstance'

// 获取门店列表
export function getStoreList (data) {
  return http({
    method: 'get',
    url: '/v1/chain/basic/stores/actions/findStoreListWithLimit',
    data: data
  })
}
// 取门店下所有的通道
export function findAllChannelsByStoreId (nodedata) {
  nodedata.storeId = nodedata.storeId ? nodedata.storeId : nodedata.nodeId
  return http({
    method: 'get',
    url: '/v1/chain/device/channels/actions/findAllChannelsByStoreIdNew',
    data: nodedata
  })
}
