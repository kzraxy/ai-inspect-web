<template>
  <el-dialog title='自动更新详情' :visible="visible" @close="close" :close-on-click-modal="false" :area="[880,496]" class="updateDetailModal_modal">
    <el-table :cell-style="{padding: 0}" :height="325" force-scroll :data="tableData" border show-overflow-title>
      <el-table-column prop="taskName" label="任务名称"></el-table-column>
      <el-table-column prop="updateTime" label="更新时间"></el-table-column>
      <el-table-column prop="targetMAP" label="状态">
        <template slot-scope="scope">
          <div class="status_wrap">
            <img
              :src="require('@/icons/svg/' + statusMap[scope.row.status || 'WAIT_DEPLOY'].icon + '.svg')"
              class="icon-svg"
            />
            <!-- <svg-icon
              :icon-class="statusMap[scope.row.status || 'WAIT_DEPLOY'].icon"
              class="icon-svg"
              fontSize="16px"
            /> -->
            <span>{{scope.row.statusMsg}}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="20%">
        <template slot-scope="scope">
          <el-button @click="toDetailPage(scope.row)" type="link" class="table_btn">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination layout="prev, pager, next" :total="total" @current-change="handleCurrentChange" :page-size="8"></el-pagination>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="close">确认</el-button>
      <el-button @click="close">取消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getDeployDetail } from '../proxy'
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    trainId: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      tableData: [],
      params: {
        pageNo: 1,
        pageSize: 8
      },
      total: 0,
      statusMap: {
        'ALL_SUCCESS': { icon: 'common_distribution_completed_nor' },
        'DEPLOYING': { icon: 'common_Issuing_nor' },
        'WAIT_DEPLOY': { icon: 'common_tobe_issued_nor' },
        'PART_SUCCESS': { icon: 'common_distribution_failed_nor' }
      }
    }
  },
  watch: {
    visible (val) {
      if (val) {
        this.getDeployDetail()
      }
    }
  },
  methods: {
    getDeployDetail () {
      getDeployDetail({ ...this.params, trainId: this.trainId }).then(res => {
        if (res.code === 0) {
          this.tableData = res.data.rows
          this.total = res.data.total
        }
      })
    },
    handleCurrentChange (num) {
      this.params.pageNo = num
      this.getDeployDetail()
    },
    close () {
      this.$emit('update:visible', false)
    },
    toDetailPage (row) {
      this.$router.push({ name: 'taskDetail', params: { taskId: row.taskId, type: 'normal', serviceType: this.serviceType } })
    }
  }
}
</script>

<style lang="scss">
.updateDetailModal_modal{
  .el-dialog__body-wrapper{
    padding-bottom: 0;
  }
  .el-pagination {
    margin-top: 24px;
    text-align: right;
  }
  .status_wrap {
    .icon-svg {
      margin-right: 8px;
    }
  }

}
</style>
