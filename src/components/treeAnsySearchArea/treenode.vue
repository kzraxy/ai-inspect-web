<template>
  <span class="nodetree">
    <span class="normal-node">
      <template v-if="treedata.sig&&treedata.sig==='load'">
        <el-button type="iconButton" :loading="true">加载中</el-button>
      </template>
      <template v-else>
        <overflow :placement="placement" :title="treenode.label" :length="10"></overflow>
      </template>
    </span>
  </span>
</template>
<script>
  import { getAreaTree } from './proxy'
  import overflow from '@/components/overflow/index'
  import { v1 as uuidv1 } from 'uuid'
  export default {
    components: {
      overflow
    },
    props: {
      treenode: Object,
      treedata: {
        type: Object,
        default: {
          nodeId: '',
          nodeName: '',
          parentId: '',
          nodeType: 0
        }
      },
      treestore: Object,
      needStore: {
        type: Boolean,
        default: false,
      },
      taskDeliverUser: {
        type: String,
        default: '',
      },
    },
    mounted () {
      if (this.treedata.nodeType === 0) {
        this.treenode.isLeaf = false
        this.treenode.expanded = (this.treenode.childNodes.length !== 0)
      }
    },
    watch: {
      'treenode.expanded' (val) {
        if (
          val &&
          this.treedata.nodeType === 0 &&
          this.treenode.childNodes.length === 0
        ) {
          if (!this.treedata.subAreas) {
            this.treedata.subAreas = []
          }
          this.treedata.subAreas.push({
            nodeId: uuidv1(),
            nodeName: 'loading...',
            sig: 'load',
            nodeType: 0
          })
          this.treenode.updateChildren()
          // 根据父节点传来的参数调用不同的接口
          getAreaTree({ nodeId: this.treedata.nodeId, needStore: this.needStore ,taskDeliverUser: this.taskDeliverUser}).then(res => {
            if (res.code * 1 === 0) {
              res.data.forEach((item) => {
                item.icon = item.nodeType ? 'iconfont iconic_store' : 'iconfont iconic_tree_place'
              })
              this.treedata.subAreas = res.data || []
              this.treenode.updateChildren()
            }
          })
        }
      }
    },
    data () {
      return {
        placement: 'right'
      }
    }
  }
</script>
<style lang="scss" scoped>
  .nodetree {
    flex: 1 0 auto;
  }
  .normal-node {
    margin-right: 10px;
    display: inline-block;
    line-height: 16px;
  }
  .tree-action {
    margin: 0 20px 0 20px;
    opacity: 0;
    align-items: center;
    &>span {
      margin-left: 5px;
      &:hover {
        color: #4a94fe;
      }
    }
  }
  .tree-action:hover {
    opacity: 1;
  }
  .input-node {
    width: 120px;
  }
</style>
