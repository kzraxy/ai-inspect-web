<template>
  <el-dialog custom-class="publishDevicesAddDialog" title="新增设备" :visible="visible":area="[928,738]" @close="close" @open="hanldeOpen">
  <div class="devicesWrap">
    <div class="addDeviceRight">
      <div class="pageAction">
        <div class="leftAction">
          <el-radio-group class="radioGroup" v-model="search.deviceStatus" @change="getListWithResetPage" type="simple" >
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button :label="1">在线</el-radio-button>
            <el-radio-button :label="0">离线</el-radio-button>
          </el-radio-group>
          <multiTree v-if="visible" style="margin-left: 12px;" @onChecked="onChecked"></multiTree>
        </div>
        <div class="rightAction">
          <el-input class="searchInput" placeholder="输入设备信息搜索" suffix-icon="h-icon-search" v-model="search.nameLike" clearable
            :clear-icon-click="clearCondition" :on-icon-click="getListWithResetPage" @keyup.enter.native="getListWithResetPage">
          </el-input>
        </div>
      </div>
      <div class="devicesListOuterAdd" v-loading="isLoading">
        <div class="devicesListWrap" v-show="tableData.length">
          <el-scrollbar wrap-style="height: 100%; overflow-x: hidden;">
            <div class="devicesList">
              <deviceCard class="devicesListItem" v-for="(device, index) in tableData" :key="device.deviceSerial" :deviceInfo="device" :showStatus="false" 
                :showCheckbox="true" :checkboxDisabled="selectedDevicesIds.includes(device.deviceSerial)" 
                :selectedList="currentSelectedList" @select="handleCurrentDeviceSelect" width="270">
              </deviceCard>
            </div>
          </el-scrollbar>
        </div>
        <h-empty v-show="!tableData.length && !isLoading" description="暂无设备">
          <template #img>
            <img class="emptyImg" src="@/assets/img/default_List Page no data_nor.svg" alt="">
          </template>
        </h-empty>
      </div>
      <el-pagination @current-change="handleCurrentChange" :current-page="search.pageNo" :page-size="search.pageSize"
        layout="total, prev, pager, next" :total="total">
      </el-pagination>
    </div>
  </div>
  <template slot="footer">
    <div class="addDeviceBottom">
      <div class="addAllDevice">
        <el-checkbox v-model="isDevicecheckedAll" :indeterminate="isDeviceIndeterminate" label="all" @change="checkedAllDeviceChange">全选本页</el-checkbox>
        <span>已选设备<span class="addAllDeviceText">{{currentSelectedList.length}}</span></span>
      </div>
      <div class="addDevicBtns">
        <el-button type="primary" :loading="isLoadingSubmit" @click="handleSubmit">确定</el-button>
        <el-button type="default" @click="close">取消</el-button>
      </div>
    </div>
  </template>
  </el-dialog>
</template>
<script>
import { isContained } from '@/common/util'
import { getDevicePage, publishImageLibrary } from '../proxy'
import deviceCard from './deviceCard.vue'
import multiTree from '@/components/multiTree/multiTree'
export default {
  components: {
    deviceCard,
    multiTree
  },
  data () {
    return {
      isBusy: false,
      isLoading: false,
      isLoadingSubmit: false,
      search: {
        pageNo: 1,
        pageSize: 50,
        nodeId: '',
        deviceStatus: '',
        nameLike: '',
        storeIds: []
      },
      total: 0,
      tableData: [],
      currentSelectedList: [],
      isDevicecheckedAll: false,
      isDeviceIndeterminate: false,
      selectedDevicesIds: []
    }
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
    cardInfo: {
      type: Object,
      default () {
        return {}
      }
    },
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
    onChecked (tags) { // 门店或区域选择
      // 判断所选的是区域还是门店
      if (tags.length === 1 && tags[0].nodeType === 0) {
        this.search.nodeId = tags[0].nodeId
        this.search.storeIds = []
      } else {
        this.search.nodeId = null
        const ids = tags.map(row => { return row.nodeId })
        this.search.storeIds = ids || []
      }
      this.getListWithResetPage()
    },
    checkAllChange () {
      const checkedCount = this.currentSelectedList.length
      const rowsIds = this.tableData.map(d => {
        return d.deviceSerial
      })
      const notDisabledIds = rowsIds.filter(d => !this.selectedDevicesIds.includes(d))
      const selectedIds = this.currentSelectedList.map(d => {
        return d.deviceSerial
      })
      this.isDevicecheckedAll = checkedCount > 0 && checkedCount > 0 && isContained(selectedIds, notDisabledIds) && selectedIds.filter(val => notDisabledIds.indexOf(val) > -1).length > 0
      this.isDeviceIndeterminate = checkedCount > 0 && checkedCount > 0 && !isContained(selectedIds, notDisabledIds) && selectedIds.filter(val => notDisabledIds.indexOf(val) > -1).length > 0
    },
    async handleSubmit () {
      if (this.currentSelectedList.length === 0) {
        this.close()
        return
      }
      const deviceIds = this.currentSelectedList.map(d => { return d.deviceSerial })
      this.isLoadingSubmit = true
      const { code } = await publishImageLibrary({imageLibraryId: this.cardInfo.imageLibraryId, deviceSerialList: deviceIds}).finally(() => {
        this.isLoadingSubmit = false
      })
      if (+code === 0) {
        this.$message.success('操作成功，请稍后查询结果！')
        this.close()
        setTimeout(() => {
          this.$emit('refresh')
        }, 1000)
      }
    },
    reset () {
      this.search = {
        pageNo: 1,
        pageSize: 50,
        nodeId: '',
        deviceStatus: '',
        nameLike: '',
        storeIds: []
      }
      this.tableData = []
      this.currentSelectedList = []
      this.isDevicecheckedAll = false
      this.isDeviceIndeterminate = false
      this.selectedDevicesIds = []
    },
    hanldeOpen () {
      this.selectedDevicesIds = this.selectedList.map(d => { return d.deviceSerial })
      this.refresh()
    },
    // 全选
    checkedAllDeviceChange (v) {
      this.isDevicecheckedAll = v
      const rows = JSON.parse(JSON.stringify(this.tableData))
      const notDisabledRows = rows.filter(d => {
        return !this.selectedDevicesIds.includes(d.deviceSerial)
      })
      if (v) {
        const selectedDeviceIds = this.currentSelectedList.map(d => d.deviceSerial)
        const realNeedArr = notDisabledRows.filter(d => !selectedDeviceIds.includes(d.deviceSerial))
        this.currentSelectedList = this.currentSelectedList.concat(realNeedArr)
      } else {
        const deviceIds = notDisabledRows.map(d => d.deviceSerial)
        this.currentSelectedList = this.currentSelectedList.filter(s => {
          return !deviceIds.includes(s.deviceSerial)
        })
      }
      this.isDeviceIndeterminate = false
      this.checkAllChange()
    },
    handleCurrentDeviceSelect (row) {
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
    getListWithResetPage () {
      this.search.pageNo = 1
      this.tableData = []
      this.total = 0
      this.refresh()
    },
    async refresh () {
      this.isLoading = true
      getDevicePage({...this.search, imageLibraryId: this.cardInfo.imageLibraryId}).then(({ data, code }) => {
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
    clearCondition () {
      this.search.nameLike = ''
      this.getListWithResetPage()
    },
    close () {
      this.$emit('update:visible', false)
      this.reset()
    }
  }
}
</script>
<style lang="scss" scoped>
.el-dialog__wrapper {
  ::v-deep .publishDevicesAddDialog {
    border-radius: 8px;
    .el-dialog__header {
      height: 56px;
      border-radius: 8px 8px 0 0;
      border: none;
      .el-dialog__title {
        line-height: 56px;
        font-size: 16px;
        color: rgba(0,0,0,0.90);
        letter-spacing: 0.15px;
        text-align: left;
        font-weight: 600;
        padding-left: 24px;
      }
      .el-dialog__headerbtn {
        right: 24px;
        top: 10px;
      }
    }
    .el-dialog__body {
      height: 590px!important;
      padding: 0;
      .el-dialog__body-wrapper {
        padding: 0 24px 0;
      }
    }
    .el-dialog__footer {
      height: 80px;
      background: #ffffff;
      border-top: none;
      border-radius: 0 0 8px 8px;
      padding: 0 24px;
    }
  }
}
.searchWrap {
  display: flex;
  align-items: center;
}
.elButton {
  height: 36px;
}
.elSelect {
  height: 36px;
  width: 126px;
  margin-left: 12px;
}
.devicesWrap {
  width: 100%;
  height: 590px;
  border: 1px solid #EEEFF2;
  border-radius: 8px;
  .addDeviceRight {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    padding: 16px 0;
    .pageAction{
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
    }
    .leftAction {
      display: flex;
      align-items: center;
    }
    ::v-deep .searchInput {
      width: 180px;
    }
  }
  .devicesListOuterAdd {
    height: 500px;
    .devicesListWrap {
      height: 100%;
      padding: 16px 0 0;
      .devicesList {
        display: flex;
        flex-wrap: wrap;
        padding: 0 16px;
        .devicesListItem {
          // width: 243px;
          width: 271px;
        }
        .deviceCard {
          ::v-deep .deviceCardInfo .deviceCardText {
            max-width: 100px;
          }
        }
        .devicesListItem:nth-child(3n) {
          margin-right: 0;
        }
      }
    }
  }
  .h-empty {
    height: calc(100% - 48px);
  }
  ::v-deep .el-pagination {
    text-align: right;
    margin-left: 12px;
    .el-pagination__total {
      float: left;
    }
  }
  .elPagination {
    text-align: right;
  }
}
::v-deep .h-empty {
  .emptyImg {
    width: 400px;
    height: 206px;
  }
}
.addDeviceBottom {
  display: flex;
  align-items: center;
  position: relative;
  height: 100%;
  .addAllDevice {
    height: 36px;
    line-height: 24px;
    display: flex;
    align-items: center;
    position: absolute;
    left: 0;
    top: 17px;
    font-size: 14px;
    color: rgba(0,0,0,0.20);
    letter-spacing: 0.47px;
    text-align: left;
    line-height: 18px;
    font-weight: 400;
    .el-checkbox {
      margin-right: 12px;
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
    justify-content: flex-end;
    .el-button {
      height: 36px;
    }
  }
}
</style>
