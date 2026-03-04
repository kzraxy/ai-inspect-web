<template>
  <div class="modal-edit-group">
    <el-dialog title='编辑算法识别能力' :visible="visible" @close="close" custom-class="modal-edit-group-dialog" :close-on-click-modal="false" :area="[580,450]">
      <el-form ref="groupForm" :model="formData" label-width="80px">
        <el-form-item label="算法名称" prop="modelName">{{formData.modelName}}</el-form-item>
        <el-form-item label="算法版本" prop="version">{{formData.version}}</el-form-item>
        <el-form-item label="算法类型" prop="modelType">{{formData.modelTypeName}}</el-form-item>
        <el-form-item label="应用类型" prop="platform">{{formData.platform}}</el-form-item>
      </el-form>
      <div class="table-model">
        <div class="table-out-label">识别能力</div>
        <el-table force-scroll :data="tableData" border show-overflow-title>
          <el-table-column prop="labelId" label="序号" width="50">
            <template slot-scope="scope">
              {{scope.$index + 1}}
            </template>
          </el-table-column>
          <el-table-column prop="labelName" label="标签名称" width="100" show-overflow-tooltip></el-table-column>
          <el-table-column prop="labelAlias" label="显示名称" width="100">
            <template slot-scope="scope">
              <el-input v-model="scope.row.labelAlias" :maxlength="16" :title=scope.row.labelAlias clearable></el-input>
            </template>
          </el-table-column>
          <el-table-column label="展示框" width="100" v-if="this.editTagInfo.versionType !== 'SEMANTIC_SEG'">
            <template slot-scope="scope" prop="labelColor">
              <el-select v-model="scope.row.labelColor" style="width: 100%">
                <el-option label="红色" value="red"></el-option>
                <el-option label="绿色" value="green"></el-option>
              </el-select>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="save">保 存</el-button>
        <el-button @click="close">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { editAlgorithmsModels } from '../proxy'
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    editTagInfo: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      tableData: [],
      formData: {
        trainId: '',
        modelName: '',
        version: '',
        modelTypeName: '',
        platform: '',
      }
    }
  },
  watch: {
    visible (val) {
      if (val) {
        this.getEditInfo()// 获取编辑的信息
      } else { // 关框清空数据
        this.$refs.groupForm.resetFields()
        this.formData.trainId = ''
      }
    }
  },
  methods: {
    getEditInfo () {
      this.formData.trainId = this.editTagInfo.trainId
      this.formData.modelName = this.editTagInfo.modelName
      this.formData.version = this.editTagInfo.version
      this.formData.modelTypeName = this.editTagInfo.modelTypeName
      this.formData.platform = this.editTagInfo.platform.includes('CLOUD') ? '云服务-在线验证' : this.editTagInfo.platform.includes('DCT4') ? '云服务-云眸' : this.editTagInfo.platform
      this.tableData = this.editTagInfo.labelInfos
      this.tableData.forEach(item => {
        if (!item.labelColor) {
          item.labelColor = 'green'
        }
      })
    },
    save () {
      let labelInfos = JSON.parse(JSON.stringify(this.tableData))
      this.$refs.groupForm.validate((valid) => {
        if (valid) {
          let reg = new RegExp("[`!%$^&*=|{}':;',/?！￥……&*;———|{}‘；：”“'。，？\\\\]+")
          let labelAliasNameFlag = true// 判断列表标签的显示名称是否都填写了
          let labelColorFlag = true// 判断列表标签的颜色是否都选择了
          let labelSpecilFlag = true// 判断列表标签的显示名称是否有特殊字符
          labelInfos.map(item => {
            item.labelAlias = item.labelAlias.trim()
            if (!item.labelAlias) {
              labelAliasNameFlag = false
            }
          })
          labelInfos.map(item => {
            if (!item.labelColor) {
              labelColorFlag = false
            }
          })
          labelInfos.map(item => {
            if (reg.test(item.labelAlias)) {
              labelSpecilFlag = false
            }
          })
          if (!labelAliasNameFlag) {
            this.$message.info('请填写模型标签的显示名称')
            return false
          } else if (!labelColorFlag) {
            this.$message.info('请选择模型标签展示框的颜色')
            return false
          } else if (!labelSpecilFlag) {
            this.$message.info('模型标签的显示名称不能包含. 、-_[]【】()（）#@~<>以外的特殊字符')
            return false
          }
          editAlgorithmsModels({ labelInfos: { 'labelInfos': labelInfos }, trainId: this.formData.trainId }).then((res) => {
            if (+res.code === 0) {
              this.$message.success('修改成功')
              this.$emit('flash')
              this.close()
            }
          })
        } else {
          return false
        }
      })
    },
    close () {
      this.$emit('flash')
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="scss">
.modal-edit-group-dialog.el-dialog {
  .el-dialog__body-wrapper{
    padding: 0
  }
  .el-form-item{
    margin-bottom: 10px;
  }
  .el-form-item__content{
    text-align: left
  }
  .table-out-label{
    width: 85px;
    padding-left: 8px;
    font-size: 12px;
    height: 44px;
    line-height: 34px
  }
  .table-model{
    display: flex;
    width: 530px;
    .layout-table-pagination{
      width:293px
    }
  }
  .table-up{
    padding-right: 85px;
    .el-form-item{
      margin-bottom: 8px
    }
  }
  .el-dialog__body-wrapper {
    padding-right: 20px;
    padding-left: 20px;
    padding-top: 35px;
  }
  .table-action {
    width: 100%;
    padding: 5px 0;
    .content-left {
      float: left;
    }
    .content-right {
      float: right;
    }
    &::after {
      content: '';
      display: block;
      clear: both;
    }
  }
}
</style>
