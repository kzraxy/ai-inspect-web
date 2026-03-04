<template>
  <div>
    <div class="confidenceThresholdDom">
      <span class='fontBorder'>置信度</span>
      <el-tooltip popper-class="filter_tooltip" placement="top">
        <div slot="content">
          置信度表示算法检测结果的可信程度，值越大代表算法结果的可信程度越高。系统默认过滤置信度低于70%的算法检测结果，该阈值可根据实际情况灵活调整，可选范围是10%-100%
        </div>
        <i class="h-icon-help" style="font-size: 20px;cursor: pointer;"></i>
      </el-tooltip>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
    }
  },
  mounted () {
  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>
.confidenceThresholdDom{
  display: flex;
  align-items: center;
  border:1px solid #b3b3b3;
  height: 32px;
  // border-right:none;
  padding: 0 2px 0 6px
}
.fontBorder{
  color: #4d4d4d;
}
</style>
