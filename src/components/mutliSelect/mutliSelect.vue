<template>
  <div ref="multiSearch" class="h-multi-selector common_multi_selector">
    <div v-show="!showInputTags" @click="changeOpen" @mouseenter="mouseenter" @mouseleave="mouseleave"><el-button icon="h-icon-filter" :plain="true"/></div>
    <div :title="selectNames" class="multi-search-tags" @click="changeOpen" @mouseenter="mouseenter" @mouseleave="mouseleave" v-show="showInputTags">
      <div v-if="(selectList.length > 0 && !checkAll) || (selectList.length > 0 && checkAll && searchText)" class="tags-container">
        <el-tag :title="selectList[0][options.name]" :closable="true" max-width="48px" @close.stop="removeItem(selectList[0][options.id])">
          {{ selectList[0][options.name] }}
        </el-tag>
        <el-tag v-show="selectList.length > 1" :title="selectNames">
          {{ `+${selectList.length - 1}` }}
        </el-tag>
      </div>
      <div v-else-if="selectList.length > 0 && checkAll && !searchText" class="tags-container">
        <el-tag title="全部" :class="{ 'pd0-8': !closable }" :closable="closable" max-width="56px" @close.stop="removeItem(-1)">全部</el-tag>
      </div>
      <el-input :placeholder="placeholder" unselectable="on" readonly>
        <div slot="suffix">
          <i v-if="icon" :class="['el-input__icon', icon]" @click.stop="removeItem($event, true)" />
          <i style="left: 24px; cursor: pointer" :class="['el-input__icon', 'h-icon-angle_down_sm', { 'icon-rotate': selectFlag }]"/>
        </div>
      </el-input>
    </div>
    <div v-show="selectFlag" ref="multiContent" :style="positionStyle" class="multi-search-container">
      <div class="search-input" v-show="showSearchInput">
        <el-input v-model="searchText" :on-icon-click="searchGroup" :clear-icon-click="searchGroup" :clearable="true"
          :placeholder="cptSearchPlaceholder" suffix-icon="h-icon-search" @keyup.enter.native="searchGroup"/>
      </div>
      <div v-if="hasAllSelect" :class="{ disabled: currentList.length === 0 }" class="search-item set-top">
        <checkbox v-model="checkAll" :disabled="currentList.length === 0" :indeterminate="indeterminate && needIndeterminate"
          class="checkbox-item" @change="checkAllChange">全部</checkbox>
      </div>
      <div :style="{ height: searchListHeight }" class="search-list">
        <el-scrollbar ref="scrollbar" wrap-class="h-multi-selector-warp">
          <el-checkbox-group v-model="selectIds">
            <el-dropdown placement="right-start" v-for="(item, index) in currentList" :key="index" class="search-item" :hide-on-click="false" :show-timeout="100"
              @command='handleCommand' 
              :class="{disabled: multiNum > 0 && selectIds.length >= multiNum && !selectIds.includes(item[options.id]),active: selectIds.includes(item[options.id])}">
              <checkbox :label="item[options.id]" class="checkbox-item" @change="itemChange"
                :disabled="disabledIds.includes(item[options.id]) || (multiNum > 0 && selectIds.length >= multiNum && !selectIds.includes(item[options.id]))">
                <h-ellipsis style="width: 100%">
                  <h-highlight :highlight-key="searchText">
                    {{ item[options.name] }}
                  </h-highlight>
                </h-ellipsis>
              </checkbox>
              <el-dropdown-menu slot="dropdown" ref="dropmenu">
                <el-scrollbar ref="scrollbar" wrap-class="h-multi-selector-dropdown-menu">
                  <el-dropdown-item v-for="(dropItem,dropIndex) in item.dropList" :key="dropIndex" :command="dropItem" 
                    :class="{'self_dropitem':true,'single_dropitem':!item.mutliFlag,'single_choose_dropitem':!item.mutliFlag&&dropItem.choose}">
                    <div>{{dropItem.dropName}}</div>
                    <i v-show="dropItem.choose&&item.mutliFlag" class="h-icon-done drop_item_svg" style="font-size: 14px; color: #2080f7; font-weight: bold"></i>
                    <!-- <h-svg-icon :size="14" :svgs="[require('../../assets/svg/checkbox_checked.svg')]" v-show="dropItem.choose&&item.mutliFlag" colors="#2080f7" class="drop_item_svg"/> -->
                  </el-dropdown-item>
                </el-scrollbar>
              </el-dropdown-menu>
            </el-dropdown>
          </el-checkbox-group>
          <div v-show="currentList.length === 0" class="no-data">
            {{ noData }}
          </div>
        </el-scrollbar>
      </div>
    </div>
  </div>
</template>

<script>
import checkbox from './checkbox/src/checkbox.vue'
import ymIconBtn from '@/components/ymIconBtn.vue'
export default {
  components: {
    checkbox, ymIconBtn
  },
  props: {
    dataList: {
      type: Array,
      default() {
        return []
      },
    }, // 数据
    options: {
      type: Object,
      default() {
        return {
          id: 'id',
          name: 'name',
        }
      },
    }, // 显示值
    unsortId: {
      type: Array,
      default() {
        return []
      },
    },
    sort: {
      type: Boolean,
      default: false,
    },
    multiNum: {
      type: Number,
      default: 0,
    }, // 选中的个数限制
    value: {
      type: Array,
      default() {
        return []
      },
    },
    hasAllSelect: {
      type: Boolean,
      default: false,
    },
    textPlaceholder: {
      type: String,
      default: '',
    }, // 输入框
    searchPlaceholder: {
      type: String,
      default: '',
    }, // 搜索框
    disabledIds: {
      type: Array,
      default() {
        return []
      },
    },
    appendBody: {
      type: Boolean,
      default: false
    },
    valueType: {
      type: String,
      default: 'key', // key和object// 数组中就是string或者object
    },
    closable: {
      type: Boolean,
      default: true
    },
    showSearchInput: {
      type: Boolean,
      default: true
    },
    needIndeterminate: {
      type: Boolean,
      default: true
    },
    showInputTags: { // 是否展示input和选中的tag标签，有的可能只需要展示一个按钮
      type: Boolean,
      default: true
    },
  },
  data() {
    return {
      selectFlag: false, // 展开下拉框
      searchText: '', // 搜索统计组字段
      selectIds: [], // 选中的idlist
      selectList: [],
      currentList: [], // 当前统计组list
      initFlag: true,
      checkAll: false, // 全选
      indeterminate: false, // 全选
      mouseFlag: false, // 鼠标移入flag
      positionStyle: {
        width: '100%',
        left: 0,
        top: '36px',
      }, // 定位
      panelWidth: 240,
      dropList: []
      // panelHeight: 304
    }
  },
  computed: {
    // 面板高度
    panelHeight() {
      let height = 0
      if (this.dataList.length === 0) {
        height = 80
      } else if (this.dataList.length <= 8) {
        height = 48 + 32 * this.dataList.length
      } else {
        height = 304
      }
      return height
    },

    // 计算容器的高度
    searchListHeight() {
      return `${this.dataList.length * 32}px`
    },
    icon() {
      return this.closable && this.mouseFlag && this.selectIds.length ? 'h-icon-close_f' : ''
    },
    // 搜索的提示文字
    cptSearchPlaceholder() {
      return this.searchPlaceholder ? this.searchPlaceholder : '搜索'
    },
    // 下拉的提示文字
    placeholder() {
      return this.selectIds.length === 0
        ? this.textPlaceholder
          ? this.textPlaceholder
          : ''
        : ''
    },
    // 无数据提示语
    noData() {
      return this.searchText ? '暂无结果' : '暂无数据'
    },
    selectNames() {
      return this.selectList.length ? this.selectList.map(item => item[this.options.name]).join(',') : ''
    },
  },
  watch: {
    panelHeight() {
      this.calcPosition()
    },
    // 实时查询
    searchText() {
      this.searchGroup()
    },
    dataList: {
      immediate: true,
      handler(val) {
        this.currentList = this.dataList
        const data = []
        val.forEach(item => {
          const index = this.selectIds.findIndex(id => id === item[this.options.id])
          if (index !== -1) {
            data[index] = item
          }
        })
        this.selectList = data
        this.hasAllSelect && this.itemChange()
      },
    },
    value(value) {
      if (value.length === 0 && this.selectIds.length === 0) {
        if (!this.closable && this.currentList.length) {
          this.selectIds = [this.currentList[0][this.options.id]]
          this.indeterminate = true
        }
        return
      }
      let flag = false
      let ids = []
      if (this.valueType === 'key') {
        ids = value
      } else {
        ids = value.map(item => item[this.options.id])
      }
      if (value.length === this.selectIds.length) {
        value.forEach(item => {
          if (!this.selectIds.includes(item)) {
            flag = true
          }
        })
      }
      if (!flag) {
        this.selectIds = ids
      }
      if (value.length === 0) {
        this.selectIds = []
        this.$nextTick(() => {
          this.itemChange()
        })
      }
    },
    selectFlag(val) {
      if (!val) {
        if (this.sort) {
          // 关闭时，重新排序
          this.changeSelectOrder()
        }
        if (this.searchText) {
          // 清空数据
          this.searchText = ''
        }
      }
    },
    selectIds(val) {
      const data = []
      this.dataList.forEach(item => {
        const index = this.selectIds.findIndex(id => id === item[this.options.id])
        if (index !== -1) {
          data[index] = item
        }
      })
      this.selectList = data
      this.checkAll = this.isCheckAll()
      if (this.valueType === 'key') {
        this.$emit('input', val)
      } else {
        this.$emit('input', this.selectList)
      }
      this.currentList.forEach(item => {
        if (this.selectIds.includes(item[this.options.id])) {
          item.choose = true
        } else {
          item.choose = false
        }
      })
    },
  },
  created() {
    this.init()
    if (typeof window !== 'undefined') {
      window && window.addEventListener('click', this.closeSelect)
      window && window.addEventListener('scroll', this.calcPosition)
      window && window.addEventListener('resize', this.calcPosition)
    }
  },
  mounted() {
    if (this.appendBody) {
      document.body.appendChild(this.$refs.multiContent)
      this.calcPosition()
    }
    this.initParentScroll()
  },
  beforeDestroy() {
    if (typeof window !== 'undefined') {
      window && window.removeEventListener('click', this.closeSelect)
      if (this.appendBody) {
        this.$refs.multiContent && document.body.removeChild(this.$refs.multiContent)
      }
    }
  },
  methods: {
    initDropdownVal (val) {
      this.$nextTick(() =>{
        this.currentList = val
      })
    },
    handleCommand (command) {
      let index = this.currentList.findIndex(item => item[this.options.id] === command[this.options.id])
      // this.currentList[index].choose = !this.currentList[index].choose
      if (this.currentList[index].mutliFlag) { // mutliFlag是dropdown的多选或单选
        command.choose = !command.choose
        // to do..多选的dropdown数据和左侧父级的下拉列表的自动勾选逻辑后面再做
      } else { // 单选
        this.currentList[index].dropList.forEach(item => item.choose = false)
        command.choose = true
        // 先做单选的dropdown数据和左侧父级的下拉列表的自动勾选逻辑
        if (command.choose) { // dropdown数据勾选，左侧父级的下拉列表自动勾选上
          if (!this.selectIds.includes(this.currentList[index][this.options.id])) {
            this.currentList[index].choose = true
            this.selectIds.push(this.currentList[index][this.options.id])
          }
        }
      }
      this.$emit('emitDropdownVal', this.currentList)
    },
    isCheckAll() {
      let currentList = this.currentList.filter(item => {
        return this.selectIds.includes(item[this.options.id])
      })
      let length = currentList.length
      const result = length !== 0 && length === this.currentList.length && length >= this.dataList.length
      return result
    },
    // 处理自定义滚动条的滚动事件
    initParentScroll() {
      this.targetParent = this.getScrollParent(this.$refs.multiSearch)
      if (
        this.targetParent === window.document.body ||
        this.targetParent === window.document.documentElement
      ) {
        this.targetParent = null
      } else {
        this.targetParent.addEventListener('scroll', this.calcPosition)
      }
    },
    getScrollParent(element) {
      var parent = element.parentNode

      if (!parent) {
        return element
      }

      if (parent === window.document) {
        if (window.document.body.scrollTop) {
          return window.document.body
        } else {
          return window.document.documentElement
        }
      }

      if (
        ['scroll', 'auto'].indexOf(this.getStyleComputedProperty(parent, 'overflow')) !== -1 ||
        ['scroll', 'auto'].indexOf(this.getStyleComputedProperty(parent, 'overflow-x')) !== -1 ||
        ['scroll', 'auto'].indexOf(this.getStyleComputedProperty(parent, 'overflow-y')) !== -1
      ) {
        return parent
      }
      return this.getScrollParent(element.parentNode)
    },
    getStyleComputedProperty(element, property) {
      var css = window.getComputedStyle(element, null)
      return css[property]
    },
    // 计算展示面板在左侧还是右侧,上侧还是下侧
    calcPosition() {
      if (!this.appendBody) {
        return
      }
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
      const scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft
      const clientHeight = document.documentElement.clientHeight || document.body.clientHeight
      const eltop = this.$el.getBoundingClientRect().top
      const elbottom = this.$el.getBoundingClientRect().bottom
      const elLeft = this.$el.getBoundingClientRect().left
      const elRight = this.$el.getBoundingClientRect().right
      if (clientHeight - elbottom > this.panelHeight || eltop < this.panelHeight + 4) {
        // 面板在下方
        this.positionStyle = {
          width: `${elRight - elLeft}px`,
          left: elLeft + scrollLeft + 'px',
          top: elbottom + scrollTop + 4 + 'px',
        }
        // }
      } else {
        // 面板在上方
        this.positionStyle = {
          width: `${elRight - elLeft}px`,
          left: elLeft + scrollLeft + 'px',
          top: elbottom + scrollTop - 36 - this.panelHeight + 'px',
        }
      }
    },
    // 打开关闭弹窗
    changeOpen() {
      // if (this.appendBody && !this.selectFlag) {
      //   this.calcPosition();
      // }
      if (!this.selectFlag) {
        this.calcPosition()
      }
      this.selectFlag = !this.selectFlag
    },
    // 初始化事件， 这边不放到watch里，是需要做一些处理，排序，复选
    init() {
      if (this.value.length) {
        if (this.valueType === 'key') {
          this.selectIds = this.value
        } else {
          this.selectIds = this.value.map(item => {
            return item[this.options.id]
          })
        }
        this.sort && this.changeSelectOrder() // 排序
        this.hasAllSelect && this.itemChange() // 全选状态
      }
    },
    // 全选事件
    checkAllChange(value) {
      if (value) {
        this.currentList.forEach(item => {
          if (!this.selectIds.includes(item[this.options.id])) {
            this.selectIds.push(item[this.options.id])
          }
        })
      } else {
        let ids = this.currentList.map(item => {
          return item[this.options.id]
        })
        this.selectIds = this.selectIds.filter(item => {
          return !ids.includes(item)
        })
        if (!this.closable) {
          this.selectIds = [ids[0]]
          this.$nextTick(() => {
            this.indeterminate = true
          })
        } else {
          this.selectIds = []
        }
        ids = null
      }
      this.indeterminate = false
    },
    // checkbox局部事件
    itemChange() {
      let currentList = this.currentList.filter(item => {
        return this.selectIds.includes(item[this.options.id])
      })
      let length = currentList.length
      this.checkAll = length !== 0 && length === this.currentList.length
      this.indeterminate = length > 0 && length < this.currentList.length
      currentList = null
      length = null
      // dropdown数据和左侧父级的下拉列表的自动勾选逻辑
      let notCheckCurrentList = this.currentList.filter(item => { // 没有选中的下拉项（父级）的dropdown数据全部取消勾选
        return !this.selectIds.includes(item[this.options.id])
      })
      if (notCheckCurrentList.length) {
        notCheckCurrentList.forEach(item => {
          if (item.dropList && item.dropList.length > 0) {
            item.dropList.forEach(_ => {
              _.choose = false
            })
          }
        })
      }
      this.currentList.forEach(item => { // this.currentList实时更新下拉列表的选中态
        item.choose = this.selectIds.includes(item[this.options.id])
      })
    },
    getCurrentList() {
      return this.currentList
    },
    // 过滤搜索统计组
    searchGroup() {
      this.$nextTick(() => {
        this.currentList = this.dataList.filter(item => {
          return item[this.options.name].toLowerCase().includes(this.searchText.toLowerCase())
        })
        this.itemChange()
      })
    },
    // 点击空白处，关闭select下拉
    closeSelect(e) {
      if (
        this.selectFlag &&
        this.$refs.multiSearch &&
        !this.$refs.multiSearch.contains(e.target) &&
        this.$refs.multiContent &&
        !this.$refs.multiContent.contains(e.target)
      ) {
        this.selectFlag = false
      }
    },
    // 删除全部或某一项或关闭弹窗（icon下拉和删除图标公用一个事件）
    removeItem(id, flag = false) {
      if (id === -1) {
        // 全部删除
        this.selectIds = []
      } else {
        if (flag) {
          if (this.icon === 'h-icon-close_f') {
            // 全部删除
            this.selectIds = []
          } else {
            // 关闭下拉框
            this.selectFlag = !this.selectFlag
          }
        } else {
          // 删除某个id项
          this.selectIds = this.selectIds.filter(itemId => {
            return itemId !== id
          })
          !this.selectFlag && this.changeSelectOrder()
        }
      }

      this.$nextTick(() => {
        this.itemChange()
      })
    },
    // 改变选中的顺序，移到前面
    changeSelectOrder() {
      const top = []
      const bottom = []
      const global = []
      this.currentList = this.currentList.forEach(item => {
        if (this.unsortId.includes(item[this.options.id])) {
          global.push(item)
        } else if (this.selectIds.includes(item[this.options.id])) {
          top.push(item)
        } else {
          bottom.push(item)
        }
      })
      this.currentList = global.concat(top, bottom)
    },
    // 鼠标移入
    mouseenter() {
      this.mouseFlag = true
    },
    mouseleave() {
      this.mouseFlag = false
    },
  },
}
</script>
<style lang="scss">
.h-multi-selector-dropdown-menu{
  max-height: 400px;
}
.common_multi_selector{
  .el-checkbox__inner{
    border: none;
    background-color: transparent;
  }
  .search-item.set-top{
    border-bottom:none
  }
  .search-item{
    .el-checkbox__label {
      width: calc(100% - 25px);
    }
    .checkbox-item{
      // padding-left: 6px;
    }
    &:hover{
      background: rgba(0,0,0,0.02);
    }
  }
}
</style>
<style lang="scss" scoped>
.search-item{
  // margin-left: 2px;
}
.el-dropdown-menu{
  margin-left: 2px;
}
.el-dropdown-menu__item{
  display: flex;
  align-items: center;
  padding: 0 45px 0 12px;
  position: relative;
  .drop_item_svg{
    position: absolute;
    right: 12px;
  }
}
</style>