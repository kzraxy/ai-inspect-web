<template>
  <el-dialog :area="[900, 688]" :visible.sync="visible" :before-close="cancel"
    class="batch-set-modal" :close-on-click-modal=false>
    <div slot="title" class="slot_title">
      <div>批量配置</div>
      <el-tooltip content="批量设置支持多时间段多个预置点自动生成抓图" placement="bottom-start">
        <i class="h-icon-help" style="font-size:20px"></i>
      </el-tooltip>
    </div>
    <treeAndTableNoUpdateKey ref="treeAndTableNoUpdateKey" @overChooseChannels="overChooseChannels" :maxChooseNum="maxChooseNum"></treeAndTableNoUpdateKey>
    <el-form ref="form" :model="form" label-width="100px" style="width:350px;margin-top:24px">
      <el-form-item label="抓拍时段" :rules="{required: true}" prop="time">
        <el-time-picker is-range format="HH:mm" value-format="HH:mm" v-model="form.time" placeholder="选择时间范围" :clearable="false" >
        </el-time-picker>
        <span style="font-size:12px;width: 200px;position: absolute;">（间隔不能低于2小时）</span>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="confirm">下发</el-button>
      <el-button @click="cancel">取消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import treeAndTableNoUpdateKey from '@/components/treeAndTableNoUpdateKey'
import { getFormatTime } from '@/assets/libs/util'
import { publish } from '../proxy'
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  components: {
    treeAndTableNoUpdateKey
  },
  data () {
    return {
      maxChooseNum: 50,
      overChoose: false,
      form: {
        time: ['', ''] // 前端时间数据
      },
      selectData: [] // 专门用做复选框选中和反选的，带page
    }
  },
  watch: {
    visible (val) {
      if (val) {
        this.$nextTick(() => {
          this.$refs.treeAndTableNoUpdateKey.init()
        })
        this.form.time = [new Date(2019, 9, 10, 0, 0), new Date(2019, 9, 10, 23, 59)]
      } else {
        this.$refs.treeAndTableNoUpdateKey.reset()
      }
    }
  },
  computed: {
    timeHandle () { // 传给后端的时间数据
      if (typeof this.form.time[0] === 'string') { // 手动改变日期
        return [this.form.time[0] + ':00', this.form.time[1] + ':59']
      } else { // 初始的时间格式日期Object
        return [this.handleTime(this.form.time[0]) + ':00', this.handleTime(this.form.time[1]) + ':59']
      }
    }
  },
  methods: {
    overChooseChannels (flag) {
      this.overChoose = flag
    },
    handleTime (val) {
      let t = getFormatTime(val).split(' ')[1]
      let str = t.substring(0, 5)
      return str
    },
    // 点击确认
    confirm () {
      this.selectData = this.$refs.treeAndTableNoUpdateKey.sureSelectData()
      if (!this.selectData.length) {
        this.$message.warning('请选择通道！')
        return false
      }
      if (this.overChoose) {
        this.$message.warning(`通道数选择不能超过${this.maxChooseNum}个`)
        return false
      }
      // 处理数据
      let arr = []
      this.selectData.forEach(item => {
        item.channels.forEach(citem => {
          arr.push(citem)
        })
      })
      // 选择了有预置点的通道，必须选到具体的预置点
      /*   let judgeSelPresetChoose = true
      let judgeSelPresetInfo = {}
      for (let i = 0; i < arr.length; i++) {
        if ((arr[i].originPresetInfo && arr[i].originPresetInfo.length > 0) && !arr[i].selPresetIds.length) {
          judgeSelPresetChoose = false
          judgeSelPresetInfo = arr[i]
          break
        }
      }
      if (!judgeSelPresetChoose) {
        this.$message.warning(`通道${judgeSelPresetInfo.channelName}必须要选择1个预置点！`)
        return false
      } */
      publish({ choseChannels: arr, startTime: this.timeHandle[0], endTime: this.timeHandle[1] }).then(res => {
        if (res.code === 0) {
          this.$message.success('下发成功！')
          this.$emit('flash')
          this.cancel()
        }
      })
    },
    cancel () {
      this.$refs.treeAndTableNoUpdateKey.cancel()
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.slot_title{
  padding-left: 12px;
  display: flex;
  align-items: center;
}
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
.batch-set-modal{
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
