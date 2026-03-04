<template>
  <el-dialog title="复用标签的通道" :area="[840, 626]" :visible.sync="visible" :show-close="!updateChannelLoading" :before-close="cancel"
    class="add-label-channel-modal" :close-on-click-modal="false">
    <el-alert :title="'已选择标签数：' + checkedLabelIds.length + '个'" type="info" show-icon simple icon="h-icon-home" :closable="false"></el-alert>
    <div class="wrap">
      <div class="left">
        <el-input class="input-clearable" placeholder="请输入标签名称查询" suffix-icon="h-icon-search" clearable @keyup.enter.native="filterLabelList"
          :clear-icon-click="clearSearch" v-model="searchData">
        </el-input>
        <div class="label_wrap" v-if="filterLabelList.length>0">
          <el-scrollbar wrap-class="demo-scrollbar-wrap">
            <div class="checked_wrap">
              <div class="all_choose"><el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange" v-show="!searchData">全选</el-checkbox></div>
              <el-checkbox-group v-model="checkedLabelIds" @change="handleCheckedCitiesChange">
                <el-checkbox v-for="(item, index) in filterLabelList" :label="item.labelId" :key="index" style="height:32px">
                  <div :style="{'background':inferTagBgcolor(item.labelType)}" class="tag" title="">{{inferTagName(item.labelType)}}</div>
                  <div class="label_name" :title="item.labelName">{{item.labelName}}</div>
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </el-scrollbar>
        </div>
        <div v-else class="empty"><img src="@/assets/img/no_data_2d.png">暂无数据</div>
      </div>
      <div class="right">
        <div class="search_wrap">
          <el-input v-model="filters.channelName" clearable suffix-icon="h-icon-search" class="search_item" placeholder="搜索通道" @click="handleSeach" @clear="handleClear"
            @keyup.enter.native="handleSeach" @change="handleSeach"></el-input>
          <el-input v-model="filters.deviceName" clearable suffix-icon="h-icon-search" class="search_item" placeholder="搜索设备" @click="handleSeach" @clear="handleClear"
            @keyup.enter.native="handleSeach" @change="handleSeach"></el-input>
          <el-input v-model="filters.groupName" clearable suffix-icon="h-icon-search" class="search_item" :placeholder="`搜索${applicationSceneName}`" @click="handleSeach" @clear="handleClear"
            @keyup.enter.native="handleSeach" @change="handleSeach"></el-input>
        </div>
        <el-table :data="tableData" ref="multipleTable" height="380" stripe class="table-content" :enable-virtual-scroll="true">
          <el-table-column prop="groupName" :label="`${applicationSceneName}名称`"></el-table-column>
          <el-table-column prop="deviceName" label="设备名称"></el-table-column>
          <el-table-column prop="channelName" label="通道名称"></el-table-column>
          <el-table-column prop="presetInfoName" label="预置点名称"></el-table-column>
        </el-table>
        <el-pagination :page-sizes="[20, 50, 100, 200]" layout="total, sizes, huiPager, jumper" @size-change="handleSizeChange"
          :current-page="filters.pageNo" :page-size="filters.pageSize" :total="total" @current-change="handleCurrentChange">
        </el-pagination>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="confirm" :loading="updateChannelLoading" :disabled="!checkedLabelIds.length">确 定</el-button>
      <el-button @click="cancel" :loading="updateChannelLoading">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import _ from 'lodash'
import { updateChannel, updatePreset, updateChoose, getGroupChannelsByAreaLableIds, getAreaLableList, getPageGroupChannelsByAreaLableIds } from './../../proxy'
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    taskType: {
      type: String,
      default: ''
    },
    taskAnalysisMode: {
      type: String,
      default: ''
    },
    modelTypeEnum: {
      type: String,
      default: ''
    },
    taskId: {
      type: String,
      default: ''
    },
    channes: {
      type: Array,
      default: () => []
    },
    updateKey: {
      type: String,
      default: ''
    },
    modelSource: {
      type: String,
      default: ''
    },
    isAdd: {
      type: Boolean,
      default: true
    },
    maxLimitChoose: {
      type: Number,
      default: 2000
    },
    hugeChannelsFlagProps: { // 当前任务是否本身就是大通道任务
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      filters: {
        channelName: '',
        deviceName: '',
        groupName: '',
        pageNo: 1,
        pageSize: 20,
      },
      total: 0,
      checkAll: false,
      checkedLabelIds: [],
      isIndeterminate: false,
      tableData: [],
      saveOldCheck: true,
      labelList: [], // 原始标签列表
      filterLabelList: [], // 筛选和展示的标签列表
      duplicateTaskChannels: [], // 选中标签的通道列表数据
      updateChannelLoading: false, // 后端实时更新通道的接口loading
      hugeChannelsFlag: false, // 某任务的通道是否大于2000
      searchData: '' // 搜索框
    }
  },
  watch: {
    visible (val) {
      if (val) {
        this.duplicateTaskChannels = []
        this.getAreaLableList()
      } else {
        this.reset()
      }
    },
    searchData (val) {
      this.filterLabelList = this.labelList.filter(item => { return item.labelName.toUpperCase().indexOf(val.toUpperCase()) > -1 })
    },
    checkedLabelIds() {
      this.initTableData()
    }
  },
  methods: {
    inferTagName(key) {
      let obj = {'SINGLE_AREA': '单','CROSS_LINE': '线','MULTI_AREA': '多','SHIELD_AREA':'蔽'}
      return obj[key]
    },
    inferTagBgcolor(key) {
      let obj = {'SINGLE_AREA': 'rgba(30,127,255,0.70)','CROSS_LINE': 'rgba(255,171,0,0.70)','MULTI_AREA': 'rgba(190,16,165,0.70)','SHIELD_AREA':'rgba(161,151,255,0.3)'}
      return obj[key]
    },
    handleCheckAllChange(value) {
      this.checkedLabelIds = value ? this.labelList.map(_ => _.labelId) : [];
      this.isIndeterminate = false;
    },
    handleCheckedCitiesChange(value) {
      let checkedCount = value.length;
      this.checkAll = checkedCount === this.labelList.length;
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.labelList.length;
    },
    initTableData: _.debounce(function () {
      getPageGroupChannelsByAreaLableIds({ ...this.filters, taskId: this.taskId, labelIds: this.checkedLabelIds }).then(res => {
        if (res.code === 0) {
          this.tableData = res.data.rows || []
          this.total = res.data.total
          this.tableData.forEach(item => {
            item.presetInfoName = item.presetInfo.map(val => val.presetName).join('，') || '--'
          })
        }
      })
    }, 200),
    handleSeach() {
      this.filters.pageNo = 1
      this.initTableData()
    },
    handleClear() {
      this.filters.pageNo = 1
      this.initTableData()
    },
    handleSizeChange(val) {
      this.filters.pageNo = 1
      this.filters.pageSize = val
      this.initTableData()
    },
    handleCurrentChange(page) {
      this.filters.pageNo = page
      this.initTableData()
    },
    handleHuge() {
      if (this.isAdd) {
        this.$message.warning(`选中标签的通道超过2000个，首次添加不能对这些标签进行通道复用。`)
        return false
      } else {
        const h = this.$createElement
        let url = this.$commonUtils.judgeEnv() + `/AI-inspect/index.html#/intelligent/inspectionConfig/${this.serviceType}/channelConfigPage?taskId=${this.taskId}`
        this.$confirm(`选择的通道已经超过2000个`, {
          dangerouslyUseHTMLString: true,
          type: 'question',
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          message: h('div', undefined, [
            h('span', undefined, '请前往 '),
            h('el-button',
              { style: { "text-decoration": "underline" }, props: { type: 'link' }, on: { click: () => { window.open(url) } } },
              '通道配置页'
            ),
            h('span', undefined, ' 操作')
          ]),
        }).then(async () => {
          window.open(url)
        })
      }
    },
    async confirm () {
      this.hugeChannelsFlag = false
      // 获取选择的标签下，配置的通道数据
      let res = await getGroupChannelsByAreaLableIds({ labelIds: this.checkedLabelIds})
      if (res.code === 0) {
        this.duplicateTaskChannels = res.data.groupInfoList || []
        if (res.data.channelCount > this.maxLimitChoose) { // 表示选择标签下的通道大于2000
          this.duplicateTaskChannels = []
          this.hugeChannelsFlag = true
        } else { 
          let allData = []
          res.data && res.data.groupInfoList.forEach(item => {
            item.channels.forEach(citem => {
              citem.presetInfoName = citem.presetInfo.length ? citem.presetInfo.map(pitem => { return pitem.presetName }).join(',') : '——'
              allData.push(citem)
            })
          })
        }
        if (this.hugeChannelsFlag) { // 选中的标签的通道数本身已经超了2000
          this.handleHuge()
          return false
        }
        this.saveOldCheck = true
        const h = this.$createElement
        let labelNames = this.labelList.filter(_ => this.checkedLabelIds.includes(_.labelId)).map(_ => _.labelName).join('、')
        this.$confirm(`确定复用${labelNames}的通道吗？`, {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          size: 'large',
          message: (this.channes.length > 0 || this.hugeChannelsFlagProps) ? h(
            'el-checkbox',
            {
              key: Date.now(),
              props: {
                checked: this.saveOldCheck
              },
              on: {
                change: () => {
                  this.saveOldCheck = !this.saveOldCheck
                }
              }
            },
            '保留当前所选通道'
          ) : '',
          type: 'question'
        }).then(async () => {
          let channelInfo = []// 用来处理是否'保留当前所选通道'
          this.duplicateTaskChannels.forEach(item => {
            item.channels.forEach(citem => {
              channelInfo.push(citem)
            })
          })
          if (!this.saveOldCheck) { 
            let nowTaskchannelInfo = []
            this.channes.forEach(item => {
              item.channels.forEach(citem => {
                nowTaskchannelInfo.push(citem)
              })
            })
            let { code } = await updateChannel({ key: this.updateKey, channelInfo: nowTaskchannelInfo, type: '-1' })// 删除当前选中标签全部的通道选择
            if (code === 0) {
              this.updateAddChannel(channelInfo)
            }
          } else { //保留原来的通道选择，要判断原来选择的通道+复用标签的通道总数是否大于2000
            let total = this.channes.length + res.data.channelCount
            if ((total > this.maxLimitChoose) || this.hugeChannelsFlagProps) {
              this.handleHuge()
            } else {
              this.updateAddChannel(channelInfo)
            }
          }
        })
      }
    },
    updateAddChannel (channelInfo) {
      updateChannel({ key: this.updateKey, channelInfo: channelInfo, type: '1' }).then(res => {
        if (res.code === 0) {
          channelInfo.forEach(item => { // 预置点要调单独的接口进行更新
            if (item.presetInfo && item.presetInfo.length) {
              item.selPresetIdsInfo = item.presetInfo
              item.originalPresetInfo = item.presetInfo
              item.selPresetIds = item.presetInfo.map(val => { return val.presetId })
              updatePreset({ key: this.updateKey, presetInfos: [item] }).then(res => {
                this.updateChannelLoading = false
              })
            }
          })
          this.updateChoose(true)
          this.$emit('updateChooseChannelData', this.duplicateTaskChannels, !this.saveOldCheck)
          this.cancel()
        }
      })
    },
    updateChoose (flag) { // flag：true确定，flase取消
      updateChoose({ key: this.updateKey, type: flag }).then()
    },
    getAreaLableList () {
      getAreaLableList().then(res => {
        if (res.code === 0 && res.data) {
          this.labelList = JSON.parse(JSON.stringify(res.data))
          this.filterLabelList = JSON.parse(JSON.stringify(res.data))
        }
      })
    },
    clearSearch () {
      this.filterLabelList = JSON.parse(JSON.stringify(this.labelList))
    },
    reset() {
      this.checkAll = false
      this.checkedLabelIds = []
      this.isIndeterminate = false
      this.tableData = []
      this.filters = {
        channelName: '',
        deviceName: '',
        groupName: '',
        pageNo: 1,
        pageSize: 20,
      }
      this.total = 0
    },
    cancel () {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.add-label-channel-modal{
  .search_wrap{
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    justify-content: space-between;
    .search_item{
      width: 195px;
    }
  }
  .wrap{
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
  }
  .input-clearable{
    // margin-bottom: 6px;
  }
  .empty{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 100px;
    img{
      width: 80px;
      height: 80px;
    }
  }
  .left{
    width: 206px;
    border-right: 1px solid #ccc;
    padding-right: 6px;
  }
  .label_wrap{
    margin-top: 12px;
    .tag{
      width: 16px;
      height: 16px;
      line-height: 14px;
      border: 1px solid rgba(187,197,212,0.12);
      border-radius: 4px;
      font-size: 10px;
      color: #FFFFFF;
      text-align: center;
      margin-left:2px;
      margin-right:4px
    }
  }
  .bottom{
    border: 1px solid rgba(0,0,0,0.10);
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
  }
  .table-content{
    width: 604px;
  }
}
</style>
<style lang="scss">
.add-label-channel-modal{
  .demo-scrollbar-wrap {
    height: 200px;
  }
  .items {
    width: 1500px;
    li{
      height: 100px;
      border: 1px solid;
    }
  }
  .label_wrap{
    .labels{
      height: 440px;
    }
    .demo-scrollbar-wrap{
      height: 440px;
      .el-checkbox+.el-checkbox{
        margin-left: 0px;
      }
      .el-checkbox{
        margin-right: 16px;
      }
      .checked_wrap{
        .el-checkbox{
          display: flex;
          align-items: center;
        }
        .el-checkbox-group{
          display: block;
        }
        // height: 200px;
        .el-checkbox__label{
          // width: 120px;
          position: relative;
          height: 24px;
          display: flex;
          align-items: center;
          .label_name{
            width: 150px;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            margin-left: 20px;
            height: 24px;
            line-height: 24px;
          }
          .tag{
            position: absolute;
            top: 5px;
          }
        }
        .all_choose{
          .el-checkbox__label{
            font-weight: 900;
            line-height: 30px;
          }
        }
      }
    }
  }
  .el-alert__title{
    font-size: 12px;
  }
  .el-dialog__body-wrapper{
    padding-top:10px!important;
    padding-bottom:5px!important
  }
}
</style>
