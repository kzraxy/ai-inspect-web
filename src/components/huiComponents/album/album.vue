<template>
  <div
    :class="[
      `h-album--theme-${theme}`,
      clsId,
      {
        'has-shadow': shadow
      }
    ]"
    class="h-album"
  >
    <div class="h-album__wrapper">
      <span v-if="showBtn" class="h-album__btn" @click="$prevPage">
        <slot
          v-if="$slots.prev || $scopedSlots.prev"
          :disabled="disabledPrev"
          name="prev"
        />
        <button
          v-else
          :disabled="disabledPrev"
          :class="{
            'is-disabled': disabledPrev
          }"
          type="button"
          class="h-album__prev"
        >
          <i class="h-icon-angle_left" />
        </button>
      </span>
      <div
        v-show="!noData"
        ref="itemsWrapper"
        :class="{
          'has-left-shadow': shadow && (!disabledPrev || translateX === 0),
          'has-right-shadow': shadow && !disabledNext
        }"
        class="h-album__items-wrapper"
        @mousewheel="albumMousewheel"
      >
        <div ref="items" :style="itemsStyle" class="h-album__items">
          <div
            v-for="item in visibleData"
            :key="item[props.key] || `h-album-${item.$$index}`"
            :class="{
              'is-active': item.$$index === internalCurrentPage
            }"
            class="h-album__item"
            @click="itemClick(item.$$index)"
          >
            <slot
              v-if="$slots.item || $scopedSlots.item"
              :item="item"
              :active="item.$$index === internalCurrentPage"
              name="item"
            />
            <div
              v-else-if="item[props.type] === 1"
              class="h-album__video-wrapper"
            >
              <video
                v-if="!item.$$error"
                :ref="`video-${item.$$index}`"
                :src="item[props.url]"
                class="h-album__video"
                @loadstart="handleVideoLoad(item)"
                @error="handleVideoError(item)"
                @loadedmetadata="handleLoadedmetadata(item, $event)"
              />
              <span
                v-if="translateDuration(item)"
                class="h-album__video-duration"
              >
                {{ translateDuration(item) }}
              </span>
              <h-empty v-if="item.$$error" class="h-album__placeholder">
                <h-empty-error-video />
              </h-empty>
            </div>
            <h-img-view
              v-else
              ref="imgView"
              v-bind="imgViewCtor.$props"
              :bg="imgViewBg"
              :title="item[props.title]"
              :src="item[props.url]"
            />
          </div>
        </div>
      </div>
      <h-empty v-if="noData" size="xs">
        <h-empty-no-data />
      </h-empty>
      <span v-if="showBtn" class="h-album__btn" @click="$nextPage">
        <slot
          v-if="$slots.next || $scopedSlots.next"
          :disabled="disabledNext"
          name="next"
        />
        <button
          v-else
          :disabled="disabledNext"
          :class="{
            'is-disabled': disabledNext
          }"
          type="button"
          class="h-album__next"
        >
          <i class="h-icon-angle_right" />
        </button>
      </span>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import {
  width,
  insertStyle as insertStyleUtil,
  isArray,
  isObject,
  isNull,
  merge,
  on,
  off,
  throttle,
  addClass,
  removeClass,
  removeNode,
  type,
  isElement,
  size,
  offset as getOffset,
  isEmpty,
  Stack
} from '@hui-pro/utils'
// components
import HEmpty from '@hui-pro/empty/src/empty.vue'
import HImgView from '@hui-pro/img-view/src/img-view.vue'
import { Components as EmptyComponents } from '@hui-pro/empty'

export default {
  name: 'HAlbum',
  components: {
    HEmpty,
    HImgView,
    ...EmptyComponents
  },
  props: {
    ...HImgView.props,
    theme: {
      type: String,
      default: 'light',
      validator (value) {
        return ['light', 'light-gray', 'transparent', 'dark'].includes(value)
      }
    },
    data: {
      type: [Array, Function],
      default: () => []
    },
    dataProps: {
      type: Object,
      default: () => {
        return {}
      }
    },
    imgSize: {
      type: Object,
      default: () => {
        return {
          width: 76,
          height: 76
        }
      }
    },
    currentIndex: {
      type: Number,
      default: 0,
      validator (value) {
        return type(value) === 'Integer' && value >= 0
      }
    },
    alwaysCenter: {
      type: Boolean,
      default: false
    },
    shadow: {
      type: Boolean,
      default: true
    },
    beforeChange: {
      type: Function,
      default: () => {
        return new Promise(resolve => {
          resolve()
        })
      }
    },
    singleHideBtn: {
      type: Boolean,
      default: false
    },
    /**
     * rewrite props
     */
    emptySize: {
      type: String,
      default: 'xs'
    },
    mode: {
      type: String,
      default: 'scale-down'
    },
    lazyload: {
      type: Boolean,
      default: true
    },
    resize: {
      type: Boolean,
      default: true
    },
    mousewheel: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      props: {
        title: 'title',
        url: 'url',
        key: 'key',
        type: 'type'
      },
      // 真实偏移量
      offset: 0,
      // 实际偏移量
      translateX: 0,
      // 当前真实索引
      internalCurrentPage: null,
      prveCurrentPage: 0,
      // 用于计算的基本参数
      count: 0,
      halfCount: 0,
      // 当前可视数据
      visibleData: [],
      // 缓存数据
      cacheData: [],
      isLocked: false,
      isCenter: false,
      imgViewCtor: null,
      keyMap: {},
      lt: null
    }
  },
  computed: {
    clsId () {
      return `h-album__style--${this._uid}`
    },
    imgViewBg () {
      if (this.theme === 'light' || this.theme === 'light-gray') {
        return 'gray'
      } else {
        return 'transparent'
      }
    },
    noData () {
      return this.data.length === 0
    },
    // 每一项宽度
    itemWidth () {
      return this.imgSize.width + 8
    },
    // 可视数据实际宽度
    itemsWidth () {
      return this.itemWidth * this.cacheData.length - 8
    },
    // 余数宽度
    diffWidth () {
      return this.halfOffset() - this.halfCount * this.itemWidth
    },
    diff () {
      return this.isCenter ? this.diffWidth : 0
    },
    itemsStyle () {
      return {
        transform: `translateX(${this.translateX}px)`
      }
    },
    disabledPrev () {
      // 禁用前一页按钮
      return this.offset >= 0 || this.noData
    },
    disabledNext () {
      // 禁用下一页按钮
      return (
        this.offset <= -(this.itemsWidth - this.wrapperWidth()) || this.noData
      )
    },
    startIndex () {
      // 起始索引
      let index = -(this.offset - this.diff) / this.itemWidth
      if (index < 0) {
        index = 0
      }
      return Math.ceil(index)
    },
    endIndex () {
      // 结束索引
      const index =
        -(this.offset - this.wrapperWidth() - this.diff) / this.itemWidth
      if (this.startIndex === 0) {
        return Math.floor(index)
      } else {
        return this.startIndex + this.count
      }
    },
    index () {
      return this.visibleData.findIndex((item, index) => {
        return (
          this.cacheData[this.internalCurrentPage].$$index === item.$$index
        )
      })
    },
    outRange () {
      if (this.visibleData.length > 0) {
        return (
          this.internalCurrentPage < this.visibleData[0].$$index ||
          this.internalCurrentPage >
            this.visibleData[this.visibleData.length - 1].$$index
        )
      } else {
        return true
      }
    },
    showBtn () {
      if (this.singleHideBtn) {
        return !(this.disabledPrev && this.disabledNext)
      } else {
        return true
      }
    }
  },
  watch: {
    data: {
      deep: true,
      handler (val) {
        this.$reset()
      }
    },
    imgSize () {
      this.insertStyle()
    },
    internalCurrentPage (val, oldVal) {
      this.prveCurrentPage = oldVal
      if (val !== oldVal && !isNull(oldVal)) {
        this.$emit('on-change', this.data[val], val)
        this.$emit('update:current-index', val)
        this.$selected(val)
      }
    },
    currentIndex: {
      immediate: true,
      handler (val) {
        if (this.data.length > val) {
          this.internalCurrentPage = val
        } else {
          this.internalCurrentPage = 0
        }
      }
    },
    isLocked (val) {
      if (!val) {
        removeClass(this.$refs.items, 'is-transition')
      }
    }
  },
  created () {
    this.stack = new Stack()
    this.insertStyle()
    const ImgViewCtor = Vue.extend(HImgView)
    this.imgViewCtor = new ImgViewCtor({
      propsData: this.$props
    })
    this.props = merge(this.props, this.dataProps)
  },
  mounted () {
    // if (!this.$isServer) {
    //   on(document.documentElement, 'keydown', this.handleKeydown)
    // }
    if (isElement(this.$refs.items)) {
      on(this.$refs.items, 'transitionend', this.onTransitionend)
    }
    if (isElement(this.$el)) {
      on(this.$el, 'resize', this.onResize)
    }
    this.init()
  },
  destroyed () {
    if (isElement(this.$refs.items)) {
      off(this.$refs.items, 'transitionend', this.onTransitionend)
    }
    if (isElement(this.$el)) {
      off(this.$el, 'resize', this.onResize)
    }
    // if (!this.$isServer) {
    //   off(document.documentElement, 'keydown', this.handleKeydown)
    // }
    const $id = document.getElementById(this.clsId)
    if ($id) {
      removeNode($id)
    }
  },
  methods: {
    onResize: throttle(function () {
      if (this.resize) {
        this.init()
      }
    }, 320),
    translateDuration (item, index) {
      const getDuration = () => {
        const ref = this.$refs[`video-${item.$$index}`]
        if (ref && ref.length > 0) {
          return ref[0].duration
        }
      }
      const val = item.duration || getDuration()
      // 没有值的情况下直接返回空
      if (!val) {
        return ''
      }
      let res = ''
      let minute = parseInt(val / 60)
      // 0-9转成00-09
      minute = minute < 10 ? `0${minute}` : `${minute}`
      let seconds = parseInt(val % 60)
      // 0-9转成00-09
      seconds = seconds < 10 ? `0${seconds}` : `${seconds}`
      res = `${minute}:${seconds}`
      return res
    },
    // 列表外包裹宽度
    wrapperWidth () {
      if (this.$refs.itemsWrapper) {
        return width(this.$refs.itemsWrapper)
      }
      return 0
    },
    // 居中偏移量
    halfOffset () {
      return this.wrapperWidth() / 2 - this.imgSize.width / 2
    },
    initData () {
      if (isArray(this.data)) {
        this.cacheData = []
        this.data.map((item, index) => {
          this.cacheData.push(
            merge(
              {},
              isObject(item)
                ? item
                : {
                  url: item
                },
              {
                $$index: index,
                $$error: false
              }
            )
          )
        })
      }
    },
    init () {
      this.initData()
      this.refresh()
    },
    refresh () {
      this.$nextTick(() => {
        // 一行最多展示个数的整数值
        const radix = this.wrapperWidth() / this.itemWidth
        if (radix) {
          this.count = Math.floor(radix)
          // 半数整数值
          this.halfCount =
            this.count % 2 === 0
              ? this.count / 2 + 1
              : Math.ceil(this.count / 2)
          this.setPosition(true)
          this.$nextTick(() => {
            this.refreshData()
            this.$resetVisible()
            this.isLocked = false
          })
        }
      })
    },
    refreshData () {
      let startLength = this.startIndex - this.count
      if (startLength < 0) {
        startLength = 0
      }
      let endLength = this.endIndex + this.count + 2
      if (endLength > this.cacheData.length) {
        endLength = this.cacheData.length
      }
      this.visibleData = this.cacheData.slice(startLength, endLength)
    },
    onTransitionend (e) {
      // 只渲染可视区域数据，减少DOM加载
      if ((e.target === e.currentTarget && this.visibleData.length > 0) || !e) {
        const prevStartIndex = this.visibleData[0].$$index
        this.refreshData()
        const diffIndex = this.visibleData[0].$$index - prevStartIndex
        this.translateX += diffIndex * this.itemWidth
        this.$resetVisible()
        this.isLocked = false
      }
    },
    setTransitionClass () {
      if (this.$refs.items) {
        addClass(this.$refs.items, 'is-transition')
      }
    },
    setPosition (init) {
      const setClass = () => {
        if (!init) {
          this.isLocked = true
          this.setTransitionClass()
        }
      }
      this.$nextTick(() => {
        const setCenter = () => {
          this.isCenter = true
          this.offset =
            this.halfOffset() - this.internalCurrentPage * this.itemWidth
          if (this.outRange) {
            this.refreshData()
          }
          const translateX = this.halfOffset() - this.index * this.itemWidth
          if (this.translateX !== translateX) {
            setClass()
            this.translateX = translateX
          }
        }
        // 居中
        if (this.alwaysCenter) {
          setCenter()
        } else {
          if (this.internalCurrentPage < this.halfCount) {
            // 起始位置
            this.offset = 0
            if (this.outRange) {
              this.refreshData()
            }
            if (this.translateX !== 0) {
              setClass()
              this.translateX = 0
            }
          } else if (
            this.cacheData.length - this.internalCurrentPage - 1 <
            this.halfCount
          ) {
            // 结束位置
            this.offset = -(this.itemsWidth - this.wrapperWidth())
            if (this.outRange) {
              this.refreshData()
            }
            let translateX =
              -(this.visibleData.length - this.count) * this.itemWidth
            if (this.cacheData.length < this.count) {
              translateX = 0
            }
            if (this.translateX !== translateX) {
              setClass()
              this.translateX = translateX
            }
          } else {
            // 中间位置
            setCenter()
          }
        }
      })
    },
    move (length) {
      this.isLocked = true
      this.isCenter = false
      this.setTransitionClass()
      this.$nextTick(() => {
        if (length === 'start') {
          this.offset = 0
          this.translateX = 0
        } else if (length === 'end') {
          this.offset = -(this.cacheData.length - this.count) * this.itemWidth
          this.translateX =
            -(this.visibleData.length - this.count) * this.itemWidth
        } else {
          this.offset += length
          this.translateX += length
        }
      })
    },
    albumMousewheel (e) {
      if (this.mousewheel) {
        e.preventDefault()
        const value = e.wheelDelta || -e.deltaY || -e.detail
        const delta = Math.max(-1, Math.min(1, value))
        if (delta < 0) {
          this.$nextPage()
        } else {
          this.$prevPage()
        }
      }
    },
    resetVisibleItem (imgView, index) {
      if (this.keyMap[imgView._uid]) {
        imgView.$emit('visible', true)
        return
      }
      const dom = this.$refs.itemsWrapper
      const { width, height } = size(dom)
      const { top, left } = getOffset(imgView.$el, dom)
      if (top < height && left < width) {
        imgView.$emit('visible', true)
        this.keyMap[imgView._uid] = true
      } else {
        imgView.$emit('visible', false)
        this.keyMap[imgView._uid] = false
      }
    },
    $resetVisible () {
      this.$nextTick(() => {
        if (this.$refs.imgView) {
          this.$refs.imgView.map((imgView, index) => {
            this.resetVisibleItem(imgView, index)
          })
        }
      })
    },
    itemClick (index) {
      this.$emit('self-click', this.data[index], index)
      this.$emit('update:current-index', index)
      this.$selected(index)
    },
    async $selected (index) {
      const offsetIndex =
        index === this.internalCurrentPage
          ? this.prveCurrentPage
          : this.internalCurrentPage
      // 选中项函数
      if (
        this.isLocked ||
        this.noData ||
        index === offsetIndex ||
        index >= this.cacheData.length ||
        this.internalCurrentPage === index
      ) {
        this.setPosition()
        return
      }
      try {
        const item = this.data[index]
        await this.stack.promise(this.beforeChange(item))
        this.internalCurrentPage = index
        this.setPosition()
      } catch (error) {
        if (!isEmpty(error)) {
          throw error
        }
      }
    },
    async $prev () {
      if (this.internalCurrentPage === 0 || this.isLocked || this.noData) {
        return
      }
      const item = this.data[this.internalCurrentPage - 1]
      await this.stack.promise(this.beforeChange(item))
      this.internalCurrentPage--
    },
    async $next () {
      if (
        this.internalCurrentPage === this.cacheData.length - 1 ||
        this.isLocked ||
        this.noData
      ) {
        return
      }
      const item = this.data[this.internalCurrentPage + 1]
      await this.stack.promise(this.beforeChange(item))
      this.internalCurrentPage++
    },
    $prevPage () {
      if (this.disabledPrev || this.isLocked || this.noData) {
        return
      }
      const moveLength = this.diff !== 0 ? this.count - 1 : this.count
      if (this.startIndex > this.count) {
        // 足够一页
        this.move(moveLength * this.itemWidth - this.diff)
      } else {
        // 不足一页
        this.move('start')
      }
    },
    $nextPage () {
      if (this.disabledNext || this.isLocked || this.noData) {
        return
      }
      const residueCount = this.cacheData.length - 1 - this.endIndex
      const moveLength = this.diff !== 0 ? this.count + 1 : this.count
      if (residueCount > this.count) {
        // 足够一页
        this.move(-moveLength * this.itemWidth - this.diff)
      } else {
        // 不足一页
        this.move('end')
      }
    },
    $reset () {
      this.init()
    },
    handleVideoLoad (item) {
      this.$set(item, '$$error', false)
    },
    handleVideoError (item) {
      this.$set(item, '$$error', true)
    },
    handleLoadedmetadata (item, e) {
      this.$set(item, 'duration', e.target.duration)
    },
    handleKeydown (e) {
      if (
        !['INPUT', 'TEXTAREA'].includes(e.target.tagName) &&
        [37, 38, 39, 40].includes(e.keyCode)
      ) {
        e.preventDefault()
        switch (e.keyCode) {
        case 37:
        case 38:
          this.$prev()
          break
        case 39:
        case 40:
          this.$next()
          break
        }
      }
    },
    insertStyle () {
      const width = this.imgSize.width
      const height = this.imgSize.height
      // 插入自定义宽高样式
      insertStyleUtil(
        `
          .${this.clsId} .h-album__wrapper {
            height: ${height + 16}px;
          }
          .${this.clsId} .h-album__items-wrapper::after,
          .${this.clsId} .h-album__items-wrapper::before {
            width: ${width + 8}px;
          }
          .${this.clsId} .h-album__item {
            width: ${width}px;
            height: ${height}px;
          }
        `,
        this.clsId
      )
    }
  }
}
</script>
