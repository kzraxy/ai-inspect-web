
<template>
  <el-dialog title="筛选置信度" :visible="visible" @close="close" :area="[920,650]" :close-on-click-model="false" custom-class="filterConfidenceModal">
    <div>
      <div class="btn_wrap">
        <el-button type="primary" icon="h-icon-add" @click="addItem">新增查询条件</el-button>
      </div>
      <el-table :data="tableData" show-overflow-title :height="450">
        <el-table-column label="时间" width="280">
          <template slot-scope="scope">
            {{ `${getFormatTime(scope.row.startTime)} - ${getFormatTime(scope.row.endTime)}` }}
          </template>
        </el-table-column>
        <el-table-column prop="ruleName" label="规则" width="120"></el-table-column>
        <el-table-column prop="tagsName" label="标签/属性条件" width="300"></el-table-column>
        <el-table-column label="操作" width="120">
          <template slot-scope="scope">
            <span v-show="+scope.row.status===0">计算中</span>
            <el-button v-show="+scope.row.status===1" @click="showResult(scope.row)" type="link">查看结果</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="searchParams.pageNo"
        :page-sizes="[20, 50, 100]" :page-size="searchParams.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="close">关闭</el-button>
    </span>
    <confidenceResultModal :visible.sync="showConfidenceResultModalVisible" ref="confidenceResultModal" :algorithmVersionType="algorithmVersionType"></confidenceResultModal>
    <creatConfidenceResultModal :visible.sync="creatConfidenceResultModalVisible" :taskInfo="taskInfo" @addSearch="addSearch"></creatConfidenceResultModal>
  </el-dialog>
</template>
<script>
import { getFormatTime } from '@/plugin/utils/util'
import confidenceResultModal from './confidenceResultModal'
import creatConfidenceResultModal from './creatConfidenceResultModal'
import { searchTaskInfos } from '../proxy'
export default {
  components: { confidenceResultModal, creatConfidenceResultModal },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    algorithmVersionType: {
      type: String,
      default: ''
    },
    taskInfo: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      showConfidenceResultModalVisible: false,
      creatConfidenceResultModalVisible: false,
      tableData: [],
      searchParams: {
        pageNo: 1,
        pageSize: 20
      },
      total: 0,
    }
  },
  watch: {
    visible (val) {
      if (!val) {
        this.total = 0
        this.tableData = []
      } else {
        this.initTable()
      }
    }
  },
  methods: {
    getFormatTime,
    addSearch() {
      this.searchParams.pageNo = 1
      this.initTable()
    },
    addItem() {
      this.creatConfidenceResultModalVisible = true
    },
    showResult(row) {
      this.$refs.confidenceResultModal.init(row)
      this.showConfidenceResultModalVisible = true
    },
    initTable() {
      searchTaskInfos({ ...this.searchParams, taskId: this.taskInfo.taskId }).then(res => {
        if (res.code === 0) {
          this.tableData = res.data.rows || []
          this.tableData.forEach((item,index) => {
            item.tags = ''
            item.labelInfos.forEach(label => {
              label.names = label.labelName ? `${label.labelName}(${label.confidence})` : ''
              label.targetStatusInfos = label.targetStatusInfos || []
              if(label.enable) {
                if(label.targetStatusInfos.length && (label.targetStatusInfos.some(_ => _.enable))) {// 标签对象+有属性启用的
                  label.targetStatusInfos.forEach(tar => {
                    if(tar.enable) {// 启用
                      item.tags += label.names ? `${label.names}-${tar.propName}(${tar.confidence}),` : `${tar.propName}(${tar.confidence}),`
                    }
                  })
                } else {// 只有标签对象
                  item.tags += `${label.names},`
                }
              }
            })
            item.tagsName = item.tags.slice(0, -1)
          })
          this.total = res.data.total
        }
      })
    },
    handleSizeChange (val) {
      this.searchParams.pageNo = 1
      this.searchParams.pageSize = val
      this.initTable()
    },
    handleCurrentChange (val) {
      this.searchParams.pageNo = val
      this.initTable()
    },
    close () {
      this.$emit('update:visible', false)
    }
  }
}
</script>
<style lang="scss" scoped>
::v-deep .filterConfidenceModal{
  .el-dialog__body-wrapper{
    padding-bottom: 0px;
  }
}
.btn_wrap{
  margin-bottom: 6px;
}
</style>
