<template>
  <div class="agreeAuth">
    <div class="mask"></div>
    <!-- <div class="mask spec_mask" v-show="specialMask"></div> -->
    <div class="content">
      <div class="main_wrap">
        <div class="main">
          <div class="refuse_btn" @click="showRefuseModal">拒绝邀请</div>
          <guideModal ref="guideModalRef" :isNeedMask="false" class="refuse_guide"
            placement="bottom-end" title="错过这些权益很可惜" subTitle="接受后，将会有针对性地提升算法准确率，并推出对您更有帮助的新产品和新服务。"
            left="50px" top="50px">
            <template #footRight>
              <div class="top_btns">
                <span class="nextBtn" @click="notAgree">坚持拒绝</span>
                <span class="nextBtn" @click="confirm" @mouseenter="mouseHover(true)" @mouseleave="mouseHover(false)">同意邀请</span>
              </div>
            </template>
          </guideModal>
          <div class="argee_text">
            <div>已经阅读并同意</div>
            <div class="link" @click="openAgree">计划协议</div>
          </div>
          <div class="save_btn" @click="confirm" @mouseenter="mouseHover(true)" @mouseleave="mouseHover(false)"></div>
          <div class="hover_right_top" v-show="specialMask"></div>
          <div class="hover_left_bottom" v-show="specialMask"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { agreeAuth } from '@/api/layout'
import guideModal from '@/components/guide/simpleMain.vue'
export default {
  components: {
    guideModal
  },
  data () {
    return {
      specialMask: false
    }
  },
  methods: {
    openAgree() {
      let host = (window.location.host === 'www.hik-cloud.com' || window.location.href.indexOf('hilaicloud.com') > -1) ? 'www.hik-cloud.com' : 'pb.hik-cloud.com'
      window.open(`${window.location.protocol}//${host}/AI-inspect/algorithmPlan.html`)
    },
    mouseHover(flag) {
      this.specialMask = flag
    },
    notAgree() {
      this.agreeAuthApi(2)
      this.$emit('closeAgreeAuthModal')
    },
    showRefuseModal() {
      this.$refs.guideModalRef.renderGuide()
    },
    async confirm () {
      await this.agreeAuthApi(1)
      await this.$message.success('接受成功')
    },
    async agreeAuthApi(status) {
      await agreeAuth({authStatus: status})
      this.$emit('closeAgreeAuthModal')
    }
  }
}
</script>

<style scoped lang="scss">
.agreeAuth{
  width: 100vw;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 3000;
  .mask{
    width: 100vw;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    background: rgba(0,0,0,.4);
    z-index: 1;
  }
  .top_btns{
    display: flex;
    align-items: center;
  }
  .nextBtn{
    width: 66px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 6px;
    cursor: pointer;
    &:hover{
      background: rgba(0,0,0,0.08);
      border: 1px solid #FFFFFF;
      border-radius: 4px;
    }
  }
  // .spec_mask{
  //   width: 940px;
  //   height: 670px;
  //   background: url(../../../assets/img/login/hover_bg.png) no-repeat;
  //   border: 1px solid red;
  // }
  .content{
    position: relative;
    display: flex;
    width:100%;
    height: 100%;
    align-items: center;
    justify-content: center;
    z-index: 9;
    .main{
      width: 720px;
      height: 440px;
      background: url(../../../assets/img/login/auth.png) no-repeat;
      background-size: 100% 100%;
      position: relative;
      .hover_right_top{
        position: absolute;
        top: -100px;
        right: -100px;
        width: 258px;
        height: 258px;
        background: url(../../../assets/img/login/caidai1.png) no-repeat;
        background-size: 100% 100%;
      }
      .hover_left_bottom{
        position: absolute;
        bottom: -100px;
        left: -100px;
        width: 258px;
        height: 258px;
        background: url(../../../assets/img/login/caidai2.png) no-repeat;
        background-size: 100% 100%;
      }
      .refuse_btn{
        font-size: 12px;
        color: #466A98;
        position: absolute;
        right: 24px;
        top: 16px;
        cursor: pointer;
      }
      .refuse_guide{
        position: absolute;
        right: 350px;
        top: -2px;
      }
    }
    .argee_text{
      display: flex;
      align-items: center;
      font-size: 12px;
      color: rgba(161,161,161,0.90);
      position: absolute;
      bottom: 16px;
      left: 208px;
      .link{
        color: #1E7FFF;
        cursor: pointer;
        margin-left: 4px
      }
    }
    .save_btn{
      width: 307px;
      height: 86px;
      background: url(../../../assets/img/login/save1.png) no-repeat;
      background-size: 100% 100%;
      position: absolute;
      bottom: 24px;
      right: 35px;
      cursor: pointer;
      &:hover{
        background: url(../../../assets/img/login/save2.png) no-repeat;
        background-size: 100% 100%;
      }
    }
  }
}
</style>
