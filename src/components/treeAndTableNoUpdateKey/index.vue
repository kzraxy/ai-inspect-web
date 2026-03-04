<template>
  <div class="treeAndTableNoUpdateKey_div">
    <el-alert :title="'已选择通道数：' + selectChannel + '个'" type="info" show-icon simple icon="h-icon-home" :closable="false" :class="{'isOver':isOverChooseNum}"></el-alert>
    <div class="channel-container-add" v-loading="updateChannelLoading">
      <div class="channel-add-left" v-if="treeVisible">
        <treeAnsySearch :treeAnsyProps=treeAnsyProps :storeListProps=storeListProps :isInitSelected=isInitSelected  @getClickData="getClickData" top="0" treeBot="0"></treeAnsySearch>
      </div>
      <div class="channel-add-right">
        <el-input class="input-clearable" placeholder="输入通道名称" suffix-icon="h-icon-search" clearable @keyup.enter.native="getMonitorList"
          :on-icon-click="getMonitorList" :clear-icon-click="clearSearch" v-model="searchData">
        </el-input>
        <el-table :data="tableData" ref="multipleTable" height="380" stripe @select="tableSelect" @select-all="tableSelect" class="table-content">
          <el-table-column type="selection" width="50"></el-table-column>
          <el-table-column type="index" label="序号" width="70">
            <template slot-scope="scope">
              {{scope.$index + 1 + (pageNo - 1) * pageSize}}
            </template>
          </el-table-column>
          <el-table-column prop="channelName" label="通道名称"></el-table-column>
          <el-table-column prop="deviceName" label="设备名称"></el-table-column>
          <el-table-column label="预置点" width="180" v-if="showPreset">
            <template slot-scope="scope">
              <div v-if="scope.row.presetInfo && scope.row.presetInfo.length > 0">
                <!-- <el-select v-model="scope.row.selPresetIds" multiple filterable collapse-tags placeholder="请选择预置点" :multiple-limit="5" class="preset_select"> -->
                <el-select v-model="scope.row.selPresetIds" multiple filterable collapse-tags placeholder="请选择预置点" :multiple-limit="5" @change="selPresetIds => presetsChange(scope.row.channelId, selPresetIds, scope.row)" class="preset_select">
                  <el-option v-for="item in scope.row.presetInfo" :key="item.presetId" :label="item.presetName" :value="item.presetId"></el-option>
                </el-select>
              </div>
              <div v-else style="color: #ccc;">无预置点</div>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :page-sizes="[50, 100, 200]" :current-page="pageNo"
          :page-size="pageSize" layout="total, sizes, huiPager, jumper" :total="totalNum">
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import { getMonitors } from './proxy'
import treeAnsySearch from '@/components/treeAnsySearch'
export default {
  props: {
    taskType: {
      type: String,
      default: 'CLOUD'
    },
    taskAnalysisMode: {
      type: String,
      default: 'POLLING_SNAP'
    },
    taskId: {
      type: String,
      default: ''
    },
    channes: {},
    showPreset: {
      type: Boolean,
      default: true
    },
    maxChooseNum: {
      type: Number,
      default: 1000000000
    }
  },
  components: {
    treeAnsySearch
  },
  computed: {
    isOverChooseNum () {
      return this.selectData.length > this.maxChooseNum
    }
  },
  data () {
    return {
      updateChannelLoading: false, // 后端实时更新通道的接口loading
      treeAnsyProps: {
        method: 'get',
        url: '/v1/inspect/taskconfig/taskConfigs/orgsForLine',
        params: {}
      },
      storeListProps: {
        method: '',
        url: '/v1/inspect/taskconfig/taskConfigs/orgs/actions/getByNameLike',
        params: {}
      },
      isInitSelected: true,
      treeData: [],
      defaultExpandedKeys: [],
      defaultProps: {
        children: 'subAreas',
        label: 'name'
      },
      treeVisible: false,
      treeId: '',
      sotreId: '',
      groupType: '',
      treeChangeData: {},
      searchData: '', // 搜索框
      tableData: [],
      selChannelData: [], // 传给配置页的，属性不带page
      selectData: [], // 专门用做复选框选中和反选的，带page
      pageSize: 50,
      pageNo: 1,
      totalNum: 0, // 总条数
      selectGroup: 0, // 已选择的组织数
      selectChannel: 0,// 已选择的通道数
      isProgrammaticSelection: false // 标识是否为程序触发的选择操作
    }
  },
  watch: {
    selectData (val) { // 动态监听已选择的组织数
      this.selectGroup = val.length ? Array.from(new Set(val.map(item => item.groupId))).length : 0
      this.selectChannel = val.length || 0
    }
  },
  methods: {
    async init () {
      this.selectData = []
      this.treeVisible = true
      this.channes && this.channes.forEach(item => {
        item.channels.forEach(val => {
          this.selectData.push(val)
        })
      })
    },
    reset () {
      this.searchData = ''
      this.selectData = []
      this.tableData = []
      this.treeVisible = false
    },
    // 选择预置点时，把selectData的预置点同步
    presetsChange (channelId, selPresetIds, row) {
      this.$nextTick(() => {
        let i = this.selectData.map(item => { return item.channelId }).indexOf(channelId)
        if (i > -1) {
          this.selectData[i].selPresetIds = selPresetIds
        }
      })
    },
    getClickData (value) {
      this.groupId = value.groupId
      this.groupType = value.groupType
      this.getMonitorList()
    },
    loadNode (node, resolve) {},
    clearSearch () {
      this.searchData = ''
      this.tableData = []
      this.getMonitorList()
    },
    // 点击确认
    sureSelectData () {
      let finalChannelData = []
      for (var i = 0; i < this.selectData.length; i++) {
        let dataObj = { ...this.selectData[i] }
        if (this.selectData[i].originalPresetInfo && this.selectData[i].originalPresetInfo.length > 0) {
          dataObj.presetInfo = dataObj.originalPresetInfo.filter(item => {
            return dataObj.selPresetIds.indexOf(item.presetId) > -1
          })
        }
        // 按照groupId分组
        let selectGroupIds = finalChannelData.map(item => item.groupId)
        if (selectGroupIds.indexOf(dataObj.groupId) < 0) {
          finalChannelData.push({
            groupId: dataObj.groupId,
            groupName: dataObj.groupName,
            channels: [dataObj]
          })
        } else {
          finalChannelData[selectGroupIds.indexOf(dataObj.groupId)].channels.push(dataObj)
        }
      }
      this.clearAddData()
      return finalChannelData
    },
    getMonitorList () {
      getMonitors({
        groupId: this.groupId,
        groupType: this.groupType,
        taskType: this.taskType,
        taskAnalysisMode: this.taskAnalysisMode,
        taskId: this.taskId,
        channelNameLike: this.searchData,
        pageSize: this.pageSize,
        pageNo: this.pageNo }).then(res => {
        if (res.code === 0) {
          this.tableData = (res.data && res.data.rows) ? res.data.rows.map(item => { return { selPresetIds: [], ...item, originalPresetInfo: item.presetInfo } }) : []
          this.totalNum = res.data ? res.data.total : 0
          this.$nextTick(() => {
            this.selectData.forEach(item => {
            // 在表格里反显预置点的选择
              let rowIndex = this.tableData.map(item => { return item.channelId }).indexOf(item.channelId)
              if (rowIndex > -1) {
                this.tableData[rowIndex].selPresetIds = []
                let tableDataPresetsIds = this.tableData[rowIndex].presetInfo.map(presetData => { return presetData.presetId })
                item.selPresetIds && item.selPresetIds.forEach(selPresetItem => {
                  if (tableDataPresetsIds.indexOf(selPresetItem) > -1) {
                    this.tableData[rowIndex].selPresetIds.push(selPresetItem)
                  }
                })
                item.originalPresetInfo = this.tableData[rowIndex].originalPresetInfo
                Array.from(new Set(item.selPresetIds))
              }
              this.isProgrammaticSelection = true
              const rowsToSelect = []
              this.selectData.forEach(item => {
                const rowIndex = this.tableData.findIndex(row => row.channelId === item.channelId)
                if (rowIndex > -1) {
                  rowsToSelect.push(this.tableData[rowIndex])
                }
              })
              this.$refs.multipleTable.clearSelection()
              rowsToSelect.forEach(row => {
                this.$refs.multipleTable.toggleRowSelection(row, true)
              })
              this.$nextTick(() => {
                this.isProgrammaticSelection = false
              })
            })
          })
        }
      })
    },
    tableSelect (selection, row) {
      if (this.isProgrammaticSelection) {
        return
      }
      if (this.selectData.length > 0) {
        let notSelectedIds = []
        let selectedIds = selection.map(item => { return item.channelId })
        this.tableData.forEach(item => {
          if (selectedIds.indexOf(item.channelId) < 0) notSelectedIds.push(item.channelId)
        })
        let allIds = this.selectData.map(item => { return item.channelId })
        selection.forEach(item => {
          let i = allIds.indexOf(item.channelId)
          if (i < 0) this.selectData.push(item)
        })
        let indexs = []
        notSelectedIds.forEach(item => {
          let i = allIds.indexOf(item)
          if (i > -1) indexs.push(i)
        })
        indexs.sort((a, b) => { // 要排序，否则全选和全不选时下面删除有bug
          return a - b
        })
        for (let i = indexs.length - 1; i >= 0; i--) {
          this.selectData.splice(indexs[i], 1)
        }
      } else {
        this.selectData = selection
      }
      if (this.selectData.length > this.maxChooseNum) {
        this.$message.warning(`已选择通道数不能超过${this.maxChooseNum}个`)
        this.$emit('overChooseChannels', true)
      } else {
        this.$emit('overChooseChannels', false)
      }
    },
    cancel () {
      this.clearAddData()
    },
    clearAddData () {
      this.treeId = ''
      this.pageNo = 1
    },
    // 页数大小改变
    handleSizeChange (val) {
      this.pageSize = val
      if (this.pageNo !== 1) {
        this.pageNo = 1
      } else {
        this.getMonitorList()
      }
    },
    // 当前页改变
    handleCurrentChange (val) {
      this.pageNo = val
      this.getMonitorList()
    }
  }
}
</script>

<style lang="scss">
.treeAndTableNoUpdateKey_div{
  .isOver{
    .el-alert__title{
      color: red!important;
    }
  }
}
</style>
<style lang="scss" scoped>
.treeAndTableNoUpdateKey_div{
  .isOver{
    .el-alert__title{
      color: red;
    }
  }
}
.channel-container-add {
  width: 875px;
  height: 470px;
  display: flex;
  justify-content: space-between;
  border: 1px solid #CCCCCC;
  -webkit-border-radius: 2px;
  -moz-border-radius: 2px;
  border-radius: 2px;
  .channel-add-left {
    position: relative;
    width: 210px;
    padding: 5px;
    padding-left: 0;
    // border-right: 1px solid #CCCCCC;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }
  .channel-add-right {
    width: 660px;
    padding: 5px;
    position: relative;
    .nodata {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      text-align: center;
      background: #ffffff;
      z-index: 9999;
      img {
        margin-top: 100px;
        margin-bottom: 0px;
      }
    }
  }
}
</style>
<style lang="scss">
.batch-set-modal{
  .el-dialog__body-wrapper{
    overflow: hidden;
    padding-top:10px!important;
    padding-bottom:0!important
  }
  .channel-tree-scrollbar__wrap {
    height: 460px;
    overflow-x: hidden;
  }
  .channel-scrollbar__view{
    height: 100%!important;
  }
  .channel-add-right {
    .el-scrollbar{
      height:340px
    }
  }
  .channel-add-left{
    .el-scrollbar{
      // height:98%;
      height:420px;
      .is-vertical{
        right: -4px;
      }
    }
    .channel-tree-scrollbar__wrap{
      margin-right:-20px
    }
    .el-input__inner{
      border: 1px solid #ccc;
    }
  }
  .preset_select{
    .el-select__tags{
      .is-undefined{
        width: 0px;
        margin-left: 0px;
      }
    }
  }
}
</style>
