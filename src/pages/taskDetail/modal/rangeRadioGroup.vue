<template>
<div>
  <el-radio-group ref="rangeRadioGroup" v-model="range">
    <el-radio ref="rangeRadio0" label="BY_DAY">按天导出</el-radio>
    <el-radio ref="rangeRadio1" label="BY_NUMBER">按数量导出</el-radio>
  </el-radio-group>
  <br/>
</div>
</template>
<script>
export default {
  name: 'RangeRadioGroup',
  components: {},
  data () {
    return {
      range: 'BY_DAY',
    }
  },
  methods: {}
}
</script>
<style lang="scss" scoped>
</style>
