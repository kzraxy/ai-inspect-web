<template>
  <el-dialog title="任务列表" :area="[480, 626]" :visible.sync="visible" :show-close="!updateChannelLoading" :before-close="cancel"
    class="add-task-channel-modal" :close-on-click-modal="false">
    <el-alert title="任务列表仅展示相同设备类型的任务，选中后可复用任务中的通道" type="info" simple show-icon class="task-channel-alert" @close="closeAlert"></el-alert>
    <el-input class="input-clearable" placeholder="任务名称" suffix-icon="h-icon-search" clearable @keyup.enter.native="filterTaskList"
      :clear-icon-click="clearSearch" v-model="searchData">
    </el-input>
    <el-scrollbar wrap-class="task-channel-scrollbar-wrap">
      <div class="task_wrap" v-if="filterTaskList.length>0">
        <div v-for="(item,index) in filterTaskList" :key="index" @click="chooseDuplicateTask(item,index)"
          :class="{'task_item':true,'active_item':item.choose}" >
          {{item.taskName}}
          <div class="cover_wrap"><span @click.stop="showTaskChannelModal(item)">查看通道</span></div>
        </div>
      </div>
      <div v-else class="empty"><img src="@/assets/img/no_data_2d.png">暂无数据</div>
    </el-scrollbar>
    <span slot="footer" class="dialog-footer">
      <!-- <el-checkbox v-model="drawRuleChecked" class="self_foot_btn" v-show="['CLOUD', 'DCT4'].includes(this.taskType)">复用绘制区域</el-checkbox> -->
      <el-button type="primary" @click="confirm" :loading="updateChannelLoading" :disabled="!duplicateTask">确 定</el-button>
      <el-button @click="cancel" :loading="updateChannelLoading">取 消</el-button>
    </span>
    <taskDetailChannelModal :visible.sync="taskChannelModalVisible" ref="taskDetailChannelModal" :taskId="taskId"></taskDetailChannelModal>
  </el-dialog>
</template>

<script>
import { getDuplicateTaskList, getDuplicateTaskChannels, updateChannel, updatePreset, updateChoose } from './../proxy'
import taskDetailChannelModal from './taskDetailChannelModal'
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
    channes: {
      type: Array,
      default: () => []
    },
    updateKey: {
      type: String,
      default: ''
    },
    modelSource: {
      type: String,
      default: ''
    },
    isAdd: {
      type: Boolean,
      default: true
    },
    maxLimitChoose: {
      type: Number,
      default: 2000
    },
    hugeChannelsFlagProps: { // 当前任务是否本身就是大通道任务
      type: Boolean,
      default: false
    }
  },
  components: {
    taskDetailChannelModal
  },
  data () {
    return {
      drawRuleChecked: false,
      saveOldCheck: true,
      taskList: [], // 原始任务列表
      filterTaskList: [], // 筛选和展示的任务列表
      duplicateTaskChannels: [], // 选中任务的通道列表数据
      duplicateTask: '',
      alertDom: '',
      scrolldom: '',
      taskChannelModalVisible: false,
      updateChannelLoading: false, // 后端实时更新通道的接口loading
      hugeChannelsFlag: false, // 某任务的通道是否大于2000
      searchData: '' // 搜索框
    }
  },
  watch: {
    visible (val) {
      if (val) {
        this.drawRuleChecked = false
        this.duplicateTask = ''
        this.duplicateTaskChannels = []
        this.$nextTick(() => {
          this.alertDom = document.getElementsByClassName('task-channel-alert')[0]
          this.alertDom.style.display = 'block'
          this.scrolldom = document.getElementsByClassName('task-channel-scrollbar-wrap')[0]
          this.scrolldom.style.maxHeight = '440px'
        })
        this.getTaskList()
      }
    },
    searchData (val) {
      this.filterTaskList = this.taskList.filter(item => { return item.taskName.toUpperCase().indexOf(val.toUpperCase()) > -1 })
    }
  },
  methods: {
    showTaskChannelModal (item) {
      this.taskChannelModalVisible = true
      this.$refs.taskDetailChannelModal.init(item)
    },
    chooseDuplicateTask (item) {
      this.filterTaskList.forEach(val => { val.choose = false })
      this.taskList.forEach(val => { val.choose = false })
      this.duplicateTask = item
      this.setChooseTask()
    },
    setChooseTask () {
      this.filterTaskList.forEach(val => { val.choose = (val.taskId ===  this.duplicateTask.taskId) })
      this.taskList.forEach(val => { val.choose = (val.taskId ===  this.duplicateTask.taskId) })
    },
    closeAlert () {
      this.alertDom.style.display = 'none'
      this.scrolldom.style.maxHeight = '470px'
    },
    handleHuge() {
      if (this.isAdd) {
        this.$message.warning(`被复用任务的通道超过2000个，首次添加不能复用该任务。`)
        return false
      } else {
        const h = this.$createElement
        let url = this.$commonUtils.judgeEnv() + `/AI-inspect/index.html#/intelligent/inspectionConfig/${this.serviceType}/channelConfigPage?taskId=${this.taskId}`
        this.$confirm(`选择的通道已经超过2000个`, {
          dangerouslyUseHTMLString: true,
          type: 'question',
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          message: h('div', undefined, [
            h('span', undefined, '请前往 '),
            h('el-button',
              { style: { "text-decoration": "underline" }, props: { type: 'link' }, on: { click: () => { window.open(url) } } },
              '通道配置页'
            ),
            h('span', undefined, ' 操作')
          ]),
        }).then(async () => {
          window.open(url)
        })
      }
    },
    async confirm () {
      this.hugeChannelsFlag = false
      // 获取选中任务的通道信息
      let res = await getDuplicateTaskChannels({ currentTaskId: this.taskId, chooseTaskId: this.duplicateTask.taskId, modelSource: this.modelSource, taskType: this.taskType, taskAnalysisMode: this.taskAnalysisMode, algorithmModelId: this.modelTypeEnum })
      if (res.code === 0) {
        if (res.data.channelCount > this.maxLimitChoose) { // 表示该任务的通道大于2000
          this.duplicateTaskChannels = []
          this.hugeChannelsFlag = true
        } else {
          this.duplicateTaskChannels = res.data.groupInfoList || []
        }
      }
      if (this.hugeChannelsFlag) { // 选中的复用任务的通道数本身已经超了2000
        this.handleHuge()
        return false
      }
      this.saveOldCheck = true
      const h = this.$createElement
      this.$confirm(`确定复用${this.duplicateTask.taskName}任务中的通道吗？`, {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        // message: this.channes.length > 0 ? h(
        message: (this.channes.length > 0 || this.hugeChannelsFlagProps) ? h(
          'el-checkbox',
          {
            key: Date.now(),
            props: {
              checked: this.saveOldCheck
            },
            on: {
              change: () => {
                this.saveOldCheck = !this.saveOldCheck
              }
            }
          },
          '保留当前所选通道'
        ) : '',
        type: 'question'
      }).then(async () => {
        let channelInfo = []// 当前任务的通道数据，如果复用选择当前任务，要先删除当前任务的通道，再添加，用来处理是否'保留当前所选通道'
        this.duplicateTaskChannels.forEach(item => {
          item.channels.forEach(citem => {
            channelInfo.push(citem)
          })
        })
        if (!this.saveOldCheck) { // 不保留原来的通道选择，
          let nowTaskchannelInfo = []// 当前任务（非选择的任务）全部的通道选择
          this.channes.forEach(item => {
            item.channels.forEach(citem => {
              nowTaskchannelInfo.push(citem)
            })
          })
          let { code } = await updateChannel({ key: this.updateKey, channelInfo: nowTaskchannelInfo, type: '-1' })// 删除当前任务全部的通道选择
          if (code === 0) {
            this.updateAddChannel(channelInfo)
          }
        } else { //保留原来的通道选择，要判断原来选择的通道+复用任务的通道总数是否大于2000
          let total = this.channes.length + res.data.channelCount
          if ((total > this.maxLimitChoose) || this.hugeChannelsFlagProps) {
            this.handleHuge()
          } else {
            this.updateAddChannel(channelInfo)
          }
        }
      })
    },
    updateAddChannel (channelInfo) {
      channelInfo.forEach(item => {
        item.copyTaskId = this.drawRuleChecked ? this.duplicateTask.taskId : ''
      })
      updateChannel({ key: this.updateKey, channelInfo: channelInfo, type: '1' }).then(res => {
        if (res.code === 0) {
          channelInfo.forEach(item => { // 预置点要调单独的接口进行更新
            if (item.presetInfo && item.presetInfo.length) {
              item.selPresetIdsInfo = item.presetInfo
              item.originalPresetInfo = item.presetInfo
              item.selPresetIds = item.presetInfo.map(val => { return val.presetId })
              updatePreset({ key: this.updateKey, presetInfos: [item] }).then(res => {
                this.updateChannelLoading = false
              })
            }
          })
          this.updateChoose(true)
          this.$emit('updateChooseChannelData', this.duplicateTaskChannels, !this.saveOldCheck)
          this.cancel()
        }
      })
    },
    updateChoose (flag) { // flag：true确定，flase取消
      updateChoose({ key: this.updateKey, type: flag }).then()
    },
    getTaskList () {
      getDuplicateTaskList({ modelSource: this.modelSource, taskType: this.taskType, taskAnalysisMode: this.taskAnalysisMode, algorithmModelId: this.modelTypeEnum }).then(res => {
        if (res.code === 0 && res.data) {
          res.data.forEach(val => val.choose = false )
          this.taskList = JSON.parse(JSON.stringify(res.data))
          this.filterTaskList = JSON.parse(JSON.stringify(res.data))
        }
      })
    },
    clearSearch () {
      this.filterTaskList = JSON.parse(JSON.stringify(this.taskList))
    },
    cancel () {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.add-task-channel-modal{
  .input-clearable{
    margin-top: 12px;
  }
  .self_foot_btn{
    float:left
  }
  .empty{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    img{
      margin-top: 100px;
      width: 80px;
      height: 80px;
    }
  }
  .task_wrap{
    .task_item{
      position: relative;
      height: 44px;
      line-height: 44px;
      width: 100%;
      font-family: MicrosoftYaHeiUI;
      font-size: 14px;
      color: rgba(0,0,0,0.90);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding-left: 16px;
      padding-right: 8px;
      border-radius: 4px;
      cursor: pointer;
      .cover_wrap{
        opacity: 0;
        position: absolute;
        top: 0;
        right: 0;
        height: 100%;
        width: 185px;
        background-image: linear-gradient(90deg, rgba(246,248,255,0.00) 0%, #F6FAFF 39%, #F6FAFF 100%);
        border-radius: 4px;
        color: #2080f7;
        text-align: right;
        padding-right: 16px;
      }
      &:hover{
        background: rgba(30,127,255,0.04);
        color: #2080f7;
        .cover_wrap{
          opacity: 1;
        }
      }
    }
    .active_item{
      background: rgba(30,127,255,0.04);
      color: #2080f7;
    }
  }
}
</style>
<style lang="scss">
.add-task-channel-modal{
  .task-channel-scrollbar-wrap{
    margin-top: 12px;
    max-height: 440px;
  }
  .el-alert__title{
    font-size: 12px;
  }
  .el-dialog__body-wrapper{
    padding-top:10px!important;
    padding-bottom:5px!important
  }
}
</style>
