<template>
  <div class="intelligent-inspectionConfig">
    <div style="width: 100%;">
      <div style="text-align:left;font-size:18px;font-weight:bold;margin-bottom:16px;">合规分析（{{totalNum}}）</div>
      <div class="search-mod">
        <div class="base-develop">
          <el-button type="iconButton" icon="h-icon-add" @click="addTask">添加</el-button>
          <el-button type="iconButton" icon="h-icon-delete" @click="delTask(null)" :disabled="isDisabled">删除</el-button>
          <div class="search-info">
            <div>
              <el-input v-model="searchForm.extraTaskNameLike" placeholder="请输入合规任务名称" suffix-icon="h-icon-search" clearable :on-icon-click="search" :clear-icon-click="clearIconClick" @keyup.enter.native="search"></el-input>
            </div>
          </div>
        </div>
      </div>
      <!-- 表格 -->
      <div class="table-mod config-table" ref="tableRef">
        <el-table :height="tableHeight" :data="tableData" @selection-change="tableSelect" force-scroll="true">
          <el-table-column type="selection"></el-table-column>
          <el-table-column prop="extraTaskName" label="合规任务名称"></el-table-column>
          <el-table-column prop="taskName" label="触发任务名称"></el-table-column>
          <el-table-column prop="publishStatus" label="任务状态">
            <template slot-scope="scope">
              <div class="status-mod">
                <el-switch class="status_operate_btn" @change="changeState(scope)" v-model="scope.row.enable"></el-switch>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间">
            <template slot-scope="scope">
              {{scope.row.createTime}}
            </template>
          </el-table-column>
          <el-table-column label="规则区域绘制">
            <template slot-scope="scope">
              <el-button @click="drawRuleArea(scope.row)" type="text" class="table_btn btn_has_padding" :disabled="!['WELCOME','SEE_OFF'].includes(scope.row.extraTaskType)">绘制</el-button>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button @click="editTask(scope.row.extraTaskId)" type="iconButton" icon="h-icon-edit" title="编辑" class="table_btn"></el-button>
              <el-button @click="delTask(scope.row)" type="iconButton" icon="h-icon-delete" title="删除" class="table_btn"></el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 分页 -->
      <div class="pagePart">
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
    </div>
  </div>
</template>

<script>
import { getInspectionConfigList, delTask, changeState } from './proxy'
import { getFormatTime } from '@/assets/libs/util'
export default {
  mounted () {
    this.handleResize = () => {
      this.$nextTick(() => { this.tableHeight = document.body.clientHeight - 210 })
    }
    window.addEventListener('resize', this.handleResize)
    this.handleResize()
    this.search()
  },
  computed: {
    isDisabled () {
      return this.tableSelData.length === 0
    },
    serviceType () {
      return localStorage.getItem('sfSubsystem')
    }
  },
  data () {
    return {
      tableHeight: 0,
      searchForm: {
        extraTaskNameLike: '',
        pageSize: 20,
        pageNo: 1
      },
      tableSelData: '',
      totalNum: 0, // 总条数
      tableData: [] // 列表数据
    }
  },
  methods: {
    clearIconClick () {
      this.searchForm.extraTaskNameLike = ''
      this.searchForm.pageNo = 1
      this.search()
    },
    delTask (val) {
      let text = val ? val.extraTaskName + '合规任务' : '所选' + this.tableSelData.length + '个合规任务'
      this.$confirm(`确定删除${text}?`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'question'
      }).then(() => {
        let idList = []
        if (val) { // 单个删除
          idList[0] = val.extraTaskId
        } else { // 批量删除
          idList = this.tableSelData.map((item) => {
            return item.extraTaskId
          })
        }
        delTask({ ids: idList }).then((res) => {
          if (res.code === 0) {
            this.$message.success('删除成功')
            this.queryList()
          }
        })
      })
    },
    // 前往绘制规则区域
    async drawRuleArea (row) {
      this.$router.push({ name: 'complianceConfigDrawRuleAreas', params: { extraTaskId: row.extraTaskId, isCloudOrDCT4: true, serviceType: this.serviceType } })
    },
    // 编辑
    editTask (extraTaskId) {
      this.$router.push({ name: 'complianceConfigDetail', params: { isAdd: 'edit', extraTaskId: extraTaskId, serviceType: this.serviceType } })
    },
    // 新增
    addTask () {
      this.$router.push({ name: 'complianceConfigDetail', params: { isAdd: 'add', extraTaskId: false, serviceType: this.serviceType } })
    },
    tableSelect (val) {
      this.tableSelData = val
    },
    search () {
      this.searchForm.pageNo = 1
      this.queryList()
    },
    getFormatTime (val) {
      return getFormatTime(val)
    },
    // 查询列表
    async queryList () {
      getInspectionConfigList(this.searchForm).then(res => {
        if (res.code === 0) {
          this.tableData = res.data.rows || []
          this.totalNum = res.data.total
        }
      }).catch(() => {})
    },
    // 改变启用禁用状态
    changeState (scope) {
      this.$confirm(`确定${scope.row.enable ? `启用` : `禁用`}'${scope.row.extraTaskName}'`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'question'
      }).then(async () => {
        let { code } = await changeState({ extraTaskId: scope.row.extraTaskId, enable: scope.row.enable })
        if (code !== 0) {
          scope.row.enable = !scope.row.enable
        } else {
          this.$message.success(scope.row.enable ? `启用成功` : `禁用成功`)
          this.queryList()
        }
      }).catch(() => {
        scope.row.enable = !scope.row.enable
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
  },
  beforeDestroy() {
    if (this.handleResize) {
      window.removeEventListener('resize', this.handleResize)
    }
  }
}
</script>
<style lang="scss">
  .intelligent-inspectionConfig{
    .btn_has_padding{
      padding-left: 8px;
      padding-right: 8px;
    }
    .publish_status_wrap{
      display: flex;
      align-items: center;
      justify-content: flex-start;
      .status_icon{
        width: 15%
      }
      .status_text{
        width: 70%
      }
    }
    .re_publish_icon{
      &:hover{
        color:#2080f7
      }
    }
    .platform_wrap{
      display: flex;
      align-items: center;
      .h-icon-circle_notice{
        color:red;
        margin-left:5px
      }
    }
    .el-checkbox__input{
      top: 0 !important;
    }
    .demo-scrollbar-wrap {
      max-height: 150px;
      margin-top:10px;
    }
    .items {
      li{
        text-align: left;
        width: 100%;
        background: rgba(255, 221, 221, 1);
        color:#FF0000;
        margin-bottom: 5px;
        height: 30px;
        line-height: 30px;
      }
    }
    .el-alert-text{
      line-height: 24px;
      .link{
        margin-left: 20px;
        font-size: 14px;
        color: #348BFF;
        cursor: pointer;
      }
    }
  }
  .config-table{
    .option-btn{
      display: inline-block;
      padding:0 8px 0 6px;
      color: rgb(32, 128, 247);
      cursor: pointer;
      &:hover {
        color: rgb(32, 186, 247)
      }
    }
    .hasBorder{
      border-left: 1px solid rgb(32, 128, 247);
      border-right: 1px solid rgb(32, 128, 247);
    }
  }
</style>

<style lang="scss" scoped>
  @import "./style.scss";
</style>
