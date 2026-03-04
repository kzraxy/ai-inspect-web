<template>
  <div v-loading="loading"></div>
</template>

<script>
export default {
  data () {
    return {
      loading: false
    }
  },
  async mounted () {
    this.loading = true
    try {
      this.$router.push({ path: `/intelligent/modelPool/${this.serviceType}` })
      setTimeout(() => { this.loading = false }, 1000)
    } catch (e) { this.loading = false }
  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>
</style>
