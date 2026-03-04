<template>
  <div class="box" ref="box" :style="{width: `${currentWidth}px`}">
    <slot></slot>
    <div
      v-if="leftEnable"
      class="line"
      :class="{disabled}"
      ref="leftBar"
      style="left:0;"
      :style="{background: leftInfo.resizing ? activeBG : defaultBG}"
      @pointerdown="leftBeginSliding"
      @pointerup="stopSliding">
    </div>
    <div
      v-if="rightEnable"
      class="line"
      :class="{disabled}"
      ref="rightBar"
      style="right:0;"
      :style="{background: rightInfo.resizing ? activeBG : defaultBG}"
      @pointerdown="rightBeginSliding"
      @pointerup="stopSliding">
    </div>
  </div>
</template>

<script>
export default {
  name: 'resizeBox',
  props: {
    defaultW: {
      type: Number,
      require: true,
    },
    defaultBG: {
      type: String,
      default: 'rgba(0,0,0,0.12)',
    },
    activeBG: {
      type: String,
      default: '#FF5E34',
    },
    minW: {
      type: Number,
      default: 0,
    },
    maxW: {
      type: Number,
      default: 0,
    },
    type: {
      type: 'left' | 'right' | 'both',
      default: 'right',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      width: undefined,
      rightInfo: {
        resizing: false,
      },
      leftInfo: {
        resizing: false,
      },
    }
  },
  computed: {
    rightEnable() {
      return this.type == 'right' || this.type == 'both'
    },
    leftEnable() {
      return this.type == 'left' || this.type == 'both'
    },
    currentWidth() {
      let width = Number.isFinite(this.width) ? this.width : this.defaultW
      width = Math.max(this.minW, width)
      if (this.maxW) {
        width = Math.min(this.maxW, width)
      }
      return width
    },
  },
  watch: {
    currentWidth() {
      this.$emit('widthChanged', this.currentWidth)
    },
  },
  methods: {
    setCurrentWidth(width) {
      this.width = width
    },
    leftBeginSliding(e) {
      let leftBar = this.$refs.leftBar
      leftBar.onpointermove = this.leftTriggerResize
      leftBar.setPointerCapture(e.pointerId)
      this.leftInfo.resizing = true
      this.$emit('start', 'left')
    },
    leftTriggerResize(e) {
      let box = this.$refs.box
      this.width = box.getBoundingClientRect().right - e.clientX
    },
    rightBeginSliding(e) {
      let rightBar = this.$refs.rightBar
      rightBar.onpointermove = this.rightTriggerResize
      rightBar.setPointerCapture(e.pointerId)
      this.rightInfo.resizing = true
      this.$emit('start', 'right')
    },
    rightTriggerResize(e) {
      let box = this.$refs.box
      this.width = e.clientX - box.getBoundingClientRect().x
    },
    stopSliding(e) {
      e.target.onpointermove = null
      e.target.releasePointerCapture(e.pointerId)
      this.rightInfo.resizing = false
      this.leftInfo.resizing = false
      this.$emit('stop', this.currentWidth)
    },
  },
}
</script>

<style lang="scss" scoped>
.box {
  position: relative;
  height: 100%;
  // overflow: hidden;
  flex: none;
}
.line {
  position: absolute;
  top: 0;
  height: 100%;
  width: 1px;
  cursor: ew-resize;
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    // 结合超出隐藏，相当于触发热区宽度为3px
    width: 6px;
    height: 100%;
    transform: translateX(-50%);
  }
  &.disabled {
    cursor: default;
    pointer-events: none;
  }
}
</style>