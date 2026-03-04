<template>
  <div class="modal-resend">
    <el-dialog title="重新下发" :visible="visible" @close="close" custom-class="modal-resend" :area="[480,280]">
      <div style="padding-left:40px;margin-top:30px">
        <el-form ref="form" :model="taskForm" label-width="100px">
          <el-form-item label="请选择" prop="resend" :rules="{required: true}" :required-right="false">
            <div class="invalid-handle-radio-wrap">
              <el-radio class="radio" v-model="taskForm.resend" label="-1" style="margin-left:15px">仅针对下发失败的设备</el-radio>
              <el-radio class="radio" v-model="taskForm.resend" label="1">全部设备</el-radio>
            </div>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer">
        <el-button type="primary" @click="save">确认</el-button>
        <el-button @click="close">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { sendDeivceAjax } from '../proxy'
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    taskId: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      taskForm: {
        resend: '-1'// 1为下发全部设备，-1为仅下发失败的设备，
      }
    }
  },
  watch: {
    visible (val) {
      if (val) {}
    }
  },
  methods: {
    save () {
      sendDeivceAjax({ force: this.taskForm.resend === '1', taskId: this.taskId, deviceTaskId: '' }).then((res) => {
        if (+res.code === 0) {
          this.$message.success('重新下发中！')
          this.$emit('flash')
          this.close()
        } else {
          this.$message.warning('重新下发失败！')
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
  .modal-resend{
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
