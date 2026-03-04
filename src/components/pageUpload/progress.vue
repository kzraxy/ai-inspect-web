<template>
  <div class="material-progress-bar" v-bind:style="pcolor">
    <div class="progress-bar-inner" v-bind:style="pstyle"></div>
    <div class="tipsWarp" v-if="row.uploadState === 'wait'">等待上传...</div>
    <div class="tipsWarp" v-else-if="row.uploadState === 'runing'">上传中...({{row.percent}}%)</div>
    <div class="tipsWarp" v-else-if="row.uploadState === 'success'">上传成功</div>
    <div class="tipsWarp" v-if="row.uploadState === 'error'">上传失败:{{row.message}}({{row.percent}}%)</div>
  </div>
</template>
<script>
export default {
  props: {
    row: { // 文件上传进度
      type: Object,
      default: () => {
        return {
          percent: 0,
          uploadState: 'wait',
          message: ''
        }
      }
    }
  },
  computed: {
    pcolor () {
      const mirror = {
        wait: '#888',
        runing: '#888',
        success: '#333',
        error: '#333'
      }
      return {
        color: mirror[this.row.uploadState]
      }
    },
    pstyle () {
      const mirror = {
        wait: {
          // background: 'rgba(48,116,214,0.04)'
          background: ''
        },
        runing: {
          // background: 'rgba(2,191,15,0.1)'
          background: ''
        },
        success: {
          // background: 'rgba(2,191,15,0.5)'
          background: ''
        },
        error: {
          // background: 'rgba(255,0,0,0.75)'
          background: ''
        }
      }
      const map = {
        width: `${this.row.percent}%`
      }
      const mirrormap = mirror[this.row.uploadState]
      return { ...map, ...mirrormap }
    }
  },
  data () {
    return {}
  },
  mounted () {},
  methods: {}
}
</script>
<style lang="scss" scoped>
  .material-progress-bar{
    position: relative;
    height: 100%;
    width: 100%;
    .tipsWarp{
      position: absolute;
      left:0;
      right: 0;
      top:0;
      bottom:0;
      z-index: 99;
      font-size: 12px;
      display: flex;
      justify-content: space-between;
      padding: 0 8px;
      align-items: center;
    }
    .progress-bar-inner{
      height: 100%;
      // background: rgba(2,191,15,0.25);
    }
  }
</style>
<style lang="scss">
  .fileListPart{
    .progressStyle{
      padding: 0 !important;
      .cell{
        height: 100%;
        padding: 0;
        .label{
          height: 100%;
        }
      }
    }
  }
</style>