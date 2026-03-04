<template>
  <h-page-container @click.native="hideTips()" id="baseMapManage">
    <h-page-header slot="pageHeader" :breadcrumb="breadcrumb" />
    <h-layout>
      <div class="main_wrap">
        <div class="tips_img" v-show="showTips">
          <div class="tips_text">{{ `请先选择具体${applicationSceneName}，再查看相应内容` }}</div>
        </div>
        <resizeBox ref="resizeBox" :defaultW="280" :minW="280" :maxW="620" @widthChanged="changeResizeBox">
          <div class="left_part">
            <div class="tree_div">
              <treeAnsySearch ref="treeAnsySearch" :treeAnsyProps=treeAnsyProps :storeListProps=storeListProps :isInitSelected="false"  @getClickData="getClickData"
              top="5" treeW="100%" treeBot="0" :placeHolder="`请输入${applicationSceneName}名称搜索`" @hideTips="hideTips"></treeAnsySearch>
            </div>
          </div>
        </resizeBox>
        <div class="right_part" ref="rightPart">
          <div class="search_wrap">
            <div class="table_top_left">
              <el-button icon="h-icon-add" :plain="true" @click="addBaseMap" style="margin-right: 4px;">添加</el-button>
              <el-button icon="h-icon-setting" :plain="true" @click="batchSet">批量设置</el-button>
            </div>
            <div class="table_top_right">
              <el-select v-model="searchParams.missionStatus" filterable @change="changeMissionStatus" style="width:170px" clear>
                <el-option v-for="(item,index) in statusList" :key="index" :label="item.statusName" :value="item.statusId"></el-option>
              </el-select>
              <el-input v-model.trim="searchParams.channelName" placeholder="请输入通道名称搜索" suffix-icon="h-icon-search" clearable
              style="margin-left:12px;width:240px" :clear-icon-click="clearChannelName" :on-icon-click="getList"/>
            </div>
          </div>
          <div class="table_wrap">
            <el-table height="100%" force-scroll :data="tableData" show-overflow-title v-loading="loading">
              <el-table-column prop="channelPresetName" label="通道-预置点"></el-table-column>
              <el-table-column prop="bgImgNumber" label="图片数量"></el-table-column>
              <el-table-column prop="missionStatus" label="抓图状态">
                <template slot-scope="scope">{{transfer(scope.row.missionStatus)}}</template>
              </el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button @click="edit(scope.row)" type="iconButton" icon="h-icon-edit" title="编辑" class="table_btn"></el-button>
                  <el-button @click="del(scope.row)" type="iconButton" icon="h-icon-delete" title="删除" class="table_btn"></el-button>
                </template>
              </el-table-column>
              <!-- <div slot="empty" class="empty_table">
                <div class="empty_img"></div>
                <div>暂无结果</div>
              </div> -->
            </el-table>
          </div>
          <el-pagination slot="pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="searchParams.pageNo"
            :page-sizes="[20, 50, 100]" :page-size="searchParams.pageSize" layout="total, sizes, prev, pager, next, jumper"
            :total="total">
          </el-pagination>
        </div>
      </div>
      <addPreModal :visible.sync="addPreVisible" @choiceAdd="choiceAdd"></addPreModal>
      <batchSetModal :visible.sync="batchSetVisible" :taskType="taskForm.taskType" :taskAnalysisMode="taskForm.analysisMode" :taskId="taskForm.taskId"
      @flash="getList"></batchSetModal>
    </h-layout>
  </h-page-container>
</template>

<script>
import { getMissionList, deleteMission } from './proxy'
import treeAnsySearch from '@/components/treeAnsySearch'
import addPreModal from './modal/addPreModal'
import batchSetModal from './modal/batchSetModal'
import resizeBox from '@/components/resizeBox'
export default {
  components: {
    treeAnsySearch, addPreModal, batchSetModal, resizeBox
  },
  data () {
    return {
      showTips: true,
      taskForm: { taskType: 'CLOUD', analysisMode: 'POLLING_SNAP', taskId: '' },
      breadcrumb: ['底图库'],
      treeAnsyProps: {
        method: 'get',
        url: '/v1/inspect/taskconfig/taskConfigs/orgsForLine',
        params: {}
      },
      storeListProps: {
        method: '',
        url: '/v1/inspect/taskconfig/taskConfigs/orgs/actions/getByNameLike',
        params: {}
      },
      statusList: [{ statusId: 'ALL', statusName: '全部' }, { statusId: 'READY', statusName: '未执行' }, { statusId: 'FAIL', statusName: '失败' }, { statusId: 'PROGRESS', statusName: '执行中' }, { statusId: 'FINISH', statusName: '已完成' }, { statusId: 'UNFINISHED', statusName: '未完成' }],
      goodsId: '',
      searchParams: {
        missionStatus: 'ALL',
        channelName: '',
        pageNo: 1,
        pageSize: 20
      },
      total: 0,
      tableData: [],
      loading: false,
      recordId: '',
      addPreVisible: false,
      batchSetVisible: false,
      groupId: '',
      groupType: ''
    }
  },
  beforeRouteEnter (to, from, next) {
    to.meta.isBack = (from.name === 'baseMapConfig')
    next()
  },
  activated () {
    this.showTips = true
    if (!this.$route.meta.isBack) {
      this.tableData = []
      this.$refs.treeAnsySearch.clearClick()
      this.$refs.treeAnsySearch.getTree()
      this.groupId = ''
      this.resetData(true)
    } else {
      this.$route.meta.isBack = false
      this.getList()
    }
  },
  methods: {
    changeMissionStatus() {
      if(!this.searchParams.missionStatus) {
        this.searchParams.missionStatus = "ALL"
      }
      this.getList()
    },
    changeResizeBox() {
      this.$nextTick(() => {
        let w = this.$refs.resizeBox.width
        this.$refs.rightPart.style = `width: calc(100% - ${w+30}px);`
      })
    },
    hideTips () {
      this.showTips = false
    },
    transfer (missionStatus) {
      return this.statusList.filter(item => { return item.statusId === missionStatus })[0].statusName
    },
    batchSet () {
      this.batchSetVisible = true
    },
    addBaseMap () {
      this.addPreVisible = true
    },
    choiceAdd (missionId, deviceSerial) {
      this.goBaseMapConfig('add', missionId, deviceSerial)
    },
    edit (row) {
      this.goBaseMapConfig('edit', row.missionId, row.deviceSerial)
    },
    goBaseMapConfig (type, missionId, deviceSerial) {
      this.$router.push({ name: 'baseMapConfig', params: { type: type, id: missionId, deviceSerial: deviceSerial, serviceType: this.serviceType } })
    },
    del (row) {
      this.$confirm('是否确认删除所选任务？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'question'
      }).then(() => {
        deleteMission({ deleteId: row.missionId }).then(res => {
          if (res.code === 0) {
            this.$message.success('删除成功！')
            this.getList()
          }
        })
      }).catch(() => {})
    },
    getClickData (value) {
      this.hideTips()
      this.groupId = value.groupId
      this.groupType = value.groupType
      this.getList()
    },
    clearChannelName () {
      this.searchParams.channelName = ''
      this.searchParams.pageNo = 1
      this.getList()
    },
    getList () {
      if (!this.groupId) {
        return false
      }
      this.loading = true
      getMissionList({
        groupId: this.groupId,
        groupType: this.groupType,
        ...this.searchParams }).then(res => {
        this.loading = false
        if (res.code === 0) {
          this.tableData = res.data.rows || []
          this.total = res.data.total || 0
        }
      })
    },
    handleSizeChange (val) {
      this.searchParams.pageSize = val
      this.searchParams.pageNo = 1
      this.getList()
    },
    handleCurrentChange (val) {
      this.searchParams.pageNo = val
      this.getList()
    },
    resetData (noFreshData) { // 重置
      this.searchParams.missionStatus = 'ALL'
      this.searchParams.channelName = ''
      this.searchParams.pageSize = 20
      this.searchParams.pageNo = 1
      if (!noFreshData) {
        this.getList()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.main_wrap{
  position:relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  height: calc(100vh - 90px);
  padding: 0 12px 0 2px;
  .tips_img{
    position: absolute;
    width: 300px;
    height: 70px;
    top:90px;
    left:100px;
    background: url('../../assets/img/illustaror_tips@2x.png') no-repeat;
    background-size: contain;
    z-index: 2;
    .tips_text{
      position: absolute;
      top: 33px;
      left: 50px;
      font-size: 14px;
      color: #2182F7;
    }
  }
  .left_part{
    // width: 300px;
    width: 100%;
    height: 100%;
    border-right: 1px solid #e0e0e0;
    .tree_div{
      width: 100%;
      height: 100%;
    }
  }
  .right_part{
    flex: 1;
    // width: 100%;
    width: calc(100% - 310px);
    margin-left: 12px;
    .search_wrap{
      display: flex;
      align-items: center;
      justify-content: space-between;
      height:56px;
      .table_top_left{
        width: 400px;
      }
      .table_top_right{
        display: flex;
        align-items: center
      }
    }
  }
}
.table_wrap{
  height: calc(100vh - 200px);
}
.empty_table{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.empty_img{
  width: 80px;
  height: 80px;
  // background: url(../../assets/images/resultEmpty.png) no-repeat;
  // background-size: cover;
  margin-bottom: 16px
}
</style>
