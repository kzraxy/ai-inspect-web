<template>
  <div id="arch-container">
    <div class="arch-item" v-for="item in items" :key="item.id">{{ item.name }}</div>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        items: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
          { id: 3, name: 'Item 3' },
        ]
      };
    },
    mounted() {
      const angle = 360 / this.items.length; // 每个项目的角度
      this.items.forEach((item, index) => {
        const element = this.$el.querySelector(`.arch-item[key='${item.id}']`);
        element.style.transform = `rotate(${angle * index}deg) translateX(50%)`; // translateX用来调整对齐
      })
    },
    methods: {
    }
  };
</script>
<style lang="scss" scoped>
#arch-container {
  position: relative;
  width: 200px; /* 容器宽度 */
  height: 200px; /* 容器高度 */
}
 
.arch-item {
  position: absolute;
  top: 50%; /* 垂直居中 */
  left: 50%; /* 水平居中 */
  transform-origin: left center; /* 旋转中心在左侧中心 */
}
</style>