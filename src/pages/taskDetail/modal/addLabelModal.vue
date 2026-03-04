<template>
  <div class="modal-add-label">
    <el-dialog title="添加筛选条件" :visible="visible" @close="close" custom-class="modal-add-label" :area="[480,280]">
       <el-scrollbar wrap-class="modal-label-scrollbar__wrap">
         <ul class="add_label_modal clearfloat" v-if="labelInfoList.length > 0">
            <li v-for="(item,index) in labelInfoList" :key="index" v-show="item.oppositeLabel" @click="selectLabelItem(item)" :class="{'active': item.visible}">
              {{item.labelName}}
            </li>
          </ul>
          <div v-else class="add_label_modal" style="margin-top:35px;text-align: center;">暂无数据</div>
       </el-scrollbar>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="save">确认</el-button>
        <el-button @click="close">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { addLabel } from '../proxy'
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    labelInfo: {
      type: Array,
      default: () => {
        return []
      }
    },
    taskId: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      labelInfoList: [], // 全部标签集合，来源父组件
      selectedLabel: []// 选中的标签
    }
  },
  watch: {
    visible (val) {
      if (val) {
        this.labelInfoList = this.labelInfo
      }
    }
  },
  methods: {
    // 选择label标签
    selectLabelItem (row) {
      this.labelInfoList.forEach(item => {
        if (item.labelId === row.labelId) {
          item.visible = !item.visible
        }
      })
    },
    save () {
      let params = { labelVisible: this.labelInfoList, taskId: this.taskId }

      addLabel(params).then((res) => {
        if (+res.code === 0) {
          this.$message.success('设置成功')
          this.$emit('flash')
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
  @import "../style.scss";
</style>

<style lang="scss">
  .modal-add-label{
    .el-dialog__body-wrapper{
      padding-bottom:0
    }
  }
</style>
