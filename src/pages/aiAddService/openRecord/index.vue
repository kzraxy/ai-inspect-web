<template>
  <div class="openRecord">
    <div class="search_wrap">
      <div class="left">
        <el-button icon="h-icon-export" :plain="true" @click="exportTask">导出</el-button>
      </div>
      <div class="right">
        <el-date-picker :picker-options="pickerOptions" v-model="searchForm.time" type="daterange" :clearable="false" style="width:240px" @input="search"></el-date-picker>
        <el-select v-model="searchForm.productCode" style="margin-left:16px;width:240px" @change="search" clear>
          <el-option v-for="(item, index) in bizTypeList" :key="index" :label="item.consumerProductName" :value="item.consumerProductCode"></el-option>
        </el-select>
      </div>
    </div>
    <div class="table_wrap">
      <el-table :data="tableData" force-scroll="true">
        <el-table-column prop="productName" label="增值服务项"></el-table-column>
        <el-table-column prop="payTime" label="下单时间">
          <template slot-scope="scope">{{getFormatTime(scope.row.payTime)}}</template>
        </el-table-column>
        <el-table-column prop="name" label="开通人"></el-table-column>
        <el-table-column prop="quantity" label="购买路数（路）"></el-table-column>
        <el-table-column label="购买时长">
          <template slot-scope="scope">{{scope.row.period + scope.row.periodUnitName}}</template>
        </el-table-column>
        <el-table-column prop="income" label="订单金额（元）"></el-table-column>
        <el-table-column prop="orderNum" label="订单编号"></el-table-column>
      </el-table>
    </div>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :page-sizes="[10, 20, 25, 50, 100]"
      :current-page="searchForm.pageNo"
      :page-size="searchForm.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="totalNum">
    </el-pagination>
  </div>
</template>

<script>
import { today, day, getDateTime } from '@/plugin/utils/util'
import { getPaidOrderByProductType, getExportTaskId, getByBizType, getExportUrl } from '../proxy'
import { getFormatTime } from '@/assets/libs/util'
export default {
  mounted () {
    this.search()
    this.getByBizTypeList()
  },
  watch: {
    percentageText (val) {
      this.loading.text = val
    }
  },
  data () {
    return {
      pickerOptions: {
        disabledDate (time) {
          return (time.getTime() >= today + day)
        }
      },
      bizTypeList: [],
      loading: null,
      percentageText: '导出中...',
      exportTaskId: '', // 导出任务的id
      searchForm: {
        productCode: '',
        time: [new Date(new Date().getTime() - 3600 * 1000 * 24 * 30), new Date()],
        pageSize: 20,
        pageNo: 1,
      },
      currentDrawTaskId: '', // 当前点击的列表项的任务id——taskId
      unnormalInfo: [], // 异常情况的列表
      totalNum: 0, // 总条数
      tableData: [], // 列表数据
    }
  },
  methods: {
    async getByBizTypeList() {
      this.bizTypeList = [{consumerProductCode: '', consumerProductName: '全部增值类型'}]
      let res = await getByBizType({bizType: 'AI_SCENARIOS'})
      if (res.code === 0) {
        this.bizTypeList = this.bizTypeList.concat(res.data)
      }
    },
    async exportTask () {
      let params = await this.getParams()
      let res = await getExportTaskId(params) // 获取导出任务的id
      if (res.code === 0) {
        this.exportTaskId = res.data || ''
        this.getExportUrl()
        this.loading = this.$loading({ fullscreen: true, text: this.percentageText, customClass: 'export_fullscreen' })
      }
    },
    getExportUrl() { // 通过导入任务的id轮询导出状态
      getExportUrl({ taskId: this.exportTaskId }).then(result => {
        if (+result.code === 0) {
          this.percentageText = '导出中...，已完成' + result.data.percent + '%'
          if (result.data.taskStatus === 'SUCCESS') { // 完成了导出
            this.loading.close()
            window.open(result.data.taskResult)
          } else if (result.data.taskStatus === 'PROCESSING') { // 还是导出中，每一秒再请求一次
            setTimeout(() => {
              this.getExportUrl()
            }, 1000)
          } else if (result.data.taskStatus === 'ERROR') { // 后端传回状态导出失败
            this.loading.close()
            this.$message.error(result.data.errorMessage[0].message)
          }
        }
      })

    },
    search () {
      this.searchForm.pageNo = 1
      this.queryList()
    },
    getFormatTime (val) {
      return getFormatTime(val)
    },
    async getParams () {
      let params = { ...this.searchForm }
      params.productBiz = 'PRD_AI_SCENARIOS'
      params.startDate = this.searchForm.time[0] ? getFormatTime(this.searchForm.time[0]).substr(0, 10) : ''
      params.endDate = this.searchForm.time[1] ? getFormatTime(this.searchForm.time[1]).substr(0, 10) : ''
      delete params.time 
      return params
    },
    // 查询列表
    async queryList () {
      let params = await this.getParams()
      let res = await getPaidOrderByProductType(params)
      if (res.code === 0) {
        this.tableData = res.data.rows || []
        this.totalNum = res.data.total
      }
    },
    // 页数大小改变
    handleSizeChange (val) {
      this.searchForm.pageSize = val
      this.queryList()
    },
    // 当前页改变
    handleCurrentChange (val) {
      this.searchForm.pageNo = val
      this.queryList()
    }
  }
}
</script>

<style lang="scss" scoped>
.openRecord{
  padding: 0 12px;
  .search_wrap{
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 60px;
    .right{
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
  }
  .table_wrap{
    height: calc(100vh - 165px);
  }
}
</style>
