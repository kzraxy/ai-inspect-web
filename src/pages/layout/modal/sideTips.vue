<template>
  <div class="sideTips">
    <div>
      <div class="mask"></div>
      <div class="menu_bg"></div>
      <div class="left-img">
        <div class="left_top_bg"></div>
      </div>
      <div class="i_know"><el-button type="info" @click="confirm">我知道了</el-button></div>
    </div>
  </div>
</template>

<script>
import { knowSideTips } from '@/api/layout'
export default {
  props: {
    submenuCode: {
      default () {
        return []
      }
    },
    isShow: {
      default: false
    }
  },
  data () {
    return {
      loading: false
    }
  },
  computed: {
    nowSubmenuObj () {
      // 当前点击对象
      let nowCode = this.submenuCode[this.clickIndex]
      return this.imgDic[nowCode]
    }
  },
  methods: {
    confirm () {
      knowSideTips().then(res => {
        this.$emit('confirm')
      })
    }
  }
}
</script>

<style scoped lang="scss">
.sideTips{
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
    z-index: 999;
  }
  .i_know{
    position: fixed;
    top: 370px;
    left: 280px;
    z-index: 1005;
    width:96px;
    height: 32px;
  }
  .menu_bg{
    width: 240px;
    height: calc(100vh - 48px);
    background-color: #313431;
    position: fixed;
    top: 48px;
    left: 0;
    z-index: 1001;
  }
  .left-img{
    position: fixed;
    top: 48px;
    left: 0;
    z-index: 1002;
    width: 500px;
    height: 600px;
    .left_top_bg{
      background: url(../../../assets/img/login/illustaror_tips@1x.png) no-repeat;
      width: 100%;
      height: 100%;
    }
  }
}
</style>
