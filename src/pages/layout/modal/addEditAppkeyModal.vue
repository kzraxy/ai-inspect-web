<template>
  <div class="addedit-appkey-modal">
    <el-dialog title="配置训练平台账号" :visible="visible" @close="close" :area="[560,340]" :close-on-click-modal=false>
      <!-- <el-alert title="配置账号后，系统将同步该账号下已完成发布的算法模型列表。同步完成后，您即可在云眸智能分析应用中使用这些算法模型。" -->
      <el-alert :title="`配置账号后，系统将同步该账号下已完成发布的算法模型列表。同步完成后，您即可在${title}智能分析应用中使用这些算法模型。`"
       type="info" simple show-icon :closable=false class="appkey_alert"></el-alert>
      <el-form ref="accountForm" :model="accountForm" label-width="100px" :rules="rules" style="margin-top: 20px;" >
        <el-form-item label="appKey" prop="appKey" :required-right="false">
          <el-input v-model="accountForm.appKey" placeholder="请输入APPKEY" :maxlength="32" style="width: 220px;" :disabled="editAppkeyFlag"></el-input>
        </el-form-item>
        <el-form-item label="appSecret" prop="appSecret" :required-right="false">
          <el-input v-model="accountForm.appSecret" placeholder="请输入SECRET" :maxlength="32" style="width: 220px;" :disabled="editAppkeyFlag"></el-input>
        </el-form-item>
      </el-form>
      <!-- <div class="get_appky_tips">如何获取？登录<a href="https://es.ys7.com/aiconsole" target="_blank" style="color:#2080f7;margin-left:5px;margin-right:5px">https://es.ys7.com/aiconsole</a>点击右上角“用户信息”模块，可获取AppKey和Secret。</div> -->
      <div class="get_appky_tips">如何获取？登录<a href="https://ai.hikvision.com/intellisense/ai-training/" target="_blank" style="color:#2080f7;margin-left:5px;margin-right:5px">https://ai.hikvision.com/intellisense/ai-training/</a>，首先点击“前往训练平台”，进入后打开右上角“用户信息”模块，可获取AppKey和Secret。</div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cleanAccount" :disabled="!this.accountId">重置</el-button>
        <el-button type="primary" @click="save" :disabled="editAppkeyFlag">保存</el-button>
        <el-button @click="close">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { synchronousModel, addAccount, editAccount, deleteAccount } from '@/api/layout'
import { checkSomeSpecial } from '@/assets/libs/util'
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    accountId: {
      type: String,
      default: ''
    },
    accountInfo: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      accountForm: {
        appKey: '',
        appSecret: ''
      },
      editAppkeyFlag: false,
      accountInfoSelf: {},
      rules: {
        appKey: [
          { required: true, message: '请输入APPKEY', trigger: 'blur' },
          { validator: (rule, value, callback) => checkSomeSpecial(rule, value, callback), trigger: 'blur' }
        ],
        appSecret: [
          { required: true, message: '请输入SECRET', trigger: 'blur' },
          { validator: (rule, value, callback) => checkSomeSpecial(rule, value, callback), trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    title () {
      return window.location.href.indexOf('hilaicloud.com') > -1 ? '' : '云眸'
    }
  },
  watch: {
    visible (val) {
      if (val) {
        this.accountForm.appKey = ''
        this.accountForm.appSecret = ''
        this.accountInfoSelf = JSON.parse(JSON.stringify(this.accountInfo))
        if (this.accountId) { // 该用户配置过平台账号，编辑状态
          this.accountForm.appKey = this.accountInfoSelf.appKey
          this.accountForm.appSecret = this.accountInfoSelf.appSecret
          this.editAppkeyFlag = true
        } else { // 该用户配置过平台账号，添加状态
          this.editAppkeyFlag = false
        }
      } else {
        this.editAppkeyFlag = false
      }
    }
  },
  methods: {
    // 重置平台账号
    cleanAccount () {
      // this.$refs.accountForm.validate(valid => {
      //   if (valid) {
          // this.$confirm('重置账号将清空所有模型。', '是否重置账号？', {
          //   confirmButtonText: '重置',
          //   cancelButtonText: '取消',
          //   type: 'question'
          // })
          this.$confirm('重置账号将清空所有模型。是否重置账号？', {
            confirmButtonText: '重置',
            cancelButtonText: '取消',
            type: 'question'
          }).then(() => {
            deleteAccount(this.accountId).then((res) => {
              if (+res.code === 0) {
                this.$message.success('重置成功！')
                // this.$emit('flashTable')
                // this.$emit('flashAccount')
                this.$store.commit('SET_RESET_ACCOUNT', true)
                this.close()
                // this.synchronousModel()// 重置平台账号后同步模型
              }
            })
          }).catch(() => {})
      //   }
      // })
    },
    // 保存平台账号
    save () {
      this.$refs.accountForm.validate(valid => {
        if (valid) {
          this.accountForm.accountId = this.accountId
          if (!this.accountId) {
            addAccount(this.accountForm).then((res) => {
              if (+res.code === 0) {
                this.accountId = res.data.accountId
                this.synchronousModel()// 保存平台账号后同步模型
              }
            })
          } else {
            editAccount(this.accountForm).then((res) => {
              if (+res.code === 0) {
                this.synchronousModel()// 保存平台账号后同步模型
              }
            })
          }
        }
      })
    },
    synchronousModel () {
      synchronousModel({ id: this.accountId }).then((res) => {
        if (+res.code === 0) {
          this.$message.success('账号配置完成，模型同步中，请稍后刷新页面查看。')
          this.$emit('flashTable')
          this.$emit('flashAccount')
          this.close()
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
.get_appky_tips{
  text-align: left;
  font-size: 12px;
  padding-left: 20px;
  font-style: italic
}
</style>
<style lang="scss">
 .addedit-appkey-modal{
   .el-form-item__content{
     text-align: left!important;
   }
   .el-dialog__body-wrapper{
    padding-bottom:0;
    padding-top:10px;
  }
  .appkey_alert{
    margin-bottom: 20px;
    .el-alert__content{
      text-align: left
    }
  }
 }
</style>
