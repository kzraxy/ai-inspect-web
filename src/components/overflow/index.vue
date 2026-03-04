<template>
  <span class="overflowhome" @mouseover="ifShow">
    <el-tooltip effect="dark" :content="title" :placement="placement" :disabled="hideTip">
      <span class="content" ref="content">{{title}}</span>
    </el-tooltip>
  </span>
</template>
<script>
export default {
  props: {
    title: {
      type: String,
      default: ''
    },
    width: {
      type: String,
      default: '80px'
    },
    placement: {
      type: String,
      default: 'bottom'
    }
  },
  data () {
    return {
      hideTip: true
    }
  },
  mounted () {
    this.$refs.content.style.width = this.width
    let that = this
    this.ifShow()
    if (this.hideTip) {
      window.addEventListener('mousewheel', function () {
        that.hideTip = true
        that.debounce(100, function () {
          that.ifShow()
          setTimeout(() => {
            // that.hideTip = true;
            that.ifShow()
          }, 200)
        })
      })
    }
  },
  watch: {
    title () {
      this.$nextTick(() => {
        this.ifShow()
      })
    }
  },
  methods: {
    ifShow () {
      if (this.$refs.content.clientWidth >= this.$refs.content.scrollWidth) {
        this.hideTip = true
      } else {
        this.hideTip = false
      }
    },
    debounce (idle, action) {
      let last
      return function () {
        let ctx = this
        let args = arguments
        clearTimeout(last)
        last = setTimeout(function () {
          action.apply(ctx, args)
        }, idle)
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.content {
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.overflowhome {
  position: relative;
  height: 100%;
  line-height: 1;
  display: inline-block;
}

.overflowtip {
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  display: none;
  position: absolute;
  z-index: 10; //bottom: 35px;
  top: 26px;
  left: 0;
  background-color: rgba(51, 51, 51, 0.8);
  box-shadow: 0 5px 10px 0 rgba(0, 0, 0, 0.2);
  border-radius: 2px;
  word-wrap: break-word;
  word-break: break-all;
  padding: 10px;
}

.overflowtip-triangle-down {
  display: inline-block;
  position: absolute;
  left: 45%;
  top: -8px; //left:20px;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 8px solid rgba(51, 51, 51, 0.8);
}
</style>
