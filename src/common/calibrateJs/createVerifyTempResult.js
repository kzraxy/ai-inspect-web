import algorithmsCfg from './algorithms';
import CryptoJS from 'crypto-js';

function getPointCoordinates(coordinates) {
  return [coordinates[0], coordinates[0], coordinates[0], coordinates[0]];
}
// 生成回显 : 生成全局标注框（单标签、多标签、多属性）
function createCoverCalibration(params = {}) {
  const { tailorScope = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 } ] } = params;
  const type = 'rect';
  const scope = { type };
  const style = JSON.parse(JSON.stringify(algorithmsCfg.calibrateSTYLE.CLASSIFY_STYLE));
  scope.coordinates = getPointCoordinates(tailorScope);
  return {
    style,
    scope
  };
}
// 获取标注框唯一id
function guid() {
  const len = 32;
  const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  const maxPos = chars.length;
  let str = '';
  for (let i = 0; i < len; i++) {
    str += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return str;
}
function cutBefore(key, targetStr) {
  let string = '';
  try {
    string = targetStr.slice(targetStr.search(key) + key.length);
  } catch (e) {
  }
  return string;
}
function cutAfter(key, targetStr) {
  let string = '';
  try {
    string = targetStr.slice(0, targetStr.search(key));
  } catch (e) {
  }
  return string;
}
// 关键词
function getKeywordRecognitionLabelMap(mapping) {
  const valueMap = {};
  const labelStr = mapping?.[0]?.labels?.[0] || '';
  // 标签数量
  const labelCount = Number(cutAfter(' ', cutBefore('0 类别 ', labelStr)) || 0);
  // 标签数组 : [key,name,key,name]
  const labelArr = cutBefore(' ', cutBefore('0 类别 ', labelStr)).split(' ');
  for (let i = 0; i < labelCount; i++) {
    const valueKey = labelArr?.[2 * i] || '';
    const valueName = labelArr?.[2 * i + 1] || '';
    valueMap[valueKey] = {
      name: valueName
    };
  }
  return valueMap;
}
// 分割
function getSegmentationLabelMap(mapping) {
  const valueMap = {};
  const valueLabelList = mapping?.[0]?.labels || [];
  for (let i = 0, len = valueLabelList.length; i < len; i++) {
    const valueStr = valueLabelList[i];
    // 计算属性值
    const valueKey = cutAfter(' ', valueStr);
    const valueName = cutBefore(' ', valueStr);
    valueMap[valueKey] = { name: valueName };
  }
  return valueMap;
}
function getLabelMap({ mapping, testFileList, algorithm }) {
  try {
    switch (algorithm) {
      case algorithmsCfg.TYPES.IMAGE_CLASSIFICATION:
        return getImageClassificationLabelMap(mapping);
      case algorithmsCfg.TYPES.IMAGE_CLASSIFICATION_MULTI_LABELS:
        return getImageClassificationMultiLabelsLabelMap(mapping);
      case algorithmsCfg.TYPES.IMAGE_CLASSIFICATION_MULTI:
        return getImageClassificationMultiLabelMap(mapping);
      case algorithmsCfg.TYPES.OBJECT_DETECTION:
      case algorithmsCfg.TYPES.SEMI_SUPERVISION_RECT_DETECTION:
        return getObjectDetectionLabelMap(mapping);
      case algorithmsCfg.TYPES.HYBRID:
        return getHybridLabelMap(mapping);
      case algorithmsCfg.TYPES.STRUCTURED_OCR:
        return getStructuredOcrLabelMap(mapping);
      case algorithmsCfg.TYPES.SEMANTIC_SEGMENTATION:
      case algorithmsCfg.TYPES.INSTANCE_SEGMENTATION:
        return getSegmentationLabelMap(mapping);
      case algorithmsCfg.TYPES.RETRIEVAL_COMPARE:
        return getRetrievalSegmentationLabelMap(testFileList);
      case algorithmsCfg.TYPES.SOUND_CLASSIFICATION:
        return getSoundClassificationLabelMap(mapping);
      case algorithmsCfg.TYPES.KEYWORD_RECOGNITION:
        return getKeywordRecognitionLabelMap(mapping);
      case algorithmsCfg.TYPES.OCR:
      case algorithmsCfg.TYPES.IMAGE_COMPARE:
    }
  } catch (e) {
    return {};
  }
}
// 获取色环
function getColorList(count) {
  const colorStep = Math.floor(1536 / count);
  const normal = 255;
  const colorList = [];
  for (let i = 0; i < count; i++) {
    const colorNum = colorStep * (i + 1) - 1;
    let colorRGB = [];
    if (colorNum < 256) {
      colorRGB = [255, 0, colorNum, normal];
    }
    if (256 <= colorNum && colorNum < 512) {
      colorRGB = [255 - (colorNum - 256), 0, 255, normal];
    }
    if (512 <= colorNum && colorNum < 768) {
      colorRGB = [0, colorNum - 512, 255, normal];
    }
    if (768 <= colorNum && colorNum < 1024) {
      colorRGB = [0, 255, 255 - (colorNum - 768), normal];
    }
    if (1024 <= colorNum && colorNum < 1280) {
      colorRGB = [colorNum - 1024, 255, 0, normal];
    }
    if (1280 <= colorNum && colorNum < 1536) {
      colorRGB = [255, 255 - (colorNum - 1280), 0, normal];
    }
    colorList.push(colorRGB);
  }
  return colorList;
}
// 图形:检测图形
function createDetectScope(data, taggingMode) {
  const scope = {};
  if (`${taggingMode}` === '1') {
    scope.type = 'rect';
    if (typeof data.rect !== 'object') {
      throw new Error('数据错误:', data);
    }
    const rect = data.rect;
    const x = Number(rect.x);
    const y = Number(rect.y);
    const w = Number(rect.w);
    const h = Number(rect.h);
    if (isNaN(x) || isNaN(y) || isNaN(w) || isNaN(h)) {
      throw new Error('数据错误:', data);
    }
    scope.coordinates = [
      { x, y },
      { x: x + w, y },
      { x: x + w, y: y + h },
      { x, y: y + h }
    ];
  } else if (`${taggingMode}` === '2') {
    if (!Array.isArray(data.polygon)) {
      throw new Error('数据错误:', data);
    }
    const polygon = data.polygon;
    scope.type = 'quad';
    scope.coordinates = [];
    if (polygon.length !== 4) {
      throw new Error('数据错误:', data);
    }
    polygon.forEach(co => {
      const x = Number(co.x);
      const y = Number(co.y);
      if (isNaN(x) || isNaN(y)) {
        throw new Error('数据错误:', data);
      }
      scope.coordinates.push({
        x,
        y
      });
    });
  }
  // 推理是相对裁剪内的图片校验的，所以结果是相对裁剪框左上角的
  return scope;
}
// 图形:拆分一个mask为多个mask
function splitMaskInfo(maskInfo = {}, labelMap = {}) {
  try {
    // debugger
    const height = maskInfo.maskHeight || 0;
    const width = maskInfo.maskWidth || 0;
    const parsedWordArray = CryptoJS.enc.Base64.parse(maskInfo.maskData || '');
    const parsedStr = parsedWordArray.toString();
    const maskMap = {};
    const labelIdList = Object.keys(labelMap);
    const colorList = getColorList(labelIdList.length);
    for (let i = 0, len = labelIdList.length; i < len; i++) {
      const valueId = labelIdList[i];
      maskMap[valueId] = {
        rect: {
          x: 0,
          y: 0,
          w: 1,
          h: 1
        },
        width,
        height,
        colorIndex: i,
        attrConf: 0,
        type: valueId,
        dataArr: new Uint8ClampedArray(width * height * 4)
      };
    }
    for (let k = 0, length = labelIdList.length; k < length; k++) {
      // 一个标签的蒙层
      const valueId = labelIdList[k];
      const colorRGB = colorList[k];
      const dataArr = maskMap[valueId].dataArr;
      maskMap[valueId].colorRGB = colorRGB;
      let has = false;
      for (let i = 0, len = Math.floor(parsedStr.length / 2); i < len; i++) {
        const maskValueId = parsedStr[2 * i + 1] ?? '';
        if (`${maskValueId}` === `${valueId}`) {
          has = true;
          // 填充颜色
          dataArr[4 * i] = colorRGB[0];
          dataArr[4 * i + 1] = colorRGB[1];
          dataArr[4 * i + 2] = colorRGB[2];
          dataArr[4 * i + 3] = colorRGB[3];
        } else {
          // 填充颜色
          dataArr[4 * i] = 0;
          dataArr[4 * i + 1] = 0;
          dataArr[4 * i + 2] = 0;
          dataArr[4 * i + 3] = 0;
        }
      }
      if (!has) {
        // 删除不存在的类别
        delete maskMap[valueId];
      }
    }
    return Object.values(maskMap);
  } catch (e) {
    return [];
  }
}
// 图形:组装图像实例分割mask
function splitMaskInfoList({ maskInfoList = [], targets = [] }, labelMap, imageHeightAndWidth) {
  try {
    // 创建标签层
    // debugger
    const colorList = getColorList(maskInfoList.length);
    const maskList = [];
    for (let i = 0, len = maskInfoList.length; i < len; i++) {
      const maskInfo = maskInfoList[i];
      const targetId = maskInfo.id ?? 0;
      const target = targets.find(target => `${target?.obj?.id}` === `${targetId}`)?.obj || {};
      // const valueId = target.type;
      const h = Number(target.rect.h);
      const w = Number(target.rect.w);
      const x = Number(target.rect.x);
      const y = Number(target.rect.y);
      if (isNaN(w) || isNaN(h) || isNaN(x) || isNaN(y)) {
        throw new Error('数据结构错误', targets);
      }
      // const height = Math.ceil(h * imageHeightAndWidth.height);
      // const width = Math.ceil(w * imageHeightAndWidth.width);
      const x1 = Math.floor(x * imageHeightAndWidth.width + 0.5);
      const y1 = Math.floor(y * imageHeightAndWidth.height + 0.5);
      const x2 = Math.floor((x + w) * imageHeightAndWidth.width + 0.5);
      const y2 = Math.floor((y + h) * imageHeightAndWidth.height + 0.5);
      const height = y2 - y1;
      const width = x2 - x1;
      // const left = Math.ceil(x * imageHeightAndWidth.width);
      // const top = Math.ceil(y * imageHeightAndWidth.height);
      const dataArr = new Uint8ClampedArray(width * height * 4);
      const parsedWordArray = CryptoJS.enc.Base64.parse(maskInfo.imageData);
      const parsedStr = parsedWordArray.toString();
      const colorRGB = colorList[i];
      // let pixelNum = 0;
      for (let k = 0, len = Math.floor(parsedStr.length / 2); k < len; k++) {
        const maskValueId = parsedStr[2 * k + 1] ?? 0;
        // if (`${maskValueId}` === `${valueId}`) {
        if (`${maskValueId}` !== '0') {
          // pixelNum++;
          // 填充颜色
          dataArr[4 * k] = colorRGB[0];
          dataArr[4 * k + 1] = colorRGB[1];
          dataArr[4 * k + 2] = colorRGB[2];
          dataArr[4 * k + 3] = colorRGB[3];
        } else {
          // 填充颜色
          dataArr[4 * k] = 0;
          dataArr[4 * k + 1] = 0;
          dataArr[4 * k + 2] = 0;
          dataArr[4 * k + 3] = 0;
        }
      }
      maskList.push({
        rect: target.rect,
        attrConf: target.confidence,
        type: target.type,
        colorIndex: i,
        dataArr,
        height,
        width,
        // leftRatio: left / imageHeightAndWidth.width,
        // topRatio: top / imageHeightAndWidth.height,
        leftRatio: x1 / imageHeightAndWidth.width,
        topRatio: y1 / imageHeightAndWidth.height,
        colorRGB
      });
    }
    return maskList;
  } catch (e) {
    return [];
  }
}
// 转化:单标签分类
function createVerifyTempResultsClassification(data) {
  const { calibrationData, labelMap: valueMap } = data;
  const propertyList = calibrationData?.properties || [];
  // 生成标签列表
  const labelList = [];
  for (let i = 0, len = propertyList.length; i < len; i++) {
    const value = propertyList?.[i]?.classify || {};
    // 属性值ID
    const valueId = value?.attrValue ?? '';
    labelList.push({
      text: valueMap?.[valueId]?.name || '--',
      confidence: `${((value?.attrConf ?? 0) / 10).toFixed(2)}%`
    });
  }
  return {
    ...createCoverCalibration(),
    labelList
  };
}
// 转化:多标签分类
function createVerifyTempResultsClassificationMulti(data) {
  const { calibrationData, labelMap: valueMap } = data;
  const propertyList = calibrationData?.properties || [];
  // 生成标签列表
  const labelList = [];
  for (let i = 0, len = propertyList.length; i < len; i++) {
    const property = propertyList?.[i]?.classify || {};
    // 属性名ID
    const propertyId = property?.attrType ?? '';
    const confidence = property?.attrConf ?? 0;
    if (confidence <= 500) {
      // 过滤置信度低于50%的结果
      continue;
    }
    labelList.push({
      text: valueMap?.[propertyId]?.name || '--',
      confidence: `${(confidence / 10).toFixed(2)}%`
    });
  }
  return {
    ...createCoverCalibration(),
    labelList
  };
}
// 转化:多属性分类
function createVerifyTempResultsImageClassificationMulti(data) {
  const { calibrationData, labelMap: propertyMap } = data;
  const propertyList = calibrationData?.properties || [];
  // 生成标签列表
  const labelList = [];
  for (let i = 0, len = propertyList.length; i < len; i++) {
    // 属性名
    const propertyId = propertyList?.[i]?.classify?.attrType ?? '';
    const property = propertyList?.[i]?.classify || {};
    const propertyName = propertyMap?.[propertyId]?.name || '';
    // 属性值
    const valueId = property?.attrValue ?? '';
    const valueMap = propertyMap?.[propertyId]?.valueMap;
    const valueName = valueMap?.[valueId]?.name || '';
    labelList.push({
      text: `${propertyName || '--'}:${valueName || '--'}`,
      confidence: `${((property?.attrConf || 0) / 10).toFixed(2)}%`,
      // 以下是校验结果导出时用到的参数
      propertyName,
      valueName
    });
  }
  return {
    ...createCoverCalibration(),
    labelList
  };
}
// 物体检测
function createVerifyTempResultsObjectDetection(data) {
  const { calibrationData, taggingMode, labelMap: targetMap } = data;
  const target = calibrationData.obj || {};
  const scope = createDetectScope(calibrationData?.obj, taggingMode);
  // 生成检测标签
  const targetId = target.type ?? '';
  const labelList = [
    {
      text: targetMap[targetId]?.name || '--',
      confidence: `${((target.confidence ?? 0) / 10).toFixed(2)}%`
    }
  ];
  return {
    scope,
    labelList
  };
}
// 混合
function createVerifyTempResultsHybrid(data) {
  const { calibrationData, taggingMode, labelMap: targetMap } = data;
  const target = calibrationData.obj || {};
  const targetId = target.type ?? '';
  const scope = createDetectScope(calibrationData?.obj, taggingMode);
  const labelList = [
    {
      id: targetId,
      text: targetMap[targetId]?.name || '--',
      confidence: `${((target.confidence ?? 0) / 10).toFixed(2)}%`,
      propertyList: []
    }
  ]; // 生成分类标签
  const propertyList = calibrationData?.properties || [];
  const propertyMap = targetMap[target.type ?? '']?.propertyMap || {};
  for (let i = 0, len = propertyList.length; i < len; i++) {
    // 属性名
    const property = propertyList?.[i]?.classify || {};
    const propertyId = property?.attrType ?? '';
    const propertyName = propertyMap?.[propertyId]?.name || '';
    // 属性名
    const valueId = property?.attrValue ?? '';
    const valueMap = propertyMap?.[propertyId]?.valueMap;
    const valueName = valueMap?.[valueId]?.name || '';
    labelList.push({
      id: valueId,
      text: `${propertyName || '--'}:${valueName || '--'}`,
      confidence: `${((property?.attrConf || 0) / 10).toFixed(2)}%`
    });
    // 准备用于校验结果导出的字段
    labelList[0].propertyList.push({
      text: `${propertyName || '--'}`,
      valueName: `${valueName || '--'}`,
      confidence: `${((property?.attrConf || 0) / 10).toFixed(2)}%`
    });
  }
  return {
    scope,
    labelList
  };
}
// OCR
function createVerifyTempResultsOCR(data) {
  const { calibrationData } = data;
  const scope = createDetectScope(calibrationData?.obj, '2');
  const value = calibrationData?.properties?.[0]?.ocrClassify || {};
  const labelList = [
    {
      text: value?.ocrResult || '--',
      confidence: `${((value.ocrConf || 0) / 10).toFixed(2)}%`
    }
  ];
  return {
    scope,
    labelList
  };
}
// 结构化OCR
function createVerifyTempResultsStructuredOCR(data) {
  const { calibrationData, labelMap: valueMap } = data;
  const scope = createDetectScope(calibrationData?.obj, '2');
  const targetId = calibrationData?.obj?.type ?? '';
  const value = calibrationData?.properties?.[0]?.ocrClassify || {};
  const labelList = [
    {
      text: `${valueMap[targetId]?.name || '--'}:${value?.ocrResult || '--'}`,
      confidence: `${((value.ocrConf || 0) / 10).toFixed(2)}%`
    }
  ];
  return {
    scope,
    labelList
  };
}
// 图像比对
function createVerifyTempResultsImageCompare(data) {
  const {
    calibrationData: { target }
  } = data;
  const scope = createDetectScope(target.region, '1');
  const labelList = [
    {
      text: `${((target?.confidence || 0) / 10).toFixed(2)}%`,
      confidence: `${((target?.confidence || 0) / 10).toFixed(2)}%`
    }
  ];
  return { scope, labelList };
}
// 检索比对
function createVerifyTempResultsRetrievalCompare(data) {
  const { calibrationData = {}, labelMap: valueMap } = data;
  const { target = {}, cmpInfo = [] } = calibrationData;
  const scope = createDetectScope(target.region, '1');
  const valueList = [];
  for (let i = 0, len = cmpInfo.length; i < len; i++) {
    const value = cmpInfo[i];
    valueList.push({
      text: `${valueMap[value.objID ?? ''] || '--'}`,
      confidence: `${((value.similarity || 0) / 10).toFixed(2)}%`
    });
  }
  const label = {
    text: `${valueMap[cmpInfo?.[0].objID ?? ''] || '--'}`,
    confidence: `${((cmpInfo?.[0].similarity || 0) / 10).toFixed(2)}%`,
    valueList
  };
  return { scope, labelList: [label] };
}
// 语义分割算法
function createVerifyTempResultsSemanticSegmentation(data) {
  const { calibrationData, labelMap: targetMap } = data;
  const { width, height } = calibrationData;
  const scope = {
    left: 0,
    top: 0,
    type: 'pixel',
    imageData: new ImageData(calibrationData.dataArr, width, height)
  };
  const color = `rgba(${calibrationData?.colorRGB?.[0] || 0},${calibrationData?.colorRGB?.[1] ||
    0},${calibrationData?.colorRGB?.[2] || 0},${calibrationData?.colorRGB?.[3] || 0})`;
  const labelList = [
    {
      text: targetMap[calibrationData.type ?? '']?.name || '--'
    }
  ];
  return {
    scope,
    labelList,
    style: {
      label: {
        normal: {
          color
        },
        hover: {
          color
        },
        focus: {
          color
        }
      }
    }
  };
}
// 实例分割算法
function createVerifyTempResultsInstanceSegmentation(data) {
  const { calibrationData, labelMap: targetMap } = data;
  const { leftRatio, topRatio, width, height } = calibrationData;
  const scope = {
    left: leftRatio,
    top: topRatio,
    type: 'pixel',
    imageData: new ImageData(calibrationData.dataArr, width, height)
  };
  const labelList = [
    {
      text: targetMap[calibrationData.type ?? '']?.name || '--',
      confidence: `${((calibrationData.attrConf || 0) / 10).toFixed(2)}%`
    }
  ];
  const color = `rgba(${calibrationData?.colorRGB?.[0] || 0},${calibrationData?.colorRGB?.[1] ||
    0},${calibrationData?.colorRGB?.[2] || 0},${calibrationData?.colorRGB?.[3] || 0})`;
  return {
    scope,
    labelList,
    style: {
      label: {
        normal: {
          color
        },
        hover: {
          color
        },
        focus: {
          color
        }
      }
    }
  };
}
// 声音分类
function createVerifyTempResultsSoundClassification(data) {
  const { calibrationData, labelMap: valueMap } = data;
  const propertyList = calibrationData?.classify || [];
  // 生成标签列表
  let value = { attrConf: 0 };
  for (let i = 0, len = propertyList.length; i < len; i++) {
    const property = propertyList?.[i] || { attrConf: 0 };
    if (property.attrConf >= value.attrConf) {
      value = {
        text: valueMap?.[property?.attrValue ?? '']?.name || '--',
        confidence: `${((property?.attrConf ?? 0) / 10).toFixed(2)}%`
      };
    }
  }
  const labelList = value.confidence ? [value] : [];
  return {
    ...createCoverCalibration(),
    labelList
  };
}
// 关键词检测
function createVerifyTempResultsKeywordRecognition(data) {
  const { calibrationData, labelMap: valueMap } = data;
  const propertyList = calibrationData?.audioInfo?.[0]?.classify || [];
  // 生成标签列表
  let value = { attrConf: 0 };
  for (let i = 0, len = propertyList.length; i < len; i++) {
    const property = propertyList?.[i] || { attrConf: 0 };
    if (property.attrConf >= value.attrConf) {
      value = {
        text: valueMap?.[property?.attrValue ?? '']?.name || '--', // 获取关键词的名称
        confidence: `${(((property?.attrConf ?? 0) / 4) * 10).toFixed(2)}%` // 需要将0~40的取值转成0%~100%
      };
    }
  }
  const labelList = value.confidence ? [value] : [];
  return {
    ...createCoverCalibration(),
    labelList
  };
}
/*
 * 创建测试测标注框
 * */
function createVerifyTempResults(params, data, imageHeightAndWidth) {
  const { algorithm, testFileList, taggingMode } = params;
  let calibrationList = [];
  const fileVerifyResult = data[0]?.results?.[0] || {};
  // 获取标签列表
  const labelMap = getLabelMap({
    mapping: data[0]?.mapping || [],
    testFileList,
    algorithm
  });
  // 获取推理标注列表
  let calibrationsData = [];
  switch (algorithm) {
    case algorithmsCfg.TYPES.IMAGE_CLASSIFICATION:
    case algorithmsCfg.TYPES.OBJECT_DETECTION:
    case algorithmsCfg.TYPES.SEMI_SUPERVISION_RECT_DETECTION:
    case algorithmsCfg.TYPES.HYBRID:
    case algorithmsCfg.TYPES.IMAGE_CLASSIFICATION_MULTI:
    case algorithmsCfg.TYPES.IMAGE_CLASSIFICATION_MULTI_LABELS:
    case algorithmsCfg.TYPES.OCR:
    case algorithmsCfg.TYPES.STRUCTURED_OCR:
      calibrationsData = fileVerifyResult?.targets || [];
      break;
    case algorithmsCfg.TYPES.SOUND_CLASSIFICATION:
      calibrationsData = fileVerifyResult?.audioInfo || [];
      break;
    case algorithmsCfg.TYPES.KEYWORD_RECOGNITION:
      calibrationsData = data[0]?.results || [];
      break;
    case algorithmsCfg.TYPES.RETRIEVAL_COMPARE:
      calibrationsData = fileVerifyResult?.events?.cmpResult || [];
      break;
    case algorithmsCfg.TYPES.IMAGE_COMPARE:
      calibrationsData = fileVerifyResult?.events?.alertInfo || [];
      break;
    case algorithmsCfg.TYPES.SEMANTIC_SEGMENTATION: //'17' 图像语义分割
      calibrationsData = splitMaskInfo(fileVerifyResult?.maskInfo, labelMap);
      break;
    case algorithmsCfg.TYPES.INSTANCE_SEGMENTATION: // '20' 图像实例分割
      calibrationsData = splitMaskInfoList(fileVerifyResult, labelMap, imageHeightAndWidth);
      break;
  }
  for (let i = 0, len = calibrationsData.length; i < len; i++) {
    const calibrationData = calibrationsData[i]; // 数组内一项代表一个推理文件的结果
    let obj = {};
    const params = {
      index: i,
      taggingMode,
      calibrationData,
      imageHeightAndWidth,
      labelMap
    };
    try {
      switch (algorithm) {
        case algorithmsCfg.TYPES.IMAGE_CLASSIFICATION:
          obj = createVerifyTempResultsClassification(params);
          break;
        case algorithmsCfg.TYPES.IMAGE_CLASSIFICATION_MULTI_LABELS:
          obj = createVerifyTempResultsClassificationMulti(params);
          break;
        case algorithmsCfg.TYPES.IMAGE_CLASSIFICATION_MULTI:
          obj = createVerifyTempResultsImageClassificationMulti(params);
          break;
        case algorithmsCfg.TYPES.OBJECT_DETECTION:
        case algorithmsCfg.TYPES.SEMI_SUPERVISION_RECT_DETECTION:
          obj = createVerifyTempResultsObjectDetection(params);
          break;
        case algorithmsCfg.TYPES.HYBRID:
          obj = createVerifyTempResultsHybrid(params);
          break;
        case algorithmsCfg.TYPES.OCR:
          obj = createVerifyTempResultsOCR(params);
          break;
        case algorithmsCfg.TYPES.STRUCTURED_OCR:
          obj = createVerifyTempResultsStructuredOCR(params);
          break;
        case algorithmsCfg.TYPES.SEMANTIC_SEGMENTATION:
          obj = createVerifyTempResultsSemanticSegmentation(params);
          break;
        case algorithmsCfg.TYPES.INSTANCE_SEGMENTATION:
          obj = createVerifyTempResultsInstanceSegmentation(params);
          break;
        case algorithmsCfg.TYPES.RETRIEVAL_COMPARE:
          obj = createVerifyTempResultsRetrievalCompare(params);
          break;
        case algorithmsCfg.TYPES.IMAGE_COMPARE:
          obj = createVerifyTempResultsImageCompare(params);
          break;
        case algorithmsCfg.TYPES.SOUND_CLASSIFICATION:
          obj = createVerifyTempResultsSoundClassification(params);
          break;
        case algorithmsCfg.TYPES.KEYWORD_RECOGNITION:
          obj = createVerifyTempResultsKeywordRecognition(params);
          break;
      }
      obj.id = guid();
      obj.style = { ...algorithmsCfg.STYLE.CORRECT, ...(obj?.style || {}) };
      // 如果不是原始框
      if (!obj.tagType) {
        obj.tagType = '404';
      }
      obj.type = '1';
      calibrationList.push(obj);
    } catch (e) {
    }
  }
  // 内部置信度排序
  calibrationList.forEach(cal => {
    if (algorithm !== algorithmsCfg.TYPES.HYBRID) {
      cal.labelList = cal.labelList.sort((a, b) => {
        let confidenceA = Number((a?.confidence ?? '').replace('%', '') || '0');
        let confidenceB = Number((b?.confidence ?? '').replace('%', '') || '0');
        isNaN(confidenceA) && (confidenceA = 0);
        isNaN(confidenceB) && (confidenceB = 0);
        return confidenceB - confidenceA;
      });
    } else {
      // 对混合算法不能操作全列表，因为第一项是检测标签
      const detectLabel = cal.labelList[0] || {};
      let classifyLabelList = cal.labelList.slice(1) || [];
      classifyLabelList = classifyLabelList.sort((a, b) => {
        let confidenceA = Number((a?.confidence ?? '').replace('%', '') || '0');
        let confidenceB = Number((b?.confidence ?? '').replace('%', '') || '0');
        isNaN(confidenceA) && (confidenceA = 0);
        isNaN(confidenceB) && (confidenceB = 0);
        return confidenceB - confidenceA;
      });
      cal.labelList = [detectLabel, ...classifyLabelList];
    }
  });
  // 置信度排序(关键词识别要按照音频的时间顺序排列，所以不能排序)
  if (algorithm !== algorithmsCfg.TYPES.KEYWORD_RECOGNITION) {
    calibrationList = calibrationList.sort((a, b) => {
      let confidenceA = Number((a?.labelList?.[0]?.confidence ?? '').replace('%', '') || '0');
      let confidenceB = Number((b?.labelList?.[0]?.confidence ?? '').replace('%', '') || '0');
      isNaN(confidenceA) && (confidenceA = 0);
      isNaN(confidenceB) && (confidenceB = 0);
      return confidenceB - confidenceA;
    });
  }
  return calibrationList;
}
export default {
  createVerifyTempResults
};
