<template>
  <div class="card" :style="{'margin-bottom': isHover?'-30px':'16px', 'z-index': isHover?'10':'0'}"
    @mouseenter="handleMouseenter($event)" @mouseleave="handleMouseleave($event)">
    <div class="solutionTag">{{ cardInfo.solutionName }}</div>
    <div class="cardBanner">
      <el-checkbox @click.native.stop v-if="isShowCheckCard && !noNeedChecked" class="card-checkbox" v-model="cardInfo.checked"></el-checkbox>
      <img class="cardImg" ref="cardImg" :style="{'backgroundImage': handleBg(cardInfo),'backgroundSize':'256px 146px','background-repeat':'no-repeat'}">
    </div>
    <div class="cardInfos">
      <div class="cardTitle">
        <inputNameEdit ref="inputNameEdit" v-model="cardInfo.solutionTaskName" :width="220" :fontSize="16" :iconSize="24" :isUpdateImmediate="false" :isShowEdit="false"
          @update="updateNameHandler">
        </inputNameEdit>
      </div>
      <div class="cardInfo">
        <el-tooltip content="更新时间" placement="top" popper-class="mini_top_tooltip_4">
          <span>{{dateFormat(new Date(cardInfo.updateTime))}}</span>
        </el-tooltip>
        <span class="cardInfoLine"></span>
        <el-tooltip content="更新人员" placement="top" popper-class="mini_top_tooltip_4">
          <span class="cardInfoName" :title="cardInfo.updaterName">{{cardInfo.updaterName}}</span>
        </el-tooltip>
      </div>
      <div class="cardResult" v-if="publishStatus === 'PUBLISHED'">
        <div class="cardResultLeft">
          <div class="cardDevicesOuter" @click="handleShowDevices(cardInfo, 'used')">
            <div class="cardDevicesMode">通道数量</div>
            <div class="cardDevices">
              <i class="iconfont iconshebei"></i>
              <span>{{cardInfo.channelNum}}</span>
            </div>
          </div>
          <span v-if="cardInfo.channelNum===0" class="cardFail">无通道</span>
        </div>
      </div>
    </div>
    <div class="cardBtns" :style="{'height': isHover?'46px':'0'}">
      <div class="cardMode1" v-if="publishStatus === 'UNPUBLISHED'">
        <el-button class="elButton elButtonWidth" type="default" @click="enableTask(cardInfo, true)">启用</el-button>
        <el-button class="elButton elButtonWidth" type="default" @click="goDetail(cardInfo)">编辑</el-button>
        <el-button class="elButton elButtonWidth" type="default" @click="goTaskDetail(cardInfo)">详情</el-button>
        <div class="f_r_btn">
          <el-tooltip content="删除任务" placement="top" popper-class="mini_top_tooltip_4">
            <el-button icon="icon iconfont icona-aicopy2" :plain="true" @click="toDelete(cardInfo)"/>
          </el-tooltip>
        </div>
      </div>
      <!-- <div class="cardMode1" v-if="publishStatus === 'PUBLISHED'">
        <el-button class="elButton elButtonWidth" type="default" @click="enableTask(cardInfo)">禁用任务</el-button>
        <el-button class="elButton elButtonWidth" type="default" @click="goDetail(cardInfo)">编辑任务</el-button>
        <div class="f_r_btn">
          <el-tooltip content="复制任务" placement="top" popper-class="mini_top_tooltip_4">
            <el-button icon="icon iconfont icona-aicopy1" :plain="true" @click="copyTask(cardInfo)"/>
          </el-tooltip>
        </div>
      </div> -->
      <div class="cardMode1" v-if="publishStatus === 'PUBLISHED'">
        <el-button class="elButton elButtonWidth" type="default" @click="enableTask(cardInfo, false)">禁用</el-button>
        <el-button class="elButton elButtonWidth" type="default" @click="goDetail(cardInfo)">编辑</el-button>
        <el-button class="elButton elButtonWidth" type="default" @click="goTaskDetail(cardInfo)">详情</el-button>
        <div class="f_r_btn">
          <el-tooltip content="模拟验证" placement="top" popper-class="mini_top_tooltip_4">
            <el-button icon="icon iconfont iconfakeValid" :plain="true" @click="simulateVerify"/>
          </el-tooltip>
        </div>
      </div>
    </div>
    <simulateVerifyModal :visible.sync="simulateVerifyModalVisible" :cardInfo="currentTaskItem" ></simulateVerifyModal>
  </div>
</template>
<script>
import { dateFormat } from '@/common/util'
import { deleteSolutionTask, enableSolutionTask } from '../proxy'
import inputNameEdit from '@/components/inputNameEdit.vue'
import simulateVerifyModal from '@/components/simulateVerifyModal'
export default {
  components: {
    inputNameEdit, simulateVerifyModal
  },
  props: {
    cardInfo: {
      type: Object,
      default () {
        return {
        }
      }
    },
    publishStatus: {
      type: String,
      default: 'PUBLISHED'
    },
    taskSource: {
      type: String,
      default: 'SELF'
    },
    isShowCheck: {
      type: Boolean,
      default: false
    },
    noNeedChecked: { // 不需要hover显示复选框
      type: Boolean,
      default: true
    },
  },
  data () {
    return {
      isHover: false,
      toEditLoading: false,
      simulateVerifyModalVisible: false
    }
  },
  computed: {
    isShowCheckCard() {
      if(this.publishStatus === 'PUBLISHED') {
        return false
      }
      if(this.isShowCheck || this.isHover) {
        return true
      }
      return false
    },
    currentTaskItem() {
      return { ...this.cardInfo, taskFrom: 'solution' }
    }
  },
  mounted () {
  },
  methods: {
    dateFormat,
    simulateVerify() {
      this.simulateVerifyModalVisible = true
    },
    handleBg(item) {
      let sceneBg = item.imageUrl ? item.imageUrl : 'default'
      return sceneBg.includes('http')?`url("${sceneBg}")`:'url(' + `${this.staticResourceOrigin}/static/userManual/poseidon/assets/img/scence/${sceneBg}/card.png` + ')'
    },
    enableTask(row, enable) {
      this.$confirm(enable ? '是否确认启用任务？' : '禁用后，设备将不再进行分析任务',{
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'question'
      }).then(() => {
        this.changeEnableTask(row, enable)
      })
    },
    async changeEnableTask(row, enable) {
      const { code } = await enableSolutionTask({ solutionTaskId: row.solutionTaskId, enable: enable })
      if (code === 0) {
        this.$message.success('操作成功！')
        this.$emit('changeEnableStatus', row)
      }
    },
    handleRedirectDownloadPage() {
      window.open(`${window.location.origin}/chain/index.html#/subMenu/download`)
    },
    toDelete (row) {
      this.$confirm(`删除后，任务将彻底从平台中移除`,{
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'question'
      }).then(async () => {
        const { code } = await deleteSolutionTask({ solutionTaskId: row.solutionTaskId })
        if (+code === 0) {
          this.$message.success('操作成功！')
          this.$emit('deleteOne', row)
        }
      })
    },
    async updateNameHandler (val) {
    },
    goDetail (val) {
      this.isHover = false
      this.$router.push({ name: 'editSceneTask', query: { solutionId: val.solutionId, publishStatus: this.publishStatus, taskSource: val.taskSource, addType: 'edit', solutionTaskId: val.solutionTaskId } })
    },
    goTaskDetail (val) {
      this.isHover = false
      this.$router.push({ name: 'sceneTaskDetail', query: { publishStatus: this.publishStatus, solutionTaskId: val.solutionTaskId, solutionTaskName: val.solutionTaskName } })
    },
    copyTask(val) {
      // 获取虚拟的solutionTaskId
      /* getTempSolutionTaskId().then(res => {
        if (res.code === 0) {
          this.$router.push({ name: 'editSceneTask', query: { solutionId: val.solutionId, publishStatus: this.publishStatus, taskSource: val.taskSource, addType: 'copy', solutionTaskId: res.data.solutionTaskId } })
        }
      }) */
    },
    handleShowDevices (cardInfo, useStatus) {
      this.$emit('showDevices', cardInfo, useStatus)
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
.mini_top_tooltip_4{
  transform: translateY(4px)!important;
}
.cardMode1{
  .is-plain{
    height: 30px;
    border: 1px solid #EEF0F2;
    border-radius: 2px;
  }
  .f_r_btn{
    position: absolute;
    right: 0;
    .el-button i{
      font-size: 18px;
    }
  }
}
</style>
<style lang="scss" scoped>
.card {
  width: 258px;
  background: #FFFFFF;
  border: 1px solid #EEEFF2;
  border-radius: 8px;
  margin-bottom: 16px;
  margin-right: 16px;
  position: relative;
  &:hover {
    box-shadow: 0 4px 18px 0 rgba(0,0,0,0.10);
  }
  .solutionTag{
    line-height: 20px;
    position: absolute;
    opacity: 0.8;
    background: #1457FB;
    border-radius: 8px 0 8px 0;
    font-size: 12px;
    color: #FFFFFF; 
    padding-left: 8px;
    padding-right: 8px;
    z-index:3
  }
  .cardBanner {
    width: 100%;
    height: 146px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    border-radius: 8px 8px 0 0;
    overflow: hidden;
    .empty_text{
      position: absolute;
      bottom: 0;
      color: #999;
    }
    .card-checkbox{
      position: absolute;
      right: 6px;
      top: 6px;
      ::v-deep.el-checkbox__input.is-disabled .el-checkbox__inner{
        background-color: #e2e3e6!important;
      }
    }
    .cardImg {
      width: 100%;
      height: 100%;
    }
    .cardImgAudio {
      max-width: auto;
      max-height: auto;
      width: 100%;
      height: 100%;
    }
    .cardTips {
      position: absolute;
      left: 0;
      top: 0;
      display: flex;
      align-items: center;
      .cardTipGroupStatus {
        background: #2080f7;
        border-radius: 8px 0 0 0;
      }
      .cardTipShowType1 {
        background: #00802A;
        border-radius: 0 0 8px 0;
      }
      .cardTipShowType2 {
        background: #A10AEF;
        border-radius: 0 0 8px 0;
      }
      .cardTipAudio {
        background: #2080f7;
        border-radius: 8px 0 8px 0;
      }
    }
  }
  .cardInfos {
    padding: 12px;
    .cardTitle {
      display: flex;
      align-items: center;
      font-size: 16px;
      color: rgba(0,0,0,0.90);
      letter-spacing: 0;
      line-height: 24px;
      font-weight: 600;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .cardInfo {
      display: flex;
      align-items: center;
      font-size: 14px;
      color: rgba(0,0,0,0.40);
      letter-spacing: 0.47px;
      text-align: left;
      line-height: 20px;
      font-weight: 400;
      margin-top: 8px;
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
    .cardResult {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 12px;
      .cardResultLeft {
        display: flex;
        align-items: center;
      }
      .cardDevicesOuter {
        display: flex;
        align-items: center;
        background: rgba(0,0,0,0.02);
        border: 1px solid #EEEFF2;
        border-radius: 2px;
        cursor: pointer;
      }
      .cardDevicesMode {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        padding: 1px 8px;
        font-size: 12px;
        color: #000000;
        letter-spacing: 0.4px;
        text-align: left;
        line-height: 18px;
        font-weight: 400;
        border-right: 1px solid #EEEFF2;
      }
      .cardDevices {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        background: rgba(0,0,0,0.02);
        padding: 1px 8px 1px 4px;
        font-size: 12px;
        color: rgba(0,0,0,0.60);
        letter-spacing: 0.4px;
        text-align: left;
        line-height: 18px;
        font-weight: 400;
        >i {
          font-size: 16px;
          color: #B4B5BF;
          margin-right: 4px;
          margin-top: 2px;
        }
      }
      .cardFail {
        font-size: 12px;
        color: #E01212;
        letter-spacing: 0.4px;
        text-align: left;
        line-height: 18px;
        font-weight: 400;
        margin-left: 8px;
        cursor: pointer;
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
  width: 58px;
  min-width: 55px;
  font-size: 12px;
}
.cardMode1 {
  display: flex;
  align-items: center;
  width: 100%;
  height: 30px;
  margin-top: 4px;
  position: relative;
  .el-button+.el-button {
    margin-left: 8px;
  }
  .elButtonIcon {
    height: 30px;
    min-width: 30px;
  }
}
.f_r_btn{
  position: absolute;
  right: 0;
}
.btnsList {
  display: flex;
  flex-direction: column;
  padding: 8px 0;
  border-radius: 4px;
  .el-button+.el-button {
    margin-left: 0;
  }
  .el-button {
    height: 34px;
    border: none;
    text-align: left;
    border-radius: 2px;
    font-size: 12px;
    &:hover {
      border: none;
      background: #F7F7F7;
    }
  }
}
.elButtonMore {
  border: 1px solid #EEF0F2;
  border-radius: 2px;
  color: rgba(0,0,0,0.90);
  &:hover:not(.is-disabled) {
    color: rgba(0,0,0,0.90);
    background-color: rgba(0,0,0,0.02);
    border-color: transparent;
  }
}
.messageToReviewLine {
  border-left: 1px solid #E2E3E6;
  line-height: 16px;
  margin: 0 8px;
}
.messageToReview {
  color: #2080f7;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
}
::v-deep .elButtonIcon {
  border: 1px solid #EEF0F2;
  border-radius: 2px;
  >i {
    font-size: 16px;
  }
  &:hover {
    background-color: rgba(0,0,0,0.02);
    border-color: transparent;
  }
}
.export-device-message {
  .export-device-message-text {
    color: #2196F3;
    cursor: pointer;
  }
}
</style>
