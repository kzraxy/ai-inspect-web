import * as types from './mutation-types'

export default {
  [types.SET_USER_INFO] (state, userInfo) {
    state.userInfo = userInfo
  },
  [types.SET_RESET_ACCOUNT] (state, resetAccount) {
    state.resetAccount = resetAccount
  },
  changePubkey (state, str) {
    state.pubkey = str
  },
  setOssClient (state, ossClient) {
    state.ossClient = ossClient
  },
  setShowLeftMenu (state, obj) {
    state.showLeftMenu = obj
  },
  setIsNewTenant (state, obj) {
    state.isNewTenant = obj
  }
}
