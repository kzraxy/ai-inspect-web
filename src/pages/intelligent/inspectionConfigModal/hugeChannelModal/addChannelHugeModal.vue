<template>
  <el-dialog title="选择生效通道" :area="[1000, 735]" :visible.sync="visible" :show-close="!updateChannelLoading" :before-close="cancel"
    class="add-channel-modal" :close-on-click-modal=false>
    <div>
      <el-alert title="点击确定按钮，该弹框里配置的通道会在任务中实时生效" type="info" show-icon simple :closable="false"></el-alert>
      <!-- <el-alert :title="'已选择组织数：' + selectGroup + '个；' + '已选择通道数：' + selectChannel + '个'" type="info" show-icon simple icon="h-icon-home" :closable="false"></el-alert> -->
    </div>
    <div class="channel-container-add" v-loading="updateChannelLoading">
      <div class="channel-add-left" v-if="visible">
        <TreeAnsySearch :treeAnsyProps=treeAnsyProps :storeListProps=storeListProps :isInitSelected=isInitSelected  @getClickData="getClickData" top="0" treeBot="0"></TreeAnsySearch>
      </div>
      <div class="channel-add-right">
        <div class="channel-add-right-top">
          <el-select v-model="searchDataType" @change="changeSearch" style="width: 250px;">
            <el-option  label="按通道名称搜索" value="byChannelName"></el-option>
            <el-option  label="按设备序列号搜索" value="byDeviceSerial"></el-option>
          </el-select>
          <el-input class="input-clearable" :placeholder="searchDataPlaceholder" suffix-icon="h-icon-search" clearable @keyup.enter.native="resetMonitorList"
            :on-icon-click="resetMonitorList" :clear-icon-click="clearSearch" v-model="searchData">
          </el-input>
        </div>
        <el-table @on-scrolling-y="tableOnsScrolling"
          :data="tableData"
          ref="multipleTable"
          height="470"
          stripe
          @select="tableSelect"
          @select-all="tableSelect"
          class="table-content">
          <el-table-column type="selection" :selectable="selectable"></el-table-column>
          <el-table-column prop="channelName" label="通道名称"></el-table-column>
          <el-table-column prop="deviceName" label="设备名称"></el-table-column>
          <el-table-column prop="deviceSerial" label="设备序列号"></el-table-column>
          <el-table-column prop="channelNo" label="通道号"></el-table-column>
          <el-table-column label="预置点" width="180">
            <template slot-scope="scope">
              <div v-if="scope.row.presetInfo && scope.row.presetInfo.length > 0">
                <el-select v-model="scope.row.selPresetIds" multiple filterable collapse-tags placeholder="请选择预置点" :multiple-limit="15"
                @change="selPresetIds => presetsChange(scope.row.channelId, selPresetIds, scope.row)" class="preset_select">
                  <el-option v-for="item in scope.row.presetInfo" :key="item.presetId" :label="item.presetName" :value="item.presetId" :disabled="item.imageCompareDisabled">
                  </el-option>
                </el-select>
              </div>
              <div v-else style="color: #ccc;">无预置点</div>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页 -->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :page-sizes="[50, 100, 200]"
          :current-page="pageNo"
          :page-size="pageSize"
          layout="total, sizes, huiPager, jumper"
          :total="totalNum">
        </el-pagination>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="sureSelectData" :loading="updateChannelLoading">确 定</el-button>
        <el-button @click="cancel" :loading="updateChannelLoading">取 消</el-button>
      </span>
  </el-dialog>
</template>

<script>
import { getMonitors, updateChannel, updatePreset, updateChoose } from '../../proxy'
import TreeAnsySearch from '@/components/treeAnsySearch'
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    taskType: {
      type: String,
      default: ''
    },
    taskAnalysisMode: {
      type: String,
      default: ''
    },
    modelTypeEnum: {
      type: String,
      default: ''
    },
    taskId: {
      type: String,
      default: ''
    },
    updateKey: {
      type: String,
      default: ''
    },
  },
  components: {
    TreeAnsySearch
  },
  computed: {
    searchDataPlaceholder() {
      return this.searchDataType === 'byChannelName' ? '请输入通道名称（支持模糊搜索）' : '请输入设备序列号（精确搜索）'
    }
  },
  data () {
    return {
      getTableFinishFlag: true,
      searchDataType: 'byChannelName',
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
      treeId: '',
      sotreId: '',
      groupType: '',
      treeChangeData: {},
      searchData: '', // 通道名称搜索框
      tableData: [],
      selChannelData: [], // 传给配置页的，属性不带page
      selectData: [], // 专门用做复选框选中和反选的，带page
      pageSize: 50,
      pageNo: 1,
      totalNum: 0, // 总条数
      selectGroup: 0, // 已选择的组织数
      selectChannel: 0, // 已选择的通道数
      isProgrammaticSelection: false // 标识是否为程序触发的选择操作
    }
  },
  watch: {
    visible (val) {
      if (val) {
        this.getRefreshChooseNumber()
      } else {
        this.searchDataType = 'byChannelName'
        this.searchData = ''
        this.selectData = []
        this.tableData = []
      }
    },
  },
  methods: {
    changeSearch() {
      this.searchData = ''
    },
    resetMonitorList() {
      this.pageNo = 1
      this.getMonitorList()
    },
    tableOnsScrolling () {
      let dom = Array.from(document.getElementsByClassName('el-select-dropdown is-multiple'))
      dom.forEach(item => {
        item.style.display = 'none'
      })
    },
    selectable (row, index) {
      return !row.imageCompareDisabled
    },
    // 选择预置点时，把selectData的预置点同步
    presetsChange (channelId, selPresetIds, row) {
      if (!this.getTableFinishFlag) {
        return false
      }
      this.$nextTick(() => {
        let i = this.selectData.map(item => { return item.channelId }).indexOf(channelId)
        if (i > -1) { // 预置点所属的通道是选择状态时，才通知后端更新预置点
          this.updatePreset([{ ...row, channelId: channelId, selPresetIds: selPresetIds }])// 后端实时更新预置点选择
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
      this.updateChoose(true)// 后端实时更新弹框操作
    },
    async getMonitorList () {
      this.getTableFinishFlag = false
      let res = await getMonitors({
        groupId: this.groupId,
        groupType: this.groupType,
        taskType: this.taskType || '',
        taskAnalysisMode: this.taskAnalysisMode || '',
        modelTypeEnum: this.modelTypeEnum || '',
        taskId: this.taskId || '',
        channelNameLike: this.searchDataType === 'byChannelName' ? this.searchData : '',
        deviceSerial: this.searchDataType === 'byDeviceSerial' ? this.searchData : '',
        pageSize: this.pageSize,
        pageNo: this.pageNo
      })
      if (res.code === 0) {
        this.tableData = (res.data && res.data.rows) ? res.data.rows.map(item => { return { selPresetIds: [], ...item, originalPresetInfo: item.presetInfo } }) : []
        this.totalNum = res.data ? res.data.total : 0
        this.$nextTick(() => {
          this.tableData.forEach((item,index) => {
            item.originalPresetInfo = item.presetInfo
          })
          this.selectData = this.tableData.filter(item => item.checked)
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
      }
      this.tableData = await this.handleTableData(this.tableData) 
      await this.setTableFinishFlag()
    },
    async setTableFinishFlag () {
      this.getTableFinishFlag = true
    },
    handleTableData(data) {
      return new Promise(resolve => {
        data.forEach(item => {
          let arr = item.presetInfo.filter(preset => preset.checked)
          item.selPresetIds = arr.map(_ => _.presetId)
        })
        resolve(data)
      })
    },
    tableSelect (selection, row) {
      if (this.isProgrammaticSelection) {
        return
      }
      this.selectData = selection
      if(typeof row === 'boolean') {
        let type = selection.length > 0 ? '1' : '-1'
        let updateData = selection.length > 0 ? selection : this.tableData
        this.updateChannel(type, updateData)
      } else {
        this.updateChannel('0', [row])
      }
    },
    // 后端实时更新通道选择
    updateChannel (type, data) { // type：0单选，1全选，-1全不选
      this.$nextTick(() => {
        this.updateChannelLoading = true
        data.forEach(val => {
          if (val.originalPresetInfo) { // 选中的预置点信息是selPresetIdsInfo，通过selPresetIds和全量presetInfo筛选出来
            val.selPresetIdsInfo = val.originalPresetInfo.filter(item => {
              return val.selPresetIds.indexOf(item.presetId) > -1
            })
          }
        })
        updateChannel({ key: this.updateKey, type: type, channelInfo: data, cacheType:3, taskId: this.taskId }).then(res => {
          if (res.code === 0) {
            this.updateChannelLoading = false
            this.getRefreshChooseNumber()
          }
        })
      })
    },
    getRefreshChooseNumber() { // 获取最新的门店和通道总数
      // TODO....，更换实际接口和参数，暂时不做
     /*  getRefreshChooseNumber({ taskId: this.taskId }).then(res => {
        if (res.code === 0) {
          this.selectGroup = res.data.selectGroup
          this.selectChannel = res.data.selectChannel
        }
      }) */
    },
    // 后端实时更新预置点选择
    updatePreset (data) {
      this.updateChannelLoading = true
      if (data[0].originalPresetInfo) { // 选中的预置点信息是selPresetIdsInfo，通过selPresetIds和全量presetInfo筛选出来
        data[0].selPresetIdsInfo = data[0].originalPresetInfo.filter(item => {
          return data[0].selPresetIds.indexOf(item.presetId) > -1
        })
      }
      updatePreset({ key: this.updateKey, presetInfos: data, cacheType:3, taskId: this.taskId }).then(res => {
        this.updateChannelLoading = false
      })
    },
    // 后端实时更新弹框操作
    updateChoose (flag) { // flag：true确定，flase取消
      updateChoose({ key: this.updateKey, type: flag, cacheType:3, taskId: this.taskId }).then(res => {
        if (res.code === 0) {
          if (flag) {
            this.$message.success('操作成功！')
            this.$emit('updateChannelFinish')
            // this.$message.success('操作成功，通道修改正在处理中，请稍后刷新页面查看结果！')
          }
          this.clearAddData()
        } else if ([70010093, 70010094, 70010095].includes(res.code)) {
          this.$message.error(res.message)
        }
      })
    },
    cancel () {
      this.updateChoose(false)
      this.clearAddData()
    },
    clearAddData () {
      this.treeId = ''
      this.$emit('update:visible', false)
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

<style lang="scss" scoped>
.channel-container-add {
  width: 975px;
  // height: 420px;
  height: 570px;
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
    width: 760px;
    padding: 5px;
    position: relative;
    .channel-add-right-top{
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }
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
.add-channel-modal{
  .channel-add-right-top{
    .el-select{
      .el-input{
        input{
          border-right: none;
        }
      }
      .el-input__inner:hover{
        border-color: #b3b3b3;
      }
    }
  }
  // .el-dialog__body-wrapper{
  //   overflow: hidden;
  //   padding-top:10px!important;
  //   padding-bottom:5px!important
  // }
  // .channel-tree-scrollbar__wrap {
  //   height: 560px;
  //   overflow-x: hidden;
  // }
  // .channel-scrollbar__view{
  //   height: 100%!important;
  // }
  .channel-add-right {
    .el-scrollbar{
      height:440px
    }
  }
  .channel-add-left{
    .el-scrollbar{
      height:100%;
    }
    // .channel-tree-scrollbar__wrap{
    //   margin-right:-20px
    // }
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
