<template>
  <!-- <el-dialog custom-class="channelDialog" title="通道选择" :visible="visible":area="[928,687]" @close="close" @open="hanldeOpen"> -->
  <el-dialog custom-class="channelDialog" title="通道选择" :visible="visible":area="[1080,687]" @close="close" @open="hanldeOpen">
    <div class="devicesWrap">
      <div class="pageAction">
        <div class="leftAction">
          <div class="searchWrap">
            <el-radio-group style="margin-right: 12px;" type="simple" v-model="search.useStatus" @change="changeUseStatus">
              <el-radio-button label="">全部</el-radio-button>
              <el-radio-button label="used">已添加</el-radio-button>
              <el-radio-button label="noUsed">未添加</el-radio-button>
            </el-radio-group>
            <AreaTreeSelect needStore @onSelect='getClickDataForSearch' style="width:160px" :panelWidth="240" v-if="visible"></AreaTreeSelect>
            <div class="channel-add-right-top">
              <el-select v-model="searchDataType" @change="changeSearch" style="width: 100px;">
                <el-option  label="设备序列号" value="byDeviceSerial"></el-option>
                <el-option  label="通道名称" value="byChannelName"></el-option>
              </el-select>
              <div class="select_line"></div>
              <el-input class="input-clearable" :placeholder="searchDataPlaceholder" suffix-icon="h-icon-search" clearable @keyup.enter.native="getListWithResetPage"
                :on-icon-click="getListWithResetPage" :clear-icon-click="clearSearch" v-model="searchData" style="width:147px;margin-left:-1px">
              </el-input>
            </div>
          </div>
        </div>
        <div class="rightAction">
          <div class="devicesBtns">
            <el-button :plain="true" @click="changeAllPageChecked(true)" :disabled="!tableData.length || search.useStatus==='used'">添加本页</el-button>
            <el-button :plain="true" @click="changeAllPageChecked(false)" :disabled="!tableData.length || search.useStatus==='noUsed'">移除本页</el-button>
            <el-button :plain="true" @click="importChannels" style="width: 60px;" v-show="['retail', 'aiot', 'enterprise'].includes(serviceType)">导入</el-button>
            <el-button :plain="true" @click="exportChannels" style="width: 60px;" v-show="['retail', 'aiot', 'enterprise'].includes(serviceType)">导出</el-button>
          </div>
        </div>
      </div>
      <div class="devicesListOuter" v-loading="isLoading">
        <div class="devicesListWrap" v-show="tableData.length">
          <el-scrollbar wrap-style="height: 100%; overflow-x: hidden;" ref="scrollbarChannelCard" @on-scrolling-y="onScrollingYChannelCard">
            <div class="devicesList">
              <channelCard v-for="(channel, index) in tableData" :key="index" :channelInfo="channel" width="321" :solutionTaskId="solutionTaskId" @refreshOneChannelCard="refreshOneChannelCard"></channelCard>
            </div>
          </el-scrollbar>
        </div>
        <h-empty v-show="!tableData.length && !isLoading" description="暂无设备">
          <template #img>
            <img class="emptyImg" src="@/assets/img/default_List Page no data_nor.svg" alt="">
          </template>
        </h-empty>
      </div>
      <el-pagination @current-change="handleCurrentChange" @size-change="handleSizeChange" :current-page="search.pageNo" :page-size="search.pageSize"
        :page-sizes="[20, 50, 100]" :layout="pagationLayout" :total="total" :class="{'noUsedPagination': search.useStatus==='noUsed'}" style="margin-right:16px;margin-top:12px">
      </el-pagination>
      <ExcelUploadEasy ref="excelUpload" :visible.sync="excelUploadShow" @downloadTemplate="downloadTemplate" :otherObj="{taskId: solutionTaskId}" :importProxy="importProxy"></ExcelUploadEasy>
    </div>
  </el-dialog>
</template>
<script>
import { getAllChannelsPage, getUsedChannelsPage, getNoUsedChannelsPage, addChannels, delChannels, exportChannels, getDownLoadUrl  } from '../proxy'
import channelCard from './channelCard'
import AreaTreeSelect from '@/components/areaTreeSelect/areaTreeSelect'
import ExcelUploadEasy from '@/components/excelUpload/easyIndex.vue'
export default {
  components: {
    channelCard, AreaTreeSelect, ExcelUploadEasy
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    cardInfo: {
      type: Object,
      default () {
        return {}
      }
    }
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
      searchData: '',
      scrollbarChannelCardTop: 0
    }
  },
  computed: {
    pagationLayout() {
      return this.search.useStatus==='noUsed' ? 'total, first, prev, next, last' : 'total, prev, pager, next'
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
    changeUseStatus() {
      this.scrollbarChannelCardTop = 0
      this.getListWithResetPage()
    },
    onScrollingYChannelCard(scrollTop) {
      this.scrollbarChannelCardTop = scrollTop.scrollTop
    },
    hanldeOpen() {
      this.solutionTaskId = this.cardInfo.solutionTaskId
      this.search.useStatus =  this.cardInfo.useStatus
    },
    clearSearch () {
      this.searchData = ''
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
      proxy({ channelIds: channelIds, solutionTaskId: this.solutionTaskId }).then(res => {
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
          this.$emit('refreshOne', this.cardInfo)
        }
      }).finally(() => {
        this.isLoading = false
      })
    },
    refreshOneChannelCard(channelCardInfo) {
      if (this.tableData.length === 1) { // 操作的是本页仅有的一条数据
        this.search.pageNo = this.search.pageNo === 1 ? 1 : this.search.pageNo - 1
        this.search.pageType = ['default', 'last'].includes(this.search.pageType) ? this.search.pageType : 'prev'
        this.search.rowKey = ['default', 'last'].includes(this.search.pageType) ? '' : this.rowKeyPrev
      }
      this.getList()
      this.$emit('refreshOne', channelCardInfo)
    },
    getClickDataForSearch(value)  {
      this.search.orgId = value.groupId
      this.search.orgType = value.groupType
      this.search.parentId = value.parentId
      this.getListWithResetPage()
    },
    finish () {
      this.$router.push({ name: 'sceneConfig', query: { publishStatus: this.publishStatus, taskSource: this.taskSource } })
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
      this.tableData = []
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
      this.$nextTick(() => {
        this.$refs.scrollbarChannelCard.setScroll(this.scrollbarChannelCardTop)
      })
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
<style lang="scss">
.channelDialog{
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
  .devicesBtns{
    .el-button{
      min-width: 50px;
      width: 90px;
      border: 1px solid #b3b3b3;
      border-radius: 4px;
      padding: 0 4px
    }
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
<style lang="scss" scoped>
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
.searchWrap {
  height: 32px;
  display: flex;
  align-items: center;
}
.el-dialog__wrapper {
  ::v-deep .channelDialog {
    border-radius: 8px;
    .el-dialog__header {
      height: 56px;
      border-radius: 8px 8px 0 0;
      border: none;
      .el-dialog__title {
        line-height: 56px;
        font-size: 16px;
        color: rgba(0,0,0,0.90);
        letter-spacing: 0.15px;
        text-align: left;
        font-weight: 600;
        padding-left: 24px;
      }
      .el-dialog__headerbtn {
        right: 24px;
        top: 10px;
      }
    }
    .el-dialog__body {
      height: 630px!important;
      padding: 0;
      .el-dialog__body-wrapper {
        padding: 0 24px 24px;
      }
    }
  }
}
.devicesBtns {
  text-align: right;
}
.elButton {
  height: 36px;
  max-width: 100px;
}
.elSelect {
  height: 36px;
  width: 126px;
}
.devicesWrap {
  width: 100%;
  height: 590px;
  border: 1px solid #EEEFF2;
  border-radius: 8px;
  padding: 16px 0 2px 16px;
  .pageAction{
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-right: 16px;
    .leftAction {
      display: flex;
      align-items: center;
    }
  }
  .devicesListOuter {
    height: 485px;
    display: flex;
    flex-direction: column;
    .devicesListWrap {
      height: 100%;
      padding: 16px 0 0;
      .devicesList {
        display: flex;
        flex-wrap: wrap;
        .channelCard:nth-child(3n+3) {
          margin-right: 0;
        }
        .deviceCardWidth {
          width: 271px;
        }
        .channelCard {
          ::v-deep .deviceCardInfo .deviceCardText {
            // max-width: 94px;
            max-width: 120px;
          }
          ::v-deep .deviceCardInfo .deviceCardTextNumber{
            // max-width: 94px;
            max-width: 120px;
          }
          ::v-deep .bottom_wrap .text{
            width: 180px;
          }
        }
      }
    }
  }
}
.elPagination {
  text-align: right;
}
::v-deep .el-pagination {
  text-align: right;
  .el-pagination__total {
    float: left;
  }
}
::v-deep .h-empty {
  .emptyImg {
    width: 400px;
    height: 206px;
  }
}
</style>
