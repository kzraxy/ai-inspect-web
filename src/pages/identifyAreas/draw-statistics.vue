<template>
  <div class="main_wrap">
    <resizeBox ref="resizeBox" :defaultW="280" :minW="280" :maxW="620" @widthChanged="changeResizeBox">
      <div class="left_part">
        <div class="tree_div">
          <treeAnsySearchArea ref='areaTree' @onSelect="onSelect"/>
          <!-- <treeAnsySearch ref="treeAnsySearch" :treeAnsyProps=treeAnsyProps :storeListProps=storeListProps :isInitSelected="true"  @getClickData="getClickData"
          top="5" treeW="100%" treeBot="0" :placeHolder="`请输入${applicationSceneName}名称搜索`"></treeAnsySearch> -->
        </div>
      </div>
    </resizeBox>
    <div class="right_part" ref="rightPart">
      <div class="search_wrap">
        <div class="table_top_left">
          <el-button icon="h-icon-export" @click="handleExport" v-show="['retail', 'aiot', 'enterprise'].includes(serviceType)" :plain="true">导出当前报表</el-button>
        </div>
        <div class="table_top_right">
          <div class="sel-right-top">
            <el-select style="width: 90px;" v-model="searchParams.configType" @change="getAreaDrawingConfig">
              <el-option label="未绘制" value="0"></el-option>
              <el-option label="已绘制" value="1"></el-option>
            </el-select>
            <div class="select_line"></div>
            <h-multi-selector style="width:230px" textPlaceholder="请选择绘制标签" v-model="searchParams.labelIdList" class="__hik-cloud-multi-sel" 
              :dataList="labelsOptions" :options="{id: 'labelId', name: 'lableName'}"/>
          </div>
        </div>
      </div>
      <div class="table_wrap">
        <el-table height="100%" force-scroll :data="tableData" :show-overflow-title="false">
          <el-table-column prop="storeName" label="门店名称"></el-table-column>
          <el-table-column prop="configTodo" label="未绘制标签" width="40%"></el-table-column>
          <el-table-column prop="configDoing" label="已绘制标签" width="40%"></el-table-column>
          <el-table-column label="操作" width="100">
            <template slot-scope="scope">
              <el-button @click="goToDraw(scope.row)" type="iconButton" icon="h-icon-setting" title="绘制"></el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <el-pagination slot="pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="searchParams.pageNo"
        :page-sizes="[20, 50, 100]" :page-size="searchParams.pageSize" layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </div>
  </div>
</template>

<script>
import { areaDrawingStatistics, areaDrawingConfig, areaDrawingExport } from './proxy'
import treeAnsySearchArea from '@/components/treeAnsySearchArea'
import treeAnsySearch from '@/components/treeAnsySearch'
import resizeBox from '@/components/resizeBox'
import _ from 'lodash'
export default {
  components: {
    treeAnsySearch, resizeBox, treeAnsySearchArea
  },
  data () {
    return {
      treeAnsyProps: {
        method: 'get',
        url: '/v1/inspect/taskconfig/taskConfigs/orgsForLine',
        params: {}
      },
      storeListProps: {
        method: '',
        url: '/v1/inspect/taskconfig/taskConfigs/orgs/actions/getByNameLike',
        params: {}
      },
      searchParams: {
        configType: '0',
        labelIdList: [],
        pageNo: 1,
        pageSize: 20,
        orgId: '',
        orgType: 0
      },
      total: 0,
      tableData: [],
      loading: false,
      labelsOptions: []
    }
  },
  watch: {
    'searchParams.labelIdList'() {
      this.resetPageData()
    }
  },
  mounted () {
    this.getAreaDrawingConfig()
  },
  methods: {
    async getAreaDrawingConfig() {
      this.searchParams.labelIdList = []
      let res = await areaDrawingConfig()
      if (res.code === 0) {
        this.labelsOptions = res.data || []
      }
      this.resetPageData()
    },
    async handleExport() {
      await areaDrawingExport(this.searchParams)
      this.$message.success({
        dangerouslyUseHTMLString: true,
        message: `导出任务已提交，请前往<a href="/chain/index.html#/subMenu/download?time=${new Date().getTime()}" target="_blank" style="color: rgb(32, 128, 247); cursor: pointer;padding:0 4px">导出报表</a>进行下载`
      })
    },
    changeResizeBox() {
      this.$nextTick(() => {
        let w = this.$refs.resizeBox.width
        this.$refs.rightPart.style = `width: calc(100% - ${w+30}px);`
      })
    },
    goToDraw (row) {
      window.open(`${location.origin}${location.pathname}#/intelligent/identifyAreas/${this.serviceType}?orgId=${row.storeId}&orgType=1&orgName=${row.storeName}&onlyStore=1`, '_blank')
    },
    onSelect (area) {
      this.searchParams.orgId = area.nodeId
      // this.searchParams.orgType = area.nodeType
      this.resetPageData()
    },
    getClickData (value) {
      this.searchParams.orgId = value.groupId
      // this.searchParams.orgType = value.groupType
      this.resetPageData()
    },
    getList: _.debounce(function () {
      if (!this.searchParams.orgId) {
        return false
      }
      this.loading = true
      areaDrawingStatistics(this.searchParams).then(res => {
        this.loading = false
        if (res.code === 0) {
          this.tableData = res.data.rows || []
          this.total = res.data.total || 0
        }
      })
    }, 200),
    handleSizeChange (val) {
      this.searchParams.pageSize = val
      this.searchParams.pageNo = 1
      this.getList()
    },
    handleCurrentChange (val) {
      this.searchParams.pageNo = val
      this.getList()
    },
    resetPageData () {
      this.searchParams.pageNo = 1
      this.getList()
    }
  }
}
</script>

<style lang="scss" scoped>
.table_wrap{
  height: calc(100vh - 214px);
}
::v-deep .sel-right-top{
  .__hik-cloud-multi-sel{
    .el-input__inner{
      border-left: none;
    }
    .el-tag--maxwidth{
      .el-tag--maxwidth{
        max-width: 90px!important;
      }
    }
  }
  .multi-search-container{
    .el-input__inner{
      border-left: 1px solid rgb(178.5, 178.5, 178.5)
    }
  }
  .el-select{
    .el-input{
      input{
        border-right: none;
        padding-left: 5px;
        padding-right: 18px!important;
      }
      .el-input__suffix{
        right: 0
      }
    }
    .el-input__inner:hover{
      border-color: #b3b3b3;
    }
  }
  .input-clearable{
    input{
      border-left: none;
    }
    .el-input__inner:hover{
      border-color: #b3b3b3;
    }
  }
  .el-input__inner:focus{
    border-color: #b3b3b3;
  }
}
.sel-right-top{
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-left: 12px;
  position: relative;
  .select_line{
    position: absolute;
    width: 1px;
    height: 18px;
    background: #E2E3E6;
    left: 90px;
    z-index: 2;
  }
}
.main_wrap{
  position:relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  height: calc(100vh - 102px);
  padding: 0 12px 0 2px;
  .left_part{
    width: 100%;
    height: 100%;
    border-right: 1px solid #e0e0e0;
    .tree_div{
      width: 100%;
      height: 100%;
    }
  }
  .right_part{
    flex: 1;
    width: calc(100% - 310px);
    margin-left: 12px;
    .search_wrap{
      display: flex;
      align-items: center;
      justify-content: space-between;
      height:56px;
      .table_top_left{
        width: 400px;
      }
      .table_top_right{
        display: flex;
        align-items: center
      }
    }
  }
}
</style>
