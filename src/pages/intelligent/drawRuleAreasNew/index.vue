<template>
  <div class="draw_area">
    <div class="self_breadcrumb_head">
      <div class="head_left">
        <i class="h-icon-arrow_left back_icon" @click="backConfirm"></i>
        <div class="split"></div>
        <div>区域绘制</div>
        <div class="task_name">({{ taskName }})</div>
      </div>
      <div class="head_right">
        <!-- <el-button type="default" icon="h-icon-save" style="border:1px solid #ccc">保存</el-button> -->
      </div>
    </div>
    <div class="wrap">
      <resizeBox ref="resizeBox" :defaultW="280" :minW="280" :maxW="620" @widthChanged="changeResizeBox">
        <div class="left_wrap">
          <div class="left_title">通道列表</div>
          <div class="search1">
            <AreaTreeSelect needStore @onSelect='getClickDataForSearch' style="width:calc(100% - 18px)"></AreaTreeSelect>
          </div>
          <div class="search2" style="margin-right: 22px;">
            <el-input v-model="leftSearchParmas.channelNameLike" placeholder="请输入通道名称" style="width:calc(100% - 115px)" clearable :clear-icon-click="changeSearch" class="channel_input"></el-input>
            <el-select v-model="leftSearchParmas.chooseRuleId" filterable @change="changeSearch" style="width: 105px;">
              <el-option v-for="(item,index) in rulesList" :key="index" :label="item.ruleName" :value="item.ruleId"></el-option>
            </el-select>
          </div>
          <div class="search2">
            <el-radio-group v-model="leftSearchParmas.areaDrawType" class="search_radio_wrap" type="simple" @change="changeSearch" style="width: 200px;">
              <el-radio-button label="ALL">全部</el-radio-button>
              <el-radio-button label="DRAWED">已绘制</el-radio-button>
              <el-radio-button label="NOT_DRAW">未绘制</el-radio-button>
            </el-radio-group>
            <mutliSelect ref="mutliSelect" v-model="roleIds" class="mutli_select_position"
              :showSearchInput="false" :data-list="selectParamList" :has-all-select="true" :needIndeterminate="false" :showInputTags="false" @emitDropdownVal="emitDropdownVal">
            </mutliSelect>
          </div>
          <div class="search3">
            <div>批量操作</div>
            <el-button type="link" @click="batchOperateBtn" style="font-size: 12px;">{{batchOperateText}}</el-button>
          </div>
          <el-scrollbar wrap-class="demo-scrollbar-wrap-left" v-loading="loading">
            <div :class="{'left_card':true,'active_card':currentLeftIndex===index}" v-for="(item,index) in leftList" :key="index" v-show="leftList.length" 
            @click="beforeChangeLeftCard(item,index,true)">
              <div class="yuzhidian_tag" v-show="item.presetId">预</div>
              <div class="l_part" :style="{'background': item.iconBg}">{{item.iconName}}</div>
              <div class="r_part">
                <div class="r_name ellipsis" :title="item.name">{{item.name}}</div>
                <!-- <div class="r_foot"><div>所属</div><div class="split"></div><div>{{item.groupName}}</div></div> r_foot样式调整，两边去掉,r_f_left删除样式，下面的el-button整个删除-->
                <div class="r_foot">
                  <div class="r_f_left"><div>所属</div><div class="split"></div><div class="r_f_left_name ellipsis" :title="item.groupName">{{item.groupName}}</div></div>
                  <el-button type="link" @click.stop="singleOperateBtn(item,index,true)" style="font-size: 12px;width:80px;" class="ellipsis">{{ item.connectAreaLabelNames }}</el-button>
                </div>
              </div>
            </div>
            <div v-show="!leftList.length" style="padding-top:24px;text-align: center;color: #ccc;">暂无数据</div>
          </el-scrollbar>
          <div class="search4">
            <el-pagination small @current-change="handleCurrentChange" layout="prev, miniPager, next" :total="total" :page-size="leftSearchParmas.pageSize"></el-pagination>
            <div>共{{ total }}条</div>
          </div>
        </div>
      </resizeBox>
      <div class="middle_wrap" ref="middlePart">
        <!-- <calibrate ref="calibrate" height="calc(100vh - 175px)" @getNewPic="getNewPic" @saveCalibrate="saveCalibrate" :picStatusText="picStatusText" :picStatus="picStatus" @noticeSetDrawStepInfo="noticeSetDrawStepInfo" -->
        <calibrate ref="calibrate" height="calc(100vh - 213px)" @getNewPic="getNewPic" @saveCalibrate="saveCalibrate" :picStatusText="picStatusText" :picStatus="picStatus" @noticeSetDrawStepInfo="noticeSetDrawStepInfo"
          @chooseFocusDom="chooseFocusDom" @cleanRightListChecked="cleanRightListChecked" @afterDraw="afterDraw" @saveToConnect="saveToConnect" @drawFront="drawFront" @drawBack="drawBack" @replaceImage="replaceImage"
          :drawBackBtnDisabled="drawBackBtnDisabled" :drawFrontBtnDisabled="drawFrontBtnDisabled"
          :showConnectSave="true" :calibrateBtnDisabled="calibrateBtnDisabled || !leftList.length">
          <div slot="foot" class="foot_btn_wrap">
            <el-button @click="changImage('prev')" :disabled="leftSearchParmas.pageNo===1&&currentLeftIndex===0">上一张</el-button>
            <el-button @click="changImage('next')" style="margin-left:16px" :disabled="(leftSearchParmas.pageNo===totalPage)&&(currentLeftIndex===leftList.length-1)">下一张</el-button>
          </div>
        </calibrate>
      </div>
      <div class="right_wrap">
        <div class="right_title">区域标签</div>
        <div class="search">
          <el-input v-model="rightSearchName" placeholder="请输入标签名称" style="width: 215px;" suffix-icon="h-icon-search" clearable
          :on-icon-click="handleIconClick" :clear-icon-click="clearIconClick"></el-input>
          <el-button type="default" icon="h-icon-add" style="border:1px solid #ccc;" @click="addLabelClass()"></el-button>
        </div>
        <div>
          <el-scrollbar wrap-class="demo-scrollbar-wrap-2" style="margin-top:12px;">
            <div v-show="!rightList.length" style="margin-top:24px;text-align: center;color: #ccc;">暂无数据</div>
            <div v-show="rightList.length" v-for="(item,index) in rightList" :key="index" class="right_list_card" @click.stop="clickLabelClassItem(item)"
                @mouseover.stop="item.showBtnFlag=true" @mouseout.stop="()=>{item.showBtnFlag=false}">
            <!-- <div v-show="rightList.length" v-for="(item,index) in rightList" :key="index" class="right_list_card"> -->
              <div v-show="!item.editFlag" class="card_title_wrap" :class="{'active_click_label': item.activeFlag}">
                <div class="card_title_left"  @click="()=>{item.showChildData=!item.showChildData}">
                  <div :class="{'rotate_icon':!item.showChildData}" class="icon iconfont icondown" style="font-size:14px;margin-right: 3px;margin-top: 2px;"></div>
                  <div class="class_name ellipsis" :title="item.labelClassName">{{item.labelClassName}}</div>
                </div>
                <div class="card_title_right">
                  <div class="h-icon-add_sm more_btn right_btn" @click="addLabelLabel(item, true)" v-show="item.showBtnFlag"></div>
                  <div class="h-icon-edit label_more_btn" @click="editClassLabel(item, index)" v-show="item.showBtnFlag"></div>
                  <div class="h-icon-delete label_more_btn" @click="deleteClassLabel(item, index)" v-show="item.showBtnFlag"></div>
                  <!-- <div class="h-icon-add_sm more_btn right_btn" @click="addLabelLabel(item, true)"></div>
                  <el-dropdown placement="bottom-end" @command='commandRightHeadBtn' >
                    <div class="h-icon-more_hori_sm more_btn"></div>
                    <el-dropdown-menu slot="dropdown" class="draw_dropdown">
                      <el-dropdown-item class="single_dropitem" v-for="(drop,dindex) in operateBtns" :command="{...drop, 'index':index}">
                        <i :class="[drop.icon]"></i>
                        {{drop.name}}
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown> -->
                </div>
              </div>
              <div v-show="item.editFlag" class="first_main_item edit_main_item">
                <input v-model="item.editText" class="edit_input" style="width:180px" :maxlength="16"></input>
                <span class="btn_span" style="margin-left:12px" @click="editLabelClassText(item)">确定</span>
                <span class="btn_span" style="margin-left:4px" @click="cancelRightEditBtn(item)">取消</span>
              </div>
              <div class="main_wrap" v-for="(citem,cindex) in item.labelList" :key="cindex" v-show="item.showChildData" @click.stop="clickLabelItem(citem)"
                @mouseover.stop="()=>{citem.showBtnFlag=true}" @mouseout.stop="()=>{citem.showBtnFlag=false}">
                <div class="main_item" v-show="!citem.editFlag">
                  <div class="color_wrap" :style="{'background':citem.color }"></div>
                  <div class="style_cross_line"></div>
                  <div class="for_hover" :class="{'active_click_label': citem.shortcutFlag}">
                    <div @click.prevent="changeTagChecked(cindex,index,citem)" class="main_item_has_check_wrap">
                      <el-radio  v-model="citem.isChecked" :disabled="!rightListCanOperateFlag" :label="true">{{''}}</el-radio>
                      <!-- <el-checkbox  v-model="citem.isChecked" :disabled="!rightListCanOperateFlag"></el-checkbox> -->
                      <div :style="{'background':inferTagBgcolor(citem.labelType)}" class="tag">{{inferTagName(citem.labelType)}}</div>
                      <div class="text" :title="citem.labelName">{{citem.labelName}}</div>
                    </div>
                    <!-- <el-popover width="240" trigger="click" @show="shortcutShow(citem)" @hide="shortcutHide(citem)">
                      <shortcut @closeShortcut="closeShortcut" @confirmShortcut="confirmShortcut" :currentLabelItem="currentLabelItem"></shortcut>
                      <div slot="reference" class="icon iconfont iconkjj1 label_more_btn" title="快捷键"
                        v-show="citem.showBtnFlag||citem.shortcutFlag" style="font-size:18px;margin-right:2px"></div>
                    </el-popover> -->
                    <div class="h-icon-edit label_more_btn" @click="editLabel(citem, cindex, index)" v-show="citem.showBtnFlag||citem.shortcutFlag"></div>
                    <div class="h-icon-delete label_more_btn" @click="deleteLabel(citem, cindex, index)" v-show="citem.showBtnFlag||citem.shortcutFlag"></div>
                    <!-- <el-dropdown placement="bottom-end" @command='commandRightBtn' >
                      <div class="h-icon-more_hori_sm more_btn"></div>
                      <el-dropdown-menu slot="dropdown" class="draw_dropdown">
                        <el-dropdown-item class="single_dropitem" v-for="(drop,dindex) in operateBtns" :command="{...drop, 'cindex':cindex,'index':index}">
                          <i :class="[drop.icon]"></i>
                          {{drop.name}}
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown> -->
                  </div>
                </div>
                <div class="main_item edit_main_item" v-show="citem.editFlag">
                   <input v-model="citem.editText" class="edit_input" :maxlength="16"></input>
                   <span class="btn_span" style="margin-left:12px" @click="editLabelText(citem)">确定</span>
                   <span class="btn_span" style="margin-left:4px" @click="cancelRightEditBtn(citem)">取消</span>
                </div>
              </div>
            </div>
          </el-scrollbar>
        </div>
      </div>
    </div>
    <labelClassModal :visible.sync="labelClassVisible" @setLabelClassFinish="setLabelClassFinish"></labelClassModal>
    <labelModal ref="labelModal" :visible.sync="labelVisible" @setLabelFinish="setLabelFinish"></labelModal>
    <batchOperateModal :visible.sync="batchOperateVisible" @batchFinish="batchFinish" :ruleSearchMultiLabelSelect="ruleSearchMultiLabelSelect" :ruleId="leftSearchParmas.chooseRuleId"></batchOperateModal>
    <singleOperateModal :visible.sync="singleOperateVisible" @singleFinish="singleFinish" :currentLeftItem="currentLeftItem" :ruleSearchMultiLabelSelect="ruleSearchMultiLabelSelect" 
      :ruleId="leftSearchParmas.chooseRuleId"></singleOperateModal>
  </div>
</template>
<script>
import resizeBox from '@/components/resizeBox'
import _ from 'lodash'
import mutliSelect from '@/components/mutliSelect/mutliSelect.vue'
import labelClassModal from './modal/labelClassModal'
import labelModal from './modal/labelModal'
import batchOperateModal from './modal/batchOperateModal'
import singleOperateModal from './modal/singleOperateModal'
import shortcut from './modal/shortcut'
import AreaTreeSelect from '@/components/areaTreeSelect/areaTreeSelect'
import calibrate from '@/components/calibrate'
import { getSelectDropdownParamList, getLabelList, modifyLabel, modifyLabelClass, deleteLabel, deleteLabelClass, modifyArea, getAreaPicSatus, getNewDrawRulePic, 
  getLeftChannelListList, getArea, getRulesListByTaskId, saveToConnect, batchConnect, singleConnect, getConnectStatus } from '../proxy'
export default {
  components: {
    mutliSelect, labelClassModal, labelModal, AreaTreeSelect, calibrate, batchOperateModal, singleOperateModal, shortcut, resizeBox
  },
  props: {
  },
  data () {
    return {
      rulesList: [],
      total: 0,
      totalPage: 0,
      loading: false,
      leftSearchParmas: {
        taskId: this.$route.params.taskId,
        orgId: '',
        orgType: '',
        parentId: '',
        pageSize: 20,
        pageNo: 1,
        areaDrawType: 'ALL',
        chooseRuleId: '',
        channelNameLike: '',
        selectParam: []
      },
      maxRefreshTimes: 0, // 最多可以定时器请求抓图的次数，超过4次（20s）就停掉
      refreshDrawImgInterval: null, // 定时请求当前通道/预置点抓图的接口
      refreshBatchOperateInterval: null, // 定时请求当批量操作状态的接口
      leftList: [],
      rightSearchName: '',
      roleIds: [],
      selectParamList: [],
      rightList:[],
      searchValues: [],
      currentLeftIndex: 0,
      currentLeftItem: {},
      labelClassVisible: false,
      labelVisible: false,
      batchOperateVisible: false,
      singleOperateVisible: false,
      calibrateBtnDisabled: false,
      drawBackBtnDisabled: false,
      drawFrontBtnDisabled: false,
      picStatusText: '',
      picStatus: 'SUCESS',
      replaceImgUrl: '',
      rightListCanOperateFlag: false, // 右侧标签区域是否能进行一些操作，如选中
      focusDom: {}, // 画布上选中的绘制框的信息
      drawStepIndex: 0, // 标识当前前进或后退对应的数据序号
      drawStepFullData: [], //全量的每一步操作数据数组
      batchOperateText: '关联标签',
      currentLabelItem: {}, // 当前右侧选中的标签
      labelSearchCalibrationType: '' // 当前绘制框的类型，POLYGON,BOTHWAY,ATOB,BTOA,SHIELD_AREA
    }
  },
  computed: {
    operateBtns() {
      return [{name: '编辑', icon: 'h-icon-edit'}, /* {name: '快捷键', icon: 'h-icon-plan'}, */ {name: '删除', icon: 'h-icon-delete'}]
    },
    taskName() {
      return this.$route.params.taskName || ''
    },
    ruleSearchMultiLabelSelect() { // 当前搜索条件的规则，对应批量/单个的关联标签里是多选还是单选
      let arr = this.rulesList.filter(item => item.ruleId === this.leftSearchParmas.chooseRuleId)
      return arr.length ? arr[0].multiLabelSelect : true
    }
  },
  watch: {
    roleIds(val) {
      let currentList = this.$refs.mutliSelect.getCurrentList()
      //业务特殊处理，母版的选中，联动子级的dropdown自动勾选“全部”的单选
      currentList.forEach(item => {
        if (item.id === 'labelConnect') {
          item.dropList[0].choose = val.includes('labelConnect')
        }
      })
      this.$refs.mutliSelect.initDropdownVal(currentList)
      this.leftSearchParmas.selectParam = currentList
      this.currentLeftIndex = 0
      this.getLeftList()
    },
    'leftSearchParmas.channelNameLike'() {
      this.currentLeftIndex = 0
      this.getLeftList()
    },
    singleOperateVisible(val) {
      let domArr = Array.from(document.getElementsByClassName('el-loading-mask'))
      if (domArr.length) {
        domArr.forEach(item => {
          item.style.backgroundColor = val ? 'rgba(0, 0, 0, 0)' : 'hsla(0, 0%, 100%, 0.9)'
        })
      }
    },
    labelSearchCalibrationType() { // 当前绘制框的类型改变了，重新请求右侧标签列表
      this.getLabelList()
    }
    // 'currentLeftItem.calibrationList': {//后续看是否优化
    //   handler(val) {
    //     this.rightListCanOperateFlag = val && val.length
    //   },
    //   immediate: true,
    //   deep: true
    // }
  },
  created () {
    this.clearRefreshDrawPic()
    this.clearRefreshBatchOperate()
    // this.$store.commit('setShowLeftMenu', false)
  },
  mounted () {
    this.getRulesList()
    this.getLabelList()
    this.getSelectDropdownParamList() // 获取搜索条件的下拉+dropdown数据
    this.getBatchOperateStatus() // 获取批量关联标签的状态
    let _this = this
    document.onkeydown = function (e) { // 键盘控制图片翻页
      let _key = window.event.keyCode
      if (_key === 37) {
        _this.changImage('prev')
      } else if (_key === 39) {
        _this.changImage('next')
      }
    }
  },
  methods: {
    changeResizeBox() {
      this.$nextTick(() => {
        let w = this.$refs.resizeBox.width
        this.$refs.middlePart.style = `width: calc(100% - ${w+30+288}px);`
      })
    },
    // 图片翻页
    async changImage (type) {
      if (type === 'prev') {
        if (this.leftSearchParmas.pageNo === 1 && this.currentLeftIndex === 0) {
          this.$message.info('已经是第一张图片了')
          return false
        }
        if (this.currentLeftIndex > 0) {
          this.currentLeftIndex--
          this.changeLeftCard(this.leftList[this.currentLeftIndex], this.currentLeftIndex, ()=>{})
        } else {
          // 获取前一页数据
          this.currentLeftIndex = this.leftSearchParmas.pageSize - 1
          this.leftSearchParmas.pageNo--
        }
      } else {
        if (this.leftSearchParmas.pageNo === this.totalPage && this.currentLeftIndex === this.leftList.length - 1) {
          this.$message.info('已经是最后一张图片了')
          return false
        }
        if (this.currentLeftIndex < this.leftList.length - 1) {
          this.currentLeftIndex++
          this.changeLeftCard(this.leftList[this.currentLeftIndex], this.currentLeftIndex, ()=>{})
        } else {
          // 获取后一页数据
          this.currentLeftIndex = 0
          this.leftSearchParmas.pageNo++
        }
      }
    },
    changeSearch() {
      this.currentLeftIndex = 0
      this.getLeftList()
    },
    getRulesList() { // 搜索条件的规则列表
      getRulesListByTaskId({taskId: this.leftSearchParmas.taskId}).then(res => {
        if (res.code === 0 && res.data && res.data.length) {
          this.rulesList = res.data
          this.leftSearchParmas.chooseRuleId = this.rulesList[0].ruleId
          this.currentLeftIndex = 0
          this.getLeftList()
        }
      })
    },
    emitDropdownVal (currentList) {
      this.leftSearchParmas.selectParam = currentList
      this.currentLeftIndex = 0
      this.getLeftList()
    },
    batchOperateBtn() {
      this.batchOperateVisible = true
    },
    /* 该方法记录操作的步骤数据，
    type：区分该步骤的类型，
    isFrontBack：是否点击了前进后退导致的数据改变，如果是，那么drawStepFullData数组不push数据，只做修改，否则增加一条新的操作数据 */
    async noticeSetDrawStepInfo(type, isFrontBack) {
      if (!isFrontBack) {
        this.drawStepIndex++
        let calibrations = await this.$refs.calibrate.getNewCalibrationList() // 获取当前的绘制画布里的信息
        this.drawStepFullData.splice(this.drawStepIndex,0,JSON.parse(JSON.stringify(calibrations)))
      }
      this.judgeDrawFrontOrBackBtnDisabled()
    },
    async drawFront() {
      this.drawStepIndex++
      await this.$refs.calibrate.setCalibrationList(this.drawStepFullData[this.drawStepIndex])
      await this.$refs.calibrate.afterCalibrationsStatusChange() // 设置右侧标签的选择
      this.$refs.calibrate.setIsFrontBack(false)
      this.judgeDrawFrontOrBackBtnDisabled()
    },
    async drawBack() {
      this.drawStepIndex--
      await this.$refs.calibrate.setCalibrationList(this.drawStepFullData[this.drawStepIndex])
      await this.$refs.calibrate.afterCalibrationsStatusChange() // 设置右侧标签的选择
      this.$refs.calibrate.setIsFrontBack(false)
      this.judgeDrawFrontOrBackBtnDisabled()
    },
    judgeDrawFrontOrBackBtnDisabled() { // 判断前进和后退按钮的禁用状态
      this.drawBackBtnDisabled = this.drawStepIndex === 0
      this.drawFrontBtnDisabled = this.drawStepIndex === (this.drawStepFullData.length - 1)
    },
    saveCalibrate(val) { // 其实就是私有区域的保存，所以标签关联不需要校验
      if (!val.length) {
        this.$message.warning('请进行绘制！')
        return false
      }
      if (this.currentLeftItem.connectType !== 'CONNECT' && val.length > 1) {
        this.$message.warning('私有区域仅能绘制一个绘制框！')
        return false
      }
      let saveParmas = this.setSaveParmas(val)
      modifyArea(saveParmas).then(res => { 
        if (res.code === 0) {
          this.$message.success("保存成功！")
          this.getLeftList()
        }
      })
    },
    setSaveParmas(val) {
      let calibrationList = []
      val.forEach(item => {
        delete item.scope['maskCoordinates']
        calibrationList.push({
          calibrationType: item.calibrationType,
          id: item.id,
          color: item.color ? item.color : item.style.shape.normal.borderColor,
          labelList: item.labelList.map(label => {
            return {
              labelId: label.labelId,
              text: label.text,
            }
          }),
          scope: item.scope,
        })
      })
      let saveParmas = {
        taskId: this.leftSearchParmas.taskId,
        id: this.currentLeftItem.id,
        calibrationList: calibrationList
      }
      return saveParmas
    },
    saveToConnect(val) { // 私有区域另存为母版
      let calibrationList = []
      if (!val.length) {
        this.$message.warning('请进行绘制！')
        return false
      }
      // let noConnetLabelsArr = val.filter(item => ['POLYGON', 'SHIELD_AREA'].includes(item.calibrationType) && (!item.labelList || item.labelList[0].labelId === '-1'))
      let noConnetLabelsArr = val.filter(item => !item.labelList || ['', '-1'].includes(item.labelList[0].labelId)) // ''表示删除标签，'-1'表示三种跨线特殊标签，初始赋值-1
      if (noConnetLabelsArr.length) {
        this.$message.warning('有绘制未关联右侧标签！')
        return false
      }
      val.forEach(item => {
        delete item.scope['maskCoordinates']
        calibrationList.push({
          calibrationType: item.calibrationType,
          id: item.id,
          color: item.color,
          labelList: item.labelList.map(label => {
            return {
              labelId: label.labelId,
              text: label.text,
            }
          }),
          scope: item.scope,
        })
      })
      let saveParmas = {
        taskId: this.leftSearchParmas.taskId,
        id: this.currentLeftItem.id,
        calibrationList: calibrationList
      }
      saveToConnect(saveParmas).then(res => {
        if (res.code === 0) {
          this.$message.success("保存成功！")
          this.$refs.calibrate.setDrawType('EDIT')
          this.rightListCanOperateFlag = false
          this.getLeftList()
        }
      })
    },
    afterDraw(calibrationType) {
      if (['POLYGON', 'SHIELD_AREA'].includes(calibrationType)) { // 多边形绘制完，提示关联右侧标签
        this.$message.warning("请及时关联右侧的标签！")
      }
      if (this.currentLeftItem.connectType === 'PRIVATE') {

      }
    },
    chooseFocusDom(focusDomArr) { // 绘制框选中事件
      if (!focusDomArr.length) { // 无选中绘制框，清空右侧标签的选择状态
        this.resetLabelList()
      } /* else if (['BOTHWAY', 'BTOA', 'ATOB'].includes(focusDomArr[0].calibrationType)) { // 特殊类型：双向、AToB,BToA，右侧标签不能选择
        this.rightListCanOperateFlag = false
        this.focusDom = {}
        this.cleanRightListChecked()
      }  */else {
        this.rightListCanOperateFlag = true
        this.labelSearchCalibrationType = focusDomArr[0].calibrationType
        this.focusDom = focusDomArr[0]
        this.setRightLabelChecked()
      }
    },
    cleanRightListChecked() { // 清空右侧的选中状态
      this.rightList.forEach(item => {
        item.labelList.forEach(child => {
          child.isChecked = false
        })
      })
    },
    setLabelClassFinish() {
      this.getLabelList()
    },
    setLabelFinish(isAdd, labelItem) {
      // 编辑，不调标签列表接口，否则选中状态没有了，直接改对应标签的值，名称、type、颜色
      if (!isAdd) {
        this.rightList.forEach(item => {
          item.labelList.forEach(label => {
            if (label.labelId === labelItem.labelId) {
              label.labelName = labelItem.labelName
              label.color = labelItem.color
            }
          })
        })
        this.updateCalibrationsTag(labelItem)
      } else {
        this.getLabelList()
      }
      this.getSelectDropdownParamList()
      this.resetFrontOrBackStatus()
    },
    async updateCalibrationsTag(labelItem) { // 编辑，可能涉及左侧绘制框的颜色或者文字，同步更新
      let calibrations = await this.$refs.calibrate.getNewCalibrationList() // 获取当前的绘制画布里的信息
      if (calibrations.length) {
        for (let i = 0; i < calibrations.length; i++) {
          if (calibrations[i].labelList && calibrations[i].labelList.length) {
            calibrations[i].labelList.forEach(label => {
              if (label.labelId === labelItem.labelId) {
                label.text = labelItem.labelName
                label.style = this.$refs.calibrate.getLabelColor(labelItem.color) //更新标注框颜色
                // 更新绘制框颜色
                if (calibrations[i]?.style?.shape) {
                  calibrations[i].style.shape = this.$refs.calibrate.getLabelFrameColor(labelItem.color).shape;
                } else {
                  calibrations[i].style = this.$refs.calibrate.getLabelFrameColor(labelItem.color)
                }
              }
            })
          }
        }
        await this.$refs.calibrate.setCalibrationList(calibrations)
      }
    },
    
    batchFinish(saveData) {
      saveData.connectAreaLabelIds = saveData.connectType === 'PRIVATE' ? [] : this.ruleSearchMultiLabelSelect ? saveData.connectAreaLabelIds : [saveData.connectAreaLabelIds] // 单选的话，数组里就一个id
      batchConnect({...this.leftSearchParmas, ...saveData}).then(res => {
        if (res.code === 0) {
          this.$message.success('操作成功！')
          this.batchOperateVisible = false
          this.getBatchOperateStatus() // 定时刷新批量操作的状态
        }
      })
    },
    singleFinish(saveData) {
      let parmas = {
        id: this.currentLeftItem.id,
        deviceId: this.currentLeftItem.deviceId,
        channelId: this.currentLeftItem.channelId,
        presetId: this.currentLeftItem.presetId,
        chooseRuleId: this.leftSearchParmas.chooseRuleId,
        taskId: this.leftSearchParmas.taskId,
      }
      saveData.connectAreaLabelIds = saveData.connectType === 'PRIVATE' ? [] : this.ruleSearchMultiLabelSelect ? saveData.connectAreaLabelIds : [saveData.connectAreaLabelIds] // 单选的话，数组里就一个id
      singleConnect({...parmas, ...saveData}).then(res => {
        if (res.code === 0) {
          this.$message.success('操作成功！')
          this.getLeftList()
          this.singleOperateVisible = false
        }
      })
    },
    getBatchOperateStatus() {
      getConnectStatus({taskId: this.leftSearchParmas.taskId}).then(async(res) => {
        if (res.code === 0) {
          this.batchOperateText = res.data.msg
          if (res.data.status === 'PROGRESS') {
            this.refreshBatchOperateInterval = setTimeout(() => {
              this.getBatchOperateStatus()
            }, 5000)
          } else {
            this.getLeftList()
            this.clearRefreshBatchOperate()
          }
      }
      })
    },
    setRightLabelChecked() {
      // if (this.focusDom.labelList && this.focusDom.labelList.length > 0) { // 有标签，联动右侧标签单选
      if (this.focusDom.labelList && this.focusDom.labelList[0].text !== '') { // 有标签，联动右侧标签单选，通过标签文字text判断，空的表示纯删除标签
        let focusLabelClassId = this.focusDom.labelList[0].labelClassId
        let focusLabelId = this.focusDom.labelList[0].labelId
        this.rightList.forEach(item => {
          if (item.labelClassId === focusLabelClassId) { //选中当前分类下对应的标签id
            item.labelList.forEach(child => {
              child.isChecked = child.labelId === focusLabelId ? true : false
            })
          } else {
            item.labelList.forEach(child => { // 其他分类下的标签设置为未选中
              child.isChecked = false
            })
          }
        })
      } else { // 无标签，清空右侧标签的选择状态
        this.cleanRightListChecked()
      }
    },
    async getLabelList() {
      if (this.labelSearchCalibrationType == undefined) {
        return false
      }
      let res = await getLabelList({labelName: this.rightSearchName, calibrationType: this.labelSearchCalibrationType, ruleId: this.leftSearchParmas.chooseRuleId})
      if (res.code === 0 && res.data && res.data.length) {
        res.data.forEach(item => {
          item.editFlag = false
          item.showBtnFlag = false
          item.activeFlag = false
          item.showChildData = true
          item.editText = ''
          item.labelList.forEach(child => {
            child.isChecked = false
            child.editFlag = false
            child.showBtnFlag = false
            child.shortcutFlag = false
            child.editText = ''
          })
          item.labelList = item.labelList.filter(child => child.available)
        })
        this.rightList = res.data
        this.setRightLabelChecked() //如果左边有选中绘制框，设置标签选中态
        this.setRightLabelStyle() // 设置右侧标签的样式，nth-of-type不起作用。。。
      }
    },
    setRightLabelStyle() {
      this.$nextTick(() => {
        let domArr = Array.from(document.getElementsByClassName('right_list_card'))
        domArr.forEach(item => {
          let dom = Array.from(item.getElementsByClassName('style_cross_line'))[0]
          if (dom) {
            dom.style.height = '24px'
          }
        })
      })
    },
    handleCurrentChange (val) {
      this.leftSearchParmas.pageNo = val
      this.currentLeftIndex = 0
      this.getLeftList()
    },
    singleOperateBtn(item, index, needTipEdit) {
      this.beforeChangeLeftCard(item, index, needTipEdit, () => { this.singleOperateVisible = true })
      // this.currentLeftItem = item // 先修改下当前卡片数据
      // this.singleOperateVisible = true
    },
    setLeftLoading() { // 左侧列表loading下，不然画布上计算坐标有延迟，导致一些问题
      this.loading = true
      setTimeout(() => {
        this.loading = false
      }, 1000)
    },
    getLeftList: _.debounce(function () { // 获取左侧通道列表
      this.loading = true
      getLeftChannelListList(this.leftSearchParmas).then(res => {
        if (res.code === 0) {
          this.total = res.data.total
          this.totalPage = res.data.totalPage
          let rows = res.data.rows || []
          if (!rows.length) {
            this.$refs.calibrate.setDefaultEmpty()
          } 
          rows.forEach((item) => {
            item.iconName = item.areaDrawType === 'DRAWED' ? '绘' : '无'
            item.iconBg = item.areaDrawType === 'DRAWED' ? '#52C41A' : '#BBC5D4'
            if (item.connectType === 'CONNECT') { // 关联标签的
              let connectArr = item.connectAreaLabelList.filter(_ => _.choose)
              item.connectAreaLabelNames = connectArr.map(_ => _.name).join()
              item.connectAreaLabelIds = connectArr.map(_ => _.id)
            } else {
              item.connectAreaLabelNames = '私有区域'
              item.connectAreaLabelIds = []
            }
          })
          this.leftList = rows
          this.beforeChangeLeftCard(this.leftList[this.currentLeftIndex], this.currentLeftIndex, false)
          // this.changeLeftCard(this.leftList[0], 0)
        }
        this.setLeftLoading()
      }).catch(() => { this.loading = false })
    }, 500),
    beforeChangeLeftCard(item, index, needTipEdit, callback) { //needTipEdit 是否需要提示编辑过内容，只有点击左侧通道提示，修改搜索条件等改变当前通道不提示
      if (this.currentLeftItem) {
        let beforeConnectType = this.currentLeftItem.connectType // 切换前，当前选中的卡片的connectType
        if (!needTipEdit || beforeConnectType === 'CONNECT') { // connectType === 'CONNECT'，关联母版的，不能有任何操作，所以也不用提醒
          this.changeLeftCard(item, index, callback)
        } else {
          let val = this.$refs.calibrate.getNewCalibrationList() || []
          let calibrationList = this.currentLeftItem.calibrationList || []
          let isEdit = false
          if (!val.length && !calibrationList.length) { // 前后都没有绘制信息数组，表示未编辑过
            isEdit = false
          } else if (val.length !== calibrationList.length) { // 数组长度不一致，表示编辑过，这一层if主要剔除任一数组为0的情况
            isEdit = true
          } else { // 数组长度一样，分别每项判断改动
            val.forEach(item => {
              item.scope.coordinates.forEach(point => {
                point.x = Math.round(point.x * 1000) / 1000
                point.y =  Math.round(point.y * 1000) / 1000
              })
            })
            for (let i = 0; i < val.length; i++) {
              if (val[i].id !== calibrationList[i].id) {
                isEdit = true
                break
              } else if (JSON.stringify(val[i].scope.coordinates) !== JSON.stringify(calibrationList[i].scope.coordinates)) {
                isEdit = true
                break
              } else if (JSON.stringify(val[i].labelList[0].labelId) !== JSON.stringify(calibrationList[i].labelList[0].labelId)) {
                isEdit = true
                break
              }
            }
          }
          let domArr = Array.from(document.getElementsByClassName('el-loading-mask'))
          if (domArr.length) {
            domArr.forEach(item => {
              item.style.backgroundColor = isEdit ? 'rgba(0, 0, 0, 0)' : 'hsla(0, 0%, 100%, 0.9)'
            })
          }
          if (isEdit) {
            this.$confirm('本次编辑有内容未保存，是否保存？', {
              confirmButtonText: '保存',
              cancelButtonText: '不保存',
              type: 'question'
            }).then(async() => {
              let val = await this.$refs.calibrate.getNewCalibrationList()
              if (!val.length) {
                this.$message.warning("无绘制框，保存失败！")
              } else if (this.currentLeftItem.connectType !== 'CONNECT' && val.length > 1) {
                this.$message.warning("私有区域仅能绘制一个绘制框，保存失败！")
              } else {
                let noConnetLabelsArr = val.filter(item => ['POLYGON', 'SHIELD_AREA'].includes(item.calibrationType) && (!item.labelList || !item.labelList[0].text))
                if (this.currentLeftItem.connectType === 'CONNECT' && noConnetLabelsArr.length) { // CONNECT关联标签类型的，还是需要关联标签，PRIVATE私有区域的，保存时不用校验标签
                  this.$message.warning('有绘制未关联右侧标签，保存失败！')
                } else {
                  let saveParmas = this.setSaveParmas(val)
                  modifyArea(saveParmas).then(res => { // 自动保存
                    if (res.code === 0) {
                      this.$message.success("保存成功！")
                    }
                  })
                }
              }
              setTimeout(() => {
                this.changeLeftCard(item, index, callback)
              }, 1000)
            }).catch(() => {
              this.changeLeftCard(item, index, callback)
            })
          } else {
            this.changeLeftCard(item, index, callback)
          }
        }
        this.setLeftLoading()
      } else {
        this.changeLeftCard(item, index, callback)
      }
    },
    async changeLeftCard(item, index, callback) {
      this.cleanRightListChecked()
      this.clearRefreshDrawPic()
      this.currentLeftItem = item
      this.currentLeftIndex = index
      if (this.currentLeftItem) {
        this.calibrateBtnDisabled = this.currentLeftItem.connectType === 'CONNECT'
        let res = await getArea({id: this.currentLeftItem.id, taskId: this.leftSearchParmas.taskId})
        if (res.code === 0) {
          this.$refs.calibrate.setSupportBtns(res.data.supportAreaType)
          this.resetLabelList() // 重置右侧标签数据
          this.currentLeftItem.url = await this.isImageURLValid(res.data.url)
          // this.currentLeftItem.url = res.data.url
          await this.$refs.calibrate.setDrawType('EDIT')
          await this.$refs.calibrate.updateImage(this.currentLeftItem.url)
          // this.currentLeftItem.calibrationList = [...res.data.calibrationList] // 接口传来的最原始的渲染数据
          this.currentLeftItem.calibrationList = res.data.calibrationList.filter(item => item.scope.coordinates.length > 0)
          this.currentLeftItem.calibrationList.forEach(item => {
            item.color = item.color ? item.color : '#308FF0'
            item.scope.coordinates.forEach(point => {
              point.x =  Math.round(point.x * 1000) / 1000
              point.y =  Math.round(point.y * 1000) / 1000 
            })
            item.labelList.forEach(label => {
              label.style = this.$refs.calibrate.getLabelColor(item.color) //标注框颜色
              // 绘制框颜色
              if (item?.style?.shape) {
                item.style.shape = this.$refs.calibrate.getLabelFrameColor(item.color).shape;
              } else {
                item.style = this.$refs.calibrate.getLabelFrameColor(item.color)
              }
            })
            if (item.scope.type === 'line') {
              item.scope.width = 0.05
            }
          })
          this.resetFrontOrBackStatus()
          await this.$refs.calibrate.setCalibrationList(this.currentLeftItem.calibrationList)
          await this.getAreaPicSatus() // 获取当前图片的状态
          callback && callback()
        }
      }
    },
    isImageURLValid(url) { // 判断图片地址是否有效
      return new Promise((resolve) => {
        const img = new Image()
        img.src = url
        img.onload = function() {
          resolve(url)
        }
        img.onerror = function() {
          resolve('')
        }
      })
    },
    resetLabelList() {
      this.labelSearchCalibrationType = '' 
      this.rightListCanOperateFlag = false
      this.focusDom = {}
      this.getLabelList()
    },
    resetFrontOrBackStatus() { // 初始化前进后退状态，比如标签修改后，就是新开始计算前进后退轮次了
      this.drawStepFullData = []
      this.drawStepIndex = -1
      this.drawBackBtnDisabled = true
      this.drawFrontBtnDisabled = true
    },
    getClickDataForSearch(value)  {
      this.leftSearchParmas.orgId = value.groupId
      this.leftSearchParmas.orgType = value.groupType
      this.leftSearchParmas.parentId = value.parentId
      this.currentLeftIndex = 0
      this.getLeftList()
    },
    addLabelClass() {
      this.labelClassVisible = true
    },
    addLabelLabel(item, isAdd) {
      this.$refs.labelModal.init(item, isAdd)
      this.labelVisible = true
    },
    editLabelClassText(item) {
      if (!item.editText) {
        this.$message.warning('分类名称不能为空！')
        return false
      }
      modifyLabelClass({labelClassId:item.labelClassId, labelClassName: item.editText}).then(res => {
        if (res.code === 0) { // 名称的编辑完成，不调接口刷新右侧了，不然一些编辑态没有了
          item.labelClassName = item.editText
          item.editFlag = false
        }
      })
    },
    editLabelText(item) {
      if (!item.editText) {
        this.$message.warning('标签名称不能为空！')
        return false
      }
      modifyLabel({labelId:item.labelId, labelName: item.editText}).then(res => {
        if (res.code === 0) {
          this.getSelectDropdownParamList()
          item.labelName = item.editText
          item.editFlag = false
          if (!this.rightListCanOperateFlag || !item.isChecked) {
            return false
          }
          this.updateCalibrationsTagText(item) // 更新中间绘制画布上涉及的标签名称
        }
      })
    },
    cancelRightEditBtn(item) {
      item.editFlag = false
    },
    clickLabelItem(citem) {
      // this.cleanLabelActive()
      // citem.activeFlag = true
    },
    shortcutShow(citem) {
      citem.showBtnFlag = true
      citem.shortcutFlag = true
      this.currentLabelItem = citem
    },
    shortcutHide(citem) {
      citem.showBtnFlag = false
      citem.shortcutFlag = false
    },
    confirmShortcut(currentShortcutNode) {
      let res = {code:0,data:{}}
      if(res.code === 0) {
        this.$message.success('快捷键设置成功！')
        this.closeShortcut()
      }
    },
    closeShortcut() {
      this.currentLabelItem.showBtnFlag = false
      this.currentLabelItem.shortcutFlag = false
      let doms = Array.from(document.getElementsByClassName('el-popover'))
      doms.forEach(dom => {
        dom.style.display = 'none'
      })
    },
    clickLabelClassItem(item) {
      this.cleanLabelActive()
      item.activeFlag = true
    },
    cleanLabelActive() { // 清除右侧所有标签的选中样式
      this.rightList.forEach(item => {
        item.activeFlag = false
        // item.labelList && item.labelList.length && item.labelList.forEach(label => label.activeFlag = false )
      })
    },
    async changeTagChecked(cindex,index) {
      if (!this.rightListCanOperateFlag) {
        return false
      }
      await this.cleanRightListChecked()
      this.rightList[index].labelList[cindex].isChecked = true
      this.updateCalibrationsTagText(this.rightList[index].labelList[cindex])
    },
    updateCalibrationsTagText(item) { // 标签文字有改变，如果左侧有选中态的绘制框，要更新绘制框上面的标签
      let tagObj = {
        labelName: item.labelName,
        labelId: item.labelId,
        labelClassId: item.labelClassId,
        color: item.color
      }
      this.$refs.calibrate.updateCalibrationsTagText(tagObj)
    },
    commandRightHeadBtn(command) { // 点击分类按钮，
      if (command.name === '编辑') { // 变成编辑态
        this.rightList[command.index].editFlag = true 
        this.rightList[command.index].editText = this.rightList[command.index].labelClassName 
      }
      if (command.name === '删除') { // 删除
        this.$confirm(`确认删除分类：${this.rightList[command.index].labelClassName}`, {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'question'
        }).then(() => {
          deleteLabelClass({labelClassId: this.rightList[command.index].labelClassId}).then(res => {
            if (res.code === 0) {
              this.$message.success('删除成功！')
              this.rightList.splice(command.index, 1)
              this.getSelectDropdownParamList()
            }
          })
        })
      }
    },
    editClassLabel(item, index) {
      this.cleanLabelActive()
      this.rightList[index].editFlag = true 
      this.rightList[index].editText = this.rightList[index].labelClassName
      item.activeFlag = true
    },
    deleteClassLabel(item, index) {
      this.$confirm(`确认删除分类：${this.rightList[index].labelClassName}`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'question'
      }).then(() => {
        deleteLabelClass({labelClassId: this.rightList[index].labelClassId}).then(res => {
          if (res.code === 0) {
            this.$message.success('删除成功！')
            this.rightList.splice(index, 1)
            this.getSelectDropdownParamList()
          }
        })
      })
    },
    editLabel(citem, cindex, index) {
      this.cleanLabelActive()
      this.$refs.labelModal.init(citem, false)
      this.labelVisible = true
      // citem.activeFlag = true
      // this.rightList[index].labelList[cindex].editFlag = true
      // this.rightList[index].labelList[cindex].editText = this.rightList[index].labelList[cindex].labelName 
    },
    deleteLabel(citem, cindex, index) {
      this.$confirm(`确认删除标签：${citem.labelName}`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'question'
      }).then(() => {
        deleteLabel({labelId: citem.labelId}).then(res => {
          if (res.code === 0) {
            this.$message.success('删除成功！')
            this.rightList[index].labelList.splice(cindex, 1)
            this.getSelectDropdownParamList()
          }
        })
      })
    },
    commandRightBtn(command) { // 点击标签按钮
      if (command.name === '编辑') { // 变成编辑态
        this.rightList[command.index].labelList[command.cindex].editFlag = true
        this.rightList[command.index].labelList[command.cindex].editText = this.rightList[command.index].labelList[command.cindex].labelName 
      }
      if (command.name === '删除') {
        this.$confirm(`确认删除标签：${this.rightList[command.index].labelList[command.cindex].labelName}`, {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'question'
        }).then(() => {
          deleteLabel({labelId: this.rightList[command.index].labelList[command.cindex].labelId}).then(res => {
            if (res.code === 0) {
              this.$message.success('删除成功！')
              this.rightList[command.index].labelList.splice(command.cindex, 1)
              this.getSelectDropdownParamList()
            }
          })
        })
      }
    },
    handleIconClick() {
      this.getLabelList()
    },
    clearIconClick() {
      this.rightSearchName = ''
      this.getLabelList()
    },
    getSelectDropdownParamList () {
      getSelectDropdownParamList().then(res => {
        if (res.code === 0 && res.data && res.data.length) {
          res.data.forEach(item => item.mutliFlag === false)
          this.selectParamList = res.data
        }
      })
    },
    // 异步抓图，先请求抓图接口
    getNewPic () {
      if (!this.leftList || !this.leftList.length) {
        return false
      }
      let parmas = {
        deviceId: this.currentLeftItem.deviceId,
        channelId: this.currentLeftItem.channelId,
        presetId: this.currentLeftItem.presetId,
      }
      getNewDrawRulePic(parmas).then(res => {
        if (res.code === 0) {
          this.getAreaPicSatus()
        }
      })
    },
    // 异步抓图，再定时器请求获取接口
    getAreaPicSatus() {
      this.maxRefreshTimes++
      let parmas = {
        deviceId: this.currentLeftItem.deviceId,
        channelId: this.currentLeftItem.channelId,
        presetId: this.currentLeftItem.presetId,
      }
      getAreaPicSatus(parmas).then(async(res) => {
        if (res.code === 0) {
          if (res.data.status === 'EMPTY') {
            await this.$refs.calibrate.setCalibrationList(this.currentLeftItem.calibrationList) // 没底图直接渲染坐标
            this.getNewPic()
          } else {
            this.replaceImgUrl = res.data.url
            // await this.$refs.calibrate.updateImage(res.data.url) // 设置底图
            // await this.$refs.calibrate.setCalibrationList(this.currentLeftItem.calibrationList) // 有底图要先渲染底图，否则坐标计算有问题
            let icon = res.data.status === 'SUCCESS' ? '√' : res.data.status === 'FAIL' ? '×' : ''
            let url1 = this.currentLeftItem.url ? this.currentLeftItem.url.split('?')[0] : ''
            let url2 = res.data.url ? res.data.url.split('?')[0] : ''
            this.picStatus = (res.data.status === 'SUCCESS' && url1 !== url2) ? 'REPLACE_IMG' : res.data.status
            this.picStatusText = icon + '' + res.data.msg
            // if (res.data.status === 'PROGRESS' && this.maxRefreshTimes < 5) {
            if (['PROGRESS', 'INQUEUE'].includes(res.data.status)) {
              this.refreshDrawImgInterval = setTimeout(() => {
                this.getAreaPicSatus()
              }, 5000)
            } else {
              this.clearRefreshDrawPic()
            }
          }
        }
      })
    },
    replaceImage() {
      this.currentLeftItem.url = this.replaceImgUrl
      this.$refs.calibrate.updateImage(this.currentLeftItem.url) // 设置底图
      this.picStatus = 'SUCCESS'
      this.picStatusText = '√' + '替换成功'
    },
    clearRefreshDrawPic() {
      this.maxRefreshTimes = 0
      if (this.refreshDrawImgInterval) {
        clearTimeout(this.refreshDrawImgInterval)
        this.refreshDrawImgInterval = null
      }
    },
    clearRefreshBatchOperate() {
      if (this.refreshBatchOperateInterval) {
        clearTimeout(this.refreshBatchOperateInterval)
        this.refreshBatchOperateInterval = null
      }
    },
    inferTagName(key) {
      let obj = {'SINGLE_AREA': '单','CROSS_LINE': '线','MULTI_AREA': '多','SHIELD_AREA':'蔽'}
      return obj[key]
    },
    inferTagBgcolor(key) {
      let obj = {'SINGLE_AREA': 'rgba(30,127,255,0.70)','CROSS_LINE': 'rgba(255,171,0,0.70)','MULTI_AREA': 'rgba(190,16,165,0.70)','SHIELD_AREA':'rgba(161,151,255,0.3)'}
      return obj[key]
    },
    backConfirm () {
      this.back()
      // this.$confirm('是否退出绘制？', {
      //   confirmButtonText: '确定',
      //   cancelButtonText: '取消',
      //   type: 'question'
      // }).then(() => {
      //   this.back()
      // }).catch(() => {})
    },
    back () {
      this.$router.push({
        name: 'inspectionConfig',
        params: { serviceType: this.serviceType }
      })
    },
  },
  beforeDestroy () {
    // this.$store.commit('setShowLeftMenu', true)
    this.clearRefreshDrawPic()
    this.clearRefreshBatchOperate()
  }
}

</script>

<style lang="scss">
.draw_area{
  .demo-scrollbar-wrap-left {
    height: calc(100vh - 336px);
  }
  .demo-scrollbar-wrap-2 {
    height: calc(100vh - 200px);
    .el-scrollbar__view{
      padding-right: 16px;
    }
  }
  .h-icon-add{
    font-size: 14px;
    color: #000;
    font-weight: 700;
    margin-top: -2px;
  }
  .main_item{
    .el-radio, .el-checkbox{
      display: flex;
      align-items: center;
    }
    .el-radio__label, .el-checkbox__label{
      display: flex;
      align-items: center;
    }
    .el-checkbox__inner{
      border-radius: 50%;
    }
  }
  .left_wrap{
    .search2{
      .search_radio_wrap{
        display: flex;
        align-items: center;
        .el-radio-button{
          // width: 82px;
          .el-radio-button__inner{
            // width: 100%;
            padding: 0 15px;
          }
        }
      }
      .channel_input{
        input{
          padding-right: 12px!important;
        }
      }
    }
  }
}
.draw_dropdown{
  .el-dropdown-menu__item{
    display: flex;
    align-items: center;
    padding-left: 12px;
    i{
      font-size: 22px;
      margin-right: 6px;
    }
  }
}
</style>
<style lang="scss" scoped>
.draw_area{
  .wrap{
    display: flex;
    justify-content: space-between;
    .left_wrap{
      // width: 280px;
      height: 100%;
      border-right: 1px solid #EEEFF2;
      .left_card{
        // width: 245px;
        width: calc(100% - 36px);
        margin-bottom: 8px;
        display: flex;
        padding-left: 12px;
        padding-top: 12px;
        margin-left: 16px;
        position: relative;
        cursor: pointer;
        .yuzhidian_tag{
          position: absolute;
          left: 14px;
          bottom: 8px;
          color: orange;
          font-size: 12px;
        }
        .r_part{
          width: calc(100% - 27px);
          .r_name{
            color: rgba(0,0,0,0.90);
            height: 20px;
            line-height: 20px;
            // max-width: 190px;
          }
          .r_foot{
            display: flex;
            align-items: center;
            font-size: 12px;
            color: rgba(0,0,0,0.40);
            margin-top: 4px;
            justify-content: space-between;
            .r_f_left{
              display: flex;
              align-items: center;
              // margin-right: 12px;
              width: calc(100% - 80px);
              .r_f_left_name{
                // width: 80px;
                width: calc(100% - 40px);
              }
            }
            .split{
              width: 1px;
              height: 10px;
              background: #E2E3E6;
              margin-left: 6px;
              margin-right: 6px;
            }
          }
        }
        &:hover{
          background: rgba(27,88,244,0.04);
          border-radius: 4px;
          .r_part{
            .r_name{
              // color: rgba(30,127,255,0.90);
            }
          }
        }
        .l_part{
          width: 16px;
          height: 16px;
          line-height: 16px;
          border-radius: 4px;
          color: rgba(255,255,255,0.90);
          text-align: center;
          margin-right: 8px;
          margin-top: 2px;
          font-size: 10px;
        }
      }
      .active_card{
        background: rgba(27,88,244,0.04);
        border-radius: 4px;
        .r_part{
          .r_name{
            color: rgba(30,127,255,0.90);
          }
        }
      }
      .left_title{
        font-size: 14px;
        color: rgba(0,0,0,0.90);
        height: 20px;
        line-height: 20px;
        font-weight: 600;
        margin: 16px 0 16px 12px;
      }
      .search1{
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
        margin-left: 12px;
        position: relative;
        .mutli_select_position{
          position: absolute;
          left: 213px;
          width: 150px;
        }
      }
      .search2{
        margin-left: 12px;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: relative;
        .mutli_select_position{
          position: absolute;
          left: 213px;
          width: 150px;
        }
      }
      .search3{
        display: flex;
        align-items: center;
        margin: 0 20px 0px 12px;
        justify-content: space-between;
        font-size: 12px;
        color: rgba(0,0,0,0.70);
      }
      .search4{
        display: flex;
        align-items: center;
        margin: 8px 16px 0px 12px;
        justify-content: space-between;
      }
    }
    .middle_wrap{
      width: calc(100% - 588px);
      .foot_btn_wrap{
        display: flex;
        align-items: center;
        margin: 0 auto;
        button{
          min-width: 76px;
          height: 36px;
          border-radius: 4px;
        }
      }
    }
    .right_wrap{
      width: 288px;
      padding: 0 0 0 16px;
      border-left: 1px solid #EEEFF2;
      .main_item_has_check_wrap{
        display: flex;
        align-items: center;
      }
      .right_title{
        font-family: MicrosoftYaHeiUISemibold;
        font-size: 14px;
        color: rgba(0,0,0,0.90);
        font-weight: 600;
        height: 52px;
        line-height: 52px;
      }
      .search{
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-right: 16px;
      }
      .right_list_card{
        margin-bottom: 14px;
        .card_title_wrap{
          height: 28px;
          width: 254px;
          margin-left: 2px;
          display: flex;
          align-items: center;
          cursor: pointer;
          .rotate_icon{
            transition: all 0.2s;
            transform: rotate(-90deg);
          }
          &:hover{
            background: rgba(30,127,255,0.04);
          }
          div{
            display: flex;
            align-items: center;
          }
          .card_title_left{
            width: 199px;
            cursor: pointer;
          }
          .class_name{
            max-width: 170px;
            display: block;
          }
          .card_title_right{

          }
        }
        .card_title_wrap:has(.active_click_label){
          background: rgba(30,127,255,0.04);
        }
        .more_btn{
          font-size: 24px;
          cursor: pointer;
        }
        .label_more_btn{
          font-size: 22px;
          color: #4d4d4d;
          &:hover{
            color: #2080f7;
          }
        }
        .right_btn{
          &:hover{
            color: #2080f7;
          }
        }
        .first_main_item{
          height: 28px;
          display: flex;
          align-items: center;
        }
        .edit_main_item{
          padding:0 4px;
          background: rgba(30,127,255,0.04);
          .edit_input{
            // width: 150px;
            width: 162px;
            height:24px;
            caret-color:#2080f7;
            padding: 0 4px;
          }
          .btn_span{
            font-size: 12px;
            cursor: pointer;
            color: rgba(0,0,0,0.40);
            &:hover{
              color: #2080f7
            }
          }
        }
        .main_wrap{
          height: 32px;
          width: 100%;
          display: flex;
          align-items: flex-end;
          // justify-content: flex-end;
          cursor: pointer;
          .main_item{
            height: 28px;
            // width: 227px;
            // width: 237px;
            display: flex;
            align-items: center;
            cursor: pointer;
            position: relative;
            .for_hover{
              display: flex;
              align-items: center;
              cursor: pointer;
              position: relative;
              height: 28px;
              width: 225px;
              &:hover{
                background: rgba(30,127,255,0.04);
              }
            }
            .color_wrap{
              width: 2px;
              height: 16px;
              margin-right: 24px;
            }
            .style_cross_line{
              width: 15px;
              height: 34px;
              border-bottom: 1px solid #E5E5E5;
              border-left: 1px solid #E5E5E5;
              position: absolute;
              left: 10px;
              bottom: 12px;
              border-radius: 3px;
            }
            .text{
              // width: 140px;
              width: 120px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .tag{
              width: 16px;
              height: 16px;
              line-height: 14px;
              border: 1px solid rgba(187,197,212,0.12);
              border-radius: 4px;
              font-size: 10px;
              color: #FFFFFF;
              text-align: center;
              margin-left:2px;
              margin-right:4px
            }
          }
        }
        .active_click_label{
          background: rgba(30,127,255,0.04);
        }
      }
    }
  }
  // .right_list_card{
  //   .style_cross_line:nth-of-type(1){
  //     height: 14px!important;
  //   }
  // }
  .self_breadcrumb_head{
    height: 54px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #EEEFF2;
    .head_left{
      display: flex;
      align-items: center;
      font-family: MicrosoftYaHeiUISemibold;
      font-size: 16px;
      color: rgba(0,0,0,0.90);
      font-weight: 600;
      .task_name{
        font-size: 14px;
        color: #999;
        margin-left: 12px;
      }
      .back_icon{
        margin-top: 2px;
        margin-left: 16px;
        font-size: 26px;
        color: #000;
        cursor: pointer;
        &:hover{
          color: #2080f7;
        }
      }
      .split{
        background: #EEEFF2;
        width: 1px;
        height: 14px;
        margin: 0 12px;
      }
    }
    .head_right{
      padding-right: 16px;
    }
  }
}
</style>
