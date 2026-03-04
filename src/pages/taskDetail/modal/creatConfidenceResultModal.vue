
<template>
  <el-dialog title="新增查询条件" :visible="visible" @close="close" :area="400" :close-on-click-model="false" custom-class="creatConfidenceResultModal">
    <div class="main">
      <el-scrollbar wrap-class="demo-scrollbar-wrap-2">
        <el-form ref="form" :model="form" label-width="60px" style="margin-right: 12px;" :rules="rules">
          <el-form-item label="时间" required style="margin-bottom: 10px;">
            <el-date-picker v-model="timeRange" type="datetimerange" :default-time="['00:00:00', '23:59:59']" :clearable="false" :picker-options="pickerOptions"/>
          </el-form-item>
          <el-form-item label="规则" required style="margin-bottom: 10px;" prop="ruleId">
            <el-select v-model="form.ruleId" filterable>
              <el-option v-for="(item,index) in ruleList" :key="index" :label="item.ruleName" :value="item.ruleId"></el-option>
            </el-select>
          </el-form-item>
          <div class="obj_main">
            <div v-for="(item, index) in targetInfoArr" :key="index" class="obj_wrap">
              <div class="title">标签<i>*</i></div>
              <div class="line_wrap">
                <div class="name ellipsis">{{ item.labelName }}</div>
                <el-input-number v-model="item.confidence" :min="0" :max="100" style="margin-right: 12px;width:70px" :disabled="!item.targetObjLabelLineId"></el-input-number>
                <el-switch v-model="item.enable" @change="changeLabelEnable(item)" :disabled="!item.targetObjLabelLineId"></el-switch>
              </div>
              <div v-if="item.targetStatusInfos && item.targetStatusInfos.length">
                <div class="title">属性<i>*</i></div>
                <div class="line_wrap" v-for="(citem,cindex) in item.targetStatusInfos" :key="cindex">
                  <el-switch v-model="citem.enable" style="margin-right: 12px;"></el-switch>
                  <div class="name ellipsis">{{ citem.propName }}</div>
                  <el-input-number v-model="citem.confidence" :min="0" :max="100" style="width:70px"></el-input-number>
                </div>
              </div>
            </div>
          </div>
        </el-form>
      </el-scrollbar>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="save">确认</el-button>
      <el-button @click="close">取消</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { getRuleList, getAlgorithmLabelInfoTreeByTaskId, addSearchTask } from '../proxy'
import { day, today, setFormatDate } from '@/plugin/utils/util'
import { getFormatTime } from '@/assets/libs/util'
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    taskInfo: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      timeRange: [setFormatDate(new Date(), 'yyyy-MM-dd 00:00:00'), setFormatDate(new Date(), 'yyyy-MM-dd 23:59:59')],
      form: {
        ruleId: '',
        ruleName: ''
      },
      rules: {
        ruleId: [
          { required: true, message: '请选择规则', trigger: 'change,blur' },
        ]
      },
      targetInfoArr: [],
      ruleList: [],
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() >= today + day
        },
        customValidation: (start, end) => {
          var moreLength = end.getTime() - 7 * 24 * 60 * 60 * 1000 <= start.getTime()
          return moreLength
        },
        customPrompt: '最长不能超过7天'
      }
    }
  },
  watch: {
    visible (val) {
      if (val) {
        this.getRuleList()
        this.getTargetInfo()
      } else {
        this.$refs.form.resetFields()
      }
    }
  },
  methods: {
    changeLabelEnable(item) {
      if(!item.enable) {
        item.targetStatusInfos && item.targetStatusInfos.forEach(tar => tar.enable = false)
      }
    },
    async getTargetInfo() {
      let res = await getAlgorithmLabelInfoTreeByTaskId({ taskId: this.taskInfo.taskId })
      if(res.code === 0 && res.data && res.data.length) {
        res.data.forEach(item => {
          item.confidence =  item.targetObjLabelLineId ? 80: 0
          item.enable = false
          item.targetObjLabelLineId = item.targetObjLabelLineId ? item.targetObjLabelLineId : 0
          item.labelLineId = item.targetObjLabelLineId
          item.labelName = item.labelName ? item.labelName : ''
          let attrValues = []
          item.targetStatusInfos && item.targetStatusInfos.forEach(citem => attrValues = attrValues.concat(citem.attrValues))
          item.targetStatusInfos = attrValues
          item.targetStatusInfos.forEach(tar => {
            tar.enable = false
            tar.confidence = 80
          })
        })
        this.targetInfoArr = res.data
      }
    },
    async getRuleList() {
      let { code, data } = await getRuleList({ taskId: this.taskInfo.taskId })
      if(code === 0 && data && data.length) {
        this.ruleList = data.filter(item => item.ruleId)
        this.form.ruleId = this.ruleList.length > 0 ? this.ruleList[0].ruleId : ''
      }
    },
    save () {
      this.$refs.form.validate(valid => {
        if (valid) {
          let enableLabelArr = this.targetInfoArr.filter(item => item.enable === true)
          if(!enableLabelArr.length) {
            this.$message.warning('必须开启一个标签！')
            return false
          }
          if(this.targetInfoArr.length === 1 && this.targetInfoArr[0].targetStatusInfos && this.targetInfoArr[0].targetStatusInfos.length) { // 仅有属性的分类算法
            let propLabelLineArr = this.targetInfoArr[0].targetStatusInfos.filter(item => item.enable === true)
            if(!propLabelLineArr.length) {
              this.$message.warning('必须开启一个属性！')
              return false
            }
          }
          let params = { ...this.form, taskId: this.taskInfo.taskId }
          params.startTime = getFormatTime(this.timeRange[0])
          params.endTime = getFormatTime(this.timeRange[1])
          params.ruleName = this.ruleList.filter(item => item.ruleId === this.form.ruleId)[0].ruleName
          params.confidenceConfigs = this.targetInfoArr || []
          addSearchTask(params).then(res => {
            if(res.code === 0) {
              this.$message.success('操作成功！')
              this.$emit('addSearch')
              this.close()
            }
          })
        }
      })
    },
    close () {
      this.$emit('update:visible', false)
    }
  }
}
</script>
<style lang="scss">
.creatConfidenceResultModal{
  .demo-scrollbar-wrap-2{
    max-height: 500px;
  }
  .el-dialog__body-wrapper{
    padding-right: 0;
  }
}
</style>
<style lang="scss" scoped>
.main{
  margin-right: 2px;
  .obj_main{
    padding-bottom: 4px;
    .obj_wrap{
      border: 1px solid #eee;
      padding: 0px 12px 8px;
      margin-top: 14px;
      border-radius: 8px;
    }
  }
}
.obj_wrap{
  .title{
    color: #4d4d4d;
    position: relative;
    margin-top: 12px;
    margin-bottom: 8px;
    i{
      color: #fa3239;
      position: absolute;
      left: 30px;
    }
  }
  .line_wrap{
    display: flex;
    align-items: center;
    margin-bottom: 6px;
    .name{
      margin-right: 12px;
      max-width: 200px;
    }
  }
}
</style>
