<template>
  <div class="deviceCard" :class="{'showCheckbox': checked || selectedList.length>0, 'isChecked': checked}"
    @click="handleSelect" :style="{'width': width+'px'}">
    <el-checkbox
      v-if="showCheckbox"
      class="elCheckbox"
      :disabled="checkboxDisabled"
      v-model="checked"
      @change="handleChecked"
      @click.native="stopDefault($event)"
    ></el-checkbox>
    <!-- <div class="isBind" v-show="showBindTag && deviceInfo.exists">已绑定</div> -->
    <div class="deviceCardName" :title="deviceInfo.deviceName">{{deviceInfo.deviceName || '--'}}</div>
    <div class="deviceCardInfo">
      <span class="deviceCardInfoItem">
        <i class="iconfont iconxuliehao"></i>
        <span class="deviceCardTextNumber" :title="deviceInfo.deviceSerial">{{deviceInfo.deviceSerial || '--'}}</span>
      </span>
      <span class="deviceCardInfoItem">
        <i class="iconfont iconmendian"></i>
        <span class="deviceCardText" :title="deviceInfo.groupName">{{deviceInfo.groupName || '--'}}</span>
      </span>
    </div>
    <template>
      <div class="deviceCardStatus" :class="[deviceInfo.deviceStatus === 1 ? 'online':deviceInfo.deviceStatus === 0 ? 'offline' : 'unknow']">
        {{deviceInfo.deviceStatus === 1 ? '在线':deviceInfo.deviceStatus === 0 ? '离线' : '未知'}}
      </div>
      <!-- <div class="card-line"></div> -->
    </template>
    <div v-if="showStatus" class="card-line"></div>
    <div v-if="showStatus" class="issueStatuses">
      <div class="issueStatus">
        <img :src="require('@/assets/svg/success.svg')" v-if="deviceInfo.status === 'SUCCESS'" style="color: #0DA634;"/>
        <img :src="require('@/assets/svg/error.svg')" v-if="deviceInfo.status === 'ERROR'"  style="color: #0DA634;"/>
        <!-- <h-svg-icon :svgs="[require('@/assets/svg/success.svg')]" v-if="deviceInfo.status === 'SUCCESS'" style="color: #0DA634;"/> -->
        <!-- <h-svg-icon :svgs="[require('@/assets/svg/error.svg')]" v-if="deviceInfo.status === 'ERROR'" style="color: #E01212;"/> -->
        <span v-show="deviceInfo.status === 'SUCCESS'" style="color: #0DA634;">下发成功</span>
        <span v-show="deviceInfo.status === 'WAIT_PUBLISH'" style="color: #ff8f39;">等待下发中...</span>
        <span v-show="deviceInfo.status === 'PUBLISHING'" style="color: #ff8f39;">下发中...</span>
        <span v-show="deviceInfo.status === 'REMOVING'" style="color: #ff8f39;">移除中...</span>
        <span v-show="deviceInfo.status === 'PUBLISHING_ERROR'" style="color: #ff8f39;" :title="deviceInfo.errorMsg">{{ '下发失败：' + deviceInfo.errorMsg || '下发失败' }}</span>
        <span v-show="deviceInfo.status === 'REMOVING_ERROR'" style="color: #ff8f39;" :title="deviceInfo.errorMsg">{{ '移除失败：' + deviceInfo.errorMsg || '移除失败' }}</span>
        <span v-show="deviceInfo.status === 'ERROR'" style="color: #E01212;" :title="deviceInfo.errorMsg">{{ deviceInfo.errorMsg || '失败' }}</span>
      </div>
    </div>
  </div>
  </template>
  <script>
  export default {
    name: 'deviceCard',
    components: {},
    props: {
      deviceInfo: {
        type: Object,
        default () {
          return {}
        }
      },
      showBindTag: {
        type: Boolean,
        default: false
      },
      showStatus: {
        type: Boolean,
        default: true
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
      width: {
        type: String,
        default: '226'
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
          const selectedIds = this.selectedList.map(d => { return d.deviceSerial })
          this.checked = selectedIds.includes(this.deviceInfo.deviceSerial)
        },
        deep: true,
        immediate: true
      }
    },
    methods: {
      handleSelect () {
        if (this.checkboxDisabled || !this.showCheckbox) return
        this.checked = !this.checked
        this.$emit('select', {
          ...this.deviceInfo,
          checked: this.checked
        })
      },
      handleChecked (isChecked) {
        this.$emit('select', {
          ...this.deviceInfo,
          checked: isChecked
        })
      },
      stopDefault (e) {
        e.stopPropagation()
      }
    }
  }
  </script>
  <style lang="scss" scoped>
  .deviceCard {
    // width: 226px;
    // height: 166px;
    background: #FFFFFF;
    border: 1px solid #EEEFF2;
    border-radius: 8px;
    margin-bottom: 16px;
    margin-right: 16px;
    padding: 12px 16px;
    position: relative;
    &:hover {
      box-shadow: 0 4px 18px 0 rgba(0,0,0,0.10);
      .elCheckbox {
        display: inline-block;
      }
    }
    .isBind{
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
      right: 0;
      bottom: 0;
    }
    .elCheckbox {
      display: none;
      position: absolute;
      right: 10px;
      top: 10px;
    }
    .deviceCardName {
      font-size: 14px;
      color: rgba(0,0,0,0.90);
      letter-spacing: 0.47px;
      text-align: left;
      line-height: 20px;
      font-weight: 600;
      margin-bottom: 16px;
      max-width: 190px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .deviceCardInfo {
      display: flex;
      align-items: center;
      font-size: 12px;
      color: rgba(0,0,0,0.70);
      letter-spacing: 0.4px;
      text-align: left;
      line-height: 18px;
      font-weight: 400;
      margin-bottom: 18px;
      .deviceCardInfoItem {
        display: flex;
        align-items: center;
        >i {
          margin-right: 4px;
          font-size: 16px;
        }
      }
      .deviceCardText {
        display: inline-block;
        max-width: 70px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .deviceCardTextNumber {
        display: inline-block;
        max-width: 90px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      >span+span {
        margin-left: 12px;
      }
    }
    .deviceCardStatus {
      width: 52px;
      height: 26px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 14px;
      font-size: 12px;
      letter-spacing: 0.4px;
      line-height: 18px;
      font-weight: 400;
      &:before {
        content: '';
        display: block;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        margin-right: 4px;
      }
    }
    .card-line{
      border-top: 1px dashed #E2E3E6;
      width: 100%;
      margin-top: 16px;
      margin-bottom: 11px;
    }
    .online {
      color: #0DA634;
      background: rgba(13,166,52,0.06);
      &:before {
        background: #0DA634;
      }
    }
    .offline {
      color: #E01212;
      background: rgba(224,18,18,0.06);
      &:before {
        background: #E01212;
      }
    }
    .unknow{
      color: #333;
      background: rgba(0, 0, 0, 0.06);
      &:before {
        background: #333;
      }
    }
    .issueStatuses {
      // margin-top: 20px;
    }
    .issueStatus {
      display: flex;
      align-items: center;
      font-size: 12px;
      letter-spacing: 0.4px;
      text-align: left;
      line-height: 18px;
      font-weight: 400;
      >i {
        font-size: 20px;
      }
      >.h-svg-icon-wrapper {
        font-size: 16px;
        margin-right: 4px;
        flex-shrink: 0;
      }
      span{
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    .issueStatusSuccess {
      color: #0DA634;
    }
    .issueStatusProcessing {
      color: #ff8f39;
      .el-progress {
        width: 80px;
        margin-top: 4px;
        margin-right: 8px;
      }
    }
    .issueStatusfailed {
      color: #E01212;
      >i {
        font-size: 14px;
        transform: rotate(180deg);
        margin-right: 5px;
        &::before {
          color: #E01212;
        }
      }
      span {
        display: inline-block;
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
  .isChecked {
    border: 1px solid #2080f7;
  }
  .showCheckbox {
    .el-checkbox {
      display: inline-block;
    }
  }
  </style>
  