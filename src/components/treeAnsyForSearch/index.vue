<template>
  <div id="HKTreeFrameContainer" class="tree-frame-container" v-bind:style="{ top: top + 'px'}">
    <div class="tree-filter">
      <div class="select-area">
        <el-input
          class="filter-input"
          v-if="isFilter"
          :placeholder="placeHolder || `请输入${applicationSceneName}名称搜索`"
          v-model="condition"
          @keyup.enter.native.stop="handleSearchClick"
          @keydown.enter.native.stop="()=>{}"
          :on-icon-click="handleSearchClick"
          clearable
          suffix-icon="h-icon-search"
          :clear-icon-click='clearClick'>
        </el-input>
      </div>
      
      <el-input style="display:none;"></el-input>
      <div class="tree-wrap">
        <el-tree
          ref="tree"
          v-show="!isSearch"
          :show-checkbox="checkBox"
          :check-strictly='checkStrictly'
          :before-click="beforeClick"
          default-icon=""
          :data="treeData"
          simple-data
          parent-key="parentId"
          :props="defaultProps"
          node-key="nodeId"
          :default-expanded-keys="defaultExpandedKeys"
          :current-node-key="defaultCurrentNode"
          @node-click="getClickNode"
          :load="loadNode"
          lazy
          :expand-on-click-node="isExpandClickNode"
          @check-change='handleCheckChange'>
        </el-tree>
        <!-- 搜索结构 -->
        <el-scrollbar wrap-class="el-demo2-scrollbar__wrap" view-class="el-demo2-scrollbar__view" v-show="isSearch">
          <ul class="f-storeList" v-if="hackReset" @click.stop>
            <template v-if="!isMultiSearch">
              <span v-show='storeFilterList.length === 0' class="msg-tip">未查询到任何结果！</span>
              <li v-if="item.storeName" v-for="item in storeFilterList" @click="item.selectable && storeSelect(item)" :key='item.index' class="item-chose" v-bind:class="{'itemActive':item.isSelected, 'itemDisabled':!item.selectable}">{{item.storeName}}</li>
              <li v-if="item.nodeName" v-for="item in storeFilterList" @click="item.selectable && storeSelect(item)" :key='item.index' class="item-chose" v-bind:class="{'itemActive':item.isSelected, 'itemDisabled':!item.selectable}">{{item.nodeName}}</li>
            </template>
            <template v-else>
              <span v-show='storeFilterList.reduce((sum, arr) => sum + arr.length, 0) === 0' class="msg-tip">未查询到任何结果！</span>
              <template v-for="(block, idx) in storeFilterList">
                <div class="mt8 mb8 fw6" v-if="block.length > 0">{{ storeListProps[idx].title }}</div>
                <li v-if="item.storeName" v-for="item in block" @click="item.selectable && storeSelect(item, idx)" :key='item.index' class="item-chose" v-bind:class="{'itemActive':item.isSelected, 'itemDisabled':!item.selectable}">{{item.storeName}}</li>
                <li v-if="item.nodeName" v-for="item in block" @click="item.selectable && storeSelect(item, idx)" :key='item.index' class="item-chose" v-bind:class="{'itemActive':item.isSelected, 'itemDisabled':!item.selectable}">{{item.nodeName}}</li>
              </template>
            </template>
          </ul>
        </el-scrollbar>
      </div>
    </div>
  </div>
</template>
<script>
import { getTreeNext, getStoreList } from './proxy'
import '@/assets/icon/iconfont.css'
const Method = 'get'
export default {
  name: 'treeAnsyForSearchTree',
  props: {
    top: {
      type: String,
      default: '0'
    },
    checkBox: {
      type: Boolean,
      default: false
    },
    isInit: {  // 是否初始化
      type: Boolean,
      default: true
    },
    isFilter: {  // 是否需要搜索栏
      type: Boolean,
      default: true
    },
    isInitSelected: {  // 是否默认选中第一根节点
      type: Boolean,
      default: false
    },
    // 当前选中
    currentNode: {
      type: String,
      default: ''
    },
    // 默认选中异步搜索树的某个节点
    checkedNode: {
      type: Object,
      default: () => {
        return {
          nodeId: ''
        }
      }
    },
    // 异步树是否点击展开
    isExpandClickNode: {
      type: Boolean,
      default: false
    },
    // 刷新树
    refreshTree: {
      type: Boolean,
      default: false
    },
    isReset: {
      type: Boolean,
      default: false
    },
    // 异步
    treeAnsyProps: {
      type: Object,
      default: () => {
        return {}
      }
    },
    // 单个搜索接口，或者多个搜索接口
    storeListProps: {
      type: Object | Array,
      default: () => {
        return {
        }
      }
    },
    onlyCheckLeaf: {
      type: Boolean,
      default: false
    },
    canRootSelected: {
      type: Boolean,
      default: false
    },
    isStore: {
      type: Boolean,
      default: false
    },
    placeHolder: {
      type: String,
      default: ''
    },
    selectable: {
      type: Function,
      default: ()=>{
        return true
      }
    },
    nodesProcessHook: {
      type: Function,
      default: (nodes)=>{
        return nodes
      }
    },
    showStoreStatus: {
      type: Boolean,
      default: false,
    },
    checkStrictly: {
      type: Boolean,
      default: false
    },
    isHackReset: {
      type: Boolean,
      default: true
    },
    cascade: {
      type: Boolean,
      default: false
    },
    isLeafHandler: {
      type: Function,
    },
  },
  watch: {
    currentNode (n) {
      this.defaultCurrentNode = n
    },
    refreshTree (n) {
      if (n) {
        this.clearClick()
      }
    },
    isReset (n) {
      if (n) {
        this.clearClick()
        this.$emit('update:isReset', false)
      }
    },
    treeAnsyProps (n) {
      this.clearClick()
    }
  },
  mounted () {
    if (this.isInit) {
      this.getTree()
    }
  },

  data () {
    return {
      defaultProps: {
        children: 'children',
        nodeId: 'nodeId',
        label: 'nodeName',
        isLeaf: this.isLeaf,
        icon: 'icon',
        selectable: 'selectable'
      },
      type: '',
      rootData: {},
      condition: '',
      // true 显示同步树  false 显示list
      isSearch: false,
      hackReset: true,
      storeFilterList: [],
      treeData: [],
      clickNodeData: {},
      defaultCurrentNode: '',
      defaultExpandedKeys: [],
      /** 保存根节点 */
      originArea: '',
      storeStatus: '1',// 门店状态
    }
  },
  computed: {
    isMultiSearch() {
      return this.storeListProps instanceof Array
    },
  },
  methods: {

    beforeClick (data, node) {
      if(!data.selectable){
        return false
      }
      return new Promise(resolve => {
        if (this.onlyCheckLeaf) {
          this.loadNode(node, res => {
            if (this.isStore) {
              if (res.length === 0 && !data.modifyFlag) {
                resolve(true)
              } else {
                this.$refs.tree.expandNode(data)
                resolve(false)
              }
            } else {
              // res.length === 0
              // nodeType为 0,表示区域,就无法点击  1表示门店
              if (data.nodeType === 1 || (res.length === 0 && data.nodeType !== 0)) {
                resolve(true)
              } else {
                if (!data.parentId && this.canRootSelected) {
                  resolve(true)
                } else {
                  this.$refs.tree.expandNode(data)
                  resolve(false)
                }
              }
            }
          })
        } else {
          if (!this.isStore) {
            resolve(true)
            return 
          }
          resolve(!data.modifyFlag)
        }
      })
    },
    reloadNode (key) {
      this.$refs.tree.reload([key])
    },
    clearClick () {
      this.condition = ''
      this.type = 'clear'
      this.handleSearchClick()
    },
    storeSelect (data, idx) {
      if (this.isMultiSearch) {
        this.storeFilterList.forEach(block => {
          block.forEach((item, i) => {
            item.isSelected = false
          })
        })
      } else {
        this.storeFilterList.forEach((item, i) => {
          item.isSelected = false
        })
      }
      data.isSelected = true
      this.$emit('getClickData', data, idx)
      if (this.isHackReset) {
        this.hackReset = false
        this.$nextTick(() => {
          this.hackReset = true
        })
      }
    },
    isLeaf(data) {
      if (this.isLeafHandler) {
        return this.isLeafHandler(data)
      }
      return data.nodeType == 1
    },
    // 异步树
    getTree () {
      // method 没有值的时候,用默认的get
      !this.treeAnsyProps.method && (this.treeAnsyProps.method = Method)
      this.treeAnsyProps.params.nodeId = ''
      this.showStoreStatus && (this.treeAnsyProps.params.storeStatus = this.storeStatus)
      getTreeNext(this.treeAnsyProps).then(res => {
        if (res.code * 1 === 0 && res.data) {
          res.data.forEach((el)=>{
            el.selectable = this.selectable(el)
          })
          this.treeData = res.data ? res.data : []
          if (this.treeData.parentId === '' || !this.treeData.parentId || this.treeData.parentId === '-1') {
            this.treeData[0].icon = 'icon iconfont iconzonghang'
            this.originArea = res.data[0]
            this.$emit('getOriginArea', this.originArea.nodeId)
          }
          // 默认选中第一条
          if (this.isInitSelected) {
            this.treeInit([res.data], 'tree')
          }
        }
      })
    },
    searchData() {
      if (this.isMultiSearch) {
        Promise.all(this.storeListProps.map(prop => this.searchStoreList(prop))).then(allData => {
          this.storeFilterList = allData
        })
      } else {
        this.searchStoreList(this.storeListProps).then(data => {
          this.storeFilterList = data
        })
      }
    },
    // 获取门店列表
    searchStoreList (prop) {
      !prop.method && (prop.method = Method)
      if (prop.params && prop.params.nodeName) {
        prop.params.nodeName = this.condition
      } else {
        prop.params.condition = this.condition
        !prop.params.limit && (prop.params.limit = 300)
      }
      if (this.cascade) {
        prop.params.nodeName = this.condition
      }
      this.showStoreStatus && (prop.params.storeStatus = this.storeStatus)
      return getStoreList(prop).then(res => {
        if (res.code * 1 === 0) {
            res.data = this.nodesProcessHook(res.data)
          let storeFilterList = res.data || []
          storeFilterList.forEach((item, i) => {
            item.isSelected = false
            item.selectable = this.selectable(item)
          })
          return storeFilterList
        }
        return []
      })
    },
    treeInit (data, tree) {
      if (data && data.length > 0) {
        for (let item of data) {
          if (item[0].parentId === '' || !item[0].parentId || item[0].parentId === '-1') {
            try {
              // 获取根节点数据
              this.rootData = item[0]
              this.$emit('getTreeRoot', {
                root: this.$refs[tree].root,
                data: this.rootData
              })
              if (this.checkedNode && this.checkedNode.nodeId) {
                this.defaultCurrentNode = this.checkedNode.nodeId
              } else {
                this.defaultCurrentNode = item[0].nodeId
              }
              this.defaultExpandedKeys = [item[0].nodeId]
            } catch (e) { }
            // 缓存选中的节点data 和 node 信息
            if (!this.checkedNode || !this.checkedNode.nodeId) {
              this.clickNodeData = item[0]
              // true 树加载默认选中标识
              if (this.type) { // 清除搜索框，避免直接关闭下拉菜单（用于下拉树）
                this.$emit('getClickData', item[0], 1, this.type)
                this.type = ''
              } else {
                this.$emit('getClickData', item[0], 1)
              }
            }
          }
        }
      }
    },
    loadNode (node, resolve) {
      if (node.level === 0) {
        return resolve(this.treeData)
      } else {
        !this.treeAnsyProps.method && (this.treeAnsyProps.method = Method)
        this.treeAnsyProps.params.nodeId = node.data.nodeId
        if (this.cascade && node.data.cascadeNodeType !== undefined) this.treeAnsyProps.params.cascadeNodeType = node.data.cascadeNodeType
        getTreeNext(this.treeAnsyProps).then(res => {
          if (res.code * 1 === 0 && res.data) {
            res.data = this.nodesProcessHook(res.data)
            res.data.forEach( (item)=> {
              if (item.nodeType === 0) {
                item.icon = 'iconfont iconic_tree_place'
              } else if (item.nodeType === 1) {
                item.icon = 'iconfont iconic_store'
              } else {
                item.icon = 'iconfont iconic_tree_place'
              }
              item.selectable = this.selectable(item)
            })
            resolve(res.data ? res.data : [])
          }
        })
      }
    },
    // 搜索列表
    handleSearchClick () {
      // 搜索有值,获取门店列表, 没值获取异步树
      if (this.condition) {
        if (this.condition.indexOf('%') !== -1) {
          this.$message.warning('搜索字符串不能包含特殊字符%')
          return
        }
        this.isSearch = true
        this.searchData()
      } else {
        this.isSearch = false
        this.getTree()
      }
      this.$emit('clearClick')
    },
    getCheckedKey () {
      let array = this.$refs.tree.getCheckedKeys()
      this.$emit('getCheckedKey', array)
      return array
    },
    getCheckedNodes () {
      let array = this.$refs.tree.getCheckedNodes()
      return array
    },
    setCheckedNodes(nodeList) {
      this.$refs.tree.setCheckedNodes(nodeList)
    },
    handleCheckChange(data) {
      this.$emit('check-change', data)
    },
    getClickNode (data, node, vue) {
      if(!data.selectable){
        return
      }
      this.clickNodeData = data
      this.$emit('handleClick')
      this.$emit('getClickData', data, node.level, node)
    },
    handleStoreStatusChange (value) {
      this.handleSearchClick()
    },
  }
}
</script>
<style lang="scss">
.el-demo2-scrollbar__wrap {
  max-height: 100%;
  overflow-x: hidden !important;
}
#HKTreeFrameContainer{
  flex: 1;
  height: 100%;
  width: 100%;
  padding: 8px;
  .tree-filter {
    height: 100%;
    position: relative;
    .tree-wrap {
      padding-top: 8px;
      position: absolute;
      left: 0;
      right: 0;
      top: 32px;
      bottom: 0;
      .el-tree {
        .el-tree-node__icon {
          font-size: 16px !important;
        }
      }
    }
    .select-area {
      display: flex;
      .tree-store-status {
        width: 64px;
        height: 32px;
        border: none;
        .el-input__inner {
          border:none;
          padding-right: 30px !important;
        }
      }
      .filter-input {
        flex: 1;
      }
    }
  }
  .f-storeList {
    padding: 0 10px 15px 10px;
    span.msg-tip {
      width: 100%;
      text-align: center;
      font-size: 12px;
      color: #888;
      // margin-left: 60px;
      margin-top: 53px;
      display: inline-block;
    }
    .item-chose {
      color: #666;
      font-size: 12px;
      position: relative;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      height: 32px;
      line-height: 32px;
      box-sizing: border-box;
      padding: 0 5px;
      cursor: pointer;
    }
    .item-chose:hover {
      background-color: #2080f7;
      color:#fff;
    }
    .itemActive {
      background-color: #2080f7;
      color:#fff;
    }
    .itemDisabled {
      color: #ccc;
      cursor: not-allowed;
    }
  }
}
</style>
