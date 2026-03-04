<template>
  <div class="page show-menu" style="height: 100%; padding-top: 48px;">
    <header class="layout-header-mod">
      <span class="left">
        <img src="@/assets/logo.png" class="logo" id="headLogo"/>
        <div class="line"></div>
        <div class="module-name flex-center">
          <chainMenus @menuPopShow="menuPopShow" @menuPopHide="menuPopHide"
            v-show="['retail', 'aiot', 'enterprise'].includes(serviceType)"></chainMenus>
          <div v-show="!['retail', 'aiot', 'enterprise'].includes(serviceType)" style="font-size:16px">智能分析</div>
        </div>
      </span>
      <div class="right-operator" v-show="showLeftMenu">
        <div class="right-operator_btn-item" @click="toHelpDoc" v-show="['retail'].includes(this.serviceType)">用户手册</div>
        <div class="right-operator_btn-item" @click="addEditAppkey" v-show="!isNewTenant">账号配置</div>
        <div class="right-operator_btn-item" @click="toAITrainingPlatform" v-show="!isNewTenant">进入AI训练平台</div>
      </div>
    </header>
    <h-page v-loading="loading" style="position:relative">
      <pageMenu ref="pageMenuRef" :menu="menu" @fold="fold" @unfold="unfold" v-if="showLeftMenu"/>
      <el-scrollbar wrap-class="h-page_content-mod">
        <keep-alive>
          <router-view v-if="$route.meta.keepAlive" />
        </keep-alive>
        <router-view v-if="!$route.meta.keepAlive" />
      </el-scrollbar>
    </h-page>
    <addEditAppkeyModal :visible.sync="addEditAppkeyVisible" :accountId="accountId" :accountInfo="accountInfo"
      @flashTable="getTablesData" @flashAccount="getAccount">
    </addEditAppkeyModal>
    <guidesModal v-if="menuInit" :menu="menu"></guidesModal>
    <agreeAuthModal v-if="showAgreeAuthPopUp" @closeAgreeAuthModal="closeAgreeAuthModal"></agreeAuthModal>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import navObj from '@/nav.config.js'
import addEditAppkeyModal from './modal/addEditAppkeyModal'
import { getTablesData, getAccount, supportAiService, getUserInfo, judgeAgreeAuthPopUp, getConfiguration } from '@/api/layout'
import chainMenus from '@/components/cchain-menu/chainMenus/chainMenus'
import pageMenu from './modal/pageMenu.vue'
import guidesModal from './modal/guidesModal.vue'
import agreeAuthModal from './modal/agreeAuthModal.vue'
export default {
  components: {
    addEditAppkeyModal,
    chainMenus,
    pageMenu,
    guidesModal,
    agreeAuthModal
  },
  data() {
    return {
      loading: false,
      addEditAppkeyVisible: false,
      accountId: '',
      accountInfo: {},
      menu: [],
      menuInit: false,
      showAgreeAuthPopUp: false
    }
  },
  computed: {
    ...mapState({
      resetAccount: state => state.resetAccount,
      showLeftMenu: state => state.showLeftMenu,
    }),
    newNavList() {
      return navObj.newNav
    },
    oldNavList() {
      return navObj.oldNav
    },
  },
  watch: {
    async resetAccount(val) {
      if (val) {
        await this.getAccount()
        this.$store.commit('SET_RESET_ACCOUNT', false)
      }
    },
    addEditAppkeyVisible(val) {
      if (document.getElementById('hikChainVideo')) { // 视频页面
        this.$nextTick(() => {
          if (val) {
            this.globalBus.$emit('cutVideo')
          } else {
            this.globalBus.$emit('repairVideo')
          }
        })
      }
    }
  },
  async mounted() {
    await this.getUserInfo()// 获取个人会话信息
    await this.judgeAgreeAuthPopUp()// 获取是否同意或拒绝授权
    if (['retail', 'otapp', 'aiot', 'enterprise', 'scenic', 'hbl'].includes(this.serviceType)) {
      this.getConfiguration() // 获取头部logo配置
    }
  },
  methods: {
    async getConfiguration() {
      let res = await getConfiguration()
      if (res.code === 0 && res.data && res.data.platformImg) {
        document.getElementById('headLogo').src = res.data.platformImg
        document.querySelector('.layout-header-mod').style.paddingLeft = '0'
      }
    },
    async getUserInfo() {
      let res = await getUserInfo()
      if (res.code === 0 && res.data && res.data.name) {
        sessionStorage.setItem('fullName', res.data.name)
      }
    },
    async judgeAgreeAuthPopUp() {
      let res = await judgeAgreeAuthPopUp()
      if(res.code === 0) {
        this.showAgreeAuthPopUp = res.data
      }
    },
    closeAgreeAuthModal() {
      this.showAgreeAuthPopUp = false
    },
    menuPopShow(obj) {
      this.showContent(obj, -7)
    },
    menuPopHide() {
      if (document.getElementById('hikChainVideo')) {
        this.$nextTick(() => {
          this.globalBus.$emit('repairVideo')
        })
      }
    },
    showContent(popClientRect) { // 切割视频
      if (document.getElementById('hikChainVideo')) {
        this.$nextTick(() => {
          const videoHead = document.getElementsByClassName('video-switch')[0]
          const videoClientRect = document.getElementById('hikChainVideo').getBoundingClientRect()
          const _headHeight = videoHead ? videoHead.offsetHeight : 0
          const cutHeight = popClientRect.bottom - (videoClientRect.top + _headHeight) + 1
          const cutLeft = popClientRect.left - videoClientRect.left
          const cutWidth = popClientRect.width - (videoClientRect.left - popClientRect.left) + 1
          this.globalBus.$emit(
            'cutVideo',
            {
              top: 0,
              left: cutLeft,
              width: cutWidth,
              height: cutHeight
            }
          )
        })
      }
    },
    fold() {
      this.globalBus.$emit('resize')
    },
    unfold() {
      this.globalBus.$emit('resize')
    },
    addEditAppkey() {
      this.addEditAppkeyVisible = true
    },
    toAITrainingPlatform() {
      window.open('https://ai.hikvision.com/intellisense/ai-training/')
    },
    toHelpDoc() {
      window.open('https://www.hik-cloud.com/help-center/index.html#/manualList?platformCode=retail&nodeId=601483d60a6041e2ac6187856430892e')
    },
    getTablesData() {
      getTablesData().then((res) => {
        if (res.code === 0) {
          res.data.map((item, index) => {
            item.versionInfosHandle = []
            if (item.versionInfos && item.versionInfos.length <= 1) { // versionInfos只有一条数据或者没有，直接赋给可以展示的数组
              item.isShowExpand = false
              item.isExpand = false
              item.versionInfosHandle = item.versionInfos
            } else {
              item.isShowExpand = true
              item.isExpand = false// 默认false不展开，所以显示 展开全部版本
              item.versionInfosHandle.push(item.versionInfos[0])// versionInfos有多条数据，一一push进可以展示的数组
            }
          })
          this.allTablesData = res.data
        }
      })
    },
    getAccount() {
      getAccount().then((res) => {
        if (+res.code === 0 && res.data) { // 该用户配置过平台账号
          let data = res.data
          this.accountId = data.accountId
          this.accountInfo = data
        } else if (+res.code === 70030025) { // code为70030025，则没有配置过账号
          this.accountId = ''// 该用户没有配置过平台账号
          this.accountInfo = {}
        }
      })
    },
    getNavList(list) {
      this.menu = list
      this.$nextTick(() => {
        this.menu.forEach((m, index) => {
          this.$refs.pageMenuRef && this.$refs.pageMenuRef.openSubMenu(index)
        })
        // this.menuInit = true
      })
    },
    // async judgeMenu() {
    //   let res = await supportAiService()
    //   if (res.code === 0) {
    //     if (!res.data) { // 是否有AI增值服务管理的菜单
    //       let index = navList.findIndex(item => item.menuCode === 'AI004')
    //       navList.splice(index, 1)
    //     }
    //     this.getNavList(navList)
    //   } else {
    //     this.getNavList()
    //   }
    // }
    async judgeMenu() {
      if (this.isNewTenant) { // 新租户，展示新菜单
        this.getNavList(this.newNavList)
      } else { // 老租户
        let res = await supportAiService()
        if (!res.data) { // 是否有AI增值服务管理的菜单
          let index = this.oldNavList.findIndex(item => item.menuCode === 'AI004')
          this.oldNavList.splice(index, 1)
        }
        this.getNavList(this.oldNavList)
      }
    }
  },
  async created() {
    this.getAccount()
    this.judgeMenu()
    // supportExtraTask().then(res => { // 是否郑远元租户
    //   if (res.code === 0) {
    //     if (!res.data.support) { // 非郑远元，无智能分析-合规分析的菜单
    //       navList.forEach(item => {
    //         if (item.router === '/intelligent') {
    //           item.children = item.children.filter(val => { return val.menuCode !== 'AI00202' })
    //         }
    //       })
    //     }
    //     this.getNavList(navList)
    //   } else {
    //     this.getNavList()
    //   }
    // }).catch(() => {
    //   this.getNavList()
    // })
  }
}
</script>

<style lang="scss">
#app {
  height: 100%;

  .h-page-menu{
    .page-scrollbar__wrap{
      height: calc(100vh - 48px);
    }
  }
  .header {
    height: 48px;
    background: #2080f7;
    color: #fff;
  }

  .h-page {
    height: calc(100vh - 48px);
    overflow-y: hidden;
  }

  .h-page_content-mod {
    height: calc(100vh - 48px);
    overflow-x: hidden;
  }

  .page-menu {
    top: 48px;
  }

  .page-header {
    box-shadow: 0 0 0 0;
  }

  .page-container {
    overflow-y: auto;
  }

  .layout-header-mod {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 48px;
    line-height: 48px;
    padding: 0 16px;
    background: #2080f7;
    color: #fff;
    font-size: 18px;
    display: flex;
    justify-content: space-between;
    z-index: 2000;

    .left {
      display: flex;
      justify-content: flex-start;
      align-items: center;

      .logo {
        max-width: 500px;
        width: auto;
        height: 48px;
      }

      .line {
        margin-left: 16px;
        width: 1px;
        height: 16px;
        background-color: rgba(255, 255, 255, 0.2);
      }
    }

    .module-name {
      height: 28px;
      line-height: 26px;
      margin-left: 16px;
      cursor: pointer;
      padding: 0 10px;
    }

    .right-operator {
      display: flex;
      color: rgba(255, 255, 255, 0.70);
      align-items: center;

      .right-operator_btn-item {
        height: 34px;
        line-height: 34px;
        padding: 0 16px;
        font-size: 12px;
        cursor: pointer;

        &:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.08);
        }
      }
    }
  }
}
</style>
