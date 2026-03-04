<template>
  <h-page-container>
    <h-page-content flex>
      <div ref="alarmPageContent" id="alarmPage">
        <h-page-search :model="alertForm" ref="alertForm">
          <h-page-search-item :label="`所属${applicationSceneName}`" class="org-item">
            <el-input @click.native="isShowOrg = !isShowOrg" v-model="orgName" :suffix-icon="isShowOrg ? 'h-icon-angle_up_sm' : 'h-icon-angle_down_sm'" 
              class="org" readonly="readonly" :placeholder="`请选择${applicationSceneName}`" clearable @clear="handleOrgClear"></el-input>
            <div class="org-select" v-show="isShowOrg">
              <treeAnsyForSearch  v-clickoutside="handleCloseShowOrg"
              ref="TreeAnsySearch"
              :treeAnsyProps=treeAnsyProps
              :storeListProps=storeListProps
              :isInitSelected="true"
              :onlyCheckLeaf="true"
              @getClickData="getClickData"
              :height="240">
              </treeAnsyForSearch>
            </div>
          </h-page-search-item>
          <h-page-search-item label="日期范围">
            <el-date-picker style="width:100%" :picker-options="pickerOptions" v-model="alertForm.time" type="daterange" :clearable="false">
            </el-date-picker>
          </h-page-search-item>
          <h-page-search-item label="消息内容">
            <el-input v-model="alertForm.contentLike" placeholder="请输入消息内容" clearable ></el-input>
          </h-page-search-item>
          <!-- <h-page-search-item label="消息状态">
            <el-select v-model="alertForm.readStatus">
              <el-option label="全部" value=""></el-option>
              <el-option label="已读" value="READ"></el-option>
              <el-option label="未读" value="NOT_READ"></el-option>
            </el-select>
          </h-page-search-item> -->
          <h-page-search-item label="增值服务类型">
            <el-select v-model="alertForm.scenariosType" clear>
              <el-option v-for="(item, index) in scenariosTypeList" :key="index" :label="item.scenariosTypeName" :value="item.scenariosType"></el-option>
            </el-select>
          </h-page-search-item>
          <h-page-search-item label="接收人">
            <div ref="searchItem" style="width:100%">
              <selectedForPage @selectForPageValues="selectForPageValues" ref="selectedForPage" :selectForPageAPI="selectForPageAPI" 
                searchName="userName" :panelWidthProp="panelWidth" :maxSelect="5" :options="{ value: 'userId', name: 'userName' }"></selectedForPage>
            </div>
          </h-page-search-item>
          <template slot="pageSearchAction">
            <el-button @click="searchTable" type="primary">查询</el-button>
            <el-button @click="resetSearch" type="default">重置</el-button>
          </template>
        </h-page-search>
      </div>
      <el-table force-scroll v-loading="loading" :data="tableData" show-overflow-title highlight-current-row :height="tableHeight">
        <el-table-column label="消息内容" width="30%">
          <template slot-scope="scope">
            <span>{{scope.row.messageContent}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="scenariosTypeName" label="增值服务类型">
          <template slot-scope="scope">
            <span>{{scope.row.scenariosTypeName || '--'}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="channelName" label="通道"></el-table-column>
        <el-table-column prop="storeName" :label="`${applicationSceneName}`"></el-table-column>
        <el-table-column prop="receiverName" label="接收人"></el-table-column>
        <el-table-column label="消息时间">
          <template slot-scope="scope">
            <span>{{scope.row.triggerTime | formartTime}}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <span @click="setImg(scope.row)" v-if="scope.row.imageUrls && scope.row.imageUrls.length > 0" style="cursor: pointer;"><i class="h-icon-picture picList"></i></span>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="alertForm.pageNo"
        :page-sizes="[10, 20, 50, 100]" :page-size="alertForm.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </h-page-content>
    <CarouselDialog ref="carouselDialog" :visible.sync="dialogVisible" title="查看详情"></CarouselDialog>
  </h-page-container>
</template>
<script>
import { getAlarmMessages, getOperationPic, getScenariosTypeOptional, getRootNode } from '../proxy.js'
import treeAnsyForSearch from '@/components/treeAnsyForSearch'
import AreaTreeSelect from '@/components/areaTreeSelect/areaTreeSelect'
import selectedForPage from '@/components/selectedForPage'
import { today, day, getDateTime } from '@/plugin/utils/util'
import CarouselDialog from './carousel/carouselDialog'
import encrypt from '@/assets/img/encrypt.png'
import { getFormatTime } from '@/assets/libs/util'
import Clickoutside from 'hui/src/utils/clickoutside'

export default {
  name: 'alarmMessage',
  components: { treeAnsyForSearch, CarouselDialog, AreaTreeSelect, selectedForPage },
  directives: { Clickoutside },
  data () {
    return {
      loading: false,
      treeAnsyProps: {
        method: 'get',
        url: '/v1/chain/basic/areas/actions/findAreaStoreTreeForBusiness',
        params: {}
      },
      storeListProps: {
        method: '',
        url: '/v1/chain/basic/stores/actions/findStoresForBusinessNoPage',
        params: {}
      },
      isShowOrg: '',
      orgName: '',
      panelWidth: 0,
      selectForPageAPI: {
        method: 'get',
        url: '/safe-center/v1/auth/centerUsersPre/actions/findUserList',
        params: { userName: '', organizationId: '', weChatUserIds: '', containSubOrgUsers: true}
      },
      dialogVisible: false, // 弹框显隐
      loading: false,
      pickerOptions: {
        disabledDate (time) {
          return (time.getTime() >= today + day)
        },
        customValidation: (start, end) => {
          return end.getTime() - 31 * day <= start.getTime()
        },
        customPrompt: '时间间隔最长不能超过31天'
      },
      alertForm: {
        storeIds: '',
        time: [new Date(new Date().getTime() - 3600 * 1000 * 24 * 2), new Date()],
        readStatus: '',
        scenariosType: '',
        contentLike: '',
        pageNo: 1,
        pageSize: 20,
        userIds: []
      },
      scenariosTypeList: [],
      total: 0,
      tableHeight: 0,
      tableData: [], // 表格数据
    }
  },
  filters: {
    formartTime (v) {
      return getDateTime(v)
    }
  },
  mounted () {
    this.resizeObserverSearchWrap()
    this.resizeObserverSearchFormItem()
    this.initTable()
    this.getScenariosTypeList()
    this.getRootNode() // 为了接收人的接口，要先调安全中心接口获取根节点
  },
  methods: {
    handleOrgClear() {
      this.alertForm.storeIds = ''
      if(this.$refs.TreeAnsySearch) {
        this.$refs.TreeAnsySearch.clearClick()
      }
      this.orgName = ''
    },
    handleCloseShowOrg() {
      this.isShowOrg = false
    },
    getRootNode() {
      getRootNode().then(res => {
        if (res.code === 0 && res.data && res.data.length) {
          this.selectForPageAPI.params.organizationId = res.data[0].nodeId
          this.$refs.selectedForPage.getOptionList()
        }
      })
    },
    // 所属组织树选中节点时触发
    getClickData(value, num, type) {
      if (value.parentId || value.storeId) {
        this.orgName = value.nodeName || value.storeName || value.pathName
        if (value.nodeType === 0) { // 区域
          this.alertForm.storeIds = ''
        } else { // 门店
          this.alertForm.storeIds = value.nodeId || value.storeId
        }
        if (type !== 'clear') {
          this.isShowOrg = false
        }
      }
    },
    selectForPageValues(val) {
      this.alertForm.userIds = val.values.join(',')
    },
    // 获取搜索的增值服务下拉数据
    async getScenariosTypeList() {
      this.scenariosTypeList = [{scenariosType:'',scenariosTypeName:'全部'}]
      let res = await getScenariosTypeOptional()
      if (res.code === 0) {
        this.scenariosTypeList = this.scenariosTypeList.concat(res.data)
      }
    },
    resizeObserverSearchWrap() {
      const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          this.tableHeight = entry.contentRect.height >= 157 ? document.body.clientHeight - 262 
          : entry.contentRect.height >= 129 ? document.body.clientHeight - 234 
          : document.body.clientHeight - 190
        }
      })
      resizeObserver.observe(this.$refs.alarmPageContent)
    },
    resizeObserverSearchFormItem() {
      const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          this.panelWidth = entry.contentRect.width
        }
      })
      resizeObserver.observe(this.$refs.searchItem)
    },
    async getParams () {
      let params = { ...this.alertForm }
      params.startDate = this.alertForm.time[0] ? getFormatTime(this.alertForm.time[0]).substr(0, 10) : ''
      params.endDate = this.alertForm.time[1] ? getFormatTime(this.alertForm.time[1]).substr(0, 10) : ''
      delete params.time 
      return params
    },
    // 获取表格消息
    async initTable () {
        this.loading = true
        let params = await this.getParams()
        let { data, code } = await getAlarmMessages(params)
        this.loading = false
        if (code === 0) {
          this.tableData = data.rows
          this.total = data.total
        }
    },
    // 重置搜索条件
    resetSearch () {
      this.alertForm = {
        storeIds: '',
        time: [new Date(new Date().getTime() - 3600 * 1000 * 24 * 2), new Date()],
        readStatus: '',
        scenariosType: '',
        contentLike: '',
        pageNo: 1,
        pageSize: 20,
      }
      this.orgName = ''
      this.$refs.selectedForPage.setValues({ values: [], datas: [] })
      this.initTable()
    },
    // 搜索表格
    searchTable () {
      this.alertForm.pageNo = 1
      this.initTable()
    },
    handleSizeChange (val) {
      this.alertForm.pageNo = 1
      this.alertForm.pageSize = val
      this.initTable()
    },
    handleCurrentChange (val) {
      this.alertForm.pageNo = val
      this.initTable()
    },
    async setImg (row) {
      let pics = row.imageUrls || []
      if (row.imageUrls && row.imageUrls.length) {
        const { data, code } = await getOperationPic({messageId: row.messageId})
        if (code === 0) {
          pics = data || []
        }
      }
      
      let targetMap = {
        storeId: row.storeId || null, // 店铺名称
        storeName: row.storeName || null, // 店铺名称
        channelId: null, // 通道Id
        channelName: null, // 通道名称
        channelNo: row.channelNo || null, // 通道号
        devType: row.type || null, // 设备类型
        deviceSerial: null, // 设备序列号
        endTime: '', // 结束时间
        startTime: new Date(row.triggerTime).getTime() + '', // 开始时间
        pics: [] // 图片列表
      }
      targetMap['pics'] = pics.map(pic => {
        return {
          picCoordinate: pic.picCoordinate ? JSON.parse(pic.picCoordinate) : [],
          multiAnalysisAreaPolygon: pic.detectArea,
          picUrl: pic.largePic && pic.largePic.includes('isEncrypted=1') ? encrypt : pic.largePic,
          color: 'red'
        }
      })
      if (targetMap.pics.length) {
        targetMap['channelId'] = row.imageUrls[0].resourceId || null
        targetMap['channelName'] = row.imageUrls[0].resourceName || null
        targetMap['deviceSerial'] = row.imageUrls[0].deviceSerial || null
        this.$refs.carouselDialog.refreshData(targetMap)
        this.$nextTick(() => {
          this.dialogVisible = true
        })
      } else {
        this.$message.error('没有图片数据')
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.noRead {
  color: rgba(0, 0, 0, 0.9);
  font-weight: 600;
}
.hasRead {
  color: rgba(0, 0, 0, 0.4);
}
.picList {
  font-size: 20px;
  &.disable {
    opacity: 0.4;
  }
}
.sliderContent {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.silderImg {
  width: 100%;
  height: 100%;
}
.pictureInfo {
  margin-top: 10px;
  font-size: 12px;
  padding-left: 4px;
}
.noPicutureBox {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  .noPicuture {
    text-align: center;
  }
}
.container {
  height: 60px;
  display: flex;
  margin-top: 4px;
  .choose {
    cursor: pointer;
    width: 16px;
    height: 100%;
    background-color: rgb(245, 245, 245);
    i {
      width: 16px;
      height: 16px;
      position: relative;
      top: 22px;
      left: 2px;
    }
  }
  .silder {
    margin-top: 4px;
    width: 400px;
    height: 100%;
    overflow: hidden;
    .sildeShow {
      position: relative;
      transition: left 0.5s;
      font-size: 0;
      .activeClass {
        background: #1e7fff;
      }
      li {
        float: left;
        cursor: pointer;
        .unEncryptImg {
          width: 92px;
          height: 50px;
          padding: 2px;
          text-align: center;
        }
      }
    }
  }
}
.detail {
  width: 304px;
  display: flex;
  flex-direction: column;
  padding: 16px;
  // border-left: 1px solid #ddd;
  background: rgba(0, 0, 0, 0.02);
  .message {
    flex: 1;
    overflow: auto;
    font-size: 14px;
    &-detail {
      color: rgba(0,0,0,0.70);
    }
    &-time {
      margin-top: 8px;
      color: rgba(0,0,0,0.40);
    }
    .channel-list {
      font-weight: 600;
      padding-top: 24px;
      .channel {
        font-weight: normal;
        padding: 12px;
        margin-top: 12px;
        background: rgba(0,0,0,0.04);
        cursor: pointer;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
  .ope-btns {
    text-align: center;
    padding-top: 16px;
  }
  .video-btn {
    width: 100%;
    max-width: 100%;
    margin: 12px 0 24px;
  }
  
}
</style>
<style lang="scss">
#alarmPage {
  padding: 0;
  .org-item {
    .org {
      input {
        background-color: #fff;
        background-image: none;
        border-radius: 2px;
        border: 1px solid #ccc;
        color: #333;
        font-size: inherit;
        height: 32px;
        line-height: 1;
        outline: 0;
        padding: 3px 8px;
        cursor: pointer;
      }
      .el-input__icon {
        cursor: pointer;
      }
    }
    .el-form-item__content {
      position: relative;
      .org-select {
        border: 1px solid rgba(0, 0, 0, 0.12);
        border-radius: 2px;
        margin-top: -1px;
        height: 290px;
        position: absolute;
        width: 100%;
        z-index: 10;
        background-color: white;
      }
    }
  }
  .el-form-item__content {
    line-height: 30px !important;
  }
}
</style>
