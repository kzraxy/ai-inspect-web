<template>
  <div :class="{'posiDiv':showText}" style="display: flex;align-items: center;justify-content: center;">
    <canvas
      :id="radom"
      :class="{canDraw: 'canvas'}"
      :width="width"
      :height="height"
      :style="{'width':`${width}px`,'height':`${height}px`}"
      @mousedown="canvasDown($event)"
      @mouseup="canvasUp($event)"
      @mousemove="canvasMove($event)"
      @touchstart="canvasDown($event)"
      @touchend="canvasUp($event)"
      @touchmove="canvasMove($event)">
    </canvas>
    <div :style="tooltipStyle" v-if="showText&&tooltipVisible">
      <el-tooltip :content="tooltipText" :value="true" placement="right-start"><div style="width:100%;height:100%"></div></el-tooltip>
    </div>
  </div>
</template>
<script>
import { v1 as uuidv1 } from 'uuid'
export default {
  props: {
    canDraw: { // 图片路径
      type: Boolean,
      default: true
    },
    url: { // 图片路径
      type: String
    },
    info: { // 位置点信息
      type: Array
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
      default: 2
    },
    lineType: { // 画笔类型
      type: String,
      default: 'circle'
    },
    useReg: { // 画笔粗细规则：红色粗，绿色细
      type: Boolean,
      default: false
    },
    displayDetectionArea: {
      type: Boolean,
      default: false
    },
    showText: {
      type: Boolean,
      default: false
    },
    selfRate: { // 设置画布宽高，不按照图片比例自调节
      type: Boolean,
      default: false
    }
  },
  watch: {
    info (val) {
      if (val) {
        this.initDraw()
      }
    },
    url (val) {
      if (val) {
        this.initDraw()
      }
    },
    width (val) {
      if (val) {
        this.initDraw()
      }
    },
    displayDetectionArea () {
      this.initDraw()
    }
  },
  data () {
    return {
      scaledWidth: '',
      scaledHeight: '',
      // 同一页面多次渲染时，用于区分元素的id
      radom: uuidv1(),
      // canvas对象
      context: {},
      // 是否处于绘制状态
      canvasMoveUse: false,
      // 绘制矩形和椭圆时用来保存起始点信息
      beginRec: {
        x: '',
        y: '',
        imageData: ''
      },
      // 储存坐标信息
      drawInfo: [],
      // 背景图片缓存
      img: new Image(),
      tooltipVisible: false,
      tooltipText: '',
      tooltipStyle: {}
    }
  },
  mounted () {
    this.initDraw()
  },
  methods: {
    // 初始化绘制信息
    initDraw () {
      // 初始化画布
      const canvas = document.getElementById(this.radom)
      this.context = canvas.getContext('2d')
      this.context.clearRect(0, 0, this.scaledWidth, this.scaledHeight)
      // 初始化背景图片
      if (this.url.indexOf('https://open.ys7.com') > -1) { // 如果是萤石云的地址，不设置跨域
      } else {
        // this.img.setAttribute('crossOrigin', 'Anonymous')
      }
      // this.img.setAttribute('crossOrigin', 'Anonymous')
      this.img.src = this.url
      this.img.onerror = () => {
        // var timeStamp = +new Date()
        // this.img.src = this.url + '?' + timeStamp
      }
      this.img.onload = () => {
        let scaledWidth = ''
        let scaledHeight = ''
        if(this.selfRate) { // 按传入的宽高
          scaledWidth = this.width
          scaledHeight = this.height
          this.scaledWidth = scaledWidth
          this.scaledHeight = scaledHeight
        } else {
          // Step 1: 计算缩放比例（按宽度或高度先填满）
          const scale = Math.min(
            this.width / this.img.naturalWidth,
            this.height / this.img.naturalHeight
          );

          // Step 2: 计算最终绘制尺寸
          scaledWidth = this.img.naturalWidth * scale;
          scaledHeight = this.img.naturalHeight * scale;
          this.scaledWidth = scaledWidth
          this.scaledHeight = scaledHeight

          // Step 3: 设置 Canvas 的像素尺寸（支持 HiDPI 屏幕）
          const dpr = window.devicePixelRatio || 1;
          canvas.width = scaledWidth * dpr;
          canvas.height = scaledHeight * dpr;
          canvas.style.width = `${scaledWidth}px`;
          canvas.style.height = `${scaledHeight}px`;
          this.context.scale(dpr, dpr); // 修正绘制尺寸
        }

        // Step 4: 抗锯齿优化
        this.context.imageSmoothingEnabled = true;
        this.context.imageSmoothingQuality = 'high';

        // Step 5: 居中绘制（计算偏移量）
        const x = (this.width - scaledWidth) / 2;
        const y = (this.height - scaledHeight) / 2;
        this.clean(this.img, 0, 0, scaledWidth, scaledHeight)
      }
      // 初始化画笔
      this.context.lineWidth = this.lineWidth
      this.context.strokeStyle = this.lineColor
    },
    // 鼠标按下
    canvasDown (e) {
      if (this.canDraw) {
        this.canvasMoveUse = true
        // client是基于整个页面的坐标，offset是cavas距离pictureDetail顶部以及左边的距离
        const canvasX = e.clientX - e.target.parentNode.offsetLeft
        const canvasY = e.clientY - e.target.parentNode.offsetTop
        // 记录起始点和起始状态
        this.beginRec.x = canvasX
        this.beginRec.y = canvasY
        this.beginRec.imageData = this.context.getImageData(0, 0, this.scaledWidth, this.scaledHeight)
        // 存储本次绘制坐标信息
        this.drawInfo.push({
          x: canvasX / this.scaledWidth,
          y: canvasY / this.scaledHeight,
          type: this.lineType
        })
      }
    },
    // 高斯定理
    Area (p0, p1, p2) {
      let area = 0.0
      area = p0.x * p1.y + p1.x * p2.y + p2.x * p0.y - p1.x * p0.y - p2.x * p1.y - p0.x * p2.y
      return area / 2
    },
    // 计算多边形质心
    getPolygonAreaCenter (points) {
      let sumX = 0
      let sumY = 0
      let sumArea = 0
      let p1 = points[1]
      for (var i = 2; i < points.length; i++) {
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
    drawWithInfo () {
      this.tooltipVisible = false
      this.info.forEach(item => {
        if (!item) {
          return false
        }
        this.context.beginPath()
        // 设置颜色
        this.context.strokeStyle = item.regionColor || 'red'
        this.context.fillStyle = item.regionColor || 'red'
        if (this.useReg && item.regionColor && item.regionColor === 'red') {
          this.context.lineWidth = 3
        } else {
          this.context.lineWidth = this.lineWidth
        }
        // if (!item.type && this.displayDetectionArea) {
        if ((!item.type && this.displayDetectionArea) || item.type === 'polygon') {
          // 绘制多边形的边
          if (typeof item.region === 'string') {
            item.region = JSON.parse(item.region)
          }
          // 绘制检测区域字段
          if (item.region) {
            item.region.forEach(point => {
              this.context.lineTo(point.x * this.scaledWidth, point.y * this.scaledHeight)
            })
          }
          // 绘制检测结果字段
          if (item.points) {
            item.points.forEach(point => {
              this.context.lineTo(point.x * this.scaledWidth, point.y * this.scaledHeight)
            })
          }
          this.context.closePath()
          // 在多边形质心标注文字
          // let point = this.getPolygonAreaCenter(item.region)
          // this.context.fillText(item.areaName, point.x * this.width, point.y * this.height)
        } else if (item.type === 'rec') {
          this.context.rect(item.x * this.scaledWidth, item.y * this.scaledHeight, item.w * this.scaledWidth, item.h * this.scaledHeight)
        } else if (item.type === 'circle') {
          this.drawEllipse(this.context, (item.x + item.a) * this.scaledWidth, (item.y + item.b) * this.scaledHeight, item.a > 0 ? item.a * this.scaledWidth : -item.a * this.scaledWidth, item.b > 0 ? item.b * this.scaledHeight : -item.b * this.height)
        }
        this.context.stroke()
        this.context.beginPath()
        if (this.showText && item.confidence) {
          this.context.strokeStyle = 'red'
          this.context.fillStyle = 'red'
          this.context.font = '16px Microsoft YaHei'
          let rightTopIndex = this.judgeRightTopIndex(item)// 计算四边形的右上角顶点
          this.context.arc(+item.points[rightTopIndex].x * +this.scaledWidth - 15, +item.points[rightTopIndex].y * +this.scaledHeight + 15, 10, 0, Math.PI * 2, false)
          // this.context.fillText('?', +item.points[rightTopIndex].x * +this.scaledWidth - 19, +item.points[rightTopIndex].y * +this.scaledHeight + 20)
          this.context.fillText(item.targetId, +item.points[rightTopIndex].x * +this.scaledWidth - 19, +item.points[rightTopIndex].y * +this.scaledHeight + 20)
        }
        this.context.stroke()
      })
    },
    // 计算四边形的右上角顶点
    judgeRightTopIndex (item) {
      let rightTopArr = []
      let rightBottomArr = []
      item.points.forEach(m => { rightTopArr.push(+m.x - +m.y) })
      item.points.forEach(m => { rightBottomArr.push(+m.x + +m.y) })
      let rightTopIndex = 0
      let maxRT = rightTopArr[0]
      for (let i = 0; i < rightTopArr.length; i++) {
        if (rightTopArr[i] > maxRT) {
          rightTopIndex = i
          maxRT = rightTopArr[i]
        }
      }
      return rightTopIndex
    },
    // 鼠标移动时绘制
    canvasMove (e) {
      if (this.canvasMoveUse && this.canDraw) {
        // client是基于整个页面的坐标，offset是cavas距离pictureDetail顶部以及左边的距离
        let canvasX = e.clientX - e.target.parentNode.offsetLeft
        let canvasY = e.clientY - e.target.parentNode.offsetTop
        if (this.lineType === 'rec') { // 绘制矩形时恢复起始点状态再重新绘制
          this.context.putImageData(this.beginRec.imageData, 0, 0)
          this.context.beginPath()
          this.context.rect(this.beginRec.x, this.beginRec.y, canvasX - this.beginRec.x, canvasY - this.beginRec.y)
          let info = this.drawInfo[this.drawInfo.length - 1]
          info.w = canvasX / this.scaledWidth - info.x
          info.h = canvasY / this.scaledHeight - info.y
        } else if (this.lineType === 'circle') { // 绘制椭圆时恢复起始点状态再重新绘制
          this.context.putImageData(this.beginRec.imageData, 0, 0)
          this.context.beginPath()
          let a = (canvasX - this.beginRec.x) / 2
          let b = (canvasY - this.beginRec.y) / 2
          this.drawEllipse(this.context, this.beginRec.x + a, this.beginRec.y + b, a > 0 ? a : -a, b > 0 ? b : -b)
          let info = this.drawInfo[this.drawInfo.length - 1]
          info.a = a / this.scaledWidth
          info.b = b / this.scaledHeight
        }
        this.context.stroke()
      }
      this.showTooltip(e)
    },
    showTooltip (e) {
      if (this.showText) {
        this.tooltipVisible = false
        for (let i = 0; i < this.info.length; i++) {
          if (this.info[i].confidence && this.info[i].points && this.info[i].points.length) {
            let rightTopIndex = this.judgeRightTopIndex(this.info[i])// 计算四边形的右上角顶点
            if (+this.info[i].points[rightTopIndex].x * +this.scaledWidth - 30 < e.offsetX && +this.info[i].points[rightTopIndex].x * +this.scaledWidth > e.offsetX && +this.info[i].points[rightTopIndex].y * +this.scaledHeight < e.offsetY && +this.info[i].points[rightTopIndex].y * +this.scaledHeight + 30 > e.offsetY) {
              this.tooltipVisible = true
              this.tooltipText = this.info[i].ocrText
              this.tooltipStyle.position = 'absolute'
              this.tooltipStyle.width = `28px`
              this.tooltipStyle.height = `28px`
              this.tooltipStyle.top = `${ +this.info[i].points[rightTopIndex].y * +this.scaledHeight }px`
              this.tooltipStyle.left = `${ +this.info[i].points[rightTopIndex].x * +this.scaledWidth - 30 }px`
              break
            }
          }
        }
      }
    },
    // 绘制椭圆
    drawEllipse (context, x, y, a, b) {
      context.save()
      var r = (a > b) ? a : b
      var ratioX = a / r
      var ratioY = b / r
      context.scale(ratioX, ratioY)
      context.beginPath()
      context.arc(x / ratioX, y / ratioY, r, 0, 2 * Math.PI, false)
      context.closePath()
      context.restore()
    },
    // 鼠标抬起
    canvasUp (e) {
      if (this.canDraw) {
        this.canvasMoveUse = false
      }
    },
    // 获取坐标信息
    getInfo () {
      return this.drawInfo
    },
    // 清空画布
    clean (img, x, y, scaledWidth, scaledHeight) {
      this.context.clearRect(0, 0, this.scaledWidth, this.scaledHeight)
      this.context.drawImage(img, x, y, scaledWidth, scaledHeight)
      // this.context.drawImage(this.img, 0, 0, this.width, this.height)
      this.drawInfo = []
      if (this.info && this.info.length !== 0) this.drawWithInfo()
    }
  }
}
</script>
<style lang="scss" scoped>
  @import './style';
  .posiDiv{
    position: relative;
  }
</style>
