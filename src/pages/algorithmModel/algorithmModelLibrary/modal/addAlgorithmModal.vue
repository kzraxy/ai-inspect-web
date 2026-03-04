<template>
  <el-dialog title='上传算法模型' :visible="visible" @close="close" :close-on-click-modal="false" :area="[560,440]" class="addAlgorithmModal">
    <el-form @submit.native.prevent ref="form" :rules="rules" :model="form" style="width:450px;margin-left:44px" label-width="150px" label-position="top">
      <el-form-item label="算法类型" prop="modelType">
        <el-select v-model="form.modelType" clear>
          <el-option v-for="(item,index) in modelTypelList" :key="index" :label="item.name" :value="item.code"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div class="title">算法模型 <span style="color:red;margin-left: 4px;">*</span></div>
    <fileSingleUpload accept=".rar,.zip,.7z" @sendTypeErrorMsg="sendTypeErrorMsg" class="upload_wrap" limitSize="3g" :fileNameLimit="true"
      @uploadSuccess="uploadSuccess" ref="fileSingleUpload" @uploadDeleteFile="uploadDeleteFile" bizCode="080101">
    </fileSingleUpload>
    <div style="color:red;margin-left:44px;">{{errorMessage}}</div>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="confirm" :disabled="!successUrl.length">确认</el-button>
      <el-button @click="close">取消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import fileSingleUpload from '@/components/upload/FileSingleUpload'
import { uploadApp, getModelTypelList } from '../proxy'
export default {
  components: {
    fileSingleUpload
  },
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
    return {
      modelTypelList: [],
      form: {
        modelType: ''
      },
      successUrl: '',
      fileName: '',
      errorMessage: '',
      rules: {
        modelType: [
          { required: true, message: '请选择算法类型', trigger: 'change' }
        ]
      }
    }
  },
  watch: {
    visible (val) {
      if (val) {
        this.getModelTypelList()
        this.successUrl = ''
        this.fileName = ''
        this.errorMessage = ''
      } else {
        this.$refs.fileSingleUpload.init()
        this.$refs.fileSingleUpload.abortUpload()
        this.$refs.form.resetFields()
      }
    }
  },
  methods: {
    getModelTypelList () {
      getModelTypelList().then(res => {
        this.modelTypelList = res.data || []
      })
    },
    confirm () {
      this.$refs.form.validate(valid => {
        if (valid) {
          uploadApp({ appUrl: this.successUrl, modelType: this.form.modelType, fileName: this.fileName }).then(res => {
            this.$message.success('保存成功！')
            this.$emit('flash')
            this.close()
          })
        }
      })
    },
    uploadDeleteFile () {
      this.successUrl = ''
      this.fileName = ''
    },
    uploadSuccess (uploadUrl, fileName) {
      this.successUrl = uploadUrl
      this.fileName = fileName
    },
    sendTypeErrorMsg (val) {
      this.errorMessage = val ? '' : '仅支持rar、zip、7z等压缩格式'
    },
    close () {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.addAlgorithmModal{
  .title{
    font-size: 14px;
    color: rgba(0,0,0,0.70);
    line-height: 20px;
    height: 20px;
    margin-left: 44px;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
  }
  .uploader {
    ::v-deep {
      .el-upload-dragger{
        width: 448px;
        height: 168px;
      }
    }
  }
}
.upload_wrap{
  margin-left:44px;
}
.upload-drag-demo{
  text-align: center;
  margin-top: 4px;
}
.upload-drag-demo img {
  width: 72px;
  height: 72px;
}
.upload-drag-demo .upload-drag-title {
  margin-top: 12px;
  font-size: 16px;
  font-weight: 500;
  color: rgba(0,0,0,0.7);
}
.upload-drag-demo .upload-drag-text {
  margin-top: 4px;
  color: rgba(0,0,0,0.4);
}
</style>
