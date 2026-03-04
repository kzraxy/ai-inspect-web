<template>
  <div class="capture-dialog">
    <el-dialog title="算法结果" :visible.sync="captureDialogVisible" :area="[722, 550]" @close="cancle">
      <div class="capture-content">
        <scrawl
          ref="scrawl"
          :current-select-index.sync="currentSelectIndex"
          :is-show-tool-bar="false"
          :img-list="imgList"
          :can-draw="false"
          width="698"
          height="300"
        ></scrawl>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancle">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import scrawl from '@/components/checkImageDraw/imageDraw'

export default {
  components: {
    scrawl,
  },
  props: {
    isShow: {
      type: Boolean,
      default: false,
    },
    current: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      captureDialogVisible: false,
      calibrations: [], // 当前绘制的所有信息，包括坐标、颜色等
      imgList: [],
      currentSelectIndex: 0,
    }
  },
  watch: {
    isShow(newVal) {
      this.captureDialogVisible = newVal
      this.currentSelectIndex = 0
      if (this.isShow) {
        this.$nextTick(async () => {
          const picList = this.current.imgList
          this.imgList = picList.map(_ => {
            return {
              picUrl: _.url,
              multiAnalysisAreaPolygon: (_.detectArea || []).map(d => {
                return {
                  polygons: _.polygons || [],
                }
              }),
              aiPicCoordinate: (_.aiTarget || []).map(a => {
                const { obj = {}, properties = [] } = a
                let labels = [`${obj.name}(${obj.confidence})`]
                ;(properties || []).forEach(p => {
                  if (p.classify) {
                    p.classify.valueName && labels.push(`${p.classify.valueName}(${p.classify.attrConf})`)
                  }
                })
                return {
                  type: 'polygon',
                  points: a.obj.polygon || [],
                  labels: labels,
                }
              }),
            }
          })
          this.$nextTick(() => {
            this.$refs.scrawl.reDraw()
          })
        })
      }
    },
  },
  methods: {
    cancle() {
      this.imgList = []
      this.$emit('cancle')
    },
  },
}
</script>

<style lang="scss" scoped>
.capture-content {
  .search-bar {
    display: flex;
    margin-bottom: 12px;
    .el-select {
      flex: 1;
      margin: 0 8px;
    }
  }
}
</style>
