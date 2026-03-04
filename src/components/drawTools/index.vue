<template>
  <div class="draw_tools_common">
    <div id="playWind" :style="{width: width,height: height}"></div>
    <div class="btn_box">
      <el-button @click="setSnapPolygonDrawInfo()" :class="{'btn':true,'polygon_btn':true,'active_btn':activeBtn === 'polygonBtn'}"
        v-if="supportPolygonType.includes(2)" title="绘制区域"></el-button>
      <el-button @click="setLineInfo([[100,100],[100,200]],'lineBtn')" :class="{'btn':true,'line_btn':true,'active_btn':activeBtn === 'lineBtn'}"
        v-if="supportPolygonType.includes(1)" title="绘制线"></el-button>
      <el-button @click="setLineInfo([[100,100],[100,200]],'crosslineBtn')" :class="{'btn':true,'crossline_btn':true,'active_btn':activeBtn === 'crosslineBtn'}"
        v-if="supportPolygonType.includes(4)" title="双向"></el-button>
      <el-button @click="setLineInfo([[100,100],[100,200]],'crossAlineBtn')" :class="{'btn':true,'crossAline_btn':true,'active_btn':activeBtn === 'crossAlineBtn'}"
        v-if="supportPolygonType.includes(5)" title="A->B"></el-button>
      <el-button @click="setLineInfo([[100,100],[100,200]],'crossBlineBtn')" :class="{'btn':true,'crossBline_btn':true,'active_btn':activeBtn === 'crossBlineBtn'}"
        v-if="supportPolygonType.includes(6)" title="B->A"></el-button>
      <el-button @click="setRectInfo([[100, 100], [100, 300], [300, 300], [300, 100]])" :class="{'btn':true,'rect_btn':true,'active_btn':activeBtn === 'rectBtn'}"
        v-if="supportPolygonType.includes(3)" title="绘制区域"></el-button>
      <div class='btn_wrap'></div>
      <el-button @click="clearAll()" :class="{'btn':true,'clear_btn':true,'active_btn':activeBtn === ''}" title="清空"></el-button>
    </div>
    <!-- <div class="button_box">
      <div class="items">
          <div>图片预览</div>
          <button type="button" @click="setImgInfo()">设置图片</button>
      </div>
      <div class="items">
          <div>栅格移动侦测</div>
          <button type="button" @click="setMotionGridShapeInfo()">设置移动侦测信息</button>
          <button type="button" @click="getMotionGridShapeInfo()">获取移动侦测信息</button>
          <button type="button" @click="setMotionDrawInfo()">设置移动侦测相关绘制信息</button>
          <button type="button" @click="startMotionGridDraw()">开始移动侦测绘制</button>
          <button type="button" @click="stopMotionGridDraw()">停止移动侦测绘制</button>
          <button type="button" @click="clearAll()">清除区域</button>
      </div>
      <div class="items">
          <div>绘制矩形</div>
          <button type="button" @click="setRectInfo()">设置矩形信息</button>
          <button type="button" @click="getRectInfo()">获取矩形信息</button>
          <button type="button" @click="setRectDrawInfo()">设置矩形相关绘制信息</button>
          <button type="button" @click="startRectDraw()">开始绘制矩形</button>
          <button type="button" @click="stopRectDraw()">停止绘制矩形</button>
          <button type="button" @click="clearAll()">清除区域</button>
      </div>
      <div class="items">
          <div>绘制多边形</div>
          <button type="button" @click="setSnapPolygonInfo()">设置多边形信息</button>
          <button type="button" @click="getSnapPolygonInfo()">获取多边形信息</button>
          <button type="button" @click="setSnapPolygonDrawInfo()">设置多边形相关绘制信息</button>
          <button type="button" @click="startSnapPolygonDraw()">开始绘制多边形</button>
          <button type="button" @click="stopSnapPolygonDraw()">停止绘制多边形</button>
          <button type="button" @click="clearAll()">清除区域</button>
      </div>
      <div class="items">
          <div>绘制线</div>
          <button type="button" @click="setLineInfo()">设置线信息</button>
          <button type="button" @click="getLineInfo()">获取线信息</button>
          <button type="button" @click="clearAll()">清除区域</button>
      </div>
    </div> -->
  </div>
</template>
<script>
import defaultImg from './img/drawbg.png'
export default {
  props: {
    imgUrl: { // 图片路径
      type: String,
      default: ''
    },
    width: {// 画布宽
      type: Number,
      default: 600
    },
    height: {// 画布高
      type: Number,
      default: 400
    },
    iMaxPointSupport: {// 多边形最大可支持绘制的边数
      type: Number,
      default: 10
    },
    // iLineType: {// 普通线-0, 越界侦测线-3, 过线统计-4
    //   type: Number,
    //   default: 0
    // },
    drawPropInfo: {// 父组件传来的需要设置的绘制坐标点信息
      type: Array,
      default: () => {
        return []
      }
    },
    drawType: {// 绘制类型，1为折线，2为多边形,3为矩形，4为分方向的折线，0为空
      type: Number,
      default: 0
    },
    supportPolygonType: {// 支持绘制类型的数组
      type: Array,
      default: () => {
        return []
      }
    }
  },
  computed: {
    // iLineType () {
    //   let type = this.drawType === 4 ? 3 : 0
    //   return type
    // }
  },
  watch: {
    imgUrl (val) {
      this.initDraw()
    },
    width (val) {
      this.initDraw()
    },
    height (val) {
      this.initDraw()
    },
    drawPropInfo (val) {
      if (val) {
        this.initDraw()
      }
    }
  },
  data () {
    return {
      drawTypeObj: { 1: 'lineBtn', 2: 'polygonBtn', 3: 'rectBtn', 4: 'crosslineBtn', 5: 'crossAlineBtn', 6: 'crossBlineBtn' },
      oPlugin: null,
      disabled: true,
      activeBtn: '',
      drawInfo: [],
      drawSetInfo: [],
      iLineType: 0,
      iDirection: 0
    }
  },
  mounted () {
    this.initDraw()
  },
  methods: {
    // 初始化插件
    initDraw () {
      this.oPlugin = new JSPlugin({
        szId: 'playWind',
        iType: 1,
        iWidth: this.width,
        iHeight: this.height,
        iMaxSplit: 1,
        iCurrentSplit: 1,
        // oStyle: {borderSelect: '#4C4B4B'},
        // oStyle: {borderSelect: 'rgba(31,127,255,0.4)'},
        // oStyle: {borderSelect: 'rgba(0,0,0,0.7)'},
        oStyle: { borderSelect: '#333' },
        szBasePath: process.env.NODE_ENV === 'production' ? '../../../static/drawTool-JS' : './static/drawTool-JS'
      })
      this.setImgInfo(this.imgUrl.length > 0 ? this.imgUrl : defaultImg)
      if (this.drawPropInfo.length) {
        this.drawSetInfo = this.drawPropInfo
        this.activeBtn = this.drawTypeObj[this.drawType]
        this.iLineType = [4, 5, 6].includes(this.drawType) ? 3 : 0
        this.iDirection = this.drawType === 4 ? 2 : this.drawType === 5 ? 0 : 1
        // this.activeBtn = this.drawType === 1 ? 'lineBtn' : this.drawType === 2 ? 'polygonBtn' : this.drawType === 3 ? 'rectBtn' : ''
      } else {
        this.drawSetInfo = []
        this.activeBtn = ''
      }
      this.setDrawInfo(this.drawSetInfo, this.activeBtn)// 设置绘制信息
    },
    // 清除所有图形
    clearAll () {
      this.stopSnapPolygonDraw()// 如果是自定义多边形，要先停止绘制多边形。
      this.activeBtn = ''
      this.drawInfo = []
      this.oPlugin.JS_ClearRegion().then(function () {
      }, function () {
      })
    },
    /* 公共接口----end */

    //  获取绘制信息
    async getDrawInfo () { // 返给父组件绘制坐标点信息
      if (this.activeBtn === 'polygonBtn') {
        await this.getSnapPolygonInfo()
      // } else if (this.activeBtn === 'lineBtn') {
      } else if (this.activeBtn.indexOf('lineBtn') > -1) {
        await this.getLineInfo()
      } else if (this.activeBtn === 'rectBtn') {
        await this.getRectInfo()
      }
      return this.drawInfo
    },
    cbGetDrawType () { // 返给父组件绘制类型
      return this.activeBtn
    },
    // 设置绘制信息
    setDrawInfo (points, activeBtn) {
      if (activeBtn === 'polygonBtn') {
        this.setSnapPolygonInfo(points)
      // } else if (activeBtn === 'lineBtn') {
      } else if (activeBtn.indexOf('lineBtn') > -1) {
        this.setLineInfo(points, activeBtn)
      } else if (activeBtn === 'rectBtn') {
        this.setRectInfo(points)
      }
    },

    /* 移动侦测----begin */
    // 设置移动侦测信息
    setMotionGridShapeInfo () {
      this.oPlugin.JS_SetGridInfo({
        gridColNum: 22, // 列数
        gridRowNum: 18, // 行数
        gridMap: '0000000000000000000000000001c00001c01fe1c01fe1c01fe1c01fe1c01fe0001fe0001fe000000000000f80000000000000000000',
        drawColor: '#1F7FFF'
      }).then(function () {
      }, function () {
      })
    },
    // 获取移动侦测
    getMotionGridShapeInfo () {
      this.oPlugin.JS_GetGridInfo().then(function (oGrid) {
      })
    },
    // 设置移动侦测绘制图形样式
    setMotionDrawInfo () {
      this.oPlugin.JS_SetDrawShapeInfo('Grid', {
        szDrawColor: '#1F7FFF'
      }).then(function () {
      }, function () {
      })
    },
    // 开始移动侦测绘制
    startMotionGridDraw () {
      this.oPlugin.JS_SetDrawStatus(true).then(function () {
      }, function () {
      })
    },
    // 停止移动侦测绘制
    stopMotionGridDraw () {
      this.oPlugin.JS_SetDrawStatus(false).then(function () {
      }, function () {
      })
    },
    /* 移动侦测----end */

    /* 矩形----begin */
    setRectInfo (points) {
      this.clearAll()
      this.activeBtn = 'rectBtn'
      var aRect = [{
        iEditType: 0, // 0-可编辑，1-不可编辑
        // aPoint: [[100, 100], [100, 300], [300, 300], [300, 100]], // 多边形坐标
        aPoint: points, // 矩形坐标
        szTips: '', // 多边形名称
        szDrawColor: '#1F7FFF', // 边框颜色
        szFillColor: '#1F7FFF', // 填充颜色
        iTranslucent: 0.1 // 透明度
      }]
      this.oPlugin.JS_SetRectInfo(aRect).then(function () {
      }, function () {
      })
    },
    async getRectInfo () {
      let that = this
      this.oPlugin.JS_GetRectInfo().then(function (aRects) {
        that.drawInfo = aRects[0].aPoint
        that.drawInfo.polygonType = that.drawType
        return that.drawInfo
      })
    },
    setRectDrawInfo () {
      this.oPlugin.JS_SetDrawShapeInfo('Rect', {
        szDrawColor: '#1F7FFF', // 边框颜色
        szFillColor: '#1F7FFF', // 填充颜色
        iTranslucent: 0.1, // 透明度
        iMaxShapeSupport: 1 // 最大可绘制的图形数目
      }).then(function () {
      }, function () {
      })
    },
    startRectDraw () {
      this.oPlugin.JS_SetDrawStatus(true).then(function () {
      }, function () {
      }) // 开始绘图
    },
    stopRectDraw () {
      this.oPlugin.JS_SetDrawStatus(false).then(function () {
      }, function () {
      }) // 停止绘图
    },
    /* 矩形----end */

    /* 多边形----begin */
    setSnapPolygonInfo (points) {
      this.clearAll()
      this.activeBtn = 'polygonBtn'
      var aPolygons = [{
        iPolygonType: 1,
        iEditType: 0, // 0-可编辑，1-不可编辑
        // aPoint: [[100, 100], [100, 200], [200, 300], [400, 100]], // 多边形坐标
        aPoint: points, // 多边形坐标
        bClosed: true, // 多边形闭合
        szTips: '', // 多边形名称
        szDrawColor: '#1F7FFF', // 边框颜色
        szFillColor: '#1F7FFF', // 填充颜色
        iTranslucent: 0.1 // 透明度
      }]
      this.oPlugin.JS_SetPolygonInfo(aPolygons).then(function () {
      }, function () {
      })
    },
    async getSnapPolygonInfo () {
      let that = this
      this.oPlugin.JS_GetPolygonInfo().then(function (aPolygons) {
        that.drawInfo = aPolygons[0] && aPolygons[0].aPoint
        that.drawInfo.polygonType = that.drawType
        return that.drawInfo
      })
    },
    setSnapPolygonDrawInfo () {
      this.clearAll()
      let that = this
      this.oPlugin.JS_SetDrawShapeInfo('Polygon', {
        szDrawColor: '#1F7FFF', // 边框颜色
        szFillColor: '#1F7FFF', // 填充颜色
        iTranslucent: 0.1, // 透明度
        iMaxShapeSupport: 1, // 最大可绘制数
        iMaxPointSupport: this.iMaxPointSupport // 最大支持的点数
      }).then(function () {
        that.startSnapPolygonDraw()
      }, function () {
      })
    },
    startSnapPolygonDraw () {
      this.activeBtn = 'polygonBtn'
      this.oPlugin.JS_SetDrawStatus(true).then(function () {
      }, function () {
      }) // 开始绘图
    },
    stopSnapPolygonDraw () {
      this.oPlugin.JS_SetDrawStatus(false).then(function () {
      }, function () {
      }) // 停止绘图
    },

    /* 多边形----end */
    /* 线----begin */
    setLineInfo (points, activeBtn) {
      this.clearAll()
      // this.activeBtn = 'lineBtn'
      this.activeBtn = activeBtn
      this.iDirection = activeBtn === 'crosslineBtn' ? 2 : activeBtn === 'crossAlineBtn' ? 0 : 1
      // this.activeBtn = this.drawTypeObj[this.drawType]
      var aLines = [{
        // iLineType: 4, // 普通线-0, 越界侦测线-3, 过线统计-4
        iLineType: this.iLineType, // 普通线-0, 越界侦测线-3, 过线统计-4
        // aPoint: [[100, 100], [100, 200]], // 线坐标
        aPoint: points, // 线坐标
        szTips: '', // 线名称，可以不传
        iDirection: this.iDirection, // 越界侦测线需要用到该属性， 0表示A->B, 1表示B->A, 2表示A<->B
        // iDirection: 0, // 越界侦测线需要用到该属性， 0表示A->B, 1表示B->A, 2表示A<->B
        iArrowType: 0, // 箭头方向(和直销垂直)，0-起始坐标的正时针方向， 1- 起始坐标的逆时针方向
        szDrawColor: '#1F7FFF' // 线颜色
      }]
      this.oPlugin.JS_SetLineInfo(aLines).then(function () {
      }, function () {
      })
    },
    async getLineInfo () {
      let that = this
      this.oPlugin.JS_GetLineInfo().then(function (aLines) {
        that.drawInfo = aLines[0] && aLines[0].aPoint
        // that.drawInfo.polygonType = that.drawType
        that.drawInfo.polygonType = that.activeBtn === 'crossAlineBtn' ? 5 : that.activeBtn === 'crossBlineBtn' ? 6 : 4
        return that.drawInfo
      })
    },
    setImgInfo (img) {
      this.oPlugin.JS_PlayWithImg(img).then(function () {
      }, function () {
      })
    }
    /* 线----end */
  }
}
</script>
<style lang="scss" scoped>
  @import './style';
</style>
<style lang="scss">
</style>
