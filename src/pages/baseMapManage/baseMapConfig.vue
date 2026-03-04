<template>
  <div class="baseMapConfig">
    <div class="breadcrumb-mod page-head">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item class="breadcrumb_item1">
          <i class="h-icon-arrow_left" @click="backConfirm" ></i>
          <span @click="backConfirm">底图库</span>
        </el-breadcrumb-item>
        <el-breadcrumb-item class="breadcrumb_item2">{{breadcrumb}}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="hik_video_wrap">
      <div class="left_card">
        <div style="z-index:2000;position:relative;background:#fff;padding-top:12px;padding-bottom:28px">
          <div class="title">{{`预置点底图（${bgImgList.length}/24）`}}</div>
          <div class="sub_title">至少需要4张抓图</div>
          <div class="btn_wrap"><el-button icon="h-icon-screenshot" type="primary" @click="getCardImg(true)" :disabled="captureing">获取抓图</el-button></div>
        </div>
        <div class="list_wrap">
          <el-scrollbar wrap-class="demo-scrollbar-wrap-2">
            <div v-for="(item,index) in bgImgList" :key="index" class="card_item">
              <img v-show="item.picUrl" :src="item.picUrl" >
              <img v-show="!item.picUrl" src="@/assets/img/illustaror_fail_pic.png">
              <div class="time_wrap">{{item.captureStatus==='PROGRESS'?'处理中...':item.captureStatus==='FAIL'?'抓图失败':item.playTime}}</div>
              <div class="operate_btn">
                <!-- 删除图片的pop -->
                <el-popover ref="popover1" v-model="item.delPop" placement="bottom-start" width="180" popper-class="img_btn_pop">
                  <div class="popover-text">
                    <i class="icon iconfont iconicon_remind_16" style="color:#FAAD14;margin-right:6px"></i>是否删除所选抓图？
                  </div>
                  <div class="popover-btn">
                    <el-button size="mini" type="primary" @click="deleteImg(index)">确定</el-button>
                    <el-button size="mini" @click="item.delPop = false">取消</el-button>
                  </div>
                  <div class="card_btn" slot="reference" style="width:94px"><div class="icon_pre h-icon-delete"></div><div>删除图片</div></div>
                </el-popover>
                <!-- 替换图片的pop -->
                <el-popover ref="popover2" v-model="item.replacePop" placement="bottom-end" width="180" popper-class="img_btn_pop">
                  <div class="popover-text">
                    <i class="icon iconfont iconicon_remind_16" style="color:#FAAD14;margin-right:6px"></i>是否替换所选抓图？
                  </div>
                  <div class="popover-btn">
                    <el-button size="mini" type="primary" @click="getCardImg(false,index)">确定</el-button>
                    <el-button size="mini" @click="item.replacePop = false">取消</el-button>
                  </div>
                  <div class="card_btn" slot="reference" style="width:106px"><div class="icon_pre h-icon-update"></div><div>抓图并替换</div></div>
                </el-popover>
              </div>
            </div>
          </el-scrollbar>
        </div>
      </div>
      <div class="right_video">
        <HKVideo id="playWnd" @switchVideo="switchTo" ref="hkvideo" :getMessageCallBack="getMessageCallBack" :author="this.authorArr[1]" :isInit="isVideoInit" @picCaptured="picCaptured">
        </HKVideo>
      </div>
    </div>
    <div class="foot_btn">
      <el-button type="primary" @click="save" style="margin-right:8px" :disabled="saveLoading">保存</el-button>
      <el-popover ref="popoverCancel" v-model="cancelPop" placement="right" width="180" popper-class="img_btn_pop">
        <div style="display:flex;align-items:center;">
          <div class="popover-text">是否确认取消？</div>
          <el-button type="link" size="mini" @click="cancelConfig" :disabled="saveLoading">是</el-button>
          <el-button size="mini" type="text" @click="cancelPop = false" :disabled="saveLoading">否</el-button>
        </div>
        <div slot="reference"><el-button :disabled="saveLoading">取消</el-button></div>
      </el-popover>
    </div>
  </div>
</template>

<script>
import rsaSign from '@/plugin/utils/rsaSign'
import { saveMission, getDeviceValidateCode, getInfoBymissionId } from './proxy'
import HKVideo from '@/components/videoNew/video.vue'
import { getOCXInitInfo } from '@/plugin/utils/ocxUtils'
import { isMac, getDateTime } from '@/plugin/utils/util'
import { getFormatTime } from '@/assets/libs/util'
export default {
  name: 'baseMapConfig',
  components: {
    HKVideo
  },
  data () {
    return {
      isMac: false,
      cancelPop: false,
      bgImgList: [],
      breadcrumb: '底图库详情',
      videoInitJson: { // 视频初始化参数
        funcName: 'Init',
        arguments: {
          // iWndType: 1,
          type: 'chain',
          initModel: 0,
          response: null,
          isSetPos: 0
        }
      },
      getAddImgType: true, // 抓图是新增还是替换
      replaceIndex: null, // 替换抓图的index
      authorArr: [true, true], // 权限数组 arr[0] 视频预览权限 arr[1] 回放权限 true 表示有权限 false 表示无权限
      switchVideo: 0, // 0 为预览 1为回放
      pubkey: null, // 公钥
      isJumpVideo: true,
      captureing: false, // 抓图是否可用
      channelId: null, // 通道Id
      storeId: null, // 门店Id
      channelName: '--', // 通道名称
      storeName: '--', // 门店名称
      picNumber: 0, // 当前图片数量
      missionId: '',
      deviceSerial: '',
      validateCode: '',
      saveLoading: false,
      isVideoInit: false // 视频控件是否初始化完成
    }
  },
  async mounted () {
    // 判断电脑系统版本，当不为windows系统时则显示萤石视频插件
    this.isMac = isMac()
    this.missionId = this.$route.params.id
    this.deviceSerial = this.$route.params.deviceSerial
    await this.getInfoBymissionId()
  },
  methods: {
    save () {
      if (this.bgImgList.length < 4) {
        this.$message.warning('抓图不可少于4张')
        return false
      }
      this.saveLoading = true
      saveMission({ missionId: this.missionId, bgImgList: this.bgImgList }).then(res => {
        this.saveLoading = false
        if (res.code === 0) {
          this.$message.success('保存成功！')
          this.$router.go(-1)
        }
      }).catch(() => { this.saveLoading = false })
    },
    cancelConfig () {
      this.cancelPop = false
      this.$router.go(-1)
    },
    deleteImg (index) {
      this.bgImgList.splice(index, 1)
    },
    getCardImg (isAdd, index) { // isAdd-true是新增抓图，false是替换抓图
      if (isAdd && this.bgImgList.length > 23) {
        this.$message.warning('底图已满，请先删除或直接选择图片进行替换')
        return false
      }
      this.getAddImgType = isAdd
      this.replaceIndex = index
      this.getPicture()
    },
    // 获取任务相关的信息
    async getInfoBymissionId () {
      let { code, data } = await getInfoBymissionId({ missionId: this.missionId })
      if (code === 0) {
        this.bgImgList = []
        data.bgImgList.forEach(item => {
          this.bgImgList.push({
            picId: item.picId,
            picUrl: item.picUrl,
            playTime: item.playTime,
            delPop: false,
            replacePop: false,
            captureStatus: item.captureStatus
          })
        }) // 左侧图片列表
        this.channelId = data.channelId
        this.storeId = data.groupId
        this.monitor = data
        this.breadcrumb = this.monitor.channelName + (this.monitor.presetName ? '-' + this.monitor.presetName : '')
        if (this.isMac) {
          let validateCode = data.validateCode
          if (data.deviceSerial && !data.validateCode) {
            const res = await getDeviceValidateCode({
              deviceSerial: data.deviceSerial,
              publicKeyStr: rsaSign.getPurePubKey()
            })
            if (+res.code === 0 && res.data) {
              validateCode = rsaSign.decodeData(res.data.validateCode)
            }
          }
          data.validateCode = validateCode
          this.$refs.hkvideo.playMacVideo(data)
        }
      }
    },
    // 切换预览和回放模式 0:预览模式 1:回放模式
    switchTo (num) {
      try {
        // 视频初始化未成功或初始化失败的情形，不允许切换视频播放模式
        if (!this.isVideoInit) {
          this.$message.warning('视频控件初始化中，请稍后再试...')
          return
        }
        // 当仅拥有视频预览权限时，用户点击视频回放，提示暂无视频回放权限
        /*      if (num === 1 && !this.authorArr[1]) {
          this.$message.error('暂无视频回放权限')
          return
        } */
        this.switchVideo = num
        if (this.isMac) return
        this.$refs.hkvideo.oWebControl
          .JS_RequestInterface({
            funcName: 'ChangeModel',
            arguments: encodeURI(
              JSON.stringify({
                model: num
              })
            )
          }).then(() => {
            this.isVideoInit = true
            this.openVideo()
          })
      } catch (e) {}
    },
    // 视频控件回调函数
    async getMessageCallBack (oData) {
      this.captureing = false
      if (oData.responseMsg.eventName === 'FireOcxVersion') {
        this.pubkey = oData.responseMsg.arguments.pubkey
        let res = await getOCXInitInfo(oData.responseMsg.arguments, this.deviceSerial)
        this.videoInitJson.arguments['iWndType'] = 1
        this.videoInitJson.arguments.response = res
        this.videoInitJson.arguments = encodeURI(JSON.stringify(this.videoInitJson.arguments))
        // 视频初始化
        this.$refs.hkvideo.oWebControl.JS_RequestInterface(this.videoInitJson).then(async () => {
          let { data } = await getDeviceValidateCode({ deviceSerial: this.deviceSerial, publicKeyStr: this.pubkey })
          this.validateCode = data && data.validateCode
          this.isVideoInit = true
          this.openVideo()
          this.switchTo(0)
        })
        // })
      } else if (oData.responseMsg.eventName === 'FireTransFunction') {
      } else if (oData.responseMsg.eventName === 'FireOcxCapture') {
        if (oData.responseMsg.arguments) {
          // 对数据模型进行处理
          this.captureing = false
          let args = oData.responseMsg.arguments || {}
          args.playTime = getDateTime(args.playTime * 1000)
          if (args.picUrl) {
            this.updateCardList(args)
          } else {
            this.$message.warning('抓图失败，请重新抓图！')
          }
        }
      } else if (oData.responseMsg.eventName === 'PlayChannelChanged') {
        if (!oData.responseMsg.arguments.channelId) { return false }
      }
    },
    // 打开视频
    openVideo () {
      try {
        this.monitor.isEncrypt = 1
        this.monitor.validateCode = this.validateCode
        this.$refs.hkvideo.oWebControl
          .JS_RequestInterface({
            funcName: this.switchVideo === 0 ? 'StartPreview' : 'StartPlayback',
            arguments: encodeURI(
              JSON.stringify({
                response: {
                  code: 0,
                  message: null,
                  data: this.monitor
                }
              })
            )
          })
      } catch (e) {}
    },
    startMultiPreview () {
      this.$refs.hkvideo.oWebControl.JS_RequestInterface({
        funcName: 'StartMultiPreview',
        arguments: encodeURI(
          JSON.stringify({
            // groupId: params.groupId,
            storeId: this.storeId
          })
        )
      }).then(() => {})
    },
    updateCardList (args) {
      let value = {
        picUrl: args.picUrl,
        playTime: getFormatTime(new Date()),
        // playTime: args.playTime,
        delPop: false,
        replacePop: false,
        captureStatus: 'SUCCESS'
      }
      if (this.getAddImgType) {
        value.picId = ''
        this.bgImgList.unshift(value)
      } else {
        value.picId = this.bgImgList[this.replaceIndex].picId
        this.bgImgList.splice(this.replaceIndex, 1, value)
      }
    },
    picCaptured(args) {
      if(args.picUrl) {
        this.updateCardList(args)
      }
      this.captureing = false
    },
    // 抓图
    async getPicture () {
      try {
        if (this.captureing) {
          this.$message.warning('正在抓图，请稍后')
          return
        }
        let numberMap = { picNumber: this.bgImgList.length }
        if (this.channelId === 'null') {
          this.$message.warning('请选择有视频的窗口进行抓图')
          return
        }
        this.picNumber = numberMap.picNumber || 0
        // 执行抓图操作
        if (this.isMac) { // mac情形
          const params = {
            storeId: this.storeId, // 门店Id
            channelId: this.channelId // 通道Id
          }
          this.captureing = true

          this.$refs.hkvideo.$refs.uikitVideo.capturePicture({})

          // this.captureing = false
        } else { // 其他浏览器情形
          const provider = new STSProvider()
          const data = await provider.getCredentials({ bizCode: '080101' })
          if (+code === 0) {
            data.captureMode = 1
            this.$refs.hkvideo.oWebControl
              .JS_RequestInterface({
                funcName: 'CaptureJPG',
                arguments: {
                  response: {
                    code: 0,
                    message: null,
                    data: data
                  }
                }
              }).then(() => {
                // 抓图过程中打开遮罩层
                this.captureing = true
              })
          }
        }
      } catch (e) {
        this.captureing = false
      }
    },
    backConfirm () {
      this.$router.go(-1)
    }
  }
}
</script>

<style lang="scss">
.img_btn_pop{
  padding: 0;
  .popover-text{
    display:flex;
    align-items:center;
    padding: 12px;
  }
  .popover-btn{
    text-align: right;
    margin: 0px;
    padding: 0 22px 12px 0;
    button{
      padding: 0 8px;
    }
  }
}
.baseMapConfig{
  .demo-scrollbar-wrap-2 {
    max-height: 100%;
  }
  .el-scrollbar__wrap{
    overflow-x: hidden;
  }
  .page-head{
    border-bottom:1px solid #D8D8D8;
    padding: 10px 10px;
    font-size: 16px;
    z-index: 2000;
    background: #fff;
    position: relative;
    .el-breadcrumb{
      display: flex;
      align-items: center;
      .breadcrumb_item1{
        display: flex;
        align-items: center;
        .el-breadcrumb__item__inner{
          display: flex;
          align-items: center;
          cursor: pointer;
          :hover{
            color: #2080f7;
          }
          i{
            padding-right: 10px;
            font-size: 18px;
          }
        }
      }
      .breadcrumb_item2{
        display: flex;
        align-items: center;
      }
    }
  }
}
</style>
<style lang="scss" scoped>
.hik_video_wrap{
  height: calc(100vh - 146px);
  // height: calc(100vh - 136px);
  width: 100%;
  display: flex;
  .left_card{
    width: 240px;
    .list_wrap{
      width: 100%;
      height: calc(100% - 146px);
      .card_item{
        width: 200px;
        height: 152px;
        margin-bottom: 12px;
        margin-left: 24px;
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        .operate_btn{
          width: 100%;
          height: 32px;
          display: flex;
          align-items: center;
          .card_btn{
            display: flex;
            align-items: center;
            justify-content: center;
            background: #000000;
            color: rgba(255,255,255,0.7);
            height: 32px;
            cursor: pointer;
            &:hover{
              color:#FFFFFF;
            }
            .icon_pre{
              font-size: 22px;
              margin-left: -4px
            }
          }
        }
        img{
          width: 100%;
          height: 120px;
        }
        .time_wrap{
          position: absolute;
          top: 0;
          left: 0;
          width: 140px;
          height: 24px;
          line-height: 24px;
          opacity: 0.7;
          background: #000000;
          font-size: 14px;
          color: #FFFFFF;
          padding-left: 8px;
        }
      }
    }
    .title{
      font-size: 14px;
      color: rgba(0,0,0,0.90);
      height: 20px;
      line-height: 20px;
      margin: 0px 20px 4px;
    }
    .sub_title{
      font-size: 12px;
      color: rgba(0,0,0,0.40);
      height: 18px;
      line-height: 18px;
      margin: 0 20px
    }
    .btn_wrap{
      margin-top: 28px;
      text-align: center;
      button{
        width: 125px;
      }
    }
  }
  .right_video{
    width: calc(100% - 240px);
    height: 100%;
  }
}
.foot_btn{
  height: 56px;
  background: #FFFFFF;
  box-shadow: 0 -3px 4px 0 rgba(0,0,0,0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
