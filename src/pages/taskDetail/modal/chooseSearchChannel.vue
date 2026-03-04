<template>
  <div>
    <h-select-tree-option :option-data="optionData" :has-contain="false" v-model="channelOptions" :option="{name: 'channelName',value: 'channelId'}"
    isBroad  @tree-search="treeSearch" input-placeholder="请选择通道" ref="channelSelect" @panel-change="panelChange"
    :option-search-fn="optionSearch" :max-select="20" @save-click="saveClick" @remove-single="saveClick" @remove-all="saveClick">
      <template slot="tree">
        <el-tree ref="storeTree" :data="treeData" simple-data node-key="groupId" parent-key="parentId" :default-expand-all="true"
          :current-node-key="currentNodeKey" :props="defaultProps" @node-click="handleNodeClick" :filter-node-method="filterNode">
        </el-tree>
      </template>
    </h-select-tree-option>
  </div>
</template>

<script>
import { getStoreTree, getDeviceOptions } from '../proxy'
export default {
  props: {
    taskId: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      channelOptions: {
        values: [],
        datas: []
      },
      targetNode: {},
      treeData: [],
      currentNodeKey: '',
      defaultProps: {
        label: 'groupName'
      },
      optionData: [],
      optionDataAll: [] /// / 原始的树对象选择数据，修复pro的树对象的搜索全选的缺陷
    }
  },
  mounted () {
    this.getStoreTree()
  },
  methods: {
    saveClick () {
      this.$nextTick(() => {
        this.$emit("saveClick")
      })
    },
    getValue () {
      let arr = this.channelOptions.datas.map(item => {
        return { channelId: item.channelId, groupId: item.groupId, presetInfo: item.presetInfo }
      })
      return arr
    },
    clear () {
      this.channelOptions = { values: [], datas: [] }
    },
    optionSearch (val) {
      if (val) {
        this.optionData = this.optionDataAll.filter(item => item.channelName.indexOf(val) > -1)
      } else {
        this.optionData = this.optionDataAll
      }
    },
    getStoreTree () {
      return new Promise((resolve) => {
        getStoreTree({ taskId: this.taskId }).then(res => {
          if (res.code === 0 && res.data && res.data.length) {
            this.treeData = res.data.map(item => {
              return {
                channelId: item.channelId,
                channelName: item.channelName,
                groupId: item.groupId,
                groupName: item.groupName
              }
            })
            this.targetNode = this.treeData[0]
            this.$nextTick(() => {
              this.$refs.storeTree && this.$refs.storeTree.setCurrentKey(this.targetNode.groupId)
              this.handleNodeClick(this.targetNode)
            })
            resolve()
          }
        })
      })
    },
    panelChange (val) {
      if (val && this.targetNode) {
        this.$refs.storeTree && this.$refs.storeTree.setCurrentKey(this.targetNode.groupId)
        this.handleNodeClick(this.targetNode)
      }
    },
    treeSearch (value) {
      this.$refs.storeTree.filter(value)
    },
    handleNodeClick (data) {
      this.$refs.channelSelect && this.$refs.channelSelect.optionClear()
      this.getDeviceList(data.groupId)
    },
    filterNode (value, data) {
      if (!value) return true
      return data.groupName.indexOf(value) !== -1
    },
    getDeviceList (groupId) { // 查询设备列表
      getDeviceOptions({ groupId: groupId, taskId: this.taskId }).then(res => {
        if (res.code === 0) {
          this.optionData = JSON.parse(JSON.stringify(res.data)) || []
          this.optionDataAll = JSON.parse(JSON.stringify(res.data)) || []
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "../style.scss";
</style>
<style lang="scss">
 .el-select-dropdown__list{
   .channelSelectOption{
    border: 1px dotted #ccc;
    height: 45px!important;
  }
 }
</style>
