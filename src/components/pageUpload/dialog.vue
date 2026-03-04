<template>
  <el-dialog title="图片上传" :visible="visible" @close="close" :area="[900, 680]">
    <h-page style="height:600px">
      <h-page-container id="material-upload-page" style="overflow-y:auto">
        <h-page-content flex align-center>
          <div class="upload-inner-warp">
            <div class="detail-item flex-item">
              <!-- <span style="margin-right: 10px;">文件类型</span>
              <el-radio-group v-model="uploadType" :disabled="isruning">
                <el-radio :label="1">图片</el-radio>
              </el-radio-group> -->
            </div>
            <div class="detail-item">
              <file-drop ref="fileDrop" @onFiles="onFiles" :type="uploadType" :nameMaxLength="nameMaxLength"
                :isShowRate="isShowRate" :rateText="rateText" :lessW="lessW" :lessH="lessH" :overW="overW" :overH="overH"></file-drop>
            </div>
            <div class="detail-item last">
              <el-tabs v-model="activeTab">
                <el-tab-pane :label="labelmap.run" name="1"></el-tab-pane>
                <el-tab-pane :label="labelmap.fail" name="2"></el-tab-pane>
                <el-tab-pane :label="labelmap.success" name="3"></el-tab-pane>
              </el-tabs>
              <div class="fileListPart">
                <div class="action-mod" v-if="activeTab.toLocaleString() === '2'">
                  <el-button icon="h-icon-upload" type="default" plain @click="reloadAll" :disabled="!reloadRows.length">全部重新上传</el-button>
                  <el-button icon="h-icon-delete" type="default" plain @click="delAll" :disabled="!errorRows.length">一键清空</el-button>
                </div>
                <div class="list-part" style="min-height:92px">
                  <div style="flex: 1;">
                    <el-table
                      v-if="rows.length"
                      :data="rows"
                      header-row-class-name='gray-table-head'
                      tooltip-effect="dark"
                      height="100%"
                      style="position: absolute; top: 0; left: 0; bottom: 0; right: 0;"
                      :cell-class-name="cellClassName"
                      force-scroll show-overflow-title stripe>
                      <el-table-column label="名称" prop="name" width="220" inline-template>
                        <div class="name-warp-mod">
                          <img src="@/assets/img/material/image.png">
                          <div class="img-name" :title="row.name">{{row.name || '--'}}</div>
                        </div>
                      </el-table-column>
                      <el-table-column label="大小" prop="sizeTxt" width="120"></el-table-column>
                      <el-table-column label="类型" prop="type" width="100"></el-table-column>
                      <el-table-column label="上传进度" prop="size" min-width="250" class="progressStyle">
                        <template slot-scope="scope">
                          <div style="height: 100%">
                            <progress-bar :row="scope.row" v-show="scope.row.uploadState!=='success'"></progress-bar>
                            <div style="height: 100%;display: flex;align-items: center;padding-left: 12px;" v-show="scope.row.uploadState==='success'">完成</div>
                          </div>
                        </template>
                      </el-table-column>
                      <el-table-column label="操作" prop="size" width="120" inline-template v-if="activeTab.toLocaleString() === '2'">
                      <span>
                        <el-tooltip content="重新上传" class="item" placement="top" v-if="row.isPass">
                          <el-button icon="h-icon-upload" type="default" @click="reload(row)"></el-button>
                        </el-tooltip>
                        <el-tooltip content="删除" class="item" placement="top">
                          <el-button icon="h-icon-delete" type="default" @click="del(row)"></el-button>
                        </el-tooltip>
                      </span>
                      </el-table-column>
                    </el-table>
                    <div class="empty-warp" v-else>
                      <div class="inner">
                        <div class="imgwarp"></div>
                        <span class="txt">暂无文件上传</span>
                      </div>
                    </div>
                  </div>
                  <div class="list-part-tips">请您务必确保对您上传的内容已拥有或取得必须的权利（包括但不限于：所有权或已取得必要的许可、授权、准许使用所有与上传信息有关的所有专利、商标、商业秘密、著作权及其他相关权利），否则所有的法律责任与后果由您自行承担，且我们保留向您提出索赔的权利。</div>
                </div>
              </div>
            </div>
          </div>
        </h-page-content>
      </h-page-container>
    </h-page>
  </el-dialog>
</template>
<script>
import { v1 as uuidv1 } from 'uuid'
import fileDrop from './filedrop/filedrop'
import progressBar from './progress'
import { saveImgAPI, getOSSOptionAPI } from '@/api/layout.js'
import { uploadFiles, uploadFile } from './util'

export default {
  name: 'materialUpload',
  components: { fileDrop, progressBar },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    getOSSAPI: {
      type: Object,
      default: () => {
        return {
        }
      }
    },
    saveImg: {
      type: Object,
      default: () => {
        return {
        }
      }
    },
    imageLibraryId: {
      type: String,
      default: ''
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
  watch: {
    visible(val) {
      if (!val) {
        this.fileList = []
        this.activeTab = '1'
        this.$refs.fileDrop.reset()
      }
    }
  },
  computed: {
    reloadRows () {
      return this.fileList.filter(f => {
        return f.uploadState === 'error' || f.message === '网络异常'
      })
    },
    errorRows () {
      return this.fileList.filter(f => {
        return ['error'].includes(f.uploadState)
      })
    },
    labelmap () {
      const runrows = this.fileList.filter(f => { return ['wait', 'runing'].includes(f.uploadState) })
      const failrows = this.fileList.filter(f => { return ['error'].includes(f.uploadState) })
      const successrows = this.fileList.filter(f => { return ['success'].includes(f.uploadState) })
      return {
        run: `正在上传(${runrows.length})`,
        fail: `上传失败(${failrows.length})`,
        success: `上传成功(${successrows.length})`,
      }
    },
    rows () { // 素材数据
      return this.fileList.filter(f => {
        if (this.activeTab === '1') {
          return !['success', 'error', 'delete'].includes(f.uploadState)
        } else if (this.activeTab === '2') {
          return f.uploadState === 'error'
        } else if (this.activeTab === '3') {
          return f.uploadState === 'success'
        }
      })
    },
    // 是否正在上传
    isruning () {
      const runrows = this.fileList.filter(f => { return ['wait', 'runing'].includes(f.uploadState) }) || []
      const rowlen = runrows.length || 0
      window.onbeforeunload = rowlen ? () => { return '' } : null
      return !!runrows.length
    },
    runingState () {
      const runrows = this.fileList.filter(f => { return ['runing'].includes(f.uploadState) }) || []
      const rowlen = runrows.length || 0
      window.onbeforeunload = rowlen ? () => { return '' } : null
      return !!runrows.length
    }
  },
  data () {
    return {
      uploadType: 1, // 上传类型 1 图片
      activeTab: '1', // 正在上传 1 上传失败2
      endpoint: '',
      domain: '',
      fileList: [],
    }
  },
  methods: {
    // 全部重新上传
    async reloadAll () {
      this.fileList.forEach(async(r) => r.checkRes = await this.$refs.fileDrop.fileCheckSingle(r.file, this.uploadType))
      this.$confirm('确定要全部重新上传？',{
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'question'
      }).then(async () => {
        try {
          const targetarr = this.fileList.filter(r => (!r.checkRes && (r.uploadState === 'error' || r.message === '网络异常')))
          targetarr.forEach(r => {
            r.uploadState = 'wait'
            delete r.message
          })
          // 上传图片到OSS
          this.activeTab = '1'
          await uploadFiles(targetarr, async (res) => {
            this.saveMaterial(res)
          })
        } catch (e) {
          this.$message.error('上传失败')
          this.$refs.fileDrop.reset()
        }
      }).catch(r => {})
    },
    // 一键清除
    delAll () {
      this.$confirm('确定要一键清空吗？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'question'
      }).then(async () => {
        const errList = this.fileList.filter(r => r.uploadState === 'error')
        errList.forEach(row => {
          const idx = this.fileList.findIndex(r => r.uid === row.uid)
          this.fileList.splice(idx, 1)
        })
      }).catch(r => {})
    },
    // 监听文件选中事件
    async onFiles (files) {
      if (!files.length) return
      this.fileList = files
      this.activeTab = '1'
      try {
        const targetarr = this.fileList.filter(r => r.uploadState !== 'error')
        // 上传图片到OSS
        uploadFiles(targetarr, async (res) => {
          this.saveMaterial(res)
        }).then(r => {})
      } catch (e) {
        this.$message.error('上传失败')
        this.$refs.fileDrop.reset()
      }
    },
    // 保存素材
    async saveMaterial (res) {
      try {
        let imgUrl = res.res.url
        let paramsData = {
          id: '',
          imageLibraryId: this.imageLibraryId,
          name: res.name,
          picSize: res.file.size || 0,
          points: null,
          picUrl: imgUrl
        }
        let selfProxyObj = { ...this.saveImg, params: paramsData }
        saveImgAPI(selfProxyObj).then(({ code, data, message }) => {
          if (+code === 0) {
          } else {
            this.fileList.forEach(f => {
              if (paramsData.name === f.name) {
                f.uploadState = 'error'
                f.isPass = false
                f.message = message
              }
            })
          }
        }).catch(e => {
          this.fileList.forEach(f => {
            if (paramsData.name === f.name) {
              f.uploadState = 'error'
              f.message = '网络异常'
            }
          })
        })
      } catch (e) {}
    },
    // 重新上传素材
    async reload (row) {
      try {
        this.activeTab = '1'
        uploadFile(row).then((res) => {
          this.activeTab = '2'
          row.uploadState = 'success'
          this.saveMaterial(res)
        })
      } catch (e) {}
    },
    // 删除待上传素材
    async del (row) {
      const idx = this.fileList.findIndex(r => r.uid === row.uid)
      this.fileList.splice(idx, 1)
    },
    // 单元格样式
    cellClassName (obj) {
      if (obj.columnIndex === 3) {
        return 'progressStyle'
      }
    },
    close () {
      if (this.isruning) {
        this.$message.warning('有图片上传中，请勿关闭~')
        return false
      }
      this.$emit('update:visible', false)
      this.$emit('flash')
    },
  }
}
</script>
<style lang="scss" scoped>
  @import "./style";
</style>