<template>
  <div class="markTargetMissModall">
    <el-dialog title='漏报反馈' :visible="visible" @close="close" :close-on-click-modal="false" :area="[450,450]">
      <!-- <el-table force-scroll :data="tableData" @selection-change="tableSelect" ref="multipleTable"> -->
      <el-table force-scroll :data="tableData" ref="multipleTable">
        <!-- <el-table-column type="selection"></el-table-column> -->
        <el-table-column prop="labelName" label="标签名称"></el-table-column>
        <el-table-column prop="missNum" label="漏报目标数量" >
          <template slot-scope="scope">
            <el-input-number v-model="scope.row.missNum" :max="99999" :min="0"></el-input-number>
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="save">确 定</el-button>
        <el-button @click="close">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { markTargetMiss, getMiss } from '../proxy'
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    tagsList: {
      type: Array,
      default: () => []
    },
    rowKey: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      tableData: [],
      tableSelData: [],
    }
  },
  watch: {
    async visible (val) {
      if (val) {
        this.getTagsList()
        this.tableRenderSelection()
      } else {
        this.tableSelData = []
      }
    }
  },
  methods: {
    tableRenderSelection() {
      getMiss({rowKey: this.rowKey}).then(res => {
        if (res.code === 0) {
          this.$nextTick(() => {
            res.data.forEach(item => {
              let rowIndex = this.tableData.findIndex(_ => _.labelLineId === item.labelLineId)
              if (rowIndex > -1) {
                this.tableData[rowIndex].missNum = item.missNum
              }
            })
          })
        }
      })
    },
    tableSelect (val) {
      this.tableSelData = val
    },
    getTagsList () {
      if (this.tagsList && this.tagsList.length) {
        let arr = this.tagsList.filter(_ => !_.oppositeLabel)
        this.tableData = arr.map(item => {
          return {
            missNum: 0,
            labelLineId: item.labelId,
            labelId: item.labelId,
            labelName: item.labelName,
          }
        })
      }
    },
    save () {
      markTargetMiss({rowKey: this.rowKey, labelLists: this.tableData }).then((res) => {
        if (+res.code === 0) {
          this.$message.success('操作成功！')
          this.$emit('finisMark')
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
</style>
