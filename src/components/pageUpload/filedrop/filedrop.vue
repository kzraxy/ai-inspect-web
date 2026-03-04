<template>
  <div class="material-filedrop-components">
    <form class="dropbox" v-bind:class="{'active': draging}" id="myForm" v-show="isFinish">
      <label for="importFile" class="dropboxInner">
        <div v-if="type===1" class="drag-mod">
          <p class="icon-mod"></p>
          <p class="main">点击或将文件拖拽到此处上传</p>
          <p class="sub">支持文件类型jpg、jpeg、png<br>单张图片大小{{limit[0].size}}M以内，{{isShowRate?rateText:''}}支持选择至多{{limit[0].num}}张图片上传</p>
        </div>
        <div v-if="type=== 7" class="drag-mod">
          <p class="icon-mod"></p>
          <p class="main">点击或将文件拖拽到此处上传</p>
          <p class="sub">字体包格式限制ttf、otf，<br>单个字体包大小{{limit[1].size}}M以内，支持选择至多{{limit[1].num}}个字体包上传</p>
        </div>
      </label>
      <input id="importFile" type="file" :accept="accecp" @change="onChange" name="file" :multiple="multiple">
    </form>
    <div class="dropbox" style="cursor: not-allowed;" v-show="!isFinish" title="请等待上传结束，或处理完上传失败的文件，再点击上传">
      <div class="msg-mod">
        <p class="icon-mod"></p>
        <p class="main">总共选中{{files.length}}个文件</p>
        <p class="sub">其中正在上传
          <span class="ctxt">{{nummap.run}}</span>个,上传失败
          <span class="ctxt fail">{{nummap.fail}}</span>个,上传成功
          <span class="ctxt success">{{nummap.success}}</span>
        </p>
        <p class="sub"></p>
      </div>
    </div>
  </div>
</template>
<script>
import {
  fileCheck,
  getFileSize
} from '../util'
import { v1 as uuidv1 } from 'uuid'
export default {
  props: {
    type: { // 上传素材的类型，1图片 2视频 3音频 默认为图片
      type: Number,
      default: 1
    },
    isShowRate: {
      type: Boolean,
      default: false
    },
    rateText: {
      type: String,
      default: ''
    },
    lessW: {
      type: Number,
      default: 0
    },
    lessH: {
      type: Number,
      default: 0
    },
    overW: {
      type: Number,
      default: 0
    },
    overH: {
      type: Number,
      default: 0
    },
    nameMaxLength: {
      type: Number,
      default: 128
    }
  },
  computed: {
    // 允许上传的素材类型
    accecp () {
      const idx = this.type === 1 ? 0 : 1
      return this.limit[idx].accecp
    },
    // 是否允许批量选中
    multiple () {
      const mirror = [true, false]
      const idx = [1, 7].includes(this.type) ? 0 : 1
      return mirror[idx]
    },
    // 素材分类统计
    nummap () {
      // 上传中的素材数量
      const runrows = this.files.filter(f => { return ['wait', 'runing'].includes(f.uploadState) })
      // 上传失败的素材数量
      const failrows = this.files.filter(f => { return ['error'].includes(f.uploadState) })
      // 上传成功的素材数量
      const successrows = this.files.filter(f => { return ['success'].includes(f.uploadState) })
      return {
        run: runrows.length || 0,
        fail: failrows.length || 0,
        success: successrows.length || 0
      }
    },
    // 是否所有文件都上传完毕
    isFinish () {
      const successrows = this.files.filter(f => { return ['success'].includes(f.uploadState) })
      const flag = successrows.length === this.files.length
      if (flag) { this.reset() }
      return flag
    },
  },
  watch: {
    isFinish (v) {
      if (!v) {
        // 禁止浏览器打开拖拽的文件
        document.addEventListener('drop', this.forbidDefaultEvent, false)
        document.addEventListener('dragover', this.forbidDefaultEvent, false)
      } else {
        document.removeEventListener('drop', this.forbidDefaultEvent, false)
        document.removeEventListener('dragover', this.forbidDefaultEvent, false)
      }
    }
  },
  data () {
    return {
      limit: [
        { // 图片的限定（支持文件类型jpg、png单张图片大小2M以内，支持选择至多100张图片）
          accecp: '.jpg,.jpeg,.png',
          atxt: 'jpg,jpeg,png',
          num: 100,
          size: 10
        }
      ],
      usage: 0,
      files: [], // 文件对象
      draging: false // 是否正在拖拽
    }
  },
  mounted () {},
  beforeDestroy () {
    document.removeEventListener('drop', this.forbidDefaultEvent, false)
    document.removeEventListener('dragover', this.forbidDefaultEvent, false)
  },
  methods: {
    forbidDefaultEvent (e) {
      e.preventDefault()
    },
    // 重置
    reset () {
      this.files = []
      this.$nextTick(() => {
        document.getElementById('myForm').reset()
        const dropbox = document.querySelector('.dropbox')
        dropbox.addEventListener('dragenter', this.onDrag, false)
        dropbox.addEventListener('dragover', this.onDrag, false)
        dropbox.addEventListener('drop', this.onDrop, false)
        this.$emit('onFiles', this.files)
      })
    },
    // 文件域变化
    onChange (e) {
      const files = e.target.files || []
      this.encodeFilesObj(files)
    },
    // 文件拖拽事件
    onDrag (e) {
      e.stopPropagation()
      e.preventDefault()
      this.draging = true
    },
    // 文件拖拽完毕事件
    onDrop (e) {
      this.draging = false
      e.stopPropagation()
      e.preventDefault()
      const dt = e.dataTransfer
      const files = [];
      [].forEach.call(dt.files, function (file) {
        files.push(file)
      }, false)
      this.encodeFilesObj(files)
    },
    async fileCheckSingle (file, type) {
      const idx = type === 1 ? 0 : 1
      const limitarr = this.limit[idx].atxt.split(',')
      const limitsize = this.limit[idx].size
      const result = await fileCheck(file, limitsize, limitarr, this.nameMaxLength, this.lessW, this.lessH, this.overW, this.overH)
      return result.hasErr
    },
    // 编码文件对象
    async encodeFilesObj (files) {
      const arr = []
      const idx = this.type === 1 ? 0 : 1
      const limitarr = this.limit[idx].atxt.split(',')
      const limitsize = this.limit[idx].size
      const limitnum = this.limit[idx].num
      if (files.length > limitnum) {
        this.$message.warning(`支持选择至多${limitnum}个文件上传`)
        return
      }
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const map = {}
        const name = file.name
        const namearr = name.split('.')
        map.uid = uuidv1()
        map.type = file.name.split('.')[namearr.length - 1]
        map.name = file.name
        map.sizeTxt = getFileSize(file.size)
        map.uploadState = 'wait'
        map.percent = 0
        map.file = file
        map.isPass = true
        const result = await fileCheck(file, limitsize, limitarr, this.nameMaxLength, this.lessW, this.lessH, this.overW, this.overH)
        this.usage += file.size
        if (result.hasErr) {
          map.isPass = false
          map.uploadState = 'error'
          map.message = result.message
        }
        arr.push(map)
      }
      // 关于文件数量的限定
      this.files = arr
      this.$emit('onFiles', this.files)
    }
  }
}
</script>
<style lang="scss" scoped>
  @import "style.scss";
</style>
<style lang="scss">
  .gray-table-head, .el-table .gray-table-head th {
    background-color: #fbfbfb !important;
  }
</style>
