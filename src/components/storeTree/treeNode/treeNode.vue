<template>
  <span class="nodetree">
      <overflow :title="treenode.label" :width="treenode.level===5?'65px':`${width-treenode.level*25}px`"></overflow>
  </span>
</template>
<script>
import overflow from '@/components/overflow/index'
export default {
  components: {
    overflow
  },
  props: {
    width: {
      type: Number,
      default: 200
    },
    treenode: Object,
    treedata: {
      type: Object,
      default: () => {
        return {
          id: '',
          name: '',
          subAreas: [],
          sig: '',
          type: ''
        }
      }
    },
    treestore: Object
  },
  data () {
    return {}
  }
}
</script>
<style lang="scss" scoped>
.nodetree {
  // flex: 1 0 auto;
  display: inline-block;
  height: 30px;
  // line-height: 28px;
}
.normal-node {
  margin-right: 10px;
  display: inline-block;
}
.tree-action {
  margin: 0 20px 0 20px;

  opacity: 0;
  align-items: center;
  & > span {
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
