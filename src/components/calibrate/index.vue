<template>
  <div class="calibrate">
    <div class="btn_wrap">
      <div class="left_btns">
        <el-button v-for="item in supportDrawBtns" :key="item.calibrationType" @click="clickDrawBtn(item)" :disabled="calibrateBtnDisabled || !canUseButtonFlag" 
          :class="{'activeBtn': (calibrationType===item.calibrationType) && !calibrateBtnDisabled}" :icon="item.icon">{{item.name}}</el-button>
        <div class="split"></div>
        <el-button @click="edit('EDIT')" :disabled="calibrateBtnDisabled || !canUseButtonFlag" :class="{'activeBtn': (calibrationType==='EDIT') && !calibrateBtnDisabled}" icon="icon iconfont icondrawbj">编辑</el-button>
        <el-button @click="clean" :disabled="calibrateBtnDisabled || !canUseButtonFlag" icon="icon iconfont icondrawqc">清除</el-button>
        <el-button @click="drawFront" :disabled="calibrateBtnDisabled || drawFrontBtnDisabled || !canUseButtonFlag" icon="icon iconfont icondrawqj">前进</el-button>
        <el-button @click="drawBack" :disabled="calibrateBtnDisabled || drawBackBtnDisabled || !canUseButtonFlag" icon="icon iconfont icondrawht">后退</el-button>
        <div class="split"></div>
        <div class="pic_wrap">
          <el-button @click="getNewPic" icon="icon iconfont icondrawpic">刷新抓图</el-button>
          <div v-show="picStatus!=='REPLACE_IMG'" class="status_text ellipsis" :title="picStatusText">{{ picStatusText }}</div>
          <div v-show="picStatus==='REPLACE_IMG'" class="status_text replace_image" @click="replaceImage">替换新底图</div>
        </div>
      </div>
      <div class="right_btns">
        <div v-show="showConnectSave" class="connect_save">
          <!-- <div class="split"></div> -->
          <el-button @click="saveToConnect" :disabled="calibrateBtnDisabled || !canUseButtonFlag" icon="icon iconfont icondrawbc" style="border:1px solid #ccc">关联标签</el-button>
        </div>
        <el-button type="default" :disabled="calibrateBtnDisabled || !canUseButtonFlag" icon="icon iconfont iconsave" style="border:1px solid #ccc" @click="saveCalibrate">保存</el-button>
      </div>
    </div>
    <div class="calibrator_div" :style="{'width':`${width}`,'height':`${height}`}">
      <div class="calibrator-wrapper" ref="calibrator"></div>
    </div>
    <div class="foot_btns_wrap">
      <slot name="foot"></slot>
      <!-- <div class="enlarge_wrap">
        <el-tooltip content="缩小" placement="top-start">
          <div class="icon iconfont icondrawjx" @click="enlarge(false)"></div>
        </el-tooltip>
        <div class="ratio">{{ratioText}}%</div>
        <el-tooltip content="放大" placement="top-start">
          <div class="icon iconfont icondrawzd" @click="enlarge(true)"></div>
        </el-tooltip>
        <div class="split"></div>
        <el-tooltip content="复位" placement="top-start">
          <div class="icon iconfont iconfitbl" @click="resetImageStyle"></div>
        </el-tooltip>
      </div> -->
      <!-- <div class="icon iconfont" :class="{'iconfitbl':imageFitStyle, 'iconrealbl':!imageFitStyle}" @click="changeImageStyle"></div> -->
    </div>
  </div>
</template>

<script>
import labelCfg from '@/components/calibrate/config/labels.js'
import { deepMerge } from '@/common/util'
export default {
  name: 'calibrate',
  props: {
    width: {
      default: '100%',
      type: String
    },
    height: {
      default: '100%',
      type: String
    },
    url: {
      type: String
    },
    picStatusText: {
      type: String,
      default: ''
    },
    picStatus: {
      type: String,
      default: 'SUCCESS'
    },
    calibrateBtnDisabled: {
      type: Boolean,
      default: false
    },
    showConnectSave: {
      type: Boolean,
      default: false
    },
    drawFrontBtnDisabled: {
      type: Boolean,
      default: false
    },
    drawBackBtnDisabled: {
      type: Boolean,
      default: false
    },
  },
  data () {
    return {
      erd: null,
      imgUrl: '',
      imageFitStyle: true, // 总共只支持两种cover和fix，true表示fix（默认也是fix）
      ratio: 1, // 图片的真实比例
      ratioText: 100, // 缩放按钮展示的图片缩放百分比，不一定是图片实际的比例
      calibrateStatus: 'edit',
      supportDrawBtns: [{name: '绘制', calibrationType: 'POLYGON', drawType: 'polygon', icon: 'icon iconfont icondrawhz'}],
      calibrator: {},
      currentFocusDomArr: {},
      newCalibrationList: [],
      canUseButtonFlag: true, // 绘制时是否能使用一些按钮，比如前进后退
      isFrontBack: false, // true：操作了前进或者后退按钮，但不能有一条新数据push到步骤数组里
      calibrationType: 'EDIT' // 全局的，主要为了三种跨线手动增加标签，BOTHWAY：双向跨线，BTOA：B到A，ATOB：A到B，POLYGON：多边形
    }
  },
  watch: {
  },
  computed: {
    // labelConfigObj() {
    //   return {
    //     'BOTHWAY': [{ labelClassId: '-1', labelId: '-1', text: '←|→', reverseText: '←|→' }],
    //     'BTOA': [{ labelClassId: '-1', labelId: '-1', text: 'B|→A', reverseText: 'A←|B' }],
    //     'ATOB': [{ labelClassId: '-1', labelId: '-1', text: 'B←|A',reverseText: 'A|→B' }]
    //   }
    // },
    allSupportDrawBtns() {
      return [
        {name: '绘制', calibrationType: 'POLYGON', drawType: 'polygon', icon: 'icon iconfont icondrawhz'},
        {name: '双向', calibrationType: 'BOTHWAY', drawType: 'chain', icon: 'icon iconfont icon iconfont iconshuangxiang'},
        {name: 'B→A', calibrationType: 'BTOA', drawType: 'bachain', icon: 'icon iconfont iconA_B'},
        {name: 'B←A', calibrationType: 'ATOB', drawType: 'abchain', icon: 'icon iconfont iconB_A'},
        {name: '屏蔽区域', calibrationType: 'SHIELD_AREA', drawType: 'polygon', icon: 'icon iconfont icondrawpb'},
      ]
    },
    // allSupportDrawBtns() {
    //   return [
    //     {name: '绘制', calibrationType: 'POLYGON', drawType: 'polygon', icon: 'icon iconfont icondrawhz', title: '快捷键 R'},
    //     {name: '双向', calibrationType: 'BOTHWAY', drawType: 'line', icon: 'icon iconfont icon iconfont iconshuangxiang'},
    //     {name: 'B→A', calibrationType: 'BTOA', drawType: 'line', icon: 'icon iconfont iconA_B'},
    //     {name: 'B←A', calibrationType: 'ATOB', drawType: 'line', icon: 'icon iconfont iconB_A'},
    //     {name: '屏蔽区域', calibrationType: 'SHIELD_AREA', drawType: 'polygon', icon: 'icon iconfont icondrawpb'},
    //   ]
    // },
    // specailLine() { // 三种特殊线的绘制方式
    //   return ['BOTHWAY', 'BTOA', 'ATOB']
    // }
  },
  mounted () {
    this.init()
    const _this = this
    const elementResizeDetectorMaker = require('element-resize-detector')
    this.erd = elementResizeDetectorMaker()
    this.erd.listenTo(this.$refs.calibrator, () => {
      _this.calibrator.$reset()
    })
  },
  methods: {
    resetImageStyle() {
      this.ratioText = 100
      this.calibrator.$reset()
    },
    async changeImageStyle() {
      this.imageFitStyle = !this.imageFitStyle // true：fix(默认), false: cover
      this.calibrator.$updateImage({ image: { src: this.imgUrl, layoutMode: this.imageFitStyle ? 'fix' : 'cover'} })
    },
    async enlarge(enlarge) {
      if (enlarge && this.ratioText < 300) { // 放大
        this.ratio = (this.ratio * 100 + 25) / 100
        this.ratioText += 25
      } else if(!enlarge && this.ratioText > 25 && this.ratio > 0.1) { // 缩小
        this.ratio = (this.ratio * 100 - 25) / 100
        this.ratioText -= 25
      }
      await this.calibrator.$enlarge({ ratio: this.ratio })
    },
    // 获取绘制框颜色配置
    getLabelFrameColor(color, borderWidth) {
      return {
        shape: {
          // 线需要设置虚线的颜色
          normal: {
            borderColor: labelCfg.LABEL_COLOR_SET?.[color]?.borderColor || '',
            /* color:
              this.calibrationType === 'line'
                ? labelCfg.LABEL_COLOR_SET?.[color]?.hoverBackgroundColor || ''
                : labelCfg.LABEL_COLOR_SET?.[color]?.normalBackgroundColor || '', */
            color: labelCfg.LABEL_COLOR_SET?.[color]?.normalBackgroundColor || '',
          },
          hover: {
            borderColor: labelCfg.LABEL_COLOR_SET?.[color]?.borderColor || '',
            color: labelCfg.LABEL_COLOR_SET?.[color]?.hoverBackgroundColor || '',
          },
          focus: {
            borderColor: labelCfg.LABEL_COLOR_SET?.[color]?.borderColor || '',
            color: labelCfg.LABEL_COLOR_SET?.[color]?.focusBackgroundColor || '',
          }
        }
      }
    },
    // 获取标注框颜色配置
    getLabelColor(color) {
      return {
        normal: {
          color: labelCfg.LABEL_COLOR_SET?.[color]?.labelColor || '',
          backgroundColor: labelCfg.LABEL_COLOR_SET?.[color]?.hoverBackgroundColor || ''
        },
        hover: {
          color: labelCfg.LABEL_COLOR_SET?.[color]?.labelColor || '',
          backgroundColor: labelCfg.LABEL_COLOR_SET?.[color]?.hoverBackgroundColor || ''
        },
        focus: {
          color: labelCfg.LABEL_COLOR_SET?.[color]?.labelColor || '',
          backgroundColor: labelCfg.LABEL_COLOR_SET?.[color]?.hoverBackgroundColor || ''
        },
        illegal: {
          color: labelCfg.LABEL_COLOR_SET?.[color]?.labelColor || '',
          backgroundColor: labelCfg.LABEL_COLOR_SET?.[color]?.hoverBackgroundColor || ''
        }
      }
    },
    setDefaultEmpty() {
      this.calibrator.$updateImage({ image: { src: require('../../assets/img/empty.png')} })
      this.calibrator.$updateCalibrations({ calibrationList: [] })
    },
    async setDrawType(type) { // 设置绘制状态：编辑还是绘制
      this.calibrationType = type
      this.calibrateStatus = 'edit'
      await this.calibrator.$updateOperationType({ operationType: 'edit'})
    },
    async setSupportBtns(val) {
      // this.supportDrawBtns = this.allSupportDrawBtns//支持全部
      this.supportDrawBtns = this.allSupportDrawBtns.filter(item => {
        return val.includes(item.calibrationType)
      })
    },
    async setCalibrationList(val) {
      await this.calibrator.$reset()
      await this.calibrator.$updateCalibrations({ calibrationList: val })
    },
    async updateImage(url) {
      await this.calibrator.$reset()
      let imgUrl = url ? url : require('../../assets/img/empty.png')
      await this.calibrator.$updateImage({ image: { src: imgUrl} })
    },
    async updateCalibrationsTagText(tag) {
      let focusDomArr = await this.getCalibrationsByStatus('focus')
      if (focusDomArr.length > 0) {
        let text = tag.labelName
        if (focusDomArr[0].labelList && focusDomArr[0].labelList.length) { // 原来有标签，更新
          focusDomArr[0].labelList[0].labelId = tag.labelId
          focusDomArr[0].labelList[0].text = text
          focusDomArr[0].labelList[0].labelClassId = tag.labelClassId
          focusDomArr[0].labelList[0].style = this.getLabelColor(tag.color)
        } else { // 原来没有标签，添加标签
          focusDomArr[0].labelList.push({
            labelId: tag.labelId,
            text: text,
            labelClassId: tag.labelClassId,
            style: this.getLabelColor(tag.color)
          })
        }
        // 更新绘制框颜色
        if (focusDomArr[0]?.style?.shape) {
          focusDomArr[0].style.shape = this.getLabelFrameColor(tag.color).shape;
          } else {
            focusDomArr[0].style = this.getLabelFrameColor(tag.color)
          }
        await this.calibrator.$updateCalibrations({ calibrationList: [focusDomArr[0]], isMerge:true })
        this.noticeSetDrawStepInfo('updateCalibrationsTagText', false)
      }
    },
    replaceImage() {
      if (!this.canUseButtonFlag) {
        this.$message.warning('请先闭合当前绘制！')
        return false
      }
      this.$emit('replaceImage')
    },
    async getCalibrationsByStatus(status) {
      const calibrations = this.calibrator && (await this.calibrator.$getCalibrationsByStatus({ status }).calibrations)
      return calibrations
    },
    async afterCalibrationsLabelChange() {
      // 删除一定是当前选中的绘制框的标签，如果标签没有了，绘制框删除
      let focusDomArr = await this.getCalibrationsByStatus('focus')
      let allCalibrations = await this.calibrator.$getCalibrations().calibrations
      let changeIndex = allCalibrations.findIndex(item => item.id === focusDomArr[0].id)
      if (focusDomArr[0].labelList.length === 0) {
        allCalibrations.splice(changeIndex,1)
        this.$emit('cleanRightListChecked') // 此时应该没有focus的绘制框了，要更新右侧标签列表的选中状态
      }
      await this.calibrator.$updateCalibrations({ calibrationList: allCalibrations })
      this.noticeSetDrawStepInfo('afterCalibrationsLabelChange', this.isFrontBack)
    },
    async clickDrawBtn(item) {
      // this.isFrontBack = false
      this.calibrationType = item.calibrationType
      this.calibrateStatus = 'draw'
      if (item.calibrationType === 'SHIELD_AREA') { //如果点击的屏蔽区域，设置新绘制框和标注框颜色

      }
      await this.calibrator.$updateOperationType({ operationType: 'draw'})
      await this.calibrator.$updateDrawType({ drawType : item.drawType})
    },
    setIsFrontBack(isFrontBack) {
      this.isFrontBack = isFrontBack
    },
    noticeSetDrawStepInfo(type, isFrontBack) { // 通知业务组件，更新操作步骤，用来做前进和后退用的
      this.$emit('noticeSetDrawStepInfo', type, isFrontBack)
    },
    async afterEdit(params) {
      let calibrations = await this.calibrator.$getCalibrations().calibrations
      await this.calibrator.$updateCalibrations({ calibrationList: calibrations })
      if (!["enlarge", "moveAll"].includes(params.editType)) {
        this.noticeSetDrawStepInfo('afterEdit', this.isFrontBack)
        this.isFrontBack = false
      }
      this.ratio = params?.image?.scope?.ratio
    },
    async edit(type) {
      this.calibrationType = type
      this.calibrateStatus = 'edit'
      await this.calibrator.$updateOperationType({ operationType: 'edit'})
    },
    async clean() {
      await this.calibrator.$triggerKeyboard({downKeys: {'27': true}})
      await this.calibrator.$updateCalibrations({ calibrationList: [] })
      this.noticeSetDrawStepInfo('clean', this.isFrontBack)
    },
    async resetBtnsStatus() {
      await this.calibrator.$triggerKeyboard({downKeys: {'27': true}})
      this.canUseButtonFlag =  true
    },
    async beforeDraw({ drawType, motionType, calibration }) { // 绘制前回调
      this.canUseButtonFlag = false // 绘制时不能使用一些按钮，比如前进后退
      if (this.calibrationType === 'SHIELD_AREA') { // 屏蔽区域，设置画笔颜色
        calibration.style = deepMerge(
          labelCfg.SHIELD_STYLE,
          JSON.parse(JSON.stringify(calibration.style))
        )
      } else {
        calibration.style = deepMerge(
          labelCfg.NORMAL_STYLE,
          JSON.parse(JSON.stringify(calibration.style))
        )
      }
    },
    async afterDraw() {
      let calibrations = await this.calibrator.$getCalibrations().calibrations
      calibrations.forEach(item => {
        if (!item.calibrationType) { //新绘制的检测框，绑定对应的calibrationType值
          item.calibrationType = this.calibrationType
        }
        if (['line', 'chain', 'bachain', 'abchain'].includes(item.scope.type)) {
          item.scope.width = 0.03
        }
        if (!item.labelList.length) {
          // if (this.specailLine.includes(this.calibrationType)) { // 新绘制的框，并且属于三种跨线，增加特殊标签框
          //   item.labelList = JSON.parse(JSON.stringify(this.labelConfigObj[this.calibrationType]))
          //   if (item.scope.coordinates[0].y > item.scope.coordinates[1].y) { // 线是从下往上画的，标签要反一下
          //     item.labelList[0].text = this.labelConfigObj[this.calibrationType][0].reverseText
          //   } else {
          //     item.labelList[0].text = this.labelConfigObj[this.calibrationType][0].text
          //   }
          // } else { // 新绘制的框，增加空标签，为了绘制框能删除
            item.labelList = [{ labelClassId: '', labelId: '', text: '' }]
          // }
        }
      })
      await this.calibrator.$updateCalibrations({ calibrationList: calibrations })
      await this.afterCalibrationsStatusChange()
      this.canUseButtonFlag = true
      this.$emit('afterDraw', this.calibrationType)
      this.noticeSetDrawStepInfo('afterDraw', this.isFrontBack)
    },
    // 标签选中状态改变
    async afterCalibrationsStatusChange() {
      let focusDomArr = await this.getCalibrationsByStatus('focus')
      if (focusDomArr.length > 0) {
        this.currentFocusDomArr = focusDomArr[0]
        this.$emit('chooseFocusDom', focusDomArr)
      } else {
        this.currentFocusDomArr = {}
        this.$emit('chooseFocusDom', [])
      }
    },
    getNewPic() {
      this.$emit('getNewPic')
    },
    async saveCalibrate() {
      this.newCalibrationList = await this.calibrator.$getCalibrations().calibrations
      this.$emit('saveCalibrate', this.newCalibrationList)
    },
    async drawFront() {
      this.isFrontBack = true
      this.$emit('drawFront')
    },
    async drawBack() {
      this.isFrontBack = true
      this.$emit('drawBack')
    },
    getNewCalibrationList() {
      return this.calibrator.$getCalibrations().calibrations
    },
    async saveToConnect() {
      this.newCalibrationList = await this.calibrator.$getCalibrations().calibrations
      this.$emit('saveToConnect', this.newCalibrationList)
    },
    // 鼠标移动
    afterMouseMove(params) {
      // 在图片区域外
      if (!params[0].image) {
        if (this.calibrateStatus === 'draw') {
          return { code: 'fail', msg: '绘制不可超过图片有效区域,左键点击自动对齐图片边缘' };
        }
      } else {
        if (this.calibrateStatus === 'edit') {
          if (params[0].calibration) {
            return { code: 'success', msg: '拖拽调整标注框,Delete删除选中框' };
          }
        }
      }
    },
    init () {
      const rootDom = this.$refs.calibrator
      const context = this
      this.calibrator = this.$createCalibrator({ 
        rootDom,
        image: { src: require('../../assets/img/empty.png')},
        limitCalibrations: true,
        // drawTypeList: ['rect', 'polygon', 'ellipse', 'line'],
        drawTypeList: ['rect', 'polygon', 'ellipse', 'line', 'chain', 'abchain', 'bachain'],
        editTypeList: [
          'reset',
          'enlarge',
          'moveAll',
          'moveCalibrations',
          'adjustCalibration',
          'rotateCalibration',
          'rotateImage'
        ],
        operationTypeList: ['edit', 'draw'],
        calibrationKey: 'id',
        labelKey: 'labelId',
        calibrationList: this.calibrationList,
        callback: {
          beforeDraw: {
            func: async function (params) {
              this.beforeDraw(params)
            },
            context
          },
          beforeEdit: { func: async function () {}, context },
          afterDraw: {
            func: async function (params) {
              this.afterDraw(params)
            },
            context
          },
          afterEdit: { 
            func: async function (params) {
              this.afterEdit(params)
            }, context },
          afterMouseMove: {
            func(...params) {
              return this.afterMouseMove(params);
            },
            context: this
          },
          afterMouseLeftDown: { func: async function () {}, context },
          afterMouseDoubleClick: { func: async function () {}, context },
          afterImageChange: { func: async function () {}, context },
          afterCalibrationsChange: { func: async function () {}, context },
          afterCalibrationsStatusChange: { func: async function (params) {
            this.afterCalibrationsStatusChange(params)
          }, context },
          afterOperationTypeChange: { func: async function () {}, context },
          afterOperationStatusChange: { func: async function () {}, context },
          afterPenWidthChange: { func: async function () {}, context },
          afterDrawTypeChange: { func: async function () {}, context },
          finishDraw: { func: async function () {}, context },
          beforeDrawFinish: { func: async function () {}, context },
          afterCalibrationsLabelChange: {
            func: async function () {
              this.afterCalibrationsLabelChange()
            },
            context
          },
          backBeforeOperationChange: { func: async function () {}, context },
          backAfterOperationChange: { func: async function () {}, context },
          beforeCalibrationsDelete: { func: async function () {}, context },
        },
      })
    }
  },
  beforeDestroy() {
    this.erd.uninstall(this.$refs.calibrator)
  }
}
</script>

<style lang="scss">
.calibrate{
  .el-button{
    display: flex;
    align-items: center;
    i{
      font-size: 16px;
      margin-right: 4px;
    }
  }
}
</style>
<style lang="scss" scoped>
.calibrate{
  .btn_wrap{
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 50px;
    // flex-wrap: wrap;
    .left_btns{
      display: flex;
      align-items: center;
      flex-wrap: wrap;
    }
    .connect_save{
      display: flex;
      align-items: center;
      margin-right: 8px;
    }
    .right_btns{
      display: flex;
      align-items: center;
    }
    .split{
      width: 1px;
      height: 10px;
      background: #E2E3E6;
      margin-left: 6px;
      margin-right: 6px;
    }
    .pic_wrap{
      display: flex;
      align-items: center;
      .status_text{
        font-size: 12px;
        color: #ccc;
        margin-left: 2px;
        margin-right: 6px;
        max-width: 250px;
      }
      .replace_image{
        cursor: pointer;
        color: #ffaa56;
      }
    }
  }
  .activeBtn{
    color: #2080f7;
  }
}
.calibrator_div {
  .calibrator-wrapper {
    flex-shrink: 1;
    width: 100%;
    height: 100%;
    // height: calc(100% - 100px);
    // border: 1px solid red;
    position: relative;
    overflow: hidden;
    & > div {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      right: 0;
    }
  }
}
.foot_btns_wrap{
  height: 60px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  .enlarge_wrap{
    position: absolute;
    right: 2px;
    width: 155px;
    // height: 44px;
    height: 36px;
    background: #FFFFFF;
    box-shadow: 0 0 8px 0 rgba(0,0,0,0.08);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #1A1A1A;
    .split{
      width: 1px;
      height: 10px;
      background: #E2E3E6;
      margin-left: 12px;
      margin-right: 12px;
    }
    .ratio{
      margin: 0 8px;
      width: 36px;
      text-align: center;
    }
    .iconfont{
      cursor: pointer;
      &:hover{
        color: #2080f7;;
      }
    }
  }
}
</style>
