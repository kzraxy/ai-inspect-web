<template>
  <el-dialog custom-class="publishDevicesDialog" title="下发设备" :visible="visible":area="[928,738]" @close="close" @open="hanldeOpen">
    <div class="devicesWrap">
      <div class="pageAction">
        <div class="leftAction">
          <el-radio-group class="radioGroup" v-model="search.taskStatus" @change="onTabStatusChange" type="simple" >
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="SUCCESS">下发成功</el-radio-button>
            <el-radio-button label="ERROR">下发失败</el-radio-button>
            <el-radio-button label="PUBLISHING">下发中</el-radio-button>
          </el-radio-group>
          <multiTree v-if="visible" style="margin-left: 12px;" @onChecked="onChecked"></multiTree>
        </div>
        <div class="rightAction">
          <div class="devicesBtns">
            <el-button v-if="selectedList.length>0" class="elButton" type="default" :loading="isLoading" @click="handleReDispatche">重新下发</el-button>
            <el-button v-if="selectedList.length>0" class="elButton" type="default" :loading="isLoading" @click="handleDelete">移除设备</el-button>
            <el-button v-if="selectedList.length===0" class="elButton" type="default" :disabled="tableData.length>=2000" @click="handleAddDevice">新增设备</el-button>
          </div>
        </div>
      </div>
      <el-alert style="margin-top: 16px;width:846px" title="对于发布失败设备，设备上线后系统将会自动进行一次重新下发" type="info" :closable="false" simple show-icon></el-alert>
      <div class="devicesListOuter" v-loading="isLoading">
        <div class="devicesListWrap" v-show="tableData.length">
          <el-scrollbar wrap-style="height: 100%; overflow-x: hidden;">
            <div class="devicesList">
              <deviceCard
                v-for="(device, index) in tableData"
                class="deviceCardWidth"
                :key="device.deviceSerial"
                :deviceInfo="device"
                :showCheckbox="true"
                :showStatus="true"
                :selectedList="selectedList"
                @select="hanldeSelectDevice"
                width="272"
                :checkboxDisabled="!['ERROR', 'SUCCESS','PUBLISHING_ERROR','REMOVING_ERROR'].includes(device.status)"
              ></deviceCard>
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
    <div class="checkAll">
      <el-checkbox v-model="ischeckedAll" :indeterminate="isIndeterminate" label="全选本页" @change="checkedAllChange"></el-checkbox>
      <span class="checkAllText">已选设备</span>
      <span class="checkAllNum">{{selectedList.length}}</span>
    </div>
    <publishDevicesAddDialog
      :visible.sync="publishDevicesAddDialogVisible"
      :cardInfo="cardInfo"
      :selectedList="tableData"
      @refresh="addRefresh"
    ></publishDevicesAddDialog>
  </el-dialog>
</template>
<script>
import { isContained } from '@/common/util'
import { getImageLibraryDevicePage, unPublishImageLibrary, publishImageLibrary } from '../proxy'
import deviceCard from './deviceCard.vue'
import publishDevicesAddDialog from './publishDevicesAddDialog.vue'
import multiTree from '@/components/multiTree/multiTree'

export default {
  components: {
    deviceCard,
    publishDevicesAddDialog,
    multiTree
  },
  data () {
    return {
      isLoading: false,
      total: 0,
      search: {
        nodeId: '',
        parentId: '',
        taskStatus: '',
        pageNo: 1,
        pageSize: 50,
        storeIds: []
      },
      tableData: [],
      ischeckedAll: false,
      isIndeterminate: false,
      publishDevicesAddDialogVisible: false,
      treeData: [],
      selectedList: [],
    }
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    cardInfo: {
      type: Object,
      default () {
        return {}
      }
    },
    defaultStatus: {
      type: String,
      default: ''
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
    visible: {
      handler (val) {
        if (val) {
          this.search.taskStatus = this.defaultStatus
        }
      }
    }
  },
  methods: {
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
      this.getImageLibraryDevicePage()
    },
    onTabStatusChange () {
      this.visible && this.getImageLibraryDevicePage()
    },
    checkAllChange () {
      const checkedCount = this.selectedList.length
      const rowsIds = this.tableData.map(d => {
        return d.deviceSerial
      })
      const selectedIds = this.selectedList.map(d => {
        return d.deviceSerial
      })
      this.ischeckedAll = checkedCount > 0 && selectedIds.filter(val => rowsIds.indexOf(val) > -1).length > 0 && isContained(selectedIds, rowsIds)
      this.isIndeterminate = checkedCount > 0 && selectedIds.filter(val => rowsIds.indexOf(val) > -1).length > 0 && !isContained(selectedIds, rowsIds)
    },
    addRefresh () {
      this.getImageLibraryDevicePage()
      this.$emit('refresh')
    },
    async handleReDispatche () {
      const deviceIds = this.selectedList.map(d => { return d.deviceSerial })
      this.isLoading = true
      publishImageLibrary({imageLibraryId: this.cardInfo.imageLibraryId, deviceSerialList: deviceIds}).then(({ code }) => {
        if (+code === 0) {
          this.$message.success('操作成功')
          this.selectedList = []
          this.getImageLibraryDevicePage()
          this.$emit('refresh')
        }
      }).finally(() => {
        this.isLoading = false
      })
    },
    async handleDelete () {
      this.$confirm(`确定移除${this.selectedList.length}台设备`,{
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'question'
      }).then(async () => {
        const deviceIds = this.selectedList.map(d => { return d.deviceSerial })
        this.isLoading = true
        unPublishImageLibrary({imageLibraryId: this.cardInfo.imageLibraryId, deviceSerialList: deviceIds}).then(({ code }) => {
          if (+code === 0) {
            this.$message.success('操作成功，请稍后查询结果！')
            this.selectedList = []
            setTimeout(() => {
              this.getImageLibraryDevicePage()
              this.$emit('refresh')
            }, 1000)
          }
        }).finally(() => {
          this.isLoading = false
        })
      }).catch(r => {
      })
    },
    // 全选
    checkedAllChange (v) {
      this.ischeckedAll = v
      const rows = JSON.parse(JSON.stringify(this.tableData))
      if (v) {
        const selectedDeviceIds = this.selectedList.map(d => d.deviceSerial)
        const realNeedArr = rows.filter(d => !selectedDeviceIds.includes(d.deviceSerial) && ['ERROR', 'SUCCESS','PUBLISHING_ERROR','REMOVING_ERROR'].includes(d.status))
        this.selectedList = this.selectedList.concat(realNeedArr)
      } else {
        const deviceIds = rows.map(d => d.deviceSerial)
        this.selectedList = this.selectedList.filter(s => {
          return !deviceIds.includes(s.deviceSerial)
        })
      }
      this.isIndeterminate = false
      this.checkAllChange()
    },
    hanldeSelectDevice (row) {
      if (row.checked) {
        this.selectedList.push(row)
      } else {
        this.selectedList.forEach((d, index) => {
          if (d.deviceSerial === row.deviceSerial) {
            this.selectedList.splice(index, 1)
          }
        })
      }
      this.checkAllChange()
    },
    onSelectionChange (rows) {
      this.selectedList = JSON.parse(JSON.stringify(rows))
      this.checkAllChange()
    },
    handleAddDevice () {
      this.publishDevicesAddDialogVisible = true
    },
    hanldeOpen () {
      this.getImageLibraryDevicePage()
    },
    async getImageLibraryDevicePage () {
      this.isLoading = true
      let taskStatus = !this.search.taskStatus ? null : this.search.taskStatus
      getImageLibraryDevicePage({ imageLibraryId: this.cardInfo.imageLibraryId, ...this.search, taskStatus: taskStatus }).then(({ code, data }) => {
        if (code === 0) {
          this.tableData = data.rows || []
          this.total = data.total
        }
      }).finally(() => {
        this.isLoading = false
      })
    },
    reset () {
      this.search = {
        nodeId: '',
        parentId: '',
        taskStatus: '',
        pageNo: 1,
        pageSize: 50,
      }
      this.tableData = []
      this.selectedList = []
    },
    close () {
      this.$emit('update:visible', false)
      this.reset()
    },
     // 当前页变化
    handleCurrentChange (val) {
      this.search.pageNo = val
      this.selectedList = []
      this.checkAllChange()
      this.getImageLibraryDevicePage()
    },
  }
}
</script>
<style lang="scss" scoped>
.el-dialog__wrapper {
  ::v-deep .publishDevicesDialog {
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
      height: 682px!important;
      padding: 0;
      .el-dialog__body-wrapper {
        padding: 0 24px 24px;
      }
    }
  }
}
.devicesBtns {
  width: 212px;
  text-align: right;
}
.elButton {
  height: 36px;
  max-width: 100px;
}
.elSelect {
  height: 36px;
  width: 126px;
}
.devicesWrap {
  width: 100%;
  height: 590px;
  border: 1px solid #EEEFF2;
  border-radius: 8px;
  padding: 16px 0 16px 16px;
  .pageAction{
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-right: 16px;
    .leftAction {
      display: flex;
      align-items: center;
    }
  }
  .devicesListOuter {
    height: 450px;
    display: flex;
    flex-direction: column;
    .devicesListWrap {
      height: 100%;
      padding: 16px 0 0;
      .devicesList {
        display: flex;
        flex-wrap: wrap;
        .deviceCard:nth-child(3n+3) {
          margin-right: 0;
        }
        .deviceCardWidth {
          width: 271px;
        }
        .deviceCard {
          ::v-deep .deviceCardInfo .deviceCardText {
            max-width: 94px;
          }
          ::v-deep .deviceCardInfo .deviceCardTextNumber{
            max-width: 94px;
          }
        }
      }
    }
  }
}
.elPagination {
  text-align: right;
}
::v-deep .el-pagination {
  text-align: right;
  .el-pagination__total {
    float: left;
  }
}
::v-deep .h-empty {
  .emptyImg {
    width: 400px;
    height: 206px;
  }
}
.checkAll {
  display: flex;
  align-items: center;
  margin-top: 33px;
  .checkAllText {
    font-size: 14px;
    color: rgba(0,0,0,0.20);
    letter-spacing: 0.47px;
    text-align: left;
    line-height: 18px;
    font-weight: 400;
    margin-left: 13px;
  }
  .checkAllNum {
    font-size: 14px;
    color: rgba(0,0,0,0.90);
    letter-spacing: 0.47px;
    text-align: left;
    line-height: 18px;
    font-weight: 400;
    margin-left: 8px;
  }
}
</style>
