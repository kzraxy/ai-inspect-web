<template>
  <div id="HKSidebarTree">
    <div class="searchPart">
      <el-input
        :placeholder="localPlaceholder||placeholder"
        class="surface-input input-clearable"
        suffix-icon="h-icon-search"
        :on-icon-click="handleIconClick"
        :clear-icon-click="handleClearIconClick"
        @keyup.enter.native='handleIconClick'
        clearable
        @change="inputChange"
        v-model="filterText">
      </el-input>
    </div>
    <div class="treePart" v-loading="searching">
      <el-tree
        v-if="!filterFlag"
        ref="sidebarTree"
        :data="treeData"
        node-key="nodeId"
        :props="defaultProps"
        @node-click="areaSelect"
        :before-click="beforeClick"
        :expand-on-click-node="expandOnClickNode"
        :render-content="renderContent"
        show-icon
        default-icon=""
        :current-node-key='currentId'
        :default-expanded-keys="defaultExpandedKeys">
      </el-tree>
      <!--筛选后的区域列表数据-->
      <el-scrollbar v-if="filterFlag" wrapStyle="height:100%;overflow-x:hidden;">
        <ul class="fStoreList"  @click.stop>
          <span v-show='areaList.length === 0 && isDefault' class="msgTip">未查询到任何{{needStore ? applicationSceneName : '区域'}}！</span>
          <div v-show='areaList.length === 0 && !isDefault' class="empty-msg-tip">暂无数据</div>
          <li v-for="(area, idx) in areaList"
              class="dItem"
              :key="idx"
              v-bind:class="{'active': currentId === area.nodeId }"
              @click="areaSelect(area, true)">{{area.nodeName}}</li>
          <li v-if="showNext" class="load-more" @click="nextPage">加载更多</li>
        </ul>
      </el-scrollbar>
    </div>
  </div>
</template>
<script>
  import treeNode from './treenode'
  import {
    getAreaTree,
    findAreaListByAreaName,
    searchPagedStore,
  } from './proxy'
  export default {
    name: 'HKSidebarTree',
    props: {
      emitOnClear: {
        type: Boolean,
        default: true,
      },
      needStore: {
        type: Boolean,
        default: false,
      },
      onlyStoreSelect: {
        type: Boolean,
        default: false,
      },
      defaultSelect: {
        type: Boolean,
        default: true,
      },
      localPlaceholder: {
        type: String,
        default: '',
      },
      expandOnClickNode: {
        type: Boolean,
        default: false
      },
      isDefault: {
        type: Boolean,
        default: true
      },
      taskDeliverUser: {
        type: String,
        default: '',
      },
    },
    data () {
      return {
        filterText: '', // 筛选条件
        filterFlag: false, // 筛选标识
        areaList: [], // 区域筛选列表
        defaultExpandedKeys: [], // 默认展开的节点
        treeData: [],
        currentNode: null,
        currentId: null,
        defaultProps: {
          children: 'subAreas',
          label: 'nodeName',
          icon: 'icon'
        },
        pageSize: 30,
        pageNo: 1,
        totalPage: 1,
        searching: false,
        searchModes: {
          area: {
            api: findAreaListByAreaName,
          },
          store: {
            api: searchPagedStore,
            preHandler: (data) => data.forEach(e => {
              e.nodeId = e.storeId
              e.nodeName = e.storeName
              e.nodeType = 1
            })
          }
        }
      }
    },
    computed: {
      currentNodeId() {
        return this.currentNode.nodeId
      },
      searchMode() {
        return this.searchModes[this.needStore ? 'store' : 'area']
      },
      showNext() {
        return this.totalPage > this.pageNo
      },
      placeholder() {
        return `请输入${this.needStore ? this.applicationSceneName : '区域'}名称搜索`
      },
    },
    watch: {},
    async mounted () {
      this.initTree()
    },
    methods: {
      async initTree() {
        try {
          const params = {}
          if(this.taskDeliverUser) params.taskDeliverUser = this.taskDeliverUser // 如果有巡查人，就查巡查人有权限的区域
          const { code, data } = await getAreaTree(params)
          if (+code === 0 && data) {
            this.treeData = data || []
            if (this.treeData.length) {
              this.treeData[0].icon = 'icon iconfont iconzonghang'
              if (this.defaultSelect) {
                this.$nextTick(() => {
                  this.$refs.sidebarTree.setCurrentKey(this.treeData[0].nodeId)
                  this.defaultExpandedKeys = [this.treeData[0].nodeId]
                  this.currentNode = this.treeData[0]
                  this.$emit('onSelect', this.currentNode)
                })
              }
            }
          }
        } catch (e) {}
      },
      inputChange (val) { // 搜索内容发生变化
        if (this.filterFlag && val === '') {
          this.handleClearIconClick()
        }
      },
      beforeClick (data, node) {
        // 仅根节点和门店节点可以选择  区域节点选择时展开/收起门店列表
        if (this.expandOnClickNode && data.nodeType !== 1 && data.parentId) {
          if (node.expanded) {
            this.$nextTick(() => {
              this.$refs.sidebarTree.collapseNode(data.nodeId)
            })
          } else {
            this.$nextTick(() => {
              this.$refs.sidebarTree.expandNode(data.nodeId)
            })
          }
          return false
        }
      },
      areaSelect (val, flag) { // 门店选择
        let func = () => {
          this.$emit('onSelect', val)
          if (flag === true) {
            this.currentId = val.nodeId
          } else {
            this.currentNode = val
          }
        }
        if (!this.onlyStoreSelect) {
          func()
          return
        }
        if (val.nodeType === 1) {
          func()
        }
      },
      renderContent (h, { node, data, store }) {
        return h('span', { class: 'el-tree-node__label' }, [
          h(treeNode, {
            props: {
              treenode: node,
              treedata: data,
              treestore: store,
              needStore: this.needStore,
              taskDeliverUser: this.taskDeliverUser,
            }
          })
        ])
      },
      async handleIconClick () { // 搜索区域
        try {
          if (!this.filterText) {
            this.filterFlag = false
            return
          }
          if (this.filterText.indexOf('%') !== -1) {
            this.$message.warning('搜索字符串不能包含特殊字符%')
            return
          }
          this.areaList = []
          this.pageNo = 1
          this.totalPage = 1
          const params = {
            isLeafArea: false,
            condition: this.filterText,
            pageSize: this.pageSize,
            pageNo: 1
          }
          this.searchApi(params)
        } catch (e) {}
      },
      nextPage() {
        const params = {
          isLeafArea: false,
          condition: this.filterText,
          pageSize: this.pageSize,
          pageNo: this.pageNo + 1,
        }
        this.searchApi(params)
      },
      async searchApi(params) {
        if (this.searching) return
        try {
          this.searching = true
          if(this.taskDeliverUser) params.taskDeliverUser = this.taskDeliverUser // 如果有巡查人，就查巡查人有权限的门店列表
          const {code, data} = await this.searchMode.api(params)
          if (code !== 0) return
          if (this.searchMode.preHandler) {
            this.searchMode.preHandler(data.rows)
          }
          this.areaList.push(...data.rows)
          this.pageNo = data.pageNo
          this.totalPage = data.totalPage
          this.filterFlag = true
          this.searching = false
        } catch {
          this.searching = false
        }
      },
      handleClearIconClick () { // 清除搜索内容
        this.areaList = []
        this.filterFlag = false
        this.$nextTick(() => {
          this.$refs.sidebarTree.setCurrentKey(this.currentNodeId)
          if (this.emitOnClear) {
            this.$emit('onSelect', this.currentNode)
          }
        })
      },
      reset(reload = false) {
        this.areaList = []
        this.filterFlag = false
        this.filterText = ''
        if (reload) {
          if (this.treeData[0]) this.$refs.sidebarTree.collapseNode(this.treeData[0].nodeId)
          this.initTree()
          return
        }
        if (!this.treeData[0]) {
          return
        }
        this.currentNode = this.treeData[0]
        this.$refs.sidebarTree.setCurrentKey(this.currentNode.nodeId)
        this.$emit('onSelect', this.currentNode)
      },
      setCurrent(node){
        this.areaSelect(node||this.treeData[0],true)
      }
    }
  }
</script>
<style lang="scss" scoped>
  @import "./style.scss";
</style>
<style lang="scss">
#HKSidebarTree {
  .el-tree-node__icon {
    font-size: 16px !important;
  }
  .el-tree-node__label{
    .overflowhome{
      span{
        width: 100%!important;
      }
    }
  }
}
</style>