// 默认easyMock生成的文件在src/api/template下
import * as types from './mutation-types'
import { getServiceType } from '@/api/layout'
export default {
  async setUserInfo (context) {
    // userInfo模拟数据，真实开发环境中可以去掉，使用接口获取
    const data = {
      'languageId': 'zh_CN',
      'skin': 'blue',
      'breadcrumb': {
        '001': ['欢迎']
      },
      'code': [
        `${process.env.VUE_APP_CONTEXT}_AI000`,
        `${process.env.VUE_APP_CONTEXT}_AI00001`,
        `${process.env.VUE_APP_CONTEXT}_AI00002`,
        `${process.env.VUE_APP_CONTEXT}_AI001`,
        `${process.env.VUE_APP_CONTEXT}_AI00101`,
        `${process.env.VUE_APP_CONTEXT}_AI00102`,
        `${process.env.VUE_APP_CONTEXT}_AI002`,
        `${process.env.VUE_APP_CONTEXT}_AI00201`,
        // `${process.env.VUE_APP_CONTEXT}_AI00202`,
        `${process.env.VUE_APP_CONTEXT}_AI00203`,
        `${process.env.VUE_APP_CONTEXT}_AI00204`,
        `${process.env.VUE_APP_CONTEXT}_AI00205`,
        `${process.env.VUE_APP_CONTEXT}_AI00206`,
        `${process.env.VUE_APP_CONTEXT}_AI003`,
        `${process.env.VUE_APP_CONTEXT}_AI00301`,
        `${process.env.VUE_APP_CONTEXT}_AI004`,
        `${process.env.VUE_APP_CONTEXT}_AI00401`,
        `${process.env.VUE_APP_CONTEXT}_AI00402`,
        `${process.env.VUE_APP_CONTEXT}_AI00403`,
      ]
    }
    let type = 'retail'
    let res = await getServiceType()
    type = res.data.subsystem || res.data.serviceType
    sessionStorage.setItem('safeCenterPlatformType', type)
    context.commit(types.SET_USER_INFO, data)
    return {
      userInfo: data
    }
  }
}
