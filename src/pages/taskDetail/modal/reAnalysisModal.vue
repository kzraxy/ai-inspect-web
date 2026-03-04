<template>
  <el-dialog title='重新分析' :visible="visible" @close="close" :close-on-click-modal="false" :area="560" custom-class="imgUploadModal">
    <el-radio-group v-model="radioType" style="margin: 6px 0 12px 26px;">
      <el-radio label="old">当前图片分析</el-radio>
      <el-radio label="new">上传新图片分析</el-radio>
    </el-radio-group>
    <div v-if="radioType==='new'">
      <fileSingleUpload accept=".jpg,.jpeg,.png" @sendTypeErrorMsg="sendTypeErrorMsg" class="upload_wrap" limitSize="2m" bizCode="080101"
        @uploadSuccess="uploadSuccess" ref="fileSingleUpload" @uploadDeleteFile="uploadDeleteFile" tips="仅支持单个上传。支持jpg、png、jpeg格式">
      </fileSingleUpload>
      <div style="color:red;margin-left:44px;">{{errorMessage}}</div>
      <div v-show="successUrl.length" class="contain"><img :src="successUrl" class="img_wrap"></div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="confirm" :disabled="!successUrl.length && radioType==='new'">确认</el-button>
      <el-button @click="close">取消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import fileSingleUpload from '@/components/upload/FileSingleUpload'
import { taskReanalysis } from '../proxy'
export default {
  components: { fileSingleUpload },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    taskId: {
      type: String,
      default: ''
    },
    displayPic: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      radioType: 'new',
      successUrl: '',
      fileName: '',
      errorMessage: '',
      imgUrl: ''
    }
  },
  watch: {
    visible (val) {
      if (val) {
        this.radioType = 'new'
        this.clear()
      } else {
        this.$refs.fileSingleUpload.init()
        this.$refs.fileSingleUpload.abortUpload()
      }
    },
    radioType (val) {
      if (val === 'old') {
        this.clear()
      }
    }
  },
  methods: {
    confirm () {
      let urls = this.successUrl.length ? [this.successUrl] : []
      taskReanalysis({urls: urls, taskId: this.taskId, rowKey: this.displayPic.rowKey}).then(res => {
        if (res.code === 0) {
          this.$message.success('操作成功！')
          this.close()
        }
      })
    },
    uploadDeleteFile () {
      this.clear()
    },
    uploadSuccess (uploadUrl, fileName) {
      this.successUrl = uploadUrl
      this.fileName = fileName
    },
    sendTypeErrorMsg (val) {
      this.errorMessage = val ? '' : '仅支持jpg，jpeg，png格式'
    },
    clear () {
      this.successUrl = ''
      this.fileName = ''
      this.errorMessage = ''
    },
    close () {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.imgUploadModal{
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
  margin-left:30px;
  margin-top: 10px;
}
.contain{
  display: flex;
  justify-content: center;
}
.img_wrap{
  max-width: 470px;
  // margin-left: 30px;
  margin-top: 10px;
  max-height: 300px;
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
