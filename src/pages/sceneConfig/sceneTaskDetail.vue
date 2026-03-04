<template>
  <h-page-container class="scene-task-detail">
    <!-- 面包屑 -->
    <div class="breadcrumb-mod">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: `/intelligent/sceneConfig` }" class="breadcrumb-item-link">任务详情</el-breadcrumb-item>
        <el-breadcrumb-item>{{taskInfo.taskName}}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <h-layout class="content-wrap">
      <h-page-content>
        <div class="detail-content-mod">
          <div class="operator">
            <div class="operator_left">
              <span class="task-detail-name">{{taskInfo.taskName}}</span>
              <el-button icon="h-icon-details" @click="markResultDetail">正误报统计</el-button>
              <el-button icon="h-icon-export" @click="handleExport" v-show="['retail', 'aiot', 'enterprise'].includes(serviceType)">导出</el-button>
            </div>
          </div>
          <div class="panel-mod">
            <h-page-search ref="contentSearch" :model="searchForm" class="filter-mod">
              <div style="display: flex;flex-wrap: wrap;flex: 1;">
                <h-page-search-item label="时间" style="width:310px">
                  <el-date-picker v-model="timeRange" style="width:310px" type="datetimerange" :default-time="['00:00:00', '23:59:59']" :clearable="false" :picker-options="pickerOptions"/>
                </h-page-search-item>
                <h-page-search-item label="图片状态" style="width:180px">
                  <el-select v-model="searchForm.resultStatus" style="width:180px" clear>
                    <el-option v-for="(item, index) in searchResultStatusList" :key="index" :label="item.label" :value="item.value"></el-option>
                  </el-select>
                </h-page-search-item>
                <h-page-search-item label="报警状态" style="width:180px">
                  <el-select v-model="searchForm.alarm" style="width:180px" clear>
                    <el-option label="全部报警状态" value=""></el-option>
                    <el-option label="已报警" :value="1"></el-option>
                    <el-option label="未报警" :value="0"></el-option>
                  </el-select>
                </h-page-search-item>
                <h-page-search-item :label="`所属${applicationSceneName}`" class="org-item">
                  <el-input @click.native="isShowOrg = !isShowOrg" v-model="orgName" :suffix-icon="isShowOrg ? 'h-icon-angle_up_sm' : 'h-icon-angle_down_sm'" 
                    class="org" readonly="readonly" :placeholder="`请选择${applicationSceneName}`" clearable @clear="handleOrgClear">
                  </el-input>
                  <div class="org-select" v-show="isShowOrg">
                    <treeAnsyForSearchGroup  v-clickoutside="handleCloseShowOrg" ref="TreeAnsySearch" :treeAnsyProps=treeAnsyProps :storeListProps=storeListProps
                    :isInitSelected="true" :onlyCheckLeaf="true" @getClickData="getClickData" :height="240">
                    </treeAnsyForSearchGroup>
                  </div>
                </h-page-search-item>
                <h-page-search-item label="所属通道" v-if="searchForm.groupId">
                  <el-select v-model="searchForm.channelId" placeholder="请选择通道" filterable clear>
                    <el-option v-for="(item,index) in searchChannels" :key="index" :label="item.channelName" :value="item.channelId"></el-option>
                  </el-select>
                </h-page-search-item>
              </div>
              <div class="s_right">
                <el-button type="primary" @click="queryList">查询</el-button>
                <el-button @click="reset">重置</el-button>
              </div>
            </h-page-search>
            <div v-if="channelList.length === 0" class="empty-data">
              <div class="empty-data-img">暂无数据</div>
            </div>
            <div class="channel-mod" v-if="channelList.length > 0" v-loading="loading">
              <div class="channel-left">
                <ul>
                  <li v-for="(item, index) in channelList" :key="index" @click="displayCaptureDetail(item, index)" :class="{'active': index=== currentCaptureIndex}">
                    <p class="channel-image">
                      <img class="small_img" :src='item.pictureUrlSmall'/>
                    </p>
                    <div class="text">
                      <div :class="{'channel-name':true,'ellipsis':true,'hege':item.resultStatus==='CORRECT','buhege':item.resultStatus==='INCORRECT','loubao':item.resultStatus==='MISS'}" 
                        :title="item.resultStatus==='INCORRECT' ? item.misreportReason : ''">
                        {{item.resultStatus==='INCORRECT'?'误报':item.resultStatus==='CORRECT'?'正报':item.resultStatus==='MISS'?'漏报':'未判断'}}
                        {{ item.resultStatus==='INCORRECT' ? item.misreportReason : '' }}
                      </div>
                      <p class="channel-time">{{formatTime(item.createTime)}}</p>
                    </div>
                    <div :class="{'alarm_i':true, 'alarmed': +item.invalid===0}">{{ +item.invalid ? '未报警' : '已报警' }}</div>
                  </li>
                </ul>
                <div class="el-demo1__wrap">
                  <div class="bigdata-pagination">
                    <el-pagination
                      @current-change="channelCurrentChange"
                      :current-page="searchForm.pageNo"
                      :page-size="searchForm.pageSize"
                      :total="channelTotalNum"
                      layout="total, prev, next">
                    </el-pagination>
                    <div style="line-height:28px;">
                      {{searchForm.pageNo}} / {{Math.ceil(channelTotalNum / searchForm.pageSize) || 1}} 页
                    </div>
                  </div>
                </div>
              </div>
              <div class="image-diaplay-mod-outer">
                <div class="image-diaplay-mod">
                  <div class="image-diaplay-mod-wrap">
                    <div class="monitor-view-operator">
                      <div class="channelNameWrap">
                        <div class="c_n_item ellipsis">门店：<span :title='displayPic.groupName || "-"'>{{ displayPic.groupName || "-" }}</span></div>
                        <div class="c_n_item ellipsis">通道：<span :title='displayPic.channelName || "-"'>{{ displayPic.channelName || "-" }}</span></div>
                        <span :class="{'alarm_tag':true,'alarmed': +displayPic.invalid === 0}">{{ +displayPic.invalid === 0 ? '已报警' : '未报警' }}</span>
                      </div>
                      <div class="operator_right">
                        <p class="view-operator_display-detection-area">
                          <span>展示标签</span>
                          <el-switch v-model="displayLabel" @change="handlerDisplayLabel"></el-switch>
                        </p>
                      </div>
                    </div>
                    <div class="image-mod" style="width:896px">
                      <el-button type="iconButton" icon="h-icon-angle_left" class="image-left image-btn" :disabled="searchForm.pageNo===1 && currentCaptureIndex==0" @click="changImage('prev')"></el-button>
                      <el-button type="iconButton" icon="h-icon-angle_right" class="image-right image-btn" :disabled="searchForm.pageNo===channelTotalPage && currentCaptureIndex==channelList.length-1" @click="changImage('next')"></el-button>
                      <div class="canvas-mod">
                        <areaImage
                          v-if="displayLabel"
                          :width='896'
                          :height='503'
                          :url='displayPic.pictureUrl'
                          :calibrationList='calibrations'
                          :operationTypeList="['edit']"></areaImage>
                        <imgCanvas
                          v-if="!displayLabel"
                          :canDraw = 'canDraw'
                          :info="displayPic.oldDrawInfo"
                          :url='displayPic.pictureUrl'
                          height = "503"
                          width = "896"
                          :showText="typeIsOCR"
                          :displayDetectionArea="displayDetectionArea"
                          :lineWidth = "lineWidth"
                          :lineType = "lineType"
                          :useReg = "useReg"></imgCanvas>
                      </div>
                      <div :class="{'img_status':true,'img_status_fail':['INCORRECT'].includes(displayPic.resultStatus),'img_status_miss':['MISS'].includes(displayPic.resultStatus)}" 
                        v-show="['INCORRECT','CORRECT','MISS'].includes(displayPic.resultStatus)">
                        {{ displayPic.resultStatus === 'INCORRECT' ? '误报' : displayPic.resultStatus === 'CORRECT' ? '正报' : displayPic.resultStatus === 'MISS' ? '漏报' : '' }}
                      </div>
                    </div>
                    <!-- <div class="discription">
                      <el-scrollbar wrap-class="demo-scrollbar-wrap-discription">
                      </el-scrollbar>
                    </div> -->
                  </div>
                  <div class="del_btn">
                    <el-dropdown placement="top-end" @command="beforeMarkResult" trigger="click">
                      <el-button icon="h-icon-mark">图片标记正误报</el-button>
                      <el-dropdown-menu slot="dropdown" style="width:120px">
                        <el-dropdown-item command="CORRECT">正报</el-dropdown-item>
                        <el-dropdown-item command="INCORRECT">误报</el-dropdown-item>
                        <el-dropdown-item command="MISS">漏报</el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown>
                    <el-button icon="h-icon-password_visible_f" @click="onAiResult(displayPic)" v-show="displayPic.imgList.length">查看多图</el-button>
                    <el-button icon="h-icon-download" @click="downloadImg(displayPic.pictureUrl, displayPic.rowKey)" v-show="displayPic.pictureUrl">下载图片</el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </h-page-content>
    </h-layout>
    <markResultModal :visible.sync="markResultModalVisible" :rowKey="displayPic.rowKey" @markResult="markResult"></markResultModal>
    <CaptureDialog :is-show="captureShow" :current="currentAiResult" @cancle="captureShow = false" ></CaptureDialog>
    <markResultDetailModal :visible.sync="markResultDetailVisible" ref="markResultDetailModal"></markResultDetailModal>
  </h-page-container>
</template>
<script>
import _ from 'lodash'
import markResultModal from './modal/markResultModal'
import markResultDetailModal from './modal/markResultDetailModal'
import treeAnsyForSearchGroup from '@/components/treeAnsyForSearchGroup'
import CaptureDialog from './modal/captureDialog'
import Clickoutside from 'hui/src/utils/clickoutside'
import labelCfg from '@/components/calibrate/config/labels.js'
import { getFormatTime } from '@/assets/libs/util'
import { day, today, setFormatDate } from '@/plugin/utils/util'
import areaImage from '@/components/areaImage'
import imgCanvas from '@/components/drawImage/index'
import moment from 'moment'
import { queryTestChannelList, getDisplayPicNewInfo, getRelDianaTaskId, getMonitors, markResultProxy, markTargetResult, getRedirectUrl, exportEventDetail } from './proxy'
export default {
  components: {
    areaImage,
    imgCanvas,
    CaptureDialog,
    treeAnsyForSearchGroup,
    markResultDetailModal,
    markResultModal
  },
  directives: { Clickoutside },
  data () {
    return {
      treeAnsyProps: {
        method: 'get',
        url: '/v1/inspect/taskconfig/taskConfigs/orgs',
        params: {}
      },
      storeListProps: {
        method: '',
        url: '/v1/inspect/taskconfig/taskConfigs/orgs/actions/getByNameLike',
        params: {}
      },
      markResultDetailVisible: false,
      markResultModalVisible: false,
      loading: false,
      captureShow: false,
      currentAiResult: null,
      displayDetectionArea: false, // 展示检测区域
      taskInfo: {
        taskName: '',
        createTime: '',
        executeId: ''
      },
      isShowOrg: '',
      orgName: '',
      searchForm: {
        pageSize: 9,
        pageNo: 1,
        resultStatus: '',
        alarm: '',
        channelId: '',
        groupId: '',
        pageType: 'default',
        timeStamp: '',
        rowKey: ''
      },
      channelList: [],
      channelTotalPage: 0, // 通道总页数
      channelTotalNum: 0, // 通道总数量
      statusList: [{ 'label': '全部状态', 'value': '' }, { 'label': '成功状态', 'value': '1' }, { 'label': '失败状态', 'value': '3' }],
      currentCaptureIndex: 0, // 当前选中的通道序号
      displayPic: {}, // 右侧大图展示的信息
      // canvas的参数
      canDraw: true, // 画笔
      lineWidth: 2,
      lineType: 'rec',
      useReg: true,
      timeRange: [setFormatDate(new Date(), 'yyyy-MM-dd 00:00:00'), setFormatDate(new Date(), 'yyyy-MM-dd 23:59:59')],
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() >= today + day
        },
        customValidation: (start, end) => {
          var moreLength = end.getTime() - 7 * 24 * 60 * 60 * 1000 <= start.getTime()
          return moreLength
        },
        customPrompt: '最长不能超过7天'
      },
      areaSelectLabel: [],
      displayLabel: false,
      focusDomArr: [],
      markResultType: 'image' // 正误报标记的是图片还是对象框
    }
  },
  computed: {
    typeIsOCR () {
      return false
    },
    calibrations () {
      if (this.displayPic && this.displayPic.info) {
        let newArr = JSON.parse(JSON.stringify(this.displayPic.info))
        //  选中了标签
        if (this.areaSelectLabel.length) {
          if (this.displayDetectionArea) {
          //  需要展示识别区域
            return this.filterArea(newArr, this.areaSelectLabel, true, this.displayLabel)
          } else {
          //  不需要展示识别区域
            newArr = newArr.filter(item => item.id.indexOf('polygon_') < 0) //v1.8.2，删除识别区域的数据，id带有标识polygon_的
            return this.filterArea(newArr, this.areaSelectLabel, false, this.displayLabel)
          }
        }
        //  没有选中标签
        if (this.displayDetectionArea) {
        //  需要展示识别区域
          return this.filterLabel(newArr, true, this.displayLabel)
        }
        //  不需要展示识别区域
        newArr = newArr.filter(item => item.id.indexOf('polygon_') < 0) //v1.8.2，删除识别区域的数据，id带有标识polygon_的
        return this.filterLabel(newArr, false, this.displayLabel)
      } else {
        return []
      }
    },
    searchResultStatusList() {
      return [{label: '全部图片状态', value: ''}, {label: '已判断', value: 'HAD_JUDGE'}, {label: '未判断', value: 'NON_JUDGE'}, {label: '正报', value: 'CORRECT'}, {label: '误报', value: 'INCORRECT'}, {label: '漏报', value: 'MISS'}]
    }
  },
  watch: {
    displayPic: {
      handler (val) {
        this.displayLabel = val.drawResults && val.drawResults.length <= 50
        this.areaSelectLabel = []
      },
      deep: true
    },
    'searchForm.groupId': {
      handler() {
        this.getSearchCahnnels()
      },
      deep: true,
      immediate: true
    }
  },
  async mounted () {
    await this.getRealTaskId()
    await this.getTaskDetail()
    await this.queryList()
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
    handleOrgClear() {
      this.searchForm.groupId = ''
      if(this.$refs.TreeAnsySearch) {
        this.$refs.TreeAnsySearch.clearClick()
      }
      this.orgName = ''
      this.queryList()
    },
    markResultDetail() {
      let params = {...this.searchForm}
      let arr = ['pageSize', 'pageNo', 'pageType', 'rowKey', 'timeStamp']
      arr.forEach(item => {
        delete params[item]
      })
      params.startTime = getFormatTime(this.timeRange[0])
      params.endTime = getFormatTime(this.timeRange[1])
      this.$refs.markResultDetailModal.init(params)
      this.markResultDetailVisible = true
    },
    async getSearchCahnnels() {
      this.searchChannels = [{channelId: '', channelName: '全部'}]
      if (this.searchForm.groupId) {
        let params = {
          groupId: this.searchForm.groupId,
          groupType: 1,
          taskType: 'DCT4',
          taskAnalysisMode: 'CLOUD_POLLING_SNAP',
          modelTypeEnum: 'DETECT',
          pageSize: 999,
          pageNo: 1
        }
        let res = await getMonitors(params)
        if (res.code === 0 && res.data.rows && res.data.rows.length) {
          this.searchChannels = [{channelId: '', channelName: '全部'}].concat(res.data.rows)
          this.$forceUpdate()
        }
      }
    },
    handleCloseShowOrg() {
      this.isShowOrg = false
    },
    // 所属组织树选中节点时触发
    getClickData(value, num, type) {
      this.searchForm.channelId = ''
      if (value.parentId) {
        this.orgName = value.groupName
        if (value.groupType === 0) { // 区域
          this.searchForm.groupId = ''
        } else { // 门店
          this.searchForm.groupId = value.groupId
        }
        if(this.serviceType === 'minerva') {
          this.searchForm.groupId = value.groupId
        }
        if (type !== 'clear') {
          this.isShowOrg = false
        }
      }
    },
    formatTime(time) {
      return time ? moment(time).format('YYYY-MM-DD HH:mm:ss') : '--'
    },
    handleSearchParamsForModal() {
      let params = {...this.searchForm}
      params.startTime = getFormatTime(this.timeRange[0])
      params.endTime = getFormatTime(this.timeRange[1])
      return params
    },
    async getRealTaskId() {
      let res = await getRelDianaTaskId({solutionTaskId: this.$route.query.solutionTaskId})
      this.taskInfo.taskId = res.data
    },
    onAiResult(item) {
      this.currentAiResult = item
      this.captureShow = true
    },
    // 获取通道列表
    async getChannelList () {
      let info
      let temp
      this.searchForm.taskId = this.taskInfo.taskId
      this.searchForm.startTime = getFormatTime(this.timeRange[0])
      this.searchForm.endTime = getFormatTime(this.timeRange[1])
      let { code, data } = await queryTestChannelList(this.searchForm)
      if (code === 0) {
        data.rows.forEach((item) => {
          item.drawResults = item.drawResults || []
          item.pictureUrlSmall = item.pictureUrl + '&process=image/resize,limit_0,m_lfit,w_60,h_60/quality,q_100'
          item.labels = []
          info = []
          item.results = item.results || []
          item.results.forEach((obj) => {
            temp = {}
            temp.labelName = obj.labelName
            temp.labelCount = obj.detectCount
            temp.labelLineId = obj.labelLineId
            item.labels.push(temp)
          })

          info = info.concat(item.drawResults)
          // 处理polygon绘制区域的数据
          let tempArr = item.polygonDetails.map(_ => {
            return {
              type: '',
              regionColor: _.color,
              region: _.polygons
            }
          })
          info = info.concat(tempArr)
          item.oldDrawInfo = info
          const { areas, smallAreas } = this.getAllArea(item)
          this.getPolygon(areas, item, 'polygon')
          this.getPolygon(smallAreas, item, 'smallPolygon')
          item.info = areas
          item.smallInfo = smallAreas
          let content = item.content.replace(/^```json|```$/g, '').trim()
          try {
            let contentObj = JSON.parse(content)
            item.imgList = contentObj.baseOnInfo || []
          } catch (e) {
            item.imgList = []
          }
        })

        this.channelList = data.rows || []
        this.channelTotalNum = data.total
        this.channelTotalPage = data.totalPage
        this.channelList.length > 0 && this.displayCaptureDetail(this.channelList[this.currentCaptureIndex], this.currentCaptureIndex)
      }
    },
    getAllAreaNew (channel) {
      let areasNew = []
      channel.drawResults && channel.drawResults.forEach((area, index) => {
        let labelList = []
        labelList = ((area && area.aiResultLabelInfo) || []).map(label => {
          return {
            labelId: label.labelId,
            text: label.labelName + (label.confidence ? `(${label.confidence})` : '') + (area.compareResult && area.compareResult.cmpSimilarity ? `(${area.compareResult.cmpSimilarity})` : ''),
            labelLineId: label.labelLineId,
            deletable: false,
            confidence: ''
          }
        })
        if (area.type && area.points) {
        //  绘制右侧详情大图，需要标签
          areasNew.push({
            id: `area_${channel.rowKey}_${index}`,
            targetId: area.targetId,
            scope: {
              type: area.type,
              coordinates: area.points
            },
            labelList,
            style: {
              shape: {
                normal: {
                  borderWidth: area.regionColor && area.regionColor === 'red' ? 3 : 2,
                  borderColor: area.regionColor || 'red',
                  color: 'rgba(255,255,255,0)'
                }
              },
              label: {
                normal: {
                  height: '14px',
                  maxWidth: '160px',
                  borderRadius: '2px',
                  padding: '1px',
                  marginBottom: '1px'
                },
                hover: {
                  height: '14px',
                  maxWidth: '160px',
                  borderRadius: '2px',
                  padding: '1px',
                  marginBottom: '1px'
                },
                focus: {
                  height: '14px',
                  maxWidth: '160px',
                  borderRadius: '2px',
                  padding: '1px',
                  marginBottom: '1px'
                }
              }
            }
          })
        }
      })

      return { areasNew }
    },
    getAllArea (channel) {
      let areas = []
      let smallAreas = []

      channel.drawResults && channel.drawResults.forEach((area, index) => {
        let labelList = []
        labelList = ((area && area.aiResultLabelInfo) || []).map(label => {
          return {
            labelId: label.labelId,
            text: label.labelName + (label.confidence ? `(${label.confidence})` : '') + (area.compareResult && area.compareResult.cmpSimilarity ? `(${area.compareResult.cmpSimilarity})` : ''),
            labelLineId: label.labelLineId,
            deletable: false,
            confidence: ''
          }
        })
        if (area.type && area.points) {
        //  绘制右侧详情大图，需要标签
          areas.push({
            id: `area_${channel.rowKey}_${index}`,
            targetId: area.targetId,
            scope: {
              type: area.type,
              coordinates: area.points
            },
            labelList,
            style: {
              shape: {
                normal: {
                  borderWidth: area.regionColor && area.regionColor === 'red' ? 3 : 2,
                  borderColor: area.regionColor || 'red',
                  color: 'rgba(255,255,255,0)'
                }
              },
              label: {
                normal: {
                  height: '14px',
                  maxWidth: '160px',
                  borderRadius: '2px',
                  padding: '1px',
                  marginBottom: '1px'
                },
                hover: {
                  height: '14px',
                  maxWidth: '160px',
                  borderRadius: '2px',
                  padding: '1px',
                  marginBottom: '1px'
                },
                focus: {
                  height: '14px',
                  maxWidth: '160px',
                  borderRadius: '2px',
                  padding: '1px',
                  marginBottom: '1px'
                }
              }
            }
          })
          //  绘制左侧列表页小图，不需要标签
          smallAreas.push({
            id: `smallArea_${channel.rowKey}_${index}`,
            scope: {
              type: area.type,
              coordinates: area.points
            },
            labelList: [],
            style: {
              shape: {
                normal: {
                  borderWidth: area.regionColor && area.regionColor === 'red' ? 3 : 2,
                  borderColor: area.regionColor || 'red',
                  color: 'rgba(255,255,255,0)'
                }
              }
            }
          })
        }
      })

      return { areas, smallAreas }
    },
    getPolygon (arr, polygon, type) {
      if (!polygon.polygonDetails || !polygon.polygonDetails.length) {
        return false
      }
      // 处理展示区域的数据
      polygon.polygonDetails.forEach((item, index) => {
        arr.unshift({
          id: `${type}_${polygon.rowKey}_${index}`,
          status: 'normal',
          scope: {
            type: 'polygon',
            coordinates: item.polygons
          },
          labelList: [],
          style: item.calibrationType === 'SHIELD_AREA' ? labelCfg.SHIELD_STYLE : labelCfg.NORMAL_STYLE
        })
      })
    },
    onLabelClick (row) {
      if (!this.displayLabel) {
        return
      }
      if (row === 'all') {
        if (this.areaSelectLabel.length) {
          this.areaSelectLabel = []
        } else {
          //  全部不显示，照之前的逻辑写，只能给一个不太可能存在的值去过滤
          this.areaSelectLabel = ['no_need_show_label_and_area']
        }
        return false
      }
      let idx = this.areaSelectLabel.findIndex(item => {
        return item === row.labelLineId
      })
      idx > -1 ? this.areaSelectLabel.splice(idx, 1) : this.areaSelectLabel.push(row.labelLineId)
    },
    filterArea (areas, areaSelectLabel, ignoreFirst = false, displayLabel) {
      let finalArea = []
      areas.forEach((area, index) => {
        if (index === 0 && ignoreFirst) {
          finalArea.push(area)
        } else {
          for (let i = 0; i < area.labelList.length; i++) {
            if (areaSelectLabel.indexOf(area.labelList[i].labelLineId) >= 0) {
              if (!displayLabel) {
                area.labelList = []
              }
              finalArea.push(area)
              break
            }
          }
        }
      })
      return finalArea
    },
    //  和上面那个可以合并成一个方法，但是时间太紧急，来不及。后续再改吧。
    filterLabel (areas, ignoreFirst = false, displayLabel) {
      let finalArea = []
      areas.forEach((area, index) => {
        if (index === 0 && ignoreFirst) {
          finalArea.push(area)
        } else {
          if (!displayLabel) {
            area.labelList = []
          }
          finalArea.push(area)
        }
      })
      return finalArea
    },
    // 展示抓图详情
    displayCaptureDetail (item, index) {
      this.currentCaptureIndex = index
      this.displayPic = item
      this.getDisplayPicNewInfo() // 每次切换时，获取图片最新的一些信息
    },
    getVideoStartAndEndTime (t, b, flag) { // 获取播放视频的开始和结束时间，flag为true返回结束时间，flag为false返回开始时间，
      var time = t
      time = time.replace(/-/g, '/')
      var timeDate = new Date(time)
      var timeSJC = timeDate.getTime()
      if (flag) { // 结束时间
        timeDate.setTime(timeSJC + b)
      } else { // 开始时间
        timeDate.setTime(timeSJC - b)
      }
      return getFormatTime(timeDate)
    },
    // 通道分页
    channelCurrentChange (currentPage, oldPage) {
      if ((currentPage > this.searchForm.pageNo && currentPage < this.channelTotalPage) || (currentPage === this.searchForm.pageNo && currentPage > oldPage)) {
        this.searchForm.pageType = 'next'
        this.searchForm.rowKey = this.channelList[this.channelList.length - 1].rowKey
        this.searchForm.timeStamp = this.channelList[this.channelList.length - 1].timeStamp
        this.currentCaptureIndex = 0
      } else if ((currentPage < this.searchForm.pageNo && currentPage !== 1) || (currentPage === this.searchForm.pageNo && currentPage < oldPage)) {
        this.searchForm.pageType = 'prev'
        this.searchForm.rowKey = this.channelList[0].rowKey
        this.searchForm.timeStamp = this.channelList[0].timeStamp
      } else if (currentPage === this.channelTotalPage) {
        this.searchForm.pageType = 'last'
        this.searchForm.rowKey = ''
        this.searchForm.timeStamp = ''
        this.currentCaptureIndex = 0
      } else {
        this.searchForm.pageType = 'default'
        this.searchForm.rowKey = ''
        this.searchForm.timeStamp = ''
      }
      this.searchForm.pageNo = currentPage
      this.getChannelList()
    },
    // 查询
    queryList () {
      this.currentCaptureIndex = 0
      this.searchForm.pageType = 'default'
      this.searchForm.timeStamp = ''
      this.searchForm.rowKey = ''
      this.searchForm.pageNo = 1
      this.getChannelList()
    },
    reset () {
      this.searchForm = {
        pageSize: 9,
        pageNo: 1,
        resultStatus: '',
        alarm: '',
        channelId: '',
        groupId: '',
        pageType: 'default',
        timeStamp: '',
        rowKey: ''
      },
      this.timeRange = [setFormatDate(new Date(), 'yyyy-MM-dd 00:00:00'), setFormatDate(new Date(), 'yyyy-MM-dd 23:59:59')]
      this.orgName = ''
      this.channelList = []
      this.channelTotalNum = 0
      this.channelTotalPage = 0
      this.queryList()
    },
    beforeMarkResult(command) {
      this.markResultType = 'image'
      if (['MISS', 'CORRECT'].includes(command)) { // 正报、漏报
        this.markResult({ resultStatus: command, misreportReason: '', rowKey: this.displayPic.rowKey})
      } else { // 误报
        this.markResultModalVisible = true
      }
    },
    markResult(parmas) {
      let proxy = this.markResultType === 'image' ? markResultProxy : markTargetResult
      parmas.targetId = this.focusDomArr.length > 0 ? this.focusDomArr[0].targetId : ''
      parmas.labelList = this.focusDomArr.length > 0 ? this.focusDomArr[0].labelList.map(_ => {
        return {
          labelLineId: _.labelLineId,
          labelId: _.labelId,
          labelName: _.text,
        }
      }) : []
      proxy(parmas).then(res => {
        if (res.code === 0) {
          this.$message.success('标记成功！')
          this.markResultModalVisible = false
          this.getDisplayPicNewInfo()
        }
      })
    },
    download (href, name) {
      let eleLink = document.createElement('a')
      eleLink.download = name || '图片'
      if (href.includes('.ys7.')) {
        fetch(href).then(res => res.blob()).then(blob => { // 将链接地址字符内容转变成blob地址
          eleLink.href = URL.createObjectURL(blob)
          eleLink.click()
          eleLink.remove()
        })
      } else {
        eleLink.href = href
        eleLink.click()
        eleLink.remove()
      }
    },
    async downloadImg (imgUrl, rowKey) { // 下载图片
      const { data: { redirectUrl } } = await getRedirectUrl({
        url: imgUrl
      })
      const sperate = redirectUrl.split('?')[1] ? '&' : '?'
      this.download(`${redirectUrl}${sperate}response-content-type=application%2Foctet-stream&response-content-disposition=attachment;`, rowKey)
    },
    getDisplayPicNewInfo: _.debounce(function async() { // 获取最新的当前选中的图片的一些最新信息
      this.loading = true
      this.focusDomArr = [] 
      getDisplayPicNewInfo({ rowKey: this.displayPic.rowKey }).then(res => {
        if(res.code === 0) {
          let currentIdx = this.channelList.findIndex(chan => chan.rowKey === this.displayPic.rowKey)
          let item = { ...this.displayPic, ...res.data }
          const { areas } = this.getAllArea(item) // 重新渲染标签
          this.getPolygon(areas, item, 'polygon') // 渲染外层绘制框
          item.info = areas
          this.displayPic = { ...item }
          if(this.channelList[currentIdx]) { // 更新左侧卡片的状态
            this.channelList[currentIdx] = { ...this.channelList[currentIdx], ...res.data}
          }
        }
        this.loading = false
      })
    }, 200),
    // 获取任务详情
    async getTaskDetail () {
      this.taskInfo.taskName = this.$route.query.solutionTaskName
    },
    async handleExport() {
      let params = {
        ...this.searchForm,
        taskId: this.taskInfo.taskId,
        rowKey: this.displayPic.rowKey
      }
      let arr = ['pageSize', 'pageNo', 'pageType', 'rowKey', 'timeStamp']
      arr.forEach(item => {
        delete params[item]
      })
      params.startTime = getFormatTime(this.timeRange[0])
      params.endTime = getFormatTime(this.timeRange[1])
      await exportEventDetail(params)
      this.$message.success({
        dangerouslyUseHTMLString: true,
        message: `导出任务已提交，请前往<a href="/chain/index.html#/subMenu/download?time=${new Date().getTime()}" target="_blank" style="color: rgb(32, 128, 247); cursor: pointer;padding:0 4px">导出报表</a>进行下载`
      })
    },
    // 图片翻页
    async changImage (type) {
      if (this.loading) {
        return false
      }
      if (type === 'prev') {
        if (this.searchForm.pageNo === 1 && this.currentCaptureIndex === 0) {
          this.$message.info('已经是第一张图片了')
          return false
        }
        if (this.currentCaptureIndex > 0) {
          this.currentCaptureIndex--
          this.displayPic = this.channelList[this.currentCaptureIndex]
        } else {
          // 获取前一页数据
          this.currentCaptureIndex = this.searchForm.pageSize - 1
          this.searchForm.pageNo--
        }
      } else {
        if (this.searchForm.pageNo === this.channelTotalPage && this.currentCaptureIndex === this.channelList.length - 1) {
          this.$message.info('已经是最后一张图片了')
          return false
        }
        if (this.currentCaptureIndex < this.channelList.length - 1) {
          this.currentCaptureIndex++
          this.displayPic = this.channelList[this.currentCaptureIndex]
        } else {
          // 获取后一页数据
          this.currentCaptureIndex = 0
          this.searchForm.pageNo++
        }
      }
      await this.getDisplayPicNewInfo()
    },
    handlerDisplayLabel () {
      this.areaSelectLabel = []
    }
  },
  destroyed () {
    document.onkeydown = undefined
  }
}
</script>

<style lang="scss" scoped>
 @import "./modal/sceneTaskDetail.scss";
</style>
<style lang="scss">
.markImgStatusPopover{
  padding-bottom: 2px;
}
.scene-task-detail{
  .h-page-search-item{
    margin-left: 10px;
  }
  .org-item {
    .org {
      input {
        background-color: #fff;
        background-image: none;
        border-radius: 2px;
        border: 1px solid #ccc;
        color: #333;
        font-size: inherit;
        height: 32px;
        line-height: 1;
        outline: 0;
        padding: 3px 8px;
        cursor: pointer;
      }
      .el-input__icon {
        cursor: pointer;
      }
    }
    .el-form-item__content {
      position: relative;
      .org-select {
        border: 1px solid rgba(0, 0, 0, 0.12);
        border-radius: 2px;
        margin-top: -1px;
        height: 340px;
        position: absolute;
        width: 100%;
        z-index: 10;
        background-color: white;
      }
    }
  }
  .del_btn{
    min-width: 100px;
    .el-button+.el-button{
      margin-left: 0px;
    }
  }
  .demo-scrollbar-wrap {
    height: 38px;
    overflow-x: hidden;
  }
  .discription{
    height: 92px;
    .demo-scrollbar-wrap-discription{
      height: 100%;
      overflow-x: hidden;
    }
  }
  .search_channel_wrap{
    cursor: pointer;
    input{
      cursor: pointer;
    }
  }
  .el-breadcrumb__separator{
    margin-top: 8px;
  }
  .breadcrumb-mod{
    .breadcrumb-item-link .el-breadcrumb__item__inner{
      &:hover{
        color: #2080f7;
        text-decoration: none;
      }
    }
  }
  .el-demo1__wrap {
    height: 47px;
    width: 100%;
    position: absolute;
    bottom: 0;
    left: 0;
  }
  .el-demo1-scrollbar__wrap {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
  }
  .bigdata-pagination{
    display: flex;
    position: absolute;
    left:10px;
    top:10px;
    font-size:12px;
    .el-pagination__total{
      margin: 0
    }
    button{
      margin:0!important
    }
  }
}
</style>
