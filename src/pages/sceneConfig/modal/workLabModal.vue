<template>
  <el-dialog title="选择对比图库" :visible="visible" @close="close" :area="[880,736]" :close-on-click-model=false>
    <div class="wrap">
      <div class="search_wrap">
        <el-input v-model="searchForm.imageLibraryName" placeholder="输入对比库名称" suffix-icon="h-icon-search" class="right_search" clearable
          :on-icon-click="getWorkLabList" :clear-icon-click="resetImageLibraryName" @keyup.enter.native="getWorkLabList" style="width: 240px;margin-left: 16px;"></el-input>
      </div>
      <div class="wordlab-scrollbar-wrap">
        <el-scrollbar wrap-class="demo-scrollbar-wrap">
          <div class="card_wrap">
            <div :class="{'card':true,'active_card':chooseWorkLabItem.chooseLabIds.includes(item.labId)}" 
              v-for="(item, index) in workLabList" :key="index" @click="chooseWorkLab(item)">
              <div class="img_top" :style="{'backgroundImage': handleBg(item),'backgroundSize':'100% 100%','background-repeat':'no-repeat'}"></div>
              <div class="lab_name">{{ item.labName }}</div>
            </div>
          </div>
        </el-scrollbar>
        <div class="page_wrap">
          <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :page-sizes="[20, 50, 100]" :current-page="searchForm.pageNo"
            :page-size="searchForm.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
          </el-pagination>
        </div>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="save">确定</el-button>
      <el-button @click="close">取消</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { pageImageLibraryList } from '../proxy.js'
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
  },
  data () {
    return {
      chooseWorkLabItem: {},
      searchForm: {
        imageLibraryName: '',
        pageSize: 20,
        pageNo: 1
      },
      total: 0,
      workLabList: [],
      workLabType: 'workwearLab'
    }
  },
  watch: {
  },
  methods: {
    handleBg(item) {
      return `url('${item.coverPicUrl ? item.coverPicUrl : require('../../../assets/img/default_no data_nor.svg')}')`
    },
    async getWorkLabList () {
      let { code, data } = await pageImageLibraryList({libraryType: 'CLOUD', ...this.searchForm})
      if (code === 0) {
        this.workLabList = data.rows || []
        this.workLabList.forEach(item => {
          item.labId = item.id
          item.labName = item.name
        })
        this.total = data.total
      }
    },
    init(type, item) {
      this.searchForm = {
        imageLibraryName: '',
        pageSize: 20,
        pageNo: 1
      },
      this.total = 0
      this.workLabList = []
      this.workLabType = type
      this.getWorkLabList()
      this.chooseWorkLabItem = { ...item, btnVisible: false }
    },
    resetImageLibraryName() {
      this.searchForm.pageNo = 1
      this.searchForm.imageLibraryName = ''
      this.getWorkLabList()
    },
    handleSizeChange (val) {
      this.searchForm.pageNo = 1
      this.searchForm.pageSize = val
      this.getWorkLabList()
    },
    handleCurrentChange (val) {
      this.searchForm.pageNo = val
      this.getWorkLabList()
    },
    chooseWorkLab(item) {
      let index = this.chooseWorkLabItem.chooseLabIds.indexOf(item.labId)
      if (index > -1) {
        this.chooseWorkLabItem.chooseLabIds.splice(index, 1)
      } else {
        this.chooseWorkLabItem.chooseLabIds.push(item.labId)
      }
    },
    save () {
      this.$emit('chooseWorkLab', this.chooseWorkLabItem)
      this.close()
    },
    close () {
      this.$emit('update:visible', false)
    }
  }
}
</script>
<style lang="scss">
.wordlab-scrollbar-wrap{
  height: 500px;
  .demo-scrollbar-wrap{
    height: 100%;
    overflow-x: hidden;
  }
}
</style>
<style lang="scss" scoped>
.page_wrap{
  width: 100%;
  padding: 0 14px;
  margin-top: 8px;
}
.wrap{
  border: 1px solid #EEEFF2;
  border-radius: 8px;
  width: 832px;
  height: 620px;
  padding: 16px 0;
  margin-left: 10px;
}
.search_wrap{
  margin-bottom: 8px;
}
.card_wrap{
  display: flex;
  flex-wrap: wrap;
  .card{
    width: 256px;
    height: 170px;
    background: #FFFFFF;
    border: 1px solid #EEEFF2;
    border-radius: 4px;
    margin-left: 16px;
    margin-top: 8px;
    margin-bottom: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    &:hover{
      border: 2px solid #1E7FFF;
    }
    .img_top{
      width: 240px;
      height: 125px;
      border-radius: 8px;
    }
    .lab_name{
      font-family: MicrosoftYaHeiUISemibold;
      color: #1A1A1A;
      font-weight: 600;
      margin-top: 10px;
      padding: 0 12px;
    }
  }
  .active_card{
    border: 2px solid #1E7FFF;
  }
}
</style>
