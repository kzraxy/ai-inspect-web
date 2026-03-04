<template>
  <div class="comp-wrap"
    :style="{height: typeof height === 'number' ? `${height}px` : height}"
    v-loading="loading">
    <div class="tree-wrap">
      <sidebarTree @onSelect="nodeSelect" :needStore="model.needStore"></sidebarTree>
    </div>
    <div class="transfer-wrap">
      <div v-show="errMsg" class="tip">{{errMsg}}</div>
      <h-table-transfer
      v-show="!errMsg"
      ref="tableTransfer"
      :left-table-data="displayLeftData"
      :right-table-data="rightData"
      :move-right-action = "handleMoveRightAction"
      :load-num="50"
      :row-key="model.rowKey"
      :name-key="model.nameKey"
      :cache-right-data="false"
      @move-right="selectDataChange"
      @move-left="selectDataChange"
      tree-node-id="area">
        <template slot="leftTableColumn">
          <el-table-column v-for="(column,idx) in model.columns" :label="column.label" :prop="column.prop" :key="idx" show-overflow-title></el-table-column>
        </template>
        <template slot="rightTableColumn">
          <el-table-column v-for="(column,idx) in model.columns" :label="column.label" :prop="column.prop" :key="idx" show-overflow-title></el-table-column>
        </template>
      </h-table-transfer>
    </div>
  </div>
</template>

<script>
import sidebarTree from '@/components/sidebarTree/sidebarTree'
import { getStoreList, findAllChannelsByStoreId } from './proxy'
import store from '@/store'

const dataHandler = callback => ({ code, message, data }) => {
  if ([50100363, 50100412].indexOf(code) > -1) {
    callback(undefined, message)
    return
  }
  if (code === 0 && data) {
    callback(data)
    return
  }
  callback()
}

const modelTypes = {
  store: {
    needStore: false,
    rowKey: 'storeId',
    nameKey: 'storeName',
    columns: [{ label: `${store.getters.applicationSceneName}名称`, prop: 'storeName' }],
    transferRequest: (node, callback) => {
      const params = {
        nodeId: node.nodeId
      }
      getStoreList(params).then(dataHandler(callback)).catch(() => {
        callback()
      })
    }
  },
  channel: {
    needStore: true,
    rowKey: 'channelId',
    nameKey: 'channelName',
    columns: [{ label: '通道名称', prop: 'channelName' }],
    transferRequest: (node, callback) => {
      let params = (node.nodeType === 1) ? { storeId: node.nodeId } : { areaId: node.nodeId }
      findAllChannelsByStoreId(params).then(dataHandler(callback)).catch(() => {
        callback()
      })
    }
  }
}

export default {
  name: 'areaStoreTransfer',
  components: {
    sidebarTree
  },
  props: {
    /** 组件高度 */
    height: {
      type: Number | String,
      default: 500
    },
    filterData: Array,
    modelType: {
      type: String,
      default: 'store'
    },
    customModel: Object,
    maxLimitChoose: {
      type: Number,
      default: 5000
    }
  },
  data () {
    return {
      // tansfer
      leftData: [],
      rightData: [],
      mapData: {},
      loading: false,
      errMsg: undefined
    }
  },
  computed: {
    displayLeftData () {
      if (!this.filterData || this.filterData.length === 0) return this.leftData
      const map = {}
      this.filterData.forEach(e => map[e[this.model.rowKey]] = 1)
      return this.leftData.filter(e => !map[e[this.model.rowKey]])
    },
    model () {
      if (this.customModel) return this.customModel
      return modelTypes[this.modelType]
    }
  },
  mounted () {

  },
  methods: {
    handleMoveRightAction (checkedRows, leftTableData, rightTableData) {
      return new Promise((resolve, reject) => {
        const curLength = checkedRows ? checkedRows.length : 0
        const rightLength = rightTableData ? rightTableData.length : 0
        if(curLength + rightLength > this.maxLimitChoose) {
          this.$message.info(`已添加不能超过${this.maxLimitChoose}个`)
          this.$emit('selectChange', [], true)
          return reject()
        }else {
          return resolve()
        }
     })
    },
    setSelectData (selectData, refreshLeft = false) {
      if (refreshLeft) this.leftData = [...this.leftData]
      selectData.forEach(e => {
        e.belongArea = this.mapData[e[this.model.rowKey]] ? 'area' : 'notArea'
      })
      this.rightData = selectData
    },
    getTransferData () {
      return this.$refs.tableTransfer.getCacheData()
    },
    selectDataChange (leftData, rightData) {
      this.$emit('selectChange', rightData)
    },
    genMapData () {
      const map = {}
      this.leftData.forEach(e => {
        map[e[this.model.rowKey]] = e
      })
      this.mapData = map
    },
    nodeSelect (node) {
      this.loading = true
      this.model.transferRequest(node, (data, msg) => {
        this.loading = false
        if (msg) {
          this.errMsg = msg
          return
        }
        this.errMsg = undefined
        if (!data) return
        this.leftData = data
        this.genMapData()
        const selectData = this.getTransferData().rightTableCacheData
        if (selectData && selectData.length > 0) {
          this.setSelectData(this.getTransferData().rightTableCacheData)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.comp-wrap {
  width: 100%;
  display: flex;
  position: relative;
  .tree-wrap {
    flex: 2;
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-right: 0px;
    overflow: auto;
  }
  .transfer-wrap {
    flex: 5;
    .tip {
      border: 1px solid rgba(0, 0, 0, 0.12);
      height:100%;
      text-align: center;
      padding-top: 230px;
    }
  }
}

</style>
