<template>
  <div v-loading="loading"></div>
</template>

<script>
import { getJumpInfo } from '@/api/layout'
export default {
  data () {
    return {
      loading: true,
      query: {}
    }
  },
  async mounted () {
    this.$store.commit('setShowLeftMenu', false)
    this.query = this.$route.query
    this.judgeRedirect()
  },
  methods: {
    judgeRedirect() {
      if (this.query.aiUrl === 'sceneConfig') {
        getJumpInfo({ solutionTaskId: this.query.solutionTaskId }).then(res => {
          if (res.code === 0) {
            if (res.data.jumpType === 'rule') { // rule 跳转运营助手
              let obj = {
                'retail': `${location.origin}/chain/index.html#/operation/assistant?jumpId=${res.data.jumpId}`,
                'hbl': `${location.origin}/neptune/index.html#/Wisdomiot/OperationAssistant?jumpId=${res.data.jumpId}`
              }
              window.location.href = obj[this.serviceType]
            } else { // solutionTask 跳转智能分析的场景配置页
              let planSelf = this.query.planSelf ? this.query.planSelf : ''
              window.location.href = `${location.origin}${location.pathname}#/intelligent/sceneConfig/editSceneTask?solutionId=${this.query.solutionId}&publishStatus=${this.query.publishStatus}&taskSource=${this.query.taskSource}&addType=${this.query.addType}&solutionTaskId=${this.query.solutionTaskId}&planSelf=${planSelf}`
            }
          } else {
            this.loading = false
          }
        })
      } else {
        // 后续其他跳转，注意左侧菜单的显隐
        // this.$store.commit('setShowLeftMenu', true)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
