<template>
  <svg :class="svgClass" aria-hidden="true" :style="{width:fontSize,height:fontSize,minWidth:fontSize}">
    <title>{{title}}</title>
    <use :xlink:href="iconName"></use>
  </svg>
</template>

<script>
export default {
  name: 'svg-icon',
  props: {
    iconClass: {
      type: String,
      required: true
    },
    className: {
      type: String
    },
    fontSize: {
      type: String,
      default: '20px'
    },
    title: {
      type: String,
      default: ''
    }
  },
  computed: {
    iconName () {
      return `#icon-${this.iconClass}`
    },
    svgClass () {
      if (this.className) {
        return `svg-icon ${this.className}`
      }
      return 'svg-icon'
    }
  }
}
</script>

<style scoped>
.svg-icon {
  width: 20px;
  height: 20px;
  vertical-align: -0.2em;
  fill: currentColor;
  overflow: hidden;
}
</style>
