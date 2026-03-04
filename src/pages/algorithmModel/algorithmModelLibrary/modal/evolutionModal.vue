<template>
  <el-dialog title='自主进化详情' :visible="visible" @close="close" :close-on-click-modal="false" :area="[680,520]" class="evolutionModal_modal">
    <el-alert :title="latestMsg" type="success" simple show-icon :closable="false" v-if="!!latestMsg"></el-alert>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="成功" name="success"><span slot="label">{{'成功（'+successData.length+'）'}}</span></el-tab-pane>
      <el-tab-pane label="失败" name="failed"><span slot="label">{{'失败（'+failData.length+'）'}}</span></el-tab-pane>
    </el-tabs>
    <el-table :height="tableHeight" force-scroll :data="tableData" border show-overflow-title v-if="activeTab==='success'">
      <el-table-column key="version" prop="version" label="更新版本"></el-table-column>
      <el-table-column key="updateTime" prop="updateTime" label="更新时间"></el-table-column>
      <el-table-column key="targetMAP" prop="targetMAP" label="目标性能（MAP）"></el-table-column>
      <el-table-column key="baseVersion1" prop="baseVersion" label="基础版本"></el-table-column>
    </el-table>
    <el-table :height="tableHeight" force-scroll :data="tableData" border show-overflow-title v-if="activeTab==='failed'">
      <el-table-column key="baseVersion2" prop="baseVersion" label="基础版本"></el-table-column>
      <el-table-column key="failReason" label="失败原因">
        <template slot-scope="scope">
          <span>{{ scope.row.failReason }}</span>
        </template>
      </el-table-column>
    </el-table>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="close">确认</el-button>
      <el-button @click="close">取消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getUpgradeDetail } from '../proxy'
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    modelId: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      tabs: [{ label: '成功', name: 'success', num: 0 }, { label: '失败', name: 'failed', num: 0 }],
      activeTab: 'success',
      failData: [],
      successData: [],
      latestMsg: ''
    }
  },
  watch: {
    visible (val) {
      if (val) {
        this.getUpgradeDetail()
      }
    }
  },
  computed: {
    tableData () {
      return this.activeTab === 'success' ? this.successData : this.failData
    },
    tableHeight () {
      return this.latestMsg ? 326 : 360
    }
  },
  methods: {
    getUpgradeDetail () {
      getUpgradeDetail({ modelId: this.modelId }).then(res => {
        if (res.code === 0) {
          this.successData = res.data.successVersions
          this.failData = res.data.failVersions
          this.latestMsg = res.data.latestMsg || ''
        }
      })
    },
    close () {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="scss">
.evolutionModal_modal{
  .el-dialog__body-wrapper{
    padding-bottom: 0;
    .el-table:before,.el-table:after,.el-table__body-wrapper:before{
      background-color: #fff!important
    }
    .el-table{
      border: none!important
    }
  }
}
</style>
