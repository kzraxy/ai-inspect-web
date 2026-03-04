<template>
  <div class="channel-info-table status-display-table">
    <h4>通道列表</h4>
    <div class="filter-mod">
      <el-input v-model="channelTableSearch.channelName" clearable suffix-icon="h-icon-search" class="item" placeholder="搜索通道" @click="handleSeach" @clear="handleClear"
        @keyup.enter.native="handleSeach" @change="handleSeach"></el-input>
      <el-input v-model="channelTableSearch.deviceName" clearable suffix-icon="h-icon-search" class="item" placeholder="搜索设备" @click="handleSeach" @clear="handleClear"
        @keyup.enter.native="handleSeach" @change="handleSeach"></el-input>
      <el-input v-model="channelTableSearch.groupName" clearable suffix-icon="h-icon-search" class="item" :placeholder="`搜索${applicationSceneName}`" @click="handleSeach" @clear="handleClear"
        @keyup.enter.native="handleSeach" @change="handleSeach"></el-input>
      <el-select v-model="channelTableSearch.captureStatus" placeholder="请选择" @change="getChannelTableList" class="item" clear>
        <el-option v-for="(item,index) in captureStatusList" :key="index" :label="item.statusName" :value="item.statusValue"></el-option>
      </el-select>
      <el-select v-model="channelTableSearch.captureQualityType" placeholder="请选择" @change="getChannelTableList" class="item" clear>
        <el-option v-for="(item,index) in ratioList" :key="index" :label="item.qualityName" :value="item.qualityValue"></el-option>
      </el-select>
      <div class="right-operator"><el-button @click="exportCaptureInfo" icon="h-icon-export">导出</el-button></div>
    </div>
    <el-table :data="channelInfoTableData">
      <el-table-column type="index" label="序号" width="70">
        <template slot-scope="scope">
          {{scope.$index + 1 + (channelTableSearch.pageNo - 1) * channelTableSearch.pageSize}}
        </template>
      </el-table-column>
      <el-table-column prop="groupName" :label="`${applicationSceneName}名称`"></el-table-column>
      <el-table-column prop="deviceName" label="设备名称"></el-table-column>
      <el-table-column prop="channelName" label="通道名称"></el-table-column>
      <el-table-column prop="presetInfoName" label="预置点名称"></el-table-column>
      <el-table-column prop="captureStatus" label="抓图状态"></el-table-column>
      <el-table-column prop="captureQuality" label="抓图分辨率"></el-table-column>
      <el-table-column label="操作" width="15%" min-width="220">
        <template slot-scope="scope">
          <el-button type="link" @click="showPic(scope.row)">查看抓图能力</el-button>
          <el-button type="link" @click="reTryPic(scope.row)" style="margin-left:16px" v-show="scope.row.enableReset">重试抓图能力</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <div class="pagePart" style="padding-top:10px">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="channelTableSearch.pageNo"
        :page-size="channelTableSearch.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </div>
    <imgShowModal :visible.sync="imgShowModalVisible" @flash="getChannelTableList" ref="imgShowModal"></imgShowModal>
  </div>
</template>

<script>
import _ from 'lodash'
import imgShowModal from './imgShowModal'
import { getCaptureQualityType, getCaptureStatus, captureInfo, exportCaptureInfo, getExportTaskInfo, resetCaptureInfo, getPicInfo } from '../proxy'
export default {
  components: { imgShowModal },
  data () {
    return {
      imgShowModalVisible: false,
      captureStatusList: [{ statusName: '全部状态', statusValue: '' }],
      channelInfoTableData: [],
      channelTableSearch: {
        channelName: '',
        deviceName: '',
        groupName: '',
        captureStatus: '',
        captureQualityType: '',
        pageNo: 1,
        pageSize: 10
      },
      total: 0,
      taskInfo: {},
      ratioList: [{ qualityName: '全部分辨率', qualityValue: '' }],
      loading: null,
      percentageText: '导出中...',
      exportTaskId: '' // 导出任务的id
    }
  },
  watch: {
    percentageText (val) {
      this.loading.text = val
    }
  },
  methods: {
    async init (taskInfo) {
      this.reset()// 重置一些数据为初始状态
      this.taskInfo = { ...taskInfo }
      this.getCaptureQualityType()// 获取分辨率下拉列表
      this.getCaptureStatus()// 获取抓图状态下拉列表
      this.getChannelTableList()
    },
    reset () {
      this.channelInfoTableData = []
      this.channelTableSearch = {
        channelName: '',
        deviceName: '',
        groupName: '',
        captureStatus: '',
        captureQualityType: '',
        pageNo: 1,
        pageSize: 10
      }
      this.exportTaskId = ''
      this.total = 0
      this.ratioList = [{ qualityName: '全部分辨率', qualityValue: '' }]
      this.captureStatusList = [{ statusName: '全部状态', statusValue: '' }]
    },
    showPic (row) {
      this.imgShowModalVisible = true
      let presetId = (row.presetInfo && row.presetInfo.length) ? row.presetInfo[0].presetId : ''
      let params = {
        taskId: row.taskId,
        channelId: row.channelId,
        deviceId: row.deviceId,
        presetId: presetId
      }
      getPicInfo(params).then(res => {
        if (res.code === 0) {
          this.$refs.imgShowModal.init({ ...res.data, channelName: row.channelName })
        }
      })
    },
    reTryPic (row) {
      resetCaptureInfo({ channelId: row.channelId, taskId: row.taskId }).then(res => {
        if (res.code === 0) {
          this.$message.success('操作成功！')
          this.getChannelTableList()
        }
      })
    },
    handleSeach() {
      this.channelTableSearch.pageNo = 1
      this.getChannelTableList()
    },
    handleClear() {
      this.channelTableSearch.pageNo = 1
      this.getChannelTableList()
    },
    getChannelTableList: _.debounce(function () {
      captureInfo({ ...this.channelTableSearch, taskId: this.taskInfo.taskId }).then(res => {
        if (res.code === 0) {
          this.channelInfoTableData = res.data.rows
          this.total = res.data.total
          this.channelInfoTableData.forEach(item => {
            item.presetInfoName = '-'
            if (item.presetInfo && item.presetInfo.length) {
              item.presetInfoName = item.presetInfo.map(val => { return val.presetName }).join('，')
            }
          })
        }
      })
    }, 200),
    getCaptureStatus () {
      getCaptureStatus({ taskType: this.taskInfo.taskType }).then(res => {
        if (res.code === 0) {
          this.captureStatusList = this.captureStatusList.concat(res.data)
        }
      })
    },
    getCaptureQualityType () {
      getCaptureQualityType().then(res => {
        if (res.code === 0) {
          this.ratioList = this.ratioList.concat(res.data)
        }
      })
    },
    exportCaptureInfo () {
      this.loading = this.$loading({ fullscreen: true, text: this.percentageText, customClass: 'export_fullscreen' })
      exportCaptureInfo({ ...this.channelTableSearch, taskId: this.taskInfo.taskId, taskName: this.taskInfo.taskName, applicationSceneName: this.applicationSceneName }).then((res) => {
        if (+res.code === 0 && res.data) {
          this.exportTaskId = res.data || ''
          this.getExportUrl()
        } else {
          this.loading.close()
        }
      })
    },
    getExportUrl () {
      getExportTaskInfo({ exportTaskId: this.exportTaskId }).then(result => {
        if (+result.code === 0) {
          this.percentageText = '导出中...，已完成' + result.data.process + '%'
          if (result.data.exportStatus === 'SUCCESS') { // 完成了导出
            this.loading.close()
            window.open(result.data.downloadUrl)
          } else if (result.data.exportStatus === 'PROCESS') { // 还是导出中，每一秒再请求一次
            setTimeout(() => {
              this.getExportUrl()
            }, 1000)
          } else if (result.data.exportStatus === 'FAIL') { // 后端传回状态导出失败
            this.loading.close()
            this.$message.error(result.data.failMessage)
          }
        }
      })
    },
    handleSizeChange (val) {
      this.channelTableSearch.pageSize = val
      this.channelTableSearch.pageNo = 1
      this.getChannelTableList()
    },
    handleCurrentChange (val) {
      this.channelTableSearch.pageNo = val
      this.getChannelTableList()
    }
  }
}
</script>

<style lang="scss" scoped>
 @import "../style.scss";
</style>
<style lang="scss">
</style>
