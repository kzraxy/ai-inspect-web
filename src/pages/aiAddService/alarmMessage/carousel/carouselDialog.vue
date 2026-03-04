<template>
  <el-dialog
    id="HKCarouselDialog"
    :title="title"
    :visible="visible"
    :close-on-click-modal=false
    :area='[624, 600]'
    :before-close="handleClose">
    <div id="HKCarouselDialogBody">
      <drawImage
        ref="imgCanvas"
        :models="['zoom', 'drag', 'download', 'ruleSwitch', 'drawSwitch']"
        :imgList='pics'
        :storeName="videoData.storeName"
        width="600"
        height="350"
        :currentSelectIndex.sync="selectIndex"
      ></drawImage>
    </div>
    <span slot="footer" class="dialog-footer">
        <el-button v-if="showWatchVideoBtn" type="primary" @click="watchVideo">查看视频</el-button>
        <el-button @click="handleClose">关闭</el-button>
      </span>
  </el-dialog>
</template>
<script>
  import drawImage from '@/components/checkImageDraw/imageDraw'
  import {getVideoAuthor, isIE} from '@/plugin/utils/util'
  export default {
    name: 'HKCarouselDialog', // 智能分析图片展示对话框
    components: {
      drawImage,
    },
    props: {
      visible: { // 显示状态
        type: Boolean,
        default: false
      },
      showWatchVideoBtn: {
        type: Boolean,
        default: false
      },
      title: {
        type: String,
        default: '智能分析图片'
      },
    },
    computed: {
      // 整个缩略图容器的宽度
      timeWrapWidth: function () {
        return this.pics.length * this.imgWidth
      }
    },
    data () {
      return {
        pics: [], // 图片列表
        videoData: {
          channelId: null, // 通道Id
          channelName: null, // 通道名称
          channelNo: null, // 通道号
          devType: null, // 设备类型
          deviceSerial: null, // 设备序列号
          endTime: '', // 结束时间
          startTime: '', // 起始时间
          storeId: '', // 门店Id
          storeName: null // 门店名称
        },
        selectIndex: 0,
        authorArr: [] // 判断是否具有录像回放与视频权限
      }
    },
    async mounted () {
      this.authorArr = getVideoAuthor()
    },
    methods: {
      // 刷新数据
      refreshData (map) {
        this.pics = map.pics || []
        this.selectIndex = 0
        this.videoData.channelId = map.channelId || null
        this.videoData.channelName = map.channelName || null
        this.videoData.channelNo = map.channelNo || null
        this.videoData.devType = map.devType || null
        this.videoData.deviceSerial = map.deviceSerial || null
        this.videoData.endTime = map.endTime || null
        this.videoData.startTime = map.startTime || null
        this.videoData.storeId = map.storeId || null
        this.videoData.storeName = map.storeName || null
      },
      // 查看视频 - 直接跳转到视频页面
      watchVideo () {
        if (!this.authorArr[0]) {
          this.$message.warning('无录像查看权限，请联系管理员')
          return
        }
        if (!this.authorArr[1]) {
          this.$message.warning('无录像回放权限，请联系管理员')
          return
        }
        localStorage.setItem('videoData', JSON.stringify(this.videoData))
        if (isIE()) {
          window.open('./index.html#/video/scene?videoData=1', this.videoData.startTime)
        } else {
          window.open('./index.html#/video/scene?videoData=1', this.videoData.startTime, 'noopener')
        }
      },
      handleClose () { // 关闭对话框
        this.$emit('update:visible', false)
      }
    }
  }
</script>
