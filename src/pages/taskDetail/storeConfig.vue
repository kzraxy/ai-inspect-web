<template>
  <div class="store_config" v-loading="loading" :element-loading-text="`正在${openApp?'开启':'关闭'}中，请稍候`">
    <el-scrollbar wrap-class="demo-scrollbar-wrap">
      <div class="main_wrap">
        <div class="title">设备名称：{{deviceBasicInfo.deviceName}}</div>
        <div class="sub_title">
          <div>主控版本：{{deviceInfo.firmwareVersion}}</div>
          <!-- <div style="margin-left:56px">集成库版本：{{deviceInfo.jcVersion}}</div> -->
        </div>
        <div class="main_card_wrap">
          <div class="m_card" v-for="(item,index) in mainCardList" :key="index">
            <img src="@/assets/img/icon_neicun_48.png">
            <div class="m_content">
              <div>{{`${item.mCardName}：剩余${item.mCardResidue}MB（共${item.mCardTotal}MB）`}}</div>
              <div class="m_percent">
                <div class="percent"><div class="use" :style="{'width':item.useRate+'%'}"></div></div>
                <div class="num">{{item.useRate}}%</div>
              </div>
            </div>
          </div>
        </div>
        <div class="title">APP</div>
        <div class="tips">启用后会赋予设备相应的能力，建议您在专业人员指导下使用，详情可咨询400-905-7898。</div>
        <div class="main_bottom">
          <div class="bot_card" v-for="(item,index) in appList" :key="index" v-show="appList&&appList.length">
            <img src="@/assets/img/icon_app_48.png">
            <div class="mid">
              <div class="text">{{item.packageName}}</div>
              <!-- <div class="status_wrap">
                <div :class="{'s_icon':true,'on':item.appStatus}"></div>
                <div class="text">{{item.appStatus?'在线':'离线'}}</div>
              </div> -->
            </div>
            <div class="right">
              <el-switch v-model="item.runStatus" class="switch_wrap" @change="controlApp(item)" :disabled="!item.appId"></el-switch>
            </div>
          </div>
          <div v-show="!appList||!appList.length" style="text-align:center;width:100%;color: rgba(0,0,0,0.70);">暂无数据</div>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>
<script>
import { getHEOPResource, getAppInfo, controlApp, getSystemDeviceInfo, getBasicDeviceInfo } from './proxy'
export default {
  data () {
    return {
      openApp: true,
      loading: false,
      deviceSerial: '',
      taskId: '',
      deviceBasicInfo: {
        deviceName: ''
      },
      deviceInfo: {
        firmwareVersion: '- -',
        jcVersion: '- -'
      },
      mainCardList: [
        { mCardName: '系统内存', mCardResidue: 0, mCardTotal: 0 },
        { mCardName: '智能内存', mCardResidue: 0, mCardTotal: 0 },
        { mCardName: 'FLASH', mCardResidue: 0, mCardTotal: 0 }
      ],
      appList: []
    }
  },
  mounted () {
    this.deviceSerial = this.$route.params.deviceSerial || ''
    this.taskId = this.$route.params.taskId || ''
    this.getHEOPResource()
    this.getAppInfo()
    this.getSystemDeviceInfo()
    this.getBasicDeviceInfo()
  },
  methods: {
    getBasicDeviceInfo () {
      getBasicDeviceInfo({ deviceSerial: this.deviceSerial, taskId: this.taskId }).then(res => {
        if (res.code === 0) {
          this.deviceBasicInfo = res.data
        }
      })
    },
    controlApp (item) {
      this.openApp = item.runStatus
      this.loading = true
      controlApp({ deviceSerial: this.deviceSerial, appId: item.appId, open: item.runStatus }).then(res => {
        if (res.code === 0) {
          this.loading = false
          if (!res.data) {
            this.$message.success('请求已发送，请稍后刷新！')
          }else if (res.data.statusCode === 0 || res.data.statusCode === 1) {
            this.$message.success('操作成功！')
            this.getHEOPResource()
            this.getAppInfo()
          } else {
            this.$confirm(`错误码：${res.data.subStatusCode}`, {
              message: `错误原因：${res.data.description}`,
              cancelButtonText: '我知道了',
              showConfirmButton: false,
              type: 'info'
            })
          }
        }
      }).catch(() => {
        this.getAppInfo()
        this.loading = false
      })
    },
    getSystemDeviceInfo () {
      getSystemDeviceInfo({ deviceSerial: this.deviceSerial, taskId: this.taskId }).then(res => {
        if (res.code === 0) {
          this.deviceInfo.firmwareVersion = (!res.data || !res.data.firmwareVersion) ? '- -' : res.data.firmwareVersion
          // this.deviceInfo.jcVersion = (!res.data || !res.data.jcVersion) ? '- -' : res.data.jcVersion
        }
      })
    },
    getAppInfo () {
      getAppInfo({ deviceSerial: this.deviceSerial }).then(res => {
        if (res.code === 0) {
          this.appList = res.data.appList
        }
      })
    },
    getHEOPResource () {
      getHEOPResource({ deviceSerial: this.deviceSerial }).then(res => {
        if (res.code === 0 && res.data) {
          this.mainCardList[0].mCardResidue = res.data.restMemory// 系统内存
          this.mainCardList[0].mCardTotal = res.data.totalMemory// 系统内存
          this.mainCardList[1].mCardResidue = res.data.restIntelligentMemory// 智能内存
          this.mainCardList[1].mCardTotal = res.data.totalIntelligentMemory// 智能内存
          this.mainCardList[2].mCardResidue = res.data.restFlash// FLASH
          this.mainCardList[2].mCardTotal = res.data.totalFlash// FLASH
          this.mainCardList.forEach(item => {
            item.useRate = 100 - Math.round(item.mCardResidue / item.mCardTotal * 100)
            item.mCardResidue = item.mCardResidue.toFixed(1)
            item.mCardTotal = item.mCardTotal.toFixed(1)
          })
        }
      })
    }
  }
}
</script>
<style lang="scss">
.store_config{
  .demo-scrollbar-wrap{
    height: 100%;
    overflow-x: hidden;
  }
}
</style>
<style lang="scss" scoped>
.store_config{
  .main_wrap{
    width:1200px;
    margin: 40px auto;
    .tips{
      color: rgba(0,0,0,0.40);
      margin-top: 8px;
      margin-bottom: 12px;
    }
    .main_bottom{
      display: flex;
      align-items: center;
      background: rgba(0,0,0,0.02);
      border-radius: 4px;
      flex-wrap: wrap;
      margin-bottom: 24px;
      padding: 28px 0 20px 40px;
      .bot_card{
        display: flex;
        align-items: center;
        width: 325px;
        height: 80px;
        background: #FFFFFF;
        border: 1px solid rgba(0,0,0,0.08);
        border-radius: 2px;
        margin-right: 60px;
        margin-bottom: 16px;
        padding: 16px 24px;
        img{
          width: 48px;
          height: 48px;
        }
        .mid{
          width: 160px;
          margin-left: 8px;
          .text{
            width: 100%;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
          }
          .status_wrap{
            display: flex;
            align-items: center;
            margin-top: 4px;
            .s_icon{
              width: 8px;
              height: 8px;
              border-radius: 4px;
              background: #D8D8D8;
              margin-right: 4px;
            }
            .on{
              background: #06BF10;
            }
          }
        }
        .right{
          margin-left: 14px;
        }
      }
    }
    .main_card_wrap{
      margin-top: 16px;
      display: flex;
      align-items: center;
      padding: 16px 0 0 16px;
      background: rgba(0,0,0,0.02);
      border-radius: 4px;
      flex-wrap: wrap;
      margin-bottom: 24px;
      .m_card{
        width: 377px;
        height: 116px;
        display: flex;
        align-items: center;
        align-items: center;
        // border: 1px solid red;
        margin-right: 16px;
        margin-bottom: 16px;
        img{
          width: 48px;
          height: 48px;
          margin-right: 16px;
        }
        .m_content{
          color: rgba(0,0,0,0.90);
          margin-bottom: 12px;
        }
        .m_percent{
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 12px;
          .percent{
            width: 224px;
            height: 12px;
            background: #e6e6e6;
            position: relative;
            .use{
              position: absolute;
              height: 100%;
              background: #347af3;
            }
          }
          .num{
            opacity: 0.7;
            font-family: SegoeUI;
            color: #000000;
            margin-left: 8px;
          }
        }
      }
    }
    .title{
      font-family: MicrosoftYaHeiUISemibold;
      font-size: 16px;
      color: rgba(0,0,0,0.70);
      line-height: 24px;
      font-weight: 600;
    }
    .sub_title{
      display: flex;
      align-items: center;
      color: rgba(0,0,0,0.70);
      line-height: 20px;
      margin-top: 16px;
    }
  }
}
</style>
