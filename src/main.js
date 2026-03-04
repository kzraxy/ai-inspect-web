import Vue from 'vue'
import hui from 'hui'
import './huiPro' // equals to require('./huiPro')
import initApp from './initApp'
import http from '@/api/httpInstance'
import '@hui/svg-icon/lib/svg-icon.css'
import icons from '@hui/svg-icon'
import './icons'
import '@/assets/img/menu_icon/iconfont.css'
import overflow from '@/assets/libs/overflow/overflow'
import commons from '@/common/index'
import { AiopCalibrator } from '@/components/calibrator/index.js'
import './style/index.scss'
import { mapGetters } from 'vuex'
import InfiniteScroll from 'vue-infinite-scroll'
import '@/directives'
import zhCN from 'hui/lib/locale/lang/zh-CN.js'
import locale from 'hui/src/locale/index.js'
import { STSProvider, OssUploader } from 'hik-cloud-obs'
locale.use(zhCN)
Vue.component('overflow', overflow)
Vue.use(AiopCalibrator)
for (const icon of icons) {
  Vue.component(icon.name, icon)
}

Vue.use(hui, { locale: zhCN })
Vue.use(commons)
Vue.use(InfiniteScroll)

STSProvider.config({
  httpClient: (method, url, data) => {
    const m = method.toLowerCase()
    return http({method, url, data})
  }, 
  baseURL: '/oss-sts'
})

const ossUploader = new OssUploader()
Vue.prototype.$ossUploader = ossUploader
window.$ossUploader = ossUploader

// 全局混合，对面包屑的多语言进行处理
Vue.mixin({
  computed: {
    ...mapGetters(['applicationSceneName', 'serviceType', 'isNewTenant']),
    staticResourceOrigin () {
      if (process.env.NODE_ENV === 'development') {
        return 'https://pb.hik-cloud.com'
      }
      return window.location.origin
    },
    i18nBreadcrumb () {
      if (this.breadcrumbObj && Array.isArray(this.$store.state.userInfo.breadcrumb[this.breadcrumbObj.menuCode])) {
        const breadcrumbList = this.$store.state.userInfo.breadcrumb[this.breadcrumbObj.menuCode]
        return breadcrumbList.map(item => ({
          title: item
        })).concat(this.breadcrumbObj.content ? this.breadcrumbObj.content.map(bd => ({
          title: this.$t ? this.$t(bd) : bd
        })) : [])
      } else {
        return []
      }
    }
  }
})

initApp(Vue)
