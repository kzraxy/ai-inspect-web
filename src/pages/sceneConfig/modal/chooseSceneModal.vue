<template>
  <div>
    <el-popover
      popper-class="scene_panel"
      placement="bottom-end"
      ref="popoverMenuPanel"
      width="870"
      @show="menuPopShow"
      @hide="menuPopHide"
      :visible-arrow="false"
      trigger="manual"
      v-model="visible"
      >
      <div id="scenePopPanel" class="container" v-loading="loading" v-clickoutside="close">
        <div class="search_wrap">
          <div class="title">场景模版</div>
          <!-- <SelfAutocomplete class="search-input" v-model="searchParams.solutionName" :fetch-suggestions="querySearch" :clear-icon-click="clearSearch"
            placeholder="输入场景名称搜索" @select="initSearch" kind="surface" ref='solutionName' popperClass="modelPoolAutocomplete" noMatch="未搜索到相关内容，请尝试其他搜索词">
            <i class="h-icon-search" style="font-size: 24px; color:rgba(0,0,0,0.70);" slot="prefix"></i>
          </SelfAutocomplete> -->
          <el-input v-model="searchParams.solutionName" placeholder="输入场景名称搜索" suffix-icon="h-icon-search" class="right_search" clearable
            :on-icon-click="initSearch" :clear-icon-click="clearSearch" @keyup.enter.native="initSearch">
          </el-input>
        </div>
        <div class="scene_search">
          <SearchTag v-for="(item,index) in industryList" :key="index" @chooseTag="chooseTag" :tag="item" :chooseTagId="searchParams.industry" style="flex-shrink: 0;"></SearchTag>
        </div>
        <el-scrollbar wrap-class="demo-scrollbar-wrap-2">
          <div class="card_wrap" v-show="solutionList.length">
            <div class="card" v-for="(item,index) in solutionList" :key="index" @click="cardlick(item)"
              :style="{'backgroundImage': handleBg(item),'backgroundSize':'200px 52px','background-repeat':'no-repeat'}">
              <div class="top_text" >{{ item.solutionName }}</div>
              <div class="bot_text ellipsis" :title="item.description">{{ item.description }}</div>
            </div>
          </div>
          <div v-show="!solutionList.length" class="empty"><div class="emptybg"></div><div class="emptytext">暂无数据</div></div>
        </el-scrollbar>
      </div>
    </el-popover>
    <div v-popover:popoverMenuPanel>
      <el-button type="primary" @click="visible = !visible" style="width: 120px;height: 38px;margin-left: 16px;border-radius: 4px;">新建任务</el-button>
    </div>
  </div>
</template>

<script>
import { getIndustryList, searchSolutionKeyList, getSolutionPage } from '../proxy'
import SelfAutocomplete from '@/components/autocomplete/index.js'
import SearchTag from './searchTag.vue'
import Clickoutside from 'hui/src/utils/clickoutside'
export default {
  components: { SearchTag, SelfAutocomplete },
  directives: { Clickoutside },
  data () {
    return {
      loading: false,
      industryList: [{ id: '', name: '全部' }],
      visible: false,
      searchParams: {
        industry: '',
        solutionName: '',
        pageSize: 999,
        pageNo: 1,
        needCustomization: false
      },
      restaurants: [],
      solutionList:'',
    }
  },
  methods: {
    clearSearch () {
      this.searchParams.solutionName = ''
      this.initSearch()
    },
    querySearch (queryString, cb) {
      var restaurants = this.restaurants
      var results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants
      // 调用 callback 返回建议列表的数据
      results = (!results || results.length === 0) ? [] : results
      cb(results)
    },
    createFilter (queryString) {
      return restaurant => {
        return restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) >= 0
      }
    },
    searchSolutionKeyList () {
      searchSolutionKeyList().then(res => {
        if (res.code === 0) {
          let arr = res.data.map(item => {
            return {
              value: item.solutionName,
              address: item.id
            }
          })
          this.restaurants = arr
        }
      })
    },
    handleBg(item) {
      let sceneBg = item.cardImageUrl ? item.cardImageUrl : 'default'
      return sceneBg.includes('http')?`url(${sceneBg})`:'url(' + `${this.staticResourceOrigin}/static/userManual/poseidon/assets/img/scence/${sceneBg}/miniCardbg.png` + ')'
    },
    getIndustryList () {
      getIndustryList().then(res => {
        if (res.code === 0 && res.data && res.data.length) {
          let arr = res.data.map(item => {
            return { id: item, name: item }
          })
          this.industryList = [{ id: '', name: '全部' }].concat(arr)
          this.searchParams.industry = this.industryList[0].id
        }
      })
    },
    async chooseTag (val) {
      this.searchParams.industry = val.id
      this.initSearch()
    },
    cardlick(item) {
      this.visible = false
      this.$emit('chooseSceneCard', item)
    },
    menuPopShow () {
      this.getIndustryList() 
      // this.searchSolutionKeyList()
      this.initSearch()
    },
    menuPopHide () {
      this.searchParams.solutionName = ''
      this.searchParams.industry = ''
      this.industryList = []
      this.$emit('menuPopHide')
    },
    initSearch () {
      this.loading = true
      getSolutionPage(this.searchParams).then(res => {
        if (res.code === 0) {
          this.solutionList = res.data.rows || []
          this.solutionList.forEach(item => item.solutionId = item.id)
        }
        this.loading = false
      })
    },
    close() {
      this.visible = false
    }
  }
}
</script>
<style lang="scss">
.modelPoolAutocomplete{
  background: #fff;
  z-index: 3000!important;
  .el-autocomplete-suggestion__item{
    &:hover{
      font-weight: 400!important;
    }
  }
  .el-autocomplete__nodata{
    height: 40px;
    line-height: 40px!important;
  }
  .el-autocomplete-suggestion__item:nth-child(1){
    margin-top: 12px;
  }
   .el-autocomplete-suggestion__item:nth-last-child(1){
    margin-bottom: 12px;
  }
  .el-autocomplete-suggestion__wrap{
    border-bottom: none;
  }
  .el-autocomplete-suggestion__item{
    margin: 0 12px;
    border-radius: 2px;
    height: 40px;
    line-height: 40px;
    &:hover{
      color: #2080f7;
      background: rgba(30,127,255,0.05);
      border-radius: 2px;
      font-weight: 600;
    }
  }
  .el-autocomplete__nodata {
    min-height: 22px;
    line-height: 22px;
    text-align: left;
    margin-left: 20px;
  }
}
.scene_panel {
  padding: 0!important;
  margin-top: 12px!important;
}
#scenePopPanel{
  .demo-scrollbar-wrap-2 {
    max-height: 412px;
  }
  // .input_search{
  //   width: 240px;
  //   height: 38px;
  //   .el-input__inner{
  //     height: 38px;
  //   }
  //   .el-input__prefix .el-input__icon, .el-input__suffix .el-input__icon{
  //     top: 4px;
  //   }
  //   .h-icon-close_f.is-clickable{
  //     top: 8px;
  //   }
  // }
}
</style>
<style lang="scss" scoped>
::v-deep .right_search{
  width: 240px;
  height: 38px;
  border-radius: 20px;
  .h-icon-close_f{
    top: 8px;
    color: rgba(0,0,0,0.4);
  }
  .el-input__prefix {
    top: 8px;
    left: 8px;
  }
  .el-input{
   .el-input__inner{
      background-color: #fff;
      height: 40px;
      padding-left: 40px!important;
      border-radius: 20px;
      box-shadow: 0 0 12px 0 rgba(0,0,0,0.06);
      border: 1px solid transparent;
      &:focus, &:active {
        border: 1px solid #388EFF;
      }
    }
  }
}
::v-deep  .right_search{
  input{
    height: 38px;
  }
  .el-input__prefix, .el-input__suffix{
    top: 8px;
  }
  .h-icon-close_f.is-clickable{
    top: 8px;
  }
}
.scene_search{
  display: flex;
  flex-wrap: wrap;
  min-height: 32px;
  margin-top: 6px;
  margin-bottom: 10px;
  padding-right: 16px;
}
.empty{
  width: 120px;
  margin: 0 auto 24px;
  .emptybg{
    width: 120px;
    height: 120px;
    background: url('~@/assets/img/no_data.png') no-repeat;
    background-size: 100% 100%;
  }
  .emptytext{
    text-align: center;
    color: #ccc;
  }
}
.card_wrap{
  display: flex;
  flex-wrap: wrap;
  .card{
    width: 200px;
    height: 94px;
    background: #FFFFFF;
    border: 1px solid #EEEFF2;
    border-radius: 8px;
    margin-bottom: 12px;
    margin-right: 12px;
    position: relative;
    cursor: pointer;
    &:hover{
      border: 1px solid rgba(30,127,255,0.40);
      box-shadow: 0 16px 30px 0 rgba(0,0,0,0.10);
    }
    .top_text{
      display: flex;
      align-items: center;
      width: 100%;
      height: 52px;
      font-family: MicrosoftYaHeiUISemibold;
      font-size: 14px;
      color: #FFFFFF;
      font-weight: 600;
      padding-left: 12px;
    }
    .bot_text{
      max-width: 190px;
      background: #FFFFFF;
      border-bottom-left-radius: 6px;
      border-bottom-right-radius: 6px;
      height: 40px;
      line-height: 40px;
      padding-left: 12px;
      font-family: MicrosoftYaHeiUI;
      font-size: 12px;
      color: rgba(103,103,103,0.72);
    }
  }
}
.container {
  padding: 16px 0 16px 16px;
  position: relative;
  // max-height: 530px;
  max-height: 675px;
  .search_wrap{
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-right: 16px;
    .title{
      font-family: MicrosoftYaHeiUISemibold;
      font-size: 16px;
      color: rgba(0,0,0,0.90);
      font-weight: 600;
      line-height: 38px;
    }
  }
}
.title {
  font-family: MicrosoftYaHeiUISemibold;
  font-size: 20px;
  color: #000000;
  font-weight: 600;
  height: 28px;
  margin-bottom: 12px;
}
</style>
