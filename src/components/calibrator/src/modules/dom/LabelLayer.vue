<comment>
    # @Description :
    # @Author : liushijie
    # @Date :2021-10-19 14:10
    # @Version :
    # @Last Modified by : liushijie
    # @Last Modified Date : 2021-10-19 14:10
    # @Last Modified Version :
    # @Last Modified Description :
</comment>
<template>
  <div class="label-layer">
    <template v-for="target in calibrations">
      <div
        v-if="calibrationMap[target.id].labelPoint"
        :key="target.id"
        class="label-direction-wrap"
        :style="{
          ...calibrationMap[target.id].style.labelList[target.status],
          left: `${calibrationMap[target.id].labelPoint.x}px`,
          top: `${calibrationMap[target.id].labelPoint.y}px`,
          height: 0,
          width: 0
        }"
      >
        <div
          class="label-list-wrap"
          :style="{
            margin: `${cfg.control.HOT_RADIUS}px 0`,
            ...calibrationMap[target.id].style.labelList[target.status],
            flexDirection: 'column'
          }"
          @mouseenter="handleMouseEnter(calibrationMap[target.id])"
          @mouseleave="handleMouseLeave(calibrationMap[target.id])"
        >
          <div
            v-show="index < 5 || target.status !== statuses.NORMAL"
            v-for="(label, index) in calibrationMap[target.id].labelList"
            :key="label.id"
            class="label-item"
            :style="{
              ...label.style[target.status]
            }"
          >
            <span class="label-item-text">{{ label.text }}</span>
            <img
              :src="require('@/assets/images/empty_label.png')"
              class="label-item-delete"
              v-show="label.deletable && target.status === statuses.FOCUS"
              @click="handleDeleteLabel(target, label)"
            />
          </div>
          <div
            v-if="calibrationMap[target.id].labelList.length > 5"
            class="label-item show-more-prompt"
          >
            <span
              :style="{
                ...calibrationMap[target.id].labelList[0].style[target.status]
              }"
            >
              {{ `更多(${calibrationMap[target.id].labelList.length - 6})` }}
            </span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
<script>
import commonUtil from '../../utils/common';
import cfg from '../../config';

export default {
  name: 'LabelLayer',
  components: {},
  mixins: [],
  props: {
    calibrationList: { type: Array },
    labelHoverCallback: { type: Function, default: () => {} }
  },

  data() {
    return {
      cfg,
      deleteIcon: require('../../assets/icon_24_delete.png'),
      calibrations: [],
      calibrationMap: {},
      statuses: cfg.status,
      observer: null,
      storage: {}
    };
  },
  methods: {
    setStorage(storage) {
      this.storage = storage;
    },
    setObserver(observer) {
      this.observer = observer;
      const context = this;
      this.observer.addListener('calibrations:changed', {
        name: 'updateLabelList',
        context
      });
      this.observer.addListener('calibrations:statusChanged', {
        name: 'updateLabelLayerCalibrations',
        context
      });
      this.observer.addListener('calibrations:labelListChanged', {
        name: 'updateLabelList',
        context
      });
    },
    updateLabelList() {
      const calibrations = this.storage?.calibrations || [];
      const list = [];
      const calibrationMap = {};
      for (let i = 0; i < calibrations.length; i++) {
        const { id } = calibrations[i];
        const { status } = calibrations[i];
        const labelPoint = commonUtil.copy(calibrations[i]?.labelPoint || { x: 0, y: 0 });
        list.push({ id, status, labelPoint });
        calibrationMap[id] = calibrations[i];
      }
      this.calibrationMap = calibrationMap;
      this.calibrations = list;
    },
    updateLabelLayerCalibrations({ calibrationKeys, status }) {
      for (let i = 0; i < this.calibrations.length; i++) {
        let include = false;
        for (let k = 0; k < calibrationKeys.length; k++) {
          if (this.calibrations[i].id === calibrationKeys[k]) {
            this.calibrations[i].status = status;
            include = true;
            break;
          }
        }
        if (!include && this.calibrations[i].status === status) {
          this.calibrations[i].updateStatus(cfg.status.NORMAL);
        }
      }
    },
    async handleMouseEnter(calibration) {
      await this.storage.updateHoverCalibration({ image: this.storage.image, calibration });
    },
    async handleMouseLeave() {
      await this.storage.updateHoverCalibration({ image: this.storage.image });
    },
    async handleDeleteLabel(target, label) {
      await this.storage.deleteCalibrationLabels({
        calibrationKey: target.id,
        labelIds: [label.id]
      });
    }
  }
};
</script>
<style scoped>
.label-layer {
  position: absolute;
  left: 0;
  top: 0;
  width: 0;
  height: 0;
}
.label-direction-wrap {
  position: absolute;
}
.label-list-wrap {
  box-sizing: content-box;
}
.label-list-wrap div {
  display: none !important;
}
.label-list-wrap div:nth-child(1),
.label-list-wrap div:nth-child(2),
.label-list-wrap div:nth-child(3),
.label-list-wrap div:nth-child(4),
.label-list-wrap div:nth-child(5),
.label-list-wrap .show-more-prompt,
.label-list-wrap:hover div {
  display: inline-flex !important;
}
.label-list-wrap:hover {
  width: auto !important;
  height: auto !important;
  overflow: auto !important;
}
.label-list-wrap:hover .show-more-prompt {
  display: none !important;
}
.label-item {
}
.label-item-text {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.label-item-delete {
  opacity: 0.9;
  margin: 0 -6px 0 0;
  height: 24px;
  flex-shrink: 0;
  cursor: pointer;
}
.label-item-delete:hover {
  opacity: 0.7;
}
.label-layer div::-webkit-scrollbar {
  background: rgba(0, 0, 0, 0) !important;
  width: 6px !important;
  height: 6px !important;
}
.label-layer div::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  border-radius: 8px !important;
}
.label-layer div::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.5) !important;
  border-radius: 8px;
}
</style>
