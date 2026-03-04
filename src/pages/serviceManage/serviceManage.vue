<template>
  <div class="service-manage">
    <div class="content_title">服务管理</div>
    <el-alert :title="`服务续费和扩容，请联系您当地的${title}服务商或销售代表，更多疑问请咨询 400-905-7898`" type="info" simple show-icon :closable="false"></el-alert>
    <div v-if="dataList.length">
      <div class="echart-data-mod">
        <div class="chart-item" v-for="(item, index) in dataList" :key="index" :style="{width:`calc((100% - 48px) / ${4})`}">
        <!-- <div class="chart-item" v-for="(item, index) in dataList" :key="index" :style="{width:`calc((100% - 48px) / ${dataList.length})`}"> -->
          <div class="item_name">
            <div class="item_name_text">{{item.authNameText}}</div>
            <div class="item_name_icon">
              <el-tooltip class="item" :content="item.extraInfo" placement="bottom">
                <i class="h-icon-info"></i>
              </el-tooltip>
            </div>
          </div>
          <div :class="{'item_service-day': true, 'service-day_deadline': item.serviceDay < 30}">服务剩余天数：{{item.serviceDay}}天</div>
          <div class="item_chart" :id="'echartInstance'+ (index + 1)"></div>
          <div class="item_text">
            <div class="text_used-amount"><span>{{item.usedText || '已用路数'}}</span><span class="amount-num">{{numberCutter(item.usedAmount)}}</span></div>
            <div class="text_used-amount"><span>{{item.authText || '总路数'}}</span><span class="amount-num">{{numberCutter(item.authAmount)}}</span></div>
          </div>
        </div>
      </div>
      <div class="qps_crap" v-show="showQPS">
        <div class="first_wrap">
          <div class="name">QPS并发趋势图<el-button type="link" style="margin-left:12px;" @click="changeQpsLine">{{showLine?'隐藏':'显示'}}参考线</el-button></div>
          <DatePick class='qps-data-pick' @change='dateChange'></DatePick>
        </div>
        <div id="qpsChart" ref='qpsChart' class="common-chart"></div>
      </div>
    </div>
    <div class="empty-mod" v-else>
      <img src="../../assets/img/no_data.png" alt="空态图标">
      <span>暂无数据</span>
    </div>
  </div>
</template>
<script>
import echarts from 'echarts'
import DatePick from '@/components/tdmDatePick/date-pick.vue'
import { getServiceManageInfo, getQPSreport } from '@/api/serviceManage'
export default {
  components: { DatePick },
  data () {
    return {
      showLine: false, // QPS趋势图的参考线，true显示
      dataList: [],
      echartInstances: {},
      dataPickfilter: {},
      chartData: {
        xlist: [],
        data: []
      },
      showQPS: true,
      qpsTotal: 0,
      initalTotal: 0
    }
  },
  computed: {
    title () {
      return (window.location.href.indexOf('hilaicloud.com') > -1) ? '' : '海康威视'
    }
  },
  methods: {
    changeQpsLine () {
      this.showLine = !this.showLine
      this.$nextTick(() => {
        this.qpsChart = this.$refs.qpsChart && echarts.init(this.$refs.qpsChart)
        this.setOption(this.showLine)
      })
    },
    dateChange (value) {
      if (value.dateType !== undefined || value.dataDate) {
        this.dataPickfilter = value
        this.initQPSEcharts()
      }
    },
    numberCutter (number, precision = 2) {
      return number
      // var reg = /\d{1,3}(?=(\d{3})+$)/g
      // if (number > 99999) {
      //   return (((number / 10000).toFixed(precision)) + '').replace(reg, '$&,')
      // } else {
      //   return (number + '').replace(reg, '$&,')
      // }
    },
    initChart (chartObj, objItem) {
      let colorList2 = ['#094AFF', '#f7f7f7']
      chartObj.setOption({
        title: [{
          id: 1,
          text: objItem.usedRate,
          subtext: '使用率',
          x: 'center',
          y: '33%',
          textStyle: {
            fontSize: 40,
            color: objItem.usedRate >= 90 ? '#FA3239' : '#333',
            fontFamily: 'HelveticaNeue-Medium'
          },
          subtextStyle: {
            color: 'rgba(0, 0, 0, 0.40)',
            fontSize: 12
          }
        }, {
          id: 2,
          text: '%',
          x: objItem.usedRate < 10 ? '52%' : (objItem.usedRate >= 10 && objItem.usedRate < 99) ? '55%' : '58%',
          // x: 'center',
          y: '45%',
          // offsetCenter: ['40px', '0px'],
          // padding: [0, 20],
          textStyle: {
            fontSize: 14,
            color: objItem.usedRate >= 90 ? '#FA3239' : '#333',
            fontFamily: 'HelveticaNeue-Medium'
          }
        }],
        series: [
          {
            name: '使用数量',
            silent: true,
            type: 'pie',
            hoverOffset: 5,
            radius: ['70%', '85%'],
            itemStyle: {
              normal: {
                color: function (params) {
                  let beginColor = ''
                  let endColor = ''
                  if (objItem.usedRate === 0) {
                    beginColor = '#f7f7f7'
                    endColor = '#f7f7f7'
                  } else if (objItem.usedRate >= 90) {
                    beginColor = '#FFA14B'
                    endColor = '#FA3239'
                  } else {
                    if (objItem.authCode === 243) {
                      beginColor = '#8AE6A8'
                      endColor = '#15D9BB'
                    } else if (objItem.authCode === 242) {
                      beginColor = '#5CE2FC'
                      endColor = '#46A7FD'
                    } else if (objItem.authCode === 241) {
                      beginColor = '#7AA3FF'
                      endColor = '#8C74FE'
                    } else if (objItem.authCode === 31057) {
                      beginColor = '#7AA3FF'
                      endColor = '#8C74FE'
                    } else if (objItem.authCode === 2410) {
                      beginColor = '#FF8943'
                      endColor = '#FF5120'
                    } else if (objItem.authCode === 2411) {
                      beginColor = '#8AE6A8'
                      endColor = '#15D9BB'
                    }
                  }
                  if (params.dataIndex === 0) {
                    return {
                      type: 'linear',
                      x: 0,
                      y: 0,
                      x2: 0,
                      y2: 1,
                      colorStops: [{
                        offset: 0, color: beginColor
                      }, {
                        offset: 1, color: endColor
                      }],
                      global: false // 缺省为 false
                    }
                  } else {
                    return colorList2[params.dataIndex]
                  }
                }
              }
            },
            avoidLabelOverlap: false,
            label: {
              normal: {
                show: false
              },
              emphasis: {
                show: false
              }
            },
            labelLine: {
              normal: {
                show: false
              }
            },
            data: [
              { value: objItem.usedAmount > objItem.authAmount ? objItem.authAmount : objItem.usedAmount, name: '使用数量' }, 
              { value: (objItem.authAmount - objItem.usedAmount < 0 ? 0 : objItem.authAmount - objItem.usedAmount), name: '未使用数量' }
            ]
          }
        ]
      })
    },
    async getDataList () {
      let { code, data } = await getServiceManageInfo()
      let date = new Date()
      if (code === 0) {
        let qpsArr = data.rows.filter(item => item.authCode === 31057) || []// 31057是qps的原始码，要转换成240
        this.showQPS = qpsArr.length > 0// 是否展示qps相关数据
        this.initalTotal = this.showQPS ? qpsArr[0].authAmount : 0
        data.rows.forEach(item => {
          item.usedRate = item.authAmount !== 0 ? ((item.usedAmount / item.authAmount).toFixed(2) * 100).toFixed(0) : 0
          item.serviceDay = this.datedifference(item.serviceEndTime, new Date(date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate()))
          // item.authCode = item.authCode === 31057 ? 31057 : item.authCode// authCode原来进行了排序，沿用排序，否则顺序错乱
          if (item.authCode === 243) {
            item.authNameText = '边缘分析授权路数'
            item.extraInfo = '下发至智能 IPC或NVR的智能分析任务中，允许添加的分析通道数量'
          } else {
            item.usedText = '已用数量'
            item.authText = '总数量'
            if (item.authCode === 242) {
              item.authNameText = '云端算法推理套餐包数量'
              item.extraInfo = '允许在云端部署并调用的算法模型个数'
            } else if (item.authCode === 241) {
              item.authNameText = '云端分析授权路数'
              item.extraInfo = '云服务类型智能分析任务中，允许添加的分析通道数量'
            } else if (item.authCode === 31057) {
              item.authNameText = 'QPS授权量'
              item.extraInfo = 'API分析任务中允许使用QPS总和'
            } else if (item.authCode === 2410) {
              item.authNameText = '场景方案项授权路数'
              item.extraInfo = '指购买的场景方案项路数，1 个生效通道消耗 1 路授权'
            } else if (item.authCode === 2411) {
              item.authNameText = '多模态分析'
              item.extraInfo = '运营助手/场景任务中多模态算子允许分析的次数'
            }
          }
        })
        data.rows.sort((a, b) => {
          return b.authCode - a.authCode
        })
        this.dataList = data.rows || []
        this.initHeadPieCharts()
      }
    },
    datedifference (beginDate, endDate) {
      let beginDateTime = new Date(beginDate).getTime()
      let endDateTime = new Date(endDate).getTime()
      return (beginDateTime - endDateTime) > 0 ? parseInt(Math.abs(endDateTime - beginDateTime) / 1000 / 60 / 60 / 24) : 0
    },
    initQPSEcharts () {
      getQPSreport(this.dataPickfilter).then(res => {
        if (res.code === 0) {
          this.chartData.xlist = res.data.histogramVOList.map((val) => val.name.replaceAll('-', '/'))
          this.chartData.data = res.data.histogramVOList.map((val) => val.value)
          let total = this.initalTotal
          this.qpsTotal = this.dataPickfilter.dateType === 0 ? total * 3600 : this.dataPickfilter.dateType === 1 ? total * 3600 * 24 : total * 3600 * 24 * 30
          this.$nextTick(() => {
            this.qpsChart = echarts.init(this.$refs.qpsChart)
            this.setOption()
          })
        }
      })
    },
    setOption () {
      const _this = this
      const option = {
        axisPointer: {
          lineStyle: {
            color: '#3C6DAFE',
            width: 1,
            shadowColor: 'rgba(0, 0, 0, 0.2)',
            shadowOffsetX: 0,
            shadowOffsetY: 2,
            shadowBlur: 4
          }
        },
        grid: {
          left: '100px',
          right: '10px',
          top: '20px',
          bottom: '60px'
        },
        tooltip: {
          trigger: 'axis',
          formatter: function (point) {
            let seriseName = _this.dataPickfilter.dateType === 0 ? _this.dataPickfilter.queryDate.replaceAll('-', '/') + ' ' + point[0].name : point[0].name
            return `
                  <div class='toolTipName' style="padding:14px 14px 6px"><span class='toolTipName-content'>` + seriseName + `</span></div> 
                  <div style="padding:0px 14px 14px"><span class='toolTipText'>并发量：</span><span class='toolTipNumber' style="font-size:18px;font-weight:600">` + point[0].value + `</span>
                `
          },
          backgroundColor: 'rgba(0,0,0,0.80)'
        },
        color: ['#2080f7', '#F1673C'],
        dataZoom: [{ type: 'inside', start: 0, end: 100 }, { start: 0, end: 10 }],
        xAxis: {
          type: 'category',
          axisLine: {
            lineStyle: {
              color: 'rgba(0,0,0,0.40)',
              width: 1
            }
          },
          axisTick: { show: false },
          splitLine: { show: false },
          data: this.chartData.xlist
        },
        yAxis: {
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            show: true,
            textStyle: {
              color: 'rgba(0,0,0,0.40)',
              fontSize: 12
            },
            formatter: function (value, index) {
              if (value > 99999) {
                return _this.numberCutter(value, 0) + '万'
              } else {
                return value
              }
            }
          },
          max: function (value) {
            if (_this.showLine) {
              return value.max < _this.qpsTotal ? _this.qpsTotal : value.max
            } else {
              return value.max
            }
          },
          nameTextStyle: {
            color: 'rgba(0,0,0,0.40)',
            fontSize: '12'
          },
          splitLine: { show: false }
        },
        series: [{
          name: '',
          data: this.chartData.data,
          type: 'bar',
          // barWidth: 20,
          yAxisIndex: 0,
          barMaxWidth: 28,
          symbol: 'circle',
          symbolSize: 5,
          barGap: 0,
          itemStyle: {
            normal: {},
            emphasis: {
              color: '#4557F6',
              borderColor: '#fff',
              borderWidth: 1,
              shadowColor: 'rgba(0, 0, 0, 0.2)',
              shadowOffsetX: 0,
              shadowOffsetY: 2,
              shadowBlur: 4
            }
          },
          markLine: {
            show: false,
            silent: true,
            lineStyle: {
              normal: {
                color: _this.showLine ? '#4557F6' : '#fff'
              }
            },
            label: {
              show: false
            },
            symbol: ['none', 'none'],
            data: [{
              yAxis: _this.qpsTotal
            }]
          }
        }]
      }
      this.qpsChart.setOption(option)
    },
    initHeadPieCharts () {
      this.$nextTick(() => {
        for (let i = 0; i < this.dataList.length; i++) {
          const dom = document.getElementById(`echartInstance${i+1}`) // 获取对应DOM
          this.echartInstances[`echartInstance${i+1}`] = echarts.init(dom)   // 初始化并存储
          this.initChart(this.echartInstances[`echartInstance${i+1}`], this.dataList[i])
        }
      })
    }
  },
  beforeMount () {
    this.getDataList()
    window.addEventListener('resize', () => {
      for (let i = 0; i < this.dataList.length; i++) {
        this.echartInstances[`echartInstance${i+1}`] && this.echartInstances[`echartInstance${i+1}`].resize()
      }
      this.qpsChart && this.qpsChart.resize()
    })
  },
  beforeDestroy () {
    for (let i = 0; i < this.dataList.length; i++) {
      this.echartInstances[`echartInstance${i+1}`] && this.echartInstances[`echartInstance${i+1}`].clear()
    }
    this.qpsChart && this.qpsChart.clear()
  }
}
</script>
<style lang="scss">
.qps-data-pick{
  .el-radio-group{
    .el-radio-button{
      margin-left: 8px;
      width:48px;
      height: 24px;
      .el-radio-button__inner{
        height: 24px;
        line-height: 24px;
        width:48px;
        padding: 0;
        font-size: 12px;
        border-radius: 12px;
        background: #EEF2F8;
        color: #191919;
        font-family: MicrosoftYaHeiUISemibold;
        font-weight: 600;
        border:none;
      }
      .el-radio-button__orig-radio:checked+.el-radio-button__inner{
        color:white;
        background: #2080f7;
      }
    }
  }
}
</style>
<style lang="scss" scoped>
.service-manage{
  padding: 16px;
  box-sizing: border-box;
  .common-chart {
    height: 270px;
    width: 100%;
  }
  .qps_crap{
    height: 330px;
    background: #FFFFFF;
    border: 1px solid #E0E0E0;
    border-radius: 4px;
    margin-top: 16px;
    padding-left: 16px;
    padding-right: 16px;
    .first_wrap{
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .name{
        font-family: MicrosoftYaHeiUISemibold;
        font-size: 16px;
        color: rgba(0,0,0,0.90);
        font-weight: 600;
      }
    }
  }
  .content_title{
    font-size: 18px;
    color: rgba(0,0,0,0.90);
    height: 50px;
    line-height: 38px;
    font-weight: bold;
  }
  .echart-data-mod{
    display: flex;
    text-align: center;
    // justify-content: space-between;
    width: 100%;
    flex-wrap: wrap;
    margin-left:-8px;
    .chart-item{
      margin-top: 16px;
      box-shadow: 1px 0 5px 0 rgba(0,0,0,0.08), 0 1px 5px 0 rgba(0,0,0,0.08);
      border-left: 2px solid #2080f7;
      padding: 24px 0;
      height: 329px;
      margin-left: 12px;
    }
    .item_name{
      display: flex;
      margin: 0 auto;
      font-family: MicrosoftYaHeiUI;
      justify-content: center;
      .item_name_text{
        font-size: 16px;
        color: rgba(0,0,0,0.70);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-bottom: 10px;
        font-weight: 600;
      }
      .item_name_icon{
        font-size: 20px;
      }
    }
    .item_service-day{
      font-size: 14px;
      color: rgba(0,0,0,0.40);
    }
    .service-day_deadline{
      color: #FA3239;
    }
    .item_text{
      font-size: 14px;
      color: rgba(0,0,0,0.40);
      width: 200px;
      margin: 0 auto;
      .text_used-amount{
        display: flex;
        justify-content: space-between;
        margin-top: 8px;
      }
      .amount-num{
        color: rgba(0,0,0,0.70);
      }
    }
    .item_chart{
      height: 150px;
      max-width: 500px;
      margin: 0 auto;
    }
  }
  .empty-mod{
    height: calc(100vh - 170px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
}
</style>
