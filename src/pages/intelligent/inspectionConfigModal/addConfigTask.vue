<template>
  <div class="page-capture-detail" v-loading="loading">
    <!-- 面包屑 -->
    <div class="breadcrumb-mod page-head">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item class="breadcrumb_item1">
          <i class="h-icon-arrow_left" @click="backConfirm" ></i>
          <span @click="backConfirm">智能分析</span>
        </el-breadcrumb-item>
        <el-breadcrumb-item class="breadcrumb_item2">任务配置</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="page-content">
      <el-scrollbar wrap-class="capture-detail-scrollbar__wrap" class="capture_detail_scrollbar_first_step" v-show="activeStep===0">
        <div class="content-title" id='scrolldom'>请设置分析任务</div>
        <div class="first_step_wrap">
          <el-form ref="form" :model="taskForm" :rules="rules" label-width="150px" style="width:960px">
            <el-form-item label="任务名称" prop="taskName" :required-right="false">
              <el-input v-model="taskForm.taskName" placeholder="请输入任务名称" :maxlength="16" style="width: 750px;" @blur="blurHandler" clearable></el-input>
            </el-form-item>
            <el-form-item label="模型来源" prop="modelSource" :required-right="false" required style="margin-bottom:12px">
              <el-radio-group v-model="taskForm.modelSource" :disabled="!this.isAdd" @change="changeModelSource">
                <el-radio label="PLATFORM">平台算法模型</el-radio>
                <el-radio label="LOCAL">本地设备算法模型</el-radio>
              </el-radio-group>
              <div class="tips_wrap" style="margin-top: -4px;">模型来源于“本地设备算法模型”的分析任务，只需选择自带算法模型的通道即可。</div>
            </el-form-item>
            <el-form-item label="下发模式" prop="deliverMode" :required-right="false" required v-show="taskForm.modelSource==='PLATFORM'">
              <el-radio-group v-model="taskForm.deliverMode" :disabled="!this.isAdd" @change="changeDeliverMode">
                <el-radio label="DEVICE_TASK">设备任务</el-radio>
                <el-radio label="DELIVER_ONLY_PACKET">仅下发算法</el-radio>
              </el-radio-group>
            </el-form-item>
            <div v-if="isPlatformModel">
              <el-form-item label="算法模型" prop="algorithmModelId" :required-right="false" :rules="[{required: true, message: '请选择算法模型'}]">
                <span v-if="offlineFlag">{{algorithmModelName}}</span>
                <el-select v-else v-model="taskForm.algorithmModelId" placeholder="请选择算法模型" style="width: 750px;" filterable @change="changeAlgorithmModelId">
                  <el-option v-for="(item,index) in algorithmsModalList" :key="index" :label="item.modelName" :value="item.modelId">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="算法版本" prop="algorithmId" :required-right="false" style="position:relative;">
                <span v-if="offlineFlag">{{algorithmVersionName}}<i class="choose-version" @click="getVersionForOffline">该算法版本已下线，是否重新选择版本</i></span>
                <el-select v-else v-model="taskForm.algorithmId" placeholder="算法版本" style="width: 750px;" filterable @change="changeAlgorithmVisionId">
                  <el-option v-for="(item,index) in algorithmsVisionList" :key="index" :label="item.version + '(' +
                  (item.platform.includes('CLOUD')?'云服务-在线验证':item.platform.includes('DCT4')?'云服务-云眸':item.platform)+')'
                  +(item.expire?' 算法已过期':'')
                  +(item.modelPrecision==='HIGH_PRECISION'?' (高精度模型)':item.modelPrecision==='ULTRA_HIGH_PRECISION'?' (观澜大模型)':'')
                  +(item.smallTargetEnhance==='SMALL_TARGET_ENHANCE'?' (双检测模型)':'')" :value="item.trainId">
                  </el-option>
                </el-select>
                <div :class="{'tips_wrap':true,'error_tips':showErrorUpdateVision}" v-show="opaiStr && opaiStr.includes('OPAI')" style="margin-bottom: -12px;display: flex;align-items: center;">
                  OPAI版本：{{ opaiStr }}
                  <el-tooltip placement="top">
                    <div slot="content">
                      <div style="font-weight: 600;margin-bottom: 4px">请根据设备软件程序版本选择对应的预置算法版本</div>
                      <div style="padding-left: 16px">· 设备软件程序版本为V4.62及以下或者为V5.0的，请选择OPAI V1.0；</div>
                      <div style="padding-left: 16px">· 设备软件程序版本为V4.63及以上（不包括V5.0）的，请选择OPAI V2.0；</div>
                      <div style="padding-left: 16px">· 查看设备软件程序版本：打开设备Web管理界面 > 配置 > 系统 > 系统设置 > 主控板本 > 版本号 。</div>
                    </div>
                    <i class="h-icon-help" style="font-size: 18px;cursor: pointer;"></i>
                  </el-tooltip>
                </div>
              </el-form-item>
              <el-form-item label="任务类型" prop="taskType" :required-right="false" :rules="[{required: true, message: '请选择任务类型'}]" v-if="isShowNext">
                <span style="font-size:14px;">{{(taskForm.taskType.includes('CLOUD')) ? '云服务-在线验证' : (taskForm.taskType.includes('DCT4')) ? '云服务-云眸' : taskForm.taskType}}</span>
              </el-form-item>
              <el-form-item label="分析模式" v-if="isShowNext && !isDeliverModeOnlyPacket" :required-right="false" required>
                <el-radio-group v-model="taskForm.analysisMode" @change="changeTaskAnalysisMode" :disabled="!this.isAdd" class="self_radio_group">
                  <el-radio v-for="(item,index) in analysisModeList" :key="index" :label="item.id" v-show="item.enable">
                    <span>{{item.labelName}}</span>
                    <el-tooltip popper-class="filter_tooltip" placement="top">
                      <div slot="content">
                        1、用其他智能分析任务结果，进行二次分析，提升准确率；<br />
                        2、需提前建立基础的智能分析任务，并在规则里面开启“消息推送到智能分析任务”
                      </div>
                      <i class="h-icon-help" style="font-size: 20px;cursor: pointer;float: right;" v-show="item.id==='SECONDARY_FILTER'"></i>
                    </el-tooltip>
                  </el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item :label="weekDayText" prop="weekDay" :required-right="false" v-if="isShowNext&&!isSecondFilterAnalysisMode&&!isDeliverModeOnlyPacket">
                <div v-if="isIPCH5" style="font-size:12px">周一至周日</div>
                <div v-else class="date-content">
                  <div v-for="(item, index) in weekDate" :key="index" @click="selectCaptureTime(item.value, 'week')" :class="{'date-block-sel':selDate.week.indexOf(item.value) > -1}" class="date-block">{{item.label}}</div>
                </div>
              </el-form-item>
              <div class="analysisMode-mod" v-show="!isSecondFilterAnalysisMode&&!isDeliverModeOnlyPacket">
                <el-form-item :required-right="false" :label="taskForm.analysisMode === 'VIDEO' || taskForm.analysisMode === 'POLLING_VIDEO' ? '分析时段':'抓拍模式'" v-if="isShowNext" style="margin-bottom:10px;position:relative">
                  <i style="color:#ff5353;position:absolute;left:72px;font-size:12px">*</i>
                </el-form-item>
                <div class="capture_wrap" v-if="isShowNext" >
                  <div>
                    <el-form-item label="时间点抓拍" v-if="isTaskNameCloudOrDCT4">
                      <el-switch on-text="" off-text="" v-model="taskForm.definedTimeEnable"></el-switch><span style="margin-left: 12px; font-size: 12px;">{{taskForm.definedTimeEnable ? '开' : '关'}}</span>
                    </el-form-item>
                    <el-form-item label="抓拍时间点" prop="executeTimeList" v-if="isTaskNameCloudOrDCT4 && taskForm.definedTimeEnable" style="position:relative" >
                      <i style="color:#ff5353;position:absolute;left:58px;font-size:12px">*</i>
                      <div v-for="(item, index) in taskForm.executeTimeList" :key="index" class="time-point">
                        <el-time-picker v-if="taskForm.definedTimeEnable" format="HH:mm" value-format="HH:mm" v-model="item.value" placeholder="选择时间点" 
                          @change="(val) => { executeTimeListChange(val, index) }">
                        </el-time-picker>
                        <i v-if="index !== 0" class="h-icon-close" style="font-size: 14px;" @click="delCaptureTime(index)"></i>
                      </div>
                      <el-button icon="h-icon-add" @click="addCaptureTime" v-if="taskForm.executeTimeList && taskForm.executeTimeList.length < 20">添加（{{taskForm.executeTimeList.length}}/20）</el-button>
                    </el-form-item>
                  </div>
                  <el-form-item label="间隔抓拍" v-if="isTaskNameCloudOrDCT4 && isShowNext">
                    <el-switch v-model="taskForm.intervalEnable"></el-switch><span style="margin-left: 12px; font-size: 12px;">{{taskForm.intervalEnable ? '开' : '关'}}</span>
                  </el-form-item>
                  <el-form-item :label="(['POLLING_SNAP','CLOUD_POLLING_SNAP','INVOICE_PERSION_FILTER'].includes(taskForm.analysisMode)) ? '抓拍时段' : '' " prop="executeValDateList" v-if="taskForm.intervalEnable && !isIPCH5" style="position:relative">
                    <i style="color:#ff5353;position:absolute;left:68px;font-size:12px" v-if="(['POLLING_SNAP','CLOUD_POLLING_SNAP','INVOICE_PERSION_FILTER'].includes(taskForm.analysisMode))">*</i>
                    <div v-for="(item, index) in taskForm.executeValDateList" :key="index" class="time-point">
                      <el-time-picker v-if="taskForm.intervalEnable && !isIPCH5" is-range format="HH:mm" value-format="HH:mm" v-model="item.value" placeholder="选择时间范围" 
                        @change="(val) => { executeValDateListChange(val, index) }" :clearable="false">
                      </el-time-picker>
                      <i v-if="index !== 0" class="h-icon-close" style="font-size: 14px;" @click="delExecuteValDate(index)"></i>
                    </div>
                    <el-button icon="h-icon-add" type="default" @click="addExecuteValDate" v-if="taskForm.executeValDateList.length < 5" title="请勿添加交叉重叠的时间段">添加（{{taskForm.executeValDateList.length}}/5）</el-button>
                  </el-form-item>
                  <el-form-item label="间隔时长" v-if="taskForm.intervalEnable && (['POLLING_SNAP','CLOUD_POLLING_SNAP','INVOICE_PERSION_FILTER'].includes(taskForm.analysisMode))" prop="captureSpace">
                    <el-select v-model="taskForm.captureSpace" placeholder="请选择" style="width: 80px;">
                      <el-option v-for="(item, index) in timeArr" :key="index" :label="item" :value="item"></el-option>
                    </el-select><span style="padding-left:5px">分钟</span>
                    <!-- <el-input-number v-model="taskForm.captureSpace" :min="5" :max="120" class="input_number_wrap"></el-input-number><span style="padding-left:5px">分钟</span> -->
                  </el-form-item>
                </div>
              </div>
              <el-form-item  label="抓图间隔" :required-right="false" v-if="isShowNext&&['POLLING_SNAP_NEW','POLLING_VIDEO'].includes(taskForm.analysisMode)&&!isDeliverModeOnlyPacket" prop="pollingTime">
                <!-- <el-select v-model="taskForm.pollingTime" placeholder="请选择" style="width: 80px;">
                  <el-option v-for="(item, index) in timeMinuteArr" :key="index" :label="item" :value="item"></el-option>
                </el-select><span style="padding-left:5px">分钟</span> -->
                <el-input-number v-model="taskForm.pollingTime" 
                  :min="['POLLING_SNAP_NEW'].includes(taskForm.analysisMode) ? 3 : 10" 
                  :max="['POLLING_SNAP_NEW'].includes(taskForm.analysisMode) ? 3600 : 86400" 
                  style="width: 170px;margin-right:6px"></el-input-number><span class="unit">秒</span>
              </el-form-item>
              <!-- 分析模式为实时视频和轮巡视频时显示，即不为定时抓图时显示 -->
              <div v-if="(!['POLLING_SNAP','CLOUD_POLLING_SNAP','INVOICE_PERSION_FILTER'].includes(taskForm.analysisMode)) && isShowNext&&!isSecondFilterAnalysisMode&&!isDeliverModeOnlyPacket">
                <el-form-item label="上报间隔" :required-right="false" prop="alertInterval">
                  <!-- <el-select v-model="taskForm.alertInterval" placeholder="请选择" style="width: 80px;">
                    <el-option v-for="(item, index) in timeMinuteArr" :key="index" :label="item" :value="item">
                    </el-option>
                  </el-select><span style="padding-left:5px">分钟</span> -->
                  <el-input-number v-model="taskForm.alertInterval" :min=1 :max=1800 style="width: 170px;margin-right:6px"></el-input-number><span class="unit">秒</span>
                </el-form-item>
                <div class="tip_text">未配置分析规则时，该配置项生效；如配置分析规则后，则以分析规则中配置的报警间隔为准</div>
              </div>
            </div>
            <div v-show="['DCT4'].includes(taskForm.taskType)">
              <el-form-item label="全天分析" prop="leisureAnalysis">
                <el-switch v-model="taskForm.leisureAnalysis"></el-switch>
              </el-form-item>
            </div>
            <el-form-item label="抓图清晰度" v-if="isShowNext&&this.captureQualityEnable&&!isSecondFilterAnalysisMode&&taskForm.modelSource!=='LOCAL'&&!isDeliverModeOnlyPacket" :required-right="false" required>
              <el-radio-group v-model="taskForm.captureQuality">
                <el-radio v-for="(item,index) in captureQualityList" :key="index" :label="item.id">{{item.labelName}}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="分析类型" :required-right="false" required prop="executeType" v-if="!isPlatformModel||(isShowNext&&!isSecondFilterAnalysisMode)">
              <el-radio-group v-model="taskForm.executeType" @change="clearExecuteType" class="self_radio_group" :disabled="!this.isAdd">
                <el-radio label="BYCHANNEL">按通道抓图</el-radio>
                <el-radio label="BYPRESET" v-show="isPlatformModel&&['retail'].includes(serviceType)&&isTaskNameCloudOrDCT4">按预置点抓图</el-radio>
                <el-radio label="BYSCENE" v-show="isPlatformModel&&['retail'].includes(serviceType)&&isTaskNameCloudOrDCT4">
                  <span>按场景抓图</span>
                  <el-popover popper-class='filter_popover' ref="headHelp" placement="top" max-width="600" trigger="hover">
                    <div>
                      1、如需增加或调整考评场景，可前往“ <span class="link_span" @click="goToChainConfig()">巡查-巡查配置-巡查场景配置</span> ”进行配置<br />
                      2、修改后的考评场景，需要重新编辑使用该场景的智能分析任务才可生效
                    </div>
                  </el-popover>
                  <i class="h-icon-help" style="font-size: 20px;cursor: pointer;float: right;" v-popover:headHelp></i>
                </el-radio>
              </el-radio-group>
            </el-form-item>
            <div v-if="isShowNext&&!isSecondFilterAnalysisMode">
              <el-form-item label="分析场景" prop="sceneConfig" v-if="isExecuteTypeByScene" :required-right="false" required>
                <el-select v-model="taskForm.sceneConfig" multiple placeholder="请选择考评场景" tag-title :tag-max-width="50" @change="checkSceneStore">
                  <el-option v-for="item in scenesList" :key="item.sceneId" :label="item.sceneName" :value="item.sceneId"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="分析预置点" prop="presetNameConfig" v-if="isExecuteTypeByPresetName" :required-right="false">
                <h-multi-selector v-model="taskForm.presetNameConfig" :dataList="presetNameConfigList" :hasAllSelect="true" style="width: 800px;"/>
                <div style="color: #aaa;height: 24px;">支持最多100个预置点选择</div>
              </el-form-item>
              <el-form-item :label="`生效${applicationSceneName}`" prop="storeConfig" class="store_config_form_item" :required-right="false"
               content-width="800px" key="storeConfig" v-show="isExecuteTypeByScene||isExecuteTypeByPresetName">
                <areaStoreTransfer v-show="!hugeSelectChannel" ref="tableTransfer" @selectChange="checkChange" :maxLimitChoose="2000"></areaStoreTransfer>
                <div v-show="hugeSelectChannel">生效通道已经超过2000个，如需修改，请前往<span @click="goToHugeChannelConfig" style="color: #4A94FE;cursor: pointer;"> 通道配置页 </span>操作</div>
              </el-form-item>
            </div>
            <el-form-item label="配置图库" v-show="(isShowNext&&isArrangeAlgorithm&&!isSupportScoreFilterData&&!isDeliverModeOnlyPacket)" introduction="如果选择的设备不在选择的图库里，下发任务时会自动将设备下发至图库">
              <el-table ref="libraryImageTable" :max-height="200" force-scroll :data="libraryImageTableData" show-overflow-title  @selection-change="libraryImagetTableSelect" style="width:750px">
                <el-table-column type="selection" width='50'></el-table-column>
                <el-table-column prop="libraryImageName" label="图库名称" show-overflow-tooltip></el-table-column>
                <el-table-column label="标签名称">
                  <template slot-scope="scope" prop="labelId">
                    <el-select v-model="scope.row.labelId" style="width: 100%">
                      <el-option v-for="(labelItem, index) in labelTreeData" :key="index" :value="labelItem.labelId" :label="labelItem.labelName"></el-option>
                    </el-select>
                  </template>
                  <!-- <template slot-scope="scope" prop="labelColor">
                    <el-select v-model="scope.row.labelColor" style="width: 100%">
                      <el-option label="红色" value="red"></el-option>
                      <el-option label="绿色" value="green"></el-option>
                    </el-select>
                  </template> -->
                </el-table-column>
              </el-table>
            </el-form-item>
            <el-form-item label="分析通道" v-if="!isPlatformModel||((isShowNext&&!['SECONDARY_FILTER'].includes(this.taskForm.analysisMode)&&!isExecuteTypeByScene&&!isExecuteTypeByPresetName))" class="analysis_channel">
              <div class="analysis_channel_wrap">
                <div>
                  <el-button type="primary" @click="showAddChannel" class="page-capture-btn-add">选择</el-button>
                  <el-button el-button @click="showAddTaskChannel" class="page-capture-btn-add">复用其他任务通道</el-button>
                  <el-button el-button @click="showAddAreaChannel" class="page-capture-btn-add" v-show="isTaskNameCloudOrDCT4">复用区域标签通道</el-button>
                </div>
                <div class="table_right_btn" v-show="isPlatformModel&&!isTaskNameCloudOrDCT4&&!isDeliverModeOnlyPacket">
                  <el-tooltip :content="'自定义规则通道: ' + (taskForm.isCustomRuleChannel ? '开启' : '关闭')" placement="top">
                    <el-switch v-model="taskForm.isCustomRuleChannel" @change="changeIsCustomRuleChannel()"></el-switch>
                  </el-tooltip>
                </div>
              </div>
            </el-form-item>
            <div class="channel-container" v-if="!hugeSelectChannel&&channelData.length&&!['SECONDARY_FILTER'].includes(this.taskForm.analysisMode)&&!isExecuteTypeByScene&&!isExecuteTypeByPresetName">
              <div class="channel-left">
                <div class="channel_search_wrap">
                  <el-select v-model="searchGroupId" filterable class="analysis_channel_search_select" @change="changeSearchGroupId()" :search="true">
                    <el-option v-for="(item, index) in channelData" :key="index" :label="item.groupName" :value="item.groupId"></el-option>
                  </el-select>
                </div>
                <el-scrollbar ref="channelLeftScrollbar" overflow-y="scroll" wrap-class="channel-scrollbar__wrap" view-class="channel-scrollbar__view">
                  <div v-for="(item, index) in channelData" :key="index" @click="selChannelCoumunity(index)" class="channel-community" :class="{'channel-community-sel':channelCommunityActive===index,'isUnnormalGroupStyle':item.isUnnormalGroupStyle ? item.isUnnormalGroupStyle : false}">
                    <overflow :title="(index + 1 + '.') + item.groupName" :length="9"></overflow>
                    <i @click.stop="delChannelCommunity(index)" class="h-icon-close"></i>
                  </div>
                </el-scrollbar>
              </div>
              <div class="channel-right">
                <!-- 展开表格 NVR或IPC相关的-->
                <el-table :data="tableChannelData" max-height="290" class="table-content" :default-expand-all="true" :row-class-name="tableRowClassName" v-if="!isTaskNameCloudOrDCT4&&isPlatformModel">
                  <el-table-column type="index" label="序号" width="15%">
                    <template slot-scope="scope">{{scope.$index + 1}}</template>
                  </el-table-column>
                  <el-table-column type="expand" width="11%">
                    <template slot-scope="props">
                      <div v-for="(item,index) in props.row.deviceArr" :key="index" :label="item.channelName" :value="item.channelId" style="height:32px;line-height:32px" class="expand_table_item">
                        <span>{{ item.channelName }}</span>
                        <i style="margin-right:20px;color: #4A94FE; cursor: pointer;float:right" @click="deleteChannel(index,item.channelId)">删除</i>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="deviceName" label="设备名称" width="47%" show-overflow-tooltip></el-table-column>
                  <el-table-column label="预置点" v-if="isTaskNameCloudOrDCT4" width="0">
                    <template slot-scope="scope">
                      {{(scope.row.presetInfo && scope.row.presetInfo.length > 0) ? scope.row.presetInfo.map(item => item.presetName).join(',') : '——'}}
                    </template>
                  </el-table-column>
                  <el-table-column label="需删除的通道数量" width="27%">
                    <template slot-scope="scope">
                      <span>{{scope.row.deviceArr.length-scope.row.cameraCanUse > 0 ? (scope.row.deviceArr.length-scope.row.cameraCanUse) : '-'}}</span>
                    </template>
                  </el-table-column>
                </el-table>
                <!-- 非展开表格 云相关的 -->
                <el-table :data="tableChannelData" max-height="290" class="table-content" v-if="isTaskNameCloudOrDCT4||!isPlatformModel" :enable-virtual-scroll="true">
                <!-- <el-table :data="tableChannelData" max-height="290" class="table-content" v-if="isTaskNameCloudOrDCT4||!isPlatformModel" :enable-virtual-scroll="true"> -->
                  <el-table-column type="index" label="序号" width="12%">
                    <template slot-scope="scope">{{scope.$index + 1}}</template>
                  </el-table-column>
                  <el-table-column prop="channelName" label="通道名称" show-overflow-tooltip width="27%"></el-table-column>
                  <el-table-column prop="deviceName" label="设备名称" show-overflow-tooltip width="27%"></el-table-column>
                  <el-table-column label="预置点" v-if="isTaskNameCloudOrDCT4" width="20%" show-overflow-tooltip>
                    <template slot-scope="scope">
                      {{(scope.row.presetInfo && scope.row.presetInfo.length > 0) ? scope.row.presetInfo.map(item => item.presetName).join(',') : '——'}}
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="12%">
                    <template slot-scope="scope">
                      <span @click="delTableChannel(scope.$index,scope.row)" style="color: #4A94FE; cursor: pointer;">删除</span>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
            <!-- 兼容旧版的添加、编辑的通道选择提示文案 -->
            <div v-show="!isPlatformModel||((isShowNext&&!['SECONDARY_FILTER'].includes(this.taskForm.analysisMode)&&!isExecuteTypeByScene&&!isExecuteTypeByPresetName))" class="sel_channel_tips">
            <!-- <div v-show="channelData.length&&!['SECONDARY_FILTER'].includes(this.taskForm.analysisMode)&&!isExecuteTypeByScene&&!isExecuteTypeByPresetName" class="sel_channel_tips"> -->
              <div>已选择通道：{{selectChannel}}个。</div>
              <div v-show="isTaskNameCloudOrDCT4">
                <div v-show="!isAdd&&hugeSelectChannel">（生效通道已经超过2000个，如需修改，请前往<span @click="goToHugeChannelConfig"> 通道配置页 </span>操作）</div>
                <div v-show="!isAdd&&!hugeSelectChannel">（生效通道需要保存成功后生效。如果需要通道实时生效，可前往<span @click="goToHugeChannelConfig"> 通道配置页 </span>操作）</div>
                <div v-show="isAdd">（生效通道需要保存成功后生效，首次新建任务最多支持2000路通道）</div>
              </div>
              <div v-show="!isTaskNameCloudOrDCT4">（生效通道相关操作需要保存成功后生效，单个AI任务最多支持2000路通道）</div>
            </div>
            <div v-if="isShowNext&&isPlatformModel&&!isDeliverModeOnlyPacket">
              <!-- <el-form-item label="置信度阈值" v-if="globalConfidenceThresholdEnable" :required-right="false" :rules="{required: true}" prop="confidenceThreshold">
                <div class="block confidenceThresholdBlock">
                  <el-slider v-model="taskForm.confidenceThreshold" :min="10" :max="99" show-input></el-slider>
                </div>
              </el-form-item> -->
              <!-- <div class="tip_text" v-show="globalConfidenceThresholdEnable">置信度表示算法检测结果的可信程度，值越大代表算法结果的可信程度越高。系统默认过滤置信度低于70%的算法检测结果，该阈值可根据实际情况灵活调整，可选范围是10%-99%</div> -->
              <div v-show="!isTaskNameCloudOrDCT4">
                <el-form-item label="联动布防" prop="switchFlag">
                  <el-switch v-model="linkageArming.switchFlag" ></el-switch>
                </el-form-item>
                <div class="checks_wrap" v-show="linkageArming.switchFlag">
                  <el-checkbox v-for="(item,index) in linkageArming.linkageArmingDetails" :key="index" v-model="item.checked" class="check_item">
                    <div>{{item.label}}</div>
                    <el-input v-model="item.value" :placeholder="`请输入${item.label}`" v-show="item.isAllowedFitValue" clearable></el-input>
                  </el-checkbox>
                </div>
                <div class="tip_text">开启后，配置【布防方式】可以根据规则告警，触发外部IO设备联动，例如：广播声音、声光警告等；需要注意的是：IO输出请按照【1;2;3】的格式指定输出端口号。（请确认设备本地支持选择的配置，否则下发将会失败）</div>
              </div>
              <div v-show="!['POLLING_SNAP','CLOUD_POLLING_SNAP','INVOICE_PERSION_FILTER'].includes(taskForm.analysisMode)">
                <el-form-item label="规则信息叠加" prop="alarmRuleOverlay">
                  <el-switch v-model="taskForm.alarmRuleOverlay"></el-switch>
                </el-form-item>
                <div class="tip_text">开启后，报警抓图中叠加报警时间对应的规则序号和规则名称；需要注意的是：叠加后的原始图片将影响数据回传后的再次标定训练，请谨慎操作。（规则名称不能超过8个中文字符）</div>
              </div>
              <div v-show="['VIDEO','POLLING_VIDEO','POLLING_SNAP_NEW'].includes(taskForm.analysisMode)">
                <el-form-item label="目标框叠加" prop="alarmTargetOverlay">
                  <el-switch v-model="taskForm.alarmTargetOverlay"></el-switch>
                </el-form-item>
                <div class="tip_text">开启后，设备上报的原始分析图片中将会叠加目标框；需要注意的是：叠加后的原始图片将影响数据回传后的再次标定训练，请谨慎操作。</div>
              </div>
              <div v-show="['DCT4'].includes(taskForm.taskType) && algorithmVersionType!=='SEMANTIC_SEG'">
                <el-form-item label="是否自动绘制" prop="isAutoDraw">
                  <el-switch v-model="taskForm.isAutoDraw"></el-switch>
                </el-form-item>
                <div class="tip_text">开启该开关，会生成包含识别框绘制的识别图片。</div>
              </div>
              <el-form-item label="算法优化">
                <el-switch v-model="feedback" @change="changeState()"></el-switch>
              </el-form-item>
              <div class="tip_text">建议您开启算法优化，开启后系统会自动将被标记为作废的图片数据回传至对应的训练数据集中。您可登录AI开放平台查看回传数据，并对算法模型进行增强训练优化。</div>
              <el-form-item label="自动回传" prop="isFeedbackAuto">
                <el-switch v-model="taskForm.isFeedbackAuto" :disabled="isFeedbackAutoDisabled"></el-switch>
              </el-form-item>
              <div class="tip_text">开启后会已T+1的方式将AI分析结果同步至AI开放平台，支持模型的自动迭代；请注意该功能需要用户登录AI开放平台进行测试集的创建。</div>
              <div v-show="typeIsImg">
                <el-form-item label="去除特定目标" prop="imageComparePersonExclude">
                  <el-switch v-model="taskForm.imageComparePersonExclude"></el-switch>
                </el-form-item>
                <div class="tip_text">开启后将忽略场景中“人”的差异，能够消除“人”的因素对模型准确度的影响。</div>
              </div>
              <el-form-item label="模型自动更新" prop="isSuAutoDeploy">
                <el-switch v-model="taskForm.isSuAutoDeploy" :disabled="isSuAutoDeployDisabled"></el-switch>
              </el-form-item>
              <div class="tip_text">开启后，该任务模型将自动更新为自主进化后的新模型。</div>
            </div>
          </el-form>
        </div>
      </el-scrollbar>
      <div v-show="activeStep===1" class="config_rules_div" style="width:100%">
        <configRules ref="configRulesForm" :alertInterval="+taskForm.alertInterval"></configRules>
      </div>
    </div>
    <div class="foot_btns">
      <el-button style="margin-top: 12px;" type="primary" @click="beforeNextStep" v-show="activeStep===0&&hasNextStep">下一步</el-button>
      <el-button style="margin-top: 12px;" @click="preStep" v-show="activeStep===1">上一步</el-button>
      <el-button style="margin-top: 12px;" type="primary" @click="submitConfig" v-show="activeStep===1||!hasNextStep" :loading="submitLoading">完成</el-button>
      <el-button @click="backConfirm" class="">取消</el-button>
    </div>
    <addChannelModal :visible.sync="modalVisible" @editChannelData="editChannelData" :taskType="taskForm.taskType" :updateKey="updateKey" @setSelectChannel="setSelectChannel" 
      :taskAnalysisMode="taskForm.analysisMode" :taskId="taskForm.taskId" :channes="channelData" :modelTypeEnum="algorithmVersionType" :isPlatformModel="isPlatformModel" 
      :maxLimitChoose="maxLimitChoose" :isAdd="isAdd">
    </addChannelModal>
    <addTaskChannelModal :visible.sync="addTaskModalVisible" :taskType="taskForm.taskType" :updateKey="updateKey" :modelSource="taskForm.modelSource"
      :taskAnalysisMode="taskForm.analysisMode" :taskId="taskForm.taskId" :channes="channelData" :modelTypeEnum="algorithmVersionType" :isAdd="isAdd"
      @updateChooseChannelData="updateChooseChannelData" :maxLimitChoose="maxLimitChoose" :hugeChannelsFlagProps="hugeSelectChannel">
    </addTaskChannelModal>
    <addAreaChannelModal :visible.sync="addAreaModalVisible" :taskType="taskForm.taskType" :updateKey="updateKey" :modelSource="taskForm.modelSource"
      :taskAnalysisMode="taskForm.analysisMode" :taskId="taskForm.taskId" :channes="channelData" :modelTypeEnum="algorithmVersionType" :isAdd="isAdd"
      @updateChooseChannelData="updateChooseChannelData" :maxLimitChoose="maxLimitChoose" :hugeChannelsFlagProps="hugeSelectChannel">
    </addAreaChannelModal>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import areaStoreTransfer from '@/components/areaStoreTransfer/areaStoreTransfer'
import addChannelModal from './addChannelModal'
import addTaskChannelModal from './addTaskChannelModal'
import addAreaChannelModal from './modal/addAreaChannelModal'
import configRules from './configRules'
import { getFormatTime } from '@/assets/libs/util'
import { editTask, addTask, getAlgorithmsListNew, getAlgorithmsVisionListWithDeploymentStatus, getCaptureConfig, getDetectionObjectList, updateChannel,
  checkRepeatTaskName, getKey, updateDelete, updateChangeInfo, getTriggerType, clearUpdateKeyData, compatibleRules, getLinkageArming, getAnalysisMode,
  addLocalTask, editLocalTask, mismatchScene, getScenes, getPresetNameConfigList, getConfigFields, getArrangeAlgorithmTab, getImageLibraryCanUseList, 
  arrangelabelInfoTree, checkTaskLibraryIsExists, getScoreFilterData } from './../proxy'
import { NO_AUTH_CODE } from '@/constant'
import mixin from './mixin'
export default {
  name: 'inspectionConfigDetail',
  components: {
    addChannelModal,
    addTaskChannelModal,
    addAreaChannelModal,
    configRules,
    areaStoreTransfer
  },
  mixins: [mixin],
  data () {
    let checkName = async (rule, value, callback) => {
      let pattern = /^[a-zA-Z0-9\u4e00-\u9fa5]{0,32}$/
      if (!value || value.length === 0) {
        callback(new Error('请输入任务名称'))
      } else if (value.length > 32) {
        callback(new Error('任务名称不能超过32个字符'))
      } else if (!pattern.test(value)) {
        callback(new Error('任务名称只支持大小写字母、数字和中文'))
      } else {
        callback()
      }
    }
    let checkAlgorithmId = (rule, value, callback) => {
      if (!this.taskForm.algorithmId) {
        callback(new Error('请选择算法版本'))
      } else {
        callback()
      }
    }
    let checkExecuteTime = (rule, value, callback) => {
      if (this.taskForm.taskFreq !== 0 && this.taskForm.weekDay === '' && !this.isIPCH5) {
        callback(new Error('至少选择一个抓拍日期'))
      } else {
        callback()
      }
    }
    let checkExecuteTimeList = (rule, value, callback) => {
      if (!this.taskForm.executeTimeList.map(item => item.value).every(item => item !== '')) {
        callback(new Error('请选择抓拍时间点'))
      } else if (this.checkRepeat(this.taskForm.definedTime.split(','))) {
      // } else if (this.checkRepeat(this.taskForm.executeTimeList.map(item => item.label))) {
        callback(new Error('不能选择相同抓拍时间点'))
      } else {
        callback()
      }
    }
    let checkExecuteValDateList = (rule, value, callback) => {
      // if (!this.taskForm.executeValDateList.map(item => item.value).every(item => item[0] !== '')) {
      if (this.taskForm.executeValDateList.length > 0 && !this.taskForm.executeValDateList[0].label.length) {
        callback(new Error('请选择时段'))
      } else {
        callback()
      }
    }
    let checkExecuteValDate = (rule, value, callback) => {
      if (this.taskForm.intervalEnable && !this.taskForm.execTime && !this.isIPCH5) {
        callback(new Error('请选择时段'))
      } else {
        callback()
      }
    }
    let checkIntervalTime = (rule, value, callback) => {
      if (this.taskForm.intervalEnable && this.taskForm.captureSpace.toString() === '0') {
        callback(new Error('请选择抓拍时间间隔'))
      } else {
        callback()
      }
    }
    let checkIntervalMinuteTime = (rule, value, callback) => {
      if (this.taskForm.alertInterval && this.taskForm.alertInterval.toString() === '0') {
        callback(new Error('请选择上报间隔'))
      } else {
        callback()
      }
    }
    let checkpollingTime = (rule, value, callback) => {
      if (this.taskForm.pollingTime && this.taskForm.pollingTime.toString() === '0') {
        callback(new Error('请选择抓图间隔'))
      } else {
        callback()
      }
    }
    let validateStoreConfig = (rule, value, callback) => {
      if ((!this.isExecuteTypeByScene&&!this.isExecuteTypeByPresetName) || (this.hugeSelectChannel)) {
        callback()
      } else {
        const valid = value.length <= 2000 && value.length > 0
        callback(valid ? undefined : new Error(`请至少选择一个${this.applicationSceneName}，支持选择1-2000家${this.applicationSceneName}，当前已选${value.length}家`))
      }
    }
    return {
      labelTreeData: [], // 检索比对图库对应的标签下拉列表
      libraryImageTableSelData: [], // 检索比对图库的表格选择数据
      libraryImageTableDataTemp: [],// 检索比对图库的表格数据临时存储数据
      libraryImageTableData: [],// 检索比对图库的表格数据
      captureQualityEnable: false, // 该租户是否开启清晰度配置
      globalConfidenceThresholdEnable: false, // 第一步是否显示置信度配置
      scenesList: [], // 所有场景
      presetNameConfigList: [], // 所有分析预置点
      isFeedbackAutoDisabled: false,
      isSuAutoDeployDisabled: false,
      selectChannel: 0, // 选择的通道数量
      oldTrainId: '', // 编辑模式下，任务的最初算法版本的id，后面切换算法时要判断兼容
      isAdd: true, // 是否添加模式
      rulesCompatible: true, // 编辑模式下切换算法版本，原任务的规则能否兼容
      loading: true,
      submitLoading: false,
      editRulesData: [], // 传给第二步配置分析规则的数据，编辑则有数据，添加则为空[]
      activeStep: 0,
      feedback: true, // 是否开启算法优化
      feedbackData: 'ALWAYS', // 是否开启算法优化
      // isTaskNameCloudOrDCT4: false, // 算法版本是否带有云服务，即任务类型是否云服务
      isShowNext: false, // 是否展示分析模式及下面的内容，该值会在选了算法版本后为true
      modalVisible: false,
      addTaskModalVisible: false,
      addAreaModalVisible: false,
      analysisModeList: [], // 分析模式展示数组
      captureQualityList: [], // 抓图清晰度展示数组
      isArrangeAlgorithm: false, // 是否编排算法
      isSupportScoreFilterData: false, // 是否支持评分
      isArrangeAlgorithmScore: false, // 是否工装编排算法（带评分）
      offlineFlag: false, // 为true是算法下线，编辑的保存按钮隐藏，算法模型和算法版本写死，否则会取不到直接显示id
      algorithmModelName: '', // 算法下线的算法模型直接显示名字
      algorithmVersionName: '', // 算法下线的算法版本直接显示名字
      
      taskForm: {
        modelPrecision: '', //精度
        scList: [],
        allTargetInfo: {},
        postConfidenceThresholdFlag: true, // 置信度是否下发至设备
        alarmRuleOverlay: false, // 报警规则信息叠加功能
        isCustomRuleChannel: false, // 自定义规则通道的配置开关
        isFeedbackAuto: false, // 自动回传功能
        alarmTargetOverlay: false, // 目标框叠加
        isAutoDraw: false, // 是否自动绘制
        leisureAnalysis: false, // 是否开启夜间模式
        imageComparePersonExclude: false, // 去除特定目标功能
        // confidenceThreshold: 70, // 置信度阈值
        captureQuality: 'CAPTUREBYGEN', // 抓图清晰度
        executeType: 'BYCHANNEL', // 执行类型
        sceneConfig: [], // 选中的场景
        presetNameConfig: [], // 选中的分析预置点
        storeConfig: [], // 选中的门店
        isSuAutoDeploy: false,
        taskId: '',
        taskName: '',
        modelSource: 'PLATFORM',
        deliverMode: 'DEVICE_TASK',
        algorithmModelId: '', // 算法模型
        algorithmId: '', // 算法版本
        taskType: '', // 任务类型
        taskFreq: 2, // 任务频次 1-日 2-周 3-月
        analysisMode: '',
        definedTime: '', // 抓拍时间点
        executeTimeList: [{ value: '', label: '' }], // 抓拍时间点前端数据（不传给后端）
        executeValDateList: [{ value: ['00:00', '23:59'], label: '00:00 - 23:59' }], // 抓拍时间段前端数据（不传给后端）
        weekDay: '', // 抓拍日期
        intervalEnable: false, // 是否间隔执行
        definedTimeEnable: false, // 是否执行抓拍时间点
        executeValDate: [], // 抓拍时间段
        startTime: '', // 抓拍时间段-开始时间
        endTime: '', // 抓拍时间段-结束时间
        captureSpace: 5, // 抓拍时间间隔分钟
        alertInterval: 60, // 实时视频和轮巡视频的上报间隔秒
        pollingTime: 60, // 抓图间隔
        groupInfoList: []
      },
      rules: {
        algorithmId: [{ required: true, validator: checkAlgorithmId, trigger: 'change' }],
        sceneConfig: [{ type: 'array', required: true, message: '请选择考评场景', trigger: 'change' }],
        presetNameConfig: [{ type: 'array', required: true, message: '请选择分析预置点名称', trigger: 'change' }],
        storeConfig: [{ type: 'array', required: true, validator: validateStoreConfig }],
        taskName: [
          { required: true, validator: checkName, trigger: 'blur' },
          { min: 0, max: 16, message: '不能超过16个字', trigger: 'blur' }
        ],
        weekDay: [
          { required: true, validator: checkExecuteTime, trigger: 'change' }
        ],
        executeTimeList: [
          { validator: checkExecuteTimeList, trigger: 'blur' }
        ],
        executeValDateList: [
          { validator: checkExecuteValDateList, trigger: 'change' }
        ],
        executeValDate: [
          { required: true, validator: checkExecuteValDate, trigger: 'change' }
        ],
        intervalMin: [
          { required: true, validator: checkIntervalTime, trigger: 'change' }
        ],
        alertInterval: [
          { required: true, validator: checkIntervalMinuteTime, trigger: 'change' }
        ],
        pollingTime: [
          { required: true, validator: checkpollingTime, trigger: 'change' }
        ],
      },
      selDate: {
        date: [],
        week: [],
        month: []
      },
      firstInEdit: 10,
      algorithmsModalList: [], // 算法模型数组
      algorithmsVisionList: [], // 算法版本数组
      algorithmsTypeList: [], // 算法类型数组
      weekDate: [{ label: '周一', value: 1 }, { label: '周二', value: 2 }, { label: '周三', value: 3 }, { label: '周四', value: 4 }, { label: '周五', value: 5 }, { label: '周六', value: 6 }, { label: '周日', value: 7 }],
      monthDate: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
      channelData: [],
      channelCommunityActive: 0, // 当前选中的社区下标
      tableChannelData: [],
      isUnnormalGroupList: [],
      todayDate: getFormatTime(new Date()).substr(0, 10).replace(/-/g, '/'),
      algorithmVersionType: 'CLASSIFY', // 算法类型，单分类CLASSIFY，单检测DETECT，混合COMBINED，OCR，IMAGE_COMPARISON图像比对。
      detectionObjectList: [], // 配置规则的，对象 + 属性
      propertyList: [], // 配置规则的，只有属性
      objectIdValidExistArr: [], // 检测对象Id组成的数组，用来判断编辑状态下，老id在现在的检测对象数组中是否存在
      secondRuleConfigValidFlag: [], // 第二步配置规则的校验是否都通过，有值表示没通过
      channelDataGroupList: [], // 编辑页的已选择的通道组织的前端搜索组织数组
      searchGroupId: '', // 编辑页的已选择的通道组织的前端搜索值
      isHasNextStepRules: 0, // 点击下一步时是否已经有配置规则存在，如果有，则使用配置规则的，如果没有，则使用默认选中逻辑
      checkRepeatName: false,
      updateKey: '',
      showErrorUpdateVision: false,
      mismatchMsg: '',
      linkageArming: { switchFlag: false, linkageArmingDetails: [] },
      timeArr: [],
      scoreFullData: {},
      hugeSelectChannel: false, // 是否大量的通道选择，2000个以上
      getModuleIsFinish: false// 区分算法模型编辑时赋值和切换，避免一些change事件
    }
  },
  computed: {
    isTaskNameCloudOrDCT4 () {
      return ['CLOUD', 'DCT4'].includes(this.taskForm.taskType)
    },
    weekDayText () {
      if (['POLLING_SNAP', 'CLOUD_POLLING_SNAP', 'INVOICE_PERSION_FILTER'].includes(this.taskForm.analysisMode)) {
        return '抓拍周期'
      } else if ((this.taskForm.analysisMode === 'VIDEO' || this.taskForm.analysisMode === 'POLLING_VIDEO')) {
        return '分析周期'
      }
      return '抓拍日期'
    },
    typeIsOCR () { // 是否OCR
      // return this.algorithmVersionType === 'OCR' // OCR没有轮巡视频
      return ['OCR', 'NORMAL_OCR'].includes(this.algorithmVersionType)
    },
    typeIsImg () { // 是否图像比对
      return this.algorithmVersionType === 'IMAGE_COMPARISON'
    },
    isIPCH5 () {
      return (this.taskForm.analysisMode === 'POLLING_SNAP') && (this.taskForm.taskType.indexOf('IPCH5') > -1)
    },
    // timeArr () {
    //   let arr = []
    //   if (this.isTaskNameCloudOrDCT4) { // 抓拍间隔- IPC/NVR类型：1-30min；云服务类型：最小5分钟
    //     arr = [5, 10, 15, 20, 30, 45, 60, 90, 120]
    //   } else {
    //     for (var j = 1; j < 31; j++) {
    //       arr.push(j)
    //     }
    //   }
    //   return arr
    // },
    timeMinuteArr () {
      let arr = []
      for (var j = 1; j < 31; j++) { // 上报间隔1-30min
        arr.push(j)
      }
      return arr
    },
    isPlatformModel () { // true：算法模型是平台算法模型
      return this.taskForm.modelSource === 'PLATFORM'
    },
    isDeliverModeOnlyPacket () { // true：下发模式是仅下发算法，很多配置项与isPlatformModel类似
      return this.taskForm.deliverMode === 'DELIVER_ONLY_PACKET'
    },
    isSecondFilterAnalysisMode () { // true：分析模式是其他任务二次分析、运营助手二次分析（第一页的的分析通道，运营助手显示且非必填，第二页的分析规则和推送：运营助手二次分析的隐藏）
      return ['SECONDARY_FILTER', 'DIANA_SECONDARY_FILTER'].includes(this.taskForm.analysisMode)
    },
    isExecuteTypeByScene () { // 通道是否按场景配置
      return ['BYSCENE'].includes(this.taskForm.executeType)
    },
    isExecuteTypeByPresetName () { // 通道是否按分析预置点名称配置
      return ['BYPRESET'].includes(this.taskForm.executeType)
    },
    hasNextStep () {
      return !this.typeIsOCR && this.isPlatformModel && !this.isDeliverModeOnlyPacket
      // return !this.typeIsOCR && !this.typeIsImg && this.isPlatformModel && !this.isDeliverModeOnlyPacket
    },
    opaiStr() {
      let data = this.algorithmsVisionList.filter(item => item.trainId === this.taskForm.algorithmId)
      return (data && data.length > 0) ? data[0].opaiVersion : ''
    },
    maxLimitChoose() {
      return this.isTaskNameCloudOrDCT4 ? 2000 : 999999999 // 云端大数据通道数量上限
    }
  },
  watch: {
    searchGroupId (val) { // 左侧的组织列表自动滚动到搜索出来的组织
      let index = this.channelData.map(item => item.groupId).indexOf(val)
      this.$nextTick(() => {
        this.setScroll(index * 32)
      })
    },
    feedbackData (val) {
      this.feedback = val === 'ALWAYS'
    },
    offlineFlag (val) {
      if (val) {
        this.isShowNext = true// 下线算法，将该值设为true以显示下面的内容
      }
    },
    // 监听任务类型
    'taskForm.taskType' (val) {
      if (this.isAdd) {
        this.taskForm.intervalEnable = !['CLOUD', 'DCT4'].includes(val) // 间隔抓拍按钮：定时抓图默认关，其他默认开且不可修改关闭
      }
      if (!['CLOUD', 'DCT4'].includes(val)) {
        this.taskForm.executeType = 'BYCHANNEL'
      }
      this.getImageLibraryCanUseListFun()
    },
    // 监听算法版本
    'taskForm.algorithmId' (val) {
      if (val) {
        this.getDetectionObjectList() // 获取对象、对象属性
        this.$nextTick(() => {
          this.algorithmIdChanged(val) // 获取分析模式
          this.getLabelTree()
        })
      }
      this.isShowNext = val ? true : false
    },
    'taskForm.executeType' (val) {
      if (val === 'BYSCENE') {
        this.getScenes()
      } else if (val === 'BYPRESET') {
        this.getPresetNameConfigList()
      }
    },
    // 分析模式
    'taskForm.analysisMode' (val) {
      if (val !== 'CLOUD_POLLING_SNAP' && val !== 'INVOICE_PERSION_FILTER') {
        this.taskForm.definedTimeEnable = false
      }
    },
    selectChannel: {
      handler(val) {
        this.hugeSelectChannel = val > this.maxLimitChoose
      },
      immediate: true,
      deep: true
    }
  },
  async mounted () {
    await this.getLinkageArming()// 获取联动布防的数据
    await this.init()
    await this.getAlgorithmsList()
    this.getKey() // 获取和后端实时同步通道的key
  },
  beforeMount () {
    // this.cleanForm()
    this.isAdd = this.$route.params.isAdd === 'add'
  },
  methods: {
    goToHugeChannelConfig() {
      let url = this.$commonUtils.judgeEnv() + `/AI-inspect/index.html#/intelligent/inspectionConfig/${this.serviceType}/channelConfigPage?taskId=${this.taskForm.taskId}`
      window.open(url)
    },
    async getLabelTree() {
      let labelDataRes = await getDetectionObjectList(this.taskForm.algorithmId)// 获取检索比对标签下拉数据，先用老接口getDetectionObjectList
      // let labelDataRes = await arrangelabelInfoTree({ trainId: this.taskForm.algorithmId })// 获取检索比对标签下拉数据
      this.labelTreeData = labelDataRes.data || []
    },
    changelabelId() {
      this.$forceUpdate()
    },
    libraryImagetTableSelect (val) {
      this.libraryImageTableSelData = val
    },
    changeIsCustomRuleChannel () {
      if (!this.taskForm.isCustomRuleChannel) {
        this.$message.info('自定义规则通道已关闭，规则将适用全部通道')
      }
    },
    goToChainConfig () {
      window.open(`/chain/index.html#/inspect/config/scene`)
    },
    clearExecuteType () {
      // this.taskForm.storeConfig = []
      // this.taskForm.sceneConfig = []
      // this.taskForm.presetNameConfig = []
      this.mismatchMsg = ''
    },
    // 获取全部场景
    getScenes () {
      getScenes().then(res => {
        if (+res.code === 0) this.scenesList = res.data.rows
      })
    },
    // 获取全部分析预置点名称集合
    getPresetNameConfigList () {
      getPresetNameConfigList().then(res => {
        if (+res.code === 0) {
          let data = res.data || []
          this.presetNameConfigList = data.map(item => {
            return { id: item, name: item }
          })
        }
      })
    },
    // 监听门店选中事件
    checkChange (data) {
      const keys = data.map(store => store.storeId)
      this.taskForm.storeConfig = keys
      this.$refs.form.validateField('storeConfig', (msg) => {
        if (msg) {
          this.mismatchMsg = ''
        } else {
          if (this.isExecuteTypeByPresetName) { // 通过分析预置点名称配置的，不需要判断门店是否关联场景
            // return false
          }
          // 判断哪些门店未关联场景
          this.checkSceneStore()
        }
      })
    },
    // 判断哪些门店未关联场景，提示给用户
    checkSceneStore () {
      if (this.taskForm.storeConfig && this.taskForm.storeConfig.length > 0 && this.taskForm.sceneConfig && this.taskForm.sceneConfig.length > 0) {
        mismatchScene({ storeIds: this.taskForm.storeConfig, sceneIds: this.taskForm.sceneConfig }).then(res => {
          if (+res.code === 0) {
            this.mismatchMsg = ''
            if (res.data.length > 0) {
              res.data.forEach(item => {
                this.mismatchMsg += item.storeName + '、'
              })
              this.mismatchMsg = this.mismatchMsg.substring(0, this.mismatchMsg.length - 1)
              this.mismatchMsg += ' 尚未完成所选场景的配置，请关注。'
            }
          }
        })
      }
    },
    async getLinkageArming () {
      let { data } = await getLinkageArming()
      this.linkageArming.linkageArmingDetails = data
    },
    toUpdateHelp () {
      let host = (window.location.host === 'www.hik-cloud.com' || window.location.href.indexOf('hilaicloud.com') > -1) ? 'www.hik-cloud.com' : 'pb.hik-cloud.com'
      window.open(`${window.location.protocol}//${host}/AI-inspect/updateHelp.html`)
    },
    async algorithmIdChanged (val) {
      let index = this.algorithmsVisionList.findIndex(item => item.trainId === val)// 找到当前算法版本id所在的index
      if (this.algorithmsVisionList.length && index > -1) {
        this.algorithmVersionType = this.algorithmsVisionList[index].versionType// 找到当前算法版本id对应的支持的算法类型，如检测模型、混合模型、分类模型、OCR
        this.taskForm.modelPrecision = this.algorithmsVisionList[index].modelPrecision// 精度
      }
      // 分析模式
      let { data } = await getAnalysisMode({ algType: this.algorithmVersionType, deviceType: this.taskForm.taskType, modelPrecision: this.taskForm.modelPrecision })
      let analysisaArr = this.isAdd ? data.filter(item => item.id!=='POLLING_SNAP') : data // 旧定时抓图添加时不能显示
      this.analysisModeList = analysisaArr
      // 抓图清晰度
      let configFieldsRes = await getConfigFields({ taskType: this.taskForm.taskType, algorithmId: this.taskForm.algorithmId })
      this.timeArr = configFieldsRes.data.captureSpaceList || [5]
      this.captureQualityList = configFieldsRes.data.captureQualityList
      this.captureQualityEnable = configFieldsRes.data.captureQualityEnable
      this.isArrangeAlgorithm = configFieldsRes.data.isArrangeAlgorithm || false
      this.isSupportScoreFilterData = configFieldsRes.data.isSupportScoreFilterData || false // 是否支持评分的配置
      // 置信度阈值
      this.globalConfidenceThresholdEnable = configFieldsRes.data.globalConfidenceThresholdEnable
      if (this.isAdd) {
        this.taskForm.analysisMode = this.analysisModeList.filter(item => { return item.enable })?.[0]?.id
      }
      if ((this.isArrangeAlgorithm && !this.isDeliverModeOnlyPacket)||this.isSupportScoreFilterData) {
        let labelTreeDataIds = this.labelTreeData.map(_ => _.labelId)
        let scListImageLibraryId = this.taskForm.scList.map(_ => _.imageLibraryId)
        this.libraryImageTableDataTemp.forEach(_ => {
          _.labelId = this.labelTreeData.length ? this.labelTreeData[0].labelId : '' // 添加的情况，默认第一个标签
          _.tableSelectId = scListImageLibraryId.includes(_.imageLibraryId) // 设置表格项勾选状态
          this.taskForm.scList.forEach(sc => {
            if ((_.imageLibraryId === sc.imageLibraryId) && labelTreeDataIds.includes(sc.labelId)) {
              _.labelId = sc.labelId
            }
          })
        })
        this.libraryImageTableData = JSON.parse(JSON.stringify(this.libraryImageTableDataTemp))
        this.$nextTick(() => {
          this.libraryImageTableData.forEach((item,index) => {
            if (item.tableSelectId) {
              this.$refs.libraryImageTable.toggleRowSelection(this.libraryImageTableData[index], true)
            }
          })
        })
        // 置信度阈值
        this.globalConfidenceThresholdEnable = configFieldsRes.data.globalConfidenceThresholdEnable
        if (this.isAdd) {
          this.taskForm.analysisMode = this.analysisModeList.filter(item => { return item.enable })[0].id
        }
        // 获取评分全量数据
        let scoreRes = await getScoreFilterData({algorithmId: this.taskForm.algorithmId})
        if (scoreRes.data && scoreRes.data.scoreFilter) { // 支持评分
          this.isArrangeAlgorithmScore = true
          this.scoreFullData = JSON.parse(JSON.stringify(scoreRes.data))
          this.editRulesData.forEach(item => {
            if (!item.scoreFilter) {
              item.scoreFilter = JSON.parse(JSON.stringify(scoreRes.data.scoreFilter))
            }
            if (item.scoreFilter.scoreInfo.length > 0) { 
              item.scoreFilter.scoreInfo.forEach(ex => {
                let one = scoreRes.data.scoreFilter.scoreInfo.filter(full => full.targetObjLabelLineId === ex.targetObjLabelLineId)[0]
                ex.scoreType.forEach(exItem => {
                  exItem.explain = one.scoreType.filter(o => o.type === exItem.type)[0].explain // 把explain参数赋回去
                })
                scoreRes.data.scoreFilter.scoreInfo.forEach(ori => {
                  if (ori.targetObjLabelLineId !== ex.targetObjLabelLineId) {
                    item.scoreFilter.scoreInfo.push(ori) 
                  }
                })
              })
            }
          })
        }
      }
    },
    getKey () {
      getKey({ taskId: !this.isAdd ? this.$route.params.taskId : '' }).then(res => {
        this.updateKey = res.data.key
      })
    },
    blurHandler () {
      this.checkRepeatTaskName()
    },
    async checkRepeatTaskName () {
      this.checkRepeatName = false
      let param = { taskName: this.taskForm.taskName, taskId: this.taskForm.taskId }
      if (param.taskName) {
        let { code } = await checkRepeatTaskName(param)
        this.checkRepeatName = (code === 0)
      }
    },
    setScroll (top) {
      this.$refs.channelLeftScrollbar && this.$refs.channelLeftScrollbar.setScroll(top)
    },
    // 获取关于检测对象和对象属性的大数组
    async getDetectionObjectList () { // 关于对象属性如果要改线上bug，时间充裕建议直接重构吧
      getDetectionObjectList(this.taskForm.algorithmId).then(res => {
        if (res.code === 0) {
          this.detectionObjectList = res.data || []// 对象+属性 或者 只有对象，用detectionObjectList
          this.propertyList = []// 只有属性，用propertyList
          this.detectionObjectList.forEach((item, index) => {
            if (!item.targetObjLabelLineId) { // 没有对象，只有属性
              item.targetObjLabelLineId = '-2' // 给一个假的对象id
            }
            item.targetStatusInfos && item.targetStatusInfos.forEach(citem => {
              // citem.attrType = citem.attrType + '-' + index// attrType可能重复，所以这里重新赋值唯一性
              this.propertyList.push(citem)
            })
          })
        }
      }).catch(() => {})
    },
    changeArrangeRuleJson(val) {
      this.taskForm.arrangeRule = JSON.stringify(val)
    },
    async submitConfig () {
      if (!this.isPlatformModel) { // 本地设备算法，完成的接口不一样，校验也少很多，单独拎出来
        await this.checkRepeatTaskName()
        this.$refs.form.validate(valid => {
          if (valid && this.checkRepeatName) {
            if (this.channelData.length === 0) {
              this.$message.warning('请至少选择一个通道')
              return false
            }
            this.finallySave()
          }
        })
      } else if (this.typeIsOCR) {
      // } else if (this.typeIsOCR || this.typeIsImg) {
        const step1Passflag = await this.saveStep1()
        if (step1Passflag) {
          this.finallySave(this.editRulesData)
        } else {
          return false
        }
      } else if (this.isDeliverModeOnlyPacket) { // 仅下发算法，校验也少很多，单独拎出来
        await this.checkRepeatTaskName()
        const step1Passflag = await this.saveStep1()
        this.$refs.form.validate(valid => {
          if (valid && this.checkRepeatName && step1Passflag) {
            if (this.channelData.length === 0) {
              this.$message.warning('请至少选择一个通道')
              return false
            }
            this.finallySave([])
          }
        })
      } else {
        let configRulesData = await this.$refs.configRulesForm.getEmitData()
        let rulesData = configRulesData.data || []
        let enableArr = configRulesData.enableArr || []
        this.secondRuleConfigValidFlag = []// 第二步的校验(非表单)是否都通过，有值表示没通过
        if (this.isTaskNameCloudOrDCT4 && !rulesData.length) { // 云端任务必须配置规则
          this.$message.info('请配置规则！')
          return false
        }
        if (configRulesData.emitFormValidFlag && rulesData) { // 为true，则需要验证配置规则里所有的表单数据
        // 增加规则类型是否选择的校验起
          let judgeFlag = true
          for (var i = 0; i < rulesData.length; i++) {
            if (!enableArr.includes(rulesData[i].detectedType)) {
              judgeFlag = false
              this.$message.info(`第${i + 1}条规则请选择规则类型！`)
              break
            }
          }
          if (!judgeFlag) {
            return false
          }
          // 增加规则类型是否选择的校验止
          rulesData.forEach((item, index) => {
            item = this.validItemFlagFun(item, this.isArrangeAlgorithm, this.isArrangeAlgorithmScore)
            if (item.numberJudgeCondition === 1) { // 小于等于最小值，最大值手动设置成和最小值一样
              item.maxTargetNum = item.minTargetNum
            } else if (item.numberJudgeCondition === 2) { // 大于等于最大值，最小值手动设置成和最大值一样
              item.minTargetNum = item.maxTargetNum
            }
            if (item.detectedType === 'UNITE_RULE') { // 组合规则的第一条子规则的间隔时间两个参数删除，后端不要
              delete item.uniteChildRules[0].uniteRuleMinInterval
              delete item.uniteChildRules[0].uniteRuleMaxInterval
            }
            if (item.detectedType !== 'NORMAL_RULE') {
              item.cmpFilterSwitch = -1
            }
            if (item.scoreFilter && item.scoreFilter.scoreInfo && item.scoreFilter.scoreInfo.length > 0) {
              let arr = item.scoreFilter.scoreInfo.filter(score => score.targetObjLabelLineId === item.targetObjLabelLineId)
              item.scoreFilter.scoreInfo = [...arr]
              item.scoreFilter.scoreInfo.forEach(score => { // 删除explain，减少接口参数的传递大小
                if (score.scoreType && score.scoreType.length) {
                  score.scoreType.forEach(s => {
                    delete s.explain
                  })
                }
              })
            }
            if (this.algorithmVersionType!=='SEMANTIC_SEG' || !['NORMAL_RULE'].includes(item.detectedType)) { //面积比过滤置为-1
              item.areaRatio = -1
            }
            if (this.algorithmVersionType==='SEMANTIC_SEG'&&['ALL_RULE_DETECT'].includes(item.detectedType)) { //规则的检测对象置为-1
              item.targetObjLabelLineId = '-1'
            }
          })
          this.secondRuleConfigValidFlag = rulesData.filter(item => !item.validFlag)
          if (!this.secondRuleConfigValidFlag.length) { // 第二步校验规则都通过
            this.finallySave(rulesData)
          } else {
            this.$message.warning('有配置规则未通过，请检查！')
          }
        } else { // 为false，没有配置规则，不需要验证
          this.finallySave(rulesData)
        }
      }
    },
    async beforeNextStep () { // 点下一步之前要做的一些判断
      const step1Passflag = await this.saveStep1()
      if(!step1Passflag) {
        return false
      }
      let index = this.algorithmsVisionList.map(val => val.trainId).indexOf(this.taskForm.algorithmId)
      if (index < 0) {
        this.$message.info('请重新选择算法！')
        return false
      }
      this.algorithmVersionType = this.algorithmsVisionList[index].versionType
      if (!this.rulesCompatible && this.algorithmVersionType.indexOf('ARRANGE') < 0) { // 非编排，规则不能兼容，提示用户，是否下一步清空操作
        this.$confirm(`系统检测到算法版本切换后，原有分析规则无法兼容。算法版本切换后，请在下一步勿删除规则，仅需确认并重新配置对象和属性即可，通道的规则区域保留。`, {
          message: '',
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'question'
        }).then(() => {
          this.nextStep(step1Passflag)
        })
      } else {
        this.nextStep(step1Passflag)
      }
    },
    async nextStep (step1Passflag) { // 点下一步的数据处理
      if (step1Passflag) {
        let { data } = await getTriggerType({ analysisMode: this.taskForm.analysisMode, algType: this.algorithmVersionType, deviceType: this.taskForm.taskType, modelPrecision: this.taskForm.modelPrecision })
        if (this.activeStep++ > 0) this.activeStep = 0
        this.$refs.configRulesForm.getRulesFlag(this.algorithmVersionType, data, this.detectionObjectList, this.propertyList, this.isTaskNameCloudOrDCT4, this.isAdd)
        if (this.editRulesData.length > 0) {
          let handleType = ['DETECT', 'COMBINED', 'ARRANGE_DETECT', 'ARRANGE_COMBINED'].includes(this.algorithmVersionType) ? 'detectionObj' : ['CLASSIFY','ARRANGE_CLASSIFY'].includes(this.algorithmVersionType) ? 'noDetectionObj' : ''
          handleType.length > 0 && this.handleRulesData(handleType)
        } else {
          this.editRulesData = []
        }
        let arrangeAlgorithmTabs = []
        if (this.isArrangeAlgorithm && !this.isDeliverModeOnlyPacket) {
          let arrangeRes = await getArrangeAlgorithmTab({trainId: this.taskForm.algorithmId})
          arrangeAlgorithmTabs = arrangeRes.data || []
          arrangeAlgorithmTabs.forEach(item => item.belongNodeId = item.nodeId )
        }
        // 点下一步，把现在的配置规则的数据再传给第二步，以避免刚才第二步的配置数据丢失
        await this.$refs.configRulesForm.initData(this.editRulesData, this.taskForm, this.channelData, this.updateKey, this.isArrangeAlgorithm, arrangeAlgorithmTabs, this.isArrangeAlgorithmScore, this.scoreFullData)
      }
    },
    handleRuleitemIn1 (ruleitem, i) { // 处理数据，只有检测对象的
      ruleitem.targetStatusInfos && ruleitem.targetStatusInfos.push({
        attrType: i,
        propLabelLineId: ruleitem.propertyIds[i],
        enable: false,
        confidenceThreshold: 70
      })
      return ruleitem.targetStatusInfos
    },
    handleRuleitemIn2 (ruleitem, tinyarr, commonitem) { // 处理数据，有检测对象和检测对象属性的
      for (var tkey in ruleitem.propertyIds) {
        if (commonitem.attrType === tkey) {
          if (tinyarr.indexOf(ruleitem.propertyIds[tkey]) < 0) { // 默认选中第一个属性值
            ruleitem.propertyIds[tkey] = tinyarr[0]
            ruleitem.propertyEnables[tkey].attrTypeEnable = false
            ruleitem.propertyEnables[tkey].confidenceThreshold = 70
            ruleitem.targetStatusInfos && ruleitem.targetStatusInfos.forEach((titem, tindex) => {
              if (titem.attrType === tkey) {
                titem.propLabelLineId = ruleitem.propertyIds[tkey]
                titem.enable = false
                titem.confidenceThreshold = 70
              }
            })
          }
        }
      }
      return ruleitem
    },
    handleRuleitem (ruleitem, objitem, handleType, arr, arrVal) {
      // 处理数据，删除已不存在的对象属性
      for (var key in ruleitem.propertyIds) {
        if (arr.indexOf(key) < 0) {
          delete ruleitem.propertyIds[key]
          delete ruleitem.propertyEnables[key]
          ruleitem.targetStatusInfos && ruleitem.targetStatusInfos.forEach((citem, cindex) => {
            if (citem.attrType === key) {
              ruleitem.targetStatusInfos.splice(cindex, 1)
            }
          })
        }
      }
      // 处理数据，如果当前的检测对象下有对象属性未选，默认选该对象属性下的第一个属性值
      let fkeyarr = []
      for (var fkey in ruleitem.propertyIds) {
        fkeyarr.push(fkey)
      }
      arr.forEach((i, idx) => {
        if (!fkeyarr.includes(i)) {
          ruleitem.propertyIds[i] = arrVal[idx][0].propLabelLineId
          ruleitem.propertyEnables[i] = {}
          ruleitem.propertyEnables[i].attrTypeEnable = false
          ruleitem.propertyEnables[i].confidenceThreshold = 70
          if (handleType === 'detectionObj') {
            ruleitem.targetStatusInfos && ruleitem.targetStatusInfos.forEach((ci, cidx) => {
              if (ci.attrType === ruleitem.propertyIds[i]) {
                ruleitem.targetStatusInfos = this.handleRuleitemIn1(ruleitem, i)
              }
            })
            objitem.targetStatusInfos && objitem.targetStatusInfos.forEach((tinyitem) => { // 如果对象属性选中值已经不属于当前属性 则默认选中当前属性的第一个属性值
              let tinyarr = tinyitem.attrValues.map(item => item.propLabelLineId) // 当前对象属性的所有属性的id数组合集
              ruleitem = this.handleRuleitemIn2(ruleitem, tinyarr, tinyitem)
            })
          } else if (handleType === 'noDetectionObj') {
            ruleitem.targetStatusInfos = this.handleRuleitemIn1(ruleitem, i)
            let tinyarr = objitem.attrValues.map(item => item.propLabelLineId) // 当前对象属性的所有属性的id数组合集
            ruleitem = this.handleRuleitemIn2(objitem, tinyarr, objitem)
          }
        }
      })
      return ruleitem
    },
    handleRulesData (handleType) {
      this.editRulesData.forEach((ruleitem, ruleindex) => {
        if (handleType === 'detectionObj') { // 有检测对象，检测对象对应各属性
          this.detectionObjectList.forEach((objitem) => {
            if (ruleitem.targetObjLabelLineId === objitem.targetObjLabelLineId) {
              let arr = objitem.targetStatusInfos.map(item => item.attrType) // 当前检测对象下的所有对象属性的id数组合集
              let arrVal = objitem.targetStatusInfos.map(item => item.attrValues) // 当前检测对象下的所有对象属性的attrValues下拉的数组合集
              ruleitem = this.handleRuleitem(ruleitem, objitem, handleType, arr, arrVal)
            }
          })
          this.objectIdValidExistArr = this.detectionObjectList.map(item => item.targetObjLabelLineId)
        } else if (handleType === 'noDetectionObj') { // 没有检测对象，各属性各自存在
          let arr = this.propertyList.map(item => item.attrType) // 当前所有对象属性的id数组合集
          let arrVal = this.propertyList.map(item => item.attrValues) // 当前所有对象属性的attrValues下拉的数组合集
          this.propertyList.forEach((objitem) => {
            ruleitem = this.handleRuleitem(ruleitem, objitem, handleType, arr, arrVal)
          })
        }
      })
    },
    async preStep () { // 点上一步
      let configRulesData = await this.$refs.configRulesForm.getEmitData()
      let rulesData = configRulesData.data || []
      if (this.isAdd && rulesData.length) {
        this.$confirm('修改算法模型、算法版本、分析模式时会清空规则，确定返回上一步么？', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'question'
        }).then(() => {
          this.preStepConfirm(configRulesData, rulesData)
        })
      } else {
        this.preStepConfirm(configRulesData, rulesData)
      }
    },
    // 确定返回上一步的处理
    preStepConfirm (configRulesData, rulesData) {
      this.activeStep = 0
      // 点上一步，先把下一步配置规则的数据存储起来
      if (configRulesData.emitFormValidFlag && rulesData) { // 处理验证配置规则里的对象属性的数据并存储在前端
        rulesData.forEach((item, index) => {
          if (item.targetStatusInfos) {
            item.targetStatusInfos = []
            for (var key in item.propertyIds) {
              item.targetStatusInfos.push({
                attrType: key,
                propLabelLineId: item.propertyIds[key]
              })
            }
            item.targetStatusInfos && item.targetStatusInfos.forEach((checkitem, index) => { // 处理传给后端的对象属性的选中值：[{attrType属性类型:'',propLabelLineId属性值:''.enable:true},...]
              for (var key in item.propertyEnables) {
                if (checkitem.attrType === key) {
                  checkitem.enable = item.propertyEnables[key].attrTypeEnable
                  checkitem.confidenceThreshold = item.propertyEnables[key].confidenceThreshold
                }
              }
            })
          }
        })
      } else { // 为false，没有配置规则
        this.editRulesData = []
      }
      this.editRulesData = rulesData
    },
    async init () {
      if (!this.isAdd) { // 编辑，获取配置详情
        let res = await getCaptureConfig({ taskId: this.$route.params.taskId })
        this.taskForm.modelSource = res.data.modelSource // 关联computed的isPlatformModel
        this.taskForm.deliverMode = res.data.deliverMode // 关联computed的isDeliverModeOnlyPacket
        this.firstInEdit = 0
        this.taskForm = { ...res.data }
        this.hugeSelectChannel = (res.data.channelCount > this.maxLimitChoose) || (res.data.storeConfig && res.data.storeConfig.length > this.maxLimitChoose)
        if (this.isPlatformModel) { // 平台算法的赋值逻辑
          this.oldTrainId = res.data.algorithmId
          this.offlineFlag = res.data.algorithmStatus === 3// 为3则算法下线
          this.algorithmModelName = res.data.algorithmModelName// 算法下线的算法模型直接显示名字
          let haddleName = res.data.taskType.includes('CLOUD') ? '云服务-在线验证' : res.data.taskType.includes('DCT4') ? '云服务-云眸' : res.data.taskType
          this.algorithmVersionName = res.data.algorithmVersion + '(' + (haddleName) + ')'// 算法下线的算法版本直接显示名字
          this.linkageArming = res.data.linkageArming
          this.feedbackData = res.data.feedback
          // this.taskForm.executeTimeList = res.data.definedTime && res.data.definedTime.length !== 0 ? res.data.definedTime.split(',').map(item => {
          //   return {
          //     value: new Date(this.todayDate + ' ' + item),
          //     label: item
          //   }
          // }) : [{ value: '' }]
          this.$nextTick(() => {
            this.taskForm.executeTimeList = res.data.definedTime && res.data.definedTime.length !== 0 ? res.data.definedTime.split(',').map(item => {
              return {
                value: new Date(this.todayDate + ' ' + item),
                label: item
              }
            }) : [{ value: '', label: '' }]
            this.selDate['week'] = []
            res.data.weekDay && res.data.weekDay.split(',').forEach((item) => {
              this.selDate['week'].push(parseInt(item))
            })
            this.taskForm.weekDay = this.selDate['week'].length ? Array.from(new Set(this.selDate['week'])).sort((a, b) => { return a > b }).join(',') : ''
          })
          if (res.data.intervalEnable) {
            this.taskForm.executeValDateList = res.data.execTime.split(',').map(item => {
              return {
                value: [new Date(this.todayDate + ' ' + item.split('-')[0]), new Date(this.todayDate + ' ' + item.split('-')[1])],
                label: item
              }
            })
            this.taskForm.captureSpace = res.data.captureSpace
          } else {
            this.taskForm.executeValDateList = [{ value: ['00:00', '23:59'], label: '00:00 - 23:59' }]
          }
          // this.isTaskNameCloudOrDCT4 = ['CLOUD', 'DCT4'].includes(this.taskForm.taskType)// 任务类型含有"CLOUD"则表示云服务，分析模式只有定时抓图 且表格不需展开
          this.editRulesData = res.data.ruleInfos || []// 编辑时，给第二步配置规则赋值
          this.editRulesData.forEach((item, index) => {
            item.validFlag = true
            item.propertyIds = {}// 处理对象属性的每一个选中值，使之绑定在rulesFormData.propertyIds对象的各key值
            item.propertyEnables = {}// 处理对象属性的每一个启用禁用状态
            // item.confidenceThreshold = item.confidenceThreshold || 70 // 赋默认值
            item.faceContrastType = item.faceContrastType || 'COMPARE' // 赋默认值
            item.faceUpload = item.faceUpload || []
            item.faceLib = (item.faceLib && item.faceLib.length > 0 ) ? item.faceLib : [{ faceLibId: '', faceLibName: '', faceLibThreshold: 70}] // 赋默认值
            item.subTargetInfo = item.subTargetInfo || []
            item.subTargetInfo.forEach((ii,iiIdx) => ii.name = `子目标${iiIdx + 1}`)
            // item.faceLib.forEach(item => item.faceLibThreshold = +item.faceLibThreshold)
            if (item.targetStatusInfos && item.targetStatusInfos.length > 0) {
              item.targetStatusInfos.forEach(checkitem => {
                item.propertyIds[checkitem.attrType] = checkitem.propLabelLineId
                item.propertyEnables[checkitem.attrType] = {}
                item.propertyEnables[checkitem.attrType].attrTypeEnable = checkitem.enable
                item.propertyEnables[checkitem.attrType].confidenceThreshold = checkitem.confidenceThreshold || 70 // 赋默认值
              })
            }
            // 增加组合规则后的数据处理
            item.uniteChildRules && item.uniteChildRules.forEach(tabItem => {
              tabItem.validFlag = true
              tabItem.propertyIds = {}
              tabItem.propertyEnables = {}
              tabItem.confidenceThreshold = tabItem.confidenceThreshold || 70 // 赋默认值
              tabItem.subTargetInfo = tabItem.subTargetInfo || []
              tabItem.subTargetInfo.forEach((ii,iiIdx) => ii.name = `子目标${iiIdx + 1}`)
              tabItem.targetStatusInfos && tabItem.targetStatusInfos.length && tabItem.targetStatusInfos.forEach(ii => {
                tabItem.propertyIds[ii.attrType] = ii.propLabelLineId
                tabItem.propertyEnables[ii.attrType] = {}
                tabItem.propertyEnables[ii.attrType].attrTypeEnable = ii.enable
                tabItem.propertyEnables[ii.attrType].confidenceThreshold = ii.confidenceThreshold || 70 // 赋默认值
                tabItem.showCollapseFlag = false
                // 单规则的对象属性赋默认值，否则报渲染警告
                item.propertyIds[ii.attrType] = ii.propLabelLineId
                item.propertyEnables[ii.attrType] = {}
                item.propertyEnables[ii.attrType].attrTypeEnable = ii.enable
                item.propertyEnables[ii.attrType].confidenceThreshold = ii.confidenceThreshold || 70 // 赋默认值
                item.targetStatusInfos = tabItem.targetStatusInfos
                item.targetObjLabelLineId = tabItem.targetObjLabelLineId
              })
            })
          })
          this.algorithmVersionType = res.data.algorithmVersionType
        }
        if (this.taskForm.executeType === 'BYCHANNEL') { // 通道
          this.channelData = res.data.groupInfoList
          this.handleTableData(this.channelData[0] ? this.channelData[0].channels : [])
          // this.handleGroupListForPoint()
          this.searchGroupId = this.channelData[0] ? this.channelData[0].groupId : ''
          if (this.hugeSelectChannel) { // 编辑时大量通道，不需要走计算已选通道，因为后端接口也不会返回具体的通道
            this.selectChannel = res.data.channelCount
          } else {
            this.setSelectChannel()// 计算已经选择的通道数量
          }
        } else if (['BYSCENE', 'BYPRESET'].includes(this.taskForm.executeType)) { // 门店和场景 或者 门店和分析预置点
          this.$nextTick(() => {
            if (this.taskForm.executeType === 'BYSCENE') {
              this.taskForm.sceneConfig = [...res.data.sceneConfig]// 触发场景是否配置接口
            }
            let storeConfig = []
            storeConfig = res.data.storeConfig.map(item => item.storeId) || []
            this.taskForm.storeConfig = storeConfig
            this.$refs.tableTransfer.setSelectData(res.data.storeConfig, true)
          })
        }
        setTimeout(() => {
          this.loading = false
        }, 1000)
      } else { // 增加
        this.taskForm.modelSource = 'PLATFORM'
        this.taskForm.deliverMode = 'DEVICE_TASK'
        this.loading = false
        this.taskForm.taskId = ''
        this.firstInEdit = 10 // 增加下，只要切换分析模式、算法版本、算法模型，生效通道的数组都清空，即都执行clearTableData，后期很肯能出bug，再考虑优化吧
        this.taskForm.algorithmModelId = this.$route.params.modelId || '' // 接收路由传过来的算法模型id
        this.taskForm.algorithmId = this.$route.params.trainId || '' // 接收路由传过来的算法版本id
        this.taskForm.taskType = this.$route.params.taskType || '' // 接收路由传过来的任务类型
        this.taskForm.modelPrecision = this.$route.params.modelPrecision || '' // 接收路由传过来的精度
        this.editRulesData = []
        this.taskForm.scList = []
      }
    },
    async getImageLibraryCanUseListFun() { // 获取编排算法的配置图库的表格数据
      if (!this.taskForm.taskType) {
        return false
      }
      let imageLibraryCanUseListRes = await getImageLibraryCanUseList({ taskType: this.taskForm.taskType })
      this.libraryImageTableDataTemp = imageLibraryCanUseListRes.data || []
      this.libraryImageTableDataTemp.forEach(item => {
        item.imageLibraryId = item.id
        item.libraryImageName = item.name
      })
    },
    tableRowClassName (row, rowIndex) {
      return row.row.isUnnormalStyle ? 'isUnnormalStyle' : ''
    },
    // 切换分析模式
    changeTaskAnalysisMode () {
      this.$refs.form.validate(valid => {})
      this.editRulesData = []
      this.clearTableData()
      clearUpdateKeyData({ key: this.updateKey }).then(res => {})// 清除后端实时更新通道的数据
    },
    deleteChannel (index, channelId) {
      this.updateDelete([{ channelId: channelId }])
      let deleteChannelDataIndex = null
      let hasChannels = true // 该组织group有设备和通道数据
      this.channelData.map((item, i) => {
        item.channels.map((val, index) => {
          if (val.channelId === channelId) {
            item.channels.splice(index, 1)
            deleteChannelDataIndex = i
            if (item.channels.length === 0) { // 如果删除通道后该该组织无数据，则删除组织
              hasChannels = false
            }
          }
        })
      })
      if (hasChannels) {
        this.handleTableData(this.channelData[deleteChannelDataIndex].channels)
        this.handleGroupListForPoint()
      } else {
        this.channelData.splice(deleteChannelDataIndex, 1)
        if (this.channelData.length > 0) {
          this.selChannelCoumunity(0)
        }
      }
    },
    // 点击算法下线，是否获取最新算法版本
    getVersionForOffline () {
      let arr = this.algorithmsModalList.map(item => {
        return item.modelId
      })
      if (arr.indexOf(this.taskForm.algorithmModelId) > -1) { // 算法模型没有下线
        this.offlineFlag = false
        this.taskForm.algorithmId = ''// 把下线的算法版本清除，否则会显示id
        this.changeAlgorithmModelId()
      } else { // 算法模型下线
        this.$message.info('该算法模型已删除，无法获取算法版本')
      }
    },
    // 获取算法模型下拉框
    async getAlgorithmsList () {
      let res = await getAlgorithmsListNew({ nameLike: '' })
      if (res.code === 0) {
        this.algorithmsModalList = res.data ? res.data : []
        if (!this.isAdd) { // 编辑，过滤算法模型
          this.algorithmsModalList = this.algorithmsModalList.filter(item => {
            return item.modelType.modelTypeCode === this.taskForm.algorithmVersionType
          })
          setTimeout(() => {
            this.getModuleIsFinish = true
          }, 500)
        }
      }
    },
    // 改变算法模型时，获取算法版本下拉框
    changeAlgorithmModelId () {
      if (this.algorithmVersionType.indexOf('ARRANGE') > -1 && this.getModuleIsFinish) { // 编排算法切换模型，清空下一步的规则
        if (this.editRulesData && this.editRulesData.length) {
          this.$message.info('切换编排算法，下一步的规则将会清空，请知悉')
        }
        this.editRulesData = []
      }
      this.algorithmsVisionList = []
      getAlgorithmsVisionListWithDeploymentStatus({ modelId: this.taskForm.algorithmModelId, deliverMode: this.taskForm.deliverMode }).then((res) => {
        if (res.code === 0 && res.data) {
          if (!this.isAdd) { // 编辑模式，过滤可选的算法版本，且分析通道不清空
            let list = JSON.parse(JSON.stringify(res.data))
            list.map(item => {
              if (item.platform === this.taskForm.taskType) {
                this.algorithmsVisionList.push(item)
              }
              if (this.taskForm.taskType === 'CLOUD' && item.platform === 'DCT4') { // CLOUD的要增加DCT4的算法版本
                this.algorithmsVisionList.push(item)
              }
            })
            if (!this.algorithmsVisionList.length || this.getModuleIsFinish) {
              this.taskForm.algorithmId = ''
              // this.$message.info('请重新选择算法版本')
            }
          } else { // 增加模式，使用全部的算法版本，
            this.taskForm.algorithmId = this.$route.params.trainId ? this.$route.params.trainId : ''// 显示的算法版本，路由跳过来，显示路由的，否则清空
            this.algorithmsVisionList = JSON.parse(JSON.stringify(res.data))
            let existArr = this.algorithmsVisionList.filter(_ => _.trainId === this.taskForm.algorithmId)
            this.taskForm.algorithmId = existArr.length ? existArr[0].trainId : ''
            this.clearTableData()
            // 清空下一步中的规则
            this.editRulesData = []
            if (this.taskForm.algorithmId) {
              this.algorithmIdChanged(this.taskForm.algorithmId)
            }
          }
          this.judgeSwitchDisabled()// 判断开关（自动回传、模型自动更新）是否可以操作
        }
      })
    },
    judgeSwitchDisabled () {
      if (this.algorithmsModalList && this.algorithmsModalList.length && this.taskForm.algorithmModelId) {
        this.isFeedbackAutoDisabled = !this.algorithmsModalList.filter(item => item.modelId === this.taskForm.algorithmModelId)[0].autoFeedback
        this.isSuAutoDeployDisabled = !this.algorithmsModalList.filter(item => item.modelId === this.taskForm.algorithmModelId)[0].modelAutoUpdate
      }
    },
    // 改变下发模式，清空算法模型、版本、任务类型等
    changeDeliverMode() {
      if (this.firstInEdit > 3) {
        this.$route.params.trainId = ''
        this.taskForm.algorithmModelId = ''
        this.taskForm.algorithmId = ''
        this.taskForm.taskType = ''
      }
    },
    // 改变模型来源，清除后端实时更新通道的数据
    changeModelSource () {
      if (this.firstInEdit > 3) { // 编辑进来，不清空
        clearUpdateKeyData({ key: this.updateKey }).then(res => {})// 清除后端实时更新通道的数据
        this.clearTableData()
      }
      if (!this.isPlatformModel) { // 本地设备算法模型，一些值要手动设置下
        // this.taskForm.analysisMode = this.analysisModeList.filter(item => { return !['SECONDARY_FILTER', 'DIANA_SECONDARY_FILTER'].includes(item.labelName) })[0].id// 分析模式设置成非二次分析的
        this.taskForm.executeType = 'BYCHANNEL'// 执行类型不能是按场景
      }
    },
    // 改变算法版本时，通过当前算法模型的id计算显示任务类型，并且isShowNext为true
    changeAlgorithmVisionId (e) {
      this.showErrorUpdateVision = false
      // 新增模式下清空配置的规则
      if (this.isAdd) {
        this.editRulesData = []
        clearUpdateKeyData({ key: this.updateKey }).then(res => {})// 清除后端实时更新通道的数据
      }
      // 编辑模式下，改变版本，调后端接口判断原任务的规则能否兼容
      if (!this.isAdd) {
        compatibleRules({ oldTrainId: this.oldTrainId, newTrainId: this.taskForm.algorithmId }).then(res => {
          if (res.code === 0) {
            this.rulesCompatible = res.data.isCompatible // 不能兼容
          }
        })
      }
      let tempObj = {}
      // 判断当前算法是不是未部署，如果未部署，则弹窗提示
      this.algorithmsVisionList.map((item, index) => {
        if (item.trainId === this.taskForm.algorithmId) {
          this.taskForm.taskType = this.algorithmsVisionList[index].platform
          tempObj = item
        }
      })
      /* if (tempObj.publishStatus === 0) {
        this.$confirm(`算法模型未部署，确定部署${tempObj.version}(${tempObj.platform.includes('CLOUD') ? '云服务-在线验证' : tempObj.platform.includes('DCT4') ? '云服务-云眸' : tempObj.platform})？`, {
          confirmButtonText: '确定部署',
          cancelButtonText: '取消',
          type: 'question'
        }).then(async () => {
          let param = { versionId: tempObj.trainId, modelId: this.taskForm.algorithmModelId }
          let { code, message } = await deploymentModel(param)
          if (code === 0) {
            this.$message({ message: '算法模型部署成功', type: 'success' })
            tempObj.publishStatus = 1 // 此处没有更新接口  直接将数据字段置为已部署
          } else if (NO_AUTH_CODE.includes(code)) {
            this.$msgbox({
              title: `${message}`,
              type: 'warning',
              showCancelButton: true,
              confirmButtonText: '查看详情',
              cancelButtonText: '关闭',
              message: '请购买新的推理套餐资源'
            }).then(() => {
              let path = this.$router.resolve({ name: 'serviceManage' })
              path = '/AI-inspect/index.html' + path.href.split('/AI-inspect/')[1]
              window.open(path, '_blank')
            }).catch(() => { this.taskForm.algorithmId = '' })
          } else {
            this.$msgbox({
              title: '算法模型部署失败',
              type: 'warning',
              showCancelButton: true,
              confirmButtonText: '立即前往',
              cancelButtonText: '关闭',
              message: '请尝试手动操作'
            }).then(() => { this.$router.push({ name: 'cloudDeployment' }) }).catch(() => { this.taskForm.algorithmId = '' })
          }
        }).catch(() => {
          this.taskForm.algorithmId = ''
        })
      } */
      // this.isTaskNameCloudOrDCT4 = ['CLOUD', 'DCT4'].includes(this.taskForm.taskType)// 任务类型含有"CLOUD"则表示云服务，或者是DCT4（20210428修改），分析模式只有定时抓图 且表格不需展开
      if (this.isAdd) {
        this.clearTableData()
      } else {
        this.firstInEdit = 0
      }
      // this.isShowNext = true
      // 云服务下，抓拍日期默认周一到周日选中
      this.selDate.week = []
      let arr = [1, 2, 3, 4, 5, 6, 7]
      arr.map(item => {
        this.selectCaptureTime(item, 'week')
      })
    },
    // 清空已选择的通道数据
    clearTableData () {
      this.firstInEdit++
      if (this.firstInEdit < 3) { // 编辑下切换算法版本不清空通道
        return false
      } else {
        this.tableChannelData = []
        this.channelData = []
        this.selectChannel = 0
      }
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
    },
    // 添加按日抓取时间点
    addCaptureTime () {
      if (this.taskForm.executeTimeList.length < 20) {
        this.taskForm.executeTimeList.push({ value: '', label: '' })
        this.$forceUpdate()
      } else {
        this.$message.info('最多添加15个时间点')
      }
    },
    // 添加按日抓取时间段
    addExecuteValDate () {
      if (this.taskForm.executeValDateList.length < 5) {
        this.taskForm.executeValDateList.push({ value: ['00:00', '23:59'], label: '00:00 - 23:59' })
        this.$forceUpdate()
      } else {
        this.$message.info('最多添加5个时间段')
      }
    },

    // 抓拍时间点改变
    executeTimeListChange (val, index) {
      if (typeof val === 'string') {
        this.taskForm.executeTimeList[index].label = val
      }
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
      this.$forceUpdate()
    },
    // 删除按日抓取时间段
    delExecuteValDate (index) {
      this.taskForm.executeValDateList.splice(index, 1)
      this.$forceUpdate()
    },
    // 修改编辑页的组织查询的下拉框
    changeSearchGroupId () {
      let index = this.channelData.map(item => item.groupId).indexOf(this.searchGroupId)
      this.selChannelCoumunity(index)
    },
    // 选择小区，刷新通道列表
    selChannelCoumunity (index) {
      this.channelCommunityActive = index
      this.handleTableData(this.channelData[index].channels)
      this.handleGroupListForPoint()
      this.searchGroupId = this.channelData[index].groupId
    },
    // 删除小区，刷新通道列表
    delChannelCommunity (index) { // 主页面表格上的删除还是走前端，不想动老逻辑了，等后面有问题再修改吧
      this.$confirm('确定删除该组织吗? 该组织下的通道都会被删除!', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'question'
      }).then(() => {
        if (this.channelData.length > 1) {
          if (index < this.channelCommunityActive) {
            this.channelCommunityActive = index
          } else if (index === this.channelCommunityActive) {
            this.channelCommunityActive = index !== 0 ? index - 1 : index
          }
          this.tableChannelData = index !== 0 ? this.channelData[this.channelCommunityActive].channels : this.channelData[this.channelCommunityActive + 1].channels
        } else {
          this.tableChannelData = []
        }
        let row = (this.channelData[index] && this.channelData[index].channels) || []
        this.updateDelete(row)
        this.channelData.splice(index, 1)
        this.selChannelCoumunity(this.channelCommunityActive)
      }).catch(() => {})
    },
    // 删除通道列表中通道
    delTableChannel (index, row) { // 主页面表格上的删除还是走前端，不想动老逻辑了，等后面有问题再修改吧
      this.$confirm('确定删除该通道吗?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'question'
      }).then(() => {
        this.updateDelete([row])
        this.tableChannelData.splice(index, 1)
        if (this.tableChannelData.length === 0) { // 如果只有一个通道，删除后自动删除该组织
          let communityIndex = this.channelCommunityActive
          if (this.channelData.length > 1) {
            if (this.channelCommunityActive !== 0) {
              this.channelCommunityActive--
              this.tableChannelData = this.channelData[this.channelCommunityActive].channels
            } else {
              this.tableChannelData = this.channelData[this.channelCommunityActive + 1].channels
            }
          } else {
            this.tableChannelData = []
          }
          this.channelData.splice(communityIndex, 1)
        }
      })
    },
    // 后端实时更新删除操作
    updateDelete (data) {
      updateDelete({ key: this.updateKey, channelIds: data }).then(() => {
        this.setSelectChannel()
      }
      )
    },
    handleHuge() {
      const h = this.$createElement
      let url = this.$commonUtils.judgeEnv() + `/AI-inspect/index.html#/intelligent/inspectionConfig/${this.serviceType}/channelConfigPage?taskId=${this.taskForm.taskId}`
      this.$confirm(`选择的通道已经超过2000个`, {
        dangerouslyUseHTMLString: true,
        type: 'question',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        message: h('div', undefined, [
          h('span', undefined, '请前往 '),
          h('el-button',
            { style: { "text-decoration": "underline" }, props: { type: 'link' }, on: { click: () => { window.open(url) } } },
            '通道配置页'
          ),
          h('span', undefined, ' 操作')
        ]),
      }).then(async () => {
        window.open(url)
      })
    },
    showAddChannel () {
      if (this.hugeSelectChannel) {
        this.handleHuge()
        return false
      }
      this.modalVisible = true
    },
    showAddTaskChannel () {
      if (this.hugeSelectChannel) {
        this.handleHuge()
        return false
      }
      this.addTaskModalVisible = true
    },
    showAddAreaChannel () {
      if (this.hugeSelectChannel) {
        this.handleHuge()
        return false
      }
      this.addAreaModalVisible = true
    },
    async editChannelData (val) {
      this.channelData = val
      this.setSelectChannel()
      this.channelCommunityActive = 0
      if (this.channelData.length > 0) {
        this.handleTableData(this.channelData[0] ? this.channelData[0].channels : [])
        this.handleGroupListForPoint()
        this.searchGroupId = this.channelData[0].groupId
      }
    },
    // 根据任务类型不同处理不同的通道表格数据，云服务和本地算法不展开，其他都非展开
    handleTableData (val) {
      if (this.isTaskNameCloudOrDCT4 || !this.isPlatformModel) {
        this.tableChannelData = val
      } else {
        // 将平行结构换成包含结构
        val.forEach((item, index) => { // 编辑时后端不带cameraCanUse，可能引起问题，这里手动赋值下。
          if (item.cameraCanUse > 0) {
            val.forEach(i => {
              if (i.deviceId === item.deviceId) {
                i.cameraCanUse = item.cameraCanUse
              }
            })
          }
        })
        let tableData = val
        let deviceTableData = []
        for (var x = 0; x < tableData.length; x++) {
          var flagSameDevice = 0
          for (var y = 0; y < deviceTableData.length; y++) {
            if (tableData[x].deviceId === deviceTableData[y].deviceId) {
              flagSameDevice = 1
              break
            }
          }
          if (flagSameDevice === 0) {
            deviceTableData.push({
              deviceId: tableData[x].deviceId,
              deviceName: tableData[x].deviceName,
              cameraCanUse: tableData[x].cameraCanUse,
              deviceArr: [tableData[x]]
            })
          } else {
            deviceTableData[y].deviceArr.push(tableData[x])
          }
        }
        // 判断哪些通道的选择超出
        deviceTableData.map((item, index) => {
          if (item.deviceArr.length > +item.cameraCanUse) {
            item.isUnnormalStyle = true
          } else {
            item.isUnnormalStyle = false
          }
        })
        this.tableChannelData = deviceTableData
        this.$forceUpdate()
      }
    },
    async updateChooseChannelData (val, isCover) { // isCover表示是否替换覆盖之前所选，true表示替换，false表示增量。
      if (isCover) {
        this.editChannelData(val)
      } else { // 增量，处理数据：this.channelData和val进行聚合和去重。数据结构[{groupId:'',channels:[{channelId:'',selPresetIds:[{'',''}]}]}]
        // 处理groupId层
        let selectGroupIds = this.channelData.map(item => item.groupId)
        val.forEach(valObj => {
          if (selectGroupIds.indexOf(valObj.groupId) < 0) {
            this.channelData.push(valObj)
          } else { // 处理channels层
            let groupIndex = selectGroupIds.indexOf(valObj.groupId)
            let selectChannelIds = this.channelData[groupIndex].channels.map(item => item.channelId)
            valObj.channels.forEach(valObjChild => { // 处理channels层
              if (selectChannelIds.indexOf(valObjChild.channelId) < 0) {
                this.channelData[groupIndex].channels.push(valObjChild)
              } else { // 处理selPresetIds层
                let channelIndex = selectChannelIds.indexOf(valObjChild.channelId)
                let selPresetIdsAllArr = this.channelData[groupIndex].channels[channelIndex].presetInfo
                  ? this.channelData[groupIndex].channels[channelIndex].presetInfo.concat(valObjChild.presetInfo)
                  : valObjChild.presetInfo
                let obj = {}
                let arr = selPresetIdsAllArr.reduce((cur, next) => {
                  (obj[next.presetId] ? '' : obj[next.presetId] = true) && cur.push(next)
                  return cur
                }, [])
                this.channelData[groupIndex].channels[channelIndex].presetInfo = arr
              }
            })
          }
        })
        this.editChannelData(this.channelData)// 复用原通道选择弹框的逻辑
      }
    },
    setSelectChannel (val) {
      if (val) { // 弹框emit出来的数据
        this.selectChannel = val
      } else {
        let selectData = []
        this.channelData.forEach(item => {
          item.channels.forEach(val => {
            val.selPresetIds = val.presetInfo ? val.presetInfo.map(sel => { return sel.presetId }) : []// 编辑时，presetInfo后端给的是已选择的预置点数据
            selectData.push(val)
          })
        })
        this.selectChannel = selectData.length
      }
    },
    compare (property) {
      return function (a, b) {
        var value1 = a[property]
        var value2 = b[property]
        return value2 - value1
      }
    },
    // 对左边的组织列表进行判断，组织下的所有设备是否通道选择均未超额
    handleGroupListForPoint () {
      this.channelData.map((channelDataItem, index) => {
        let tableData = channelDataItem.channels
        let deviceTableData = []
        let allIs = false// 该组织group下所有的设备所选通道均未超额
        for (var x = 0; x < tableData.length; x++) {
          var flagSameDevice = 0
          for (var y = 0; y < deviceTableData.length; y++) {
            if (tableData[x].deviceId === deviceTableData[y].deviceId) {
              flagSameDevice = 1
              break
            }
          }
          if (flagSameDevice === 0) {
            deviceTableData.push({
              deviceId: tableData[x].deviceId,
              deviceName: tableData[x].deviceName,
              cameraCanUse: tableData[x].cameraCanUse,
              deviceArr: [tableData[x]]
            })
          } else {
            deviceTableData[y].deviceArr.push(tableData[x])
          }
        }
        if (!this.isTaskNameCloudOrDCT4 && this.isPlatformModel) {
          // 判断哪些通道的选择超出
          deviceTableData.map((item, ind) => {
            if (item.deviceArr.length > +item.cameraCanUse) {
              item.isUnnormalStyle = true
              allIs = true// 如果有一个设备的通道超出，则该组织groupId为超出
            } else {
              item.isUnnormalStyle = false
            }
          })
          if (allIs) { // 组织的超出
            channelDataItem.isUnnormalGroupStyle = true
          } else {
            channelDataItem.isUnnormalGroupStyle = false
          }
        }
      })
      // 调整异常组织到最前，正常组织到最后
      this.channelData.sort(this.compare('isUnnormalGroupStyle'))
      for (let i = 0; i < this.channelData.length; i++) {
        if (this.channelData[i].isUnnormalGroupStyle) {
          this.$message.warning('分析通道有需要删除的通道，请删除或禁用已添加这些标红通道的其他任务！')
          break
        }
      }
    },
    changeState () {
      this.feedbackData = this.feedback ? 'ALWAYS' : 'REMIND'
    },
    getChangeCount () { // 编辑任务，对通道修改做提示
      this.submitLoading = true
      updateChangeInfo({ key: this.updateKey, taskId: !this.isAdd ? this.$route.params.taskId : '' }).then(res => {
        this.submitLoading = false
        let countData = res.data
        let addText = countData.add.changeCount > 0 ? `增加${countData.add.changeCount}个通道，` : ''
        let delText = countData.delete.changeCount > 0 ? `删除${countData.delete.changeCount}个通道，` : ''
        let tipText = countData.add.changeCount === 0 && countData.delete.changeCount === 0 ? ``
          : countData.delete.changeCount > 0 ? `此次操作${addText}${delText}是否确认？(改动通道会删除该通道下的区域绘制数据)`
            : `此次操作${addText}${delText}是否确认？`
        if (tipText.length) { // 有修改
          this.$confirm(tipText, {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'question'
          }).then(() => {
            this.edit()
          }).catch(() => { this.submitLoading = false })
        } else {
          this.edit()
        }
      })
    },
    edit () {
      let proxyApi = this.isPlatformModel ? editTask : editLocalTask
      this.submitLoading = true
      proxyApi({ key: this.updateKey, ...this.taskForm }).then(res => {
        this.submitLoading = false
        if (res.code === 0) {
          this.$message.success('编辑任务成功！')

          this.back()
        } else if (NO_AUTH_CODE.includes(res.code)) {
          this.goToServiceManage(res.message)
        } else if (res.code === 70010038) {
          this.showErrorMsgbox(res.message)
        } else if (res.code === 70010039) { // 演示模型配置错误提示
          this.showIsDemoMsgbox()
        }
      }).catch(() => { this.submitLoading = false })
    },
    add () {
      let proxyApi = this.isPlatformModel ? addTask : addLocalTask
      proxyApi({ key: this.updateKey, ...this.taskForm }).then(res => {
        this.submitLoading = false
        if (res.code === 0) {
          this.$message.success('添加任务成功！')
          this.back()
        } else if (NO_AUTH_CODE.includes(res.code)) {
          this.goToServiceManage(res.message)
        } else if (res.code === 70010038) {
          this.showErrorMsgbox(res.message)
        } else if (res.code === 70010039) { // 演示模型配置错误提示
          this.showIsDemoMsgbox()
        }
      }).catch(() => { this.submitLoading = false })
    },
    async finallySave (rulesData) {
      this.taskForm.ruleInfos = rulesData
      this.taskForm.groupInfoList = []
      if (this.isArrangeAlgorithm && !this.isDeliverModeOnlyPacket) { // 编排算法/检索比对，选择了自定义，要判断图库和设备的已使用情况
        let res = await checkTaskLibraryIsExists({taskId: this.taskForm.taskId, channelCacheKey: this.updateKey, imageLibraryIds: this.libraryImageTableSelData.map(_ => _.imageLibraryId)})
        if (res.data && res.data.length) {
          let tips = ''
          res.data.forEach(item => {
            tips += "「"+item.imageLibraryName+'」图库下的设备：'+item.deviceSerials.join('、')+'，'
          })
          tips = tips.substring(0,tips.length-2)
          this.$confirm(`已存在其他任务配置了${tips}，这些图库（设备）无法关联当前任务。`, {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'question',
            size: 'large'
          }).then(() => {
            this.finallySaveAPI()
          })
        } else {
          this.finallySaveAPI()
        }
      } else {
        this.finallySaveAPI()
      }
    },
    finallySaveAPI() {
      if (!this.isAdd) { // 编辑任务
        this.getChangeCount()
      } else { // 添加任务
        this.add()
      }
    },
    showIsDemoMsgbox () {
      this.$msgbox({
        title: '错误',
        type: 'error',
        size: 'middle',
        message: '当前任务使用的是演示模型，演示模型用于项目前期效果演示，仅支持最多50路通道的分析。如您需要大规模应用，请重新训练模型。'
      })
    },
    showErrorMsgbox (message) {
      this.showErrorUpdateVision = true // 算法版本下面提示文本的样式
      this.activeStep = 0
      let saveErrorMessage = `<div>${message}<span class="link_text" id="toUpdateHelpDom">，请查看详情帮助</span></div>`
      this.$msgbox({
        title: '错误',
        type: 'error',
        size: 'large',
        dangerouslyUseHTMLString: true,
        message: saveErrorMessage
      })
      this.$nextTick(() => {
        document.getElementById('scrolldom').scrollIntoView()
        let toUpdateHelpDom = document.getElementById('toUpdateHelpDom')
        let _this = this
        toUpdateHelpDom.addEventListener('click', function () {
          _this.toUpdateHelp()
        })
      })
    },
    goToServiceManage (message) {
      this.$msgbox({
        title: `${message}`,
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: '查看详情',
        cancelButtonText: '关闭',
        // message: '请购买新的推理套餐资源'
      }).then(() => {
        let path = this.$router.resolve({ name: 'serviceManage' })
        path = '/AI-inspect/index.html' + path.href.split('/AI-inspect/')[1]
        window.open(path, '_blank')
      }).catch(() => {
        // this.taskForm.algorithmId = ''
      })
    },
    finishTaskSave () {
      this.$msgbox({
        title: `分析规则绘制区域为全视频画面检测，如需更改可前往智能分析页面进行修改。`,
        message: `完成配置。`,
        confirmButtonText: '知道了',
        type: 'success',
        callback: () => {
          this.back()
        }
      })
    },
    async saveStep1 () {
      let passflag = false
      this.taskForm.feedback = this.feedbackData
      this.taskForm.linkageArming = this.linkageArming
      this.taskForm.groupInfoList = this.channelData
      this.taskForm.execTime = ''
      this.taskForm.definedTime = ''
      // this.taskForm.definedTime = this.taskForm.definedTimeEnable ? this.taskForm.executeTimeList.map(item => item.label).join(',') : ''
      if (this.taskForm.definedTimeEnable && this.taskForm.executeTimeList.length > 0) { // 1.9.4版本，不知道为啥时间组件的值都出问题了，等有版本测试该页面时，参考sceneConfig的editSceneTask改下
        let definedTimeStr = ''
        this.taskForm.executeTimeList.forEach(item => {
          if (!item.value.length) {
            definedTimeStr += item.label + ','
          } else {
            definedTimeStr += item.value + ','
          }
        })
        this.taskForm.definedTime = definedTimeStr.substr(0, definedTimeStr.length - 1)
      }
      if (this.taskForm.intervalEnable && this.taskForm.executeValDateList.length > 0) { // 1.9.4版本，不知道为啥时间组件的值都出问题了
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
      this.taskForm.captureSpace = parseInt(this.taskForm.captureSpace)
      await this.checkRepeatTaskName()
      this.$refs.form.validate(valid => {
        if (valid && this.checkRepeatName) {
          if (['POLLING_SNAP', 'CLOUD_POLLING_SNAP', 'INVOICE_PERSION_FILTER'].includes(this.taskForm.analysisMode) && !this.taskForm.intervalEnable && !this.taskForm.definedTimeEnable && !this.isDeliverModeOnlyPacket) {
            this.$message.warning('请选择抓拍模式')
            return false
          }
          if (this.taskForm.definedTimeEnable && this.taskForm.executeTimeList.map(item => item.value).some(val => !val) && !this.isDeliverModeOnlyPacket) {
            this.$message.warning('抓拍时间点有空值，请选择')
            return false
          }
          if (this.taskForm.execTime && this.taskForm.intervalEnable && !this.judgeTimeRange() && !this.isDeliverModeOnlyPacket) { // 间隔抓拍按钮开启时判断抓拍时间段
            this.$message.warning('抓拍时间段不能交叉重叠')
            return false
          }
          if (!this.hugeSelectChannel && !this.isSecondFilterAnalysisMode && !this.isExecuteTypeByScene &&!this.isExecuteTypeByPresetName && !this.channelData.length) {//运营助手二次分析DIANA_SECONDARY_FILTER，通道非必选，所以这里直接用isSecondFilterAnalysisMode没问题
            this.$message.warning('请至少选择一个通道')
            return false
          }
          if (this.isArrangeAlgorithm && !this.isDeliverModeOnlyPacket) {
            this.taskForm.scList = this.libraryImageTableSelData // 配置检索比对图库
            if (!this.libraryImageTableSelData.length) {
              this.$message.info('请配置检索比对图库！')
              return false
            }
          }
          let flag = true
          if (!this.isTaskNameCloudOrDCT4 && this.isPlatformModel) { // 设备算法模型，要判断设备的通道是否超出
            for (let i = 0; i < this.channelData.length; i++) {
              if (this.channelData[i].isUnnormalGroupStyle) {
                this.$message.warning('分析通道里还有需要删除的通道，请删除或禁用已添加这些标红通道的其他任务！')
                flag = false
                break
              }
            }
            this.allIsChooseChannel = flag
            if (!this.allIsChooseChannel) {
              return false
            }
          }
          if (['POLLING_VIDEO'].includes(this.taskForm.analysisMode)) { // 判断轮巡视频时，上报间隔不能大于抓图间隔（间隔时长）
            if (this.taskForm.pollingTime < this.taskForm.alertInterval) {
              this.$message.info('上报间隔不能大于抓图间隔')
              return false
            }
          }
          if (this.taskForm.linkageArming.switchFlag) {
            let linkageArmingDetails = this.taskForm.linkageArming.linkageArmingDetails
            let checkFlag = true
            for (let i = 0; i < linkageArmingDetails.length; i++) {
              if (linkageArmingDetails[i].checked && linkageArmingDetails[i].isAllowedFitValue && !linkageArmingDetails[i].value) {
                checkFlag = false
                break
              }
            }
            if (!checkFlag) {
              this.$message.info('请填写联动布防的IO输出！')
              return false
            }
          }
          passflag = true
        } else {
          return false
        }
      })
      return passflag
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
    cleanForm () {
      // this.$refs.taskForm.resetFields()
      this.taskForm = {
        scList: [],
        taskId: '',
        taskName: '',
        modelSource: 'PLATFORM',
        deliverMode: 'DEVICE_TASK',
        algorithmModelId: '', // 算法模型
        algorithmId: '', // 算法版本
        taskType: '',
        taskFreq: 2, // 任务频次 1-日 2-周 3-月
        analysisMode: 'POLLING_SNAP',
        definedTime: '', // 抓拍时间点
        executeTimeList: [{ value: '', label: '' }], // 抓拍时间点前端数据（不用传给后端）
        executeValDateList: [{ value: ['00:00', '23:59'], label: '00:00 - 23:59' }], // 抓拍时间段前端数据（不用传给后端）
        weekDay: '', // 抓图日期
        intervalEnable: false, // 是否间隔执行 0-false 1-true
        definedTimeEnable: false, // 是否执行抓拍时间点 0-false 1-true
        executeValDate: [], // 抓拍时间段-开始时间
        startTime: '', // 抓拍时间段-开始时间
        endTime: '', // 抓拍时间段-结束时间
        captureSpace: 5, // 抓拍时间间隔分钟
        alertInterval: 60, // 实时视频和轮巡视频的上报间隔秒
        pollingTime: 60, // 抓图间隔
        groupInfoList: [],
        postConfidenceThresholdFlag: true, // 置信度是否下发至设备
        alarmRuleOverlay: false, // 报警规则信息叠加功能
        isCustomRuleChannel: false, // 自定义规则通道的配置开关
        isFeedbackAuto: false, // 自动回传功能
        alarmTargetOverlay: false, // 目标框叠加
        isAutoDraw: false, // 是否自动绘制
        leisureAnalysis: false,
        imageComparePersonExclude: false, // 去除特定目标功能
        // confidenceThreshold: 70, // 置信度阈值
        captureQuality: 'CAPTUREBYGEN', // 抓图清晰度
        executeType: 'BYCHANNEL', // 执行类型
        sceneConfig: [], // 选中的场景
        presetNameConfig: [], // 选中的分析预置点名称集合
        storeConfig: [], // 选中的门店
        isSuAutoDeploy: false
      }
      this.channelData = []
      this.tableChannelData = []
      this.selDate = {
        date: [],
        week: [],
        month: []
      }
      this.offlineFlag = false
    },
    back () {
      this.$router.push({
        name: 'inspectionConfig'
      })
    },
    backConfirm () {
      this.$confirm('是否退出编辑？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'question'
      }).then(() => {
        this.back()
      }).catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
  @import './style';
</style>
<style lang="scss">
.page-capture-detail{
  .el-tooltip__popper{
    background: #fff!important;
    max-width: 800px!important;
  }
}
.filter_popover{
  background: #F5F5F5;
  color: rgba(0,0,0,0.70);
  .link_span{
    color: #2080f7;
    cursor: pointer;
  }
}
.self_radio_group{
  .el-radio{
    margin-left:0px!important;
    margin-right: 16px!important;
  }
}
.link_text{
  cursor: pointer;
  color: #2080f7
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
.page-capture-detail{
  .store_config_form_item{
    .el-form-item__description{
      max-height: 100px;
      overflow: auto;
    }
  }
  .time-point{
    display:flex;
    align-items:center;
  }
  .time-point:nth-of-type(1){
    margin-right: 34px!important;
    color:red
  }
  .analysis_channel{
    margin-bottom:10px;
    margin-top:20px
  }
  .analysis_channel_wrap{
    display: flex;
    align-items: center;
    margin-right:60px;
    justify-content: space-between;
  }
  .channel_search_wrap{
    display: flex;
    align-items: center;
    padding-left: 5px;
    margin-bottom: 5px;
    padding-bottom: 5px;
  }
  .analysis_channel_search_select{
      margin-left:5px;
      width:165px;
      .el-input__inner{
        border: 0;
        border-bottom: 1px solid #ccc;
      }
    }
  .confidenceThresholdBlock{
    width:280px;
    .el-input-number--small{
      width:100px
    }
    .el-slider__bar{
      // background-color:#e4e4f1
    }
    .el-slider__runway,.el-slider__button{
      // background-color:#4692FF
    }
    .el-slider__runway.show-input{
      margin-right:120px
    }
    .el-input-number--small .el-input-number__decrease, .el-input-number--small .el-input-number__increase{
      display: inline-block;
      margin-top: 3px
    }
  }
  .isUnnormalStyle {
    background: rgba(255, 221, 221, 1)!important;
  }
  .channel-container{
    margin-left:50px;
    .el-table__expanded-cell{
      padding:0 50px 0 150px
    }
    .el-table__body-wrapper .el-scrollbar__view{
      margin-bottom: 0px
    }
  }
  .page-capture-btn-add {
    i {
      font-size: 15px;
    }
  }
  .capture-detail-scrollbar__wrap{
    .first_step_wrap{
      width:100%;
      display: flex;
      justify-content: center
    }
  }
  .channel-scrollbar__view{
      display: block!important;
      overflow-y: hidden;
    }
  .capture-detail-scrollbar__wrap {
    // height: calc(100VH - 147px);
    height: calc(100VH - 165px);
    width: calc(100vw - 230px);
  }
  .channel-scrollbar__wrap {
    height: 250px;
    overflow-x: hidden;
  }
  .channel-left{
    .el-scrollbar{
      height: 87%!important
    }
  }
  .analysisMode-mod{
    display: flex;
  }
  .capture_wrap{
    width: 750px;
    background: rgba(0, 0, 0, 0.04)!important;
    padding-top: 16px;
    padding-bottom: 1px;
    font-size:12px;
    margin-bottom:20px;
    .el-form-item__content{
      button {
        width: 400px;
        max-width: 400px;
        border-radius: 2px;
        border: 1px dotted rgba(0,0,0,0.20);
      }
    }
  }
   .tip_text{
    color:#999;
    width:850px;
    margin-left:150px;
    margin-bottom: 20px;
    margin-top:-15px
  }
  .checks_wrap{
    background: rgba(0, 0, 0, 0.04);
    padding: 8px 10px 6px 20px;
    width:850px;
    margin-left:150px;
    margin-bottom: 20px;
    margin-top:-10px;
    display: flex;
    align-items: center;
    .check_item{
      display: flex;
      align-items: center;
      .el-checkbox__label{
        display: flex;
        align-items: center;
        .el-input{
          margin-bottom: 1px;
          margin-left: 4px;
        }
      }
    }
  }
}
.input_number_wrap{
  button{
    width: 24px!important;
  }
}
</style>
