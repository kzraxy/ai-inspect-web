<template>
  <el-dialog title="按场景关联通道" :area="[980, 720]" :visible.sync="visible" @close="cancel" class="add-by-scence-modal" :close-on-click-modal="false">
     <el-form ref="form" :model="taskForm" :rules="rules" label-width="100px" style="width:900px">
      <el-form-item label="分析场景" prop="sceneConfig" :required-right="false" required>
        <el-select v-model="taskForm.sceneConfig" multiple placeholder="请选择考评场景" tag-title :tag-max-width="50" @change="checkSceneStore" >
          <el-option v-for="item in scenesList" :key="item.sceneId" :label="item.sceneName" :value="item.sceneId"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="`生效${applicationSceneName}`" prop="storeConfig" class="store_config_form_item" :required-right="false"
        content-width="800px" key="storeConfig" :description="mismatchMsg">
        <areaStoreTransfer  ref="tableTransfer" @selectChange="checkChange" v-if="visible"></areaStoreTransfer>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="confirm">确 定</el-button>
      <el-button @click="cancel" >取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import areaStoreTransfer from '@/components/areaStoreTransfer/areaStoreTransfer'
import { relChannelsByScene, mismatchScene, getScenes, getCaptureConfig } from '../../proxy'
export default {
  components: { areaStoreTransfer },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    taskType: {
      type: String,
      default: ''
    },
    taskAnalysisMode: {
      type: String,
      default: ''
    },
    modelTypeEnum: {
      type: String,
      default: ''
    },
    taskId: {
      type: String,
      default: ''
    },
    updateKey: {
      type: String,
      default: ''
    },
    modelSource: {
      type: String,
      default: ''
    },
  },
  data () {
    let validateStoreConfig = (rule, value, callback) => {
      const valid = value.length <= 5000 && value.length > 0
      callback(valid ? undefined : new Error(`请至少选择一个${this.applicationSceneName}，支持选择1-5000家${this.applicationSceneName}，当前已选${value.length}家`))
    }
    return {
      scenesList: [], // 所有场景
      mismatchMsg: '',
      taskForm: {
        sceneConfig: [], // 选中的场景
        storeConfig: [] // 选中的门店
      },
      rules: {
        sceneConfig: [{ type: 'array', required: true, message: '请选择考评场景', trigger: 'change' }],
        storeConfig: [{ type: 'array', required: true, validator: validateStoreConfig }],
      },
    }
  },
  watch: {
    visible (val) {
      if (val) {
        this.getScenes()
        this.getConfigInfo()
      } else {
        this.taskForm = {
          sceneConfig: [],
          storeConfig: []
        }
        this.mismatchMsg = ''
      }
    },
  },
  methods: {
    // 获取已经配置的信息
    async getConfigInfo() {
      let res = await getCaptureConfig({ taskId: this.taskId })
      this.$nextTick(() => {
        this.taskForm.sceneConfig = [...res.data.sceneConfig]// 触发场景是否配置接口
        let storeConfig = []
        storeConfig = res.data.storeConfig.map(item => item.storeId) || []
        this.taskForm.storeConfig = storeConfig
        this.$refs.tableTransfer.setSelectData(res.data.storeConfig, true)
      })
    },
    // 获取全部场景
    getScenes () {
      getScenes().then(res => {
        if (+res.code === 0) this.scenesList = res.data.rows
      })
    },
    // 监听门店选中事件
    checkChange (data, maxChoose) {
      if(maxChoose) { // 超出选择限制最大数量
        return false
      }
      const keys = data.map(store => store.storeId)
      this.taskForm.storeConfig = keys
      this.$refs.form.validateField('storeConfig', (msg) => {
        if (msg) {
          this.mismatchMsg = ''
        } else {
          // 判断哪些门店未关联场景
          this.checkSceneStore()
        }
      })
    },
    // 判断哪些门店未关联场景，提示给用户
    checkSceneStore () {
      if (this.taskForm.storeConfig && this.taskForm.storeConfig.length > 0 && this.taskForm.sceneConfig && this.taskForm.sceneConfig.length > 0) {
        mismatchScene({ storeIds: this.taskForm.storeConfig, sceneIds: this.taskForm.sceneConfig }).then(res => {
          if (+res.code === 0) {
            this.mismatchMsg = ''
            if (res.data.length > 0) {
              res.data.forEach(item => {
                this.mismatchMsg += item.storeName + '、'
              })
              this.mismatchMsg = this.mismatchMsg.substring(0, this.mismatchMsg.length - 1)
              this.mismatchMsg += ' 尚未完成所选场景的配置，请关注。'
            }
          }
        })
      }
    },
    async confirm () {
      this.$refs.form.validate(valid => {
        if (valid) {
          relChannelsByScene({ taskId: this.taskId, ...this.taskForm }).then(res => {
            if (res.code === 0) {
              this.$message.success('操作成功！')
              this.$emit('updateChannelFinish')
              this.cancel()
            }
          })
        }
      })
    },
    cancel () {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="scss">
.add-by-scence-modal{
  .el-dialog__body-wrapper{
    padding-bottom: 0px;
  }
  .store_config_form_item{
    margin-bottom: 0px;
    .el-form-item__description{
      max-height: 50px;
      overflow: auto;
    }
  }
}
</style>
