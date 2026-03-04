<template>
  <div id="HKMultiStoreTreeView" ref="HKMultiStoreTreeView">
    <div class="area-select">
      <div class="selWarp" :class="{'selWrapHover': expand}" @mouseenter="inputHover = true" @mouseleave="inputHover = false" @click="togglePanel">
        <div style="max-width: 168px" class="elSelectTags" v-if="tags.length > 0">
          <el-tag v-for="tag in tags" :key="tag.nodeId" disable-transitions type="primary"
            maxWidth="80px" :closable="true" @close.stop="removeTag(tag)">
            {{ tag.nodeName }}
          </el-tag>
        </div>
        <span v-show="tags.length === 0" class="placeholder">{{ applicationSceneName }}选择</span>
        <i :class="inputIconClass" class="tree-select__input-icon" :style="{'transform': expand?'rotate(180deg)':'none'}" @click="inputIconClick"/>
      </div>
      <transition name="fade">
        <div v-show="expand" class="expand-pane" ref="expandPane">
          <el-input class="surface-input input-clearable" :placeholder="`请输入${applicationSceneName}名称搜索`" suffix-icon="h-icon-search" kind="surface"
            :on-icon-click="handleIconClick" :clear-icon-click="handleClearIconClick" @keyup.enter.native='handleIconClick' clearable v-model="filterText">
          </el-input>
          <div class="dropdown-tree-container">
            <!--多选门店区域树-->
            <el-tree class="multiTree" v-show="!filterFlag" :data="storeList" node-key="nodeId" :props="defaultProps" @node-click="areaSelect"
              @check="check" :render-content="renderContent" :show-checkbox="showCheckbox" ref="multiTree">
            </el-tree>
            <!--搜索树-->
            <el-tree id="filterTree" v-show="filterFlag" :data="filterList" :props="defaultProps" :show-checkbox="showCheckbox"
              node-key="nodeId" @check="filterTreeCheck" ref="filterTree" simple-data>
            </el-tree>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>
<script>
import { Message } from 'hui'
import { getPublishTreeData, searchTreeData } from '@/api/index'
import treeNode from './treeNode.vue'
export default {
  name: 'StoreTreeView',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    initStore: { // 是否初始化门店
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      inputHover: false,
      expand: false,
      filterText: '', // 过滤条件
      storeList: [], // 门店列表
      filterFlag: false,
      filterList: [], // 门店（区域）筛选列表
      tags: [],
      showCheckbox: true, // 显示复选框
      root: [], // 根节点Id
      defaultProps: { // 默认属性
        children: 'subAreas',
        label: 'nodeName',
        icon: 'icon',
        showCheckbox: 'showCheckbox',
        disabled: 'forbidden', // 复选框是否禁用
        selectable: 'selectable' // 是否可选择
      }
    }
  },
  computed: {
    inputIconClass () {
      return this.tags.length > 0 && this.inputHover
        ? 'h-icon-close_f'
        : 'h-icon-angle_down_sm'
    }
  },
  async mounted () {
    document.addEventListener('mouseup', (e) => {
      this.closeSelect(e)
    })
    try {
      const { code, data } = await getPublishTreeData({parentId: '', groupType: ''})
      if (+code === 0 && data) {
        data.forEach(_ => {
          _.nodeId = _.groupId,
          _.nodeName = _.groupName,
          _.nodeType = _.groupType
        })
        this.storeList = data || []
        if (this.storeList[0]) {
          this.storeList[0].forbidden = true
          this.storeList[0].showCheckbox = false
          this.$nextTick(() => {
            this.$refs.multiTree.expandNode(this.storeList[0].nodeId)
          })
        }
        if (this.initStore) {
          const map = data[0] || {}
          map.nodeType = 0
          this.tags = [map] || []
          this.root = map // 把根节点数据备份以便后续使用
          this.$emit('onChecked', this.tags)
          this.$nextTick(() => {
            this.$refs.multiTree.setSelected(this.root.nodeId, true)
          })
        }
      }
    } catch (e) {}
  },
  methods: {
    closeSelect (e) {
      if (
        this.expand &&
        this.$refs.HKMultiStoreTreeView &&
        !this.$refs.HKMultiStoreTreeView.contains(e.target) &&
        this.$refs.expandPane &&
        !this.$refs.expandPane.contains(e.target)
      ) {
        this.togglePanel(false)
      }
    },
    inputIconClick (e) {
      if (
        this.tags.length > 0 &&
        this.inputHover
      ) {
        e.stopPropagation()
        this.$refs.multiTree.setCheckedKeys([])
        this.$refs.filterTree.setCheckedKeys([])
        this.$nextTick(() => {
          this.tags = []
          this.$emit('onChecked', this.tags)
        })
      }
    },
    renderContent (h, { node, data, store }) {
      return h('span', { class: 'el-tree-node__label' }, [
        h(treeNode, {
          props: {
            treenode: node,
            treedata: data,
            treestore: store
          }
        })
      ])
    },
    togglePanel (expand) {
      if (typeof expand === 'boolean') {
        this.expand = expand
        return
      }
      this.expand = !this.expand
    },
    areaSelect (row) { // 区域选择
      // 取消门店树与搜索树的选中状态
      this.tags.forEach(tag => {
        this.$refs.multiTree.setChecked(tag.nodeId, false)
        this.$refs.filterTree.setChecked(tag.nodeId, false)
      })
      this.$nextTick(() => {
        this.tags = [row]
        this.$emit('onChecked', this.tags)
        // this.$refs.dropdown.hide()
      })
    },
    filterTreeCheck (treenode) { // 门店搜索树选择
      this.checkAction(treenode, 'filterTree')
    },
    check (treenode) { // 门店选择
      this.checkAction(treenode, 'multiTree')
    },
    checkAction (treenode, flag) {
      /*
        * 对门店数据的过滤分如下几种情况
        * 1：判断已选中的是否是区域，若是区域则应该删除该区域，然后选中门店
        * 2: 门店最多只能选中五个
        * 3: 查看当前门店是否已经被选中，若未选中则添加,若已选中则删除
        * */
      // 对于默认选中区域的情形，应该取消区域的选中状态
      if (flag === 'multiTree' && this.tags.length === 1 && this.tags[0].nodeType === 0) {
        this.$refs[flag].setSelected(this.tags[0].nodeId, false)
      }
      const result = this.tags.findIndex((row) => { return row.nodeType === 0 })
      if (result !== -1) {
        this.tags = []
      }
      // 查看当前门店是否已经被选中，若未选中则添加,若已选中则删除
      const index = this.tags.findIndex(row => { return treenode.nodeId === row.nodeId })
      if (index === -1) { // 若未选中则检查门店是否超过五家，超过则返回
        this.tags.push(treenode)
      } else {
        const errMessage = `至少需保留一个区域或${this.applicationSceneName}`
        this.tags.splice(index, 1)
      }
      this.$emit('onChecked', this.tags)
    },
    removeTag (tag) { // 删除标签
      const index = this.tags.findIndex(row => { return row.nodeId === tag.nodeId })
      if (index !== -1) {
        this.tags.splice(index, 1)
        this.$refs.multiTree.setChecked(tag.nodeId, false)
        this.$refs.filterTree.setChecked(tag.nodeId, false)
        this.$emit('onChecked', this.tags)
      }
    },
    async handleIconClick () { // 点击搜索按钮事件
      try {
        if (this.filterText) {
          const { code, data } = await searchTreeData({
            nameLike: this.filterText,
            limit: 100
          })
          if (+code === 0 && data) {
            const rows = data || []
            // 统一数据模型转换
            this.filterList = rows.map(row => {
              return {
                nodeId: row.groupId,
                nodeName: row.groupName,
                nodeType: 1,
                selectable: false // 使节点不可选selectable
              }
            })
            this.filterFlag = true
            // 选中已选择的门店节点filterTree
            this.$nextTick(() => {
              this.tags.forEach(tag => {
                this.$refs.filterTree.setChecked(tag.nodeId, true)
              })
            })
          }
        } else {
          this.filterFlag = false
        }
      } catch (e) {}
    },
    handleClearIconClick () { // 搜索条件清除事件
      this.filterList = []
      this.filterFlag = false
    }
  }
}
</script>
<style lang="scss" scoped>
  @import "style";
</style>
<style lang="scss">
  #filterTree{
    .el-tree-node__expand-icon {
      display: none;
    }
    .el-tree-node.is-nonselectable>.el-tree-node__content .el-tree-node__icon, .el-tree-node.is-nonselectable>.el-tree-node__content .el-tree-node__label{
      color: #4d4d4d;
    }
  }
</style>
