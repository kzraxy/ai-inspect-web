<template>
  <div class="cloud-deployment">
    <div class="page-title">
      <div class="content_title">任务资源</div>
      <el-alert type="info" simple  show-icon :closable="false">
        <div slot="title" simple class="el-alert-text">
          <span>算法云部署消耗1个云端算法套餐；实际消耗数量根据大模型分析性能综合评估。</span>
          <!-- <span>您购买的“云端算法推理套餐包”剩余数量 {{numberCutter(algorithmPackage.authAmount - algorithmPackage.usedAmount)}} (购买总数量{{numberCutter(algorithmPackage.authAmount)}}，已用数量{{numberCutter(algorithmPackage.usedAmount)}})<span class="link" @click="toPurchasePlan">我要购买</span></span> -->
        </div>
      </el-alert>
      <div class="operator-mod" style="height:32px">
        <!-- <el-button icon="h-icon-add" @click="deploymentModel()">部署模型</el-button> -->
        <!-- <el-button icon="h-icon-arrow_down" :disabled="!hasSelectList.length" @click="offlineModel()">批量下线模型</el-button> -->
        <div class="used_wrap"><div>云端算法推理套餐包</div><div class="num">{{cloudAuthObj.usedNum}}/{{cloudAuthObj.authNum}}</div></div>
      </div>
    </div>
    <div class="table-mod">
      <el-table :data="tableData" force-scroll stripe style="width: 100%">
        <!-- <el-table-column type="selection"></el-table-column> -->
        <el-table-column prop="modelName" label="模型名称">
          <template slot-scope="scope">
            <div class="modelName_wrap">
              <div>{{scope.row.modelName}}</div>
              <div class="tag">
                <el-tooltip popper-class="presentation_popper" v-show="scope.row.isDemo"
                content="演示模型仅用于项目前期效果演示，最多可分析50路通道且有效期为2个月，到期后会自动失效。如需长期大规模使用，请重新训练模型。" placement="right-start">
                  <div class="presentation_tag"><div>演示模型</div><div class="icon icon-font h-icon-help" style="font-size:22px"></div></div>
                </el-tooltip>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="versionName" label="模型版本">
          <template slot-scope="scope">
            {{scope.row.versionName
            +(scope.row.modelPrecision==='HIGH_PRECISION'?'(高精度模型)':scope.row.modelPrecision==='ULTRA_HIGH_PRECISION'?'(观澜大模型)':'')
            +(scope.row.smallTargetEnhance==='SMALL_TARGET_ENHANCE'?'(双检测模型)':'')}}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="上线时间">
          <template slot-scope="scope">{{getFormatTime(scope.row.createTime)}}</template>
        </el-table-column>
        <!-- <el-table-column prop="qps" label="QPS数值" width="200">
          <template slot-scope="scope">
            {{!scope.row.qpsAble?'-':scope.row.qps}}
          </template>
        </el-table-column> -->
        <!-- <el-table-column prop="status" label="部署状态">
          <template slot-scope="scope">
            {{scope.row.status==='success'?'部署成功':scope.row.status==='progress'?'部署中':scope.row.status==='failed'?'部署失败':'-'}}
          </template>
        </el-table-column> -->
        <el-table-column label="智能分析任务数">
          <template slot-scope="scope">
            <el-button type="link" @click="showTaskInfos(scope.row)">{{scope.row.taskCount}}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="packageCost" label="消耗云端算法套餐数"></el-table-column>
        <!-- <el-table-column prop="ymAppId" label="模型分析ID" width="280"></el-table-column> -->
        <!-- <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="link" @click="offlineModel(scope.row)">下线</el-button>
            <el-button v-show="showQPSbtn" type="link" @click="qpsConfig(scope.row)" style="margin-left:16px">QPS参数配置</el-button>
          </template>
        </el-table-column> -->
      </el-table>
    </div>
    <div class="bottom-pagination-mod">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :page-sizes="pageSizes"
        :current-page="params.pageNo"
        :page-size="params.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </div>
    <DeploymentModelDialog :visible.sync="showDeploymentModelDialog"></DeploymentModelDialog>
    <QPSConfigModel :visible.sync="qpsConfigModelVisible" @refresh="getCloudDeploymentList" :resourceId="currentResourceId" :surplusQPS="surplusQPS"></QPSConfigModel>
    <taskInfosModel :visible.sync="taskInfosModelVisible" :resourceId="currentResourceId"></taskInfosModel>
  </div>
</template>
<script>
import { getCloudDeploymentNum, getCloudDeploymentList, offlineModel, getAuthNum } from '@/api/cloudDeployment'
import { getFormatTime } from '@/assets/libs/util'
import { getServiceManageInfo } from '@/api/serviceManage'
import { PAGE_SIZE, ALGORITHM_DEPLOY } from '@/constant'
import DeploymentModelDialog from './modal/deploymentModelDialog'
import QPSConfigModel from './modal/QPSConfigModel'
import taskInfosModel from './modal/taskInfosModel'
export default {
  components: {
    DeploymentModelDialog, QPSConfigModel, taskInfosModel
  },
  data () {
    return {
      cloudAuthObj: { authNum: 0, usedNum: 0 },
      algorithmPackage: {
        authAmount: 0,
        usedAmount: 0
      },
      tableData: [],
      params: {
        pageNo: 1,
        pageSize: 10
      },
      pageSizes: PAGE_SIZE,
      total: 0,
      hasSelectList: [],
      showDeploymentModelDialog: false,
      qpsConfigModelVisible: false,
      taskInfosModelVisible: false,
      currentResourceId: '',
      surplusQPS: 0, // QPS剩余量
      showQPSbtn: ''// 是否展示qps配置按钮
    }
  },
  watch: {
    showDeploymentModelDialog (val) {
      if (!val) {
        this.resetParams()
        this.getCloudDeploymentList()
        this.getCloudDeploymentNum()
      }
    }
  },
  methods: {
    async getAuthNum () {
      let { code, data } = await getAuthNum({ saleItemCode: 242 })
      if (code === 0) {
        this.cloudAuthObj = data
      }
    },
    getFormatTime (val) {
      return getFormatTime(val)
    },
    numberCutter (number, precision = 2) {
      var reg = /\d{1,3}(?=(\d{3})+$)/g
      if (number > 99999) {
        return (((number / 10000).toFixed(precision)) + '').replace(reg, '$&,')
      } else {
        return (number + '').replace(reg, '$&,')
      }
    },
    deploymentModel () {
      this.showDeploymentModelDialog = true
    },
    showTaskInfos (row) {
      this.taskInfosModelVisible = true
      this.currentResourceId = row.resourceId
    },
    qpsConfig (row) {
      // if (row.modelPrecision === 'HIGH_PRECISION' || row.modelPrecision === 'ULTRA_HIGH_PRECISION') {
      //   this.$message.info('高精度模型/观澜大模型不支持QPS配置！')
      //   return false
      // }
      // if (row.smallTargetEnhance === 'SMALL_TARGET_ENHANCE') {
      //   this.$message.info('双检测模型不支持QPS配置！')
      //   return false
      // }
      this.qpsConfigModelVisible = true
      this.currentResourceId = row.resourceId
    },
    offlineModel (row) {
      let list = []
      let message = '确定下线'
      if (row) {
        message += `${row.modelName}?`
        list.push(row.resourceId)
      } else {
        list = JSON.parse(JSON.stringify(this.hasSelectList))
        message += `所选的${list.length}个算法模型?`
      }
      this.$confirm(message, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'question'
      }).then(async () => {
        let { code } = await offlineModel({ list })
        if (code === 0) {
          this.$message({
            message: '下线成功',
            type: 'success'
          })
          this.resetParams()
          this.getCloudDeploymentList()
          this.getCloudDeploymentNum()
        } else {
          this.$message({
            message: '下线失败,请重试',
            type: 'warning'
          })
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消下线'
        })
      })
    },
    async getCloudDeploymentNum () {
      let { code, data } = await getCloudDeploymentNum()
      if (code === 0) {
        data.rows.forEach(item => {
          if (item.authCode === ALGORITHM_DEPLOY) {
            this.algorithmPackage = item
          }
        })
      }
    },
    async getCloudDeploymentList () {
      let { code, data } = await getCloudDeploymentList(this.params)
      if (code === 0) {
        // data.rows.forEach(item => {
        //   item.modelTypeName = item.modelType.modelTypeName
        // })
        // this.tableData = this.params.pageNo === 1 ? data.rows : this.tableData.concat(data.rows)
        this.tableData = data.rows || []
        this.total = data.total
      }
    },
    handleSizeChange (pageSize) {
      this.params.pageNo = 1
      this.params.pageSize = pageSize
      this.getCloudDeploymentList()
    },
    handleCurrentChange (num) {
      this.params.pageNo = num
      this.getCloudDeploymentList()
    },
    handleSelectionChange (val) {
      this.hasSelectList = val.map(item => { return item.resourceId })
    },
    resetParams () {
      this.params.pageNo = 1
    },
    toPurchasePlan () {
      let title = (window.location.href.indexOf('hilaicloud.com') > -1) ? '' : '海康威视'
      this.$alert(`请联系您当地的${title}服务商或销售代表，或拨打400-905-7898`, '', {
        confirmButtonText: '关闭',
        type: 'info'
      })
    },
    async getQPS () { // 是否需要展示qps配置按钮
      let { data } = await getServiceManageInfo()
      let qpsArr = data.rows.filter(item => item.authCode === 31057)
      this.showQPSbtn = qpsArr.length > 0
      this.surplusQPS = this.showQPSbtn ? (qpsArr[0].authAmount - qpsArr[0].usedAmount) : 0
    }
  },
  mounted () {
    this.getCloudDeploymentNum()
    this.getCloudDeploymentList()
    this.getQPS()
    this.getAuthNum()
  }
}
</script>
<style lang="scss" scoped>
  .used_wrap{
    float: right;
    color: rgba(0,0,0,0.60);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    height: 32px;
    .num{
      color: #000000;
      margin-left: 4px;
    }
  }
  .presentation_tag{
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    width: 84px;
    height: 24px;
    border: 1px solid #8C74FE;
    border-radius: 2px;
    color: #955AF5;
    background: #f8f2fe;
    margin-left: 8px;
    cursor: pointer;
  }
  .cloud-deployment{
    padding-top: 12px;
    .page-title{
      padding: 0 16px 5px 16px;
      border-bottom: 1px solid rgba(0,0,0,0.12);
      margin-bottom: 16px;
    }
    .content_title{
      font-size: 18px;
      color: rgba(0,0,0,0.90);
      line-height: 50px;
      font-weight: bold;
      box-sizing: border-box;
      margin-bottom: 10px;
    }
    .el-alert-text{
      line-height: 24px;
      .link{
        margin-left: 20px;
        font-size: 14px;
        color: #348BFF;
        cursor: pointer;
      }
    }
    .operator-mod{
      margin-top: 20px;
    }
    .table-mod{
      height: calc(100vh - 285px);
      padding: 0 16px 0 16px;
    }
    .bottom-pagination-mod{
      padding: 0 16px;
    }
  }
  .modelName_wrap{
    display: flex;
    align-items: center;
    .tag{
      margin-left: 10px
    }
  }
</style>
