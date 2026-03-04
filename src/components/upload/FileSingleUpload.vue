<!-- 单文件上传组件 -->
<template>
  <div class="uploader">
    <div class="chooseStep" v-if="canChoose">
      <el-upload action="xxx" drag :file-list="value" :before-upload="_beforeUpload" :http-request="_httpUpload" v-bind="$attrs"
       class="upload-drag-demo" auto-upload single-file>
        <img src="@/assets/img/upload.png">
        <div class="upload-drag-title">点击或拖拽文件到此区域上传</div>
        <div class="upload-drag-text">{{tips}}</div>
      </el-upload>
    </div>
    <div v-if="!canChoose">
      <div class="info_wrap">
        <div :class="{'h-icon-attach':true,'error_status':errorUploadStyle}" style="font-size:22px"></div>
        <div :class="{'name':true,'error_status':errorUploadStyle}">{{uploadFile.name}}</div>
        <div class="btn_wrap">
          <div class="h-icon-done" style="color:#02BF0F;font-size:22px;font-weight:700" v-show="successUrl"></div>
          <div class="h-icon-refresh_sm btn_img item" @click="retry" v-show="!isUploading&&!successUrl"></div>
          <div class="h-icon-close btn_img item" @click="deleteFile"></div>
        </div>
      </div>
      <div v-show="isUploading"><el-progress :percentage="percent" class="self_progress" :show-text="false"></el-progress></div>
    </div>
  </div>
</template>

<script>
import { refreshToken } from '@/api/layout.js'
export default {
  name: 'FileSingleUpload',
  data () {
    return {
      successUrl: '',
      uploadFile: '',
      isUploading: false,
      percent: 0,
      errorUploadStyle: false,
      canChoose: true,
      objectKey: '',
      refreshTokenNum: 0,
      singleAbortFn: null,
    }
  },
  props: {
    tips: {
      type: String,
      default: '仅支持单个上传。支持rar、zip、7z压缩格式'
    },
    // 定义value属性
    value: {
      type: Array,
      default: () => ([])
    },
    limitSize: { // 文件大小限制 (单位 G,M,K,B  不写单位默认b)
      type: String,
      default: ''
    },
    fileNameLimit: { // 文件名称限制
      type: Boolean,
      default: false
    },
    bizCode: {
      type: String,
      default: '080101'
    }
  },
  watch: {
    percent (val) {
      if (val > 0) {
        if (val < 100 && this.refreshTokenNum > 10) { // oss上传中,调刷新token接口免得token过期
          refreshToken().then()
          this.refreshTokenNum = 0
        }
      } else {
        this.refreshTokenNum = 0
      }
    }
  },
  methods: {
    async abortUpload () {
      this.percent = 0
      if(this.percent < 100) {
        this.singleAbortFn && await this.singleAbortFn()
      }
    },
    init () {
      this.uploadFile = ''
      this.isUploading = false
      this.errorUploadStyle = false
      this.canChoose = true
      this.percent = 0
      this.abortUpload()
    },
    retry () {
      this.percent = 0
      this.confirmUpload()
    },
    async deleteFile () {
      this.canChoose = true
      this.abortUpload()
      this.uploadFile = ''
      this.successUrl = ''
      this.isUploading = false
      this.percent = 0
      this.$emit('uploadDeleteFile')
    },
    // 校验文件格式
    validateFormat (file) {
      let validate = true
      // 校验后缀名
      if (this.$attrs.accept) {
        const suffix = file.name.split('.').pop().toLowerCase()
        validate = this.$attrs.accept.includes(suffix)
      }
      if (!validate) this.$message.error(`仅支持${this.$attrs.accept}等压缩格式`)
      this.$emit('sendTypeErrorMsg', validate)
      return validate
    },
    // 校验文件大小
    validateSize (file) {
      let validate = true
      if (this.limitSize) {
        const reg = /^(\d\d*\.?\d*)([g,m,k,b]?)/i
        const multiples = { g: 1024 * 1024 * 1024, m: 1024 * 1024, k: 1024, b: 1 }
        const match = `${this.limitSize}`.match(reg)
        const limit = (multiples[match[2].toLowerCase()] || 1) * Number(match[1])
        if (file.size > limit) {
          validate = false
          this.$message.error(`文件过大，不得超过${this.limitSize}`)
        }
      }
      return validate
    },
    // 校验文件名称
    validateFileName (file) {
      let validate = true
      let lastIndex = file.name.lastIndexOf('.')
      const name = file.name.substring(0, lastIndex).replace(/\s/g, '')
      const reg = /^[a-zA-Z0-9\u4e00-\u9fa5_]{1,999}$/
      if (!reg.test(name)) {
        validate = false
        this.$message.error(`文件名仅支持中文、英文、数字`)
      }
      return validate
    },
    _beforeUpload (file) {
      this.uploadFile = file
      this.uploadFile.retryCount = 0
      const formatRes = this.validateFormat(file) // 校验格式
      if (!formatRes) { return false }
      const sizeRes = this.validateSize(file) // 校验大小
      if (!sizeRes) { return false }
      const fileNameRes = this.fileNameLimit ? this.validateFileName(file) : true // 校验文件名称
      return formatRes && sizeRes && fileNameRes
    },
    async _httpUpload ({ file }) {
      this.confirmUpload()
    },
    async confirmUpload () {
      const file = this.uploadFile
      if (!this.errorMessage) {
        this.errorUploadStyle = false
        this.isUploading = true
        this.canChoose = false
        this.$ossUploader.upload(file, this.bizCode, { // 上传阿里云
          onProgress: (p) => {
            this.percent = p
            this.refreshTokenNum++
          },
           onAbortHandler: (abortFn) => {
            this.singleAbortFn = abortFn
          },
        }).then((result) => {
          if (result.res.status === 200) { // 上传阿里云成功
            this.successUrl = result.url
            this.$emit('uploadSuccess', this.successUrl, this.uploadFile.name)
            this.isUploading = false
          }
        }).catch(() => {
          if (this.uploadFile.retryCount < 50) {
            this.uploadFile.retryCount++
            this.confirmUpload()
          } else {
            this.successUrl = ''
            this.errorUploadStyle = true
            this.isUploading = false
            this.percent = 0
            this.uploadFile ? this.uploadFile.retryCount = 0 : this.uploadFile
          }
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.self_progress{
  width: 400px;
}
.info_wrap{
  display: flex;
  align-items: center;
  color: rgba(0,0,0,0.70);
  height: 30px;
  .btn_wrap{
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 48px;
    .item{
      width: 24px;
      height: 100%;
    }
  }
  .btn_img{
    font-size: 22px;
    cursor: pointer;
    &:hover{
      color: #2080f7
    }
  }
  .name{
    width: 400px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis
  }
  .error_status{
    color: #FA3239
  }
}
.uploader {
  ::v-deep {
    .el-progress.el-progress--line {
      .el-progress-bar {
        padding-right: 50px;
        margin-right: -50px;
        .el-progress-bar__outer {
          height: 2px !important;
        }
      }
    }
  }
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
