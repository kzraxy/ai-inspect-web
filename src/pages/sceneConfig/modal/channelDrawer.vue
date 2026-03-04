<template>
  <h-drawer title="通道选择" :append-to-body="true" custom-class="channelDrawer" direction="btt" :show-close="false"
    size="92%" :visible="visible" @close="close" :modal="false" class="channelDrawer-wrap">
    <div class="addDeviceContainer">
      <div class="addDeviceWrap">
        <div class="addDeviceRight">
          <h-page-container>
            <h-page-content style="padding: 0;">
              <h-page-action class="pageAction">
                <template slot="leftAction">
                  <div class="searchWrap">
                    <el-radio-group style="margin-right: 12px;" type="simple"  v-model="search.useStatus" @change="getListWithResetPage">
                      <el-radio-button label="">全部</el-radio-button>
                      <el-radio-button label="used">已添加</el-radio-button>
                      <el-radio-button label="noUsed">未添加</el-radio-button>
                    </el-radio-group>
                    <div>
                      <selectByPage @onSelect='getClickDataForSearch' style="width:240px" v-if="taskSource==='PATROL'&&serviceType==='hbl'" ref="selectByPage"></selectByPage>
                      <AreaTreeSelect needStore @onSelect='getClickDataForSearch' style="width:240px" :panelWidth="240" v-else></AreaTreeSelect>
                    </div>
                    <div class="channel-add-right-top">
                      <el-select v-model="searchDataType" @change="changeSearch" style="width: 100px;">
                        <el-option  label="设备序列号" value="byDeviceSerial"></el-option>
                        <el-option  label="通道名称" value="byChannelName"></el-option>
                      </el-select>
                      <div class="select_line"></div>
                      <el-input class="input-clearable" :placeholder="searchDataPlaceholder" suffix-icon="h-icon-search" clearable @keyup.enter.native="getListWithResetPage"
                        :on-icon-click="getListWithResetPage" :clear-icon-click="clearSearch" v-model="searchData" style="width:180px;margin-left: -1px;">
                      </el-input>
                    </div>
                  </div>
                </template>
                <template slot="rightAction">
                  <div class="rightAction-content">
                    <el-button :plain="true" @click="changeAllPageChecked(true)" :disabled="!tableData.length || search.useStatus==='used'">添加本页</el-button>
                    <el-button :plain="true" @click="changeAllPageChecked(false)" :disabled="!tableData.length || search.useStatus==='noUsed'">移除本页</el-button>
                    <el-button :plain="true" @click="importChannels" v-show="['retail', 'aiot', 'enterprise'].includes(serviceType)">导入</el-button>
                    <el-button :plain="true" @click="exportChannels" v-show="['retail', 'aiot', 'enterprise'].includes(serviceType)">导出</el-button>
                  </div>
                </template>
              </h-page-action>
              <div class="listWrap">
                <h-page-content style="padding: 0;" v-loading="isLoading">
                  <el-scrollbar v-show="tableData.length" wrap-class="scrollbar-wrap">
                    <div class="cardWrap">
                      <template>
                        <channelCard v-for="(channel, index) in tableData" :key="index" :channelInfo="channel" width="246" :solutionTaskId="solutionTaskId" @refreshOneChannelCard="refreshOneChannelCard"></channelCard>
                      </template>
                    </div>
                  </el-scrollbar>
                  <h-empty v-show="(!tableData.length && !isLoading)" description="暂无数据">
                    <template #img>
                      <img style="width: 400px; height: 206px;" src="@/assets/img/default_List Page no data_nor.svg" alt="默认空态图">
                    </template>
                  </h-empty>
                </h-page-content>
              </div>
              <el-pagination @current-change="handleCurrentChange" @size-change="handleSizeChange" :current-page="search.pageNo" :page-size="search.pageSize"
                :page-sizes="[20, 50, 100]" :layout="pagationLayout" :total="total" :class="{'noUsedPagination': search.useStatus==='noUsed'}">
              </el-pagination>
            </h-page-content>
          </h-page-container>
        </div>
      </div>
      <div class="addDeviceBottom">
        <div class="addDevicBtns">
          <el-button type="primary" @click="finish">完成配置</el-button>
          <el-button type="default" @click="close">上一步</el-button>
        </div>
      </div>
    </div>
    <ExcelUploadEasy ref="excelUpload" :visible.sync="excelUploadShow" @downloadTemplate="downloadTemplate" :otherObj="{taskId: solutionTaskId}" :importProxy="importProxy"></ExcelUploadEasy>
  </h-drawer>
  </template>
  <script>
  import { getAllChannelsPage, getUsedChannelsPage, getNoUsedChannelsPage, addChannels, delChannels, getDownLoadUrl, exportChannels } from '../proxy'
  import channelCard from './channelCard'
  import AreaTreeSelect from '@/components/areaTreeSelect/areaTreeSelect'
  import selectByPage from './selectByPage/index'
  import ExcelUploadEasy from '@/components/excelUpload/easyIndex.vue'
  export default {
    components: {
      channelCard, AreaTreeSelect, selectByPage, ExcelUploadEasy
    },
    props: {
      visible: {
        type: Boolean,
        default: false
      },
      publishStatus: {
        type: String,
        default: 'PUBLISHED'
      },
      taskSource: {
        type: String,
        default: 'SELF'
      },
      defaultGroupId: {
        type: String,
        default: ''
      },
    },
    data () {
      return {
        importProxy: {url: '/v1/event/center/web/solutionTasks/channels/actions/import'},
        excelUploadShow: false,
        search: {
          pageNo: 1,
          pageSize: 50,
          useStatus: '',
          parentId: null,
          orgId: null,
          orgType: null,
          pageType: 'default',
          rowKey: '',
        },
        rowKeyNext: '',
        rowKeyPrev: '',
        total: 0,
        totalPage: 0,
        tableData: [],
        isLoading: false,
        solutionTaskId: '',
        searchDataType: 'byDeviceSerial',
        searchData: ''
      }
    },
    computed: {
      pagationLayout() {
        return this.search.useStatus==='noUsed' ? 'total, sizes, first, prev, next, last' : 'total, sizes, prev, pager, next, jumper'
      },
      searchDataPlaceholder() {
        return this.searchDataType === 'byChannelName' ? '模糊搜索' : '精确搜索'
      }
    },
    methods: {
      importChannels() {
        this.excelUploadShow = true
      },
      exportChannels() {
        exportChannels({ taskId: this.solutionTaskId }).then(res => {
          if(res.code === 0) {
            this.$message.success({
              dangerouslyUseHTMLString: true,
              message: `导出任务已提交，请前往<a href="/chain/index.html#/subMenu/download?time=${new Date().getTime()}" target="_blank" style="color: rgb(32, 128, 247); cursor: pointer;padding:0 4px">导出报表</a>进行下载`
            })
          }
        })
      },
      downloadTemplate () {
        getDownLoadUrl().then(res => {
          if (res.code === 0) {
            window.open(res.data.url)
          }
        })
      },
      clearSearch () {
        this.searchData = ''
        this.tableData = []
        this.getListWithResetPage()
      },
      changeSearch() {
        this.searchData = ''
      },
      changeAllPageChecked(type) {
        let channelIds = type ? this.tableData.filter(item => !item.checked).map(item => item.channelId) : this.tableData.filter(item => item.checked).map(item => item.channelId)
        if (channelIds.length === 0) {
          return false
        }
        let proxy = type ? addChannels : delChannels
        this.isLoading = true
        proxy({ channelIds: channelIds, solutionTaskId:  this.solutionTaskId}).then(res => {
          if (res.code === 0) {
            if (this.search.useStatus === 'used') { // 添加搜索下，对本页操作后，再次查询要查询上一页的数据
              this.search.pageNo = this.search.pageNo === 1 ? 1 : this.search.pageNo - 1
              this.search.pageNo === 1 && this.getList()
            } else if (this.search.useStatus === 'noUsed') { // 未添加搜索下，对本页操作后，再次查询要查询上一页的数据，但上一页要区分首页和尾页进行参数处理
              this.search.pageNo = this.search.pageNo === 1 ? 1 : this.search.pageNo - 1
              this.search.pageType = ['default', 'last'].includes(this.search.pageType) ? this.search.pageType : 'prev'
              this.search.rowKey = ['default', 'last'].includes(this.search.pageType) ? '' : this.rowKeyPrev
              this.search.pageNo === 1 && this.getList()
            } else { 
              this.getList()
            }
          }
        }).finally(() => {
          this.isLoading = false
        })
      },
      init(solutionTaskId) {
        this.solutionTaskId = solutionTaskId
        if (this.taskSource === 'PATROL' && this.serviceType === 'hbl') { // 社区巡查跳转过来，搜索条件仅为有权限的小区或门店，下拉选
         this.$refs.selectByPage.init(this.defaultGroupId, this.solutionTaskId)
        }
      },
      refreshOneChannelCard(channelCardInfo) {
        if (this.tableData.length === 1) { // 操作的是本页仅有的一条数据
          this.search.pageNo = this.search.pageNo === 1 ? 1 : this.search.pageNo - 1
          this.search.pageType = ['default', 'last'].includes(this.search.pageType) ? this.search.pageType : 'prev'
          this.search.rowKey = ['default', 'last'].includes(this.search.pageType) ? '' : this.rowKeyPrev
        }
        this.getList()
      },
      getClickDataForSearch(value)  {
        this.search.orgId = value.groupId
        this.search.orgType = value.groupType
        this.search.parentId = value.parentId
        this.getListWithResetPage()
      },
      finish () {
        if (this.taskSource === 'PATROL') {
          window.close()
        } else {
          this.$router.push({ name: 'sceneConfig', query: { publishStatus: this.publishStatus, taskSource: this.taskSource } })
        }
      },
      reset () {
        this.search = {
          pageNo: 1,
          pageSize: 50,
          useStatus: '',
          parentId: null,
          orgId: null,
          orgType: null,
          pageType: 'default',
          rowKey: '',
        }
        this.searchDataType = 'byDeviceSerial'
        this.searchData = ''
        this.rowKeyNext = '',
        this.rowKeyPrev = '',
        this.tableData = []
        this.total = 0
        this.isLoading = false
      },
      getListWithResetPage () {
        this.search.pageNo = 1
        this.search.rowKey = ''
        this.search.pageType = 'default'
        this.tableData = []
        this.total = 0
        this.getList()
      },
      getNoUsedList() { // 未添加的查询走大数据查询
        this.isLoading = true
        getNoUsedChannelsPage({...this.search, solutionTaskId: this.solutionTaskId}).then(res => {
          if (res.code === 0) {
            this.handleTableData(res.data)
          }
        }).finally(() => {
          this.isLoading = false
        })
      },
      async getList () {
        if (!this.search.orgId) {
          return false
        }
        this.search.channelNameLike = this.searchDataType === 'byChannelName' ? this.searchData : ''
        this.search.devSerial = this.searchDataType === 'byDeviceSerial' ? this.searchData : ''
        if (this.search.useStatus === 'noUsed') {
          this.getNoUsedList()
        } else {
          this.isLoading = true
          let proxy = this.search.useStatus === '' ? getAllChannelsPage : getUsedChannelsPage
          proxy({...this.search, solutionTaskId: this.solutionTaskId}).then(res => {
            if (res.code === 0) {
              this.handleTableData(res.data)
            }
          }).finally(() => {
            this.isLoading = false
          })
        }
      },
      handleTableData(data) {
        this.tableData = data.rows || []
        this.total = data.total || 0
        this.totalPage = data.totalPage || 0
        this.rowKeyPrev = data.rows.length > 0 ? data.rows[0].rowKey : ''
        this.rowKeyNext = data.rows.length > 0 ? data.rows[data.rows.length - 1].rowKey : ''
      },
      handleCurrentChange (val) {
        if (val === 1) {
          this.search.pageType = 'default'
          this.search.rowKey = ''
        } else if (val === this.totalPage) {
          this.search.pageType = 'last'
          this.search.rowKey = ''
        } else if (this.search.pageNo < val) {
          this.search.pageType = 'next'
          this.search.rowKey = this.rowKeyNext
        } else if (this.search.pageNo > val) {
          this.search.pageType = 'prev'
          this.search.rowKey = this.rowKeyPrev
        }
        this.search.pageNo = val
        this.getList()
      },
      handleSizeChange (val) {
        this.search.pageNo = 1
        this.search.pageSize = val
        this.getList()
      },
      clearDevSerial () {
        this.search.devSerial = ''
        this.getListWithResetPage()
      },
      clearChannelName () {
        this.search.clearChannelName = ''
        this.getListWithResetPage()
      },
      close () {
        this.$emit('update:visible', false)
        this.reset()
      },
    }
  }
  </script>
  <style lang="scss" scoped>
  .addDeviceContainer {
    margin: 0 24px;
    height: 100%;
    .channel-add-right-top{
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-left: 12px;
      position: relative;
      .select_line{
        position: absolute;
        width: 1px;
        height: 18px;
        background: #E2E3E6;
        left: 100px;
        z-index: 2;
      }
    }
    .addDeviceWrap {
      display: flex;
      border: 1px solid #EEEFF2;
      border-radius: 8px;
      height: calc(92vh - 80px - 69px);
      .addDeviceRight {
        display: flex;
        flex: 1;
        height: 100%;
        padding: 24px 0 0;
        ::v-deep .pageAction {
          .h-page-action__main {
            height: 36px;
            padding: 0 24px;
            border: none;
          }
        }
        .searchWrap {
          height: 32px;
          display: flex;
          align-items: center;
        }
        ::v-deep .searchInput {
          margin-left:12px;
          .el-input__inner {
            height: 32px;
            background: #FFFFFF;
            border: 1px solid #E2E3E6;
            border-radius: 4px;
          }
        }
        ::v-deep .listWrap {
          display: flex;
          flex-wrap: wrap;
          padding: 24px 0 0 24px;
          height: calc(100% - 100px);
          .scrollbar-wrap {
            height: 100%;
            overflow-x: hidden;
          }
          .cardWrap {
            display: flex;
            flex-wrap: wrap;
          }
        }
        ::v-deep .el-pagination {
          padding: 0 24px;
        }
      }
    }
    .addDeviceBottom {
      height: 80px;
      display: flex;
      align-items: center;
      position: relative;
      .addDevicBtns {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        .el-button {
          height: 36px;
          letter-spacing: 1px;
        }
        .el-button+.el-button {
          margin-left: 12px;
        }
      }
    }
  }
  .addAllDevice-upload-btn{
    display: flex;
    align-items: center;
    cursor: pointer;
    .img{
      width: 14px;
      height: 14px;
      margin-right: 5px;
    }
    .text{
      font-family: MicrosoftYaHeiUI;
      font-size: 14px;
      color: #2080f7;
      letter-spacing: 0;
      font-weight: 400;
    }
  }
  .rightAction-content{
    display: flex;
    .el-btn-t{
      height: 36px;
      letter-spacing: 1px;
      margin-right: 12px;
    }
  }
  </style>
  <style lang="scss">
  .channelDrawer-wrap{
    z-index: 1500 !important;
    background: rgba(0,0,0,0.4);
    .noUsedPagination{
      text-align: right;
      margin-top: 12px;
      .el-pagination__total, .el-pagination__sizes{
        float: left;
      }
      .el-pagination__total{
        margin: 0 8px 0 0
      }
    }
    .channel-add-right-top{
      .el-select{
        .el-input{
          input{
            border-right: none;
            padding-left: 5px;
            padding-right: 18px!important;
          }
          .el-input__suffix{
            right: 0
          }
        }
        .el-input__inner:hover{
          border-color: #b3b3b3;
        }
      }
      .input-clearable{
        input{
          border-left: none;
        }
        .el-input__inner:hover{
          border-color: #b3b3b3;
        }
      }
      .el-input__inner:focus{
        border-color: #b3b3b3;
      }
    }
  }
  .channelDrawer {
    .el-drawer__header {
      font-size: 16px;
      color: rgba(0,0,0,0.90);
      letter-spacing: 0.15px;
      text-align: left;
      line-height: 24px;
      font-weight: 600;
      margin-bottom: 25px;
    }
  }
  .h-sync-tree-select-main {
    .sync-tree-main {
      .el-tree {
        .iconmendian {
          font-size: 20px!important;
        }
      }
    }
  }
  </style>
  