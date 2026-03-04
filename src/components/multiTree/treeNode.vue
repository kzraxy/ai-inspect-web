<template>
  <span>
    <template v-if="treedata.sig&&treedata.sig==='load'">
      <el-button type="iconButton" :loading="true">加载中</el-button>
    </template>
    <template v-else>
      <span :title="treenode.label">{{treenode.label}}</span>
    </template>
  </span>
</template>
<script>
import { getPublishTreeData } from '@/api/index'
import { v1 as uuidv1 } from 'uuid'
export default {
  components: {
  },
  props: {
    treenode: Object,
    treedata: {
      type: Object,
      default: () => {
        return {
          nodeId: '',
          nodeName: '',
          parentId: '',
          nodeType: 0
        }
      }
    },
    treestore: Object
  },
  mounted () {
    if (this.treedata.nodeType === 0) {
      this.treenode.isLeaf = false
      this.treenode.expanded = (this.treenode.childNodes.length !== 0)
    }
  },
  watch: {
    'treenode.expanded' (val) {
      if (val && this.treedata.nodeType === 0 && this.treenode.childNodes.length === 0) {
        if (!this.treedata.subAreas) { this.treedata.subAreas = [] }
        this.treedata.subAreas.push({
          nodeId: uuidv1(),
          nodeName: 'loading...',
          sig: 'load',
          nodeType: 0
        })
        this.treenode.updateChildren()
        getPublishTreeData({ parentId: this.treedata.nodeId, groupType: this.treedata.groupType }).then(res => {
          if (res.code * 1 === 0) {
            const rows = res.data || []
            rows.forEach(_ => {
              _.nodeId = _.groupId,
              _.nodeName = _.groupName,
              _.nodeType = _.groupType
            })
            for (let i = 0; i < rows.length; i++) {
              if (rows[i].nodeType === 0) {
                rows[i].forbidden = true
                rows[i].showCheckbox = false
              } // 表示为区域
              if (rows[i].nodeType === 1) { // 叶子节点禁止点击
                rows[i].selectable = false
                rows[i].showCheckbox = true
              }
            }
            this.treedata.subAreas = rows
            this.treenode.updateChildren()
          }
        })
      }
    }
  },
  data () { return {} }
}
</script>
