<template>
  <div class="page-capture-detail" v-loading="loading">
    <!-- 面包屑 -->
    <div class="breadcrumb-mod page-head">
      <el-breadcrumb separator=">" v-show="taskSource!=='PATROL'">
        <el-breadcrumb-item class="breadcrumb_item1">
          <i class="h-icon-arrow_left" @click="backConfirm" ></i>
          <span @click="backConfirm">场景任务</span>
        </el-breadcrumb-item>
        <el-breadcrumb-item class="breadcrumb_item2">{{ isAdd ? '新建任务' : '编辑任务' }}</el-breadcrumb-item>
      </el-breadcrumb>
      <el-breadcrumb v-show="taskSource==='PATROL'">
        <el-breadcrumb-item class="breadcrumb_item2">编辑任务</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="page-content">
      <el-scrollbar wrap-class="editSceneTask-scrollbar__wrap">
        <div class="main_wrap">
          <div class="content-title" id='scrolldom'>请设置分析任务
            <el-tooltip content="模拟验证" placement="top">
              <el-button icon="icon iconfont iconfakeValid"  @click="simulateVerify" style="margin-left: 4px;" v-show="addType==='edit'&&!planSelf"/>
            </el-tooltip>
            <el-tooltip content="转定制" placement="top">
              <el-button icon="h-icon-update"  @click="convertToDianaRule" style="margin-left: 4px;" v-show="addType==='edit'&&!planSelf&&taskSource==='SELF'"/>
            </el-tooltip>
          </div>
          <el-form ref="form" :model="taskForm" :rules="rules" label-width="150px" style="width:700px;">
            <el-form-item label="场景类型">
              <div class="card" :style="{'backgroundImage': handleBg(solutionInfo),'backgroundSize':'200px 52px','background-repeat':'no-repeat'}">
                <div class="top_text" >{{ solutionInfo.solutionName }}</div>
                <div class="bot_text ellipsis" :title="solutionInfo.description">{{ solutionInfo.description }}</div>
              </div>
            </el-form-item>
            <el-form-item label="任务名称" prop="solutionTaskName" :required-right="false">
              <el-input v-model="taskForm.solutionTaskName" placeholder="请输入" :maxlength="64" style="width: 550px;" @blur="blurHandler" clearable></el-input>
            </el-form-item>
            <div v-if="judgeShow('durationTimes')">
              <el-form-item label="持续次数" :required-right="false" prop="durationTimes" style="position: relative;" required>
                <el-input-number v-model="taskForm.durationTimes" :min="1" :max="10" style="width: 110px;margin-right:6px"></el-input-number><span class="unit">次</span>
              </el-form-item>
              <div class="tip_text">超过设置的连续次数将会判断为告警</div>
            </div>
            <el-form-item label="抓拍周期" prop="weekDay" :required-right="false" v-if="judgeShow('weekDay')" style="margin-bottom: 13px;">
              <div class="date-content">
                <div v-for="(item, index) in weekDate" :key="index" @click="selectCaptureTime(item.value, 'week')" :class="{'date-block-sel':selDate.week.indexOf(item.value) > -1}" class="date-block">{{item.label}}</div>
              </div>
            </el-form-item>
            <div class="analysisMode-mod" v-if="judgeShow('definedTimeEnable') || judgeShow('intervalEnable')">
              <el-form-item :required-right="false" label="抓拍模式" style="margin-bottom:10px;position:relative">
                <i style="color:#ff5353;position:absolute;left:72px;font-size:12px">*</i>
              </el-form-item>
              <div class="capture_wrap">
                <div v-if="judgeShow('definedTimeEnable')">
                  <el-form-item label="时间点抓拍">
                    <el-switch on-text="" off-text="" v-model="taskForm.definedTimeEnable"></el-switch><span style="margin-left: 12px; font-size: 12px;">{{taskForm.definedTimeEnable ? '开' : '关'}}</span>
                  </el-form-item>
                  <el-form-item label="抓拍时间点" prop="executeTimeList" v-if="taskForm.definedTimeEnable" style="position:relative" >
                    <i style="color:#ff5353;position:absolute;left:18px;font-size:12px">*</i>
                    <div v-for="(item, index) in taskForm.executeTimeList" :key="index" class="time-point">
                      <el-time-picker v-if="taskForm.definedTimeEnable" format="HH:mm" value-format="HH:mm" v-model="item.value" placeholder="选择时间点"
                        @change="(val) => { executeTimeListChange(val, index) }">
                      </el-time-picker>
                      <i v-if="index !== 0" class="h-icon-close" style="font-size: 14px;cursor: pointer;" @click="delCaptureTime(index)"></i>
                    </div>
                    <el-button icon="h-icon-add" @click="addCaptureTime" v-if="taskForm.executeTimeList && taskForm.executeTimeList.length < 20">添加（{{taskForm.executeTimeList.length}}/20）</el-button>
                  </el-form-item>
                </div>
                <div v-if="judgeShow('intervalEnable')">
                  <el-form-item label="间隔抓拍">
                    <el-switch on-text="" off-text="" v-model="taskForm.intervalEnable"></el-switch><span style="margin-left: 12px; font-size: 12px;">{{taskForm.intervalEnable ? '开' : '关'}}</span>
                  </el-form-item>
                  <el-form-item label="抓拍时段" prop="executeValDateList" v-if="taskForm.intervalEnable" style="position:relative">
                    <i style="color:#ff5353;position:absolute;left:32px;font-size:12px">*</i>
                    <div v-for="(item, index) in taskForm.executeValDateList" :key="index" class="time-point">
                      <el-time-picker v-if="taskForm.intervalEnable" is-range format="HH:mm" value-format="HH:mm" v-model="item.value" placeholder="选择时间范围" 
                        @change="(val) => { executeValDateListChange(val, index) }" :clearable="false">
                      </el-time-picker>
                      <i v-if="index !== 0" class="h-icon-close" style="font-size: 14px;cursor: pointer;" @click="delExecuteValDate(index)"></i>
                    </div>
                    <el-button icon="h-icon-add" type="default" @click="addExecuteValDate" v-if="taskForm.executeValDateList.length < 5" title="请勿添加交叉重叠的时间段">添加（{{taskForm.executeValDateList.length}}/5）</el-button>
                  </el-form-item>
                  <el-form-item label="间隔时长" v-if="taskForm.intervalEnable" prop="captureSpace">
                    <el-select v-model="taskForm.captureSpace" placeholder="请选择" style="width: 80px;">
                      <el-option v-for="(item, index) in [5, 10, 15, 20, 30, 45, 60, 90, 120]" :key="index" :label="item" :value="item"></el-option>
                    </el-select><span style="padding-left:5px">分钟</span>
                  </el-form-item>
                </div>
              </div>
            </div>
            <el-form-item label="开启抽帧兼容" :required-right="false" prop="hasDrawFrames" v-if="judgeShow('hasDrawFrames')">
              <div class="drawFrames_warp">
                <el-switch on-text="" off-text="" v-model="taskForm.hasDrawFrames" @change="changeDrawFrames()"></el-switch>
                <div v-show="showFramesErrTips" class="FramesErrTips">授权不足，请购买抽帧抓图服务授权</div>
              </div>
            </el-form-item>
            <el-form-item label="是否员工检测" v-if="judgeShow('detectEmployee')">
              <el-switch on-text="" off-text="" v-model="taskForm.detectEmployee" @change="changeDetectEmployee()"></el-switch>
            </el-form-item>
            <el-form-item label="工服比对库" prop="workwearLab" :required-right="false" style="position: relative;" v-if="isShowWorkwearLab">
              <i style="color:#ff5353;position:absolute;left:60px;top:-1px;font-size:12px">*</i>
              <div class="work_club_wrap">
                <div v-show="workwearLabInfo.chooseLabIds.length" class="club" @mouseenter="workLabMouseEvent(workwearLabInfo, true)" @mouseleave="workLabMouseEvent(workwearLabInfo, false)">
                  <div class="num_tag" v-show="workwearLabInfo.chooseLabIds.length">{{ workwearLabInfo.chooseLabIds.length }}</div>
                  <div class="img_wrap" :style="{'backgroundImage': handleLabBg(workwearLabInfo),'backgroundSize':'100% 100%','background-repeat':'no-repeat'}">
                    <div class="ope_btn icon iconfont icona-aicopy2" v-show="workwearLabInfo.btnVisible" title="清空" @click="delWorkLabInfo('workwearLab')"></div>
                    <div class="ope_btn icon iconfont iconaiedit" style="margin-left: 12px;" v-show="workwearLabInfo.btnVisible" @click="editWordLabInfo('workwearLab', workwearLabInfo)"></div>
                  </div>
                  <div class="img_des" :title="workwearLabInfo.chooseLabNames">{{ workwearLabInfo.chooseLabNames }}</div>
                </div>
                <div v-show="!workwearLabInfo.chooseLabIds.length" class="empty_club" @click="editWordLabInfo('workwearLab', workwearLabInfo)"><div class="jiahao">+</div><div>点击添加对比库</div></div>
              </div>
            </el-form-item>
            <el-form-item label="工帽比对库" prop="workCapLab" :required-right="false" style="position: relative;" v-if="judgeShow('workCapLab')">
              <i style="color:#ff5353;position:absolute;left:60px;top:-1px;font-size:12px">*</i>
              <div class="work_club_wrap">
                <div v-show="workCapLabInfo.chooseLabIds.length" class="club" @mouseenter="workLabMouseEvent(workCapLabInfo, true)" @mouseleave="workLabMouseEvent(workCapLabInfo, false)">
                  <div class="num_tag" v-show="workCapLabInfo.chooseLabIds.length">{{ workCapLabInfo.chooseLabIds.length }}</div>
                  <div class="img_wrap" :style="{'backgroundImage': handleLabBg(workCapLabInfo),'backgroundSize':'100% 100%','background-repeat':'no-repeat'}">
                    <div class="ope_btn icon iconfont icona-aicopy2" v-show="workCapLabInfo.btnVisible" title="清空" @click="delWorkLabInfo('workCapLab')"></div>
                    <div class="ope_btn icon iconfont iconaiedit" style="margin-left: 12px;" v-show="workCapLabInfo.btnVisible" @click="editWordLabInfo('workCapLab', workCapLabInfo)"></div>
                  </div>
                  <div class="img_des" :title="workCapLabInfo.chooseLabNames">{{ workCapLabInfo.chooseLabNames }}</div>
                </div>
                <div v-show="!workCapLabInfo.chooseLabIds.length" class="empty_club" @click="editWordLabInfo('workCapLab', workCapLabInfo)"><div class="jiahao">+</div><div>点击添加对比库</div></div>
              </div>
            </el-form-item>
            <div v-if="judgeShow('openingTime')">
              <el-form-item label="营业时间" :required-right="false" prop="openingTime">
                <el-time-picker v-model="taskForm.openingTime" placeholder="请选择时间" style="width: 194px;" format="HH:mm" value-format="HH:mm"/>
              </el-form-item>
              <div class="tip_text">根据营业时间，平台自动抓拍三次。</div>
            </div>
            <div v-if="judgeShow('closingTime')">
              <el-form-item label="停业时间" :required-right="false" prop="closingTime">
                <el-time-picker v-model="taskForm.closingTime" placeholder="请选择时间" style="width: 194px;" format="HH:mm" value-format="HH:mm"/>
              </el-form-item>
              <div class="tip_text">根据停业时间，平台自动抓拍三次。</div>
            </div>
            <el-form-item label="门店时间优先" v-if="judgeShow('useStoreTime')">
              <el-switch on-text="" off-text="" v-model="taskForm.useStoreTime"></el-switch>
              <el-button type="link" @click="goConfigUseStoreTime" style="margin-left: 12px;">配置门店时间</el-button>
            </el-form-item>
            <el-form-item label="数量" v-if="judgeShow('targetNums')">
              <el-input-number v-model="taskForm.targetNums" :min="0" :max="1000"></el-input-number>
            </el-form-item>
            <el-form-item label="关联区域标签" prop="detectAreaLabelIds" :required-right="false" v-if="judgeShow('detectAreaLabelIds')">
              <el-select v-model="taskForm.detectAreaLabelIds" placeholder="请选择" filterable multiple :multiple-limit='2'>
                <el-option v-for="(item,index) in detectAreaLabelIdsList" :key="index" :label="item.labelName" :value="item.labelId"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="推送配置" prop="output" :required-right="false" v-if="judgeShow('output')">
              <el-checkbox-group v-model="taskForm.output">
                <el-checkbox v-for="(item,index) in outputList" :key="index" :label="item.id">
                  <span>{{item.name}}</span>
                </el-checkbox>
                <a href="https://pic.hik-cloud.com/opencustom/apidoc/online/retail/6712563e505d4da8a5def25f1d0216ae.html?timestamp=1761188903739#%E8%BF%90%E8%90%A5%E5%8A%A9%E6%89%8B%E8%87%AA%E5%AE%9A%E4%B9%89%E6%8A%A5%E8%AD%A6%E6%B6%88%E6%81%AFWYuXpW" target="_blank" 
                  class="copyId" v-show="!isAdd && taskForm.output.includes('open')" style="text-decoration: none;width: 110px;">查看消息接入文档</a>
                <span class="copyId" v-show="!isAdd && taskForm.output.includes('open')" @click="copyTaskId">复制outputCode</span>
              </el-checkbox-group>
            </el-form-item>
            <div v-if="judgeShow('detectItem') || judgeShow('globalJudge')">
              <div @click="showCollapse" class="advance_params">
                <div class="title">高级配置</div>
                <div class="arrow">
                  <span>{{ showCollapseFlag ? '收起' : '展开' }}</span><i style="font-size: 20px" :class="!showCollapseFlag ? 'h-icon-angles_down_sm' : 'h-icon-angles_up_sm'"></i>
                </div>
              </div>
              <div v-show="showCollapseFlag">
                <el-form-item label="检测项" prop="detectItem" required v-if="judgeShow('detectItem')">
                  <div class="capture_wrap detect_wrap">
                    <div v-for="(item, index) in taskForm.detectItem" :key="index" class="item_line">
                      <div class="name">{{ item.labelName }}</div>
                      <el-switch v-model="item.enable"></el-switch>
                      <div class="confidenceThreshold_wrap">
                        <confidenceThresholdDom content="置信度表示算法检测结果的可信程度，值越大代表算法结果的可信程度越高。该阈值可根据实际情况灵活调整，可选范围是0-100"></confidenceThresholdDom>
                        <el-input-number v-model="item.confidence" :min="0" :max="100" class="confidence_input" :key="inputNumberKey" @blur="() => {inputNumberKey = Math.random()}"></el-input-number>
                      </div>
                    </div>
                  </div>
                </el-form-item>
                <el-form-item label="全局审核" :required-right="false" prop="globalJudge" v-if="judgeShow('globalJudge')">
                  <div class="globalJudge_warp">
                    <el-switch v-model="taskForm.globalJudge"></el-switch>
                    <el-input-number v-show="taskForm.globalJudge" v-model="taskForm.globalJudgeTime" :min=1 :max=24 class="global_judge_num"></el-input-number>
                    <span v-show="taskForm.globalJudge">小时</span>
                  </div>
                </el-form-item>
              </div>
            </div>
          </el-form>
        </div>
      </el-scrollbar>
    </div>
    <div class="foot_btns">
      <el-button type="primary" @click="submitConfig()" v-show="isAdd">保存并配置通道</el-button>
      <el-button type="primary" @click="submitConfig()" v-show="!isAdd">保存</el-button>
      <el-button @click="configChannels" v-show="!isAdd&&!planSelf">通道调整</el-button>
      <el-button @click="backConfirm">取消</el-button>
    </div>
    <workLabModal ref="workLabModal" :visible.sync="workLabModalVisible" :workLabType="workLabType" @chooseWorkLab="chooseWorkLab"></workLabModal>
    <channelDrawer v-if="issuedDeviceVisible" ref="channelDrawer" :visible.sync="issuedDeviceVisible" :publishStatus="publishStatus" 
      :taskSource="taskSource" :defaultGroupId="defaultGroupId"></channelDrawer>
    <simulateVerifyModal :visible.sync="simulateVerifyModalVisible" :cardInfo="currentTaskItem" ></simulateVerifyModal>
  </div>
</template>

<script>
import confidenceThresholdDom from '@/components/confidenceThresholdDom/index.vue'
import { getSolutionTaskConfigInfo, checkRepeatSolutuonTaskName, getDetailBySolutionId, readParamAndDefault, getImageLibraryList, 
  addSolutionTask, editSolutionTask, copySolutionTask, getOnlyLabelList, checkEnough, convertToDianaRule } from './proxy'  
import workLabModal from './modal/workLabModal.vue'
import { getFormatTime } from '@/assets/libs/util'
import channelDrawer from './modal/channelDrawer'
import simulateVerifyModal from '@/components/simulateVerifyModal'
export default {
  name: 'editSceneTask',
  components: {
    workLabModal, channelDrawer, simulateVerifyModal, confidenceThresholdDom
  },
  data () {
    let checkName = async (rule, value, callback) => {
      let pattern = /^[a-zA-Z0-9\u4e00-\u9fa5\[\].、\-_【】()#@~<>,，.。（）：:]{0,64}$/
      if (!value || value.length === 0) {
        callback(new Error('请输入任务名称'))
      } else if (value.length > 64) {
        callback(new Error('任务名称不能超过64个字符'))
      } else if (!pattern.test(value)) {
        callback(new Error('任务名称不支持除了.、-_[]【】()#@~<>,，.。（）：:以外的特殊字符'))
      } else {
        callback()
      }
    }
    let checkExecuteTime = (rule, value, callback) => {
      if (this.taskForm.weekDay === '') {
        callback(new Error('至少选择一个抓拍周期'))
      } else {
        callback()
      }
    }
    let checkExecuteTimeList = (rule, value, callback) => {
      let timeArr = this.taskForm.executeTimeList.map(item => item.value)
      if (!timeArr.every(item => item !== '')) {
        callback(new Error('请选择抓拍时间点'))
      } else if (this.checkRepeat(timeArr)) {
        callback(new Error('不能选择相同抓拍时间点'))
      } else {
        callback()
      }
    }
    let checkExecuteValDateList = (rule, value, callback) => {
      if (this.taskForm.executeValDateList.length > 0 && !this.taskForm.executeValDateList[0].label.length) {
        callback(new Error('请选择时段'))
      } else {
        callback()
      }
    }
    let checkWorkwearLab = (rule, value, callback) => {
      if (this.judgeShow('workwearLab') && !this.workwearLabInfo.chooseLabIds.length) {
        callback(new Error('请选择工服比对库'))
      } else {
        callback()
      }
    }
    let checkWorkCapLab = (rule, value, callback) => {
      if (this.judgeShow('workCapLab') && !this.workCapLabInfo.chooseLabIds.length) {
        callback(new Error('请选择工帽比对库'))
      } else {
        callback()
      }
    }
    return {
      inputNumberKey: Math.random(),
      simulateVerifyModalVisible: false,
      workLabType: 'workwearLab', // 工服：workwearLab，工帽：workCapLab
      workwearLabInfo: {btnVisible: false, chooseLabIds: [], chooseLabNames: ''},
      workCapLabInfo: {btnVisible: false, chooseLabIds: [], chooseLabNames: ''},
      addType: 'add', // 进入模式，add添加，edit编辑，copy复制
      planSelf: '',
      loading: false,
      solutionInfo: {
        solutionId: '',
        solutionName: '',
        description: '',
        sceneBg: 999,
      },
      supportFieldList: [],
      taskForm: {
        executeTimeList: [{ value: ''}], // 抓拍时间点前端数据（不传给后端）
        executeValDateList: [{ value: ['00:00', '23:59'], label: '00:00 - 23:59' }], // 抓拍时间段前端数据（不传给后端）

        solutionTaskId: '',
        solutionTaskName: '',
        detectEmployee: false, //是否检测员工
        workwearLab: '', //工装库
        workCapLab: '',//工帽库
        intervalEnable: false, // 抓拍时段开关
        execTime: '', //抓拍时段
        captureSpace: 5, // 抓拍间隔
        definedTimeEnable: false, // 抓拍时间点开关
        definedTime: '', // 抓拍时间点
        openingTime: '', //营业时间
        closingTime: '', //停业时间
        durationTimes: 3, //持续次数
        weekDay: '', // 抓拍日期
        output: [],
        detectAreaLabelIds: [],
        prompt: '', // 提示词，连锁跳转过来带的，不用展示，保存的时候再传回后端即可
        targetNums: 0, // 数量
        useStoreTime: true, // 门店时间优先
        hasDrawFrames: false, // 开启抽帧兼容
        globalJudge: false, // 开启全局审核
        detectItem: [] // 高级配置-检测项
      },
      preTaskForm:{solutionTaskName: '',specializedParams:{}},
      rules: {
        solutionTaskName: [
          { required: true, validator: checkName, trigger: 'blur' },
          { min: 0, max: 64, message: '不能超过64个字', trigger: 'blur' }
        ],
        weekDay: [{ required: true, validator: checkExecuteTime, trigger: 'change' }],
        executeTimeList: [{ validator: checkExecuteTimeList, trigger: 'blur' }],
        executeValDateList: [{ validator: checkExecuteValDateList, trigger: 'change' }],
        output: [{ type: 'array', required: true, message: '请选择推送配置', trigger: 'change' }],
        // detectAreaLabelIds: [{ type: 'array', required: true, message: '请选择关联区域标签', trigger: 'change' }],
        closingTime: [{ required: true, message: '请选择时间', trigger: 'change' }],
        openingTime: [{ required: true, message: '请选择时间', trigger: 'change' }],
        workwearLab: [{ required: true, validator: checkWorkwearLab, trigger: 'blur' }],
        workCapLab: [{ required: true, validator: checkWorkCapLab, trigger: 'blur' }],
      },
      selDate: {
        date: [],
        week: [],
        month: []
      },
      todayDate: getFormatTime(new Date()).substr(0, 10).replace(/-/g, '/'),
      weekDate: [{ label: '周一', value: 1 }, { label: '周二', value: 2 }, { label: '周三', value: 3 }, { label: '周四', value: 4 }, { label: '周五', value: 5 }, { label: '周六', value: 6 }, { label: '周日', value: 7 }],
      checkRepeatName: true,
      workLabModalVisible: false,
      isShowWorkwearLab: false, //是否显示工服配置项
      issuedDeviceVisible: false,
      publishStatus: 'PUBLISHED',
      taskSource: 'SELF',
      defaultGroupId: '',
      workLabList: [],
      showFramesErrTips: false,
      detectAreaLabelIdsList: [],
      showCollapseFlag: false,
      showCopy: false
    }
  },
  computed: {
    timeMinuteArr () {
      let arr = []
      for (var j = 1; j < 31; j++) { // 上报间隔1-30min
        arr.push(j)
      }
      return arr
    },
    outputList() {
      let subsystem = localStorage.getItem('sfSubsystem')
      let arr = [{ id: 'msg',name: '运营助手告警', showCopy: false }, { id: 'open',name: '三方消息推送', showCopy: this.taskForm.output.includes('open') }]
      let extra = [{ id: 'chainpatrol',name: 'AI点检', showCopy: false }]
      let cut = [{ id: 'open',name: '三方消息推送', showCopy: this.taskForm.output.includes('open') }]
      return subsystem === 'open' ? cut : 'retail' ? extra.concat(arr) : arr
    },
    currentTaskItem() {
      return { ...this.taskForm, taskFrom: 'solution' }
    },
    isAdd () {
      return ['add'].includes(this.addType)
    }
  },
  watch: {
  },
  async mounted () {
    this.addType = this.$route.query.addType
    this.taskSource = this.$route.query.taskSource || 'SELF'
    this.planSelf = this.$route.query.planSelf || ''
    this.defaultGroupId = this.$route.query.defaultGroupId || '' // 社区巡查跳转过来的，默认选中的小区/门店
    this.publishStatus = this.$route.query.publishStatus || 'PUBLISHED'
    this.taskForm.solutionTaskId = this.$route.query.solutionTaskId || ''
    this.solutionInfo.solutionId = this.$route.query.solutionId
    this.getSolutionInfo() // 获取该场景的一些场景信息
    await this.readParamAndDefault() // 获取该场景支持的配置项及默认值
    await this.getSolutionTaskConfigInfo() // 获取配置详情
    if (this.taskSource === 'PATROL') {
      this.$store.commit('setShowLeftMenu', false)
    }
  },
  methods: {
    copyTaskId() {
      const text = this.taskForm.solutionTaskId
      // 方法1: 使用现代 Clipboard API（推荐）
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text)
          .then(() => {
            this.$message.success('复制成功')
          })
          .catch(err => {
            // 降级到备用方案
            this.fallbackCopy(text);
          });
        return;
      }
      // 方法2: 备用方案（兼容旧浏览器）
      this.fallbackCopy(text);
  },
  fallbackCopy(text) {
    // 创建临时文本域
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    
    // 选中文本
    textArea.focus();
    textArea.select();
    
    try {
        // 执行复制命令
        const successful = document.execCommand('copy');
        if (successful) {
            this.$message.success('复制成功')
        } else {
            throw new Error('复制失败');
        }
    } catch (err) {
        console.error('复制失败:', err);
    } finally {
        // 清理临时元素
        document.body.removeChild(textArea);
    }
  },
    showCollapse () {
      this.showCollapseFlag = !this.showCollapseFlag
    },
    goConfigUseStoreTime() {
      window.open('/chain/index.html#/system/scene')
    },
    simulateVerify() {
      this.simulateVerifyModalVisible = true
    },
    convertToDianaRule() {
      this.$confirm({
        title: `是否转定制任务？`,
        message: `请谨慎操作`,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        convertToDianaRule({ solutionTaskId: this.taskForm.solutionTaskId}).then(res => {
          if(res.code === 0) {
            this.$message.success('操作成功！')
            setTimeout(() => { this.backConfirm() },1000)
          }
        })
      })
    },
    changeDrawFrames() {
      if (this.taskForm.hasDrawFrames) { // 打开时校验是否有抽帧的授权
        checkEnough().then(res => {
          if (!res.data.hasAuth) {
            this.$message.error('当前租户未购买抽帧抓图服务授权，请购买后开启该开关')
            this.taskForm.hasDrawFrames = false
          }
        })
      }
    },
    async configChannels() {
      let isEdit = await this.judgeIsEdit()
      if (isEdit) {
        this.$confirm('任务未进行保存，是否保存本次配置内容', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'question'
        }).then(async() => {
          this.submitConfig(() => {
            this.showChannelsDrawer()
          })
        }).catch(() => {
          this.showChannelsDrawer()
          this.getSolutionTaskConfigInfo() // 点了取消，也要更新一遍当前任务的最新详情
        })
      } else {
        this.showChannelsDrawer()
      }
    },
    showChannelsDrawer() {
      this.issuedDeviceVisible = true
      this.$nextTick(() => {
        this.$refs.channelDrawer.init(this.taskForm.solutionTaskId)
      })
    },
    changeDetectEmployee() {
      this.judgeShowWorkwearLab()
    },
    // 判断工服是否显示
    judgeShowWorkwearLab() {
      if (!this.judgeShow('workwearLab')) { // 配置项不支持工服，工服不显示
        this.isShowWorkwearLab = false
      } else { // 配置项支持工服
        if (!this.judgeShow('detectEmployee')) { // 配置项不支持员工检测，工服常显
          this.isShowWorkwearLab =  true
        } else { // 配置项支持员工检测
          this.isShowWorkwearLab =  this.taskForm.detectEmployee // 员工检测开关控制工服显示
        }
      }
    },
    judgeShow(val) {
      return this.supportFieldList.includes(val)
    },
    workLabMouseEvent(val, show) {
      val.btnVisible = show
    },
    async chooseWorkLab(item) {
      await this.getWorkLabList(item.chooseLabIds.join())
      if (this.workLabType === 'workwearLab') { // 修改工服
        this.workwearLabInfo = {...this.workwearLabInfo, ...item}
        this.$refs.form.validateField('workwearLab', () => {})
        if (this.workwearLabInfo.chooseLabIds.length) {
          let chooseNames = this.handleChooseLabNames(this.workwearLabInfo.chooseLabIds)
          this.workwearLabInfo = { ...this.workwearLabInfo, chooseLabNames: chooseNames }
        }
      }
      if (this.workLabType === 'workCapLab') { // 修改工帽
        this.workCapLabInfo = {...this.workCapLabInfo, ...item}
        this.$refs.form.validateField('workCapLab', () => {})
        if (this.workCapLabInfo.chooseLabIds.length) {
          let chooseNames = this.handleChooseLabNames(this.workCapLabInfo.chooseLabIds)
          this.workCapLabInfo = { ...this.workCapLabInfo, chooseLabNames: chooseNames }
        }
      }
    },
    editWordLabInfo(type, item) {
      this.workLabType = type
      this.$refs.workLabModal.init(type, item)
      this.workLabModalVisible = true
    },
    delWorkLabInfo(type) {
      this.$confirm(`是否清空比对库的选择？`, {
        message: '',
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'question'
      }).then(() => {
        if (type === 'workwearLab') {
          this.workwearLabInfo = {btnVisible:false, chooseLabIds: [], chooseLabNames: []}
        }
        if (type === 'workCapLab') {
          this.workCapLabInfo = {btnVisible:false, chooseLabIds: [], chooseLabNames: []}
        }
        this.$refs.form.validateField(type, () => {})
      })
    },
    handleLabBg(item) {
      let coverPicUrl = ''
      if (item && item.chooseLabIds && item.chooseLabIds.length > 0) { // 找到选中图库的有图的第一个数据作为封面
        for (let i = 0; i < this.workLabList.length; i++) {
          for (let j = 0; j < item.chooseLabIds.length; j++) {
            if (this.workLabList[i].coverPicUrl && (this.workLabList[i].labId === item.chooseLabIds[j])) {
              coverPicUrl = this.workLabList[i].coverPicUrl
              break
            }
          }
        }
      }
      return `url('${coverPicUrl ? coverPicUrl : require('../../assets/img/default_no data_nor.svg')}')`
    },
    handleBg(item) {
      let sceneBg = item.cardImageUrl ? item.cardImageUrl : 'default'
      return sceneBg.includes('http')?`url(${sceneBg})`: 'url(' + `${this.staticResourceOrigin}/static/userManual/poseidon/assets/img/scence/${sceneBg}/miniCardbg.png` + ')'
    },
    async handleSpecializedParams(formObj, all) { // all 是否可以直接全量替换key，处理编辑的原始
      let obj = {}
      if (!all) {
        formObj.workwearLab = this.workwearLabInfo.chooseLabIds.join(',') || ''
        formObj.workCapLab = this.workCapLabInfo.chooseLabIds.join(',') || ''
      }
      this.supportFieldList.forEach(keyName => {
        obj[keyName] = formObj[keyName]
      })
      return obj
    },
    async submitConfig(channelCb) {
      const savePassflag = await this.beforeSubmit() // 提交之前做一些判断和处理
      if (savePassflag) {
        let specializedParams = await this.handleSpecializedParams(this.taskForm) // 处理动态参数，多余的key删除
        let parmas = {}
        parmas.solutionId = this.solutionInfo.solutionId
        parmas.solutionTaskId = this.taskForm.solutionTaskId
        parmas.solutionTaskName = this.taskForm.solutionTaskName
        parmas.specializedParams = specializedParams
        if (this.judgeShow('detectAreaLabelIds')) {
          parmas.specializedParams.detectAreaLabelIds = this.taskForm.detectAreaLabelIds.join(',')
        }
        let proxy = ['add'].includes(this.addType) ? addSolutionTask : ['copy'].includes(this.addType) ? copySolutionTask : editSolutionTask
        this.loading = true
        let res = await proxy(parmas)
        this.loading = false
        if (res.code === 0) {
          this.$message.success('操作成功！')
          this.taskForm.solutionTaskId = this.taskForm.solutionTaskId ? this.taskForm.solutionTaskId : res.data
          if (['add'].includes(this.addType)) {
            this.$router.replace({ name: 'editSceneTask', query: { 
              solutionId: parmas.solutionId, 
              publishStatus: this.publishStatus, 
              taskSource: this.taskSource, 
              addType: 'edit', 
              solutionTaskId: this.taskForm.solutionTaskId
            } })
            this.addType = 'edit'
            await this.getSolutionTaskConfigInfo()
            await this.configChannels()
          } else {
            if (channelCb) {
              channelCb()
              await this.getSolutionTaskConfigInfo()
            } else {
              this.goBack()
            }
          }
        }
      }
    },
    async beforeSubmit() {
      let passflag = false
      if (this.taskForm.definedTimeEnable && this.taskForm.executeTimeList.length > 0) {
        this.taskForm.definedTime = this.taskForm.executeTimeList.map(item => item.value).join(',')
      }
      if (this.taskForm.intervalEnable && this.taskForm.executeValDateList.length > 0) {
        let execTimeStr = ''
        this.taskForm.executeValDateList.map(item => {
          if (!item.value[0].length) { // 编辑接口带过来的时间，时间组件会转成长的日期格式，那就直接取label
            execTimeStr += item.label + ','
          } else {
            execTimeStr += item.value[0] + ':00' + '-' + item.value[1] + ':00' + ','
          }
        })
        this.taskForm.execTime = execTimeStr.substr(0, execTimeStr.length - 1)
      }
      // await this.checkRepeatTaskName()
      this.$refs.form.validate(valid => {
        if (valid && this.checkRepeatName) {
          if ((this.supportFieldList.includes('intervalEnable') || this.supportFieldList.includes('definedTimeEnable')) && !this.taskForm.intervalEnable && !this.taskForm.definedTimeEnable) { // 有时间点抓拍或间隔抓拍的配置项但开关都是关着的
            this.$message.warning('请选择抓拍模式')
            return false
          }
          if (this.taskForm.execTime && this.taskForm.intervalEnable && !this.judgeTimeRange()) { // 间隔抓拍按钮开启时判断抓拍时间段
            this.$message.warning('抓拍时段不能交叉重叠')
            return false
          }
          if (this.judgeShow('detectItem') && this.taskForm.detectItem.every(s => !s.enable)) {
            this.$message.warning('高级配置中的检测项必须打开一个')
            return false
          }
          // if (this.isShowWorkwearLab && this.judgeShow('workCapLab') && (this.workwearLabInfo.labId === this.workCapLabInfo.labId)) { // 工装展示，工帽展示，工装和工帽不能选择同一个图库
          //   this.$message.warning('工服比对库和工帽比对库不能选择相同图库')
          //   return false
          // }
          passflag = true
        } else {
          return false
        }
      })
      return passflag
    },
    async judgeIsEdit() {
      if (this.taskForm.solutionTaskName !== this.preTaskForm.solutionTaskName) { // 任务名称改变了
        return true
      }
      if (this.judgeShow('detectAreaLabelIds')) { // 关联标签处理比对
        this.preTaskForm.specializedParams.detectAreaLabelIds = this.preTaskForm.specializedParams.detectAreaLabelIds || ''
        let detectAreaLabelIdsStr = this.taskForm.detectAreaLabelIds ? this.taskForm.detectAreaLabelIds.join(',') : ''
        if (detectAreaLabelIdsStr !== this.preTaskForm.specializedParams.detectAreaLabelIds) {
          return true
        }
      }
      let isEdit = false
      let nowSpecializedParams = await this.handleSpecializedParams(this.taskForm)
      for (let key in nowSpecializedParams) {
        if (!['detectAreaLabelIds'].includes(key) && (nowSpecializedParams[key] !== this.preTaskForm.specializedParams[key])) {
          isEdit = true
          break
        }
      }
      return isEdit
    },
    async blurHandler () {
      if(!this.taskForm.solutionTaskName) {
        return false
      }
      this.checkRepeatTaskName()
    },
    async checkRepeatTaskName () {
      this.checkRepeatName = false
      let param = { solutionTaskName: this.taskForm.solutionTaskName, exceptTaskId: this.taskForm.solutionTaskId }
      if (param.solutionTaskName) {
        let { data } = await checkRepeatSolutuonTaskName(param)
        this.checkRepeatName = !data // true表示有重复名称
        data && this.$message.error('任务名称重复')
      }
    },
    async getSolutionInfo() {
      let res = await getDetailBySolutionId({solutionId: this.solutionInfo.solutionId})
      this.solutionInfo = {...this.solutionInfo,  ...res.data }
    },
    async readParamAndDefault() { 
      let res = await readParamAndDefault({solutionId: this.solutionInfo.solutionId, taskSource: this.taskSource})
      if (res.code === 0 && res.data.supportField) {
        this.supportFieldList = res.data.supportField.split(',')
        this.judgeShowWorkwearLab()
        this.preTaskForm.specializedParams = await this.handleSpecializedParams({ ...this.taskForm, ...res.data.fieldDefault }, true) // 添加存一份默认数据，做修改对比
        this.taskForm = { ...this.taskForm, ...res.data.fieldDefault } // 编辑或复制，会遮盖this.taskForm的值，所以这里统一先赋默认值
        await this.handleFun()
        // if (this.supportFieldList.includes('workwearLab') || this.supportFieldList.includes('workCapLab')) {
        //   await this.getWorkLabList()
        // }
        if (this.supportFieldList.includes('detectAreaLabelIds')) {
          await this.getDetectAreaLabelIdsList() // 获取关联标签的数据
        }
      }
    },
    async getDetectAreaLabelIdsList () {
      let { code, data } = await getOnlyLabelList({ ruleId: '',labelTypes: 'MULTI_AREA,SINGLE_AREA,SHIELD_AREA' })
      if (code === 0) {
        this.detectAreaLabelIdsList = data
      }
    },
    async getWorkLabList (libraryIds) {
      if (!libraryIds) { // 不涉及图集
        return false
      }
      // 用涉及的图集id去请求
      let { code, data } = await getImageLibraryList({ libraryType: 'CLOUD', libraryIds: libraryIds })
      if (code === 0) {
        this.workLabList = data
        this.workLabList.forEach(item => {
          item.labId = item.id
          item.labName = item.name
        })
      }
    },
    async getSolutionTaskConfigInfo () {
      if (['edit','copy'].includes(this.addType)) { // 编辑或复制，获取配置详情， 后续迭代要注意复制的逻辑，因为复制后面会清空solutionTaskId
        this.loading = true
        let res = await getSolutionTaskConfigInfo({ solutionTaskId: this.taskForm.solutionTaskId })
        if (res.code === 0) {
          // 存一份原始数据，做修改对比
          this.preTaskForm.solutionTaskName = res.data.solutionTaskName
          this.preTaskForm.specializedParams = await this.handleSpecializedParams({ ...res.data.specializedParams }, true)

          this.taskForm = { ...this.taskForm, ...res.data.specializedParams }
          this.taskForm.solutionId = res.data.solutionId
          this.taskForm.solutionTaskId = this.addType === 'add' ? '' : res.data.solutionTaskId
          this.taskForm.solutionTaskName = res.data.solutionTaskName
          let libraryIds = (this.taskForm.workCapLab && this.taskForm.workwearLab) ? `${this.taskForm.workCapLab},${this.taskForm.workwearLab}` : this.taskForm.workCapLab ? this.taskForm.workCapLab : this.taskForm.workwearLab
          await this.getWorkLabList(libraryIds)
          await this.handleFun()
          if (this.taskForm.hasDrawFrames) {
            let framesRes = await checkEnough()
            this.showFramesErrTips = !framesRes.data.num
          }
        }
        this.loading = false
      }
    },
    // 处理后端数据，转换为前端用的
    async handleFun() {
      if (this.taskForm.definedTimeEnable) { // 抓拍时间点打开
        this.taskForm.executeTimeList = this.taskForm.definedTime.split(',').map(item => { return { value: item }})
      }
      if (this.taskForm.intervalEnable) { // 抓拍时间段打开
        this.taskForm.executeValDateList = this.taskForm.execTime.split(',').map(item => {
          return {
            value: [new Date(this.todayDate + ' ' + item.split('-')[0]), new Date(this.todayDate + ' ' + item.split('-')[1])],
            label: item
          }
        })
      }
      if (this.judgeShow('weekDay')) {
        this.selDate['week'] = []
        this.taskForm.weekDay && this.taskForm.weekDay.split(',').forEach((item) => {
          this.selDate['week'].push(parseInt(item))
        })
        this.taskForm.weekDay = this.selDate['week'].length ? Array.from(new Set(this.selDate['week'])).sort((a, b) => { return a > b }).join(',') : ''
      }
      if (this.judgeShow('workwearLab')) {
        // let index = this.workLabList.findIndex(item => item.labId === this.taskForm.workwearLab)
        // if (index > -1) {
        //   this.workwearLabInfo = { btnVisible:false, ...this.workLabList[index] }
        // }
        let chooseIds = this.taskForm.workwearLab ? this.taskForm.workwearLab.split(',') : []
        let chooseNames = this.handleChooseLabNames(chooseIds)
        this.workwearLabInfo = { btnVisible:false, chooseLabIds: chooseIds, chooseLabNames: chooseNames }
      }
      if (this.judgeShow('workCapLab')) {
        // let index = this.workLabList.findIndex(item => item.labId === this.taskForm.workCapLab)
        // if (index > -1) {
        //   this.workCapLabInfo = { btnVisible:false, ...this.workLabList[index] }
        // }
        let chooseIds = this.taskForm.workCapLab ? this.taskForm.workCapLab.split(',') : []
        let chooseNames = this.handleChooseLabNames(chooseIds)
        this.workCapLabInfo = { btnVisible:false, chooseLabIds: chooseIds, chooseLabNames: chooseNames }
      }
      if (this.judgeShow('detectAreaLabelIds')) {
        this.taskForm.detectAreaLabelIds = this.taskForm.detectAreaLabelIds.length ? this.taskForm.detectAreaLabelIds.split(',') : []
      }
      await this.judgeShowWorkwearLab()
    },
    handleChooseLabNames(ids) {
      let chooseNames = ''
      this.workLabList.forEach(v => {
        if (ids.includes(v.labId)) {
          chooseNames += `，${v.labName}`
        }
      })
      chooseNames = chooseNames.slice(1)
      return chooseNames
    },
    // 按周或月选择抓取时间点
    selectCaptureTime (item, type) {
      let index = this.selDate[type].indexOf(item)
      if (index === -1) {
        this.selDate[type].push(item)
      } else {
        this.selDate[type].splice(index, 1)
      }
      this.taskForm.weekDay = this.selDate[type].length ? Array.from(new Set(this.selDate[type])).sort((a, b) => { return a > b }).join(',') : ''
      this.$refs.form.validateField('weekDay', () => {})
    },
    // 添加按日抓取时间点
    addCaptureTime () {
      if (this.taskForm.executeTimeList.length < 20) {
        this.taskForm.executeTimeList.push({ value: '' })
      } else {
        this.$message.info('最多添加20个时间点')
      }
    },
    // 添加按日抓取时间段
    addExecuteValDate () {
      if (this.taskForm.executeValDateList.length < 5) {
        this.taskForm.executeValDateList.push({ value: ['00:00', '23:59'], label: '00:00 - 23:59' })
      } else {
        this.$message.info('最多添加5个时间段')
      }
    },

    // 抓拍时间点改变
    executeTimeListChange () {
      this.$refs.form.validateField('executeTimeList', () => {})
    },
    // 抓拍时间段改变
    executeValDateListChange (val, index) {
      this.taskForm.executeValDateList[index].label = val.join('-')
    },
    judgeTimeRange() {
      const timeRanges = this.taskForm.execTime.split(',').map(range => {
        const [start, end] = range.split('-').map(t => t.trim());
        return {
          start: this.parseTimeToMinutes(start),
          end: this.parseTimeToMinutes(end)
        };
      });
      for (let i = 0; i < timeRanges.length; i++) {
        for (let j = i + 1; j < timeRanges.length; j++) {
          const a = timeRanges[i];
          const b = timeRanges[j];
          if (a.start < b.end && a.end > b.start) {
            return false;
          }
        }
      }
      return true;
    },
    parseTimeToMinutes(timeStr) {
      const [hours, minutes] = timeStr.split(':').map(Number)
      return hours * 60 + minutes
    },
    // 删除按日抓取时间点
    delCaptureTime (index) {
      this.taskForm.executeTimeList.splice(index, 1)
      this.$refs.form.validateField('executeTimeList', () => {})
    },
    // 删除按日抓取时间段
    delExecuteValDate (index) {
      this.taskForm.executeValDateList.splice(index, 1)
    },
    // 检重
    checkRepeat (arr) {
      let newArr = []
      let flag = false
      arr.forEach(item => {
        if (newArr.indexOf(item) > -1) {
          flag = true
        } else {
          newArr.push(item)
        }
      })
      return flag
    },
    async backConfirm () {
      let isEdit = await this.judgeIsEdit()
      if (isEdit) {
        this.$confirm(['add','copy'].includes(this.addType) ? '任务未进行保存，平台不会保存本次配置内容' : '平台不会保存本次调整内容', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'question'
        }).then(async() => {
          this.goBack()
        })
      } else {
        this.goBack()
      }
    },
    goBack () {
      if (this.taskSource === 'PATROL') {
        window.close()
      } else {
        this.$router.push({ name: 'sceneConfig', query: { 
          publishStatus: this.publishStatus,
          taskSource: this.taskSource
        } })
      }
    },
  }
}
</script>

<style lang="scss" scoped>
.copyId{
  cursor: pointer;
  color: #1E7FFF;
  margin-left: -8px;
  font-size: 12px;
  display: inline-block;
  vertical-align: top;
  margin-top: 3px;
}
.globalJudge_warp{
  display: flex;
  align-items: center;
  height: 32px;
  .global_judge_num{
    width: 100px;
    margin: 0 6px 0 16px;
  }
}
.drawFrames_warp{
  display: flex;
  align-items: center;
  height: 32px;
  .FramesErrTips{
    font-size: 12px;
    color:red;
    margin-left: 12px;
  }
}
.confidenceThreshold_wrap{
  display: flex;
  float: right;
  margin-left:16px;
  height: 32px;
  &>div{
    display: inline-block;
  }
}
::v-deep .confidence_input{
  width: 68px;
  .el-input{
    input{
      border-left: none;
    }
  }
}
.tip_text{
  font-size: 12px;
  color: rgba(0,0,0,0.40);
  margin-left:150px;
  margin-bottom: 16px;
  margin-top:-12px
}
.card{
  width: 200px;
  height: 94px;
  background: #FFFFFF;
  border: 1px solid #EEEFF2;
  border-radius: 8px;
  position: relative;
  margin-top: 2px;
  .top_text{
    display: flex;
    align-items: center;
    width: 100%;
    height: 52px;
    font-family: MicrosoftYaHeiUISemibold;
    font-size: 14px;
    color: #FFFFFF;
    font-weight: 600;
    padding-left: 12px;
  }
  .bot_text{
    max-width: 190px;
    width: 100%;
    background: #FFFFFF;
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
    height: 40px;
    line-height: 40px;
    padding-left: 12px;
    font-family: MicrosoftYaHeiUI;
    font-size: 12px;
    color: rgba(103,103,103,0.72);
  }
}
.work_club_wrap{
  width: 355px;
  height: 74px;
  background: rgba(226,227,230,0.10);
  border: 1px dashed rgba(230,227,226,0.70);
  border-radius: 8px;
  .club{
    display: flex;
    align-items: center;
    position: relative;
    .num_tag{
      position: absolute;
      right: 0;
      top: 0;
      width: 40px;
      height: 34px;
      line-height: 20px;
      padding-right: 6px;
      text-align: right;
      background: linear-gradient(to bottom left, #C1D8F1 0%, #C1D8F1 50%, transparent 50%, transparent 100%);
    }
    .img_des{
      font-family: MicrosoftYaHeiUISemibold;
      font-size: 14px;
      color: #1A1A1A;
      font-weight: 600;
      padding-left: 12px;
      line-height: 20px;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
      width: 200px;
    }
    .img_wrap{
      width: 123px;
      height: 72px;
      border-top-left-radius: 8px;
      border-bottom-left-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      .ope_btn{
        width: 32px;
        height: 32px;
        opacity: 0.6;
        background: #000000;
        border-radius: 4px;
        cursor: pointer;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        &:hover{
          opacity: 0.9;
        }
      }
    }
  }
  .empty_club{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: #A1A1A1;
    height: 100%;
    cursor: pointer;
    .jiahao{
      font-size: 32px;
      color: #8e8e8e;
      height: 26px;
    }
  }
}
.analysisMode-mod{
  display: flex;
}
.capture_wrap{
  width: 100%;
  background: rgba(0, 0, 0, 0.04)!important;
  padding-top: 10px;
  padding-bottom: 1px;
  margin-bottom:16px;
  padding-right: 16px;
  .time-point{
    margin-bottom: 5px;
    width: 418px;
    i{
      margin-left: 3px;
    }
  }
}
.advance_params{
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 8px;
  .title{
    font-size: 18px;
    color: rgba(0, 0, 0, 0.90);
    font-weight: bold;
    padding-left: 70px;
    padding-bottom: 24px;
  }
  .arrow{
    color: #1E7FFF;
    cursor: pointer;
    display: flex;
    align-items: center;
  }
}
.detect_wrap{
  padding-top: 16px;
}
.item_line{
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  .name{
    width: 100px;
    text-align: right;
    margin-right: 12px;
  }
}
.content-title {
  margin: 0 auto;
  padding: 40px 0 22px 70px;
  font-size: 18px;
  color: rgba(0, 0, 0, 0.90);
  font-weight: bold;
}
.page-content{
  margin: 0 auto;
  .main_wrap{
    width: 810px;
    margin: 0 auto;
  }
}
.date-content {
  width: 500px;
  .date-block {
    width: 48px;
    height: 32px;
    line-height: 32px;
    text-align: center;
    display: inline-block;
    margin-right: 8px;
    margin-bottom: 6px;
    cursor: pointer;
    background: rgba(0,0,0,0.04);
    border: 1px solid rgba(0,0,0,0.12);
    border-radius: 4px;
  }
  .date-block-sel {
    background: #4692FF;
    color: #ffffff;
  }
}
.foot_btns {
  background: rgba(0, 0, 0, 0.04);
  text-align: center;
  padding: 12px;
  position: absolute;
  bottom: 0;
  width: 100%;
}
</style>
<style lang="scss">
.editSceneTask-scrollbar__wrap {
  height: calc(100VH - 135px);
  .el-form-item{
    margin-bottom: 16px;
  }
  .capture_wrap{
    .el-form-item__label{
      width: 110px!important;
    }
    .el-form-item__content{
      margin-left: 110px!important;
      button {
        width: 400px;
        max-width: 400px;
        border-radius: 2px;
        border: 1px dotted rgba(0,0,0,0.20);
      }
    }
  }
  .time-point{
    .el-input, .el-input__inner {
      width: 400px;
    }
  }
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
        cursor: pointer;
        :hover{
          color: #2080f7;
        }
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
</style>

