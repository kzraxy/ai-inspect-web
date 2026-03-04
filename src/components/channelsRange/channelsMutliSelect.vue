<template>
  <div>
    <mutli-select-single 
      ref="mutliSelectSingle" 
      class="scope-range-mutli-select" 
      :options="{
        id: 'channelId',
        name: 'channelName',
      }"
      :select-list="selectList"
      text-placeholder="全部通道"
      closable
      @openDialog ="openDialog"
      @delete="deleteItem"
      @deleteAll ="deleteAllItem"
      
      ></mutli-select-single>
    <channelsChooseDialog
      ref="channelsChooseDialog"
      :multiple-limit="multipleLimit"
      :title="dialogTitle"
      @saved="onRangeChooseSave"
      :taskId="taskId"
    ></channelsChooseDialog>
  </div>
</template>

<script>
  import mutliSelectSingle from '../mutliSelectSingle.vue'
  import channelsChooseDialog from './channelsChooseDialog.vue'
  export default {
    name: 'OrangizationMutliSelect',
    components: {
      mutliSelectSingle,
      channelsChooseDialog
    },
    props: {
       dialogTitle: {
        type: String,
        default:''
      },
      value: {
        type: Array,
        default() {
          return []
        }
      },
      multipleLimit: {
        type: Number,
        default: 20
      },
      taskId: {
        type: String,
        default:''
      }
    },
    data() {
      return {
        selectList:[]
      }
    },
    watch: {
      value : {
        immediate: true,
        handler (val){
          this.$nextTick(()=>{
              this.selectList = val
              this.$nextTick(() => {
                this.$refs.mutliSelectSingle.set(this.selectList)
              })
          })
        }
      },
    },
    created () {
    },
    mounted () {
       this.$refs.mutliSelectSingle.set(this.selectList)
    },
    methods: {
      onRangeChooseSave (data) {
        this.selectList = data || []
        this.$refs.mutliSelectSingle.set(this.selectList)
        this.$emit('change', this.selectList )
      },
      openDialog () {
        this.$refs.channelsChooseDialog.open(this.selectList)
      },
      
      deleteItem () {
        this.selectList.shift()
        this.$refs.mutliSelectSingle.set(this.selectList)
        this.$emit('change', this.selectList )
      },
      deleteAllItem () {
        this.selectList = []
        this.$refs.mutliSelectSingle.set([])
        this.$emit('change', this.selectList )
      },
   },
  }
</script>
