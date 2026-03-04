<template>
  <div class="task-detail">
    <!-- 面包屑 -->
    <div class="breadcrumb-mod">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: `/intelligent/inspectionConfig/${serviceType}` }" class="breadcrumb-item-link">分析任务</el-breadcrumb-item>
        <el-breadcrumb-item>{{taskInfo.taskName}}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="content-wrap">
      <!-- 下发失败提示 -->
      <div class="device-fail-status" v-if="taskInfo.taskType!=='CLOUD' && failNum>0 && showFailStatus">
        <span class="text_wrap"><i class="h-icon-info"></i>{{`${taskInfo.taskName}任务${taskInfo.taskType==='DCT4'?'初始化失败':`下发失败${failNum}台，请知晓.`}`}}</span>
        <span @click="showFailStatus= false" class="fail-status-wrap"><i class="h-icon-close"></i></span>
      </div>
      <!-- 任务详情 -->
      <div class="detail-content-mod">
        <div class="operator">
          <div class="operator_left">
            <span class="task-detail-name">{{taskInfo.taskName}}</span>
            <!-- 下发中或删除中或删除失败不允许编辑任务 -->
            <el-button icon="h-icon-edit" @click="editTask" :disabled="[2,7,6].includes(taskInfo.deployStatus)||!taskInfo.isAllowedToEditTask">编辑任务</el-button>
            <el-button icon="h-icon-close" @click="deleteTask" :disabled="!taskInfo.isAllowedToDeleteTask">删除任务</el-button>
            <el-button icon="h-icon-export" @click="exportInfo('ANALYSIS_RESULT')" v-show="isPlatformModel!=='LOCAL'&&taskInfo.deliverMode==='DEVICE_TASK'">导出</el-button>
            <el-button icon="h-icon-upload" @click="imgUpload" v-show="taskInfo.isAllowedToMockUploadPic">图片上传</el-button>
            <!-- <el-button icon="h-icon-export" @click="exportInfo('TOOL_RESULT')" v-show="this.isPlatformModel!=='LOCAL'">一站通导出</el-button> -->
            <el-button icon="h-icon-details" @click="markResultDetail" v-show="isPlatformModel!=='LOCAL'&&taskInfo.deliverMode==='DEVICE_TASK'">正误报统计</el-button>
            <el-button icon="h-icon-forward" @click="feedbackV2" v-show="taskInfo.isAllowedToFeedback">
              <div style="display: inline-block;position: relative;padding-right: 16px;">
                数据回传
                <el-tooltip placement="top" content="算法模型初次训练时，因数据集有限往往仅能展示初步效果；通过线上积累的数据进一步训练后，可有效提升算法模型的表现，您可手动发起线上数据的回传，数据回传后将放至对应的训练数据集，以便在AI训练平台做进一步的算法训练。">
                  <i class="h-icon-info" style="font-size: 22px;position: absolute;top: -1px;right: -5px"></i>
                </el-tooltip>
              </div>
            </el-button>
            <el-button icon="h-icon-filter" @click="filterConfidence" v-show="!typeIsOCR && !typeIsImg && (isPlatformModel!=='LOCAL')">筛选置信度</el-button>
          </div>
          <div class="expand-span" @click="changeExpandFlag()">
            <span class="text_and_icon">{{!isExpand? '展开任务详情' : '收起任务详情'}}
              <i style="margin-left:10px" :class="!isExpand ? 'h-icon-angle_down' : 'h-icon-angle_up'"></i>
            </span>
          </div>
        </div>
        <div class="description-mod" :style="{display:isExpand?'block':'none'}">
          <ul>
            <li><p class="label">算法模型</p><p class="value ellipsis" :title="taskInfo.algorithmModel">{{taskInfo.algorithmModel || '-'}}</p></li>
            <li><p class="label">算法版本</p><p class="value">{{taskInfo.algorithmVersion || '-'}}</p></li>
            <li><p class="label">应用类型</p><p class="value">{{changeTaskType(taskInfo.taskType) || '-'}}</p></li>
            <li><p class="label">分析模式</p><p class="value">{{taskInfo.analysisModeName || '-'}}</p></li>
            <!-- <li><p class="label yuzhi_wrap">置信度阈值<i class="info_icon" title="置信度表示算法检测结果的可信程度，值越大代表算法结果的可信程度越高。系统默认过滤置信度低于70%的算法检测结果，该阈值可根据实际情况灵活调整，可选范围是30%-100%"></i></p>
                <p class="value">{{(isPlatformModel==='LOCAL') ? '-' : (taskInfo.confidenceThreshold || '-')}}</p></li> -->
            <li><p class="label youhua_wrap">算法优化<i class="info_icon" title="建议您开启算法优化，开启后系统会自动将被标记为作废的图片数据回传至对应的训练数据集中。您可登录AI开放平台查看回传数据，并对算法模型进行增强训练优化"></i></p>
                <p class="value">{{taskInfo.feedbackShowName || '-'}}</p></li>
            <li><p class="label">创建时间</p><p class="value">{{formatDate(taskInfo.createTime) || '-'}}</p></li>
            <li><p class="label">任务状态</p>
              <p class="value">
                <el-switch v-model="taskInfo.enable" v-if="taskInfo.taskType=='CLOUD'" :before-change="beforeSwitchChange"></el-switch>
                <!-- <a v-else href="#sendDeviceList" ref="linkDeviceStatusList" style="color: #2196F3;text-decoration:none;"> -->
                <i v-else style="color: #2196F3;text-decoration:none;display:inline-block;cursor:pointer;font-style:normal" @click="goToBottomTable">
                  <span v-if="taskInfo.deployStatus === 2">下发中</span>
                  <span v-else-if="['DCT4'].includes(taskInfo.taskType)">{{DCT4StatusList[0].status}}</span>
                  <span v-else>成功下发{{successNum}}台 | 失败{{failNum}}台</span>
                </i>
              </p>
            </li>
          </ul>
        </div>
        <!-- <div v-if="!taskInfo.enable" class="empty-data">
          暂无数据
        </div> -->
        <!-- 搜索 -->
        <div class="panel-mod">
          <div class="filter-mod">
            <div class="item" style="width:320px">
              <el-date-picker v-model="timeRange" type="datetimerange" :default-time="['00:00:00', '23:59:59']" :clearable="false"
              @change="dateChange" :picker-options="pickerOptions"/>
            </div>
            <div class="item" style="width:240px">
              <channelsMutliSelect v-model="resourceList" class="channelsMutliSelect" :taskId="taskInfo.taskId"
                dialog-title="选择通道" :multiple-limit="500" @change="changeResource"></channelsMutliSelect>
              <!-- <chooseSearchChannel :taskId="taskInfo.taskId" ref="chooseSearchChannel" @saveClick="saveClick"></chooseSearchChannel> -->
            </div>
            <div class="item" v-show="isPlatformModel!=='LOCAL'" style="width:220px">
              <el-select v-model="searchForm.algorithmId" placeholder="请选择算法版本" @change="queryList">
                <el-option v-for="(item,index) in algorithmVersionList" :key="index" :label="item.versionName" :value="item.versionId">
                </el-option>
              </el-select>
            </div>
            <div class="item" style="width:220px">
              <el-select v-model="searchForm.ruleId" filterable clear>
                <el-option v-for="(item,index) in ruleList" :key="index" :label="item.ruleName" :value="item.ruleId">
                </el-option>
              </el-select>
            </div>
            <div class="right-operator">
              <el-button type="primary" @click="queryList">查询</el-button>
              <el-button @click="reset">重置</el-button>
            </div>
          </div>
          <!-- 标签集合 -->
          <div class="label-mod" v-if="!typeIsOCR && !typeIsImg && (isPlatformModel!=='LOCAL') && taskInfo.deliverMode==='DEVICE_TASK'">
            <ul>
              <div style="margin-right:10px">图片总数：{{totalPicNum}}张</div>
              <li :class="{'active': selectedLabel.length === 0}" @click="selectLabelItem('all')">全部</li>
              <li v-for="(item, index) in visiableLabelList" :key='index' @click="selectLabelItem(item)" :class="{'active': selectedLabel.includes(item.labelId)}" :title="item.labelName">
                {{item.labelName.length > 6
                ? item.labelName.substr(0,6) + '...' + ' ' + (!item.oppositeLabel ? (item.labelCountString + '次'): '')
                : item.labelName + ' ' + (!item.oppositeLabel ? (item.labelCountString + '次'): '')}}
              </li>
              <li class="add_label_btn" @click="addLabel"> + 添加可筛选标签</li>
            </ul>
          </div>
          <div v-if="channelList.length === 0" class="empty-data">
            <div class="empty-data-img">暂无数据</div>
          </div>
          <!-- 图片展示 -->
          <div class="channel-mod" v-if="channelList.length > 0" v-loading="loading">
            <!-- 通道 -->
            <div class="channel-left">
              <ul>
                <li v-for="(item, index) in channelList" :key="index" @click="displayCaptureDetail(item, index)" :class="{'active': index=== currentCaptureIndex}">
                  <p class="channel-image">
                    <imgCanvas :url='item.pictureUrl' height = "56" width = "60" v-show="item.pictureUrl" :selfRate="true"></imgCanvas>
                    <div class="small_img" v-show="!item.pictureUrl"></div>
                    <!-- <img class="small_img" :src='item.pictureUrlSmall' v-show="item.pictureUrlSmall"/>
                    <div class="small_img" v-show="!item.pictureUrlSmall"></div> -->
                  </p>
                  <div class="text">
                    <p class="channel-name">{{item.channelName}}</p>
                    <p class="channel-time">{{item.captureTime}}</p>
                  </div>
                </li>
              </ul>
              <!-- 页数变大宽度会超出 -->
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
                      <p class="view-operator_name view-operator_store_name" :title="displayPic.groupName">{{applicationSceneName}}名称：{{displayPic.groupName}}</p>
                      <p class="view-operator_name view-operator_store_name" :title="displayPic.channelName">通道：{{displayPic.channelName}}</p>
                      <p class="view-operator_name view-operator_store_name" v-show="displayPic.presetName" :title="displayPic.presetName">预置点：{{displayPic.presetName}}</p>
                    </div>
                    <div class="operator_right">
                      <div class="play_ocx_btn">
                        <el-button icon="h-icon-info_liveview" type="info" @click="playVideo()" v-show="!['open'].includes(serviceType)">播放视频</el-button>
                      </div>
                      <div class="switch_wrap">
                        <p class="view-operator_display-detection-area" v-if="isPlatformModel!=='LOCAL'&&taskInfo.deliverMode==='DEVICE_TASK'&&!isSplitMask">
                          <span>展示全量结果</span>
                          <el-switch v-model="showAllRecognition" @change="changeShowAllRecognition"></el-switch>
                        </p>
                        <p class="view-operator_display-detection-area" v-if="isPlatformModel!=='LOCAL'&&taskInfo.deliverMode==='DEVICE_TASK'">
                          <span>展示标签</span>
                          <el-switch v-model="displayLabel" @change="handlerDisplayLabel"></el-switch>
                        </p>
                        <p class="view-operator_display-detection-area" v-if="isPlatformModel!=='LOCAL'&&taskInfo.deliverMode==='DEVICE_TASK'">
                          <span>展示检测区域</span>
                          <el-switch v-model="displayDetectionArea" @change="handlerDetectionArea"></el-switch>
                        </p>
                      </div>
                      <div v-show="displayPic.resultStatus==='INCORRECT'" class="misreport">{{`误报：${displayPic.misreportReason}`}}</div>
                      <div v-show="displayPic.resultStatus==='MISS'" class="misreport">{{`漏报`}}</div>
                    </div>
                  </div>
                  <!-- 图片展示 -->
                  <div class="image-mod" v-if="displayType===0" style="width:896px">
                    <el-button type="iconButton" icon="h-icon-angle_left" class="image-left image-btn" :disabled="searchForm.pageNo===1 && currentCaptureIndex==0" @click="changImage('prev')"></el-button>
                    <el-button type="iconButton" icon="h-icon-angle_right" class="image-right image-btn" :disabled="searchForm.pageNo===channelTotalPage && currentCaptureIndex==channelList.length-1" @click="changImage('next')"></el-button>
                    <div class="canvas-mod" v-if="displayPic.pictureUrl">
                      <areaImage
                        ref="areaImage"
                        v-if="displayLabel||isSplitMask"
                        :width='896'
                        :height='503'
                        :url='displayPic.pictureUrl'
                        :calibrationList='calibrations'
                        @chooseFocusDom="chooseFocusDom"
                        :operationTypeList="['edit']"></areaImage>
                      <imgCanvas
                        v-else
                        :canDraw = 'canDraw'
                        :info="showAllRecognition ? oldDrawInfoAll : displayPic.oldDrawInfo"
                        :url='displayPic.pictureUrl'
                        height = "503"
                        width = "896"
                        :showText="typeIsOCR"
                        :displayDetectionArea="displayDetectionArea"
                        :lineWidth = "lineWidth"
                        :lineType = "lineType"
                        :useReg = "useReg"></imgCanvas>
                    </div>
                    <div v-else class="canvas-mod"></div>
                  </div>
                  <div class="discription" v-if="displayType===0">
                    <div>
                      <div class="discription_line" v-show="displayPic.ruleName && !typeIsImg">
                        <div class="discription_pre">规则名称：</div>
                        <div class="rule_name">{{displayPic.ruleName}}</div>
                      </div>
                      <div class="discription_line" v-show="displayPic.statResult">
                        <div class="discription_pre">统计结果：</div>
                        <div class="rule_name">{{displayPic.statResult}}</div>
                      </div>
                      <div class="discription_line" v-show="displayPic.quality">
                        <div class="discription_pre">图片分辨率：</div>
                        <div class="rule_name">{{displayPic.quality}}</div>
                      </div>
                      <div class="discription_line1">
                        <div class="discription_pre" v-show="isPlatformModel!=='LOCAL'&&taskInfo.deliverMode==='DEVICE_TASK'">{{displayPic.labels.length||typeIsImg ? '识别结果：' : ''}}</div>
                        <div class="tag_wrap">
                          <el-scrollbar wrap-class="demo-scrollbar-wrap">
                            <ul class="list" v-if="!typeIsOCR && !typeIsImg && (isPlatformModel!=='LOCAL') && taskInfo.deliverMode==='DEVICE_TASK'">
                              <li v-if="displayPic.labels.length" :class="{'active': areaSelectLabel.length === 0}" @click="onLabelClick('all')">全部</li>
                              <li :class="{'active': areaSelectLabel.includes(item.labelLineId)}" v-for="(item, index) in displayPic.labels" :key='index' :title="item.labelName.length > 6 ? item.labelName: ''" @click="onLabelClick(item)">
                                {{item.labelName.length > 6 ? item.labelName.substr(0,6) + '...' + ' ' + item.labelCount + '次' : item.labelName + ' ' + item.labelCount + '次'}}
                              </li>
                            </ul>
                            <div class="self_wrap" v-if="typeIsImg"><div class="self_tag_text" :title="displayPic.icmpresult">{{displayPic.icmpresult}}</div></div>
                            <ul class="list" v-if="typeIsOCR">
                              <li v-if="displayPic.results.length" :class="{'active': areaSelectLabel.length === 0}" @click="onLabelClick('all')">全部</li>
                              <li :class="{'active': areaSelectLabel.includes(item.labelLineId)}" v-for="(item, index) in displayPic.results" :key='index' :title="item.labelName.length > 6 ? item.labelName: ''" @click="onLabelClick(item)">
                                {{item.labelName.length > 6 ? item.labelName.substr(0,6) + '...' + '：' + item.ocrText : item.labelName + '：' + item.ocrText}}
                              </li>
                            </ul>
                          </el-scrollbar>
                        </div>
                      </div>
                      <!-- 纯样式起 -->
                      <!-- <div class="discription_line_wrap" v-show="typeIsImg"></div> -->
                      <!-- 纯样式止 -->
                    </div>
                  </div>
                </div>
                <div class="del_btn">
                  <el-button icon="h-icon-window_restor" v-show="this.isPlatformModel!=='LOCAL'&&taskInfo.deliverMode==='DEVICE_TASK'" @click="markTargetMiss">目标标记漏报</el-button>
                  <el-dropdown placement="top-end" trigger="click" @command="beforeMarkTargetResult" >
                    <el-button icon="h-icon-tag" v-show="this.isPlatformModel!=='LOCAL'&&taskInfo.deliverMode==='DEVICE_TASK'" :disabled="!canUseTargetMarkResultFlag" 
                    :title="!canUseTargetMarkResultFlag?'请选择具体目标框（可点击标签选中）' :''">目标标记正误报</el-button>
                    <el-dropdown-menu slot="dropdown" style="width:120px">
                      <el-dropdown-item command="CORRECT">正报</el-dropdown-item>
                      <el-dropdown-item command="INCORRECT">误报</el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                  <el-dropdown placement="top-end" @command="beforeMarkResult" trigger="click">
                    <el-button icon="h-icon-mark" v-show="this.isPlatformModel!=='LOCAL'&&taskInfo.deliverMode==='DEVICE_TASK'">图片标记正误报</el-button>
                    <el-dropdown-menu slot="dropdown" style="width:120px">
                      <el-dropdown-item command="CORRECT">正报</el-dropdown-item>
                      <el-dropdown-item command="INCORRECT">误报</el-dropdown-item>
                      <el-dropdown-item command="MISS">漏报</el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                  <el-button icon="h-icon-forward" @click="backPic" v-show="taskInfo.isAllowedToFeedback">回传</el-button>
                  <el-button icon="h-icon-details" @click="showAllTargetInfo(displayPic)">获取全量识别报文</el-button>
                  <el-button icon="h-icon-status" @click="reAnalysis()" v-show="taskInfo.isAllowedToReAnalysis">重新分析</el-button>
                  <el-button icon="h-icon-download" @click="downloadImg(displayPic.pictureUrl, displayPic.rowKey)" v-show="displayPic.pictureUrl">下载图片</el-button>
                  <el-button icon="h-icon-delete" @click="beforeInvalidPic">作废</el-button>
                </div>
              </div>
              <div class="img_wrap" v-if="typeIsImg">
                <div class="main_wrap">
                  <el-row class="h-demo-block-line" :gutter="16">
                    <el-col :span="2" style="padding:0">
                      <div class="left_wrap">
                        <div style="margin-bottom:12px">预置点底图</div>
                        <div>数量：{{albumData.length}}张</div>
                      </div>
                    </el-col>
                    <el-col :span="22" style="padding:0 28px;margin-top: 6px;">
                      <selfAlbum :data="albumData" ref="album" theme="light-gray" @self-click="handleOnChange" :shadow="false"></selfAlbum>
                    </el-col>
                  </el-row>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 数据回传 -->
      <!-- <div class="feedback_wrap" v-show="taskInfo.isAllowedToFeedback">
        <div class="feedback_describe">
          <div class="feedback_describe_text">
            算法模型初次训练时，因数据集有限往往仅能展示初步效果；通过线上积累的数据进一步训练后，可有效提升算法模型的表现，您可手动发起线上数据的回传，数据回传后将放至对应的训练数据集，以便在AI训练平台做进一步的算法训练。
          </div>
        </div>
        <div class="feedback_btn">
          <el-button type="primary" @click="openFeedback">数据回传</el-button>
        </div>
      </div> -->
      <!-- NVR或者IPC设备展示下发结果 -->
      <div id="statusTable" class="status-display-table" v-if="(isPlatformModel==='PLATFORM')&&!isTaskNameCloudOrDCT4">
        <h4 class="success"><a name="sendDeviceList">成功下发{{successNum}}台 | <span class="fail">失败{{failNum}}台</span></a></h4>
        <div class="filter-mod">
          <div class="item">
            <el-select v-model="filter.status" placeholder="请选择" @change="getDeviceStatusList" clear>
              <el-option
                v-for="item in statusList"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </div>
          <div class="item">
            <el-input v-model="filter.channelOrSerial" clearable suffix-icon="h-icon-search" placeholder="设备名称、设备序列号" :on-icon-click="handleDeviceClick" :clear-icon-click="clearDeviceClick"></el-input>
          </div>
          <div class="right-operator"><el-button @click="resendAll">全部重新下发</el-button></div>
        </div>
        <el-table :data="sendDeviceList">
          <el-table-column prop="deviceName" label="设备名称"></el-table-column>
          <el-table-column prop="deviceSerial" label="设备序列号"></el-table-column>
          <el-table-column prop="engine" label="引擎号" v-if="taskInfo.deliverMode!=='DELIVER_ONLY_PACKET'"></el-table-column>
          <el-table-column label="下发时间" inline-template>
            <div>
              {{formatDate(row.deployTime)}}
            </div>
          </el-table-column>
          <el-table-column label="下发状态" inline-template>
            <div>
              {{formatDeviceStatus(row.deployStatus)}}
            </div>
          </el-table-column>
          <el-table-column label="失败原因">
            <template slot-scope="scope">
              <span>{{scope.row.errorMsg || '-'}}</span>
            </template>
          </el-table-column>
          <el-table-column label="处理建议">
            <template slot-scope="scope">
              <span>{{scope.row.suggestion || '-'}}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="link" @click="resend(scope.row)">重新下发</el-button>
              <el-button type="link" @click="goToStoreConfig(scope.row)" style="margin-left:16px">应用仓库配置</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页 -->
        <div class="pagePart" style="padding-top:10px">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="sendDevice.pageNo"
            :page-size="sendDevice.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="sendDevice.totalNum">
          </el-pagination>
        </div>
      </div>
      <!-- DCT4算法展示下发结果 -->
      <!-- <div class="status-display-table" style="padding-bottom: 30px;" v-if="['DCT4'].includes(taskInfo.taskType)">
        <el-table :data="DCT4StatusList">
          <el-table-column prop="algName" label="算法名称"></el-table-column>
          <el-table-column prop="algVersion" label="算法版本"></el-table-column>
          <el-table-column prop="status" label="下发状态"></el-table-column>
          <el-table-column label="下发时间">
            <template slot-scope="scope">
              <div>
                {{formatDate(scope.row.algPublishTime)}}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="失败原因">
            <template slot-scope="scope">
              <div>
                {{scope.row.failReason || '-'}}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <div>
                <span v-if="scope.row.statusCode==='failed'" @click="DCT4Resend()" style="color: #2196F3; cursor: pointer">重新下发</span>
                <span v-else>-</span>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div> -->
      <channelInfoTable ref="channelInfoTable" v-if="isTaskNameCloudOrDCT4&&!isSecondFilterAnalysisMode"></channelInfoTable>
    </div>
    <addLabelModal :visible.sync="addLabelVisible" :labelInfo="allLabelList" :taskId="taskInfo.taskId" @flash="getLabelList"></addLabelModal>
    <feedbackModal :visible.sync="feedbackVisible" :algorithmId="taskInfo.algorithmId" :taskId="taskInfo.taskId"></feedbackModal>
    <invalidHandlerJudgeModal :visible.sync="invalidHandlerJudgeDialogVisible" :rowKey="displayPic.rowKey" :taskId="taskInfo.taskId"
    @flash="queryList" @updateFeekback="updateFeekback"></invalidHandlerJudgeModal>
    <ocxDialogModal :visible.sync="ocxDialogVisible" :displayPicParent="displayPic" :deviceSerial="deviceSerial"></ocxDialogModal>
    <resendModal :visible.sync="resendVisible" :taskId="taskInfo.taskId" @flash="getDeviceStatusList"></resendModal>
    <exportInfoModal :visible.sync="exportInfoVisible" :taskId="taskInfo.taskId" :algorithmId="taskInfo.algorithmId" :taskName="taskInfo.taskName" ref="exportInfoModal"></exportInfoModal>
    <showAllTargetInfoModal :visible.sync="showAllTargetInfoModalVisible" :displayPic="displayPic"></showAllTargetInfoModal>
    <imgPreview :albumData="albumData.map(item=>{return item.picUrl})" ref="imgPreview" @changeImgPreview="changeImgPreview"></imgPreview>
    <imgUploadModal :visible.sync="imgUploadModalVisible" :taskId="taskInfo.taskId"></imgUploadModal>
    <reAnalysisModal :visible.sync="reAnalysisModalVisible" :taskId="taskInfo.taskId" :displayPic="displayPic"></reAnalysisModal>
    <markResultModal :visible.sync="markResultModalVisible" :rowKey="displayPic.rowKey" @markResult="markResult"></markResultModal>
    <markTargetMissModall :visible.sync="markTargetMissModallVisible" :rowKey="displayPic.rowKey" @finisMark="finisMark" :tagsList="allLabelList"></markTargetMissModall>
    <markResultDetailModal :visible.sync="markResultDetailVisible" ref="markResultDetailModal"></markResultDetailModal>
    <filterConfidenceModal :visible.sync="filterConfidenceModalVisible" :algorithmVersionType="algorithmVersionType" :taskInfo="taskInfo"></filterConfidenceModal>
  </div>
</template>
<script>
import mixin from './mixin'
import {testParmas} from './params.js'
import {testResultData} from './params.js'
import channelInfoTable from './modal/channelInfoTable'
import imgPreview from './modal/imgPreview'
import addLabelModal from './modal/addLabelModal'
import feedbackModal from './modal/feedbackModal'
import ocxDialogModal from './modal/ocxDialogModal'
import resendModal from './modal/resendModal'
import exportInfoModal from './modal/exportInfoModal'
import imgUploadModal from './modal/imgUploadModal'
import reAnalysisModal from './modal/reAnalysisModal'
import markTargetMissModall from './modal/markTargetMissModall'
import markResultModal from './modal/markResultModal'
import markResultDetailModal from './modal/markResultDetailModal'
import showAllTargetInfoModal from './modal/showAllTargetInfoModal'
import invalidHandlerJudgeModal from './modal/invalidHandlerJudgeModal'
import filterConfidenceModal from './modal/filterConfidenceModal'
import { getFormatTime } from '@/assets/libs/util'
import { day, today, setFormatDate } from '@/plugin/utils/util'
import chooseSearchChannel from './modal/chooseSearchChannel'
import selfAlbum from '@/components/huiComponents/album/album'
import areaImage from '@/components/areaImage'
import imgCanvas from '@/components/drawImage/index'
import rangeRadioGroup from './modal/rangeRadioGroup'
import channelsMutliSelect from '@/components/channelsRange/channelsMutliSelect'
import { queryStore, queryChannelList, getLabel, queryTaskDetail, queryDeviceStatusList, sendDeivceAjax, updateFeedback, deleteTaskAjax, changeStatus,
  existsRunningFeedback, editPolygonDisplay, getAlgorithmVersionList, queryDCT4Status, republishDCT4, getRedirectUrl, getAllRecognition, taskReanalysis, 
  feedbackV2, invalidPic, backPic, getRuleList, markResultProxy, markTargetResult, getDisplayPicNewInfo 
} from './proxy'

export default {
  components: {
    addLabelModal,
    feedbackModal,
    invalidHandlerJudgeModal,
    ocxDialogModal,
    resendModal,
    exportInfoModal,
    imgUploadModal,
    imgPreview,
    selfAlbum,
    chooseSearchChannel,
    areaImage,
    imgCanvas,
    channelInfoTable,
    showAllTargetInfoModal,
    reAnalysisModal,
    markResultModal,
    markTargetMissModall,
    markResultDetailModal,
    channelsMutliSelect,
    filterConfidenceModal
  },
   mixins: [mixin],
  data () {
    return {
      loading: false,
      resourceList: [],
      markResultDetailVisible: false,
      markResultModalVisible: false,
      markTargetMissModallVisible: false,
      filterConfidenceModalVisible: false,
      isPlatformModel: 'PLATFORM', // PLATFORM：平台算法模型，LOCAL: 本地算法模型，LIGHT_KT2：轻量级超脑模型
      albumData: [],
      displayDetectionArea: false, // 展示检测区域
      setPageParams: false, // 是否手动设置大数据分页参数，主要为了解决点击标签后，获取channelLsit，自动走channelCurrentChange并且pageType错误的问题。
      invalidPreRowkey: '', // 作废图片属于prev分页参数时，先获取上页最后一个rowkey，根据这个rowkey,timeStamp和next反取出最新的列表数据
      invalidPreTimeStamp: '', // 作废图片属于prev分页参数时，先获取上页最后一个timeStamp，根据这个rowkey,timeStamp和next反取出最新的列表数据
      canvasWidth: (this.$store.state.windowWidth - 1000) < 896 ? 896 + '' : (this.$store.state.windowWidth - 1000) + '',
      exportInfoVisible: false, // 打开数据导出的弹框
      addLabelVisible: false, // 打开增加标签的弹框
      feedbackVisible: false, // 打开数据回传的弹框
      resendVisible: false, // 打开批量重新下发的弹框
      invalidHandlerJudgeDialogVisible: false, // 打开图片作废的算法优化和不再提醒的选择弹框
      ocxDialogVisible: false, // 视频回放弹框
      feedbackConfig: null,
      isExpand: false,
      isIE: (window.ActiveXObject || 'ActiveXObject' in window),
      macShow: false, //  如果操作系统为mac时则显示萤石视频插件
      deviceSerial: '', // 视频初始化获取appKey时后端需要的，当前点击图片对应的设备
      // 任务信息
      taskInfo: {
        taskName: '',
        algorithmModel: '',
        algorithmVersion: '',
        algorithmId: '', // 任务的算法版本id
        taskType: '',
        createTime: '',
        deployStatus: 5, // 非CLOUD类型下 2:发布中 3：发布失败 4:部分发布失败 5：发布成功 6：删除中 7：删除失败 9：删除成功
        enable: false // CLOUD类型下任务状态标志
      },
      // 查询通道过滤条件
      searchForm: {
        algorithmId: '', // 当前选择的算法版本id
        ruleId: '', // 规则id
        channelName: '',
        labelLineId: '',
        pageSize: 9,
        pageNo: 1,
        pageType: 'default',
        timeStamp: '',
        rowKey: ''
      },
      algorithmVersionList: [], // 当前算法已配置过的版本列表
      ruleList: [], // 当前任务的规则列表
      storeList: [], // 组织搜索的数据
      // 查询后的labels统计
      totalPicNum: 0,
      visiableLabelList: [], // 展示标签集合，visible为true的
      allLabelList: [], // 全部的反向标签集合
      channelList: [],
      channelTotalPage: 0, // 通道总页数
      channelTotalNum: 0, // 通道总数量
      successNum: 0, // 成功下发的设备数
      failNum: 0, // 失败下发的设备数
      // 下发设备状态列表查询参数
      filter: {
        status: '',
        channelOrSerial: ''
      },
      statusList: [{ 'label': '全部状态', 'value': '' }, { 'label': '成功状态', 'value': '1' }, { 'label': '失败状态', 'value': '3' }],
      // 下发设备状态列表分页参数
      sendDevice: {
        pageNo: 1,
        pageSize: 10,
        totalNum: 0,
        totalPage: 0
      },
      sendDeviceList: [], // 下发设备状态列表
      currentCaptureIndex: 0, // 当前选中的通道序号
      displayPic: {}, // 右侧大图展示的信息
      canDraw: true, // 画笔
      lineWidth: 2,
      lineType: 'rec',
      useReg: true,
      displayType: 0, // 展示类型:0-图片1-视频
      ocxData: {},
      selectedLabel: [],
      showFailStatus: true, // 是否展示失败横幅
      playInfo: '', // 播放视频的数据
      DCT4StatusList: [{
        algName: '',
        algVersion: '',
        status: '',
        algPublishTime: '',
        failReason: '',
        statusCode: ''
      }],
      timeRange: [setFormatDate(new Date(), 'yyyy-MM-dd 00:00:00'), setFormatDate(new Date(), 'yyyy-MM-dd 23:59:59')],
      algorithmVersionType: '',
      pickerOptions: {
        disabledDate (time) {
          // return time.getTime() >= today + day || time.getTime() < lastOneYear
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
      showAllRecognition: false,
      currentAllDrawResults: [], // 当前图片的全量结果
      showAllTargetInfoModalVisible: false,
      reAnalysisModalVisible: false,
      imgUploadModalVisible: false,
      canUseTargetMarkResultFlag: false,
      focusDomArr: [],
      calibrationsForSplitMask:[],
      calibrations: [],
      markResultType: 'image', // 正误报标记的是图片还是对象框 
      oldDrawInfoAll: []// 当前图片的全量结果，关闭标签时用老组件，因为数据都是新接口取，所以也得存一个全局变量
    }
  },
  computed: {
    isTaskNameCloudOrDCT4 () { // 是否云服务
      return ['CLOUD', 'DCT4'].includes(this.taskInfo.taskType)
    },
    isSecondFilterAnalysisMode () { // 是否二次分析
      return ['SECONDARY_FILTER', 'DIANA_SECONDARY_FILTER'].includes(this.taskInfo.analysisMode)
    },
    typeIsOCR () { // 是否OCR
      // return this.algorithmVersionType === 'OCR' // OCR不展示标签删选区域
      return ['OCR', 'NORMAL_OCR'].includes(this.algorithmVersionType)
    },
    typeIsImg () { // 是否图像比对
      return this.algorithmVersionType === 'IMAGE_COMPARISON' // 底图识别任务，下面有图片展示框、无标签等特征
    },
    isSplitMask() { // 是否语义分割
      return this.algorithmVersionType === 'SEMANTIC_SEG'
    }
  },
  watch: {
    '$store.state.windowWidth' (val) {
      this.canvasWidth = (this.$store.state.windowWidth - 1000) < 896 ? 896 + '' : (this.$store.state.windowWidth - 1000) + ''
    },
    displayPic: {
      handler (val) {
        this.albumData = val.bgImg ? val.bgImg.bgImgList : []
        this.$nextTick(() => {
          if (this.typeIsImg) {
            this.$refs.imgPreview.close()
            this.$refs.album && this.$refs.album.$selected(0)
          }
        })
        this.areaSelectLabel = []
        if(this.isSplitMask) {
          this.displayLabel = true
          return false
        } else {
          this.displayLabel = val.drawResults && val.drawResults.length <= 50
        }
      },
      deep: true
    },
    filterConfidenceModalVisible(newVal) {
      if (newVal) {
        // 弹窗显示时取消监听
        window.removeEventListener('keydown', this.handleKeyDown)
      } else {
        // 弹窗隐藏时恢复监听
        window.addEventListener('keydown', this.handleKeyDown)
      }
    }
    // displayPic (val) {
    //   this.albumData = val.bgImg ? val.bgImg.bgImgList : []
    //   this.$nextTick(() => {
    //     if (this.typeIsImg) {
    //       this.$refs.imgPreview.close()
    //       this.$refs.album && this.$refs.album.$selected(0)
    //     }
    //   })
    // }
  },
  created () {
    this.taskInfo.taskId = this.$route.params.taskId
  },
  async mounted () {
    await this.getTaskDetail()
    await this.getAlgorithmVersionList()
    this.getRuleList()
    window.addEventListener('keydown', this.handleKeyDown)
    // 判断电脑系统版本，当不为windows系统时则显示萤石视频插件
    let platform = window.navigator.platform
    if (platform !== 'Win32') {
      this.macShow = true
    }
  },
  methods: {
    handleKeyDown(e) {
      let _key = window.event.keyCode
      if (_key === 37) {
        this.changImage('prev')
      } else if (_key === 39) {
        this.changImage('next')
      }
    },
    filterConfidence() {
      this.filterConfidenceModalVisible = true
    },
    changeResource(data) {
      this.searchForm.deviceChoseList = data
      this.resourceList = data
    },
    chooseFocusDom(focusDomArr) { // 右侧单选按钮赋选中值
      if (focusDomArr && focusDomArr.length > 0 && focusDomArr[0].labelList && focusDomArr[0].labelList.length > 0) { // 带标签的绘制框，可以对具体对象进行正误报的标记
        this.canUseTargetMarkResultFlag = true
        this.focusDomArr = focusDomArr
      } else {
        this.canUseTargetMarkResultFlag = false
        this.focusDomArr = [] 
      }
    },
    imgUpload () {
      this.imgUploadModalVisible = true
    },
    // 全量的报文太大，只能单独开接口查询
    async changeShowAllRecognition () {
      if (this.showAllRecognition) {
        let { code, data } = await getAllRecognition({ rowKey: this.displayPic.rowKey, taskId: this.taskInfo.taskId })
        if (code === 0) {
          this.currentAllDrawResults = data.drawResults
          data.polygonDetails = this.displayPic.polygonDetails
          let tempArr = this.displayPic.polygonDetails.map(_ => {
            return {
              type: '',
              regionColor: _.color,
              region: _.polygons
            }
          })
          this.currentAllDrawResults = this.currentAllDrawResults.concat(tempArr)

          this.oldDrawInfoAll = this.currentAllDrawResults
          const { areas } = this.getAllArea(data)
          this.getPolygon(areas, data, 'polygon')
          this.currentAllDrawResults = areas
          this.setCalibrations()
        }
      } else {
        this.getDisplayPicNewInfo()
      }
    },
    goToStoreConfig (row) {
      let serviceType = this.serviceType
      window.open(`${location.origin}${location.pathname}#/intelligent/inspectionConfig/${serviceType}/storeConfig/${row.deviceSerial}/${this.taskInfo.taskId}/${serviceType}`, '_blank')
    },
    changeImgPreview (index) {
      this.$refs.album.$selected(index)
    },
    handleOnChange (item) {
      if (item) {
        this.$refs.imgPreview.preview('dark', item.key)
      }
    },
    // 日期重新选择后
    async dateChange () {
      await this.getAlgorithmVersionList()
    },
    exportInfo (type) {
      let params = {...this.searchForm, exportType: type}
      let arr = ['pageSize', 'pageNo', 'pageType', 'rowKey', 'timeStamp']
      arr.forEach(item => {
        delete params[item]
      })
      params.startTime = getFormatTime(this.timeRange[0]) // 时间特殊处理下，searchForm的时间是点击了查询以后的，这里使用时间控件当前展示的
      params.endTime = getFormatTime(this.timeRange[1])
      const h = this.$createElement
      this.$confirm(`请选择导出方式`, {
        type: 'info',
        size: 'small',
        message: h(rangeRadioGroup),
        callback: async (action, instance) => {
          if (action === 'confirm') {
            const rangeRadioGroupRef = instance.$slots.default[0].componentInstance
            params.exportPattern = rangeRadioGroupRef.range
            await this.$refs.exportInfoModal.save(params)
          }
          // 解决elCheckbox没有成功重置的问题
          instance.message = ''
        },
      })
    },
    // 转换下发状态
    formatDeviceStatus (val) {
      let map = {
        1: '下发成功',
        2: '下发中',
        3: '下发失败',
        4: '删除中',
        5: '删除失败'
      }
      return map[val] || '-'
    },
    // 转换任务类型
    changeTaskType (val) {
      if (val === 'CLOUD') {
        return '云服务-在线验证'
      } else if (val === 'DCT4') {
        return '云服务-云眸'
      }
      return val
    },
    // 编辑任务
    editTask () {
      this.$router.push({ name: 'inspectionConfigDetail', params: { isAdd: 'edit', taskId: this.taskInfo.taskId, serviceType: this.serviceType } })
    },
    // 删除任务
    deleteTask () {
      this.$confirm(`确定删除${this.taskInfo.taskName}任务吗？`, {
        type: 'question'
      }).then(async () => {
        // let { code } = await deleteTaskAjax({idList: [].push(this.taskInfo.taskId)})
        let { code } = await deleteTaskAjax([this.taskInfo.taskId])
        if (code === 0) {
          this.$message.success('删除成功！')
          this.$router.push({ name: 'inspectionConfig', params: { serviceType: this.serviceType } })
        } else {
          this.$message.warning('删除失败！')
        }
      }).catch(() => {})
    },
    // 修改任务状态
    beforeSwitchChange (val) {
      var temp = val ? '关闭' : '开启'
      this.$confirm(`确定${temp}${this.taskInfo.taskName}任务吗？`, {
        type: 'question'
      }).then(async () => {
        let { code, message } = await changeStatus({ taskId: this.taskInfo.taskId, enable: !val })
        if (code === 0) {
          this.taskInfo.enable = !val
          this.$message.success('修改成功！')
        } else {
          this.$message.warning(message)
        }
      }).catch(() => {})
    },
    saveClick () {
      // this.searchForm.deviceChoseList = this.$refs.chooseSearchChannel.getValue()
      this.getLabelList()
      this.getChannelList()
    },
    // 获取组织搜索数据
    getStoreList () {
      queryStore(this.taskInfo.taskId).then((res) => {
        if (+res.code === 0) {
          this.storeList = res.data
        }
      })
    },
    // 获取通道列表
    async getChannelList (invalidFlag, isChooseLastOne) {
      if (isChooseLastOne === '1') { // 如果作废是最后一页的最后仅一条图片，请求列表时要请求上一个pageNo
        if (this.searchForm.pageNo > 1) {
          this.searchForm.pageNo--
        } else {
          this.searchForm.pageNo = 1
        }
      } else if (isChooseLastOne === '2') { // 作废的是prev的分页参数('2')中的图片
        this.searchForm.pageType = 'next'
        this.searchForm.timeStamp = this.invalidPreTimeStamp
        this.searchForm.rowKey = this.invalidPreRowkey
      }
      this.displayType = 0
      let info
      let temp
      this.searchForm.taskId = this.taskInfo.taskId
      this.searchForm.startTime = getFormatTime(this.timeRange[0])
      this.searchForm.endTime = getFormatTime(this.timeRange[1])
      let { code, data } = await queryChannelList(this.searchForm)
      if (code === 0) {
        data.rows.forEach((item, ii) => {
          item.bgImg && item.bgImg.bgImgList.forEach((v, i) => { // 图像比对的
            v.key = i
            v.url = v.picUrl
          })
          item.pictureUrlSmall = item.pictureUrl ? (item.pictureUrl + '&process=image/resize,limit_0,m_lfit,w_60,h_60/quality,q_100') : ''
          item.labels = []
          info = []
          item.results = item.results || []
          item.results.sort(function (a, b) { // 按照labelLineId长度排序，需求是有分类+检测时，按照分类结果展示画框，这里简要处理成覆盖。
            if (a['labelLineId'] && b['labelLineId'] && a['labelLineId'].length && b['labelLineId'].length) {
              if (a['labelLineId'].length > b['labelLineId'].length) {
                return 1
              } else {
                return -1
              }
            }
          })

          item.results.forEach((obj) => {
            temp = {}
            temp.labelName = obj.labelName
            temp.labelCount = obj.detectCount
            temp.labelLineId = obj.labelLineId
            temp.splitMappingLabel = `${obj.labelLineId} ${obj.labelName}`
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
        })
        this.channelList = data.rows || []
        this.channelTotalNum = data.total
        this.channelTotalPage = data.totalPage
        this.displayPic = {}
        if (invalidFlag) { // 图片作废走进来的
          if (isChooseLastOne === '1') { // 作废的最后一页的仅一张图片，选中上一页的最后一张
            if (this.channelList.length > 0) {
              this.currentCaptureIndex = this.channelList.length - 1
              this.displayPic = this.channelList[this.currentCaptureIndex]
            }
          } else if (isChooseLastOne === '2') { // 作废的是prev的分页参数的图片
            if (this.channelList.length > 0) {
              this.displayPic = this.channelList[this.currentCaptureIndex]
            }
          } else if ((this.channelList.length > 0) && (this.currentCaptureIndex >= this.channelList.length)) { // 当前currentCaptureIndex已经无法在当前的channelList选中，则默认选中上一个
            this.currentCaptureIndex--
            this.displayPic = this.channelList[this.currentCaptureIndex]
          } else {
            this.displayPic = this.channelList[this.currentCaptureIndex]
          }
        } else {
          this.displayPic = this.channelList.length > 0 ? this.channelList[0] : {}
          // this.currentCaptureIndex = 0
        }
        this.deviceSerial = this.displayPic.deviceSerial || ''
        this.setPageParams = false
        this.albumData = this.displayPic.bgImg ? this.displayPic.bgImg.bgImgList : []
        if (this.channelList.length > 0) {
          this.getDisplayPicNewInfo()
        }
      }
    },
    getAllAreaNew (channel) {
      let areasNew = []
      channel.drawResults && channel.drawResults.forEach((area, index) => {
        let labelList = []
        labelList = ((area && area.aiResultLabelInfo) || []).map(label => {
          let text = area.resultStatus === 'CORRECT' ? '（正报）' : area.resultStatus === 'INCORRECT' ? `（误报：${area.misreportReason}）` : ''
          return {
            labelId: label.labelId,
            text: label.labelName + text,
            labelLineId: label.labelLineId,
            deletable: false,
            confidence: label.confidence ? label.confidence + '' : ''
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
    onLabelClick (row) {
      if (!this.displayLabel) {
        return
      }
      if (row === 'all') {
        if (this.areaSelectLabel.length) {
          this.areaSelectLabel = []
          this.setCalibrations('all')
        } else {
          //  全部不显示，照之前的逻辑写，只能给一个不太可能存在的值去过滤
          this.areaSelectLabel = ['no_need_show_label_and_area']
          this.setCalibrations('none')
        }
        return false
      }
      let idx = this.areaSelectLabel.findIndex(item => {
        return item === row.labelLineId
      })
      idx > -1 ? this.areaSelectLabel.splice(idx, 1) : this.areaSelectLabel.push(row.labelLineId)
      this.setCalibrations()
    },
    // 展示抓图详情
    displayCaptureDetail (item, index) {
      this.currentCaptureIndex = index
      this.displayPic = item
      this.deviceSerial = item.deviceSerial
      this.displayType = 0 // 设置为图片模式
      this.changeShowAllRecognition()
      this.getDisplayPicNewInfo() // 每次切换时，获取图片最新的一些信息
    },
    // 获取标签集合
    async getLabelList () {
      if (this.typeIsImg || (this.isPlatformModel === 'LOCAL')) { // 底图库的任务没有标签
        return false
      }
      this.searchForm.startTime = getFormatTime(this.timeRange[0])
      this.searchForm.endTime = getFormatTime(this.timeRange[1])
      let { code, data } = await getLabel({ ...this.searchForm, taskId: this.taskInfo.taskId })
      if (code === 0 && data) {
        this.totalPicNum = data.totalPicNum || 0
        this.visiableLabelList = data.labelResults && data.labelResults.filter(item => {
          return item.visible
        })
        this.allLabelList = data.labelResults
        this.setPageParams = false
        this.visiableLabelList.forEach(item => { // 如果isTooMuchData为true，标签的数字次数展示为*
          item.labelCountString = data.isTooMuchData ? '*' : item.labelCount
        })
      }
    },
    // 选择label标签
    selectLabelItem (row) {
      if (row === 'all') {
        this.selectedLabel = []
        this.searchForm.labelLineId = this.selectedLabel.join(',')
        this.queryList()
        return false
      }
      let idx = this.selectedLabel.findIndex(item => {
        return item === row.labelId
      })
      idx > -1 ? this.selectedLabel.splice(idx, 1) : this.selectedLabel.push(row.labelId)
      if (this.selectedLabel.length > 5) { // 筛选标签不能超过5个
        this.$message.info('标签选择不能超过5个')
        return false
      }
      this.searchForm.labelLineId = this.selectedLabel.join(',')
      this.setPageParams = true
      this.queryList()
    },
    playVideo () {
      this.ocxDialogVisible = true
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
      if (this.setPageParams) {
        this.searchForm.pageType = 'default'
        this.searchForm.rowKey = ''
        this.searchForm.timeStamp = ''
        this.searchForm.pageNo = 1
      } else {
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
      }
      this.getChannelList()
    },
    handleDeviceClick () {
      this.getDeviceStatusList()
    },
    clearDeviceClick () {
      this.filter.channelOrSerial = ''
      this.getDeviceStatusList()
    },
    handleSizeChange (val) {
      this.sendDevice.pageSize = val
      this.sendDevice.pageNo = 1
      this.getDeviceStatusList()
    },
    handleCurrentChange (val) {
      this.sendDevice.pageNo = val
      this.getDeviceStatusList()
    },
    // 查询
    queryList () {
      this.currentCaptureIndex = 0
      this.searchForm.pageType = 'default'
      this.searchForm.timeStamp = ''
      this.searchForm.rowKey = ''
      this.searchForm.pageNo = 1
      this.setPageParams = true
      this.getLabelList()
      this.getChannelList()
      if (this.isTaskNameCloudOrDCT4 && this.$refs.channelInfoTable) { // 云端展示通道列表
        this.$refs.channelInfoTable.init(this.taskInfo)
      }
    },
    // 不重置分页参数的查询，比如作废图片后
    invalidAndQueryList (invalidFlag, isChooseLastOne) {
      this.getChannelList(invalidFlag, isChooseLastOne)// 作废图片请求列表数据不重置分页参数，传true过去以区别其他请求
      this.getLabelList()
    },
    reset () {
      this.searchForm.channelName = ''
      this.searchForm.ruleId = ''
      this.selectedLabel = []
      this.searchForm.labelLineId = ''
      this.searchForm.deviceChoseList = []
      // this.$refs.chooseSearchChannel.clear()
      this.resourceList = []
      this.timeRange = [setFormatDate(new Date(), 'yyyy-MM-dd 00:00:00'), setFormatDate(new Date(), 'yyyy-MM-dd 23:59:59')]
      this.queryList()
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
    showAllTargetInfo () {
      this.showAllTargetInfoModalVisible = true
    },
    reAnalysis () {
      if (this.isTaskNameCloudOrDCT4) {// 云端直接分析当前图片
        taskReanalysis({urls: [this.displayPic.pictureUrl], taskId: this.taskInfo.taskId, rowKey: this.displayPic.rowKey}).then(res => {
        if (res.code === 0) {
          this.$message.success('操作成功！')
        }
      })
      } else { //设备端可以弹框，进行图片更改
        this.reAnalysisModalVisible = true
      }
    },
    async downloadImg (imgUrl, rowKey) { // 下载图片
      const { data: { redirectUrl } } = await getRedirectUrl({
        url: imgUrl
      })
      const sperate = redirectUrl.split('?')[1] ? '&' : '?'
      this.download(`${redirectUrl}${sperate}response-content-type=application%2Foctet-stream&response-content-disposition=attachment;`, rowKey)
    },
    beforeMarkTargetResult(command) {
      this.markResultType = 'imageTarget'
      if (command === "CORRECT") { // 正报
        this.markResult({ resultStatus: command, misreportReason: '', rowKey: this.displayPic.rowKey, targetId: this.focusDomArr[0].targetId})
      } else { // 误报
        this.markResultModalVisible = true
      }
    },
    markTargetMiss() {
      this.markTargetMissModallVisible = true
    },
    finisMark() {
      this.getDisplayPicNewInfo()
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
          if (this.showAllRecognition) {
            this.changeShowAllRecognition()
          } else {
            this.getDisplayPicNewInfo()
          }
        }
      })
    },
    async getDisplayPicNewInfo () { // 获取最新的当前选中的图片的一些最新信息
      this.loading = true
      this.canUseTargetMarkResultFlag = false
      this.focusDomArr = [] 
      let res = await getDisplayPicNewInfo({ rowKey: this.displayPic.rowKey })
      if(res.code === 0) {
        let item = { ...this.displayPic, ...res.data }
        let areas = []
        if (!this.isSplitMask) {
          areas = this.getAllArea(item).areas // 重新渲染标签
        } else { // 语义分割算法
          if (item.maskInfo && item.maskInfo.maskData) {
            let mappingLabels = item.labels.map(l => l.splitMappingLabel)
            item.mapping = [{"labels": mappingLabels}]
            item.results = [{maskInfo: {...item.maskInfo}}] // 包一层results，和研究院的参数格式一致
            areas = await this.verifyFile(item)
          }
        }
        await this.getPolygon(areas, item, 'polygon') // 渲染外层绘制框
        item.info = areas
        this.displayPic = { ...item }
        /* 
        下面这个setTimeout以及1500的设置原因，为了解决语义分割像素渲染问题
        // https://pbpic.hik-cloud.com/poseidon/capture/b69af485a2b34135bb4b031f3a8dd61e/D12318081/1/d3e744f0-20d4-11f0-bd49-17ff01d1a7f9.jpg
        // https://pbpics.hik-cloud.com/poseidon/capture/manual/2025/04/25/2cf36819679e43e8b5b035b69735c9a8/J42839102/202542539194a8c2b6d4286b7ad432d59ccc88e.jpg?timestamp=1969029187c&v=1&signature=d58cd59abde0ed9c49cbfdb787ff7953&moduleId=inspect_config_polygon_img
        1、一开始的原因是：语义分割像素渲染的id一开始无效（特别是首次进入，或者刷新浏览器时），网慢时常规绘制框的渲染也出不来。然后点击下其他图片，后续就都正常了
        2、后来经过调试，发现是图片来源的问题，如果上面pbpics的或者静态资源图片，就是正常加载图片并渲染。如果是上面pbpic的，图片首次加载不出来。然后点击下其他图片，后续就都正常了
        3、pbpic，用img.onload和img.onerror，会进入img.onerror，点击下其他图片，会走两次图片渲染，一次img.onload里，一次img.onerror里，不知道原因
        4、改不动，暂时先这样吧
        5、最新改动：绘制组件的图片地址改成处理过的pictureUrlSmall，进一步减少图片加载时间
        */
      //  setTimeout(() => {
      //     this.setCalibrations()
      //     this.loading = false
      //   }, !this.isSplitMask ? 500 :500)
        this.setCalibrations()
        this.loading = false
      }
    }, 
    setCalibrations(selectLabelAll) {
      this.calibrations = []
      if (this.displayPic && this.displayPic.info) {
        if (this.isSplitMask) { // 分割算法，像素渲染，所以之前的坐标那一套用不了，单独走分支吧
          let originInfo = this.displayPic.info.map(val => {
            return {...val}
          })
          if (!this.displayDetectionArea) { // 不展示检测区域
            originInfo = originInfo.filter(ori => ori.id.indexOf('polygon_') < 0)
          }
          if (this.areaSelectLabel.length || selectLabelAll) {//  选中了识别结果的标签，或点击全部（selectLabelAll：all<全部>标签选中，none<全部>标签置灰）
            let filterArr = []
            if (selectLabelAll === 'all') { // <全部>标签选中
              filterArr = originInfo
            } else if (selectLabelAll === 'none') { // <全部>标签置灰
              filterArr = originInfo.filter(ori => !ori.labelList || !ori.labelList.length)
            } else {
              let splitMappingLabel = this.displayPic.labels.map(l => l.splitMappingLabel)
              let splitMappingLabelObj = {}
              splitMappingLabel.forEach(s => {
                let handle = s.split(' ')
                splitMappingLabelObj[handle[0]] = handle[1]
              })
              let areaSelectLabelNames = []
              Object.keys(splitMappingLabelObj).forEach(key => {
                if (this.areaSelectLabel.includes(key)) {
                  areaSelectLabelNames.push(splitMappingLabelObj[key])
                }
              })
              filterArr = originInfo.filter(item => {
                return !item.labelList || !item.labelList.length || areaSelectLabelNames.includes(item.labelList[0].text)
              })
            }
            originInfo = filterArr
          }
          if (!this.displayLabel) { // 不展示标签
            originInfo.forEach(ori => {
              ori.labelList = []
            })
          }
          this.calibrations = originInfo
        } else {
          let newArr = this.showAllRecognition ? JSON.parse(JSON.stringify(this.currentAllDrawResults)) : JSON.parse(JSON.stringify(this.displayPic.info))
          //  选中了标签
          if (this.areaSelectLabel.length) {
            if (this.displayDetectionArea) { // 展示检测区域
              this.calibrations = this.filterArea(newArr, this.areaSelectLabel, true, this.displayLabel)
              return false
            } else {
            //  不需要展示识别区域
              newArr = newArr.filter(item => item.id.indexOf('polygon_') < 0) //v1.8.2，删除识别区域的数据，id带有标识polygon_的
              this.calibrations = this.filterArea(newArr, this.areaSelectLabel, false, this.displayLabel)
              return false
            }
          }
          //  没有选中标签
          if (this.displayDetectionArea) { // 展示检测区域
            this.calibrations = this.filterLabel(newArr, true, this.displayLabel)
            return false
          }
          //  不需要展示识别区域
          newArr = newArr.filter(item => item.id.indexOf('polygon_') < 0)//v1.8.2，删除识别区域的数据，id带有标识polygon_的
          this.calibrations = this.filterLabel(newArr, false, this.displayLabel)
        } 
      }
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
    // 回传图片
    async backPic() {
      let { code } = await backPic({ rowKey: this.displayPic.rowKey })
      if (code === 0) {
        this.$message.success('回传成功！')
      }
    },
    // 作废图片，是否弹算法优化选择和不再提醒的弹框
    beforeInvalidPic () {
      // if (this.feedbackConfig === 'ALWAYS' || this.feedbackConfig === 'REVOKE_ONLY') { // 不需弹算法优化选择和不再提醒的弹框
        this.$confirm(`确定将该照片作废吗？`, {
          type: 'question'
        }).then(() => {
          this.invalidHandler()
        }).catch(() => {})
      // } else { // REMIND需要弹算法优化选择和不再提醒的弹框
      //   this.invalidHandlerJudgeDialogVisible = true
      // }
    },
    async invalidHandler () {
      let { code } = await invalidPic({ rowKey: this.displayPic.rowKey })
      if (code === 0) {
        this.$message.success('作废成功！')
        setTimeout(() => {
          if (this.channelList.length === 1) {
            this.invalidAndQueryList(true, '1')// invalidFlag是否作废走进来, isChooseLastOne是否作废最后一页且一张图片('1')或是否作废是prev的分页参数('2')中的图片
          } else if (this.searchForm.pageType === 'prev') {
            let params = { ...this.searchForm }
            params.taskId = this.taskInfo.taskId
            params.pageNo = this.searchForm.pageNo - 1
            params.pageType = 'prev'
            params.rowKey = this.channelList[0].rowKey
            params.timeStamp = this.channelList[0].timeStamp
            queryChannelList(params).then(res => {
              if (res.code === 0) {
                this.invalidPreRowkey = res.data.rows[8].rowKey
                this.invalidPreTimeStamp = res.data.rows[8].timeStamp
                this.invalidAndQueryList(true, '2')
              }
            })
          } else {
            this.invalidAndQueryList(true, '')
          }
        }, 1000)
      } else {
        this.$message.warning('作废失败！')
      }
    },
    // 不再提醒后并作废图片后，刷新列表并更新的feedback状态
    updateFeekback (feekback) {
      this.feedbackConfig = feekback
    },
    // 单个重新下发
    resend (item) {
      this.$confirm(`确定要重新下发吗？`, {
        type: 'question'
      }).then(async () => {
        let queryData = {}
        queryData.deviceTaskId = item.deviceTaskId
        queryData.taskId = this.taskInfo.taskId
        queryData.force = true
        let { code } = await sendDeivceAjax(queryData)
        if (code === 0) {
          this.$message.success('重新下发中！')
          this.getDeviceStatusList()
        } else {
          this.$message.warning('重新下发失败！')
        }
      }).catch(() => {})
    },
    // 批量重新下发
    resendAll () {
      this.resendVisible = true
    },
    async sendFun (queryData) {
      let { code } = await sendDeivceAjax(queryData)
      if (code === 0) {
        this.$message.success('重新下发中！')
        this.getDeviceStatusList()
      } else {
        this.$message.warning('重新下发失败！')
      }
    },
    // 区域是否展示修改函数
    async handlerDetectionArea () {
      await editPolygonDisplay(this.taskInfo.taskId, { flag: this.displayDetectionArea })
      this.setCalibrations()
    },
    // 获取任务详情
    async getTaskDetail () {
      let { code, data } = await queryTaskDetail(this.taskInfo.taskId)
      if (code === 0) {
        this.isPlatformModel = data.modelSource
        this.taskInfo = { ...data }
        this.taskInfo.algorithmModel = (this.isPlatformModel !== 'LOCAL') ? data.algorithmModelName : '-'
        this.taskInfo.confidenceThreshold = data.confidenceThreshold ? (data.confidenceThreshold + '%') : ''
        this.taskInfo.feedbackShowName = data.feedback === 'ALWAYS' ? '启用' : '禁用'
        this.successNum = data.deploySuccessCount
        this.failNum = data.deployErrorCount
        this.feedbackConfig = data.feedback
        this.displayDetectionArea = data.polygonDisplay // 展示检测区域的标志位
        if (!this.isTaskNameCloudOrDCT4) {
          this.getDeviceStatusList()
          if (this.$route.params.type === 'fail') {
            this.$nextTick(() => {
              this.goToBottomTable()
            })
          }
        }
        if (['DCT4'].includes(this.taskInfo.taskType)) {
          this.queryDCT4Status()
        }
        this.algorithmVersionType = data.algorithmVersionType
      }
    },
    async getRuleList() {
      let { data } = await getRuleList({ taskId: this.taskInfo.taskId })
      this.ruleList = data
    },
    // 获取该任务算法已配置过的版本
    async getAlgorithmVersionList () {
      if (this.isPlatformModel === 'LOCAL') { // 本地专业算法，没有算法版本的搜索条件
        this.getChannelList() // 手动触发下查询
        return false
      }
      let { code, data } = await getAlgorithmVersionList(this.taskInfo.taskId, { startDateTime: getFormatTime(this.timeRange[0]), endDateTime: getFormatTime(this.timeRange[1]) })
      if (code === 0) {
        this.algorithmVersionList = data || []
        let ids = data.map(v => v.versionId)
        // 如果算法当前版本在其中则设置为当前版本；如果不在且数组不为空，则默认选择第一个；若返回为空，则直接为空
        if (ids.includes(this.taskInfo.algorithmId)) {
          this.searchForm.algorithmId = this.taskInfo.algorithmId
          return
        }
        this.searchForm.algorithmId = data.length ? data[0].versionId : ''
        if (this.searchForm.algorithmId === '') { // 如果算法版本没有，无法触发change，手动请求下数据，否则mounted重复请求接口
          this.queryList()
        }
      }
    },
    goToBottomTable () {
      this.$el.querySelector('#statusTable') && this.$el.querySelector('#statusTable').scrollIntoView()
    },
    // 获取设备下发状态列表
    async getDeviceStatusList () {
      let queryData = {
        pageNo: this.sendDevice.pageNo,
        pageSize: this.sendDevice.pageSize,
        deviceNameOrDeviceSerialLike: this.filter.channelOrSerial,
        deployStatus: this.filter.status,
        taskId: this.taskInfo.taskId
      }
      let { code, data } = await queryDeviceStatusList(queryData)
      if (code === 0) {
        this.sendDeviceList = data.rows || []
        this.sendDevice.totalNum = data.total
        this.sendDevice.totalPage = data.totalPage
      }
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
      await this.changeShowAllRecognition()
    },
    changeExpandFlag () {
      this.isExpand = !this.isExpand
    },
    addLabel () {
      this.addLabelVisible = true
    },
    openFeedback () {
      existsRunningFeedback().then((res) => {
        if (+res.code === 0) {
          if (res.data) {
            this.$message.warning('有正在执行中的数据回传任务，请稍后再试！')
          } else {
            this.feedbackVisible = true
          }
        }
      })
    },
    feedbackV2() {
      this.$confirm(`确定进行数据回传吗？`, {
        type: 'question'
      }).then(() => {
        feedbackV2(this.searchForm).then((res) => {
          if (+res.code === 0) {
            this.$message.success('操作成功！')
          }
        })
      }).catch(() => {})
    },
    // 转换时间格式
    formatDate (val) {
      if (!val) return ''
      let time = new Date(val)
      let year = time.getFullYear()
      let month = time.getMonth() + 1 < 10 ? '0' + (time.getMonth() + 1) : time.getMonth() + 1
      let date = time.getDate() < 10 ? '0' + time.getDate() : time.getDate()
      let h = time.getHours()
      h = h < 10 ? '0' + h : h
      let mi = time.getMinutes()
      mi = mi < 10 ? '0' + mi : mi
      let s = time.getMilliseconds()
      s = s < 10 ? '0' + s : s
      return year + '-' + month + '-' + date + ' ' + h + ':' + mi + ':' + s
    },
    // DCT4算法获取下发状态列表
    async queryDCT4Status () {
      let { code, data } = await queryDCT4Status({ taskId: this.taskInfo.taskId })
      var res = []
      if (code === 0) {
        res.push(data)
        this.DCT4StatusList = res
      }
    },
    // DCT4算法任务重新下发
    async DCT4Resend () {
      let { code } = await republishDCT4({ taskId: this.taskInfo.taskId })
      if (code === 0) {
        this.$message.success('重新下发中！')
        this.queryDCT4Status()
      }
    },
    handlerDisplayLabel () {
      this.areaSelectLabel = []
      this.setCalibrations()
    }
  },
  destroyed () {
    window.removeEventListener('keydown', this.handleKeyDown)
  }
}
</script>

<style lang="scss" scoped>
 @import "./style.scss";
 .yuzhi_wrap{
   display: flex;
 }
 .youhua_wrap{
   display: flex;
 }
 .info_icon{
    width: 20px;
    height: 20px;
    background: url('../../assets/img/info.png') no-repeat 100% 100%;
    background-position: 1px -2px;
 }
 .empty-data{
   display: flex;
   align-items: center;
   justify-content: center;
   border-top: 1px solid #dedede;
   .empty-data-img{
     width: 300px;
     height: 300px;
     line-height: 400px;
     background: url(../../assets/img/no_data.png) no-repeat;
     background-position:50% 20%;
     font-size: 16px;
     color: #B2B2B2;
     text-align: center;
   }
 }
</style>

<style lang="scss">
 @import "./album.scss";
 @import "./imgPreview.scss";
.task-detail{
  .del_btn{
    .el-button+.el-button{
      margin-left: 0px;
    }
  }
  .demo-scrollbar-wrap {
    height: 38px;
    overflow-x: hidden;
  }
  .search_channel_wrap{
    cursor: pointer;
    input{
      cursor: pointer;
    }
  }
  .img_wrap{
    .main_wrap{
      .h-album{
        padding: 4px 8px;
      }
    }
    .h-album__wrapper{
      .h-img-view__wrapper{
        img{
          object-fit: fill!important;
        }
      }
    }
  }
  .search_tag_wrap{
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    top: 0;
    left: 4px;
    cursor: pointer;
    .name{
      max-width:86px;
      background: #f5f5f5;
      border: 1px solid #e0e0e0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      height: 24px;
      padding: 0 4px;
    }
    .num{
      max-width:42px;
      margin-left:4px;
      background: #f5f5f5;
      border: 1px solid #e0e0e0;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 24px;
      padding: 0 4px;
    }
  }
  .h-album--theme-light-gray{
    background: rgba(0,0,0,0.04);
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
    left:2px;
    top:10px;
    font-size:12px;
    width: 100%;
    justify-content: space-between;
    padding: 0 14px 0 8px;
    .el-pagination__total{
      margin: 0
    }
    button{
      margin:0!important
    }
  }
  .play_ocx_btn{
    .play_ocx_btn_wrap{
      i{
        background: url(../../assets/img/video/video.png) no-repeat;
        background-position: 50% 50%
      }
    }
  }
}
</style>
