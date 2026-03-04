<template>
  <span class="overflowhome">
    <span v-if="showtip">
      <el-tooltip effect="dark" :content="title" :placement="placement">
        <span>{{shortTitle}}</span>
      </el-tooltip>
    </span>
    <span v-else>{{shortTitle}}</span>
  </span>
</template>
<script>
export default {
  props: {
    title: {
      type: String,
      default: ''
    },
    length: {
      type: Number,
      default: 5
    },
    placement: {
      type: String,
      default: 'top'
    }
  },
  data () {
    return {
      shortTitle: '',
      showtip: false,
      timer: null
    }
  },
  mounted () {
    let that = this
    if (this.title) {
      if (this.title.length <= this.length) {
        this.shortTitle = this.title
        this.showtip = false
      } else {
        this.shortTitle = this.title.substr(0, this.length) + '...'
        this.showtip = true
      }
    }
    if (that.showtip) {
      window.addEventListener(
        'mousewheel',
        that.debounce(100, function () {
          that.showtip = false
          setTimeout(() => {
            that.showtip = true
          }, 100)
        })
      )
    }
  },
  watch: {
    title () {
      if (this.title.length <= this.length) {
        this.shortTitle = this.title
        this.showtip = false
      } else {
        this.shortTitle = this.title.substr(0, this.length) + '...'
        this.showtip = true
      }
    }
  },
  methods: {
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
.overflowhome {
  position: relative;
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
  padding: 5px 10px; //overflow: hidden;
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
