<template>
  <div class="pictureDetail">
    <div class="media-container" v-if="imgUrl" @mousemove="dragging" @mouseup="endDrag" @click="textDrawHandler">
      <videoPlayer
        v-if="this.selectImgObj.fileType"
        :width="+width"
        :height="+height"
        :src="imgUrl"
        controls>
      </videoPlayer>
      <imgCanvas
        v-else
        ref="imgCanvas"
        :opModel="canvasOpModel"
        :zoomable="zoomable && !isTextModel"
        :info="info"
        :aiInfo="aiInfo"
        :ruleInfo="ruleInfo"
        :url="imgUrl"
        :width="width"
        :height="height"
        :fontSize="textFS"
        :lineWidth="lineWidth"
        :drawColor="currentDrawColor.color"
        :drawInfo="selectImgObj.drawInfo"
        :isRenderDraw="isRenderDraw"
        :isRenderRule="isRenderRule"
        :showLabel="true"
        @drawInfoUpdated="drawInfoUpdated"
        @scaleChanged="scaleChanged"
      ></imgCanvas>
      <div ref="textCon" class="text-con" :style="{ 'box-shadow': `0 0 0 ${1 / textInfo.scale}px white inset`, transform: `translate(${textConVisualX}px, ${textConVisualY}px) scale(${textInfo.scale})`, 'transform-origin': textInfo.zooming ? 'center' : 'top left', padding: `${textInfo.padding}px`, display: textInfo.display ? '' : 'none'}" @mousedown.self="startDrag" @click.stop>
        <textarea ref="text" @input="inputUpdate" v-model="textInfo.content" maxlength="256" class="textarea"  :rows="textInfo.size.rows" :style="{ color: currentDrawColor.color, 'font-size': `${textFS}px`,'line-height': lineHeightRate, width: `${textInfo.size.width}px`}"></textarea>
        <div v-for="dt in ['tl', 'tr', 'bl', 'br']" :key="dt" :class="[dt, 'anchor']" :style="{ transform: `scale(${1 / textInfo.scale})` }" @pointerdown="startZoom"  @pointerup="stopZoom"></div>
      </div>
    </div>
    <div :style="{width: width + 'px', height: height + 'px'}" class="noImg" v-else>
      <img class='empty-img' :src='emptyImg'>
      <p class="text">
        {{emptyText}}
      </p>
    </div>
    <a id="srctoUrl" style="display:none"></a>
    <div class="bottomPart">
      <div class="control flex-center">
        <div v-if="(!this.selectImgObj.fileType)&&opModelAvailable" class="btn_wrap">
          <span v-if="zoomable" class="icon">
            <i class="h-icon-zoom_out fs20 vmd" :class="{ disabled: scaleInfo.scaleStatus < 0 || isTextModel }" @click="zoom(true)" style="font-size: 20px;"></i>
            <span class="content">{{scaleInfo.scale}}%</span>
            <i class="h-icon-zoom_in fs20 vmd" :class="{ disabled: scaleInfo.scaleStatus > 0 || isTextModel }" @click="zoom(false)" style="font-size: 20px;"></i>
          </span>
          <span v-for="opModel in displayOpModelBlocks.defaultBlock" :key="`opModel_${opModel.type}`" class="icon" :class="{active: currentOpModel === opModel.type, func: opModel.type != 'color'}" @click="opModel.callback(opModel.type)">
            <template v-if="opModel.type == 'draw'">
              <i class="vmd" style="font-size:24px;" :class="opModel.icon"></i>
              <span class='content vmd'>{{opModel.title}}</span>
              <el-popover ref="drawTypePop" placement="top" width="80" trigger="hover" :offsetPlacement="-5" :appendToBody="false" :visible-arrow="false" @show="popShow = true" @hide="popShow = false">
                <div v-for="drawModel in drawModels" :key="drawModel.type" @click="selectDrawModel(drawModel)">
                  <i class="vmd" style="font-size:24px;" :class="drawModel.icon"></i>
                  <span class='content vmd'>{{drawModel.title}}</span>
                </div>
                <i class="h-icon-angle_down vmd pop_angle" :class="{ rotate: popShow }" slot="reference" ></i>
              </el-popover>
            </template>
            <template v-else-if="opModel.type == 'color'">
              <el-popover ref="drawColorPop" placement="top" trigger="hover" :offsetPlacement="-5" :appendToBody="false" :visible-arrow="false" @show="colorPopShow = true" @hide="colorPopShow = false">
                <div class="color_wrap">
                  <i
                    v-for="drawColor in drawColors"
                    :key="drawColor.color"
                    class="vmd color_icon"
                    :class="{select: currentDrawColor.color == drawColor.color}"
                    :style="colorIconStyle(drawColor)"
                    @click="selectDrawColor(drawColor)">
                  </i>
                </div>
                <span slot="reference" >
                  <span class="vmd color_icon select" :style="{'border-color': currentDrawColor.displayColor || currentDrawColor.color}"></span>
                  <span class='content vmd'>{{opModel.title}}</span>
                  <i class="h-icon-angle_down vmd pop_angle" :class="{ rotate: colorPopShow }"></i>
                </span>
              </el-popover>
            </template>
            <template v-else>
              <i class="vmd" style="font-size:24px;" :class="opModel.icon"></i>
              <span class='content vmd'>{{opModel.title}}</span>
            </template>
          </span>
          <span class="mr20" v-if="showRuleAreaSwitch">
            <span class='content vmd'>展示检测区域</span>
            <el-switch v-model="ruleAreaSwitch" size="mini" />
          </span>
          <span class="mr20" v-if="showDrawStaffSwitch">
            <span class='content vmd'>展示目标框</span>
            <el-switch v-model="drawStaffSwitch" size="mini" />
          </span>
          <span class="split"></span>
          <span v-for="opModel in displayOpModelBlocks.simpleBlock" :key="`opModel_${opModel.type}`" class="icon func" :class="{active: currentOpModel === opModel.type}" @click="opModel.callback(opModel.type)">
            <i class="vmd" style="font-size:24px;" :class="{ [opModel.icon]: true, disabled: opModel.disabled }"></i>
          </span>
        </div>
      </div>
      <div class="photo-scroller">
        <imgList ref="imgList" v-show="showImgListBar" :imgList='imgList' @getUrl="getUrl" :selectIndex="selectIndex" :deletable="deletable"></imgList>
      </div>
    </div>
  </div>
</template>
<script>
  import imgCanvas from '@/components/canvas/index'
  import imgList from './imgCheck/imgCheck.vue'
  import videoPlayer from '@/components/webVideoPlayer/videoPlayer.vue'
  import emptyImg from '@/assets/img/default_no_pic_180@2x.svg'
  import { reg1_1_255 } from '@/plugin/utils/util'
  import { drawInfoParamsPolygon } from './util'

  export default {
    components: {
      imgList,
      imgCanvas,
      videoPlayer,
    },
    props: {
      isShowToolBar: {
        type: Boolean,
        default: true
      },
      // 全量操作 ['zoom', 'drag', 'text', 'draw', 'color', 'revert', 'download', 'clean', 'ruleSwitch', 'drawSwitch']
      models: {
        type: Array,
        default: () => ['zoom', 'drag', 'text', 'draw', 'color', 'revert', 'download', 'clean']
      },
      currentSelectModel: {
        type: String,
        default: 'drag',
      },
      width: { // 绘图区域宽度
        type: String
      },
      height: { // 绘图区域高度
        type: String
      },
      lineColor: { // 画笔颜色
        type: String,
        default: 'red'
      },
      lineWidth: { // 画笔宽度
        type: Number,
        default: 1
      },
      imgList: {
        type: Array,
        default: () => []
      },
      currentSelectIndex: {
        type: Number,
        default: 0,
      },
      storeName: {
        type: String,
        default: '',
      },
      showImgListBar: {
        type: Boolean,
        default: true,
      },
      textFS: {
        type: Number,
        default: 24,
      },
      // 行高相比字体比例
      lineHeightRate: {
        type: Number,
        default: 1.3,
      },
      emptyText: {
        type:String,
        default:'图片正在抓取或已失败'
      },
      deletable: {
        type: Boolean,
        default: false,
      },
    },
    watch: {
      ruleAreaSwitch(nv) {
        localStorage.setItem(this.localStorageRuleSwitchKey, +nv)
      },
      drawStaffSwitch(nv) {
        localStorage.setItem(this.localStorageDrawSwitchKey, +nv)
      },
      'textInfo.content': function(nv) {
        let filterStr = reg1_1_255.filter(nv)
        if (filterStr != nv) {
          this.textInfo.content = filterStr
          this.resizeTextAreaWithText(this.textInfo.content)
        }
      },
      isTextModel(nv) {
        if (nv) this.$refs.imgCanvas && this.$refs.imgCanvas.resetZoom()
      },
      currentSelectIndex: {
        handler: function(v) {
          this.selectIndex = v
          this.$nextTick(() => {
            this.$refs.imgList.setSelectImgCenter()
          })
        },
        immediate: true
      },
      currentSelectModel: {
        handler: function(v) {
          this.currentOpModel = v
        },
        immediate: true,
      },
      imgList: {
        handler: function(v) {
          v.forEach(e => {
            this.$set(e, 'drawInfo', e.drawInfo || [])
              let formatColumn = ['picCoordinate', 'aiPicCoordinate', 'multiAnalysisAreaPolygon']
              formatColumn.forEach(col => {
                if (e[col] && typeof e[col] === 'string') {
                  try {
                    e[col] = JSON.parse(e[col])
                  } catch {
                    e[col] = []
                  }
                }
              })
          });
        },
        immediate: true,
      },
      // 允许的操作变化时，若当前选中的操作没了，重置为移动操作
      displayOpModels: {
        handler: function() {
          if (this.displayOpModels.find(e => e.type == this.currentOpModel)) return
          this.currentOpModel = 'drag'
          this.$emit('update:currentSelectModel', this.currentOpModel)
        },
        immediate: true,
      },
      imgUrl: {
        handler: function(nv) {
          this.operationHistoryPhotos = [[...(this.selectImgObj.drawInfo || [])]]
          this.operationHistoryPhotosIndex = 0
        },
        immediate: true,
      },
    },
    data () {
      this.emptyImg = emptyImg
      return {
        // 记忆的开关状态key
        localStorageRuleSwitchKey: 'localStorageRuleSwitchKey',
        localStorageDrawSwitchKey: 'localStorageDrawSwitchKey',
        selectIndex: 0,
        // 当前选中的操作
        currentOpModel: 'drag',
        // 涂鸦操作收起的集合中，当前选中的涂鸦类型
        currentDrawType: 'draw-rec',
        currentDrawColor: { color: '#FA3239' },
        localDrawTypeKey: 'defaultDrawType',
        popShow: false,
        colorPopShow: false,
        ruleAreaSwitch: true, 
        drawStaffSwitch: true, 
        maxHistoryPhotos: 20,
        operationHistoryPhotosIndex: 0,
        operationHistoryPhotos: [],
        scaleInfo: {
          scale: 100,
          scaleStatus: -1
        },
        drawColors: [
          { color: 'white', displayColor: 'rgba(0,0,0,0.12)' },
          { color: 'black' },
          { color: '#FA3239' },
          { color: '#FFCC00' },
          { color: '#02BF0F' },
          { color: '#3A93FF' },
        ],
        drawModels: [
          { type: 'draw-rec', title: '矩形', icon: 'iconfont icon-ic_common_square' },
          { type: 'draw-circle', title: '圆形', icon: 'iconfont icon-ic_common_circle' },
          { type: 'draw-arrow', title: '箭头', icon: 'iconfont icon-arrow' },
        ],
        textInfo: {
          padding: 4,
          x: 0,
          y: 0,
          zoomingX: 0,
          zoomingY: 0,
          content: '',
          zooming: false,
          dragging: false,
          display: false,
          scale: 1,
          size: {
            rows: 1,
            width: 10,
          },
        },
      }
    },
    computed: {
      showRuleAreaSwitch() {
        return this.models.includes('ruleSwitch')
      },
      showDrawStaffSwitch() {
        return this.models.includes('drawSwitch')
      },
      isRenderRule() {
        return this.ruleAreaSwitch || !this.showRuleAreaSwitch
      },
      isRenderDraw() {
        return this.drawStaffSwitch || !this.showDrawStaffSwitch
      },
      selectImgObj() {
        return this.imgList[this.selectIndex] || {}
      },
      imgUrl() {
        return this.selectImgObj ? this.selectImgObj.picUrl : undefined
      },
      info() {
        // aiPicSame为true表示AI兼容数据，用于app历史版本展示，web端展示aiPicCoordinate就行
        return this.selectImgObj ? (this.selectImgObj.aiPicSame ? undefined : this.selectImgObj.picCoordinate) : undefined
      },
      aiInfo() {
        return this.selectImgObj ? this.selectImgObj.aiPicCoordinate : undefined
      },
      ruleInfo () {
        return this.selectImgObj && this.selectImgObj.multiAnalysisAreaPolygon ? this.selectImgObj.multiAnalysisAreaPolygon.map(drawInfoParamsPolygon) : undefined
      },
      currentDrawModel() {
        let drawModel = this.drawModels.find(e => e.type == this.currentDrawType)
        return drawModel || this.drawModels[0]
      },
      // 映射到canvas上当前的选中操作
      canvasOpModel() {
        if (this.currentOpModel == 'draw') {
          return this.currentDrawModel.type
        }
        return this.currentOpModel
      },
      displayOpModels() {
        if (!this.isShowToolBar) return []
        let opModels = [
          { type: 'drag', title: '移动', icon: 'iconfont iconicon_move_24', callback: this.changeModel },
          { type: 'text', title: '文字', icon: 'iconfont icon-text', callback: this.changeModel },
          { type: 'draw', title: '四边形', icon: 'iconfont icon-ic_common_square', callback: this.changeModel },
          { type: 'color', title: '颜色', callback: () => {} },
          { type: 'revert', title: '撤回', icon: 'h-icon-reset', callback: this.backTo, subModels: [
            { type: 'revert', title: '回退', icon: 'h-icon-reset', disabled: this.operationHistoryPhotosIndex <= 0, callback: () => this.operationHistoryGoOffset(-1) }, 
            { type: 'forward', title: '前进', icon: 'h-icon-reset rotateLR', disabled: this.operationHistoryPhotosIndex >= this.operationHistoryPhotos.length - 1, callback: () => this.operationHistoryGoOffset(1) }, 
          ]},
          { type: 'download', title: '下载', icon: 'h-icon-download', callback: this.downloadCanvasIamge },
          { type: 'clean', title: '清空', icon: 'h-icon-delete', callback: this.clean },
          // { type: 'delete', title: '删除', icon: 'h-icon-delete', callback: this.delete },
        ]
        let ops = opModels.filter(e => {
          let flag = this.models.includes(e.type)
          if (flag && e.type == 'draw') {
            e.title = this.currentDrawModel.title
            e.icon = this.currentDrawModel.icon
          }
          return flag
        })
        return ops
      },
      opModelAvailable() {
        return this.zoomable || this.displayOpModels.length > 0
      },
      displayOpModelBlocks() {
        let res = { defaultBlock: [], simpleBlock: [] }
        if (this.displayOpModels.length == 0) return res
        let simpleOps = ['revert', 'download', 'clean']
        this.displayOpModels.forEach(op => {
          if (simpleOps.includes(op.type)) {
            if (op.subModels) {
              res.simpleBlock.push(...op.subModels)
            } else {
              res.simpleBlock.push(op)
            }
          } else {
            res.defaultBlock.push(op)
          }
        })
        return res
      },
      zoomable() {
        return this.isShowToolBar && this.models.includes('zoom')
      },
      isTextModel() {
        return this.canvasOpModel == 'text'
      },
      textConVisualX() {
        return this.textInfo.zooming ? this.textInfo.zoomingX : this.textInfo.x
      },
      textConVisualY() {
        return this.textInfo.zooming ? this.textInfo.zoomingY : this.textInfo.y
      },
    },
    mounted () {
      let localDrawType = localStorage.getItem(this.localDrawTypeKey)
      if (localDrawType) this.currentDrawType = localDrawType
      let localDrawSwitch = localStorage.getItem(this.localStorageDrawSwitchKey)
      if (localDrawSwitch) this.drawStaffSwitch = !!(+localDrawSwitch)
      let localRuleSwitch = localStorage.getItem(this.localStorageRuleSwitchKey)
      if (localRuleSwitch) this.ruleAreaSwitch = !!(+localRuleSwitch)
      window.addEventListener('click', this.exitText)
    },
    beforeDestroy() {
      window.removeEventListener('click', this.exitText)
    },
    methods: {
      imgListCenterFit() {
        this.$nextTick(() => {
          this.$refs.imgList.setSelectImgCenter()
        })
      },
      operationHistoryGoOffset(offset) {
        let r = this.operationHistoryPhotosIndex + offset
        if (r < 0 || r >= this.operationHistoryPhotos.length) return
        this.operationHistoryPhotosIndex += offset
        let drawInfo = this.operationHistoryPhotos[this.operationHistoryPhotosIndex]
        this.selectImgObj.drawInfo = [...drawInfo]
      },
      startZoom(e) {
        e.target.onpointermove = this.resizeTextContainer
        e.target.setPointerCapture(e.pointerId)
        this.textInfo.zooming = true
        let rect = this.$refs.textCon.getBoundingClientRect()
        this.textInfo.zoomingX = this.textInfo.x + (rect.width - rect.width / this.textInfo.scale) / 2
        this.textInfo.zoomingY = this.textInfo.y + (rect.height - rect.height / this.textInfo.scale) / 2
      },
      stopZoom(e) {
        e.target.onpointermove = null
        e.target.releasePointerCapture(e.pointerId)
        this.textInfo.zooming = false
        let rect = this.$refs.textCon.getBoundingClientRect()
        this.textInfo.x = this.textInfo.zoomingX - (rect.width - rect.width / this.textInfo.scale) / 2
        this.textInfo.y = this.textInfo.zoomingY - (rect.height - rect.height / this.textInfo.scale) / 2
      },
      resizeTextContainer(e) {
        let rect = this.$refs.textCon.getBoundingClientRect()
        let originX = rect.x + rect.width / 2
        let originY = rect.y + rect.height / 2
        let relativeX = e.clientX - originX
        let relativeY = e.clientY - originY
        let rate = Math.abs(rect.height / rect.width)
        let resRelativeX = Math.sqrt((relativeX * relativeX + relativeY * relativeY) / ( 1 + rate * rate))
        // 文字缩放字体大小范围
        this.textInfo.scale = Math.max(Math.min(resRelativeX * this.textInfo.scale * 2 / rect.width, 100 / this.textFS), 12 / this.textFS)
      },
      resizeTextAreaWithText(nv) {
        let lines = nv.split('\n')
        // 四周安全区
        let safeNap = 12
        // 设定一个最小宽度10
        let width = Math.max(10, ...this.getTextsWidth(lines))
        this.textInfo.size = {
          rows: lines.length,
          width,
        }
        this.$nextTick(() => {
          let countCon = this.$refs.text
          let freeWidth = width
          let freeHeight = countCon.clientHeight
          // 2是边框线宽
          if (this.textInfo.x + freeWidth + 2 + this.textInfo.padding * 2 + safeNap > +this.width) {
            this.textInfo.x = Math.max(safeNap, this.width - freeWidth - this.textInfo.padding * 2 - safeNap)
          }
          if (this.textInfo.y + freeHeight + 2 + this.textInfo.padding * 2 + safeNap > +this.height) {
            this.textInfo.y = Math.max(safeNap, this.height - freeHeight - this.textInfo.padding * 2 - safeNap)
          }
        })
      },
      colorIconStyle(drawColor) {
        if (drawColor.color == this.currentDrawColor.color) {
          return { 'border-color': drawColor.displayColor || drawColor.color }
        }
        if (drawColor.displayColor) {
          return { 'border-width': '1px', 'border-color': drawColor.displayColor }
        } else {
          return { background: drawColor.color }
        }
      },
      selectDrawColor(drawColor) {
        this.currentDrawColor = drawColor
        this.$refs.drawColorPop[0].doClose()
      },
      getTextsWidth(texts) {
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        context.font = `${this.textFS}px Arial`
        return texts.map(txt => context.measureText(txt).width)
      },
      inputUpdate(e) {
        this.resizeTextAreaWithText(e.target.value)
      },
      textDrawHandler(e) {
        // 文字涂鸦中，理应退出涂鸦模式，退出由统一方法处理，这里只负责拦截
        if (this.textInfo.display) return
        // 非文字涂鸦模式，不做处理
        if (!this.isTextModel) return
        // 是否对文字进行再编辑
        let editTextInfo = this.$refs.imgCanvas.getEditTextInfo(e)
        if (editTextInfo) {
          e.stopPropagation()
          let { x, y, content, scale } = editTextInfo
          let padding = this.textInfo.padding
          Object.assign(this.textInfo, {
            x: x - padding * scale,
            y: y - (padding + this.textFS * (this.lineHeightRate - 1) / 2 + this.textFS / 14) * scale,
            content,
            scale,
          })
          this.textInfo.display = true
          this.resizeTextAreaWithText(this.textInfo.content)
          this.$nextTick(() => this.$refs.text.focus())
          return
        }
        // 校验是否还能增加涂鸦
        if (!this.$refs.imgCanvas.paintingCheck()) return
        // 进入文字涂鸦模式，组织冒泡，不然会触发后续退出文字涂鸦逻辑
        e.stopPropagation()
        this.textInfo.display = true
        this.textInfo.content = '文本'
        this.textInfo.scale = 1
        this.resizeTextAreaWithText(this.textInfo.content)
        this.textInfo.x = e.offsetX || e.layerX
        this.textInfo.y = e.offsetY || e.layerY
        this.$nextTick(() => this.$refs.text.select())
      },
      exitText(e) {
        if (!this.textInfo.display) return
        this.textInfo.display = false
        if (!this.textInfo.content) return
        const { x, y, content, padding, scale } = this.textInfo
        // x,y要进行偏移，包含容器padding，字体行高, 以及1倍行高时，文字顶部也不是完全贴合文本域，补偿1像素
        let obj = {
          x: x + padding * scale,
          y: y + (padding + this.textFS * (this.lineHeightRate - 1) / 2 + this.textFS / 14) * scale,
          content,
          scale,
        }
        this.$refs.imgCanvas && this.$refs.imgCanvas.textTranslate(obj)
      },
      startDrag() {
        this.textInfo.dragging = true
      },
      dragging(e) {
        if (!this.textInfo.dragging) return
        this.textInfo.x += e.movementX
        this.textInfo.y += e.movementY
      },
      endDrag() {
        this.textInfo.dragging = false
      },
      selectDrawModel(drawModel) {
        // 因为放在v-for里渲染，引用是数组，
        this.$refs.drawTypePop[0].doClose()
        this.currentDrawType = drawModel.type
        if (drawModel.type === 'draw-arrow') {
          this.sendClickMessage({ lc: '9_1_0557' })
        }
        localStorage.setItem(this.localDrawTypeKey, this.currentDrawType)
        this.changeModel('draw')
      },
      getUrl (index) {
        this.selectIndex = index
        this.$emit('update:currentSelectIndex', index)
        this.$emit('getIndex', this.imgList[index], index)
        this.$refs.imgCanvas &&this.$refs.imgCanvas.checkImage(this.imgUrl)
      },
      changeModel (model) {
        if (model === 'text') {
          this.sendClickMessage({ lc: '9_1_0556' })
        }
        this.currentOpModel = model
        this.$emit('update:currentSelectModel', this.currentOpModel)
      },
      scaleChanged(scaleInfo) {
        scaleInfo.scale = Math.round(scaleInfo.scale * 100)
        this.scaleInfo = scaleInfo
      },
      zoom(out) {
        if (!this.zoomable || this.isTextModel) return
        this.$refs.imgCanvas && this.$refs.imgCanvas.zoom(out)
      },
      getInfo() {
        return this.$refs.imgCanvas.getInfo()
      },
      // 获取坐标信息
      getImgsInfo () {
        return this.imgList
      },
      delete() {
        this.$emit('handleDeleteItem', this.selectIndex, this.selectImgObj)
      },
      // 清空画布
      clean () {
        this.$refs.imgCanvas.clean()
        this.drawInfoUpdated([])
      },
      drawInfoUpdated(drawInfo) {
        // 与当前记录内容不一致时才进行记录
        if (JSON.stringify(this.operationHistoryPhotos[this.operationHistoryPhotosIndex]) != JSON.stringify(drawInfo)) {
          // 如果回退读取过记录再变更，清除当前记录点之后的记录
          if (this.operationHistoryPhotosIndex != this.operationHistoryPhotos.length) {
            this.operationHistoryPhotos.splice(this.operationHistoryPhotosIndex + 1)
          }
          if (this.operationHistoryPhotos.length > this.maxHistoryPhotos) {
            this.operationHistoryPhotos.shift()
          }
          this.operationHistoryPhotos.push([...drawInfo])
          this.operationHistoryPhotosIndex = this.operationHistoryPhotos.length - 1
        }
        this.selectImgObj.drawInfo = [...drawInfo]
        this.$emit('drawInfoUpdated', this.imgList)
      },
      // 绘画图片和涂鸦
      reDraw() {
        this.$refs.imgCanvas.reDraw()
      },
      // 返回上一步
      backTo () {
        let drawInfo = this.getInfo()
        if (drawInfo.length === 0) return
        drawInfo.pop()
        this.reDraw()
        this.drawInfoUpdated(drawInfo)
      },
      // 保存图片到本地
      downloadCanvasIamge () {
        try {
          let urlSplit = this.imgUrl.split('?')[0].split('/')
          let name = `${this.storeName || `${this.applicationSceneName}未知名`}_${this.selectImgObj.channelName || '未知通道名'}_${urlSplit[urlSplit.length - 1]}`
          let canvas = this.$refs.imgCanvas.getCanvas()
          // 使用toDataURL方法将图像转换被base64编码的URL字符串
          if (navigator.msSaveBlob) { // IE10+
            let blob = canvas.msToBlob()
            return navigator.msSaveBlob(blob, name)
          } else {
            let url = canvas.toDataURL('image/png')
            let a = document.getElementById('srctoUrl')
            // 创建一个单击事件
            a.download = name || '下载图片名称'
            a.href = url
            a.click()
          }
        } catch(err) {
          window.open(this.imgUrl)
        }
      },
    }
  }
</script>
<style lang="scss" scoped>
@import "./style";
.rotateLR {
  transform: rotateY(180deg);
}
.anchor {
  position: absolute;
  width: 6px;
  height: 6px;
  background: white;
}
.tl {
  cursor: nw-resize;
  top: -3px;
  left: -3px;
}
.tr {
  cursor: ne-resize;
  top: -3px;
  right: -3px;
}
.bl {
  cursor: sw-resize;
  bottom: -3px;
  left: -3px;
}
.br {
  cursor: se-resize;
  bottom: -3px;
  right: -3px;
}
</style>
