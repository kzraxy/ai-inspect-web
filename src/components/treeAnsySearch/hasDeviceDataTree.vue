<template>
  <div class="tree-frame-hasDeviceTree" v-bind:style="{top:top+'px',height:height+'px'}">
    <div class="tree-filter">
      <el-input v-if="isFilter" class="tree-filter-inp" :placeholder="placeHolder" suffix-icon="h-icon-search" :style="{width:treeW+'px'}"
      v-model="nameLike" @keyup.enter.native="handleSearchClick" :on-icon-click="handleSearchClick" clearable :clear-icon-click='clearClick'>
      </el-input>
      <div class="tree-wrap" :style="{width:treeW+'px',bottom:treeBot+'px'}">
        <!-- 组织区域树 -->
        <el-tree class="tree-left" v-show="!isSearch&&!deviceShow" :before-click="beforeClick" default-icon="" :data="treeData" simple-data parent-key="parentId"
        :props="defaultProps" node-key="groupId" :default-expanded-keys="defaultExpandedKeys" :current-node-key="defaultCurrentNode" ref="tree"
        @node-click="getClickNode" :load="loadNode" lazy :expand-on-click-node="isExpandClickNode">
        </el-tree>
        <!-- 设备/预置点列表 -->
        <el-scrollbar wrap-class="el-demo2-scrollbar__wrap" view-class="el-demo2-scrollbar__view" v-show="!isSearch&&deviceShow">
          <el-button type="iconButton" icon="h-icon-arrow_left" @click="backTree()">{{clickNodeData.groupName}}</el-button>
          <ul class="f-storeList" v-if="hackReset" @click.stop>
            <span v-show='channelList.length === 0' class="msg-tip">未查询到任何结果！</span>
            <li v-for="(item,index) in channelList" @click="deviceSelect(item,index)" :key='index' class="item-chose channel_item" v-bind:class="{'itemChannelActive':item.isSelected || (item.id ===currentChannel.id)}" :title="item.channelName">
              <div class="select_icon_wrap"><div v-show="item.isSelected || (item.id ===currentChannel.id)" class="h-icon-done"
              style="font-size:22px;margin-top:6px;color:rgba(0,0,0,0.70);"></div></div>
              <div class="channel_name">{{item.channelName+(item.presetName?' - '+item.presetName:'')}}</div>
            </li>
          </ul>
        </el-scrollbar>
        <!-- 搜索门店结果 -->
        <el-scrollbar wrap-class="el-demo2-scrollbar__wrap" view-class="el-demo2-scrollbar__view" v-show="isSearch">
          <ul class="f-storeList" v-if="hackReset" @click.stop>
            <span v-show='storeFilterList.length === 0' class="msg-tip">未查询到任何结果！</span>
            <li v-for="item in storeFilterList" @click="storeSelect(item, true)" :key='item.index' class="item-chose" v-bind:class="{'itemActive':item.isSelected, 'itemNoShow': !item.storeName}">{{item.storeName}}</li>
            <li v-for="item in storeFilterList" @click="storeSelect(item, true)" :key='item.index' class="item-chose" v-bind:class="{'itemActive':item.isSelected, 'itemNoShow': !item.groupName}">{{item.groupName}}</li>
          </ul>
        </el-scrollbar>
      </div>
    </div>
  </div>
</template>
<script>
import { getTreeNext, getStoreList, getChannelPresetList } from './proxy'
import '@/assets/icon/iconfont.css'
const Method = 'get'
export default {
  name: 'OrganizationTree',
  props: {
    top: {
      type: String,
      default: '0'
    },
    height: {
      type: String,
      default: ''
    },
    treeW: {// 树外层样式
      type: String,
      default: '200'
    },
    treeBot: {// 树外层样式
      type: String,
      default: '10'
    },
    isInit: { // 是否初始化
      type: Boolean,
      default: true
    },
    isFilter: { // 是否需要搜索栏
      type: Boolean,
      // default: false
      default: true
    },
    isInitSelected: { // 是否默认选中第一根节点
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
          groupId: ''
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
        return {
        }
      }
    },
    // 同步
    storeListProps: {
      type: Object,
      default: () => {
        return {
        }
      }
    },
    onlyCheckLeaf: {
      type: Boolean,
      default: false
    },
    placeHolder: {
      type: String,
      default: '请输入名称'
    }
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
        groupId: 'groupId',
        label: 'groupName',
        isLeaf: 'leaf',
        icon: 'icon'
      },
      type: '',
      rootData: {},
      nameLike: '',
      isSearch: false, // true 显示门店列表
      deviceShow: false,
      hackReset: true,
      storeFilterList: [],
      treeData: [],
      clickNodeData: {},
      defaultCurrentNode: '',
      defaultExpandedKeys: [],
      channelList: [],
      currentChannel: {}
    }
  },
  methods: {
    clearActiveStyle () { // 清除列表的高亮样式
      this.channelList.forEach(val => { val.isSelected = false })
      this.currentChannel = {}
      this.resetHackReset()
    },
    resetHackReset () { // 重新渲染列表，设置高亮样式或取消
      this.hackReset = false
      this.$nextTick(() => {
        this.hackReset = true
      })
    },
    beforeClick (data, node) {
      return new Promise(resolve => {
        if (this.onlyCheckLeaf) {
          this.loadNode(node, res => {
            if (res.length === 0) {
              resolve(true)
            } else {
              this.$refs.tree.expandNode(data)
              resolve(false)
            }
          })
        } else {
          resolve(true)
        }
      })
    },
    reloadNode (key) {
      this.$refs.tree.reload([key])
    },
    clearClick () {
      this.nameLike = ''
      this.type = 'clear'
      this.handleSearchClick()
    },
    storeSelect (data) {
      this.storeFilterList.forEach((item, i) => {
        item.isSelected = false
      })
      data.isSelected = true
      this.$emit('getClickData', data)
      this.resetHackReset()
      this.getClickNode(data)
    },
    // 异步树
    getTree () {
      // method 没有值的时候,用默认的get
      !this.treeAnsyProps.method && (this.treeAnsyProps.method = Method)
      this.treeAnsyProps.params.parentId = ''// 传给后端的参数名是parentId，实际就是目前节点的groupId
      this.treeAnsyProps.params.groupType = ''
      getTreeNext(this.treeAnsyProps).then(res => {
        if (res.code * 1 === 0 && res.data) {
          this.treeData = res.data ? res.data : []
          if (this.treeData.parentId === '' || !this.treeData.parentId || this.treeData.parentId === '-1') {
            this.treeData[0].icon = 'icon iconfont iconzonghang'
          }
          // 默认选中第一条
          if (this.isInitSelected) {
            this.treeInit([res.data], 'tree')
          }
        }
      })
    },

    // 获取组织列表
    searchStoreList () {
      !this.storeListProps.method && (this.storeListProps.method = Method)
      this.storeListProps.params.nameLike = this.nameLike
      this.storeListProps.params.limit = 100
      getStoreList(this.storeListProps).then(res => {
        if (res.code * 1 === 0) {
          this.storeFilterList = res.data || []
          this.storeFilterList.forEach((item, i) => {
            item.isSelected = false
          })
        }
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
              if (this.checkedNode && this.checkedNode.groupId) {
                this.defaultCurrentNode = this.checkedNode.groupId
              } else {
                this.defaultCurrentNode = item[0].groupId
              }
              this.defaultExpandedKeys = [item[0].groupId]
            } catch (e) { }
            // 缓存选中的节点data 和 node 信息
            if (!this.checkedNode || !this.checkedNode.groupId) {
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
        // this.treeAnsyProps.params.groupId = node.data.groupId
        this.treeAnsyProps.params.parentId = node.data.groupId// 传给后端的参数名是parentId，实际就是目前节点的groupId
        this.treeAnsyProps.params.groupType = node.data.groupType
        getTreeNext(this.treeAnsyProps).then(res => {
          if (res.code * 1 === 0 && res.data) {
            res.data.forEach(function (item) {
              item.isLeaf = false
              if (item.groupType === 0) {
                item.icon = 'iconfont iconic_tree_place'
              } else if (item.groupType === 1) {
                item.icon = 'iconfont iconic_store'
                item.isLeaf = true
              } else {
                item.icon = 'iconfont iconic_tree_place'
              }
            })
            resolve(res.data ? res.data : [])
          }
        })
      }
    },
    // 搜索列表
    handleSearchClick () {
      // 搜索有值,获取组织列表, 没值获取异步树
      if (this.nameLike) {
        this.isSearch = true
        this.searchStoreList()
      } else {
        this.isSearch = false
        this.getTree()
      }
    },
    getClickNode (data, node, vue) {
      this.clickNodeData = data
      if (data.groupType === 1) { // 1是门店节点，展示通道/预置点列表
        this.isSearch = false
        this.deviceShow = true
        getChannelPresetList({ groupId: data.groupId, groupType: data.groupType, taskType: 'CLOUD', taskAnalysisMode: 'POLLING_SNAP' }).then(res => {
          if (res.code === 0) {
            this.channelList = res.data
          }
        })
      }
      this.$emit('getClickData', data)
    },
    backTree () {
      this.deviceShow = false
      if (this.nameLike) { // 之前是门店查询状态，保持查询状态
        this.isSearch = true
        this.searchStoreList()
      }
    },
    deviceSelect (item, index) {
      this.channelList.forEach(val => { val.isSelected = false })
      item.isSelected = true
      // this.resetHackReset()
      this.$emit('deviceNodeSelect', item)
      this.currentChannel = item
    }
  }
}
</script>
<style lang="scss">
.el-demo2-scrollbar__wrap {
  max-height: 100%;
  overflow-x: hidden !important;
}
.tree-frame-hasDeviceTree {
  padding: 8px;
  position: absolute;
  // left: -5px;
  // right: 0px;
  bottom: 0px;
  .channel_item{
    display: flex;
    align-items: center;
    .select_icon_wrap{
      width: 26px;
      height: 100%;
      text-align: right
    }
  }
  .tree-filter {
    height: 100%;
    position: relative;
    .tree-wrap {
      padding-top: 8px;
      position: absolute;
      left: 0px;
      right: 0px;
      top: 32px;
      // width:200px;
      // bottom: 10px;
      .tree-left{
        // height:98%!important
      }
    }
  }
  .tree-filter-inp{
    // width: 200px;
    input{
      padding-left: 15px;
    }
  }
}
.f-storeList {
  padding: 0px 10px 15px 10px;
  span.msg-tip {
    font-size: 12px;
    color: #888;
    margin-left: 30px;
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
    background-color: rgba(33, 150, 243, 0.08);
  }
  .itemActive {
    background-color: rgba(33,150,243,.08);
  }
  .itemChannelActive{
    color: #2182F7;
    font-weight: 600;
  }
  .itemNoShow{
    display: none;
  }
}
</style>
