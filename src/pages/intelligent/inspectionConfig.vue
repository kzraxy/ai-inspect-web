<template>
  <div class="intelligent-inspectionConfig">
    <div style="width: 100%;">
      <!-- <div style="text-align:left;font-size:18px;font-weight:bold;margin-bottom:16px;">定制任务（{{totalNum}}）</div> -->
      <el-alert type="info" simple  show-icon :closable="false" v-if="hasServiceLimit" style="margin-bottom:11px">
        <div slot="title" simple class="el-alert-text">
          <span>您当前的服务存在部分到期或超限，导致部分智能分析任务被系统自动禁用。<span class="link" @click="toViewServiceDetail">查看服务详情</span><span class="link" @click="toDealWith">如何处理？</span></span>
        </div>
      </el-alert>
      <div class="search_box">
        <div class="search-info">
          <el-radio-group v-model="searchForm.enableStatus" class="search_radio_wrap" type="simple" @change="search">
            <el-radio-button v-for="(item,index) in enableStatusList" :key="index" :label="item.label">{{ `${item.name}(${item.num})` }}</el-radio-button>
          </el-radio-group>
          <el-select v-model="searchForm.operatingStatus" filterable @change="search" style="width:160px" clear>
            <el-option label="全部通道运行状态" value=""></el-option>
            <el-option label="正常" value="NORMAL"></el-option>
            <el-option label="异常" value="ABNORMAL"></el-option>
          </el-select>
          <el-select v-model="searchForm.modelSource" filterable @change="search" clear>
            <el-option label="全部算法模型" value=""></el-option>
            <el-option label="平台算法模型" value="PLATFORM"></el-option>
            <el-option label="本地设备算法模型" value="LOCAL"></el-option>
          </el-select>
          <el-select v-model="searchForm.algorithmModelId" filterable @change="search" clear>
            <el-option v-for="(item,index) in algorithmsModalList" :key="index" :label="item.modelName" :value="item.modelId">
            </el-option>
          </el-select>
          <el-select v-model="searchForm.taskType" filterable @change="search" clear>
            <el-option v-for="(item,index) in taskTypeList" :key="index" :label="item.platformName" :value="item.platformId">
            </el-option>
          </el-select>
          <el-select v-model="searchForm.analysisMode" filterable @change="search" clear>
            <el-option v-for="(item,index) in analysisModeList" :key="index" :label="item.analysisName" :value="item.analysisMode">
            </el-option>
          </el-select>
          <el-input v-model="searchForm.taskNameLike" placeholder="请输入任务名称" suffix-icon="h-icon-search" clearable
            :on-icon-click="search" :clear-icon-click="clearIconClick" @keyup.enter.native="changeTaskNameLike" @change="changeTaskNameLike">
          </el-input>
        </div>
        <div class="search_right_btn_wrap">
          <el-button @click="search" type="primary">查询</el-button>
          <el-button @click="resetSearch" type="default" style="margin-left: 16px;">重置</el-button>
        </div>
      </div>
      <div class="search-mod">
        <div class="base-develop">
          <div style="min-width: 200px;">
            <el-button type="iconButton" icon="h-icon-add" @click="addTask">添加</el-button>
            <el-button type="iconButton" icon="h-icon-export" @click="exportTask(null)">导出</el-button>
            <el-button type="iconButton" icon="h-icon-delete" @click="delTask(null)" :disabled="isDisabled">删除</el-button>
          </div>
        </div>
      </div>
      <!-- 表格 -->
      <div class="table-mod config-table" >
        <el-table :height="tableHeight" :data="tableData" @selection-change="tableSelect" force-scroll>
          <el-table-column type="selection" width='50'></el-table-column>
          <el-table-column prop="taskName" label="任务名称" min-width='220' width="12%" fixed>
            <template slot-scope="scope">
              <div class="taskName_wrap">
                <span @click="goToTaskDetail(scope.row, 'normal')" class="task_name" style="cursor: pointer;color:#2080f7">{{scope.row.taskName}}</span>
                  <el-tooltip popper-class="presentation_popper" v-if="scope.row.isDemo"
                  content="演示模型仅用于项目前期效果演示，最多可分析50路通道且有效期为2个月，到期后会自动失效。如需长期大规模使用，请重新训练模型。" placement="right-start">
                    <div class="icon icon-font h-icon-help"></div>
                  </el-tooltip>
                <el-tooltip v-if="scope.row.enableLargeModelFilter" :content="`大模型过滤数量：${scope.row.largeModelFilterNum}个`" placement="right-start">
                  <div class="icon icon-font h-icon-help"></div>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="algorithmName" label="算法名称" min-width='190' width="12%">
            <template slot-scope="scope"><span>{{scope.row.algorithmName || '-'}}</span></template>
          </el-table-column>
          <el-table-column prop="algorithmVersion" label="算法版本" min-width='100' width="8%">
            <template slot-scope="scope">
              <span>
                {{scope.row.algorithmVersion ? (scope.row.algorithmStatus === 3 ? scope.row.algorithmVersion + '(算法下线)': scope.row.algorithmStatus === 2 ? scope.row.algorithmVersion + '(算法有更新)':scope.row.algorithmVersion) : '-'}}
                {{scope.row.modelPrecision==='HIGH_PRECISION'?'(高精度模型)':scope.row.modelPrecision==='ULTRA_HIGH_PRECISION'?'(观澜大模型)':''}}
                {{scope.row.smallTargetEnhance==='SMALL_TARGET_ENHANCE'?'(双检测模型)':''}}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="taskTypeStr" label="设备类型" min-width='140' width="7%">
            <template slot-scope="scope">
              <span>{{scope.row.taskTypeStr || '-'}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="analysisModeStr" label="分析模式" min-width='160' width="8%">
            <template slot-scope="scope"><span>{{scope.row.analysisModeStr || '-'}}</span></template>
          </el-table-column>
          <el-table-column prop="publishStatus" label="任务状态" min-width='260' width="14%">
            <template slot-scope="scope">
              <div class="status-mod">
                <!-- 禁用时，不展示下发状态 -->
                <div style="flex: 1;" v-if="!scope.row.enable">
                  <div class="enable_info_wrap publish_status_wrap">
                    <div class="status_icon">
                      <i class="status_close_icon"></i>
                    </div>
                    <div class="status_text">禁用<span class="text_reason">{{scope.row.enableInfoText}}</span></div>
                  </div>
                </div>
                <!-- 启用时，展示下发状态 -->
                <div style="flex: 1;" v-if="scope.row.enable">
                  <div class="publish_status_wrap" v-if="([2, 6, 7, 5, 9, 10, 11].includes(scope.row.publishStatus))">
                    <div class="status_icon">
                      <i v-if="[2, 6].includes(scope.row.publishStatus)" class="status_icon_publishing"></i>
                      <i v-if="[7, 10].includes(scope.row.publishStatus)" class="status_icon_fail"></i>
                      <i v-if="[5].includes(scope.row.publishStatus)" class="status_icon_publish_success"></i>
                    </div>
                    <div class="status_text">{{translatePublishStatus(scope.row.publishStatus)}}</div>
                    <div class="status_operate_btn"></div>
                  </div>
                  <div class="publish_status_wrap" v-if="scope.row.publishStatus === 3">
                    <div class="status_icon"><i class="status_icon_fail"></i></div>
                    <div class="status_text" v-if="scope.row.publishErrorCount > 0" @click="goToTaskDetail(scope.row, 'normal')" style="color:#FA3239;cursor: pointer">
                      {{['DCT4'].includes(scope.row.taskType) ? '任务初始化失败 >': `下发失败${scope.row.publishErrorCount}台 >`}}
                    </div>
                    <div class="status_operate_btn">
                      <i class="status_icon_republish" @click="publishAgain(scope.row)" title="重新下发"></i>
                    </div>
                  </div>
                  <div class="publish_status_wrap" v-if="scope.row.publishStatus === 4">
                    <div class="status_icon">
                      <i class="status_icon_publish_success"></i>
                    </div>
                    <div class="status_text publish_some_fail">
                      <div>下发成功{{scope.row.publishSuccessCount}}台</div>
                      <div v-if="scope.row.publishErrorCount > 0" @click="goToTaskDetail(scope.row, 'normal')" style="color:#FA3239;cursor: pointer;margin-left:10px">
                        失败{{scope.row.publishErrorCount}}台 ></div>
                    </div>
                    <div class="status_operate_btn">
                      <i class="status_icon_republish" @click="publishAgain(scope.row)" title="重新下发"></i>
                    </div>
                  </div>
                  <div class="publish_status_wrap" v-if="!scope.row.publishStatus">
                    <div class="status_icon">
                      <i class="status_open_icon"></i>
                    </div>
                    <div class="status_text">启用</div>
                  </div>
                </div>
                <el-switch class="status_operate_btn" @change="beforeChangeState(scope)" v-model="scope.row.enable" :disabled="(scope.row.modelSource==='LIGHT_KT2')"></el-switch>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" min-width='170' width="9%">
            <template slot-scope="scope">
              {{getFormatTime(scope.row.createTime)}}
            </template>
          </el-table-column>
          <el-table-column prop="modelSourceStr" label="模型来源" min-width='150' width="8%"></el-table-column>
          <el-table-column label="通道运行" min-width='100' width="6%">
            <template slot-scope="scope">
              <div class="work_wrap" v-if="!scope.row.operatingStatus">-</div>
              <div class="work_wrap" v-if="scope.row.operatingStatus==='NORMAL'">正常</div>
              <div class="work_wrap" v-if="scope.row.operatingStatus==='ABNORMAL'" style="display: flex;flex-direction: column;align-items: flex-start;">
                <div class="abnormal">异常</div>
                <el-button @click="showAbnormalReason(scope.row)" type="text" class="hasLineBtn" style="height: 20px">查看异常原因</el-button>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="规则区域绘制" min-width='110' fixed="right"  width="6%">
            <template slot-scope="scope">
              <el-button @click="drawRuleArea(scope.row)" type="text" class="table_btn btn_has_padding hasLineBtn" :disabled="!scope.row.hasPolygonRule||(scope.row.modelSource==='LIGHT_KT2')">关联</el-button>
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width='210' fixed="right"  width="10%">
            <template slot-scope="scope">
              <el-button @click="goToTaskDetail(scope.row, 'normal')" type="iconButton" icon="h-icon-password_visible" title="查看" class="table_btn"></el-button>
              <el-button @click="editTask(scope.row.taskId,scope.row.publishStatus,scope.row.yunmouAlgTaskStatus)" type="iconButton" icon="h-icon-edit" title="编辑" class="table_btn" :disabled="(scope.row.modelSource==='LIGHT_KT2')"></el-button>
              <el-button @click="goToChannelConfig(scope.row)" :disabled="disabledHugeChannelConfig(scope.row)" type="iconButton" icon="h-icon-liveview" 
                :title="disabledHugeChannelConfig(scope.row) ? '' : '云端大量通道配置'" class="table_btn"></el-button>
              <el-button @click="simulateVerify(scope.row)" type="iconButton" icon="icon iconfont iconfakeValid" title="模拟验证" class="table_btn iconmini" :disabled="scope.row.analysisMode!=='CLOUD_POLLING_SNAP'"></el-button>
              <el-button @click="delTask(scope.row)" type="iconButton" icon="h-icon-delete" title="删除" class="table_btn" :disabled="(scope.row.modelSource==='LIGHT_KT2')"></el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 分页 -->
      <div class="pagePart">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :page-sizes="[10, 20, 50, 100]"
          :current-page="searchForm.pageNo"
          :page-size="searchForm.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalNum">
        </el-pagination>
      </div>
    </div>
    <simulateVerifyModal :visible.sync="simulateVerifyModalVisible" :cardInfo="currentTaskItem" ></simulateVerifyModal>
    <abnormalReasonModal :visible.sync="abnormalReasonModalVisible" @flash="queryList" :abnormalReasonArea="abnormalReasonArea" ref="abnormalReasonModal"></abnormalReasonModal>
  </div>
</template>

<script>
import _ from 'lodash'
import { getInspectionConfigList, delTask, changeState, getAlgorithmsList, taskTypeList, publishAgain, getServiceLimitedInfo, checkTaskIsRefBySecondaryAnalysis, 
  getTaskEnableStatusNum, getExportTaskId, getExportUrl} from './proxy'
import { getFormatTime } from '@/assets/libs/util'
import { SERVICE_OFFLINE_CODE, NO_AUTH_CODE } from '@/constant'
import abnormalReasonModal from './inspectionConfigModal/modal/abnormalReasonModal'
import simulateVerifyModal from '@/components/simulateVerifyModal'
export default {
  components: { abnormalReasonModal, simulateVerifyModal },
  beforeRouteEnter (to, from, next) {
    to.meta.isBack = (['taskDetail', 'inspectionConfigDetail', 'drawRuleAreasNew'].includes(from.name))
    next()
  },
  activated () {
    if (!this.$route.meta.isBack) {
      this.resetSearch() // 重置查询条件
    } else {
      this.$route.meta.isBack = false
      this.queryList()
    }
  },
  mounted () {
    this.getAlgorithmsList()// 获取算法模型
    this.getTaskTypeList()// 获取任务类型
    this.getAnalysisModeList()// 目前前端写死的
    this.getServiceInfo()
    this.getTaskEnableStatusNum()
    this.handleResize = () => {
      this.abnormalReasonArea = (document.body.clientWidth > 1440) ? [1246, 801] : [932, 680]
      this.$nextTick(() => {
        this.tableHeight = document.body.clientHeight - 210
      })
    }
    window.addEventListener('resize', this.handleResize)
    this.handleResize()
  },
  computed: {
    isDisabled () {
      return this.tableSelData.length === 0
    }
  },
  data () {
    return {
      loading: null,
      percentageText: '导出中...',
      exportTaskId: '', // 导出任务的id
      abnormalReasonModalVisible: false,
      abnormalReasonArea: [1246, 801],
      enableStatusList: [{label: 'ALL', name: '全部', num: 0}, {label: 'ENABLE', name: '启用', num: 0}, {label: 'DISABLE', name: '禁用', num: 0}],
      tableHeight: 0,
      searchForm: {
        taskNameLike: '',
        pageSize: 20,
        pageNo: 1,
        modelSource: '',
        operatingStatus: '',
        taskType: '', // 任务类型
        analysisMode: '', // 分析模式
        algorithmModelId: '', // 算法模型Id
        enableStatus: 'ENABLE'
      },
      currentDrawTaskId: '', // 当前点击的列表项的任务id——taskId
      algorithmsModalList: [], // 算法模型下拉框
      taskTypeList: [], // 任务类型下拉框
      analysisModeList: [], // 分析模式下拉框
      unnormalInfo: [], // 异常情况的列表
      tableSelData: '',
      totalNum: 0, // 总条数
      tableData: [], // 列表数据
      currentTaskItem: {},
      simulateVerifyModalVisible: false,
      hasServiceLimit: false // 是否存在服务超期
    }
  },
  watch: {
    percentageText (val) {
      this.loading.text = val
    }
  },
  methods: {
    simulateVerify(item) {
      this.currentTaskItem = { ...item, taskFrom: 'customized', solutionTaskId: item.taskId }
      this.simulateVerifyModalVisible = true
    },
    disabledHugeChannelConfig(row) {
      return !( ['CLOUD', 'DCT4'].includes(row.taskType) && !['SECONDARY_FILTER'].includes(row.analysisMode) )
    },
    resetSearch() {
      this.searchForm = {
        taskNameLike: '',
        pageSize: 20,
        pageNo: 1,
        modelSource: '',
        operatingStatus: '',
        taskType: '', // 任务类型
        analysisMode: '', // 分析模式
        algorithmModelId: '', // 算法模型Id
        enableStatus: 'ENABLE'
      }
      this.queryList()
      this.getTaskEnableStatusNum()
    },
    async exportTask () {
      let params = { ...this.searchForm}
      delete params.pageNo
      delete params.pageSize
      let res = await getExportTaskId(params) // 获取导出任务的id
      if (res.code === 0) {
        this.exportTaskId = res.data || ''
        this.getExportUrl()
        this.loading = this.$loading({ fullscreen: true, text: this.percentageText, customClass: 'export_fullscreen' })
      }
    },
    getExportUrl() { // 通过导入任务的id轮询导出状态
      getExportUrl({ exportTaskId: this.exportTaskId }).then(result => {
        if (+result.code === 0) {
          this.percentageText = '导出中...，已完成' + result.data.process + '%'
          if (result.data.exportStatus === 'SUCCESS') { // 完成了导出
            this.loading.close()
            window.open(result.data.downloadUrl)
          } else if (result.data.exportStatus === 'PROCESS') { // 还是导出中，每一秒再请求一次
            setTimeout(() => {
              this.getExportUrl()
            }, 1000)
          } else if (result.data.exportStatus === 'FAIL') { // 后端传回状态导出失败
            this.loading.close()
            this.$message.error(result.data.failMessage)
          }
        }
      })

    },
    translatePublishStatus (status) {
      let obj = {
        2: '下发中',
        6: '删除中',
        7: '删除失败',
        5: '下发成功',
        9: '无设备任务',
        10: '保存失败',
        11: '无设备任务',
      }
      return obj[status]
    },
    async getTaskEnableStatusNum () {
      let { data } = await getTaskEnableStatusNum()
      this.enableStatusList[0].num = data.totalNum
      this.enableStatusList[1].num = data.enableNum
      this.enableStatusList[2].num = data.disableNum
    },
    // 清除输入框内容
    clearIconClick () {
      this.searchForm.taskNameLike = ''
      this.searchForm.pageNo = 1
      this.search()
    },
    // 转换禁用文案函数
    changeEnableInfoToText (val) {
      if ([1, 2, 3].includes(val)) {
        return '授权不足'
      } else if (val === 4) {
        return '算法已下线'
      } else if (val === 5) {
        return '服务已到期'
      } else {
        return ''
      }
    },
    // 获取服务是否存在超期
    async getServiceInfo () {
      let { code, data } = await getServiceLimitedInfo()
      if (code === 0) {
        this.hasServiceLimit = data.flag
        if(this.hasServiceLimit) {
          this.tableHeight = document.body.clientHeight - 250
        }
      }
    },
    // 前往任务详情
    goToTaskDetail (row, type) {
      this.$router.push({ name: 'taskDetail', params: { taskId: row.taskId, type: type, serviceType: this.serviceType } })
    },
    toViewServiceDetail () {
      this.$router.push({ name: 'serviceManage' })
    },
    toDealWith () {
      // window.open(`${window.location.protocol}//${window.location.host}/static/userManual/intelligentAnalysis/index.html`)
      window.open(`https://www.hik-cloud.com/help-center/index.html#/manualList?platformCode=retail&nodeId=f5a60777a7a54911b34d7871f7274373`)
    },
    // 点击我知道了
    isKnow (index) {
      this.unnormalInfo.splice(index, 1)
    },
    // 点击我知道的重新下发
    isKnowAndPublishAgain (index, item) {
      this.unnormalInfo.splice(index, 1)
      this.publishAgain(item)
    },
    // 重新下发
    publishAgain (item) {
      publishAgain({ taskId: item.taskId }).then((res) => {
        if (res.code === 0) {
          this.$message.success('重新下发中')
          this.queryList()
        }
      })
    },
    // 获取算法模型下拉框
    getAlgorithmsList () {
      this.algorithmsModalList = [{ 'modelId': '', 'modelName': '全部算法名称' }]
      getAlgorithmsList().then((res) => {
        if (res.code === 0 && res.data) {
          this.algorithmsModalList = this.algorithmsModalList.concat(res.data)
          this.searchForm.algorithmModelId = this.$route.params.modelId || '' // 接收路由传过来的算法模型id
          this.queryList()// 放在这里，避免路由跳转过来的二次刷新，优化体验
        }
      })
    },
    // 获取任务类型下拉框
    getTaskTypeList () {
      this.taskTypeList = [{ 'platformId': '', 'platformName': '全部设备类型' }]
      taskTypeList().then((res) => {
        if (res.code === 0 && res.data) {
          this.taskTypeList = this.taskTypeList.concat(res.data)
        }
      })
    },
    // 获取全部分析模式
    getAnalysisModeList () {
      this.analysisModeList = [
        { 'analysisMode': '', 'analysisName': '全部分析模式' }, 
        { 'analysisMode': 'CLOUD_POLLING_SNAP', 'analysisName': '云端定时抓图' }, 
        { 'analysisMode': 'POLLING_SNAP_NEW', 'analysisName': '定时抓图' }, 
        { 'analysisMode': 'VIDEO', 'analysisName': '实时视频' }, 
        { 'analysisMode': 'POLLING_VIDEO', 'analysisName': '轮巡视频' },
        { 'analysisMode': 'SECONDARY_FILTER', 'analysisName': '其他任务二次分析' },
        { 'analysisMode': 'DIANA_SECONDARY_FILTER', 'analysisName': '运营助手二次分析' },
        { 'analysisMode': 'INVOICE_PERSION_FILTER', 'analysisName': '有单无人分析' },
        { 'analysisMode': 'POLLING_SNAP', 'analysisName': '定时抓图(旧)' }, 
      ]
    },
    // 删除
    delTask (val) {
      this.$confirm('是否确认删除?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'question'
      }).then(async () => {
        let idList = []
        let taskTypeStrList = []// 判断是否有异步删除的，即非'云'的
        if (val) { // 单个删除
          idList[0] = val.taskId
          taskTypeStrList[0] = val.taskTypeStr
        } else { // 批量删除
          idList = this.tableSelData.map((item) => {
            return item.taskId
          })
          taskTypeStrList = this.tableSelData.map((item) => {
            return item.taskTypeStr
          })
        }
        let noDelArr = idList.filter(item => { return item.modelSource === 'LIGHT_KT2' }) || []// 包含轻量级超脑任务
        if (noDelArr.length > 0) {
          this.$message.info('所选任务中包含轻量级超脑任务，不能删除，请重新选择！')
          return false
        }
        let secondFilterRes = await checkTaskIsRefBySecondaryAnalysis(idList)
        if (secondFilterRes.data && secondFilterRes.data.length > 0) {
          let nameString = ''
          secondFilterRes.data.forEach(item => {
            let filterName = item.targetTasks.map(v => v.taskName).join('、')
            nameString += `任务【${item.taskName}】已被：${filterName} 引用；`
          })
          let tip = nameString.substring(0, nameString.length - 1)
          this.$confirm(`再次确认删除？`, {
            message: tip,
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            size: 'large',
            type: 'question'
          }).then(() => {
            this.finallyDelTask(taskTypeStrList, idList)
          })
        } else {
          this.finallyDelTask(taskTypeStrList, idList)
        }
      }).catch(() => {})
    },
    async finallyDelTask (taskTypeStrList, idList) {
      let res = await delTask(idList)
      if (res.code === 0) {
        let syncDeleteFlag = false
        taskTypeStrList.map(item => {
          if (item.indexOf('云') < 0) { // 即删除的任务有非'云'，即异步的
            syncDeleteFlag = true
          }
        })
        this.$message.success(syncDeleteFlag ? '删除中，请稍后查看结果' : '删除成功')
        this.queryList()
        this.getTaskEnableStatusNum()
      }
    },
    // 打开通道运行异常弹框
    showAbnormalReason(row) {
      this.abnormalReasonArea = (document.body.clientWidth > 1440) ? [1246, 801] : [932, 680]
      this.abnormalReasonModalVisible = true
      this.$refs.abnormalReasonModal.init(row)
    },
    // 前往绘制规则区域
    async drawRuleArea (row) {
      this.currentDrawTaskId = row.taskId// 当前点击的列表项的任务id——taskId
      await this.queryList()
      let index = this.tableData.map(item => { return item.taskId }).indexOf(this.currentDrawTaskId)
      let publishStatus = this.tableData.map(item => { return item.publishStatus })[index]
      if (publishStatus === 2 || publishStatus === 6 || publishStatus === 7) {
        this.$msgbox({
          title: `请在${publishStatus === 2 ? '下发' : '删除'}完成后再来绘制。`,
          message: `任务正在${publishStatus === 2 ? '下发...' : '删除...'}`,
          confirmButtonText: '知道了',
          type: 'info'
        })
        return false
      }
      if (publishStatus === 6 || publishStatus === 7) {
        this.$msgbox({
          title: `删除中与删除失败任务禁止操作`,
          message: `任务禁止操作`,
          confirmButtonText: '知道了',
          type: 'info'
        }).then(() => {}).catch(() => {})
        return false
      }
      // let isCloudOrDCT4 = ['CLOUD', 'DCT4'].includes(row.taskType)
      // this.$router.push({ name: 'drawRuleAreas', params: { taskId: row.taskId, isCloudOrDCT4: isCloudOrDCT4, serviceType: this.serviceType } })
      this.$router.push({ name: 'drawRuleAreasNew', params: { taskId: row.taskId, serviceType: this.serviceType, taskName: row.taskName } })
    },
    // 编辑
    editTask (taskId, publishStatus, yunmouAlgTaskStatus) {
      if (publishStatus === 2 || publishStatus === 6 || publishStatus === 7 || yunmouAlgTaskStatus === 'progress') {
        this.$message.info(`该任务${(publishStatus === 2 || yunmouAlgTaskStatus === 'progress') ? '正在下发中' : publishStatus === 6 ? '正在删除中' : '删除失败，只能操作删除'}，不允许编辑`)
        return false
      }
      this.$router.push({ name: 'inspectionConfigDetail', params: { isAdd: 'edit', taskId: taskId, serviceType: this.serviceType } })
    },
    goToChannelConfig(row) {
      let url = this.$commonUtils.judgeEnv() + `/AI-inspect/index.html#/intelligent/inspectionConfig/${this.serviceType}/channelConfigPage?taskId=${row.taskId}`
      window.open(url)
    },
    // 新增
    addTask () {
      this.$router.push({ name: 'inspectionConfigDetail', params: { isAdd: 'add', taskId: false, serviceType: this.serviceType } })
    },
    tableSelect (val) {
      this.tableSelData = val
    },
    changeTaskNameLike: _.debounce(function () {
      this.searchForm.pageNo = 1
      this.queryList()
    }, 500),
    search () {
      this.searchForm.pageNo = 1
      this.queryList()
    },
    getFormatTime (val) {
      return getFormatTime(val)
    },
    // 查询列表
    async queryList () {
      return getInspectionConfigList(this.searchForm).then(res => {
        if (res.code === 0) {
          res.data.rows.forEach(item => {
            item.enableInfoText = this.changeEnableInfoToText(item.enableInfo)
          })
          this.tableData = res.data.rows || []
          this.totalNum = res.data.total
        }
      }).catch(() => {})
    },
    async beforeChangeState (scope) {
      if (scope.row.enable) {
        this.changeState(scope)
      } else {
        let secondFilterRes = await checkTaskIsRefBySecondaryAnalysis([scope.row.taskId])
        if (secondFilterRes.data && secondFilterRes.data.length > 0) {
          let nameString = ''
          secondFilterRes.data.forEach(item => {
            let filterName = item.targetTasks.map(v => v.taskName).join('、')
            nameString += `任务【${item.taskName}】已被：${filterName} 引用；`
          })
          let tip = nameString.substring(0, nameString.length - 1)
          this.$confirm(`提醒`, {
            message: tip,
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            size: 'large',
            type: 'question'
          }).then(() => {
            this.changeState(scope)
          }).catch(() => {
            scope.row.enable = !scope.row.enable
          })
        } else {
          this.changeState(scope)
        }
      }
    },
    // 改变启用禁用状态
    changeState (scope) {
      this.$confirm({
        title: `确认操作`,
        message: `是否确认${scope.row.enable ? `启用` : `禁用`}'${scope.row.taskName}'`,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'question'
      }).then(async () => {
        // 禁用时开启
        let { code, message } = await changeState({ taskId: scope.row.taskId, enable: scope.row.enable })
        if (code !== 0) {
          if (scope.row.enable) {
            if (NO_AUTH_CODE.includes(code)) {
              // 授权不足
              this.$msgbox({
                title: '授权不足',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: '查看详情',
                cancelButtonText: '关闭',
                message: message
              }).then(() => {
                scope.row.enable = !scope.row.enable
                this.toViewServiceDetail()
              }).catch(() => {
                scope.row.enable = !scope.row.enable
              })
              return false
            } else if (SERVICE_OFFLINE_CODE.includes(code)) {
              // 算法下线时开启
              this.$msgbox({
                title: '算法已下线',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: '去开启',
                cancelButtonText: '关闭',
                message: '请重新上线部署算法后，再开启任务'
              }).then(() => {
                scope.row.enable = !scope.row.enable
                this.$router.push({ name: 'cloudDeployment' })
              }).catch(() => {
                scope.row.enable = !scope.row.enable
              })
              return false
            } else {
              scope.row.enable = !scope.row.enable
            }
          }
        } else {
          this.$message.success(scope.row.enable ? `启用成功` : `禁用成功`)
          this.queryList()
          this.getServiceInfo()
          this.getTaskEnableStatusNum()
        }
      }).catch(() => {
        scope.row.enable = !scope.row.enable
        this.$message({
          type: 'info',
          message: '已取消修改'
        })
      })
    },
    // 页数大小改变
    handleSizeChange (val) {
      this.searchForm.pageNo = 1
      this.searchForm.pageSize = val
      this.queryList()
    },
    // 当前页改变
    handleCurrentChange (val) {
      this.searchForm.pageNo = val
      this.queryList()
    }
  },
  beforeDestroy() {
    if (this.handleResize) {
      window.removeEventListener('resize', this.handleResize)
    }
  }
}
</script>
<style lang="scss">
  .intelligent-inspectionConfig{
    .el-button--text{
      span{
        // text-decoration: underline;
      }
    }
    .iconmini{
      i{
        font-size: 16px;
      }
    }
    .el-button+.el-button{
      margin-left: 0px
    }
    .btn_has_padding{
      padding-left: 8px;
      padding-right: 8px;
    }
    .search-info{
      .search_radio_wrap{
        // width: 320px!important;
        min-width: 310px!important;
        text-align: left;
      }
    }
    .publish_status_wrap{
      display: flex;
      align-items: center;
      justify-content: flex-start;
      .status_icon{
        width: 15%
      }
      .status_text{
        width: 70%
      }
    }
    .re_publish_icon{
      &:hover{
        color:#2080f7
      }
    }
    .platform_wrap{
      display: flex;
      align-items: center;
      .h-icon-circle_notice{
        color:red;
        margin-left:5px
      }
    }
    .el-table th, .el-table__footer-wrapper thead div, .el-table__header-wrapper thead div{
      // background: #f5f5f5;
      // color: rgba(0,0,0,0.90)
    }
    .el-checkbox__input{
      top: 0 !important;
    }
    .demo-scrollbar-wrap {
      max-height: 150px;
      margin-top:10px;
    }
    .items {
      li{
        text-align: left;
        width: 100%;
        background: rgba(255, 221, 221, 1);
        color:#FF0000;
        margin-bottom: 5px;
        height: 30px;
        line-height: 30px;
      }
    }
    .el-alert-text{
      line-height: 24px;
      .link{
        margin-left: 20px;
        font-size: 14px;
        color: #348BFF;
        cursor: pointer;
      }
    }
  }
  .config-table{
    .option-btn{
      display: inline-block;
      padding:0 8px 0 6px;
      color: rgb(32, 128, 247);
      cursor: pointer;
      &:hover {
        color: rgb(32, 186, 247)
      }
    }
    .hasBorder{
      border-left: 1px solid rgb(32, 128, 247);
      border-right: 1px solid rgb(32, 128, 247);
    }
  }
</style>

<style lang="scss" scoped>
  @import "./style.scss";
</style>
