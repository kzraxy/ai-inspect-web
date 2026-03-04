import http from './httpInstance'

// 获取设备树数据
function getPublishTreeData (data) {
  return http({
    method: 'get',
    url: '/v1/inspect/taskconfig/taskConfigs/orgsForLine',
    data: data
  })
}

function searchTreeData (data) {
  return http({
    method: 'get',
    url: '/v1/inspect/taskconfig/taskConfigs/orgs/actions/getByNameLike',
    data: data
  })
}
export {
  getPublishTreeData,
  searchTreeData
}
