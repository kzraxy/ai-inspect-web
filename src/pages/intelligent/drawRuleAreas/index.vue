<template>
  <div class="draw_rules_area">
    <!-- 面包屑 -->
    <div class="breadcrumb-mod page-head">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item class="breadcrumb_item1">
          <i class="h-icon-arrow_left" @click="backConfirm"></i>
          <span @click="backConfirm">分析任务</span>
        </el-breadcrumb-item>
        <el-breadcrumb-item class="breadcrumb_item2">规则区域绘制</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="content_area">
      <div class="content_left">
        <div class="channel-filter-text">已添加通道列表</div>
        <el-input placeholder="请输入内容" v-model="nameLike" suffix-icon="h-icon-search" clearable :clear-icon-click='clearSearch'
          :on-icon-click="handleSearchClick" @keyup.enter.native="handleSearchClick">
          <el-select v-model="contentType" slot="prepend" placeholder="请输入名称" class="content_type" style="width:85px;">
            <el-option label="通道" value="1"></el-option>
            <el-option label="组织" value="2"></el-option>
          </el-select>
        </el-input>
        <el-scrollbar wrap-class="draw_rules_left" view-class="el-demo2-scrollbar__view" v-if="!isCloudOrDCT4">
          <div v-for="(item,index) in noCloudList" :key="index" v-show="noCloudList.length > 0">
            <div @click="showOrHideRules(item, index)" :class="{'rules_list':true,'active_rules':index===currentRulesIndex}" onselectstart="return false;">
              <i style="margin-right:10px" :class="item.isShow ? 'h-icon-angle_down' : 'h-icon-angle_right'"></i>
              <!-- <div class="rules_list_name ellipsis_div" :title="item.taskRuleName">{{(index + 1) + '、' + item.taskRuleName}}</div> -->
              <div class="rules_list_name ellipsis_div" :title="item.taskRuleName">{{item.taskRuleName}}</div>
            </div>
            <div v-for="(cItem,cIndex) in item.channelList" v-show="item.isShow" :key="cIndex" @click="showDrawsInfo(cItem, cIndex, index)"
            :class="{'channel_list':true,'active_channel':cItem.currentDraw}">
              <div class="channel_list_channel">
                <div :class="{'isEditDiv':true,'isEdited':cItem.isEdited}"></div>
                <div class="channel_list_name ellipsis_div" :title="cItem.channelName">{{cItem.channelName}}</div>
                <div v-show="cItem.isPublished === 2" class="channel_list_tag un_depoly">未下发</div>
                <div v-show="cItem.isPublished === 3" class="channel_list_tag fail_depoly">下发失败</div>
              </div>
              <div class="channel_list_group ellipsis_div" :title="cItem.groupName">{{cItem.groupName}}</div>
            </div>
          </div>
          <div v-show="noCloudList.length === 0" class="empty-data-img">
            <div class="empty_bg"></div>
            <div class="empty_text">暂无数据</div>
          </div>
        </el-scrollbar>
        <el-scrollbar wrap-class="draw_rules_left" view-class="el-demo2-scrollbar__view" v-if="isCloudOrDCT4">
          <div v-for="(item,index) in cloudList" :key="index" v-show="cloudList.length > 0">
            <div @click="showCloudDrawsInfo(item,index)" :class="{'channel_list':true,'active_channel':currentCloudIndex === index}">
              <div :class="{'channel_list_channel':true}">
                <div :class="{'isEditDiv':true,'isEdited':item.isEdited}"></div>
                <div class="channel_list_name ellipsis_div" :title="item.name">{{item.name}}</div>
              </div>
              <div class="channel_list_group ellipsis_div" :title="item.groupName">{{item.groupName}}</div>
            </div>
          </div>
          <div v-show="cloudList.length === 0" class="empty-data-img">
            <div class="empty_bg"></div>
            <div class="empty_text">暂无数据</div>
          </div>
        </el-scrollbar>
      </div>
      <div class="content_right">
        <div class="content_right_head">区域绘制</div>
        <div class="draw_wrap">
          <div class="draw_area">
            <div class="content_right_draw">
              <div class="draw_tools_wrap">
                <div id="drawTools" class="draw_tools">
                  <drawTools ref="drawTools" :width='drawToolsW' :height='drawToolsH' :imgUrl='imgUrl' :supportPolygonType="rulesDrawData.supportPolygonType"
                  :drawType="rulesDrawData.polygonType" :drawPropInfo="this.rulesDrawData.polygonValue"
                   v-show="(!isCloudOrDCT4 && noCloudList.length>0)||(isCloudOrDCT4 && cloudList.length>0)"></drawTools>
                  <div class="draw_wrap_empty" v-show="(!isCloudOrDCT4 && !noCloudList.length)||(isCloudOrDCT4 && !cloudList.length)"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="draw_alone_btns">
            <div class="draw_alone_btns_wrap" :style="{'width':drawToolsW + 'px'}" v-show="rulesDrawData.polygonRuleId.length>0">
              <el-button icon="h-icon-copy" @click="copyDraw" size="mini" type="text" class="draw_mini_btn">复制绘制区域至</el-button>
              <el-button icon="h-icon-picture" @click="getNewPic" size="mini" type="text" class="draw_mini_btn">刷新抓图</el-button>
              <el-button @click="saveDrawImg(false)" size="mini" type="primary" class="draw_mini_btn_rewidth">{{!isCloudOrDCT4 ? '保存并下发' : '保存'}}</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="content_foot">
      <el-button type="primary" v-if="!isCloudOrDCT4 && noCloudList.length>0" @click="publishPolygonRules">全部下发</el-button>
      <el-button v-if="!isCloudOrDCT4" @click="backConfirm">取消</el-button>
      <!-- <el-button v-if="isCloudOrDCT4==='1'" @click="backConfirm">退出</el-button> -->
    </div>
    <el-dialog title="复制绘制区域至" :visible="showAreaTreeFlag" @close="closeCopyDrawDialog" :area="[560,650]" :close-on-click-modal=false class="drawTreeDialog">
      <div class="tree-filter">
        <el-input placeholder="搜索" suffix-icon="h-icon-search" clearable v-model="searchCopyDialogTree"></el-input>
      </div>
      <div class="tree-wrap">
        <el-tree show-checkbox :data="copyChannelTreeData"
                 :default-expand-all = true
                 :default-checked-keys="defaultCheckedKeys"
                 ref="channelTree"
                 node-key="id"
                 :props="defaultProps"
                 :filter-node-method="filterArea"
                 @check="changeSelectNode">
        </el-tree>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="copyPolygon">确定</el-button>
        <el-button @click="closeCopyDrawDialog">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import drawTools from '@/components/drawTools'
import refreshImg from './img/refreshImg.png'
import failImg from './img/failImg.png'
import { polygonRules, getCurrentDrawInfo, getNewPic, saveDrawImg, copyPolygon, publishPolygonRules, returnNewPic } from '../proxy'
export default {
  components: {
    drawTools
  },
  props: {
  },
  data () {
    return {
      taskId: this.$route.params.taskId,
      isCloudOrDCT4: false, // 是否云服务
      searchCopyDialogTree: '', // 通道弹框的树的搜索
      copyChannelTreeData: [], // 通道弹框的树
      defaultProps: {
        children: 'subNodes',
        label: 'name',
        disabled: 'forbidden'
      },
      defaultCheckedKeys: [],
      selectTreeNodes: [], // 选中的树节点
      nameLike: '', // 搜索内容
      contentType: '1', // 当前搜索选择的类型，通道还是门店
      currentRulesIndex: 0, // 设备端左侧当前选中的通道对应的规则的index
      currentChannelIndex: 0, // 设备端左侧当前选中的通道在他父规则内对应的index
      currentCloudIndex: 0, // 云端当前点击的通道
      rulesDrawData: {
        polygonRuleId: '',
        taskId: '',
        hasImg: true,
        polygonType: 0,
        imgUrl: '',
        polygonValue: [],
        polygon: [],
        supportPolygonType: []
      },
      imgUrl: '',
      prePointsString: null,
      refreshDrawImgFlag: false, // 当前通道/预置点是否正在抓图
      refreshDrawImgInterval: null, // 定时请求当前通道/预置点抓图的接口
      maxRefreshTimes: 0, // 最多可以定时器请求抓图的次数，超过30次（60s）就停掉
      saveValid: false, // 是否可以保存图片
      drawToolsW: 960,
      drawToolsH: 576,
      hasImg: true, // 当前通道/预置点是否有底图
      drawPoints: [], // 绘制区域的坐标点数据
      drawScalePoints: [], // 绘制区域的坐标点比例的数据
      drawType: '', // 绘制区域的绘制类型
      preEditIsSave: true, // 切换通道时判断上条编辑过的通道是否保存了，没保存给二次提示
      showAreaTreeFlag: false, // 显示'复制绘制区域到'的弹框
      areaTreeData: [], // '复制绘制区域到'的树
      noCloudList: [], // 设备端：规则和通道对应的数组
      cloudList: []// 云端：通道和预置点对应的数组
    }
  },
  watch: {
    currentRulesIndex (val) {
    },
    searchCopyDialogTree (val) {
      this.$refs.channelTree.filter(val)
    },
    rulesDrawData: {
      handler (val) {
      },
      deep: true,
      immediate: true
    },
    imgUrl: {
      handler (val) {
      },
      deep: true,
      immediate: true
    },
    refreshDrawImgFlag: {
      handler (val) {
        if (val) { // 当前通道正在抓图
          // this.imgUrl = refreshImg
        } else { // 当前通道停止抓图,清除定时器
          this.maxRefreshTimes = 0
          clearInterval(this.refreshDrawImgInterval)
          this.refreshDrawImgInterval = null
        }
      },
      deep: true,
      immediate: true
    }
  },
  created () {
    this.isCloudOrDCT4 = String(this.$route.params.isCloudOrDCT4) === 'true'
  },
  mounted () {
    this.maxRefreshTimes = 0
    this.getChannelsList()// 获取规则、通道、预置点的数据
    let parentWidth = document.getElementById('drawTools').offsetWidth
    let parentHeight = document.getElementById('drawTools').offsetHeight
    if (parentWidth / parentHeight > 960 / 576) {
      this.drawToolsH = parentHeight - 30
      this.drawToolsW = Math.round(this.drawToolsH * 960 / 576)
    } else {
      this.drawToolsW = parentWidth * 1
      this.drawToolsH = Math.round(this.drawToolsW * 576 / 960)
    }
    window.onresize = () => {
      this.$refs.drawTools.getDrawInfo().then(res => {
        let parentWidth = document.getElementById('drawTools').offsetWidth
        let parentHeight = document.getElementById('drawTools').offsetHeight
        let value = res || []
        let polygon = []
        let drawToolsW = 0
        let drawToolsH = 0
        let valueHandle = value.map((item, index) => {
          polygon[index] = {}
          polygon[index].x = (item[0] / this.drawToolsW).toFixed(4)
          polygon[index].y = (item[1] / this.drawToolsH).toFixed(4)
        })
        if (parentWidth / parentHeight > 960 / 576) {
          drawToolsH = document.getElementById('drawTools').offsetHeight - 30
          drawToolsW = Math.round(drawToolsH * 960 / 576)
        } else {
          drawToolsW = parentWidth * 1
          drawToolsH = Math.round(drawToolsW * 576 / 960)
        }
        polygon.forEach((item, index) => {
          valueHandle[index] = []
          valueHandle[index][0] = item.x * drawToolsW
          valueHandle[index][1] = item.y * drawToolsH
        })
        this.drawToolsW = drawToolsW
        this.drawToolsH = drawToolsH
        this.rulesDrawData.polygonValue = valueHandle
      })
    }
  },
  methods: {
    handleSearchClick () {
      this.currentRulesIndex = 0
      this.currentCloudIndex = 0
      this.currentChannelIndex = 0
      this.refreshDrawImgFlag = false
      this.imgUrl = ''
      this.rulesDrawData.polygonType = 0
      this.rulesDrawData.polygonValue = []
      this.rulesDrawData.polygonRuleId = ''
      this.getChannelsList()
    },
    clearSearch () {},
    async currentPolygonIsNotSaveTip () {
      await this.getPolygonData()// 获取绘制区域坐标
      this.preEditIsSave = this.judgeDrawInfoChange(this.prePointsString, this.rulesDrawData.polygon)
      if (!this.preEditIsSave) { // 上条编辑的没有保存，提示用户
        this.$msgbox({
          title: ``,
          message: `当前绘制区域未保存。`,
          confirmButtonText: '知道了',
          type: 'question'
        }).then(() => {}).catch(() => {})
      }
    },
    async publishPolygonRules () {
      await this.currentPolygonIsNotSaveTip()
      this.$confirm('下发后刷新页面获取下发状态。请确认是否下发规则区域/线?', {
        confirmButtonText: '下发',
        cancelButtonText: '取消',
        type: 'question'
      }).then(() => {
        publishPolygonRules({ taskId: this.taskId }).then(res => {
          if (+res.code === 0) {
            this.$message.success('开始下发')
            this.$router.push({
              name: 'inspectionConfig',
              params: { serviceType: this.serviceType }
            })
          }
        })
      }).catch(() => {})
    },
    // 异步抓图，先请求抓图接口
    getNewPic () {
      getNewPic({ taskId: this.taskId, ruleId: this.rulesDrawData.polygonRuleId }).then(res => {
        if (res.code === 0) {
          // this.refreshDrawImgFlag = true
          // this.$message.info('开始抓图，请稍后...')
          this.returnNewPic()
          setTimeout(() => {
            if (this.refreshDrawImgFlag) {
              this.$message.info('开始抓图，请稍后...')
            }
          }, 1000)
        }
      })
    },
    // 异步抓图，再定时器请求获取接口
    returnNewPic () {
      this.refreshDrawImgFlag = true
      this.maxRefreshTimes++
      returnNewPic({ taskId: this.taskId, ruleId: this.rulesDrawData.polygonRuleId }).then(res => {
        if (+res.code === 0) {
          if (res.data.failCode === 'success') {
            this.refreshDrawImgFlag = false
            this.$refs.drawTools.getDrawInfo().then(drawres => { // 将默认图上的绘制信息赋给新图
              this.rulesDrawData.polygonValue = drawres
              this.imgUrl = res.data.imgUrl
            })
          }
          if (res.data.failCode === 'fail') {
            this.refreshDrawImgFlag = false
            this.$message.error('抓图失败，请重试。')
            this.imgUrl = failImg
          }
          if (res.data.failCode === 'process' && this.maxRefreshTimes < 30) {
            this.imgUrl = refreshImg
            this.refreshDrawImgInterval = setTimeout(() => {
              this.returnNewPic()
            }, 2000)
          }
        /* let data = res.data
          if (data.indexOf('http') > -1 || data.indexOf('https') > -1) {
            this.refreshDrawImgFlag = false
            this.$refs.drawTools.getDrawInfo().then(drawres => { // 将默认图上的绘制信息赋给新图
              this.rulesDrawData.polygonValue = drawres
              this.imgUrl = data
            })
          } else {
            if (this.refreshDrawImgFlag && this.maxRefreshTimes < 30) {
              this.refreshDrawImgInterval = setTimeout(() => {
                this.returnNewPic()
              }, 2000)
            } else {
              clearInterval(this.refreshDrawImgInterval)
              this.$message.error('抓图失败，请重试。')
              this.refreshDrawImgInterval = null
            }
          } */
        }
      })
    },
    // 保存并下发绘制区域
    async saveDrawImg (flag, item, index) {
      await this.getCurrentPolygonInfo()
      this.rulesDrawData.polygon.forEach(item => { // 处理坐标点是负数导致设备下发失败的问题
        item.x = +item.x < 0 ? '0.0000' : item.x
        item.y = +item.y < 0 ? '0.0000' : item.y
      })
      if (this.saveValid) {
        await saveDrawImg({ polygonRuleId: this.rulesDrawData.polygonRuleId, polygon: this.rulesDrawData.polygon, taskId: this.taskId, polygonType: this.rulesDrawData.polygonType }).then(res => {
          if (+res.code === 0) {
            this.$message.success('保存成功！')
            this.preEditIsSave = true
            this.getChannelsList()
            if (flag) {
              this.getRulesDrawData(item, index)
            }
          }
        })
      }
    },
    async getCurrentPolygonInfo () {
      // 先获取目前绘制区域的坐标点数据和绘制类型
      // this.drawType = this.$refs.drawTools.cbGetDrawType()
      await this.$refs.drawTools.getDrawInfo().then(res => {
        this.saveValid = true
        this.rulesDrawData.polygonValue = res || []
        // 计算检测区域是否存在钝角的情况
        // if (this.checkHasObtuseAngle()) {
        //   this.$message({ type: 'warning', message: '检测区域不支持内三角' })
        //   return
        // }
        if (this.rulesDrawData.polygonValue && this.rulesDrawData.polygonValue.length === 0) { // 是否绘制区域
          this.$message.warning('请绘制区域！')
          this.saveValid = false
          return false
        }
        if (this.rulesDrawData.polygonValue && this.rulesDrawData.polygonValue.length > 3) { // 判断多边形是否交叉，三条边以下不需要判断
          let flag = this.checkLine(this.rulesDrawData.polygonValue)
          if (!flag) {
            this.$message.warning('绘制区域不允许交叉，请重新绘制。')
            this.saveValid = false
            return false
          }
        }
        this.rulesDrawData.polygon = []
        this.rulesDrawData.polygonValue.map((item, index) => {
          this.rulesDrawData.polygon[index] = {}
          this.rulesDrawData.polygon[index].x = (item[0] / this.drawToolsW).toFixed(4)
          this.rulesDrawData.polygon[index].y = (item[1] / this.drawToolsH).toFixed(4)
        })
        this.rulesDrawData.polygonType = res.polygonType
      })
    },
    // 仅获取目前绘制区域的坐标小数点数据
    async getPolygonData () {
      await this.$refs.drawTools.getDrawInfo().then(res => {
        this.rulesDrawData.polygonValue = res || []
        this.rulesDrawData.polygon = []
        this.rulesDrawData.polygonValue.map((item, index) => {
          this.rulesDrawData.polygon[index] = {}
          this.rulesDrawData.polygon[index].x = (item[0] / this.drawToolsW).toFixed(4)
          this.rulesDrawData.polygon[index].y = (item[1] / this.drawToolsH).toFixed(4)
        })
      })
    },
    copyDraw () {
      this.showAreaTreeFlag = true
      this.getCopyChannelTree()
    },
    closeCopyDrawDialog () {
      this.showAreaTreeFlag = false
    },
    getCopyChannelTree () {
      polygonRules({ taskId: this.taskId }).then((res) => {
        if (res.code === 0) {
          let data = res.data.rows.filter(item => { return item.polygonType === this.rulesDrawData.polygonType })
          let copyTree = [{ 'id': '0000000000', 'name': '全部', 'type': 0, 'subNodes': [], forbidden: true }]
          if (!this.isCloudOrDCT4) { // 设备端的树
            let noCloudData = []
            for (var x = 0; x < data.length; x++) {
              let existIndex = noCloudData.map(item => { return item.taskRuleId }).indexOf(data[x].taskRuleId)
              if (existIndex > -1) {
                noCloudData[existIndex].channelList.push(data[x])
              } else {
                noCloudData.push({
                  taskRuleName: data[x].taskRuleName,
                  taskRuleId: data[x].taskRuleId,
                  forbidden: true,
                  channelList: [data[x]]
                })
              }
            }
            copyTree[0].subNodes = noCloudData.map(item => {
              item.name = item.taskRuleName
              item.id = item.taskRuleId
              item.type = 1
              item.subNodes = item.channelList.map(val => {
                val.name = val.channelName
                val.id = val.polygonRuleId
                val.type = 2
                return val
              })
              return item
            })
          } else { // 云端的树
            let dataCloud = data.map(item => {
              item.name = item.isPreset ? (item.channelName + ' - ' + item.presetName) : item.channelName
              return item
            })
            copyTree[0].subNodes = dataCloud.map(item => {
              item.id = item.polygonRuleId
              item.type = 2
              return item
            })
          }
          this.copyChannelTreeData = copyTree
        }
      })
    },
    changeSelectNode (val, selNodes) {
      this.selectTreeNodes = selNodes.checkedNodes
    },
    // 过滤区域树
    filterArea (value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    async copyPolygon () {
      let data = []
      this.selectTreeNodes.map(item => {
        if (item.type === 2) {
          data.push(item.id)
        }
      })
      await this.getCurrentPolygonInfo()// 获取绘制区域参数
      if (this.saveValid) {
        let params = {}
        params.polygon = this.rulesDrawData.polygon
        params.polygonRuleIds = data
        params.taskId = this.taskId
        copyPolygon(params).then(res => {
          if (+res.code === 0) {
            this.$message.success('复制成功！')
            this.getChannelsList()
            this.closeCopyDrawDialog()
          }
        })
      }
    },
    getChannelsList () {
      let params = {}
      if (this.contentType === '1') {
        params.channelName = this.nameLike
        params.groupName = ''
      } else {
        params.groupName = this.nameLike
        params.channelName = ''
      }
      params.taskId = this.taskId
      polygonRules(params).then((res) => {
        if (res.code === 0) {
        // isPublished:1下发成功，2未下发，3下发失败
          let data = res.data.rows || []
          if (this.isCloudOrDCT4) { // 云端，无规则，有预置点
            this.cloudList = []
            this.cloudList = data.map(item => {
              item.name = item.isPreset ? (item.channelName + ' - ' + item.presetName) : item.channelName
              return item
            })
            if (this.cloudList.length > 0) {
              this.getRulesDrawData(this.cloudList[this.currentCloudIndex], this.currentCloudIndex)// 画图的相关信息展示
            }
          } else { // 非云，设备端，无预置点
            let handleData = []
            for (var x = 0; x < data.length; x++) {
              let existIndex = handleData.map(item => { return item.taskRuleId }).indexOf(data[x].taskRuleId)
              if (existIndex > -1) {
                handleData[existIndex].channelList.push(data[x])
              } else {
                handleData.push({
                  taskRuleName: data[x].taskRuleName,
                  taskRuleId: data[x].taskRuleId,
                  channelList: [data[x]]
                })
              }
            }
            handleData && handleData.forEach(item => { // data的结构：rulesName/规则层 => channelList/通道层：都在左侧
              item.isShow = false
              item.channelList && item.channelList.forEach(citem => { citem.currentDraw = false })
            })
            this.noCloudList = handleData
            if (this.noCloudList.length > 0) {
              this.noCloudList[this.currentRulesIndex].isShow = true// 当前展示的通道/预置点对应的规则
              this.getRulesDrawData(this.noCloudList[this.currentRulesIndex].channelList[this.currentChannelIndex])// 画图的相关信息展示
              this.showHighlightChannelItem(this.currentRulesIndex, this.currentChannelIndex)
            }
          }
        }
      })
    },
    // 获取当前编辑的图片的相关信息
    getRulesDrawData (data, index) { // data为当前正在编辑的通道信息
      this.currentCloudIndex = this.isCloudOrDCT4 ? index : 0
      let params = {}
      params.taskId = data.taskId
      params.ruleId = data.polygonRuleId
      getCurrentDrawInfo(params).then((res) => {
        if (res.code === 0) {
          let info = res.data
          this.rulesDrawData = {}
          this.rulesDrawData.polygonRuleId = info.polygonRuleId
          this.rulesDrawData.taskId = info.taskId
          this.rulesDrawData.polygonType = info.polygonType
          this.rulesDrawData.supportPolygonType = info.supportPolygonType

          if (!info.isEdited) {
            if (info.polygonType === 2 || info.polygonType === 3) {
              info.polygon = [{ 'x': '0.0050', 'y': '0.0050' }, { 'x': '0.9950', 'y': '0.0050' }, { 'x': '0.9950', 'y': '0.9900' }, { 'x': '0.0050', 'y': '0.9900' }]
            } else if (info.polygonType === 4) {
              info.polygon = [{ x: '0.5000', y: '0.0050' }, { x: '0.5000', y: '0.9900' }]
            }
          }
          this.rulesDrawData.polygonValue = []
          info.polygon.forEach((item, index) => { // 接收坐标点数组[[],[]...]换成对象[{},{}...]
            this.rulesDrawData.polygonValue[index] = []
            this.rulesDrawData.polygonValue[index][0] = item.x * this.drawToolsW
            this.rulesDrawData.polygonValue[index][1] = item.y * this.drawToolsH
          })
          this.prePointsString = JSON.parse(JSON.stringify(info.polygon))
          this.hasImg = info.hasImg
          this.imgUrl = this.hasImg ? info.imgUrl : ''
        }
      })
    },
    // 高亮显示当前展示的通道
    showHighlightChannelItem (index, cindex) {
      this.noCloudList.forEach(item => {
        item.channelList.forEach(chanItem => { chanItem.currentDraw = false })
      })
      this.noCloudList[index].channelList[cindex].currentDraw = true// 高亮显示
    },
    // 展开和收缩规则
    showOrHideRules (item, index) {
      item.isShow = !item.isShow
      // this.noCloudList.forEach(val => {
      //   val.isShow = false
      // })
      // this.noCloudList[index].isShow = true
    },
    // 云端切换展示当前选中通道/预置点的图片相关信息，先判断是否保存过上次编辑
    async showCloudDrawsInfo (item, index) {
      await this.getPolygonData()// 获取绘制区域坐标
      this.preEditIsSave = this.judgeDrawInfoChange(this.prePointsString, this.rulesDrawData.polygon)
      if (!this.preEditIsSave) { // 上条编辑的没有保存，二次提示用户是否切换
        this.$confirm('未保存的绘制区域/线将不生效。是否保存绘制？', {
          confirmButtonText: '保存',
          cancelButtonText: '不保存',
          type: 'question'
        }).then(() => {
          this.refreshDrawImgFlag = false
          // 走save方法
          this.saveDrawImg(true, item, index)// 其他都是false，传true表示是这里保存以后再执行切换
        }).catch(() => {
          this.refreshDrawImgFlag = false
          this.preEditIsSave = true
          this.getRulesDrawData(item, index)
        })
      } else {
        this.refreshDrawImgFlag = false
        this.getRulesDrawData(item, index)
      }
    },
    // 设备端切换展示当前选中通道的图片相关信息，先判断是否保存过上次编辑
    async showDrawsInfo (citem, cindex, index) {
      await this.getPolygonData()// 获取绘制区域坐标
      this.preEditIsSave = this.judgeDrawInfoChange(this.prePointsString, this.rulesDrawData.polygon)
      if (!this.preEditIsSave) { // 上条编辑的没有保存，二次提示用户是否切换
        this.$confirm('未保存的绘制区域/线将不生效。是否保存绘制？', {
          confirmButtonText: '保存',
          cancelButtonText: '不保存',
          type: 'question'
        }).then(() => {
          this.refreshDrawImgFlag = false
          // 走save方法
          this.saveDrawImg()
        }).catch(() => {
          this.refreshDrawImgFlag = false
          this.preEditIsSave = true
          this.showInfo(citem, cindex, index)
        })
      } else {
        this.refreshDrawImgFlag = false
        this.showInfo(citem, cindex, index)
      }
    },
    judgeDrawInfoChange (oldVal, newVal) {
      let index = 0
      let oldValArr = Array.isArray(oldVal) && JSON.parse(JSON.stringify(oldVal.map(item => { return JSON.stringify(item) })))
      let newValArr = Array.isArray(newVal) && newVal.map(item => {
        return JSON.stringify(item)
      })
      for (let i = 0; i < oldValArr.length; i++) {
        for (let j = 0; j < newValArr.length; j++) {
          if (oldValArr[i] === newValArr[j]) {
            index++
            break
          } else {
            continue
          }
        }
      }
      if (index !== newValArr.length) {
        return false
      } else {
        return true
      }
    },
    // 设备端展示当前选中通道的相关信息
    showInfo (citem, cindex, index) {
      this.getRulesDrawData(citem)
      this.currentRulesIndex = index// 当前选中的规则index
      this.currentChannelIndex = cindex// 当前选中的通道在其规则内的index
      this.showHighlightChannelItem(index, cindex)
    },
    backConfirm () {
      this.$confirm('是否退出绘制？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'question'
      }).then(() => {
        this.back()
      }).catch(() => {})
    },
    back () {
      this.$router.push({
        name: 'inspectionConfig',
        params: { serviceType: this.serviceType }
      })
    },
    intersectLineLine (a1, a2, b1, b2) { // 判断线条是否交叉
      let uatt = (b2[0] - b1[0]) * (a1[1] - b1[1]) - (b2[1] - b1[1]) * (a1[0] - b1[0])
      let ubtt = (a2[0] - a1[0]) * (a1[1] - b1[1]) - (a2[1] - a1[1]) * (a1[0] - b1[0])
      let utb = (b2[1] - b1[1]) * (a2[0] - a1[0]) - (b2[0] - b1[0]) * (a2[1] - a1[1])

      if (utb !== 0) {
        let ua = uatt / utb
        let ub = ubtt / utb

        if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
          return true
        }
        return false
      }

      if (uatt === 0 || ubtt === 0) {
        return true
      }
      return false
    },
    checkLine (points, bOpened) { // 判断线条是否交叉
      var iLength = points.length
      if (iLength < 4) {
        return true
      }
      for (var i = 2; i < iLength; i++) {
        for (var j = 0; j <= i - 2; j++) {
          if (i === iLength - 1 && j === 0) {
            continue
          }
          if (bOpened && typeof points[i + 1] !== 'object') {
            continue
          }
          if (this.intersectLineLine(points[i], typeof points[i + 1] === 'object' ? points[i + 1] : points[0], points[j], points[j + 1])) {
            return false
          }
        }
      }
      return true
    }
  },
  beforeDestroy () {
    if (this.refreshDrawImgInterval) {
      clearInterval(this.refreshDrawImgInterval) // 在Vue实例销毁前，清除定时器
      this.refreshDrawImgInterval = null
    }
    window.onresize = null
  }
}

</script>
<style lang="scss">
.drawTreeDialog{
  .tree-wrap{
    .is-disabled{
      width: 0px!important;
    }
  }
}
.draw_rules_area{
  .draw_alone_btns_wrap{
    .el-button--mini{
      // padding: 5px 8px;
    }
  }
  .drawTreeDialog{
    .el-dialog__body-wrapper{
      padding-bottom: 0
    }
    .tree-wrap{
      height: 470px;
      text-align:left;
      margin-top:10px
    }
  }
  .el-tree-node__content{
    box-sizing: border-box;
  }
  .draw_mini_btn{
    color:white;
    &:hover{
      color: #2080f7;
      background: rgba(255,255,255,0.08);
      text-decoration: none;
    }
  }
  .draw_mini_btn_rewidth{
    padding-left:10px;
    padding-right:10px
  }
  .page-head{
    .el-breadcrumb{
      display: flex;
      align-items: center;
      .breadcrumb_item1{
        display: flex;
        align-items: center;
        .el-breadcrumb__item__inner{
          display: flex;
          align-items: center;
          i{
            padding-right: 10px;
            font-size: 18px;
          }
        }
      }
      .breadcrumb_item2{
        display: flex;
        align-items: center;
      }
    }
  }
  .draw_rules_left {
    height: calc(100% + 15px);
  }
  .content_left{
    .el-scrollbar{
      height: calc(100% - 80px);
      margin-top:10px
    }
    .el-demo2-scrollbar__view{
      height: 100%;
    }
  }
  .content_type{
    width:80px;
    input{
      font-size: 14px;
      color: rgba(0,0,0,0.70)!important;
    }
  }
}

</style>
<style lang="scss" scoped>
  @import './style';
</style>
