<template>
  <el-dialog custom-class="simulateVerifyModal" title="模拟验证" :visible="visible":area="[830,686]" @close="close">
    <div class="wrap">
      <div class="left">
        <div class="title">监控点列表</div>
        <AreaTreeSelect needStore @onSelect='getClickData' style="width:176px" :panelWidth="190" v-if="visible" :isOnlyChooseLeaf="true"></AreaTreeSelect>
        <div class="channel_list">
          <el-scrollbar wrap-class="demo-scrollbar-wrap-2">
            <div v-for="(item,index) in channelList" :key="index" @click="clickChannelCard(index)">
              <div :class="{'card': true, 'active_card': currentCardIndex === index}">
                <div class="line">
                  <div class="jiankongdian"></div>
                  <div class="chan_name ellipsis" :title="item.channelName">{{ item.channelName }}</div>
                </div>
                <div class="line">
                  <div class="pre-text">所属</div>
                  <div class="split"></div>
                  <div class="name ellipsis" :title="item.groupName">{{ item.groupName }}</div>
                </div>
              </div>
            </div>
            <div class="empty" v-show="!channelList.length">
              <img src="@/assets/img/common/empty.png">
              <div class="txt">暂无点位</div>
              <div>请重新选择{{ applicationSceneName }}</div>
            </div>
          </el-scrollbar>
        </div>
      </div>
      <div class="middle">
        <div class="video_wrap" v-if="visible">
          <HKVideo id="playWnd" :fakeMacShow="true" ref="hkvideo" :isInit="true" @picCaptured="picCaptured" ></HKVideo>
        </div>
        <div class="oper_wrap">
          <div class="o_left">测试图片（{{ bgImgList.length }}）</div>
          <div class="o_right">
            <el-button icon="h-icon-capture" plain @click="getVidioImg" :disabled="captureing || !currentLeftCard.channelId">抓图</el-button>
            <el-button icon="h-icon-upload" plain :disabled="captureing" @click="imgUpload">上传图片</el-button>
          </div>
        </div>
        <div class="img_cards">
          <el-scrollbar wrap-class="demo-scrollbar-wrap-3">
            <div class="img_list_wrap">
              <div v-for="(item,index) in bgImgList" :key="index" class="card_item">
                <img v-show="item.picUrl" :src="item.picUrl" @mouseenter="mouseHover(index, true)"  @mouseleave="mouseHover(index, false)">
                <img v-show="!item.picUrl" src="@/assets/img/illustaror_fail_pic.png">
                <div class="time">{{ getFormatTime(item.createTime) }}</div>
                <div class="img_btns" v-show="item.btnShow" @mouseenter="mouseHover(index, true)"  @mouseleave="mouseHover(index, false)">
                  <div class="btn text_btn" @click="preview(item)">查看</div>
                  <div class="btn text_btn" style="margin-left: 4px;margin-right: 4px;" @click="submitAlgorithmTest(item)">模拟</div>
                  <div class="icon h-icon-download btn" style="width: 32px;font-size: 18px;margin-right: 4px;" @click="downloadImg(item)" title="下载"></div>
                  <div class="icon h-icon-delete btn" style="width: 32px;font-size: 18px;" @click="deleteImg(item)" title="删除"></div>
                </div>
              </div>
              <div class="img_empty" v-show="!bgImgList.length"><img src="@/assets/img/scene/empty1.png"></div>
            </div>
          </el-scrollbar>
        </div>
      </div>
      <imgUploadModal :visible.sync="imgUploadModalVisible" @uploadFinish="uploadFinish"></imgUploadModal>
      <h-img-preview ref="single" :data="[currentImg.picUrl]" :visible.sync="single" mask-closable />
    </div>
  </el-dialog>
</template>
<script>
import imgUploadModal from './imgUploadModal'
import { getFormatTime } from '@/assets/libs/util'
import rsaSign from '@/plugin/utils/rsaSign'
import HKVideo from '@/components/videoNew/video.vue'
import { getMonitors, getDeviceValidateCode, saveCaptureImage, getCaptureImageList, deleteCaptureImage, solutionApi, customizedApi } from './proxy'
import AreaTreeSelect from '@/components/areaTreeSelect/areaTreeSelect'
export default {
  components: {
    AreaTreeSelect, HKVideo, imgUploadModal
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    cardInfo: {
      type: Object,
      default () {
        return {
        }
      }
    }
  },
  data () {
    return {
      single: false,
      imgUploadModalVisible: false,
      currentCardIndex: null,
      channelList: [],
      currentLeftCard: {},
      bgImgList: [],
      currentImg: {},
      captureing: false, // 抓图是否可用
      validateCode: '',
      dobounceTime: false
    }
  },
  watch: {
    visible (val) {
      if (!val) {
        this.currentCardIndex = null
        this.channelList = []
        this.bgImgList = []
        this.currentLeftCard = {}
      } else {
        this.getImgList()
      }
    }
  },
  methods: {
    mouseHover(index, flag) {
      this.$set(this.bgImgList, index, { ...this.bgImgList[index], btnShow: flag })
    },
    getFormatTime(t) {
      return getFormatTime(t)
    },
    preview(item) {
      if(!item.picUrl) {
        this.$message.info('无效的图片')
        return false
      }
      this.currentImg = item
      this.single = true
    },
    imgUpload () {
      this.imgUploadModalVisible = true
    },
    async getLeftList (node) {
      this.channelList = []
      let res = await getMonitors({...node, pageSize: 999, pageNo: 1, taskType: 'DCT4', modelTypeEnum: 'DETECT', taskAnalysisMode: 'CLOUD_POLLING_SNAP'})
      if(res.code === 0 && res.data.rows && res.data.rows.length) {
        this.channelList = res.data.rows || []
        this.clickChannelCard(0)
      }
    },
    async clickChannelCard(index) {
      this.currentCardIndex = index
      this.currentLeftCard = this.channelList[this.currentCardIndex]
      this.getImgList()
      let data = { ...this.currentLeftCard }
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
    },
    async getImgList() {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // 补零
      const day = String(date.getDate()).padStart(2, '0'); // 补零
      let res = await getCaptureImageList({taskId: this.cardInfo.solutionTaskId, pageNo: 1, pageSize: 9999, startTime: `${year}-${month}-${day}`, endTime: `${year}-${month}-${day}` })
      if(res.code === 0) {
        this.bgImgList = res.data.rows || []
        this.bgImgList.forEach(item => item.btnShow = false)
      }
    },
    getClickData(node)  {
      this.getLeftList(node)
    },
    async addImgList (args) {
      let value = {
        taskId: this.cardInfo.solutionTaskId,
        channelId: this.currentLeftCard.channelId,
        picUrl: args.picUrl
        // createTime: getFormatTime(new Date())
      }
      this.captureing = true
      let res = await saveCaptureImage(value)
      this.captureing = false
      if(res.code === 0) {
        this.getImgList()
      }
    },
    async submitAlgorithmTest (item) {
      if(this.dobounceTime) {
        this.$message.warning('请勿频繁操作！')
        return false
      }
      this.dobounceTime = true
      setTimeout(() => {
        this.dobounceTime = false
      }, 1000)
      this.captureing = true
      let customizedTask = this.cardInfo.taskFrom === 'customized' // 'customized'定制任务，'solution'场景任务
      let proxy = customizedTask ? customizedApi : solutionApi
      let params = customizedTask 
      ? {taskId: this.cardInfo.taskId, urls: [item.picUrl]}
      : {solutionTaskId: this.cardInfo.solutionTaskId, channelId: this.currentLeftCard.channelId, picUrl: item.picUrl}
      let res = await proxy(params)
      this.captureing = false
      if(res.code === 0) {
        this.$message.success('模拟成功!')
        this.getImgList()
      } else if ([70010093, 70010094, 70010095].includes(res.code)) {
        this.$message.error(res.message)
      }
    },
    async deleteImg (item) {
      this.captureing = true
      let res = await deleteCaptureImage({id: item.testImageId})
      this.captureing = false
      if(res.code === 0) {
        this.$message.success('删除成功!')
        this.getImgList()
      }
    },
    downloadImg(item) {
      let url = item.picUrl + `?response-content-type=application%2Foctet-stream&response-content-disposition=attachment;`
      window.open(url)
    },
    picCaptured(args) { // 抓图
      if(args.picUrl) {
        this.addImgList(args)
      }
      this.captureing = false
    },
    async uploadFinish(uploadUrl) { // 上传图片
      let args = {
        picUrl: uploadUrl
      }
      this.addImgList(args)
      this.captureing = false
    },
    // 抓图
    async getPicture () {
      try {
        if (this.captureing) {
          this.$message.warning('正在抓图，请稍后')
          return
        }
        if (this.currentLeftCard.channelId === 'null') {
          this.$message.warning('请选择有视频的窗口进行抓图')
          return
        }
        // 执行抓图操作
        this.captureing = true
        this.$refs.hkvideo.$refs.uikitVideo.capturePicture({})
      } catch (e) {
        this.captureing = false
      }
    },
    getVidioImg () { 
      this.getPicture()
    },
    close () {
      this.$emit('update:visible', false)
    }
  }
}
</script>
<style lang="scss" scoped>
.wrap {
  width: 100%;
  display: flex;
  .middle{
    width: 606px;
    display: flex;
    flex-direction: column;
    .oper_wrap{
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      .o_left{
        color: rgba(0,0,0,0.90);
      }
    }
    .img_cards{
      height: 190px;
    }
    .img_list_wrap{
      display: flex;
      flex-wrap: wrap;
      .card_item{
        margin-right: 12px;
        margin-bottom: 12px;
        position: relative;
        img{
          width: 194px;
          height: 108px;
        }
        .time{
          height: 20px;
          margin-top: 4px;
          color: rgba(0,0,0,0.70);
        }
        .img_btns{
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute;
          top: 42px;
          left: 10px;
          .text_btn{
            width: 49px;
          }
          .btn{
            text-align: center;
            height: 24px;
            line-height: 24px;
            opacity: 0.6;
            background: #000000;
            border-radius: 12px;
            cursor: pointer;
            color: #FFFFFF;
            font-size: 12px;
          }
        }
      }
      .card_item:nth-child(3n) {
        margin-right: 0;
      }
      .img_empty{
        width: 100%;
        text-align: center;
        img{
          height: 180px;
        }
      }
    }
    .video_wrap{
      width: 600px;
      height: 380px;
    }
  }
  .left{
    width: 192px;
    .title{
      color: rgba(0,0,0,0.90);
      font-weight: 600;
      margin-top:16px;
      margin-bottom:12px
    }
    .channel_list{
      .card{
        width: 176px;
        height: 62px;
        border-radius: 4px;
        cursor: pointer;
        padding: 10px 9px 0;
        margin-top: 8px;
        &:hover{
          background: rgba(0,0,0,0.02);
        }
        .line{
          display: flex;
          align-items: center;
          margin-bottom: 2px;
        }
        .pre-text{
          font-size: 12px;
          color: rgba(0,0,0,0.40);
        }
        .split{
          width: 1px;
          height: 10px;
          background: #E2E3E6;
          margin: 0 6px;
        }
        .name{
          width: 118px;
        }
        .chan_name{
          width: 123px;
          color: rgba(0,0,0,0.90);
        }
        .jiankongdian{
          width: 24px;
          height: 24px;
          background: url(../../assets/img/common/channel.png) no-repeat;
          background-size: cover;
          margin-right: 8px;
        }
      }
      .active_card{
        background: rgba(27,88,244,0.04);
        .chan_name{
          color: rgba(30,127,255,0.90);
        }
      }
    }
    .empty{
      color: #ccc;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding-right: 16px;
      img{
        width:92px;
        height: 83px;
        margin-top: 160px;
      }
      .txt{
        margin: 16px 0 8px
      }
    }
  }
}
</style>
<style lang="scss">
.simulateVerifyModal{
  .channel_list{
    height: 540px;
    .demo-scrollbar-wrap-2{
      height: 540px;
      overflow-x: hidden;
    }
  }
  .demo-scrollbar-wrap-3{
    max-height: 190px;
    overflow-x: hidden;
  }
  .el-button.is-icon-text{
    padding-left: 8px;
    padding-right: 12px;
  }
  .el-dialog__header {
    height: 56px;
    border-radius: 8px 8px 0 0;
    .el-dialog__title {
      line-height: 56px;
      font-size: 16px;
      color: rgba(0,0,0,0.90);
      letter-spacing: 0.15px;
      text-align: left;
      font-weight: 600;
      padding-left: 24px;
    }
    .el-dialog__headerbtn {
      right: 24px;
      top: 10px;
    }
  }
  .el-dialog__body {
    padding: 0;
    height: 626px!important;
    .el-dialog__body-wrapper {
      padding: 0 16px;
    }
  }
}
</style>
