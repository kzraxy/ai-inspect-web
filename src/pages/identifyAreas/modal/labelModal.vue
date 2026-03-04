<template>
  <el-dialog :title="isAdd?'添加标签':'编辑标签'" :visible="visible" @close="close" :area="[550,250]" :close-on-click-model=false>
    <el-form ref="form" :model="form" :rules="rules" style="margin: 40px auto 0;" label-position="right" label-width="90px" content-width="240px">
      <div class="add_item">
        <el-form-item label="标签名称" prop="labelName">
          <el-input v-model="form.labelName" placeholder="请输入..." :maxlength="16" :required-right="false" clearable></el-input>
        </el-form-item>
        <el-select v-model="form.labelType" style="width:130px;margin-left:10px" :disabled="!isAdd">
          <el-option v-for="item in tagOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <el-popover ref="popover5" placement="bottom" width="180" popper-class="tag_color_popover">
          <div class="color_popover">
            <div v-for="(item,index) in colorList" :key="index" :style="{'background':item }" class="color_div" @click="chooseColor(item)"></div>
          </div>
          <div class="color_wrap" slot="reference"><div class="color_main" :style="{'background':form.color }"></div></div>
        </el-popover>
      </div>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="save">确定</el-button>
      <el-button @click="close">取消</el-button>
    </span>
  </el-dialog>
</template>
<script>
import labelCfg from '@/components/calibrate/config/labels.js'
import { modifyLabel } from '../proxy'
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
  },
  data () {
    return {
      isAdd: false,
      form: {
        labelName:'',
        labelType:'MULTI_AREA',
        color:'#C82727'
      },
      labelClassId: '',
      rules: {
        labelName: [{ required: true, message:'请输入标签名称', trigger: 'blur' }]
      }
    }
  },
  computed: {
    tagOptions() {
      return [{value: 'CROSS_LINE', label: '跨线：设备'}, {value: 'SINGLE_AREA', label: '单区域'}, {value: 'MULTI_AREA', label: '多区域:云端'}, {value: 'SHIELD_AREA', label: '屏蔽区域：云端'}]
    },
    colorList() {
      let arr = []
      for (let key in labelCfg.LABEL_COLOR_SET) {
        arr.push(key)
      }
      return arr
      // return ['#C82727', '#BE10A5', '#A10AEF', '#6045FF', '#1457FB', '#006ABA', '#007855', '#397700', '#606F00', '#FFAB00', '#FF6F00', '#FF5A00']
    }
  },
  watch: {
    visible (val) {
      if (!val) {
        setTimeout(() => {
          this.form = {
            labelName:'',
            labelType:'MULTI_AREA',
            color:'#C82727'
          }
          this.$refs['form'].resetFields()
        }, 500)
      }
    }
  },
  methods: {
    init(item, type) {
      this.labelClassId = item.labelClassId
      this.isAdd = type
      if (!this.isAdd) { // 编辑回显
        this.form = {...item}
      }
    },
    chooseColor(item) {
      this.form.color = item
    },
    save () {
      this.$refs['form'].validate(async (valid) => {
        if (valid) {
          modifyLabel({...this.form, labelClassId: this.labelClassId}).then(res => {
            if (res.code === 0) {
              this.$emit('setLabelFinish', this.isAdd, {...this.form})
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
<style lang="scss">
.tag_color_popover{
  padding: 0;
  .color_popover{
    display: flex;
    flex-wrap: wrap;
    padding: 6px 6px;
    .color_div{
      width: 16px;
      height: 16px;
      margin: 6px;
      border-radius: 2px;
      cursor: pointer;
    }
  }
}
</style>
<style lang="scss" scoped>
.add_item{
  display: flex;
}
.color_wrap{
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(0,0,0,0.12);
  border-radius: 4px;
  margin-left: 8px;
  cursor: pointer;
  .color_main{
    width: 16px;
    height: 16px;
    border-radius: 2px;
  }
}
</style>
