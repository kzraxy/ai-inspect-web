
<template>
  <el-dialog :title="`${title}API分析`" :visible="visible" @close="close" :area="[520,356]" :close-on-click-model="false" custom-class="apiConfigModal">
    <el-form ref="form" :model="form" label-width="80px" :rules="rules" style="margin-top: 20px;margin-left: 10px;width: 470px">
      <el-form-item label="任务名称" prop="taskName" :required-right="false">
        <el-input v-model="form.taskName" placeholder="请输入任务名称" :maxlength="16" clearable></el-input>
      </el-form-item>
      <div class="model_wrap" v-loading="loading">
        <el-form-item label="算法模型" prop="modelId" :required-right="false">
          <el-select v-model="form.modelId" filterable style="width: 220px;" @change="getVersion">
            <el-option v-for="(item, index) in modelList" :key="index" :label="item.modelName" :value="item.modelId"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="" prop="trainId" :required-right="false" class="no_label">
          <el-select v-model="form.trainId" filterable style="width: 166px;">
            <el-option v-for="(item, index) in versionList" :key="index" :label="item.label" :value="item.trainId"></el-option>
          </el-select>
        </el-form-item>
      </div>
      <el-form-item label="QPS数值" prop="qps" :required-right="false" class="qps_form_item">
        <!-- <el-input-number v-model="form.qps" :min="1" :max="qpsMax" style="width:220px"></el-input-number> -->
        <el-input-number v-model="form.qps" :min="1" style="width:220px" :max="99999999"></el-input-number>
        <div class="qps_wrap"><div>当前可用QPS</div><div class="num">{{qpsMax}}</div></div>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="save">确定</el-button>
      <el-button @click="close">取消</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { getAlgorithmsList, apideploysDetail, getModelVersion, addApiProxy, editApiProxy, getQpsAuthNum } from '../proxy'
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
  },
  data () {
    let checkName = async (rule, value, callback) => {
      let pattern = /^[a-zA-Z0-9\u4e00-\u9fa5]{0,16}$/
      if (!value || value.length === 0) {
        callback(new Error('请输入任务名称'))
      } else if (!pattern.test(value)) {
        callback(new Error('任务名称只支持大小写字母、数字和中文'))
      } else {
        callback()
      }
    }
    return {
      qpsMax: 0,
      loading: false,
      isAdd: true,
      form: {
        taskName: '',
        modelId: '',
        trainId: '',
        qps: 1
      },
      apiId: '',
      editSetDataFlag: false,
      modelList: [],
      versionList: [],
      rules: {
        taskName: [{ required: true, validator: checkName, trigger: 'blur' }],
        qps: [{ type: 'number', required: true, message: '请设置QPS数值', trigger: 'blur' }],
        modelId: [{ required: true, message: '模型不能为空', trigger: 'blur,change' }],
        trainId: [{ required: true, message: '版本不能为空', trigger: 'blur,change' }]
      },
    }
  },
  watch: {
    visible (val) {
      if (!val) {
        this.$refs['form'].resetValidates()
      }
    }
  },
  computed: {
    title () {
      return this.isAdd ? '添加' : '编辑'
    }
  },
  methods: {
    async init (type, data) {
      this.loading = true
      this.isAdd = type === 'add'
      this.apiId = data ? data.id : ''
      this.form.taskName =''
      this.getQpsMax()
      this.getModalList()
    },
    async getQpsMax () {
     let { data } = await getQpsAuthNum({ saleItemCode: 31057 })
     this.qpsMax = data.authNum - data.usedNum
    },
    async getModalList () {
      let { code, data } = await getAlgorithmsList()
      this.loading = false
      if (code === 0 && data.length) {
        if ( !data.length ) {
          this.form.modelId = ''
          this.modelList = []
          this.$message.info("暂无算法模型！")
          return false
        }
        this.modelList = data
        if ( this.isAdd ) {
          this.editSetDataFlag = false
          this.form.modelId = data[0].modelId
        } else {
          let { code, data } = await apideploysDetail(this.apiId)
          this.editSetDataFlag = true
          if (code === 0) {
            this.form = { ...data }
          }
        }
      }
    },
    async getVersion () {
      let { code, data } = await getModelVersion({ modelId: this.form.modelId })
      if (code === 0 ) {
        if ( !data.length ) {
          this.form.trainId = ''
          this.versionList = []
          this.$message.info("暂无算法版本！")
          return false
        }
        this.versionList = data
        this.versionList.forEach(item => {
          item.label = item.version + '(' +
          (item.platform.includes('CLOUD') ? '云服务-在线验证' : item.platform.includes('DCT4') ? '云服务-云眸' : item.platform) + ')' +
          (item.modelPrecision === 'HIGH_PRECISION' ? '(高精度模型)' : item.modelPrecision === 'ULTRA_HIGH_PRECISION' ? '(观澜大模型)' : '') +
          (item.smallTargetEnhance === 'SMALL_TARGET_ENHANCE' ? '(双检测模型)' : '')
        })
        setTimeout(() => {
          this.editSetDataFlag = false
        }, 1000)
        if ( !this.editSetDataFlag ) {
          this.form.trainId = data[0].trainId
        }
      }
    },
    save () {
      this.$refs['form'].validate(async (valid) => {
        if (valid) {
          let proxy = this.isAdd ? addApiProxy : editApiProxy
          let params = this.isAdd ? { ...this.form } : { ...this.form, id: this.apiId }
          let { code } = await proxy(params)
          if (code === 0) {
            this.$message({
              message: `操作成功`,
              type: 'success'
            })
            this.$emit('flash')
            this.close()
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
<style lang="scss">
.apiConfigModal{
  .model_wrap{
    .no_label{
      .el-form-item__content{
        margin-left: 0!important
      }
    }
  }
  .qps_form_item{
    .el-form-item__content{
      position: relative;
    }
  }
}
</style>
<style lang="scss" scoped>
.model_wrap{
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.qps_wrap{
  position: absolute;
  right: 0;
  top: 0;
  display: flex;
  align-items: center;
  color: rgba(0,0,0,0.40);
  margin-left: 12px;
  .num{
    color: rgba(0,0,0,0.90);
    margin-left: 8px;
  }
}
</style>
