<template>
  <el-scrollbar ref="scrollbar" wrap-class="infinite-list-container" @on-scrolling-y="scrollEvent" v-loading="loading">
    <div class="infinite-list-phantom" :style="{ height: listHeight + 'px' }"></div>
    <div class="infinite-list" :style="{ transform: getTransform }">
      <div
        v-for="(item, index) in visibleData"
        :key="index"
        class="infinite-list-item"
        :style="{ 'height': itemSize + 'px', 'lineHeight': needLineHeight ? itemSize + 'px' : ''}"
      >
        <slot :item="item" />
      </div>
    </div>
  </el-scrollbar>
</template>

<script>
export default {
  name: 'VirtualList',
  props: {
    //所有列表数据
    listData: {
      type: Array,
      default: () => [],
    },
    //每项高度
    itemSize: {
      type: Number,
      default: 32,
    },
    //是否需要line-height属性，可能会影响slot样式
    needLineHeight : {
      type: Boolean,
      default: true,
    },
    loading : {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      //可视区域高度
      screenHeight: 0,
      //偏移量
      startOffset: 0,
      //起始索引
      start: 0,
      //结束索引
      end: null,
    }
  },
  computed: {
    //列表总高度
    listHeight() {
      return this.listData.length * this.itemSize
    },
    //可显示的列表项数
    visibleCount() {
      return Math.ceil(this.screenHeight / this.itemSize) + 2
    },
    //偏移量对应的style
    getTransform() {
      return `translate3d(0,${this.startOffset}px,0)`
    },
    //获取真实显示列表数据
    visibleData() {
      return this.listData.slice(this.start, Math.min(this.end, this.listData.length))
    },
  },
  mounted() {
    this.screenHeight = this.$el.clientHeight
    this.start = 0
    this.end = this.start + this.visibleCount
  },
  methods: {
    scrollEvent({ scrollTop, percentY }) {
      // scrollTop当前滚动位置
      //此时的开始索引
      this.start = Math.floor(scrollTop / this.itemSize)
      //此时的结束索引
      this.end = this.start + this.visibleCount
      //此时的偏移量
      this.startOffset = scrollTop - (scrollTop % this.itemSize)
      if (percentY === 1) {
        this.$emit('end', () => {
          this.$refs.scrollbar.setScroll(scrollTop - 20, -1, 0)
        })
        this.$refs.scrollbar.update()
      }
    },
  },
}
</script>

<style scoped>
::v-deep .infinite-list-container {
  height: 100%;
  overflow: auto;
  position: relative;
  -webkit-overflow-scrolling: touch;
}

.infinite-list-phantom {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  z-index: -1;
}

.infinite-list {
  left: 0;
  right: 0;
  top: 0;
  position: absolute;
}

.infinite-list-item {
  color: #555;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}
</style>
