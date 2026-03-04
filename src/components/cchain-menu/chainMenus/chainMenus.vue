<template>
  <div id="menuPanel">
    <el-popover
      popper-class="menu_panel"
      placement="bottom-start"
      ref="popoverMenuPanel"
      width="500"
      v-show="!noLeftMenuDisplay"
      @show="menuPopShow"
      @hide="menuPopHide"
      :visible-arrow="false"
      trigger="hover">
      <div id="chain_menuPopPanel" class="container" v-show="!noLeftMenuDisplay">
        <template v-if="displayFavoMenus.length > 0">
          <div class="block">
            <div class="flex-row">
              <div class="title">我的应用</div>
            </div>
            <div class="menu-grid" >
              <div class="m_item al70" v-for="m in displayFavoMenus" @click="menuClick(m)">
                <i class="vmd menufont" :class="iconClassMap(m)"></i>
                <span class="vmd">{{ m.name }}</span>
              </div>
            </div>
          </div>
        </template>
        <div class="block" v-if="displayNorMenus.length > 0">
          <div class="flex-row">
            <div class="title">更多应用</div>
          </div>
          <div class="menu-grid" >
            <div class="m_item al70" v-for="m in displayNorMenus" @click="menuClick(m)">
              <i class="vmd menufont" :class="iconClassMap(m)"></i>
              <span class="vmd">{{ m.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-popover>
    <div v-popover:popoverMenuPanel>
      <span class="vmd">{{ currentMenu.name }}</span><i v-show="!noLeftMenuDisplay" class="h-icon-angle_down vmd" style="display: inline-block;margin-left: 6px;"></i>
    </div>
  </div>
</template>

<script>
import { getChainMenus } from './proxy'
import { iconMap } from './iconMap'

export default {
  name: 'chainMenus',
  data () {
    return {
      menus: {
        moreApplicationList: [],
        myApplicationList: []
      }
    }
  },
  computed: {
    currentMenu () {
      return [...this.menus.myApplicationList, ...this.menus.moreApplicationList].filter(menu => menu.fullIndex && menu.fullIndex.includes(window.location.pathname))[0] || {}
    },
    displayFavoMenus () {
      return this.menus.myApplicationList.filter(menu => !menu.fullIndex || !menu.fullIndex.includes(window.location.pathname))
    },
    displayNorMenus () {
      return this.menus.moreApplicationList.filter(menu => !menu.fullIndex || !menu.fullIndex.includes(window.location.pathname))
    },
    noLeftMenuDisplay () {
      return this.displayFavoMenus.length == 0 && this.displayNorMenus.length == 0
    }
  },
  mounted () {
    this.getChainMenus()
  },
  methods: {
    menuPopShow () {
      if (this.noLeftMenuDisplay) return
      this.$nextTick(() => {
        this.$emit('menuPopShow', document.getElementById('chain_menuPopPanel').getBoundingClientRect())
      })
    },
    menuPopHide () {
      if (this.noLeftMenuDisplay) return
      this.$emit('menuPopHide')
    },
    iconClassMap (menu) {
      let name = iconMap[menu.code] || menu.index
      return `chain-nav_${name}`
    },
    getChainMenus () {
      getChainMenus().then(res => {
        if (res.code != 0) return
        this.menus = res.data
      })
    },
    menuClick (menu) {
      this.$refs.popoverMenuPanel.doClose()
      if ((!menu.subMenus || menu.subMenus.length == 0) && menu.fullIndex.indexOf('.html') > -1) {
        window.open(menu.fullIndex)
        return
      }
      // 以下逻辑为选择顶部菜单后，页面自动跳转到该菜单下的第一个页面
      let defaultMenu = menu
      while (defaultMenu.subMenus && defaultMenu.subMenus.length > 0) {
        defaultMenu = defaultMenu.subMenus[0]
      }
      window.open(`/chain/index.html#${defaultMenu.fullIndex}`)
    }
  }
}
</script>
<style lang="scss">
.menu_panel {
  padding: 0!important;
}
</style>
<style lang="scss" scoped>
.container {
  padding: 24px 16px;
  position: relative;
  &.full {
    width: 500px;
  }
  &.empty {
    width: 162px;
  }
}
.block {
  &:not(:last-child) {
    margin-bottom: 30px;
  }
}
.title {
  font-size: 16px;
  font-weight: 600;
  color: rgba(0,0,0,0.9)
}
.vmd {
    vertical-align: middle !important;
}
.flex-row {
  align-items: center;
  justify-content: space-between;
}
.menu-grid {
  margin-top: 12px;
  display: grid;
  grid-gap: 12px;
  grid-template-columns: repeat(3, 1fr);
  .m_item {
    background: rgba(0,0,0,0.02);
    color: rgba(0,0,0,0.7);
    border-radius: 6px;
    padding: 10px 12px;
    cursor: pointer;
    &:hover {
      background: rgba(0,0,0,0.04);
    }
    > i {
      font-size: 24px;
    }
  }
}
</style>
