<template>
<el-dialog :title="title" :visible.sync="visible" :area="[1050, 692]" close-on-press-escape
  custom-class="channelsChooseDialog" @closed="resetForm">
  <channelsChoose v-if="visible" :selected-list="selectedList" :multiple-limit="multipleLimit" @selection-change="handleSelectionChange" :taskId="taskId"></channelsChoose>
  <section class="right-selected-area">
    <div class="right-selected-area-top">
      <span class="right-selected-area-top-amount">已选择：{{ selectedList.length }}/{{ multipleLimit }}</span>
      <el-button type="link" :disabled="!selectedList.length" @click="clearAll">清除全部</el-button>
    </div>
    <el-scrollbar wrap-class="scrollbar-wrap">
      <ul class="right-selected-area-list">
        <li v-for="select in selectedList" :key="select.channelId">
          <span class="right-selected-area-li-item" :title="select.channelName">{{ select.channelName }}</span>
          <el-button icon="h-icon-close" @click="clearSelected(select)" />
        </li>
      </ul>
    </el-scrollbar>
  </section>
  <span slot="footer">
    <el-button type="primary" @click="onSubmit">确定</el-button>
    <el-button @click="onClose">取消</el-button>
  </span>
</el-dialog>
</template>
<script>
import channelsChoose from './channelsChoose'
export default {
  name: 'channelsChooseDialog',
  components: {
    channelsChoose,
  },
  props: {
    title: {
      type: String,
      default: '选择'
    },
    multipleLimit: {
      type: Number,
      default: 20
    },
    taskId: {
      type: String,
      default: '选择'
    },
  },
  data () {
    return {
      visible: false,
      selectedList: [],
    }
  },
  methods: {
    handleSelectionChange(list = []) {
      this.selectedList = list
    },
    onSubmit() {
      this.$emit('saved', this.selectedList)
      this.onClose()
    },
    clearSelected(select) {
      const currentChannelId = select.channelId
      const index = this.selectedList.findIndex(_ => _.channelId === currentChannelId)
      this.selectedList.splice(index, 1)
    },
    clearAll() {
      this.selectedList = []
    },
    open(selected = []) {
      this.selectedList = selected
      this.visible = true
    },
    resetForm() {
      this.selectedList = []
    },
    onClose() {
      this.visible = false
    },
  }
}
</script>
<style lang="scss" scoped>
.right-selected-area {
  margin-left: 680px;
  height: 600px;
  padding: 24px 8px 24px 24px;
  display: flex;
  flex-direction: column;
  &-top {
    display: flex;
    justify-content: space-between;
    height: 32px;
    line-height: 32px;
    margin-bottom: 8px;
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
  &-list {
    flex: 1;
    li {
      background: rgba(0, 0, 0, 0.04);
      border-radius: 2px;
      width: 100%;
      height: 44px;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.9);
      font-weight: 400;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 12px;
      margin-bottom: 12px;
      &:last-child {
        margin-bottom: 2px;
      }
    }
  }
  &-li-item {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  ::v-deep .scrollbar-wrap {
    height: 100%;
    overflow-x: hidden;
  }
}
</style>
<style lang="scss">
.channelsChooseDialog {
  .el-dialog__body{
    padding: 0;
  }
  .el-dialog__body-wrapper {
    padding: 0;
  }
}
</style>
