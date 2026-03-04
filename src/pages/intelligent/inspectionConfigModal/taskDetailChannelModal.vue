<template>
  <el-dialog title="通道点位" :area="[800, 576]" :visible.sync="visible" :before-close="cancel"
    class="task-detail-channel-modal" :close-on-click-modal="false">
    <div class="main_wrap">
      <div class="search_wrap">
        <el-input v-model="filters.channelName" clearable suffix-icon="h-icon-search" class="search_item" placeholder="搜索通道" @click="handleSeach" @clear="handleClear"
          @keyup.enter.native="handleSeach" @change="handleSeach"></el-input>
        <el-input v-model="filters.deviceName" clearable suffix-icon="h-icon-search" class="search_item" placeholder="搜索设备" @click="handleSeach" @clear="handleClear"
          @keyup.enter.native="handleSeach" @change="handleSeach"></el-input>
        <el-input v-model="filters.groupName" clearable suffix-icon="h-icon-search" class="search_item" :placeholder="`搜索${applicationSceneName}`" @click="handleSeach" @clear="handleClear"
          @keyup.enter.native="handleSeach" @change="handleSeach"></el-input>
      </div>
      <el-table :data="tableData" height="420" stripe v-loading="loading">
        <el-table-column prop="groupName" :label="`${applicationSceneName}名称`"></el-table-column>
        <el-table-column prop="deviceName" label="设备名称"></el-table-column>
        <el-table-column prop="channelName" label="通道名称"></el-table-column>
        <el-table-column prop="presetInfoName" label="预置点名称">
          <template slot-scope="scope">
            {{ scope.row.presetInfoName || '--' }}
          </template>
        </el-table-column>
      </el-table>
      <el-pagination :page-sizes="[20, 50, 100, 200]" layout="total, sizes, huiPager, jumper" @size-change="handleSizeChange"
        :current-page="filters.pageNo" :page-size="filters.pageSize" :total="total" @current-change="handleCurrentChange">
      </el-pagination>
    </div>
  </el-dialog>
</template>

<script>
import _ from 'lodash'
import { getChannels } from './../proxy'
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
  },
  watch: {
    visible (val) {
      if (!val) {
        this.reset()
      }
    },
  },
  data () {
    return {
      loading: false,
      taskId: '',
      filters: {
        channelName: '',
        deviceName: '',
        groupName: '',
        pageNo: 1,
        pageSize: 20,
      },
      total: 0,
      tableData: []
    }
  },
  methods: {
    init(item) {
      this.taskId = item.taskId
      this.getChannelList()
    },
    getChannelList: _.debounce(function () {
      this.loading = true
      getChannels({ ...this.filters, taskId: this.taskId }).then(res => {
        this.loading = false
        if (res.code === 0) {
          this.tableData = res.data.rows || []
          this.total = res.data.total
          this.tableData.forEach(item => {
            item.presetInfoName = item.presetInfo.map(val => val.presetName).join('，') || '--'
          })
        }
      })
    }, 200),
    handleSeach() {
      this.filters.pageNo = 1
      this.getChannelList()
    },
    handleClear() {
      this.filters.pageNo = 1
      this.getChannelList()
    },
    handleSizeChange(val) {
      this.filters.pageNo = 1
      this.filters.pageSize = val
      this.getChannelList()
    },
    handleCurrentChange(page) {
      this.filters.pageNo = page
      this.getChannelList()
    },
    cancel () {
      this.$emit('update:visible', false)
    },
    reset() {
      this.tableData = []
      this.filters = {
        channelName: '',
        deviceName: '',
        groupName: '',
        pageNo: 1,
        pageSize: 20,
      }
      this.total = 0
    },
  }
}
</script>

<style lang="scss">
.task-detail-channel-modal{
  .el-dialog__body-wrapper{
    padding: 16px 16px 0;
  }
}
</style>
<style lang="scss" scoped>
.main_wrap{
  .search_wrap{
    display: flex;
    align-content: center;
    margin-bottom: 12px;
    justify-content: space-between;
    .search_item{
      width: 250px;
    }
  }
}
</style>
