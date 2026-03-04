<template>
  <div class="ai_tips_wrap" v-if="aiModalVisible">
    <div class="ai_full_modal"></div>
    <div class="ai_tips_modal">
      <i class="h-icon-close close_ico" @click="close"></i>
      <div class="left">
        <div class="left_bg"></div>
        <div class="title">{{title}}</div>
        <div class="text">{{subTitle}}</div>
        <div class="list" :style="{'margin-top':leftListMarginTop}">
          <div v-for="(item,index) in contentList" :key="index" :class="{'left_list_item':true,'active_left_item':index===activeIndex}" @click="clickLeftItem(index)">
            <img :src="index===activeIndex?item.activeIcon:item.icon">
            <div class="li_text">{{item.name}}</div>
          </div>
        </div>
      </div>
      <div class="right" :style="{'background-image':'url('+activeItem.bg+')'}">
        <div class="fill"></div>
        <div class="right_title">{{activeItem.name}}</div>
        <!-- <slot name="content" v-if="$slots.content"></slot> -->
        <div class="right_text">
          <div v-for="(item, index) in activeItem.content">{{item}}</div>
        </div>
        <!-- <div class="right_text" v-show="activeIndex===0">
          <div>请先进入企业中心，申请试用或购买服务。</div>
          <div>您可在企业中心查看您的企业信息，购买与使用用量等情况。</div>
          <div>也可联系海康销售人员下单。</div>
        </div>
        <div class="right_text" v-show="activeIndex===1">如您的算法需搭配海康设备使用，请在此添加设备。进入<b>我的服务-设备管理</b>，您可在此管理设备（需打开调试模式），也可通过接口进行添加与管理。</div>
        <div class="right_text" v-show="activeIndex===2">
          <div>进入<b>我的服务-智能分析</b>，进行算法模型同步、部署、智能分析任务的创建与规则配置，分析结果查看。</div>
          <div>如需了解更多，请查看用户手册（<a href="https://www.hik-cloud.com/static/userManual/intelligentAnalysis/index.html" target="_blank">https://www.hik-cloud.com/static/userManual/intelligentAnalysis/index.html</a>）</div>
        </div>
        <div class="right_text" v-show="activeIndex===3">
          <div>当您需要进行对接和调试时，进入<b>我的服务-密钥管理</b>，获取client_id、client_secret进行对接，也可使用AccessToken进行调试。同时，请按需控制消息通道权限，打开您所需接收的事件的消息开关。</div>
        </div> -->
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    contentListProp: {
      type: Array,
      default: () => []
    },
    leftListMarginTop: {
      type: String,
      default: '48px'
    },
    title: {
      type: String,
      default: '引导'
    },
    subTitle: {
      type: String,
      default: '首先，让我们一起来了解一下吧'
    },
    timePoint: {
      type: Number,
      default: 5000
    },
  },
  watch: {
    aiModalVisible (val) {
      if (!val) {
        this.clearLeftItemsTimeInterval()
      }
    }
  },
  data () {
    return {
      leftItemsTimeInterval: null,
      aiModalVisible: false,
      activeIndex: 0,
      activeItem: {}
    }
  },
  computed: {
    contentList () {
      return this.contentListProp
    }
  },
  methods: {
    clickLeftItem (index) {
      this.clearLeftItemsTimeInterval()
      this.activeIndex = index
      this.changeListItem()
      this.setLeftItemsTimeInterval()
    },
    changeListItem () {
      this.activeItem = this.contentList[this.activeIndex]
    },
    init () {
      this.clearLeftItemsTimeInterval()
      this.aiModalVisible =true
      this.activeItem = this.contentList[0]
      this.setLeftItemsTimeInterval()
    },
    setLeftItemsTimeInterval () {
      if (this.contentList.length <= 1) {
        return false
      }
      this.leftItemsTimeInterval = setInterval(() => {
        if (this.activeIndex < this.contentList.length - 1) {
          this.activeIndex ++
        } else {
          this.activeIndex = 0
        }
        this.changeListItem()
      }, +this.timePoint)
    },
    clearLeftItemsTimeInterval () {
      this.leftItemsTimeInterval && clearInterval(this.leftItemsTimeInterval)
      this.leftItemsTimeInterval = null
    },
    close () {
      this.aiModalVisible = false
      this.$emit('closeGuideModal')
    }
  }
}
</script>
<style lang="scss" scoped>
  .ai_full_modal {
  position: fixed;
  width: 100vw;
  height: 100vh;
  z-index: 2022;
  top: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.32);
}
.ai_tips_wrap{
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
.ai_tips_modal{
  position: fixed;
  top: 30%;
  width: 680px;
  height: 400px;
  background: #fff;
  z-index: 2024;
  border-radius: 12px;
  display: flex;
  align-items: center;
  .close_ico{
    position: absolute;
    right: 12px;
    top: 12px;
    color: #8C99B4;
    cursor: pointer;
    font-size: 20px
  }
  .left{
    width: 240px;
    height: 100%;
    border-radius: 12px 0 0 12px;
    .list{
      // margin-top: 48px;
      margin-left: 24px;
      .left_list_item{
        cursor: pointer;
        width: 200px;
        height: 40px;
        margin-top: 8px;
        display: flex;
        align-items: center;
        img{
          width: 40px;
          height: 40px;
        }
        .li_text{
          margin-left: 14px;
          font-family: MicrosoftYaHeiUI;
          font-size: 12px;
          color: rgba(0,0,0,0.70);
          text-align: left;
        }
        &:hover{
          background: rgba(51,149,255,0.04);
        }
      }
      .active_left_item{
        background: rgba(51,149,255,0.04);
        .li_text{
          color: #3395FF;
        }
      }
    }
    .left_bg{
      position: absolute;
      width: 275px;
      height: 461px;
      left: -35px;
      bottom: 0;
      background: url('~@/assets/img/bg/leftbg.png') no-repeat;
      background-size: contain;
      z-index: -1
    }
    .text{
      font-family: MicrosoftYaHeiUI;
      margin-left: 24px;
      margin-right: 54px;
      font-size: 12px;
      color: rgba(0,0,0,0.90);
      line-height: 20px;
      margin-top: 8px;
      text-align: left
    }
    .title{
      margin-left: 24px;
      font-family: MicrosoftYaHeiUISemibold;
      font-size: 16px;
      color: #000000;
      letter-spacing: 0.15px;
      text-align: left;
      height: 24px;
      line-height: 24px;
      font-weight: 600;
      margin-top: 32px
    }
  }
  .right{
    width: 440px;
    height: 100%;
    background-repeat: no-repeat;
    background-size: contain;
    border-radius: 0 12px 12px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    .fill{
      width: 340px;
      height: 204px;
      margin-top: 44px;
    }
    .right_title{
      width: 340px;
      font-family: MicrosoftYaHeiUISemibold;
      font-size: 14px;
      color: rgba(0,0,0,0.90);
      height: 24px;
      line-height: 24px;
      font-weight: 600;
      margin-top: 24px;
      text-align: left
    }
    .right_text{
      width: 340px;
      font-family: MicrosoftYaHeiUI;
      font-size: 12px;
      color: rgba(0,0,0,0.70);
      text-align: left;
      line-height: 20px;
      margin-top: 4px;
    }
  }
}
</style>
