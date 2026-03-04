// import axios from 'axios'
import http from '@/api/http'
// 获取组织树
export function getStoreTree (data) {
  return http({
    url: '/control/pos/stores/storeTreeByUserIdAndAreaIdAll',
    methods: 'post',
    data: data
  })
  // return axios.post('/control/pos/stores/storeTreeByUserIdAndAreaIdAll', data)
}
// 根据用户去获取区域组织树
export function getStoreTreeByUserIdAreaId (data) {
  return http({
    url: '/control/pos/stores/storeTreeByUserIdAreaId',
    methods: 'post',
    data: data
  })
  // return axios.post('/control/pos/stores/storeTreeByUserIdAreaId', data)
}
// 搜索组织
export function storeInfo (data) {
  return http({
    url: '/control/pos/stores/fetchStoreInfo',
    methods: 'post',
    data: data
  })
  // return axios.post('/control/pos/stores/fetchStoreInfo', {...data})
}
