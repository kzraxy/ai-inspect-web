<template>
  <div class="model_pool_detail">
    <el-scrollbar wrap-class="demo-scrollbar-wrap">
      <div class="bg_wrap" :style="{'backgroundImage':'url(' + `${staticResourceOrigin}/static/userManual/poseidon/assets/img/modelPool/${detailInfo.headerImageUrl}/headbg.jpg` + ')'}">
        <div class="head_wrap">
          <div class="main">
            <div class="c_tag_wrap" v-show="detailInfo.headLabelInfo&&detailInfo.headLabelInfo.length>0">
              <div v-for="(labelItem,labelIndex) in detailInfo.headLabelInfo" :key="labelIndex" class="tag">
                <div v-show="labelItem.length<4" class="normalTag">{{labelItem}}</div>
                <div v-show="labelItem.length===4" class="muchNorTag"><div>{{labelItem.substr(0,2)}}</div><div>{{labelItem.substr(2,2)}}</div></div>
              </div>
              <div v-show="detailInfo.supportAutoLearning!==0" class="tag selfTag"></div>
            </div>
            <div class="head_bottom_wrap">
              <div v-for="(botItem,botIndex) in detailInfo.platformTypeNames" :key="botIndex" class="bot_tag"
                v-show="detailInfo.platformTypeNames&&detailInfo.platformTypeNames.length>0">{{botItem}}</div>
            </div>
            <div class="title">{{detailInfo.abilityName}}</div>
            <el-scrollbar wrap-class="demo-scrollbar-wrap-label">
              <div class="main_label_wrap">
                <div v-for="(mainLabelItem,mainLabelIndex) in detailInfo.labelInfo" :key="mainLabelIndex" class="main_lable_tag">{{mainLabelItem.labelName}}</div>
              </div>
            </el-scrollbar>
            <div class="c_b_content" :title="detailInfo.description">{{detailInfo.description}}</div>
            <div class="btn_wrap">
              <div class="btn" v-show="detailInfo.avaliable" @click="bind()" :disabled="btnLoading">立即使用</div>
              <div class="no_use_btn" v-show="!detailInfo.avaliable">暂未上线敬请期待</div>
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
        <div class="cont_title">典型场景</div>
        <div v-show="!detailInfo.typicalScenes||!detailInfo.typicalScenes.length" class="empty_wrap">暂无数据</div>
        <div class="typical_wrap" :style="typicalStyle" v-show="detailInfo.typicalScenes&&detailInfo.typicalScenes.length>0">
          <div class="typ_title">{{currentTypicalInfo.title}}</div>
          <div class="typ_content">{{currentTypicalInfo.content}}</div>
          <div class="right_list_wrap">
            <el-scrollbar wrap-class="right_demo-scrollbar-wrap">
              <div @click="changeTypical(index)" :title="item.mainTitle"
              :class="{'list_item':true,'active_list':currentTypicalIndex===index}" v-for="(item,index) in detailInfo.typicalScenes" :key="index">
                {{item.mainTitle}}
              </div>
            </el-scrollbar>
          </div>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>
<script>
import { details, bindModel } from '../proxy'
export default {
  name: 'modelPoolDetail',
  data () {
    return {
      btnLoading: false,
      typicalStyle: {},
      domainId: '',
      detailInfo: { headerImageUrl: 'default' },
      currentTypicalInfo: {}, // 底部典型场景的当前信息
      currentTypicalIndex: {}
    }
  },
  mounted () {
    this.domainId = this.$route.params.domainId || ''
    this.getDetail()
  },
  methods: {
    bind () {
      this.btnLoading = true
      bindModel({ domainId: this.detailInfo.id }).then(res => {
        this.btnLoading = false
        if (res.code === 0) {
          this.$message.success('操作成功！')
        }
      }).catch(() => { this.btnLoading = false })
    },
    getDetail () {
      details({ domainId: this.domainId }).then(res => {
        if (res.code === 0) {
          this.detailInfo = res.data
          this.detailInfo.headerImageUrl = res.data.headerImageUrl ? res.data.headerImageUrl : 'default'
          this.detailInfo.headLabelInfo = this.handleHeadLabel(this.detailInfo.algorithmType)
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
          if (this.detailInfo.algorithmType === 3 && this.detailInfo.labelInfo) { // 混合算法时，如果有第二层labelInfo，展示第二层，没有则展示第一层labelInfo
            let arr = []
            this.detailInfo.labelInfo.forEach(citem => {
              if (!citem.labelInfo) {
                arr.push(citem)
              } else {
                citem.labelInfo.forEach(val => {
                  arr.push(val)
                })
              }
              this.detailInfo.labelInfo = arr
            })
          }
          this.detailInfo.labelInfo = this.detailInfo.labelInfo ? this.detailInfo.labelInfo : [{ labelName: '暂无标签' }]
          if (this.detailInfo.typicalScenes && this.detailInfo.typicalScenes.length > 0) {
            this.changeTypical(0)
          }
        }
      })
    },
    changeTypical (index) {
      this.currentTypicalIndex = index
      this.currentTypicalInfo = this.detailInfo.typicalScenes[this.currentTypicalIndex]
      this.typicalStyle.backgroundImage = 'url(' + `${this.staticResourceOrigin}/static/userManual/poseidon/assets/img/modelPool/detail/typical/${this.currentTypicalInfo.imageUrl ? this.currentTypicalInfo.imageUrl : 'default'}.jpg` + ')'
    },
    handleHeadLabel (algorithmType) {
      let obj = { 1: '分类', 2: '检测', 3: '混合', 4: 'OCR', 25: 'OCR', 34: '编排', 55: '多模态' }
      return [obj[algorithmType]]
    }
  }
}
</script>
<style lang="scss">
.model_pool_detail{
  .right_demo-scrollbar-wrap{
    height: 330px;
    overflow-x: hidden;
  }
  .demo-scrollbar-wrap-label{
    height: 84px;
    .el-scrollbar__view{
      display: flex;
      align-items: center;
      flex-wrap: wrap;
    }
  }
}
</style>
<style lang="scss" scoped>
.model_pool_detail{
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
      position: relative;
      .main_label_wrap{
        height: 60px;
        margin-top: 4px;
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
          background: #2080f7;
          border-radius: 4px;
          font-family: MicrosoftYaHeiUISemibold;
          font-size: 16px;
          color: #FFFFFF;
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
      .head_bottom_wrap{
        width: 100%;
        height: 28px;
        margin-top: 40px;
        display: flex;
        align-items: center;
        .bot_tag{
          height: 28px;
          padding: 5px 8px;
          opacity: 0.6;
          background: #000000;
          border-radius: 14px;
          font-size: 12px;
          color: #FFFFFF;
          margin-right: 8px;
        }
      }
      .c_tag_wrap{
        width: 100%;
        height: 40px;
        display: flex;
        align-items: center;
        .tag{
          // width: 50px;
          height: 40px;
          margin-right: 8px;
          display: flex;
          justify-content: center;
          color:#fff;
          flex-wrap: wrap;
          font-size: 14px;
        }
        .normalTag{
          padding: 0 6px;
          width: 100%;
          height: 100%;
          background: url(../../../assets/img/jiance.png) no-repeat;
          background-size: 100% 100%;
          padding-top: 8px;
          text-align: center;
        }
        .muchNorTag{
          padding: 0 6px;
          width: 100%;
          height: 100%;
          font-size: 12px;
          padding-top: 1px;
          background: url(../../../assets/img/jiance.png) no-repeat;
          background-size: contain;
          text-align: center;
        }
        .selfTag{
          background: url(../../../assets/img/zizhu.png) no-repeat;
          background-size: contain;
        }
      }
    }
  }
}
</style>
