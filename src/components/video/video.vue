<template>
  <div>
    <div v-if="macShow" class="macVideo-container">
      <video id="myPlayer" poster="" controls playsInline webkit-playsinline autoplay>
        <source :src="macVideoUrl" type="application/x-mpegURL" />
      </video>
      <!-- <slot name="bottom"></slot> -->
    </div>
    <div v-else>
      <div v-show="!isVideoShow" class="lost-video">
        <img :src="needVideo" alt="视频缺失" class="lost-video-img">
        <p class="lost-video-text">视频插件加载失败</p>
        <p class="lost-video-text">若视频未正常打开，请点击此处<el-button type="link" @click="download">下载</el-button>并安装，并重启浏览器（推荐使用Chrome、IE11及以上版本）</p>
        <p class="lost-video-text">若已经安装过插件，请点击<el-button type="text" @click="wakeUp">唤醒</el-button>启动程序，并刷新当前页面。</p>
      </div>
      <div v-show="isVideoShow" style="position:relative">
      <!-- <div style="position:relative;display: flex;flex-direction: column;" v-show="isVideoShow"> -->
        <!-- <div class="video-switch">
          <div class="video-switch-tab">
            <div class="video-switch-tab-line" :style="switchLineStyle"></div>
            <div class="video-switch-tab-btn" v-if="isActive" @click="switchTo(0)" :class="{'tab-active':(switchVideo===0?true : false )}">实时预览</div>
            <div class="video-switch-tab-btn" @click="switchTo(1)" :class="{'tab-active':(switchVideo===1?true : false )}">录像回放</div>
          </div>
        </div> -->
        <!-- <slot name="top"></slot> -->
        <div :id="id" :style="{height:height+'px',width:width+'px'}"></div>
        <!-- <slot name="bottom"></slot> -->
      </div>
    </div>

  </div>
</template>
<script>
import {
  WebControlInit,
  WebControlDistory,
  getLastestVersion
} from './index.js'
import needVideo from '@/assets/img/video/needVideo.svg'
// import { globalBus } from './globalBus'
import _ from 'lodash'
export default {
  data () {
    return {
      needVideo: needVideo,
      macPlayer: null,
      macVideoUrl: '', // 萤石控件视频播放地址
      isVideoShow: true, // 视频控件是否显示  初始化失败显示控件缺失，隐藏视频相关元素
      switchVideo: 1, // 0实时预览 1录像回放
      oWebControl: null, // 视频插件实例对象
      iLastCoverLeft: 0,
      iLastCoverTop: 0,
      iLastCoverRight: 0,
      iLastCoverBottom: 0,
      isupDate: true
    }
  },
  watch: {
    macVideoUrl (val) {
      if (this.macPlayer) {
        this.macPlayer.changeSource(val)// 当url变化时改变播放资源数据，如果不执行changeSource则不会播放新的视频
      }
    }
  },
  props: {
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
    height: {
      type: Number,
      default: 600
    },
    width: {
      type: Number,
      default: 1000
    },
    getMessageCallBack: {
      type: Function,
      required: true
    },
    macShow: {
      type: Boolean,
      default: false // 如果操作系统为mac时则显示萤石视频插件
    }
  },
  created () {
    let self = this
    this.globalBus.$on('cutVideo', (obj) => {
      self.cutVideo(obj.top, obj.left, obj.width, obj.height)
    })
    this.globalBus.$on('repairVideo', (obj) => {
      self.repairVideo(obj.top, obj.left, obj.width, obj.height)
    })
  },
  mounted: function () {
    let self = this

    // if (this.macShow) {
    //   this.macPlayer = new EZUIPlayer('myPlayer')
    //   this.macPlayer.on('error', function () {})
    //   this.macPlayer.on('play', function () {})
    //   this.macPlayer.on('pause', function () {})
    // } else {
    window.addEventListener('resize', () => {
      if (self.oWebControl != null) {
        self.debounce()()
      }
    })
    window.addEventListener('scroll', () => {
      if (self.oWebControl != null) {
        self.debounce()()
      }
    })

    this.oWebControl = WebControlInit(
      self.id,
      cbConnectSuccess,
      cbConnectError,
      cbConnectClose
    )
    // }

    // 版本号的比较
    function compareVersion (currentVersion, lowestVersion) {
      let current = currentVersion.split('.')
      let lowest = lowestVersion.split('.')
      let res = false
      for (var i = 0; i < current.length; i++) {
        if (parseInt(current[i]) > parseInt(lowest[i]) || (parseInt(current[i]) === parseInt(lowest[i]) && i === current.length - 1)) {
          res = true
          break
        } else if (parseInt(current[i]) < parseInt(lowest[i])) {
          res = false
          break
        }
      }
      return res
    }

    // 设置窗口回调
    function cbIntegrationCallBack (oData) {
      self.getMessageCallBack(oData)
      if (oData.responseMsg.eventName === 'FireOcxVersion') {
        // 获取exe 程序版本号
        getLastestVersion().then(res => {
          // res = {'code': 0, 'message': null, 'data': [{'type': 4, 'version': 'V2.1.1', 'versionDate': '2019-05-15', 'versionInfo': null, 'forceFlag': false}], 'success': true}
          let exeVersion = oData.responseMsg.arguments.version
          let lastestVersiton = (res.data && res.data[0] && res.data[0].version) || ''
          self.$store.commit('changePubkey', oData.responseMsg.arguments.pubkey)
          // 暂时将版本校验去掉
          // if (exeVersion !== lastestVersiton) {
          //   self.cutVideo()
          //   let updateText = '视频插件已更新，请下载安装并重启浏览器(推荐使用Chrome、IE11及以上版本)'
          //   let confirmButtonText = '立即更新'
          //   let cancelButtonText = ' 忽视此版本'
          //   let isUpdate = true
          //   if (res.data && res.data[0] && res.data[0].forceFlag) {
          //   // 强制更新
          //     updateText = '视频插件已更新，请下载安装并重启浏览器(推荐使用Chrome、IE11及以上版本)，否则将影响使用'
          //     confirmButtonText = '立即更新'
          //     // cancelButtonText = '取消'
          //     this.isupDate = false
          //     isUpdate = false
          //   }
          //   self.$confirm(updateText, '提示', {
          //     confirmButtonText,
          //     cancelButtonText,
          //     showCancelButton: isUpdate,
          //     closeOnClickModal: true,
          //     type: 'question'
          //   }).then(() => {
          //     const path = process.env.LOCAL_HOST
          //     if (path === 'https://pb.hik-cloud.com') {
          //       window.open('https://pbpic.hik-cloud.com/chain/download/cloudViewSetup.exe')
          //     } else if (path === 'https://www.hik-cloud.com') {
          //       window.open('https://pic.hik-cloud.com/chain/download/cloudViewSetup.exe')
          //     } else {
          //       window.open('http://hikvision.oss-cn-hangzhou.aliyuncs.com/chain/download/cloudViewSetup.exe')
          //     }
          //     self.repairVideo()
          //   }).catch(() => {
          //     self.$message({
          //       type: 'info',
          //       message: '已取消下载'
          //     })
          //     self.repairVideo()
          //   })
          // }
        })
      }
    }

    function cbConnectSuccess () {
      // 设置窗口控制回调
      self.oWebControl.JS_SetWindowControlCallback({
        cbIntegrationCallBack: cbIntegrationCallBack
      })
      self.oWebControl
        .JS_StartService('window', {
          dllPath: self.dllPath
        })
        .then(function () {
          self.oWebControl
            .JS_CreateWnd(self.id, self.width, self.height)
            .then(function () {})
        })
    }

    function cbConnectError () {
      self.oWebControl = null
      self.isVideoShow = false
    }

    function cbConnectClose (bNormalClose) {
      // 连接异常断开：bNormalClose = false
      // JS_Disconnect正常断开：bNormalClose = true
      self.oWebControl = null
    }

    window.onunload = () => {
      self.oWebControl.JS_HideWnd()
    }
  },
  methods: {
    debounce () {
      let width = this.width
      let height = this.height
      let self = this
      function setVideoSize () {
        self.oWebControl.JS_Resize(width, height)
      }
      return _.debounce(setVideoSize, 300)
    },
    download () {
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
    // switchTo: _.throttle(function (num) {
    //   this.switchVideo = num
    //   this.$emit('switchVideo', num)
    // }, 3000),
    switchTo: _.throttle(function () {
      this.switchVideo = 1
    }, 3000),
    wakeUp () {
      WebControl.JS_WakeUp('HikCloudViewPlugin://')
    },
    // 切割视频
    cutVideo (top = 0, left = 0, width = this.width, height = this.height) {
      this.oWebControl.JS_CuttingPartWindow(left, top, width, height)
    },
    // 还原视频
    repairVideo (top = 0, left = 0, width = this.width, height = this.height) {
      this.oWebControl.JS_RepairPartWindow(left, top, width, height)
    },
    // 设置窗口遮挡
    setWndCover () {
      var $ = function (dom) {
        return document.querySelector(dom)
      }
      var iWidth = document.documentElement.clientWidth
      var iHeight = window.innerHeight
      var oDivRect = $('#' + this.id).getBoundingClientRect()
      var iCoverLeft = oDivRect.left < 0 ? Math.abs(oDivRect.left) : 0
      var iCoverTop = oDivRect.top < 0 ? Math.abs(oDivRect.top) : 0
      var iCoverRight =
          oDivRect.right - iWidth > 0 ? Math.round(oDivRect.right - iWidth) : 0
      var iCoverBottom =
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
    destroy () {
      WebControlDistory(this.oWebControl)
      window.onscroll = null
      window.onresize = null
      this.macPlayer = null
      this.macVideoUrl = ''
      window.onunload = null
    }
  },
  components: {},
  computed: {
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
  beforeDestroy () {
    this.destroy()
  }
}
</script>
<style lang="scss">
  video {
    width:calc(100vw - 286px);
    height: calc(100vh - 188px);
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
