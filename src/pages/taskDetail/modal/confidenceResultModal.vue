
<template>
  <el-dialog title="结果查看" :visible="visible" @close="close" :area="[1080,660]" :close-on-click-model="false" custom-class="confidenceResultModal">
    <div>
      <el-date-picker v-model="timeRange" type="datetimerange" :default-time="['00:00:00', '23:59:59']" :clearable="false" :picker-options="pickerOptions" 
        @change="dateChange" style="width:320px"/>
    </div>
    <div class="modal_channel-mod" v-if="channelList.length > 0">
      <div class="channel-left" v-loading="loading">
        <ul>
          <li v-for="(item, index) in channelList" :key="index" @click="displayCaptureDetail(item, index)" :class="{'active': index=== currentCaptureIndex}">
            <p class="channel-image">
              <img class="small_img" :src='item.pictureUrlSmall' v-show="item.pictureUrlSmall"/>
              <div class="small_img" v-show="!item.pictureUrlSmall"></div>
            </p>
            <div class="text">
              <p class="channel-name">{{item.channelName}}</p>
              <p class="channel-time">{{item.captureTime}}</p>
            </div>
          </li>
        </ul>
        <div class="el-demo1__wrap">
          <div class="bigdata-pagination">
            <el-pagination
              @current-change="channelCurrentChange"
              :current-page="searchForm.pageNo"
              :page-size="searchForm.pageSize"
              :total="channelTotalNum"
              layout="total, prev, next">
            </el-pagination>
            <div style="line-height:28px;">
              {{searchForm.pageNo}} / {{Math.ceil(channelTotalNum / searchForm.pageSize) || 1}} 页
            </div>
          </div>
        </div>
      </div>
      <div class="image-diaplay-mod-outer">
        <div class="image-diaplay-mod">
          <div class="image-diaplay-mod-wrap">
            <div class="monitor-view-operator">
              <div class="channelNameWrap">
                <p class="view-operator_store_name" :title="displayPic.groupName">{{applicationSceneName}}名称：{{displayPic.groupName}}</p>
                <p class="view-operator_store_name" :title="displayPic.channelName">通道：{{displayPic.channelName}}</p>
                <p class="view-operator_store_name" v-show="displayPic.presetName" :title="displayPic.presetName">预置点：{{displayPic.presetName}}</p>
              </div>
            </div>
            <div class="image-mod" style="width: 720px;">
              <el-button type="iconButton" icon="h-icon-angle_left" class="image-left image-btn" :disabled="searchForm.pageNo===1 && currentCaptureIndex==0" @click="changImage('prev')"></el-button>
              <el-button type="iconButton" icon="h-icon-angle_right" class="image-right image-btn" :disabled="searchForm.pageNo===channelTotalPage && currentCaptureIndex==channelList.length-1" @click="changImage('next')"></el-button>
              <div class="canvas-mod" v-if="displayPic.pictureUrl">
                <areaImage ref="areaImage" :width='720' :height='410' :url='displayPic.pictureUrlSmall' :calibrationList='calibrations' :operationTypeList="['edit']">
                </areaImage>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="!channelList || !channelList.length" class="empty-data">
      <div class="empty-data-img">暂无数据</div>
    </div>
  </el-dialog>
</template>
<script>
import mixin from '../mixin'
import areaImage from '@/components/areaImage'
import { getDisplayPicNewInfo, searchTaskDetail } from '../proxy'
import { day, today, setFormatDate } from '@/plugin/utils/util'
import { getFormatTime } from '@/assets/libs/util'
export default {
  components: { areaImage },
  mixins: [mixin],
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    algorithmVersionType: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      timeRange: [setFormatDate(new Date(), 'yyyy-MM-dd 00:00:00'), setFormatDate(new Date(), 'yyyy-MM-dd 23:59:59')],
      loading: false,
      displayLabel: true,
      channelList: [],
      channelTotalPage: 0, // 通道总页数
      channelTotalNum: 0, // 通道总数量
      currentCaptureIndex: 0,
      displayPic: {},
      calibrations: [],
      searchForm: {
        algorithmId: '', // 当前选择的算法版本id
        ruleId: '', // 规则id
        taskId: '', // 规则id
        channelName: '',
        labelLineId: '',
        pageSize: 7,
        pageNo: 1,
        pageType: 'default',
        timeStamp: '',
        rowKey: '',
        confidenceId: ''
      },
      confidenceId: '',
      areaSelectLabel: [],
      displayDetectionArea: true,
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() >= today + day
        },
        customValidation: (start, end) => {
          var moreLength = end.getTime() - 7 * 24 * 60 * 60 * 1000 <= start.getTime()
          return moreLength
        },
        customPrompt: '最长不能超过7天'
      }
    }
  },
  watch: {
    visible (val) {
      if (val) {
        this.currentCaptureIndex = 0
        window.addEventListener('keydown', this.handleKeyDown)
      } else {
        this.resetList()
        window.removeEventListener('keydown', this.handleKeyDown)
      }
    }
  },
  computed: {
    isSplitMask() { // 是否语义分割
      return this.algorithmVersionType === 'SEMANTIC_SEG'
    }
  },
  methods: {
    handleKeyDown(e) {
      let _key = window.event.keyCode
      if (_key === 37) {
        this.changImage('prev')
      } else if (_key === 39) {
        this.changImage('next')
      }
    },
    resetList() {
      this.channelList = []
      this.channelTotalPage = 0
      this.channelTotalNum = 0
      this.currentCaptureIndex = 0
      this.displayPic = {}
      this.calibrations = []
      this.searchForm.pageNo = 1
    },
    dateChange() {
      this.resetList()
      this.getChannelList()
    },
    init(row) {
      this.searchForm.confidenceId = row.confidenceId
      this.searchForm.taskId = row.taskId
      this.searchForm.ruleId = row.ruleId
      this.timeRange = [row.startTime, row.endTime]
      this.getChannelList()
    },
    async getChannelList () {
      let info
      let temp
      this.searchForm.startTime = getFormatTime(this.timeRange[0])
      this.searchForm.endTime = getFormatTime(this.timeRange[1])
      let { code, data } = await searchTaskDetail(this.searchForm)
      if (code === 0) {
        data.rows.forEach((item) => {
          item.pictureUrlSmall = item.pictureUrl ? (item.pictureUrl + '&process=image/resize,limit_0,m_lfit,w_60,h_60/quality,q_100') : ''
          item.labels = []
          info = []
          item.results = item.results || []
          item.results.forEach((obj) => {
            temp = {}
            temp.labelName = obj.labelName
            temp.labelCount = obj.detectCount
            temp.labelLineId = obj.labelLineId
            temp.splitMappingLabel = `${obj.labelLineId} ${obj.labelName}`
            item.labels.push(temp)
          })

          info = info.concat(item.drawResults)
          // 处理polygon绘制区域的数据
          let tempArr = item.polygonDetails.map(_ => {
            return {
              type: '',
              regionColor: _.color,
              region: _.polygons
            }
          })
          info = info.concat(tempArr)
          item.oldDrawInfo = info
        })
        this.channelList = data.rows || []
        this.channelTotalNum = data.total
        this.channelTotalPage = data.totalPage
        if (this.channelList.length > 0) {
          this.displayPic = this.channelList.length > 0 ? this.channelList[0] : {}
          this.getDisplayPicNewInfo()
        }
      }
    },
    // 展示抓图详情
    displayCaptureDetail (item, index) {
      this.currentCaptureIndex = index
      this.displayPic = item
      this.deviceSerial = item.deviceSerial
      this.getDisplayPicNewInfo() // 每次切换时，获取图片最新的一些信息
    },
    async getDisplayPicNewInfo () { // 获取最新的当前选中的图片的一些最新信息
      if(!this.displayPic || !this.displayPic.rowKey) {
        return false
      }
      this.loading = true
      let res = await getDisplayPicNewInfo({ rowKey: this.displayPic.rowKey })
      if(res.code === 0) {
        let item = { ...this.displayPic, ...res.data }
        let areas = []
        if (!this.isSplitMask) {
          areas = this.getAllArea(item).areas // 重新渲染标签
        } else { // 语义分割算法
          if (item.maskInfo && item.maskInfo.maskData) {
            let mappingLabels = item.labels.map(l => l.splitMappingLabel)
            item.mapping = [{"labels": mappingLabels}]
            item.results = [{maskInfo: {...item.maskInfo}}] // 包一层results，和研究院的参数格式一致
            areas = await this.verifyFile(item)
          }
        }
        await this.getPolygon(areas, item, 'polygon') // 渲染外层绘制框
        item.info = areas
        this.displayPic = { ...item }
        this.setCalibrations('all')
        this.loading = false
      }
    },
    setCalibrations(selectLabelAll) {
      this.calibrations = []
      if (this.displayPic && this.displayPic.info) {
        if (this.isSplitMask) { // 分割算法，像素渲染，所以之前的坐标那一套用不了，单独走分支吧
          let originInfo = this.displayPic.info.map(val => {
            return {...val}
          })
          if (!this.displayDetectionArea) { // 不展示检测区域
            originInfo = originInfo.filter(ori => ori.id.indexOf('polygon_') < 0)
          }
          if (this.areaSelectLabel.length || selectLabelAll) {//  选中了识别结果的标签，或点击全部（selectLabelAll：all<全部>标签选中，none<全部>标签置灰）
            let filterArr = []
            if (selectLabelAll === 'all') { // <全部>标签选中
              filterArr = originInfo
            } else if (selectLabelAll === 'none') { // <全部>标签置灰
              filterArr = originInfo.filter(ori => !ori.labelList || !ori.labelList.length)
            } else {
              let splitMappingLabel = this.displayPic.labels.map(l => l.splitMappingLabel)
              let splitMappingLabelObj = {}
              splitMappingLabel.forEach(s => {
                let handle = s.split(' ')
                splitMappingLabelObj[handle[0]] = handle[1]
              })
              let areaSelectLabelNames = []
              Object.keys(splitMappingLabelObj).forEach(key => {
                if (this.areaSelectLabel.includes(key)) {
                  areaSelectLabelNames.push(splitMappingLabelObj[key])
                }
              })
              filterArr = originInfo.filter(item => {
                return !item.labelList || !item.labelList.length || areaSelectLabelNames.includes(item.labelList[0].text)
              })
            }
            originInfo = filterArr
          }
          if (!this.displayLabel) { // 不展示标签
            originInfo.forEach(ori => {
              ori.labelList = []
            })
          }
          this.calibrations = originInfo
        } else {
          let newArr = this.showAllRecognition ? JSON.parse(JSON.stringify(this.currentAllDrawResults)) : JSON.parse(JSON.stringify(this.displayPic.info))
          //  选中了标签
          if (this.areaSelectLabel.length) {
            if (this.displayDetectionArea) { // 展示检测区域
              this.calibrations = this.filterArea(newArr, this.areaSelectLabel, true, this.displayLabel)
              return false
            } else {
            //  不需要展示识别区域
              newArr = newArr.filter(item => item.id.indexOf('polygon_') < 0) //v1.8.2，删除识别区域的数据，id带有标识polygon_的
              this.calibrations = this.filterArea(newArr, this.areaSelectLabel, false, this.displayLabel)
              return false
            }
          }
          //  没有选中标签
          if (this.displayDetectionArea) { // 展示检测区域
            this.calibrations = this.filterLabel(newArr, true, this.displayLabel)
            return false
          }
          //  不需要展示识别区域
          newArr = newArr.filter(item => item.id.indexOf('polygon_') < 0)//v1.8.2，删除识别区域的数据，id带有标识polygon_的
          this.calibrations = this.filterLabel(newArr, false, this.displayLabel)
        } 
      }
    },
    channelCurrentChange (currentPage, oldPage) {
      if (this.setPageParams) {
        this.searchForm.pageType = 'default'
        this.searchForm.rowKey = ''
        this.searchForm.timeStamp = ''
        this.searchForm.pageNo = 1
      } else {
        if ((currentPage > this.searchForm.pageNo && currentPage < this.channelTotalPage) || (currentPage === this.searchForm.pageNo && currentPage > oldPage)) {
          this.searchForm.pageType = 'next'
          this.searchForm.rowKey = this.channelList[this.channelList.length - 1].rowKey
          this.searchForm.timeStamp = this.channelList[this.channelList.length - 1].timeStamp
          this.currentCaptureIndex = 0
        } else if ((currentPage < this.searchForm.pageNo && currentPage !== 1) || (currentPage === this.searchForm.pageNo && currentPage < oldPage)) {
          this.searchForm.pageType = 'prev'
          this.searchForm.rowKey = this.channelList[0].rowKey
          this.searchForm.timeStamp = this.channelList[0].timeStamp
        } else if (currentPage === this.channelTotalPage) {
          this.searchForm.pageType = 'last'
          this.searchForm.rowKey = ''
          this.searchForm.timeStamp = ''
          this.currentCaptureIndex = 0
        } else {
          this.searchForm.pageType = 'default'
          this.searchForm.rowKey = ''
          this.searchForm.timeStamp = ''
        }
        this.searchForm.pageNo = currentPage
      }
      this.getChannelList()
    },
    async changImage (type) {
      if (this.loading) {
        return false
      }
      if (type === 'prev') {
        if (this.searchForm.pageNo === 1 && this.currentCaptureIndex === 0) {
          this.$message.info('已经是第一张图片了')
          return false
        }
        if (this.currentCaptureIndex > 0) {
          this.currentCaptureIndex--
          this.displayPic = this.channelList[this.currentCaptureIndex]
        } else {
          // 获取前一页数据
          this.currentCaptureIndex = this.searchForm.pageSize - 1
          this.searchForm.pageNo--
        }
      } else {
        if (this.searchForm.pageNo === this.channelTotalPage && this.currentCaptureIndex === this.channelList.length - 1) {
          this.$message.info('已经是最后一张图片了')
          return false
        }
        if (this.currentCaptureIndex < this.channelList.length - 1) {
          this.currentCaptureIndex++
          this.displayPic = this.channelList[this.currentCaptureIndex]
        } else {
          // 获取后一页数据
          this.currentCaptureIndex = 0
          this.searchForm.pageNo++
        }
      }
      await this.getDisplayPicNewInfo()
    },
    close () {
      this.$emit('update:visible', false)
    }
  }
}
</script>
<style lang="scss">
.confidenceResultModal{
  .el-demo1__wrap {
    height: 47px;
    width: 100%;
    position: absolute;
    bottom: 0;
    left: 0;
  }
  .bigdata-pagination{
    display: flex;
    position: absolute;
    left:2px;
    top:10px;
    font-size:12px;
    width: 100%;
    justify-content: space-between;
    padding: 0 14px 0 8px;
    .el-pagination__total{
      margin: 0
    }
    button{
      margin:0!important
    }
  }
}
</style>
<style lang="scss" scoped>
.empty-data{
  display: flex;
  align-items: center;
  justify-content: center;
  .empty-data-img{
    width: 300px;
    height: 500px;
    line-height: 500px;
    background: url(../../../assets/img/no_data.png) no-repeat;
    background-position:50% 20%;
    font-size: 16px;
    color: #B2B2B2;
    text-align: center;
  }
}
.modal_channel-mod{
  display: flex;
  overflow-x: auto;
  margin-top: 18px;
  .channel-left{
    position: relative;
    border-right: 1px solid #dedede;
    width: 220px;
    padding: 10px;
    box-sizing: content-box;
    height: 520px;
    ul{
      margin-bottom: 40px;
      li{
        width: 210px;
        height: 60px;
        border: 1px solid #dedede;
        margin-bottom: 10px;
        position: relative;
        display: flex;
        cursor: pointer;
        .channel-image{
          width: 60px;
          background: #dedede;
          .small_img{
            width: 60px;
            height: 56px;
          }
        }
        div.text{
          flex: 1;
          padding: 5px 0 0 10px;
          p{
            line-height: 25px;
            text-align: left;
            &.channel-time{
              font-size: 12px;
            }
            &.channel-name{
              font-weight: bold;
              width: 120px;
              overflow: hidden;
              text-overflow:ellipsis;
              white-space: nowrap;
            }
          }
        }
        &.active{
          border: 2px solid rgba(52,139,255,0.90);
        }
      }
    }
    .pagePart{
      width: 100%;
      border-top: none;
      height: 40px;
    }
  }
  .image-diaplay-mod-outer{
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .image-diaplay-mod{
    flex: 1;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    width: calc(100%);
    .image-diaplay-mod-wrap{
      width: 800px;
      padding: 0 16px;
      .monitor-view-operator{
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 16px;
        color: rgba(0,0,0,0.70);
        .channelNameWrap{
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          margin-left: 20px
        }
        .operator_right{
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-around;
        }
        .switch_wrap{
          display: flex;
          align-items: center;
        }
        .view-operator_display-detection-area{
          margin-left: 16px;
          span{
            margin-right: 2px;
          }
        }
        .view-operator_store_name{
          max-width:100%;
          overflow: hidden;
          text-overflow:ellipsis;
          white-space: nowrap;
        }
      }
    }
    .play_ocx_btn{
      color: #fff;
      border-radius: 2px;
      text-align: right;
      .play_ocx_btn_wrap{
        cursor: pointer;
        width: 100px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: space-around;
        padding:0 6px;
        border: 1px solid rgba(0, 0, 0, 0.12);
        &:hover{
          background: #E9E9E9;
        }
        i{
          width: 20px;
          height: 20px;
        }
      }
    }
    ul.btn {
      margin: 10px auto;
      width: 128px;
      height: 32px;
      line-height: 32px;
      border-radius: 30px;
      border: 1px solid rgba(0,0,0,0.40);
      li{
        cursor: pointer;
        float: left;
        width: 63px;
        &:first-child{
          border-right: 2px solid rgba(30,127,255,0.90);
          border-top-left-radius: 30px;
          border-bottom-left-radius: 30px;
        }
        &:last-child{
          border-top-right-radius: 30px;
          border-bottom-right-radius: 30px;
        }
        &.active{
          color: #fff;
          background: rgba(30,127,255,0.90);
        }
      }
    }
    .misreport{
      text-align: right;
      width: 100%;
      margin-top: -8px;
      padding-right: 4px;
      font-size:14px;
      height: 14px;
      color: red;
    }
    .image-mod{
      margin: 0 auto;
      position: relative;
      .image-btn{
        background: rgba(0,0,0,0.5);
        position: absolute;
        top: 40%;
        width: 30px;
        height: 60px;
        border-radius: 2px;
        color: #fff;
        z-index: 101;
      }
      .image-left{
        left: -32px;
      }
      .image-right{
        right: -32px
      }
      div.canvas-mod{
        display: block;
        width: 100%;
        height: 410px;
        background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAOpQTFRF3uLr3+Lr4OLs4OLt4OPs4eTu4uXv4ubv4+Tv4+bw4+fw5Ofw5Ofx5efx5efy5ejx5ejy5ujy5unx5urx5+nx5+ny5+rx5+ry5+rz5+vy5+vz6Ony6Ory6Orz6Or06Ovz6er06evz6ev06ez06e306e316uz06uz16u306+z16+316+326+727O727O737O/27O/37e737e/37e/47fD47u/47vD47vD57vH57/H47/H57/L47/L57/L68PH48PL58PP68fL58fP68fT68fT78vP78vT68vT78vT88vX88/T78/T88/X78/X8OaXg6gAAAQ5JREFUOMvdk1tTwjAQhesVsaIoqcFLrG2VKFAsLQ2CFzBStl72//8dE5hxpqXVd/KSzcyXMydnNwb+s4w1BeA9oOdQBsDgzj7zuxv1tACAEWfEe1SX+YDVVoDYo3Y8WdbHAOZBHjD4r9Kk6hJvF7JA37yI9C5jp2mePMOM5RTcAK1ozC2LC7gRiGE7B1Tjh6vN/aFUZUrmiK1RFki2aVfOG0LXU/qNQCELpNe+xk5DXKq/uflnftkdTTR6iEypB73VoJi2lVgCyUwdXgqSdBYEub9VUVx+FPViQXzutRCf7MJmAdU+6JHATr+km8oHUEmHTVkCpMx/bUO4dVg6MODsVMwaH/8xUX6UrOHH+QG6PRrtQZgWogAAAABJRU5ErkJggg==')
      }
    }
  }
}
</style>
