<template>
  <div class="tree-frame" v-bind:style="{top:top+'px',height:height+'px'}">
    <div class="tree-filter">
      <el-input class="tree-filter-inp" :placeholder="placeHolder" suffix-icon="h-icon-search" :style="{width:treeW}"
      v-model="nameLike" @keyup.enter.native="handleSearchClick" :on-icon-click="handleSearchClick" clearable :clear-icon-click='clearClick'>
      </el-input>
      <div class="tree-wrap" :style="{width:treeW,bottom:treeBot+'px'}">
        <el-scrollbar wrap-class="el-demo2-scrollbar__wrap" view-class="el-demo2-scrollbar__view">
          <ul class="f-storeList" v-if="hackReset" @click.stop>
            <span v-show='storeFilterList.length === 0' class="msg-tip">未查询到任何结果！</span>
            <li v-for="item in storeFilterList" @click="storeSelect(item, true)" :key='item.index' class="item-chose" v-bind:class="{'itemActive':item.isSelected, 'itemNoShow': !item.groupName}">{{item.groupName}}</li>
          </ul>
        </el-scrollbar>
      </div>
    </div>
  </div>
</template>
<script>
import { getRelationGroupList } from '../../proxy'
import '@/assets/icon/iconfont.css'
export default {
  props: {
    top: {
      type: String,
      default: '0'
    },
    height: {
      type: String,
      default: ''
    },
    treeW: {// 树外层样式
      type: String,
      default: '200px'
    },
    treeBot: {// 树外层样式
      type: String,
      default: '10'
    },
    onlyCheckLeaf: {
      type: Boolean,
      default: false
    },
    placeHolder: {
      type: String,
      default: '请输入名称'
    }
  },
  mounted () {
    // this.searchStoreList()
  },

  data () {
    return {
      nameLike: '',
      hackReset: true,
      storeFilterList: [],
      solutionTaskId: ''
    }
  },
  methods: {
    async init(groupId, solutionTaskId) {
      this.solutionTaskId = solutionTaskId
      this.nameLike = ''
      await this.searchStoreList(groupId)
      if (groupId) { // 有默认小区id，选中该小区
        let exist = this.storeFilterList.filter(item => item.groupId === groupId)
        exist.length && this.storeSelect(exist[0])
      } else { // 默认选中第一个
        this.storeFilterList.length && this.storeSelect(this.storeFilterList[0])
      }
    },
    clearClick () {
      this.nameLike = ''
      this.searchStoreList('')
    },
    storeSelect (data) {
      this.storeFilterList.forEach((item, i) => {
        item.isSelected = false
      })
      data.isSelected = true
      this.$emit('getClickData', data)
      this.hackReset = false
      this.$nextTick(() => {
        this.hackReset = true
      })
    },
    async searchStoreList (groupId) {
      groupId = this.nameLike ? '' : groupId
      let res = await getRelationGroupList({groupId: groupId, nameLike: this.nameLike, limit: 200, solutionTaskId: this.solutionTaskId})
      if (res.code === 0) {
        this.storeFilterList = res.data || []
        this.storeFilterList.forEach((item) => {
          item.isSelected = false
        })
      }
    },
    handleSearchClick() {
      this.searchStoreList('')
    }
  }
}
</script>
<style lang="scss">
.el-demo2-scrollbar__wrap {
  max-height: 100%;
  overflow-x: hidden !important;
}
.tree-frame {
  width: 100%;
  padding: 8px;
  position: absolute;
  bottom: 0px;
  .tree-filter {
    width: 100%;
    height: 100%;
    position: relative;
    .tree-wrap {
      padding-top: 8px;
      position: absolute;
      left: 0px;
      right: 0px;
      top: 32px;
    }
  }
  .tree-filter-inp{
    input{
      padding-left: 15px;
    }
  }
}
.f-storeList {
  padding: 0px 10px 15px 10px;
  span.msg-tip {
    font-size: 12px;
    color: #888;
    margin-left: 30px;
    margin-top: 53px;
    display: inline-block;
  }
  .item-chose {
    color: #666;
    font-size: 12px;
    position: relative;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    height: 32px;
    line-height: 32px;
    box-sizing: border-box;
    padding: 0 5px;
    cursor: pointer;
  }
  .item-chose:hover {
    background-color: rgba(33,150,243,.08);
  }
  .itemActive {
    background-color: rgba(33,150,243,.08);
  }
  .itemNoShow{
    display: none;
  }
}
</style>
