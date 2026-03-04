<template>
  <div class="retrieval_compare">
    <div class="head_wrap">
      <div class="left_wrap">
        <div :class="{'title':true,'active':searchForm.publishStatus==='PUBLISHED'}" @click="changeTab('PUBLISHED')">已发布</div>
        <div class="split"></div>
        <div :class="{'title':true,'active':searchForm.publishStatus==='UNPUBLISHED'}" @click="changeTab('UNPUBLISHED')">未发布</div>
      </div>
      <div class="right_wrap">
        <el-input v-model="searchForm.imageLibraryName" placeholder="输入图库名称搜索" suffix-icon="h-icon-search" class="right_search" clearable
          :on-icon-click="search" :clear-icon-click="clearIconClick" @keyup.enter.native="search"></el-input>
          <el-button type="primary" @click="addNew" style="width: 120px;height: 38px;margin-left: 16px;border-radius: 4px;">新建设备图库</el-button>
      </div>
    </div>
    <div class="listWrap">
      <el-scrollbar wrap-class="demo-scrollbar-wrap">
        <div class="cardWrap">
          <publishCard v-for="(item, index) in tableData" :key="index" :cardInfo="item" :publishStatus="searchForm.publishStatus" @showDevices="handleShowDevice"  
            @refresh="resetSearch" @updateName="updateNameHandler" libraryType="EDGE"></publishCard>
        </div>
      </el-scrollbar>
      <h-empty v-show="!tableData.length" description="暂无发布图库" style="margin-top: 10%;">
        <template #img>
          <img class="emptyImg" src="@/assets/img/default_no data_nor.svg" alt="默认空态图">
        </template>
      </h-empty>
      <div style="width:100%;padding-right:18px">
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :page-sizes="[20, 50, 100]" :current-page="searchForm.pageNo"
          :page-size="searchForm.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>
      </div>
    </div>
    <publishDevicesDialog :visible.sync="publishDevicesDialogVisible" :cardInfo="cardInfo" :defaultStatus="defaultStatus" @refresh="resetSearch"></publishDevicesDialog>
    <addMapModal :visible.sync="addMapModalVisible" @refresh="resetSearch" @addMapSuccess="addMapSuccess" libraryType="EDGE"></addMapModal>
  </div>
</template>
  
<script>
import publishCard from './modal/publishCard'
import addMapModal from './modal/addMapModal'
import publishDevicesDialog from './modal/publishDevicesDialog'
import { pageImageLibraryList } from './proxy'
export default {
  components: {
    publishCard, publishDevicesDialog, addMapModal
  },
  data() {
    return {
      cardInfo: {},
      publishDevicesDialogVisible: false,
      addMapModalVisible: false,
      tableData: [],
      defaultStatus: '',
      total: 0,
      searchForm: {
        pageSize: 20,
        pageNo: 1,
        libraryType: 'EDGE',
        imageLibraryName: '',
        publishStatus: 'PUBLISHED', // 已发布 PUBLISHED, 未发布 UNPUBLISHED
      }
    }
  },
  mounted() {
    
  },
  methods: {
    initData(isReset) {
      if (this.$route.query && this.$route.query.publishStatus === 'UNPUBLISHED') {
        this.searchForm.publishStatus = 'UNPUBLISHED'
      }
      isReset ? this.resetSearch() : this.search()
    },
    async search() {
      let res = await pageImageLibraryList(this.searchForm)
      if (res.code === 0) {
        this.tableData = res.data.rows || []
        this.total = res.data.total
      }
    },
    handleSizeChange (val) {
      this.searchForm.pageNo = 1
      this.searchForm.pageSize = val
      this.search()
    },
    handleCurrentChange (val) {
      this.searchForm.pageNo = val
      this.search()
    },
    changeTab(val) {
      this.searchForm.publishStatus = val
      this.$router.replace({ name: 'retrievalCompare', query: { libraryType: 'EDGE', publishStatus:val } })
      this.resetSearch()
    },
    clearIconClick() {
      this.resetSearch()
    },
    addNew() {
      this.addMapModalVisible = true
    },
    addMapSuccess(data) {
      this.$router.push({ name: 'editCompareMap',query: { libraryType: 'EDGE', imageLibraryId: data, publishStatus: 'UNPUBLISHED'} })
    },
    updateNameHandler (row) {
      this.tableData.forEach(val => {
        if (val.id === row.id) {
          val.name = row.name
        }
      })
    },
    resetSearch() {
      this.tableData = []
      this.total = 0
      this.searchForm.pageNo = 1
      this.search()
    },
    handleShowDevice (card, defaultStatus) {
      this.defaultStatus = defaultStatus
      this.cardInfo = card
      this.cardInfo.imageLibraryId = card.id
      this.publishDevicesDialogVisible = true
    },
  }
}
</script>
<style lang="scss">
.retrieval_compare{
  .demo-scrollbar-wrap {
    // height: calc(100vh - 170px);
    height: calc(100vh - 194px);
    padding-bottom: 30px;
  }
  .el-tabs__content{
    padding-bottom: 0px;
    border-bottom: 0;
  }
  .head_wrap{
    .right_wrap{    
      .right_search{
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
    }
  }
  .h-empty .emptyImg {
    width: 400px;
    height: 206px;
  }
}
</style>
<style lang="scss" scoped>
.retrieval_compare{
  .head_wrap{
    height: 48px;
    margin: 0px 24px 8px 36px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .left_wrap{
      display: flex;
      align-items: center;
      .title{
        font-family: MicrosoftYaHeiUISemibold;
        font-size: 18px;
        color: rgba(0,0,0,0.90);
        font-weight: 600;
        cursor: pointer;
      }
      .active{
        color: #2080f7;
      }
      .split{
        width: 1px;
        height: 20px;
        margin: 0 24px;
        background: #D8D8D8;
      }
    }
    .right_wrap{
      display: flex;
      align-items: center;
      align-items: flex-end;
      .right_search{
        width: 240px;
        height: 38px
      }
    }
  }
}
::v-deep .listWrap {
  display: flex;
  flex-wrap: wrap;
  padding: 0 8px 0 24px;
  height: calc(100% - 36px);
  &.show-del{
    padding: 16px 8px 24px 24px;
  }
  .scrollbar-wrap {
    height: 100%;
    overflow-x: hidden;
  }
}
.cardWrap {
  display: flex;
  flex-wrap: wrap;
}
</style>
