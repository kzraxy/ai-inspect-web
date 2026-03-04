<template>
  <div class="modal-ocx-dialog">
    <!-- <el-dialog title="视频播放" :visible="visible" @close="close" :area="[910,540]"> -->
    <el-dialog title="视频播放" :visible="visible" custom-class="modal-ocx-dialog-mod" @close="close" :area="[1000,670]">
      <div v-if="visible">
        <!-- <hkvideo id="playWnd" ref="hkvideo" :getMessageCallBack="getMessageCallBack" :height="500" :macShow="macShow" :width="910"></hkvideo> -->
        <hkvideo id="playWnd" ref="hkvideo" :getMessageCallBack="getMessageCallBack" :height="634" :macShow="macShow" :width="1000"></hkvideo>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getInitData, getPlayInfoVerifyCode } from '../proxy'
import { getInitConfig } from '@/plugin/http/proxy'
import hkvideo from '@/components/video/video.vue'
// import http from '@/api/httpInstance'
export default {
  components: {
    hkvideo
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    displayPicParent: {// 父组件传过来的视频的相关信息
      type: Object,
      default: () => {
        return {}
      }
    },
    deviceSerial: {// 视频初始化获取appKey时后端需要的，当前点击图片对应的设备
      type: String,
      default: ''
    }
  },
  data () {
    return {
      playInfo: null, // 播放视频的数据
      displayPic: null,
      videoInitJson: {
        funcName: 'Init',
        arguments: {
          type: 'chain',
          initModel: 1,
          iWndType: 1,
          response: null
        }
      },
      macShow: false //  如果操作系统为mac时则显示萤石视频插件
    }
  },
  watch: {
    visible (val) {
      if (val) {
        this.displayPic = Object.assign({}, this.displayPicParent)
        let createTime = this.formatDate(this.displayPicParent.createTime)
        let dataTimeStamp = new Date(createTime.replace(/-/g, '/')).getTime()
        let timeRange = 1000 * 10// 10秒
        this.displayPic.startTime = ((dataTimeStamp - timeRange) / 1000) + ''
        this.displayPic.endTime = ((dataTimeStamp + timeRange) / 1000) + ''
        // 判断电脑系统版本，当不为windows系统时则显示萤石视频插件
        let platform = window.navigator.platform
        if (platform !== 'Win32') {
          this.macShow = true
        }
      }
    }
  },
  methods: {
    async initFun (pubkey, cb) { // 视频控件初始化成功
      // 获取通道列表数据
      try {
        const { code, data } = await getPlayInfoVerifyCode({// 获取加密验证码
          publicKey: pubkey,
          deviceSerial: this.displayPic.deviceSerial
        })
        if (+code === 0 && data) {
          this.playInfo = Object.assign({}, this.displayPic,
            { isEncrypt: data.encrypted, validateCode: data.encryptedVerifyCode, storeName: this.displayPic.groupName })
          cb()
        }
      } catch (e) {}
    },
    getMessageCallBack (oData) {
      let requestObj = oData.responseMsg.arguments.request
      if (oData.responseMsg.eventName === 'FireOcxVersion') {
        getInitData({
          deviceSerial: this.deviceSerial,
          publicKey: oData.responseMsg.arguments.pubkey
        }).then(async (res) => {
          if (res.data) {
            res.data['isEncrypt'] = 1// 控件要求设置
          }
          this.videoInitJson = {
            funcName: 'Init',
            arguments: {
              type: 'chain',
              initModel: 1,
              iWndType: 1,
              response: null
            }
          }
          getInitConfig({ keys: oData.responseMsg.arguments.configKeys }).then(result => { // 温氏版本增加的流程，参考连锁
            let dataAssign = { ...res.data, ...result.data }
            this.videoInitJson.arguments.response = { ...res, ...result }
            this.videoInitJson.arguments.response.data = dataAssign
            this.videoInitJson.arguments = encodeURI(JSON.stringify(this.videoInitJson.arguments))
            // 视频初始化
            this.$refs.hkvideo.oWebControl.JS_RequestInterface(this.videoInitJson).then(() => {
              this.initFun(oData.responseMsg.arguments.pubkey, () => {
                this.openVideo()
              })
            })
          })
        })
      } else if (oData.responseMsg.eventName === 'FireTransFunction') {
        let specialArr = ['addPreset', 'deletePreset', 'movePreset', 'updatePreset']
        let urlArr = requestObj.url.split('/')
        let urlName = urlArr[urlArr.length - 1].split('?')[0]
        if (specialArr.indexOf(urlName) !== -1) {
          // Message.error('无预置点配置权限')
        } else {
          // 透传接口(此处未做透传，直接传入需要播放的时间段)
          let obj = { funcName: 'TransFunctionResult', arguments: '' }
          let Aarguments = { request: requestObj, response: null }
          if (requestObj.callBack === 'GetChannelsByPageResult') {
            let pubkey = this.$store.state.pubkey
            requestObj.url += `&publicKeyStr=${pubkey.replace(/\+/g, '%2B')}`
          }
          if (Aarguments.request.url.includes('/channels/actions/getDailyDistribution')) {
            Aarguments.response = { 'code': 0, 'message': null, 'data': null, 'success': true }
          }
          if (Aarguments.request.url.includes('/device/replay/getReplayTimeList')) {
            Aarguments.response = { 'code': 0, 'message': null, 'data': [{ 'startTime': this.displayPic.startTime * 1000, 'endTime': this.displayPic.endTime * 1000 }], 'success': true }
          }
          obj.arguments = encodeURI(JSON.stringify(Aarguments))
          this.$refs.hkvideo.oWebControl
            .JS_RequestInterface(obj)
            .then(function (oData) {})
          // http({
          //   url: '/api/chain' + requestObj.url,
          //   method: requestObj.method,
          //   data: requestObj.body ? requestObj.body : {}
          // }).then(res => {
          //   Aarguments.response = res
          //   obj.arguments = encodeURI(JSON.stringify(Aarguments))
          //   this.$refs.hkvideo.oWebControl
          //   .JS_RequestInterface(obj)
          //   .then(function (oData) {
          //   })
          // })
          this.$refs.hkvideo.oWebControl.JS_Resize(1000, 634)
          // this.$refs.hkvideo.oWebControl.JS_Resize(810, 440)
        }
      }
    },
    openVideo () { // 打开视频
      this.$refs.hkvideo.oWebControl
        .JS_RequestInterface({
          // funcName: 'StartPreview',
          funcName: 'StartPlayback',
          arguments: encodeURI(
            JSON.stringify({
              response: {
                code: 0,
                message: null,
                data: this.playInfo
              }
            })
          )
        })
    },
    // 转换时间格式
    formatDate (val) {
      if (!val) return ''
      let time = new Date(val)
      let year = time.getFullYear()
      let month = time.getMonth() + 1 < 10 ? '0' + (time.getMonth() + 1) : time.getMonth() + 1
      let date = time.getDate() < 10 ? '0' + time.getDate() : time.getDate()
      let h = time.getHours()
      h = h < 10 ? '0' + h : h
      let mi = time.getMinutes()
      mi = mi < 10 ? '0' + mi : mi
      let s = time.getMilliseconds()
      s = s < 10 ? '0' + s : s
      return year + '-' + month + '-' + date + ' ' + h + ':' + mi + ':' + s
    },
    close () {
      this.$emit('update:visible', false)
    }
  }

}
</script>

<style lang="scss" scoped>
  @import "../style.scss";
</style>

<style lang="scss">
  .modal-ocx-dialog-mod{
    .el-dialog__body{
      padding: 0
    }
    .el-dialog__body .el-dialog__body-wrapper {
      padding: 0;
    }
  }
</style>
