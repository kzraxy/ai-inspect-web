<template>
<h-page-container class="scence-manager">
  <h-page-content flex style="padding: 0;">
    <div class="scence-tabs">
      <div class="scence-tab" :class="{'scence-tab-active': activeName==='scenceList'}" @click="chooseTab('scenceList')">
        <div class="scence-tab-name">场景方案库</div>
        <div class="scence-tab-tip">模型应用</div>
      </div>
      <div v-if="!isNewTenant" class="scence-tab" :class="{'scence-tab-active': activeName==='modelList'}" @click="chooseTab('modelList')">
        <div class="scence-tab-name">模型算法</div>
        <div class="scence-tab-tip">底层算法</div>
      </div>
    </div>
    <component :is="activeName" :key="activeName"></component>
  </h-page-content>
  <consult></consult>
</h-page-container>
</template>
<script>
import scenceList from './scenceList.vue'
import modelList from './modelList.vue'
import consult from './modal/consult.vue'
export default {
  name: 'scenceManager',
  components: {
    scenceList,
    modelList,
    consult
  },
  data () {
    return {
      activeName: 'scenceList'
    }
  },
  methods: {
    chooseTab (tabName) {
      this.activeName = tabName
    }
  }
}
</script>
<style lang="scss" scoped>
.scence-manager {
  background-color: #f4f6f8;
  position: relative;
  z-index: 0;
  background-image: url(~@/assets/img/modelPool/scence/BG@2x.png);
  background-repeat: no-repeat;
  background-position: top center;
  background-size: 100% auto;
  min-height: calc(100vh - 48px);
}
.scence-tabs {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0 26px;
  .scence-tab {
    display: flex;
    cursor: pointer;
    &+.scence-tab {
      margin-left: 8px;
    }
    &-name {
      opacity: 0.4;
      font-size: 28px;
      color: rgba(0,0,0,0.90);
      letter-spacing: 0;
      text-align: center;
      line-height: 42px;
      font-weight: 600;
    }
    &-tip {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      padding: 0 7px;
      height: 22px;
      margin-left: 4px;
      border-radius: 11px 11px 11px 0;
      background-color: rgba(174,174,174,0.70);
      font-size: 13px;
      color: #FFFFFF;
      letter-spacing: 0;
      font-weight: 700;
    }
  }
  .scence-tab-active {
    .scence-tab-name {
      opacity: 1;
      position: relative;
      &:after {
        position: absolute;
        left: 50%;
        bottom: -6px;
        transform: translateX(-50%);
        content: '';
        width: 45px;
        height: 4px;
        background: #388EFF;
        border-radius: 3px;
      }
    }
    .scence-tab-tip {
      background-color: none;
      background-image: linear-gradient(-74deg, rgba(146,105,251,0.75) 0%, #05B9FF 82%);
    }
  }
}
</style>
