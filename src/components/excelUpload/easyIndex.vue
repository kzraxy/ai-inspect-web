<template>
  <el-dialog title="导入" :visible.sync="dialogVisible" :area="[620, 412]" @close="close" custom-class="excelUpload">
      <div class="content-div first">
        <div class="content-left">
          <div class="order-number">1</div>
          <div class="order-line-div">
            <div class="order-line"></div>
          </div>
        </div>
        <div class="content-right">
          <div class="content-right-title" @click="downloadTemplate">下载模版</div>
          <div class="content-right-tips">
            <div class="content-right-tips-1">{{describeText}}</div>
            <div class="content-right-tips-2"><img class="img" src="@/assets/img/common/upload_download.svg" alt=""><span class="text" @click="downloadTemplate">下载模版</span></div>
          </div>
        </div>
      </div>
      <div class="content-div">
        <div class="content-left">
          <div class="order-number">2</div>
        </div>
        <div class="content-right">
          <div class="content-right-title">上传表格</div>
          <div class="upload-div">
            <form v-loading="loading" :id="formId" @dragleave="dragleaveFun"  class="upload-before" :class="{dragIn: dragIn}">
              <label class="upload-before-label" :for="inputId">
                <div class="upload-before-img">
                  <img class="img" src="@/assets/img/common/upload_empty.svg" alt="">
                </div>
                <div class="upload-before-text">
                  <span class="text-1">将文件拖到此处，或 </span>
                  <span class="text-2">点击上传</span>
                </div>
                <div class="upload-before-tips">表格文件仅支持 .xls、.xlsx</div>
              </label>
              <input class="importFile-input" :id="inputId" type="file"
                @change="onChange" name="file" single accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel">
            </form>
          </div>
        </div>
      </div>
  </el-dialog>
</template>
<script>
import { importAPI } from './proxy.js'
import { v1 as uuidv1 } from 'uuid'
import { changeSize } from '@/common/util'
export default {
  props: {
    describeText: {
      type: String,
      default: '请参考模版填写内容，字段填写不符合规则，则会造成导入失败'
    },
    otherObj: { // 创建任务时候其他参数
      type: Object,
      default: () => {}
    },
    visible: {
      default: false
    },
    importProxy: {
      type: Object,
      default: () => {}
    },
    bizCode: {
      type: String,
      default: '080102'
    }
  },
  data() {
    return {
      loading: false,
      uploadState: 0, // 0 未开始， 1 上传中， 2 全部成功， 3 部分上传成功 4 全部失败 5 上传失败
      percentage: 0,
      downloadUrl: '', // 结果列表
      files: null,
      formId: 'formId',
      inputId: 'inputId',
      dragIn: false //是否拖拽入内
    }
  },
  methods: {
    close() {
      this.$emit('update:visible', false)
    },
    forbidDefaultEvent(e) {
      e.preventDefault()
    },
    // 文件域变化
    onChange (e) {
      this.files = e.target.files || []
      this.uploadFile(this.files)
    },
    // 文件拖拽事件
    onDrag (e) {
      e.stopPropagation()
      e.preventDefault()
      this.dragIn = true
    },
    // 文件拖拽完毕事件
    onDrop (e) {
      e.stopPropagation()
      e.preventDefault()
      const dt = e.dataTransfer
      const files = [];
      [].forEach.call(dt.files, function (file) {
        files.push(file)
      }, false)
      this.files = files
      this.uploadFile(files)
    },
    dragleaveFun() {
      this.dragIn = false
    },
    async uploadFile(files) {
      if(files.length > 1) {
        this.$message.warning(`支持选择至多1个文件上传`)
      }
      let file = files[0]
      let checked = this.fileCheck(file)
      if(!checked){
        return
      }
      this.uploadState = 1
      this.loading = true
      try {
        this.$ossUploader.upload(file, this.bizCode).then(r => {
          if (r.res.status === 200) {
            this.createImportTask(r.url, file.name)
          }
        }).catch(e => {
          this.errorUpload(e)
        })
      } catch (error) {
        this.errorUpload(error)
      }
    },
    fileCheck(file){
      const namearr = file.name.split('.')
      let fileType = namearr[namearr.length - 1]
      let tmpTypeList = ['xls', 'xlsx']
      let tmpInedx = tmpTypeList.indexOf(fileType)
      if(tmpInedx == -1) {
        this.$message.warning(`表格文件仅支持 .xls、.xlsx`)
        return false
      }
      return true
    },
    // 重置
    reset () {
      this.$nextTick(() => {
        let myForm = document.getElementById(this.formId)
        myForm.reset()
        myForm.addEventListener('dragenter', this.onDrag, false)
        myForm.addEventListener('dragover', this.onDrag, false)
        myForm.addEventListener('drop', this.onDrop, false)
      })
    },
    async downloadTemplate() {
      this.$emit("downloadTemplate")
    },
    async createImportTask(url) {
      let sendData = { url: url, ...this.otherObj }
      let { code } = await importAPI({url: this.importProxy.url, params: sendData})
      if(+code == 0) {
        this.$message.success("导入中，请稍后查看导入结果！")
        this.$emit('update:visible', false)
      }
    },
    async cancelUpload() { // 取消上传
      this.uploadState = 0
      this.percentage = 0
      let myForm = document.getElementById(this.formId)
      myForm.reset()
      this.downloadUrl = ''
      this.loading = false
      this.singleAbortFn && await this.singleAbortFn()
    },
    errorUpload(error) { // 上传失败
      this.downloadUrl = ''
      this.uploadState = 5
      this.loading = false
    },
  },
  watch: {
    dialogVisible(val) {
      if (val) {
        // 禁止浏览器打开拖拽的文件
        document.addEventListener('drop', this.forbidDefaultEvent, false)
        document.addEventListener('dragover', this.forbidDefaultEvent, false)
        this.uploadState = 0
        this.percentage = 0
        this.reset()
      } else {
        this.cancelUpload()
        document.removeEventListener('drop', this.forbidDefaultEvent, false)
        document.removeEventListener('dragover', this.forbidDefaultEvent, false)
      }
    }
  },
  computed: {
    uploadSize() {
      if(this.files && this.files[0]) {
        return changeSize(this.files[0].size)
      }
      return '0K'
    },
    dialogVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    },
  },
  beforeDestroy () {
    document.removeEventListener('drop', this.forbidDefaultEvent, false)
    document.removeEventListener('dragover', this.forbidDefaultEvent, false)
  },
  mounted() {
    this.inputId = uuidv1()
    this.formId = uuidv1()
  }
}
</script>
<style scoped lang="scss">
.excelUpload{
  .el-dialog__body-wrapper{
    padding-left: 10px;
  }
  .content-div{
    display: flex;
    &.first {
      margin-top: 24px;
    }
    .content-left{
      flex-shrink: 0;
      .order-number{
        width: 24px;
        height: 24px;
        line-height: 24px;
        font-size: 14px;
        text-align: center;
        border-radius: 50%;
        color: rgba(0,0,0,0.9);
        background: rgba(0,0,0,0.04);
        font-family: MicrosoftYaHeiUI;
      }
      .order-line-div{
        width: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        .order-line{
          width: 2px;
          height: 60px;
          background: rgba(0,0,0,0.04);
        }
      }
    }
    .content-right{
      flex: 1;
      padding-left: 8px;
      .content-right-title{
        font-family: MicrosoftYaHeiUISemibold;
        font-size: 14px;
        color: rgba(0,0,0,0.90);
        letter-spacing: 0.13px;
        text-align: left;
        line-height: 24px;
        font-weight: 600;
      }
      .content-right-tips{
        width: 532px;
        height: 36px;
        padding-left: 12px;
        background: rgba(0,0,0,0.02);
        border-radius: 4px;
        display: flex;
        align-items: center;
        margin-top: 8px;
        .content-right-tips-1{
          font-family: MicrosoftYaHeiUI;
          font-size: 14px;
          color: rgba(0,0,0,0.70);
          text-align: left;
          font-weight: 400;
        }
        .content-right-tips-2{
          cursor: pointer;
          display: flex;
          align-items: center;
          .img{
            width: 16px;
            height: 16px;
            margin: -1px 4px 0 12px;
          }
          .text{
            font-family: MicrosoftYaHeiUI;
            font-size: 14px;
            color: #2080f7;
            letter-spacing: 0;
            font-weight: 400;
          }
        }
      }
      .upload-div{
        margin-top: 8px;
        width: 532px;
        height: 164px;
        border: 1px dashed #E2E3E6;
        border-radius: 4px;
        .upload-before{
          width: 100%;
          height: 100%;
          cursor: pointer;
          &:hover{
            background: rgba(248,248,251,0.40);
          }
          &.dragIn{
            background: rgba(248,248,251,0.40);
          }
          .upload-before-label{
            width: 100%;
            height: 100%;
            cursor: pointer;
          }
          .importFile-input{
            display: none;
          }
          .upload-before-img{
            text-align: center;
            padding-top: 24px;
            img{
              width: 64px;
              height: 64px;
            }
          }
          .upload-before-text{
            font-family: MicrosoftYaHeiUISemibold;
            font-size: 14px;
            color: rgba(0,0,0,0.90);
            letter-spacing: 0;
            line-height: 20px;
            font-weight: 600;
            text-align: center;
            .text-2 {
              color: #2080f7;
            }
          }
          .upload-before-tips{
            opacity: 0.4;
            font-family: MicrosoftYaHeiUI;
            font-size: 12px;
            color: rgba(0,0,0,0.90);
            letter-spacing: 0;
            line-height: 18px;
            font-weight: 400;
            margin-top: 8px;
            text-align: center;
          }
        }
      }
    }
  }
}
</style>

