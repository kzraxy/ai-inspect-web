<template>
  <el-dialog
    id='SBGraffitiDialog'
    :area="area"
    @close="$emit('update:visible', false)"
    :title="title"
    :visible="visible"
    :close-on-click-modal="false"
    :append-to-body="true"
    >
    <imageDraw
      v-if='visible'
      :models="models"
      :width="`${area[0] - 24}`"
      :height="`${area[1] - 240}`"
      :imgList="pics"
      :currentSelectIndex="activeIndex"
      :storeName="storeName"
      :deletable="deletable"
      @handleDeleteItem="handleDeleteItem"
    ></imageDraw>
    <span slot="footer" id="SBGraffitiDialogfooter" class="dialog-footer">
      <el-button @click="$emit('update:visible', false)">{{$t('inspect.record.buanbi')}}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import imageDraw from '@/components/checkImageDraw/imageDraw.vue'
import videoThumbnail from '@/components/webVideoPlayer/videoThumbnail.vue'
import videoPlayer from '@/components/webVideoPlayer/videoPlayer.vue'

export default {
  name: 'GraffitiDialog',
  components: {
    imageDraw,
    videoThumbnail,
    videoPlayer
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    picArr: {
      type: Array,
      default: () => {
        return []
      }
    },
    storeName: {
      type: String,
      default: '',
    },
    area: {
      type: Array,
      default: () => [684, 595],
    },
    models: {
      type: Array,
      default: () => ['zoom', 'drag', 'download'],
    },
    currentIndex: {
      type: Number,
      default: 0,
    },
    deletable: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '考评问题抓图'
    }
  },
  watch: {
    picArr (val) {
      if (val) {
        this.pics = JSON.parse(JSON.stringify(val))
      }
    },
    currentIndex(v) {
      this.refreshData(v)
    },
  },
  data () {
    return {
      pics: [],
      activeIndex: 0, // 图片坐标
    }
  },
  mounted () {},
  methods: {
    handleDeleteItem(...p) {
      this.$emit('handleDeleteItem', ...p)
    },
    refreshData (index) {
      this.activeIndex = index || 0
    },
    // switchPics (index, type) { // 切换图片
    //   this.activeIndex = index
    //   type===0 && this.$nextTick(() => {
    //     this.$refs.imgCanvas.initDraw()
    //   })
    // }
  }
}
</script>
<style lang="scss">
@import "./style.scss";
</style>
