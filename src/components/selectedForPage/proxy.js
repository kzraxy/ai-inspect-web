import http from '@/api/httpInstance'
export function getOptionListAPI (data) {
  return http({
    url: data.url,
    method: 'get',
    data: data.params
  })
}
