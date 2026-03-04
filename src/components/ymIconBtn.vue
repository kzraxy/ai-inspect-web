<template>
  <el-button @click="click" :plain="plain" :style="btnStyle" :class="{'validateErr':validateErr}" class="ym_icon_btn">
    <slot name="selfIcon" v-if="$slots.selfIcon"></slot>
    <span v-else :class="iconName" class="pre-wrap" :style="iconStyle"></span>
    <span class="text">{{btnText}}</span>
  </el-button>
</template>

<script>
export default {
  props: {
    plain: {
      type: Boolean,
      default: true
    },
    validateErr: {
      type: Boolean,
      default: false
    },
    btnText: {
      type: String,
      default: '按钮'
    },
    iconName: {
      type: String,
      default: 'h-icon-add'
    },
    btnStyle: {
      type: Object,
      default: () => {}
    },
    iconStyle: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
    }
  },
  methods: {
    click () {
      this.$emit('click')
    }
  }
}
</script>

<style lang="scss">
.ym_icon_btn > span {
  display: flex;
  align-items: center;
}
</style>
<style lang="scss" scoped>
.ym_icon_btn {
  padding: 0 6px 0 10px
}
.validateErr{
  border: 1px solid #fa3239
}
.pre-wrap{
  font-size: 18px;
  font-weight: 900;
}
.text{
  margin-left: 8px;
}
</style>
