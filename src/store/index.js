import Vue from 'vue'
import Vuex from 'vuex'
import mutations from './mutations'
import actions from './actions'

Vue.use(Vuex)

const state = {
  userInfo: null,
  serviceType: 'retail',
  resetAccount: false,
  showLeftMenu: true,
  isNewTenant: true,
  uploadcpt: null, // oss上传中实时返回的断点对象, 用于中途取消上传
  ossClient: {} // OSS上传实例对象 (分片上传时全局存一个, 用于实时取消上传)
}
const getters = {
  watermakeStatus: state => state.userInfo.watermakeStatus,
  tenantInfo: state => state.userInfo || {},
  isNewTenant: state => state.isNewTenant,
  applicationSceneName: state => window.localStorage.getItem('sceneName') || '组织',
  serviceType: state => window.sessionStorage.getItem('safeCenterPlatformType') || window.localStorage.getItem('sfSubsystem') || 'retail'
}
export default new Vuex.Store({
  state,
  actions,
  mutations,
  getters,
  modules: {}
})
