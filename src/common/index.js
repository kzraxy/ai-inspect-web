import util from './commonUtils'

const install = function (Vue) {
  Vue.prototype.$commonUtils = util
}

export default install
