<template>
  <el-dialog title="QPS参数配置" :visible="visible" @close="close" :area="[560,300]" :close-on-click-model=false>
    <!-- <el-alert title="高精度/双检测模型扣除双倍授权；观澜大模型扣除三倍授权" type="info" simple show-icon :closable="false"></el-alert> -->
    <div class="tips">{{`当前剩余QPS：${+surplusQPS}`}}</div>
    <el-form ref="form" :model="form" :rules="rules" style="margin: 20px auto 0;width:480px" >
      <el-form-item label="QPS数值" prop="qps">
        <el-input v-model="form.qps" placeholder="请输入" :maxlength="10" type="number" clearable></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="save">确定</el-button>
      <el-button @click="close">取消</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { setQPS } from '@/api/cloudDeployment'
import { getServiceManageInfo } from '@/api/serviceManage'
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    resourceId: {
      type: String,
      default: ''
    }
  },
  data () {
    let qpsValid = (rule, value, callback) => {
      let pattern = /^[0-9]{0,32}$/
      if (!value) {
        callback(new Error('请输入QPS数值'))
      } else if (!pattern.test(value)) {
        callback(new Error('请输入不小于0的整数'))
      } else {
        callback()
      }
    }
    return {
      surplusQPS: 0, // QPS剩余量
      form: {
        qps: ''
      },
      rules: {
        qps: [{ required: true, validator: qpsValid, trigger: 'blur' }]
      }
    }
  },
  watch: {
    visible (val) {
      if (!val) {
        this.form.qps = ''
        this.$refs['form'].resetFields()
      } else {
        this.getQPS()
      }
    }
  },
  methods: {
    async getQPS () {
      let { data } = await getServiceManageInfo()
      let qpsArr = data.rows.filter(item => item.authCode === 31057)
      this.surplusQPS = (qpsArr.length > 0) ? (qpsArr[0].authAmount - qpsArr[0].usedAmount) : 0
    },
    save () {
      this.$refs['form'].validate(async (valid) => {
        if (valid) {
          let { code } = await setQPS({ resourceId: this.resourceId, ...this.form })
          if (code === 0) {
            this.$message({
              message: '配置成功',
              type: 'success'
            })
            this.$emit('refresh')
            this.close()
          }
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
.tips{
  font-family: MicrosoftYaHeiUISemibold;
  font-size: 16px;
  color: rgba(0,0,0,0.90);
  font-weight: 600;
  margin-top: 18px;
  margin-left: 28px;
}
</style>
