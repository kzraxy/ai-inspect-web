<template>
  <el-dialog title="添加底图库" :visible="visible" @close="close" custom-class="add-pre-base-map-modal" :area="[560,510]">
    <div class="top_text">
      <el-alert title="请先在组织树上选定一个预置点，再点击“去添加”为该预置点增加底图内容" type="info" simple show-icon :closable="false" style="margin-bottom:12px"></el-alert>
    </div>
    <div class="modal_tree_div" v-if="visible">
      <hasDeviceDataTree ref="hasDeviceDataTree" :treeAnsyProps=treeAnsyProps :storeListProps=storeListProps :isInitSelected=isInitSelected  @getClickData="getClickData"
      top="50" treeW="510" treeBot="0" :placeHolder="`请输入${applicationSceneName}名称搜索`" @deviceNodeSelect="deviceNodeSelect"></hasDeviceDataTree>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="save">去添加</el-button>
      <el-button @click="close">取消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { addSingleChoice } from '../proxy'
import hasDeviceDataTree from '@/components/treeAnsySearch/hasDeviceDataTree'
export default {
  components: {
    hasDeviceDataTree
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      treeAnsyProps: {
        method: 'get',
        url: '/v1/inspect/taskconfig/taskConfigs/orgsForLine',
        params: {}
      },
      storeListProps: {
        method: '',
        url: '/v1/inspect/taskconfig/taskConfigs/orgs/actions/getByNameLike',
        params: {}
      },
      isInitSelected: true,
      nodeId: '',
      nodeName: '',
      choiceData: {}
    }
  },
  watch: {
    visible (val) {
      this.reset()
    }
  },
  methods: {
    reset () {
      this.groupType = null
    },
    deviceNodeSelect (value) {
      this.choiceData = value
    },
    getClickData (value) {
      this.nodeId = value.groupId
      this.nodeName = value.groupName
    },
    save () {
      if (!this.choiceData.channelId) {
        this.$message.warning('请选择通道！')
        return false
      }
      addSingleChoice(this.choiceData).then((res) => {
        if (+res.code === 0) {
          this.$emit('choiceAdd', res.data.missionId, res.data.deviceSerial)
          this.close()
        }
      })
    },
    close () {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.modal_tree_div{
  border:1px solid rgba(0,0,0,0.12);
  height: 358px;
  padding-left: 4px;
  margin-left: 12px;
  margin-right: 12px;
}
.top_text{

}
</style>

<style lang="scss">
  .add-pre-base-map-modal{
    .el-dialog__body-wrapper{
      padding:0 0 12px
    }
  }
</style>
