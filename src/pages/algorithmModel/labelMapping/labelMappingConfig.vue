<template>
  <div class="labelMappingConfig" v-loading="loading">
    <div class="breadcrumb-mod page-head">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item class="breadcrumb_item1">
          <i class="h-icon-arrow_left" @click="backConfirm"></i>
          <span @click="backConfirm">算法标签映射</span>
        </el-breadcrumb-item>
        <el-breadcrumb-item class="breadcrumb_item2">{{ isAddName }}映射</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="page-content">
      <el-scrollbar wrap-class="capture-detail-scrollbar__wrap" class="capture_detail_scrollbar_first_step">
        <div class="content-title" id='scrolldom'>{{ isAddName }}算法标签映射</div>
        <div class="first_step_wrap">
          <el-form ref="configForm" :model="configForm" :rules="rules" label-width="150px" style="width:960px">
            <el-form-item label="自定义Code名称" prop="labelCodeName" :required-right="false">
              <el-input v-model="configForm.labelCodeName" placeholder="请输入自定义Code名称" :maxlength="32" clearable
                style="width: 750px;"></el-input>
            </el-form-item>
            <el-form-item label="自定义Code" prop="labelCode" :required-right="false">
              <el-input v-model="configForm.labelCode" placeholder="请输入自定义Code" :maxlength="32" clearable
                style="width: 750px;"></el-input>
            </el-form-item>
            <el-form-item label="映射标签" prop="labelLineList" item-group style="margin-bottom: 24px;" required :required-right="false">
              <el-table :data="configForm.labelLineList" :cell-style="{ 'vertical-align': 'middle' }"
                style="width: 750px;">
                <el-table-column prop="modelId" label="算法模型">
                  <template slot-scope="scope">
                    <h-add-form-item-row :prop="`labelLineList[${scope.$index}].modelId`" :rules="[
                      { required: true, message: '请选择算法模型', trigger: 'blur' }]">
                      <el-select v-model="scope.row.modelId" @change="changeModeId(scope.$index)" filterable>
                        <el-option v-for="(item, index) in modelList" :key="index" :label="item.modelName"
                          :value="item.modelId"></el-option>
                      </el-select>
                    </h-add-form-item-row>
                  </template>
                </el-table-column>
                <el-table-column prop="trainId" label="算法版本">
                  <template slot-scope="scope">
                    <h-add-form-item-row :prop="`labelLineList[${scope.$index}].trainId`"
                      :rules="[{ required: true, message: '请选择算法版本', trigger: 'blur' }]">
                      <el-select v-model="scope.row.trainId" no-data-text="请先选择算法模型" filterable
                        @change="changeTrainId(scope.$index)">
                        <el-option
                          v-for="(item, index) in (scope.row.modelId ? modelList.filter(v => { return v.modelId === scope.row.modelId })[0].modelVersions : [])"
                          :key="index" :label="item.trainName" :value="item.trainId"></el-option>
                      </el-select>
                    </h-add-form-item-row>
                  </template>
                </el-table-column>
                <el-table-column prop="labelLineId" label="检测对象名称">
                  <template slot-scope="scope">
                    <h-add-form-item-row :prop="`labelLineList[${scope.$index}].labelLineId`"
                      :rules="[{ required: true, message: '请选择检测对象', trigger: 'blur' }]">
                      <el-select v-model="scope.row.labelLineId" no-data-text="请先选择算法版本" filterable>
                        <el-option v-for="(item, index) in (scope.row.trainId
                          ? modelList.filter(v => { return v.modelId === scope.row.modelId })[0].modelVersions.filter(v => { return v.trainId === scope.row.trainId }).length ?
                            modelList.filter(v => { return v.modelId === scope.row.modelId })[0].modelVersions.filter(v => { return v.trainId === scope.row.trainId })[0].labels
                            : [] : [])" :label="item.labelName" :value="item.labelLineId" :key="index"></el-option>
                      </el-select>
                    </h-add-form-item-row>
                  </template>
                </el-table-column>
                <el-table-column prop="" label="操作">
                  <template slot-scope="scope">
                    <el-button slot="operate" icon="h-icon-delete" @click="delRowFormData(scope.$index)"
                      :disabled="configForm.labelLineList.length < 2" />
                  </template>
                </el-table-column>
              </el-table>
              <div class="btn-wrapper"
                style="border: 1px solid rgba(0,0,0,0.08);padding: 4px;margin-top: -1px;width: 750px;">
                <h-add-form-item-btn icon="h-icon-add" @click="addRowFormData" :totalNum="20"
                  :currentNum="configForm.labelLineList.length">
                  添加
                </h-add-form-item-btn>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </el-scrollbar>
    </div>
    <div class="foot_btns">
      <el-button style="margin-top: 12px;" type="primary" @click="submitConfig" :loading="loading">保存</el-button>
      <el-button @click="backConfirm" class="">取消</el-button>
    </div>
  </div>
</template>
  
<script>
import { labelRelConfig, getLabelRelConfigInfo, modelVersionLabelList } from './proxy'
export default {
  async mounted() {
    this.isAdd = this.$route.params.isAdd === 'add'
    await this.modelVersionLabelList()
    await this.init()
  },
  computed: {
    isAddName() {
      return this.$route.params.isAdd === 'add' ? '添加' : '编辑'
    }
  },
  data() {
    let checkLabelName = async (rule, value, callback) => {
      let pattern = /^[a-zA-Z0-9\u4e00-\u9fa5]{0,32}$/
      if (!value || value.length === 0) {
        callback(new Error('请输入自定义Code名称'))
      } else if (value.length > 32) {
        callback(new Error('不能超过32个字符'))
      } else if (!pattern.test(value)) {
        callback(new Error('只支持大小写字母、数字和中文'))
      } else {
        callback()
      }
    }
    let checkLabelCode = async (rule, value, callback) => {
      let pattern = /^[a-zA-Z0-9_]{0,32}$/
      if (!value || value.length === 0) {
        callback(new Error('请输入自定义Code'))
      } else if (value.length > 32) {
        callback(new Error('不能超过32个字符'))
      } else if (!pattern.test(value)) {
        callback(new Error('只支持大小写字母、数字和下划线'))
      } else {
        callback()
      }
    }
    return {
      loading: false,
      configForm: {
        labelCodeName: '',
        labelCode: '',
        editDetailIsFinish: false,
        labelLineList: [
          {
            modelId: '',
            trainId: '',
            labelLineId: '',
            relId: ''
          }
        ]
      },
      modelList: [],
      rules: {
        labelCodeName: [
          { required: true, validator: checkLabelName, trigger: 'change' },
        ],
        labelCode: [
          { required: true, validator: checkLabelCode, trigger: 'change' },
        ],
      },
    }
  },
  methods: {
    changeTrainId(index) {
      if (this.editDetailIsFinish) {
        return false
      }
      this.configForm.labelLineList[index].labelLineId = ''
    },
    changeModeId(index) {
      if (this.editDetailIsFinish) {
        return false
      }
      this.configForm.labelLineList[index].trainId = ''
      this.configForm.labelLineList[index].labelLineId = ''
    },
    async modelVersionLabelList() {
      let res = await modelVersionLabelList()
      if (res.code === 0) {
        this.modelList = res.data || []
      }
    },
    addRowFormData() {
      this.configForm.labelLineList.push({
        modelId: '',
        trainId: '',
        labelLineId: '',
        relId: ''
      });
    },
    delRowFormData(index) {
      this.editDetailIsFinish = true
      this.configForm.labelLineList.splice(index, 1);
      setTimeout(() => {
        this.editDetailIsFinish = false
      }, 200);
    },
    async submitConfig() {
      this.$refs.configForm.validate(valid => {
        if (valid) {
          this.loading = true
          labelRelConfig({ ...this.configForm, operationType: this.$route.params.isAdd }).then(res => {
            if (res.code === 0) {
              this.$message.success('配置成功！')
              setTimeout(() => {
                this.back()
                this.loading = false
              }, 300)
            } else {
              this.loading = false
            }
          }).catch(() => { this.loading = false })
        }
      })
    },
    async init() {
      if (!this.isAdd) { // 编辑，获取详情
        this.loading = true
        this.editDetailIsFinish = true
        let res = await getLabelRelConfigInfo(this.$route.params.labelCodeId)
        this.loading = false
        if (res.code === 0) {
          this.configForm = res.data
          setTimeout(() => {
            this.editDetailIsFinish = false
          }, 500);
        }
      } else { // 增加
        this.loading = false
        this.editDetailIsFinish = false
      }
    },
    back() {
      this.$router.push({
        name: 'labelMapping'
      })
    },
    backConfirm() {
      this.$confirm('是否退出配置？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'question'
      }).then(() => {
        this.back()
      }).catch(() => { })
    }
  }
}
</script>
  
<style lang="scss" scoped>
.labelMappingConfig {
  .page-content {
    padding-top: 30px;
    display: flex;
    justify-content: center;

    .content-title {
      width: 960px;
      margin: 0 auto;
      padding: 20px 0 20px 70px;
      font-size: 18px;
      color: rgba(0, 0, 0, 0.90);
      font-weight: bold;
    }
  }

  .foot_btns {
    background: rgba(0, 0, 0, 0.04);
    text-align: center;
    padding-bottom: 12px;
    position: absolute;
    bottom: 0;
    width: 100%;
  }
}
</style>
<style lang="scss">
.labelMappingConfig {
  .capture-detail-scrollbar__wrap {
    .first_step_wrap {
      width: 100%;
      display: flex;
      justify-content: center
    }
  }

  .channel-scrollbar__view {
    display: block !important
  }

  .capture-detail-scrollbar__wrap {
    height: calc(100VH - 165px);
    width: calc(100vw - 230px);
  }
}
</style>
  