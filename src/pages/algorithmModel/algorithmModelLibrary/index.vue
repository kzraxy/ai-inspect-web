<template>
  <div class="algorithm-model">
    <div class="head">
      <div class="head_text">我的模型（{{this.total}}）个</div>
      <!-- <div class="head_operate_btn">
        <div class="appkey_btn" @click="addEditAppkey">账号配置</div>
         <el-button icon="h-icon-refresh" v-if="isSyncFlag" @click="getSyncFlag">同步中</el-button>
         <el-button class="tongbu_btn" v-if="!isSyncFlag" @click="syncAccount">模型同步</el-button>
      </div> -->
    </div>
    <div class="operator-mod">
      <div class="operator-mod_left-btn">
        <el-button icon="h-icon-update" v-if="syncState !== 'SYNCING'" @click="syncAccount">同步模型</el-button>
        <el-tooltip class="item" content="同步失败，请重新再试" placement="bottom" v-if="syncState==='FAIL'">
          <!-- <h-feedback-icon icon-name="h-icon-feedback_info_lg" /> -->
          <img src="@/assets/img/result_fail.svg" alt="同步失败" style="vertical-align:middle;margin-right:10px;">
        </el-tooltip>
        <el-button icon="h-icon-update" v-if="syncState === 'SYNCING'">同步中...</el-button>
        <el-button icon="h-icon-setting" @click="configurationFocusAlgorithm">配置关注算法</el-button>
        <div style="display: flex;align-items: center;">
          <el-button icon="h-icon-upload" @click="addAlgorithm">上传算法模型</el-button>
          <el-tooltip class="item" placement="top" popper-class="addAlgorithmTooltip">
            <div slot="content">
              1. 请上传原始的算法包，请勿修改内部文件。<br />
              2. 手动上传算法包无法自动数据回传或者再训练，若需要打通AI开放平台，请使用appKey和appSecret关联后同步模型使用。<br />
              3. 模型文件只能使用无授权模型。<br />
              4. 请确认设备网络是否能访问外网：hik-cloud.com和oss-cn-hangzhou.aliyuncs.com。
            </div>
            <i class="h-icon-info" style="font-size: 20px;margin-left: -2px;"></i>
          </el-tooltip>
        </div>
      </div>
      <div class="operator-mod_right-filter">
        <el-select v-model="searchForm.algorithmType" @change="handleAlgorithmTypeSelect" clear>
          <el-option v-for="(item,index) in algorithmsModelList" :key="index" :label="item.modelTypeName" :value="item.modelTypeCode">
          </el-option>
        </el-select>
        <div class="right-filter_input-search">
          <el-input
            class="el-input--width"
            placeholder="搜索算法模型名称"
            suffix-icon="h-icon-search"
            v-model="searchForm.algorithmName"
            @keyup.enter.native="handleIconClick"
            clearable
            :on-icon-click="handleIconClick"
            :clear-icon-click="clearIconClick">
          </el-input>
        </div>
      </div>
    </div>
    <!-- <el-scrollbar wrap-class="allTablesData" class="allTablesDataScrollbar" v-if="allTablesData.length>0"> -->
    <div class="list-mod">
      <el-scrollbar wrap-class="allTablesData" v-if="allTablesData.length>0">
        <div v-for="(item,index) in allTablesData" :key="index" class="model-wrap">
          <div class="model-head">
            <div class="model-name">
              <div class="title">{{item.modelType.modelTypeName}}： {{item.modelName}}</div>
              <el-tooltip popper-class="presentation_popper" v-show="item.isDemo"
              content="演示模型仅用于项目前期效果演示，最多可分析50路通道且有效期为2个月，到期后会自动失效。如需长期大规模使用，请重新训练模型。" placement="right-start">
                <div class="presentation_tag"><div>演示模型</div><div class="icon icon-font h-icon-help" style="font-size:22px"></div></div>
              </el-tooltip>
              <div class="presentation_tag" v-show="item.isDomain" style="cursor: initial;"><div>领域模型</div></div>
              <div class="presentation_tag" v-show="item.isUpload" style="cursor: initial;"><div>上传模型</div></div>
              <div class="presentation_tag" v-show="item.isLightKT2" style="cursor: initial;"><div>轻量级超脑模型</div></div>
              <div v-show="item.errorMsg" class="error_msg" :title="item.errorMsg">{{item.errorMsg}}</div>
            </div>
            <div class="model-head-right">
              <div class="text_btn" v-if="item.deletable" @click="deleteModel(item.modelId)">删除</div>
              <div class="text_btn" v-if="item.isIncludeUpgradeDetail" @click="showEvolution(item.modelId)">查看进化详情</div>
              <div class="text_btn" style="margin-left:24px" @click="goToInspectionConfig(item.modelId)">查看关联任务</div>
            </div>
          </div>
          <div class="table-mod" ref="tableRef" style="overflow-x:auto">
            <div>
              <el-scrollbar wrap-class="table-item-scrollbar__wrap">
                <el-table :data="item.versionInfosHandle" class="table-item">
                  <el-table-column prop="version" label="算法版本" width="15%">
                    <template slot-scope="scope">
                      {{scope.row.version}}
                      <span v-if="scope.row.isSuMissionProgressing" class="warning-tag">自主进化</span>
                      <span v-if="scope.row.modelPrecision==='HIGH_PRECISION'" class="warning-tag">高精度模型</span>
                      <span v-if="scope.row.modelPrecision==='ULTRA_HIGH_PRECISION'" class="warning-tag">观澜大模型</span>
                      <span v-if="scope.row.smallTargetEnhance==='SMALL_TARGET_ENHANCE'" class="warning-tag">双检测模型</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="platform" label="应用类型" width="7%">
                    <template slot-scope="scope">
                      <div class="platform_wrap">
                        <span>{{scope.row.platform.includes('CLOUD') ? '云服务-在线验证' : scope.row.platform.includes('DCT4') ? '云服务-云眸' : scope.row.platform}}</span>
                        <el-tooltip v-show="['CLOUD', 'DCT4'].includes(scope.row.platform) && scope.row.publishStatus === 0" class="item" popper-class="popperClass" content="该算法模型尚未完成云端部署，请购买相应云端算法服务。" placement="top">
                          <i class="info_icon"></i>
                        </el-tooltip>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="" label="OPAI版本" width="8%">
                    <template slot-scope="scope">
                      {{ scope.row.opaiVersion || '--' }}
                    </template>
                  </el-table-column>
                  <el-table-column label="算法识别能力" width="35%" show-overflow-tooltip>
                    <template slot-scope="scope">
                      <div class="table-tag" v-if="scope.row.labelInfos.length">
                        <div class="tag-num">{{scope.row.labelInfos.length}}个</div>
                        <div v-for="(item, index) in scope.row.labelInfos" :key="index" class="tag-item">
                          <span class="tag_name" :title="item.labelAlias || ''">{{(item.labelAlias && item.labelAlias.length > 6) ? (item.labelAlias.substr(0,6)) + '...' : (item.labelAlias || '')}}</span>
                        </div>
                      </div>
                      <div class="table-tag" v-else>- -</div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="createTime" label="生成时间" width="15%">
                    <template slot-scope="scope">
                      {{scope.row.createTime}}
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="20%">
                    <template slot-scope="scope">
                      <div class="operate_wrap">
                        <div>
                          <el-button @click="addNewTask(item.modelId, scope.row.trainId,scope.row.platform,scope.row.publishStatus,scope.row.modelPrecision)" :disabled="scope.row.addForbidden" type="iconButton" icon="h-icon-add" title="新建任务分析" class="table_btn"></el-button>
                          <el-button @click="editTag(scope.row, item)" :disabled="scope.row.editForbidden" type="iconButton" icon="h-icon-edit" title="编辑模型标签" class="table_btn"></el-button>
                          <img
                            title="模型自主进化"
                            :src="scope.row.isSelfUpgradeModelVersion ? require('@/icons/svg/model_self_evolution.svg') : require('@/icons/svg/model_self_evolution_disabled.svg')"
                            class="icon-svg"
                            @click="showSelfEvolution(scope.row)"
                          />
                          <img
                            title="模型手动进化"
                            :src="scope.row.isSelfUpgradeModelVersion ? require('@/icons/svg/model_hand_evolution.svg') : require('@/icons/svg/model_hand_evolution_disabled.svg')"
                            class="icon-svg"
                            @click="handleHandEvolution(scope.row)"
                          />
                          <!-- <svg-icon
                            title="模型自主进化"
                            :icon-class="scope.row.isSelfUpgradeModelVersion ? 'model_self_evolution' : 'model_self_evolution_disabled'"
                            class="icon-svg"
                            fontSize="24px"
                            @click.native="showSelfEvolution(scope.row)"
                          />
                          <svg-icon
                            title="模型手动进化"
                            :icon-class="scope.row.isSelfUpgradeModelVersion ? 'model_hand_evolution' : 'model_hand_evolution_disabled'"
                            class="icon-svg"
                            fontSize="24px"
                            @click.native="handleHandEvolution(scope.row)"
                          /> -->
                        </div>
                        <div v-if="scope.row.isIncludeTaskDeployDetail">
                          <el-button @click="showUpdateModal(scope.row)" type="link" class="table_btn">更新详情</el-button>
                        </div>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </el-scrollbar>
            </div>
            <div style="margin-top:11px" v-if="item.isShowExpand">
              <div class="expand-span" @click="changeExpandFlag(item,index)">
                <span style="font-size: 12px;color: rgba(0,0,0,0.70);">{{!item.isExpand ? '展开全部版本' : '收起'}}</span><i style="margin-left:10px" :class="!item.isExpand ? 'h-icon-angle_down' : 'h-icon-angle_up'"></i>
              </div>
            </div>
          </div>
        </div>
      </el-scrollbar>
      <div v-else style="margin-top:200px;text-align: center;">暂无数据</div>
    </div>
    <div class="bottom-pagination-mod">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="pageSizes"
        :page-size="10"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </div>
    <addEditAppkeyModal :visible.sync="addEditAppkeyVisible" :accountId="accountId" :accountInfo="accountInfo" @flashTable="flashAlgorithmModelList" @flashAccount="getAccount"></addEditAppkeyModal>
    <editTagModal :visible.sync="addTagVisible" :editTagInfo="editTagInfo" @flash="flashAlgorithmModelList"></editTagModal>
    <configurationFocusAlgorithm :visible.sync="configurationFocusAlgorithmVisible"></configurationFocusAlgorithm>
    <evolutionModal :visible.sync="evolutionVisible" :modelId="modelId"></evolutionModal>
    <updateDetailModal :visible.sync="updateDetailVisible" :trainId="trainId"></updateDetailModal>
    <selfEvolutionModal :visible.sync="selfEvolutionVisible" :trainId="trainId" @flash="flashAlgorithmModelList"></selfEvolutionModal>
    <addAlgorithmModal :visible.sync="addAlgorithmVisible" :trainId="trainId" @flash="flashAlgorithmModelList"></addAlgorithmModal>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getTablesData, getAccount, synchronousModel, getFocusAlgorithmList, manualStart, deleteModel } from './proxy'
import { getFormatTime } from '@/assets/libs/util'
import addEditAppkeyModal from './modal/addEditAppkeyModal'
import editTagModal from './modal/editTagModal'
import evolutionModal from './modal/evolutionModal'
import updateDetailModal from './modal/updateDetailModal'
import configurationFocusAlgorithm from './modal/configurationFocusAlgorithm'
import selfEvolutionModal from './modal/selfEvolutionModal'
import addAlgorithmModal from './modal/addAlgorithmModal'
import { PAGE_SIZE } from '@/constant'
export default {
  components: {
    addEditAppkeyModal,
    editTagModal,
    configurationFocusAlgorithm,
    evolutionModal,
    updateDetailModal,
    selfEvolutionModal,
    addAlgorithmModal
  },
  data () {
    return {
      addEditAppkeyVisible: false,
      addTagVisible: false,
      configurationFocusAlgorithmVisible: false,
      editTagInfo: {},
      syncState: 'NEW',
      accountId: '', // 当前用户的平台账号id
      accountInfo: {}, // 当前用户的平台账号的相关信息，如appkey，appSecret，syncStatus
      allTablesData: [], // 所有的列表数据
      searchForm: {
        algorithmType: '',
        algorithmName: '',
        pageNo: 1,
        pageSize: 10
      },
      pageSizes: PAGE_SIZE,
      currentPage: 1,
      total: 0,
      evolutionVisible: false,
      updateDetailVisible: false,
      addAlgorithmVisible: false,
      trainId: '',
      algorithmsModelList: [{ modelTypeCode: '', modelTypeName: '全部算法类型' }],
      selfEvolutionVisible: false,
      modelId: ''
    }
  },
  computed: {
    ...mapState({
      resetAccount: state => state.resetAccount
    })
  },
  watch: {
    // 账号重置后，更新表格数据和账号信息
    async resetAccount (val) {
      if (val) {
        await this.getTablesData()
        this.$store.commit('SET_RESET_ACCOUNT', false)
      }
    },
    configurationFocusAlgorithmVisible (val) {
      if (!val) {
        this.searchForm.pageNo = 1
        this.getTablesData()
        this.searchForm.algorithmType = ''
        this.getFocusAlgorithmList()
      }
    }
  },
  mounted () {
    this.getTablesData()
    this.getAccount()
    this.getFocusAlgorithmList()
  },
  methods: {
    deleteModel (modelId) {
      this.$confirm('确定删除该模型？', {
        type: 'question',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        deleteModel(modelId).then(res => {
          if (res.code === 0) {
            this.$message.success('删除成功！')
            this.getTablesData()
          }
        })
      })
    },
    addAlgorithm () {
      this.addAlgorithmVisible = true
    },
    showUpdateModal (row) {
      this.updateDetailVisible = true
      this.trainId = row.trainId
    },
    async func_one () {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(1)
        }, 500)
      })
    },
    // 获取模型同步的状态
    getAccount () {
      getAccount().then((res) => {
        if (+res.code === 0 && res.data) { // 该用户配置过平台账号
          let data = res.data
          this.accountId = data.accountId
          this.syncState = data.syncStatus
          this.accountInfo = data
        } else if (+res.code === 70030025) { // code为70030025，则没有配置过账号
          this.accountId = ''// 该用户没有配置过平台账号
          this.accountInfo = {}
          this.syncState = 'NEW'
        }
      })
    },

    // 获取模型同步的状态并刷新页面
    getSyncFlag () {
      getAccount().then((res) => {
        if (+res.code === 0 && res.data) {
          this.syncState = res.data.syncStatus
          if (this.syncState === 'SYNCING') {
            this.showModalStatus('有模型同步中，请稍后刷新页面查看。', '')
          }
        }
      })
      this.getAccount()
      this.getTablesData()
    },
    // 同步模型
    syncAccount () {
      getAccount().then((res) => {
        let tipTitle = ''
        let tipDescribe = ''
        if (+res.code === 0 && res.data) {
          this.accountId = res.data.accountId
          synchronousModel({ id: this.accountId }).then((res) => {
            if (+res.code === 0) {
              // 开始进行模型同步
              tipTitle = '模型同步中，请稍后刷新页面查看。'
              tipDescribe = ''
              this.showModalStatus(tipTitle, tipDescribe)
              this.getAccount()
              this.getTablesData()
            }
          })
        } else if (+res.code === 70030025) {
          // 未添加账号信息
          tipTitle = '未添加账号信息。'
          tipDescribe = '请先添加账号信息'
          this.showModalStatus(tipTitle, tipDescribe)
        }
      })
    },
    // 编辑模型弹框
    editTag (val, item) {
      this.editTagInfo = val
      this.editTagInfo.modelTypeName = item.modelType.modelTypeName
      this.addTagVisible = true
    },
    showModalStatus (tipTitle, tipDescribe) {
      this.$msgbox({
        title: tipTitle,
        type: 'info',
        message: tipDescribe
      })
    },
    // 配置平台账号弹框
    addEditAppkey () {
      this.addEditAppkeyVisible = true
    },
    // 获取本页所有的表格数据等
    getTablesData () {
      let param = {
        modelName: this.searchForm.algorithmName,
        modelType: this.searchForm.algorithmType,
        pageNo: this.searchForm.pageNo,
        pageSize: this.searchForm.pageSize
      }
      getTablesData(param).then((res) => {
        if (res.code === 0) {
          res.data.rows.map((item, index) => {
            item.versionInfosHandle = []
            if (item.versionInfos && item.versionInfos.length <= 1) { // versionInfos只有一条数据或者没有，直接赋给可以展示的数组
              item.isShowExpand = false
              item.isExpand = false
              item.versionInfosHandle = item.versionInfos
            } else {
              item.isShowExpand = true
              item.isExpand = false// 默认false不展开，所以显示 展开全部版本
              item.versionInfosHandle.push(item.versionInfos[0])// versionInfos有多条数据，一一push进可以展示的数组
            }
          })
          this.allTablesData = res.data.rows
          this.total = res.data.total
        }
      })
    },
    addNewTask (modelId, trainId, platform, publishStatus, modelPrecision) {
      if (publishStatus === 0) { // 云服务没有完成云端部署
        this.$msgbox({
          title: '',
          type: 'info',
          confirmButtonText: '知道了',
          message: '该算法模型尚未完成云端部署，请购买相应云端算法服务。'
        })
      } else {
        this.$router.push({ name: 'inspectionConfigDetail', 
        params: { isAdd: 'add', taskId: false, modelId: modelId, trainId: trainId, taskType: platform, serviceType: this.serviceType, modelPrecision: modelPrecision } })
      }
    },
    goToInspectionConfig (modelId) {
      this.$router.push({ name: 'inspectionConfig', params: { modelId: modelId, serviceType: this.serviceType } })
    },
    showEvolution (modelId) {
      this.evolutionVisible = true
      this.modelId = modelId
    },
    changeExpandFlag (item, index) {
      item.isExpand = !item.isExpand
      if (item.isExpand) {
        //  加载表格更多数据
        this.allTablesData[index].versionInfosHandle = item.versionInfos
      } else {
        this.allTablesData[index].versionInfosHandle = []
        this.allTablesData[index].versionInfosHandle.push(item.versionInfos[0])
      }
    },
    getFormatTime (val) {
      return getFormatTime(val)
    },
    configurationFocusAlgorithm () {
      this.configurationFocusAlgorithmVisible = true
    },
    // 获取当前用户关注了的算法类型
    async getFocusAlgorithmList () {
      let { code, data } = await getFocusAlgorithmList()
      if (code === 0) {
        data = data || []
        this.algorithmsModelList = [{ modelTypeCode: '', modelTypeName: '全部算法类型' }].concat(data)
      }
    },
    // 查询算法模型列表
    // async getAlgorithmModelList () {
    //   let param = {
    //     modelName: this.searchForm.algorithmName,
    //     modelType: this.searchForm.algorithmType,
    //     pageNo: this.searchForm.pageNo,
    //     pageSize: this.searchForm.pageSize
    //   }
    //   let { code, data } = await getAlgorithmModelList(param)
    //   if (code === 0) {
    //   }
    // },
    handleSizeChange (pageSize) {
      this.searchForm.pageNo = 1
      this.searchForm.pageSize = pageSize
      this.getTablesData()
    },
    handleCurrentChange (num) {
      this.currentPage = num
      this.searchForm.pageNo = num
      this.getTablesData()
    },
    flashAlgorithmModelList () {
      this.currentPage = 1
      this.searchForm.pageNo = 1
      this.getTablesData()
    },
    handleIconClick () {
      this.searchForm.pageNo = 1
      this.getTablesData()
    },
    clearIconClick () {
      this.searchForm.algorithmName = ''
      this.searchForm.pageNo = 1
      this.getTablesData()
    },
    handleAlgorithmTypeSelect (algorithmType) {
      this.searchForm.algorithmType = algorithmType
      this.searchForm.pageNo = 1
      this.getTablesData()
    },
    showSelfEvolution ({ isSelfUpgradeModelVersion, trainId }) {
      if (!isSelfUpgradeModelVersion) return
      this.trainId = trainId
      this.selfEvolutionVisible = true
    },
    handleHandEvolution ({ isSelfUpgradeModelVersion, trainId }) {
      if (!isSelfUpgradeModelVersion) return
      this.$confirm('确定手动进化模型？', {
        type: 'question',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        manualStart({ trainId }).then((res) => {
          if (+res.code === 0) {
            this.$message({
              type: 'success',
              message: '手动进化命令已发送'
            })
          }
        })
      })
    }
  }

}
</script>
<style lang="scss">
  .presentation_popper{
    width: 392px;
  }
  .el-tooltip__popper{
    max-width: 600px;
  }
  .addAlgorithmTooltip{
    width: 550px!important;
  }
  .algorithm-model{
    .tongbu_btn{
      border:1px solid rgba(0,0,0,0.20);
    }
    .allTablesData{
      height: calc(100VH - 241px);
    }
    .allTablesDataScrollbar{
      height: calc(100VH - 241px);
    }
    .table-item-scrollbar__wrap{
      max-height: 220px;
    }
    .el-scrollbar__wrap.allTablesData{
      overflow-x: hidden;
    }
    .algorithm-model-table{
      .el-scrollbar__wrap{
        margin-right:0!important
      }
      .el-scrollbar__bar.is-horizontal{
        display: none
      }
    }
    .el-table th, .el-table__footer-wrapper thead div, .el-table__header-wrapper thead div{
      // background: #f5f5f5;
      color: rgba(0,0,0,0.90)
    }
    .el-checkbox__input{
      top: 0 !important;
    }
    .el-table__empty-block{
      min-height: 30px
    }
    .tableMaxHeight{
      max-height: 280px;
    }
    .icon-svg {
      margin-left: 12px;
      cursor: pointer;
      vertical-align: middle;
    }
  }
</style>

<style lang="scss" scoped>
  @import './style';
</style>
