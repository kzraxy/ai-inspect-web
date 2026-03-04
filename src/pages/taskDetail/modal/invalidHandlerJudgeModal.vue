<template>
  <div class="modal-invalid-handler-judge">
    <el-dialog title="作废" :visible="visible" @close="close" :area="[480,280]" custom-class="modal-invalid-handler-judge" :close-on-click-modal=false>
      <div class="invalid-handler-judge-describe">建议您开启算法优化，开启后系统会自动将被标记为作废的图片数据回传至对应的训练数据集中。您可登录AI开放平台查看回传数据，并对算法模型进行增强训练优化。</div>
      <div style="padding-left:40px">
        <el-form ref="form" :model="taskForm" label-width="100px">
          <el-form-item label="请选择" prop="feedback" :rules="{required: true}" :required-right="false">
            <div class="invalid-handle-radio-wrap">
              <el-radio class="radio" v-model="taskForm.feedback" label="1" style="margin-left:15px">开启算法优化</el-radio>
              <el-radio class="radio" v-model="taskForm.feedback" label="2">不开启算法优化，仅作废该图片</el-radio>
            </div>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-checkbox v-model="isRemindCheck" class="remind_checked">不再提醒</el-checkbox>
        <el-button type="primary" @click="save">确认</el-button>
        <el-button @click="close">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { updateFeedbackConfig, updateFeedback } from '../proxy'
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    rowKey: {
      type: String,
      default: ''
    },
    taskId: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      taskForm: {
        feedback: '1'// 1为开启算法优化，2为仅作废图片，
      },
      isRemindCheck: false
    }
  },
  watch: {
    visible (val) {
      if (val) {
        this.taskForm.feedback = '1'
      }
    }
  },
  methods: {
    save () {
      if (this.isRemindCheck) { // 勾选了不再提醒，先调回传配置提醒接口，再调更新算法优化状态的接口(包含了图片作废功能)
        updateFeedbackConfig({ feedbackConfig: this.taskForm.feedback === '1' ? 'ALWAYS' : 'REVOKE_ONLY', taskId: this.taskId }).then((res) => {
          if (+res.code === 0) {
            this.$emit('updateFeekback', this.taskForm.feedback === '1' ? 'ALWAYS' : 'REVOKE_ONLY')
            this.updateFeedback()
          }
        })
      } else { // 没有勾选不再提醒，直接调更新算法优化状态的接口(包含了图片作废功能)
        this.updateFeedback()
      }
    },
    updateFeedback () {
      let params = { feedback: this.taskForm.feedback === '1', rowKey: this.rowKey }
      updateFeedback(params).then((res) => {
        if (+res.code === 0) {
          setTimeout(() => { // 作废图片有延迟，所以这里处理延迟500ms再请求
            this.$message.success('操作成功')
            this.$emit('flash')
            this.close()
          }, 500)
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
  .modal-invalid-handler-judge{
    .el-dialog__body-wrapper{
      padding-bottom:0;
      padding-top:20px;
    }
    .el-dialog__footer{
      position: relative;
      .remind_checked{
        position: absolute;
        left:30px;
        top:20px
      }
    }
    .invalid-handle-radio-wrap{
      display: flex;
      flex-direction: column;
      align-items: flex-start
    }
    .el-radio__label,.el-form-item__label{
      font-size: 14px;
      color: rgba(0,0,0,0.70);
    }
  }
</style>
