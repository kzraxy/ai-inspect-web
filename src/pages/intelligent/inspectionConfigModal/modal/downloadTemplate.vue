<template>
  <div >
  </div>
</template>

<script>
import { exportChannelTask, getExportChannelUrl } from '../../proxy'
export default {
  props: {
  },
  data () {
    return {
      loading: null,
      percentageText: '导出中...',
      exportTaskId: '', // 导出任务的id
    }
  },
  watch: {
    percentageText (val) {
      this.loading.text = val
    }
  },
  methods: {
    save (params) {
      this.loading = this.$loading({ fullscreen: true, text: this.percentageText, customClass: 'export_fullscreen' })
      exportChannelTask(params).then((res) => {
        if (+res.code === 0 && res.data) {
          this.exportTaskId = res.data || ''
          this.getExportUrl()
          this.close()
        } else {
          this.loading.close()
        }
      })
    },
    getExportUrl () {
      getExportChannelUrl({ exportTaskId: this.exportTaskId }).then(result => {
        if (+result.code === 0) {
          this.percentageText = '导出中...，已完成' + result.data.process + '%'
          if (result.data.exportStatus === 'SUCCESS') { // 完成了导出
            this.loading.close()
            window.open(result.data.downloadUrl)
          } else if (result.data.exportStatus === 'PROCESS') { // 还是导出中，每一秒再请求一次
            setTimeout(() => {
              this.getExportUrl()
            }, 1000)
          } else if (result.data.exportStatus === 'FAIL') { // 后端传回状态导出失败
            this.loading.close()
            this.$message.error(result.data.failMessage)
          }
        }
      })
    },
  }
}
</script>

<style lang="scss" scoped>
</style>
