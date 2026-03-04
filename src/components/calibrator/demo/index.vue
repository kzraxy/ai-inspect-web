<!--
 * @Descripttion: 
 * @version: 
 * @Author: maoyining
 * @Date: 2023-04-10 11:09:39
 * @LastEditors: maoyining
 * @LastEditTime: 2023-06-27 14:47:30
-->
<!--
 * @Descripttion: 
 * @version: 
 * @Author: maoyining
 * @Date: 2023-04-10 11:09:39
 * @LastEditors: maoyining
 * @LastEditTime: 2023-06-27 13:34:43
-->
<template>
  <div class="calibrator-demo">
    <el-button @click="init">渲染画布</el-button>
    <div class="calibrator-wrapper" ref="calibrator"></div>
  </div>
</template>
<script>
import bgImage from '@/assets/images/cat.jpg';

export default {
  data() {
    return {
      calibrator: {}
    };
  },
  mounted() {},
  methods: {
    init() {
      const rootDom = this.$refs.calibrator;
      const context = this;
      this.calibrator = this.$createCalibrator({
        rootDom,
        editTypeList: ['rect', 'polygon', 'ellipse', 'line', 'chain'],
        operationTypeList: ['edit', 'draw'],
        callback: {
          beforeDraw: {
            // eslint-disable-next-line object-shorthand
            func: async function () {},
            context
          },
          beforeEdit: {
            // eslint-disable-next-line object-shorthand
            func: async function () {},
            context
          },
          beforeDrawFinish: {
            // eslint-disable-next-line object-shorthand
            func: async function () {},
            context
          }
        },
        image: {
          src: bgImage
        },
        calibrationKey: 'id',
        labelKey: 'labelId',
        calibrationList: [
          {
            id: '1',
            scope: {
              type: 'rect',
              coordinates: [
                { x: 0.1, y: 0.1 },
                { x: 0.1, y: 0.3 },
                { x: 0.3, y: 0.3 },
                { x: 0.1, y: 0.3 }
              ]
            },
            labelList: [
              { labelId: 'label-1', text: '标签1' },
              { labelId: 'label-2', text: '标签2' }
            ]
          },
          {
            id: '2',
            scope: {
              type: 'polygon',
              coordinates: [
                { x: 0.5, y: 0.1 },
                { x: 0.4, y: 0.3 },
                { x: 0.8, y: 0.4 },
                { x: 0.7, y: 0.15 }
              ]
            },
            labelList: [
              { labelId: 'label-1', text: '标签1' },
              { labelId: 'label-2', text: '标签2' }
            ]
          },
          {
            id: '3',
            scope: {
              type: 'polygon',
              coordinates: [
                { x: 0.5, y: 0.1 },
                { x: 0.4, y: 0.3 },
                { x: 0.8, y: 0.4 },

                { x: 0.7, y: 0.15 }
              ]
            },
            labelList: [
              { labelId: 'label-1', text: '标签1' },
              { labelId: 'label-2', text: '标签2' }
            ]
          },
          {
            id: '4',
            scope: {
              type: 'line',
              coordinates: [
                { x: 0.1, y: 0.5 },
                { x: 0.2, y: 0.8 }
              ],
              width: 0.1
            },
            labelList: [
              { labelId: 'label-1', text: '标签1' },
              { labelId: 'label-2', text: '标签2' }
            ]
          },
          {
            id: '5',
            scope: {
              type: 'ellipse',
              coordinates: [
                { x: 0.1, y: 0.5 },
                { x: 0.2, y: 0.8 }
              ],
              center: { x: 0.7, y: 0.7 }, // 圆心（仅支持椭圆形）
              axisX: 0.1, // 短半轴（仅支持椭圆形）
              axisY: 0.2, // 长半轴（仅支持椭圆形）
              angle: 45 // 旋转角度（仅支持椭圆形
            },
            labelList: [
              { labelId: 'label-1', text: '标签1' },
              { labelId: 'label-2', text: '标签2' }
            ]
          }
        ]
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.calibrator-demo {
  width: 800px;
  height: 500px;

  .calibrator-wrapper {
    flex-shrink: 1;
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    & > div {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      right: 0;
    }
  }
}
</style>
