<template>
  <div class="set-analysis-rules">
    <div class="content-title">请设置分析规则</div>
    <el-tabs v-if="isArrangeAlgorithm" v-model="currentTabId" class="rule_tab" :before-leave="beforeLeaveAlgorithmTab">
    <!-- <el-tabs v-if="isArrangeAlgorithm" v-model="currentTabId" class="rule_tab" @tab-click="changeaArrangeAlgorithmTab"> -->
      <el-tab-pane v-for="(item,index) in arrangeAlgorithmTabs" :key="index" :label="item.nodeName" :name="item.belongNodeId"></el-tab-pane>
    </el-tabs>
    <div v-if="!isArrangeAlgorithm" style="height: 50px;width:100%"></div>
    <div class="config_rules_area">
      <el-scrollbar wrap-class="demo-scrollbar-wrap">
        <div class="config_self_left">
          <div class="left_wrap">
            <el-alert :title='`已有规则${rulesLength}/16`' type="info" simple show-icon :closable=false class="flex_alert"></el-alert>
            <el-button icon="h-icon-add" @click="addRules" class="add_rules_btn">添加规则</el-button>
            <!-- <div v-show="formValidFlag" v-for="(item,index) in editRulesDataSelf" :key="index"  @click.stop.prevent="showRulesInfo(item, index)" -->
            <div v-show="formValidFlag" v-for="(item,index) in currentEditRulesDataByTab" :key="index"  @click.stop.prevent="showRulesInfo(item, index)"
            :class="{'main_rules_list':true,'active':index===currentRulesIndex,'validFlag':!item.validFlag}">
              <div :class="{'rules_list':true}">
                <div class="rules_list_name">{{(index + 1) + '、' + item.ruleName}}</div>
                <el-button type="iconButton" icon="h-icon-delete" @click.stop.prevent="beforeDelRules(index,item)" class="rules_list_delbtn"></el-button>
              </div>
              <div v-for="(childItem,childIndex) in item.uniteChildRules" :key="childIndex" v-show="item.detectedType==='UNITE_RULE'" class="child_rule">
                {{`${index + 1}.${childIndex + 1}` + '、' + childItem.uniteChildRuleName}}
              </div>
            </div>
            <div v-show="!formValidFlag" class="empty_rulelist">
              <div class="empty-data-img">
                <div style="margin-top: 90px;">暂无规则</div>
                <div style="color: #666666;margin-top:20px;font-size: 14px;">未配置规则的任务不支持事件推送</div>
              </div>
            </div>
          </div>
        </div>
      </el-scrollbar>
      <div class="split_column_line"></div>
      <el-scrollbar wrap-class="config_rules_right" class="config_self_right">
        <div v-show="formValidFlag">
          <div v-show="!isCloudType">
            <div class="rules-detail-sub-tilte">规则启用</div>
            <el-switch v-model="rulesFormData.valid" style="margin-bottom: 24px;"></el-switch>
          </div>
          <div>
            <div class="rules-detail-sub-tilte">规则类型</div>
            <div class="property_div_noBg">
              <el-radio-group v-model="rulesFormData.detectedType" @change="changeRuleType">
                <el-radio v-for="(item,index) in ruleTypeList" :key="index" v-show="item.enable" :label="item.id" 
                  :disabled="!isAdd&&!isTaskNameCloudOrDCT4&&(rulesFormData.ruleId.length>0)">{{item.labelName}}</el-radio>
              </el-radio-group>
            </div>
          </div>
          <el-form ref="rulesForm" :model="rulesFormData" :rules="rules" label-width="150px" :label-position="rulesFormData.detectedType==='UNITE_RULE'?'top':'right'">
            <div v-show="rulesFormData.detectedType!=='UNITE_RULE'">
              <div class="rules-detail-sub-tilte">规则详情</div>
              <div class="property_div rules-detail-basic-config">
                <el-form-item label="规则名称" prop="ruleName" :required-right="false">
                  <el-input v-model="rulesFormData.ruleName" placeholder="请输入规则名称" :maxlength="16" style="width: 510px;" clearable></el-input>
                </el-form-item>
                <el-form-item label="检测对象" :required-right="false" prop="targetObjLabelLineId" 
                  v-if="['DETECT', 'COMBINED','ARRANGE','ARRANGE_DETECT', 'ARRANGE_COMBINED', 'SEMANTIC_SEG'].includes(algorithmVersionType)&&!['ALL_RULE_DETECT','CLOUD_ALL_RULE_DETECT'].includes(rulesFormData.detectedType)">
                  <el-select v-model="rulesFormData.targetObjLabelLineId" placeholder="检测对象" :style="{'width': showConfidenceThresholdDom ? '360px' : '510px'}" filterable @change="changeTargetObjLabelLineId">
                    <el-option v-for="(item,index) in detectionObjectList" :key="index" :label="item.labelName" :value="item.targetObjLabelLineId">
                    </el-option>
                  </el-select>
                  <div class="confidenceThreshold_wrap" v-show="showConfidenceThresholdDom">
                    <confidenceThresholdDom></confidenceThresholdDom>
                    <el-input-number v-model="rulesFormData.confidenceThreshold" :min="10" :max="100" class="confidence_input" :key="inputNumberKey" @blur="() => {inputNumberKey = Math.random()}"></el-input-number>
                  </div>
                </el-form-item>
              </div>
              <div v-if="(propertyList.length > 0)&&!['ALL_RULE_DETECT','CLOUD_ALL_RULE_DETECT'].includes(rulesFormData.detectedType)">
                <div class="rules-detail-sub-tilte" style="margin-top: 16px;">对象属性</div>
                <div class="property_div">
                  <el-form-item v-for="(parentVal,pindex) in propertyList" :key="pindex" :label="parentVal.attrName" label-width="110px" v-if="propertyEnables[parentVal.attrType]">
                    <el-select v-model="propertyIds[parentVal.attrType]" placeholder="请选择属性" :style="{'width': showConfidenceThresholdDom ? '300px' : '440px'}" @change="changeSelectpro()" :disabled="!propertyEnables[parentVal.attrType].attrTypeEnable">
                      <el-option v-for="(item,index) in parentVal.attrValues" :key="index" :label="item.propName" :value="item.propLabelLineId" @click.native="changeProperty()">
                      </el-option>
                    </el-select>
                    <el-switch @change="changeState(parentVal,pindex)" v-model="propertyEnables[parentVal.attrType].attrTypeEnable" style="margin-left:15px"></el-switch>
                    <div class="confidenceThreshold_wrap" v-show="showConfidenceThresholdDom">
                      <confidenceThresholdDom></confidenceThresholdDom>
                      <el-input-number v-model="propertyEnables[parentVal.attrType].confidenceThreshold" :min="10" :max="100" class="confidence_input" :disabled="!propertyEnables[parentVal.attrType].attrTypeEnable" :key="inputNumberKey" @blur="() => {inputNumberKey = Math.random()}"></el-input-number>
                    </div>
                  </el-form-item>
                </div>
              </div>
              <div @click="showCollapse" class="advance_params" v-show="!['CLOUD_ALL_RULE_DETECT'].includes(rulesFormData.detectedType)">
                <span>高级参数</span><i style="margin-left:10px" :class="!showCollapseFlag ? 'h-icon-angle_down' : 'h-icon-angle_up'"></i>
              </div>
              <el-collapse-transition v-if="showCollapseFlag">
                <div class="advance_wrap">
                  <!-- 工装编排算法评分 -->
                  <div v-if="rulesFormData.targetObjLabelLineId && isArrangeAlgorithmScore && ['NORMAL_RULE'].includes(rulesFormData.detectedType)">
                    <el-form-item label="评分过滤" prop="scoreFilter" style="margin-bottom: 4px;">
                      <el-switch v-model="rulesFormData.scoreFilter.scoreFilterParamValid"></el-switch>
                    </el-form-item>
                    <div class="property_div" style="padding-left: 80px;padding-top: 6px;" v-show="rulesFormData.scoreFilter.scoreFilterParamValid">
                      <div v-for="(item,index) in scoreFilterInfo" :key="index" class="score_wrap">
                        <el-form-item label="" prop="" style="margin-bottom: 0px;" class="score_checkbox">
                          <el-checkbox v-model="item.defaultValid"></el-checkbox>
                          <span style="margin-left: 4px;">{{item.label}}</span>
                          <el-tooltip placement="top" :content="item.explain"><i class="h-icon-help" style="font-size: 22px;"></i></el-tooltip>
                          <el-slider style="width: 220px;margin-left: 16px;" v-model="item.defaultValue" show-input></el-slider>
                        </el-form-item>
                      </div>
                      <div class="error_tips" v-show="scoreFilterInfo.every(s => !s.defaultValid)" style="padding-left: 4px;">请勾选评分过滤项</div>
                    </div>
                  </div>
                  <el-form-item label="置信度阈值" prop="confidenceThreshold" v-show="!isCloudType">
                    <el-slider v-model="rulesFormData.confidenceThreshold" :min="10" :max="99" show-input style="width: 280px;"></el-slider>
                    <div style="margin-top: -10px;" class="rules_tips_text">可选范围是10-99</div>
                  </el-form-item>
                  <el-form-item label="持续时间" prop="duration" v-if="['AREA_TARGET_DETECT','CLASSIFY_TARGET_DETECT'].includes(rulesFormData.detectedType)">
                    <el-input-number v-model="rulesFormData.duration" style="width: 170px;" type="number" :min=0 :max=1800 :key="inputNumberKey" @blur="() => {inputNumberKey = Math.random()}"></el-input-number><span class="unit">秒</span>
                    <div class="rules_tips_text">可选范围是0-1800秒</div>
                  </el-form-item>
                  <el-form-item label="持续灵敏度" v-show="['AREA_TARGET_DETECT'].includes(rulesFormData.detectedType)" prop="durationSensitive">
                    <el-input-number v-model="rulesFormData.durationSensitive" :min=0 :max=100 style="width: 170px;" :key="inputNumberKey" @blur="() => {inputNumberKey = Math.random()}"></el-input-number>
                    <div class="rules_tips_text">可选范围是0-100</div>
                  </el-form-item>
                  <el-form-item label="尺寸过滤配置" v-show="!isCloudType" style="margin-bottom:14px;">
                    <el-switch v-model="rulesFormData.sizeFilter.sizeFilterValid"></el-switch>
                  </el-form-item>
                  <div class="property_div" v-if="(rulesFormData.sizeFilter.sizeFilterValid)" style="margin-bottom: 12px">
                    <div class="rules_form_sizeFilter">
                      <el-form-item label="最小宽" prop="sizeFilter.minWidth" style="margin-bottom: 12px">
                        <el-input-number v-model="rulesFormData.sizeFilter.minWidth" :precision="3" :step="0.1" :min=0.001 :max=1 style="width: 150px;" :key="inputNumberKey" @blur="() => {inputNumberKey = Math.random()}" @change="changeSizeFilterWidth"></el-input-number>
                      </el-form-item>
                      <el-form-item label="最大宽" prop="sizeFilter.maxWidth" style="margin-bottom: 12px">
                        <el-input-number v-model="rulesFormData.sizeFilter.maxWidth" :precision="3" :step="0.1" :min=0.001 :max=1 style="width: 150px;" :key="inputNumberKey" @blur="() => {inputNumberKey = Math.random()}" @change="changeSizeFilterWidth"></el-input-number>
                      </el-form-item>
                      <el-form-item label="最小高" prop="sizeFilter.minHeight">
                        <el-input-number v-model="rulesFormData.sizeFilter.minHeight" :precision="3" :step="0.1" :min=0.001 :max=1 style="width: 150px;" :key="inputNumberKey" @blur="() => {inputNumberKey = Math.random()}" @change="changeSizeFilterHeight"></el-input-number>
                      </el-form-item>
                      <el-form-item label="最大高" prop="sizeFilter.maxHeight">
                        <el-input-number v-model="rulesFormData.sizeFilter.maxHeight" :precision="3" :step="0.1" :min=0.001 :max=1 style="width: 150px;" :key="inputNumberKey" @blur="() => {inputNumberKey = Math.random()}" @change="changeSizeFilterHeight"></el-input-number>
                      </el-form-item>
                    </div>
                  </div>
                  <el-form-item label="数量配置"  v-if="['AREA_TARGET_DETECT'].includes(rulesFormData.detectedType)" style="margin-bottom:10px;">
                    <el-switch v-model="rulesFormData.numberConditionValid" @change="changeNumberConditionValid"></el-switch>
                  </el-form-item>
                  <div class="property_div" v-if="(rulesFormData.numberConditionValid)&&!(['NORMAL_RULE'].includes(rulesFormData.detectedType)&&algorithmVersionType==='SEMANTIC_SEG')">
                    <el-form-item label="范围选择" class="number_judge_condition_select">
                      <el-select v-model="rulesFormData.numberJudgeCondition" style="width: 430px;" @change="changeNumberJudgeCondition">
                        <el-option label="小于等于最小值" :value="1"></el-option>
                        <el-option label="大于等于最大值" :value="2"></el-option>
                        <el-option label="大于最小值且小于最大值" :value="3"></el-option>
                        <el-option label="不在最小值和最大值范围内" :value="4"></el-option>
                      </el-select>
                    </el-form-item>
                    <div class="rules_form_time" v-if="[1,2,3,4].includes(rulesFormData.numberJudgeCondition)">
                      <el-form-item label="最小值" prop="minTargetNum" v-if="[1,3,4].includes(rulesFormData.numberJudgeCondition)">
                        <el-input-number v-model="rulesFormData.minTargetNum" style="width: 160px; margin-right:18px" :min= 0 :controls="false" :key="inputNumberKey" @blur="() => {inputNumberKey = Math.random()}"></el-input-number>
                      </el-form-item>
                      <el-form-item label="最大值" prop="maxTargetNum" v-if="[2,3,4].includes(rulesFormData.numberJudgeCondition)">
                        <el-input-number v-model="rulesFormData.maxTargetNum" style="width: 160px;" :min= 0 :controls="false" :key="inputNumberKey" @blur="() => {inputNumberKey = Math.random()}"></el-input-number>
                      </el-form-item>
                    </div>
                  </div>
                  <el-form-item label="所有对象" v-if="['AREA_TARGET_DETECT'].includes(rulesFormData.detectedType)" style="margin-top:16px;">
                    <el-switch v-model="rulesFormData.outOfPolygonDisplay"></el-switch><span style="margin-left: 10px;color:#999;font-size:12px;">开启后展示画面中所有的检测对象，不开启时仅展示符合规则的对象</span>
                  </el-form-item>
                  <el-form-item label="报警间隔" v-if="['AREA_TARGET_DETECT','CLASSIFY_TARGET_DETECT','LINE_TARGET_DETECT','ALL_RULE_DETECT'].includes(rulesFormData.detectedType)" prop="triggerInterval">
                    <el-input-number v-model="rulesFormData.triggerInterval" :min=0 :max=1800 style="width: 170px;" :key="inputNumberKey" @blur="() => {inputNumberKey = Math.random()}"></el-input-number><span class="unit">秒</span>
                    <div class="rules_tips_text">可选范围是0-1800秒</div>
                  </el-form-item>
                  <el-form-item label="最大报警次数" v-if="['AREA_TARGET_DETECT','LINE_TARGET_DETECT','CLASSIFY_TARGET_DETECT'].includes(rulesFormData.detectedType)" prop="maxTriggerValid" >
                    <el-switch v-model="rulesFormData.maxTriggerValid" :active-value="1" :inactive-value="0"></el-switch>
                  </el-form-item>
                  <el-form-item label="" prop="maxTriggerTimes" v-if="['AREA_TARGET_DETECT','LINE_TARGET_DETECT','CLASSIFY_TARGET_DETECT'].includes(rulesFormData.detectedType) && rulesFormData.maxTriggerValid" style="margin-top: -10px;">
                    <el-input-number v-model="rulesFormData.maxTriggerTimes" style="width: 170px;" :min=1 :max=100 :key="inputNumberKey" @blur="() => {inputNumberKey = Math.random()}"></el-input-number><span class="unit">次</span>
                    <div class="rules_tips_text" style="height: 22px;">可选范围是1-100次</div>
                  </el-form-item>
                  <el-form-item label="自定义信息码流叠加" v-show="!['CLOUD_ALL_RULE_DETECT','NORMAL_RULE','LINE_TARGET_STATISTIC','CLASSIFY_TARGET_DETECT','AREA_TARGET_STATISTIC'].includes(rulesFormData.detectedType)" prop="customInfoEnabled">
                    <el-switch v-model="rulesFormData.customInfoEnabled"></el-switch>
                  </el-form-item>
                  <div class="property_div" v-show="rulesFormData.customInfoEnabled" style="margin-bottom: 12px">
                    <el-form-item label=" " prop="customInfo" style="margin-bottom: 12px" :rules="[{ validator: validatorZdyxxmldjText(), trigger: 'change'}]">
                      <el-input v-model="rulesFormData.customInfo" style="width:430px" :maxlength="64" clearable></el-input>
                    </el-form-item>
                  </div>
                  <div v-show="showRelationAnalysisConfig">
                    <el-form-item label="关联子目标使能" v-show="!['CLOUD_ALL_RULE_DETECT','NORMAL_RULE','ALL_RULE_DETECT','CLASSIFY_TARGET_DETECT'].includes(rulesFormData.detectedType)" prop="relationAnalysisValid">
                      <el-switch v-model="rulesFormData.relationAnalysisValid"></el-switch>
                    </el-form-item>
                    <div class="property_div" v-show="rulesFormData.relationAnalysisValid && !['CLOUD_ALL_RULE_DETECT','NORMAL_RULE','ALL_RULE_DETECT','CLASSIFY_TARGET_DETECT'].includes(rulesFormData.detectedType)" style="margin-bottom: 12px">
                      <el-form-item label="关联报警" prop="relationAnalysisType" style="margin-bottom: 12px;">
                        <div slot="introduction">
                          主目标独立报警：检测到主目标后触发报警，如有子目标关联成功，报警内容会携带子目标信息；
                          <br />
                          主目标有关联子目标报警：检测到主目标且子目标关联成功时，触发报警，报警内容携带子目标信息；
                          <br />
                          主目标无关联子目标报警：检测到主目标,但无子目标或子目标关联失败时，触发报警，报警内容不携带子目标信息；
                        </div>
                        <el-select v-model="rulesFormData.relationAnalysisType" style="width: 430px;">
                          <el-option label="主目标独立报警" :value="1"></el-option>
                          <el-option label="主目标有关联子目标报警" :value="2"></el-option>
                          <el-option label="主目标无关联子目标报警" :value="3"></el-option>
                        </el-select>
                      </el-form-item>
                      <!-- 检测对象只有一个时，主子关联的子目标里因为子对象不能和该主对象相同，所以子规则配置不显示 -->
                      <associatedAlarmTabs ref="associatedAlarmRef" :detectedType="rulesFormData.detectedType"></associatedAlarmTabs>
                    </div>
                  </div>
                  <el-form-item label="灵敏度" v-if="['AREA_TARGET_DETECT','LINE_TARGET_DETECT','AREA_TARGET_STATISTIC','NORMAL_RULE', 'CLOUD_ALL_RULE_DETECT'].includes(rulesFormData.detectedType)" prop="sensitivity">
                    <el-input-number v-model="rulesFormData.sensitivity" :min=0 :max=100 style="width: 170px;" :key="inputNumberKey" @blur="() => {inputNumberKey = Math.random()}"></el-input-number>
                    <div class="rules_tips_text">可选范围是0-100</div>
                  </el-form-item>
                  <el-form-item label="面积比过滤" v-if="['NORMAL_RULE'].includes(rulesFormData.detectedType)&&algorithmVersionType==='SEMANTIC_SEG'" prop="areaRatio">
                    <el-input-number v-model="rulesFormData.areaRatio" :min=0 :max=100 style="width: 170px;" :key="inputNumberKey" @blur="() => {inputNumberKey = Math.random()}"></el-input-number>
                    <div class="rules_tips_text">可选范围是0-100</div>
                  </el-form-item>
                  <el-form-item label="图库过滤模式" v-if="isArrangeAlgorithm&&['NORMAL_RULE'].includes(this.rulesFormData.detectedType)" prop="cmpFilterSwitch"
                    style="margin-bottom:10px;" required  :required-right="false">
                    <el-select v-model="rulesFormData.cmpFilterSwitch" style="width: 430px;">
                      <el-option label="未配置" :value="-1" :disabled="true"></el-option>
                      <el-option label="符合" :value="1"></el-option>
                      <el-option label="不符合" :value="0"></el-option>
                    </el-select>
                    <div class="rules_tips_text" v-show="rulesFormData.cmpFilterSwitch!==-1">{{ rulesFormData.cmpFilterSwitch === 1 ? '识别的目标成功匹配到图库，且目标图片相似度高于设定的阈值' : '识别的目标未能匹配到任一图库，或匹配的底图相似度低于设定的阈值' }}</div>
                  </el-form-item>
                  <el-form-item label="相似度阈值" v-show="isArrangeAlgorithm&&['NORMAL_RULE'].includes(this.rulesFormData.detectedType)">
                    <el-input-number v-model="rulesFormData.cmpSimilarity" :min=0 :max=100 style="width: 170px;" :key="inputNumberKey" @blur="() => {inputNumberKey = Math.random()}"></el-input-number>
                    <div class="rules_tips_text">相似度越高说明图片越相似于底图库中的图片，可选范围是0-100</div>
                  </el-form-item>
                  <el-form-item label="位移过滤使能" v-if="['AREA_TARGET_DETECT','LINE_TARGET_DETECT','ALL_RULE_DETECT','AREA_TARGET_STATISTIC'].includes(rulesFormData.detectedType)" prop="isStillFilterEnable">
                    <el-switch v-model="rulesFormData.isStillFilterEnable"></el-switch>
                  </el-form-item>
                  <el-form-item label="位移过滤类型" v-if="['AREA_TARGET_DETECT','LINE_TARGET_DETECT','ALL_RULE_DETECT','AREA_TARGET_STATISTIC'].includes(rulesFormData.detectedType)&&rulesFormData.isStillFilterEnable" prop="stillFilterMode">
                    <el-radio-group v-model="rulesFormData.stillFilterMode" style="margin-bottom: 4px;">
                      <el-radio label="0">静止目标过滤</el-radio>
                      <el-radio label="1">运动目标过滤</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item label="过滤灵敏度" v-if="['AREA_TARGET_DETECT','LINE_TARGET_DETECT','ALL_RULE_DETECT','AREA_TARGET_STATISTIC'].includes(rulesFormData.detectedType)&&rulesFormData.isStillFilterEnable" prop="stillFilterSensitive">
                    <el-input-number v-model="rulesFormData.stillFilterSensitive" :min=1 :max=100 style="width: 170px;" :key="inputNumberKey" @blur="() => {inputNumberKey = Math.random()}"></el-input-number>
                    <div class="rules_tips_text">可选范围是1-100</div>
                  </el-form-item>
                  <el-form-item label="计数模式" v-if="['LINE_TARGET_STATISTIC'].includes(rulesFormData.detectedType)" prop="countingModeEnum">
                    <el-radio-group v-model="rulesFormData.countingModeEnum">
                      <el-radio label="FIXED_COUNTING">固定间隔统计</el-radio>
                      <el-radio label="BATCH_COUNTING">批次计数</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <!-- 统计间隔/上报时间间隔：countInterval是区域统计，或跨线统计并且计数模式是固定间隔统计，才显示 -->
                  <el-form-item :label="['LINE_TARGET_STATISTIC'].includes(rulesFormData.detectedType)?'统计间隔':'上报时间间隔'" prop="countInterval"
                  v-if="['AREA_TARGET_STATISTIC'].includes(rulesFormData.detectedType)||(['LINE_TARGET_STATISTIC'].includes(rulesFormData.detectedType)&&['FIXED_COUNTING'].includes(rulesFormData.countingModeEnum))" >
                    <el-input-number v-model="rulesFormData.countInterval" :min=1 :max=1800 style="width: 170px;" :key="inputNumberKey" @blur="() => {inputNumberKey = Math.random()}"></el-input-number><span class="unit">秒</span>
                    <div class="rules_tips_text">可选范围是1-1800秒</div>
                  </el-form-item>
                  <el-form-item label="批次计数" prop="timeInterval"
                  v-if="['LINE_TARGET_STATISTIC'].includes(rulesFormData.detectedType)&&['BATCH_COUNTING'].includes(rulesFormData.countingModeEnum)" >
                    <el-input-number v-model="rulesFormData.timeInterval" :min=1 :max=60 style="width: 170px;" :key="inputNumberKey" @blur="() => {inputNumberKey = Math.random()}"></el-input-number><span class="unit">分钟</span>
                    <div class="rules_tips_text">可选范围是1-60分钟</div>
                  </el-form-item>
                  <el-form-item label="启用OSD叠加" v-if="['AREA_TARGET_STATISTIC','LINE_TARGET_STATISTIC'].includes(rulesFormData.detectedType)" prop="isOSDEnable">
                    <el-switch v-model="rulesFormData.isOSDEnable"></el-switch>
                  </el-form-item>
                  <div v-if="!isCloudType">
                    <div class="rules-detail-sub-tilte" style="padding-left:12px">人脸比对配置</div>
                    <div class="property_div rules-detail-basic-config face-detail-basic-config">
                      <el-form-item label="模式" prop="faceContrastType" :required-right="false" style="margin-bottom: 10px;">
                        <el-radio-group v-model="rulesFormData.faceContrastType">
                          <el-radio label="COMPARE">人脸比对</el-radio>
                          <el-radio label="STRANGER">陌生人模式</el-radio>
                        </el-radio-group>
                      </el-form-item>
                      <el-form-item label="启用" prop="faceTrigger" style="margin-bottom: 10px;">
                        <el-switch v-model="rulesFormData.faceTrigger"></el-switch>
                      </el-form-item>
                      <div v-if="rulesFormData.faceTrigger">
                        <el-form-item label="人脸信息上传配置" prop="faceUpload" v-show="rulesFormData.faceContrastType==='COMPARE'" style="margin-bottom: 10px;">
                          <el-checkbox-group v-model="rulesFormData.faceUpload">
                            <el-checkbox label="success">上传比对成功信息</el-checkbox>
                            <el-checkbox label="failed">上传比对失败信息</el-checkbox>
                          </el-checkbox-group>
                        </el-form-item>
                        <el-form-item label="人脸库" class="faceLib_form_item">
                          <el-table :data="rulesFormData.faceLib" style="width:500px">
                            <el-table-column prop="faceLibId" :ishtml="true"  label="<span>ID<i style='margin-left: 4px;color: #fa3239'>*</i></span>" width="150">
                              <template slot-scope="scope">
                                <h-add-form-item-row :prop="`faceLib[${scope.$index}].faceLibId`" :rules="[{ required: true, message: '请输入ID' }]">
                                  <el-input v-model="scope.row.faceLibId" :maxlength="32" clearable></el-input>
                                </h-add-form-item-row>
                              </template>
                            </el-table-column>
                            <el-table-column prop="faceLibName" :ishtml="true"  label="<span>名称<i style='margin-left: 4px;color: #fa3239'>*</i></span>"  width="150">
                              <template slot-scope="scope">
                                <h-add-form-item-row :prop="`faceLib[${scope.$index}].faceLibName`" :rules="[{ required: true, message: '请输入名称' }]">
                                  <el-input v-model="scope.row.faceLibName" :maxlength="32" clearable></el-input>
                                </h-add-form-item-row>
                              </template>
                            </el-table-column>
                            <el-table-column prop="faceLibThreshold" label="相似度" width="120">
                              <template slot-scope="scope">
                                <h-add-form-item-row>
                                  <div class="faceLibThreshold_wrap">
                                    <el-slider v-model="scope.row.faceLibThreshold" :min="1" :max="99" style="width:50px;margin-left:4px"></el-slider>
                                    <div style="margin-left:8px">{{ scope.row.faceLibThreshold }}</div>
                                  </div>
                                </h-add-form-item-row>
                              </template>
                            </el-table-column>
                            <el-table-column prop="date" label="操作"  width="180">
                              <template slot-scope="scope">
                                <el-button slot="operate" icon="h-icon-delete" @click="delFaceLib(scope.$index)"/>
                              </template>
                            </el-table-column>
                          </el-table>
                          <div class="btn-wrapper" style="border: 1px solid rgba(0,0,0,0.08);padding: 4px;margin-top: -1px;">
                            <h-add-form-item-btn icon="h-icon-add" @click="addFaceLib" :totalNum="5" :currentNum="rulesFormData.faceLib.length">添加</h-add-form-item-btn>
                          </div>
                        </el-form-item>
                      </div>
                    </div>
                  </div>
                  <div style="margin-bottom: 12px;">
                    <div class="rules-detail-sub-tilte" style="padding-left:12px;display: flex;align-items: center">
                      通道运行状态检测
                      <el-tooltip popper-class="dark_filter_tooltip" placement="top" content="通道运行状态展示了系统通过历史消息检测AI识别的异常情况，目前包含：预置点发生变更、通道长时间无结果、目标与区域交叠过多、正常">
                        <i class="h-icon-help" style="font-size: 20px;cursor: pointer;"></i>
                      </el-tooltip>
                    </div>
                    <div class="channal_status__check_wrap">
                      <div class="c_s_c_w_card c_s_c_w_card_preset">
                        <img src="@/assets/img/common/yuzhidian.png">
                        <div class="card_right">
                          <el-form-item class="switch_div"><el-switch v-model="rulesFormData.presetDetectionSwitch"></el-switch></el-form-item>
                          <div class="card_title">预置点变更检测</div>
                          <div class="card_des">感知预置点变更操作，并提示角度可能偏移的风险</div>
                        </div>
                      </div>
                      <div class="c_s_c_w_card c_s_c_w_card_time">
                        <img src="@/assets/img/common/shijian.png">
                        <div class="card_right">
                          <el-form-item class="switch_div"><el-switch v-model="rulesFormData.channelResultSwitch"></el-switch></el-form-item>
                          <div class="card_title">通道长时间无结果检测</div>
                          <div class="card_des" style="margin-bottom:16px">自动检测过去N天的通道和预置点状态，确保监控系统始终运行在最佳状态</div>
                          <el-form-item v-show="rulesFormData.channelResultSwitch" class="card_config">
                              无结果告警阈值<el-input-number v-model="rulesFormData.channelDetectTime" :min=1 :max=30 style="width:64px;margin-left:16px;margin-right:6px" :key="inputNumberKey" @blur="() => {inputNumberKey = Math.random()}"></el-input-number>天
                          </el-form-item>
                        </div>
                      </div>
                      <div class="c_s_c_w_card c_s_c_w_card_cross">
                        <div style="display:flex;">
                          <img src="@/assets/img/common/jiaodie.png">
                          <div class="card_right">
                            <el-form-item class="switch_div"><el-switch v-model="rulesFormData.overlapSwitch"></el-switch></el-form-item>
                            <div class="card_title">目标与区域交叠过多检测</div>
                            <div class="card_des" style="margin-bottom:16px">根据识别目标与多边形区域框的交叠比例，判断目标是否处在区域边缘位置，以此判断识别区域是否绘制正确。</div>
                          </div>
                        </div>
                        <div v-show="rulesFormData.overlapSwitch" class="card_bot">
                          <div class="bot_left">
                            <div :style="newBgStyle" class="demo_img"></div>
                            <img src="@/assets/img/common/tuli.png" style="width:160px;height:44px;margin:4px 0 0px">
                          </div>
                          <div class="bot_right" style="width:180px;position: relative;">
                            <div style="display:flex;align-items:center">交叠比例<el-tooltip popper-class="dark_filter_tooltip" placement="top" content="参考示意图，该比例指识别区域被识别目标覆盖住的边长的占比"><i class="h-icon-help" style="font-size: 20px;cursor: pointer;"></i></el-tooltip></div>
                            <el-slider v-model="rulesFormData.overlapRatio" @change="changeOverlapRatio" :min="1" :max="10" :show-tooltip="false" show-input class="cross_slider precision_cross_slider"></el-slider>
                            <el-tooltip popper-class="filter_white_tooltip" placement="top" content="可输入1~10的数字">
                              <div class="cross_slider_self_input" style="position: absolute;color: rgba(0,0,0,0.4);z-index: 99;background: #fff;" :style="crossStyle">0%</div>
                            </el-tooltip>
                            <div style="display:flex;align-items:center">连续次数<el-tooltip popper-class="dark_filter_tooltip" placement="top" content="某个通道，连续出现满足覆盖条件的次数； 例如：通道A连续5次都出现了识别区域被识别目标覆盖住30%的周长，此时就会触发告警"><i class="h-icon-help" style="font-size: 20px;cursor: pointer;"></i></el-tooltip></div>
                            <el-slider v-model="rulesFormData.overlapNum" :min="1" :max="100" :show-tooltip="false" show-input class="cross_slider"></el-slider>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </el-collapse-transition>
            </div>
            <!-- 组合规则 -->
            <div v-show="rulesFormData.detectedType==='UNITE_RULE'" class="unit_form_wrap">
              <div class="unit_flex_wrap">
                <el-form-item label="规则名称" prop="ruleName" :required-right="false">
                  <el-input v-model="rulesFormData.ruleName" placeholder="请输入规则名称" :maxlength="16" clearable></el-input>
                </el-form-item>
                <el-form-item label="规则模式" prop="uniteType" >
                  <el-radio-group v-model="rulesFormData.uniteType">
                    <el-radio label="THEN">依次满足</el-radio>
                    <el-radio label="AND">同时满足</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="报警间隔" prop="triggerInterval">
                  <div class="has_unit_form_item">
                    <el-input-number v-model="rulesFormData.triggerInterval" :min=0 :max=1800 style="width:100%" :key="inputNumberKey" @blur="() => {inputNumberKey = Math.random()}"></el-input-number><span class="unit">秒</span>
                  </div>
                  <div class="rules_tips_text">可选范围是0-1800秒</div>
                </el-form-item>
                <el-form-item label="最大报警次数" prop="maxTriggerValid" >
                  <div style="display: flex;">
                    <el-switch v-model="rulesFormData.maxTriggerValid" :active-value="1" :inactive-value="0" style="margin-right: 12px;padding-top:6px"></el-switch>
                    <div v-show="rulesFormData.maxTriggerValid">
                      <el-input-number v-model="rulesFormData.maxTriggerTimes" :min=1 :max=100 style="width:120px;" :key="inputNumberKey" @blur="() => {inputNumberKey = Math.random()}"></el-input-number><span class="unit">次</span>
                      <div class="rules_tips_text" style="height: 26px;">可选范围是1-100次</div>
                    </div>
                  </div>
                  <div style="height: 36px;width: 20%;" v-if="!rulesFormData.maxTriggerValid"></div>
                </el-form-item>
                <!-- <el-form-item label="" prop="maxTriggerTimes">
                  <div class="has_unit_form_item">
                    <el-input-number v-model="rulesFormData.maxTriggerTimes" :min=1 :max=100 style="width:100%" :key="inputNumberKey" @blur="() => {inputNumberKey = Math.random()}"></el-input-number><span class="unit">次</span>
                  </div>
                  <div class="rules_tips_text">可选范围是1-100次</div>
                </el-form-item> -->
              </div>
            </div>
            <el-form-item label="图片来源" v-if="taskForm.analysisMode === 'SECONDARY_FILTER'" :required-right="false" prop="secondaryFilterCloudRuleInfoList">
              <chooseAnalysisRules :width="430" ref="chooseAnalysisRules" :chooseFilterList="rulesFormData.secondaryFilterCloudRuleInfoList"
              @getValues="getSecondaryFilterCloudRuleInfoList" :currentTaskId="taskForm.taskId"></chooseAnalysisRules>
            </el-form-item>
            <el-form-item label="消息推送" prop="msgPush" :required-right="false" v-show="taskForm.analysisMode !== 'DIANA_SECONDARY_FILTER'" label-width="150px">
              <el-checkbox-group v-model="rulesFormData.msgPush">
                <el-checkbox v-for="(item,index) in msgPushList" :key="index" :label="item.id" @change="changeMsgPush(item)">{{item.name}}</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <div v-show="lazyShow">
              <el-form-item label="所选通道" :required-right="false" required v-show="showConfigRuleChannels">
                <!-- <el-button @click="configRuleChannels" :plain="true" style="padding: 0 4px 0 30px" :class="{'emptyChannel':!rulesFormData.channelIdList.length}">
                  <span style="position: absolute;top:-4px;left:8px;font-size: 24px;">+</span>
                  {{`已选通道（${rulesFormData.channelIdList.length || 0}）`}}
                </el-button> -->
                <ymIconBtn @click="configRuleChannels" :validateErr="!rulesFormData.channelIdList.length" :btnText="`已选通道（${rulesFormData.channelIdList.length || 0}）`">
                  <!-- <span slot="selfIcon" class="h-icon-activate" style="font-size:22px"></span> -->
                </ymIconBtn>
              </el-form-item>
            </div>
          </el-form>
          <el-tabs v-model="editableTabsValue" type="border-card" editable @edit="handleTabsEdit" v-show="rulesFormData.detectedType==='UNITE_RULE'" style="width:700px">
            <el-tab-pane v-for="(item, index) in editableTabs" :key="index" :label="item.title" :name="item.name">
              <el-form :ref="`tabRulesForm${index}`" :model="rulesFormData.uniteChildRules[index]" :rules="tabFormRules">
                <div class="rules-detail-sub-tilte">规则详情</div>
                <div class="property_div tab-rules-detail-basic-config">
                  <el-form-item :label="`子规则${index+1}名称`" prop="uniteChildRuleName" :required-right="false">
                    <!-- 等组合规则支持置信度了再调宽度 430px => 510px -->
                    <el-input v-model="rulesFormData.uniteChildRules[index].uniteChildRuleName" placeholder="请输入子规则名称" :maxlength="16" style="width: 430px;" clearable></el-input>
                  </el-form-item>
                  <!-- <el-form-item label="检测对象" :required-right="false" prop="targetObjLabelLineId"> -->
                  <el-form-item label="检测对象" v-show="!['CLASSIFY', 'ARRANGE_CLASSIFY'].includes(algorithmVersionType)" :required-right="false" prop="targetObjLabelLineId">
                    <!-- 等组合规则支持置信度了再调宽度 430px => 360px -->
                    <el-select v-model="rulesFormData.uniteChildRules[index].targetObjLabelLineId" placeholder="检测对象" style="width: 430px;" filterable @change="changeTabTargetObjLabelLineId(rulesFormData.uniteChildRules[index], index)">
                      <el-option v-for="(iitem,index) in detectionObjectList" :key="index" :label="iitem.labelName" :value="iitem.targetObjLabelLineId" >
                      </el-option>
                    </el-select>
                    <!-- 等组合规则支持置信度了再调v-show -->
                    <div class="confidenceThreshold_wrap" v-show="false">
                      <confidenceThresholdDom></confidenceThresholdDom>
                      <el-input-number v-model="rulesFormData.uniteChildRules[index].confidenceThreshold" :min="10" :max="100" class="confidence_input" v-show="showConfidenceThresholdDom" :key="inputNumberKey" @blur="() => {inputNumberKey = Math.random()}"></el-input-number>
                    </div>
                  </el-form-item>
                </div>
                <!-- <div v-if="propertyList.length"> -->
                <div v-if="tabDetectionObject[rulesFormData.uniteChildRules[index].targetObjLabelLineId] && tabDetectionObject[rulesFormData.uniteChildRules[index].targetObjLabelLineId].length">
                  <div class="rules-detail-sub-tilte" style="margin-top: 20px;">对象属性</div>
                  <div class="property_div">
                    <el-form-item v-for="(parentVal,pindex) in tabDetectionObject[rulesFormData.uniteChildRules[index].targetObjLabelLineId]" :key="pindex" :label="parentVal.attrName" label-width="150px">
                      <!-- 等组合规则支持置信度了再调宽度 430px => 300px -->
                      <el-select v-model="rulesFormData.uniteChildRules[index].propertyIds[parentVal.attrType]" placeholder="请选择属性" style="width: 360px;" :disabled=!rulesFormData.uniteChildRules[index].propertyEnables[parentVal.attrType].attrTypeEnable>
                        <el-option v-for="(item,iindex) in parentVal.attrValues" :key="iindex" :label="item.propName" :value="item.propLabelLineId" @click.native="changeProperty()">
                        </el-option>
                      </el-select>
                      <el-switch @change="changeTabState()" v-model="rulesFormData.uniteChildRules[index].propertyEnables[parentVal.attrType].attrTypeEnable" style="margin-left:15px"></el-switch>
                      <!-- 等组合规则支持置信度了再调v-show -->
                      <!-- <div class="confidenceThreshold_wrap" v-show="false">
                        <confidenceThresholdDom></confidenceThresholdDom>
                        <el-input-number v-model="rulesFormData.uniteChildRules[index].propertyEnables[parentVal.attrType].confidenceThreshold" :min="10" :max="100" class="confidence_input" v-show="showConfidenceThresholdDom" :key="inputNumberKey" @blur="() => {inputNumberKey = Math.random()}"></el-input-number>
                      </div> -->
                    </el-form-item>
                  </div>
                </div>
                <div @click="changeUniteChildRulesShowCollapseFlag(rulesFormData.uniteChildRules[index].showCollapseFlag,index)" class="advance_params">
                  <span>高级参数</span><i style="margin-left:10px" :class="!rulesFormData.uniteChildRules[index].showCollapseFlag ? 'h-icon-angle_down' : 'h-icon-angle_up'"></i>
                </div>
                <div v-show="rulesFormData.uniteChildRules[index].showCollapseFlag" class="tab-rules-detail-basic-config">
                  <el-form-item label="检测方式">
                    <el-radio-group v-model="rulesFormData.uniteChildRules[index].triggerType">
                      <el-radio :label="1073758210" v-if="['ARRANGE_CLASSIFY'].includes(algorithmVersionType)">区域检测</el-radio>
                      <el-radio :label="1073758209" v-if="!['ARRANGE_CLASSIFY'].includes(algorithmVersionType)">区域检测</el-radio>
                      <el-radio :label="1073758211" v-if="!['ARRANGE_CLASSIFY'].includes(algorithmVersionType)">跨线检测</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item label="置信度阈值" prop="confidenceThreshold" label-width="150px" style="margin-top: -16px;margin-bottom: 12px;">
                    <el-slider v-model="rulesFormData.uniteChildRules[index].confidenceThreshold" :min="10" :max="99" show-input style="width: 280px;"></el-slider>
                    <div style="margin-top: -10px;" class="rules_tips_text">可选范围是10-99</div>
                  </el-form-item>
                  <el-form-item label="持续时间" v-if="[1073758209,1073758210].includes(rulesFormData.uniteChildRules[index].triggerType)" prop="duration" label-width="150px">
                    <el-input-number v-model="rulesFormData.uniteChildRules[index].duration" style="width: 170px;" type="number" :min=0 :max=1800 :key="inputNumberKey" @blur="() => {inputNumberKey = Math.random()}"></el-input-number><span class="unit">秒</span>
                    <div class="rules_tips_text">可选范围是0-1800秒</div>
                  </el-form-item>
                  <el-form-item label="持续灵敏度" v-if="rulesFormData.uniteChildRules[index].triggerType===1073758209" prop="durationSensitive" label-width="150px" style="margin-bottom: 14px;">
                    <el-input-number v-model="rulesFormData.uniteChildRules[index].durationSensitive" :min=0 :max=100 style="width: 170px;" :key="inputNumberKey" @blur="() => {inputNumberKey = Math.random()}"></el-input-number>
                    <div class="rules_tips_text">可选范围是0-100</div>
                  </el-form-item>
                  <el-form-item label="报警间隔" prop="uniteRuleTriggerInterval" label-width="150px" style="margin-bottom: 14px;">
                    <el-input-number v-model="rulesFormData.uniteChildRules[index].uniteRuleTriggerInterval" :min=0 :max=1800 style="width: 170px;" :key="inputNumberKey" @blur="() => {inputNumberKey = Math.random()}"></el-input-number><span class="unit">秒</span>
                    <div class="rules_tips_text">可选范围是0-1800秒</div>
                  </el-form-item>
                  <el-form-item label="最大报警次数" prop="uniteRuleMaxTriggerValid" label-width="150px" style="margin-bottom: 14px;">
                    <el-switch v-model="rulesFormData.uniteChildRules[index].uniteRuleMaxTriggerValid" :active-value="1" :inactive-value="0"></el-switch>
                  </el-form-item>
                  <el-form-item label="" prop="uniteRuleMaxTriggerTimes" label-width="150px" style="margin-bottom: 10px;" v-show="rulesFormData.uniteChildRules[index].uniteRuleMaxTriggerValid">
                    <el-input-number v-model="rulesFormData.uniteChildRules[index].uniteRuleMaxTriggerTimes" :min=1 :max=100 style="width: 170px;" :key="inputNumberKey" @blur="() => {inputNumberKey = Math.random()}"></el-input-number><span class="unit">次</span>
                    <div class="rules_tips_text">可选范围是1-100次</div>
                  </el-form-item>
                  <el-form-item label="尺寸过滤配置" v-if="!isCloudType&&![1073758210].includes(rulesFormData.uniteChildRules[index].triggerType)" style="margin-bottom:10px;">
                    <el-switch v-model="rulesFormData.uniteChildRules[index].sizeFilter.sizeFilterValid"></el-switch>
                  </el-form-item>
                  <div class="property_div" v-if="(rulesFormData.uniteChildRules[index].sizeFilter.sizeFilterValid)" style="margin-bottom: 12px">
                    <div class="rules_form_sizeFilter">
                      <el-form-item label="最小宽" prop="sizeFilter.minWidth" style="margin-bottom: 12px">
                        <el-input-number v-model="rulesFormData.uniteChildRules[index].sizeFilter.minWidth" :precision="3" :step="0.1" :min=0.001 :max=1 style="width: 150px;" :key="inputNumberKey" @blur="() => {inputNumberKey = Math.random()}" @change="changeTabSizeFilterWidth"></el-input-number>
                      </el-form-item>
                      <el-form-item label="最大宽" prop="sizeFilter.maxWidth" style="margin-bottom: 12px">
                        <el-input-number v-model="rulesFormData.uniteChildRules[index].sizeFilter.maxWidth" :precision="3" :step="0.1" :min=0.001 :max=1 style="width: 150px;" :key="inputNumberKey" @blur="() => {inputNumberKey = Math.random()}" @change="changeTabSizeFilterWidth"></el-input-number>
                      </el-form-item>
                      <el-form-item label="最小高" prop="sizeFilter.minHeight">
                        <el-input-number v-model="rulesFormData.uniteChildRules[index].sizeFilter.minHeight" :precision="3" :step="0.1" :min=0.001 :max=1 style="width: 150px;" :key="inputNumberKey" @blur="() => {inputNumberKey = Math.random()}" @change="changeTabSizeFilterHeight"></el-input-number>
                      </el-form-item>
                      <el-form-item label="最大高" prop="sizeFilter.maxHeight">
                        <el-input-number v-model="rulesFormData.uniteChildRules[index].sizeFilter.maxHeight" :precision="3" :step="0.1" :min=0.001 :max=1 style="width: 150px;" :key="inputNumberKey" @blur="() => {inputNumberKey = Math.random()}" @change="changeTabSizeFilterHeight"></el-input-number>
                      </el-form-item>
                    </div>
                  </div>
                  <el-form-item label="数量配置" v-if="[1073758209,1073758210].includes(rulesFormData.uniteChildRules[index].triggerType)" style="margin-bottom:10px">
                    <el-switch v-model="rulesFormData.uniteChildRules[index].numberConditionValid"></el-switch>
                  </el-form-item>
                  <div class="property_div" v-if="rulesFormData.uniteChildRules[index].numberConditionValid">
                    <el-form-item label="范围选择" class="number_judge_condition_select">
                      <el-select v-model="rulesFormData.uniteChildRules[index].numberJudgeCondition" style="width: 430px;"  @change="changeTabNumberJudgeCondition">
                        <el-option label="小于等于最小值" :value = 1></el-option>
                        <el-option label="大于等于最大值" :value = 2></el-option>
                        <el-option label="大于最小值且小于最大值" :value = 3></el-option>
                        <el-option label="不在最小值和最大值范围内" :value = 4></el-option>
                      </el-select>
                    </el-form-item>
                    <div class="rules_form_time">
                      <el-form-item label="最小值" prop="minTargetNum" v-if="[1,3,4].includes(rulesFormData.uniteChildRules[index].numberJudgeCondition)">
                        <el-input-number v-model="rulesFormData.uniteChildRules[index].minTargetNum" @change="changeTabTargetNum" style="width: 150px;" :min=0 :key="inputNumberKey" @blur="() => {inputNumberKey = Math.random()}"></el-input-number>
                      </el-form-item>
                      <el-form-item label="最大值" prop="maxTargetNum" v-if="[2,3,4].includes(rulesFormData.uniteChildRules[index].numberJudgeCondition)">
                        <el-input-number v-model="rulesFormData.uniteChildRules[index].maxTargetNum" @change="changeTabTargetNum" style="width: 150px;" :min=0 :key="inputNumberKey" @blur="() => {inputNumberKey = Math.random()}"></el-input-number>
                      </el-form-item>
                    </div>
                  </div>
                  <el-form-item label="灵敏度" prop="sensitivity" label-width="150px" style="margin-bottom: 14px;">
                    <el-input-number v-model="rulesFormData.uniteChildRules[index].sensitivity" :min=0 :max=100 style="width: 170px;" :key="inputNumberKey" @blur="() => {inputNumberKey = Math.random()}"></el-input-number>
                    <div class="rules_tips_text">可选范围是0-100</div>
                  </el-form-item>
                  <el-form-item label="自定义信息码流叠加" prop="customInfoEnabled" style="margin-bottom:10px">
                    <el-switch v-model="rulesFormData.uniteChildRules[index].customInfoEnabled"></el-switch>
                  </el-form-item>
                  <div class="property_div" v-show="rulesFormData.uniteChildRules[index].customInfoEnabled">
                    <el-form-item label=" " prop="customInfo" :rules="[{ validator: validatorZdyxxmldjText(), trigger: 'change'}]">
                      <el-input v-model="rulesFormData.uniteChildRules[index].customInfo" style="width:430px" :maxlength="64" clearable></el-input>
                    </el-form-item>
                  </div>
                  <div v-show="showRelationAnalysisConfig">
                    <el-form-item label="关联子目标使能" prop="relationAnalysisValid" style="margin-bottom:10px">
                      <el-switch v-model="rulesFormData.uniteChildRules[index].relationAnalysisValid"  @change="changeUniteRelationAnalysisValid(index, rulesFormData.uniteChildRules[index])"></el-switch>
                    </el-form-item>
                    <div class="property_div" v-if="rulesFormData.uniteChildRules[index].relationAnalysisValid">
                      <el-form-item label="关联报警" prop="relationAnalysisType">
                        <div slot="introduction">
                          主目标独立报警：检测到主目标后触发报警，如有子目标关联成功，报警内容会携带子目标信息；
                          <br />
                          主目标有关联子目标报警：检测到主目标且子目标关联成功时，触发报警，报警内容携带子目标信息；
                          <br />
                          主目标无关联子目标报警：检测到主目标,但无子目标或子目标关联失败时，触发报警，报警内容不携带子目标信息；
                        </div>
                        <el-select v-model="rulesFormData.uniteChildRules[index].relationAnalysisType" style="width: 430px;">
                          <el-option label="主目标独立报警" :value="1"></el-option>
                          <el-option label="主目标有关联子目标报警" :value="2"></el-option>
                          <el-option label="主目标无关联子目标报警" :value="3"></el-option>
                        </el-select>
                      </el-form-item>
                      <associatedAlarmTabs :ref="`associatedAlarmTabsRef${index}`" :triggerType="rulesFormData.uniteChildRules[index].triggerType" :detectedType="rulesFormData.detectedType"></associatedAlarmTabs>
                    </div>
                  </div>
                  <el-form-item label="位移过滤使能" prop="isStillFilterEnable">
                    <el-switch v-model="rulesFormData.uniteChildRules[index].isStillFilterEnable"></el-switch>
                  </el-form-item>
                  <el-form-item label="位移过滤类型" v-if="rulesFormData.uniteChildRules[index].isStillFilterEnable" prop="stillFilterMode">
                    <el-radio-group v-model="rulesFormData.uniteChildRules[index].stillFilterMode" style="margin-bottom: 4px;">
                      <el-radio label="0">静止目标过滤</el-radio>
                      <el-radio label="1">运动目标过滤</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item label="过滤灵敏度" v-if="rulesFormData.uniteChildRules[index].isStillFilterEnable" prop="stillFilterSensitive" label-width="150px">
                    <el-input-number v-model="rulesFormData.uniteChildRules[index].stillFilterSensitive" :min=1 :max=100 style="width: 170px;" :key="inputNumberKey" @blur="() => {inputNumberKey = Math.random()}"></el-input-number>
                    <div class="rules_tips_text">可选范围是1-100</div>
                  </el-form-item>
                  <!-- 子规则间隔时间从第二个子规则tab开始出现 -->
                  <div v-if="index>0">
                    <div class="rules_form_time" style="margin-left:-4px">
                      <div style="margin-right:-10px"><span style="color:red;margin-right:4px">*</span>子规则间隔时间</div>
                      <el-form-item label="" prop="uniteRuleMinInterval">
                        <el-input-number v-model="rulesFormData.uniteChildRules[index].uniteRuleMinInterval" @change="changeTabUniteRuleMinInterval" style="width: 160px; margin-right:20px" :min= 0 :max= 300 :key="inputNumberKey" @blur="() => {inputNumberKey = Math.random()}"></el-input-number>
                      </el-form-item>
                      <div>至</div>
                      <el-form-item label="" prop="uniteRuleMaxInterval">
                        <el-input-number v-model="rulesFormData.uniteChildRules[index].uniteRuleMaxInterval" @change="changeTabUniteRuleMinInterval" style="width: 160px;" :min= 0 :max= 300 :key="inputNumberKey" @blur="() => {inputNumberKey = Math.random()}"></el-input-number>
                      </el-form-item>
                      <div style="margin-left:10px">秒</div>
                    </div>
                    <div style="margin-left:112px;margin-top: 6px;">默认区间0-100，最大区间0-300</div>
                  </div>
                </div>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </div>
        <div v-show="!formValidFlag" class="empty_formList">
          <div class="empty_formList_text">分析规则用于触发事件推送，当算法分析结果满足所配的规则，则会触发相应的事件推送。</div>
        </div>
      </el-scrollbar>
    </div>
    <configRuleChannelsModal :visible.sync="configRuleChannelsModalVisible" ref="configRuleChannelsModal" @saveChannelList="saveChannelList"></configRuleChannelsModal>
  </div>
</template>
<script>
import { checkRuleIsRefBySecondaryAnalysis, updateChangeInfo } from './../proxy'
import chooseAnalysisRules from './chooseAnalysisRules'
import associatedAlarmTabs from './modal/associatedAlarmTabs.vue'
import confidenceThresholdDom from './modal/confidenceThresholdDom.vue'
import configRuleChannelsModal from './modal/configRuleChannelsModal.vue'
import ymIconBtn from '@/components/ymIconBtn.vue'
import mixin from './mixin'
import { checkCommonName } from '@/common/util.js'
export default {
  components: { chooseAnalysisRules, confidenceThresholdDom, configRuleChannelsModal, ymIconBtn, associatedAlarmTabs },
  props: {
    alertInterval: {
      type: Number,
      default: 60
    }
  },
  mixins: [mixin],
  data () {
    let checkObjectId = (rule, value, callback) => {
      if (['DETECT', 'COMBINED', 'ARRANGE', 'ARRANGE_DETECT', 'ARRANGE_COMBINED'].includes(this.algorithmVersionType) && !['ALL_RULE_DETECT', 'CLOUD_ALL_RULE_DETECT'].includes(this.rulesFormData.detectedType)) {
        if (this.objectIdValidExistArr && this.objectIdValidExistArr.indexOf(this.rulesFormData.targetObjLabelLineId) < 0) {
          this.rulesFormData.targetObjLabelLineId = ''
          this.rulesFormData.propertyIds = {}
          callback(new Error('请选择检测对象'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
    let checkRuleName = (rule, value, callback) => {
      let pattern = new RegExp("[`!%$^&*=|{}':;',/?！￥……&*;———|{}‘；：”“'。，？\\\\]+")
      if (value.length === 0) {
        callback(new Error('请输入规则名称'))
      } else if (pattern.test(value)) {
        callback(new Error('不能包含. 、-_[]【】()（）#@~<>以外的特殊字符'))
      } else {
        callback()
      }
    }
    let checkMsgPush = (rule, value, callback) => {
      if (!this.rulesFormData.msgPush || !this.rulesFormData.msgPush.length) {
        callback(new Error('请选择消息推送'))
      } else {
        callback()
      }
    }
    let checkDurationMinTime = (rule, value, callback) => {
      if ([3, 4].includes(this.rulesFormData.numberJudgeCondition) && (value >= this.rulesFormData.maxTargetNum)) {
        callback(new Error('不能 ≥ 最大值'))
      } else {
        callback()
      }
    }
    let checkDurationMaxTime = (rule, value, callback) => {
      if ([3, 4].includes(this.rulesFormData.numberJudgeCondition) && (value <= this.rulesFormData.minTargetNum)) {
        callback(new Error('不能 ≤ 最小值'))
      } else {
        callback()
      }
    }
    let checkTabDurationMinTime = (rule, value, callback) => {
      let tabActiveIndex = this.editableTabsValue.substr(this.editableTabsValue.length - 1, 1) - 1
      if ([3, 4].includes(this.rulesFormData.uniteChildRules[tabActiveIndex].numberJudgeCondition) && (value >= this.rulesFormData.uniteChildRules[tabActiveIndex].maxTargetNum)) {
        callback(new Error('不能 ≥ 最大值'))
      } else {
        callback()
      }
    }
    let checkTabDurationMaxTime = (rule, value, callback) => {
      let tabActiveIndex = this.editableTabsValue.substr(this.editableTabsValue.length - 1, 1) - 1
      if ([3, 4].includes(this.rulesFormData.uniteChildRules[tabActiveIndex].numberJudgeCondition) && (value <= this.rulesFormData.uniteChildRules[tabActiveIndex].minTargetNum)) {
        callback(new Error('不能 ≤ 最小值'))
      } else {
        callback()
      }
    }
    let checkTabUniteRuleMinInterval = (rule, value, callback) => {
      let tabActiveIndex = this.editableTabsValue.substr(this.editableTabsValue.length - 1, 1) - 1
      if (value > this.rulesFormData.uniteChildRules[tabActiveIndex].uniteRuleMaxInterval) {
        callback(new Error('不能 ≥ 最大值'))
      } else {
        callback()
      }
    }
    let checkTabUniteRuleMaxInterval = (rule, value, callback) => {
      let tabActiveIndex = this.editableTabsValue.substr(this.editableTabsValue.length - 1, 1) - 1
      if (value < this.rulesFormData.uniteChildRules[tabActiveIndex].uniteRuleMinInterval) {
        callback(new Error('不能 ≤ 最小值'))
      } else {
        callback()
      }
    }
    let checkSizeFilterMinWidth = (rule, value, callback) => {
      if (this.rulesFormData.sizeFilter.sizeFilterValid && (value >= this.rulesFormData.sizeFilter.maxWidth)) {
        callback(new Error('不能 ≥ 最大宽'))
      } else {
        callback()
      }
    }
    let checkSizeFilterMaxWidth = (rule, value, callback) => {
      if (this.rulesFormData.sizeFilter.sizeFilterValid && (value <= this.rulesFormData.sizeFilter.minWidth)) {
        callback(new Error('不能 ≤ 最小宽'))
      } else {
        callback()
      }
    }
    let checkSizeFilterMinHeight = (rule, value, callback) => {
      if (this.rulesFormData.sizeFilter.sizeFilterValid && (value >= this.rulesFormData.sizeFilter.maxHeight)) {
        callback(new Error('不能 ≥ 最大高'))
      } else {
        callback()
      }
    }
    let checkSizeFilterMaxHeight = (rule, value, callback) => {
      if (this.rulesFormData.sizeFilter.sizeFilterValid && (value <= this.rulesFormData.sizeFilter.minHeight)) {
        callback(new Error('不能 ≤ 最小高'))
      } else {
        callback()
      }
    }
    let checkTabSizeFilterMinWidth = (rule, value, callback) => {
      let tabActiveIndex = this.editableTabsValue.substr(this.editableTabsValue.length - 1, 1) - 1
      if (this.rulesFormData.uniteChildRules[tabActiveIndex].sizeFilter.sizeFilterValid && (value >= this.rulesFormData.uniteChildRules[tabActiveIndex].sizeFilter.maxWidth)) {
        callback(new Error('不能 ≥ 最大宽'))
      } else {
        callback()
      }
    }
    let checkTabSizeFilterMaxWidth = (rule, value, callback) => {
      let tabActiveIndex = this.editableTabsValue.substr(this.editableTabsValue.length - 1, 1) - 1
      if (this.rulesFormData.uniteChildRules[tabActiveIndex].sizeFilter.sizeFilterValid && (value <= this.rulesFormData.uniteChildRules[tabActiveIndex].sizeFilter.minWidth)) {
        callback(new Error('不能 ≤ 最小宽'))
      } else {
        callback()
      }
    }
    let checkTabSizeFilterMinHeight = (rule, value, callback) => {
      let tabActiveIndex = this.editableTabsValue.substr(this.editableTabsValue.length - 1, 1) - 1
      if (this.rulesFormData.uniteChildRules[tabActiveIndex].sizeFilter.sizeFilterValid && (value >= this.rulesFormData.uniteChildRules[tabActiveIndex].sizeFilter.maxHeight)) {
        callback(new Error('不能 ≥ 最大高'))
      } else {
        callback()
      }
    }
    let checkTabSizeFilterMaxHeight = (rule, value, callback) => {
      let tabActiveIndex = this.editableTabsValue.substr(this.editableTabsValue.length - 1, 1) - 1
      if (this.rulesFormData.uniteChildRules[tabActiveIndex].sizeFilter.sizeFilterValid && (value <= this.rulesFormData.uniteChildRules[tabActiveIndex].sizeFilter.minHeight)) {
        callback(new Error('不能 ≤ 最小高'))
      } else {
        callback()
      }
    }
    let checkMaxTriggerTimes = (rule, value, callback) => {
      let pattern = new RegExp('^[0-9]+$')
      if (!value) {
        callback()
      } else if (+value < 1 || +value > 100) {
        callback(new Error('请输入1-100之内的数字'))
      } else if (!pattern.test(value)) {
        callback(new Error('只能输入数字'))
      } else {
        callback()
      }
    }
    let checkCmpFilterSwitch = (rule, value, callback) => {
      if (this.isArrangeAlgorithm && ['NORMAL_RULE'].includes(this.rulesFormData.detectedType) && value === -1) {
        callback(new Error('请配置图库过滤模式'))
      } else {
        callback()
      }
    }
    const validatorZdyxxmldjText = () => {
      return (rule, value, callback) => {
        var len = 0
        if (value && value.length) {
          for (var i=0; i<value.length; i++) {   
            var c = value.charCodeAt(i) 
            //单字节加1   
            if ((c >= 0x0001 && c <= 0x007e) || (0xff60<=c && c<=0xff9f)) {   
              len++  
            } else {   
              len+=2
            }   
          }
        }
        if (!value) {
          callback()
        } else if (!checkCommonName.test(value)) {
          callback(new Error('不能包含/ \ : * ? " < > | %等特殊字符'))
        } else if (len > 64) {
          callback(new Error('长度不能大于64个字符。1个中文等于2个字符'))
        }
        callback()
      }
    }
    return {
      checkCommonName,
      validatorZdyxxmldjText,
      inputNumberKey: Math.random(),
      crossStyle: {left:'130px', top:'27px'},
      currentTabId: '', //编排算法，当前tab的id
      lazyShow: false,
      fullChannelData: [], // 待选通道的全量数据，从上一步的通道选择带过来，并且新增一个节点，根节点下挂载所有上一步的已选通道
      configRuleChannelsModalVisible: false, // 通道选择的弹框
      ruleTypeList: [],
      algorithmVersionType: '', //算法类型，'CLASSIFY'，'DETECT', 'COMBINED', 'ARRANGE', 'ARRANGE_CLASSIFY', 'ARRANGE_DETECT', 'ARRANGE_COMBINED'
      supportConfigItemsObj: {}, // 支持配置的表单项
      showCollapseFlag: true, // 是否展开高级参数
      currentEditRulesDataByTab: {}, // 编排算法是tab维度管理数据，如果是非编排算法，页面全量数据是editRulesDataSelf
      editRulesDataSelf: {}, // 该组件自己管理数据，包括左侧规则和右侧表单，全量数据
      currentRulesIndex: 0, // 左侧当前选中的规则
      rulesFormData: {
        detectedType: '', // 规则类型
        uniteType: 'THEN', // 规则模式-依次满足和同时满足
        uniteChildRules: [
          { ruleId: '', uniteChildRuleName: '子规则1', targetObjLabelLineId: '', propertyIds: {}, propertyEnables: {}, triggerType: 1073758209, duration: 1, confidenceThreshold: 70, durationSensitive: 0, uniteRuleMaxTriggerValid: 1, uniteRuleMaxTriggerTimes: 1, uniteRuleTriggerInterval: 60, sizeFilter: { sizeFilterValid: false, minWidth:0.1, minHeight: 0.1, maxWidth: 0.2, maxHeight: 0.2 }, showCollapseFlag: false, sensitivity: 70, numberConditionValid: false, isStillFilterEnable: false, customInfoEnabled: false, customInfo: '', relationAnalysisValid: false, relationAnalysisType: 1, subTargetInfo: [], isOSDEnable: false, stillFilterMode: '0', countingModeEnum: 'FIXED_COUNTING', stillFilterSensitive: 90, countInterval: 60, timeInterval: 1, numberJudgeCondition: 2, minTargetNum: 1, maxTargetNum: 5, uniteRuleMinInterval: 0, uniteRuleMaxInterval: 100, outOfPolygonDisplay: false },
          { ruleId: '', uniteChildRuleName: '子规则2', targetObjLabelLineId: '', propertyIds: {}, propertyEnables: {}, triggerType: 1073758209, duration: 1, confidenceThreshold: 70, durationSensitive: 0, uniteRuleMaxTriggerValid: 1, uniteRuleMaxTriggerTimes: 1, uniteRuleTriggerInterval: 60, sizeFilter: { sizeFilterValid: false, minWidth:0.1, minHeight: 0.1, maxWidth: 0.2, maxHeight: 0.2 }, showCollapseFlag: false, sensitivity: 70, numberConditionValid: false, isStillFilterEnable: false, customInfoEnabled: false, customInfo: '', relationAnalysisValid: false, relationAnalysisType: 1, subTargetInfo: [], isOSDEnable: false, stillFilterMode: '0', countingModeEnum: 'FIXED_COUNTING', stillFilterSensitive: 90, countInterval: 60, timeInterval: 1, numberJudgeCondition: 2, minTargetNum: 1, maxTargetNum: 5, uniteRuleMinInterval: 0, uniteRuleMaxInterval: 100, outOfPolygonDisplay: false }
        ], // 组合规则的子规则数组集合
        belongNodeId: '', // 编排算法tab的id
        ruleId: '',
        ruleName: '',
        faceContrastType: 'COMPARE', // 人脸比对
        faceTrigger: false, // 人脸比对是否启用
        cmpFilterSwitch : 0, // 图库过滤模式是否启用
        cmpSimilarity: 90, // 图片相似度
        presetDetectionSwitch: false, // 预置点变更检测是否启用
        channelResultSwitch: false, // 通道长时间无结果检测是否启用
        overlapSwitch: false, // 目标与区域交叠过多检测是否启用
        channelDetectTime: 5, // 无结果告警阈值
        overlapRatio: 3, // 交叠比例
        overlapNum: 1, // 持续次数
        faceUpload: ['success', 'failed'],
        faceLib: [{ faceLibId: '', faceLibName: '', faceLibThreshold: 70}],
        msgPush: ['diana'], // 消息推送
        secondaryFilterCloudRuleInfoList: [], // 分析规则配置，只有第一步的分析模式为【其他任务二次分析】才显示
        targetObjLabelLineId: '', // 检测对象
        confidenceThreshold: 70, // 置信度阈值
        numberConditionValid: false, // 数量配置
        isStillFilterEnable: false, // 位移过滤使能
        customInfoEnabled: false, // 自定义信息码流叠加开关
        customInfo: '', // 自定义信息码流叠加的文本内容
        relationAnalysisValid: false, // 关联子目标使能开关
        relationAnalysisType: 1, // 关联报警下拉选择
        subTargetInfo: [], // 关联报警的子目标tab数组
        isOSDEnable: false, // OSD是否开启
        stillFilterMode: '0', // 位移过滤类型
        countingModeEnum: 'FIXED_COUNTING', // 计数模式
        stillFilterSensitive: 90, // 过滤灵敏度
        channelIdList: [], // 规则的所选通道的id集合
        countInterval: 60, // 上报时间间隔
        timeInterval: 1, // 批次计数
        outOfPolygonDisplay: false, // 所有对象
        checkid: [], // 对象属性处理后传给后端的数据
        duration: 1, // 持续时间
        durationSensitive: 0, // 持续灵敏度
        sizeFilter: { sizeFilterValid: false, minWidth: 0.1, minHeight: 0.1, maxWidth: 0.2, maxHeight: 0.2 }, // 尺寸过滤配置
        valid: true, // 规则是否启用
        numberJudgeCondition: 2, // 数量的下拉选择项
        maxTargetNum: 1, // 数量的最大值
        minTargetNum: 1, // 数量的最小值
        triggerInterval: 60, // 报警间隔
        scoreFilter: {}, //评分配置项
        maxTriggerValid: 1, // 最大报警次数的开关
        maxTriggerTimes: 1, // 最大报警次数
        sensitivity: 70, // 灵敏度
        areaRatio: 1, // 面积比过滤
        propertyIds: {}, // 各对象属性值具体选中的属性名称值
        propertyEnables: {} // 各对象属性值后面的开关按钮
      },
      propertyIds: {}, // 各对象属性值具体选中的属性名称值，key值是该条属性的id，value值是该条属性选中的id
      propertyEnables: {}, // 各对象属性值是否启用禁用，key值是该条属性的id，value值是{attrTypeEnable:启用禁用，confidenceThreshold:置信度}
      objectIdValidExistArr: [], // 检测对象Id组成的数组，用来判断编辑状态下，老id在现在的数组中是否存在
      propertyList: [], // 对象属性的数组
      tabPropertyList: [], // 组合规则里对象属性的数组
      detectionObjectList: [], // 配置项检测对象的数组
      tabDetectionObject: {}, // 组合规则tab里配置项检测对象的备选对象集合，以检测对象id为key
      formValidFlag: true, // 当前展示数据是否有配置规则，编排算法是按tab维度展示
      ruleConfigValidFlag: true, // 第二步配置规则的数据校验都通过
      isArrangeAlgorithmScore: false,
      scoreFullData: {},
      rules: {
        ruleName: [
          { required: true, validator: checkRuleName, trigger: 'change' }
        ],
        faceLibName: [
          { required: true, message: '请输入ID', trigger: 'blur' }
        ],
        faceLibId: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        msgPush: [
          { required: true, validator: checkMsgPush, trigger: 'change' }
        ],
        secondaryFilterCloudRuleInfoList: [
          { type: 'array', required: true, message: '请选择分析规则', trigger: 'blur' }
        ],
        targetObjLabelLineId: [
          { required: true, validator: checkObjectId, trigger: 'change' }
        ],
        minTargetNum: [
          { validator: checkDurationMinTime, trigger: 'change' }
        ],
        maxTargetNum: [
          { validator: checkDurationMaxTime, trigger: 'change' }
        ],
        maxTriggerTimes: [
          { validator: checkMaxTriggerTimes, trigger: 'blur' }
        ],
        'sizeFilter.minWidth': [
          { validator: checkSizeFilterMinWidth, trigger: 'change' }
        ],
        'sizeFilter.maxWidth': [
          { validator: checkSizeFilterMaxWidth, trigger: 'change' }
        ],
        'sizeFilter.minHeight': [
          { validator: checkSizeFilterMinHeight, trigger: 'change' }
        ],
        'sizeFilter.maxHeight': [
          { validator: checkSizeFilterMaxHeight, trigger: 'change' }
        ],
        cmpFilterSwitch: [
          { required: true, validator: checkCmpFilterSwitch, trigger: 'blur' }
        ],
      },
      tabFormRules: {
        uniteChildRuleName: [
          { required: true, validator: checkRuleName, trigger: 'change' }
        ],
        minTargetNum: [
          { validator: checkTabDurationMinTime, trigger: 'change' }
        ],
        maxTargetNum: [
          { validator: checkTabDurationMaxTime, trigger: 'change' }
        ],
        'sizeFilter.minWidth': [
          { validator: checkTabSizeFilterMinWidth, trigger: 'change' }
        ],
        'sizeFilter.maxWidth': [
          { validator: checkTabSizeFilterMaxWidth, trigger: 'change' }
        ],
        'sizeFilter.minHeight': [
          { validator: checkTabSizeFilterMinHeight, trigger: 'change' }
        ],
        'sizeFilter.maxHeight': [
          { validator: checkTabSizeFilterMaxHeight, trigger: 'change' }
        ],
        uniteRuleMinInterval: [
          { validator: checkTabUniteRuleMinInterval, trigger: 'change' }
        ],
        uniteRuleMaxInterval: [
          { validator: checkTabUniteRuleMaxInterval, trigger: 'change' }
        ]
      },
      editableTabsValue: 'tab1',
      editableTabs: [
        {
          title: '子规则1',
          name: 'tab1'
        },
        {
          title: '子规则2',
          name: 'tab2'
        }
      ],
      newBgStyle: {
        backgroundImage: 'url(' + require('@/assets/img/common/10.png') + ')',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat'
      },
      isAdd:true,
      initFinishFlag: false,
      isTaskNameCloudOrDCT4:'',
      updateKey:'', //后端实时更新通道选择的key
      isArrangeAlgorithm:'', //是否编排算法
      arrangeAlgorithmTabs: '', // 编排算法tab数组
      taskForm: '', // 第一步的分析模式
      initTargetObjLabelLineId: ''// 初始的检测对象的默认值，增加规则等都需要
    }
  },
  computed: {
    scoreFilterInfo() {
      let arr = this.rulesFormData.scoreFilter.scoreInfo.filter(s => s.targetObjLabelLineId===this.rulesFormData.targetObjLabelLineId)
      if (arr.length > 0) {
        return arr[0].scoreType
      }
      return []
    },
    rulesLength () {
      let num = 0
      // if (this.editRulesDataSelf.length) {
      if (this.currentEditRulesDataByTab.length) {
        // this.editRulesDataSelf.forEach(item => {
        this.currentEditRulesDataByTab.forEach(item => {
          if (item.detectedType === 'UNITE_RULE') {
            let childNum = item.uniteChildRules.length
            num = num + childNum
          } else {
            num++
          }
        })
      }
      return num
    },
    msgPushList () {
      if (this.taskForm.analysisMode === 'SECONDARY_FILTER') { // 分析模式是“二次过滤”，消息推送隐藏“智能分析任务”的选项
        return [{ id: 'servicePlatform', name: '巡查' }, { id: 'diana', name: '运营助手' }, { id: 'pushGate', name: '三方消息推送' }]
      } else {
        return [{ id: 'servicePlatform', name: '巡查' }, { id: 'diana', name: '运营助手' }, { id: 'pushGate', name: '三方消息推送' }, { id: 'analysis', name: '二次分析任务推送' }]
      }
    },
    showConfidenceThresholdDom () { // 只有云端单一规则展示置信度配置
      return ['NORMAL_RULE'].includes(this.rulesFormData.detectedType)
    },
    showConfigRuleChannels () { // 只有设备端展示通道配置
      return !['NORMAL_RULE', 'CLOUD_ALL_RULE_DETECT'].includes(this.rulesFormData.detectedType) && this.taskForm.isCustomRuleChannel
    },
    isCloudType() { // 是否云端任务，true-是
      return ['NORMAL_RULE', 'CLOUD_ALL_RULE_DETECT'].includes(this.rulesFormData.detectedType)
    },
    showRelationAnalysisConfig() {
      // 只有一个检测对象时，因为关联子目标使能里的子目标对象不能和主检测对象一样，所以关联子目标使能模块不可进行配置
      return this.detectionObjectList.length > 1
    }
  },
  watch: {
    // editRulesDataSelf: {
      currentEditRulesDataByTab: {
      handler (val) {
        if (val && val.length === 0) {
          this.formValidFlag = false// 左侧规则列表为0，显示空态
        } else {
          this.formValidFlag = true
        }
      },
      deep: true,
      immediate: true
    },
    'rulesFormData.overlapRatio': {
      handler (val) {
        this.crossStyle.left = (val === 10) ? '137px' : '129px'
        this.crossStyle.top = this.isCloudType ? '28px' : '27px'
      },
      deep: true,
      immediate: true
    },
    editableTabsValue (val) {
      if (val) { // 切换tab正则校验一些时间
        this.$nextTick(() => {
          let tabActiveIndex = +val.substr(val.length - 1, 1) - 1
          this.$refs[`tabRulesForm${tabActiveIndex}`][0].validate('minTargetNum', () => {})
          this.$refs[`tabRulesForm${tabActiveIndex}`][0].validate('maxTargetNum', () => {})
          this.$refs[`tabRulesForm${tabActiveIndex}`][0].validate('uniteRuleMinInterval', () => {})
          this.$refs[`tabRulesForm${tabActiveIndex}`][0].validate('uniteRuleMaXInterval', () => {})
          this.changeTabSizeFilterWidth()
          this.changeTabSizeFilterHeight()
        })
      }
    },
    'rulesFormData.numberJudgeCondition' (val) { // 这个要绑在动态监听上，否则编辑进来有问题，有编辑的值用编辑的值，否则用默认值
      switch (val) { // 1:小于最小，2:大于最大，3:最大最小之间，4:最大最小之外，-1：不配置
      case 1:
        this.rulesFormData.minTargetNum = this.rulesFormData.minTargetNum > -1 ? this.rulesFormData.minTargetNum : 1
        break
      case 2:
        this.rulesFormData.maxTargetNum = this.rulesFormData.maxTargetNum > -1 ? this.rulesFormData.maxTargetNum : 5
        break
      case 3:
        this.rulesFormData.minTargetNum = this.rulesFormData.minTargetNum > -1 ? this.rulesFormData.minTargetNum : 1
        this.rulesFormData.maxTargetNum = this.rulesFormData.maxTargetNum > -1 ? this.rulesFormData.maxTargetNum : 5
        break
      case 4:
        this.rulesFormData.minTargetNum = this.rulesFormData.minTargetNum > -1 ? this.rulesFormData.minTargetNum : 1
        this.rulesFormData.maxTargetNum = this.rulesFormData.maxTargetNum > -1 ? this.rulesFormData.maxTargetNum : 5
        break
      }
    },
    'rulesFormData.minTargetNum' (val) {
      if (val) {
        this.$refs.rulesForm.validate('maxTargetNum', () => {})
        this.$refs.rulesForm.validate('minTargetNum', () => {})
      }
    },
    'rulesFormData.maxTargetNum' (val) {
      if (val) {
        this.$refs.rulesForm.validate('minTargetNum', () => {})
        this.$refs.rulesForm.validate('maxTargetNum', () => {})
      }
    },
    // 检测对象改变
    'rulesFormData.targetObjLabelLineId': {
      handler (val) {
        if (['DETECT', 'COMBINED', 'ARRANGE', 'ARRANGE_DETECT', 'ARRANGE_COMBINED'].includes(this.algorithmVersionType) && !['ALL_RULE_DETECT', 'CLOUD_ALL_RULE_DETECT'].includes(this.rulesFormData.detectedType)) {
          if (!val || val.length === 0) { // 检测对象为空，对应的对象属性清空
            this.rulesFormData.propertyIds = this.propertyIds = {}
            this.propertyEnables = this.rulesFormData.propertyEnables = {}
          } else { // 检测对象不为空，那么引起对象变化的原因分为：同规则内切换对象和切换规则
            this.detectionObjectList.forEach((item, index) => {
              if (item.targetObjLabelLineId === this.rulesFormData.targetObjLabelLineId) {
                this.propertyList = item.targetStatusInfos
              }
            })
            let arr = []
            this.propertyList.forEach(item => {
              item.attrValues && item.attrValues.forEach(citem => {
                arr.push(citem.propLabelLineId)
              })
            })
            for (var key in this.rulesFormData.propertyIds) { // 如果选中的属性不属于当前属性数组 则删除
              if (arr.indexOf(this.rulesFormData.propertyIds[key]) < 0) {
                delete this.rulesFormData.propertyIds[key]
              }
            }
            if (Object.keys(this.rulesFormData.propertyIds).length === 0) { // 这种情况就是同规则内切换检测对象，默认选中目前对象的各属性的第一个属性值
              this.propertyIds = {}
              this.propertyEnables = {}
              this.propertyList.forEach(item => {
                this.propertyIds[item.attrType] = item.attrValues[0].propLabelLineId
                this.propertyEnables[item.attrType] = {}
                this.propertyEnables[item.attrType].attrTypeEnable = true
                this.propertyEnables[item.attrType].confidenceThreshold = 70
              })
              this.rulesFormData.propertyIds = this.propertyIds
              this.rulesFormData.propertyEnables = this.propertyEnables
            } else { // 这种情况是切换规则，所以选中的this.propertyIds是当前this.rulesFormData.propertyIds的值
              this.propertyIds = this.rulesFormData.propertyIds
              this.propertyEnables = this.rulesFormData.propertyEnables
            }
          }
        }
      },
      deep: true,
      immediate: true
    },
    currentTabId(val) {
      if (val) {
        this.changeaArrangeAlgorithmTab()
      }
    },
  },
  methods: {
    changeNumberJudgeCondition() { // 改变数量配置的范围选择下拉选，最大最小框都做校验
      this.$refs.rulesForm.validate('minTargetNum', () => {})
      this.$refs.rulesForm.validate('maxTargetNum', () => {})
    },
    changeTabNumberJudgeCondition() { // 改变tab数量配置的范围选择下拉选，最大最小框都做校验
      let tabActiveIndex = this.editableTabsValue.substr(this.editableTabsValue.length - 1, 1) - 1
      this.$refs[`tabRulesForm${tabActiveIndex}`][0].validate('minTargetNum', () => {})
      this.$refs[`tabRulesForm${tabActiveIndex}`][0].validate('maxTargetNum', () => {})
    },
    changeSizeFilterWidth() { // 改变尺寸过滤配置宽度，最大最小框都做校验
      this.$refs.rulesForm.validate('sizeFilter.minWidth', () => {})
      this.$refs.rulesForm.validate('sizeFilter.maxWidth', () => {})
    },
    changeSizeFilterHeight() { // 改变尺寸过滤配置高度，最大最小框都做校验
      this.$refs.rulesForm.validate('sizeFilter.minHeight', () => {})
      this.$refs.rulesForm.validate('sizeFilter.maxHeight', () => {})
    },
    changeTabSizeFilterWidth() { // 改变tab尺寸过滤配置宽度，最大最小框都做校验
      let tabActiveIndex = this.editableTabsValue.substr(this.editableTabsValue.length - 1, 1) - 1
      this.$refs[`tabRulesForm${tabActiveIndex}`][0].validate('sizeFilter.minWidth', () => {})
      this.$refs[`tabRulesForm${tabActiveIndex}`][0].validate('sizeFilter.maxWidth', () => {})
    },
    changeTabSizeFilterHeight() { // 改变tab尺寸过滤配置高度，最大最小框都做校验
      let tabActiveIndex = this.editableTabsValue.substr(this.editableTabsValue.length - 1, 1) - 1
      this.$refs[`tabRulesForm${tabActiveIndex}`][0].validate('minHeight', () => {})
      this.$refs[`tabRulesForm${tabActiveIndex}`][0].validate('maxHeight', () => {})
    },
    changeOverlapRatio() {
      this.newBgStyle.backgroundImage = 'url(' + require(`@/assets/img/common/${this.rulesFormData.overlapRatio}0.png`) + ')'
    },
    // 切换了编排算法头部tab之前，将currentEditRulesDataByTab（当前页面数据）更新进editRulesDataSelf（全量数据）
    beforeLeaveAlgorithmTab(activeName, oldActiveName) {
      return new Promise(async(resolve, reject) => {
        let tempEditRulesDataSelf = this.editRulesDataSelf.filter(_ => _.belongNodeId!==  oldActiveName) // 把切换之前tab的数据从editRulesDataSelf删除
        let tempAll = tempEditRulesDataSelf.concat(this.currentEditRulesDataByTab)
        this.editRulesDataSelf = [...tempAll]
        resolve()
      })
    },
    // 切换了编排算法头部tab，展示的currentEditRulesDataByTab改更新为符合当前currentTabId（也就是belongNodeId）的数据
    changeaArrangeAlgorithmTab() {
      this.currentEditRulesDataByTab = this.isArrangeAlgorithm ? this.editRulesDataSelf.filter(_ => _.belongNodeId === this.currentTabId ) : this.editRulesDataSelf
      if (this.currentEditRulesDataByTab && this.currentEditRulesDataByTab.length) {
        this.showRulesInfo(this.currentEditRulesDataByTab[0], 0)// 默认选中第一条规则
      }
    },
    addFaceLib() {
      if(this.rulesFormData.faceLib.length === 0) {
        this.rulesFormData.faceLib.push({ faceLibId: '', faceLibName: '', faceLibThreshold: 70})
      } else {
        this.$refs.rulesForm.validateField(`faceLib[${this.rulesFormData.faceLib.length-1}].faceLibId`, (idres) => {
          if (idres === '') {
            this.$refs.rulesForm.validateField(`faceLib[${this.rulesFormData.faceLib.length-1}].faceLibName`, (nameres) => {
              if (nameres === '') {
                this.rulesFormData.faceLib.push({ faceLibId: '', faceLibName: '', faceLibThreshold: 70})
              }
            })
          }
        })
      }
    },
    delFaceLib(index) {
      this.rulesFormData.faceLib.splice(index, 1)
    },
    configRuleChannels () { // 配置通道
      this.configRuleChannelsModalVisible = true
      this.$refs.configRuleChannelsModal.open(this.rulesFormData, this.fullChannelData, this.updateKey, this.taskForm.taskId)
    },
    getSecondaryFilterCloudRuleInfoList (data) { // 获取分析规则树对象弹框的选择数据
      this.rulesFormData.secondaryFilterCloudRuleInfoList = data || []
      this.$refs.rulesForm.validateField('secondaryFilterCloudRuleInfoList', () => {})// 校验分析规则
    },
    async changeMsgPush (item) {
      // let ruleId = this.editRulesDataSelf[this.currentRulesIndex].ruleId
      let ruleId = this.currentEditRulesDataByTab[this.currentRulesIndex].ruleId
      if (ruleId && item.id === 'analysis' && this.rulesFormData.msgPush.indexOf('analysis') < 0) { // 非新建规则，取消勾选“智能分析任务”
        let { code, data } = await checkRuleIsRefBySecondaryAnalysis({ ruleId: ruleId, taskId: this.taskForm.taskId })
        if (code === 0) {
          if (data) {
            this.$confirm(`确定不勾选智能分析任务？`, {
              message: '该规则已被其他二次分析任务引用',
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'question'
            }).then(() => {}).catch(() => {
              this.rulesFormData.msgPush.push('analysis')
            })
          }
        }
      }
    },
    changeRuleType () {
      if (!['AREA_TARGET_DETECT'].includes(this.rulesFormData.detectedType)) {
        this.rulesFormData.numberConditionValid = false// 除区域检测外，数量配置开关都是false，不显示
      }
      if (['NORMAL_RULE'].includes(this.rulesFormData.detectedType)) {
        this.rulesFormData.numberConditionValid = true// 定时任务，数量配置开关不显示，但要赋值true
        this.changeNumberConditionValid()
      }
      if (this.rulesFormData.detectedType === 'UNITE_RULE') {
        this.setInitAttrInfo()
      }
      this.$nextTick(() => {
        this.$refs.rulesForm.validate('targetObjLabelLineId', () => {})
      })
    },
    setInitAttrInfo() {
      this.rulesFormData.uniteChildRules.forEach(tabItem => {
        let propertyKeys = Object.keys(tabItem.propertyEnables)
        this.detectionObjectList.forEach(item => {
          if (item.targetStatusInfos.length) {
            item.targetStatusInfos.forEach(attr => {
              if (!propertyKeys.includes(attr.attrType)) {
                // tabItem.propertyIds[item.targetObjLabelLineId] = item.targetStatusInfos.length ? item.targetStatusInfos[0].attrValues[0].propLabelLineId : ''
                tabItem.propertyIds[attr.attrType] = attr.attrValues[0].propLabelLineId
                tabItem.propertyEnables[attr.attrType] = {}
                tabItem.propertyEnables[attr.attrType].attrTypeEnable = true
                tabItem.propertyEnables[attr.attrType].confidenceThreshold = 70
              }
            })
          }
        })
      })
    },
    // 如果数量配置开关是打开的，如果下面的范围选择没有值（空或者历史数据的-1），赋一个
    changeNumberConditionValid () {
      if (this.rulesFormData.numberConditionValid && (!this.rulesFormData.numberJudgeCondition || this.rulesFormData.numberJudgeCondition === -1)) {
        this.rulesFormData.numberJudgeCondition = 2
      }
    },
    changeTabTargetNum () {
      let tabActiveIndex = +this.editableTabsValue.substr(this.editableTabsValue.length - 1, 1) - 1
      this.$refs[`tabRulesForm${tabActiveIndex}`][0].validate('minTargetNum', () => {})
      this.$refs[`tabRulesForm${tabActiveIndex}`][0].validate('maxTargetNum', () => {})
    },
    changeTabUniteRuleMinInterval () {
      let tabActiveIndex = +this.editableTabsValue.substr(this.editableTabsValue.length - 1, 1) - 1
      this.$refs[`tabRulesForm${tabActiveIndex}`][0].validate('uniteRuleMinInterval', () => {})
      this.$refs[`tabRulesForm${tabActiveIndex}`][0].validate('uniteRuleMaxInterval', () => {})
    },
    // 单规则的propertyList等于组合规则tab页里的tabPropertyList
    handleTabPropertyIdsFun (idx) { // 组合规则赋予tab里的对象属性默认值，否则form表单的select绑定值undefined
      let tabItem = this.rulesFormData.uniteChildRules[idx]
      let tabPropertyList = this.tabDetectionObject[tabItem.targetObjLabelLineId]
      tabPropertyList && tabPropertyList.forEach(item => {
        this.rulesFormData.uniteChildRules[idx].propertyIds[item.attrType] = item.attrValues[0].propLabelLineId
        this.rulesFormData.uniteChildRules[idx].propertyEnables[item.attrType] = {}
        this.rulesFormData.uniteChildRules[idx].propertyEnables[item.attrType].attrTypeEnable = true
        this.rulesFormData.uniteChildRules[idx].propertyEnables[item.attrType].confidenceThreshold = 70
      })
    },
    changeTargetObjLabelLineId() {
      if (!this.initFinishFlag) {
        return false
      }
      let associatedAlarmTabProps = this.setAssociatedAlarmTabProps({targetObjLabelLineId: this.rulesFormData.targetObjLabelLineId})
      this.rulesFormData.subTargetInfo = []
      this.$nextTick(() => {
        this.$refs.associatedAlarmRef && this.$refs.associatedAlarmRef.initAssociatedAlarmTab([], associatedAlarmTabProps, this.rulesFormData)
      })
    },
    changeTabTargetObjLabelLineId (tabItem, tabIndex) {
      if (this.initFinishFlag) {
        if (this.detectionObjectList.length) {
          this.detectionObjectList.forEach(v => {
            if (v.targetObjLabelLineId === tabItem.targetObjLabelLineId) {
              v.targetStatusInfos.forEach(attr => {
                tabItem.propertyIds[attr.attrType] = attr.attrValues[0].propLabelLineId
                tabItem.propertyEnables[attr.attrType] = {}
                tabItem.propertyEnables[attr.attrType].attrTypeEnable = true
                tabItem.propertyEnables[attr.attrType].confidenceThreshold = 70
              })
            }
          })
        }
        this.$forceUpdate()
        tabItem.subTargetInfo = []
        let uniteAssociatedAlarmTabProps = this.setAssociatedAlarmTabProps(tabItem)
        this.$nextTick(() => {
          // 组合规则的联动报警的子规则tab
          this.$refs[`associatedAlarmTabsRef${tabIndex}`] && 
          this.$refs[`associatedAlarmTabsRef${tabIndex}`][0] && 
          this.$refs[`associatedAlarmTabsRef${tabIndex}`][0].initAssociatedAlarmTab(tabItem.subTargetInfo, uniteAssociatedAlarmTabProps, this.rulesFormData)
        })
      }
  },
    handleTabsEdit (targetName, action) {
      let len = this.editableTabs.length + 1
      if (action === 'add') {
        if (this.editableTabs.length >= 4) {
          this.$message.warning('子规则数量不能超过4条！')
          return false
        }
        this.editableTabs.push({
          title: `子规则${len}`,
          name: `tab${len}`
        })
        this.editableTabsValue = `tab${len}`
        this.rulesFormData.uniteChildRules.push({ ruleId: '',uniteChildRuleName: `子规则${len}`, targetObjLabelLineId: this.initTargetObjLabelLineId, confidenceThreshold:70, propertyIds: {}, propertyEnables: {}, targetStatusInfos: {}, triggerType: ['ARRANGE_CLASSIFY'].includes(this.algorithmVersionType) ? 1073758210: 1073758209, duration: 1, confidenceThreshold: 70, durationSensitive: 0, uniteRuleMaxTriggerTimes: 1, uniteRuleTriggerInterval: 60, sizeFilter: { sizeFilterValid: false, minWidth: 0.1, minHeight: 0.1, maxWidth: 0.2, maxHeight: 0.2 }, showCollapseFlag: false, sensitivity: 70, areaRatio: 1, numberConditionValid: false, isStillFilterEnable: false, customInfoEnabled:false, customInfo:'', relationAnalysisValid: false, relationAnalysisType: 1, subTargetInfo: [], isOSDEnable: false, stillFilterMode: '0', countingModeEnum: 'FIXED_COUNTING', stillFilterSensitive: 90, countInterval: 60, timeInterval: 1, numberJudgeCondition: 2, minTargetNum: 1, maxTargetNum: 5, uniteRuleMinInterval: 0, uniteRuleMaxInterval: 100, outOfPolygonDisplay: false })
        let tabItem = this.rulesFormData.uniteChildRules[len - 1] // 添加子规则，赋值对象和属性，否则报错，如果还有线上bug，建议重构
        this.detectionObjectList.forEach(item => {
          if (item.targetStatusInfos.length) {
            item.targetStatusInfos.forEach(attr => {
              tabItem.propertyIds = {}
              tabItem.propertyIds[attr.attrType] = attr.attrValues[0].propLabelLineId
              tabItem.propertyEnables[attr.attrType] = {}
              tabItem.propertyEnables[attr.attrType].attrTypeEnable = true
              tabItem.propertyEnables[attr.attrType].confidenceThreshold = 70
            })
          }
        })
        this.changeTabTargetObjLabelLineId(tabItem, len - 1)
        // this.$forceUpdate()
      }
      if (action === 'remove') {
        this.initFinishFlag = false
        if (this.editableTabs.length <= 2) {
          this.$message.warning('子规则数量不能少于2条！')
          return false
        }
        let tabs = this.editableTabs
        let removeIndex = this.editableTabs.map(item => { return item.name }).indexOf(targetName)
        this.$confirm(`确定删除子规则${removeIndex + 1}？`, {
          message: '删除规则会删除该规则下的区域绘制数据',
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'question'
        }).then(() => {
          this.editableTabs = tabs.filter(tab => tab.name !== targetName)
          this.editableTabs.forEach((item, index) => {
            item.title = `子规则${index + 1}`
            item.name = `tab${index + 1}`
          })
          this.editableTabsValue = this.editableTabs[0].name
          this.rulesFormData.uniteChildRules.splice(removeIndex, 1)

          this.rulesFormData.uniteChildRules.forEach((tabItem, tabIndex) => {
            let uniteAssociatedAlarmTabProps = this.setAssociatedAlarmTabProps(tabItem)
            this.$nextTick(() => {
              // 组合规则的联动报警的子规则tab
              this.$refs[`associatedAlarmTabsRef${tabIndex}`] &&
              this.$refs[`associatedAlarmTabsRef${tabIndex}`][0] &&  
              this.$refs[`associatedAlarmTabsRef${tabIndex}`][0].initAssociatedAlarmTab(tabItem.subTargetInfo, uniteAssociatedAlarmTabProps, this.rulesFormData)
              this.initFinishFlag = true
            })
          })
        })
      }
    },
    getRulesFlag (algorithmVersionType, ruleTypeList, detectionObjectList, propertyList, isTaskNameCloudOrDCT4, isAdd) {
      this.ruleTypeList = ruleTypeList
      this.algorithmVersionType = algorithmVersionType
      this.isTaskNameCloudOrDCT4 = isTaskNameCloudOrDCT4
      this.isAdd = isAdd
      this.detectionObjectList = detectionObjectList
      this.initTargetObjLabelLineId = this.detectionObjectList[0].targetObjLabelLineId
      if (!['CLASSIFY', 'ARRANGE_CLASSIFY'].includes(algorithmVersionType)) {
        // this.initTargetObjLabelLineId = this.detectionObjectList[0].targetObjLabelLineId
        this.objectIdValidExistArr = this.detectionObjectList.map(item => item.targetObjLabelLineId)
      } else {
        this.propertyList = propertyList
      }
      this.detectionObjectList.forEach((item, index) => { // 组合规则的子规则tab里的对象属性
        this.tabDetectionObject[item.targetObjLabelLineId] = item.targetStatusInfos
      })
    },
    changeProperty () {
      this.$forceUpdate()
    },
    showCollapse () {
      this.showCollapseFlag = !this.showCollapseFlag
    },
    changeUniteChildRulesShowCollapseFlag (val, index) {
      this.rulesFormData.uniteChildRules[index].showCollapseFlag = !val
      this.$forceUpdate()
    },
    async initData (data, taskForm, channelData, updateKey, isArrangeAlgorithm, arrangeAlgorithmTabs, isArrangeAlgorithmScore, scoreFullData) { // 点击下一步，初始化第二步的一些数据
      this.initFinishFlag = false
      this.taskForm = { ...taskForm }
      this.updateKey = updateKey
      // 处理编排算法的数据
      this.isArrangeAlgorithm = isArrangeAlgorithm // 是否编排算法 
      this.isArrangeAlgorithmScore = isArrangeAlgorithmScore // 是否工装编排算法（带评分）
      this.scoreFullData = scoreFullData // 评分全量数据，添加规则需要
      this.arrangeAlgorithmTabs = arrangeAlgorithmTabs // 编排算法tab数组 
      this.currentTabId = (this.isArrangeAlgorithm && arrangeAlgorithmTabs.length > 0) ? arrangeAlgorithmTabs[0].belongNodeId : ''
      //处理通道选择，主要这一页(没弹框时)就要显示已选通道，所以数据判断只能在这里提前处理了
      this.fullChannelData = JSON.parse(JSON.stringify(channelData))
      const allChannels = []
      for (let i =0; i < this.fullChannelData.length; i++) {
        for (let j = 0; j < this.fullChannelData[i].channels.length; j++) {
          allChannels.push(this.fullChannelData[i].channels[j])
        }
      }
      this.fullChannelData.forEach(item => { item.parentId = "" })
      this.fullChannelData.unshift({groupId: '', groupName: '全部', channels: allChannels}) // 左侧树加个根节点，下面挂载全部的待选通道
      let rootChannelIds = this.fullChannelData[0].channels.map(item => { return item.channelId })

      if (data.length > 0) {
        this.editRulesDataSelf = JSON.parse(JSON.stringify(data))// 该组件自己管理数据
        this.editRulesDataSelf.forEach(item => {
          if (item.detectedType !== 'UNITE_RULE') { // 单规则项要加上组合规则的参数，否则编辑时切换规则类型为组合规则的tab页没有
            item.uniteType = 'THEN'
            item.uniteChildRules = [
              { ruleId: '', uniteChildRuleName: '子规则1', targetObjLabelLineId: this.initTargetObjLabelLineId, confidenceThreshold:70, propertyIds: {}, propertyEnables: {}, targetStatusInfos: {}, triggerType: ['ARRANGE_CLASSIFY'].includes(this.algorithmVersionType) ? 1073758210: 1073758209, duration: 1, confidenceThreshold: 70, durationSensitive: 0, uniteRuleMaxTriggerValid: 1, uniteRuleMaxTriggerTimes: 1, uniteRuleTriggerInterval: 60, sizeFilter: { sizeFilterValid: false, minWidth: 0.1, minHeight: 0.1, maxWidth: 0.2, maxHeight: 0.2 }, showCollapseFlag: false, sensitivity: 70, numberConditionValid: false, isStillFilterEnable: false, customInfoEnabled:false, customInfo: '', relationAnalysisValid: false, relationAnalysisType: 1, subTargetInfo: [], isOSDEnable: false, stillFilterMode: '0', countingModeEnum: 'FIXED_COUNTING', stillFilterSensitive: 90, countInterval: 60, timeInterval: 1, numberJudgeCondition: 2, minTargetNum: 1, maxTargetNum: 5, uniteRuleMinInterval: 0, uniteRuleMaxInterval: 100, outOfPolygonDisplay: false },
              { ruleId: '', uniteChildRuleName: '子规则2', targetObjLabelLineId: this.initTargetObjLabelLineId, confidenceThreshold:70, propertyIds: {}, propertyEnables: {}, targetStatusInfos: {}, triggerType: ['ARRANGE_CLASSIFY'].includes(this.algorithmVersionType) ? 1073758210: 1073758209, duration: 1, confidenceThreshold: 70, durationSensitive: 0, uniteRuleMaxTriggerValid: 1, uniteRuleMaxTriggerTimes: 1, uniteRuleTriggerInterval: 60, sizeFilter: { sizeFilterValid: false, minWidth: 0.1, minHeight: 0.1, maxWidth: 0.2, maxHeight: 0.2 }, showCollapseFlag: false, sensitivity: 70, numberConditionValid: false, isStillFilterEnable: false, customInfoEnabled:false, customInfo: '', relationAnalysisValid: false, relationAnalysisType: 1, subTargetInfo: [], isOSDEnable: false, stillFilterMode: '0', countingModeEnum: 'FIXED_COUNTING', stillFilterSensitive: 90, countInterval: 60, timeInterval: 1, numberJudgeCondition: 2, minTargetNum: 1, maxTargetNum: 5, uniteRuleMinInterval: 0, uniteRuleMaxInterval: 100, outOfPolygonDisplay: false }]
            item.uniteChildRules.forEach((tabItem, tabIndex) => {
              let tabPropertyList = this.tabDetectionObject[tabItem.targetObjLabelLineId]
              tabPropertyList && tabPropertyList.forEach(item => {
                tabItem.propertyIds[item.attrType] = item.attrValues[0].propLabelLineId
                tabItem.propertyEnables[item.attrType] = {}
                tabItem.propertyEnables[item.attrType].attrTypeEnable = true
                tabItem.propertyEnables[item.attrType].confidenceThreshold = 70
                tabItem.targetStatusInfos = this.handleCommonDataFun(tabItem)
              })
            })
            item.validFlag = true
          } else if (item.detectedType === 'UNITE_RULE') { // 组合规则项要加上单规则的参数，否则切换单规则里的高级参数的一些默认值没有
            item.duration = 1
            item.confidenceThreshold = 70
            item.durationSensitive = 0
            item.sizeFilter.sizeFilter = { sizeFilterValid: false, minWidth: 0.1, minHeight: 0.1, maxWidth: 0.2, maxHeight: 0.2 } 
            item.numberJudgeCondition = 2
            item.maxTargetNum = 1
            item.sensitivity = 70
            item.areaRatio = 1
            item.validFlag = true
            item.outOfPolygonDisplay = false
            item.numberConditionValid = false
            item.isStillFilterEnable = false
            item.customInfoEnabled = false
            item.customInfo = ''
            item.relationAnalysisValid = false
            item.relationAnalysisType = 1
            item.subTargetInfo = []
            item.isOSDEnable = false
            item.stillFilterMode = '0'
            item.countingModeEnum = 'FIXED_COUNTING'
            item.stillFilterSensitive = 90
            item.countInterval = 60
            item.timeInterval = 1
            item.ruleId = item.uniteChildRules[0].ruleId // 编辑时组合规则的外层ruleId赋一个值
          }
          let tempList = []
          for (let i = 0; i < item.channelIdList.length; i++) {
            if (rootChannelIds.indexOf(item.channelIdList[i]) > -1) {//已选的通道，在上一步已选的通道中已经不存在了
              tempList.push(item.channelIdList[i])
            }
          }
          item.channelIdList = tempList
        })
        // 如果是编排算法，页面展示的数据是根据belongNodeId（也是currentTabId）对应的数据
        this.currentEditRulesDataByTab = this.isArrangeAlgorithm ? this.editRulesDataSelf.filter(_ => _.belongNodeId === this.currentTabId ) : this.editRulesDataSelf
        this.showRulesInfo(this.currentEditRulesDataByTab[0], 0)// 默认选中第一条规则
        this.title = `已启用规则${this.currentEditRulesDataByTab.length > 0 ? this.currentEditRulesDataByTab.length : 0}/8，各规则独立生效`
      } else { // 无配置规则
        this.editRulesDataSelf = []
        this.currentEditRulesDataByTab = []
        this.$refs.rulesForm.resetFields()
      }
      if (this.taskForm.analysisMode === 'SECONDARY_FILTER' && this.currentEditRulesDataByTab.length > 0) { // 选择了其他任务二次分析的分析模式
        this.$nextTick(() => {
          this.$refs.chooseAnalysisRules && this.$refs.chooseAnalysisRules.init(this.currentEditRulesDataByTab[0].secondaryFilterCloudRuleInfoList || [])// 初始化分析规则的组件
          // this.$refs.chooseAnalysisRules && this.$refs.chooseAnalysisRules.init(this.editRulesDataSelf[0].secondaryFilterCloudRuleInfoList || [])// 初始化分析规则的组件
        })
      }
      this.$nextTick(() => {
        this.initFinishFlag = true
      })
      setTimeout(() => { this.lazyShow = true }, 500)
    },
    saveChannelList (channelIdList) {
      this.currentEditRulesDataByTab[this.currentRulesIndex].channelIdList = channelIdList
    },
    validRulesFormData() {
      // 校验当前规则的一些配置，为了标红样式
      this.changeSizeFilterWidth()
      this.changeSizeFilterHeight()
      this.changeTabSizeFilterWidth()
      this.changeTabSizeFilterHeight()
    },
    // 父组件点击完成，获取子组件的数据
    async getEmitData () {
      this.validRulesFormData()
      this.$refs.rulesForm.validate((valid) => {})// 做一遍校验，该标红的标红
      if (this.isArrangeAlgorithm) {
        // 类似切换tab，赋值editRulesDataSelf，符合当前tab的数据更换为当前tab的currentEditRulesDataByTab
        let tempEditRulesDataSelf =  this.editRulesDataSelf.filter(_ => _.belongNodeId!==  this.currentTabId)
        let tempAll = tempEditRulesDataSelf.concat(this.currentEditRulesDataByTab)
        this.editRulesDataSelf = [...tempAll]
      } else {
        this.editRulesDataSelf = [...this.currentEditRulesDataByTab]
      }
      this.editRulesDataSelf.forEach(item => {
        item.customInfo = !item.customInfoEnabled ? '' : item.customInfo
        item.uniteChildRules.length && item.uniteChildRules.forEach(tabItem => {
          tabItem.customInfo = !tabItem.customInfoEnabled ? '' : tabItem.customInfo
        })
      })
      await this.handleSingleDataFun()
      await this.handleUnitDataFun()
      let enableArr = this.ruleTypeList.filter(item => { return item.enable }).map(item => { return item.id })
      let emitFormValidFlag = (this.editRulesDataSelf&&this.editRulesDataSelf.length > 0) ? true : false // 没有规则不需要校验
      return { emitFormValidFlag: emitFormValidFlag, data: this.editRulesDataSelf, enableArr: enableArr }
    },
    addRules () { // 添加规则时先校验目前的规则数据是否都通过校验，validItemFlagFun方法里
      this.validRulesFormData()
      this.ruleConfigValidFlag = true// 目前的全部数据的校验是否都通过
      this.currentEditRulesDataByTab.forEach((item, index) => {
      // this.editRulesDataSelf.forEach((item, index) => {
        this.handleSingleDataFun()
        // 组合规则数据处理
        this.handleUnitDataFun() // 处理传给后端的对象属性的选中值
        item = this.validItemFlagFun(item, this.isArrangeAlgorithm, this.isArrangeAlgorithmScore)
        if (item.validFlag === false) {
          this.ruleConfigValidFlag = false
        }
      })
      if (!this.ruleConfigValidFlag) {
        this.$message.warning('有配置规则未通过，请检查！')
        return false
      } else {
        if (this.rulesLength >= 16) {
          this.$message.warning('最多支持添加16条规则')
          return false
        } else {
          let additemObj = {
            detectedType: this.ruleTypeList.filter(item => { return item.enable })[0].id,
            belongNodeId: this.currentTabId,
            ruleId: '',
            ruleName: '',
            faceContrastType: 'COMPARE',
            faceTrigger: false,
            cmpFilterSwitch: 0,
            cmpSimilarity: 90,
            presetDetectionSwitch: false,
            channelResultSwitch: false,
            overlapSwitch: false,
            channelDetectTime: 5,
            overlapRatio: 3,
            overlapNum: 1,
            faceUpload: ['success', 'failed'],
            faceLib: [{ faceLibId: '', faceLibName: '', faceLibThreshold: 70}],
            msgPush: ['diana'],
            secondaryFilterCloudRuleInfoList: [],
            targetObjLabelLineId: this.initTargetObjLabelLineId,
            confidenceThreshold: 70,
            duration: 1,
            durationSensitive: 0,
            sizeFilter:{ sizeFilterValid: false, minWidth: 0.1, minHeight: 0.1, maxWidth: 0.2, maxHeight: 0.2 },
            valid: true,
            numberJudgeCondition: 2,
            maxTargetNum: 1,
            triggerInterval: this.alertInterval || 60,
            scoreFilter: {},
            maxTriggerValid: 1,
            maxTriggerTimes: 1,
            sensitivity: 70,
            areaRatio: 1,
            validFlag: true,
            outOfPolygonDisplay: false,
            numberConditionValid: false,
            isStillFilterEnable: false,
            customInfoEnabled: false,
            customInfo: '',
            relationAnalysisValid: false,
            relationAnalysisType: 1,
            subTargetInfo: [],
            isOSDEnable: false,
            stillFilterMode: '0',
            countingModeEnum: 'FIXED_COUNTING',
            stillFilterSensitive: 90,
            channelIdList: [],
            countInterval: 60,
            timeInterval: 1,
            uniteType: 'THEN',
            uniteChildRules: [
              { ruleId: '', uniteChildRuleName: '子规则1', targetObjLabelLineId: this.initTargetObjLabelLineId, confidenceThreshold:70, propertyIds: {}, propertyEnables: {}, targetStatusInfos: {}, triggerType: ['ARRANGE_CLASSIFY'].includes(this.algorithmVersionType) ? 1073758210: 1073758209, duration: 1, confidenceThreshold: 70, durationSensitive: 0, uniteRuleMaxTriggerValid: 1, uniteRuleMaxTriggerTimes: 1, uniteRuleTriggerInterval: 60, sizeFilter: { sizeFilterValid: false, minWidth: 0.1, minHeight: 0.1, maxWidth: 0.2, maxHeight: 0.2 }, showCollapseFlag: false, sensitivity: 70, numberConditionValid: false, isStillFilterEnable: false, customInfoEnabled: false, customInfo: '', relationAnalysisValid: false, relationAnalysisType: 1, subTargetInfo: [], isOSDEnable: false, stillFilterMode: '0', countingModeEnum: 'FIXED_COUNTING', stillFilterSensitive: 90, countInterval: 60, timeInterval: 1, numberJudgeCondition: 2, minTargetNum: 1, maxTargetNum: 5, uniteRuleMinInterval: 0, uniteRuleMaxInterval: 100, outOfPolygonDisplay: false },
              { ruleId: '', uniteChildRuleName: '子规则2', targetObjLabelLineId: this.initTargetObjLabelLineId, confidenceThreshold:70, propertyIds: {}, propertyEnables: {}, targetStatusInfos: {}, triggerType: ['ARRANGE_CLASSIFY'].includes(this.algorithmVersionType) ? 1073758210: 1073758209, duration: 1, confidenceThreshold: 70, durationSensitive: 0, uniteRuleMaxTriggerValid: 1, uniteRuleMaxTriggerTimes: 1, uniteRuleTriggerInterval: 60, sizeFilter: { sizeFilterValid: false, minWidth: 0.1, minHeight: 0.1, maxWidth: 0.2, maxHeight: 0.2 }, showCollapseFlag: false, sensitivity: 70, numberConditionValid: false, isStillFilterEnable: false, customInfoEnabled: false, customInfo: '', relationAnalysisValid: false, relationAnalysisType: 1, subTargetInfo: [], isOSDEnable: false, stillFilterMode: '0', countingModeEnum: 'FIXED_COUNTING', stillFilterSensitive: 90, countInterval: 60, timeInterval: 1, numberJudgeCondition: 2, minTargetNum: 1, maxTargetNum: 5, uniteRuleMinInterval: 0, uniteRuleMaxInterval: 100, outOfPolygonDisplay: false }
            ]
          }
          additemObj.scoreFilter = (this.scoreFullData && this.scoreFullData.scoreFilter) ? JSON.parse(JSON.stringify(this.scoreFullData.scoreFilter)) : {}
          additemObj.numberConditionValid = ['NORMAL_RULE'].includes(this.rulesFormData.detectedType) // 定时任务的数量配置开关不显示，但要赋值true开启
          this.currentEditRulesDataByTab.push(additemObj)
          this.showRulesInfo(this.currentEditRulesDataByTab[this.currentEditRulesDataByTab.length - 1], (this.currentEditRulesDataByTab.length - 1), true)// 选中该条规则
        }
      }
    },
    handleSingleDataFun () {
      return new Promise(resolve => {
        this.editRulesDataSelf.forEach((item, index) => {
        // this.currentEditRulesDataByTab.forEach((item, index) => {
          item.targetStatusInfos = this.handleCommonDataFun(item)
        })
        resolve(true)
      })
    },
    handleUnitDataFun () {
      return new Promise(resolve => {
        this.editRulesDataSelf.forEach((item, index) => {
          item.uniteChildRules && item.uniteChildRules.forEach((tabItem, tIndex) => {
            // tabItem.targetStatusInfos = this.handleCommonDataFun(tabItem)
            let arr = this.handleCommonDataFun(tabItem)
            let temp = []
            arr.forEach(val => {
              if (val.propLabelLineId.length > 0 && tabItem.targetObjLabelLineId === val.propLabelLineId.substr(0,1)) {
                temp.push(val)
              } else if (tabItem.targetObjLabelLineId === '-2') { // 和上面分开吧，后续可能有逻辑改动，清晰一些
                temp.push(val)
              }
            })
            tabItem.targetStatusInfos = temp
          })
        })
        resolve(true)
      })
    },
    handleCommonDataFun (tabItem) {
      tabItem.targetStatusInfos = []
      for (var key in tabItem.propertyIds) {
        tabItem.targetStatusInfos.push({
          attrType: key,
          propLabelLineId: tabItem.propertyIds[key]
        })
      }
      tabItem.targetStatusInfos && tabItem.targetStatusInfos.forEach(checkitem => {
        for (var key in tabItem.propertyEnables) {
          if (checkitem.attrType === key) {
            checkitem.enable = tabItem.propertyEnables[key].attrTypeEnable
            checkitem.confidenceThreshold = tabItem.propertyEnables[key].confidenceThreshold
          }
        }
      })
      return tabItem.targetStatusInfos
    },
    setActiveTab (tIndex) {
      this.editableTabsValue = this.editableTabs[tIndex].name
    },
    changeSelectpro () {
      this.rulesFormData.propertyIds = this.propertyIds
      this.rulesFormData.propertyEnables = this.propertyEnables
      this.$forceUpdate()
    },
    changeState (item, index) {
      this.rulesFormData.propertyEnables = this.propertyEnables
      this.$forceUpdate()
    },
    changeTabState () {
      this.$forceUpdate()
    },
    setAssociatedAlarmTabProps(item) {
      let arr = []
      if (this.detectionObjectList.length && this.detectionObjectList[0].targetObjLabelLineId === '-2') {
        arr = this.detectionObjectList
      } else {
        arr = this.detectionObjectList.filter(filterV => filterV.targetObjLabelLineId !== item.targetObjLabelLineId) // 排除当前主对象
      }
      return { // 传递给子规则tab的一些父级数据
        algorithmVersionType: this.algorithmVersionType,
        detectionObjectList: arr
      }
    },
    changeUniteRelationAnalysisValid(tabIndex, tabItem) {
      if (this.rulesFormData.uniteChildRules[tabIndex].relationAnalysisValid) {
        let uniteAssociatedAlarmTabProps = this.setAssociatedAlarmTabProps(tabItem)
        this.$nextTick(() => {
          this.$refs[`associatedAlarmTabsRef${tabIndex}`] && this.$refs[`associatedAlarmTabsRef${tabIndex}`][0].initAssociatedAlarmTab(tabItem.subTargetInfo, uniteAssociatedAlarmTabProps, this.rulesFormData)
        })
      }
    },
    showRulesInfo (item, index, addFlag) {
      this.initFinishFlag = false
      this.editableTabs = []
      this.editableTabsValue = this.editableTabs.length ? this.editableTabs[0].name : 'tab1'
      this.currentRulesIndex = index
      this.rulesFormData = item

      if (['DETECT', 'COMBINED','ARRANGE', 'ARRANGE_DETECT', 'ARRANGE_COMBINED'].includes(this.algorithmVersionType)) { // 走检测对象改变的方法来改变各对象属性
        this.propertyIds = {}
        this.propertyEnables = {}
      } else if (['CLASSIFY', 'ARRANGE_CLASSIFY'].includes(this.algorithmVersionType)) { // 没有检测对象，所以直接走自己的对象属性
        let keyObj = {}
        let enableObj = {}
        this.propertyList.forEach(item => { // 各对象属性默认选中第一个，按钮打开，
          keyObj[item.attrType] = item.attrValues[0].propLabelLineId
          enableObj[item.attrType] = {}
          enableObj[item.attrType].attrTypeEnable = true
          enableObj[item.attrType].confidenceThreshold = 70
        })
        this.propertyIds = keyObj
        this.propertyEnables = enableObj
      }
      if (addFlag) { // 添加时，默认属性选中第一个
        this.propertyList.forEach(item => {
          this.propertyIds[item.attrType] = item.attrValues[0].propLabelLineId
          this.propertyEnables[item.attrType] = {}
          this.propertyEnables[item.attrType].attrTypeEnable = true
          this.propertyEnables[item.attrType].confidenceThreshold = 70
        })
        this.rulesFormData.propertyIds = this.propertyIds
        this.rulesFormData.propertyEnables = this.propertyEnables
        this.rulesFormData.uniteChildRules && this.rulesFormData.uniteChildRules.forEach((tabItem, tabIndex) => {
          this.handleTabPropertyIdsFun(tabIndex)
        })
      } else {
        this.propertyIds = this.rulesFormData.propertyIds
        this.propertyEnables = this.rulesFormData.propertyEnables
      }
      item.uniteChildRules && item.uniteChildRules.forEach((tabItem, tabIndex) => {
        this.editableTabs.push({
          title: `子规则${tabIndex + 1}`,
          name: `tab${tabIndex + 1}`
        })
        let uniteAssociatedAlarmTabProps = this.setAssociatedAlarmTabProps(tabItem)
        this.$nextTick(() => {
          // 组合规则的联动报警的子规则tab
          this.$refs[`associatedAlarmTabsRef${tabIndex}`] &&
          this.$refs[`associatedAlarmTabsRef${tabIndex}`][0] &&  
          this.$refs[`associatedAlarmTabsRef${tabIndex}`][0].initAssociatedAlarmTab(tabItem.subTargetInfo, uniteAssociatedAlarmTabProps, this.rulesFormData)
        })
      })
      let associatedAlarmTabProps = this.setAssociatedAlarmTabProps(item)
      this.$nextTick(() => {
        // this.$refs.chooseAnalysisRules && this.$refs.chooseAnalysisRules.init(this.editRulesDataSelf[index].secondaryFilterCloudRuleInfoList || [])
        this.$refs.chooseAnalysisRules && this.$refs.chooseAnalysisRules.init(this.currentEditRulesDataByTab[index].secondaryFilterCloudRuleInfoList || [])
        this.$refs.rulesForm.validate((valid) => {})// 切换规则时要做一遍校验
        this.initFinishFlag = true
        this.$refs.associatedAlarmRef && this.$refs.associatedAlarmRef.initAssociatedAlarmTab(item.subTargetInfo, associatedAlarmTabProps, this.rulesFormData) // 单规则的联动报警的子规则tab
      })
    },
    async beforeDelRules (index, item) {
      if (item.ruleId) { // 不是这次新增的规则，先判断是否被其他任务二次过滤使用了
        let { code, data } = await checkRuleIsRefBySecondaryAnalysis({ ruleId: item.ruleId, taskId: this.taskForm.taskId })
        if (code === 0) {
          if (data) {
            this.$confirm(`确定删除规则${item.ruleName}？`, {
              message: '该规则已被其他二次分析任务引用',
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'question'
            }).then(() => {
              this.delRules(index, item)
            })
          } else {
            this.delRules(index, item)
          }
        }
      } else {
        this.delRules(index, item)
      }
    },
    async delRules (index, item) {
      this.$confirm(`确定删除规则${item.ruleName}？`, {
        message: '删除规则会删除该规则下的区域绘制数据',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'question'
      }).then(() => {
        this.currentEditRulesDataByTab.splice(index, 1)
        if (this.currentEditRulesDataByTab.length > 0) { // 删除一条规则，选中现在数组的第一条规则
          this.showRulesInfo(this.currentEditRulesDataByTab[0], 0)
        } else {
          this.$refs.rulesForm.resetFields()
        }
      })
    }
  }
}

</script>
<style lang="scss" scoped>
.score_wrap{
  margin-top: 10px;
}
</style>
<style lang="scss">
  .advance_wrap{
    margin-bottom:24px;
    .el-form-item{
      margin-bottom:16px;
    }
    .score_wrap{
      .el-form-item__content{
        display: flex;
        align-items: center;
      }
    }
  }
  .dark_filter_tooltip{
    background: #474747!important;
  }
  .config_rules_area{
    display: flex;
    .demo-scrollbar-wrap{
      height: calc(100vh - 230px);
    }
    .rules-detail-basic-config{
      .el-form-item__label{
        width: 110px !important;
      }
    }
    .face-detail-basic-config{
      padding: 12px 24px 12px 20px!important;
      margin-bottom: 24px;
      .el-table__empty-block{
        width: 500px!important;
      }
      .el-form-item__label{
        width: 140px !important;
        text-align: left !important;
      }
      .faceLib_form_item{
        .faceLibThreshold_wrap{
          display: flex;
          align-items: center;
          font-size: 14px;
        }
      }
    }
    .confidenceThreshold_wrap{
      // display: inline-block;
      display: flex;
      float: right;
      margin-left:10px;
      height: 32px;
      &>div{
        display: inline-block;
      }
    }
    .confidence_input{
      width: 68px;
      .el-input{
        input{
          border-left: none;
        }
      }
    }
    .confidence_unit{
      position: absolute;
      right: 24px;
      z-index: 2;
    }
    .tab-rules-detail-basic-config{
      .el-form-item__label{
        // width: 110px !important;
        width: 150px !important;
      }
    }
    .config_rules_right,.config_rules_left{
      height: calc(100VH - 250px);
    }
    .config_rules_right{
      height: calc(100VH - 250px);
      .rules-detail-sub-tilte{
        padding: 0 0 6px 0;
        font-weight: 700;
      }
    }
    .unit_form_wrap{
      width: 700px;
      .unit_flex_wrap{
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        justify-content: space-between;
        .el-form-item{
          width: 40%;
        }
        .has_unit_form_item{
          display: flex;
          align-items: center;
          justify-content: space-between
        }
      }
    }
    .config_self_right{
      margin-bottom: 20px;
      width: calc(100% - 500px);
      margin-left: 50px
    }
    .property_div_noBg{
      padding-top:4px;
      padding-bottom:16px;
    }
    .property_div{
      background: #f5f5f5;
      width:660px;
      padding-top:16px;
      padding-bottom:16px;
      margin-bottom:16px;
      .number_judge_condition_select{
        .el-form-item__label{
          width:150px!important
        }
      }
      .el-form-item{
        display: flex;
        // align-items: center;
        justify-content: flex-start;
      }
      .el-form-item__content{
        margin-left: 0!important
      }
      .el-form-item:last-child{
        margin-bottom:0px!important
      }
    }
    .property_div{
      .el-form-item{
        margin-bottom: 12px;
      }
    }
    .rules_form_sizeFilter{
      display:flex;
      align-items: center;
      margin-left: 20px;
      flex-wrap: wrap;
      .el-form-item{
        margin-bottom: 0;
      }
      .el-form-item__label{
        // width: 71px!important;
        width: 110px!important;
        padding-right: 0!important
      }
      .el-form-item__content{
        margin-left: 20px!important;
      }
    }
    .rules_form_time{
      display:flex;
      align-items: center;
      margin-left: 20px;
      .el-form-item{
        margin-bottom: 0;
      }
      .el-form-item__label{
        width: 110px!important;
        padding-right: 0!important
      }
      .el-form-item__content{
        margin-left: 20px!important;
      }
    }
    .unit{
      margin-left:10px
    }
    .card_right{
      .card_config{
        .el-form-item__content{
          display: flex;
          align-items: center;
          margin-left: 0px!important
        }
      }
    }
    .c_s_c_w_card_cross{
      .cross_slider{
        position: relative;
        .el-input-number{
          width: 68px!important;
        }
        .el-slider__runway.show-input{
          margin-right: 80px;
        }
      }
      .precision_cross_slider{
        .el-input-number{
          .el-input__inner{
            // color: #fff;
          }
        }
      }
    }
  }
  .filter_white_tooltip{
    background: #fff!important;
  }

</style>
<style lang="scss" scoped>
  @import './style';
  .emptyChannel{
    border: 1px solid #fa3239
  }
  .rule_tab{
    width: 1120px;
    margin-left: 60px;
    .el-tabs__active-bar{
      width: 100%;
    }
  }
  .split_column_line{
    border-right: 1px solid #ccc;
    margin-top: -15px;
    height: calc(100VH - 240px);
  }
  .channal_status__check_wrap{
    display: flex;
    flex-wrap: wrap;
    .c_s_c_w_card{
      width: 380px;
      height: 100%;
      margin-right: 16px;
      border: 1px solid #F5F5F5;
      border-radius: 6px;
      padding: 12px 12px 12px 16px;
      margin-bottom: 12px;
      display: flex;
      img{
        margin-top: 20px;
        margin-right: 24px;
        width: 72px;
        height: 72px;
      }
    }
    .card_right{
      position: relative;
      .switch_div{
        position: absolute;
        top: 0;
        right: 0;
      }
    }
    .c_s_c_w_card_preset{
      padding-bottom: 30px;
    }
    .c_s_c_w_card_time{
      
    }
    .c_s_c_w_card_cross{
      display: block;
      clear: both;
      .card_bot{
        display: flex;
        justify-content: space-between;
      }
      .demo_img{
        width: 160px;
        height: 100px;
      }
    }
    .card_title{
      color: rgba(0,0,0,0.70);
      line-height: 20px;
      margin-bottom: 16px;
      margin-top: 24px;
    }
    .card_des{
      color: rgba(0,0,0,0.40);
      line-height: 20px;
    }
  }
</style>
