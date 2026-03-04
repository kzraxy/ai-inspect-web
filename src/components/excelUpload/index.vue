<template>
  <el-dialog :title="`上传表格导入${errorText}`" :visible.sync="dialogVisible" :area="[620, 412]" @close="close" custom-class="excelUpload">
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
            <div class="content-right-tips-2"><img class="img" src="@/assets/img/common/upload_download.svg" alt=""><span class="text" @click="downloadTemplate">导出所选通道</span></div>
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
            <form v-show="uploadState == 0" :id="formId" @dragleave="dragleaveFun"  class="upload-before" :class="{dragIn: dragIn}">
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
            <div v-show="uploadState != 0" class="upload-after">
              <div class="upload-after-text-name">{{files&&files[0]&& files[0].name}}</div>
              <el-progress :percentage="percentage"
                color="linear-gradient(90deg, #2080f7 0%, #457AFF 100%)"
                :stroke-width="8"
                stroke-linecap="round"
                class="upload-after-progress"
                :class="{error: uploadState == 5}"
                :show-text="false"></el-progress>
              <div class="upload-after-tips">
                <div class="after-tips-left">
                  <img v-if="uploadState == 1" class="img" src="@/assets/img/common/upload_status_1.gif" alt="">
                  <img v-if="uploadState == 2" class="img" src="@/assets/img/common/upload_status_2.svg" alt="">
                  <img v-if="uploadState == 3 || uploadState == 4 || uploadState == 5" class="img" src="@/assets/img/common/upload_status_3.svg" alt="">

                  <div v-if="uploadState == 1" class="text">已上传 {{percentage}}%</div>
                  <div v-if="uploadState == 2" class="text">上传成功</div>
                  <div v-if="uploadState == 3" class="text">部分{{errorText}}导入失败</div>
                  <div v-if="uploadState == 4" class="text">全部{{errorText}}导入失败</div>
                  <div v-if="uploadState == 5" class="text">上传失败</div>
                </div>
                <div class="after-tips-right">
                  <div class="tips-right-item">
                    <span class="text">{{uploadSize}}</span>
                    <div class="line" v-if="uploadState != 2"></div>
                  </div>
                  <div class="tips-right-item" v-if="uploadState == 5">
                    <span class="text btn" @click="reupload">重试</span>
                    <div class="line"></div>
                  </div>
                  <div class="tips-right-item" v-if="uploadState == 1 || uploadState == 5" @click="cancelUpload">
                    <span class="text btn">取消</span>
                  </div>
                  <div class="tips-right-item" v-if="uploadState == 3 || uploadState == 4" @click="downloadError">
                    <span class="text btn">下载失败列表</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  </el-dialog>
</template>
<script>
import { importRuleChannelData, getImportResult } from './proxy.js'
import { v1 as uuidv1 } from 'uuid'
import { changeSize } from '@/common/util'
export default {
  props: {
    describeText: {
      type: String,
      default: '请参考模版填写内容，字段填写不符合规则，则会造成导入失败'
    },
    errorText: {
      default: ''
    },
    templateType: { // 获取模板的类型
      default: ''
    },
    otherObj: { // 创建任务时候其他参数
      default() {
        return {}
      }
    },
    visible: {
      default: false
    },
    bizCode: {
      type: String,
      default: '080102'
    }
  },
  data() {
    return {
      uploadState: 0, // 0 未开始， 1 上传中， 2 全部成功， 3 部分上传成功 4 全部失败 5 上传失败
      percentageTimer: null, // 进度的定时器
      importTimer: null, // 轮询结果的定时器
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
      this.startPercentageTimer()
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
    // 重试
    reupload() {
      this.percentage = 0
      this.uploadFile(this.files)
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
    startPercentageTimer() { // 开启进度的定时器
      this.stopTimer(this.percentageTimer)
      this.percentageTimer = setInterval(() => {
        let step = (200 / 5000) * 100// 先按照五秒能上传完
        let tmpPercentage = this.percentage + step
        // 假的进度条，如果进度到99 还未上传完，进度卡到99，因为上传涉及到后台读写，没有办法做真实进度
        if(tmpPercentage >= 99) {
          this.percentage = 99
        } else {
          this.percentage = tmpPercentage
        }
      }, 200)
    },
    stopTimer(timer) { // 关闭进度的定时器
      clearInterval(timer)
    },
    async downloadTemplate() {
      this.$emit("downloadTemplate")
    },
    async createImportTask(url,fileName) {
      try{
        let sendData = { excelUrl: url,fileName: fileName, ...this.otherObj }
        let { code, data } = await importRuleChannelData(sendData)
        if(+code == 0) {
          this.getImportResult(data)
        } else {
          this.errorUpload(code)
        }
      }catch(error){
        this.errorUpload(error)
      }
    },
    async getImportResult(importTaskId) {
      this.stopTimer(this.importTimer)
      this.importTimer = setInterval(async () => {
        if(this.uploadState != 1) {
          this.stopTimer(this.importTimer)
        }
        try{
          let { code, data } = await getImportResult({ importTaskId: importTaskId })
          // exportStatus: 0执行中; 1成功；2部分成功；3全部失败   后台返回的状态
          // exportStatus: PROCESS执行中; SUCCESS成功；PART_SUCCESS部分成功；FAIL全部失败   后台返回的状态
          // uploadState:  0 未开始， 1 上传中， 2 全部成功， 3 部分上传成功 4 全部失败 5 上传失败  前端记录的状态
          if ( code!==0 || data.exportStatus==='FAIL') {
            this.stopTimer(this.importTimer)
            this.errorUpload()
            this.$message.error(data.failMessage)
            return false
          }
          let tmpDic = {
            'PROCESS': 0,
            'SUCCESS': 2,
            'PART_SUCCESS': 3,
            'FAIL': 4
          }
          if(data.exportStatus !== 'PROCESS' && +this.uploadState === 1) {
            this.stopTimer(this.percentageTimer)
            this.stopTimer(this.importTimer)
            this.uploadState = tmpDic[data.exportStatus]
            this.downloadUrl = data.downloadUrl
            this.percentage = 100
            this.$emit('success', data)
            if ( data.exportStatus === 'SUCCESS' ) {
              this.$message.success("上传成功！")
              setTimeout(() => {
                this.$emit('update:visible', false)
              }, 1000)
            } else (
              this.$message.error(data.exportStatus === 'FAIL' ? '上传失败！' : '上传存在部分失败！')
            )
          }
        } catch(error) {
          this.stopTimer(this.importTimer)
          this.errorUpload(error)
        }
      }, 500)
      
    },
    async cancelUpload() { // 取消上传
      this.uploadState = 0
      this.percentage = 0
      let myForm = document.getElementById(this.formId)
      myForm.reset()
      this.downloadUrl = ''
      this.stopTimer(this.percentageTimer)
      this.stopTimer(this.importTimer)
      this.singleAbortFn && await this.singleAbortFn()
    },
    errorUpload(error) { // 上传失败
      this.downloadUrl = ''
      this.uploadState = 5
      this.stopTimer(this.percentageTimer)
    },
    downloadError() {
      // location.href = this.downloadUrl
      window.open(this.downloadUrl)
    }
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
    }
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
        .upload-after{
          padding: 0 56px;
          .upload-after-text-name{
            font-family: MicrosoftYaHeiUI;
            font-size: 14px;
            color: #000000;
            letter-spacing: 0;
            line-height: 20px;
            font-weight: 400;
            margin-top: 42px;
          }
          .upload-after-progress{
            margin-top: 16px;
          }
          .upload-after-tips{
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 16px;
            .after-tips-left{
              display: flex;
              align-items: center;
              .img{
                width: 16px;
                height: 16px;
                margin-right: 8px;
              }
              .text{
                font-family: MicrosoftYaHeiUI;
                font-size: 14px;
                color: rgba(0,0,0,0.70);
                letter-spacing: 0;
                line-height: 20px;
                font-weight: 400;
              }
            }
            .after-tips-right{
              display: flex;
              align-items: center;
              .tips-right-item{
                display: flex;
                align-items: center;
                .text{
                  font-family: MicrosoftYaHeiUI;
                  font-size: 14px;
                  color: rgba(0,0,0,0.70);
                  letter-spacing: 0;
                  font-weight: 400;
                  &.btn{
                    color: #2080f7;
                    cursor: pointer;
                  }
                }
                .line{
                  width: 1px;
                  height: 12px;
                  background: #D8D8D8;
                  margin: 0 16px;
                }
              }
            }
          }
        }
      }
    }
  }
}
::v-deep .excelUpload .upload-after-progress{
  &.error{
    .el-progress-bar__inner{
      opacity: 0.2;
    }
  }
  .el-progress-bar__inner{
    background-image: linear-gradient(90deg, #2080f7 0%, #457AFF 100%);
  }
  .el-progress-bar__outer{
    background: rgba(0,0,0,0.04);
  }
}
</style>

