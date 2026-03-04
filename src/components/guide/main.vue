<template>
  <div class="guide_bg" v-if='visible'>
    <div class="ym-guide" ref='ymGuide' :style="`width: ${widthStyle};top:${top};left:${left}`">
      <img src="./image/robot_left.png" v-if="guideLogoPosition==='left'" alt="" class="guide__img guide__img__left">
      <img src="./image/robot_right.png" v-else alt="" class="guide__img guide__img__right">
      <div class="guide__arrow" :style='arrowPosition'></div>
      <el-button icon='h-icon-close_sm' class="close-btn" size='mini' @click='close'></el-button>
      <div class="ym-guide-head" v-if='title'>
        <p class="head-content">{{ title }}</p>
      </div>
      <div class="ym-guide-body" v-if='subTitle'>
        <span class="dec">{{ subTitle }}</span>
      </div>
      <div class="ym-guide-foot" v-if='$slots.footLeft || $slots.footRight'>
        <div class="foot-left">
          <slot name='footLeft'></slot>
        </div>
        <div class="foot-right">
          <slot name='footRight'></slot>
        </div>
      </div>
    </div>
  </div>

</template>
<script>
export default {
  name: 'ym-guide',
  props: {
    title: {
      type: String
    },
    subTitle: {
      type: String
    },
    placement: {
      type: String,
      default: 'bottom'
    },
    width: {
      type: [Number, String],
      default: 280
    },
    top: {
      type: String,
      default: '100px'
    },
    left: {
      type: String,
      default: '240px'
    }
  },

  data() {
    return {
      visible: false,
      popperInstance: null
    }
  },

  computed: {
    arrowPosition() {
      const arrowWidth = 4
      return {
        'top-start': {
          bottom: 0 - arrowWidth + 'px',
          left: '12px',
          transform: 'rotate(45deg)'
        },
        top: {
          bottom: 0 - arrowWidth + 'px',
          left: '50%',
          transform: 'translate(-50%, 0) rotate(45deg)'
        },
        'top-end': {
          bottom: 0 - arrowWidth + 'px',
          right: '12px',
          transform: 'rotate(45deg)'
        },

        'bottom-start': {
          top: 0 - arrowWidth + 'px',
          left: '12px',
          transform: 'rotate(-135deg)'
        },
        bottom: {
          top: 0 - arrowWidth + 'px',
          left: '50%',
          transform: 'translate(-50%, 0) rotate(-135deg)'
        },
        'bottom-end': {
          top: 0 - arrowWidth + 'px',
          right: '12px',
          transform: 'rotate(-135deg)'
        },

        'left-start': {
          top: 12 + 'px',
          right: 0 - arrowWidth + 'px',
          transform: 'rotate(-45deg)'
        },
        left: {
          top: '50%',
          transform: 'translate(0, -50%) rotate(-45deg)',
          right: 0 - arrowWidth + 'px'
        },
        'left-end': {
          bottom: 12 + 'px',
          right: 0 - arrowWidth + 'px',
          transform: 'rotate(-45deg)'
        },

        'right-start': {
          top: '12px',
          left: 0 - arrowWidth + 'px',
          transform: 'rotate(135deg)'
        },
        right: {
          top: '50%',
          transform: 'translate(0, -50%) rotate(135deg)',
          left: 0 - arrowWidth + 'px'
        },
        'right-end': {
          bottom: 12 + 'px',
          left: 0 - arrowWidth + 'px',
          transform: 'rotate(135deg)'
        }
      }[this.placement]
    },
    guideLogoPosition() {
      return {
        'top-start': 'left',
        top: 'left',
        'top-end': 'left',

        'bottom-start': 'right',
        bottom: 'left',
        'bottom-end': 'left',

        'left-start': 'left',
        left: 'left',
        'left-end': 'left',

        'right-start': 'right',
        right: 'right',
        'right-end': 'right'
      }[this.placement]
    },
    widthStyle() {
      return this.width.toString().indexOf('px') > -1 ? this.width : this.width + 'px'
    }
  },

  mounted() {
  },

  methods: {
    renderGuide() {
      this.visible = true
    },
    close() {
      this.visible = false
      this.$emit('close')
    },
    complete() {
      this.$meit('complete')
    }
  }

}
</script>

<style scoped lang='scss'>
  .guide_bg{
    width: 100vw;
    height: 100vh;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 99;
    background: rgba(0,0,0,.4);
  }
  .ym-guide {
    position: absolute;
    width: 280px;
    padding: 16px 12px 12px 16px;
    background-image: linear-gradient(180deg, #9F98FE 0%, #2A88FF 50%);
    box-shadow: 0 4px 8px 0 rgba(0,0,0,0.10);
    font-size: 14px;
    color: rgba(255,255,255,0.90);
    letter-spacing: 0.47px;
    text-align: left;
    line-height: 20px;
    font-weight: 400;
    border-radius: 4px;
    min-height: 56px;
    z-index: 999;
    .guide__arrow {
      position: absolute;
      display: block;
      width: 0;
      height: 0;
      border-width: 4px;
      border-style: solid;
      border-color: transparent;
      border-top-width: 4px;
      border-right-color: #2A88FF;
      border-bottom-color: #2A88FF;
    }

    .guide__img {
      position: absolute;
      height: 80px;
      width: 80px;
    }

    .guide__img__left {
      top: -16px;
      left: -52px;
    }
    .guide__img__right {
      top: -16px;
      right: -52px;
    }

    .close-btn {
      position: absolute;
      color: #fff !important;
      top: 16px;
      right: 12px;
      i {
        font-size: 24px !important;
      }
    }
    .close-btn:hover {
      color: #fff !important;
    }

    .ym-guide-head {
      display: flex;
      padding-right: 46px;
      justify-content: space-between;
      align-items: flex-start;

      .head-content{
        font-size: 16px;
        color: #FFFFFF;
        letter-spacing: 0.15px;
        text-align: left;
        line-height: 24px;
        font-weight: 600;
        flex: 1;
        flex-wrap: wrap;
        margin: 0px;
      }
    }
    .ym-guide-body {
      margin-top: 8px;
      .dec {
        font-size: 14px;
        color: rgba(255,255,255,0.90);
        letter-spacing: 0.47px;
        text-align: left;
        line-height: 20px;
        font-weight: 400;
      }
    }
    .ym-guide-foot {
      margin-top: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .foot-left-content {
        font-size: 14px;
        color: rgba(255,255,255,0.70);
        letter-spacing: 0;
        line-height: 20px;
        font-weight: 400;
      }
    }
  }
</style>
