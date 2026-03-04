<template>
  <el-dialog title="正误报统计" :visible="visible" @close="close" class="markResultDetailModal" :area="[1200,240]">
    <el-tabs v-model="activeTab" @change="changeTabs">
      <el-tab-pane label="图片正误报" name="imageMarkTab"><span slot="label">{{`图片正误报`}}</span></el-tab-pane>
      <!-- <el-tab-pane label="目标正误报" name="targetMarkTab"><span slot="label">{{`目标正误报（${targetTableData.length}个）`}}</span></el-tab-pane> -->
    </el-tabs>
    <el-table :data="imageTableData" show-overflow-title v-show="activeTab==='imageMarkTab'">
      <el-table-column prop="positiveAlertNum" label="正报图片数"></el-table-column>
      <el-table-column prop="falsePositiveAlertNum" label="误报图片数"></el-table-column>
      <el-table-column prop="missedAlertNum" label="漏报图片数"></el-table-column>
      <el-table-column prop="positiveAlertRatio" label="正报率" :render-header='renderImageTabelHead'></el-table-column>
      <el-table-column prop="falsePositiveAlertRatio" label="误报率" :render-header='renderImageTabelHead'></el-table-column>
      <el-table-column prop="missedAlertRatio" label="漏报率" :render-header='renderImageTabelHead'></el-table-column>
    </el-table>
    <el-table :data="targetTableData" show-overflow-title v-show="activeTab==='targetMarkTab'">
      <el-table-column prop="labelName" label="标签"></el-table-column>
      <el-table-column prop="realTargetNum" label="真实目标数" :render-header='renderTargetTabelHead'></el-table-column>
      <el-table-column prop="alertTargetNum" label="实际报警数" :render-header='renderTargetTabelHead'></el-table-column>
      <el-table-column prop="positiveTargetNum" label="正报目标数"></el-table-column>
      <el-table-column prop="falsePositiveTargetNum" label="误报目标数"></el-table-column>
      <el-table-column prop="missedTargetNum" label="漏报目标数"></el-table-column>
      <el-table-column prop="accuracy" label="准确率" :render-header='renderTargetTabelHead'></el-table-column>
      <el-table-column prop="falsePositiveRate" label="误报率" :render-header='renderTargetTabelHead'></el-table-column>
      <el-table-column prop="missedRate" label="漏检率" :render-header='renderTargetTabelHead'></el-table-column>
      <el-table-column prop="detectionRate" label="检出率" :render-header='renderTargetTabelHead'></el-table-column>
      <el-table-column prop="allTargetNum" label="总目标数"></el-table-column>
    </el-table>
  </el-dialog>
</template>

<script>
import { getImageMarkResult, getTargetMarkResult } from '../proxy'
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
  },
  data () {
    return {
      tabs: [{ label: '图片正误报', name: 'imageMarkTab'}, { label: '失败', name: 'targetMarkTab'}],
      activeTab: 'imageMarkTab',
      imageTableData: [],
      targetTableData: [],
      searchParams: {}
    }
  },
  watch: {
    visible (val) {
      if (!val) {
        this.activeTab = 'imageMarkTab'
        this.imageTableData = []
        this.targetTableData = []
        this.searchParams = {}
      }
    }
  },
  computed: {
    targetTableHeaderList() {
      return [
        {name: '真实目标数', tip: '正报数+漏报数'},
        {name: '实际报警数', tip: '正报数+误报数'},
        {name: '准确率', tip: '正报数/实际报警数（正保数+误报数）'},
        {name: '误报率', tip: '误报数/实际报警数（正保数+误报数）'},
        {name: '漏检率', tip: '漏报数/真实目标数'},
        {name: '检出率', tip: '正报数/真实目标数'},
      ]
    },
    imageTableHeaderList() {
      return [
        {name: '正报率', tip: '正报图片/已标记的总图片数'},
        {name: '误报率', tip: '误报图片/已标记的总图片数'},
        {name: '漏报率', tip: '漏报图片/已标记的总图片数'},
      ]
    },
  },
  methods: {
    renderImageTabelHead(h, { column, $index }) {
      let obj = this.imageTableHeaderList.filter(_ => _.name === column.label)[0]
      return h(
        'div',
        {
          style: 'display: flex; align-items: center;'
        },
        [
          h('span', obj.name),
          h('el-tooltip', {
            props: {
              content: obj.tip,
              placement: 'top',
              effect: 'light'
            }
          }, [
            h('span', {
              style: 'font-size: 18px;',
              class: 'h-icon-help'
            })
          ])
        ]
      )
    },
    renderTargetTabelHead(h, { column, $index }) {
      let obj = this.targetTableHeaderList.filter(_ => _.name === column.label)[0]
      return h(
        'div',
        {
          style: 'display: flex; align-items: center;'
        },
        [
          h('span', obj.name),
          h('el-tooltip', {
            props: {
              content: obj.tip,
              placement: 'top',
              effect: 'light'
            }
          }, [
            h('span', {
              style: 'font-size: 18px;',
              class: 'h-icon-help'
            })
          ])
        ]
      )
    },
    changeTabs() {
      if (this.activeTab === 'imageMarkTab') {
        this.getImageMarkResult()
      } else {
        this.getTargetMarkResult()
      }
    },
    init(params) {
      this.searchParams = { ...params, validFlag: false }
      this.getImageMarkResult()
      // this.getTargetMarkResult()
    },
    getImageMarkResult() {
      getImageMarkResult(this.searchParams).then(res => {
        if (res.code === 0 && res.data) {
          this.imageTableData = res.data.rows || []
        }
      })
    },
    getTargetMarkResult() {
      getTargetMarkResult(this.searchParams).then(res => {
        if (res.code === 0 && res.data) {
          this.targetTableData = res.data.rows || []
        }
      })
    },
    close () {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="scss">
.markResultDetailModal{
}
</style>

