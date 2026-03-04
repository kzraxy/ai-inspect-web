<template>
  <el-dialog title="添加分类" :visible="visible" @close="close" :area="[520,250]" :close-on-click-model=false>
    <el-form ref="form" :model="form" :rules="rules" style="margin: 40px auto 0;" label-position="right" label-width="90px" content-width="380px">
      <el-form-item label="分类名称" prop="labelClassName">
        <el-input v-model="form.labelClassName" placeholder="请输入..." :maxlength="16" clearable></el-input>
      </el-form-item>
      <!-- <el-form-item label="标签名称" item-group>
        <h-add-form-item-single v-for="(item,index) in form.tagArr" :key="index">
          <div class="add_item">
            <el-input v-model="item.tagName" placeholder="请输入..." :maxlength="16" style="width:210px" clearable></el-input>
            <el-select v-model="item.tagBelongType" style="width:100px;margin-left:4px">
              <el-option v-for="item in tagOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
            <el-popover ref="popover5" placement="top" width="180" popper-class="tag_color_popover">
              <div class="color_popover">
                <div v-for="color in colorList" :key="color" :style="{'background':color }" class="color_div" @click="chooseColor(color,item)"></div>
              </div>
              <div class="color_wrap" slot="reference"><div class="color_main" :style="{'background':item.tagColor }"></div></div>
            </el-popover>
            <el-button slot="operate" icon="h-icon-delete" @click="delSingleInput(i)"/>
          </div>
        </h-add-form-item-single>
        <h-add-form-item-btn icon="h-icon-add" @click="addSingleInput" :totalNum="30" :currentNum="form.tagArr.length">添加</h-add-form-item-btn>  
      </el-form-item> -->
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="save">确定</el-button>
      <el-button @click="close">取消</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { modifyLabelClass } from '../../proxy'
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
  },
  data () {
    return {
      form: {
        labelClassName: '',
        // tagArr: [{tagName:'',tagBelongType:'kuanxian',tagColor:'#C82727'}],
      },
      rules: {
        labelClassName: [{ required: true, message:'请输入分类名称', trigger: 'blur' }]
      }
    }
  },
  computed: {
    tagOptions() {
      return [{value: 'kuanxian', label: '跨线'}, {value: 'danquyu', label: '单区域'}, {value: 'duoquyu', label: '多区域'}]
    },
    colorList() {
      return ['#C82727', '#BE10A5', '#A10AEF', '#6045FF', '#1457FB', '#006ABA', '#007855', '#397700', '#606F00', '#FFAB00', '#FF6F00', '#FF5A00']
    }
  },
  watch: {
    visible (val) {
      if (!val) {
        this.$refs['form'].resetFields()
      } else {
        this.form = {
          labelClassName: '',
          // tagArr: [{tagName:'',tagBelongType:'kuanxian',tagColor:'#C82727'}],
        }
      }
    }
  },
  methods: {
    chooseColor(val, item) {
      item.tagColor = val
    },
    addSingleInput() {
      this.form.tagArr.push({ tagName: '', tagBelongType:'kuanxian', tagColor:'#C82727' })
    },
    delSingleInput(index) {
      this.form.tagArr.splice(index, 1)
    },
    save () {
      this.$refs['form'].validate(async (valid) => {
        if (valid) {
          modifyLabelClass(this.form).then(res => {
            if (res.code === 0) {
              this.$emit('setLabelClassFinish')
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
  align-items: center;
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
