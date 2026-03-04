<template>
  <div class="imgCard" @click="handleClick" :style="{'width':width}"
    :class="{'showCheckbox': true, 'isChecked': checked, 'isActive': activeCard}">
    <!-- :class="{'showCheckbox': checked || selectedList.length>0, 'isChecked': checked, 'isActive': activeCard}"> -->
    <el-checkbox v-if="showCheckbox" class="elCheckbox" :disabled="checkboxDisabled" v-model="checked" 
      @change="handleChecked" @click.native="stopDefault($event)">
    </el-checkbox>
    <img :src="imageInfo.picUrl" class="top_img"/>
    <div class="cardTitle" :title="imageInfo.name">{{imageInfo.name || '--'}}</div>
    <div class="imgCardInfo">
      <span>{{dateFormat(new Date(imageInfo.createTime))}}</span>
      <span class="cardInfoLine"></span>
      <span class="cardInfoName" :title="imageInfo.userName">{{imageInfo.userName}}</span>
      <span class="cardInfoLine"></span>
      <span class="cardInfoSize">{{changeSize(imageInfo.picSize)}}</span>
    </div>
  </div>
</template>
<script>
import { changeSize, dateFormat } from '@/common/util'
export default {
  components: {},
  props: {
    imageInfo: {
      type: Object,
      default () {
        return {}
      }
    },
    selectedList: {
      type: Array,
      default () {
        return []
      }
    },
    showCheckbox: {
      type: Boolean,
      default: false
    },
    checkboxDisabled: {
      type: Boolean,
      default: false
    },
    activeCard: {
      type: Boolean,
      default: false
    },
    width: {
      type: String,
      default: '256px'
    }
  },
  data () {
    return {
      checked: false
    }
  },
  watch: {
    selectedList: {
      handler () {
        this.setChecked()
      },
      deep: true,
      immediate: true
    },
    imageInfo: {
      handler () {
        this.setChecked()
      },
      deep: true,
      immediate: true
    },
  },
  methods: {
    changeSize,
    dateFormat,
    handleClick() {
      this.$emit('click')
    },
    setChecked() { // 设置复选框的选中状态
      const selectedIds = this.selectedList.map(d => { return d.id })
      this.checked = selectedIds.includes(this.imageInfo.id)
    },
    handleSelect () {
      if (this.checkboxDisabled || !this.showCheckbox) return
      this.checked = !this.checked
      this.$emit('select', {
        ...this.imageInfo,
        checked: this.checked
      })
    },
    handleChecked (isChecked) {
      this.$emit('select', {
        ...this.imageInfo,
        checked: isChecked
      })
    },
    stopDefault (e) {
      e.stopPropagation()
    },
  }
}
</script>
<style lang="scss">
.imgCard {
  .el-checkbox__input.is-checked .el-checkbox__inner{
    background: #2080f7;
    border-color:#2080f7;
  }
  .el-checkbox__inner .h-svg-icon-wrapper .el-checkbox__tick{
    fill: #fff;
  }
}
</style>
<style lang="scss" scoped>
.imgCard {
  // width: 256px;
  background: #FFFFFF;
  border: 1px solid #EEEFF2;
  border-radius: 8px;
  margin-bottom: 16px;
  position: relative;
  &:hover {
    box-shadow: 0 2px 8px 0 rgba(0,0,0,0.10);
    .elCheckbox {
      display: inline-block;
    }
  }
  .elCheckbox {
    display: none;
    position: absolute;
    right: 10px;
    top: 10px;
  }
  .top_img{
    width: 100%;
    height: 146px;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }
  .cardTitle {
    font-size: 16px;
    color: rgba(0,0,0,0.90);
    font-weight: 600;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 12px 12px 8px;
  }
  .imgCardInfo {
    display: flex;
    align-items: center;
    color: rgba(0,0,0,0.40);
    padding: 0 12px 12px;
    .cardInfoLine {
      display: inline-block;
      height: 10px;
      width: 0;
      border-left: 1px solid #EEEFF2;
      margin: 0 6px;
    }
    .cardInfoName {
      display: inline-block;
      max-width: 64px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .cardInfoSize {
      display: inline-block;
      max-width: 65px;
    }
  }
}
.isChecked {
}
.isActive{
  border: 2px solid #2080f7;
}
.showCheckbox {
  .el-checkbox {
    display: inline-block;
  }
}
</style>
