import axios from 'axios'
import { Message } from 'hui'
// import { trimOnlySpace } from '@hui-pro/utils'
// import { REQUEST_SUCCESS, REFRESH_BY_HEADER } from '@/constant'
// import wrapAxiosInstance from 'traceservice-instrumentation-axios'

const myAxios = axios.create({
  timeout: 20000,
  withCredentials: true,
  headers: { 'X-Requested-With': 'XMLHttpRequest' }
})

// 用于上报前端调用链信息, 不会影响正常开发流程
// http://iris.hikvision.com.cn/conch/traceservice-instrumentation-axios
// wrapAxiosInstance(http, { serviceName: process.env.VUE_APP_CONTEXT })

// 相应拦截器
myAxios.interceptors.response.use(function (res) {
  // 请求多语言的json文件
  if (/.*\.json$/.test(res.config.url)) {
    return res
  }

  // 错误信息提示-针对status === 200 但 code !== 0 的错误类型
  let noErrorTipArr = [1010318, 1010335, 70030025, 70010093, 70010094, 70010095, 70010039, 70030054, 70030055, 50100363] // 不主动报错的错误码
  if (res.status === 200 && res.data.code !== undefined && res.data.code * 1 !== 0 && noErrorTipArr.indexOf(res.data.code) === -1) {
    Message.error(res.data.message)
  }
  return Promise.resolve(res.data)
}, function (error) {
  if (error.response && error.response.status * 1 === 401) {
    if (+error.response.headers['x-status-code'] === 403) {
      let values = Object.values(error.response.data)
      values = values.join('、')
      Message.error(`您没有${values}权限`)
    } else {
      Message.error('登录超时，请重新登录')
    }
  } else if (error.message !== '登录已超时') { // 500之类提示
    Message.error('获取数据失败')
  }

  return Promise.reject(error)
})
// 请求拦截器
myAxios.interceptors.request.use(function (config) {
    config.headers['x-hik'] = 'serviceType=' + sessionStorage.getItem('safeCenterPlatformType') // 其余环境使用字段
    let url = config.url
    let isYunlai = window.location.href.indexOf('hilaicloud.com') > -1// 云莱域名
    const dataSource = {
      ym: [
        { marker: '/device-api', host: 'VUE_APP_REQUEST_DEVICE_HOST' },
        { marker: '/safe-center', host: 'VUE_APP_REQUEST_AUTH_HOST' },
        { marker: '/oss-sts', host: 'VUE_APP_REQUEST_DEVICE_HOST' },
      ]
    }
    if (process.env.NODE_ENV === 'production') {
      const source = dataSource['ym']
      const platfrom = source.find(e => url.includes(e.marker))
      // url = process.env[platfrom.host] + url.split(platfrom.marker)[1]
      if (isYunlai) {// 云莱OEM
        url = process.env.VUE_APP_REQUEST_YUNLAI_HOST + url
      } else if (platfrom) { // 特殊处理的服务
        url = process.env[platfrom.host] + url.split(platfrom.marker)[1]
      } else {
        url = process.env.VUE_APP_REQUEST_COMMON + url
      }
    }

    
  // get拼接参数
  if (config.method === 'get' && config.data) {
    url += '?'
    let keys = Object.keys(config.data)
    for (let key of keys) {
      url += `${key}=${encodeURIComponent(config.data[key])}&`
    }
    url = url.substring(0, url.length - 1)
  }
  return { ...config, url }
  // 所有搜索框可输入元素，都不需要去掉前后空格，只有仅输入空格时，此字段搜索无效。(规范: http://iris.hikvision.com.cn/huidesign/bscs/issues/83)
  // return trimOnlySpace(config)
}, function (error) {
  // 对请求错误做些什么
  return Promise.reject(error)
})

var http = ({ url, data, header, method, dataType, responseType, showLoading }) => {
  let configurable = { url, data, header, method, dataType, responseType, showLoading }
  return myAxios({
    ...configurable
  })
}

export default http
