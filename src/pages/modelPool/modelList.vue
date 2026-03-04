<template>
  <div class="model_pool">
    <div class="head_wrap" id="head">
      <div class="serch_wrap">
        <SelfAutocomplete class="search-input" v-model="abilityName" :fetch-suggestions="querySearch" :clear-icon-click="clearSearch"
          placeholder="搜索模型名称" @select="handleSelect" kind="surface" ref='abilityName' popperClass="modelPoolAutocomplete" noMatch="未搜索到相关内容，请尝试其他搜索词">
          <i class="h-icon-search" style="font-size: 24px; color:rgba(0,0,0,0.70);" slot="prefix"></i>
        </SelfAutocomplete>
      </div>
    </div>
    <div class="search_wrap">
      <div class="line line1">
        <div class="title">行业类型：</div>
        <SearchTag v-for="(item,index) in tradeSearchList" :key="index" @chooseTag="chooseTag" :tag="item" :chooseTagId="industry"></SearchTag>
      </div>
      <div class="line line1">
        <div class="title">平台类型：</div>
        <SearchTag v-for="(item,index) in platformSearchList" :key="index" @chooseTag="chooseTag" :tag="item" :chooseTagId="platformType"></SearchTag>
      </div>
      <div class="line line1">
        <div class="title">是否可自主进化：</div>
        <el-radio-group v-model="supportAutoLearning" @change="initSearch">
          <el-radio :label="1">是</el-radio>
          <el-radio :label="0">否</el-radio>
        </el-radio-group>
      </div>
    </div>
    <div class="content" v-loading="loading">
      <div v-if="cardList.length">
        <div class="content_wrap">
          <div class="inner">
            <div class="card_item" v-for="(item,index) in cardList" :key="index">
              <div class="card_head_wrap" @mouseenter="changeCover(index,true)" @mouseleave="changeCover(index,false)"
              :style="{'backgroundImage':'url(' + `${staticResourceOrigin}/static/userManual/poseidon/assets/img/modelPool/${item.cardImageUrl}/fm.jpg` + ')'}">
                <div class="c_h_cover" v-show="item.showCover">
                  <div class="c_h_btn_wrap">
                    <div class="btn btn1" @click="goToDetail(item)">详情</div>
                    <div class="btn btn2" @click="bind(item)" v-show="item.avaliable">使用</div>
                  </div>
                </div>
                <div class="right_top_icon" v-show="!item.avaliable"></div>
                <div class="c_tag_wrap">
                  <div v-for="(labelItem,labelIndex) in item.headLabelInfo" :key="labelIndex" class="tag">
                    <div v-show="labelItem.length<4" class="normalTag">{{labelItem}}</div>
                    <div v-show="labelItem.length===4" class="muchNorTag"><div>{{labelItem.substr(0,2)}}</div><div>{{labelItem.substr(2,2)}}</div></div>
                  </div>
                  <div v-show="item.supportAutoLearning!==0" class="tag selfTag"></div>
                </div>
                <div class="head_bottom_wrap">
                  <div v-for="(botItem,botIndex) in item.platformTypeNames" :key="botIndex" class="bot_tag">{{botItem}}</div>
                </div>
              </div>
              <div class="card_bottom_wrap">
                <div class="title">{{item.abilityName}}</div>
                <div class="main_label_wrap">
                  <div v-for="(mainLabelItem,mainLabelIndex) in item.labelInfo" :key="mainLabelIndex" class="main_lable_tag">{{mainLabelItem.labelName}}</div>
                  <div class="right_cover"></div>
                </div>
                <div class="c_b_content" :title="item.description">{{item.description}}</div>
              </div>
            </div>
          </div>
        </div>
        <el-pagination @current-change="handleCurrentChange" :page-size="12" :current-page="pageNo" layout="prev, pager, next" :total="totalNum" style="margin-bottom:40px;text-align:center"></el-pagination>
      </div>
      <div v-else class="empty_div">
        <div class="empty"></div>
        <div class="empty_text">抱歉，未搜索到相关能力。请尝试其他搜索词</div>
      </div>
    </div>
  </div>
</template>
<script>
import SearchTag from './modal/searchTag.vue'
import SelfAutocomplete from '@/components/autocomplete/index.js'
import { getIndustryList, getPlatformTypeList, searchKeyList, searchModelPool, bindModel } from './proxy'
export default {
  name: 'modelList',
  components: { SearchTag, SelfAutocomplete },
  data () {
    return {
      loading: false,
      pageNo: 1,
      totalNum: 0,
      cardList: [], // 搜索出的内容
      tradeSearchList: [{ id: '', name: '全部' }],
      platformSearchList: [{ id: '', name: '全部' }],
      supportAutoLearning: 0, // 搜索条件：是否可自主进化，默认否
      industry: '', // 搜索条件：当前选择的行业类型
      platformType: '', // 搜索条件：当前选择的平台类型
      restaurants: [],
      abilityName: ''
    }
  },
  mounted () {
    this.getIndustryList()// 获取行业搜索项
    this.getPlatformTypeList()// 获取平台搜索项
    this.initSearch()
    this.searchKeyList()
    // this.restaurants = this.searchKeyList()// 获取头部搜索模型池下拉数据
  },
  methods: {
    goToDetail (item) {
      window.open(`${location.origin}${location.pathname}#/intelligent/modelPool/${this.serviceType}/detail/${item.id}/${this.serviceType}`, '_blank')
    },
    bind (item) {
      bindModel({ domainId: item.id }).then(res => {
        if (res.code === 0) {
          this.$message.success('操作成功！')
        }
      })
    },
    getPlatformTypeList () {
      getPlatformTypeList().then(res => {
        if (res.code === 0) {
          this.platformSearchList = []
          let arr = res.data.map(item => {
            return {
              id: item.platformType.join(','),
              name: item.name,
              tip: item.description
            }
          })
          this.platformSearchList = [{ id: '', name: '全部' }].concat(arr)
          this.platformSearchList.forEach((item) => { item.type = 'platform' })
          this.platformType = this.platformSearchList[0].id
        }
      })
    },
    getIndustryList () {
      getIndustryList().then(res => {
        if (res.code === 0) {
          this.tradeSearchList = []
          let arr = res.data.map(item => {
            return {
              id: item,
              name: item
            }
          })
          this.tradeSearchList = [{ id: '', name: '全部' }].concat(arr)
          this.tradeSearchList.forEach((item) => { item.type = 'trade' })
          this.industry = this.tradeSearchList[0].id
        }
      })
    },
    async chooseTag (val) {
      this.industry = val.type === 'trade' ? val.id : this.industry
      this.platformType = val.type === 'platform' ? val.id : this.platformType
      this.initSearch()
    },
    changeCover (index, flag) {
      this.cardList[index].showCover = flag
      this.$forceUpdate()
    },
    search () {
      let params = { industry: this.industry, platformType: this.platformType, pageNo: this.pageNo, pageSize: 12, supportAutoLearning: this.supportAutoLearning, abilityName: this.abilityName }
      this.loading = true
      searchModelPool(params).then(res => {
        this.loading = false
        if (res.code === 0) {
          this.cardList = res.data.rows || []
          this.cardList.forEach(item => {
            item.headLabelInfo = this.handleHeadLabel(item.algorithmType)
            item.showCover = false
            item.cardImageUrl = item.cardImageUrl ? item.cardImageUrl : 'default'
            if (item.algorithmType === 3 && item.labelInfo) { // 混合算法时，如果有第二层labelInfo，展示第二层，没有则展示第一层labelInfo
              let arr = []
              item.labelInfo.forEach(citem => {
                if (!citem.labelInfo) {
                  arr.push(citem)
                } else {
                  citem.labelInfo.forEach(val => {
                    arr.push(val)
                  })
                }
                item.labelInfo = arr
              })
            }
            item.labelInfo = item.labelInfo ? item.labelInfo : [{ labelName: '暂无标签' }]
          })
          this.totalNum = res.data.total
          // document.getElementById('head').scrollIntoView()
        }
      })
    },
    handleLabelInfo (item) {
      let arr = (item.labelInfo && item.labelInfo.length) ? this.handleLabelInfo(item.labelInfo) : item
      return arr
    },
    handleHeadLabel (algorithmType) {
      let obj = { 1: '分类', 2: '检测', 3: '混合', 4: 'OCR', 25: 'OCR', 34: '编排', 55: '多模态' }
      return obj[algorithmType] ? [obj[algorithmType]] : []
    },
    handleCurrentChange (val) {
      this.pageNo = val
      this.search()
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
    handleSelect (item) {
      this.abilityName = item.value
      this.initSearch()
    },
    initSearch () { // 页码重置为1
      this.pageNo = 1
      this.search()
    },
    clearSearch () {
      this.abilityName = ''
      this.initSearch()
    },
    searchKeyList () {
      searchKeyList({ key: '' }).then(res => {
        if (res.code === 0) {
          let arr = res.data.map(item => {
            return {
              value: item.abilityName,
              address: item.id
            }
          })
          this.restaurants = arr
        // return arr
        }
      })
    }
  }
}
</script>
<style lang="scss">
.modelPoolAutocomplete{
  background: #fff;
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
.model_pool{
  .demo-scrollbar-wrap{
    height: 100%;
    overflow-x: hidden;
  }
  .head_wrap{
  }
}
</style>
<style lang="scss" scoped>
@import "./style.scss";
</style>
