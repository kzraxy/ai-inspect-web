<!--
 * @Author: langshuang
 * @Date: 2023-02-02 19:48:04
 * @LastEditTime: 2023-03-31 19:13:27
 * @LastEditors: langshuang
 * @Description: 
 * @FilePath: \chain-web\src\components\checkImageDraw\imgCheck\imgCheck.vue
-->
<template>
  <div id="HKImgCheckUtil">
    <div class="threeImg">
      <div class="iconArrow" @click="youhua" v-show="imgList && imgList.length > 0">
        <i class="h-icon-angle_left"></i>
      </div>
      <div class="Containt" ref="container">
        <ul :style="{'transform': `translateX(${-offsetX}px)` }">
          <li v-for="(item,index) in imgModfyList" :key="item.filename" @click="handleClick(item,index)" :style="{'border-color': index == selectIndex ? '#E44A09' : ''}">
            <!-- <img :src="item.picUrl"> -->
            <videoThumbnail
              v-if="item.fileType"
              :src="videoFirstFrameUrl(item)"
              :width="68"
              :height="68"
              :duration="item.videoDuration"
              :ms="!!item.isMillisecond">
            </videoThumbnail>
            <imgCanvas 
              v-else 
              :info="item.aiPicSame ? undefined : item.picCoordinate"
              :aiInfo="item.aiPicCoordinate"
              :url="item.picUrl"
              width="68" 
              height="68" 
              :lineWidth="lineWidth" 
              :lineType="lineType" 
              :drawInfo="item.drawInfo" 
             >
            </imgCanvas>
            <i v-if ="deletable"
              class="h-icon-close 
              close-btn" 
              @click.stop="()=>handleDeleteItem(index, item)">
            </i>
          </li>
        </ul>
      </div>
      <div class="iconArrow" @click="zuohua" v-show="imgList && imgList.length > 0">
        <i class="h-icon-angle_right"></i>
      </div>
    </div>
  </div>
</template>
<script>
import imgCanvas from '@/components/canvas/index.vue'
import videoThumbnail from '@/components/webVideoPlayer/videoThumbnail.vue'
import { getVideoFrameUrl } from '@/plugin/utils/util'
export default {
  props: {
    imgList: {
      type: Array,
      default: []
    },
    selectIndex: {
      type: Number,
      default: 0,
    },
    deletable: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    imgList: {
      handler (val, o) {
        if (val && val.length) {
          try {
            val.forEach(item => {
              item.picCoordinate = item.picCoordinate ? JSON.parse(item.picCoordinate) : []
            })
          } catch (e) {}
        }
        this.imgModfyList = val
      },
      immediate: true
    }
  },
  components: {
    imgCanvas, // canvas组件
    videoThumbnail
  },
  data () {
    return {
      lineWidth: 1,
      imgModfyList: [],
      lineType: 'rec',
      offsetX: 0,
      imgSize: 78,
    }
  },
  methods: {
    videoFirstFrameUrl(item) {
      return item.videoPicUrl || getVideoFrameUrl(item.picUrl)
    },
    handleClick (item, index) {
      this.$emit('getUrl', index)
    },
    zuohua () {
      this.setOffset(this.offsetX + this.imgSize)
    },
    youhua () {
      this.setOffset(this.offsetX - this.imgSize)
    },
    setOffset(offset) {
      this.offsetX = Math.max(0, Math.min(offset, this.imgSize * this.imgList.length - this.$refs.container.clientWidth))
    },
    setSelectImgCenter() {
      this.setOffset(-this.$refs.container.clientWidth / 2 + this.selectIndex * this.imgSize + this.imgSize / 2)
    },
    handleDeleteItem(index, item) {
      this.$parent.$emit('handleDeleteItem',index, item)
      let newIndex = index >= this.selectIndex ? this.selectIndex : this.selectIndex - 1
      newIndex = Math.max(0, Math.min(newIndex, this.imgModfyList.length - 2))
      if(newIndex != this.selectIndex) {
        setTimeout(() => {
          this.$emit('getUrl', newIndex)
        }, 10)
      }
    },
  }
}
</script>
<style lang="scss" scoped>
@import "./style";
</style>
