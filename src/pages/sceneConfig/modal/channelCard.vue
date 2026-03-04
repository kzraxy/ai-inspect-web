<template>
  <div class="channelCard" :style="{'width': width+'px'}">
    <div class="check_wrap">
      <div :class="{'check_tag':true,'no_choose':!checked,'choose':checked}" @click="handleChecked()" v-show="!loading">
        {{ checked ? '已添加' : '添加' }}
      </div>
      <div class="check__loading_tag" v-show="loading"></div>
    </div>
    <div class="deviceCardName" :title="channelInfo.channelName">{{channelInfo.channelName || '--'}}</div>
    <div class="deviceCardInfo">
      <span class="deviceCardInfoItem">
        <i class="iconfont iconxuliehao"></i>
        <span class="deviceCardTextNumber" :title="channelInfo.deviceSerial">{{channelInfo.deviceSerial || '--'}}</span>
      </span>
      <span class="deviceCardInfoItem">
        <i class="iconfont iconmendian"></i>
        <span class="deviceCardText" :title="channelInfo.groupName">{{channelInfo.groupName || '--'}}</span>
      </span>
    </div>
    <div class="card-line"></div>
    <div class="bottom_wrap">
      <div style="color: rgba(0,0,0,0.40);width: 50px;">所属设备</div>
      <div class="split_line"></div>
      <div class="text" :title="channelInfo.deviceName">「{{ channelInfo.deviceName }}」</div>
      <div class="preset">
        <el-popover popper-class="sceneConfig_preset_panel" placement="right" ref="popoverMenuPanel" :visible-arrow="false" trigger="manual" v-model="presetConfigVisible">
          <el-scrollbar wrap-class="demo-scrollbar-wrap-2" v-clickoutside="hidePresetConfig">
            <div class="container" @wheel.stop="onChildWheel">
              <el-checkbox v-for="(item,index) in channelInfo.presetInfoList" v-model="item.checked" :key="index" :label="item.presetId" @change="changePresetChecked(item)">{{item.presetName}}</el-checkbox>
            </div>
          </el-scrollbar>
        </el-popover>
        <div v-popover:popoverMenuPanel>
          <el-tooltip :content="checkedPresetNamesTitle" placement="top">
            <div class="preset_text" @click="presetConfigVisible = !presetConfigVisible" v-show="channelInfo.presetInfoList.length>1">{{ checkedPresetNames }}</div>
          </el-tooltip>
        </div>
      </div>
    </div>
  </div>
  </template>
  <script>
  import Clickoutside from 'hui/src/utils/clickoutside'
  import { addChannels, delChannels, addPreset, delPreset} from '../proxy'
  export default {
    components: {},
    directives: { Clickoutside },
    props: {
      channelInfo: {
        type: Object,
        default () {
          return {}
        }
      },
      width: {
        type: String,
        default: '226'
      },
      solutionTaskId: {
        type: String,
        default: ''
      },
    },
    data () {
      return {
        popperElm: '',
        loading: false,
        checked: false,
        presetConfigVisible: false,
        operatePreset: false // 是否操作了预置点
      }
    },
    computed: {
      retailChecksPresetList() {
        return this.channelInfo.presetInfoList.filter(v=> v.checked && +v.presetIndex !== -1 )
      },
      checkedPresetNames() {
        return (this.retailChecksPresetList.length > 0) ? this.retailChecksPresetList.map(v=>v.presetName).join('，') : '预置点'
      },
      checkedPresetNamesTitle() {
        return !this.retailChecksPresetList.length ? '点击添加预置点' : `已选预置点：${this.checkedPresetNames}`
      }
    },
    watch: {
      channelInfo: {
        handler (val) {
          this.checked = val.checked
        },
        deep: true,
        immediate: true
      }
    },
    methods: {
      changePresetChecked(item) {
        let proxy = item.checked ? addPreset : delPreset
        proxy({solutionTaskId: this.solutionTaskId, channelPresets: [{channelId: this.channelInfo.channelId, presetInfo: item}]}).then(res => {
          if (res.code === 0) {
            this.operatePreset = true
          } else {
            item.checked = !item.checked
          }
        }).catch(() => item.checked = !item.checked)
      },
      hidePresetConfig() {
        if (this.operatePreset) { // 预置点有改动，关框刷新通道列表
          this.$emit('refreshOneChannelCard', { ...this.channelInfo, solutionTaskId: this.solutionTaskId })
        }
        this.operatePreset = false
        this.presetConfigVisible = false
      },
      handleChecked () {
        this.checked = !this.checked
        let proxy = this.checked ? addChannels : delChannels
        this.loading = true
        proxy({ channelIds: [this.channelInfo.channelId], solutionTaskId: this.solutionTaskId }).then(res => {
          if (res.code === 0) {
            this.$emit('refreshOneChannelCard', { ...this.channelInfo, solutionTaskId: this.solutionTaskId })
          } else {
            this.checked = !this.checked
          }
        }).catch(() => {
          this.checked = !this.checked
        }).finally(() => {
          this.loading = false
        })
      },
      onChildWheel(e) {
        e.stopPropagation()
      },
    },
    mounted() {
      window.addEventListener('wheel', this.hidePresetConfig)
    },
    beforeDestroy() {
      window.removeEventListener('wheel', () => {})
    }
  }
  </script>
  <style lang="scss">
  .sceneConfig_preset_panel{
    overflow-y:auto;
    padding:0;
    .demo-scrollbar-wrap-2{
      max-height: 410px;
    }
    .container{
      display: flex;
      flex-direction: column;
      padding-left: 16px;
      padding-top: 16px;
      padding-bottom: 16px;
      .el-checkbox+.el-checkbox{
        margin-left: 0px;
        margin-top: 4px
      }
    }
  }
  </style>
  <style lang="scss" scoped>
  .channelCard {
    background: #FFFFFF;
    border: 1px solid #EEEFF2;
    border-radius: 8px;
    margin-bottom: 16px;
    margin-right: 16px;
    padding: 12px 16px;
    position: relative;
    .preset{
      display: flex;
      justify-content: flex-end;
      width: 50px
    }
    .preset_text{
      cursor: pointer;
      color: #1E7FFF;
      text-align: right;
      max-width: 50px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .check_wrap{
      position: absolute;
      top: 12px;
      right: 16px;
      .check_tag{
        width: 52px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        font-size: 12px;
      }
      .check__loading_tag{
        width: 20px;
        height: 20px;
        background: url('~@/assets/img/scene/loading3_big.gif') no-repeat;
        background-size: 100% 100%;
      }
      .no_choose{
        border: 1px solid rgba(189,189,189,0.50);
        background: #fff;
        color: #979797;
        cursor: pointer;
      }
      .choose{
        color: #FFFFFF;
        background: #1E7FFF;
        border: 1px solid rgba(30,127,255,0.50);
        cursor: pointer;
      }
    }
    .deviceCardName {
      font-size: 14px;
      color: rgba(0,0,0,0.90);
      letter-spacing: 0.47px;
      text-align: left;
      line-height: 20px;
      font-weight: 600;
      margin-bottom: 16px;
      max-width: 155px;
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
        max-width: 90px;
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
    .bottom_wrap{
      height: 20px;
      display: flex;
      align-items: center;
      font-size: 12px;
      color: rgba(0,0,0,0.70);
      .text{
        width: 110px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .split_line{
        width: 1px;
        height: 10px;
        background: #E2E3E6;
        margin-left: 4px;
        margin-right: 0px;
      }
    }
    .card-line{
      width: 100%;
      margin-top: 14px;
      margin-bottom: 8px;
      border-top: 1px dashed #E2E3E6;
      border-width: thin;
      border-image: repeating-linear-gradient( to right, #e6eaf2 0px, #e6eaf2 5px, transparent 5px, transparent 8px) 1 repeat !important;
    }
  }
  </style>
  