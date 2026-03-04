<template>
  <div class="complianceConfigEdit" v-loading="loading">
    <div class="breadcrumb-mod page-head">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item class="breadcrumb_item1">
          <i class="h-icon-arrow_left" @click="backConfirm" ></i>
          <span @click="backConfirm">合规分析</span>
        </el-breadcrumb-item>
        <el-breadcrumb-item class="breadcrumb_item2">任务配置</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="page-content">
      <el-scrollbar wrap-class="capture-detail-scrollbar__wrap" class="capture_detail_scrollbar_first_step">
        <div class="main_wrap">
          <el-form ref="form" :model="taskForm" :rules="rules" label-width="150px" style="width:900px">
            <div class="content-title" id='scrolldom' style="width:960px;margin: 0 auto;">任务基础信息</div>
            <el-form-item label="任务名称" prop="extraTaskName" :required-right="false">
              <el-input v-model="taskForm.extraTaskName" placeholder="请输入任务名称" :maxlength="16" clearable></el-input>
            </el-form-item>
            <el-form-item label="任务类型" prop="extraTaskType" :required-right="false" required>
              <el-radio-group v-model="taskForm.extraTaskType" :disabled="!isAdd">
                <el-radio v-for="(item,index) in extraTaskTypeList" :key="index" :label="item.label">{{item.name}}</el-radio>
              </el-radio-group>
            </el-form-item>
            <div class="title_wrap">
              <div class="content-title">前置触发任务</div>
              <div class="title_des">当前置的检测分析任务触发后，将自动进行合规检测分析</div>
            </div>
            <el-alert :title="alertTitle" type="info" simple show-icon style="width:750px;margin-left:150px;margin-bottom:12px" :closable="false"></el-alert>
            <el-form-item label="触发任务" prop="triggerTaskId" :required-right="false">
              <el-select v-model="taskForm.triggerTaskId" placeholder="请选择触发任务" filterable :disabled="!isAdd">
                <el-option v-for="(item,index) in triggerTaskIdList" :key="index" :label="item.triggerTaskName" :value="item.triggerTaskId"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="规则" prop="triggerRuleId" :required-right="false" required>
              <el-select v-model="taskForm.triggerRuleId" placeholder="请选择规则" filterable :disabled="!isAdd">
                <el-option v-for="(item,index) in triggerTaskIdObj[taskForm.triggerTaskId]" :key="index" :label="item.ruleName" :value="item.ruleId"></el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </div>
      </el-scrollbar>
    </div>
    <div class="foot_btns">
      <el-button style="margin-top: 12px;" type="primary" @click="submitConfig">保存</el-button>
      <el-button @click="backConfirm" class="">取消</el-button>
    </div>
  </div>
</template>

<script>
import { editExtraTasks, addExtraTasks, getExtraTasks, getTriggerTaskIdList } from './../proxy'
export default {
  async mounted () {
    this.getTriggerTaskIdList()
    this.init()
  },
  beforeMount () {
    this.isAdd = this.$route.params.isAdd === 'add'
    this.extraTaskId = this.isAdd ? '' : this.$route.params.extraTaskId
  },
  data () {
    let checkName = async (rule, value, callback) => {
      let pattern = /^[a-zA-Z0-9\u4e00-\u9fa5]{0,32}$/
      if (!value || value.length === 0) {
        callback(new Error('请输入任务名称'))
      } else if (value.length > 32) {
        callback(new Error('任务名称不能超过32个字符'))
      } else if (!pattern.test(value)) {
        callback(new Error('任务名称只支持大小写字母、数字和中文'))
      } else {
        callback()
      }
    }
    return {
      extraTaskId: '',
      triggerTaskIdList: [],
      triggerTaskIdObj: {},
      isAdd: true, // 是否添加模式
      loading: false,
      taskForm: {
        extraTaskType: 'WELCOME',
        triggerTaskId: '',
        triggerRuleId: ''
      },
      rules: {
        extraTaskName: [
          { required: true, validator: checkName, trigger: 'blur' },
          { min: 0, max: 16, message: '不能超过16个字', trigger: 'blur' }
        ],
        triggerTaskId: [ { required: true, message: '请选择触发任务', trigger: 'change' } ],
        triggerRuleId: [ { required: true, message: '请选择规则', trigger: 'change' } ]
      }
    }
  },
  computed: {
    extraTaskTypeList () {
      return [{ label: 'WELCOME', name: '欢迎顾客' }, { label: 'SEE_OFF', name: '主动送客' }, { label: 'USE_TIMER', name: '使用计时器' }, { label: 'HELP_TURN_BACK', name: '双手搀扶转身' }, { label: 'TAKE_OFF_SHOES', name: '主动取穿/脱摆鞋袜' }, { label: 'SINGLE_HAND_OVER', name: '单手递接' }]
    },
    alertTitle () {
      let obj = {
        'WELCOME': '欢迎顾客：请选择【人体-未穿工服-站立-正面】的进店行为检测任务规则',
        'SEE_OFF': '主动送客：请选择【人体-未穿工服-站立-背面】的离店行为检测任务规则',
        'USE_TIMER': '使用计时器：请选择在上钟区域识别【有水桶】的检测任务规则',
        'HELP_TURN_BACK': '双手搀扶转身：请选择在上钟区域识别【人体-未穿工服-站立】的检测任务规则',
        'TAKE_OFF_SHOES': '主动穿取/脱摆鞋袜：请选择在上钟区域识别【穿脱鞋袜】的检测任务规则',
        'SINGLE_HAND_OVER': '单手递接：请选择在上钟区域识别【单手递接】的检测任务规则'
      }
      return obj[this.taskForm.extraTaskType]
    }
  },
  watch: {
  },
  methods: {
    getTriggerTaskIdList () {
      getTriggerTaskIdList().then(res => {
        if (res.code === 0) {
          let arr = res.data || []
          this.triggerTaskIdList = arr.filter(item => { return item.taskType === 'DCT4' })
          this.triggerTaskIdList.forEach(item => {
            item.triggerTaskId = item.taskId
            item.triggerTaskName = item.taskName
            this.triggerTaskIdObj[item.triggerTaskId] = item.ruleList
          })
        }
      })
    },
    async submitConfig () {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.loading = true
          let proxy = this.isAdd ? addExtraTasks : editExtraTasks
          proxy({ ...this.taskForm, extraTaskId: this.extraTaskId }).then(res => {
            this.loading = false
            if (res.code === 0) {
              this.$message.success(`${this.isAdd ? '添加' : '编辑'}任务成功！`)
              this.back()
            }
          })
        }
      })
    },
    init () {
      if (!this.isAdd) {
        getExtraTasks({ extraTaskId: this.extraTaskId }).then(res => { // 获取编辑详情
          this.taskForm = { ...res.data }
        })
      }
    },
    back () {
      this.$router.push({
        name: 'complianceConfig'
      })
    },
    backConfirm () {
      this.$confirm('是否退出编辑？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'question'
      }).then(() => {
        this.back()
      }).catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
  @import './style';
  .title_wrap{
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin: 0 auto;
    width: 960px;
    .title_des{
      font-size: 12px;
      color: rgba(0,0,0,0.40);
      margin-left: 16px;
    }
  }
</style>
<style lang="scss">
.page-head{
  .el-breadcrumb{
    display: flex;
    align-items: center;
    .breadcrumb_item1{
      display: flex;
      align-items: center;
      .el-breadcrumb__item__inner{
        display: flex;
        align-items: center;
        cursor: pointer;
        :hover{
          color: #2080f7;
        }
        i{
          padding-right: 10px;
          font-size: 18px;
        }
      }
    }
    .breadcrumb_item2{
      display: flex;
      align-items: center;
    }
  }
}
.complianceConfigEdit{
  .capture-detail-scrollbar__wrap{
    .main_wrap{
      width: 960px;
      margin: 0 auto;
      border: 1ox solid red;
    }
  }
  .capture-detail-scrollbar__wrap {
    height: calc(100VH - 165px);
    width: calc(100vw - 230px);
  }
}
</style>
