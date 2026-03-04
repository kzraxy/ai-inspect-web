<template>
  <div class="consult-dialog-wrap" v-show="value">
    <div class="consult-dialog-modal"></div>
    <div class="consult-dialog">
      <i class="h-icon-close" @click="hideConsultDialog"></i>
      <img src="@/assets/img/modelPool/scence/illustaror_code_lg@2x.png" alt="">
    </div>
  </div>
</template>

<script>
export default {
  name: 'consult',
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
    }
  },
  methods: {
    hideConsultDialog () {
      this.$emit('input', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.consult-dialog-wrap {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9998;
  .consult-dialog-modal {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.4);
  }
  .consult-dialog {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 9999;
    transform: translate(-50%, -50%);
    >img {
      width: 584px;
    }
    >i {
      position: absolute;
      top: 40px;
      right: 40px;
      font-size: 24px;
      color: rgba(0,0,0,0.7);
      cursor: pointer;
    }
  }
}
</style>
