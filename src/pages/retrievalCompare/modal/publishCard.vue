<template>
  <div class="card" :style="{'margin-bottom': isHover?'-30px':'16px', 'z-index': isHover?'10':'0'}"
    @mouseenter="handleMouseenter($event)" @mouseleave="handleMouseleave($event)">
    <div class="cardBanner">
      <el-checkbox @click.native.stop v-if="isShowCheckCard && !noNeedChecked" class="card-checkbox" v-model="cardInfo.checked"></el-checkbox>
      <img class="cardImg" ref="cardImg" @load="handleImgOnload" :src="cardInfo.coverPicUrl || require('@/assets/img/default_no data_nor.svg')">
      <div v-show="!cardInfo.coverPicUrl" class="empty_text">暂无图片</div>
    </div>
    <div class="cardInfos">
      <div class="cardTitle">
        <inputNameEdit ref="inputNameEdit" v-model="cardInfo.name" :width="220" :fontSize="16" :iconSize="24" :isUpdateImmediate="false" :isShowEdit="true"
          @update="updateNameHandler" :maxlength="32">
        </inputNameEdit>
      </div>
      <div class="cardInfo">
        <span>{{dateFormat(new Date(cardInfo.createTime))}}</span>
        <span class="cardInfoLine"></span>
        <span class="cardInfoName" :title="cardInfo.userName">{{cardInfo.userName}}</span>
        <span class="cardInfoLine"></span>
        <span class="cardInfoSize">{{changeSize(cardInfo.librarySize)}}</span>
      </div>
      <div class="cardResult" v-if="publishStatus === 'PUBLISHED' && libraryType === 'EDGE'">
        <div class="cardResultLeft">
          <div class="cardDevicesOuter" @click="handleShowDevices(cardInfo, '')">
            <div class="cardDevicesMode">设备下发</div>
            <div class="cardDevices">
              <i class="iconfont iconshebei"></i>
              <span>{{cardInfo.publishInfo.devicePublishCount}}</span>
            </div>
          </div>
          <span v-if="cardInfo.publishInfo.devicePublishCount===0" class="cardFail">无投放设备</span>
          <span v-if="cardInfo.publishInfo.deviceErrorCount>0" class="cardFail" @click="handleShowDevices(cardInfo, 'ERROR')">失败{{cardInfo.publishInfo.deviceErrorCount}}个&gt;</span>
        </div>
      </div>
      <div class="cardResult" v-if="libraryType === 'CLOUD'">
        <div class="cardResultLeft">
          <div class="cardDevicesOuter" @click="handleShowTasks(cardInfo, '')">
            <div class="cardDevicesMode">关联任务</div>
            <div class="cardDevices">
              <i class="h-icon-folder_open" style="margin-top: 1px;font-size: 18px;"></i>
              <span>{{cardInfo.taskCount}}</span>
            </div>
          </div>
          <span v-if="cardInfo.taskCount===0" class="cardFail">无任务关联</span>
        </div>
      </div>
    </div>
    <div class="cardBtns" :style="{'height': isHover?'46px':'0'}">
      <div class="cardMode1" v-if="publishStatus === 'UNPUBLISHED'">
        <el-button class="elButton elButtonWidth" type="default" @click="goDetail(cardInfo)">编辑图库</el-button>
        <el-button class="elButton elButtonWidth" type="default" @click="toDelete(cardInfo)">删除图库</el-button>
      </div>
      <div class="cardMode1" v-if="publishStatus === 'PUBLISHED'">
        <el-button class="elButton elButtonWidth" type="default" @click="toCancel(cardInfo)">取消发布</el-button>
        <el-button class="elButton elButtonWidth" type="default" @click="goDetail(cardInfo)">编辑图库</el-button>
      </div>
    </div>
  </div>
</template>
<script>
import { changeSize, dateFormat } from '@/common/util'
import { modifyImageLibrary, deleteImageLibrary, unPublishImageLibrary, existsImageLibraryTask } from '../proxy'
import inputNameEdit from '@/components/inputNameEdit.vue'
export default {
  components: {
    inputNameEdit
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
    isShowCheck: {
      type: Boolean,
      default: false
    },
    noNeedChecked: { // 不需要hover显示复选框
      type: Boolean,
      default: true
    },
    libraryType: { // 设备图库EDGE还是云端图库CLOUD
      type: String,
      default: 'EDGE'
    }
  },
  data () {
    return {
      isHover: false,
      toEditLoading: false
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
    }
  },
  mounted () {
  },
  methods: {
    changeSize,
    dateFormat,
    toCancel (row) {
      this.$confirm('取消发布后，设备将不会对库中图片进行比对',{
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'question'
      }).then(async () => {
        const { data } = await existsImageLibraryTask({imageLibraryId: row.id})
        if (data.existTask) {
          this.$confirm('请注意，该图库已被任务引用，如果您选择取消发布，图库将不再在任务中可用',{
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'question'
          }).then(async () => {
            this.confirmCancel(row)
          })
        } else {
          this.confirmCancel(row)
        }
        
      })
    },
    async confirmCancel(row) {
      const { code } = await unPublishImageLibrary({imageLibraryId: row.id})
      if (+code === 0) {
        this.$message.success('操作成功，请稍后刷新页面查询！')
        this.$emit('refresh')
      }
    },
    handleRedirectDownloadPage() {
      window.open(`${window.location.origin}/chain/index.html#/subMenu/download`)
    },
    toDelete (row) {
      this.$confirm('删除图库后将无法找回',{
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'question'
      }).then(async () => {
        const { code } = await deleteImageLibrary({ imageLibraryId: row.id })
        if (+code === 0) {
          this.$message.success('操作成功！')
          this.$emit('refresh')
        }
      }).catch(r => {
      })
    },
    async updateNameHandler (val) {
      const { code } = await modifyImageLibrary({ id: this.cardInfo.id, name: val })
      if (+code === 0) {
        this.$message.success('修改成功')
        this.$emit('updateName', { id: this.cardInfo.id, name: val })
      } else {
        this.$refs.inputNameEdit.reset()
      }
    },
    async goDetail (val) {
      this.$router.push({ name: 'editCompareMap', query: { imageLibraryId: val.id, publishStatus: this.publishStatus, libraryType: this.libraryType } })
    },
    handleShowTasks(cardInfo) {
      this.$emit('showTasks', cardInfo)
    },
    handleShowDevices (cardInfo, defaultStatus) {
      this.$emit('showDevices', cardInfo, defaultStatus)
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
<style lang="scss" scoped>
.card {
  width: 258px;
  background: #FFFFFF;
  border: 1px solid #EEEFF2;
  border-radius: 8px;
  margin-bottom: 16px;
  margin-right: 16px;
  &:hover {
    box-shadow: 0 4px 18px 0 rgba(0,0,0,0.10);
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
      max-width: 100%;
      max-height: 100%;
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
  width: 112px;
  min-width: 112px;
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
