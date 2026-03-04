let safeCenterPlatformType = localStorage.getItem('sfSubsystem')
export default {
  oldNav: [
    {
      title: '场景方案管理',
      router: '/intelligent',
      menuCode: 'AI000',
      icon: 'icon iconfont iconmenu1',
      children: [{
        title: '场景方案库',
        router: `/intelligent/modelPool/${safeCenterPlatformType}`,
        menuCode: 'AI00001'
      },
      {
        title: '我的模型',
        router: `/intelligent/modelPool/algorithmModel/${safeCenterPlatformType}`,
        menuCode: 'AI00002'
      }]
    },
    {
      title: 'API分析任务',
      router: '/intelligent',
      menuCode: 'AI001',
      icon: 'icon iconfont iconmenu2',
      children: [
        {
          title: '任务管理',
          router: `/intelligent/apiConfig/${safeCenterPlatformType}`,
          menuCode: 'AI00101'
        },
        {
          title: '标签配置',
          router: `/intelligent/algorithmModel/labelMapping/${safeCenterPlatformType}`,
          menuCode: 'AI00102'
        }
      ]
    },
    {
      title: '任务中心',
      router: '/intelligent',
      menuCode: 'AI002',
      icon: 'icon iconfont iconmenu3',
      children: [
        {
          title: '场景任务',
          router: `/intelligent/sceneConfig`,
          menuCode: 'AI00201'
        },
        {
          title: '定制任务',
          router: `/intelligent/inspectionConfig/${safeCenterPlatformType}`,
          menuCode: 'AI00201'
        },
        {
          title: '定制任务资源',
          router: `/intelligent/algorithmModel/cloudDeployment/${safeCenterPlatformType}`,
          menuCode: 'AI00203'
        },
        {
          title: '识别区域管理',
          router: `/intelligent/identifyAreas/${safeCenterPlatformType}`,
          menuCode: 'AI00205'
        },
        // {
        //   title: '合规任务分析',
        //   router: `/intelligent/complianceConfig/${safeCenterPlatformType}`,
        //   menuCode: 'AI00202'
        // },
        {
          title: '底图库管理',
          router: `/intelligent/baseMapManage/${safeCenterPlatformType}`,
          menuCode: 'AI00204'
        },
        {
          title: '检索比对图库管理',
          router: `/intelligent/retrievalCompare`,
          menuCode: 'AI00206'
        },
      ]
    },
    {
      title: '服务管理',
      router: '/intelligent',
      menuCode: 'AI003',
      icon: 'icon iconfont iconmenu4',
      children: [{
        title: '服务管理',
        router: `/intelligent/serviceManage/serviceManage/${safeCenterPlatformType}`,
        menuCode: 'AI00301'
      }]
    },
    {
      title: 'AI 增值服务管理',
      router: '/intelligent',
      menuCode: 'AI004',
      icon: 'icon iconfont iconiconmenu5',
      children: [
        {
          title: '用量统计',
          router: `/intelligent/useCount`,
          menuCode: 'AI00401'
        },
        {
          title: '开通记录',
          router: `/intelligent/openRecord`,
          menuCode: 'AI00402'
        },
        {
          title: '告警消息',
          router: `/intelligent/alarmMessage`,
          menuCode: 'AI00403'
        }
      ]
    },
  ],
  newNav: [
    {
      title: '场景方案管理',
      router: '/intelligent',
      menuCode: 'AI000',
      icon: 'icon iconfont iconmenu1',
      children: [{
        title: '场景方案库',
        router: `/intelligent/modelPool/${safeCenterPlatformType}`,
        menuCode: 'AI00001'
      }]
    },
    {
      title: '任务中心',
      router: '/intelligent',
      menuCode: 'AI002',
      icon: 'icon iconfont iconmenu3',
      children: [
        {
          title: '场景任务',
          router: `/intelligent/sceneConfig`,
          menuCode: 'AI00201'
        },
        {
          title: '识别区域管理',
          router: `/intelligent/identifyAreas/${safeCenterPlatformType}`,
          menuCode: 'AI00205'
        },
        {
          title: '检索比对图库管理',
          router: `/intelligent/retrievalCompare`,
          menuCode: 'AI00206'
        },
      ]
    },
    {
      title: '服务管理',
      router: '/intelligent',
      menuCode: 'AI003',
      icon: 'icon iconfont iconmenu4',
      children: [{
        title: '服务管理',
        router: `/intelligent/serviceManage/serviceManage/${safeCenterPlatformType}`,
        menuCode: 'AI00301'
      }]
    },
  ]
} 
