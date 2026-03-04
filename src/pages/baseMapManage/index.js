import http from '@/api/httpInstance'
var chainBaseUrl = '' // 连锁接口
/**
 * video 初始化及配置
 * @param {*video挂载的dom id} id
 * @param {*连接成功的回调} cbConnectSuccess
 * @param {*连接报错的回调} cbConnectError
 * @param {*连接关闭的回调} cbConnectClose
 */
export function WebControlInit (id, cbConnectSuccess, cbConnectError, cbConnectClose) {
  return new WebControl({
    szPluginContainer: id,
    iServicePortStart: 14510, // 对应 LocalServiceConfig.xml 中的ServicePortStart值
    iServicePortEnd: 14519, // 对应 LocalServiceConfig.xml 中的ServicePortEnd值
    cbConnectSuccess,
    cbConnectError,
    cbConnectClose
  })
}
/**
 * 离开页面时调用 断开链接的方法
 * @param {*视频插件实例} oWebControl
 */
export function WebControlDistory (oWebControl) {
  if (oWebControl) {
    oWebControl.JS_HideWnd()
    oWebControl.JS_Disconnect().then(() => {}, () => {})
  }
}

// 获取最新版本接口
// export function getLastestVersion () {
//   return http('get', '/api/chain/basic/mainPages/actions/findVersionInfo', {params: {types: 4}})
// }
export function getLastestVersion () {
  return http({
    url: chainBaseUrl + '/v1/chain/basic/mainPages/actions/findVersionInfo',
    method: 'get',
    data: { types: 4 }
  })
}
