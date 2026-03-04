<template>
  <h-drawer title="设备选择" :append-to-body="true" custom-class="issuedDeviceDrawer" direction="btt" :show-close="false"
    size="92%" :visible="visible" @close="close" :modal="false" class="issuedDeviceDrawer-wrap">
    <div class="addDeviceContainer">
      <div class="addDeviceWrap">
        <div class="addDeviceRight">
          <h-page-container>
            <h-page-content style="padding: 0;">
              <h-page-action class="pageAction">
                <template slot="leftAction">
                  <div class="searchWrap">
                    <el-radio-group style="margin-right: 12px;" type="simple"  v-model="search.deviceStatus" @change="getListWithResetPage">
                      <el-radio-button label="">全部</el-radio-button>
                      <el-radio-button :label="1">在线</el-radio-button>
                      <el-radio-button :label="0">离线</el-radio-button>
                    </el-radio-group>
                    <multiTree v-if="visible" @onChecked="onChecked"></multiTree>
                  </div>
                </template>
                <template slot="rightAction">
                  <div class="rightAction-content">
                    <el-input
                      class="searchInput"
                      placeholder="请输入设备名称"
                      suffix-icon="h-icon-search"
                      v-model="search.nameLike"
                      clearable
                      @keyup.enter.native="getListWithResetPage"
                      :clear-icon-click="clearCondition"
                      :on-icon-click="getListWithResetPage"
                    ></el-input>
                  </div>
                </template>
              </h-page-action>
              <div class="listWrap">
                <h-page-content style="padding: 0;" v-loading="isLoading">
                  <el-scrollbar v-show="tableData.length" wrap-class="scrollbar-wrap">
                    <div class="cardWrap">
                      <template>
                        <deviceCard v-for="(device) in tableData" :key="device.deviceSerial" :showStatus="false" :deviceInfo="device" :showBindTag="true"
                          :showCheckbox="true" :selectedList="currentSelectedList" @select="handleCrrentSelectedDevices" width="246">
                        </deviceCard>
                      </template>
                    </div>
                  </el-scrollbar>
                  <h-empty v-show="(!tableData.length && !isLoading)" description="暂无设备">
                    <template #img>
                      <img style="width: 400px; height: 206px;" src="@/assets/img/default_List Page no data_nor.svg" alt="默认空态图">
                    </template>
                  </h-empty>
                </h-page-content>
              </div>
              <el-pagination @current-change="handleCurrentChange" @size-change="handleSizeChange" :current-page="search.pageNo" :page-size="search.pageSize"
                :page-sizes="[20, 50, 100]" layout="total, sizes, prev, pager, next, jumper" :total="total">
              </el-pagination>
            </h-page-content>
          </h-page-container>
        </div>
      </div>
      <div class="addDeviceBottom">
        <div class="addAllDevice">
          <el-checkbox v-model="ischeckedAll" :indeterminate="isIndeterminate" label="all" @change="checkedAllChange">全选本页</el-checkbox>
          <div class="addAllDevice-line"></div>
          <span>已选设备<span class="addAllDeviceText">{{currentSelectedList.length}}</span></span>
          <!-- <div class="addAllDevice-line"></div>
          <div class="addAllDevice-upload-btn" @click="uploadData">
            <img class="img" src="@/assets/img/upload_icon.svg" alt="">
            <div class="text">上传表格导入投放设备</div>
          </div> -->
        </div>
        <div class="addDevicBtns">
          <el-button type="primary" @click="handleSubmit" :disabled="!currentSelectedList.length">下发至设备</el-button>
          <el-button type="default" @click="close">取消</el-button>
        </div>
      </div>
    </div>
    <ExcelUpload ref="excelUpload"
        :visible.sync="excelUploadShow"
        templateType="importDeviceTemplate"
        taskType="2"
        @success="successUpload"
        errorText="设备"
        ></ExcelUpload>
  </h-drawer>
  </template>
  <script>
  import { isContained } from '@/common/util'
  import { getDevicePage, publishImageLibrary } from '../proxy'
  import deviceCard from './deviceCard'
  import multiTree from '@/components/multiTree/multiTree'
  import ExcelUpload from '@/components/excelUpload/index.vue'
  export default {
    components: {
      deviceCard,
      multiTree,
      ExcelUpload,
    },
    props: {
      visible: {
        type: Boolean,
        default: false
      },
      selectedList: {
        type: Array,
        default () {
          return []
        }
      },
      imageLibraryId: {
        type: String,
        default: ''
      },
    },
    data () {
      return {
        search: {
          pageNo: 1,
          pageSize: 50,
          nameLike: '',
          deviceStatus: '',
          parentId: null,
          nodeId: null,
          storeIds: []
        },
        total: 0,
        tableData: [],
        isLoading: false,
        currentSelectedList: [],
        ischeckedAll: false,
        isIndeterminate: false,
        excelUploadShow: false
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
    methods: {
      init() {
        this.currentSelectedList = JSON.parse(JSON.stringify(this.selectedList))
        this.getListWithResetPage()
      },
      onChecked (tags) { // 门店或区域选择
        // 判断所选的是区域还是门店
        if (tags.length === 1 && tags[0].nodeType === 0) {
          this.search.parentId = tags[0].parentId
          this.search.nodeId = tags[0].nodeId
          this.search.storeIds = []
        } else {
          this.search.parentId = null
          this.search.nodeId = null
          const ids = tags.map(row => { return row.nodeId })
          this.search.storeIds = ids || []
        }
        this.getListWithResetPage()
      },
      checkAllChange () {
        const checkedCount = this.currentSelectedList.length
        const rowsIds = this.tableData.map(d => d.deviceSerial)
        const selectedIds = this.currentSelectedList.map(d => d.deviceSerial)
        this.ischeckedAll = checkedCount > 0 && selectedIds.filter(val => rowsIds.indexOf(val) > -1).length > 0 && isContained(selectedIds, rowsIds)
        this.isIndeterminate = checkedCount > 0 && selectedIds.filter(val => rowsIds.indexOf(val) > -1).length > 0 && !isContained(selectedIds, rowsIds)
      },
      handleSubmit () {
        const deviceIds = this.currentSelectedList.map(d => { return d.deviceSerial })
        publishImageLibrary({imageLibraryId: this.imageLibraryId, deviceSerialList: deviceIds, allData: true}).then(res => {
          if (res.code === 0) {
            this.$message.success('操作成功，请稍后查询结果！')
            this.close()
          }
        })
        
      },
      // 全选
      checkedAllChange (v) {
        this.ischeckedAll = v
        const rows = JSON.parse(JSON.stringify(this.tableData))
        if (v) {
          const selectedDeviceIds = this.currentSelectedList.map(d => d.deviceSerial)
          const realNeedArr = rows.filter(d => !selectedDeviceIds.includes(d.deviceSerial))
          this.currentSelectedList = this.currentSelectedList.concat(realNeedArr)
        } else {
          const deviceIds = rows.map(d => d.deviceSerial)
          this.currentSelectedList = this.currentSelectedList.filter(s => !deviceIds.includes(s.deviceSerial))
        }
        this.isIndeterminate = false
        this.checkAllChange()
      },
      handleCrrentSelectedDevices (row) {
        if (row.checked) {
          this.currentSelectedList.push(row)
        } else {
          this.currentSelectedList.forEach((i, index) => {
            if (i.deviceSerial === row.deviceSerial) {
              this.currentSelectedList.splice(index, 1)
            }
          })
        }
        this.checkAllChange()
      },
      reset () {
        this.search = {
          pageNo: 1,
          pageSize: 50,
          nameLike: '',
          deviceStatus: '',
          nodeId: null,
          parentId: null,
          storeIds: []
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
        getDevicePage({...this.search, imageLibraryId: this.imageLibraryId}).then(({ data, code }) => {
          if (code === 0) {
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
        this.search.nameLike = ''
        this.getListWithResetPage()
      },
      close () {
        this.$emit('update:visible', false)
        this.reset()
      },
      // 打开批量上传
      uploadData() {
        this.excelUploadShow = true
      },
      // 批量上传成功
      successUpload(list) {
        let mergeList = [] // 合并之后的list
        list.forEach(item => {
          mergeList.push(item)
        })
        let tmpList = JSON.parse(JSON.stringify(this.currentSelectedList))
  
        tmpList.forEach(item => {
          let tmpIndex = list.findIndex(itemN => itemN.deviceSerial == item.deviceSerial)
          if(tmpIndex == -1) {
            mergeList.push(item)
          }
        })
        
        this.currentSelectedList = JSON.parse(JSON.stringify(mergeList))
        this.checkAllChange()
      }
    }
  }
  </script>
  <style lang="scss" scoped>
  .addDeviceContainer {
    margin: 0 24px;
    height: 100%;
    .addDeviceWrap {
      display: flex;
      border: 1px solid #EEEFF2;
      border-radius: 8px;
      height: calc(92vh - 84px - 69px);
      .addDeviceRight {
        display: flex;
        flex: 1;
        height: 100%;
        padding: 24px 0 0;
        ::v-deep .pageAction {
          .h-page-action__main {
            height: 36px;
            padding: 0 24px;
            border: none;
          }
        }
        .searchWrap {
          display: flex;
          align-items: center;
        }
        ::v-deep .searchInput {
          width: 240px;
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
          padding: 24px 0 0 24px;
          height: calc(100% - 100px);
          .scrollbar-wrap {
            height: 100%;
            overflow-x: hidden;
          }
          .cardWrap {
            display: flex;
            flex-wrap: wrap;
          }
        }
        ::v-deep .el-pagination {
          padding: 0 24px;
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
  .addAllDevice-upload-btn{
    display: flex;
    align-items: center;
    cursor: pointer;
    .img{
      width: 14px;
      height: 14px;
      margin-right: 5px;
    }
    .text{
      font-family: MicrosoftYaHeiUI;
      font-size: 14px;
      color: #2080f7;
      letter-spacing: 0;
      font-weight: 400;
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
  .issuedDeviceDrawer-wrap{
    z-index: 1500 !important;
    background: rgba(0,0,0,0.4);
  }
  .issuedDeviceDrawer {
    .h-page-action__main{
      .el-input__prefix, .el-input__suffix{
        top: 8px;
      }
      .h-icon-close_f.is-clickable{
        top: 8px;
      }
    }
    .el-checkbox__input.is-checked .el-checkbox__inner{
      background: #2080f7;
      border-color:#2080f7;
    }
    .el-checkbox__inner .h-svg-icon-wrapper .el-checkbox__tick{
      fill: #fff;
    }
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
  