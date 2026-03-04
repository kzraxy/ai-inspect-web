<template>
  <div class="sceneConfig">
    <div class="head_wrap">
      <div class="left_wrap">
        <div :class="{'title':true,'active':searchForm.publishStatus==='PUBLISHED'}" @click="changeTab('PUBLISHED')">启用（{{taskInfo.enableCount}}）</div>
        <div class="split"></div>
        <div :class="{'title':true,'active':searchForm.publishStatus==='UNPUBLISHED'}" @click="changeTab('UNPUBLISHED')">禁用（{{taskInfo.disableCount}}）</div>
      </div>
      <div class="right_wrap">
        <el-input v-model="searchForm.taskNameLike" placeholder="输入任务名称搜索" suffix-icon="h-icon-search" class="right_search" clearable
          :on-icon-click="resetSearch" :clear-icon-click="clearIconClick" @keyup.enter.native="resetSearch">
        </el-input>
        <chooseSceneModal @chooseSceneCard="chooseSceneCard"></chooseSceneModal>
      </div>
    </div>
    <div class="listWrap" v-loading="isLoading">
      <el-scrollbar wrap-class="scrollbar-wrap-task" v-if="tableData.length">
        <div class="cardWrap">
          <publishCard
            v-for="(item, index) in tableData" :key="index" :cardInfo="item" :publishStatus="searchForm.publishStatus" @showDevices="handleShowDevice"  
            @deleteOne="deleteOne" @updateName="updateNameHandler" @changeEnableStatus="changeEnableStatus" :taskSource="searchForm.taskSource"
          ></publishCard>
        </div>
      </el-scrollbar>
      <h-empty v-if="!tableData.length" description="暂无数据">
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
    <div v-draggable.sticky class="volume-mod" @mouseenter="()=>{useDesVisible=true}" @mouseleave="()=>{useDesVisible=false}">
      <div class="left">
        <div class="l_title">已购路数使用情况</div>
        <div class="l_num">
          <div class="use">{{ serviceManageInfo.usedAmount }}</div>
          <div>/{{ serviceManageInfo.authAmount }}</div>
        </div>
      </div>
      <div class="right">
        <div class="yindao_wrap" v-show="useDesVisible"></div>
      </div>
    </div>
    <channelDialog :visible.sync="channelDialogVisible" :cardInfo="cardInfo" @refreshOne="refreshOne" :publishStatus="searchForm.publishStatus" :taskSource="searchForm.taskSource"></channelDialog>
  </div>
</template>
  
<script>
import publishCard from './modal/publishCard'
import chooseSceneModal from './modal/chooseSceneModal'
import channelDialog from './modal/channelDialog'
import { getSolutionTaskList, getSolutionTaskConfigInfo, getEnableDisableCount } from './proxy'
import { getServiceManageInfo } from '@/api/serviceManage'
import guideModal from '@/components/guide/main.vue'
export default {
  components: {
    publishCard, channelDialog, chooseSceneModal, guideModal
  },
  beforeRouteEnter (to, from, next) {
    to.meta.isBack = (['editSceneTask'].includes(from.name))
    next()
  },
  activated () {
    if (!this.$route.meta.isBack) {
      this.resetSearch() // 重置查询条件
    } else {
      this.$route.meta.isBack = false
      this.getList()
    }
    this.getServiceManage()
  },
  data() {
    return {
      taskInfo: {
        enableCount: 0,
        disableCount: 0
      },
      useDesVisible: false,
      cardInfo: {},
      channelDialogVisible: false,
      searchForm: {
        taskSource: 'SELF', // PATROL是从连锁跳转来的，SELF是智能分析自己的
        taskNameLike: '',
        publishStatus: 'PUBLISHED', // 启用 PUBLISHED, 禁用 UNPUBLISHED
        pageSize: 50,
        pageNo: 1,
      },
      tableData: [],
      total: 0,
      isLoading: false,
      serviceManageInfo: {authAmount:0,usedAmount:0}
    }
  },
  mounted() {
    this.getSolutionTaskNums() // 获取启用禁用总数
    this.getServiceManage() // 获取路数使用情况
    this.initData()
  },
  methods: {
    getSolutionTaskNums() {
      getEnableDisableCount({taskSource: this.searchForm.taskSource}).then(res => {
        if (res.code === 0) {
          this.taskInfo = res.data
        }
      })
    },
    deleteOne(row) {
      // let index = this.tableData.findIndex(item => item.solutionTaskId === row.solutionTaskId)
      // this.tableData.splice(index, 1)
      this.getList()
      this.getSolutionTaskNums()
      this.getServiceManage()
    },
    refreshOne(row) {
      getSolutionTaskConfigInfo({ solutionTaskId: row.solutionTaskId }).then(res => {
        if (res.code === 0) {
          let index = this.tableData.findIndex(item => item.solutionTaskId === row.solutionTaskId)
          this.tableData.splice(index, 1, { ...this.cardInfo, ...row, ...res.data })
          this.getServiceManage()
        }
      })
    },
    getServiceManage() {
      getServiceManageInfo().then(res => {
        if (res.code === 0 && res.data && res.data.rows && res.data.rows.length) {
          let obj = res.data.rows.filter(item => item.authCode === 2410)
          this.serviceManageInfo = obj.length > 0 ? obj[0] : {authAmount:0,usedAmount:0}
        }
      })
    },
    changeEnableStatus(row) {
      // let index = this.tableData.findIndex(item => item.solutionTaskId === row.solutionTaskId)
      // this.tableData.splice(index,1)
      this.getList()
      this.getSolutionTaskNums()
      this.getServiceManage()
    },
    chooseSceneCard(item) { // 新建任务，选择了场景后
      this.$router.push({ name: 'editSceneTask',query: { solutionId: item.solutionId, publishStatus: this.searchForm.publishStatus, taskSource: this.searchForm.taskSource, addType: 'add', solutionTaskId: ''} })
    },
    initData() {
      this.searchForm.publishStatus = this.$route.query.publishStatus || 'PUBLISHED'
      this.searchForm.taskSource = this.$route.query.taskSource || 'SELF'
      this.resetSearch()
    },
    async getList() {
      this.isLoading = true
      this.searchForm.status = this.searchForm.publishStatus === 'PUBLISHED' ? 1 : 2
      getSolutionTaskList(this.searchForm).then(res => {
        if (res.code === 0) {
          this.tableData = res.data.rows || []
          this.total = res.data.total
        }
      }).finally(() => {
        this.isLoading = false
      })
    },
    handleSizeChange (val) {
      this.searchForm.pageNo = 1
      this.searchForm.pageSize = val
      this.getList()
    },
    handleCurrentChange (val) {
      this.searchForm.pageNo = val
      this.getList()
    },
    changeTab(val) {
      this.searchForm.publishStatus = val
      this.searchForm.taskNameLike = ''
      this.$router.replace({ name: 'sceneConfig', query: { publishStatus:val, taskSource: this.searchForm.taskSource } })
      this.resetSearch()
    },
    clearIconClick() {
      this.searchForm.taskNameLike = ''
      this.resetSearch()
    },
    updateNameHandler (row) {
      this.tableData.forEach(val => {
        if (val.solutionId === row.solutionId) {
          val.name = row.name
        }
      })
    },
    resetSearch() {
      this.searchForm.pageNo = 1
      this.tableData = []
      this.total = 0
      this.getList()
    },
    handleShowDevice (card, useStatus) {
      this.cardInfo = card
      this.cardInfo.useStatus = useStatus
      this.channelDialogVisible = true
    },
  }
}
</script>
<style lang="scss">
.sceneConfig{
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
.sceneConfig{
  height: calc(100vh - 64px);
  .head_wrap{
    height: 76px;
    margin: 0px 24px 0px 36px;
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
  .volume-mod {
    position: fixed;
    right: 24px;
    bottom: 72px;
    width: 231px;
    height: 96px;
    background: #FFFFFF;
    border: 1px solid #E8EAEC;
    box-shadow: 0 4px 18px 0 rgba(0,0,0,0.10);
    border-radius: 16px;
    z-index: 1003;
    cursor: move;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    .left{
      .l_title{
        color: #999999;
        height: 20px;
        line-height: 20px;
      }
      .l_num{
        font-size: 14px;
        color: #141414;
        height: 36px;
        display: flex;
        align-items: flex-end;
        .use{
          font-size: 22px;
          color: #141414;
          font-weight: 400;
          line-height: 26px;
        }
      }
    }
    .right{
      width: 76px;
      height: 76px;
      background: url('~@/assets/img/lushu.png') no-repeat;
      background-size: 100% 100%;
      position: relative;
    }
    .yindao_wrap{
      position: absolute;
      right: -16px;
      top: -138px;
      width: 332px;
      height: 130px;
      background: url('~@/assets/img/scene/tipsBg.png') no-repeat;
      background-size: 100% 100%;
    }
  }
}
::v-deep .listWrap {
  display: flex;
  flex-wrap: wrap;
  padding: 0 8px 4px 24px;
  height: calc(100% - 112px);
  border-bottom: 1px solid #e0e0e0;
  &.show-del{
    padding: 16px 8px 24px 24px;
  }
  .scrollbar-wrap-task {
    height: 100%;
    overflow-x: hidden;
    padding-bottom: 30px
  }
}
.cardWrap {
  display: flex;
  flex-wrap: wrap;
}
</style>
