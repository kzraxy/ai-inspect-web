<template>
  <h-page-container>
    <h-layout>
      <div class="useCount main_wrap">
        <resizeBox ref="resizeBox" :defaultW="280" :minW="280" :maxW="620" @widthChanged="changeResizeBox">
          <div class="left_part">
            <div class="tree_div">
              <treeAnsySearchArea ref='areaTree' @onSelect="onSelect"/>
            </div>
          </div>
        </resizeBox>
        <div class="right_part" ref="rightPart">
          <div class="table_top_right">
            <div v-for="(item, index) in topList" :key="index" class="top_item">
              <div class="number">{{ item.number }}</div>
              <div class="name">{{ item.name }}</div>
            </div>
          </div>
          <div class="table_wrap">
            <el-table height="100%" force-scroll :data="tableData" show-overflow-title v-loading="loading">
              <el-table-column prop="scenariosName" label="AI 增值服务名称"></el-table-column>
              <el-table-column prop="storeNum" label="覆盖门店数" sortable></el-table-column>
              <el-table-column prop="storeRate" label="门店覆盖率" sortable>
                <template slot-scope="scope"><span>{{(scope.row.storeRate * 100).toFixed(0) + '%'}}</span></template>
              </el-table-column>
              <el-table-column prop="usedNum" label="已使用路数（路）" sortable></el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </h-layout>
  </h-page-container>
</template>

<script>
import { getStatisticData } from '../proxy'
import treeAnsySearchArea from '@/components/treeAnsySearchArea'
import resizeBox from '@/components/resizeBox'
export default {
  components: { treeAnsySearchArea, resizeBox },
  data () {
    return {
      tableData: [],
      loading: false,
      orgId: '',
      topList: [
        {nameKey: 'buyedTotal', name:'总购买路数', number: ''},
        {nameKey: 'usedTotal', name:'总使用路数', number: ''},
        {nameKey: 'usedRate', name:'总使用率', number: ''},
        {nameKey: 'storeTotal', name:'总覆盖门店数', number: ''},
        {nameKey: 'storeRate', name:'总门店覆盖率', number: ''},
      ]
    }
  },
  methods: {
    onSelect (area) { // 区域树节点选择事件
      this.orgId = area.nodeId || ''
      this.getList()
    },
    changeResizeBox() {
      this.$nextTick(() => {
        let w = this.$refs.resizeBox.width
        this.$refs.rightPart.style = `width: calc(100% - ${w+30}px);`
      })
    },
    async getList () {
      if (!this.orgId) {
        return false
      }
      this.loading = true
      let res = await getStatisticData({ orgId: this.orgId, ...this.searchParams })
      this.loading = false
      this.tableData = res.data.scenariosList || []
      this.tableData.forEach(item => {
        item.storeRate = item.storeTotal === 0 ? 0 : (item.storeNum/item.storeTotal)
      })
      this.topList.forEach(item => {
        item.number = item.nameKey === 'buyedTotal' ? res.data.authNum : item.number
        item.number = item.nameKey === 'usedTotal' ? res.data.usedNum : item.number
        item.number = item.nameKey === 'usedRate' ? (res.data.authNum === 0 ? 0 : (res.data.usedNum/res.data.authNum*100).toFixed(0)+'%') : item.number
        item.number = item.nameKey === 'storeTotal' ? res.data.storeNum : item.number
        item.number = item.nameKey === 'storeRate' ? (res.data.storeTotal === 0 ? 0 : (res.data.storeNum/res.data.storeTotal*100).toFixed(0)+'%') : item.number
      })
    }
  }
}
</script>

<style lang="scss">
.useCount{
  .el-table__body{
    tbody{
      .el-table__row{
        td{
          height: 52px;
        }
      }
    }
  }
}
</style>
<style lang="scss" scoped>
.main_wrap{
  position:relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  height: calc(100vh - 50px);
  padding: 0 12px 0 2px;
  .left_part{
    // width: 300px;
    width: 100%;
    height: 100%;
    border-right: 1px solid #e0e0e0;
    .tree_div{
      width: 100%;
      height: 100%;
    }
  }
  .right_part{
    flex: 1;
    width: calc(100% - 310px);
    margin-left: 12px;
    .table_top_right{
      display: flex;
      align-items: center;
      justify-content: space-around;
      height:72px;
      margin: 16px 0 24px;
      background: #FFFFFF;
      box-shadow: 0 0 12px 0 rgba(0,0,0,0.10);
      border-radius: 4px;
      .top_item{
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        .number{
          font-family: MicrosoftYaHeiUISemibold;
          font-size: 18px;
          color: rgba(0,0,0,0.70);
          height: 26px;
          line-height: 26px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .name{
          font-size: 12px;
          color: rgba(0,0,0,0.40);
          height: 18px;
          line-height: 18px;
        }
      }
    }
  }
}
.table_wrap{
  height: calc(100% - 130px);
}
.empty_table{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.empty_img{
  width: 80px;
  height: 80px;
  // background: url(../../assets/images/resultEmpty.png) no-repeat;
  // background-size: cover;
  margin-bottom: 16px
}
</style>
