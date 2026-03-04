/* eslint-disable */
import http from "@/api/httpInstance";
import moment from 'moment'
const regMap = {
  reg1: /[a-zA-Z0-9\u4e00-\u9fa5`°~!@#℃\$%\^&\*()_\+\-=\{\}\[\]; :><,.，。""“”‘’\n【】（）%、？\?○≤≥…$｜|¥·{–}\/.，。？！＃：、～；＊—＄＆『〔【｛￥￡♀‖《〖「」〗》｝】〕』]/g,
}
export class Rule {
  constructor(reg, maxLen, minLen = 0) {
    this.reg = reg
    this.maxLen = maxLen
    this.minLen = minLen
  }
  // 过滤不满足条件的字符
  filter(str) {
    if (!str) return ''
    return str.match(this.reg).join('')
  }

  check(str) {
    const content = `${str}`
    if (content.length < this.minLen) {
      return { result: false, msg: `长度不能小于${this.minLen}` }
    }
    if (content.length > this.maxLen) {
      return { result: false, msg: `长度不能大于${this.maxLen}` }
    }
    let spChars = content.replace(this.reg, '')
    if (spChars) {
      // 字符去重，空格替换显示
      spChars = [...new Set([...spChars])].join('')
      spChars.replace(' ', '空格')
      return { result: false, msg: `不支持特殊字符${spChars}` }
    } else {
      return { result: true }
    }
  }
}
export function genRule(regKey, maxLen, minLen = 0) {
  if (!regMap[regKey]) throw new Error('未查找到匹配的正则表达式，请检查regKey是否正确')
  return new Rule(regMap[regKey], maxLen, minLen)
}
export const reg1_1_1024 = genRule('reg1', 1024, 1)
export const reg1_1_512 = genRule('reg1', 512, 1)
export const reg1_1_500 = genRule('reg1', 500, 1)
export const reg1_1_255 = genRule('reg1', 255, 1)
export const reg1_1_50 = genRule('reg1', 50, 1)
export const reg1_1_20 = genRule('reg1', 20, 1)

// 检查企微登录是否有效 true不需要扫码 false需要
export function isWechatLoginValid() {
  // 开发环境避免端口不同无法获取时间戳，不影响线上环境
  if (process.env.NODE_ENV === "development") {
    return true
  }
  const oldTime =
    localStorage.getItem("weChatLoginTimestamp") &&
    parseInt(localStorage.getItem("weChatLoginTimestamp"));
  const isValid = oldTime ? Date.now() - oldTime < 2 * 60 * 60 * 1000 : false;
  if (!isValid) {
    localStorage.removeItem("weChatLoginTimestamp");
  }
  return isValid;
}
// 跳转到企微扫码页(为了转译)
export function toWeChatScan(state) {
  const requestHost = getBaseRedirctUrl();
  const redirectUri = encodeURIComponent(
    `${requestHost}/homepage/qywx3rdAuth`
  );
  window.location.href = `https://open.work.weixin.qq.com/wwopen/sso/3rd_qrConnect?appid=${process.env.VUE_APP_QY_APPID}&redirect_uri=${redirectUri}&usertype=member&state=${state}`;
}
// 个人中心跳转到企微扫码页（重新关联）
export function centerToWeChatScan(state) {
  const requestHost = getBaseRedirctUrl();
  const redirectUri = encodeURIComponent(
    `${requestHost}/homepage/myCenterCallBack`
  );
  window.location.href = `https://open.work.weixin.qq.com/wwopen/sso/3rd_qrConnect?appid=${process.env.VUE_APP_QY_APPID}&redirect_uri=${redirectUri}&usertype=member&state=${state}`;
}

// 返回企微登录重定向跳转的根路径,开发环境未走网关，故path特殊
function getBaseRedirctUrl() {
  return `${process.env.VUE_APP_REQUEST_QW_HOST}${process.env.NODE_ENV === 'production' ? '/qywechat/basic' : ''}`
}

// 阿拉伯数字转换为简写汉字
export function ToSimplifiedChinese(Num) {
  for (let i = Num.length - 1; i >= 0; i--) {
    Num = Num.replace(",", ""); // 替换Num中的“,”
    Num = Num.replace(" ", ""); // 替换Num中的空格
  }
  if (isNaN(Num)) {
    // 验证输入的字符是否为数字
    return;
  }
  // 字符处理完毕后开始转换，采用前后两部分分别转换
  let part = String(Num).split(".");
  let newchar = "";
  // 小数点前进行转化
  for (let i = part[0].length - 1; i >= 0; i--) {
    if (part[0].length > 10) {
      // 若数量超过拾亿单位，提示
      return;
    }
    let tmpnewchar = "";
    let perchar = part[0].charAt(i);
    switch (perchar) {
      case "0":
        tmpnewchar = "零" + tmpnewchar;
        break;
      case "1":
        tmpnewchar = "一" + tmpnewchar;
        break;
      case "2":
        tmpnewchar = "二" + tmpnewchar;
        break;
      case "3":
        tmpnewchar = "三" + tmpnewchar;
        break;
      case "4":
        tmpnewchar = "四" + tmpnewchar;
        break;
      case "5":
        tmpnewchar = "五" + tmpnewchar;
        break;
      case "6":
        tmpnewchar = "六" + tmpnewchar;
        break;
      case "7":
        tmpnewchar = "七" + tmpnewchar;
        break;
      case "8":
        tmpnewchar = "八" + tmpnewchar;
        break;
      case "9":
        tmpnewchar = "九" + tmpnewchar;
        break;
    }
    switch (part[0].length - i - 1) {
      case 0:
        break;
      case 1:
        if (perchar !== 0) tmpnewchar = tmpnewchar + "十";
        break;
      case 2:
        if (perchar !== 0) tmpnewchar = tmpnewchar + "百";
        break;
      case 3:
        if (perchar !== 0) tmpnewchar = tmpnewchar + "千";
        break;
      case 4:
        tmpnewchar = tmpnewchar + "万";
        break;
      case 5:
        if (perchar !== 0) tmpnewchar = tmpnewchar + "十";
        break;
      case 6:
        if (perchar !== 0) tmpnewchar = tmpnewchar + "百";
        break;
      case 7:
        if (perchar !== 0) tmpnewchar = tmpnewchar + "千";
        break;
      case 8:
        tmpnewchar = tmpnewchar + "亿";
        break;
      case 9:
        tmpnewchar = tmpnewchar + "十";
        break;
    }
    newchar = tmpnewchar + newchar;
  }
  // 替换所有无用汉字，直到没有此类无用的数字为止
  while (
    newchar.search("零零") !== -1 ||
    newchar.search("零亿") !== -1 ||
    newchar.search("亿万") !== -1 ||
    newchar.search("零万") !== -1
    ) {
    newchar = newchar.replace("零亿", "亿");
    newchar = newchar.replace("亿万", "亿");
    newchar = newchar.replace("零万", "万");
    newchar = newchar.replace("零零", "零");
  }
  // 替换以“一十”开头的，为“十”
  if (newchar.indexOf("一十") === 0) {
    newchar = newchar.substr(1);
  }
  // 替换以“零”结尾的，为“”
  if (newchar.lastIndexOf("零") === newchar.length - 1) {
    newchar = newchar.substr(0, newchar.length - 1);
  }
  return newchar;
}
export function filterBuildInfo(data) {
  let tempArrs = data.split("-");
  return {
    community: tempArrs[0],
    zhuang: tempArrs[1],
    danyuan: tempArrs[2],
    roomId: tempArrs[3]
  };
}
export function copy(data) {
  return JSON.parse(JSON.stringify(data));
}
export function checkNumber(rule, value, callback, length) {
  // 12.5有更改,需要必填
  if (value !== "") {
    if (isNaN(value)) {
      callback(new Error("请输入数字"));
    } else {
      if (
        !Number.isInteger(value * 1) ||
        value * 1 < 0 ||
        value.toString().indexOf(".") > -1 ||
        value.toString().indexOf("+") > -1
      ) {
        // 12.20 不能出现小数点
        callback(new Error("请输入数字"));
      } else {
        if (value && value.length > length) {
          callback(new Error("长度不超过" + length + "个数字"));
        } else {
          callback();
        }
      }
    }
  } else {
    callback(new Error(" "));
  }
}

export function checkSpecialCharOut(str) {
  let pattern = new RegExp(
    "[` _~!@#%$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）;———|{}【】‘；：”“'。，、？\\\\]+"
  );
  return pattern.test(str);
}
export function checkSpecialChar(rule, value, callback) {
  let pattern = new RegExp(
    "[`~!@#%$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）;———|{}【】‘；：”“'。，、？\\\\]+"
  );
  if (pattern.test(value)) {
    callback(new Error("内容含有特殊字符"));
  } else {
    callback();
  }
}

export function checkUseName(rule, value, callback) {
  let pattern = new RegExp("^[\u4e00-\u9fa5a-zA-Z0-9]+$");
  if (!pattern.test(value)) {
    callback(new Error("只能使用汉字,英文大小写或数字"));
  } else {
    callback();
  }
}

// 获取URL搜索字符串
export function getSearchParams() {
  let queryStr = window.location.href.split("?")[1];
  let result = {};
  if (queryStr) {
    let queryArr = queryStr.split("&");
    for (let item of queryArr) {
      let arr = item.split("=");
      result[arr[0]] = arr[1];
    }
  }
  return result;
}
/** 计算时间（相差） */
export function getDateString(val) {
  const _time = moment().add(val, 'd')
  return _time.format('YYYY-MM-DD')
}
export function getDate(timenow) {
  /** 不知道下面这行有啥用，不敢删掉 */
  if (!timenow) return "";
  const _time = timenow ? moment(timenow) : moment()
  return _time.format('YYYY-MM-DD')
}

/** 时间格式化(带时分秒) */
export function formartTime(val) {
  if (!val) return "";
  const _time = moment(val)
  return _time.format('YYYY-MM-DD HH:mm:ss')
}

/** 时间格式化(可设置符号) */
export function getDateSymbol(timenow, symbol = "-") {
  if (!timenow) return "";
  return moment(timenow).format(`YYYY${symbol}MM${symbol}DD`)
}

// 时间字符串转IOS时间
export function timeStrToIOS(date) {
  const dataStr = new Date(date).toJSON();
  const timeStr = dataStr.substring(0, dataStr.lastIndexOf("."));
  return [timeStr, "Z"].join("");
}
/** 获取日期时间(格式化) */
export function getDateTime(timenow) {
  let time = new Date(timenow) || new Date();
  return moment(time).format('YYYY-MM-DD HH:mm:ss')
}

// 时间戳转化为日期可选形式
export function formatTime(number, format) {
  var formateArr = ["Y", "M", "D", "h", "m", "s"];
  var returnArr = [];

  var date = new Date(number * 1000);
  returnArr.push(date.getFullYear());
  returnArr.push(this.formatNumber(date.getMonth() + 1));
  returnArr.push(this.formatNumber(date.getDate()));

  returnArr.push(this.formatNumber(date.getHours()));
  returnArr.push(this.formatNumber(date.getMinutes()));
  returnArr.push(this.formatNumber(date.getSeconds()));

  for (var i in returnArr) {
    format = format.replace(formateArr[i], returnArr[i]);
  }
  return format;
}
/** 毫秒转时间段 */
export function durationTime(time) {
  if (!time) return '--'
  const s = moment.duration(time).get('seconds')
  const sText = s ? `${s}秒` : ''
  const m = moment.duration(time).get('minutes')
  const mText = m ? `${m}分` : ''
  const h = moment.duration(time).get('hour')
  const hText = h ? `${h}小时` : ''
  const d = moment.duration(time).get('day')
  const dText = d ? `${d}天` : ''
  return dText + hText + mText + sText
}

// 数据转化
export function formatNumber(n) {
  n = n.toString();
  return n[1] ? n : "0" + n;
}
// 电话号码校验
export function validPhone(tel) {
  return (
    /^[1][3,4,5,7,8][0-9]{9}$/.test(tel) ||
    /^[1][9][8,9][0-9]{8}$/.test(tel) ||
    /^[1][6][6][0-9]{8}$/.test(tel)
  );
}
// 图片缩放
export function resizePic(url, w, h, c) {
  let color = null;
  if (c) {
    color = "color_" + c;
  } else {
    color = "color_333333";
  }
  let arr = ["image/resize", "m_pad", color];
  arr.push("w_" + w);
  arr.push("h_" + h);
  let urlParamsStr = `?x-oss-process=${encodeURIComponent(arr.join(","))}`;
  return `${url}${urlParamsStr}`;
}
// 图片缩放（不编码）
export function resizePicNotEncode(url, w, h, c) {
  const str = ["image/resize", "m_pad", `color_${c}`, `w_${w}`, `h_${h}`].join(
    ","
  );
  return `${url}?x-oss-process=${str}`;
}
// 图片缩放 + 水印（不编码）
export function resizePicNotEncodeWaterMark(url, w, h, c, s = 40, t) {
  const str = ["image/resize", "m_pad", `color_${c}`, `w_${w}`, `h_${h}`].join(
    ","
  );

  let userAccount = sessionStorage.getItem("username") || "水印";
  let text = window.btoa(unescape(encodeURIComponent(userAccount)));
  const waterMark = [
    "/watermark",
    "type_d3F5LXplbmhlaQ",
    `size_${s}`,
    `text_${text}`,
    "color_FFFFFF",
    "shadow_20",
    "t_20",
    "rotate_45",
    "fill_1"
  ].join(",");

  return `${url}?x-oss-process=${str} + ${waterMark}`;
}
// 获取url拼接字符串 - 图片缩放（编码）
export function getUrlString(w, h, c) {
  const str = ["image/resize", "m_pad", `color_${c}`, `w_${w}`, `h_${h}`].join(
    ","
  );
  return `&x-oss-process=${str}`;
}
// 获取url拼接字符串 - 图片缩放 + 水印（编码）
export function resizePicAndWaterMark(w, h, c, s = 40, t) {
  let userAccount = sessionStorage.getItem("username") || "水印";
  let text = window.btoa(unescape(encodeURIComponent(userAccount)));

  const str = ["image/resize", "m_pad", `color_${c}`, `w_${w}`, `h_${h}`].join(
    ","
  );
  const waterMark = [
    "/watermark",
    "type_d3F5LXplbmhlaQ",
    `size_${s}`,
    `text_${text}`,
    "color_FFFFFF",
    "shadow_20",
    "t_20",
    "rotate_45",
    "fill_1"
  ].join(",");
  return `&x-oss-process=${str} + ${waterMark}`;
}
// 获取href
export function getHref() {
  return location.host === "ls.hik-cloud.com"
    ? "http://pic.hik-cloud.com/download/ls/cloudView.exe"
    : "http://pbpic.hik-cloud.com/download/ls/cloudView.exe";
}
// 获取url中参数的值
export function getUrlParam(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
  var r = window.location.search.substr(1).match(reg);
  if (r != null) return unescape(r[2]);
  return null;
}

// 日期计算
export function computedDate(activeDateTab, dateTime) {
  const now = new Date(); // 当前日期
  let nowDayOfWeek = now.getDay(); // 今天本周的第几天
  if (nowDayOfWeek === 0) {
    nowDayOfWeek = 7;
  }
  let backData = {
    startDate: "",
    endDate: ""
  };
  switch (activeDateTab) {
    case "today":
      backData.startDate = getDateString(0);
      backData.endDate = getDateString(0);
      break;
    case "yesterday":
      backData.startDate = getDateString(-1);
      backData.endDate = getDateString(-1);
      break;
    case "sevenDay":
      backData.startDate = getDateString(-6);
      backData.endDate = getDateString(0);
      break;
    case "thirtyDay":
      backData.startDate = getDateString(-29);
      backData.endDate = getDateString(0);
      break;
    case "thisWeek": // 本周
      backData.startDate = getDateString(-nowDayOfWeek + 1);
      backData.endDate = getDateString(7 - nowDayOfWeek);
      break;
    case "lastWeek": // 上周
      backData.startDate = getDateString(-nowDayOfWeek - 6);
      backData.endDate = getDateString(-nowDayOfWeek);
      break;
    case "custom":
      if (dateTime && dateTime[0] && dateTime[1]) {
        // 任务生成时间
        backData.startDate = getDate(dateTime[0]);
        backData.endDate = getDate(dateTime[1]);
      }
      break;
  }
  return backData;
}

// 编码巡查项统计数据模型
export function encodeItemOverviewData(data) {
  let mirrorMap = {
    radar: {
      indicator: [],
      value: []
    },
    horizBar: {
      item: [],
      value: []
    },
    questionBar: {
      item: [],
      value: []
    }
  };
  // 对radar的处理
  if (data && data.bigItems && data.bigItems.length > 0) {
    data.bigItems.forEach(function(item) {
      mirrorMap.radar.indicator.push({
        name: item.bigItemName,
        max: 100
      });
      mirrorMap.radar.value.push((item.scoreRate * 100).toFixed(2));
    });
  } else {
    mirrorMap.radar = null;
  }
  // 对questionBar的处理
  if (data && data.questionItems && data.questionItems.length > 0) {
    const questionItems = data.questionItems.reverse();
    questionItems.forEach(function(item) {
      mirrorMap.questionBar.item.push(item.questionName);
      mirrorMap.questionBar.value.push(item.count * 1);
    });
  } else {
    mirrorMap.questionBar = null;
  }
  // 对horizBar的处理
  if (data && data.smallItems && data.smallItems.length > 0) {
    const smallItems = data.smallItems.sort((a, b) => {
      return b.scoreRate - a.scoreRate;
    });
    smallItems.forEach(function(item) {
      mirrorMap.horizBar.item.push(item.smallItemName);
      mirrorMap.horizBar.value.push((item.scoreRate * 100).toFixed(2));
    });
  } else {
    mirrorMap.horizBar = null;
  }
  return mirrorMap;
}

// 编码考评、点检详情数据
export function encodeEvalAndSpotDetailData(data) {
  let resultArr = [];
  // 创建map对象并设置初始值
  function setMap(bigItem, bigIndex, smallItem, smallIndex) {
    let obj = {
      bigItemName: bigItem.bigItemName, // 所属巡查大类
      bigScore: parseFloat(bigItem.bigScore).toFixed(1) || "0.0", // 巡查大类得分
      bigId: bigIndex,
      smallItemName: "--",
      smallScore: "--",
      smallId: 0,
      questionName: "--",
      count: "--"
    };
    obj.smallId = bigIndex * 1000 + smallIndex;
    obj.smallItemName = smallItem.smallItemName || "--"; // 所属巡查项
    obj.smallScore = parseFloat(smallItem.smallScore).toFixed(1) || "0.0"; // 巡查项得分
    return obj;
  }
  data.forEach((bigItem, bigIndex) => {
    if (bigItem.smalls && bigItem.smalls.length) {
      // 小项
      bigItem.smalls.forEach((smallItem, smallIndex) => {
        if (smallItem.questions && smallItem.questions.length) {
          // 问题项
          smallItem.questions.forEach(question => {
            let map = setMap(bigItem, bigIndex, smallItem, smallIndex);
            map.questionName = question.questionName || "--"; // 问题项
            map.count = question.count; // 次数
            resultArr.push(map);
          });
        } else {
          let map = setMap(bigItem, bigIndex, smallItem, smallIndex);
          resultArr.push(map);
        }
      });
    } else {
      let map = setMap(bigItem, bigIndex, {}, "");
      map.smallId = bigIndex * 1000;
      resultArr.push(map);
    }
  });
  let filterObj = {}; // 通过 "所属巡查项"作为key 将数组数据进行分类，相同的"所属巡查项"放在一个数组里
  resultArr.forEach(item => {
    if (Array.isArray(filterObj[item.smallId])) {
      filterObj[item.smallId].push(item);
    } else {
      filterObj[item.smallId] = [];
      filterObj[item.smallId].push(item);
    }
  });
  let result = [];
  for (let key in filterObj) {
    filterObj[key].forEach(item => {
      result.push(item);
    });
  }
  return result;
}

export function utc2local(utcDatetime) {
  return new Date(utcDatetime);
}
export function timeTrans(time) {
  let d = new Date(time);
  let times =
    d.getFullYear() +
    "-" +
    (d.getMonth() + 1 < 10 ? "0" + (d.getMonth() + 1) : d.getMonth() + 1) +
    "-" +
    (d.getDate() < 10 ? "0" + d.getDate() : d.getDate()) +
    " " +
    (d.getHours() < 10 ? "0" + d.getHours() : d.getHours()) +
    ":" +
    (d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes()) +
    ":" +
    (d.getSeconds() < 10 ? "0" + d.getSeconds() : d.getSeconds());
  return times;
}
export function local2utc(localDatetime) {
  let y = localDatetime.getUTCFullYear();
  let m = localDatetime.getUTCMonth() + 1;
  m = m < 10 ? "0" + m : m;
  let d = localDatetime.getUTCDate();
  d = d < 10 ? "0" + d : d;
  let h = localDatetime.getUTCHours();
  h = h < 10 ? "0" + h : h;
  let mi = localDatetime.getUTCMinutes();
  mi = mi < 10 ? "0" + mi : mi;
  let s = localDatetime.getUTCSeconds();
  s = s < 10 ? "0" + s : s;
  return y + "-" + m + "-" + d + "T" + h + ":" + mi + ":" + s + "Z";
}

// 账号
export function checkUserAccount(userAccount) {
  let str = userAccount;
  let reg1 = /^[0-9a-zA-Z@.]+$/;
  let reg2 = /^[0-9]*$ /;
  if (!reg1.test(str)) {
    return false;
  }
  if (reg2.test(str)) {
    return false;
  }
  return true;
}
// 密码
export function checkPassword(password) {
  let str = password;
  let reg1 = /^(?![0-9]+$)(?![a-zA-Z]+$)[^\u4e00-\u9fa5]{8,16}$/;
  if (!reg1.test(str)) {
    return false;
  }
  return true;
}
// 设置cookie、
export function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + "; " + expires;
}

// 获取cookie、
export function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1);
    if (c.indexOf(name) !== -1) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

// 删除cookie、
export function delCookie(key) {
  var date = new Date();
  date.setTime(date.getTime() - 10000);
  document.cookie = key + "=v; expires =" + date.toGMTString();
}

// 日期格式转换
export function getFormatTime(time) {
  time = time || null;
  let date = new Date(time);
  let nowDate =
    date.getFullYear() +
    "-" +
    (date.getMonth() + 1 > 9
      ? date.getMonth() + 1
      : "0" + (date.getMonth() + 1)) +
    "-" +
    (date.getDate() > 9 ? date.getDate() : "0" + date.getDate());
  let nowTime =
    (date.getHours() <= 9 ? "0" + date.getHours() : date.getHours()) +
    ":" +
    (date.getMinutes() > 9 ? date.getMinutes() : "0" + date.getMinutes()) +
    ":" +
    (date.getSeconds() > 9 ? date.getSeconds() : "0" + date.getSeconds());
  return nowDate + " " + nowTime;
}

// 时间格式化
export function formatEndTime(time) {
  let date = time instanceof Date ? time : new Date(time || null);
  let dateTime = getFormatTime(time)
    .split(" ")
    .join("T");
  let puls = date.getTimezoneOffset() > 0 ? "-" : "+";
  let timeZone = Math.abs(date.getTimezoneOffset());
  let integer =
    parseInt(timeZone / 60) > 9
      ? parseInt(timeZone / 60)
      : "0" + parseInt(timeZone / 60);
  let last = timeZone % 60 > 9 ? timeZone % 60 : "0" + (timeZone % 60);
  return dateTime + puls + integer + ":" + last;
}

// 编码与解码
export function enAnddeCode(arr, flag) {
  for (let group of arr) {
    if (flag === "encode") group.groupName = null;
    if (group.children) {
      for (let item of group.children) {
        if (flag === "encode") item.itemName = null;
        if (item.children) {
          for (let question of item.children) {
            if (flag === "encode") question.questionName = null;
            if (question.pics) {
              for (let pic of question.pics) {
                if (flag === "decode") {
                  if (pic.picCoordinate === "" || pic.picCoordinate === null) {
                    pic.picCoordinate = [];
                  } else {
                    pic.picCoordinate = JSON.parse(pic.picCoordinate);
                  }
                } else if (flag === "encode") {
                  if (!pic.picCoordinate || pic.picCoordinate.length === 0) {
                    pic.picCoordinate = "";
                  } else {
                    pic.picCoordinate = JSON.stringify(pic.picCoordinate);
                    if (pic.baseUrl) {
                      delete pic.baseUrl;
                    }
                  }
                }
              }
            } else {
              question.pics = [];
            }
          }
        }
      }
    }
  }
  return arr;
}
// 计算耗时
export function calcTime(timeStamp) {
  const time = Math.min(Math.floor(parseInt(timeStamp, 10) / 1000), 24 * 3600);
  
  const second = time % 60;
  const minute = Math.floor(time / 60) % 60;
  const hour = Math.floor(time / 3600);
  const s = second < 10 ? "0" + second : second;
  const m = minute < 10 ? "0" + minute : minute;
  const h = hour < 10 ? "0" + hour : hour;
  return {
    hour: h,
    minus: m,
    second: s
  };
}

// 数组求和
export function sumArr(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += Math.abs(arr[i]);
  }
  return sum;
}
// 图片url转base64
export function imgSrcToBase64(imgSrc) {
  function getBase64Image(img) {
    let canvas = document.createElement("canvas");
    let quality = 0.7; // 压缩率
    let maxLen = 868;
    // 生成比例
    let width = img.width;
    let height = img.height;
    // 计算缩放比例
    let rate = 1;
    if (width >= height) {
      if (width > maxLen) {
        rate = maxLen / width;
      }
    } else {
      if (height > maxLen) {
        rate = maxLen / height;
      }
    }
    img.width = width * rate;
    img.height = height * rate;
    canvas.width = img.width;
    canvas.height = img.height;
    let ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, img.width, img.height);
    let ext = img.src.substring(img.src.lastIndexOf(".") + 1).toLowerCase();
    let dataURL = canvas.toDataURL("image/" + ext, quality);
    return dataURL;
  }
  return new Promise(resolve => {
    let image = new Image();
    image.crossOrigin = "anonymous"; // 防止跨域出错
    image.src = imgSrc;
    image.onload = function() {
      let base64 = getBase64Image(image);
      resolve(base64);
    };
  });
}
// 获取url中?后的参数
export function getQueryString(name, url) {
  if (!url) return "";
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
  var r = url.match(reg);
  if (r != null) {
    return decodeURIComponent(r[2]);
  } else {
    return "";
  }
}

// 将URL的参数解析为一个对象
export function queryURLToObject(url) {
  if (!url) return "";
  let arr = []
  if(url.indexOf('?') > -1) {
    arr = url.split("?")[1].split("&");
  }
  let params = {}; // 声明对象

  for (let i = 0; i < arr.length; i++) {
    var item = arr[i].split("=");
    params[item[0]] = item[1]; // 为对象赋值
  }
  return params;
}

// 使用a标签的方式打开新页面
export function openNewPage(url, cb) {
  let el = document.createElement("a");
  document.body.appendChild(el);
  el.setAttribute("href", "javascript:void(0);");
  el.setAttribute("onclick", url);
  el.setAttribute("target", "_blank");
  el.click();
  document.body.removeChild(el);
  cb();
}

// IOS时间转时间字符串
export function iosToTimeStr(dateStr) {
  return getDateTime(dateStr.replace("+0800", "+08:00"));
}

// 判断是否具有某个模块的权限
export function hasAuthor(code) {
  const authorStr = localStorage.getItem("authorities") || [];
  return authorStr.indexOf(code) !== -1;
}

// 判断是否是safari浏览器
export function isMac() {
  return true
  let platform = window.navigator.platform;
  return platform !== "Win32";
}

// 判断是否是safari浏览器
export function isSafari() {
  return /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
}

// 有关视频的权限判断
export function getVideoAuthor() {
  // 视频预览权限
  const hasPreviewAuthor = hasAuthor("RETAIL_AUTH_03005");
  // 视频预览和回放权限
  const hasPlaybackAuthor = hasAuthor("RETAIL_AUTH_03001");
  // 1: 预览与回放 2：预览 3：无权限
  let arr = [false, false];
  hasPlaybackAuthor && (arr = [true, true]);
  hasPreviewAuthor && (arr[0] = hasPreviewAuthor);
  return arr;
}

/** 检测js数据类型
 * @param {any} val @return {string} 要检测的数值
 * @param {string} [type] @returns {boolean} 类型，是否与此类型一致
 */
export function checkType(val, type) {
  let _type = Object.prototype.toString.call(val).slice(8, -1);
  return type
    ? type === _type ||
    type === _type.replace(_type[0], _type[0].toUpperCase()) ||
    type === _type.replace(_type[0], _type[0].toLowerCase())
    : _type;
}
// 获取时间对象
export function getDateTimeMap(val) {
  if (!val) return "";
  let time = new Date(val);
  let year = time.getFullYear();
  let month =
    time.getMonth() + 1 < 10
      ? "0" + (time.getMonth() + 1)
      : time.getMonth() + 1;
  let date = time.getDate() < 10 ? "0" + time.getDate() : time.getDate();
  let h = time.getHours();
  h = h < 10 ? "0" + h : h;
  let mi = time.getMinutes();
  mi = mi < 10 ? "0" + mi : mi;
  const second = time % 60;
  const s = second < 10 ? "0" + second : second;
  return {
    year: year,
    month: month,
    date: date,
    hour: h,
    minute: mi,
    second: s
  };
}
// 拼接执行频次的显示文字
export function formatTaskFreq(taskFreq, captureDate) {
  if (taskFreq === 3) {
    let str1 = "";
    captureDate.split(",").forEach(item => {
      str1 += item + "日" + "、";
    });
    str1 = str1.substring(0, str1.length - 1);
    return str1;
  } else if (taskFreq === 2) {
    let str = "";
    captureDate.split(",").forEach(item => {
      let characters = "";
      if (+item === 1) characters = "日";
      else if (+item === 2) characters = "一";
      else if (+item === 3) characters = "二";
      else if (+item === 4) characters = "三";
      else if (+item === 5) characters = "四";
      else if (+item === 6) characters = "五";
      else characters = "六";
      str += "周" + characters + "、";
    });
    str = str.substring(0, str.length - 1);
    return str;
  } else {
    return "每天";
  }
}
// 拼接表格中的抓拍时间显示文字
export function formatDefinedTime(
  definedTime,
  startTime,
  endTime,
  captureSpace
) {
  let str = "";
  definedTime.forEach(item => {
    str += item + "、";
  });
  if (startTime && endTime && captureSpace) {
    str += startTime + "~" + endTime + "每隔";
    if (captureSpace < 59) {
      str += captureSpace + "分钟";
    } else if (captureSpace % 60 === 0) {
      str += parseInt(captureSpace / 60) + "小时";
    } else {
      str +=
        parseInt(captureSpace / 60) + "小时" + (captureSpace % 60) + "分钟";
    }
  } else {
    str = str.substring(0, str.length - 1);
  }
  return str;
}

// 文件大小及类型检测
export function fileCheck(
  file,
  max = 2,
  fileType = ["jpg", "jpeg", "png", "gif", "bmp"]
) {
  let size = file.size;
  let result = {
    hasErr: false,
    message: null
  };

  if (size > 1024 * 1024 * max) {
    result.message = `文件大小不能超过${max}M`;
    result.hasErr = true;
    return result;
  }
  // 检查文件名称是否存在特殊字符
  let fileName = file.name.substring(0, file.name.lastIndexOf("."));
  if (checkSpecialCharOut(fileName)) {
    result.message = "文件名称不能包括特殊字符";
    result.hasErr = true;
    return result;
  }
  const name = file.name.split(".")[1].toLowerCase();
  if (!fileType.includes(name)) {
    result.message = `仅支持${fileType.join(",")}格式文件`;
    result.hasErr = true;
    return result;
  }
  return result;
}
// 计算文件大小
export function getFileSize(size) {
  if (size > 1024 * 1024 && size < 1024 * 1024 * 1024) {
    return (size / (1024 * 1024)).toFixed(2) + "MB";
  } else if (size > 1024 * 1024 * 1024 && size < 1024 * 1024 * 1024 * 1024) {
    return (size / (1024 * 1024 * 1024)).toFixed(2) + "GB";
  } else {
    return (size / 1024).toFixed(2) + "KB";
  }
}
// 获取预览图片Url
export function getPriviewUrl(file) {
  return new Promise(function(resolve, reject) {
    let reader = new FileReader();
    reader.onload = function(e) {
      let result = e.target.result;
      const image = new Image();
      image.src = result;
      image.onload = function() {
        let cvs = document.createElement("canvas");
        let scale = 1;
        if (this.width > 150 || this.height > 100) {
          if (this.width > this.height) {
            scale = 150 / this.width;
          } else {
            scale = 100 / this.height;
          }
        }
        cvs.width = this.width * scale > 150 ? 150 : this.width * scale;
        cvs.height = this.height * scale > 100 ? 100 : this.height * scale; // 计算等比缩小后图片宽高
        const ctx = cvs.getContext("2d");
        ctx.drawImage(this, 0, 0, cvs.width, cvs.height);
        const newImageData = cvs.toDataURL(file.type, 0.8);
        resolve({
          url: newImageData
        });
      };
    };
    reader.readAsDataURL(file);
  });
}
export const day = 24 * 3600 * 1000
export const today = Math.floor(new Date().getTime() / day + 1 / 3) * day - day / 3
export const lastMonday = today - (new Date().getDay() + 6) % 7 * day
// 最近的一个月首
export const lastMonthDay = today - (new Date().getDate() - 1) * day
// 满足闰年情况下能查看一整年，故支持366天，因包含当天，故此处为365
export const lastOneYear = today - 365 * day
// 大数据搜索 - 日志管理模块、消息中心模块
export const searchLogInput = /^[^*%?'\[\]\\\\]*$/

// 获取生日数据
export function formartTimeToDate(val) {
  if (!val) return "";
  let time = new Date(val);
  let year = time.getFullYear();
  let month =
    time.getMonth() + 1 < 10
      ? "0" + (time.getMonth() + 1)
      : time.getMonth() + 1;
  let date = time.getDate() < 10 ? "0" + time.getDate() : time.getDate();
  return year + "-" + month + "-" + date;
}
// 获取记忆的整改人id列表
export function getMemoryRectifyIds(rows) {
  const target = rows.filter(row => {
    return row.flag;
  });
  return target.map(row => {
    return row.userId;
  });
}
// 获取进30天日期字符串数组
export function getDateArr() {
  let startDate = new Date();
  let endDate = new Date();
  startDate.setDate(startDate.getDate() - 29);
  let dataArr = [];
  while (endDate.getTime() - startDate.getTime() >= 0) {
    let month =
      (startDate.getMonth() + 1).toString().length === 1
        ? "0" + (startDate.getMonth() + 1).toString()
        : startDate.getMonth() + 1;
    let day =
      startDate.getDate().toString().length === 1
        ? "0" + startDate.getDate()
        : startDate.getDate();
    dataArr.push(`${month}-${day}`);
    startDate.setDate(startDate.getDate() + 1);
  }
  return dataArr;
}

// 格式化日期
export function dateFormat(localDatetime, type) {
  let y = localDatetime.getFullYear();
  let m = localDatetime.getMonth() + 1;
  m = m < 10 ? "0" + m : m;
  let d = localDatetime.getDate();
  d = d < 10 ? "0" + d : d;
  let h = localDatetime.getHours();
  h = h < 10 ? "0" + h : h;
  let mi = localDatetime.getMinutes();
  mi = mi < 10 ? "0" + mi : mi;
  if (type === "time") return h + ":" + mi;
  else return y + "-" + m + "-" + d;
}

// 拼接url
export function composeUrl(url) {
  const arr = url.split("?");
  return `&${arr[1]}`;
}

// 深拷贝
export function deepCopy(p, c) {
  c = c || {};
  for (var i in p) {
    if (typeof p[i] === "object") {
      c[i] = p[i].constructor === Array ? [] : {};
      deepCopy(p[i], c[i]);
    } else {
      c[i] = p[i];
    }
  }
  return c;
}
// 数组去重
export function matchArr(arr1) {
  let arr = [];
  for (let i = 0; i < arr1.length; i++) {
    const idx = arr.findIndex(a => {
      return a.nodeId === arr1[i].nodeId;
    });
    if (idx === -1) {
      arr.push(arr1[i]);
    }
  }
  return arr;
}

export function queryDptmOpenid(id) {
  return new Promise((resolve, reject) => {
    http("post", "/qwapi/qywechat/basic/contacts/actions/queryQyPartyIds", {
      departmentIds: id
    }).then(res => {
      if (+res.code === 0) {
        resolve(res.data.map(item => item.qyDepartmentId));
      }
    });
  });
}
export function queryOpenid(type, ids, data) {
  return new Promise((resolve, reject) => {
    if (type === "userName") {
      http("post", "/qwapi/qywechat/basic/contacts/actions/queryQyUserIds", {
        personnelIds: ids
      }).then(res => {
        if (+res.code === 0) {
          var result = [];
          res.data.forEach(item => {
            var i = ids.indexOf(item.personnelId);
            result.push({
              ...data[i],
              openid: item.qyUserId,
              opentype: "userName"
            });
          });
          resolve(result);
        }
      });
    } else if (type === "user") {
      http("post", "/qwapi/qywechat/basic/contacts/actions/userIdToQyUserId", {
        userIds: ids
      }).then(res => {
        if (+res.code === 0) {
          var result = [];
          res.data.forEach(item => {
            var i = ids.indexOf(item.userId);
            result.push({
              ...data[i],
              openid: item.qyUserId,
              opentype: "userName"
            });
          });
          resolve(result);
        }
      });
    } else if (type === "org") {
      http("post", "/qwapi/qywechat/basic/contacts/actions/queryQyPartyIds", {
        departmentIds: ids
      }).then(res => {
        if (+res.code === 0) {
          var result = [];
          res.data.forEach(item => {
            var i = ids.indexOf(item.departmentId);
            result.push({
              departmentId: data[i],
              openid: item.qyDepartmentId,
              opentype: "departmentName"
            });
          });
          resolve(result);
        }
      });
    } else {
      http("post", "/qwapi/qywechat/basic/contacts/actions/queryQyPartyIds", {
        departmentIds: ids
      }).then(res => {
        if (+res.code === 0) {
          var result = [];
          res.data.forEach(item => {
            var i = ids.indexOf(item.departmentId);
            result.push({
              ...data[i],
              openid: item.qyDepartmentId,
              opentype: "departmentName"
            });
          });
          resolve(result);
        }
      });
    }
  });
}

// 用户Id换取企业微信Id
export function userIdToQyUserId(data, flag) {
  return new Promise(resolve => {
    const ids = data.map(i => {
      return i[flag];
    });
    http(
      "post",
      "/qwapi/qywechat/basic/contacts/actions/userIdToQyUserId", {
        userIds: ids
      },
      false
    ).then(res => {
      if (+res.code === 0) {
        let result = res.data || [];
        let targetMap = {};
        result.forEach(i => {
          let map = {};
          map[i.userId] = i.qyUserId || "--";
          targetMap = {
            ...targetMap,
            ...map
          };
        });
        data.forEach(i => {
          i["opentype"] = "userName";
          i["openid"] = targetMap[i[flag]];
        });
        resolve(data);
      }
    });
  });
}

export function configUserIdToQyUserId(data, flag) {
  return new Promise(resolve => {
    const ids = data.map(i => {
      return i[flag];
    });
    http(
      "post",
      "/qwapi/qywechat/basic/contacts/actions/userIdToQyUserId", {
        userIds: ids
      },
      false
    ).then(res => {
      if (+res.code === 0) {
        let result = res.data || [];
        let targetMap = {};
        result.forEach(i => {
          let map = {};
          map[i.userId] = i.qyUserId || "--";
          targetMap = {
            ...targetMap,
            ...map
          };
        });
        data.forEach(i => {
          i["opentype"] = "userName";
          i["openconfigid"] = targetMap[i[flag]];
        });
        resolve(data);
      }
    });
  });
}

export function userIdToUserId(data, flag) {
  return new Promise(resolve => {
    const ids = data.map(i => {
      return i[flag];
    });
    http(
      "post",
      "/qwapi/qywechat/basic/contacts/actions/userIdToQyUserId", {
        userIds: ids
      },
      false
    ).then(res => {
      if (+res.code === 0) {
        let result = res.data || [];
        let targetMap = {};
        result.forEach(i => {
          let map = {};
          map[i.userId] = i.qyUserId || "--";
          targetMap = {
            ...targetMap,
            ...map
          };
        });
        data.forEach(i => {
          i["opentype"] = "userName";
          i[`open${flag}`] = targetMap[i[flag]];
        });
        resolve(data);
      }
    });
  });
}

// 根据用户名搜索
export function userSearch(name, limit=10) {
  return new Promise(resolve => {
    http(
      "get",
      "/qwapi/qywechat/basic/contacts/actions/search", {
        params: {
          type: "1",
          offset: 0,
          limit,
          name: name
        }
      },
      false
    ).then(res => {
      if (+res.code === 0) {
        const personnels = res.data.personnels || [];
        const ids = personnels.map(v => {
          return v.userId;
        }).filter(e => e);
        resolve(ids);
      }
    });
  });
}

export function wechartDepartSearch (condition) {
  return new Promise((resolve) => {
    http(
      'get',
      `/qwapi/qywechat/basic/contacts/actions/search`, {
        params: {
          type: '2',
          name: condition,
          limit: 30,
          offset: 0
        }
      }
    )
    .then((res) => {
      if (+res.code === 0) {
        const departments = res.data.departments || [];
        const ids = departments.map(v => {
          return v.departmentId;
        });
        resolve(ids);
      }
    })
  })
}

// 部门Id换取企业微信Id
export function transDepartment(data, flag) {
  return new Promise(resolve => {
    const ids = data.map(i => {
      return i[flag];
    });
    http(
      "post",
      "/qwapi/qywechat/basic/contacts/actions/queryQyPartyIds", {
        departmentIds: ids
      },
      false
    ).then(res => {
      if (+res.code === 0) {
        let result = res.data || [];
        let targetMap = {};
        result.forEach(i => {
          let map = {};
          map[i.departmentId] = i.qyDepartmentId || "--";
          targetMap = {
            ...targetMap,
            ...map
          };
        });
        data.forEach(i => {
          i["opentype"] = "departmentName";
          i["openid"] = targetMap[i[flag]];
        });
        resolve(data);
      }
    });
  });
}

// 获取企业微信id列表
export function getQiweiIds(ids) {
  return new Promise(resolve => {
    http(
      "post",
      "/qwapi/qywechat/basic/contacts/actions/userIdToQyUserId", {
        userIds: ids
      },
      false
    ).then(res => {
      if (+res.code === 0) {
        let result = res.data || [];
        let arr =  result.map(v => {
          return v.qyUserId
        })
        resolve(arr);
      }
    });
  });
}

// 根据key合并两个数组中的对象, anotherKey可为空（默认两个list使用同一个key）
export function mergeList(list, anotherList, key, anotherKey) {
  if (!(list instanceof Array && anotherList instanceof Array)) {
    throw new Error('input object is not Array')
  }
  if (!key) {
    throw new Error('merge list need one key atleast')
  }
  let keyMap = {}
  let res = []
  list.forEach(e => keyMap[e[key]] = e)
  let sKey = anotherKey || key
  anotherList.forEach(e => {
    if (keyMap[e[sKey]]) {
      res.push(Object.assign({}, keyMap[e[sKey]], e))
    }
  })
  return res
}

// 获取时间
export function getTime(val) {
  if (!val) return "";
  let time = new Date(val);
  let h = time.getHours();
  h = h < 10 ? "0" + h : h;
  let mi = time.getMinutes();
  mi = mi < 10 ? "0" + mi : mi;
  let s = time.getMilliseconds();
  s = s < 10 ? "0" + s : s;
  return h + ":" + mi + ":" + s;
}

/**
 * 得分率补零
 */
export function coverageZero(num) {
  const _str = num.toString()
  if (_str.indexOf('.') === -1) return _str + '.00'
  const _len = _str.substr(_str.indexOf('.') + 1).length
  return _len === 1 ? _str + '0' : _str
}

export function isIE() {
  if(!!window.ActiveXObject || 'ActiveXObject' in window){
    return true
  }else{
    return false
  }
}

export const safeCenterPrefix = {
  development: `//${location.hostname}/chain/index.html#`,
  production: '/safe-center/index.html#'
}[process.env.NODE_ENV]

export function recycleIframe(iframe) {
  if (!isIE()) return
  iframe.src = null
  // iframe.contentWindow.document.write('')
  // iframe.contentWindow.document.clear()
  typeof CollectGarbage !== 'undefined' && CollectGarbage()
}
//快捷设置时分秒：当天00:00:00 - 23:59:59
export function setFormatDate(date, fmt) {
  if (!date) {
    return ''
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (date.getFullYear() + '').substr(4 - RegExp.$1.length)
    )
  }
  let o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  }
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length === 1
          ? o[k]
          : ('00' + o[k]).substr(('' + o[k]).length)
      )
  }
  return fmt
}

export function getWatermark () {  // 获取当前时间的水印数组 ['186****5678用户输入的自定义','admin2023/10/30']
  const { watermarkArr } = store.getters.watermarkOpt
  let mark = JSON.parse(JSON.stringify(watermarkArr))
  let arr = []
  mark.forEach((line, i) => {
    line.forEach((item, index) => {
      if (item === 'date') {
        line[index] = (new Date()).toLocaleDateString()
      } else {
        line[index] = store.getters.watermarkOpt[item]
      }
    })
    line = line.join('')
    if (line) arr.push(line)
  })
  return arr
}
// 获取url拼接字符串 - 视频截帧
export function getVideoFrameUrl(url, t = 0, w = 0, h = 0, f = 'png') {
  if (!url) return ''
  const str = ["video/snapshot", `t_${t}`, `w_${w}`, `h_${h}`, `f_${f}`].join(
    ","
  );
  return `${url}${url.includes('?') ? '&' : '?'}x-oss-process=${str}`;
}

export function rgbaTo16color(color) {
  let val = color
    .replace(/rgba?\(/, '')
    .replace(/\)/, '')
    .replace(/[\s+]/g, '')
    .split(',');
  let a = parseFloat(val[3] || 1),
      r = Math.floor(a * parseInt(val[0]) + (1 - a) * 255),
      g = Math.floor(a * parseInt(val[1]) + (1 - a) * 255),
      b = Math.floor(a * parseInt(val[2]) + (1 - a) * 255);
  return "#" +
    ("0" + r.toString(16)).slice(-2) +
    ("0" + g.toString(16)).slice(-2) +
    ("0" + b.toString(16)).slice(-2);
}
/**
 * 获取路由参数
 * @param {String} variable 参数key值
 */
export function getQueryVariable (variable) {
  const hash = window.location.hash
  const query = hash.substring(hash.indexOf('?') + 1)
  const vars = query.split('&')

  let res = ''
  for (const v of vars) {
    const pair = v.split('=')
    if (pair[0] == variable) {
      res = pair[1]
    }
  }
  return res
}
