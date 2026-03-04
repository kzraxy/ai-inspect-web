<template>
  <h-select-tree-option :option-data="optionData" :has-contain="false" v-model="channelOptions" :option="{name: 'ruleName',value: 'ruleId'}"
  isBroad  @tree-search="treeSearch" input-placeholder="请选择分析规则" ref="channelSelect" @panel-change="panelChange"
  :option-search-fn="optionSearch" :max-select="10" :style="{width:width+'px'}" :show-all-tags="true" :has-showNum="false" class="choose_analysis_rules"
  id="chooseAnalysisRules" @save-click="saveClick" @remove-single="removeSingle" @remove-all="removeAll">
    <template slot="tree">
      <el-tree ref="storeTree" :data="treeData" simple-data node-key="taskId" parent-key="parentId" :default-expand-all="true"
        :current-node-key="currentNodeKey" :props="defaultProps" @node-click="handleNodeClick" :filter-node-method="filterNode">
      </el-tree>
    </template>
  </h-select-tree-option>
</template>

<script>
import { getTasksBySeconaryFilter, getTaskRulesBySeconaryFilter } from '../proxy'
export default {
  props: {
    width: {
      type: Number,
      default: 240
    },
    chooseFilterList: {
      type: Array,
      default: () => []
    },
    currentTaskId: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      tagWidth: 0,
      containerWidth: 200,
      channelOptions: {
        values: [],
        datas: []
      },
      targetNode: {},
      treeData: [],
      currentNodeKey: '',
      defaultProps: {
        label: 'taskName'
      },
      optionData: [],
      optionDataAll: [] /// / 原始的树对象选择数据，修复pro的树对象的搜索全选的缺陷
    }
  },
  mounted () {
    this.getTasksBySeconaryFilter()
    this.containerWidth = this.width - 40
  },
  methods: {
    init (chooseData) {
      this.$nextTick(() => {
        this.channelOptions = { values: [], datas: [] }
        if (chooseData && chooseData.length > 0) {
          chooseData.forEach(item => {
            item.id = item.ruleId
            this.channelOptions.values.push(item.ruleId)
          })
          this.channelOptions.datas = [...chooseData]
        }
      })
    },
    saveClick () {
      this.computedInputHeight()
      this.$nextTick(() => {
        this.$emit('getValues', this.channelOptions.datas)
      })
    },
    removeSingle () {
      this.computedInputHeight()
      this.$nextTick(() => {
        this.$emit('getValues', this.channelOptions.datas)
      })
    },
    removeAll () {
      this.computedInputHeight()
      this.$nextTick(() => {
        this.$emit('getValues', this.channelOptions.datas)
      })
    },
    panelChange (val) {
      if (val && this.targetNode) {
        this.$refs.storeTree && this.$refs.storeTree.setCurrentKey(this.targetNode.taskId)
        this.handleNodeClick(this.targetNode)
      }
    },
    computedInputHeight () { // 计算标签展示的容器的高度
      this.$nextTick(() => {
        setTimeout(() => {
          const tagsContainer = document.getElementsByClassName('tags-container')[0]
          let arr = tagsContainer.getElementsByClassName('el-tag')
          let domsArr = [...arr]
          this.tagWidth = 0
          domsArr.forEach(item => {
            this.tagWidth = parseInt(window.getComputedStyle(item).width) ? this.tagWidth += (parseInt(window.getComputedStyle(item).width) + 33) : this.tagWidth
          })
          this.setDomHeight()
        }, 300)
      })
    },
    setDomHeight (height) { // 设置容器的高度
      const selectDom = document.getElementById('chooseAnalysisRules')
      const multiSearchTags = document.getElementsByClassName('multi-search-tags')[0]
      const selfInput = multiSearchTags.getElementsByClassName('el-input__inner')[0]
      if (height) {
        selectDom.style.height = height
        selfInput.style.height = height
      } else {
        let rate = Math.ceil(this.tagWidth / (this.containerWidth - 35))
        selectDom.style.height = rate > 0 ? 32 * rate + 'px' : '32px'
        selfInput.style.height = rate > 0 ? 32 * rate + 'px' : '32px'
      }
    },
    clear () {
      this.channelOptions = { values: [], datas: [] }
    },
    optionSearch (val) {
      if (val) {
        this.optionData = this.optionDataAll.filter(item => item.ruleName.indexOf(val) > -1)
      } else {
        this.optionData = this.optionDataAll
      }
    },
    getTasksBySeconaryFilter () {
      return new Promise((resolve) => {
        getTasksBySeconaryFilter().then(res => {
          if (res.code === 0 && res.data && res.data.length) {
            this.treeData = res.data
            this.targetNode = res.data[0]
            this.$nextTick(() => {
              this.$refs.storeTree && this.$refs.storeTree.setCurrentKey(this.targetNode.taskId)
              this.handleNodeClick(this.targetNode)
            })
            resolve()
          }
        })
      })
    },
    treeSearch (value) {
      this.$refs.storeTree.filter(value)
    },
    handleNodeClick (data) {
      this.$refs.channelSelect.optionClear()
      this.getRulesList(data.taskId)
    },
    filterNode (value, data) {
      if (!value) return true
      return data.taskName.indexOf(value) !== -1
    },
    getRulesList (taskId) {
      getTaskRulesBySeconaryFilter({ taskId: taskId, currentTaskId: this.currentTaskId }).then(res => {
        if (res.code === 0 && res.data) {
          this.optionData = [...res.data]
          this.optionDataAll = [...res.data]
        }
      })
    }
  }
}
</script>

<style lang="scss">
.choose_analysis_rules{
  overflow: hidden;
  .tags-container{
    overflow: unset!important;
  }
  .calc-tag-warpper{
    visibility: hidden;
  }
}

</style>
