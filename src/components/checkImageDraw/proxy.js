import http from '@/plugin/http'
export function getBase64 (data) {
  return http('post', '/control/core/video/img2byte', data)
}
