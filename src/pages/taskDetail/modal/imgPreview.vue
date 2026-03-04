<template>
  <selfImgPreview ref="dark" :visible.sync="dark" :data="albumData" :currentIndex="currentIndex" show-album @on-change="change"></selfImgPreview>
</template>

<script>
import selfImgPreview from '@/components/huiComponents/img-preview/img-preview'
export default {
  components: {
    selfImgPreview
  },
  props: {
    albumData: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      currentIndex: 0,
      dark: false,
      ref: null
    }
  },
  methods: {
    change (e) {
      let index = this.albumData.indexOf(e)
      this.$emit('changeImgPreview', index)
      this.currentIndex = index
    },
    preview (ref, index) {
      this.ref = ref
      this[ref] = true
      this.currentIndex = index
    },
    selected (index) {
      this.$refs[this.ref].$selected(index)
    },
    handleOnChange (item, index) {
      this.reset()
    },
    reset () {
      this.$refs[this.ref].$resetImgView()
    },
    close () {
      if (this.ref) {
        this.currentIndex = 0
        this.selected(0)
        this.$refs[this.ref].selfClose()
      }
    }
  }
}
</script>
