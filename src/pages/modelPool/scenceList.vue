<template>
<div class="scence-list">
  <div class="head_wrap" id="head">
    <div class="serch_wrap">
      <SelfAutocomplete class="search-input" v-model="solutionName" :fetch-suggestions="querySearch" :clear-icon-click="clearSearch"
        placeholder="搜索" @select="handleSelect" kind="surface" ref='solutionName' popperClass="modelPoolAutocomplete" noMatch="未搜索到相关内容，请尝试其他搜索词">
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
      <div class="title">是否定制：</div>
      <SearchTag v-for="(item,index) in needCustomizations" :key="index" @chooseTag="chooseNeedCustomization" :tag="item" :chooseTagId="needCustomization"></SearchTag>
    </div>
  </div>
  <div class="content" v-loading="loading">
    <div v-if="cardList.length">
      <div class="content_wrap">
        <div class="inner">
          <div class="card_item" v-for="(item,index) in cardList" :key="index">
            <div class="card_head_wrap" @mouseenter="changeCover(index,true)" @mouseleave="changeCover(index,false)"
            :style="{'backgroundImage':item.imageUrl.includes('http')?`url(${item.imageUrl})`: 'url(' + `${staticResourceOrigin}/static/userManual/poseidon/assets/img/scence/${item.imageUrl}/fm.png` + ')'}">
              <div class="c_h_cover" v-show="item.showCover">
                <div class="c_h_btn_wrap">
                  <div class="btn btn1" @click="goToDetail(item)">详情</div>
                  <div class="btn btn2" @click="bind(item)" style="width:96px" v-show="!item.needCustomization">立即试用</div>
                </div>
              </div>
              <div class="right_top_icon" v-show="item.needCustomization"></div>
              <div class="superscript">
                <div v-for="(tags, tagindex) in item.industry" :key="tagindex" class="tags">{{ tags }}</div>
              </div>
            </div>
            <div class="card_bottom_wrap">
              <div class="title">{{item.solutionName}}</div>
              <div class="main_label_wrap">
                <div v-for="(mainLabelItem,mainLabelIndex) in item.industry" :key="mainLabelIndex" class="main_lable_tag">{{mainLabelItem}}</div>
                <div class="right_cover"></div>
              </div>
              <div class="c_b_content" :title="item.description">{{item.description}}</div>
            </div>
          </div>
          <div class="more-card-wrap">
            <div class="more-card">
              <img src="@/assets/img/modelPool/scence/illustaror_code_sm@2x.png" alt="">
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="empty_div">
      <div class="empty"></div>
      <div class="empty_text">抱歉，请尝试其他搜索词，或者主动发起场景建议</div>
      <el-button @click="showConsultDialog">联系我们</el-button>
    </div>
  </div>
  <consultDialog v-model="consultDialogVisible"></consultDialog>
</div>
</template>
<script>
import SearchTag from './modal/searchTag.vue'
import SelfAutocomplete from '@/components/autocomplete/index.js'
import consultDialog from './modal/consultDialog.vue'
import { getAllIndustry, getSolutionList, getSolutionPage } from './proxy'
export default {
  name: 'scenceList',
  components: {
    SearchTag,
    SelfAutocomplete,
    consultDialog
  },
  data () {
    return {
      loading: false,
      pageNo: 1,
      totalNum: 0,
      cardList: [], // 搜索出的内容
      solutionName: '',
      tradeSearchList: [{ id: '', name: '全部' }],
      industry: '', // 搜索条件：当前选择的行业类型
      needCustomizations: [
        {
          name: '全部',
          id: '-1'
        },
        {
          name: '定制',
          id: true
        },
        {
          name: '非定制',
          id: false
        }
      ],
      needCustomization: '-1', // 搜索条件：是否定制
      restaurants: [],
      consultDialogVisible: false
    }
  },
  mounted () {
    this.getAllIndustry()// 获取行业搜索项
    this.initSearch()
    this.getSolutionList()
  },
  methods: {
    showConsultDialog () {
      this.consultDialogVisible = true
    },
    goToDetail (item) {
      window.open(`${location.origin}${location.pathname}#/intelligent/modelPool/${this.serviceType}/scenceDetail/${item.id}/${this.serviceType}`, '_blank')
    },
    bind (item) {
      window.open(`${location.origin}${location.pathname}#/intelligent/sceneConfig/editSceneTask?solutionId=${item.id}&publishStatus=PUBLISHED&taskSource=SELF&addType=add&solutionTaskId=`, '_blank')
    },
    changeCover (index, flag) {
      this.cardList[index].showCover = flag
      this.$forceUpdate()
    },
    getAllIndustry () {
      getAllIndustry().then(res => {
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
    chooseNeedCustomization (val) {
      this.needCustomization = val.id
      this.initSearch()
    },
    async chooseTag (val) {
      this.industry = val.type === 'trade' ? val.id : this.industry
      this.initSearch()
    },
    search () {
      let params = { industry: this.industry, pageNo: this.pageNo, pageSize: 9999, solutionName: this.solutionName }
      if (this.needCustomization !== '-1') {
        params.needCustomization = this.needCustomization
      }
      this.loading = true
      getSolutionPage(params).then(res => {
        this.loading = false
        if (res.code === 0) {
          this.cardList = res.data.rows || []
          this.cardList.forEach(item => {
            item.showCover = false
            item.imageUrl = item.imageUrl ? item.imageUrl : 'default'
            item.industry = item.industry ? item.industry : ['暂无行业']
          })
          this.totalNum = res.data.total
        }
      }).finally(() => {
        this.loading = false
      })
    },
    handleCurrentChange (val) {
      this.pageNo = val
      this.search()
    },
    handleSelect (item) {
      this.solutionName = item.value
      this.initSearch()
    },
    initSearch () { // 页码重置为1
      this.pageNo = 1
      this.search()
    },
    clearSearch () {
      this.solutionName = ''
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
    getSolutionList () {
      getSolutionList({ key: '' }).then(res => {
        if (res.code === 0) {
          let arr = res.data.map(item => {
            return {
              value: item.solutionName,
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
<style lang="scss" scoped>
@import "./style.scss";
.scence-list {
  .head_wrap {
    .serch_wrap {
      width: 600px;
      margin: 0 auto;
    }
  }
  .search_wrap{
    width: 1200px;
    margin: 24px auto;
    .line{
      display: flex;
      align-items: center;
      height: 32px;
      margin-bottom: 12px;
      &>div{
        flex-shrink: 0
      }
      .title{
        font-family: MicrosoftYaHeiUISemibold;
        font-size: 14px;
        color: rgba(0,0,0,0.70);
        font-weight: 600;
      }
    }
  }
  .empty_div{
    width: 100%;
    height: calc(100vh - 276px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .empty{
      width: 112px;
      height: 112px;
      background: url(../../assets/img/nodata.svg) no-repeat;
      background-size: contain;
    }
    .empty_text{
      color: rgba(0,0,0,0.70);
      margin-top: 30px;
    }
    .el-button {
      margin-top: 10px;
    }
  }
  .content_wrap{
    width: 1200px;
    margin: 0 auto;
    .inner{
      width: 1230px;
      display: flex;
      flex-wrap: wrap;
    }
    .card_item{
      width: 380px;
      height: 380px;
      background-color: #fff;
      border-radius: 4px;
      border-radius: 4px;
      margin-bottom: 30px;
      margin-right: 30px;
      position: relative;
      cursor: pointer;
      &:hover {
        box-shadow: 0 0 12px 0 rgba(0,0,0,0.10);
      }
      .card_bottom_wrap{
        width: 100%;;
        padding-top: 24px;
        overflow: hidden;
        .c_b_content{
          width: 100%;
          padding: 0 24px;
          overflow:hidden;
          text-overflow:ellipsis;
          display:-webkit-box;
          -webkit-box-orient:vertical;
          -webkit-line-clamp:2;
          color: rgba(0,0,0,0.70);;
        }
        .main_label_wrap{
          height: 28px;
          margin:16px 20px 12px 24px;
          display: flex;
          align-items: center;
          overflow: hidden;
          position: relative;
          .right_cover{
            position: absolute;
            width: 20px;
            height: 100%;
            right: 0;
            top: 0;
            background-image: linear-gradient(to right, transparent, #fff);
          }
          .main_lable_tag{
            flex-shrink: 0;
            height: 28px;
            border-radius: 2px;
            font-size: 12px;
            color: rgba(0,0,0,0.50);
            padding: 5px 8px;
            margin-left: 8px;
            background: rgba(0,0,0,0.04);
            border: 1px solid rgba(0,0,0,0.12);
            border-radius: 4px;
          }
          .main_lable_tag:nth-of-type(1){
            margin-left: 0;
          }
        }
        .title{
          font-family: MicrosoftYaHeiUISemibold;
          font-size: 16px;
          color: rgba(0,0,0,0.90);
          height: 24px;
          line-height: 24px;
          font-weight: 600;
          width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          padding: 0 24px;
        }
      }
      .card_head_wrap{
        width: 100%;
        height: 214px;
        position: relative;
        background-size: cover;
        overflow: hidden;
        .superscript{
          position: absolute;
          right: 16px;
          top: 16px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          .tags{
            background: #225CFF;
            border-radius: 4px;
            height: 22px;
            line-height: 22px;
            text-align: center;
            padding: 0 6px;
            font-size: 12px;
            color: #FFFFFF;
            margin-left: 8px;
          }
        }
        .c_h_cover{
          position: absolute;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,.5);
          border-radius: 4px 4px 0 0;
          display: flex;
          align-items: center;
          justify-content: center;
          .c_h_btn_wrap{
            display: flex;
            align-items: center;
            justify-content: center;
            .btn{
              width: 80px;
              height: 40px;
              line-height: 40px;
              text-align: center;
              cursor: pointer;
              border-radius: 24px;
              font-family: MicrosoftYaHeiUISemibold;
              font-size: 16px;
              font-weight: 600;
            }
            .btn1{
              background: #eee;
              color: #000000;
            }
            .btn2{
              background: #2080f7;
              margin-left:20px;
              color: #FFFFFF;
            }
          }
        }
        .right_top_icon{
          width: 90px;
          height: 90px;
          position: absolute;
          background: url(~@/assets/img/modelPool/scence/label_operate@2x.png) no-repeat;
          background-size: contain;
          right: 0;
          top: 0;
        }
      }
    }
    .more-card-wrap {
      width: 388px;
      height: 224px;
      margin-left: -4px;
      margin-bottom: 30px;
      background: #FFFFFF;
      border-radius: 4px;
      cursor: pointer;
      &:hover {
        box-shadow: 0 0 12px 0 rgba(0,0,0,0.10);
      }
    }
    .more-card {
      height: 100%;
      background-color: #e0daff;
      width: 100%;
      >img {
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>
