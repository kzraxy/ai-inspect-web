import store from '@/store'
import { mountVueInstance, errorLoadPage, setLanguage as setLanguageInternal } from 'dolphin-plugin-tools'
import router from './router'
import App from './App'
import ErrorPage from '@/components/ErrorPage'
import { exists } from '@/api/layout'

import i18n from '@/i18n/index.js'
import huiLocale from 'hui/lib/locale'
import huiProLocale from '@hui-pro/locale'
import axios from 'axios'

async function initApp (Vue) {
  try {

    // eslint-disable-next-line no-unused-vars
    Vue.prototype.globalBus = new Vue()
    const { userInfo } = await store.dispatch('setUserInfo')
    await Promise.all([setLanguage(userInfo), setIsNewTenant(), setLeftMenuShow()])
    // 初始化vue实例
    mountVueInstance(Vue, App, {
      i18n,
      store,
      router
    })
  } catch (error) {
    errorLoadPage(Vue, ErrorPage)
  }
}

async function setLanguage ({ languageId }) {
  const assetsUrl = process.env.BASE_URL + process.env.VUE_APP_ASSETS
  const requestUrl = `${assetsUrl}/i18n/${languageId}/index.json`
  const i18nJson = await axios.get(requestUrl)
  await setLanguageInternal(i18nJson.data, languageId, [huiLocale, huiProLocale], i18n)
}

async function setIsNewTenant () {
  let res = await exists({ calcCodes: '240,241,242,243,31057' }) 
  if (res.code === 0) {
    store.commit('setIsNewTenant', !res.data) // data: true老租户老菜单，false：新租户新菜单
  }
}
async function setLeftMenuShow () {
  let href = window.location.href
  if (href.includes('/intelligent/sceneConfig/editSceneTask') && href.includes('taskSource=PATROL')) {
    store.commit('setShowLeftMenu', false)
  } else {
    store.commit('setShowLeftMenu', true)
  }
}
export default initApp
