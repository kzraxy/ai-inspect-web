<template>
  <div style="height: 100%;background:#333333" id='hikChainVideo'>
    <!-- <div v-if="macShow" class="macVideo-container" style="height: 100%">
      <div id="myPlayer" ></div>
      <slot name="bottom"></slot>
    </div> -->
    <div style="height: 100%">
      <div v-show="!isVideoShow && !macShow" class="lost-video">
        <img :src="needVideo" alt="视频缺失" class="lost-video-img">
        <p class="lost-video-text">视频插件加载失败</p>
        <p class="lost-video-text">若视频未正常打开，请点击此处<el-button type="link" @click="toSoftwareDownload('ocx')">下载</el-button>并安装，并重启浏览器（推荐使用Chrome、IE11及以上版本）</p>
        <p class="lost-video-text">若已经安装过插件，请点击<el-button type="text" @click="wakeUp">唤醒</el-button>启动程序，并刷新当前页面。</p>
      </div>
      <div style="position:relative;display: flex;flex-direction:column;height:100%;" v-show="isVideoShow">
        <div class="video-switch" v-if='headTitle && !macShow'>
          <div class="video-switch-tab">
            <div
              v-if="isActive"
              class="video-switch-tab-line"
              :style="switchLineStyle">
            </div>
            <div class="video-switch-tab-btn" v-if="isActive" @click="switchTo(0)" :class="{'tab-active': (switchVideo===0?true : false )}">实时预览</div>
            <div class="video-switch-tab-btn" @click="switchTo(1)" :class="{'tab-active':(switchVideo===1?true : false )}">录像回放</div>
          </div>
        </div>
        <slot name="top"></slot>
        <uikit-video ref="uikitVideo" v-if="macShow" :playModel="switchVideo" @picCaptured="picCaptured" @switchMacTo="switchMacTo"></uikit-video>
        <div :id="id" style="flex:1" v-else></div>
        <slot name="bottom"></slot>
      </div>
    </div>
  </div>
</template>
<script>
import { WebControlInit, getLastestVersion } from './index.js'
import { refreshWebToken, getDeviceRamAccount, uploadVideoEventLog } from './proxy'
import { Message } from 'hui'
import needVideo from '@/assets/img/video/needVideo.svg'
import { safeCenterPrefix, hasAuthor, isMac } from '@/plugin/utils/util'
import _ from 'lodash'
import durationCounter from './viewDurationCollection'
import http from '@/api/httpInstance'
import uikitVideo from './uikitVideo'
export default {
  name: 'videoComponent',
  components: {
    uikitVideo
  },
  data () {
    return {
      macPlayer: null,
      macVideoData: {}, // 萤石控件视频播放通道
      needVideo,
      isVideoShow: true, // 视频控件是否显示  初始化失败显示控件缺失，隐藏视频相关元素
      switchVideo: 0, // 0实时预览 1录像回放
      oWebControl: null, // 视频插件实例对象
      iLastCoverLeft: 0,
      iLastCoverTop: 0,
      iLastCoverRight: 0,
      iLastCoverBottom: 0,
      isupDate: true,
      time: new Date().getTime().toString(),
      tokenCheckTimer: undefined,
      needResize: false,
      videoHidding: false,
      height: 600,
      width: 1000
    }
  },
  watch: {
  },
  props: {
    fakeMacShow: {
      // 是否需要展示uikit
      type: Boolean,
      default: false
    },
    id: {
      type: String,
      default: 'playWnd'
    },
    dllPath: {
      type: String,
      default: './chain/cloudTransform.dll'
    },
    isActive: {
      // 是否需要实时预览
      type: Boolean,
      default: true
    },
    getMessageCallBack: {
      type: Function,
      default: () => {}
    },
    author: { // 是否具有回放权限
      type: Boolean,
      default: true
    },
    isInit: { // 是否初始化成功
      type: Boolean,
      default: true
    },
    headTitle: {
      type: Boolean,
      default: true
    }
  },
  created () {
    let self = this
    this.globalBus.$on('cutVideo', (obj = {}) => {
      self.cutVideo(obj.top, obj.left, obj.width, obj.height)
    })
    this.globalBus.$on('repairVideo', (obj = {}) => {
      self.repairVideo(obj.top, obj.left, obj.width, obj.height)
    })
  },
  computed: {
    macShow() {
      return this.fakeMacShow || isMac()
    },
    switchLineStyle: function () {
      if (this.switchVideo === 0) {
        return {
          transform: 'translateX(0px)'
        }
      }
      return {
        transform: 'translateX(88px)'
      }
    }
  },
  destroyed () {
    this.$store.commit('changePubkey', '')
    this.destroyVideo()
    clearInterval(this.timer)
    durationCounter.stopCount()
  },
  mounted: function () {
    let self = this
    if (this.macShow) {

    } else {
      // this.globalBus.$on('showVideo', () => {
      //   this.showVideo()
      // })
      // this.globalBus.$on('hideVideo', () => {
      //   this.hideVideo()
      // })
      window.addEventListener('resize', this.cb)
      window.addEventListener('scroll', this.cb)
      this.globalBus.$on('resize', this.cb)
      this.oWebControl = WebControlInit(
        self.id,
        self.cbConnectSuccess,
        self.cbConnectError,
        self.cbConnectClose
      )
    }

    window.onunload = () => {
      if (self.oWebControl) {
        self.oWebControl.JS_HideWnd()
        self.oWebControl.JS_Disconnect()
      }
    }

    this.timer = setInterval(this.checkToken, 5000)
    durationCounter.startCount()
  },
  methods: {
    cb () {
      if (this.oWebControl != null) {
        if (this.videoHidding) {
          this.needResize = true
          return
        }
        this.debounce()()
      }
    },
    playMacVideo (data) {
      this.$nextTick(() => {
        this.$refs.uikitVideo.playMacVideo(data)
      })
    },
    picCaptured(picInfo) {
      this.$emit('picCaptured', picInfo)
    },
    // 更新视频控件的尺寸
    setVideoHW () {
      const ele = document.getElementById(this.id)
      this.height = ele.clientHeight
      this.width = ele.clientWidth
    },
    checkToken () {
      let timestamp = localStorage.getItem('requestTimestamp')
      if (!timestamp) return
      timestamp = +timestamp
      if (Date.now() >= timestamp + 30 * 60 * 1000) {
        // location.replace(`${safeCenterPrefix}/login/retail?type=true`)
      }
    },
    // fv更高或一致，则不需更新
    versionCompare (fv, sv) {
      const handler = (v) => v.substring(1).split('.').map(e => +e)
      const fvArr = handler(fv)
      const svArr = handler(sv)
      for (let i = 0; i < fvArr.length; i++) {
        if (fvArr[i] < svArr[i]) return true
        if (fvArr[i] > svArr[i]) return false
      }
      return false
    },
    ocxVersion (oData) {
      // 获取exe 程序版本号
      /* getLastestVersion().then(res => {
        let exeVersion = oData.responseMsg.arguments.version
        let lastestVersion = res.data[0].version
        this.$store.commit('changePubkey', oData.responseMsg.arguments.pubkey)
        if (!this.versionCompare(exeVersion, lastestVersion)) return
        if (res.data[0].updateFlag === 1) {
          // 强制更新
          this.isupDate = false
          this.cutVideo()
          this.$confirm({
            title: '提示',
            message: 'changePosType视频插件已更新，请下载安装并重启浏览器(推荐使用Chrome、IE11及以上版本)，否则将影响使用',
            confirmButtonText: '立即更新',
            showCancelButton: false,
            closeOnClickModal: false,
            type: 'question'
          }).then(() => {
            this.toSoftwareDownload('ocx')
            this.repairVideo()
            this.$emit('recoverVideo')
          })
          return
        }

        const versionKey = 'exeVersionIgnore'
        const versionIgnore = localStorage.getItem(versionKey)
        if (versionIgnore && !this.versionCompare(versionIgnore, lastestVersion)) return

        this.cutVideo()
        this.$confirm({
          title: '提示',
          message: '视频插件已更新，请下载安装并重启浏览器(推荐使用Chrome、IE11及以上版本)',
          buttons: [
            { name: '立即更新', type: 'primary', action: 'confirm' },
            { name: '下次再说', type: 'default', action: 'cancel' },
            { name: '忽视此版本', type: 'ghost', action: 'ignore' }
          ],
          size: 'middle',
          closeOnClickModal: true,
          type: 'question'
        }).then((action) => {
          this.repairVideo()
          this.$emit('recoverVideo')
          if (action === 'confirm') {
            this.toSoftwareDownload('ocx')
          } else if (action === 'ignore') {
            localStorage.setItem(versionKey, lastestVersion)
          }
        }).catch(() => {
          this.repairVideo()
          this.$emit('recoverVideo')
        })
      }) */
    },
    transFunction (oData) {
      let requestObj = oData.responseMsg.arguments.request
      // 判断有没有预置点的操作权限
      let hasPresetAuthor = hasAuthor('RETAIL_AUTH_03003')
      let specialArr = ['addPreset', 'deletePreset', 'updatePreset', 'addParkAction', 'delParkAction']
      let urlArr = requestObj.url.split('/')
      let urlName = urlArr[urlArr.length - 1].split('?')[0]
      if (specialArr.indexOf(urlName) !== -1 && !hasPresetAuthor) {
        Message.error('无预置点配置权限')
      } else {
        // 透传接口
        let obj = { funcName: 'TransFunctionResult', arguments: '' }
        let Aarguments = { request: requestObj, response: null }
        if (requestObj.callBack === 'GetChannelsByPageResult' && requestObj.url.indexOf('publicKeyStr') === -1) {
          let pubkey = this.$store.state.pubkey
          requestObj.url += `&publicKeyStr=${pubkey.replace(/\+/g, '%2B')}`
        }
        http({
          method: requestObj.method.toLowerCase(),
          url: '/v1/chain' + requestObj.url,
          // url: '/api/chain' + requestObj.url,
          data: requestObj.body ? requestObj.body : {}
        }).then(res => {
          Aarguments.response = res
          obj.arguments = encodeURI(JSON.stringify(Aarguments))
          this.oWebControl
            .JS_RequestInterface(obj)
            .then(function (oData) {
            })
        })
      }
    },
    cbConnectSuccess () {
      // 设置窗口回调
      const cbIntegrationCallBack = oData => {
        this.getMessageCallBack(oData)

        const FirePluginMoved = () => {
          try {
            // 目前控件方在回放的时候时间轴变化和改了日期的时候会触发
            // refreshWebToken()
          } catch (e) {
            Message.error(e.message || '系统错误，请联系管理员')
          }
        }

        const handlers = {
          FireOcxVersion: this.ocxVersion,
          FirePluginMoved,
          // // 统一控件埋点信息上报
          // FireVideoInfoCollection: data => this.sendClickMessage(data.responseMsg.arguments),
          // // TODO：临时的取流上报，过几个版本可以干掉，稳一点可以在某个强制升级的控件后干掉
          // FireVideoStreamTime: data => this.sendClickMessage(data.responseMsg.arguments),
          FireVideoEventLog: data => uploadVideoEventLog(data.responseMsg.arguments),
          FireTransFunction: this.transFunction
        }
        const handler = handlers[oData.responseMsg.eventName]
        handler && handler(oData)
      }
      // 设置窗口控制回调
      this.oWebControl.JS_SetWindowControlCallback({
        cbIntegrationCallBack: cbIntegrationCallBack
      })
      this.oWebControl
        .JS_StartService('window', {
          dllPath: this.dllPath
        })
        .then(() => {
          this.setVideoHW()
          this.oWebControl
            .JS_CreateWnd(this.id, this.width, this.height)
            .then(() => {})
        })
    },
    toSoftwareDownload (type) {
      let map = {
        windows: 'Hikvision Cloudvisual.exe',
        tv: 'TVWall_Client.exe',
        video: 'VideoPlayer.exe',
        ocx: 'cloudViewSetup.exe'
      }
      const softwareName = map[type]
      if (!softwareName) {
        return
      }
      // const prePath = `${process.env.VUE_APP_DOWNLOAD_HOST}/chain/download/`
      // window.open(`${prePath}${softwareName}`, this.time)
      const path = process.env.LOCAL_HOST
      if (path === 'https://pb.hik-cloud.com') {
        window.open('https://pbpic.hik-cloud.com/chain/download/cloudViewSetup.exe')
      } else if (path === 'https://www.hik-cloud.com') {
        window.open('https://pic.hik-cloud.com/chain/download/cloudViewSetup.exe')
      } else if (window.location.href.indexOf('hilaicloud.com') > -1) { // 云莱的
        window.open('https://pic.hik-cloud.com/chain/download/cloudViewSetup.exe')
      } else {
        window.open('http://hikvision.oss-cn-hangzhou.aliyuncs.com/chain/download/cloudViewSetup.exe')
      }
    },
    cbConnectError () {
      this.oWebControl = null
      this.isVideoShow = false
    },
    cbConnectClose () {
      this.oWebControl = null
    },
    startPlayback () {
      this.switchVideo = 1
    },
    debounce () {
      const setVideoSize = () => {
        this.setVideoHW()
        this.oWebControl.JS_Resize(this.width, this.height)
      }
      // TODO: 防抖截流
      return _.debounce(setVideoSize, 300)
    },
    switchMacTo(num) {
      this.switchVideo = num
    },
    switchTo (num) {
      if (this.author && this.isInit) {
        this.switchVideo = num
      }
      if (!this.macShow) {
        this.$emit('switchVideo', num)
      }
    },
    wakeUp () {
      window.WebControl.JS_WakeUp('CloudViewPlugin://WebChainControl.exe')
      Message.success('唤醒控件成功，3s后刷新页面')
      setTimeout(() => {
        window.location.reload()
      }, 3000)
    },
    hideVideo () {
      durationCounter.pauseCount()
      this.oWebControl.JS_HideWnd()
    },
    showVideo () {
      durationCounter.continueCount()
      this.oWebControl.JS_ShowWnd()
    },
    // 切割视频
    cutVideo (top = 0, left = 0, width = this.width, height = this.height) {
      this.oWebControl && this.oWebControl.JS_CuttingPartWindow(left, top, width, height)
      this.videoHidding = true
    },
    // 还原视频
    repairVideo (top = 0, left = 0, width = this.width, height = this.height) {
      this.oWebControl && this.oWebControl.JS_RepairPartWindow(left, top, width, height)
      this.videoHidding = false
      if (this.needResize) {
        this.debounce()()
        this.needResize = false
      }
    },
    // 设置窗口遮挡
    setWndCover () {
      let $ = function (dom) {
        return document.querySelector(dom)
      }
      let iWidth = document.documentElement.clientWidth
      let iHeight = window.innerHeight
      let oDivRect = $('#' + this.id).getBoundingClientRect()
      let iCoverLeft = oDivRect.left < 0 ? Math.abs(oDivRect.left) : 0
      let iCoverTop = oDivRect.top < 0 ? Math.abs(oDivRect.top) : 0
      let iCoverRight =
          oDivRect.right - iWidth > 0 ? Math.round(oDivRect.right - iWidth) : 0
      let iCoverBottom =
          oDivRect.bottom - iHeight > 0
            ? Math.round(oDivRect.bottom - iHeight)
            : 0
      iCoverLeft = iCoverLeft > this.width ? this.width : iCoverLeft
      iCoverTop = iCoverTop > this.height ? this.height : iCoverTop
      iCoverRight = iCoverRight > this.width ? this.width : iCoverRight
      iCoverBottom = iCoverBottom > this.height ? this.height : iCoverBottom
      if (this.iLastCoverLeft !== iCoverLeft) {
        this.iLastCoverLeft = iCoverLeft
        this.oWebControl.JS_SetWndCover('left', iCoverLeft)
      }
      if (this.iLastCoverTop !== iCoverTop) {
        this.iLastCoverTop = iCoverTop
        this.oWebControl.JS_SetWndCover('top', iCoverTop)
      }
      if (this.iLastCoverRight !== iCoverRight) {
        this.iLastCoverRight = iCoverRight
        this.oWebControl.JS_SetWndCover('right', iCoverRight)
      }
      if (this.iLastCoverBottom !== iCoverBottom) {
        this.iLastCoverBottom = iCoverBottom
        this.oWebControl.JS_SetWndCover('bottom', iCoverBottom)
      }
    },
    destroyVideo () {
      window.removeEventListener('resize', this.cb)
      window.removeEventListener('scroll', this.cb)
      this.macPlayer = null
      this.macVideoUrl = ''
      if (this.oWebControl) {
        this.oWebControl.JS_HideWnd()
        this.oWebControl.JS_Disconnect()
      }
    },
    /** 给控件发送StartPreview事件或StartPlayback事件， 用于处理点击单个channel的情况 */
    playVideo (msg, treeNodeData) {
      return this.oWebControl.JS_RequestInterface(msg)
    }
  }
}
</script>
<style lang="scss">
  video {
    width:calc(100vw - 286px);
    height: calc(100vh - 140px);
  }
  #myPlayer{
    height: calc(100% - 48px);
    display: flex;
    align-items: center;
    justify-content: center;
    object{
      width: 100%;
      embed{
        width:100%;
      }
    }
  }
  .lost-video{
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);

  }
  .lost-video-img {
    display: block;
    margin: 0 auto;
  }
  .lost-video-text {
    text-align: center;
    font-weight: 800;
  }
  .video-switch {
    height: 48px;
    background: #333333;
    display: flex;
    align-items: center;
  }
  .video-switch-tab {
    height: 48px;
    margin: 0 auto;
    transition: transform 0.3s;
    position: relative;
  }
  .video-switch-tab-line {
    position: absolute;
    width: 88px;
    top: 0;
    left: 0;
    height: 3px;
    background-color: #e72528;
    z-index: 1;
    transition: 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  }
  .video-switch-tab-btn {
    font-size: 12px;
    font-weight: 800;
    float: left;
    line-height: 48px;
    color: #fff;
    opacity: 0.6;
    width: 88px;
    box-sizing: content-box;
    text-align: center;
    cursor: pointer;
  }
  .tab-active {
    opacity: 1;
  }
</style>
