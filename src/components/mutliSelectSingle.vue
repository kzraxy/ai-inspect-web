<template>
  <div ref="multiSearch" :class="['h-multi-selector']">
    <div
      :title="selectNames"
      :class="['multi-search-tags', disabled ? 'disabled' : '']"
      @click.stop="changeOpen"
      @mouseenter="mouseenter"
      @mouseleave="mouseleave"
    >
      <div v-if="!collapseTags" class="tags-container">
        <el-tag
          v-if="selectList && selectList.length > 0"
          :title="selectList[0][options.name]"
          :closable="true"
          max-width="90px"
          @close.stop="removeItem(selectList[0][options.id])"
        >
          {{ selectList[0][options.name] }}
        </el-tag>
        <el-tag v-if="selectList && selectList.length > 1" :title="selectNames">
          {{ `+${selectList.length - 1}` }}
        </el-tag>
      </div>
      <div v-else class="tags-container">
        <el-tag
          v-for="tag in selectList.slice(0, collapseTagsMax)"
          :key="tag[options.id]"
          :title="tag[options.name]"
          :closable="true"
          max-width="70px"
          style="padding-right: 24px;"
          @close.stop="removeItem(tag[options.id])"
        >
          {{ tag[options.name] }}
        </el-tag>
        <el-tag v-if="selectList && selectList.length > collapseTagsMax" :title="selectNames">
          {{ `+${selectList.length - collapseTagsMax}` }}
        </el-tag>
      </div>
      <el-input
        :placeholder="selectList && selectList.length > 0 ? '' : textPlaceholder"
        unselectable="on"
        readonly
      >
        <div slot="suffix">
          <i v-if="icon" :class="['el-input__icon', icon]" @click.stop="removeAllItem($event, true)" />
          <i
            style="left: 24px"
            :class="['el-input__icon', 'h-icon-angle_down_sm', { 'icon-rotate': selectFlag }]"
          />
        </div>
      </el-input>
    </div>
  </div>
</template>

<script>
import '@hui-pro/mutli-selector/theme/index.scss'
export default {
  name: 'MutliSelectSingle',
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    options: {
      type: Object,
      default() {
        return {
          id: 'id',
          name: 'name',
        }
      },
    }, // 显示值
    multiNum: {
      type: Number,
      default: 0,
    }, // 选中的个数限制
    textPlaceholder: {
      type: String,
      default: '',
    }, // 输入框
    closable: {
      type: Boolean,
      default: false,
    },
    collapseTags: {
      type: Boolean,
      default: false,
    },
    collapseTagsMax: {
      type: Number,
      default: 5
    }, // 合并时最大展示个数，其他展示为数字
  },
  data() {
    return {
      mouseFlag: false, // 鼠标移入flag
      selectFlag: false,
      selectList: [],
    }
  },
  computed: {
    selectNames() {
      return this.selectList && this.selectList.length
        ? this.selectList.map(item => item[this.options.name]).join(',')
        : ''
    },
    icon() {
      return this.closable && this.mouseFlag && this.selectList.length ? 'h-icon-close_f' : ''
    },
  },
  methods: {
    removeItem(optionId) {
      if (this.disabled) {
        return false
      }
      this.$emit('delete', optionId)
    },
    removeAllItem() {
      if (this.disabled) {
        return false
      }
      this.$emit('deleteAll')
    },
    changeOpen() {
      if (this.disabled) {
        return false
      }
      this.$emit('openDialog')
    },
    set(selectList) {
      this.selectList = selectList
    },
    // 鼠标移入
    mouseenter() {
      this.mouseFlag = true
    },
    mouseleave() {
      this.mouseFlag = false
    },
  },
}
</script>
<style lang="scss" scoped>
::v-deep .h-multi-selector {
  .disabled.multi-search-tags {
    .tags-container,
    .el-input__icon,
    .el-tag,
    .el-tag__close,
    .el-tag .h-icon-close,
    .el-tag__close,
    .el-input__inner {
      cursor: not-allowed !important;
    }
  }
  .h-icon-close {
    cursor: pointer;
  }
}
::v-deep .h-multi-selector .el-input__inner {
  background-color: whitesmoke;
}
</style>
