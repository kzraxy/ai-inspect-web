/*
 * @Description: 算法模型配置文件
 * @Author: liushijie
 * @Date: 2021.01.28
 * @Last Modified by: liushijie
 * @Last Modified Date: 2021.01.28
 */

const TYPES = {
  IMAGE_CLASSIFICATION: '1', // 图像单分类
  OBJECT_DETECTION: '2', // 物体检测
  HYBRID: '3', // 混合
  OCR: '4', // 图像文字识别
  IMAGE_COMPARE: '10', // 图像比对
  IMAGE_CLASSIFICATION_MULTI: '0', // 图像多分类
  VIDEO_CLASSIFICATION: '12', // 视频分类
  VIDEO_BEHAVIOR: '11', // 视频事件分析
  RETRIEVAL_COMPARE: '13', // 检索比对
  SEMANTIC_SEGMENTATION: '17', // 图像语义分割
  SOUND_CLASSIFICATION: '19', // 声音分类
  IMAGE_CLASSIFICATION_MULTI_LABELS: '21', // 图像多标签分类
  INSTANCE_SEGMENTATION: '20', // 图像实例分割
  STRUCTURED_OCR: '25', // 结构化OCR
  SEMI_SUPERVISION_RECT_DETECTION: '102', // 半监督矩形物体检测
  KEYWORD_RECOGNITION: '29', // 关键词识别
  INDUSTRIAL_AUSCULTATION: '30', // 工业听诊
  OVD: '45'
};
const POLY_TYPES = {
  POLY_IMAGE_CLASSIFICATION: 'polyImageClassification',
  POLY_OCR: 'polyOCR',
  POLY_SEGMENTATION: 'polySegmentation',
  POLY_SOUND_CLASSIFICATION: 'polySoundClassification'
};
const HOME_FILTER_TYPES = {
  IMAGE: '1',
  SOUND: '2',
  VIDEO: '3',
  OCR: '4',
  MULTIMODAL: '5'
};
const HOME_FILTER_TABS = [
  { type: '', name: '全部' },
  { type: HOME_FILTER_TYPES.IMAGE, name: '图像类' },
  { type: HOME_FILTER_TYPES.OCR, name: 'OCR' },
  { type: HOME_FILTER_TYPES.MULTIMODAL, name: '多模态' },
  { type: HOME_FILTER_TYPES.SOUND, name: '音频类' },
  { type: HOME_FILTER_TYPES.VIDEO, name: '视频类' }
];
const ALGORITHM_TYPE = {
  IMAGE: '1', // 图片
  SOUND: '2', // 音频,
  VIDEO: '3' // 视频
};
const INFO = {
  [TYPES.IMAGE_CLASSIFICATION]: {
    key: TYPES.IMAGE_CLASSIFICATION,
    title: '图像单标签分类',
    intro: '识别一张图片中是否是某个指定的物体/状态/场景。适用于图片只需要识别某一属性的场景',
    imgId: 'image_classification',
    image: require('@/assets/img/lushu.png'),
    description: [
      '成本低，上传80张图片即可启动模型训练；',
      '速度快，图片批量上传、快速训练和发布；',
      '效率高，可同时建立适合多种场景的训练模型。'
    ],
    readyStatusText: '至少存在一个目标数≥10的分类标签，且满足训练条件的标签下的图片总数≥40',
    trainAdvice: '建议补充有目标图片数，使得此标签有目标图片数≥10',
    // TODO
    verifyReadyStatusText: '至少存在两个分类标签以及一张已标注图片',
    verifyAdvice: '建议补充有目标图片数，使得此标签已标注图片数≥1',
    // 顺序
    order: 3,
    // 标注方式
    taggingMode: [],
    // 算法类别 便于根据数据类型进行筛选
    type: ALGORITHM_TYPE.IMAGE,
    // home页 算法分类
    universalHomeFilterType: HOME_FILTER_TYPES.IMAGE,
    // 是否支持测试集
    supportVerify: true,
    publish: true,
    latestUpdate: false,
    hot: false,
    big: true,
    qualityAnalysis: true,
    modelAnalysis: false
  },
  [TYPES.OBJECT_DETECTION]: {
    key: TYPES.OBJECT_DETECTION,
    title: '物体检测模型',
    intro:
      '识别图片中每个物体的位置及其对应的类别。适用于有一个或多个物体的场景，如制服穿戴检测、物料检测等',
    imgId: 'object_detection',
    image: require('@/assets/img/lushu.png'),
    description: [
      '成本低，标注40张图片即可启动模型训练；',
      '速度快，图片批量上传、快速训练和发布；',
      '效率高，可同时建立适合多种场景的训练模型。'
    ],
    taggingMode: [
      { key: '矩形标注', value: 1 },
      { key: '四边形标注', value: 2 }
    ],
    readyStatusText: '至少存在一个目标数≥10的检测标签, 且满足训练条件的标签下的图片总数≥40',
    trainAdvice: '建议补充有目标图片数，使得此标签有目标图片数≥10',
    verifyReadyStatusText: '至少存在一张有目标标注图片',
    verifyAdvice: '建议补充有目标图片数，使得此标签有目标图片数≥1',
    // 顺序
    order: 1,
    // 算法类别
    type: ALGORITHM_TYPE.IMAGE,
    // home页 算法分类
    universalHomeFilterType: HOME_FILTER_TYPES.IMAGE,
    supportVerify: true,
    publish: true,
    latestUpdate: false,
    hot: false,
    bigHot: true,
    qualityAnalysis: true,
    modelAnalysis: true
  },
  [TYPES.HYBRID]: {
    key: TYPES.HYBRID,
    title: '混合模型',
    intro:
      '识别出图片中每个物体的位置、类别和属性。例如检测识别是否穿工服，并对工服颜色或类型进行分类',
    imgId: 'hybrid',
    image: require('@/assets/img/lushu.png'),
    description: [
      '成本低，标注40张图片即可启动模型训练；',
      '速度快，图片批量上传、快速训练和发布；',
      '效率高，可以将一起训练检测、分类任务，提取物体的位置和属性信息，不需要逐一模型训练。'
    ],
    taggingMode: [
      { key: '矩形标注', value: 1 },
      { key: '四边形标注', value: 2 }
    ],
    readyStatusText: '至少存在一个目标数≥10的检测标签, 且满足训练条件的标签下的图片总数≥40',
    trainAdvice:
      '检测标签、属性值:建议补充有目标图片数≥10。属性:补充至两个及以上的满足训练要求的属性值。',
    // TODO
    verifyReadyStatusText: '至少存在一张有目标标注图片',
    verifyAdvice: '建议补充有目标图片数，使得此标签有目标图片数≥1',
    // 顺序
    order: 2,
    // 算法类别
    type: ALGORITHM_TYPE.IMAGE,
    // home页 算法分类
    universalHomeFilterType: HOME_FILTER_TYPES.IMAGE,
    supportVerify: true,
    publish: true,
    latestUpdate: false,
    hot: false,
    bigHot: true,
    qualityAnalysis: true,
    modelAnalysis: true
  },
  [TYPES.OCR]: {
    key: TYPES.OCR,
    title: '图像文字识别模型',
    intro:
      '识别图片中文字的位置和内容。适用于图片文字和标签内容的分析和识别。例如设备仪表读数、车牌信息识别等',
    imgId: 'ocr',
    image: require('@/assets/img/lushu.png'),
    description: [
      '成本低，标注40张图片即可启动模型训练；',
      '聚焦自然场景、工业场景和生产场景中的文本字符串行识别。'
    ],
    taggingMode: [],
    readyStatusText: '有目标标注图片数≥40，且目标数≥100',
    // 顺序
    order: 6,
    // 算法类别
    type: ALGORITHM_TYPE.IMAGE,
    supportVerify: false,
    publish: true,
    latestUpdate: false,
    hot: false,
    qualityAnalysis: true,
    modelAnalysis: false
  },
  [TYPES.IMAGE_COMPARE]: {
    key: TYPES.IMAGE_COMPARE,
    title: '图像比对模型',
    intro: '识别比对同一场景的前景图像与背景图像的差异。例如通道占用检测、违规摆放物品、物品遗漏等',
    imgId: 'image_compare',
    image: require('@/assets/img/lushu.png'),
    description: [
      '成本低，标注40张前景图片即可训练出初步的算法模型；',
      '通用性强，可识别未经训练的类别；',
      '适应性强，对场景中的光线和阴影变化有自适应性。'
    ],
    taggingMode: [{ key: '矩形标注', value: 1 }],
    readyStatusText: '至少存在一个场景集下背景图片数≥40，已标注前景图片数≥40',
    // 顺序
    order: 8,
    // 算法类别
    type: ALGORITHM_TYPE.IMAGE,
    // home页 算法分类
    universalHomeFilterType: HOME_FILTER_TYPES.IMAGE,
    supportVerify: false,
    publish: true,
    latestUpdate: false,
    hot: false,
    modelAnalysis: false
  },
  [TYPES.IMAGE_CLASSIFICATION_MULTI]: {
    key: TYPES.IMAGE_CLASSIFICATION_MULTI,
    title: '图像多属性分类',
    intro: '识别一张图片中物体所属的类别，适用于分析图像同时具备多个属性的需求',
    imgId: 'image_classification_multi',
    image: require('@/assets/img/lushu.png'),
    description: [
      '成本低，标注80张图片即可启动模型训练；',
      '速度快，图片批量上传、快速训练和发布；',
      '灵活性高，支持从颜色、形状等多个维度，对目标主体进行自定义分类。'
    ],
    taggingMode: [],
    readyStatusText:
      '至少有两个属性标签下存在两个目标数≥10的属性值标签，且满足训练条件的标签下的图片总数≥40',
    trainAdvice: '属性值:建议补充有目标图片数≥10。属性:补充至两个及以上的满足训练要求的属性值。',
    // TODO
    verifyReadyStatusText:
      '至少存在两个属性标签且这两个属性标签每个至少存在两个属性值，至少存在1张已标注图片',
    verifyAdvice: '建议补充有目标图片数，使得此标签已标注图片数≥1',
    // 顺序
    order: 5,
    // 算法类别
    type: ALGORITHM_TYPE.IMAGE,
    supportVerify: true,
    publish: true,
    latestUpdate: false,
    hot: false,
    big: true,
    qualityAnalysis: true,
    modelAnalysis: false
  },
  [TYPES.VIDEO_CLASSIFICATION]: {
    key: TYPES.VIDEO_CLASSIFICATION,
    title: '视频分类模型',
    intro:
      '识别视频片段中是否含有某种特征的行为、物体位置或状态变化。例如运输带中是否运动、是否有物品',
    imgId: 'video_classification',
    image: require('@/assets/img/lushu.png'),
    description: ['应用广泛：适用于完成不同场景的视频事件分析任务。'],
    taggingMode: [],
    readyStatusText: '至少存在两个视频数≥300的分类标签',
    // 顺序
    order: 13,
    // 算法类别
    type: ALGORITHM_TYPE.VIDEO,
    // home页 算法分类
    universalHomeFilterType: HOME_FILTER_TYPES.VIDEO,
    supportVerify: false,
    publish: false,
    latestUpdate: false,
    hot: false,
    qualityAnalysis: false,
    modelAnalysis: false
  },
  [TYPES.VIDEO_BEHAVIOR]: {
    key: TYPES.VIDEO_BEHAVIOR,
    title: '视频事件分析模型',
    intro: '识别视频片段中某一事件的类别、状态发生的时间段和空间位置。例如翻越栏杆、暴力拖拽等',
    imgId: 'video_behavior',
    image: require('@/assets/img/lushu.png'),
    description: [
      '时空结合：同时输出某一个行为发生的时间范围和视频画面中的位置；',
      '应用广泛：适用于完成不同场景的视频事件分析任务。'
    ],
    taggingMode: [],
    readyStatusText: '至少存在一个有目标标注片段数≥300的行为标签；且对应的总视频数≥2',
    // 顺序
    order: 14,
    // 算法类别
    type: ALGORITHM_TYPE.VIDEO,
    // home页 算法分类
    universalHomeFilterType: HOME_FILTER_TYPES.VIDEO,
    supportVerify: false,
    publish: false,
    latestUpdate: false,
    hot: false,
    qualityAnalysis: false,
    modelAnalysis: false
  },
  [TYPES.RETRIEVAL_COMPARE]: {
    key: TYPES.RETRIEVAL_COMPARE,
    title: '检索比对模型',
    intro:
      '识别图片中的目标主体，检索和比对“注册集”与目标主体的相似度。例如货架货物识别、货物置空识别等',
    imgId: 'retrieval_compare',
    image: require('@/assets/img/lushu.png'),
    description: [
      '成本低，标注40张图片即可启动模型训练；',
      '通用性强，新增类别无需重新进行模型训练，直接加入注册集即可。'
    ],
    taggingMode: [{ key: '矩形标注', value: 1 }],
    readyStatusText: '至少存在5个目标数≥20的标签，且对应的总图片数≥40',
    // 顺序
    order: 9,
    // 算法类别
    type: ALGORITHM_TYPE.IMAGE,
    // home页 算法分类
    universalHomeFilterType: HOME_FILTER_TYPES.IMAGE,
    supportVerify: false,
    publish: true,
    latestUpdate: false,
    hot: false,
    qualityAnalysis: true,
    modelAnalysis: false
  },
  [TYPES.SEMANTIC_SEGMENTATION]: {
    key: TYPES.SEMANTIC_SEGMENTATION,
    title: '图像语义分割模型',
    intro:
      '识别图中每个个体的区域/面积，适用于不需要详细区分每个个体的场景。例如河道漂浮物识别、裸土覆盖检测等',
    imgId: 'semantic_segmentation',
    image: require('@/assets/img/lushu.png'),
    description: ['成本低，标注40张图片即可启动训练；', '效率高，可同时建立多种场景训练模型。'],
    taggingMode: [],
    readyStatusText: '至少存在一个图片数≥40的分割标签',
    // 顺序
    order: 10,
    // 算法类别
    type: ALGORITHM_TYPE.IMAGE,
    supportVerify: false,
    publish: true,
    latestUpdate: false,
    hot: false,
    qualityAnalysis: false,
    modelAnalysis: false
  },
  [TYPES.SOUND_CLASSIFICATION]: {
    key: TYPES.SOUND_CLASSIFICATION,
    title: '声音分类模型',
    intro: '识别音频中是否含有某种特定类别的音频事件。例如婴儿啼哭、汽车鸣笛、动物叫声等',
    imgId: 'sound_classification',
    image: require('@/assets/img/lushu.png'),
    description: [
      '成本低，上传50条音频即可启动模型训练；',
      '速度快，音频批量上传、快速训练和发布；',
      '应用广泛，适用于多种场景下的声音事件分类任务。'
    ],
    taggingMode: [],
    readyStatusText: '至少存在两个音频数≥10的分类标签；且对应的总音频数≥50',
    // 顺序
    order: 12,
    // 算法类别
    type: ALGORITHM_TYPE.SOUND,
    supportVerify: false,
    publish: true,
    latestUpdate: false,
    hot: false,
    qualityAnalysis: false,
    modelAnalysis: false
  },
  [TYPES.IMAGE_CLASSIFICATION_MULTI_LABELS]: {
    key: TYPES.IMAGE_CLASSIFICATION_MULTI_LABELS,
    title: '图像多标签分类',
    intro: '识别一张图片中有多物体/状态/场景。适用于分析对象有多种物体、状态的场景',
    imgId: 'image_classification_multi_labels',
    image: require('@/assets/img/lushu.png'),
    description: [
      '成本低，标注40张图片即可启动模型训练；',
      '速度快，图片批量上传、快速训练和发布；',
      '效率高，可同时建立适合多种场景的训练模型。'
    ],
    taggingMode: [],
    readyStatusText: '至少存在两个目标数≥10的分类标签，且满足训练条件的标签下的图片总数≥40',
    trainAdvice: '建议补充有目标图片数,使得此标签的有目标图片数≥10。',
    // 顺序
    order: 4,
    // 算法类别
    type: ALGORITHM_TYPE.IMAGE,
    supportVerify: false,
    publish: true,
    latestUpdate: false,
    hot: false,
    // big: true,
    qualityAnalysis: false,
    modelAnalysis: false
  },
  [TYPES.INSTANCE_SEGMENTATION]: {
    key: TYPES.INSTANCE_SEGMENTATION,
    title: '图像实例分割模型',
    intro: '识别图片中每个个体的位置、类别，以及每个个体的目标数量。例如不规则物料识别等',
    imgId: 'instance_segmentation',
    image: require('@/assets/img/lushu.png'),
    description: [
      '成本低，标注40张图片即可启动模型训练；',
      '速度快，图片批量上传、快速训练和发布；',
      '效率高，可同时建立适合多种场景的训练模型。'
    ],
    readyStatusText: '至少存在一个图片数≥40的分割标签',
    // 顺序
    order: 11,
    // 算法类别
    type: ALGORITHM_TYPE.IMAGE,
    supportVerify: false,
    publish: true,
    latestUpdate: false,
    hot: false,
    qualityAnalysis: false,
    modelAnalysis: false
  },
  [TYPES.STRUCTURED_OCR]: {
    key: TYPES.STRUCTURED_OCR,
    title: '结构化图像文字识别模型',
    intro:
      '识别自然场景下文字的位置、内容及属性。适用于信息结构化识别的场景，例如卡证票据、集装箱编号识别等',
    imgId: 'instance_segmentation',
    image: require('@/assets/img/lushu.png'),
    description: [
      '成本低，标注40张图片，即可启动模型训练；',
      '聚焦自然场景、工业场景和生产场景中的文本字符串的内容和属性识别。'
    ],
    readyStatusText: '至少存在一个图片数≥40的标签',
    // 顺序
    order: 7,
    // 算法类别
    type: ALGORITHM_TYPE.IMAGE,
    supportVerify: false,
    publish: true,
    latestUpdate: false,
    hot: false,
    qualityAnalysis: true,
    modelAnalysis: false
  },
  [TYPES.SEMI_SUPERVISION_RECT_DETECTION]: {
    key: TYPES.SEMI_SUPERVISION_RECT_DETECTION,
    title: '物体检测-半监督模型',
    intro: '',
    imgId: 'instance_segmentation',
    description: [],
    taggingMode: [{ key: '矩形标注', value: 1 }],
    readyStatusText: '至少存在1000张图片',
    verifyReadyStatusText: '至少存在200张有目标标注图片',
    supportVerify: true,
    type: ALGORITHM_TYPE.IMAGE,
    order: 16,
    qualityAnalysis: false,
    modelAnalysis: false
  },
  [TYPES.INDUSTRIAL_AUSCULTATION]: {
    key: TYPES.INDUSTRIAL_AUSCULTATION,
    title: '工业听诊识别模型',
    intro:
      '识别工业音频中是否包含工作异常的声音。例如风力发电机、皮带托辊等工业场景及工件的异常检测',
    imgId: 'industrial_auscultation',
    image: require('@/assets/img/lushu.png'),
    description: [],
    taggingMode: [],
    readyStatusText: '',
    // 顺序
    order: 17,
    // 算法类别
    type: ALGORITHM_TYPE.SOUND,
    supportVerify: false,
    publish: false,
    latestUpdate: true,
    hot: false,
    qualityAnalysis: false,
    modelAnalysis: false
  },
  [TYPES.KEYWORD_RECOGNITION]: {
    key: TYPES.KEYWORD_RECOGNITION,
    title: '关键词识别模型',
    intro: '识别音频中是否含有某类关键词或唤醒词，例如识别呼救信息、识别唤醒设备信息等',
    imgId: 'keyword_recognition',
    image: require('@/assets/img/lushu.png'),
    description: [],
    taggingMode: [],
    readyStatusText: '至少存在一个关键词的音频数≥40；且关键词标签数≥1',
    // 顺序
    order: 17,
    // 算法类别
    type: ALGORITHM_TYPE.SOUND,
    // home页 算法分类
    universalHomeFilterType: HOME_FILTER_TYPES.SOUND,
    supportVerify: false,
    publish: true,
    latestUpdate: true,
    hot: false,
    qualityAnalysis: false,
    modelAnalysis: false
  },
  [TYPES.OVD]: {
    key: TYPES.OVD,
    title: '开放目标检测',
    intro:
      '通过自然语言定义需识别的常见物体和场景，一句话即可精准定位目标并生成相关模型，满足不同场景定向识别的应用需求',
    imgId: 'ovd',
    image: require('@/assets/img/lushu.png'),
    description: [],
    taggingMode: [],
    readyStatusText: '',
    // 顺序
    order: 17,
    // 算法类别
    type: ALGORITHM_TYPE.IMAGE,
    // home页 算法分类
    universalHomeFilterType: HOME_FILTER_TYPES.MULTIMODAL,
    supportVerify: false,
    publish: true,
    latestUpdate: false,
    hot: false,
    big: true,
    qualityAnalysis: false,
    modelAnalysis: false
  },
  [POLY_TYPES.POLY_IMAGE_CLASSIFICATION]: {
    key: POLY_TYPES.POLY_IMAGE_CLASSIFICATION,
    title: '图像分类模型',
    intro: '根据不同的应用场景，可分为图像单标签分类、图像多属性分类、图像多标签分类三个类别',
    imgId: 'poly_image_classification',
    image: require('@/assets/img/lushu.png'),
    description: [],
    taggingMode: [],
    readyStatusText: '',
    // 顺序
    order: 3,
    // 算法类别
    type: ALGORITHM_TYPE.IMAGE,
    // home页 算法分类
    universalHomeFilterType: HOME_FILTER_TYPES.IMAGE,
    supportVerify: false,
    include: [
      TYPES.IMAGE_CLASSIFICATION,
      TYPES.IMAGE_CLASSIFICATION_MULTI,
      TYPES.IMAGE_CLASSIFICATION_MULTI_LABELS
    ],
    publish: true,
    latestUpdate: false,
    hot: false,
    big: true
  },
  [POLY_TYPES.POLY_OCR]: {
    key: POLY_TYPES.POLY_OCR,
    title: 'OCR模型',
    intro: '识别图片中的文字信息，根据不同场景可选择普通图像文字识别和结构化图像文字识别两种方式',
    imgId: 'poly_ocr',
    image: require('@/assets/img/lushu.png'),
    description: [],
    taggingMode: [],
    readyStatusText: '',
    // 顺序
    order: 3,
    // 算法类别
    type: ALGORITHM_TYPE.IMAGE,
    // home页 算法分类
    universalHomeFilterType: HOME_FILTER_TYPES.OCR,
    supportVerify: false,
    include: [TYPES.OCR, TYPES.STRUCTURED_OCR],
    publish: true,
    latestUpdate: false,
    hot: false
  },
  [POLY_TYPES.POLY_SEGMENTATION]: {
    key: POLY_TYPES.POLY_SEGMENTATION,
    title: '分割模型',
    intro:
      '对图像进行像素级分类，根据是否需要区分每一目标，可选择图像实例分割和图像语义分割两种模型类型',
    imgId: 'poly_segmentation',
    image: require('@/assets/img/lushu.png'),
    description: [],
    taggingMode: [],
    readyStatusText: '',
    // 顺序
    order: 3,
    // 算法类别
    type: ALGORITHM_TYPE.IMAGE,
    // home页 算法分类
    universalHomeFilterType: HOME_FILTER_TYPES.IMAGE,
    supportVerify: false,
    include: [TYPES.SEMANTIC_SEGMENTATION, TYPES.INSTANCE_SEGMENTATION],
    publish: true,
    latestUpdate: false,
    hot: false
  },
  [POLY_TYPES.POLY_SOUND_CLASSIFICATION]: {
    key: POLY_TYPES.POLY_SOUND_CLASSIFICATION,
    title: '音频分类模型',
    intro: '可根据场景需求，定制识别音频中是否包含某种特定类别的音频事件或音频异常',
    imgId: 'poly_sound_classification',
    image: require('@/assets/img/lushu.png'),
    description: [],
    taggingMode: [],
    readyStatusText: '',
    // 顺序
    order: 3,
    // 算法类别
    type: ALGORITHM_TYPE.SOUND,
    // home页 算法分类
    universalHomeFilterType: HOME_FILTER_TYPES.SOUND,
    supportVerify: false,
    include: [TYPES.SOUND_CLASSIFICATION, TYPES.INDUSTRIAL_AUSCULTATION],
    publish: true,
    latestUpdate: false,
    hot: false
  }
};
const ALGORITHM_MODE_TYPE = {
  UNIVERSAL_ALGORITHM: '1',
  TYPICAL_ALGORITHM: '2'
};
const ALGORITHM_MODE_INFO = {
  [ALGORITHM_MODE_TYPE.UNIVERSAL_ALGORITHM]: {
    key: ALGORITHM_MODE_TYPE.UNIVERSAL_ALGORITHM,
    title: '通用算法训练',
    intro: '通过通用算法模型添加自定义数据，训练您的专属模型',
    image: require('@/assets/img/lushu.png'),
    imageActive: require('@/assets/img/lushu.png')
  },
  [ALGORITHM_MODE_TYPE.TYPICAL_ALGORITHM]: {
    key: ALGORITHM_MODE_TYPE.TYPICAL_ALGORITHM,
    title: '典型应用训练',
    intro: '基于常见场景添加少量数据即可快速产出模型',
    image: require('@/assets/img/lushu.png'),
    imageActive: require('@/assets/img/lushu.png'),
    latestUpdate: true
  }
};
const ALGORITHM_MODE_LIST = [
  ALGORITHM_MODE_INFO[ALGORITHM_MODE_TYPE.UNIVERSAL_ALGORITHM],
  ALGORITHM_MODE_INFO[ALGORITHM_MODE_TYPE.TYPICAL_ALGORITHM]
];
const HOME_LIST = [
  {
    algorithm: TYPES.OBJECT_DETECTION
  },
  {
    algorithm: TYPES.HYBRID
  },
  {
    algorithm: POLY_TYPES.POLY_IMAGE_CLASSIFICATION
  },
  {
    algorithm: POLY_TYPES.POLY_OCR
  },
  {
    algorithm: TYPES.IMAGE_COMPARE
  },
  {
    algorithm: TYPES.OVD
  },
  {
    algorithm: TYPES.RETRIEVAL_COMPARE
  },
  {
    algorithm: POLY_TYPES.POLY_SEGMENTATION
  },
  {
    algorithm: POLY_TYPES.POLY_SOUND_CLASSIFICATION
  },
  {
    algorithm: TYPES.KEYWORD_RECOGNITION
  },
  {
    algorithm: TYPES.VIDEO_CLASSIFICATION
  },
  {
    algorithm: TYPES.VIDEO_BEHAVIOR
  }
];
// 全覆盖样式
const SILENT_DOWN_STYLE = {
  labelPoint: {
    flexDirection: 'column'
  },
  labelsWrap: {
    normal: { margin: '0' },
    hover: { margin: '0' },
    focus: { margin: '0' },
    illegal: { margin: '0' }
  },
  control: {
    normal: { borderWidth: 0, color: 'rgba(0,0,0,0.0)', radius: 0 },
    hover: { borderWidth: 0, color: 'rgba(0,0,0,0.0)', radius: 0 },
    focus: { borderWidth: 0, color: 'rgba(0,0,0,0.0)', radius: 0 },
    illegal: { borderWidth: 0, color: 'rgba(0,0,0,0.0)', radius: 0 }
  }
};
// 透明样式
const TRANSPARENT_STYLE = {
  shape: {
    ['normal']: {
      color: 'rgba(0,0,0,0.0)',
      borderColor: 'rgba(0,0,0,0.0)',
      borderWidth: 2
    },
    ['hover']: {
      color: 'rgba(0,0,0,0.0)',
      borderColor: 'rgba(0,0,0,0.0)',
      borderWidth: 2
    },
    ['focus']: {
      color: 'rgba(0,0,0,0.0)',
      borderColor: 'rgba(0,0,0,0.0)',
      borderWidth: 2
    }
  },
  labelsWrap: {
    normal: { margin: '5px' },
    hover: { margin: '5px' },
    focus: { margin: '5px' },
    illegal: { margin: '5px' }
  }
};
// 不包含目标样式
const NO_TARGET_STYLE = {
  ...SILENT_DOWN_STYLE,
  ...TRANSPARENT_STYLE,
  label: {
    normal: { background: '#cccccc', color: '#fff' },
    hover: { background: '#cccccc', color: '#fff' },
    focus: { background: '#cccccc', color: '#fff' },
    illegal: { background: '#cccccc', color: '#fff' }
  }
};
// 标注框样式
const STYLE = {
  // 分类样式
  CLASSIFY_STYLE: {
    ...SILENT_DOWN_STYLE,
    ...TRANSPARENT_STYLE
  },
  // 待确认样式
  CONFIRM: {
    shape: {
      normal: {
        borderColor: '#3DD0FF',
        color: 'rgba(61,208,255,0)'
      },
      hover: {
        borderColor: '#3DD0FF',
        color: 'rgba(61,208,255,0.3)'
      }
    },
    label: {
      normal: {
        color: '#3DD0FF'
      },
      hover: {
        color: '#3DD0FF'
      }
    }
  },
  // 屏蔽区域样式
  NO_CARE: {
    shape: {
      normal: {
        borderColor: '#A197FF'
      }
    }
  },
  // 不包含目标样式
  NO_TARGET: {
    ...NO_TARGET_STYLE
  },
  // 正确样式
  CORRECT: {
    shape: {
      normal: {
        borderColor: '#77CC67',
        color: 'rgba(119,204,103,0)'
      },
      hover: {
        borderColor: '#77CC67',
        color: 'rgba(119,204,103,0.3)'
      },
      focus: {
        borderColor: '#77CC67',
        color: 'rgba(119,204,103,0.3)'
      }
    },
    label: {
      normal: {
        color: '#77CC67'
      },
      hover: {
        color: '#77CC67'
      },
      focus: {
        color: '#77CC67'
      }
    },
    correctLabel: {
      normal: {
        color: '#fff',
        background: '#77CC67'
      },
      hover: {
        color: '#fff',
        background: '#77CC67'
      }
    }
  },
  // 漏标样式
  MISS_LABEL: {
    shape: {
      normal: {
        borderColor: '#F99A49',
        color: 'rgba(249,154,73,0)'
      },
      hover: {
        borderColor: '#F99A49',
        color: 'rgba(249,154,73,0.3)'
      },
      focus: {
        borderColor: '#F99A49',
        color: 'rgba(249,154,73,0.4)'
      }
    },
    label: {
      normal: {
        color: '#F99A49'
      },
      hover: {
        color: '#F99A49'
      },
      focus: {
        color: '#F99A49'
      }
    },
    missLabel: {
      normal: {
        color: '#fff',
        background: '#F99A49'
      },
      hover: {
        color: '#fff',
        background: '#F99A49'
      }
    }
  },
  // 误标样式
  ERROR_LABEL: {
    shape: {
      normal: {
        borderColor: '#F56A4B',
        color: 'rgba(245,106,75,0)'
      },
      hover: {
        borderColor: '#F56A4B',
        color: 'rgba(245,106,75,0.3)'
      },
      focus: {
        borderColor: '#F56A4B',
        color: 'rgba(245,106,75,0.4)'
      }
    },
    label: {
      normal: {
        color: '#F56A4B'
      },
      hover: {
        color: '#F56A4B'
      },
      focus: {
        color: '#F56A4B'
      }
    },
    errorLabel: {
      normal: {
        color: '#fffB',
        background: '#F56A4B'
      },
      hover: {
        color: '#fff',
        background: '#F56A4B'
      },
      focus: {
        color: '#fff',
        background: '#F56A4B'
      }
    }
  }
};
// 标注框样式
const calibrateSTYLE = {
  // 分类样式
  CLASSIFY_STYLE: {
    ...SILENT_DOWN_STYLE,
    ...TRANSPARENT_STYLE
  },
  // 待确认样式
  CONFIRM: {
    shape: {
      normal: {
        borderColor: '#3DD0FF',
        color: 'rgba(61,208,255,0)'
      },
      hover: {
        borderColor: '#3DD0FF',
        color: 'rgba(61,208,255,0.3)'
      }
    },
    label: {
      normal: {
        color: '#3DD0FF'
      },
      hover: {
        color: '#3DD0FF'
      }
    }
  },
  // 屏蔽区域样式
  NO_CARE: {
    shape: {
      normal: {
        borderColor: '#A197FF'
      }
    }
  },
  // 不包含目标样式
  NO_TARGET: {
    ...NO_TARGET_STYLE
  },
  // 正确样式
  CORRECT: {
    shape: {
      normal: {
        borderColor: '#77CC67',
        color: 'rgba(119,204,103,0)'
      },
      hover: {
        borderColor: '#77CC67',
        color: 'rgba(119,204,103,0.3)'
      },
      focus: {
        borderColor: '#77CC67',
        color: 'rgba(119,204,103,0.3)'
      }
    },
    label: {
      normal: {
        color: '#77CC67'
      },
      hover: {
        color: '#77CC67'
      },
      focus: {
        color: '#77CC67'
      }
    },
    correctLabel: {
      normal: {
        color: '#fff',
        background: '#77CC67'
      },
      hover: {
        color: '#fff',
        background: '#77CC67'
      }
    }
  },
  // 漏标样式
  MISS_LABEL: {
    shape: {
      normal: {
        borderColor: '#F99A49',
        color: 'rgba(249,154,73,0)'
      },
      hover: {
        borderColor: '#F99A49',
        color: 'rgba(249,154,73,0.3)'
      },
      focus: {
        borderColor: '#F99A49',
        color: 'rgba(249,154,73,0.4)'
      }
    },
    label: {
      normal: {
        color: '#F99A49'
      },
      hover: {
        color: '#F99A49'
      },
      focus: {
        color: '#F99A49'
      }
    },
    missLabel: {
      normal: {
        color: '#fff',
        background: '#F99A49'
      },
      hover: {
        color: '#fff',
        background: '#F99A49'
      }
    }
  },
  // 误标样式
  ERROR_LABEL: {
    shape: {
      normal: {
        borderColor: '#F56A4B',
        color: 'rgba(245,106,75,0)'
      },
      hover: {
        borderColor: '#F56A4B',
        color: 'rgba(245,106,75,0.3)'
      },
      focus: {
        borderColor: '#F56A4B',
        color: 'rgba(245,106,75,0.4)'
      }
    },
    label: {
      normal: {
        color: '#F56A4B'
      },
      hover: {
        color: '#F56A4B'
      },
      focus: {
        color: '#F56A4B'
      }
    },
    errorLabel: {
      normal: {
        color: '#fffB',
        background: '#F56A4B'
      },
      hover: {
        color: '#fff',
        background: '#F56A4B'
      },
      focus: {
        color: '#fff',
        background: '#F56A4B'
      }
    }
  }
};
export default {
  TYPES,
  HOME_FILTER_TYPES,
  HOME_FILTER_TABS,
  POLY_TYPES,
  INFO,
  ALGORITHM_TYPE,
  ALGORITHM_MODE_TYPE,
  ALGORITHM_MODE_INFO,
  ALGORITHM_MODE_LIST,
  HOME_LIST,
  STYLE,
  calibrateSTYLE
};
