<template>
  <h-page-container>
    <h-page-header slot="pageHeader" :breadcrumb="breadcrumb" />
    <el-alert type="warning" simple show-icon :closable="false">
      <span slot="title">在该页面操作的通道，将会在任务【{{taskForm.taskName}}】<span style="font-weight:800"> 实时生效</span></span>
    </el-alert>
    <div class="addHugeChannels">
      <div class="search_wrap">
        <div class="left">
          <el-button @click="showAddChannel" :plain="true" icon="h-icon-add" v-show="!isBYSCENE">选择通道</el-button>
          <el-button @click="showAddTaskChannel" :plain="true" icon="h-icon-copy" v-show="!isBYSCENE">复用其他任务通道</el-button>
          <el-button @click="showAddAreaChannel" :plain="true" icon="h-icon-tag" v-show="!isBYSCENE">复用区域标签通道</el-button>
          <el-button @click="showAddChannelByScene" :plain="true" icon="h-icon-disassociate" v-show="isBYSCENE">按场景关联通道</el-button>
          <el-button @click="delChannel()" :plain="true" icon="h-icon-delete" :disabled="!tableSelData.length" v-show="!isBYSCENE">批量删除</el-button>
          <el-button :plain="true" @click="importChannels" icon="h-icon-import" v-show="['retail', 'aiot', 'enterprise'].includes(serviceType)">导入</el-button>
          <el-button :plain="true" @click="exportChannels" icon="h-icon-export" v-show="['retail', 'aiot', 'enterprise'].includes(serviceType)">导出</el-button>
        </div>
        <div class="right">
          <div class="right_search">
            <el-input v-model="filters.channelName" clearable suffix-icon="h-icon-search" class="search_item" placeholder="搜索通道" @click="handleSeach" @clear="handleClear"
              @keyup.enter.native="handleSeach" @change="handleSeach" style="margin-left: 0;"></el-input>
            <el-input v-model="filters.deviceName" clearable suffix-icon="h-icon-search" class="search_item" placeholder="搜索设备" @click="handleSeach" @clear="handleClear"
              @keyup.enter.native="handleSeach" @change="handleSeach"></el-input>
            <el-input v-model="filters.groupName" clearable suffix-icon="h-icon-search" class="search_item" :placeholder="`搜索${applicationSceneName}`" @click="handleSeach" @clear="handleClear"
              @keyup.enter.native="handleSeach" @change="handleSeach"></el-input>
          </div>
        </div>
      </div>
      <div class="table_wrap">
        <el-table :data="tableData" force-scroll="true" @selection-change="tableSelect">
          <el-table-column type="selection" v-if="!isBYSCENE"></el-table-column>
          <el-table-column prop="groupName" :label="`${applicationSceneName}名称`"></el-table-column>
          <el-table-column prop="deviceName" label="设备名称"></el-table-column>
          <el-table-column prop="channelName" label="通道名称"></el-table-column>
          <el-table-column prop="channelNo" label="通道号"></el-table-column>
          <el-table-column prop="presetInfoName" label="预置点名称">
            <template slot-scope="scope">
              {{ scope.row.presetInfoName || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template slot-scope="scope">
              <el-button @click="delChannel(scope.row)" type="iconButton" icon="h-icon-delete" title="删除" class="table_btn" :disabled="isBYSCENE"></el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :page-sizes="[10, 20, 25, 50, 100]"
        :current-page="filters.pageNo"
        :page-size="filters.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </div>
    <addChannelHugeModal :visible.sync="modalVisible" :taskType="taskForm.taskType" :updateKey="updateKey" @updateChannelFinish="updateChannelFinish"
      :taskAnalysisMode="taskForm.analysisMode" :taskId="taskForm.taskId">
    </addChannelHugeModal>
    <addTaskChannelHugeModal :visible.sync="addTaskModalVisible" :taskType="taskForm.taskType" :updateKey="updateKey" :modelSource="taskForm.modelSource"
      :taskAnalysisMode="taskForm.analysisMode" :taskId="taskForm.taskId" @updateChannelFinish="updateChannelFinish">
    </addTaskChannelHugeModal>
    <addAreaChannelHugeModal :visible.sync="addAreaModalVisible" :updateKey="updateKey" :taskId="taskForm.taskId" @updateChannelFinish="updateChannelFinish">
    </addAreaChannelHugeModal>
     <addBySceneModal :visible.sync="addBySceneModalVisible" :updateKey="updateKey" :taskId="taskForm.taskId" @updateChannelFinish="updateChannelFinish">
    </addBySceneModal>
    <ExcelUploadEasy ref="excelUpload" :visible.sync="excelUploadShow" @downloadTemplate="downloadTemplate" :otherObj="{taskId: taskId}" :importProxy="importProxy"></ExcelUploadEasy>
  </h-page-container>
</template>
<script>

import _ from 'lodash'
import addChannelHugeModal from './hugeChannelModal/addChannelHugeModal'
import addTaskChannelHugeModal from './hugeChannelModal/addTaskChannelHugeModal'
import addAreaChannelHugeModal from './hugeChannelModal/addAreaChannelHugeModal'
import addBySceneModal from './hugeChannelModal/addBySceneModal'
import { getCaptureConfig, getKey, getChannels, deleteTaskChannel, exportChannels, getDownLoadUrl } from '../proxy'
import ExcelUploadEasy from '@/components/excelUpload/easyIndex.vue'
export default {
  components: { addChannelHugeModal, addTaskChannelHugeModal, addAreaChannelHugeModal, addBySceneModal, ExcelUploadEasy },
  data() {
    return {
      importProxy: {url: '/v1/inspect/taskconfig/channels/actions/import'},
      excelUploadShow: false,
      breadcrumb: ['通道配置'],
      taskId: '',
      modalVisible: false,
      addTaskModalVisible: false,
      addAreaModalVisible: false,
      addBySceneModalVisible: false,
      filters: {
        channelName: '',
        deviceName: '',
        groupName: '',
        pageNo: 1,
        pageSize: 20,
      },
      updateKey: '',
      taskForm: {},
      total: 0, // 总条数
      tableSelData: [],
      tableData: [], // 列表数据
    }
  },
  computed: {
    isBYSCENE() {
      return this.taskForm.executeType === 'BYSCENE'
    }
  },
  mounted() {
    this.taskId = this.$route.query.taskId
    this.getTaskInfo() // 获取当前任务的信息
    this.getList()
  },
  methods: {
    importChannels() {
      this.excelUploadShow = true
    },
    exportChannels() {
      exportChannels({ taskId: this.taskId }).then(res => {
        if(res.code === 0) {
          this.$message.success({
            dangerouslyUseHTMLString: true,
            message: `导出任务已提交，请前往<a href="/chain/index.html#/subMenu/download?time=${new Date().getTime()}" target="_blank" style="color: rgb(32, 128, 247); cursor: pointer;padding:0 4px">导出报表</a>进行下载`
          })
        }
      })
    },
    downloadTemplate () {
      getDownLoadUrl().then(res => {
        if (res.code === 0) {
          window.open(res.data.url)
        }
      })
    },
    updateChannelFinish() {
      this.filters.pageNo = 1
      this.getList()
    },
    delChannel(val) {
      let text = val ? `通道 ${val.channelName}` : `所选的${this.tableSelData.length}个通道`
      this.$confirm(`确定删除${text}?`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'question'
      }).then(() => {
        let idList = []
        if (val) { // 单个删除
          idList = [val]
        } else { // 批量删除
          idList = this.tableSelData
        }
        deleteTaskChannel({ channelIds: idList, taskId: this.taskId }).then((res) => {
          if (res.code === 0) {
            this.$message.success('删除成功')
            this.getList()
          }
        })
      })
    },
    tableSelect (val) {
      this.tableSelData = val
    },
    async getTaskInfo() {
      let res = await getCaptureConfig({ taskId: this.taskId })
      if (res.code === 0) {
        this.taskForm = { ...res.data }
        this.breadcrumb = [`【${res.data.taskName}】通道配置`]
      }
    },
    async showAddChannel () {
      let res = await getKey({ taskId: this.taskId, cacheType:3 })
      this.updateKey = res.data.key
      this.modalVisible = true
    },
    showAddChannelByScene() {
      this.addBySceneModalVisible = true
    },
    showAddTaskChannel () {
      this.addTaskModalVisible = true
    },
    showAddAreaChannel () {
      this.addAreaModalVisible = true
    },
    getList: _.debounce(function () {
      this.loading = true
      getChannels({ ...this.filters, taskId: this.taskId }).then(res => {
        this.loading = false
        if (res.code === 0) {
          this.tableData = res.data.rows || []
          this.total = res.data.total
          this.tableData.forEach(item => {
            item.presetInfoName = item.presetInfo.map(val => val.presetName).join('，') || '--'
          })
        }
      })
    }, 200),
    handleSeach() {
      this.filters.pageNo = 1
      this.getList()
    },
    handleClear() {
      this.filters.pageNo = 1
      this.getList()
    },
    handleSizeChange (val) {
      this.filters.pageSize = val
      this.getList()
    },
    handleCurrentChange (val) {
      this.filters.pageNo = val
      this.getList()
    }
  }
}
</script>
<style lang="scss" scoped>
.addHugeChannels{
  padding: 0 12px;
  .search_wrap{
    display: flex;
    align-items: center;
    justify-content: space-between;
    // height: 60px;
    flex-wrap: wrap;
    margin: 12px 0 4px;
    .left{
      margin-bottom: 8px;
      button{
        margin-right: 4px;
      }
    }
    .right{
      display: flex;
      align-items: center;
      justify-content: flex-end;
      margin-bottom: 8px;
      .search_item{
        width: 210px;
        margin-left: 12px;
      }
    }
  }
  .table_wrap{
    height: calc(100vh - 204px - 34px);
  }
}
</style>
