/**
 * 用户store
 *
 * @author caochang
 * @date 2017-12-20
 */
const state = {
  tenantId: '',
  userId: '',
  username: '',
  userType: '',
  auth: []
}

// mutations
const mutations = {
  setData (state, payload) {
    state.tenantId = payload.tenantId
    state.userId = payload.userId
    state.username = payload.username
    state.userType = payload.userType
    state.auth = payload.auth
  },
  clearData (state, payload) {
    state.tenantId = ''
    state.userId = ''
    state.username = ''
    state.userType = ''
    state.auth = ''
  }
}

export default {
  namespaced: true,
  state,
  mutations
}
