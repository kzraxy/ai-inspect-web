<template>
  <el-dialog title="智能分析任务数" :visible="visible" @close="close" :area="[640,488]" :close-on-click-model=false>
    <el-table :data="tableData" force-scroll stripe height="420">
      <el-table-column prop="taskName" label="任务名称"></el-table-column>
      <el-table-column prop="status" label="部署状态">
        <template slot-scope="scope">
          {{scope.row.status==='success'?'部署成功':scope.row.status==='progress'?'部署中':scope.row.status==='failed'?'部署失败':'-'}}
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间">
        <template slot-scope="scope">{{getFormatTime(scope.row.createTime)}}</template>
      </el-table-column>
      <el-table-column prop="cost" label="消耗云端算法套餐数"></el-table-column>
    </el-table>
  </el-dialog>
</template>
<script>
import { getResourceDetail } from '@/api/serviceManage'
import { getFormatTime } from '@/assets/libs/util'
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    resourceId: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      tableData: [],
    }
  },
  watch: {
    visible (val) {
      if (val) {
        this.getTableData()
      }
    }
  },
  methods: {
    async getTableData () {
      let { code, data } = await getResourceDetail({ pageNo:1, pageSize: 1000, resourceId: this.resourceId })
      if (code === 0) {
        this.tableData = data.rows || []
      }
    },
    getFormatTime (val) {
      return getFormatTime(val)
    },
    close () {
      this.$emit('update:visible', false)
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
