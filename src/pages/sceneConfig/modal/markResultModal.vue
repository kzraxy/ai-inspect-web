<template>
  <el-dialog title="选择误报原因" :visible="visible" @close="close" class="markResultModal" :area="[320,300]">
    <el-radio-group v-model="misreportReason">
      <el-radio v-for="(item, index) in markResultErrorList" :key="index" :label="item" class="radio">{{ item }}</el-radio>
    </el-radio-group>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="save">确认</el-button>
      <el-button @click="close">取消</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    rowKey: {
      type: String,
      default: ''
    }
  },
  computed: {
    markResultErrorList() {
      return ['遮挡', '目标模糊', '其他物体被误报', '光线问题', '分辨率不足', '其他问题']
    }
  },
  data () {
    return {
      misreportReason: ''
    }
  },
  watch: {
    visible (val) {
      if (val) {
        this.misreportReason = this.markResultErrorList[0]
      }
    }
  },
  methods: {
    save () {
      let params = {
        rowKey: this.rowKey,
        resultStatus: 'INCORRECT',
        misreportReason: this.misreportReason
      }
      this.$emit('markResult', params)
    },
    close () {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="scss">
.markResultModal{
  .el-dialog{
    top: 30%!important;
  }
  .el-dialog__body-wrapper{
    padding-left: 30px;
  }
  .el-radio-group .el-radio{
    display: block;
    margin-bottom: 4px;
  }
  .el-radio+.el-radio{
    margin-left: 0;
  }
}
</style>

