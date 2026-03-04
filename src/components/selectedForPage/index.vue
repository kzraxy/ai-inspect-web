<template>
  <selfSelectTreeOption :maxSelect="maxSelect" :option-data="optionData" v-model="value2" :has-contain="false" :has-header="false" :has-footer="false" 
    class="select_for_page" custom-class="selectedForPage" @panel-change="panelChange" ref="selectTreeOptionForPage" :panelWidthProp="panelWidthProp" 
    :option-search-fn="searchHandle" :loading="pageLoading" :option="options">
    <template slot="pagination">
      <el-pagination small layout="first, prev, miniPager, next, last" :total="total" @current-change="handleCurrentChange" 
        :current-page="search.pageNo" :page-size="search.pageSize" :page-sizes="[10]">
      </el-pagination>
    </template>
  </selfSelectTreeOption>
</template>

<script>
import { getOptionListAPI } from './proxy'
import selfSelectTreeOption from './selfSelectTreeOption'
export default {
  components: { selfSelectTreeOption },
  props: {
    maxSelect: {
      type: Number,
      default: 9999999999
    },
    selectForPageAPI: {
      type: Object,
      default: () => {}
    },
    panelWidthProp: {
      type: Number,
      default: 480
    },
    searchName: {
      type: String,
      default: 'searchKey' // 外部接口需要的搜索名称的key
    },
    options: {
      type: Object,
      default: () => {
        return { value: 'value', name: 'name' }
      }
    }
  },
  data() {
    return {
      pageLoading: false,
      optionData: [],
      value2: {
        values: [],
        datas: []
      },
      search: {
        pageNo: 1,
        pageSize: 10,
      },
      total: 0,
      propSearchParams: {}
    }
  },
  mounted() {
    this.search.pageNo = 1
    // this.getOptionList()
    window.addEventListener('resize', () => {
      this.$refs.selectTreeOptionForPage && this.$refs.selectTreeOptionForPage.closePanel()
    })
  },
  watch: {
    value2(val) {
      this.$emit('selectForPageValues', val)
    }
  },
  methods: {
    setValues(val) {
      this.value2 = val
      this.searchHandle('')
    },
    searchHandle(val) {
      this.search[this.searchName] = val
      this.search.pageNo = 1
      this.getOptionList()
    },
    panelChange(flag) {
      if (!flag) {
        this.search.pageNo = 1
      }
    },
    getOptionList() {
      this.pageLoading = true
      let api = { ...this.selectForPageAPI }
      api.params = { ...this.selectForPageAPI.params, ...this.search }
      getOptionListAPI(api).then(res => {
        if (res.code === 0) {
          let data = res.data.rows || []
          this.optionData = data
          this.total = res.data.total
        }
        this.pageLoading = false
      })
    },
    handleCurrentChange(val) {
      this.search.pageNo = val
      this.getOptionList()
    }
  }
}
</script>
<style lang="scss">
.selectedForPage{
  .h-option-panel-content-left{
    width: 0;
    border: 0;
    opacity: 0;
    width: 0!important;
  }
  .h-option-panel-content-right{
    width: 100%!important;
  }
}
</style>
<style lang="scss" scoped>
.select_for_page{
  width: 100%;
}
</style>
