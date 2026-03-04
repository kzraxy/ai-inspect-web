<template>
  <el-dialog title="全量识别报文" :visible="visible" @close="close" :area="[880,640]">
    <json-viewer :value="displayPic.allTargetInfo" copyable :preview-mode="true" :expanded="true" :show-double-quotes="true" :show-array-index="false">
      <template slot="copy">
        <el-button icon="h-icon-copy" plain>全部复制</el-button>
      </template>
    </json-viewer>
  </el-dialog>
</template>

<script>
import JsonViewer from 'vue-json-viewer'
export default {
  components: { JsonViewer },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    displayPic: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
    }
  },
  watch: {
    visible (val) {
      if (val) {
      }
    },
  },
  methods: {
    close () {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
