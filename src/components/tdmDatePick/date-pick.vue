<template>
  <div class="date-pick">
    <el-radio-group v-model="filter.dateType" type="simple" @change='dateTypeChange' style="display:flex">
      <!-- 如果要用原有样式，el-radio-button外层的div要去掉，否则选中的右边框有样式问题，如果有需求写成两份区分吧 -->
      <div><el-radio-button :label="0">按时</el-radio-button></div>
      <div><el-radio-button :label="1" v-if='byDay'>按天</el-radio-button></div>
      <div><el-radio-button :label="2" v-if='byMonth'>按月</el-radio-button></div>
    </el-radio-group>
    <el-date-picker
      class="date-pick-datepicker"
      :style="{'width': datePickWith + 'px'}"
      v-model="filter.dataDate"
      :type="{0: 'date', 1: 'daterange', 2: 'daterange'}[filter.dateType]"
      :picker-options='pickerOptions'
      :clearable='false'
      placeholder="请选择日期"
      @input='emitChange'/>
  </div>
</template>

<script>
import { pickerOptions } from './picker-option.js'
import { lastMonthDay } from '@/plugin/utils/util'
import { getDate } from '@/plugin/utils/util.js'
export default {
  data () {
    return {
      filter: {
        dateType: 0,
        dataDate: new Date()
      },
      byDay: true,
      byMonth: true,
      datePickWith: 240
    }
  },
  computed: {
    pickerOptions () {
      return pickerOptions[this.filter.dateType]
    }
  },
  watch: {
    filter: {
      handler (val) {
        if (val.dateType !== undefined || val.dataDate) {
          this.emitChange()
        }
      },
      immediate: true
    }
  },
  methods: {
    dateTypeChange (val) {
      this.filter.dataDate = val === 0 ? new Date() : val === 1 ? [new Date(), new Date()] : [lastMonthDay, new Date()]
      this.emitChange()
    },
    emitChange () {
      const _params = this.filter.dateType === 0
        ? { dateType: this.filter.dateType, queryDate: getDate(this.filter.dataDate) }
        : { dateType: this.filter.dateType, startDate: getDate(this.filter.dataDate[0]), endDate: getDate(this.filter.dataDate[1]) }
      this.$emit('change', _params)
    },
    reset () {
      this.filter = {
        dateType: 0,
        dataDate: new Date()
      }
      this.emitChange()
    }
  }
}

</script>

<style lang='scss' scoped>
  .date-pick {
    display: flex;
    align-items: center;

    .date-pick-datepicker {
      width: 240px;
      margin: 0 0px 0 16px;
    }
  }
</style>
