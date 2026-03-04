<template>
<el-form-item :label="formLabel" :prop="formProp" introduction-icon="h-icon-help" introduction-placement="top" :description="description">
  <div class="addBtn">
    <el-button class="addButton" type="default" icon="h-icon-add" :disabled="readonly" @click="toSelect">添加（{{selectedList.length}}/{{multipleLimit}}）</el-button>
  </div>
  <section class="right-selected-area">
    <el-scrollbar v-if="selectedList.length" wrap-style="height: 100%; overflow-x: hidden;">
      <ul class="right-selected-area-list">
        <li v-for="select in selectedList" :key="select.channelId">
          <span :class="['right-selected-area-li-item', 'm-file-icon', 'normal-type']">
            {{ select.channelName }}
          </span>
          <el-button icon="h-icon-close" @click="clearSelected(select)"/>
        </li>
      </ul>
    </el-scrollbar>
    <div v-else class="resultEmpty">
      <img src="@/assets/images/common/empty/default_box_60.svg" alt="">
      <span>暂无内容</span>
    </div>
  </section>
  <channelsChooseDialog ref="channelsChooseDialog" :title="dialogTitle" :multiple-limit="multipleLimit" @saved="onSaved"></channelsChooseDialog>
</el-form-item>
</template>
<script>
import { cloneDeep } from 'lodash'
import channelsChooseDialog from './channelsChooseDialog'
export default {
  name: 'channelsRange',
  components: {
    channelsChooseDialog,
  },
  props: {
    value: {
      type: Array,
      default: () => []
    },
    formLabel: {
      type: String,
      default: '内容'
    },
    formProp: {
      type: String,
      default: 'files'
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    dialogTitle: {
      type: String,
      default: '选择'
    },
    showIntroduction: {
      type: Boolean,
      default: false,
    },
    introductionIcon: {
      type: String,
      default: 'h-icon-help'
    },
    introductionPlacement: {
      type: String,
      default: 'top'
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    formLabelPosition: {
      type: String,
      default: 'top'
    },
    formLabelWidth: {
      type: String,
      default: '120px'
    },
    description: {
      type: String,
      default: ''
    },
    multipleLimit: {
      type: Number,
      default: 20
    },
  },
  data () {
    return {
      selectedList: [],
    }
  },
  watch: {
    value(val) {
      this.selectedList = cloneDeep(val)
    }
  },
  mounted() {
    this.selectedList = cloneDeep(this.value)
  },
  methods: {
    toSelect() {
      this.$refs.channelsChooseDialog.open(this.selectedList)
    },
    onSaved(selected = []) {
      this.selectedList = selected
      this.$emit('change', this.selectedList)
    },
    clearSelected(select) {
      if (this.disabled||this.readonly) return
      const currentChannelId = select.channelId
      const index = this.selectedList.findIndex(_ => _.channelId === currentChannelId)
      this.selectedList.splice(index, 1)
      this.$emit('change', this.selectedList)
    },
    liItemMouseEnter(event, select) {
      if (select.showOverflowTitle) return
      if (event.target && event.target.clientWidth === 264) {
        this.$set(select, 'showOverflowTitle', true)
      }
    },
  }
}
</script>
<style lang="scss" scoped>
.addButton {
  border: 1px solid rgba(0,0,0,0.12);
  border-radius: 4px;
  padding: 0 16px 0;
}
.right-selected-area {
  width: 100%;
  height: 180px;
  display: flex;
  flex-direction: column;
  background: #F8F9FB;
  border-radius: 8px;
  margin-top: 15px;
  &-list {
    padding: 14px 8px 14px 14px;
    flex: 1;
    li {
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
      &:last-child {
        margin-bottom: 2px;
      }
    }
  }
  &-li-item {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    line-height: 20px;
  }
  ::v-deep .scrollbar-wrap {
    height: 100%;
    overflow-x: hidden;
  }
}
.resultEmpty {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  >img {
    width: 60px;
    height: 60px;
    margin-bottom: 8px;
  }
  >span {
    font-size: 14px;
    color: rgba(0,0,0,0.40);
    letter-spacing: 0;
    text-align: center;
    line-height: 20px;
    font-weight: 400;
    margin-bottom: 24px;
  }
}
</style>
