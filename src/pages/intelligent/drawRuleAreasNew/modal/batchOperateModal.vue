<template>
  <el-dialog title="批量操作" :visible="visible" @close="close" :area="500" :close-on-click-model=false>
    <el-form ref="form" :model="form" :rules="rules" style="margin: 20px auto 0;" label-position="right" label-width="90px" content-width="320px">
      <div class="add_item">
        <el-form-item label="关联类型" required>
          <el-radio-group v-model="form.connectType">
            <el-radio label="CONNECT">关联标签</el-radio>
            <el-radio label="PRIVATE">私有区域</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="标签" prop="connectAreaLabelIds" v-if="form.connectType==='CONNECT'">
          <el-select v-model="form.connectAreaLabelIds" placeholder="请选择" filterable :multiple="ruleSearchMultiLabelSelect">
            <el-option v-for="(item,index) in areaLabelList" :key="index" :label="item.labelName" :value="item.labelId"></el-option>
          </el-select>
        </el-form-item>
      </div>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="save">确定</el-button>
      <el-button @click="close">取消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getOnlyLabelList } from '../../proxy'
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    ruleSearchMultiLabelSelect: {
      type: Boolean,
      default: false
    },
    ruleId: {
      type: String,
      default: ''
    },
  },
  data () {
    let checkConnectAreaLabelIds = (rule, value, callback) => {
      if (this.ruleSearchMultiLabelSelect && (!value || !value.length)) {
        callback(new Error('请选择标签'))
      } else if (!this.ruleSearchMultiLabelSelect && !value) {
        callback(new Error('请选择标签'))
      } else {
        callback()
      }
    }
    return {
      form: {
        connectType:'CONNECT',
        connectAreaLabelIds:[],
      },
      areaLabelList: [],
      rules: {
        connectAreaLabelIds: [{ required: true, validator:checkConnectAreaLabelIds, trigger: 'change' }]
      }
    }
  },
  watch: {
    visible (val) {
      if (val) {
        this.getOnlyLabelList()
      } else {
        this.$refs['form'].resetFields()
        this.form = {
          connectType:'CONNECT',
          connectAreaLabelIds:[],
        }
      }
    }
  },
  methods: {
    getOnlyLabelList() {
      getOnlyLabelList({ ruleId: this.ruleId }).then(res => {
        if (res.code === 0) {
          this.areaLabelList = res.data || []
        }
      })
    },
    save () {
      this.$refs['form'].validate(async (valid) => {
        if (valid) {
          this.$emit('batchFinish', this.form)
        }
      })
    },
    close () {
      this.$emit('update:visible', false)
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
