/**
 * store
 *
 * @author caochang
 * @date 2017-11-10
 */

import Vue from 'vue'
import Vuex from 'vuex'
import User from './modules/user'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

const state = {
  loaddingNum: 0,
  showLogin: false,
  hasLogin: false,
  hasLsAuth: false,
  hasSqAuth: false,
  hasXfAuth: false,
  windowHeight: document.body.clientHeight,
  windowWidth: document.body.clientWidth,
  serviceType: '',
  isCollapse: false,
  pubkey: '' // 视频公钥
}

// getters
const getters = {
  loaddingNum: state => state.loaddingNum
}

// mutations
const mutations = {
  changePubkey (state, str) {
    state.pubkey = str
  },
  resetLoadNum (state, payload) {
    state.loaddingNum = 0
  },
  loadNumPlus (state, payload) {
    state.loaddingNum++
  },
  loadNumMinus (state, payload) {
    state.loaddingNum--
  },
  resizeWindow (state, payload) {
    state.windowHeight = document.body.clientHeight
    state.windowWidth = document.body.clientWidth
  },
  openLoginModal (state) { // 打开登录弹框
    state.showLogin = true
  },
  closeLoginModal (state) { // 关闭登录弹框
    state.showLogin = false
  },
  loginStatus (state, payload) {
    state.hasLogin = payload.hasLogin
    state.hasLsAuth = payload.hasLsAuth || false
    state.hasSqAuth = payload.hasSqAuth || false
    state.hasXfAuth = payload.hasXfAuth || false
  },
  changeIsCollapse (state, value) {
    state.isCollapse = value
  }
}
export default new Vuex.Store({
  namespaced: true,
  state,
  mutations,
  getters,
  modules: {
    user: User
  },
  strict: debug
})
