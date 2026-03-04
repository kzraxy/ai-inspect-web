<template>
<section v-resize="breadResize" class="left-table-area">
  <section class="search-bar">
    <el-input v-model="filters.channelName" clearable suffix-icon="h-icon-search" class="search_item" placeholder="搜索通道" @click="handleSeach" @clear="handleClear"
      @keyup.enter.native="handleSeach" @change="handleSeach"></el-input>
    <el-input v-model="filters.deviceName" clearable suffix-icon="h-icon-search" class="search_item" placeholder="搜索设备" @click="handleSeach" @clear="handleClear"
      @keyup.enter.native="handleSeach" @change="handleSeach"></el-input>
    <el-input v-model="filters.groupName" clearable suffix-icon="h-icon-search" class="search_item" :placeholder="`搜索${applicationSceneName}`" @click="handleSeach" @clear="handleClear"
      @keyup.enter.native="handleSeach" @change="handleSeach"></el-input>
  </section>
  <el-table ref="multipleTable" v-loading="loading" :data="list" @select="handleSelect" @select-all="handleSelectAll" height="474px" :enable-virtual-scroll="true">
    <el-table-column type="selection"></el-table-column>
    <el-table-column prop="groupName" :label="`${applicationSceneName}名称`"></el-table-column>
    <el-table-column label="设备名称" prop="deviceName"/>
    <el-table-column label="通道名称" prop="channelName"/>
    <el-table-column label="预置点名称" prop="presetInfoName">
      <template slot-scope="scope">
        {{ scope.row.presetInfoName || '--' }}
      </template>
    </el-table-column>
  </el-table>
  <el-pagination :page-sizes="[20, 50, 100]" layout="total, sizes, huiPager, jumper" @size-change="handleSizeChange" class="channelsRange_el-pagination"
    :current-page="filters.pageNo" :page-size="filters.pageSize" :total="total" @current-change="onPageChange">
  </el-pagination>
</section>
</template>
<script>
import _ from 'lodash'
import moment from 'moment'
import { cloneDeep } from 'lodash'
import { getChannels } from './proxy.js'
export default {
  name: 'channelssChoose',
  filters: {
    filterCreateTime(val) {
      return moment(val).format('YYYY/MM/DD HH:mm:ss')
    },
  },
  directives: {
    resize: {
      bind(el, binding, vnode) {
        let width = ''
        function isReize() {
          const style = document.defaultView.getComputedStyle(el)
          if (width !== style.width) {
            binding.value({ width: style.width })
          }
          width = style.width
        }
        el.__vueSetInterval__ = setInterval(isReize, 300)
      },
      unbind(el) {
        clearInterval(el.__vueSetInterval__)
      },
    },
  },
  props: {
    selectedList: {
      type: Array,
      default: () => []
    },
    multipleLimit: {
      type: Number,
      default: 20
    },
    taskId: {
      type: String,
      default:''
    }
  },
  data () {
    return {
      filters: {
        channelName: '',
        deviceName: '',
        groupName: '',
        pageNo: 1,
        pageSize: 20,
      },
      list: [],
      loading: false,
      total: 0,
      selected: [],
    }
  },
  watch: {
    selectedList: {
      handler (val) {
        this.selected = cloneDeep(val)
        this.toggleRowSelectHandle()
      },
      deep: true,
      immediate: true
    },
  },
  mounted() {
    this.handleSeach()
  },
  methods: {
    toggleRowSelectHandle () {
      this.$nextTick(() => {
        const selectedIds = this.selected.map(_ => _.channelId)
        this.$refs.multipleTable && this.list.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(
            row,
            selectedIds.includes(row.channelId)
          )
        })
      })
    },
    async search() {
      this.loading = true
      try {
        const { data } = await getChannels({ ...this.filters, taskId: this.taskId })
        this.list = data.rows || []
        this.$nextTick(() => {
          if (this.selected.length) {
            const selectedIds = this.selected.map(_ => _.channelId)
            const selectedRows = this.list.filter(_ => selectedIds.includes(_.channelId))
            selectedRows.forEach(row => {
              this.$refs.multipleTable.toggleRowSelection(row, true, false)
            })
          }
        })
        this.list.forEach(item => {
          item.presetInfoName = item.presetInfo.map(val => val.presetName).join('，') || '--'
        })
        this.total = data.total
        this.loading = false
      } catch (error) {
        this.loading = false
      }
    },
    search: _.debounce(function () {
      this.loading = true
      getChannels({ ...this.filters, taskId: this.taskId }).then(res => {
        if (res.code === 0) {
          this.list = res.data.rows || []
          this.$nextTick(() => {
            if (this.selected.length) {
              const selectedIds = this.selected.map(_ => _.channelId)
              const selectedRows = this.list.filter(_ => selectedIds.includes(_.channelId))
              selectedRows.forEach(row => {
                this.$refs.multipleTable.toggleRowSelection(row, true, false)
              })
            }
          })
          this.list.forEach(item => {
            item.presetInfoName = item.presetInfo.map(val => val.presetName).join('，') || '--'
          })
          this.total = res.data.total
        }
      }).finally(() => { this.loading = false })
    }, 200),
    handleSizeChange(val) {
      this.filters.pageNo = 1
      this.filters.pageSize = val
      this.search()
    },
    onPageChange(page) {
      if (this.noCurrentChange) {
        this.noCurrentChange = false
        return
      }
      this.filters.pageNo = page
      this.search()
    },
    handleSelect(selection, row, selected) {
      const currentChannelId = row.channelId
      const index = this.selected.findIndex(_ => _.channelId === currentChannelId)
      if (selected) {
        if (this.selected.length === this.multipleLimit) {
          this.$refs.multipleTable.toggleRowSelection(row, false, false)
          return this.$message.warning(`至多选择${this.multipleLimit}个`)
        }
        this.selected.push({
          channelId: row.channelId,
          groupId: row.groupId,
          channelName: row.channelName,
          presetInfo: row.presetInfo,
        })
      } else {
        index > -1 && this.selected.splice(index, 1)
      }
      this.$emit('selection-change', this.selected)
    },
    handleSelectAll(selection, selected, changedList) {
      if (selected) {
        if (this.selected.length + changedList.length > this.multipleLimit) {
          this.$nextTick(() => {
            changedList.forEach(row => {
              this.$refs.multipleTable.toggleRowSelection(row, false, false)
            })
          })
          return this.$message.warning(`至多选择${this.multipleLimit}个`)
        }
        changedList.forEach(row => {
          this.selected.push({
            channelId: row.channelId,
            groupId: row.groupId,
            channelName: row.channelName,
            presetInfo: row.presetInfo,
          })
        })
      } else {
        changedList.forEach(row => {
          const currentChannelId = row.channelId
          const index = this.selected.findIndex(_ => _.channelId === currentChannelId)
          index > -1 && this.selected.splice(index, 1)
        })
      }
      this.$emit('selection-change', this.selected)
    },
    handleSeach() {
      this.filters.pageNo !== 1 && (this.noCurrentChange = true)
      this.filters.pageNo = 1
      this.search()
    },
    handleClear() {
      this.filters.pageNo !== 1 && (this.noCurrentChange = true)
      this.filters.pageNo = 1
      this.search()
    },
    breadResize() {
      const maxWidth = 580
      let totalWidth = 0
      const cloneBreadItemRefs = this.$refs.cloneBreadItemRef
      if (Array.isArray(cloneBreadItemRefs) && cloneBreadItemRefs.length) {
        const findMiddleItem = () => {
          const excludeDropdownItems = cloneBreadItems.filter(_ => _.type !== 'dropdown')
          const middle = excludeDropdownItems[Math.ceil(excludeDropdownItems.length / 2) - 1]
          middle.type = 'dropdown'
          totalWidth -= middle.width
          if (totalWidth + 48 > maxWidth) {
            findMiddleItem()
          }
        }
      }
    },
  }
}
</script>
<style lang="scss">
.channelsRange_el-pagination{
  .el-pagination-wrapper{
    height: 46px!important;
  }
}
</style>
<style lang="scss" scoped>
.channelsRange_el-pagination{
  text-align: left!important;
  margin-top: 0px!important;
}
.left-table-area {
  width: 680px;
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  height: 600px;
  padding: 24px 24px 0px;
  display: flex;
  flex-direction: column;
  float: left;
  .search-bar {
    display: flex;
    margin-bottom: 16px;
    justify-content: space-between;
    .search_item {
      width: 202px;
    }
  }
  .bread-bar {
    margin-bottom: 6px;
  }
}
.el-pagination {
  text-align: center;
  margin-top: 12px;
}
</style>
