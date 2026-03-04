<template>
  <div class="deployment-model-dialog">
    <el-dialog title="模型云部署" :visible="visible" @close="close" :area="[480,252]" :close-on-click-model=false>
      <el-form ref="selectModelForm" :model="selectModelForm" label-width="150px" :rules="rules" style="margin-top: 20px;" >
        <el-form-item label="选择模型" prop="model" :required-right="false">
          <el-autocomplete
            v-model="selectModelForm.model"
            :fetch-suggestions="querySearchAsync"
            placeholder="请输入模型名称选择"
            @select="handleSelectmodel"
            :props="autocompleteProps"
            :clear-icon-click="clearIconHandler"
            :popper-append-to-body="false"
            style="width: 262px;"
          ></el-autocomplete>
        </el-form-item>
        <el-form-item label="选择模型版本" prop="modelVersion" :required-right="false">
          <el-select v-model="selectModelForm.modelVersion" filterable style="width: 262px;" @change="handleSelectModelVersion">
            <el-option v-for="(item) in modelVersionList" :key="item.trainId" :label="item.label" :value="item.trainId">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="save">确定</el-button>
        <el-button @click="close">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { queryModel, getModelVersion, deploymentModel } from '@/api/cloudDeployment'
import { NO_AUTH_CODE } from '@/constant'
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      selectModelForm: {
        model: '',
        modelVersion: ''
      },
      autocompleteProps: {
        value: 'modelName'
      },
      modelVersionList: [],
      rules: {
        model: [{ required: true, message: '模型不能为空', trigger: 'blur' }],
        modelVersion: [{ required: true, message: '模型版本不能为空', trigger: 'blur' }]
      },
      deploymentParams: {
        versionId: '',
        modelId: ''
      }
    }
  },
  watch: {
    visible (val) {
      if (!val) {
        this.selectModelForm.model = ''
        this.selectModelForm.modelVersion = ''
        this.modelVersionList = []
        this.$refs['selectModelForm'].resetValidates()
      }
    }
  },
  methods: {
    async querySearchAsync (queryString, cb) {
      let { data } = await queryModel({ nameLike: queryString })
      var results = data.filter(this.createStateFilter(queryString))
      clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
        cb(results)
      }, 300 * Math.random())
    },
    createStateFilter (queryString) {
      return state => {
        return true
      }
    },
    async getModelVersion (modelId) {
      let { code, data } = await getModelVersion({ modelId })
      if (code === 0) {
        this.modelVersionList = data || []
        this.modelVersionList.forEach(item => {
          item.label = item.version + '(' +
          (item.platform.includes('CLOUD') ? '云服务-在线验证' : item.platform.includes('DCT4') ? '云服务-云眸' : item.platform) + ')' +
          (item.modelPrecision === 'HIGH_PRECISION' ? '(高精度模型)' : item.modelPrecision === 'ULTRA_HIGH_PRECISION' ? '(观澜大模型)' : '') +
          (item.smallTargetEnhance === 'SMALL_TARGET_ENHANCE' ? '(双检测模型)' : '')
        })
      }
    },
    handleSelectmodel (item) {
      this.deploymentParams.modelId = item.modelId
      this.getModelVersion(item.modelId)
      this.$refs['selectModelForm'].validateField('model')
    },
    handleSelectModelVersion (id) {
      this.deploymentParams.versionId = id
    },
    save () {
      this.$refs['selectModelForm'].validate(async (valid, invalidFields) => {
        if (valid) {
          let { code, message } = await deploymentModel(this.deploymentParams)
          if (code === 0) {
            this.$message({
              message: '模型部署成功',
              type: 'success'
            })
            this.close()
          } else if (NO_AUTH_CODE.includes(code)) {
            this.$msgbox({
              title: message,
              type: 'warning',
              showCancelButton: true,
              confirmButtonText: '查看详情',
              cancelButtonText: '关闭',
              message: message
            }).then(() => {
              this.$router.push({ name: 'serviceManage' })
            }).catch(() => {
            })
          }
        }
      })
    },
    close () {
      this.$emit('update:visible', false)
    },
    clearIconHandler () {
      this.selectModelForm.modelVersion = ''
      this.modelVersionList = []
    }
  }
}
</script>
