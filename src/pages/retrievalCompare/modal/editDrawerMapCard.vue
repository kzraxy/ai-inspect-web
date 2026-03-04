<template>
  <div class="editDrawerMapCard" :style="{'margin-bottom': isHover?'-30px':'16px', 'z-index': isHover?'10':'0'}"
    @mouseenter="handleMouseenter($event)" @mouseleave="handleMouseleave($event)"
    :class="{'showCheckbox': checked || selectedList.length>0, 'isChecked': checked, 'isActive': activeCard}">
    <div class="isDrawed" v-show="imageInfo.drawed">已绘制</div>
    <el-checkbox v-if="showCheckbox" class="elCheckbox" :disabled="checkboxDisabled" v-model="checked"
      @change="handleChecked" @click.native="stopDefault($event)">
    </el-checkbox>
    <img :src="imageInfo.picUrl || require('@/assets/img/default_no data_nor.svg')" class="top_img"/>
    <div class="cardTitle" :title="imageInfo.name">{{imageInfo.name || '--'}}</div>
    <div class="deviceCardInfo">
      <span>{{dateFormat(new Date(imageInfo.createTime))}}</span>
      <span class="cardInfoLine"></span>
      <span class="cardInfoName" :title="imageInfo.userName">{{imageInfo.userName}}</span>
      <span class="cardInfoLine"></span>
      <span class="cardInfoSize">{{changeSize(imageInfo.picSize)}}</span>
    </div>
    <div class="cardBtns" :style="{'height': isHover?'46px':'0'}">
    <div class="cardMode1">
      <el-button class="elButton elButtonWidth" type="default" @click="toDelete" style="width:100%">删除图片</el-button>
    </div>
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
  },
  data () {
    return {
      isHover: false,
      checked: false
    }
  },
  watch: {
    imageInfo: {
      handler () {
        this.setChecked()
      },
      deep: true,
      immediate: true
    },
    selectedList: {
      handler () {
        this.setChecked()
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    changeSize,
    dateFormat,
    setChecked() {// 重新设置下选中状态
      const selectedIds = this.selectedList.map(d => { return d.id })
      this.checked = selectedIds.includes(this.imageInfo.id)
    },
    handleChecked (isChecked) {
      this.$emit('select', {
        ...this.imageInfo,
        checked: isChecked
      })
    },
    toDelete() {
      this.$emit('deleteCard', { ...this.imageInfo })
    },
    stopDefault (e) {
      e.stopPropagation()
    },
    handleMouseenter (e) {
      this.isHover = true
    },
    handleMouseleave () {
      this.isHover = false
    },
    handleImgOnload () {
      if (!this.$refs.cardImg) return
      const { width, height } = this.$refs.cardImg
      const containerWidth = 240
      const containerHeight = 135
      if (width / height > containerWidth / containerHeight) {
        this.$refs.cardImg.style.width = '100%'
      } else {
        this.$refs.cardImg.style.height = '100%'
      }
    },
  }
}
</script>
<style lang="scss">
.editDrawerMapCard {
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
.editDrawerMapCard {
  width: 246px;
  background: #FFFFFF;
  border: 1px solid #EEEFF2;
  border-radius: 8px;
  margin-bottom: 16px;
  position: relative;
  &:hover {
    // border: 2px solid #2080f7;
    box-shadow: 0 4px 18px 0 rgba(0,0,0,0.10);
    .elCheckbox {
      display: inline-block;
    }
  }
  .isDrawed{
    width: 52px;
    height: 20px;
    line-height: 20px;
    opacity: 0.8;
    background: #2080f7;
    border-radius: 8px 0 8px 0;
    color: #fff;
    font-size: 12px;
    text-align: center;
    position: absolute;
    left: 0;
    top: 0;
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
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
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
  .deviceCardInfo {
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
.cardBtns {
  display: flex;
  width: 100%;
  height: 0;
  padding: 0 12px;
  overflow: hidden;
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
.elButton {
  height: 30px;
  border: 1px solid #EEEFF2;
  color: rgba(0,0,0,0.90);
  font-weight: 600;
  padding: 0;
  &:hover {
    background: rgba(20,87,251,0.02);
    border: 1px solid #2080f7;
    color: #2080f7;
  }
}
.elButton.is-disabled.el-button--default:not(.is-icon) {
  background: #FFFFFF;
  color: rgba(0,0,0,0.20);
  border: 1px solid #E2E3E6;
  &:hover {
    background: #FFFFFF;
    color: rgba(0,0,0,0.20);
    border: 1px solid #E2E3E6;
  }
}
.elButtonWidth {
  max-width: 300px;
  font-size: 12px;
}
.cardMode1 {
  display: flex;
  align-items: center;
  width: 100%;
  height: 30px;
  margin-top: 4px;
  .el-button+.el-button {
    margin-left: 8px;
  }
  .elButtonIcon {
    height: 30px;
    min-width: 30px;
  }
}
</style>
