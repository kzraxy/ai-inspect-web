export default [
  {
    path: '/',
    redirect: '/intelligent/modelPool/retiail'
  },
  { // 场景方案库
    name: 'modelPool',
    path: '/intelligent/modelPool/:serviceType',
    component: 'modelPool/index.vue',
    menuCode: 'AI00001',
    breadcrumb: ''
  },
  { // 场景方案详情
    name: 'scenceDetail',
    path: '/intelligent/modelPool/:serviceType/scenceDetail/:solutionId/:serviceType',
    component: 'modelPool/scenceDetail.vue',
    menuCode: 'AI00001',
    breadcrumb: ''
  },
  { // 模型池详情
    name: 'modelPoolDetail',
    path: '/intelligent/modelPool/:serviceType/detail/:domainId/:serviceType',
    component: 'modelPool/modal/detail.vue',
    menuCode: 'AI00001',
    breadcrumb: ''
  },
  { // 我的模型
    name: 'intelligent',
    path: '/intelligent/modelPool/algorithmModel/:serviceType',
    component: 'algorithmModel/algorithmModelLibrary/index',
    menuCode: 'AI00002',
    breadcrumb: ''
  },
  { // 任务管理
    name: 'apiConfig',
    path: '/intelligent/apiConfig/:serviceType',
    component: 'apiConfig/index',
    menuCode: 'AI00101',
    breadcrumb: ''
  },
  { // 标签配置
    name: 'labelMapping',
    path: '/intelligent/algorithmModel/labelMapping/:serviceType',
    component: 'algorithmModel/labelMapping/index',
    menuCode: 'AI00102',
    breadcrumb: ''
  },
  { // 标签配置明细页
    name: 'labelMappingConfig',
    path: `/intelligent/algorithmModel/labelMapping/:serviceType/labelMappingConfig/:isAdd/:labelCodeId/:serviceType`,
    component: 'algorithmModel/labelMapping/labelMappingConfig',
    menuCode: 'AI00102',
    breadcrumb: ['标签配置', '配置']
  },
  { // 场景任务管理列表卡片页
    name: 'sceneConfig',
    path: '/intelligent/sceneConfig',
    component: 'sceneConfig/index',
    menuCode: 'AI00201',
    breadcrumb: '',
    meta: {
      keepAlive: true
    }
  },
  { // 场景任务-编辑任务
    name: 'editSceneTask',
    path: '/intelligent/sceneConfig/editSceneTask',
    component: 'sceneConfig/editSceneTask',
    menuCode: 'AI00201',
    breadcrumb: ''
  },
  { // 场景任务-任务详情页
    name: 'sceneTaskDetail',
    path: '/intelligent/sceneConfig/sceneTaskDetail',
    component: 'sceneConfig/sceneTaskDetail',
    menuCode: 'AI00201',
    breadcrumb: ''
  },
  { // 定制任务管理列表页
    name: 'inspectionConfig',
    path: '/intelligent/inspectionConfig/:serviceType',
    component: 'intelligent/inspectionConfig',
    menuCode: 'AI00201',
    breadcrumb: '',
    meta: {
      keepAlive: true
    }
  },
  { // 任务管理配置的配置明细页
    name: 'inspectionConfigDetail',
    path: `/intelligent/inspectionConfig/:serviceType/detail/:isAdd/:taskId/:serviceType`,
    component: 'intelligent/inspectionConfigModal/addConfigTask',
    menuCode: 'AI00201',
    breadcrumb: ['任务管理', '任务配置']
  },
  { // 任务管理大量通道的配置页
    name: 'channelConfigPage',
    path: `/intelligent/inspectionConfig/:serviceType/channelConfigPage`,
    component: 'intelligent/inspectionConfigModal/addHugeChannels',
    menuCode: 'AI00201',
    breadcrumb: ['任务管理', '通道配置']
  },

  {// 任务详情页
    name: 'taskDetail',
    path: `/intelligent/inspectionConfig/:serviceType/task/detail/:taskId/:type/:serviceType`,
    component: 'taskDetail/index',
    menuCode: 'AI00201',
    breadcrumb: ['任务管理', '任务详情']
  },
  { // 应用仓库配置页
    name: 'storeConfig',
    path: `/intelligent/inspectionConfig/:serviceType/storeConfig/:deviceSerial/:taskId/:serviceType`,
    component: 'taskDetail/storeConfig',
    menuCode: 'AI00201',
    breadcrumb: ['任务管理', '应用仓库配置']
  },
  { // 规则区域绘制页
    name: 'drawRuleAreas',
    path: `/intelligent/inspectionConfig/:serviceType/drawRuleAreas/:taskId/:isCloudOrDCT4/:serviceType`,
    component: 'intelligent/drawRuleAreas',
    menuCode: 'AI00201',
    breadcrumb: ['任务管理', '规则区域绘制']
  },
  { // 新的规则区域绘制页
    name: 'drawRuleAreasNew',
    path: `/intelligent/inspectionConfig/:serviceType/drawRuleAreasNew/:taskId/:taskName/:serviceType`,
    component: 'intelligent/drawRuleAreasNew',
    menuCode: 'AI00201',
    breadcrumb: ['任务管理', '规则区域绘制']
  },
  { // 任务资源
    name: 'cloudDeployment',
    path: '/intelligent/algorithmModel/cloudDeployment/:serviceType',
    component: 'algorithmModel/cloudDeployment/cloudDeployment',
    menuCode: 'AI00203',
    breadcrumb: ''
  },
  { // 识别区域管理
    name: 'identifyAreas',
    path: '/intelligent/identifyAreas/:serviceType',
    component: 'identifyAreas/index',
    menuCode: 'AI00205',
    breadcrumb: ''
  },
  { // 合规任务分析列表页
    name: 'complianceConfig',
    path: '/intelligent/complianceConfig/:serviceType',
    component: 'complianceConfig',
    menuCode: 'AI00202',
    breadcrumb: ''
  },
  { // 合规任务分析配置的配置明细页
    name: 'complianceConfigDetail',
    path: `/intelligent/complianceConfig/:serviceType/detail/:isAdd/:extraTaskId/:serviceType`,
    component: 'complianceConfig/inspectionConfigModal/addConfigTask',
    menuCode: 'AI00202',
    breadcrumb: ['合规任务分析', '任务配置']
  },
  { // 合规任务分析的规则区域绘制页
    name: 'complianceConfigDrawRuleAreas',
    path: `/intelligent/complianceConfig/:serviceType/drawRuleAreas/:extraTaskId/:isCloudOrDCT4/:serviceType`,
    component: 'complianceConfig/drawRuleAreas',
    menuCode: 'AI00202',
    breadcrumb: ['合规任务分析', '规则区域绘制']
  },
  { // 底图库管理
    name: 'baseMapManage',
    path: '/intelligent/baseMapManage/:serviceType',
    component: 'baseMapManage/baseMapManage',
    menuCode: 'AI00204',
    breadcrumb: ['底图库管理'],
    meta: {
      keepAlive: true
    }
  },
  { // 底图库管理配置页
    name: 'baseMapConfig',
    path: `/intelligent/baseMapManage/:serviceType/baseMapConfig/:type/:id/:deviceSerial/:serviceType`,
    component: 'baseMapManage/baseMapConfig',
    menuCode: 'AI00204',
    breadcrumb: ['底图库管理', '底图库详情']
  },
  { // 检索比对
    name: 'retrievalCompare',
    path: '/intelligent/retrievalCompare',
    component: 'retrievalCompare/index',
    menuCode: 'AI00206',
    breadcrumb: '',
    meta: {
      keepAlive: true
    }
  },
  { // 检索比对-编辑图库
    name: 'editCompareMap',
    path: '/intelligent/retrievalCompare/editCompareMap',
    component: 'retrievalCompare/editCompareMap',
    menuCode: 'AI00206',
    breadcrumb: ''
  },
  { // 授权管理
    name: 'serviceManage',
    path: '/intelligent/serviceManage/serviceManage/:serviceType',
    component: 'serviceManage/serviceManage',
    menuCode: 'AI00301',
    breadcrumb: ''
  },
  { // 用量统计
    name: 'addService',
    path: '/intelligent/useCount',
    component: 'aiAddService/useCount/index',
    menuCode: 'AI00401',
    breadcrumb: ''
  },
  { // 开通记录
    name: 'addService',
    path: '/intelligent/openRecord',
    component: 'aiAddService/openRecord/index',
    menuCode: 'AI00402',
    breadcrumb: ''
  },
  { // 告警消息
    name: 'addService',
    path: '/intelligent/alarmMessage',
    component: 'aiAddService/alarmMessage/index',
    menuCode: 'AI00403',
    breadcrumb: ''
  },
  { // 404页面
    path: '*',
    name: 'NotFound',
    component: 'notfound/notfound'
  },
  {
    name: 'judge',
    path: '/judge/:serviceType',
    menuCode: 'all',
    component: 'judge/index'
  },
  {
    name: 'redirect',
    path: '/redirect',
    menuCode: 'all',
    component: 'judge/redirect.vue'
  },
  {
    name: 'test',
    path: '/test',
    component: 'test',
    menuCode: 'AI00102',
    breadcrumb: ''
  }
]
