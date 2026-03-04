<template>
  <div class="tips_wrap">
    <div class="full_modal"></div>
    <div class="tips_modal">
      <div class="head_bg"><div class="close_wrap h-icon-close" @click="close"></div></div>
      <div class="content_wrap">
        <div class="title">尊敬的用户：</div>
        <div class="part_des"><div>为提供更加优质的服务，我们对云端智能分析进行了部分调整，具体如下：</div></div>
        <div class="part_wrap"><div class="text">1.AI训练平台对模型训练的应用类型进行了细分，云服务细分为<b> '在线验证' </b>和<b> '云眸' </b>；</div></div>
        <div class="part_wrap"><div class="text">2.我们将在 <b>{{stepOneDate}}后暂停对 '云服务-在线验证' </b>类型模型的支持，存量的任务在{{stepTwoDate}}前将暂时不受到影响；</div></div>
        <div class="part_wrap"><div class="text">3.为保证您的服务正常使用，请您在 <b>{{stepTwoDate}}前 </b>在AI训练平台对存量的模型进行重新训练，训练时选择<b> 'AI服务-云眸' </b>应用类型；新的模型生成后，可在云眸智能分析任务中通过算法版本切换来应用；</div></div>
        <div class="content_img"></div>
        <div class="text">以上内容请知悉，给您带来不便敬请谅解！</div>
        <div class="text">如有疑问，<span class="link_text" @click="toUpdateHelp">请查看详情帮助</span></div>
        <div class="split_line"></div>
        <div class="check_wrap"><el-checkbox v-model="noTips">不再提醒</el-checkbox></div>
        <div class="foot_btn_wrap"><el-button type="primary" style="width:120px" @click="confirm">我知道了</el-button></div>
      </div>
    </div>
  </div>
</template>

<script>
import { neverNotify, getStepDate } from '@/api/layout'
export default {
  data () {
    return {
      noTips: false,
      stepOneDate: '9月10日',
      stepTwoDate: '12月1日'
    }
  },
  mounted () {
    // this.getStepDate()
  },
  methods: {
    async getStepDate () {
      let res = await getStepDate()
      if (res.code === 0) {
        this.stepOneDate = res.data.stepOneDate
        this.stepTwoDate = res.data.stepTwoDate
      }
    },
    toUpdateHelp () {
      let host = ''
      if (window.location.host === 'www.hik-cloud.com' || window.location.href.indexOf('hilaicloud.com') > -1) {
        host = 'www.hik-cloud.com'
      } else {
        host = 'pb.hik-cloud.com'
      }
      window.open(`${window.location.protocol}//${host}/AI-inspect/updateHelp.html`)
    },
    async confirm () {
      if (this.noTips) { // 选择了不再提醒
        let { code } = await neverNotify()
        if (code === 0) {
          this.close()
        }
      } else {
        this.close()
      }
    },
    close () {
      this.$emit('closeTips')
    }
  }
}
</script>

<style lang="scss" scoped>
.full_modal {
  position: fixed;
  width: 100vw;
  height: 100vh;
  z-index: 1022;
  top: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.4);
}
.tips_wrap{
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
.tips_modal{
  width: 640px;
  height: 680px;
  background: #fff;
  z-index: 1024;
  .head_bg{
    height: 80px;
    position: relative;
    background: url(../../../assets/img/login/bg_tishi.png) no-repeat center;
    .close_wrap{
      position: absolute;
      right: 24px;
      top: 24px;
      width: 24px;
      height: 24px;
      font-size: 24px;
      cursor: pointer;
    }
  }
  .content_wrap{
    margin: 24px 40px;
    .content_img{
      background: url(../../../assets/img/login/bg_pic.png) no-repeat center;
    }
    .title{
      font-family: MicrosoftYaHeiUI-Bold;
      font-size: 16px;
      color: rgba(0,0,0,0.90);
      height: 18px;
      line-height: 18px;
      font-weight: 700;
      margin-bottom: 12px;
    }
    .part_des{
      margin-bottom: 24px;
    }
    .part_wrap{
      margin-bottom: 8px;
    }
    .text{
      font-size: 14px;
      color: rgba(0,0,0,0.70);
      line-height: 28px;
      font-weight: 400;
    }
    .content_img{
      height: 120px;
      margin-bottom: 24px;
    }
    .link_text{
      color: #2080f7;
      cursor: pointer;
    }
    .split_line{
      border-top: 1px solid rgba(0,0,0,0.12);
      margin-top: 12px;
      margin-bottom: 14px
    }
    .check_wrap{
      text-align: center
    }
    .foot_btn_wrap{
      text-align: center;
      margin-top: 8px
    }
  }
}
</style>
