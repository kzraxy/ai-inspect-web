<template>
  <div class="edit_compare_map">
    <div class="self_breadcrumb_head">
      <div class="head_left">
        <i class="h-icon-arrow_left back_icon" @click="beforeReturn"></i>
        <div class="split"></div>
        <inputNameEdit ref="inputNameEdit" v-model="imageLibraryDetailInfo.name" :width="300" :fontSize="16" :iconSize="22" :isShowEdit="true" :isAlwaysShowEdit="true" 
          @update="updateNameHandler" :isUpdateImmediate="false" @startEdit="startEdit" @endEdit="endEdit"></inputNameEdit>
      </div>
      <div class="head_right">
        <el-button type="primary" @click="issuedDevice" v-show="$route.query.libraryType === 'EDGE'">设备下发</el-button>
      </div>
    </div>
    <div class="wrap">
      <div class="left_wrap">
        <div class="left_title">比对图库<el-button type="text" @click="showEditMapModal" style="color: rgba(0,0,0,0.70);">编辑</el-button></div>
        <div class="search1" style="margin-right: 16px;">
          <el-input v-model="leftSearchParmas.name" placeholder="请输入图片名称" style="width: 213px;" :clear-icon-click="clearSearchName" 
           suffix-icon="h-icon-search" :on-icon-click="changeSearch" @keyup.enter.native='changeSearch' clearable >
          </el-input>
          <el-button icon="h-icon-add" :plain="true" title="上传图片" @click="uploadImg"/>
        </div>
        <div class="search2">
          <div class="s_left">
            <div v-for="(item,index) in [{id:true,name:'已绘制'},{id:false,name:'未绘制'}]" :key="index" style="margin-right:16px;cursor: pointer;"
              :class="{'s_left_active': item.id === leftSearchParmas.drawed}" @click="changeIsMark(item.id)">{{item.name}}</div>
          </div>
          <!-- <el-dropdown placement="bottom-start" @command="handleCommand">
            <span class="command_span">
              {{command}}<i class="h-icon-angle_down el-icon--right" style="font-size:14px;margin-left:4px"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="大图模式">大图模式</el-dropdown-item>
              <el-dropdown-item command="小图模式">小图模式</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown> -->
        </div>
        <div class="search3">
        <!-- <div class="search3" v-if="currentSelectedList.length>0"> -->
          <el-button @click="delMap" type="iconButton" icon="h-icon-delete" :disabled="!currentSelectedList.length">删除</el-button>
          <el-checkbox v-model="ischeckedAll" :indeterminate="isIndeterminate" label="all" @change="checkedAllChange">全选本页</el-checkbox>
        </div>
        <el-scrollbar wrap-class="demo-scrollbar-wrap-left" v-loading="loading" ref="leftScrollbar" v-if="leftList.length" >
          <div style="margin-left:16px">
            <imgCard v-for="(item,index) in leftList" :key="item.deviceSerial" :imageInfo="item" :showCheckbox="true" @click="handleCrrentClick(item,index)"
              :selectedList="currentSelectedList" @select="handleCurrentSelected" :activeCard="index===currentLeftIndex">
            </imgCard>
          </div>
        </el-scrollbar>
        <div v-if="!leftList.length" class="empty_wrap">
          <img class="emptyImg" src="@/assets/img/default_no data_nor.svg" alt="">
          <div style="text-align: center;color: rgba(0,0,0,0.40);">{{`暂无${leftSearchParmas.drawed?'已':'未'}绘制图片`}}</div>
        </div>
        <div class="search4">
          <div>共{{ total }}条</div>
          <el-pagination small @current-change="handleCurrentChange" :current-page="leftSearchParmas.pageNo" layout="prev, miniPager, next" :total="total" :page-size="leftSearchParmas.pageSize"></el-pagination>
        </div>
      </div>
      <div class="middle_wrap">
        <div class="mid_top_btn_wrap">
          <div class="left">
            <el-button @click="clickDrawBtn('drawRect')" :disabled="!leftList.length" icon="icon iconfont icondrawhz" title="快捷键 R">绘制</el-button>
            <el-button @click="clickDrawBtn('clean')" :disabled="!leftList.length" icon="icon iconfont icondrawqc">清除</el-button>
            <div class="split"></div>
            <el-button @click="clickDrawBtn('drawFront')" :disabled="drawFrontBtnDisabled || !leftList.length" icon="icon iconfont icondrawqj">前进</el-button>
            <el-button @click="clickDrawBtn('drawBack')" :disabled="drawBackBtnDisabled || !leftList.length" icon="icon iconfont icondrawht">后退</el-button>
          </div>
          <div class="right">
            <el-button type="default" icon="h-icon-save" style="border:1px solid #ccc;" @click="saveCalibrate" :disabled="!leftList.length">保存</el-button>
          </div>
        </div>
        <div class="main_wrap" v-show="leftList.length">
          <el-form ref="form" :model="form" label-width="80px" :rules="rules" class="self_form">
            <el-form-item label="图片名称" prop="name" :required-right="false">
              <el-input v-model="form.name" placeholder="请输入图片名称" :maxlength="256" clearable :clear-icon-click="clearPicNewName"></el-input>
            </el-form-item>
          </el-form>
          <div class="draw_wrap">
            <calibrate ref="calibrate" height="calc(100vh - 350px)" @noticeSetDrawStepInfo="noticeSetDrawStepInfo"
              @drawFront="drawFront" @drawBack="drawBack" :drawBackBtnDisabled="drawBackBtnDisabled" :drawFrontBtnDisabled="drawFrontBtnDisabled" :onlyOneCalibration="true">
            </calibrate>
          </div>
        </div>
        <div class="main_empty_wrap" v-show="!leftList.length">
          <div class="main_empty">
            <img src="@/assets/img/default_no data_nor.svg" alt="">
            <div style="display:flex;align-items:center">
              暂无图片，<el-button @click="uploadImg" type="link">点击上传</el-button>
            </div>
          </div>
        </div>
        <div class="foot_btn_wrap">
          <el-button @click="changImage('prev')" :disabled="leftSearchParmas.pageNo===1&&currentLeftIndex===0">上一张</el-button>
          <el-button @click="changImage('next')" style="margin-left:16px" 
          :disabled="((leftSearchParmas.pageNo===totalPage)&&(currentLeftIndex===leftList.length-1))||!leftList.length">下一张</el-button>
        </div>
      </div>
    </div>
    <editMapDrawer v-if="addDeviceVisible" ref="editMapDrawer" :visible.sync="addDeviceVisible" :imageLibraryId="imageLibraryId"
      @flash="resetGetLeftList"></editMapDrawer>
    <issuedDeviceDrawer v-if="issuedDeviceVisible" ref="issuedDeviceDrawer" :visible.sync="issuedDeviceVisible" :selectedList="issuedDeviceDrawerSelectDevices"
      :imageLibraryId="imageLibraryId"></issuedDeviceDrawer>
    <pageUploadDialog :visible.sync="pageUploadDialogVisible" @flash="resetGetLeftList" :imageLibraryId="imageLibraryId" :saveImg="saveImgAPI" 
      :isShowRate="true" rateText="256*256≤单张图片像素≤4096*2160，" :lessW="256" :lessH="256" :overW="4096" :overH="2160" :nameMaxLength="256"></pageUploadDialog>
  </div>
</template>
<script>
import { isContained } from '@/common/util'
import inputNameEdit from '@/components/inputNameEdit.vue'
import calibrate from '@/components/calibrateSimple'
import imgCard from './modal/imgCard'
import editMapDrawer from './modal/editMapDrawer'
import issuedDeviceDrawer from './modal/issuedDeviceDrawer'
import pageUploadDialog from '@/components/pageUpload/dialog.vue'
import {  modifyImage, getImageLibraryOne, getImagePage, deleteImages, modifyImageLibrary, getImageLibraryDevicePage } from './proxy'
export default {
  components: { calibrate, inputNameEdit, imgCard, editMapDrawer, issuedDeviceDrawer, pageUploadDialog },
  data () {
    let checkImgName = async (rule, value, callback) => {
      let pattern = /[\/\\\:\*\?\'\"\<\>\|\%]/
      if (!value || value.length === 0) {
        callback(new Error('请输入图片名称'))
      } else if (pattern.test(value)) {
        callback(new Error(`图片名称不能含有字符/\:*?'"<>|%`))
      } else {
        callback()
      }
    }
    return {
      addDeviceVisible: false,
      issuedDeviceVisible: false,
      pageUploadDialogVisible: false,
      command: '大图模式',
      currentSelectedList: [],
      ischeckedAll: false,
      isIndeterminate: false,
      imageLibraryDetailInfo: {
        name: ''
      },
      total: 0,
      totalPage: 0,
      loading: false,
      leftSearchParmas: {
        pageSize: 50,
        pageNo: 1,
        name: '',
        drawed: true
      },
      imageLibraryId: '',
      issuedDeviceDrawerSelectDevices: [],
      rules: {
        name: [{ required: true, validator: checkImgName, trigger: 'change' }],
      },
      form: {
        name: ''
      },
      leftList: [],
      currentLeftIndex: 0,
      currentLeftItem: {},
      drawBackBtnDisabled: false,
      drawFrontBtnDisabled: false,
      drawStepIndex: 0, // 标识当前前进或后退对应的数据序号
      drawStepFullData: [], //全量的每一步操作数据数组
      saveImgAPI: {
        method: 'post',
        proxyUrl: '/v1/inspect/taskconfig/deviceRcImage/modifyImage',
        params: {}
      },
      startEditFlag: false,
      prevFlag: false,
      nextFlag: false
    }
  },
  watch: {
    leftList: {
      handler () {
        this.checkAllChange()
      },
      deep: false,
      immediate: false
    },
    currentLeftIndex: {
      handler (val) {
        val > -1 && this.$refs.leftScrollbar && this.$refs.leftScrollbar.setScroll(240 * (this.currentLeftIndex))
      },
      deep: false,
      immediate: false
    },
  },
  mounted () {
    this.imageLibraryId = this.$route.query.imageLibraryId
    this.resetGetLeftList()
    this.getImageLibraryDetail()
    document.addEventListener('keydown', this.watchOnkeydown)
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.watchOnkeydown)
  },
  methods: {
    watchOnkeydown(event) {
      let _key = event.keyCode
      if (_key === 82) {
        this.clickDrawBtn('drawRect')
      } else {
        if (this.startEditFlag) {
          return false
        } else {
          if (_key === 37) {
            this.changImage('prev')
          } else if (_key === 39) {
            this.changImage('next')
          } 
        }
      }
    },
    startEdit() {
      this.startEditFlag = true
    },
    endEdit() {
      this.startEditFlag = false
    },
    clearPicNewName() {
      this.form.name = ''
      this.$forceUpdate()
    },
    async updateNameHandler (val) {
      const { code } = await modifyImageLibrary({ id: this.imageLibraryId, name: val })
      if (code === 0) {
        this.$message.success('修改成功')
      } else {
        this.$refs.inputNameEdit.reset()
      }
    },
    async issuedDevice() {
      this.issuedDeviceVisible = true
      let { code, data } = await getImageLibraryDevicePage({ imageLibraryId: this.imageLibraryId, pageNo: 1, pageSize: 9999999, storeIds:[], nodeId: null, taskStatus: null })
      if (code === 0 && data) {
        this.issuedDeviceDrawerSelectDevices = data.rows || []
        this.$nextTick(() => {
          this.$refs.issuedDeviceDrawer.init()
        })
      }
    },
    getImageLibraryDetail() {
      getImageLibraryOne({id: this.imageLibraryId}).then(res => {
        if (res.code === 0) {
          this.imageLibraryDetailInfo = { ...res.data }
        }
      })
    },
    delMap() {
      this.$confirm('是否确定删除所选图片？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'question'
      }).then(async() => {
        deleteImages({ ids: this.currentSelectedList.map(item => item.id)}).then(res => {
          if(res.code === 0) {
            this.$message.success('删除成功！')
            this.resetGetLeftList()
            this.currentSelectedList = []
          }
        })
      })
    },
    uploadImg () {
      this.pageUploadDialogVisible = true
    },
    showEditMapModal() {
      this.addDeviceVisible = true
      this.$nextTick(() => {
        this.$refs.editMapDrawer.init()
      })
    },
    // 全选
    checkedAllChange (v) {
      this.ischeckedAll = v
      const rows = JSON.parse(JSON.stringify(this.leftList))
      if (v) {
        const selectedDeviceIds = this.currentSelectedList.map(d => d.id)
        const realNeedArr = rows.filter(d => !selectedDeviceIds.includes(d.id))
        this.currentSelectedList = this.currentSelectedList.concat(realNeedArr)
      } else {
        const deviceIds = rows.map(d => d.id)
        this.currentSelectedList = this.currentSelectedList.filter(s => !deviceIds.includes(s.id))
      }
      this.isIndeterminate = false
    },
    handleCommand(command) {
      this.command = command
    },
    handleCrrentClick(item, index) {
      this.beforeChangeLeftCard(item, index, true)
    },
    handleCurrentSelected (row) {
      if (row.checked) {
        this.currentSelectedList.push(row)
      } else {
        this.currentSelectedList.forEach((i, index) => {
          if (i.id === row.id) {
            this.currentSelectedList.splice(index, 1)
          }
        })
      }
      this.checkAllChange()
    },
    checkAllChange () {
      const checkedCount = this.currentSelectedList.length
      const rowsIds = this.leftList.map(d => d.id)
      const selectedIds = this.currentSelectedList.map(d => d.id)
      this.ischeckedAll = checkedCount > 0 && selectedIds.filter(val => rowsIds.indexOf(val) > -1).length > 0 && isContained(selectedIds, rowsIds)
      this.isIndeterminate = checkedCount > 0 && selectedIds.filter(val => rowsIds.indexOf(val) > -1).length > 0 && !isContained(selectedIds, rowsIds)
    },
    async clickDrawBtn(type) {
      if (type === 'drawRect') { // 判断是否已经有一个绘制框了，如果有，则不能绘制第二个
        let calibrations = await this.$refs.calibrate.getNewCalibrationList()
        if (calibrations && calibrations.length) {
          this.$message.warning('只能绘制一个框，请清除当前绘制信息')
          return false
        }
      }
      this.$refs.calibrate[type]()
    },
    // 图片翻页
    async changImage (type) {
      if (type === 'prev') {
        if (this.leftSearchParmas.pageNo === 1 && this.currentLeftIndex === 0) {
          this.$message.info('已经是第一张图片了')
          return false
        }
        if (this.currentLeftIndex > 0) {
          this.prevFlag = false
          this.nextFlag = false
          this.currentLeftIndex--
          // this.changeLeftCard(this.leftList[this.currentLeftIndex], this.currentLeftIndex, ()=>{})
          this.beforeChangeLeftCard(this.leftList[this.currentLeftIndex], this.currentLeftIndex, true)
        } else {
          // 获取前一页数据
          this.leftSearchParmas.pageNo--
          this.prevFlag = true
          // this.handleCrrentClick(this.leftList[this.currentLeftIndex], this.currentLeftIndex)
          // this.getLeftList(() => {
          //   this.currentLeftIndex = this.leftSearchParmas.pageSize - 1
          //   // this.$refs.leftScrollbar && this.$refs.leftScrollbar.setScroll(240 * (this.currentLeftIndex))
          // })
        }
      } else {
        if (this.leftSearchParmas.pageNo === this.totalPage && this.currentLeftIndex === this.leftList.length - 1) {
          this.$message.info('已经是最后一张图片了')
          return false
        }
        if (this.currentLeftIndex < this.leftList.length - 1) {
          this.prevFlag = false
          this.nextFlag = false
          this.currentLeftIndex++
          this.beforeChangeLeftCard(this.leftList[this.currentLeftIndex], this.currentLeftIndex, true)
          // this.changeLeftCard(this.leftList[this.currentLeftIndex], this.currentLeftIndex, ()=>{})
        } else {
          // 获取后一页数据
          // this.currentLeftIndex = 0
          this.leftSearchParmas.pageNo++
          this.nextFlag = true
        }
      }
    },
    changeSearch() {
      this.resetGetLeftList()
    },
    clearSearchName() {
      this.leftSearchParmas.name = ''
      this.resetGetLeftList()
    },
    changeIsMark(val) {
      this.leftSearchParmas.drawed = val
      this.resetGetLeftList()
    },
    /* 该方法记录操作的步骤数据，
    type：区分该步骤的类型，
    isFrontBack：是否点击了前进后退导致的数据改变，如果是，那么drawStepFullData数组不push数据，只做修改，否则增加一条新的操作数据 */
    async noticeSetDrawStepInfo(type, isFrontBack) {
      if (!isFrontBack) {
        this.drawStepIndex++
        let calibrations = await this.$refs.calibrate.getNewCalibrationList() // 获取当前的绘制画布里的信息
        this.drawStepFullData.splice(this.drawStepIndex,0,JSON.parse(JSON.stringify(calibrations)))
      }
      this.judgeDrawFrontOrBackBtnDisabled()
    },
    async drawFront() {
      this.drawStepIndex++
      await this.$refs.calibrate.setCalibrationList(this.drawStepFullData[this.drawStepIndex])
      await this.$refs.calibrate.afterCalibrationsStatusChange() // 设置右侧标签的选择
      this.$refs.calibrate.setIsFrontBack(false)
      this.judgeDrawFrontOrBackBtnDisabled()
    },
    async drawBack() {
      this.drawStepIndex--
      await this.$refs.calibrate.setCalibrationList(this.drawStepFullData[this.drawStepIndex])
      await this.$refs.calibrate.afterCalibrationsStatusChange() // 设置右侧标签的选择
      this.$refs.calibrate.setIsFrontBack(false)
      this.judgeDrawFrontOrBackBtnDisabled()
    },
    judgeDrawFrontOrBackBtnDisabled() { // 判断前进和后退按钮的禁用状态
      this.drawBackBtnDisabled = this.drawStepIndex === 0
      this.drawFrontBtnDisabled = this.drawStepIndex === (this.drawStepFullData.length - 1)
    },
    async saveCalibrate() {
      this.$refs.form.validate(async(valid) => {
      if (valid) {
        let saveParmas = await this.setSaveParmas()
        modifyImage(saveParmas).then(res => {
          if (res.code === 0) {
            this.modifyImageTips(res.data)
            this.getLeftList()
          }
        })
      }
    })
    },
    async setSaveParmas() {
      let val = await this.$refs.calibrate.getNewCalibrationList()
      let saveParmas = {
        ...this.currentLeftItem,
        imageLibraryId: this.imageLibraryId,
        name: this.form.name,
        points: (val && val.length) ? val[0].scope.coordinates : [] // 就一个绘制框
      }
      delete saveParmas.calibrationList
      return saveParmas
    },
    handleCurrentChange (val) {
      if(this.prevFlag) {
        this.prevChange()
        return false
      }
      if(this.nextFlag) {
        this.nextChange()
        return false
      }
      this.currentLeftIndex = 0
      this.leftSearchParmas.pageNo = val
      this.getLeftList()
    },
    setLeftLoading() { // 左侧列表loading下，不然画布上计算坐标有延迟，导致一些问题
      this.loading = true
      setTimeout(() => {
        this.loading = false
      }, 1000)
    },
    resetGetLeftList() {
      this.currentLeftIndex = 0
      this.leftSearchParmas.pageNo = 1
      this.getLeftList()
    },
    getLeftList (callback, noNeedSetIndex) {
      this.loading = true
      getImagePage({imageLibraryId: this.imageLibraryId, ...this.leftSearchParmas }).then(res => {
        if (res.code === 0) {
          this.total = res.data.total
          this.totalPage = res.data.totalPage
          this.leftList = res.data.rows || []
          if (!this.leftList.length) {
            this.$refs.calibrate.setDefaultEmpty()
          }
          this.leftList.forEach(item => { // 处理数据
            item.points = item.points ? item.points : []
            item.calibrationList = item.points.length > 0 ? [{
              id: item.id,
              labelList: [],
              color:  "#308FF0",
              calibrationType: "RECT",
              scope: {
                type: "rect",
                coordinates: item.points
              }
            }] : []
          })
          if (this.leftList && this.leftList.length) {
            if(!noNeedSetIndex) {
              this.currentLeftIndex = this.leftList.findIndex(val => val.id === this.currentLeftItem.id) < 0 ? 0 : this.leftList.findIndex(val => val.id === this.currentLeftItem.id)
            }
            this.beforeChangeLeftCard(this.leftList[this.currentLeftIndex], this.currentLeftIndex)
          }
        }
        this.prevFlag = false
        this.nextFlag = false
        this.setLeftLoading()
        callback && callback()
      }).catch(() => { this.loading = false })
    },
    prevChange() {
      this.beforeChangeLeftCard(this.leftList[this.currentLeftIndex], this.currentLeftIndex, true, () => {this.currentLeftIndex = this.leftSearchParmas.pageSize - 1})
    },
    nextChange() {
      this.beforeChangeLeftCard(this.leftList[this.currentLeftIndex], this.currentLeftIndex, true, () => {this.currentLeftIndex = 0})
    },
    async beforeChangeLeftCard(item, index, needTipEdit, callback) { //needTipEdit 是否需要提示编辑过内容，只有点击左侧通道提示，修改搜索条件等改变当前通道不提示
      if (this.currentLeftItem) {
        if (!needTipEdit) {
          this.changeLeftCard(item, index)
        } else {
          let isEdit = await this.judgeIsEdit()
          let domArr = Array.from(document.getElementsByClassName('el-loading-mask'))
          if (domArr.length) {
            domArr.forEach(item => {
              item.style.backgroundColor = isEdit ? 'rgba(0, 0, 0, 0)' : 'hsla(0, 0%, 100%, 0.9)'
            })
          }
          if (isEdit) {
            let saveParmas = await this.setSaveParmas()
            modifyImage(saveParmas).then(res => {
              if (res.code === 0) {
                this.prevFlag = false
                this.nextFlag = false
                this.currentLeftItem = item
                this.modifyImageTips(res.data)
                this.getLeftList(callback)
              }
            })
          } else {
            if (this.prevFlag) {
              this.currentLeftIndex = this.leftSearchParmas.pageSize - 1
              this.getLeftList(callback, true)
            } else if(this.nextFlag) {
              this.currentLeftIndex = 0
              this.getLeftList(callback, true)
            } else {
              this.changeLeftCard(item, index, callback)
            }
          }
          this.setLeftLoading()
        }
      } else {
        this.changeLeftCard(item, index, callback)
      }
    },
    modifyImageTips(data) {
      this.$message.success(data.publish ? "保存下发成功！" : '保存成功！')
    },
    judgeIsEdit() {
      return new Promise(async(resolve) => {
        let isEdit = false
        let calibrationList = await this.$refs.calibrate.getNewCalibrationList() || []
        let val = calibrationList.length > 0 ? calibrationList[0].scope.coordinates : []
        let points = this.currentLeftItem.points || []
        if (Object.keys(this.currentLeftItem).length === 0) { // 左侧无图片
          isEdit = false
        } else if (this.form.name && (this.currentLeftItem.name !== this.form.name)) { // 图片名称修改了
          isEdit = true
        } else if (!val.length && !points.length) { // 前后都没有绘制信息数组，表示未编辑过
          isEdit = false
        } else if (val.length !== points.length) { // 数组长度不一致，表示编辑过，这一层if主要剔除任一数组为0的情况
          isEdit = true
        } else { // 数组长度一样，分别每项判断改动
          val.forEach(point => {
            point.x = Math.round(point.x * 1000) / 1000
            point.y =  Math.round(point.y * 1000) / 1000
          })
          if (JSON.stringify(val) !== JSON.stringify(points)) {
            isEdit = true
          }
        }
        resolve(isEdit)
      })
    },
    async changeLeftCard(item, index, callback) {
      this.currentLeftIndex = this.leftList.findIndex(val => val.id === item.id)
      this.currentLeftItem = item
      if (this.currentLeftItem) {
        this.form.name = this.currentLeftItem.name
        this.currentLeftItem.picUrl = await this.isImageURLValid(item.picUrl)
        if (this.leftSearchParmas.drawed) {
          await this.$refs.calibrate.setDrawType()
        } else {
          await this.$refs.calibrate.drawRect()
        }
        await this.$refs.calibrate.updateImage(this.currentLeftItem.picUrl)
        this.currentLeftItem.points.forEach(point => {
          point.x =  Math.round(point.x * 1000) / 1000
          point.y =  Math.round(point.y * 1000) / 1000 
        })
        this.resetFrontOrBackStatus()
        await this.$refs.calibrate.setCalibrationList(this.currentLeftItem.calibrationList)
        callback && callback()
      }
    },
    isImageURLValid(url) { // 判断图片地址是否有效
      return new Promise((resolve) => {
        const img = new Image()
        img.src = url
        img.onload = function() {
          resolve(url)
        }
        img.onerror = function() {
          resolve('')
        }
      })
    },
    resetFrontOrBackStatus() { // 初始化前进后退状态，比如标签修改后，就是新开始计算前进后退轮次了
      this.drawStepFullData = []
      this.drawStepIndex = -1
      this.drawBackBtnDisabled = true
      this.drawFrontBtnDisabled = true
    },
    async beforeReturn () {
      let isEdit = await this.judgeIsEdit()
      if (isEdit) {
        this.$confirm('本次编辑有内容未保存，是否保存？', {
          confirmButtonText: '保存',
          cancelButtonText: '不保存',
          type: 'question'
        }).then(async() => {
          let saveParmas = await this.setSaveParmas()
          modifyImage(saveParmas).then(res => {
            if (res.code === 0) {
              this.modifyImageTips(res.data)
            }
          })
          setTimeout(() => {
            this.goBack()
          }, 1000)
        }).catch(() => {
          this.goBack()
        })
      } else {
        this.goBack()
      }
    },
    goBack () {
      this.$router.push({ name: 'retrievalCompare', query: { 
        publishStatus: this.$route.query ? this.$route.query.publishStatus : '', 
        libraryType:  this.$route.query ? this.$route.query.libraryType : '', 
      } })
    },
  },
}

</script>
<style lang="scss">
.edit_compare_map{
  .demo-scrollbar-wrap-left {
    // height: calc(100vh - 256px);
    height: calc(100vh - 296px);
  }
  .h-icon-add{
    font-size: 14px;
    color: #000;
    font-weight: 700;
    margin-top: -2px;
  }
  .middle_wrap{
    .mid_top_btn_wrap{
      .is-icon{
        display: flex;
        align-items: center;
      }
      .iconfont{
        font-size: 16px;
        margin-right: 4px;
      }
    }
  }
}
</style>
<style lang="scss" scoped>
.edit_compare_map{
  .wrap{
    display: flex;
    justify-content: space-between;
    .left_wrap{
      width: 290px;
      height: 100%;
      border-right: 1px solid #EEEFF2;
      .empty_wrap{
        height: calc(100vh - 313px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      .emptyImg {
        width: 200px;
        height: 103px;
      }
      .left_card{
        width: 245px;
        margin-bottom: 8px;
        display: flex;
        padding-left: 12px;
        padding-top: 12px;
        margin-left: 16px;
        position: relative;
        cursor: pointer;
        &:hover{
          background: rgba(27,88,244,0.04);
          border-radius: 4px;
        }
      }
      .active_card{
        background: rgba(27,88,244,0.04);
        border-radius: 4px;
      }
      .left_title{
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        color: rgba(0,0,0,0.90);
        height: 20px;
        line-height: 20px;
        font-weight: 600;
        margin: 16px 16px 12px 16px;
      }
      .search1{
        margin-left: 16px;
        margin-bottom: 6px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: relative;
      }
      .search2{
        display: flex;
        align-items: center;
        margin: 0 16px 8px 16px;
        justify-content: space-between;
        font-size: 12px;
        color: rgba(0,0,0,0.70);
        height: 32px;
        .s_left{
          display: flex;
          align-items: center;
          font-size: 14px;
          color: rgba(0,0,0,0.40);
          .s_left_active{
            color: rgba(0,0,0,0.90);
          }
        }
        .command_span{
          color: rgba(0,0,0,0.70);
          display:flex;
          align-items:center;
          cursor: pointer;
          i{
            color: rgba(0,0,0,0.70);
          }
        }
      }
      .search3{
        display:flex;
        align-items:center;
        justify-content: space-between;
        height: 36px;
        margin: 0 16px 4px 16px;
      }
      .search4{
        display: flex;
        align-items: center;
        margin: 8px 16px 0px 16px;
        justify-content: space-between;
      }
    }
    .middle_wrap{
      width: calc(100% - 290px);
      .main_empty_wrap{
        background: #F1F2F4;
        height: calc(100% - 107px);
        padding: 95px 110px;
        .main_empty{
          width: 100%;
          height: 100%;
          background: #FFFFFF;
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 14px;
          color: rgba(0,0,0,0.40);
          justify-content: center;
          img{
            width: 400px;
            height: 206px;
          }
        }
      }
      .main_wrap{
        display: flex;
        align-items: flex-start;
        justify-content: center;
        background: #F1F2F4;
        height: calc(100% - 107px);
        position: relative;
        .self_form{
          width: 400px;
          position: absolute;
          left: 10px;
          top: 16px;
        }
        ::v-deep .el-form-item__required{
          color: transparent;
        }
        .draw_wrap{
          width: 86%;
          margin-top: 95px;
        }
      }
      .mid_top_btn_wrap{
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 50px;
        padding-left: 12px;
        padding-right: 16px;
        .left{
          display: flex;
          align-items: center;
        }
        .right{
          display: flex;
          align-items: center;
          justify-content: flex-end
        }
      }
    }
  }
  .foot_btn_wrap{
    display: flex;
    align-items: center;
    justify-content: center;
    height: 60px;
    button{
      min-width: 76px;
      height: 36px;
      border-radius: 4px;
    }
  }
  .split{
    width: 1px;
    height: 10px;
    background: #E2E3E6;
    margin-left: 6px;
    margin-right: 6px;
  }
  .self_breadcrumb_head{
    height: 54px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #EEEFF2;
    .head_left{
      display: flex;
      align-items: center;
      font-size: 16px;
      color: rgba(0,0,0,0.90);
      .task_name{
        font-size: 14px;
        color: #999;
        margin-left: 12px;
      }
      .back_icon{
        margin-top: 2px;
        margin-left: 16px;
        font-size: 26px;
        color: #000;
        cursor: pointer;
        &:hover{
          color: #2080f7;
        }
      }
      .split{
        background: #EEEFF2;
        width: 1px;
        height: 14px;
        margin: 0 12px;
      }
    }
    .head_right{
      padding-right: 16px;
    }
  }
}
</style>
