# Calibrator 标注组件

组件负责人： maoyining

组件简介：标注组件，可实现对特定图片绘制多种类型的标注框，并对标注框设置标签的功能

## 快速开始

1. **第一步：需要在页面上设置一个 div 容器，并为容器设置宽高和位置**

```vue
<template>
  <div class="calibrator-wrapper" ref="calibrator"></div>
</template>
<style>
.calibrator-wrapper {
  width: 650px;
  height: 350px;
  position: relative;
  overflow: hidden;
}
</style>
```

2. **第二步：我们需要通过调用`this.$createCalibrator()` 函数来进行初始化。**

`this.$createCalibrator()`内的初始化对象包含众多参数(该函数的初始化参数和[$init](#init)相同)，例如：

- rootDom: 必传，实例容器，一般是一个具有高宽的 DIV 元素。可以传入 dom 的 id，或者直接传入 dom 实例。 当 dom 元素尺寸位置发生改变时，可调用 `reset` 方法，复位画布
- [image](#image底图配置): 底图信息，可以为底图指定 URL,旋转角度，默认缩放比例，默认左上角基准点相对画板的坐标,裁剪信息。

::: demo

```html
<template>
  <div class="calibrator-demo">
    <div class="calibrator-wrapper" ref="calibrator"></div>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        calibrator: {}
      };
    },
    mounted() {
      const rootDom = this.$refs.calibrator;
      this.calibrator = this.$createCalibrator({
        operationTypeList: [],
        editTypeList: [],
        rootDom,
        image: {
          src: '/images/cat.jpg'
        }
      });
    }
  };
</script>
<style>
  .calibrator-wrapper {
    border: 1px solid #dfe2e5;
    flex-shrink: 1;
    width: 650px;
    height: 350px;
    position: relative;
    overflow: hidden;
  }
</style>
```

:::

## 展示标注信息

标注组件一共支持矩形、多边形、圆形、线性四种类型的标注。标注信息主要由[calibrationList](#calibrationlist-标注信息设置)字段传入，每个标注信息包含图形结构化信息、标 签信息、标注状态等数据。

::: demo

```html
<template>
  <div class="calibrator-demo">
    <div class="calibrator-wrapper" ref="calibrator"></div>
    <el-button @click="getCalibrations">获取标注信息</el-button>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        calibrator: {}
      };
    },
    methods: {
      getCalibrations() {
        const res = this.calibrator.$getCalibrations(['1', '2']);
      }
    },
    mounted() {
      const rootDom = this.$refs.calibrator;
      this.calibrator = this.$createCalibrator({
        rootDom,
        image: {
          src: '/images/cat.jpg'
        },
        operationTypeList: [],
        editTypeList: [],
        calibrationList: [
          // 矩形标注信息的展示
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
          // 多边形标注信息的展示
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
          // 线性标注信息的展示
          {
            id: '3',
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
          // 椭圆标注信息的展示
          {
            id: '4',
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
  };
</script>
<style>
  .calibrator-wrapper {
    border: 1px solid #dfe2e5;
    flex-shrink: 1;
    width: 650px;
    height: 350px;
    position: relative;
    overflow: hidden;
  }
</style>
```

:::

## 为标注框和标签设置样式

标注组件自带默认样式，如需对底图裁剪框、裁剪框控制器、标注框框体、标注框控制器、标签容器、标签体、标签文本配置自定义的样式，可以参考 [样式设置列表](#样式设置列表) 为标注框设置默认样式。下面是一个为标注组件设置边框和标签样式的示例。

::: demo

```html
<template>
  <div class="calibrator-demo">
    <div class="calibrator-wrapper" ref="calibrator"></div>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        calibrator: {}
      };
    },
    mounted() {
      const rootDom = this.$refs.calibrator;
      this.calibrator = this.$createCalibrator({
        rootDom,
        image: {
          src: '/images/cat.jpg'
        },
        operationTypeList: [],
        editTypeList: [],
        calibrationList: [
          // 矩形标注信息的展示
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
              {
                labelId: 'label-1',
                text: '标签1'
              }
            ],
            style: {
              shape: {
                // 常态下的样式
                normal: {
                  // 框体填充颜色
                  color: 'rgb(255, 123, 161, 0.1)',
                  // 框体边框颜色
                  borderColor: 'rgb(255, 123, 161)',
                  // 框体边框宽度
                  borderWidth: 2
                }
              },
              label: {
                normal: { color: 'rgb(255, 123, 161)' }
              }
            }
          }
        ]
      });
    }
  };
</script>
<style>
  .calibrator-wrapper {
    border: 1px solid #dfe2e5;
    flex-shrink: 1;
    width: 650px;
    height: 350px;
    position: relative;
    overflow: hidden;
  }
</style>
```

:::

## 在画布上绘制与编辑

标注组件有绘制和编辑两大操作类型，可通过 `operationTypeList` 来决定是否开启绘制和编辑，若 operationTypeList 不为空则默认操作类型为 operationTypeList[0]， 如需进行编辑、绘制功能之间的切换，可调用[`$updateOperationType`](#updateOperationType)方法

- 绘制功能有四种绘制方式，分别是矩形(rect)、多边形(polygon)、圆(ellipse)、线(line)，可通过 `drawTypeList` 字段来决定是否支持某种绘制方式，若 drawTypeList 不为空则默认绘制类型为 drawTypeList[0]，如需进行绘制图形的切换可调用[`$updateDrawType`](#updateDrawType)方法

- 编辑功能的支持类型参考[editTypeList](#edittypelist)

需要注意的是，进行相应的操作时需要传入[回调函数]()，否则可能会有阻塞

::: demo

```html
<template>
  <div class="calibrator-demo">
    <div class="tool-choose">
      <div class="tool-item">
        <span>请选择操作方式：</span>
        <el-select
          v-model="currentOperationType"
          placeholder="请选择操作方式"
          @change="changeOperateType"
          style="width:120px"
          :disabled="isTailor"
        >
          <el-option
            v-for="item in operationTypeList"
            :key="item"
            :label="item"
            :value="item"
          ></el-option>
        </el-select>
      </div>
      <div class="tool-item" v-if="currentOperationType === 'draw'">
        <span>请选择绘制类型：</span>
        <el-select
          v-model="currentDrawType"
          placeholder="请选择操作方式"
          @change="changeDrawType"
          style="width:120px"
          :disabled="isTailor"
        >
          <el-option
            v-for="item in drawTypeList"
            :key="item"
            :label="item"
            :value="item"
          ></el-option>
        </el-select>
      </div>

      <div class="tool-item">
        <el-button @click="reset">清除画布</el-button>
      </div>
      <div class="tool-item">
        开启裁剪功能
        <el-switch @change="openTailor" v-model="isTailor"></el-switch>
      </div>
    </div>

    <div class="calibrator-wrapper" ref="calibrator"></div>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        calibrator: {},
        currentOperationType: 'edit',
        operationTypeList: ['edit', 'draw'],
        drawTypeList: ['rect', 'polygon', 'ellipse', 'line'],
        currentDrawType: 'rect',
        isTailor: false,
        commonEdit: [
          'reset',
          'enlarge',
          'moveAll',
          'moveCalibrations',
          'adjustCalibration',
          'rotateCalibration',
          'rotateImage'
        ],
        tailorEdit: [
          'reset',
          'enlarge',
          'moveAll',
          'moveCalibrations',
          'adjustCalibration',
          'rotateCalibration',
          'rotateImage',
          'drawTailor',
          'adjustImage',
          'moveImageAndCalibrations'
        ]
      };
    },
    mounted() {
      const rootDom = this.$refs.calibrator;
      const context = this;
      this.calibrator = this.$createCalibrator({
        rootDom,
        image: {
          src: '/images/cat.jpg'
        },
        operationTypeList: ['edit', 'draw'],
        drawTypeList: ['rect', 'polygon', 'ellipse', 'line'],
        editTypeList: this.commonEdit,
        callback: {
          beforeDraw: {
            func: async function (params) {
            },
            context
          },
          beforeEdit: {
            func: async function () {},
            context
          },
          beforeDrawFinish: {
            func: async function () {},
            context
          }
        }
      });
    },
    methods: {
      changeOperateType() {
        this.calibrator.$updateOperationType({ operationType: this.currentOperationType });
      },
      changeDrawType() {
        this.calibrator.$updateDrawType({ drawType: this.currentDrawType });
      },
      reset() {
        this.calibrator.$updateCalibrations({ calibrationList: [] });
      },
      openTailor(val) {
        if (val) {
          this.calibrator.$updateOperationType({ operationType: 'edit' });
          this.calibrator.$updateEditTypeList({
            editTypeList: this.tailorEdit
          });
        } else {
          this.currentOperationType = 'edit';
          this.calibrator.$updateEditTypeList({
            editTypeList: this.commonEdit
          });
        }
      }
    }
  };
</script>
<style>
  .calibrator-wrapper {
    border: 1px solid #dfe2e5;
    flex-shrink: 1;
    width: 650px;
    height: 350px;
    position: relative;
    overflow: hidden;
  }
  .tool-choose {
    display: flex;
    flex-wrap: wrap;
  }
  .tool-item {
    margin-right: 16px;
  }
</style>
```

:::

## Methods

### 索引表

| 名称                                                                          | 说明                         |
| ----------------------------------------------------------------------------- | ---------------------------- |
| [$init()](#calibrator-init)                                                   | 初始化标注画板函数           |
| [$updateTailorScope](#calibrator-updatetailorscope)                           | 更新底图裁剪位置信息         |
| [$deleteCalibrations](#calibrator-deletecalibrations)                         | 批量删除标注框               |
| [$updateCalibrations](#calibrator-updatecalibrations)                         | 批量更新标注框               |
| [$updateCalibrationsIndex](#calibrator-updatecalibrationsindex)               | 更新标注框的层级             |
| [$updateCalibrationsLabelVisible](#calibrator-updatecalibrationslabelvisible) | 更新所有标注框标签的显示状态 |
| [$updateFocusCalibrations](#calibrator-updatefocuscalibrations)               | 更新选中的标注框             |
| [$updateHoverCalibration](#calibrator-updatehovercalibration)                 | 更新悬停的标注框             |
| [$updateOperationTypeList](#calibrator-updateoperationtypelist)               | 更新支持的操作类型列表       |
| [$updateOperationType](#calibrator-updateoperationtype)                       | 更新当前的操作类型           |
| [$updateDrawTypeList](#calibrator-updatedrawtypelist)                         | 更新支持的绘制类型列表       |
| [$updateEditTypeList](#calibrator-updateedittypelist)                         | 更新支持的编辑类型列表       |
| [$updateDrawType](#calibrator-updatedrawtype)                                 | 更新绘制类型                 |
| [$updatePenWidth](#calibrator-updatepenwidth)                                 | 更新画笔宽度                 |
| [$rotateImage](#calibrator-rotateimage)                                       | 旋转底图                     |
| [$enlarge](#calibrator-enlarge)                                               | 缩放底图                     |
| [$reset](#calibrator-reset)                                                   | 复位                         |
| [$getStatuses](#calibrator-getstatuses)                                       | 获取标注画板目前的状态信息   |
| [$getImageScope](#calibrator-getimagescope)                                   | 获取底图的图形信息           |
| [$getTailorScope](#calibrator-gettailorscope)                                 | 获取底图裁剪框的图形信息     |
| [$getCalibrations](#calibrator-getcalibrations)                               | 获取标注列表的详细信息       |
| [$getCalibrationsByStatus](#calibrator-getcalibrationsbystatus)               | 根据状态获取标注列表         |
| [$getImageInCalibration](#calibrator-getimageincalibration)                   | 获取标注框裁剪出来的图像     |
| [$destroyed](#calibrator-destroyed)                                           | 销毁标注画板                 |

### calibrator.$init()

初始化标注画板函数

**参数**

- `rootDom (HTMLDivElement|HTMLCanvasElement)` - 实例容器，一般是一个具有高宽的 DIV 元素。可以传入 dom 的 id，或者直接传入 dom 实例

- `image (Object)` - 待标注的底图对象。包含底图的资源路径及底图裁剪信息与位置信息等。其结构如下：

  ```js
  {  
      src: require('./assets/test.jpg'), // 底图的URL
      angle: 270, // 可选：底图的旋转角度，仅支持0，90，180，270  
      ratio: 0.3, // 可选：底图的默认缩放比例
      basePoint: { // 可选：底图的默认左上角基准点相对画板的坐标    
        x: 0,
        y: 0
      },
      tailorScope: { // 可选：底图的裁剪信息，坐标为相对图片尺寸的归一化信息
        coordinates: [
          { x: 0, y: 0 },
          { x: 0.9, y: 0 },
          { x: 0.9, y: 0.9 },
          { x: 0, y: 0.9 }
        ]
      }
  }
  ```

- `indexKey (String)` - 标注信息的层级唯一标识符

- `labelKey (String)` - 标注框的标签列表中，标签的唯一标识符

- `calibrationKey (String)` - 标注信息的标注框唯一标识符

- `defaultStyle (Object)` - 底图裁剪框、裁剪框控制器的默认样式 TODO

- `calibrationList (Array)`

  ```js
  [{
      status: 'hover', // 标注框的状态，normal：常态；hover：悬停态（全局有且仅有一个）；focus：选中态
      scope: { // 标注框的结构化数据
        type: 'rect', // 标注框的图形类别 rect：矩形；polygon：多边形；ellipse：圆形； line：线性；
        // 标注框的坐标系，其中矩形（四个点）、多边形（大于两个点）中表示边框的端点，线形 （两个点）表示线的两个端点（仅支持矩形多边形、线形）
        coordinates: [],
        center: { x: 0.5, y:0.8 }, // 圆心（仅支持椭圆形）
        axisX: 0.2, // 短半轴（仅支持椭圆形）
        axisY: 0.6, // 长半轴（仅支持椭圆形）
        angle: 45, // 旋转角度（仅支持椭圆形）
        width: 0.02 // 线宽（仅支持线形）
      },
      style: {}, // style1,标注框和标签的默认样式
      // 标注框的标签列表
      labelList: [{
        id: '',
        text: '疑似误标', // 标签名称
        deletable: false // 标签旁是否展示可删除的按钮
        // style2,单个标签的定制样式
        style: {}
      }]
  }]
  ```

  其中注释中 style1 为当前标注框和标签的样式,其数据格式详见[标注框和标签的样式](#标注框和标签的样式)

  其中 `labelList` 中的 style2 为单个标签的定制样式,其数据格式详见[标注框和标签的样式](#标注框和标签的样式)中的 `label` 对象

- `background (String)` - 标注组件画布的背景图，为 `url` 格式

- `hotKeyDisableList (Array)` - 禁用的热键列表

- `callback (Object)`

- `fixLabel (Boolean)`

- `showLabelList (Boolean)`

- `operationTypeList (Array)` - 可用操作类型,可开启 `edit`、`draw` 两大类操作

- `operationType (String)` - 默认操作类型，默认为 `operationTypeList[0]`,包括 `edit`、`draw`

- `editTypeList (Array)` - 支持的编辑类型列表

  | 编辑类型             | 名称                     | 功能触发方式                                                                   | 功能完成过程   |
  | :------------------- | :----------------------- | ------------------------------------------------------------------------------ | -------------- |
  | 移动全部             | moveAll                  | 不支持 drawTailor 与 adjustImage，或支持 adjustImage，且鼠标点击在裁剪蒙层区域 | 鼠标拖拽并松开 |
  | 移动选中标注框       | moveCalibrations         | 鼠标点击在选中的标注框之一上                                                   | 鼠标拖拽并松开 |
  | 调整标注框           | adjustCalibration        | 鼠标点击在标注框控制器上                                                       | 鼠标拖拽并松开 |
  | 旋转标注框           | rotateCalibration        | 鼠标点击在标注框旋转控制器上（只支持对圆形标注框旋转）                         | 鼠标拖拽并松开 |
  | 移动底图和所有标注框 | moveImageAndCalibrations | 支持 adjustImage，鼠标点击在图片非裁剪区域上，但没有触碰到标注框               | 鼠标拖拽并松开 |
  | 绘制裁剪框           | drawTailor               | 鼠标点击在图片内，且没有碰到标注框，且图片上没有裁剪框                         | 鼠标拖拽并松开 |
  | 调整底图裁剪框       | adjustImage              | 鼠标点击在裁剪框控制器上                                                       | 鼠标拖拽并松开 |
  | 放大或缩小底图       | enlarge                  | 调用$enlarge 方法，或鼠标在图片内，进行了滚轮滑动                              | 瞬间完成       |
  | 复位底图             | reset                    | 调用$reset 方法，或鼠标在图片内，且同时按下 ctrl+r 键                          | 瞬间完成       |
  | 旋转底图             | rotateImage              | 调用$rotateImage 方法                                                          | 瞬间完成       |

- `drawTypeList (Array)` - 绘制类型列表，可供选择的绘制类型有： 矩形`rect`, 多边形`polygon`, 圆`ellipse`, 线`line`

- `drawType (String)` - 默认绘制类型，默认为 drawTypeList[0]，可供选择的绘制类型有： 矩形`rect`, 多边形`polygon`, 圆`ellipse`, 线`line`

- `limitCalibrations (Boolean)` - 是否开启对标注框的范围限制，开启后，在绘制、编辑过程中，标注框不可超出底图的裁剪范围，会自动计算并贴边处理

#### 样式设置列表

##### 标注框和标签的样式

```js
{
  // 标注框框体样式
  shape: {
    // 常态下的样式
    normal: {
      color: 'rgba(48,143,240,0.1)', // 框体填充颜色
      borderColor: '#308FF0', // 框体边框颜色
      borderWidth: 2 // 框体边框宽度
    },
    // 鼠标悬停状态下的样式
    hover: {
      color: 'rgba(48,143,240,0.3)',
      borderColor: '#308FF0',
      borderWidth: 3
    },
    // 鼠标选中状态下的样式
    focus: {
      color: 'rgba(48,143,240,0.3)',
      borderColor: '#308FF0',
      borderWidth: 3
    },
    // 不合法状态下的样式
    illegal: {
      color: 'rgba(245,106,75,0.2)',
      borderColor: '#F56A4B',
      borderWidth: 3
    }
  },
  // 标注框框体控制点的样式
  control: {
    normal: {
      borderWidth: 1, // 控制点的边框宽度
      color: '#fff', // 控制点填充颜色
      radius: 5 // 控制点半径
    },
    hover: {
      borderWidth: 1,
      color: '#fff',
      radius: 6
    },
    focus: {
      borderWidth: 1,
      color: '#fff',
      radius: 6
    },
    illegal: {
      borderWidth: 1,
      color: '#fff',
      radius: 6
    }
  },
  // 单个标签的样式
  label: {
    normal: {
      height: '24px',
      maxWidth: '160px',
      borderRadius: '2px',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      padding: '1px 8px',
      marginBottom: '1px',
      background: 'rgba(0,0,0,0.8)',
      display: 'inline-flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
      flexShrink: '0',
      boxSizing: 'content-box',
      position: 'relative',
      color: '#308FF0'
    },
    hover: {
      height: '24px',
      maxWidth: '160px',
      borderRadius: '2px',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      padding: '1px 8px',
      marginBottom: '1px',
      background: 'rgba(0,0,0,0.8)',
      display: 'inline-flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
      flexShrink: '0',
      boxSizing: 'content-box',
      position: 'relative',
      color: '#308FF0'
    },
    focus: {
      height: '24px',
      maxWidth: '160px',
      borderRadius: '2px',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      padding: '1px 8px',
      marginBottom: '1px',
      background: 'rgba(0,0,0,0.8)',
      display: 'inline-flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
      flexShrink: '0',
      boxSizing: 'content-box',
      position: 'relative',
      color: '#308FF0'
    },
    illegal: {
      height: '24px',
      maxWidth: '160px',
      borderRadius: '2px',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      padding: '1px 8px',
      marginBottom: '1px',
      background: 'rgba(0,0,0,0.8)',
      display: 'inline-flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
      flexShrink: '0',
      boxSizing: 'content-box',
      position: 'relative',
      color: '#F56A4B'
    }
  },

  // 标签容器样式
  labelsWrap: {
    normal: {
      position: 'absolute',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      boxSizing: 'content-box',
      maxHeight: '161px',
      margin: '0',
      overflow: 'visible'
    },
    hover: {
      position: 'absolute',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      boxSizing: 'content-box',
      maxHeight: '161px',
      margin: '0',
      overflow: 'auto'
    },
    focus: {
      position: 'absolute',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      boxSizing: 'content-box',
      maxHeight: '161px',
      margin: '10px 0',
      overflow: 'auto'
    },
    illegal: {
      position: 'absolute',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      boxSizing: 'content-box',
      maxHeight: '161px',
      margin: '0',
      overflow: 'auto'
    }
  },
  // 单个标签内字体的样式
  labelSpan: {
    normal: {
      fontSize: '12px',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      flexShrink: '1'
    },
    hover: {
      fontSize: '12px',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      flexShrink: '1'
    },
    focus: {
      fontSize: '12px',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      flexShrink: '1'
    },
    illegal: {
      fontSize: '12px',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      flexShrink: '1'
    }
  }
}
```

##### 底图裁剪框蒙层与控制器样式

```js
{
  // 底图及底图裁剪样式
  IMAGE: {
    // 裁剪蒙层的样式
    mask: {
      normal: {
        color: 'rgba(0,0,0,0.6)', // 蒙层颜色
        borderColor: '#fff',
        // 蒙层的边框颜色
        borderWidth: 1 // 蒙层边框宽度
      },
      hover: { color: 'rgba(0,0,0,0.5)', borderColor: '#fff', borderWidth: 1 },
      illegal: { borderColor: '#F56A4B', borderWidth: 1, color: 'rgba(245,106,75,0.4)' }
    },
    // 裁剪控制器的样式
    control: {
      normal: {
        borderColor: '#fff', // 控制器的边框颜色
        color: '#282E42', // 控制器的填充颜色
        borderWidth: 1 // 控制器边框宽度
      },
      hover: { borderColor: '#fff', color: '#000', borderWidth: 1 },
      illegal: { borderColor: '#F56A4B', borderWidth: 1, color: '#f56a4b' }
    }
  }
}
```

### calibrator.$updateTailorScope

更新底图裁剪位置信息

**参数**

- `status (String)` - 底图的操作状态
- `coordinates (Array)` - 底图裁剪框的归一化坐标
- `style (Object)` - [底图裁剪框蒙层与控制器样式](#底图裁剪框蒙层与控制器样式)中的 `IMAGE` 对象

### calibrator.$deleteCalibrations

批量删除标注框

**参数**

- `calibrationKeys (String)` - 需要删除的标注框的键名，需要和 `$init` 中的 `calibrationKey` 一致

### calibrator.$updateCalibrations

批量更新标注框

**参数**

- `calibrationList (Array)` - 需要更新的标注框列表，列表信息中的 `labelKey`、`indexKey` 及 `calibrationKey` 需要和 `$init` 中的一致，且唯一
- `isMerge (Boolean)` - 当 `isMerge` 属性为 `true` 时，回合并需要更新的列表和目前已有的列表，重复键名会替换；当 `isMerge` 为 `false` 时，则会使用需要更新的标注框列表替换目前画布上已有的列表，默认值为`true`

### calibrator.$updateCalibrationsIndex

更新标注框的层级

**参数**

- `calibrationList (Array)` - 标注框列表

### calibrator.$updateCalibrationsLabelVisible

更新所有标注框标签的显示状态

**参数**

- `visible (Boolean)` - 是否显示标签列表，默认为 `true`

### calibrator.$updateFocusCalibrations

更新选中的标注框

**参数**

- `calibrationKeys (Array[string])` - 需要选中的标注框对象键列表，其取值应和 `init` 时 `calibrationKey` 对应键名 的属性取值相等

### calibrator.$updateHoverCalibration

更新悬停的标注框，注意整个画布中只可能存在 1 个悬停状态下的标注框

**参数**

- `calibrationKey (Array[string])` - 需要悬停的标注框对象键，其取值应和 `init` 时 `calibrationKey` 对应键名的属性取值相等

### calibrator.$updateOperationTypeList

更新支持的操作类型列表

**参数**

- `operationTypeList (Array[string])` - 操作类型列表，共有 `edit`、`draw` 两种操作类型

### calibrator.$updateOperationType

更新当前的操作类型

**参数**

- `operationType (String)` - 操作类型, 共有 `edit`、`draw` 两种操作类型

### calibrator.$updateDrawTypeList

更新支持的绘制类型列表

**参数**

- `drawTypeList (Array[string])` - 当前绘制类型，共有 `rect`, `polygon`, `ellipse`, `line` 几种绘制类型

### calibrator.$updateEditTypeList

更新支持的编辑类型列表

**参数**

- `editTypeList (Array[string])` - 编辑类型列表

### calibrator.$updateDrawType

更新绘制类型

**参数**

- `drawType (String)` - 当前绘制类型，共有 `rect`, `polygon`, `ellipse`, `line` 几种绘制类型

### calibrator.$updatePenWidth

更新画笔宽度（线型标注的画笔宽度）

**参数**

- `penWidth (Number)` - 画笔宽度

### calibrator.$rotateImage

旋转底图

**参数**

- `angle (Number)` - 旋转角度

### calibrator.$enlarge

缩放底图

**参数**

- `ratio (Number)` - 目标缩放比例
- `point (Object{x,y})` - 可选：缩放中心点

### calibrator.$reset

复位

### calibrator.$getStatuses

获取标注画板目前的状态信息

**返回**

- `operationStatus (String)` - 操作的状态
- `operationType (String)` - 操作的类型
- `operationTypeList (Array[string])` - 操作类型列表
- `showLabelList (Boolean)` - 标签列表显示状态
- `drawType (String)` - 当前绘制类型
- `penWidth (Number)` - 线性画笔的宽度
- `editTypeList (Array[string])` - 当前可用的编辑类型列表
- `editType (String)` - 当前编辑类型

### calibrator.$getImageScope

获取底图的图形信息

**返回**

- `_data (Object)` - 原始的底图初始化数据

- `scope (Object)` - 当前的底图位置及缩放信息

  ```javascript
  { // 当前的底图位置及缩放信息    
    ratio: number, // 当前的底图缩放比例    
    basePoint: arr[number], // 当前左上角基准点相对坐标    
    maxRatio: number, // 最大缩放比例    
    minRatio: number // 最小缩放比例
  }
  ```

- `imageObj (Object)` - 当前底图的 Image()对象

- `tailorScope (Object)` - 当前底图的裁剪信息

### calibrator.$getTailorScope

获取底图裁剪框的图形信息

**返回**

- `tailorScope (Object)` - 裁剪框信息

  ```javascript
  {
    status: 'normal'; // 裁剪框状态
  }
  ```

### calibrator.$getCalibrations

获取标注列表的详细信息

**参数**

注意该参数非对象的格式，

- `calibrationKeys (Array)` - 标注框的键名，需要和 `$init` 中的 `calibrationKey` 一致

**返回**

- `calibrations (Array)` - 标注列表

  ```javascript
  {
       id: string, // 标注框唯一标识
       index: number, // 标注框的层级属性
       status: string, // 标注框的状态
         scope: {
           type: string, // 标注框的图属性
           coordinates: [
             { x: 0.5, y: 0.3 },
             { x: 0.7, y: 0.3 },
             { x: 0.7, y: 0.6 },
             { x: 0.5, y: 0.6 }
           ]
         },
       style: object, // 标注框的样式
       labelList: [{   // 标注框的标签列表
         id: string, // 标签唯一标识          
         text: string, // 标签文本
         style: object, // 标签的样式
         deletable: boolean // 标签是否可删除
       }]
  }
  ```

### calibrator.$getCalibrationsByStatus

根据状态获取标注列表

**参数**

- `status (String)` - 需要获取的状态

**返回**

- `calibrations (Array)` - 和状态匹配的标注信息列表 ，具体结构同 `calibrator.$getCalibrations`

### calibrator.$getImageInCalibration

获取标注框裁剪出来的图像

**参数**

- `calibrationKey (Array[string])` - 标注框对象键，其取值应和 `init` 时 `calibrationKey` 对应键名的属性取值相等

**返回**

- `url (String)` - 裁剪出来的图片的 url
- `clipWidth (Number)` - 裁剪出来的图片宽
- `clipHeight (Number)` - 裁剪出来的图片高

### calibrator.$destroyed

销毁标注画板

## Callbacks

### 索引表

| 回调函数名称                                                    | 说明                   |
| --------------------------------------------------------------- | ---------------------- |
| [beforeDraw](#beforedraw)                                       | 绘制前回调             |
| [beforeEdit](#beforeedit)                                       | 编辑前回调             |
| [afterDraw](#afterdraw)                                         | 绘制后回调             |
| [afterEdit](#afteredit)                                         | 编辑后回调             |
| [afterMouseMove](#aftermousemove)                               | 鼠标移动后回调         |
| [afterMouseLeftDown](#aftermouseleftdown)                       | 鼠标左键单击后回调     |
| [afterMouseDoubleClick](#aftermousedoubleclick)                 | 鼠标双击后回调         |
| [afterImageChange](#afterimagechange)                           | 底图改变后回调         |
| [afterCalibrationsChange](#aftercalibrationschange)             | 标注信息改变后回调     |
| [afterCalibrationsStatusChange](#aftercalibrationsstatuschange) | 标注信息状态改变后回调 |
| [afterCalibrationsLabelChange](#aftercalibrationslabelchange)   | 标注标签改变后回调     |
| [afterOperationTypeChange](#afteroperationtypechange)           | 操作类型改变后回调     |
| [afterOperationStatusChange](#afteroperationstatuschange)       | 操作状态改变后回调     |
| [afterPenWidthChange](#afterpenwidthchange)                     | 画笔宽度改变后回调     |
| [afterDrawTypeChange](#afterdrawtypechange)                     | 绘制类型改变后回调     |

### beforeDraw

绘制前回调

**参数**

- `calibration (Object)` - 当前正在绘制的标注数据对象（画布实时数据）
- `image (Object)` - 当前画布上的底图数据对象（画布实时数据）
- `scope (Object)` - 当前画布上正在绘制的标注数据对象的图形数据（画布实时数据)
- `scopeList (Array[object])` - 当前画布上正在绘制的标注数据对象的图形数据历史纪录（画布实时数据)
- `step (Number)` - 当前正在绘制的步骤数（落笔数）
- `drawType (String)` - 当前的绘制类型
- `motionType (String)` - 当前操作的步骤，可分为 `start`、`update`、`finish` 三种

**返回**

- `code (String)` - 操作是否允许继续 `success`:允许；`finish`:完成并停止；`cancel`:取消； `fail`:继续但会失败
- `msg (String)` - 光标提示语，`code` 为 `fail` 会显示为 `illegal` 样式，其他情况显示为 `normal` 样 式

### beforeEdit

编辑前回调

**参数**

- `calibrations (Array[object])` - 当前画布上的标注信息数据对象（画布实时数据）
- `rotation (Object)` - 当前操作的旋转控制器数据对象（底图、标注框或控制器的画布实时数据）
- `control(Object)` - 当前画布上操作的对象控制器（画布实时数据）
- `image (Object)` - 当前画布上的底图数据对象（画布实时数据）
- `editType (String)` - 当前的编辑类型
- `motionType (String)` - 当前操作的步骤，可分为 `start`、`update`、`finish` 三种
- `hover (Object)` - 当前操作悬停的数据对象（底图、标注框或控制器的画布实时数据）

**返回**

- `code (String)` - 操作是否允许继续 `success`:允许；`finish`:完成并停止；`cancel`:取消； `fail`:继续但会失败
- `msg (String)` - 光标提示语，`code` 为 `fail` 会显示为 `illegal` 样式，其他情况显示为 `normal` 样式

### afterDraw

绘制后回调

**参数**

- 刚绘制完成的标注信息数据对象（画布实时数据）

### afterEdit

编辑后回调

**参数**

- `calibrations (Array[object])` - 当前画布上的标注信息数据对象（画布实时数据）

- `editType (String)` - 当前的编辑类型
- `image (Object)` - 当前画布上的底图数据对象（画布实时数据）
- `event (Object)` - 鼠标事件

### afterMouseMove

鼠标移动后回调

**参数**

- `$event (Object)` - 鼠标事件
- `calibration (Object)` - 当前正在绘制的标注数据对象（画布实时数据）
- `image (Object)` - 当前画布上的底图数据对象（画布实时数据）

**返回**

- `code (String)` - 操作是否允许继续 `success`:允许；`finish`:完成并停止；`cancel`:取消； `fail`:继续但会失败
- `msg (String)` - 光标提示语，`code` 为 `fail` 会显示为 `illegal` 样式，其他情况显示为 `normal` 样式

### afterMouseLeftDown

鼠标左键单击后回调

**参数**

- `$event (Object)` - 鼠标事件

- `status (Object)` - 当前画布各种状态集合

  ```js
  status: {
    status: string,
    editType: string,    
    editTypeList: arr[string],  
    operationStatus: string,    
    operationType: string,    
    operationTypeList: arr[string],    
    penWidth: number,    
    showLabelList: boolean
  }
  ```

### afterMouseDoubleClick

鼠标双击后回调

**参数**

- `$event (Object)` - 鼠标事件

- `status (Object)` - 当前画布各种状态集合

  ```js
  status: {
    status: string,
    editType: string,    
    editTypeList: arr[string],  
    operationStatus: string,    
    operationType: string,    
    operationTypeList: arr[string],    
    penWidth: number,    
    showLabelList: boolean
  }
  ```

### afterImageChange

底图改变后回调

### afterCalibrationsChange

标注信息改变后回调

### afterCalibrationsStatusChange

标注信息状态改变后回调

**参数**

- `calibrationKeys (Array[string])` - 发生改变后，该类型的的标注信息的标识数组
- `status (S)` - 改变的状态的类型

### afterCalibrationsLabelChange

标注标签改变后回调

**参数**

- `calibrationKey (String)` - 发生改变后，该类型的的标注信息的标识
- `labelList (Array[object])` - 改变后的标签列表

### afterOperationTypeChange

操作类型改变后回调

**参数**

- 改编后的操作类型

### afterOperationStatusChange

操作状态改变后回调

**参数**

- 改变后的操作的状态 `undo`：无操作 ； `doing`：操作中

### afterPenWidthChange

画笔宽度改变后回调

**参数**

- 改变后的画笔宽度

### afterDrawTypeChange

绘制类型改变后回调

**参数**

- 绘制类型改变后回调
