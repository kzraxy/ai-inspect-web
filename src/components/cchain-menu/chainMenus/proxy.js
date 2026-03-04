import http from '@/api/httpInstance'

// 获取菜单数据
export function getChainMenus () {
  return http({
    url: '/safe-center/v1/auth/centerMenu/actions/listUserMenuList',
    method: 'get'
  })
}
