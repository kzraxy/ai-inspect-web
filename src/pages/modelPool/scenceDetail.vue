<template>
<div class="scenceDetail">
  <div class="bg_wrap" :style="{'backgroundImage':detailInfo.headerImageUrl.includes('http')?`url(${detailInfo.headerImageUrl})`: 'url(' + `${staticResourceOrigin}/static/userManual/poseidon/assets/img/scence/${detailInfo.headerImageUrl}/headbg.png` + ')'}">
    <div class="head_wrap">
      <div class="main">
        <div class="title">{{detailInfo.solutionName}}</div>
        <el-scrollbar wrap-class="demo-scrollbar-wrap-label">
          <div class="main_label_wrap">
            <div v-for="(industryName,industryIndex) in detailInfo.industry" :key="industryIndex" class="main_lable_tag">{{industryName}}</div>
          </div>
        </el-scrollbar>
        <div class="c_b_content" :title="detailInfo.headerDescription">{{detailInfo.headerDescription}}</div>
        <div class="btn_wrap">
          <div class="btn" @click="bind" style="background: #2080f7;color:#fff;margin-right:20px" v-show="!detailInfo.needCustomization">立即试用</div>
          <div class="btn" @click="consultMore">咨询更多</div>
        </div>
      </div>
    </div>
  </div>
  <div class="content_wrap">
    <div class="cont_title">功能介绍</div>
    <div v-show="!detailInfo.subContents||!detailInfo.subContents.length" class="empty_wrap">暂无数据</div>
    <div class="card_wrap" v-show="detailInfo.subContents&&detailInfo.subContents.length>0">
      <div v-for="(item,index) in detailInfo.subContents" :key="index" class="cont_card" :style="{'width':item.width,'padding':item.padding,'margin-right':item.marginRight}">
        <div class="img_wrap" :style="{'backgroundImage':'url(' + `${staticResourceOrigin}/static/userManual/poseidon/assets/img/modelPool/detail/${item.imageUrl}@2x.png` + ')'}"></div>
        <div class="card_title">{{item.title}}</div>
        <div class="card_des" :title="item.content">{{item.content}}</div>
      </div>
    </div>
    <div class="cont_title">推荐场景</div>
    <div v-show="!detailInfo.typicalScenes||!detailInfo.typicalScenes.length" class="empty_wrap">暂无数据</div>
    <div class="typical_wrap" :style="typicalStyle" v-show="detailInfo.typicalScenes&&detailInfo.typicalScenes.length>0">
      <div class="typ_title">{{currentTypicalInfo.title}}</div>
      <div class="typ_content">{{currentTypicalInfo.content}}</div>
      <div class="typ_condition">
        <div class="typ_condition_title">{{currentTypicalInfo.subTitle}}</div>
        <div class="typ_condition_content">{{currentTypicalInfo.subContent}}</div>
        <div class="typ_condition_devices" v-if="currentTypicalInfo.subDeviceInfo&&currentTypicalInfo.subDeviceInfo.length">
          <div
            class="typ_condition_device"
            v-for="(subDevice, subDeviceIndex) in currentTypicalInfo.subDeviceInfo"
            :key="subDeviceIndex"
          >
            <img :src="subDevice.imageUrl.includes('http')?subDevice.imageUrl:` ${staticResourceOrigin}/static/userManual/poseidon/assets/img/scence/devices/${subDevice.imageUrl}.png`" :alt="subDevice.title" class="typ_condition_device_img">
            <span class="typ_condition_device_text">{{subDevice.title}}</span>
          </div>
        </div>
      </div>
      <div class="right_list_wrap">
        <el-scrollbar wrap-style="height: 100%;overflow-x:hidden;">
          <div @click="changeTypical(index)" :title="item.title"
          :class="{'list_item':true,'active_list':currentTypicalIndex===index}" v-for="(item,index) in detailInfo.typicalScenes" :key="index">
            {{item.title}}
          </div>
        </el-scrollbar>
      </div>
    </div>
    <div class="cont_title">效果展示</div>
    <div v-show="!detailInfo.effectDisplay||!detailInfo.effectDisplay.length" class="empty_wrap">暂无数据</div>
    <div class="results-show" v-show="detailInfo.effectDisplay&&detailInfo.effectDisplay.length>0">
      <div class="results-show-bg results-show-bg1"></div>
      <div class="results-show-bg results-show-bg2"></div>
      <div class="results-show-bg results-show-bg3"></div>
      <div class="results-show-content">
        <h-img-carousel
          class="results-show-carousel"
          ref="carousel"
          theme="transparent"
          :data="detailInfo.effectDisplay"
          :view-data.sync="viewData"
          :current-index.sync="currentIndex"
        >
        </h-img-carousel>
        <h-img-snippets-btn-group theme="light" class="results-show-snippets">
          <h-img-snippets-zoom
            :scale="viewData.ratio"
            @zoom-out="zoomOut"
            @zoom-in="zoomIn"
          />
          <el-button icon="h-icon-arrow_left" :disabled="currentIndex===0" @click="prev"> 上一张 </el-button>
          <el-button icon="h-icon-arrow_right" :disabled="currentIndex===detailInfo.effectDisplay.length-1" @click="next"> 下一张 </el-button>
        </h-img-snippets-btn-group>
      </div>
    </div>
  </div>
  <consultDialog v-model="consultDialogVisible"></consultDialog>
</div>
</template>
<script>
import { getSolutionDetail } from './proxy'
import consultDialog from './modal/consultDialog.vue'
export default {
  name: 'scenceDetail',
  components: {
    consultDialog
  },
  data () {
    return {
      btnLoading: false,
      typicalStyle: {},
      detailInfo: { headerImageUrl: 'default', effectDisplay: [] },
      currentTypicalInfo: {}, // 底部典型场景的当前信息
      currentTypicalIndex: {},
      consultDialogVisible: false,
      viewData: {},
      currentIndex: 0
    }
  },
  computed: {
    solutionId () {
      return this.$route.params.solutionId || ''
    }
  },
  watch: {
    solutionId (val) {
      if (val) {
        this.getDetail()
      }
    }
  },
  mounted () {
    this.getDetail()
  },
  methods: {
    bind() {
      window.open(`${location.origin}${location.pathname}#/intelligent/sceneConfig/editSceneTask?solutionId=${this.detailInfo.id}&publishStatus=PUBLISHED&taskSource=SELF&addType=add&solutionTaskId=`, '_blank')
    },
    zoomIn () {
      this.$refs.carousel.$zoomIn()
    },
    zoomOut () {
      this.$refs.carousel.$zoomOut()
    },
    prev () {
      this.$refs.carousel.$prev()
    },
    next () {
      this.$refs.carousel.$next()
    },
    consultMore () {
      this.consultDialogVisible = true
    },
    getDetail () {
      getSolutionDetail({ solutionId: this.solutionId }).then(res => {
        if (res.code === 0) {
          this.detailInfo = res.data
          this.detailInfo.headerImageUrl = res.data.headerImageUrl ? res.data.headerImageUrl : 'default'
          let splitBig = (this.detailInfo.subContents.length === 1 || this.detailInfo.subContents.length === 2 || this.detailInfo.subContents.length === 4)
          this.detailInfo.subContents.length && this.detailInfo.subContents.forEach((item, index) => {
            item.width = splitBig ? '580px' : '372px'
            item.marginRight = splitBig ? (index % 2 === 0 ? '40px' : '0px') : ((index + 1) % 3 === 0 ? '0px' : '32px')
            if (this.detailInfo.subContents.length === 1) {
              item.width = '100%'
              item.marginRight = '0px'
            }
            item.padding = splitBig ? '0 80px' : '0 20px'
            item.imageUrl = index < 7 ? index + 1 : 'default'
          })
          this.detailInfo.industry = this.detailInfo.industry ? this.detailInfo.industry : ['暂无行业']
          if (this.detailInfo.typicalScenes && this.detailInfo.typicalScenes.length > 0) {
            this.changeTypical(0)
          }
          this.detailInfo.effectDisplay = (this.detailInfo.effectDisplay || []).map(item => {
            return {
              url: item.imageUrl.includes('http') ? item.imageUrl : `${this.staticResourceOrigin}/static/userManual/poseidon/assets/img/scence/effectDisplay/${item.imageUrl}.png`
            }
          })
        }
      })
    },
    changeTypical (index) {
      this.currentTypicalIndex = index
      this.currentTypicalInfo = this.detailInfo.typicalScenes[this.currentTypicalIndex]
      this.typicalStyle.backgroundImage = 
      this.currentTypicalInfo.imageUrl.includes('http') 
      ? `url(${this.currentTypicalInfo.imageUrl})`
      : 'url(' + `${this.staticResourceOrigin}/static/userManual/poseidon/assets/img/scence/typicalScenes/${this.currentTypicalInfo.imageUrl ? this.currentTypicalInfo.imageUrl : 'default'}.png` + ')'
    }
  }
}
</script>
<style lang="scss" scoped>
.scenceDetail {
  .bg_wrap{
    position: relative;
    height: 418px;
    width: 100%;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
  }
  .content_wrap{
    width: 1200px;
    margin: 0 auto 60px;
    .empty_wrap{
      width: 100%;
      height: 240px;
      line-height: 240px;
      text-align: center;
      background: #F5F7F9;
      font-family: MicrosoftYaHeiUI;
      font-size: 14px;
      color: rgba(0,0,0,0.70);
    }
    .typical_wrap{
      width: 100%;
      height: 427px;
      border: 1px solid rgba(0,0,0,0);
      background-repeat: no-repeat;
      background-size: cover;
      background-position: center;
      position: relative;
      .typ_title{
        font-family: MicrosoftYaHeiUISemibold;
        font-size: 24px;
        color: #FFFFFF;
        font-weight: 600;
        width: 580px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-top: 60px;
        margin-left: 60px;
      }
      .typ_content{
        margin-left: 60px;
        width: 580px;
        margin-top: 24px;
        font-size: 14px;
        color: #FFFFFF;
        line-height: 20px;
        font-weight: 400;
        min-height: 40px;
      }
      .typ_condition {
        margin-top: 32px;
        padding-left: 78px;
        &_title {
          display: flex;
          align-items: center;
          font-family: MicrosoftYaHeiUISemibold;
          font-size: 16px;
          color: #FFFFFF;
          letter-spacing: 0;
          font-weight: 600;
          margin-bottom: 8px;
          position: relative;
          &:before {
            position: absolute;
            left: -16px;
            top: 6px;
            content: '';
            display: inline-block;
            width: 8px;
            height: 8px;
            background: #FFFFFF;
            border-radius: 50%;
            margin-right: 8px;
          }
        }
        &_content {
          font-family: MicrosoftYaHeiUISemibold;
          font-size: 14px;
          color: #FFFFFF;
          letter-spacing: 0;
          line-height: 20px;
          font-weight: 600;
          margin-bottom: 30px;
        }
        &_devices {
          display: flex;
          align-items: center;
          .typ_condition_device {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            &+.typ_condition_device {
              margin-left: 70px;
            }
            &_img {
              width: 64px;
              height: 64px;
              margin-bottom: 11px;
            }
            &_text {
              font-family: MicrosoftYaHeiUISemibold;
              font-size: 14px;
              color: #FFFFFF;
              letter-spacing: 0;
              line-height: 20px;
              font-weight: 600;
            }
          }
        }
      }
      .right_list_wrap{
        position: absolute;
        top: 30px;
        right: 30px;
        width: 240px;
        height: 368px;
        background: rgba(0,0,0,0.4);
        border-radius: 4px;
        padding-top: 16px;
        padding-bottom: 16px;
        .list_item{
          width: 100%;
          height: 56px;
          line-height: 56px;
          padding-left: 30px;
          padding-right: 30px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-family: MicrosoftYaHeiUISemibold;
          font-size: 16px;
          color: #FFFFFF;
          font-weight: 600;
          cursor: pointer;
        }
        .active_list{
          background: #2080f7;
        }
      }
    }
    .card_wrap{
      display: flex;
      flex-wrap: wrap;
    }
    .cont_card{
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 10px;
      margin-bottom: 40px;
      height: 200px;
      .img_wrap{
        width: 80px;
        height: 80px;
        background-size: contain;
      }
      .card_title{
        margin-top: 16px;
        font-family: MicrosoftYaHeiUISemibold;
        font-size: 20px;
        color: #000000;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .card_des{
        margin-top: 16px;
        font-family: MicrosoftYaHeiUI;
        font-size: 14px;
        color: rgba(0,0,0,0.70);
        text-align: center;
        line-height: 20px;
        font-weight: 400;
        overflow:hidden;
        text-overflow:ellipsis;
        display:-webkit-box;
        -webkit-box-orient:vertical;
        -webkit-line-clamp:3;
      }
    }
    .cont_title{
      font-family: MicrosoftYaHeiUISemibold;
      font-size: 28px;
      color: #000000;
      text-align: center;
      font-weight: 600;
      margin: 60px 0 32px;
    }
  }
  .head_wrap{
    position: absolute;
    height: 100%;
    width: 100%;
    background-image: linear-gradient(90deg, rgba(0,0,0,0.70) 18%, rgba(0,0,0,0.00) 100%);
    left: 0;
    top: 0;
    .main{
      width:1200px;
      margin: 0 auto;
      padding-top: 86px;
      position: relative;
      .main_label_wrap{
        height: 60px;
        margin-top: 8px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        .main_lable_tag{
          flex-shrink: 0;
          height: 28px;
          border: 1px solid rgba(255,255,255,0.50);
          border-radius: 2px;
          font-size: 12px;
          background: rgba(0,0,0,0.20);
          color: rgba(255,255,255,0.70);
          padding: 5px 8px;
          margin-right: 8px;
          margin-top: 3px;
        }
      }
      .btn_wrap{
        display: flex;
        align-items: center;
        margin-top: 24px;
        .no_use_btn{
          background-image: linear-gradient(90deg, #FFB418 0%, #E47607 100%);
          border-radius: 4px;
          font-family: MicrosoftYaHeiUISemibold;
          font-size: 16px;
          color: #FFFFFF;
          letter-spacing: 0;
          font-weight: 600;
          width: 180px;
          height: 48px;
          line-height: 48px;
          text-align: center;
        }
        .btn{
          width: 140px;
          height: 48px;
          line-height: 48px;
          text-align: center;
          cursor: pointer;
          background: #FFFFFF;
          border-radius: 4px;
          font-family: MicrosoftYaHeiUISemibold;
          font-size: 16px;
          color: rgba(0,0,0,0.70);
          font-weight: 600;
        }
      }
      .c_b_content{
        height: 62px;
        margin-top: 6px;
        width: 100%;
        overflow:hidden;
        text-overflow:ellipsis;
        display:-webkit-box;
        -webkit-box-orient:vertical;
        -webkit-line-clamp:2;
        font-family: MicrosoftYaHeiUISemibold;
        font-size: 20px;
        color: #FFFFFF;
        font-weight: 600;
        line-height: 31px;
      }
      .title{
        font-family: MicrosoftYaHeiUISemibold;
        font-size: 40px;
        color: #FFFFFF;
        height: 42px;
        line-height: 42px;
        font-weight: 600;
        margin-top: 16px;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
  .results-show {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 0;
    height: 579px;
    padding-top: 24px;
    &-bg {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 4px 0 rgba(0,0,0,0.20);
      border-radius: 16px;
      z-index: -1;
    }
    &-bg1 {
      width: 1048px;
      height: 463px;
      background: rgba(248,249,251,0.42);
      border: 1px solid #FFFFFF;
    }
    &-bg2 {
      width: 992px;
      height: 529px;
      background: rgba(248,249,251,0.42);
      border: 1px solid #FFFFFF;
    }
    &-bg3 {
      width: 908px;
      height: 579px;
      background: #F8F9FB;
    }
    ::v-deep .results-show-carousel {
      width: 860px;
      height: 500px;
      .h-img-carousel__wrapper {
        border-radius: 8px;
      }
      .h-img-carousel__prev, .h-img-carousel__next {
        display: none;
      }
    }
    ::v-deep .results-show-snippets {
      height: 32px;
      margin-top: 8px;
      .h-img-snippets-zoom__scale {
        color: rgba(0,0,0,0.7)
      }
    }
  }
}
</style>
