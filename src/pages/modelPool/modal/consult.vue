<template>
  <div class="consult">
    <div class="consult-btn" @click="showConsultDialog">
      <img src="@/assets/img/modelPool/scence/icon_zixun_24@3x.png" alt="">
      <span>咨询</span>
    </div>
    <consultDialog v-model="dialogVisible"></consultDialog>
  </div>
</template>

<script>
import consultDialog from './consultDialog.vue'
export default {
  name: 'consult',
  components: {
    consultDialog
  },
  data () {
    return {
      dialogVisible: false
    }
  },
  methods: {
    showConsultDialog () {
      this.dialogVisible = true
    },
    hideConsultDialog () {
      this.dialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.consult {
  position: fixed;
  right: 40px;
  bottom: 40px;
  &-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    background: #FFFFFF;
    box-shadow: 0 0 12px 0 rgba(0,0,0,0.10);
    border-radius: 12px;
    cursor: pointer;
    >img {
      width: 24px;
    }
    >span {
      font-size: 14px;
      color: rgba(0,0,0,0.70);
      letter-spacing: 0;
      text-align: center;
      line-height: 20px;
      font-weight: 400;
      margin-top: 4px;
    }
  }
}
</style>
