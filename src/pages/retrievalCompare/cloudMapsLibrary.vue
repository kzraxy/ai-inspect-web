<template>
  <div class="retrieval_compare_cloud">
    <div class="head_wrap">
      <div class="left_wrap">
        <!-- <div :class="{'title':true,'active':searchForm.publishStatus==='PUBLISHED'}" @click="changeTab('PUBLISHED')">已发布</div>
        <div class="split"></div>
        <div :class="{'title':true,'active':searchForm.publishStatus==='UNPUBLISHED'}" @click="changeTab('UNPUBLISHED')">未发布</div> -->
      </div>
      <div class="right_wrap">
        <el-input v-model="searchForm.imageLibraryName" placeholder="输入图库名称搜索" suffix-icon="h-icon-search" class="right_search" clearable
          :on-icon-click="search" :clear-icon-click="clearIconClick" @keyup.enter.native="search"></el-input>
          <el-button type="primary" @click="addNew" style="width: 120px;height: 38px;margin-left: 16px;border-radius: 4px;">新建云端图库</el-button>
      </div>
    </div>
    <div class="listWrap">
      <el-scrollbar wrap-class="demo-scrollbar-wrap">
        <div class="cardWrap">
          <publishCard v-for="(item, index) in tableData" :key="index" :cardInfo="item" publishStatus="UNPUBLISHED" @showTasks="showTasks" 
            @refresh="resetSearch" @updateName="updateNameHandler" libraryType="CLOUD"></publishCard>
        </div>
      </el-scrollbar>
      <h-empty v-show="!tableData.length" description="暂无图库" style="margin-top: 10%;">
        <template #img>
          <img class="emptyImg" src="@/assets/img/default_no data_nor.svg" alt="默认空态图">
        </template>
      </h-empty>
      <div style="width:100%;padding-right:18px">
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :page-sizes="[20, 50, 100]" :current-page="searchForm.pageNo"
          :page-size="searchForm.pageSize" layout="total, sizes, prev, pager, next, jumper":total="total">
        </el-pagination>
      </div>
    </div>
    <tasksDialog :visible.sync="tasksDialogVisible" :cardInfo="cardInfo" @refresh="resetSearch"></tasksDialog>
    <addMapModal :visible.sync="addMapModalVisible" @refresh="resetSearch" @addMapSuccess="addMapSuccess" libraryType="CLOUD"></addMapModal>
  </div>
</template>
  
<script>
import publishCard from './modal/publishCard'
import addMapModal from './modal/addMapModal'
import tasksDialog from './modal/tasksDialog'
import { pageImageLibraryList } from './proxy'
export default {
  components: {
    publishCard, tasksDialog, addMapModal
  },
  data() {
    return {
      cardInfo: {},
      tasksDialogVisible: false,
      addMapModalVisible: false,
      tableData: [],
      total: 0,
      searchForm: {
        pageSize: 20,
        pageNo: 1,
        libraryType: 'CLOUD',
        imageLibraryName: '',
        publishStatus: 'UNPUBLISHED', // 已发布 PUBLISHED, 未发布 UNPUBLISHED，云端不涉及该概念，沿用设备的，都先设置为UNPUBLISHED吧
      }
    }
  },
  mounted() {
  },
  methods: {
    initData(isReset) {
      // this.resetSearch()
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
      this.$router.replace({ name: 'retrievalCompare', query: { libraryType: 'CLOUD', publishStatus:val } })
      this.resetSearch()
    },
    clearIconClick() {
      this.resetSearch()
    },
    addNew() {
      this.addMapModalVisible = true
    },
    addMapSuccess(data) {
      this.$router.push({ name: 'editCompareMap',query: { libraryType: 'CLOUD', imageLibraryId: data, publishStatus: 'UNPUBLISHED' } })
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
    showTasks (card) {
      this.cardInfo = card
      this.cardInfo.imageLibraryId = card.id
      this.tasksDialogVisible = true
    },
  }
}
</script>
<style lang="scss">
.retrieval_compare_cloud{
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
.retrieval_compare_cloud{
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
