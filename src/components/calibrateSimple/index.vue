<template>
  <div class="calibrate">
    <div class="calibrator_div" :style="{'width':`${width}`,'height':`${height}`}">
      <div class="calibrator-wrapper" ref="calibrator"></div>
    </div>
    <div class="foot_btns_wrap" v-if="false">
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
    onlyOneCalibration: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
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
      calibrationType: 'RECT' // 全局的，主要为了三种跨线手动增加标签，BOTHWAY：双向跨线，BTOA：B到A，ATOB：A到B，POLYGON：多边形
    }
  },
  watch: {
  },
  computed: {
    allSupportDrawBtns() {
      return [
        {name: '绘制', calibrationType: 'POLYGON', drawType: 'polygon', icon: 'icon iconfont icondrawhz'},
        {name: '双向', calibrationType: 'BOTHWAY', drawType: 'chain', icon: 'icon iconfont icon iconfont iconshuangxiang'},
        {name: 'B→A', calibrationType: 'BTOA', drawType: 'bachain', icon: 'icon iconfont iconA_B'},
        {name: 'B←A', calibrationType: 'ATOB', drawType: 'abchain', icon: 'icon iconfont iconB_A'},
        {name: '屏蔽区域', calibrationType: 'SHIELD_AREA', drawType: 'polygon', icon: 'icon iconfont icondrawpb'},
      ]
    },
  },
  mounted () {
    this.init()
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
      // this.calibrationType = type
      this.calibrateStatus = 'edit'
      await this.calibrator.$updateOperationType({ operationType: 'edit'})
    },
    async setCalibrationList(val) {
      await this.calibrator.$reset()
      await this.calibrator.$updateCalibrations({ calibrationList: val })
    },
    async updateImage(url) { // 更新底图
      await this.calibrator.$reset()
      let imgUrl = url ? url : require('../../assets/img/empty.png')
      await this.calibrator.$updateImage({ image: { src: imgUrl} })
    },
    async getCalibrationsByStatus(status) {
      const calibrations = this.calibrator && (await this.calibrator.$getCalibrationsByStatus({ status }).calibrations)
      return calibrations
    },
    async afterCalibrationsLabelChange() {
      let allCalibrations = await this.calibrator.$getCalibrations().calibrations
      await this.calibrator.$updateCalibrations({ calibrationList: allCalibrations })
      this.noticeSetDrawStepInfo('afterCalibrationsLabelChange', this.isFrontBack)
    },
    async clickDrawBtn(item) {
      this.calibrationType = item.calibrationType
      this.calibrateStatus = 'draw'
      await this.calibrator.$updateOperationType({ operationType: 'draw'})
      await this.calibrator.$updateDrawType({ drawType : item.drawType})
    },
    async drawRect() {
      this.calibrationType = 'RECT'
      this.calibrateStatus = 'draw'
      await this.calibrator.$updateOperationType({ operationType: 'draw'})
      await this.calibrator.$updateDrawType({ drawType : 'rect'})
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
        if (!item.calibrationType) { // 新绘制的检测框，绑定对应的calibrationType值
          item.calibrationType = this.calibrationType
        }
        if (['line', 'chain', 'bachain', 'abchain'].includes(item.scope.type)) {
          item.scope.width = 0.05
        }
      })
      await this.calibrator.$updateCalibrations({ calibrationList: calibrations })
      await this.afterCalibrationsStatusChange()
      this.canUseButtonFlag = true
      this.$emit('afterDraw', this.calibrationType)
      this.noticeSetDrawStepInfo('afterDraw', this.isFrontBack)
      if (this.onlyOneCalibration) { // 仅能绘制一个框，绘制完后自动变为编辑模式
        this.edit('EDIT')
      }
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
      if (this.calibrateStatus === 'draw') {
        if (!params[0].image) { // 在图片区域外
          return { code: 'fail', msg: '绘制不可超过图片有效区域,左键点击自动对齐图片边缘' }
        } else {
          return { code: 'success', msg: 'R键快捷唤起绘制功能，左键拖动绘制，esc取消绘制' }
        }
      } else if (this.calibrateStatus === 'edit') {
        if (params[0].calibration) {
          return { code: 'success', msg: '拖拽调整标注框,Delete删除选中框' }
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
  height: 44px;
  width: 100%;
  margin-top: 16px;
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
