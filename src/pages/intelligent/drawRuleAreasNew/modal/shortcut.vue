<template>
  <div class="shortcut">
    <div class="title">快捷键</div>
    <div class="num_wrap">
      <div class="card" v-for="(item,index) in shortcutList" :key="index" @click="chooseNode(item)" 
      :class="{'active_card': currentNode.number===item.number,'used_card':item.isUsed}">{{item.number}}</div>
    </div>
    <div class="error_text">{{errorText}}</div>
    <div class="operate_btns">
      <el-button type="link" @click="confirm" :disabled="!Object.keys(currentNode).length">确定</el-button>
      <div class="cancel_text" @click="cancel">取消</div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    currentLabelItem: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      errorText: '',
      currentNode: {},
      shortcutList: [
        {number:1,isUsed:false},
        {number:2,isUsed:false},
        {number:3,isUsed:false},
        {number:4,isUsed:false},
        {number:5,isUsed:false},
        {number:6,isUsed:false},
        {number:7,isUsed:false},
        {number:8,isUsed:false},
        {number:9,isUsed:false},
        {number:0,isUsed:false}
      ],
    }
  },
  mounted() {
    this.updateShortcutList()
  },
  methods: {
    chooseNode(item) {
      this.currentNode = item
      this.errorText = item.isUsed ? `注：该快捷键已被标签「${item.usedLabelName}」占用，若您依旧要使用，则原检测对象的快捷键会被置空。` : ''
    },
    updateShortcutList() {
      let data = [
        {number:1, isUsed: true, usedLabelName:'两岸两岸番茄两岸番茄两岸番茄两岸番茄番茄'},
        {number:2, isUsed: true, usedLabelName:'两岸番茄'},
        {number:3, isUsed: false, usedLabelName:'两岸番茄'},
        {number:4, isUsed: false, usedLabelName:'两岸番茄'},
        {number:5, isUsed: true, usedLabelName:'请教'},
        {number:6, isUsed: true, usedLabelName:'两岸番茄'},
        {number:7, isUsed: false, usedLabelName:'两岸番茄'},
        {number:8, isUsed: true, usedLabelName:'两岸番茄'},
        {number:9, isUsed: true, usedLabelName:'两岸番茄'},
        {number:0, isUsed: true, usedLabelName:'两岸番茄'},
      ]
      this.shortcutList.forEach(item => {
        data.forEach(val => {
          if(item.number === val.number) {
            item.isUsed = val.isUsed
            item.usedLabelName = val.usedLabelName
          }
        })
      })
    },
    confirm() {
      this.$emit('confirmShortcut', this.currentNode)
    },
    cancel() {
      this.$emit('closeShortcut')
    }
  }
}
</script>
<style lang="scss" scoped>
.shortcut{
  .title{
    color: rgba(40,46,66,0.80);
    margin-bottom: 4px;
  }
  .num_wrap{
    display: flex;
    flex-wrap: wrap;
    .card{
      width: 48px;
      height: 48px;
      line-height: 48px;
      border: 1px solid #E2E3E6;
      border-radius: 8px;
      margin-top: 4px;
      margin-right: 4px;
      text-align: center;
      cursor: pointer;
    }
    .card:last-child{
      width: 152px;
    }
    .active_card{
      border: 2px solid #2080f7;
    }
    .used_card{
      background: rgba(44,54,87,0.02);
    }
  }
  .error_text{
    font-size: 12px;
    color: #F56A4B;
    line-height: 16px;
    width: 202px;
    margin: 8px auto 0px;
    height: 50px;
  }
  .operate_btns{
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-top: 8px;
    height: 20px;
    .cancel_text{
      color: rgba(0,0,0,0.80);
      cursor: pointer;
      margin-left: 16px;
    }
  }
}
</style>
