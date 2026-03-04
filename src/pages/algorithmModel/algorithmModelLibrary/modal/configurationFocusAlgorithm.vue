<template>
  <div class="configuration-focus-algorithm">
    <el-dialog title="配置关注算法" :visible="visible" @close="close" :area="[660,550]" :close-on-click-modal=false>
      <div class="configuration-focus-algorithm_content">
        <el-alert title="配置关注算法后，算法模型列表将只显示您关注的算法，并且仅自动同步您关注的算法。"
        type="info" simple show-icon :closable=false class="appkey_alert"></el-alert>
        <div class="content">
          <div class="content_title">选择算法</div>
          <div class="content_body">
            <div class="content-body_left">
              <div class="body_title">算法模型类型</div>
              <div class="body_tree">
                <el-tree
                  :data="treeData"
                  node-key="id"
                  :default-expanded-keys="['all']"
                  :current-node-key="currentNodeKey"
                  @node-click="handleNodeClick"
                ></el-tree>
              </div>
            </div>
            <div class="content-body_right">
              <div class="body_title">已选择({{selectedList.length}}/{{allAlgorithmsList.length}})</div>
              <div class="body_select-list">
                <div class="select-list_search">
                  <el-input
                    placeholder="搜索"
                    suffix-icon="h-icon-search"
                    clearable
                    v-model="searchVal"
                    :on-icon-click="handleIconClick"
                    :clear-icon-click="clearIconClick">
                  </el-input>
                </div>
                <div class="select-list_scrollbar">
                  <el-scrollbar wrap-class="demo-scrollbar-wrap-2" v-if="toChooseList.length">
                    <ul>
                      <li class="li_select-all">
                        <el-checkbox v-model="selectAll" @change="handleAllchange()">&nbsp;&nbsp;<span class="devide">|</span>&nbsp;&nbsp;全部</el-checkbox>
                      </li>
                      <li v-for="item in toChooseList" :key="item.modelId">
                        <el-checkbox v-model="item.isFollow" @change="handleLichange(item)">&nbsp;&nbsp;&nbsp;&nbsp;{{item.modelName}}</el-checkbox>
                      </li>
                    </ul>
                  </el-scrollbar>
                  <h-empty v-if="searchVal && !toChooseList.length" size="xs">
                    <template #img><h-empty-no-result /></template>
                    <template #description>暂无搜索结果</template>
                  </h-empty>
                  <h-empty v-if="!searchVal && !toChooseList.length" size="xs">
                    <template #img><h-empty-no-data /></template>
                    <template #description>暂无数据</template>
                  </h-empty>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="saveHandler">确定</el-button>
        <el-button @click="close">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { getAllAlgorithmsList, changeFocusModelList } from '../proxy'
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      treeData: [{
        id: 'all',
        label: '算法模型类型',
        children: [
          { id: 'CLASSIFY', label: '图像分类模型' },
          { id: 'DETECT', label: '物体检测模型' },
          { id: 'COMBINED', label: '混合模型' },
          { id: 'IMAGE_COMPARISON', label: '图像比对算法' },
          { id: 'SEARCHCOMPARE', label: '检索比对' },
          { id: 'SEMANTIC_SEG', label: '分割算法' },
          { id: 'OCR', label: '图像文字识别(OCR)' },
          { id: 'NORMAL_OCR', label: '普通OCR' },
        ]
      }],
      currentNodeKey: 'all',
      selectAll: false,
      searchVal: '',
      toChooseList: [],
      allAlgorithmsList: [],
      selectedList: []
    }
  },
  watch: {
    async visible (val) {
      if (val) {
        await this.getAllAlgorithmsList()
        this.currentNodeKey = 'all'
        this.handleNodeClick({ id: this.currentNodeKey })
      }
    }
  },
  methods: {
    handleAllchange () {
      let index = -1
      if (this.selectAll) {
        this.toChooseList.forEach(item => {
          item.isFollow = true
          !this.selectedList.includes(item.modelId) && this.selectedList.push(item.modelId)
          for (let obj of this.allAlgorithmsList) {
            if (obj.modelId === item.modelId) {
              obj.isFollow = this.selectAll
              break
            }
          }
        })
      } else {
        this.toChooseList.forEach(item => {
          index = -1
          item.isFollow = false
          index = this.selectedList.indexOf(item.modelId)
          index > -1 && this.selectedList.splice(index, 1)
          for (let obj of this.allAlgorithmsList) {
            if (obj.modelId === item.modelId) {
              obj.isFollow = this.selectAll
              break
            }
          }
        })
      }
    },
    handleNodeClick (node) {
      let modelTypeCode = this.currentNodeKey = node.id
      let arr = []
      arr = this.allAlgorithmsList.filter(item => {
        return ((item.modelType.modelTypeCode === modelTypeCode) || (modelTypeCode === 'all'))
      })
      this.selectAll = arr.every(item => item.isFollow)
      this.toChooseList = arr
      this.getAlgorithmsListByName()
    },
    handleIconClick () {
      this.getAlgorithmsListByName()
    },
    clearIconClick () {
      this.searchVal = ''
      this.handleNodeClick({ id: this.currentNodeKey })
      // this.handleNodeClick()
    },
    async saveHandler () {
      if (!this.selectedList.length) {
        this.$message({
          message: '请选择算法模型',
          type: 'warning'
        })
        return
      }
      let { code } = await changeFocusModelList({ list: this.selectedList })
      if (code === 0) {
        this.$message({
          message: '配置关注算法成功',
          type: 'success'
        })
        this.$emit('update:visible', false)
      } else {
        this.$message({
          message: '配置关注算法失败，请重试',
          type: 'error'
        })
      }
    },
    close () {
      this.$emit('update:visible', false)
    },
    getAlgorithmsListByName () {
      let nameLike = this.searchVal
      let arr = []
      this.toChooseList.forEach(item => {
        if (item.modelName.includes(nameLike)) {
          arr.push(item)
        }
      })
      this.toChooseList = arr
      // let { code, data } = getAlgorithmsListByName({ nameLike })
      // if (code === 0) {
      //   this.toChooseList = data || []
      // }
    },
    // 获取所有算法类型
    async getAllAlgorithmsList () {
      let { code, data } = await getAllAlgorithmsList()
      if (code === 0) {
        this.allAlgorithmsList = data
        this.selectedList = this.allAlgorithmsList.filter(item => item.isFollow).map(obj => obj.modelId)
        this.toChooseList = JSON.parse(JSON.stringify(data))
      }
    },
    handleLichange (item) {
      this.allAlgorithmsList.forEach(obj => {
        if (obj.modelId === item.modelId) {
          obj.isFollow = item.isFollow
        }
      })
      if (item.isFollow) {
        !this.selectedList.includes(item.modelId) && this.selectedList.push(item.modelId)
      } else {
        let index = this.selectedList.indexOf(item.modelId)
        index > -1 && this.selectedList.splice(index, 1)
      }
      this.selectAll = this.toChooseList.every(item => item.isFollow)
    }
  }
}
</script>
<style lang="scss">
  .configuration-focus-algorithm_content{
    .content{
      margin-top: 5px;
      padding: 10px;
      .content_title{
        font-size: 14px;
        color: rgba(0,0,0,0.90);
        line-height: 30px;
        font-weight: bold;
      }
      .content_body{
        border: 1px solid rgba(0,0,0,0.12);
        border-radius: 2px;
        display: flex;
        height: 340px;
        .content-body_left{
          width: 280px;
          border-right:  1px solid rgba(0,0,0,0.12);
          .body_title{
            font-size: 14px;
            color: rgba(0,0,0,0.90);
            margin: 10px 0 10px 10px;
            font-weight: bold;
          }
          .body_tree{
            height: calc(100% - 40px);
          }
        }
        .content-body_right{
          width: 334px;
          padding: 0 16px;
          box-sizing: border-box;
          .body_title{
            font-size: 14px;
            color: rgba(0,0,0,0.90);
            margin: 10px 0;
            font-weight: bold;
          }
          .select-list_search{
            margin-bottom: 8px;
          }
          .body_select-list{
            height: 295px;
            .select-list_scrollbar{
              height: 250px;
              .el-scrollbar__wrap{
                overflow-x: hidden;
              }
            }
            .demo-scrollbar-wrap-2{
              height: calc(100% - 2px);
            }
            .el-scrollbar__bar.is-vertical{
              right: -5px;
            }
            li{
              height: 40px;
              line-height: 40px;
              padding: 0 16px;
              box-sizing: border-box;
              border-bottom: 1px solid #dedede;
            }
            li.li_select-all{
              background-color: rgba(0,0,0,0.05);
              .devide{
                color: rgba(0,0,0,0.3);
              }
            }
          }
        }
      }
    }
  }
</style>
