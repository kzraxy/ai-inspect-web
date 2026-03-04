<template>
  <el-dialog title="复用标签的通道（如果您授权路数不足可能会添加失败，请注意）" :area="[840, 626]" :visible.sync="visible" :before-close="cancel"
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
          <el-table-column prop="presetInfoName" label="预置点名称">
          </el-table-column>
        </el-table>
        <el-pagination :page-sizes="[20, 50, 100, 200]" layout="total, sizes, huiPager, jumper" @size-change="handleSizeChange"
          :current-page="filters.pageNo" :page-size="filters.pageSize" :total="total" @current-change="handleCurrentChange">
        </el-pagination>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="confirm" :disabled="!checkedLabelIds.length">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import _ from 'lodash'
import { getAreaLableList, getPageGroupChannelsByAreaLableIds, realTimeCopyChannelByAreaLables } from '../../proxy' 
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    taskId: {
      type: String,
      default: ''
    },
    updateKey: {
      type: String,
      default: ''
    },
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
      labelList: [], // 原始标签列表
      filterLabelList: [], // 筛选和展示的标签列表
      searchData: '' // 左侧标签的搜索框
    }
  },
  watch: {
    visible (val) {
      if (val) {
        this.getAreaLableList()
      } else {
        this.reset()
      }
    },
    searchData (val) {
      this.filterLabelList = this.labelList.filter(item => { return item.labelName.toUpperCase().indexOf(val.toUpperCase()) > -1 })
    },
    checkedLabelIds(val) {
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
    async confirm () {
      let labelNames = this.labelList.filter(_ => this.checkedLabelIds.includes(_.labelId)).map(_ => _.labelName).join('、')
      this.$confirm(`确定复用${labelNames}的通道吗？`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'question',
        size: 'large',
      }).then(async () => {
        let res = await realTimeCopyChannelByAreaLables({ taskId: this.taskId, areaLableIds: this.checkedLabelIds })
        if (res.code === 0) {
          this.$emit('updateChannelFinish')
          this.cancel()
        }
      })
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
