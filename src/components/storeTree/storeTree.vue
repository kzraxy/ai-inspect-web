<template>
  <div :style="{'width':width}" id="SB_StoreTreeView">
    <el-dropdown trigger="click" menu-align="start" class="el-dropdown-con" ref="dropdown" style="width:100%" @visible-change="visibleChange">
      <div class="space-between">
        <input class="overflowhome" placeholder="请选择组织" v-model = "storeName" readonly/>
        <div class="icon">
          <i class="el-tree-node__expand-icon h-icon-angle_down" style="margin-top:7px"></i>
        </div>
      </div>
      <el-dropdown-menu slot="dropdown">
        <div class="TreeDropdownStoreTreeSelect" :style="{'width':width}">
          <!-- <el-input
            class="surface-input input-clearable"
            placeholder="搜索组织"
            icon="h-icon-search"
            kind="surface"
            :on-icon-click="handleIconClick"
            :clear-icon-click = "handleClearIconClick"
            @keyup.enter.native = 'handleIconClick'
            clearable
            v-model="filterText">
          </el-input> -->
          <el-input class="surface-input input-clearable" :placeholder="searchPlaceHolder" suffix-icon="h-icon-search" kind="surface" clearable v-model="searchAreaVal">
          </el-input>
          <div class="dropdown-tree-container" style="height:350px">
            <el-tree
              :data="treeData"
              node-key="id"
              parent-key="pId"
              ref="areatree"
              :current-node-key="currentNodeKey"
              @node-click="storeSelect"
              :props="defaultProps"
              show-icon simple-data default-expand-all
               :filter-node-method="filterAreaNode">
            </el-tree>
          </div>
        </div>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>
<script>
import treeNode from './treeNode/treeNode'
import overflow from '@/components/overflow/index'
export default {
  components: {
    treeNode,
    overflow
  },
  props: {
    width: {
      type: String,
      default: '295px'
    },
    height: {
      type: String,
      default: '100%'
    },
    treeData: {
      type: Array,
      default: () => { return [] }
    },
    searchPlaceHolder: {
      type: String,
      default: '搜索组织名'
    }
  },
  mounted () {},
  watch: {
    treeData (val) {
      if (val.length > 0) {
        var res = val.filter(item => !item.pId)
        this.defaultExpandedKeys = [res.storeId]
        this.storeId = res[0].id
        this.storeName = res[0].name
      }
    },
    selectId (val) {
      this.selectNodeById(val)
    },
    searchAreaVal (val) {
      this.$refs.areatree.filter(val)
    }
  },
  computed: {
    selectWidth () {
      return this.width.split('px')[0] * 1 - 35 + 'px'
    },
    treeWidth () {
      return this.width.split('px')[0] * 1 - 50
    }
  },
  data () {
    return {
      searchAreaVal: '',
      defaultProps: {
        children: 'subAreas',
        label: 'name'
      },
      storeName: '',
      storeId: '',
      currentNodeKey: '',
      currentAreaNode: '',
      defaultExpandedKeys: [],
      storeIds: []
    }
  },
  methods: {
    visibleChange () {
      this.searchAreaVal = ''
    },
    selectNodeById (val) {
      try {
        this.$refs.areatree.setSelected(val)
        this.currentNodeKey = val
      } catch (err) {
        this.$nextTick(() => {
          this.selectNodeById(val)
        })
      }
    },
    // 过滤区域
    filterAreaNode (value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    storeSelect (row, flag) { // 组织选择
      this.storeIds = []
      this.storeId = row.id
      this.storeName = row.name
      this.$emit('onStoreSelect', this.storeId, this.storeName, '1', this.getChildrenList(row))
      this.$refs.dropdown.hide()
    },
    getChildrenList (row) {
      if (row.children) {
        row.children.map(item => { this.storeIds.concat(this.getChildrenList(item)) })
      } else {
        this.storeIds.push(row.id)
      }
      return this.storeIds
    }
  }
}
</script>
<style lang="scss" scoped>
#SB_StoreTreeView{
  .space-between{
    position:relative;
    .overflowhome{
      background-color: #fff;
      border-radius: 2px;
      border: 1px solid #E6E6E6;
      color: #666;
      font-size: inherit;
      height: 32px;
      line-height: 1;
      outline: 0;
      padding: 3px 30px 3px 8px;
      transition: border-color .2s cubic-bezier(.645,.045,.355,1);
      width: 100%;
      display: inline-block;
      -webkit-appearance: none;
      box-sizing: border-box;
    }
    .icon{
      position: absolute;
      top: 0;
      right: 10px;
      bottom: 0;
      display: flex;
      align-items: center;
      color:#666;
    }
  }
}
.TreeDropdownStoreTreeSelect{
  padding: 8px;
  width: 280px;
  box-sizing: border-box;
  height: 400px;
  overflow: hidden;
  .dropdown-tree-container {
    .el-scrollbar {
      height: 100% !important;
    }
  }
  .input-clearable.el-input--surface {
    border: none;
    border-radius: 100px;
  }
  .el-input--surface {
    background-color: #f2f2f2;
  }
  .input-clearable {
    padding-left: 5px;
    padding-right: 55px;
    box-sizing: border-box;
    border: 1px solid #ccc;
    overflow: hidden;
  }
  .dropdown-tree-container{
    .fStoreList {
      padding: 0 10px 15px 10px;
      span.msgTip {
        font-size: 12px;
        color: #888;
      }
      .dItem {
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
      .dItem:hover {
        background-color: #f5f5f5;
      }
    }
  }
}
.el-dropdown-menu{
  border: none;
}
</style>
