<template>
  <div class="retrieval_compare">
    <el-tabs v-model="activeName" @tab-click="handleClick" type="border-card">
      <el-tab-pane label="云端图库" name="CLOUD">
        <cloudMapsLibrary ref="CLOUD"></cloudMapsLibrary>
      </el-tab-pane>
      <el-tab-pane label="设备图库" name="EDGE">
        <deciceMapsLibrary ref="EDGE"></deciceMapsLibrary>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
  
<script>
import deciceMapsLibrary from './deviceMapsLibrary'
import cloudMapsLibrary from './cloudMapsLibrary'
export default {
  components: {
    cloudMapsLibrary, deciceMapsLibrary
  },
  beforeRouteEnter (to, from, next) {
    to.meta.isBack = (['editCompareMap'].includes(from.name))
    next()
  },
  activated () {
    let resetSearchFlag = !this.$route.meta.isBack // 重置查询条件
    this.$refs[this.activeName].initData(resetSearchFlag)
  },
  data() {
    return {
      activeName: 'CLOUD',
    }
  },
  mounted() {
    if (!Object.keys(this.$route.query).length ) { // 从其他模块首次进入
      this.$router.replace({ name: 'retrievalCompare', query: { libraryType: 'CLOUD', publishStatus: 'UNPUBLISHED' } })
    }
    this.activeName = this.$route.query.libraryType
    // this.$refs[this.activeName].initData()
  },
  methods: {
    handleClick() {
      let publishStatus = this.activeName === 'CLOUD' ? 'UNPUBLISHED' : 'PUBLISHED'
      this.$router.replace({ name: 'retrievalCompare', query: { libraryType: this.activeName, publishStatus: publishStatus} })
      this.$refs[this.activeName].initData()
    },
  }
}
</script>
<style lang="scss">
.retrieval_compare{
  .el-tabs__content{
    padding: 8px 0 0;
  }
}
</style>
