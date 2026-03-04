<template>
  <el-dialog custom-class="tasksDialog" title="关联任务详情" :visible="visible":area="[928,600]" @close="close">
    <div class="main_wrap">
      <div class="pageAction">
        <div class="leftAction">
          <el-input v-model="search.taskName" clearable suffix-icon="h-icon-search" class="search_item" placeholder="搜索任务" @click="handleSeach" @clear="handleClear"
            @keyup.enter.native="handleSeach" @change="handleSeach"></el-input>
        </div>
        <div class="rightAction">
          <div class="devicesBtns">
          </div>
        </div>
      </div>
      <el-table :data="tableData" height="420" stripe v-loading="isLoading">
        <el-table-column prop="taskName" label="任务名称"></el-table-column>
        <el-table-column prop="taskFrom" label="任务来源"></el-table-column>
        <el-table-column prop="labelName" label="标签名称"></el-table-column>
        <!-- <el-table-column prop="imageTaskStatus" label="图库状态">
          <template slot-scope="scope">
            {{ scope.row.imageTaskStatus === 'complete' ? '成功' : '部分失败'}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template slot-scope="scope">
            <el-button type="link" @click="reTry(scope.row)" :disabled="scope.row.imageTaskStatus === 'complete'">重新下发</el-button>
          </template>
        </el-table-column> -->
      </el-table>
      <el-pagination :page-sizes="[20, 50, 100]" layout="total, sizes, huiPager, jumper" @size-change="handleSizeChange"
        :current-page="search.pageNo" :page-size="search.pageSize" :total="total" @current-change="handleCurrentChange">
      </el-pagination>
    </div>
  </el-dialog>
</template>
<script>
import { getTaskInfoPage, retry } from '../proxy'
import _ from 'lodash'
export default {
  data () {
    return {
      isLoading: false,
      total: 0,
      search: {
        taskName: '',
        pageNo: 1,
        pageSize: 20,
      },
      tableData: [],
    }
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
    },
    defaultStatus: {
      type: String,
      default: ''
    },
  },
  watch: {
    visible: {
      handler (val) {
        if (val) {
          this.getTaskInfoPage()
        } else {
          this.reset()
        }
      }
    }
  },
  methods: {
    reTry(row) {
      retry({id: row.id}).then(res => { 
        if (res.code === 0) {
          this.$message.success('操作成功！')
        }
      })
    },
    close () {
      this.$emit('update:visible', false)
    },
    getTaskInfoPage: _.debounce(function () {
      this.loading = true
      getTaskInfoPage({ imageLibraryId: this.cardInfo.imageLibraryId, ...this.search}).then(res => {
        this.loading = false
        if (res.code === 0) {
          this.tableData = res.data.rows || []
          this.total = res.data.total
          this.tableData.forEach(item => item.taskFrom = item.taskType==='SCENARIO' ? '场景任务' : item.taskType==='CUSTOMIZATION' ? '定制任务' : '--')
        }
      })
    }, 200),
    handleSeach() {
      this.search.pageNo = 1
      this.getTaskInfoPage()
    },
    handleClear() {
      this.search.pageNo = 1
      this.getTaskInfoPage()
    },
    handleSizeChange(val) {
      this.search.pageNo = 1
      this.search.pageSize = val
      this.getTaskInfoPage()
    },
    handleCurrentChange(page) {
      this.search.pageNo = page
      this.getTaskInfoPage()
    },
    reset() {
      this.total = 0
      this.search = {
        taskName: '',
        pageNo: 1,
        pageSize: 20,
      },
      this.tableData = []
    }
  }
}
</script>
<style lang="scss" scoped>
.el-dialog__wrapper {
  ::v-deep .tasksDialog {
    border-radius: 8px;
    .el-dialog__header {
      height: 56px;
      border-radius: 8px 8px 0 0;
      // border: none;
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
      padding: 0;
      .el-scrollbar{
        width: 100%;
      }
      .el-dialog__body-wrapper {
        padding: 0 24px 24px;
      }
    }
  }
}
.main_wrap {
  padding-top: 16px;
  .pageAction{
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-right: 16px;
    margin-bottom: 12px;
    .leftAction {
      display: flex;
      align-items: center;
      .search_item{
        width: 240px;
      }
    }
  }
  .devicesListOuter {
    height: 450px;
    display: flex;
    flex-direction: column;
    .devicesListWrap {
      height: 100%;
      padding: 16px 0 0;
      .devicesList {
        display: flex;
        flex-wrap: wrap;
        .deviceCard:nth-child(3n+3) {
          margin-right: 0;
        }
        .deviceCardWidth {
          width: 271px;
        }
        .deviceCard {
          ::v-deep .deviceCardInfo .deviceCardText {
            max-width: 94px;
          }
          ::v-deep .deviceCardInfo .deviceCardTextNumber{
            max-width: 94px;
          }
        }
      }
    }
  }
}
</style>
