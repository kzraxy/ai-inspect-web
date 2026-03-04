<template>
  <div>
    <div :class="{'item':true,'activeItem':tag.id===chooseTagId }" @click="chooseTag(tag)">
      <div>{{tag.name}}</div>
      <el-tooltip :content="tag.tip" placement="top">
        <i class="h-icon-help" style="margin-left:2px;font-size:20px" v-show="tag.tip"></i>
      </el-tooltip>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    tag: {
      type: Object,
      default: () => {}
    },
    chooseTagId: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
    }
  },
  methods: {
    chooseTag (val) {
      this.$emit('chooseTag', val)
    }
  }
}
</script>
<style lang="scss" scoped>
.item{
  padding-left: 12px;
  padding-right: 12px;
  height: 32px;
  margin-right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: MicrosoftYaHeiUI;
  font-size: 14px;
  color: rgba(0,0,0,0.70);
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  &:hover{
    background: rgba(0,0,0,0.05);
  }
  i{
    &:hover{
      background: rgba(0,0,0,0);
    }
  }
}
.activeItem{
  font-family: MicrosoftYaHeiUISemibold;
  font-size: 14px;
  color: #2080f7;
  font-weight: 600;
  background: rgba(30,127,255,0.05);
   &:hover{
    background: rgba(30,127,255,0.05);
  }
}
</style>
