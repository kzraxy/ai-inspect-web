<template>
  <el-dialog title="通道运行异常事件" :visible="visible" @close="close" custom-class="abnormalReasonModal" :area="abnormalReasonArea">
    <div>
      <div class="btns_wrap">
        <div class="left">
          <el-button icon="icon iconfont iconsolved" @click="batchHandle(1)" :disabled="!selectRows.length">批量处置</el-button>
          <el-button icon="icon iconfont iconignore" @click="batchHandle(2)" :disabled="!selectRows.length">批量忽略</el-button>
           <!-- <el-button icon="h-icon-export" @click="exportInfo">导出数据</el-button> -->
        </div>
        <div class="right">
          <el-select v-model="searchForm.abnormalType" @change="changeAbnormalType" clear>
            <el-option v-for="(item,index) in abnormalTypeList" :key="index" :label="item.abnormalTypeName" :value="item.abnormalTypeId"></el-option>
          </el-select>
        </div>
      </div>
      <div class="content_wrap" id="contentWrap">
        <el-scrollbar wrap-class="demo-scrollbar-wrap">
          <div class="title_wrap">
            <div v-for="title in titleData" :key="title.name" :style="{'width':title.w+'px'}" :class="title.keyId+'_class'">
              <div v-show="title.keyId === 'channelName'" class="first_column">
                <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange" :disabled="!abnormalInfo.length"></el-checkbox>
                <div class="head_title_name">{{ title.name }}</div>
              </div>
              <div v-show="title.keyId !== 'channelName'">{{ title.name }}</div>
            </div>
          </div>
          <div v-show="!abnormalInfo.length" class="empty"><img src="@/assets/img/no_data.png">暂无数据</div>
          <div v-for="(item, index) in abnormalInfo" :key="index" v-show="abnormalInfo.length">
            <div class="shrink_wrap">
              <div v-for="title in titleData" :key="title.keyId" :style="{'width':title.w+'px'}">
                <!-- 第一列：通道特殊，有复选，有箭头 -->
                <div v-show="title.keyId === 'channelName'" class="first_column">
                  <el-checkbox v-model="item.checked" @change="changeSelectRows" :disabled="!item.backlogNumber"></el-checkbox>
                  <div @click="()=>{item.showChildData=!item.showChildData}" :class="{'rotate_icon':!item.showChildData}" class="h-icon-angle_down" style="font-size:16px;margin:0 6px;cursor: pointer;"></div>
                  <div class="jkd" :title="item[title.keyId]" @click="()=>{item.showChildData=!item.showChildData}" >{{ item[title.keyId] }}</div>
                </div>
                <!-- 其他列展示文字 -->
                <div v-show="title.keyId !== 'channelName'" :title="item[title.keyId]" class="ellipise_text">{{ item[title.keyId] === 0 ? 0 : (item[title.keyId] || '-') }}</div>
              </div>
            </div>
            <div class="table_wrap" v-show="item.showChildData">
              <el-table :data="item.abnormalResultList" ref="multipleTable" force-scroll="true" :always-show-bar="true">
                <el-table-column prop="abnormalTypeInfo" label="异常原因" width="270" fixed></el-table-column>
                <el-table-column prop="handleAdvice" label="处置建议" width="460"></el-table-column>
                <el-table-column prop="createTime" label="故障时间" width="160"></el-table-column>
                <el-table-column prop="name" label="处理人" width="106">
                  <template slot-scope="scope">{{ scope.row.name || '-' }}</template>
                </el-table-column>
                <!-- <el-table-column label="操作" width='156' fixed="right"> -->
                <el-table-column label="操作" width='156'>
                  <template slot-scope="scope">
                    <div class="operate">
                      <span v-show="scope.row.abnormalType===3" @click="goToArea(scope.row)" class="btn">查看绘制</span>
                      <span v-show="scope.row.handleType===3" @click="handle(scope.row, 1, index, scope.$index)" class="btn">处置</span>
                      <span v-show="scope.row.handleType===3" @click="handle(scope.row, 2, index, scope.$index)" class="btn">忽略</span>
                      <span v-show="scope.row.handleType===1" style="color: #02BF0F;">已处置</span>
                      <span v-show="scope.row.handleType===2" style="color: rgba(0,0,0,0.70);">已忽略</span>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-scrollbar>
      </div>
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :page-sizes="[10, 20, 50]" :current-page="searchForm.pageNo"
        :page-size="searchForm.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
  </el-dialog>
</template>

<script>
import _ from 'lodash'
import { getAbnormalInfo, handleAbnormal, batchHandleAbnormal  } from '../../proxy'
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    abnormalReasonArea: {
      type: Array,
      default: () => [1246, 801] // 小屏[932, 680]
    },
  },
  data () {
    return {
      rowData: {},
      checkAll: false,
      isIndeterminate: false,
      selectRows: [],
      abnormalInfo: {},
      total: 0,
      searchForm: {
        pageSize: 20,
        pageNo: 1,
        abnormalType: 0
      },
      titleData:[
        {keyId:'channelName',name:'通道名称',width:260,w:260},
        {keyId:'ruleName',name:'规则名称',width:160,w:160},
        {keyId:'deviceName',name:'设备名称',width:150,w:150},
        {keyId:'presetName',name:'预置点名称',width:170,w:170},
        {keyId:'newAbnormalResult',name:'最新异常原因',width:156,w:156},
        {keyId:'backlogNumber',name:'待处理事件数量',width:120,w:120}
      ]
    }
  },
  watch: {
    visible (val) {
      if (!val) {
        this.reset()
      }
    },
    abnormalReasonArea(val) {
      this.calculateStyle(val)
    }
  },
  computed: {
    abnormalTypeList () {
      return [
        {abnormalTypeName: '全部异常原因', abnormalTypeId: 0},
        {abnormalTypeName: '预置点变更', abnormalTypeId: 1},
        {abnormalTypeName: '通道长时间无结果', abnormalTypeId: 2},
        {abnormalTypeName: '目标与区域交叠过多达到阈值', abnormalTypeId: 3}
      ]
    }
  },
  methods: {
    init(rowData) {
      this.rowData = rowData
      this.getAbnormalInfo()
    },
    goToArea(row) {
      window.open(`${location.origin}${location.pathname}#/intelligent/identifyAreas/${this.serviceType}?existChannelId=${row.channelId}&existPresetId=${row.presetId ? row.presetId : ''}`, '_blank')
    },
    handle(row, type, parentIndex, index) {
      handleAbnormal({taskId: row.taskId, statusId: row.statusId, operateType: type}).then(res => {
        if (res.code === 0) {
          this.$message.success('操作成功！')
          this.abnormalInfo[parentIndex].abnormalResultList[index].handleType = type
          this.abnormalInfo[parentIndex].backlogNumber--
          this.abnormalInfo[parentIndex].abnormalResultList[index].name = sessionStorage.getItem('fullName')
        }
      })
    },
    batchHandle(type) {
      let name = type===1?'处置':'忽略'
      this.$confirm(`是否批量${type===1?'处置':'忽略'}所选的通道数据？`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'question'
      }).then(async () => {
        let channelIds = this.selectRows.map(_ => {
          return {
            channelId: _.channelId,
            ruleId: _.ruleId
          }
        })
        let parmas = {taskId: this.selectRows[0].taskId, channelIds: channelIds, operateType: type, checkAll: this.checkAll, abnormalType: this.searchForm.abnormalType}
        batchHandleAbnormal(parmas).then(res => {
          if (res.code === 0) {
          this.$message.success('操作成功！')
          this.searchForm.pageNo = 1
          this.getAbnormalInfo()
          }
        })
      })
    },
    exportInfo() {},
    // 点击全部复选框
    handleCheckAllChange(value) {
      this.abnormalInfo.forEach(item => { 
        if (value) {
          item.checked = item.backlogNumber ? value : false
        } else {
          item.checked = false
        }
      })
      // this.isIndeterminate = false
      this.selectRows = this.abnormalInfo.filter(item => item.checked)
      this.isIndeterminate = this.selectRows.length > 0 && this.selectRows.length < this.abnormalInfo.length
    },
    // 点击单条复选框
    changeSelectRows() {
      this.selectRows = this.abnormalInfo.filter(item => item.checked)
      this.checkAll = this.selectRows.length > 0 &&  this.selectRows.length === this.abnormalInfo.length
      this.isIndeterminate = this.selectRows.length > 0 && this.selectRows.length < this.abnormalInfo.length
    },
    changeAbnormalType() {
      if(this.searchForm.abnormalType === '') {
        this.searchForm.abnormalType = 0
      }
      this.abnormalInfo.forEach(item => {
        item.checked = false
        item.showChildData = false
      })
      this.searchForm.pageNo = 1
      this.searchForm.pageSize = 20
      this.checkAll = false
      this.getAbnormalInfo()
    },
    calculateStyle: _.debounce(function (val) {
      this.$nextTick(() => {
        if (document.getElementById('contentWrap')) {
          document.getElementById('contentWrap').style.height = (val && val.length && val[0] < 1246) ? '525px' : '646px'
        }
      })
    }, 500),
    getAbnormalInfo() {
      getAbnormalInfo({taskId: this.rowData.taskId, ...this.searchForm}).then(res => {
        if (res.code === 0) {
          this.total = res.data.total
          res.data.rows.forEach(item => {
            item.checked = this.checkAll ? true : false
            item.showChildData = false
          })
          this.abnormalInfo = res.data.rows
          this.changeSelectRows()
        }
      })
    },
    close () {
      this.$emit('update:visible', false)
      this.$emit('flash')
    },
    // 页数大小改变
    handleSizeChange (val) {
      this.searchForm.pageNo = 1
      this.searchForm.pageSize = val
      this.getAbnormalInfo()
    },
    // 当前页改变
    handleCurrentChange (val) {
      this.searchForm.pageNo = val
      this.getAbnormalInfo()
    },
    reset() {
      this.checkAll = false
      this.isIndeterminate = false
      this.searchForm = {
        pageSize: 20,
        pageNo: 1,
        abnormalType: 0
      }
      // this.selectRows = []
    }
  }
}
</script>

<style lang="scss">
.abnormalReasonModal{
  top: 5%!important;
  .el-dialog__body-wrapper{
    padding: 16px;
    padding-bottom: 0px;
  }
  .content_wrap{
    .demo-scrollbar-wrap{
      height: calc(100% - 4px);
      overflow-x: hidden;
    }
  }
  .table_wrap{
    .el-table .cell{
      font-size: 12px!important;
    }
    .operate{
      span{
        font-size: 12px;
        margin-right: 12px;
      }
      .btn{
        color: #2080f7;
        cursor: pointer;
        &:hover{
          text-decoration: underline;
        }
      }
    }
    .el-table--fit{
      left: 0;
    }
    .el-table:after{
      width: 0px;
    }
  }
}
</style>
<style lang="scss" scoped>
.abnormalReasonModal{
  .table_wrap{
    background: rgba(0,0,0,0.02);
    box-shadow: inset 0 -1px 0 0 rgba(0,0,0,0.08);
    padding: 16px;
    .operate{
      display: flex;
      align-items: center;
      span{
        font-size: 12px;
      }
      .btn{
        color: #2080f7;
      }
    }
  }
  .content_wrap{
    height: 646px;
    box-shadow: inset 0 -1px 0 0 rgba(0,0,0,0.08);
    .empty{
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 10%;
      img{
        width: 200px;
        height: 200px;
      }
    }
    .title_wrap{
      display: flex;
      align-items: center;
      height: 36px;
      box-shadow: inset 0 -1px 0 0 rgba(0,0,0,0.08);
      color: rgba(0,0,0,0.40);
    }
    .title{
      padding-right: 5px;
      border: 1px solid;
    }
    .rotate_icon{
      transition: all 0.2s;
      transform: rotate(-90deg);
    }
    .channelName_class{
      // padding-left: 32px;
      .head_title_name{
        height: 24px;
        line-height: 24px;
        margin-left: 24px;
      }
    }
    .shrink_wrap{
      display: flex;
      align-items: center;
      height: 64px;
      color: rgba(0,0,0,0.70);
      background: #FFFFFF;
      box-shadow: inset 0 -1px 0 0 rgba(0,0,0,0.08);
    }
    .first_column{
      display: flex;
      align-items: center;
      .jkd{
        font-size: 16px;
        color: rgba(0,0,0,0.90);
        font-weight: 600;
        width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: pointer;
      }
    }
    .ellipise_text{
      margin-right: 16px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  .btns_wrap{
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }
}
</style>

