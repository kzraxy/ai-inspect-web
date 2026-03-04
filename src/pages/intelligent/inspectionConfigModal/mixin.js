
import { checkCommonName } from '@/common/util.js'
export default {
  data() {
    return {
    }
  },
  methods: {
    validItemFlagFun (item, isArrangeAlgorithm, isArrangeAlgorithmScore) { // 添加规则和完成规则配置，都需要使用该方法进行最终数据校验
      item.validFlag = true
      let pattern = new RegExp("[`!%$^&*=|{}':;',/?！￥……&*;———|{}‘；：”“'。，？\\\\]+")
      if (item.ruleName === '' || pattern.test(item.ruleName)) { // 规则名称为空，含有不被允许的特殊字符,不符合验证的规则标红
        item.validFlag = false
      }
      if (!item.msgPush.length) { // 消息推送没选择
        item.validFlag = false
      }
      // 组合规则数据处理
      if (item.detectedType === 'UNITE_RULE') {
        item.uniteChildRules && item.uniteChildRules.forEach((tabItem, tIndex) => {
          if (tabItem.uniteChildRuleName === '' || pattern.test(tabItem.uniteChildRuleName)) {
            item.validFlag = false// 对子规则名称的校验反馈到主规则上
            this.setActiveTab(tIndex)
          } else if ((this.objectIdValidExistArr && this.objectIdValidExistArr.length > 0) && (this.objectIdValidExistArr.indexOf(tabItem.targetObjLabelLineId) < 0)) {
            item.validFlag = false// 检测对象为空，不符合验证的规则标红
            tabItem.targetStatusInfos = []
          } else if (tabItem.sizeFilter.sizeFilterValid && ((tabItem.sizeFilter.minWidth >= tabItem.sizeFilter.maxWidth) || (tabItem.sizeFilter.minHeight >= tabItem.sizeFilter.maxHeight))) {
            item.validFlag = false
          } else if (tabItem.numberConditionValid && ([3, 4].includes(tabItem.numberJudgeCondition) && (tabItem.minTargetNum >= tabItem.maxTargetNum))) {
            item.validFlag = false
          } else if(tabItem.customInfo && !checkCommonName.test(tabItem.customInfo)) {
            item.validFlag = false
          } else if (tabItem.relationAnalysisValid) {
            if (!tabItem.subTargetInfo.length) {
              item.validFlag = false
              setTimeout(() => {
                this.$message.warning("请配置关联子目标！")
              })
            } else {
              let repeatSubTargetIds = tabItem.subTargetInfo.map(v => v.subTargetObjLabelLineId)
              if (new Set(repeatSubTargetIds).size !== repeatSubTargetIds.length) {
                item.validFlag = false
                setTimeout(() => {
                  this.$message.warning("关联子目标里，请不要配置重复的子目标！")
                })
              }
            }
          }
        })
      } else {
        // 单规则数据处理，
        if (this.taskForm.analysisMode === 'SECONDARY_FILTER' && !item.secondaryFilterCloudRuleInfoList.length) { // 二次分析的分析规则没选
          item.validFlag = false
        } else if (
          !['CLOUD_ALL_RULE_DETECT', 'ALL_RULE_DETECT'].includes(item.detectedType) &&
          (this.objectIdValidExistArr && this.objectIdValidExistArr.length > 0) &&
          (this.objectIdValidExistArr.indexOf(item.targetObjLabelLineId) < 0) &&
          (['DETECT', 'COMBINED','ARRANGE'].includes(this.algorithmVersionType))
        ) {
          item.validFlag = false// 检测对象为空，不符合验证的规则标红
          item.targetStatusInfos = []
        } else if (item.sizeFilter.sizeFilterValid && ((item.sizeFilter.minWidth >= item.sizeFilter.maxWidth) || (item.sizeFilter.minHeight >= item.sizeFilter.maxHeight))) {
          item.validFlag = false
        } else if (item.numberConditionValid && ([3, 4].includes(item.numberJudgeCondition) && (item.minTargetNum >= item.maxTargetNum))) {
          item.validFlag = false
        } else if (item.customInfo && !checkCommonName.test(item.customInfo)) {
          item.validFlag = false
        } else if (item.relationAnalysisValid) {
          if (!item.subTargetInfo.length) {
            item.validFlag = false
            setTimeout(() => {
              this.$message.warning("请配置关联子目标！")
            })
          } else {
            let repeatSubTargetIds = item.subTargetInfo.map(item => item.subTargetObjLabelLineId)
            if (new Set(repeatSubTargetIds).size !== repeatSubTargetIds.length) {
              item.validFlag = false
              setTimeout(() => {
                this.$message.warning("关联子目标里，请不要配置重复的子目标！")
              })
            }
          }
        }
      }
      if (!['NORMAL_RULE', 'CLOUD_ALL_RULE_DETECT'].includes(item.detectedType) && !item.channelIdList.length && this.taskForm.isCustomRuleChannel) { // 通道没选择
        item.validFlag = false
      }
      if (!['NORMAL_RULE', 'CLOUD_ALL_RULE_DETECT'].includes(item.detectedType) && item.faceTrigger 
        && (item.faceLib.filter(face => !face.faceLibName).length > 0 || item.faceLib.filter(face => !face.faceLibId).length > 0)) { // 设备：人脸库列表项启用，并存在名称或ID没有输入的项
        item.validFlag = false
      }
      if (isArrangeAlgorithm && ['NORMAL_RULE'].includes(item.detectedType) && item.cmpFilterSwitch === -1) { // 图库过滤模式未配置
        item.validFlag = false
      }
      if (isArrangeAlgorithmScore && ['NORMAL_RULE'].includes(item.detectedType) && item.scoreFilter.scoreFilterParamValid) { //评分，必须勾选至少一个
        let scoreHas = item.scoreFilter.scoreInfo.filter(s => s.targetObjLabelLineId === item.targetObjLabelLineId)[0].scoreType
        let checkHas = scoreHas.some(c => c.defaultValid)
        item.validFlag = checkHas
      }
      return item
    }
  }
}