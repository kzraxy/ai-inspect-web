<template>
  <el-dialog title="任务列表（如果您授权路数不足可能会添加失败，请注意）" :area="[480, 626]" :visible.sync="visible" :show-close="!updateChannelLoading" :before-close="cancel"
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
      <el-button type="primary" @click="confirm" :loading="updateChannelLoading" :disabled="!duplicateTask">确 定</el-button>
      <el-button @click="cancel" :loading="updateChannelLoading">取 消</el-button>
    </span>
    <taskDetailChannelModal :visible.sync="taskChannelModalVisible" ref="taskDetailChannelModal" :taskId="taskId"></taskDetailChannelModal>
  </el-dialog>
</template>

<script>
import { getDuplicateTaskList, realTimeCopyChannelByTask } from '../../proxy'
import taskDetailChannelModal from '../taskDetailChannelModal'
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
    modelSource: {
      type: String,
      default: ''
    },
  },
  components: {
    taskDetailChannelModal
  },
  data () {
    return {
      taskList: [], // 原始任务列表
      filterTaskList: [], // 筛选和展示的任务列表
      duplicateTask: '',
      alertDom: '',
      scrolldom: '',
      taskChannelModalVisible: false,
      updateChannelLoading: false, // 后端实时更新通道的接口loading
      searchData: '' // 搜索框
    }
  },
  watch: {
    visible (val) {
      if (val) {
        this.duplicateTask = ''
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
      this.duplicateTask = item
      this.filterTaskList.forEach(val => { val.choose = (val.taskId ===  item.taskId) })
      this.taskList.forEach(val => { val.choose = (val.taskId ===  item.taskId) })
    },
    closeAlert () {
      this.alertDom.style.display = 'none'
      this.scrolldom.style.maxHeight = '470px'
    },
    async confirm () {
      this.$confirm(`确定复用 ${this.duplicateTask.taskName} 任务中的通道吗？`, {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'question'
      }).then(async () => {
        let res = await realTimeCopyChannelByTask({ taskId: this.taskId, copyTaskId: this.duplicateTask.taskId })
        if (res.code === 0) {
          this.$emit('updateChannelFinish')
          this.cancel()
        }
      })
    },
    getTaskList () {
      getDuplicateTaskList({ modelSource: this.modelSource, taskType: this.taskType, taskAnalysisMode: this.taskAnalysisMode, algorithmModelId: this.modelTypeEnum }).then(res => {
        if (res.code === 0 && res.data) {
          res.data.forEach(val => val.choose = false)
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
