<template>
  <div class="associatedAlarmTabs">
    <el-button @click="addTab(activeTabVal)"  icon="h-icon-add" :plain="true" style="margin-bottom: 10px;" :disabled="associatedAlarmInfo.length>=8">
      {{'添加子目标（' + associatedAlarmInfo.length + '/8）'}}
    </el-button>
    <el-tabs v-model="activeTabVal" type="border-card" closable @tab-remove="removeTab" v-show="associatedAlarmInfo.length" @tab-click="changeTab">
      <el-tab-pane v-for="(subitem, subindex) in associatedAlarmInfo" :key="subindex" :label="subitem.name" :name="subitem.name">
        <el-form-item label="子目标" prop="subTargetObjLabelLineId" style="margin-bottom: 12px;" v-show="subitem.subTargetObjLabelLineId!=='-2'">
          <el-select v-model="subitem.subTargetObjLabelLineId" style="width: 300px;" @change="changetargetObj(subitem,subindex)">
            <el-option v-for="(item,index) in detectionObjectList" :key="index" :label="item.labelName" :value="item.targetObjLabelLineId"></el-option>
          </el-select>
        </el-form-item>
        <div v-if="attrSelectList.length>0" class="attr-wrap">
          <div class="rules-detail-sub-tilte" style="margin-left: 81px;">对象属性</div>
          <div>
            <el-form-item v-for="(attrItem,attrIndex) in subitem.subTargetStatusInfos" :key="attrIndex" :label="getAttrLabel(attrItem)" label-width="150px">
              <el-select v-model="subitem.subTargetStatusInfos[attrIndex].propLabelLineId" :style="{'width':'200px'}" :disabled="!subitem.subTargetStatusInfos[attrIndex].enable">
                <el-option v-for="(attrSel,attrSelIdx) in getAttrValuesList(attrItem)" :key="attrSelIdx" :label="attrSel.propName" :value="attrSel.propLabelLineId"></el-option>
              </el-select>
              <el-switch v-model="subitem.subTargetStatusInfos[attrIndex].enable" style="margin-left:15px"></el-switch>
            </el-form-item>
          </div>
        </div>
        <el-form-item label="灵敏度" introduction="当主、子目标关联度低于设定值(可选范围1-100)时，目标关联失败">
          <el-input-number v-model="subitem.sensitive" :min=1 :max=100 style="width: 170px;" :key="inputNumberKey" @blur="() => {inputNumberKey = Math.random()}"></el-input-number>
        </el-form-item>
        <el-form-item label="持续时间" introduction="可选范围是0-1800秒" v-show="!['LINE_TARGET_STATISTIC','AREA_TARGET_STATISTIC'].includes(detectedType)">
          <el-input-number v-model="subitem.duration" style="width: 170px;" type="number" :min=0 :max=1800 :key="inputNumberKey" @blur="() => {inputNumberKey = Math.random()}"></el-input-number><span class="unit">秒</span>
        </el-form-item>
        <div v-show="['AREA_TARGET_DETECT'].includes(detectedType) || (['UNITE_RULE'].includes(detectedType) && triggerType===1073758209)">
          <el-form-item label="目标数" style="margin-bottom:10px">
            <el-switch v-model="subitem.subTargetNumberCondition.numberConditionValid"></el-switch>
          </el-form-item>
          <div v-if="subitem.subTargetNumberCondition.numberConditionValid">
            <el-form-item label="范围" class="number_judge_condition_select">
              <el-select v-model="subitem.subTargetNumberCondition.numberJudgeCondition" style="width: 300px;">
                <el-option label="大于等于最大值" :value = 2></el-option>
                <el-option label="大于最小值且小于最大值" :value = 3></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="最小值" v-if="[3].includes(subitem.subTargetNumberCondition.numberJudgeCondition)" introduction="不能 > 最大值">
              <el-input-number v-model="subitem.subTargetNumberCondition.minTargetNum" style="width: 170px;" title="不能 > 最大值"
              :min=0 :max="subitem.subTargetNumberCondition.maxTargetNum" :key="inputNumberKey" @blur="() => {inputNumberKey = Math.random()}"></el-input-number>
            </el-form-item>
            <el-form-item label="最大值" v-if="[2,3].includes(subitem.subTargetNumberCondition.numberJudgeCondition)" :introduction="[3].includes(subitem.subTargetNumberCondition.numberJudgeCondition) ? '不能 < 最小值':''">
              <el-input-number v-model="subitem.subTargetNumberCondition.maxTargetNum" style="width: 170px;" :title="[3].includes(subitem.subTargetNumberCondition.numberJudgeCondition) ? '不能 < 最小值':''"
              :min="subitem.subTargetNumberCondition.numberJudgeCondition===3?subitem.subTargetNumberCondition.minTargetNum:0" :max="65535" :key="inputNumberKey" @blur="() => {inputNumberKey = Math.random()}"></el-input-number>
            </el-form-item>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>


export default {
  props: {
    triggerType: {
      type: Number,
      default: 0
    },
    detectedType: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      inputNumberKey: Math.random(),
      associatedAlarmInfo: [],
      activeTabVal: '',
      subGoalTab: [],
      algorithmVersionType: '',
      detectionObjectList: [],
      currentTabIndex: 0,
      rulesFormData: {},
      isFinishFlag: true
    }
  },
  computed: {
    attrSelectList() { // 属性的下拉选列表，根据对象的下拉选值变化
      let arr = {targetStatusInfos: []}
      if (this.associatedAlarmInfo[this.currentTabIndex] && this.associatedAlarmInfo[this.currentTabIndex].subTargetObjLabelLineId) {
        arr = this.detectionObjectList.filter(item => item.targetObjLabelLineId === this.associatedAlarmInfo[this.currentTabIndex].subTargetObjLabelLineId)[0]
        if (!arr) {
          arr = {targetStatusInfos: []}
        }
      }
      return arr.targetStatusInfos
    }
  },
  methods: {
    getAttrValuesList(attrItem) {
      let arr = this.attrSelectList.filter(s=>s.attrType===attrItem.attrType)
      let attrList = arr.length > 0 ? arr[0].attrValues : []
      return attrList
    },
    getAttrLabel(attrItem) {
      let arr = this.attrSelectList.filter(s=>s.attrType===attrItem.attrType)
      let attrName = arr.length > 0 ? arr[0].attrName : ''
      return attrName
    },
    changeTab(tab) {
      this.currentTabIndex = tab.index
    },
    initAssociatedAlarmTab(data, associatedAlarmTabProps, parentData) {
      this.rulesFormData = parentData
      this.currentTabIndex = 0
      this.algorithmVersionType = associatedAlarmTabProps.algorithmVersionType
      this.detectionObjectList = associatedAlarmTabProps.detectionObjectList
      this.$nextTick(() => {
        this.associatedAlarmInfo = data || []
        this.activeTabVal = this.associatedAlarmInfo.length > 0 ? this.associatedAlarmInfo[0].name : ''
      })
    },
    changetargetObj(subitem) { // 切换对象，对应属性赋值默认第一个
      if (!this.isFinishFlag) {
        return false
      }
      subitem.subTargetStatusInfos = []
      this.associatedAlarmInfo[this.currentTabIndex].subTargetObjLabelLineId = subitem.subTargetObjLabelLineId
      if (this.attrSelectList.length > 0) {
        this.attrSelectList.forEach((item,index) => {
          subitem.subTargetStatusInfos.push({
            attrType: item.attrType,
            propLabelLineId: item.attrValues[0].propLabelLineId,
            enable: true,
          })
        })
      }
    },
    addTab() {
      let newTabName = `子目标${this.associatedAlarmInfo.length + 1}`
      let id = this.detectionObjectList[0].targetObjLabelLineId ? this.detectionObjectList[0].targetObjLabelLineId : '-2'
      this.associatedAlarmInfo.push({
        name: newTabName,
        subTargetObjLabelLineId: id,
        sensitive: 70,
        duration: 1,
        subTargetNumberCondition: {
          numberConditionValid: true,
          minTargetNum: 1,
          maxTargetNum: 5,
          numberJudgeCondition: 2,
        },
        subTargetStatusInfos: this.setAttrInitData()
      })
      this.currentTabIndex = this.associatedAlarmInfo.length - 1
      this.activeTabVal = newTabName
      this.updateParentRulesFormData()
    },
    updateParentRulesFormData() {
      this.rulesFormData.subTargetInfo = this.associatedAlarmInfo
    },
    setAttrInitData() {
      let attrInitData = []
      if (this.detectionObjectList[0].targetStatusInfos && this.detectionObjectList[0].targetStatusInfos.length > 0) { // 有属性
        this.detectionObjectList[0].targetStatusInfos.forEach(item => {
          attrInitData.push({
            attrType: item.attrType,
            propLabelLineId: item.attrValues[0].propLabelLineId,
            enable: true,
          })
        })
      }
      return attrInitData
    },
    removeTab(targetName) {
      this.isFinishFlag = false
      let index = +targetName.substr(targetName.length - 1) - 1
      // this.associatedAlarmInfo = tabs.filter(tab => tab.name !== targetName)
      this.associatedAlarmInfo.splice(index, 1)
      this.associatedAlarmInfo.forEach((item, index) =>  item.name = `子目标${index + 1}`)
      this.currentTabIndex = 0
      this.activeTabVal = this.associatedAlarmInfo.length > 0 ? this.associatedAlarmInfo[0].name : ''
      this.$nextTick(() => {
        this.isFinishFlag = true
      })
    },
  }
}
</script>
<style lang="scss" scoped>
.associatedAlarmTabs{
  padding: 0 80px 0 60px;
  .attr-wrap{
    padding: 6px 0;
    border: 1px dotted #ccc;
    margin-bottom: 16px;
  }
}
</style>
