<template>
  <el-dialog :title="`${imgInfo.channelName}-抓图`" :visible="visible" @close="close" :area="[880,640]" custom-class="img_show_modal">
    <el-alert title="因设备能力差异，抓图可能出现：不支持抓图、抓图失败、抓图超时、使用高清抓图图片非1080P等问题，请排查具体设备问题。" type="info" simple show-icon :closable="false"></el-alert>
    <div class="wrap">
      <div class="head_wrap">
        <div>
          <el-button @click="getTaskNewPic('CAPTUREBYGEN')" icon="iconfont iconbq">普通抓图</el-button>
          <el-button @click="getTaskNewPic('CAPTUREBYHD')" icon="iconfont icongq" v-show="imgInfo.allowCaptureHD">高清抓图</el-button>
        </div>
        <div>图片分辨率：{{captureQualityRate}}</div>
      </div>
      <div class="content">
        <img :src="imgInfo.url" v-show="imgInfo.url" />
        <div class="empty" v-show="!imgInfo.url">
          <div class="status_text">{{capture.statusText}}</div>
          <div class="des">{{capture.statusDes}}</div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { getTaskNewPic, returnTaskNewPic, getNewDrawRulePic, getAreaPicSatus } from '../proxy'
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    taskId: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      imgInfo: {},
      captureQualityRate: '--',
      captureParmas: {},
      refreshDrawImgFlag: false, // 是否正在抓图
      refreshDrawImgInterval: null, // 定时请求抓图的接口
      maxRefreshTimes: 0, // 最多可以定时器请求抓图的次数，超过30次（60s）就停掉
      capture: {
        statusText: '图片抓取失败',
        statusDes: ''
      }
    }
  },
  watch: {
    visible (val) {
      if (!val) {
        this.refreshDrawImgFlag = false
        this.capture = {
          statusText: '图片抓取失败',
          statusDes: ''
        }
      }
    },
    refreshDrawImgFlag (val) {
      if (!val) { // 当前通道停止抓图,清除定时器
        this.captureQualityRate = '--'
        this.maxRefreshTimes = 0
        clearInterval(this.refreshDrawImgInterval)
        this.refreshDrawImgInterval = null
      }
    }
  },
  methods: {
    init (row) {
      this.imgInfo = { ...row }
      this.getCaptureQualityRate()// 获取图片分辨率
      this.setCaptureParmas()// 刷新抓图的参数
    },
    setCaptureParmas () {
      this.captureParmas = {}
      this.captureParmas.presetId = this.imgInfo.presetId
      this.captureParmas.channelId = this.imgInfo.channelId
      this.captureParmas.deviceId = this.imgInfo.deviceId
      this.captureParmas.taskId = this.imgInfo.taskId
    },
    getCaptureQualityRate () {
      let _this = this
      return new Promise(function (resolve) {
        var image = new Image()
        image.src = _this.imgInfo.url
        image.onload = function () {
          _this.captureQualityRate = `${image.width}*${image.height}`
          image.onload = null
          resolve()
        }
      })
    },
    getTaskNewPic (captureQualityType) {
      // getTaskNewPic({ ...this.captureParmas, captureQualityType: captureQualityType }).then(res => {
        getNewDrawRulePic({ ...this.captureParmas, captureQualityType: captureQualityType }).then(res => {
        if (res.code === 0) {
          // this.returnTaskNewPic(captureQualityType)
          this.getAreaPicSatus(captureQualityType)
          setTimeout(() => {
            if (this.refreshDrawImgFlag) {
              // this.imgInfo.url = ''
              this.$message.info('开始抓图，请稍后...')
            }
          }, 1000)
        }
      })
    },
    // 异步抓图，再定时器请求获取接口
    getAreaPicSatus (captureQualityType) {
      this.refreshDrawImgFlag = true
      this.maxRefreshTimes++
      getAreaPicSatus({ ...this.captureParmas, captureQualityType: captureQualityType }).then(res => {
        if (res.code === 0) {
          this.imgInfo.url = res.data.url
          if (res.data.status === 'SUCCESS') {
            this.refreshDrawImgFlag = false
            this.getCaptureQualityRate()
          }
          if (res.data.status === 'FAIL') {
            // this.imgInfo.url = ''
            this.refreshDrawImgFlag = false
            this.capture = {
              statusText: '图片抓取失败',
              statusDes: res.data.msg
            }
          }
          if (res.data.status === 'PROGRESS' && this.maxRefreshTimes < 4) {
            this.capture = {
              statusText: '图片抓取中，请稍后...',
              statusDes: res.data.msg
            }
            this.refreshDrawImgInterval = setTimeout(() => {
              this.getAreaPicSatus()
            }, 5000)
          }
        }
      })
    },
    close () {
      this.$emit('flash')
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="scss">
.img_show_modal{
  .el-dialog__body-wrapper{
    padding: 0;
  }
}
</style>
<style lang="scss" scoped>
  @import "../style.scss";
  .img_show_modal{
    .wrap{
      padding: 0 24px;
      .head_wrap{
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
    }
    .empty{
      width: 100%;
      height: 100%;
      background: url('../../../assets/img/empty.png') no-repeat;
      background-size: 100% 100%;
      padding-top: 300px;
      .status_text{
        font-size: 18px;
        color: #FFFFFF;
        text-align: center;
      }
      .des{
        font-size: 16px;
        color: rgba(255,255,255,0.40);
        text-align: center;
        margin: 12px auto 0;
        max-width: 600px;
      }
    }
    .content{
      height: 480px;
      width: 100%;
      img{
        width: 100%;
        height: 100%;
      }
    }
  }
</style>
