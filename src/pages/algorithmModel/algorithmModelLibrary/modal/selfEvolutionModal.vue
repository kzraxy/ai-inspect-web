<template>
  <el-dialog title='模型自主进化' :visible="visible" @close="close" :close-on-click-modal="false" :area="480" class="selfEvolutionModal_modal">
    <el-form
      :model="ruleForm"
      label-position="top"
      :rules="rules"
      ref="ruleForm"
      label-width="100px"
      content-width="400px"
      class="self-evolution-form">
      <el-form-item label="自主进化" class="left-positon-form-item">
        <el-switch v-model="ruleForm.selfUpgradingFlag" size="mini" :width="32"></el-switch>
      </el-form-item>
      <div class="tip_text">开启后，模型会自动判断将需要做二次训练的图片素材同步至AI开放平台训练集中，供后续模型训练使用</div>
      <div v-if="ruleForm.selfUpgradingFlag">
        <el-form-item label="进化任务名称" prop="taskName">
          <el-input :maxlength="16" v-model="ruleForm.taskName" placeholder="请输入" @change="isTaskNameRepeat = false">
            <span slot="suffix" style="padding-right:6px">{{ruleForm.taskName.length}}/16</span>
          </el-input>
        </el-form-item>
        <el-form-item label="置信度阈值" :rules="{required: true}">
          <div class="block confidenceThresholdBlock">
            <el-slider v-model="ruleForm.mapThreshold" show-input :min="minMapThreshold || 0"></el-slider>
          </div>
        </el-form-item>
        <div class="tip_text">代表模型质量综合指标，数值越高代表质量越好，质量越好模型的误报率会越低</div>
        <el-form-item label="测试集" prop="dataSetVersionId">
          <el-cascader v-model="ruleForm.dataSetVersionId" :options="dataSetVersionList" @active-item-change="handleItemChange" :loading="dataSetVersionLoading"></el-cascader>
        </el-form-item>
        <div class="tip_text" style="margin-top: -8px;">用于测试进化后的算法是否满足要求，随着模型迭代，训练数据会不断更新，建议定期更新测试集数据以保障模型训练效果</div>
        <el-form-item label="模型自动更新" class="left-positon-form-item max-label-width">
          <el-switch v-model="ruleForm.automatic" size="mini"></el-switch>
        </el-form-item>
        <div class="tip_text">开启后，训练出新模型将自动对智能分析任务进行下发</div>
      </div>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="save">确认</el-button>
      <el-button @click="close">取消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getDataSet, getDataSetVersion, saveMission, getMission } from '../proxy'

export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    trainId: {
      type: String,
      default: ''
    }
  },
  data () {
    let checkName = async (rule, value, callback) => {
      let pattern = /^[a-zA-Z0-9\u4e00-\u9fa5]{0,32}$/
      if (this.isTaskNameRepeat) {
        callback(new Error(' '))
      } else if (!value || value.length === 0) {
        callback(new Error('请输入进化任务名称'))
      } else if (value.length > 32) {
        callback(new Error('进化任务名称不能超过32个字符'))
      } else if (!pattern.test(value)) {
        callback(new Error('进化任务名称只支持大小写字母、数字和中文'))
      } else {
        callback()
      }
    }
    return {
      ruleForm: {
        selfUpgradingFlag: false,
        taskName: '',
        mapThreshold: 0,
        automatic: false,
        dataSetVersionId: []
      },
      rules: {
        taskName: [
          { required: true, validator: checkName, trigger: 'blur' },
          { min: 0, max: 16, message: '不能超过16个字', trigger: 'blur' }
        ],
        dataSetVersionId: [{ required: true, message: '请选择测试集' }]
      },
      dataSetVersionList: [],
      dataSetVersionLoading: false,
      missionId: '',
      minMapThreshold: 0,
      closeMissionDoubleCheck: false,
      isTaskNameRepeat: false
    }
  },
  watch: {
    visible (val) {
      if (val) {
        this.getMission()
      } else {
        this.reset()
      }
    }
  },
  computed: {

  },
  methods: {
    reset () {
      this.ruleForm = {
        selfUpgradingFlag: false,
        taskName: '',
        mapThreshold: 0,
        automatic: false,
        dataSetVersionId: []
      }
      this.closeMissionDoubleCheck = false
      this.$refs.ruleForm.resetValidates()
    },
    close () {
      this.$emit('update:visible', false)
    },
    async getDataSet () {
      const { code, data } = await getDataSet({ trainId: this.trainId })
      if (code === 0) {
        const { dataSetList } = data
        if (Array.isArray(dataSetList) && dataSetList.length) {
          this.dataSetVersionList = dataSetList.map(_ => ({
            value: _.dataSetId,
            label: _.dataSetName,
            children: []
          }))
        }
      }
    },
    async getDataSetVersion (dataSetId) {
      this.loading = true
      const { code, data } = await getDataSetVersion({ dataSetId: dataSetId[0] })
      if (code === 0 && Array.isArray(data) && data.length) {
        const index = this.dataSetVersionList.findIndex(_ => _.value === dataSetId[0])
        this.dataSetVersionList[index].children = data.map(_ => ({
          value: _.dataSetVersionId,
          label: _.dataSetVersionName
        }))
      }
      this.loading = false
    },
    handleItemChange (dataSetId) {
      this.getDataSetVersion(dataSetId)
    },
    save () {
      this.isTaskNameRepeat = false
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          const params = {
            ...this.ruleForm,
            trainId: this.trainId,
            dataSetVersionId: this.ruleForm.dataSetVersionId[1],
            closeMissionDoubleCheck: this.closeMissionDoubleCheck
          }
          if (this.missionId) {
            params.missionId = this.missionId
          }
          saveMission(params).then(({ code }) => {
            if (code === 0) {
              this.$message.success(`自主进化已${this.ruleForm.selfUpgradingFlag ? '开启' : '关闭'}`)
              this.$emit('flash')
              this.close()
            } else if (code === 70030054) {
              this.$confirm('当前模型正在自主迭代训练进化，关闭后将停止回传数据进化模型，模型效果将无法自动优化，确定关闭？', {
                type: 'question',
                confirmButtonText: '确定',
                cancelButtonText: '取消'
              }).then(() => {
                this.closeMissionDoubleCheck = true
                this.save()
              })
            } else if (code === 70030055) {
              this.isTaskNameRepeat = true
              this.$message.error('任务名称不能重复')
              this.$refs.ruleForm.validateField('taskName')
            }
          })
        }
      })
    },
    getMission () {
      getMission({ trainId: this.trainId }).then(({ code, data }) => {
        if (code === 0) {
          this.missionId = data.missionId
          this.minMapThreshold = data.minMapThreshold || 0
          Object.keys(this.ruleForm).forEach(async key => {
            if (key === 'dataSetVersionId') {
              await this.getDataSet()
              if (data.dataSetName && data.dataSetVersionId) {
                const dataSetId = this.dataSetVersionList.filter(_ => _.label === data.dataSetName)[0].value
                await this.getDataSetVersion([dataSetId])
                this.ruleForm.dataSetVersionId = [dataSetId, data.dataSetVersionId]
              } else {
                this.ruleForm.dataSetVersionId = []
              }
            } else {
              this.ruleForm.selfUpgradingFlag = data.selfUpgradingFlag || false
              this.ruleForm.taskName = data.taskName || ''
              this.ruleForm.mapThreshold = data.mapThreshold || 0
              this.ruleForm.automatic = data.automatic || false
            }
          })
        }
      })
    }
  }
}
</script>

<style lang="scss">
.selfEvolutionModal_modal{
  .self-evolution-form {
    width: 400px;
    margin: 0 auto;
  }
  .tip_text{
    color:#999;
    margin-bottom: 20px;
    margin-top:-15px
  }
  .confidenceThresholdBlock{
    .el-input-number{
      width:72px
    }
    .el-slider__runway.show-input{
      margin-right:84px
    }
  }
  .left-positon-form-item {
    .el-form-item__label {
      width: 74px;
      float: left;
    }
    .el-form-item__content {
      line-height: 20px;
      height: 24px;
    }
    .max-label-width {
      width: 98px;
    }
    &.max-label-width {
      .el-form-item__label {
        width: 98px;
      }
    }
  }
  .el-cascader__label {
    border: none;
  }
  .el-form-item__error {
    height: 20px;
  }
}
</style>
