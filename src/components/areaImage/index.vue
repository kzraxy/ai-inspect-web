<template>
  <div class="calibrator"
    :style="{'width':`${width}px`,'height':`${height}px`}">
    <div class="calibrator-wrapper" ref="calibrator"></div>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  name: 'areaImage',
  props: {
    width: {
      default: 896,
      type: Number
    },
    height: {
      default: 503,
      type: Number
    },
    url: {
      type: String
    },
    calibrationKey: {
      type: String,
      default: 'id'
    },
    labelKey: {
      type: String,
      default: 'labelId'
    },
    calibrationList: {
      type: Array,
      default: () => {
        return []
      }
    },
    operationTypeList: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data () {
    return {
      calibrator: {}
    }
  },
  watch: {
    calibrationList:{
      async handler(val) {
        await this.calibrator.$updateImage({ image: { src: this.url } })
        this.updateCalibrations()
        // this.calibrator.$updateCalibrations({ calibrationList: val })
      },
      deep: true
    },
    async url (val) {
      await this.calibrator.$updateImage({ image: { src: val } })
      this.calibrator.$updateCalibrations({ calibrationList: this.calibrationList })
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    updateCalibrations: _.debounce(function () {
      this.calibrator.$updateCalibrations({ calibrationList: this.calibrationList })
    }, 300),
    // 标签选中状态改变
    async afterCalibrationsStatusChange(params) {
      if (params && params.status === 'focus') {
        let focusDomArr = await this.getCalibrationsByStatus('focus')
        this.$emit('chooseFocusDom', (focusDomArr.length > 0) ? focusDomArr : [])
      }
    },
    async getCalibrationsByStatus(status) {
      const calibrations = this.calibrator && (await this.calibrator.$getCalibrationsByStatus({ status }).calibrations)
      return calibrations
    },
    init () {
      const context = this
      const rootDom = this.$refs.calibrator
      this.calibrator = this.$createCalibrator({
        rootDom,
        image: {
          src: this.url
        },
        operationTypeList: this.operationTypeList,
        editTypeList: [],
        calibrationKey: this.calibrationKey,
        labelKey: this.labelKey,
        calibrationList: this.calibrationList,
        callback: {
          afterCalibrationsStatusChange: { func: async function (params) {
            this.afterCalibrationsStatusChange(params)
          }, context },
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.calibrator {
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
