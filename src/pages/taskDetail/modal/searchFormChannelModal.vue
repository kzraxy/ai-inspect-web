<template>
  <el-dialog title="选择通道" :area="[900, 610]" :visible.sync="visible" :before-close="cancel" class="search-form-channel-modal" :close-on-click-modal=false>
    <treeAndTableNoUpdateKey ref="treeAndTableNoUpdateKey" @overChooseChannels="overChooseChannels" :maxChooseNum="maxChooseNum"
    :taskId="taskId" :taskType="taskType" :taskAnalysisMode="taskAnalysisMode" :channes="channes"></treeAndTableNoUpdateKey>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="confirm">确定</el-button>
      <el-button @click="cancel">取消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import treeAndTableNoUpdateKey from '@/components/treeAndTableNoUpdateKey'
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
    taskId: {
      type: String,
      default: ''
    },
    taskAnalysisMode: {
      type: String,
      default: ''
    },
    channes: {}
  },
  components: {
    treeAndTableNoUpdateKey
  },
  data () {
    return {
      maxChooseNum: 20,
      overChoose: false,
      selectData: [] // 专门用做复选框选中和反选的，带page
    }
  },
  watch: {
    visible (val) {
      if (val) {
        this.$nextTick(() => {
          this.$refs.treeAndTableNoUpdateKey.init()
        })
      } else {
        this.$refs.treeAndTableNoUpdateKey.reset()
      }
    }
  },
  methods: {
    overChooseChannels (flag) {
      this.overChoose = flag
    },
    // 点击确认
    confirm () {
      if (this.overChoose) {
        this.$message.warning(`通道数选择不能超过${this.maxChooseNum}个`)
        return false
      }
      this.selectData = this.$refs.treeAndTableNoUpdateKey.sureSelectData()
      this.$emit('setSearchFormChannel', this.selectData)
      this.cancel()
    },
    cancel () {
      this.$refs.treeAndTableNoUpdateKey.cancel()
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="scss" scoped>
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
.search-form-channel-modal{
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
