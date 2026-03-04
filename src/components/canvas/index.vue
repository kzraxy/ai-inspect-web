<template>
  <div class="canvasWarp">
    <canvas
      :title="zoomable?'鼠标滚轮缩放查看':''"
      :id="radom"
      :width="iWidth"
      :height="iHeight"
      :style="{'width':`${width}px`,'height':`${height}px`, cursor, transform: `translate(${offsetX}px, ${offsetY}px) scale(${currentScale})`}"
      @mousedown="canvasDown($event)"
      @mouseup="canvasUp($event)"
      @mousemove="canvasMove($event)"
      @mouseleave="mouseLeave($event)"
      @touchstart="canvasDown($event)"
      @touchend="canvasUp($event)"
      @touchmove="canvasMove($event)"
      @mousewheel="canvasWheel($event)">
    </canvas>
    <!-- <img :src="url" id="natureImg" style="display:none"> -->
    <!-- <img class="srctoUrl" :width="width" :height="height" :src="picUrl" @load="imgLoad" > -->
  </div>
</template>
<script>
  import { mapGetters } from 'vuex'
  import { watermark } from './watermark'
  import { getWatermark } from '@/plugin/utils/util'
  import { v1 as uuidv1 } from 'uuid'
  const crossWhiteList = ['://hikvision.oss-cn-hangzhou.aliyuncs.com', 'pic.hik-cloud.com', 'load.hik-cloud.com']
  export default {
    props: {
      url: { // 图片路径
        type: String
      },
      // 是否可放大缩小
      zoomable: {
        type: Boolean,
        default: false,
      },
      info: { // 位置点信息
        type: Array,
        default: () => [],
      },
      width: { // 绘图区域宽度
        type: String
      },
      height: { // 绘图区域高度
        type: String
      },
      drawColor: { // 新涂鸦颜色
        type: String,
        default: '#FA3239'
      },
      lineColor: { // 涂鸦不带颜色时的默认展示颜色
        type: String,
        default: '#FA3239'
      },
      lineWidth: { // 画笔宽度
        type: Number,
        default: 1,
      },
      fontSize: {
        type: Number,
        default: 14,
      },
      // 文字类型渲染行高倍率，不可随意改动，需跟外部统一
      heightRate: {
        type: Number,
        default: 1.3,
      },
      // 操作模式，目前类型支持drag, draw-rec, draw-circle, 分别是拖拽模式，涂鸦矩形模式，涂鸦椭圆模式
      opModel: {
        type: String,
        default: '',
      },
      drawInfo: {
        type: Array,
        default: () => [],
      },
      aiInfo: {
        type: Array,
        default: () => [],
      },
      ruleInfo: {
        type: Array,
        default: () => [],
      },
      isRenderDraw: {
        type: Boolean,
        default: true,
      },
      isRenderRule: {
        type: Boolean,
        default: true,
      },
      // canvas绘制图片是否铺满容器
      isFill: {
        type: Boolean,
        default: false
      },
      font: {
        type: String,
        default: ''
      },
      backgroundColor: {
        type: String,
        default: '#222'
      },
      showLabel: {
        type: Boolean,
        default: false,
      },
    },
    watch: {
      info (val) {
        this.reDraw()
      },
      drawInfo () {
        this.reDraw()
      },
      isRenderDraw() {
        this.reDraw()
      },
      isRenderRule() {
        this.reDraw()
      },
      url(v) {
        this.initDraw()
      },
      scaleTimes() {
        // -1 为下限，1为上限，0为中间态
        let scaleStatus = this.scaleTimes === 0 ? -1 : (this.currentScale === this.maxScale ? 1 : 0)
        this.$emit('scaleChanged', { scale: this.currentScale, scaleStatus })
      }
    },
    data () {
      return {
        picUrl: '',
        // 同一页面多次渲染时，用于区分元素的id
        radom: uuidv1(),
        // canvas对象
        context: {},
        img: new Image(),
        // 是否处于绘制状态
        canvasMoveUse: false,
        //  是否处于拖拽状态
        canvasDragging: false,
        // 图片绘制时在canvas内部的偏移
        offsetW: 0,
        offsetH: 0,
        dealStyle: null,
        drawing: false,
        // 图片原始宽高
        originWidth: 0,
        originHeight: 0,
        // canvas 内部坐标系宽高
        iWidth: 0,
        iHeight: 0,
        // 最大放大倍数
        maxScale: 9.6,
        // 单次放大倍率
        scaleRate: 1.2,
        // 放大次数
        scaleTimes: 0,
        // 图片放大后定位位置偏移，0，0时为中心点居中
        offsetX: 0,
        offsetY: 0,
        // 箭头三角形高度，以像素计（跟线宽同一规则）
        arrowHeight: 10,
        // 箭头顶角角度
        arrowAngle: Math.PI / 4,
      }
    },
    computed: {
      ...mapGetters(['maxGraffitiCount']),
      // 画布内部坐标像素和外部像素比
      inOutPXRate() {
        return this.iHeight / this.height
      },
      iLineWidth() {
        if (!this.iWidth || !this.width) return this.lineWidth
        return  Math.max(Math.round(this.lineWidth / this.width * this.iWidth), 1)
      },
      iArrowHeight() {
        // 为防止在小图上箭头太大，限定箭头高度不得超过可视区域高度的20分之一
        return  this.inOutPXRate * Math.min(+this.height / 20, this.arrowHeight)
      },
      currentScale() {
        let scale = Math.min(Math.pow(this.scaleRate, this.scaleTimes), this.maxScale)
        scale = +scale.toFixed(2)
        return scale
      },
      lineType() {
        return {
          "draw-rec": "rec",
          "draw-circle": "circle",
          "draw-arrow": "arrow",
        }[this.opModel] || ""
      },
      cursor() {
        return {
          drag: 'move',
          text: 'text',
          "draw-rec": "crosshair",
          "draw-circle": "crosshair",
          "draw-arrow": "auto",
        }[this.opModel]
      },
      draggable() {
        return this.opModel === 'drag'
      },
      drawable() {
        return this.opModel.startsWith('draw-')
      }
    },
    mounted () {
      this.initDraw()
    },
    methods: {
      deal (x, y) {
        // this.originWidth = x
        // this.originHeight = y
        let iWidth
        let iHeight
        this.offsetW = 0
        this.offsetH = 0
        if (x / y >= this.width / this.height) {
          iWidth = Math.max(x, this.width)
          iHeight = iWidth * this.height / this.width
          this.originWidth = iWidth
          this.originHeight = iWidth * y / x
          this.offsetH = (iHeight - this.originHeight) / 2
          this.dealStyle = 1
        } else {
          iHeight = Math.max(y, this.height)
          iWidth = iHeight * this.width / this.height
          this.originHeight = iHeight
          this.originWidth = iHeight * x / y
          this.offsetW = (iWidth - this.originWidth) / 2
          this.dealStyle = 2
        }
        this.iWidth = iWidth
        this.iHeight = iHeight
      },
      // 初始化绘制信息
      initDraw () {
        if (this.drawing) return
        this.drawing = true
        this.picUrl = this.url
        // 初始化画布
        const canvas = document.getElementById(this.radom)
        this.context = canvas.getContext('2d')
        this.context.clearRect(0, 0, this.iWidth, this.iHeight)
        // 初始化画笔
        // 允许跨域的域名就设置跨域用于下载
        if (crossWhiteList.some(e => this.picUrl.includes(e))) {
          this.img.setAttribute('crossOrigin', 'anonymous')
          // cdn 跨域和缓存策略冲突产物
          this.picUrl += (this.picUrl.includes('?') ? '&' : '?') + 'tail'
        } else (
          this.img.removeAttribute('crossOrigin')
        )

        this.img.src = this.picUrl
        // this.img.src = 'https://img2.baidu.com/it/u=2712136634,2444032755&fm=253&fmt=auto&app=120&f=JPEG?w=800&h=500'
        this.img.onerror = () => {
          this.drawing = false
        }
        this.img.onload = () => {
          this.drawing = false
          // 切换图片重置缩放和偏移
          this.scaleTimes = 0
          this.setOffset(0, 0)
          this.deal(this.img.width, this.img.height)
          this.$nextTick(this.reDraw)

        }
      },
      // 放大缩小计算图片定位, 入参为保持某一点位置不变放大（即通过鼠标滚轮放大缩小时，鼠标滚轮的位置）isZoomIn: true 放大，反之缩小
      reCalculateOffset(x, y, isZoomIn) {
        let scale
        let n = Math.log(this.maxScale) / Math.log(this.scaleRate)
        // 最大放大倍率的那一次放大或者缩小的缩放比不是scaleRate，需要计算，故加了该条件判断
        if ((isZoomIn && this.scaleTimes == Math.ceil(n)) || (!isZoomIn && this.scaleTimes == Math.floor(n))) {
          scale = this.maxScale / Math.pow(this.scaleRate, Math.floor(n))
          if (!isZoomIn) {
            scale = 1 / scale
          }
        } else {
          scale = isZoomIn ? this.scaleRate : (1 / this.scaleRate)
        }
        let ox = this.offsetX - (x - this.width / 2 - this.offsetX) * (scale - 1)
        let oy = this.offsetY - (y - this.height / 2 - this.offsetY) * (scale - 1)
        this.setOffset(ox, oy)
      },
      // 重置缩放后的偏移，带上下限校验功能
      setOffset(x, y) {
        let wLimit = this.width * (this.currentScale - 1) / 2
        let hLimit = this.height * (this.currentScale - 1) / 2
        this.offsetX = Math.min(Math.max(-wLimit, x), wLimit)
        this.offsetY = Math.min(Math.max(-hLimit, y), hLimit)
      },
      // 滚轮滚动
      canvasWheel(e) {
        if (!this.zoomable) return
        e.preventDefault()
        this.zoom(e.wheelDelta < 0, [e.layerX, e.layerY])
      },
      // point为保持某一点位置不变放大（即通过鼠标滚轮放大缩小时，鼠标滚轮的位置）[x, y], 默认为以当前视窗中心点保持不变
      zoom(out, point) {
        if (!this.zoomable) return
        if (!point) {
          point = [this.width / 2, this.height / 2]
        }
        if (out) {
          if (this.scaleTimes == 0) return
          this.scaleTimes -= 1
          this.reCalculateOffset(point[0], point[1], false)
        } else {
          if (this.currentScale == this.maxScale) return
          this.scaleTimes += 1
          this.reCalculateOffset(point[0], point[1], true)
        }
      },
      resetZoom() {
        this.scaleTimes = 0
        this.setOffset(0, 0)
      },
      paintingCheck() {
        if (this.drawInfo.length + this.info.length >= this.maxGraffitiCount) {
          this.$message.warning(`单张图片涂鸦框超过${this.maxGraffitiCount}个，无法再添加`)
          return
        }
        return true
      },
      // 鼠标按下
      canvasDown (e) {
        if (this.draggable) {
          this.canvasDragging = true
          return
        }
        if (!this.drawable) return
        if (!this.paintingCheck()) return
        this.canvasMoveUse = true
        // client是基于整个页面的坐标，offset是cavas距离pictureDetail顶部以及左边的距离
        // const canvasX = e.clientX - e.target.parentNode.offsetLeft
        // const canvasY = e.clientY - e.target.parentNode.offsetTop
        // debugger
        const canvasX = e.offsetX || e.layerX
        const canvasY = e.offsetY || e.layerY
        // 为了适配 重新计算
        this.drawInfo.push({
          x: (canvasX * this.iWidth / this.width - this.offsetW) / this.originWidth,
          y: (canvasY * this.iHeight / this.height - this.offsetH) / this.originHeight,
          color: this.drawColor,
          type: this.lineType,
        })
      },
      // 高斯定理
      Area (p0, p1, p2) {
        let area = 0.0
        area = p0.x * p1.y + p1.x * p2.y + p2.x * p0.y - p1.x * p0.y - p2.x * p1.y - p0.x * p2.y
        return area / 2
      },
      // 计算线段倾斜角度
      calcAngle(x, y) {
        return Math.atan2(y, x) + Math.PI / 2
      },
      // 计算多边形质心
      getPolygonAreaCenter (points) {
        let sumX = 0
        let sumY = 0
        let sumArea = 0
        let p1 = points[1]
        for (let i = 2; i < points.length; i++) {
          let p2 = points[i]
          let area = this.Area(points[0], p1, p2)
          sumArea += area
          sumX += (points[0].x + p1.x + p2.x) * area
          sumY += (points[0].y + p1.y + p2.y) * area
          p1 = p2
        }
        return {
          x: sumX / sumArea / 3,
          y: sumY / sumArea / 3
        }
      },
      // 根据坐标信息绘制图形
      drawWithInfo (val = []) {
        const info = val || []
        // info = [{ type: 'text', x: 100, y: 100, content: '来也匆匆去也匆匆\n爱也匆匆恨也匆匆' }]
        info.forEach(item => {
          this.context.beginPath()
          let color = item.color == 'null' ? this.lineColor : (item.color || this.lineColor)
          this.context.strokeStyle = color
          this.context.fillStyle = color
          this.context.lineWidth = this.iLineWidth
          if (!item.type) {
            // 目前不确定有没有走到该逻辑下的场景，该逻辑绘图位置应该是有偏移问题的
            // 设置颜色
            this.context.strokeStyle = item.regionColor
            this.context.fillStyle = item.regionColor
            if (this.font) {
              this.context.font = this.font
            }
            // 绘制多边形的边
            if (typeof item.region === 'string') {
              item.region = JSON.parse(item.region)
            }
            item.region.forEach(point => {
              this.context.lineTo(point.x * this.iWidth, point.y * this.iHeight)
            })
            this.context.closePath()
            // 在多边形质心标注文字
            let point = this.getPolygonAreaCenter(item.region)
            this.context.textAlign = 'center'
            this.context.fillText(item.areaName, point.x * this.iWidth, point.y * this.iHeight)
          } else if (item.type === 'polygon') {
            item.points.forEach(point => {
              this.context.lineTo(+point.x * (this.iWidth - 2 * this.offsetW) + this.offsetW, +point.y * (this.iHeight - 2 * this.offsetH) + this.offsetH)
            })
            this.context.closePath()
            // 暂时只用于AI分析和运营助手过来的规则框展示
            if (this.showLabel && item.labels && item.labels.length > 0) {
              const fs = 14 * this.inOutPXRate
              this.context.textBaseline = 'top'
              this.context.font = `${fs}px Arial`
              let originPoint = item.points[0]
              let txtOffsetY = originPoint.y * this.originHeight + this.offsetH < fs * this.heightRate * item.labels.length ? 0 : -fs * this.heightRate * item.labels.length
              let txtMaxWidth = item.labels.reduce((r, l) => Math.max(r, this.context.measureText(l).width), 0)
              let txtOffsetX = (1 - originPoint.x) * this.originWidth + this.offsetW < txtMaxWidth ? -txtMaxWidth : 0
              item.labels.forEach((str, i) => {
                let txtWidth = this.context.measureText(str).width
                let currentTxtEXTOffsetX =  txtOffsetX >= 0 ? 0 : txtMaxWidth - txtWidth
                this.context.fillStyle = 'rgba(0, 0, 0, 0.8)'
                this.context.fillRect(
                  originPoint.x * this.originWidth + this.offsetW + txtOffsetX + currentTxtEXTOffsetX,
                  originPoint.y * this.originHeight + this.offsetH + fs * this.heightRate * i + txtOffsetY,
                  txtWidth,
                  fs * this.heightRate
                )
                this.context.fillStyle = 'rgb(48, 143, 240)'
                this.context.fillText(
                  str,
                  originPoint.x * this.originWidth + this.offsetW + txtOffsetX + currentTxtEXTOffsetX,
                  originPoint.y * this.originHeight + this.offsetH + fs * (this.heightRate * i + (this.heightRate - 1) / 2) + txtOffsetY
                )
              })
            }
          } else if (item.type === 'arrow') {
            this.context.moveTo(item.x * (this.iWidth - 2 * this.offsetW) + this.offsetW, item.y * (this.iHeight - 2 * this.offsetH) + this.offsetH)
            this.context.lineTo((item.x + item.w) * (this.iWidth - 2 * this.offsetW) + this.offsetW, (item.y + item.h) * (this.iHeight - 2 * this.offsetH) + this.offsetH)
            if (item.w || item.h) {
              this.context.save()
              this.context.translate((item.x + item.w) * (this.iWidth - 2 * this.offsetW) + this.offsetW, (item.y + item.h) * (this.iHeight - 2 * this.offsetH) + this.offsetH)
              let angle = this.calcAngle(item.w * this.originWidth, item.h * this.originHeight)
              this.context.rotate(angle)
              this.context.moveTo(0, 0)
              this.context.lineTo(-Math.tan(this.arrowAngle / 2) * this.iArrowHeight, this.iArrowHeight)
              this.context.lineTo(Math.tan(this.arrowAngle / 2) * this.iArrowHeight, this.iArrowHeight)
              this.context.closePath()
              this.context.fill()
              this.context.restore()
            }
          } else if (item.type === 'rec') {
            this.context.rect(
              item.x * this.originWidth + this.offsetW,
              item.y * this.originHeight + this.offsetH,
              item.w * this.originWidth,
              item.h * this.originHeight
            )
          } else if (item.type === 'circle') {
            this.drawEllipse(
              this.context,
              (item.x + item.a) * this.originWidth + this.offsetW,
              (item.y + item.b) * this.originHeight + this.offsetH,
              Math.abs(item.a * this.originWidth),
              Math.abs(item.b * this.originHeight),
            )
          } else if (item.type === 'text') {
            const fs = item.fs * this.originWidth
            this.context.textBaseline = 'top'
            this.context.font = `${fs}px Arial`
            item.content.split('\n').forEach((str, i) => this.context.fillText(str, item.x * this.originWidth + this.offsetW, item.y * this.originHeight + this.offsetH + fs * this.heightRate * i))
          }
          this.context.stroke()
        })
      },
      // 鼠标移动时绘制
      canvasMove (e) {
        if (this.draggable && this.canvasDragging) {
          this.setOffset(e.movementX + this.offsetX, e.movementY + this.offsetY)
          return
        }
        if (this.canvasMoveUse && this.drawable) {
          // let canvasX = e.clientX - e.target.parentNode.offsetLeft
          // let canvasY = e.clientY - e.target.parentNode.offsetTop
          const canvasX = e.offsetX || e.layerX
          const canvasY = e.offsetY || e.layerY
          let info = this.drawInfo[this.drawInfo.length - 1]
          if (['rec', 'arrow'].includes(this.lineType)) {
             // 原先的处理方式
            info.w = (canvasX * this.iWidth / this.width - this.offsetW) / this.originWidth - info.x
            info.h = (canvasY * this.iHeight / this.height - this.offsetH) / this.originHeight - info.y
          } else if (this.lineType === 'circle') {
            info.a = ((canvasX * this.iWidth / this.width - this.offsetW) / this.originWidth - info.x) / 2
            info.b = ((canvasY * this.iHeight / this.height - this.offsetH) / this.originHeight - info.y) / 2
          }
          this.reDraw()
        }
      },
      // 绘制椭圆
      drawEllipse (context, x, y, a, b) {
        context.save()
        let r = (a > b) ? a : b
        let ratioX = a / r
        let ratioY = b / r
        context.scale(ratioX, ratioY)
        context.beginPath()
        context.arc(x / ratioX, y / ratioY, r, 0, 2 * Math.PI, false)
        context.closePath()
        context.restore()
      },
      // 鼠标移出图片区域
      mouseLeave(e) {
        if (this.draggable && this.canvasDragging) {
          this.canvasDragging = false
          return
        }
        if (!this.canvasMoveUse) return
        this.canvasMoveUse = false
        this.$emit('drawInfoUpdated', this.drawInfo)
      },
      // 鼠标抬起
      canvasUp (e) {
        if (this.draggable && this.canvasDragging) {
          this.canvasDragging = false
          return
        }
        if (!this.drawable) return
        const lastGraffiti = this.drawInfo[this.drawInfo.length - 1]
        if (!lastGraffiti) return
        if ((['rec', 'arrow'].includes(lastGraffiti.type) && !lastGraffiti.w) || (lastGraffiti.type === 'circle' && !lastGraffiti.a)) {
          this.drawInfo.pop()
        } else {
          ['x', 'y', 'w', 'h', 'a', 'b'].forEach(key => {
            if (lastGraffiti[key]) {
              lastGraffiti[key] = +(lastGraffiti[key].toFixed(8))
            }
          })
        }

        this.canvasMoveUse = false
        this.$emit('drawInfoUpdated', this.drawInfo)
      },
      // 处理文字涂鸦信息，将外部坐标转换为内部坐标
      textTranslate(textInfo) {
        const { x, y, content, scale } = textInfo
        if (!content) return
        let info = { x, y, content, type: 'text', color: this.drawColor }
        info.x = +((info.x * this.inOutPXRate - this.offsetW) / this.originWidth).toFixed(8)
        info.y = +((info.y * this.inOutPXRate - this.offsetH) / this.originHeight).toFixed(8)
        info.fs = +(this.fontSize * scale * this.inOutPXRate / this.originWidth).toFixed(8)
        this.drawInfo.push(info)
        this.reDraw()
        this.$emit('drawInfoUpdated', this.drawInfo)
      },
      getEditTextInfo(e) {
        let x = e.offsetX || e.layerX
        let y = e.offsetY || e.layerY
        // 没点到canvas区域，无视
        if (x < 0 || y < 0 || x > this.width || y > this.height) return
        let ix = x * this.inOutPXRate
        let iy = y * this.inOutPXRate
        // 计算某个命中的，从后往前遍历
        let index = [...this.drawInfo].reverse().findIndex(info => {
          if (info.type != 'text') return false
          let rect = this.caclRectForTextInfo(info)
          return ix >= rect.x && iy >= rect.y && ix <= rect.x + rect.w && iy <= rect.y + rect.h
        })
        if (index < 0) return
        // 注意findIndex出来的对象index是反序的，需要处理
        let textInfo = this.drawInfo.splice(this.drawInfo.length - 1 - index, 1)[0]
        this.reDraw()
        // TODO: 还没确定是否需要发送更新事件
        // this.$emit('drawInfoUpdated', this.drawInfo)
        // 转换textInfo为外部对象信息
        return {
          x: Math.round((textInfo.x * this.originWidth + this.offsetW) / this.inOutPXRate),
          y: Math.round((textInfo.y * this.originHeight + this.offsetH) / this.inOutPXRate),
          scale: textInfo.fs * this.originWidth / this.inOutPXRate / this.fontSize,
          content: textInfo.content,
        }
      },
      // 计算某个文字在canvas上绘制后的矩形信息
      caclRectForTextInfo(info) {
        const fs = info.fs * this.originWidth
        this.context.font = `${fs}px Arial`
        let lineTexts = info.content.split('\n')
        let maxWidth = lineTexts.reduce((res, text) => {
          let cWidth = this.context.measureText(text).width
          return Math.max(res, cWidth)
        }, 0)
        return {
          x: info.x * this.originWidth + this.offsetW,
          y: info.y * this.originHeight + this.offsetH,
          w: maxWidth,
          h: fs * this.heightRate * lineTexts.length - fs * (this.heightRate - 1),
        }
      },
      // 获取canvas对象
      getCanvas() {
        let canvas = document.createElement('canvas')
        canvas.width = this.originWidth
        canvas.height = this.originHeight
        let ctx = canvas.getContext('2d')
        let img = this.context.getImageData(this.offsetW, this.offsetH, this.originWidth, this.originHeight)
        ctx.putImageData(img, 0, 0)
        watermark.drawForCanvas(canvas, { textArr: getWatermark() })
        return canvas
      },
      // 获取坐标信息
      getInfo () {
        return this.drawInfo
      },
      // 清空画布
      clean () {
        this.drawInfo.length = 0
        this.reDraw()
      },
      // 绘画图片和涂鸦
      drawBackground() {
        this.context.fillStyle = this.backgroundColor
        this.context.fillRect(0, 0, this.iWidth, this.iHeight)
      },

      // 绘画图片和涂鸦
      reDraw() {
        this.context.clearRect(0, 0, this.iWidth, this.iHeight)
        this.drawBackground()
        if (this.isFill) {
          this.context.drawImage(this.img, 0, 0, this.iWidth, this.iHeight)
        } else {
          this.context.drawImage(this.img, this.offsetW, this.offsetH, this.originWidth, this.originHeight)
        }
        if (this.isRenderDraw) {
          this.drawWithInfo(this.info)
          this.drawWithInfo(this.aiInfo)
          this.drawWithInfo(this.drawInfo)
        }
        if (this.isRenderRule) {
          this.drawWithInfo(this.ruleInfo)
          // this.drawWithInfo([
          // { type: 'polygon', color: 'rgb(75 221 246)', labels: ['的时空结构', '开的饭店客房'], points: [{ x: 0.1, y: 0.1 }, { x: 0.5, y: 0.3 }, { x: 0.4, y: 0.6 }] },
          // { type: 'polygon', color: 'orange', labels: ['寂寞如雪', '热情似火', '嗷呜~'], points: [{ x: 0.3, y: 0.05 }, { x: 0.6, y: 0.3 }, { x: 0.9, y: 0.7 }] },
          // ])
        }
      },
      // 由于initDraw正在进行时，picUrl和url可能不一致，增加一个check方法 在不一致时触发 initDraw
      checkImage(url) {
       if((this.picUrl !== url)&&(url === this.url)){
          this.initDraw()
       }
      },

    }
  }
</script>
<style lang="scss" scoped>
  @import './style';
</style>
