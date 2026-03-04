<template>
  <div class="apiConfig">
    <div style="width: 100%;">
      <div style="text-align:left;font-size:18px;font-weight:bold;margin-bottom:16px;position:relative">
        API分析（{{totalNum}}）
        <div class="top_search">
          <el-input v-model="searchForm.taskNameLike" placeholder="请输入任务名称/算法名称" suffix-icon="h-icon-search" clearable style="width:230px"
            :on-icon-click="search" :clear-icon-click="clearIconClick" @keyup.enter.native="search"></el-input>
        </div>
      </div>
      <el-alert type="info" simple  show-icon :closable="false" title="API分析不扣除“云模型部署套餐包”，普通模型扣1倍“QPS分析接口”、大模型扣除3倍“QPS分析接口”"></el-alert>
      <div class="search-mod">
        <div class="base-develop">
          <el-button type="iconButton" icon="h-icon-add" @click="addAPI('add')">添加</el-button>
          <el-button type="iconButton" icon="h-icon-delete" @click="delAPI(null)" :disabled="isDisabled">删除</el-button>
          <div class="search-info">
            <div class="qps_used_wrap"><div>QPS授权量</div><div class="num">{{qpsObj.usedNum}}/{{qpsObj.authNum}}</div></div>
          </div>
        </div>
      </div>
      <div class="table_wrap">
        <el-table height="100%" force-scroll :data="tableData" @selection-change="tableSelect">
          <el-table-column type="selection"></el-table-column>
          <el-table-column prop="taskName" label="任务名称"></el-table-column>
          <el-table-column prop="algoriithnName" label="算法名称">
            <template slot-scope="scope"><span>{{scope.row.algorithmName || '-'}}</span></template>
          </el-table-column>
          <el-table-column prop="algorithmVersion" label="算法版本">
            <template slot-scope="scope">
              <span>
                {{scope.row.algorithmVersion ? (scope.row.algorithmStatus === 3 ? scope.row.algorithmVersion + '(算法下线)': scope.row.algorithmStatus === 2 ? scope.row.algorithmVersion + '(算法有更新)':scope.row.algorithmVersion) : '-'}}
                {{scope.row.modelPrecision==='HIGH_PRECISION'?'(高精度模型)':scope.row.modelPrecision==='ULTRA_HIGH_PRECISION'?'(观澜大模型)':''}}
                {{scope.row.smallTargetEnhance==='SMALL_TARGET_ENHANCE'?'(双检测模型)':''}}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="enable" label="部署状态" width="220" min-width="220">
            <template slot-scope="scope">
              <div class="status_wrap">
                <div class="publish_status_wrap">
                  <div class="status_icon">
                    <i v-if="!scope.row.enable || ['部署失败'].includes(scope.row.algorithmStatusText)" class="status_close_icon"></i>
                    <i v-else-if="['部署成功'].includes(scope.row.algorithmStatusText)" class="status_icon_publish_success"></i>
                    <i v-else class="status_icon_publishing"></i>
                    <!-- <i class="status_close_icon" :class="{'status_close_icon': !scope.row.enable, 'status_icon_publish_success': ['部署成功'].includes(scope.row.algorithmStatusText)}"></i> -->
                  </div>
                  <div class="status_text">{{ scope.row.enable ? scope.row.algorithmStatusText : '禁用' }}</div>
                </div>
                <el-switch @change="changeState(scope)" v-model="scope.row.enable"></el-switch>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间">
            <template slot-scope="scope">{{getFormatTime(scope.row.createTime)}}</template>
          </el-table-column>
          <el-table-column prop="resourceId" label="模型分析ID"></el-table-column>
          <el-table-column prop="qps" label="QPS数值"></el-table-column>
          <el-table-column label="操作" width='150'>
            <template slot-scope="scope">
              <el-button @click="addAPI('edit', scope.row)" type="iconButton" icon="h-icon-edit" title="编辑" class="table_btn" :disabled="scope.row.algorithmStatus==='progress'"></el-button>
              <el-button @click="delAPI(scope.row)" type="iconButton" icon="h-icon-delete" title="删除" class="table_btn" :disabled="scope.row.algorithmStatus==='progress'"></el-button>
            </template>
          </el-table-column>
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
    <apiConfigModal ref="apiConfigModal" :visible.sync="apiConfigModalVisible" @flash="search"></apiConfigModal>
  </div>
</template>

<script>
import { apideploys, delAPI, getQpsAuthNum, changeState } from './proxy'
import { getFormatTime } from '@/assets/libs/util'
import apiConfigModal from './modal/apiConfigModal.vue'
export default {
  components:{ apiConfigModal },
  mounted () {
    this.search()
  },
  computed: {
    isDisabled () {
      return this.tableSelData.length === 0
    }
  },
  data () {
    return {
      qpsObj: { authNum: 0, usedNum: 0 },
      searchForm: {
        taskNameLike: '',
        pageSize: 20,
        pageNo: 1,
      },
      apiConfigModalVisible: false,
      currentDrawTaskId: '', // 当前点击的列表项的任务id——taskId
      unnormalInfo: [], // 异常情况的列表
      tableSelData: '',
      totalNum: 0, // 总条数
      tableData: [], // 列表数据
    }
  },
  methods: {
    changeState (scope) {
      this.$confirm({
        title: `确认操作`,
        message: `是否确认${scope.row.enable ? `启用` : `禁用`}'${scope.row.taskName}'`,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'question'
      }).then(async () => {
        // 禁用时开启
        let { code } = await changeState({ taskId: scope.row.id, enable: scope.row.enable })
        if (code === 0) {
          this.$message.success(scope.row.enable ? `启用成功` : `禁用成功`)
        } else {
          scope.row.enable = !scope.row.enable
        }
      }).catch(() => {
        scope.row.enable = !scope.row.enable
      })
    },
    async getQpsAuthNum () {
      let { code, data } = await getQpsAuthNum({ saleItemCode: 31057 })
      if (code === 0) {
        this.qpsObj = data
      }
    },
    clearIconClick () {
      this.searchForm.taskNameLike = ''
      this.searchForm.pageNo = 1
      this.search()
    },
    // 删除
    delAPI (val) {
      this.$confirm('是否确认删除?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'question'
      }).then(async () => {
        let idList = []
        if (val) { // 单个删除
          idList[0] = val.id
        } else { // 批量删除
          idList = this.tableSelData.map((item) => {
            return item.id
          })
        }
        let res = await delAPI({ids: idList})
        if (res.code === 0) {
          this.$message.success('删除成功！')
          this.search()
        }
      }).catch(() => {})
    },
    // 新增
    addAPI (type, data) {
      this.apiConfigModalVisible = true
      this.$refs.apiConfigModal.init(type, data)
    },
    tableSelect (val) {
      this.tableSelData = val
    },
    search () {
      this.searchForm.pageNo = 1
      this.queryList()
      this.getQpsAuthNum()
    },
    getFormatTime (val) {
      return getFormatTime(val)
    },
    // 转换部署状态
    changeEnableInfoToText (val) {
      if (val === 'success') {
        return '部署成功'
      } else if (val === 'progress') {
        return '部署中'
      } else if (val === 'failed') {
        return '部署失败'
      } else {
        return '-'
      }
    },
    // 查询列表
    queryList () {
      apideploys(this.searchForm).then(res => {
        if (res.code === 0) {
          res.data.rows.forEach(item => {
            item.algorithmStatusText = this.changeEnableInfoToText(item.algorithmStatus)
          })
          this.tableData = res.data.rows || []
          this.totalNum = res.data.total
        }
      })
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
  @import "./style.scss";
  .table_wrap{
    height: calc(100vh - 250px);
  }
  .top_search{
    position: absolute;
    right: 0;
    top: 0;
  }
  .qps_used_wrap{
    color: rgba(0,0,0,0.60);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    height: 32px;
    .num{
      color: #000000;
      margin-left: 4px;
    }
  }
  .status_wrap{
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .publish_status_wrap{
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: calc(100% - 80px);
    .status_icon{
      width: 25px
    }
    .status_text{
      width: calc(100% - 25px);
    }
  }
</style>
