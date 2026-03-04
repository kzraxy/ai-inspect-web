<template>
  <el-dialog title="选择通道" :visible="visible" @close="close" :area="[880,580]" custom-class="config_ruleChannels_modal">
    <div class="head_wrap">
      <div>所选通道</div>
      <el-button type="iconButton" icon="h-icon-arrow_up" @click="uploadChannels" style="color: #2080f7">上传表格导入通道</el-button>
    </div>
    <div class="content" v-loading="courseLoading">
      <div class="course-select-step">
        <div class="category-tree">
          <el-input
            v-model="filters.categoryName"
            placeholder="请输入名称搜索"
            suffix-icon="h-icon-search"
            clearable
            @click="handleTreeSearch"
            @clear="handleTreeClear"
          ></el-input>
          <el-tree class="justList"
            default-expand-all
            :key="categoryTreeKey"
            ref="categoryTree"
            :data="categoryData"
            :props="defaultProps"
            simple-data
            node-key="groupId"
            parent-key="parentId"
            :filter-node-method="filterTreeNode"
            @node-click="handleNodeClick"
          />
        </div>
        <div class="course-wrap">
          <el-input
            v-model="filters.channelSearchName"
            placeholder="请输入名称搜索"
            suffix-icon="h-icon-search"
            clearable
            @click="handleListSearch"
            @clear="handleListClear"
          ></el-input>
          <div class="course-list">
            <VirtualList v-if="courseList.length" :list-data="courseList">
              <template v-slot="dataDefalut">
                <el-checkbox
                  v-model="dataDefalut.item.selected"
                  @change="selected => courseSelectChange(selected, dataDefalut.item)"
                  >{{ dataDefalut.item.name }}</el-checkbox
                >
              </template>
            </VirtualList>
          </div>
        </div>
        <div class="course-selected-area">
          <div class="course-selected-area-top">
            <span class="course-selected-area-top-amount">已选择：{{ courseSelectedList.length }}</span>
            <el-button type="link" :disabled="!courseSelectedList.length" @click="clearAll">清空</el-button>
          </div>
          <VirtualList v-if="courseSelectedList.length" :list-data="courseSelectedList" :item-size="48">
            <template v-slot="dataDefalut">
              <div class="course-selected-item">
                <span
                  class="course-selected-item-name"
                  :title="dataDefalut.item.showOverflowTitle ? dataDefalut.item.name : ''"
                  @mouseenter="e => liItemMouseEnter(e, dataDefalut.item)"
                  >{{ dataDefalut.item.name }}</span
                >
                <el-button icon="h-icon-close" @click="clearSelected(dataDefalut.item)" />
              </div>
            </template>
          </VirtualList>
        </div>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="onSubmit">确定</el-button>
      <el-button @click="close">取消</el-button>
    </span>
    <ExcelUpload ref="excelUpload" :visible.sync="excelUploadShow" templateType="importGroupTemplate" @success="successUpload" errorText="通道"
      @downloadTemplate="downloadTemplate" :otherObj="excelUploadOtherObj" describeText="请先导出所选通道，筛选需要保留通道，上传表格即可完成导入"></ExcelUpload>
    <downloadTemplate ref="downloadTemplate"></downloadTemplate>
  </el-dialog>
</template>

<script>
import VirtualList from '@/components/virtualList'
import ExcelUpload from '@/components/excelUpload'
import downloadTemplate from './downloadTemplate.vue'
export default {
  components: { VirtualList, ExcelUpload, downloadTemplate },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
  },
  data () {
    return {
      excelUploadOtherObj:{},
      courseLoading: false,
      defaultProps: {
        groupId: 'groupId',
        label: 'groupName',
      },
      filters: {
        categoryName: '',
        channelSearchName: '',
      },
      fullChannelData: [],
      categoryData: [],
      courseList: [],
      courseSelectedList: [],
      categoryTreeKey: Date.now(),
      currentTreeData: {},
      excelUploadShow: false
    }
  },
  computed: {
    courseSelectedIds() {
      return this.courseSelectedList.map(_ => _.value)
    },
  },
  methods: {
    downloadTemplate () {
      this.$refs.downloadTemplate.save({ ...this.excelUploadOtherObj })
    },
    successUpload(data) {
      if (data && data.successList && data.successList.length) { // 导入数据覆盖当前已选择数据
        this.courseSelectedList = []
        let rootChannels = this.fullChannelData[0].channels
        for (let i = 0; i < data.successList.length; i++) {
          rootChannels.forEach(item => {
            if (item.channelId === data.successList[i]) {
              this.courseSelectedList.push({
                name: item.channelName,
                value: item.channelId,
                select: true
              })
            }
          })
        }
        this.getCourseCategoryList()
      }
    },
    uploadChannels() {
      this.excelUploadShow = true
    },
    open(rulesFormData, fullChannelData, updateKey, taskId) {
      this.$nextTick(() => {
        this.fullChannelData = fullChannelData
        this.excelUploadOtherObj.key = updateKey
        this.excelUploadOtherObj.taskId = taskId
        this.excelUploadOtherObj.applicationSceneName = this.applicationSceneName
        this.courseSelectedList = []
        let rootChannels = this.fullChannelData[0].channels
        for (let i = 0; i < rulesFormData.channelIdList.length; i++) { // 设置选中值
          rootChannels.forEach(item => {
            if (item.channelId === rulesFormData.channelIdList[i]) {
              this.courseSelectedList.push({
                name: item.channelName,
                value: item.channelId,
                select: true
              })
            }
          })
        }
        this.getCourseCategoryList()
      })
    },
    resetForm() {
      Object.assign(this.$data, this.$options.data())
    },
    async getCourseCategoryList() {
      this.categoryData = this.fullChannelData
      this.$nextTick(() => {
        this.$refs.categoryTree.setSelected('')
        this.handleNodeClick(this.fullChannelData[0])
      })
    },
    filterTreeNode(value, data) {
      if (!value) return true
      return data.groupName.includes(value)
    },
    async handleNodeClick(data) {
      this.currentTreeData = data
      this.courseList = []
      await this.getCourseList()
    },
    handleTreeSearch() {
      this.$refs.categoryTree.filter(this.filters.categoryName)
    },
    handleTreeClear() {
      this.categoryTreeKey = Date.now()
      this.$nextTick(() => {
        this.$refs.categoryTree.setSelected('')
      })
    },
    async getCourseList() {
      const data = this.fullChannelData.filter(item => item.groupId === this.currentTreeData.groupId)[0].channels
      this.courseList = data.map(_ => {
        const selected = this.courseSelectedIds.includes(_.channelId)
        return {
          name: _.channelName,
          value: _.channelId,
          selected: selected
        }
      })
    },
    handleListSearch() {
      let arr = this.courseList.filter(item => item.name.indexOf(this.filters.channelSearchName) > -1)
      this.courseList = arr
    },
    handleListClear() {
      this.getCourseList()
    },
    courseSelectChange(selected, item) {
      if (selected) {
        this.courseSelectedList.push({ ...item })
      } else {
        const index = this.courseSelectedList.findIndex(_ => _.value === item.value)
        index > -1 && this.courseSelectedList.splice(index, 1)
      }
    },
    clearSelected(select) {
      const index = this.courseSelectedList.findIndex(_ => _.value === select.value)
      index > -1 && this.courseSelectedList.splice(index, 1)
      if (this.courseList.length) {
        const selectedRow = this.courseList.filter(_ => _.value === select.value)[0]
        if (selectedRow) {
          selectedRow.selected = false
        }
      }
    },
    clearAll() {
      const selectedIds = this.courseSelectedList.map(_ => _.value)
      this.courseSelectedList = []
      if (this.courseList.length) {
        const selectedRows = this.courseList.filter(_ => selectedIds.includes(_.value))
        if (selectedRows.length) {
          selectedRows.forEach(selectedRow => {
            selectedRow.selected = false
          })
        }
      }
    },
    liItemMouseEnter(event, select) {
      if (select.showOverflowTitle) return
      if (event.target && event.target.clientWidth === 208) {
        this.$set(select, 'showOverflowTitle', true)
      }
    },
    onSubmit() {
      const selectedList = this.courseSelectedList.map(_ => _.value)
      if (!selectedList.length) {
        return this.$message.info('请选择通道！')
      }
      this.$emit('saveChannelList', selectedList)
      this.close()
    },
    close () {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.head_wrap{
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: MicrosoftYaHeiUI;
  color: rgba(0,0,0,0.70);
  line-height: 20px;
  margin-bottom: 4px
}
</style>
<style lang="scss">
.justList{
  .is-leaf{
    width: 10px!important;
  }
}
</style>
<style scoped lang="scss">
.content {
  .course-select-step {
    display: flex;
    height: 420px;
    .category-tree {
      width: 280px;
      border: 1px solid #ebebeb;
      border-radius: 2px 0 0 2px;
      padding: 16px 10px 0;
      display: flex;
      flex-direction: column;
    }
    ::v-deep .el-input__inner {
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 4px;
      margin-bottom: 8px;
    }
    .course-wrap {
      width: 280px;
      border: 1px solid #ebebeb;
      border-radius: 0 2px 2px 0;
      border-left: none;
      padding: 16px 10px 13px;
      display: flex;
      flex-direction: column;
      position: relative;
      .course-list {
        flex: auto;
        ::v-deep .el-checkbox__label {
          max-width: 223px;
          margin-left: 4px;
        }
      }
    }
    .course-selected-area {
      flex: auto;
      padding: 10px 0 0 16px;
      display: flex;
      flex-direction: column;
      border-top: 1px solid #ebebeb;
      &-top {
        display: flex;
        justify-content: space-between;
        height: 32px;
        line-height: 32px;
        margin-bottom: 10px;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.7);
        font-weight: 400;
        padding-right: 16px;
        &-amount {
          font-size: 14px;
          color: rgba(0, 0, 0, 0.7);
          line-height: 32px;
          font-weight: 400;
        }
      }
      .course-selected-item {
        background: rgba(0, 0, 0, 0.04);
        border-radius: 2px;
        width: 264px;
        height: 40px;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.9);
        font-weight: 400;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 12px;
        margin-bottom: 8px;
        &-name {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }
    }
  }
}
.left-table-area {
  width: 680px;
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  height: 600px;
  padding: 24px 40px 16px;
  display: flex;
  flex-direction: column;
  float: left;
  .search-bar {
    width: 680px;
    display: flex;
    margin-bottom: 16px;
    .course-materail-type-select {
      width: 240px;
      margin-right: 24px;
    }
    .course-materail-name-input {
      width: 240px;
    }
  }
  .select-course-tip {
    margin-bottom: 8px;
  }
  .bread-bar {
    margin-bottom: 6px;
  }
}
</style>
