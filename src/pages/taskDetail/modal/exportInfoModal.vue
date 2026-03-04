<template>
  <div class="export-info-modal">
    <el-dialog title="导出" :visible="visible" @close="close" custom-class="export-info-modal" :area="[580,230]" :close-on-click-modal=false>
      <el-alert title='请选择需要导出数据的时间，最多支持导出30天的数据，最多支持导出2W数据' type="info" simple show-icon :closable=false class="export_alert" style="width:535px;margin-left:10px;margin-bottom:10px"></el-alert>
      <el-form ref="form" :model="taskForm" label-width="10px">
        <el-form-item label="" prop="taskValDate">
          <el-date-picker
            v-model="taskForm.taskValDate"
            type="daterange" :clearable="false"
            :picker-options="pickerOptions"
            style="width: 535px;">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="save">导出</el-button>
        <el-button @click="close">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { exportTask, getUrl } from '../proxy'
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    algorithmId: {
      type: String,
      default: ''
    },
    taskId: {
      type: String,
      default: ''
    },
    taskName: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      loading: null,
      percentageText: '导出中...',
      exportTaskId: '', // 导出任务的id
      taskForm: {
        taskValDate: [new Date(new Date().getTime() - 3600 * 1000 * 24 * 29), new Date()], // 支持30天的日期
        trainId: '',
        taskId: '',
        startDate: '',
        endDate: '',
        taskName: ''
      }
    }
  },
  computed: {
    pickerOptions: function () {
      let oneDay = 24 * 60 * 60 * 1000
      let bDate = ''
      let aDate = new Date().getTime()
      return {
        disabledDate (time) {
          if (time > bDate && time < aDate) {
            return false
          } else {
            return true
          }
        },
        onPick (dateObj) {
          if (dateObj.minDate && !dateObj.maxDate) {
            bDate = dateObj.minDate.getTime() - oneDay * 30
            aDate = (dateObj.minDate.getTime() + oneDay * 30) > new Date().getTime() ? new Date().getTime() : (dateObj.minDate.getTime() + oneDay * 30)
          } else if (dateObj.maxDate) {
            bDate = ''
            aDate = (new Date().getTime() + oneDay * 30) > new Date().getTime() ? new Date().getTime() : (new Date().getTime() + oneDay * 30)
          }
        }
      }
    }
  },
  watch: {
    visible (val) {
      if (val) {
        this.taskForm.taskValDate = [new Date(new Date().getTime() - 3600 * 1000 * 24 * 29), new Date()]// 日期初始赋值30天
      }
    },
    percentageText (val) {
      this.loading.text = val
    }
  },
  methods: {
    save (params) {
      this.loading = this.$loading({ fullscreen: true, text: this.percentageText, customClass: 'export_fullscreen' })
      // this.taskForm.startDate = getFormatTime(this.taskForm.taskValDate[0]).substr(0, 10)
      // this.taskForm.endDate = getFormatTime(this.taskForm.taskValDate[1]).substr(0, 10)
      // this.taskForm.trainId = this.algorithmId
      // this.taskForm.taskId = this.taskId
      // this.taskForm.taskName = this.taskName
      exportTask(params).then((res) => {
        if (+res.code === 0 && res.data) {
          this.exportTaskId = res.data || ''
          this.getExportUrl()
          this.close()
        } else {
          this.loading.close()
        }
      })
    },
    getExportUrl () {
      getUrl({ exportTaskId: this.exportTaskId }).then(result => {
        if (+result.code === 0) {
          this.percentageText = '导出中...，已完成' + result.data.process + '%'
          if (result.data.exportStatus === 'SUCCESS') { // 完成了导出
            this.loading.close()
            // window.open(result.data.downloadUrl)
            result.data.downloadUrls && result.data.downloadUrls.forEach(item => {
              window.open(item)
            })
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
    close () {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "../style.scss";
</style>
<style lang="scss">
 .export-info-modal{
   .export_alert{
     .el-alert__content{
       text-align: left
     }
   }
   .el-form-item__content{
     text-align: left!important;
   }
   .el-dialog__body-wrapper{
    padding-bottom:0
  }
  .is-undefined{
    margin-left:0;
    width: 0
  }
 }
 .el-select-dropdown__list{
   .channelSelectOption{
    border: 1px dotted #ccc;
    height: 45px!important;
  }
 }
</style>
