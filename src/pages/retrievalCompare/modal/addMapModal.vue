<template>
  <el-dialog title="添加图库" :visible="visible" @close="close" :area="[520,250]" :close-on-click-model=false>
    <el-form ref="form" :model="form" :rules="rules" style="margin: 40px auto 0;" label-position="right" label-width="90px" content-width="380px">
      <el-form-item label="图库名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入图库名称" :maxlength="32" clearable></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="save">确定</el-button>
      <el-button @click="close">取消</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { modifyImageLibrary } from '../proxy'
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    libraryType: {
      type: String,
      default: 'EDGE'
    }
  },
  data () {
    return {
      form: {
        name: '',
      },
      rules: {
        name: [{ required: true, message:'请输入图库名称', trigger: 'blur' }]
      }
    }
  },
  watch: {
    visible (val) {
      if (!val) {
        this.$refs['form'].resetFields()
      } else {
        this.form = {
          name: '',
        }
      }
    }
  },
  methods: {
    save () {
      this.$refs['form'].validate(async (valid) => {
        if (valid) {
          modifyImageLibrary({...this.form, libraryType: this.libraryType}).then(res => {
            if (res.code === 0) {
              this.$emit('addMapSuccess', res.data)
              this.$emit('refresh')
              this.close()
            }
          })
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
