<template>
  <h-drawer title="编辑图库" :append-to-body="true" custom-class="addPlanDeviceDrawer" direction="btt" :show-close="false"
    size="92%" :visible="visible" @close="close" :modal="false" class="addPlanDeviceDrawer-wrap">
    <div class="editMapDrawer">
      <div class="addDeviceWrap">
        <div class="searchWrap">
          <div class="left">
            <el-radio-group v-model="search.drawed" type="simple" @change="getListWithResetPage">
              <el-radio-button v-for="(item,index) in enableStatusList" :key="index" :label="item.label">{{ `${item.name}(${item.num})` }}</el-radio-button>
            </el-radio-group>
          </div>
          <div class="right">
            <el-button @click="batchDelete" v-show="currentSelectedList.length">删除图片</el-button>
            <el-input class="searchInput" placeholder="输入对比图名称搜索" suffix-icon="h-icon-search" v-model="search.name" clearable
              @keyup.enter.native="getListWithResetPage" :clear-icon-click="clearCondition" :on-icon-click="getListWithResetPage"></el-input>
          </div>
        </div>
        <div class="listWrap" v-loading="isLoading">
          <el-scrollbar v-show="tableData.length" wrap-class="scrollbar-wrap">
            <div class="cardWrap">
              <editDrawerMapCard width="246px" v-for="(item, index) in tableData" :key="index" :imageInfo="item" :showCheckbox="true" 
                :selectedList="currentSelectedList" @select="handleCurrentSelectedDevices" @deleteCard="singleDelete"
              ></editDrawerMapCard>
            </div>
          </el-scrollbar>
          <div v-show="(!tableData.length && !isLoading)" style="margin: 10% auto;">
            <img style="width: 400px; height: 206px;" src="@/assets/img/default_List Page no data_nor.svg" alt="默认空态图">
            <div style="text-align:center;color: rgba(0,0,0,0.40);">暂无数据</div>
          </div>
        </div>
        <el-pagination @current-change="handleCurrentChange" @size-change="handleSizeChange" :current-page="search.pageNo" :page-size="search.pageSize"
          :page-sizes="[20, 50, 100]" layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>
      </div>
      <div class="addDeviceBottom">
        <div class="addAllDevice">
          <el-checkbox v-model="ischeckedAll" :indeterminate="isIndeterminate" label="all" @change="checkedAllChange" :disabled="(!tableData.length && !isLoading)">全选本页</el-checkbox>
          <div class="addAllDevice-line"></div>
          <span>已选图片<span class="addAllDeviceText">{{currentSelectedList.length}}</span></span>
        </div>
        <div class="addDevicBtns">
          <!-- <el-button type="primary" @click="handleSubmit">确定</el-button> -->
          <el-button type="default" @click="close">取消</el-button>
        </div>
      </div>
    </div>
  </h-drawer>
  </template>
  <script>
  import { isContained } from '@/common/util'
  import { getImagePage, deleteImages, getImageLibraryImageStatistics} from '../proxy'
  import editDrawerMapCard from './editDrawerMapCard'
  export default {
    components: { editDrawerMapCard },
    props: {
      visible: {
        type: Boolean,
        default: false
      },
      imageLibraryId: {
        type: String,
        default: ''
      },
    },
    data () {
      return {
        enableStatusList: [{label: '', name: '全部', num: 0}, {label: true, name: '已绘制', num: 0}, {label: false, name: '未绘制', num: 0}],
        search: {
          pageNo: 1,
          pageSize: 50,
          name: '',
          drawed: '',
        },
        total: 0,
        tableData: [],
        isLoading: false,
        currentSelectedList: [],
        ischeckedAll: false,
        isIndeterminate: false,
        clickDelete: false, // 是否进行了前端删除
        deleteList: []
      }
    },
    watch: {
      tableData: {
        handler () {
          this.checkAllChange()
        },
        deep: false,
        immediate: false
      },
    },
    mounted () {
      this.clickDelete = false
      this.deleteList = []
      // this.getListWithResetPage()
    },
    methods: {
      init() {
        this.getListWithResetPage()
        this.getImageLibraryImageStatistics()
      },
      async getImageLibraryImageStatistics () {
        getImageLibraryImageStatistics({imageLibraryId: this.imageLibraryId}).then(res => {
          if(res.code === 0) {
            this.enableStatusList[0].num = res.data.allCount
            this.enableStatusList[1].num = res.data.drawnCount
            this.enableStatusList[2].num = res.data.notDrawnCount
          }
        })
      },
      async batchDelete() {
        // await this.currentSelectedList.forEach(card => {
        //   let index = this.tableData.findIndex(item => item.id === card.id)
        //   this.tableData.splice(index,1)
        // })
        // this.currentSelectedList = []
        // this.clickDelete = true
        this.deleteImgs()
      },
      singleDelete(card) {
        // let index = this.tableData.findIndex(item => item.id === card.id)
        // this.deleteList.push(this.tableData[index])
        // this.tableData.splice(index,1)
        // let selectIndex = this.currentSelectedList.findIndex(item => item.id === card.id)
        // this.currentSelectedList.splice(selectIndex,1)
        // this.clickDelete = true
        this.deleteImgs(card, true)
      },
      deleteImgs(card, isSingle) {
        let ids = isSingle ? [card.id] : this.deleteList.map(d => d.id)
        this.$confirm(`是否确定删除${isSingle ? '这1' : this.deleteList.length}张图片？`, {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'question'
        }).then(async () => {
          deleteImages({ ids: ids }).then(res => {
            if(res.code === 0) {
              this.$message.success('删除成功！')
              this.refresh()
              if (!isSingle) {
                this.currentSelectedList = []
              } else {
                let selectIndex = this.currentSelectedList.findIndex(item => item.id === card.id)
                this.currentSelectedList.splice(selectIndex,1)
              }
              this.deleteList = JSON.parse(JSON.stringify(this.currentSelectedList))
              this.getImageLibraryImageStatistics()
            }
          })
        })
      },
      checkAllChange () {
        const checkedCount = this.currentSelectedList.length
        const rowsIds = this.tableData.map(d => d.id)
        const selectedIds = this.currentSelectedList.map(d => d.id)
        this.ischeckedAll = checkedCount > 0 && selectedIds.filter(val => rowsIds.indexOf(val) > -1).length > 0 && isContained(selectedIds, rowsIds)
        this.isIndeterminate = checkedCount > 0 && selectedIds.filter(val => rowsIds.indexOf(val) > -1).length > 0 && !isContained(selectedIds, rowsIds)
      },
      handleSubmit () {
        if (this.clickDelete) {
          this.$confirm(`是否最终确定删除${this.deleteList.length}张图片？`, {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'question'
          }).then(async() => {
            deleteImages({ ids: this.deleteList.map(d => d.id) }).then(res => {
              if(res.code === 0) {
                this.$message.success('删除成功！')
                this.$emit('flash')
                this.close()
              }
            })
          })
        } else {
          this.close()
        }
      },
      // 全选
      checkedAllChange (v) {
        this.ischeckedAll = v
        const rows = JSON.parse(JSON.stringify(this.tableData))
        if (v) {
          const selectedMapIds = this.currentSelectedList.map(d => d.id)
          const realNeedArr = rows.filter(d => !selectedMapIds.includes(d.id))
          this.currentSelectedList = this.currentSelectedList.concat(realNeedArr)
        } else {
          const mapIds = rows.map(d => d.id)
          this.currentSelectedList = this.currentSelectedList.filter(s => !mapIds.includes(s.id))
        }
        this.isIndeterminate = false
        this.deleteList = JSON.parse(JSON.stringify(this.currentSelectedList))
      },
      handleCurrentSelectedDevices (row) {
        if (row.checked) {
          this.currentSelectedList.push(row)
        } else {
          this.currentSelectedList.forEach((i, index) => {
            if (i.id === row.id) {
              this.currentSelectedList.splice(index, 1)
            }
          })
        }
        this.deleteList = JSON.parse(JSON.stringify(this.currentSelectedList))
        this.checkAllChange()
      },
      reset () {
        this.search = {
          pageNo: 1,
          pageSize: 50,
          name: '',
          drawed: '',
        }
        this.tableData = []
        this.isLoading = false
      },
      getListWithResetPage () {
        this.search.pageNo = 1
        this.tableData = []
        this.total = 0
        this.refresh()
      },
      async refresh () {
        this.isLoading = true
        getImagePage({...this.search, imageLibraryId: this.imageLibraryId}).then(({ data, code }) => {
          if (+code === 0) {
            this.tableData = data.rows || []
            this.total = data.total
          }
        }).finally(() => {
          this.isLoading = false
        })
      },
      // 当前页变化
      handleCurrentChange (val) {
        this.search.pageNo = val
        this.refresh()
      },
      handleSizeChange (val) {
        this.search.pageNo = 1
        this.search.pageSize = val
        this.refresh()
      },
      clearCondition () {
        this.search.name = ''
        this.getListWithResetPage()
      },
      close () {
        this.$emit('update:visible', false)
        this.$emit('flash')
        this.reset()
      },
    }
  }
  </script>
  <style lang="scss">
  .editMapDrawer {
    .searchInput{
      .el-input__prefix, .el-input__suffix{
        top: 6px;
      }
      .h-icon-close_f.is-clickable{
        top: 6px;
      }
    }
  }
  </style>
  <style lang="scss" scoped>
  .editMapDrawer {
    margin: 0 24px;
    height: 100%;
    ::v-deep .el-pagination {
      padding: 0 24px;
    }
    .editDrawerMapCard{
      margin-right: 16px;
    }
    .addDeviceWrap {
      border: 1px solid #EEEFF2;
      border-radius: 8px;
      height: calc(92vh - 84px - 69px);
      .searchWrap {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 24px 24px 0
      }
      ::v-deep .searchInput {
        width: 240px;
        margin-left: 16px;
        .el-input__inner {
          height: 36px;
          background: #FFFFFF;
          border: 1px solid #E2E3E6;
          border-radius: 4px;
        }
      }
      ::v-deep .listWrap {
        display: flex;
        flex-wrap: wrap;
        padding: 16px 0 0 24px;
        height: calc(100% - 118px);
        .scrollbar-wrap {
          height: 100%;
          overflow-x: hidden;
        }
        .cardWrap {
          display: flex;
          flex-wrap: wrap;
        }
      }
    }
    .addDeviceBottom {
      height: 84px;
      display: flex;
      align-items: center;
      position: relative;
      .addAllDevice {
        height: 36px;
        line-height: 24px;
        display: flex;
        align-items: center;
        position: absolute;
        left: 0;
        top: 24px;
        font-size: 14px;
        color: rgba(0,0,0,0.20);
        letter-spacing: 0.47px;
        text-align: left;
        line-height: 18px;
        font-weight: 400;
        .addAllDevice-line{
          width: 1px;
          height: 11px;
          background: #E8EAEC;
          margin: 0 6px;
        }
        .el-checkbox {
          // margin-right: 12px;
        }
        .addAllDeviceText {
          color: rgba(0,0,0,0.90);
          margin-left: 8px;
        }
      }
      .addDevicBtns {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        .el-button {
          height: 36px;
          letter-spacing: 1px;
        }
        .el-button+.el-button {
          margin-left: 12px;
        }
      }
    }
  }
  .rightAction-content{
    display: flex;
    .el-btn-t{
      height: 36px;
      letter-spacing: 1px;
      margin-right: 12px;
    }
  }
  </style>
  <style lang="scss">
  .addPlanDeviceDrawer-wrap{
    z-index: 1500 !important;
    background: rgba(0,0,0,0.4);
  }
  .addPlanDeviceDrawer {
    .el-drawer__header {
      font-size: 16px;
      color: rgba(0,0,0,0.90);
      letter-spacing: 0.15px;
      text-align: left;
      line-height: 24px;
      font-weight: 600;
      margin-bottom: 25px;
    }
    .addScrollbar {
      height: calc(100vh - 60px);
    }
  }
  .h-sync-tree-select-main {
    .sync-tree-main {
      .el-tree {
        .iconmendian {
          font-size: 20px!important;
        }
      }
    }
  }
  </style>
  