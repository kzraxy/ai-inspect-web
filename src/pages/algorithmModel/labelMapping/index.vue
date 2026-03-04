<template>
  <div class="label_mapping">
    <div style="width: 100%;">
      <div style="text-align:left;font-size:18px;font-weight:bold;margin-bottom:16px;">标签配置（{{ totalNum }}）</div>
      <el-alert type="info" simple show-icon :closable="false">
        <div slot="title" simple class="el-alert-text">
          <span>因为新的算法的标签可能变更，定义Code能够帮助你在使用API算法分析时归拢不同算法的标签关系，当新算法标签修改后，通过简易配置即可避免业务代码变更</span>
        </div>
      </el-alert>
      <div class="search-mod">
        <div class="base-develop">
          <el-button type="iconButton" icon="h-icon-add" @click="addTask">算法标签映射</el-button>
          <div class="search-info">
            <div class="input_div">
              <el-input v-model="searchForm.nameLike" placeholder="请输入自定义Code或名称搜索" suffix-icon="h-icon-search" clearable
                :on-icon-click="search" :clear-icon-click="clearIconClick" @keyup.enter.native="search"></el-input>
            </div>
          </div>
        </div>
      </div>
      <div class="table_wrap">
        <el-table height="100%" force-scroll :data="tableData" @selection-change="tableSelect" :span-method="objectSpanMethod">
          <el-table-column prop="labelCodeName" label="自定义Code名称"></el-table-column>
          <el-table-column prop="labelCode" label="自定义Code"></el-table-column>
          <el-table-column prop="modelName" label="映射的算法模型名称"></el-table-column>
          <el-table-column prop="trainName" label="算法版本"></el-table-column>
          <el-table-column prop="labelLineName" label="检测对象名称"></el-table-column>
          <el-table-column label="操作" width="150">
            <template slot-scope="scope">
              <el-button @click="editTask(scope.row)" type="iconButton" icon="h-icon-edit" title="编辑"
                class="table_btn"></el-button>
              <el-button @click="delLabelCode(scope.row)" type="iconButton" icon="h-icon-delete" title="删除"
                class="table_btn"></el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>
  
<script>
import { getLabelRelConfigList, delLabelCode } from './proxy'
export default {
  mounted() {
    this.queryList()
  },
  computed: {
  },
  data() {
    return {
      searchForm: {
        nameLike: '',
      },
      totalNum: 0, // 总条数
      tableData: [], // 列表数据
    }
  },
  methods: {
    // 清除输入框内容
    clearIconClick() {
      this.searchForm.nameLike = ''
      this.searchForm.pageNo = 1
      this.search()
    },
    // 删除
    delLabelCode(row) {
      this.$confirm(`是否确认删除${row.labelCodeName}?`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'question'
      }).then(async () => {
        let res = await delLabelCode(row.labelCodeId)
        if (res.code === 0) {
          this.$message.success('删除成功！')
          this.queryList()
        }
      })
    },
    // 编辑
    editTask(row) {
      this.$router.push({ name: 'labelMappingConfig', params: { isAdd: 'edit', labelCodeId: row.labelCodeId, serviceType: this.serviceType } })
    },
    // 新增
    addTask() {
      this.$router.push({ name: 'labelMappingConfig', params: { isAdd: 'add', labelCodeId: false, serviceType: this.serviceType } })
    },
    tableSelect(val) {
      this.tableSelData = val
    },
    search() {
      this.searchForm.pageNo = 1
      this.queryList()
    },
    // 查询列表
    queryList() {
      getLabelRelConfigList(this.searchForm).then(res => {
        if (res.code === 0 && res.data) {
          res.data.forEach(item => {
            item.labelLineList.forEach(val => {
              val.labelCodeName = item.labelCodeName
              val.labelCode = item.labelCode
              val.labelCodeId = item.labelCodeId
            })
          })
          this.tableData = this.handletData(res.data)
          this.totalNum = res.data.length
        }
      })
    },
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if ([0, 1, 5].includes(columnIndex)) {
        return {
          rowspan: row.rowspan,
          colspan: 0
        }
      }
    },
    handletData(data) {
      const arr = []
      data.forEach(item => {
        item.labelLineList.forEach((val, index) => {
          if (index === 0) {
            arr.push({
              ...val,
              rowspan: item.labelLineList.length,
              colspan: 1
            })
          } else {
            arr.push({
              ...val,
              rowspan: 0,
              colspan: 0
            })
          }
        })
      })
      return arr
    }
  }
}
</script>
<style lang="scss" scoped>
.table_wrap{
  height: calc(100vh - 206px);
}
.label_mapping {
  padding: 0 20px 0 24px;
  margin-top: 20px;

  .el-alert-text {
    line-height: 24px;
  }

  .foot {
    height: 50px;
    line-height: 50px;
  }

  .search-info {
    float: right;
    display: flex;
    .input_div{
      width: 290px;
    }
  }

  .primary-btn {
    background: #4692FF;
    border: 1px solid #4692FF;
  }

  .el-table th {
    background: #767A83;
  }

  .search-mod {
    margin-bottom: 10px;
    margin-top: 10px;

    .base-develop {
      overflow: hidden;
      margin-bottom: 10px;

      button {
        float: left;
      }
    }
  }
}
</style>
