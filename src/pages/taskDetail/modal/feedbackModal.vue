<template>
  <div class="feedback-modal">
    <!-- <el-dialog title="数据回传" :visible="visible" @close="close" :area="[480,305]"> -->
    <el-dialog title="数据回传" :visible="visible" @close="close" :area="[560,320]" custom-class="feedback-modal" :close-on-click-modal=false>
        <el-form ref="form" :model="taskForm" label-width="100px" :rules="rules" >
          <el-form-item label="日期" prop="taskValDate" :required-right="false" :rules="{required: true}">
            <el-date-picker
              v-model="taskForm.taskValDate"
              type="daterange" :clearable="false"
              :picker-options="pickerOptions"
              style="width: 320px;">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="时间段" prop="executeValDate" :required-right="false" :rules="{required: true}">
            <el-time-picker is-range v-model="taskForm.executeValDate" format="HH:mm" value-format="HH:mm" placeholder="选择时间范围" @change="executeValChanges"
               :clearable="false" style="width: 320px;">
            </el-time-picker>
          </el-form-item>
          <!-- <el-form-item label="通道" prop="channelIdList" :required-right="false">
            <el-select v-model="taskForm.channelIdList" tag-title :tag-max-width="50" collapse-tags
            @change="changeChannelIds" placeholder="请选择通道" filterable multiple style="width: 320px;">
              <el-option v-for="(item,index) in channelParentList" :key="index" :value="item.channelId" class="channelSelectOption" :label="item.channelNameSubstr">
                <div :title="item.channelName">{{item.channelNameSubstr}}</div>
                <div :title="item.groupName">{{item.groupNameSubstr}}</div>
              </el-option>
            </el-select>
          </el-form-item> -->
          <el-form-item label="通道" prop="channelOptions" :required-right="false" :rules="{required: true}">
            <el-radio-group v-model="taskForm.isAllChannelsSelected">
              <el-radio :label="false">按{{applicationSceneName}}选择通道</el-radio>
              <el-radio :label="true">全选所有通道</el-radio>
            </el-radio-group>
            <h-select-tree-option :option-data="optionData" :has-contain="false" v-model="taskForm.channelOptions" style="width: 320px;margin-top:6px"
            :option="{name: 'channelName',value: 'channelId'}" :clearable="false" isBroad  @tree-search="treeSearch" v-if="!taskForm.isAllChannelsSelected"
            input-placeholder="请选择通道" ref="channelSelect" @panel-change="panelChange" :option-search-fn="optionSearch">
              <template slot="tree">
                <el-tree ref="storeTree" :data="treeData" simple-data node-key="groupId" parent-key="parentId" :default-expand-all="true"
                  :current-node-key="currentNodeKey" :props="defaultProps" @node-click="handleNodeClick" :filter-node-method="filterNode">
                </el-tree>
              </template>
            </h-select-tree-option>
          </el-form-item>
        </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="save">确认</el-button>
        <el-button @click="close">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { feedback, getStoreTree, getDeviceOptions } from '../proxy'
import { getFormatTime } from '@/assets/libs/util'
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    algorithmId: {
      type: String,
      default: ''
    },
    taskId: {
      type: String,
      default: ''
    }
  },
  data () {
    let checkChannelIds = (rule, value, callback) => {
      if (this.taskForm.channelIdList.length === 0) {
        callback(new Error('请选择通道'))
      } else {
        callback()
      }
    }
    return {
      taskForm: {
        taskValDate: [new Date(new Date().getTime() - 3600 * 1000 * 24 * 6), new Date()], // 日期
        channelIdList: [], // 选中的通道数组
        executeValDate: [], // 时间段
        algorithmId: '',
        taskId: '',
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        isAllChannelsSelected: false,
        channelOptions: {
          values: [],
          datas: []
        }
      },
      targetNode: {},
      treeData: [],
      currentNodeKey: '',
      defaultProps: {
        label: 'groupName'
      },
      optionData: [],
      optionDataAll: [], /// / 原始的树对象选择数据，修复pro的树对象的搜索全选的缺陷
      rules: {
        channelIdList: [{ required: true, validator: checkChannelIds, trigger: 'blur' }]
      }
    }
  },
  computed: {
    pickerOptions: function () {
      let oneDay = 24 * 60 * 60 * 1000
      let bDate = ''
      let aDate = new Date().getTime()
      return {
        disabledDate (time) {
          if (time > bDate && time < aDate) {
            return false
          } else {
            return true
          }
        },
        onPick (dateObj) {
          if (dateObj.minDate && !dateObj.maxDate) {
            bDate = dateObj.minDate.getTime() - oneDay * 7
            aDate = (dateObj.minDate.getTime() + oneDay * 7) > new Date().getTime() ? new Date().getTime() : (dateObj.minDate.getTime() + oneDay * 7)
          } else if (dateObj.maxDate) {
            bDate = ''
            aDate = (new Date().getTime() + oneDay * 7) > new Date().getTime() ? new Date().getTime() : (new Date().getTime() + oneDay * 7)
          }
        }
      }
    }
  },
  watch: {
    visible (val) {
      if (val) {
        this.getStoreTree()
        this.taskForm.taskValDate = [new Date(new Date().getTime() - 3600 * 1000 * 24 * 6), new Date()]// 日期初始赋值
        this.taskForm.executeValDate = [new Date('2019/07/13 00:00:00'), new Date('2019/07/13 23:59:00')]// 时间段初始赋值
      } else {
        this.taskForm.channelIdList = []
        this.taskForm.isAllChannelsSelected = false
        this.chooseTime = null
        this.taskForm.channelOptions = { values: [], datas: [] }
      }
    }
  },
  methods: {
    optionSearch (val) {
      if (val) {
        this.optionData = this.optionDataAll.filter(item => item.channelName.indexOf(val) > -1)
      } else {
        this.optionData = this.optionDataAll
      }
    },
    getStoreTree () {
      return new Promise((resolve) => {
        getStoreTree({ taskId: this.taskId }).then(res => {
          if (res.code === 0 && res.data && res.data.length) {
            this.treeData = res.data
            this.targetNode = res.data[0]
            this.$nextTick(() => {
              this.$refs.storeTree && this.$refs.storeTree.setCurrentKey(this.targetNode.groupId)
              this.handleNodeClick(this.targetNode)
            })
            resolve()
          }
        })
      })
    },
    panelChange (val) {
      if (val && this.targetNode) {
        this.$refs.storeTree && this.$refs.storeTree.setCurrentKey(this.targetNode.groupId)
        this.handleNodeClick(this.targetNode)
      }
    },
    treeSearch (value) {
      this.$refs.storeTree.filter(value)
    },
    handleNodeClick (data) {
      this.$refs.channelSelect.optionClear()
      this.getDeviceList(data.groupId)
    },
    filterNode (value, data) {
      if (!value) return true
      return data.groupName.indexOf(value) !== -1
    },
    getDeviceList (groupId) { // 查询设备列表
      getDeviceOptions({ groupId: groupId, taskId: this.taskId }).then(res => {
        if (res.code === 0) {
          // this.optionData = res.data || []
          this.optionData = JSON.parse(JSON.stringify(res.data)) || []
          this.optionDataAll = JSON.parse(JSON.stringify(res.data)) || []
        }
      })
    },
    executeValChanges (val) {
      if (val) {
        this.taskForm.startTime = val[0]
        this.taskForm.endTime = val[1]
      } else {
        this.taskForm.startTime = ''
        this.taskForm.endTime = ''
      }
    },
    // 中国标准时间转化为yyyy-MM-dd
    transformTime (day) {
      let d = new Date(day)
      let nomal = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()
      return nomal
    },
    save () {
      // this.$refs.form.validate(valid => {
      //   if (valid) {
      if (!this.taskForm.isAllChannelsSelected && !this.taskForm.channelOptions.values.length) {
        this.$message.warning('请选择通道！')
        return false
      }
      this.taskForm.startDate = getFormatTime(this.taskForm.taskValDate[0]).substr(0, 10)
      this.taskForm.endDate = getFormatTime(this.taskForm.taskValDate[1]).substr(0, 10)
      this.taskForm.startTime = this.taskForm.startTime ? this.taskForm.startTime : '00:00'
      this.taskForm.endTime = this.taskForm.endTime ? this.taskForm.endTime : '23:59'
      this.taskForm.algorithmId = this.algorithmId || ''
      this.taskForm.taskId = this.taskId || ''
      this.taskForm.channelIdList = this.taskForm.channelOptions.datas.map(item => { return item.channelId })
      feedback(this.taskForm).then((res) => {
        if (+res.code === 0) {
          this.$message.success('数据回传成功')
          this.close()
        }
      })
      //   }
      // })
    },
    close () {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "../style.scss";
</style>
<style lang="scss">
 .feedback-modal{
   .el-form-item__content{
     text-align: left!important;
   }
   .el-dialog__body-wrapper{
    padding-bottom:0
  }
  .is-undefined{
    margin-left:0;
    width: 0
  }
 }
 .el-select-dropdown__list{
   .channelSelectOption{
    border: 1px dotted #ccc;
    height: 45px!important;
  }
 }
</style>
