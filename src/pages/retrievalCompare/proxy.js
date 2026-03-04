import http from '@/api/httpInstance'

// 分页图集
export function pageImageLibraryList (params) {
  return http({
    method: 'get',
    url: '/v1/inspect/taskconfig/deviceRcImage/pageImageLibraryList',
    data: params
  })
}
export function getDevicePage (data) {
  return http({
    method: 'POST',
    url: '/v1/inspect/taskconfig/deviceRcImage/getDevicePage',
    data
  })
}
export function getImageLibraryDevicePage (data) {
  return http({
    method: 'POST',
    url: '/v1/inspect/taskconfig/deviceRcImage/getImageLibraryDevicePage',
    data
  })
}
export function modifyImageLibrary (data) {
  return http({
    method: 'POST',
    url: '/v1/inspect/taskconfig/deviceRcImage/modifyImageLibrary',
    data
  })
}
export function getImagePage (data) {
  return http({
    method: 'POST',
    url: '/v1/inspect/taskconfig/deviceRcImage/getImagePage',
    data
  })
}
export function deleteImageLibrary (params) {
  return http({
    method: 'get',
    url: '/v1/inspect/taskconfig/deviceRcImage/deleteImageLibrary',
    data: params
  })
}

export function deleteImages (data) {
  return http({
    method: 'POST',
    url: '/v1/inspect/taskconfig/deviceRcImage/deleteImages',
    data
  })
}

export function modifyImage (data) {
  return http({
    method: 'POST',
    url: '/v1/inspect/taskconfig/deviceRcImage/modifyImage',
    data
  })
}

export function getImageLibraryOne (params) {
  return http({
    method: 'get',
    url: '/v1/inspect/taskconfig/deviceRcImage/getImageLibraryOne',
    data: params
  })
}

export function publishImageLibrary (data) {
  return http({
    method: 'POST',
    url: '/v1/inspect/taskconfig/deviceRcPublish/publishImageLibrary',
    data
  })
}

export function unPublishImageLibrary (data) {
  return http({
    method: 'POST',
    url: '/v1/inspect/taskconfig/deviceRcPublish/unPublishImageLibrary',
    data
  })
}

export function existsImageLibraryTask (params) {
  return http({
    method: 'get',
    url: '/v1/inspect/taskconfig/deviceRcImage/existsImageLibraryTask',
    data: params
  })
}

export function getImageLibraryImageStatistics (params) {
  return http({
    method: 'get',
    url: '/v1/inspect/taskconfig/deviceRcImage/getImageLibraryImageStatistics',
    data: params
  })
}

export function getTaskInfoPage (data) {
  return http({
    method: 'POST',
    url: '/v1/inspect/taskconfig/deviceRcImage/taskInfoPage',
    data
  })
}

export function retry (data) {
  return http({
    method: 'get',
    url: '/v1/inspect/taskconfig/deviceRcImage/taskInfo/retry',
    data
  })
}