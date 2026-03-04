/* * @Author: zhengjie7 * @Date: 2019-03-05 15:11:38 * @Last Modified by:
zhengjie7 * @Last Modified time: 2019-03-18 21:08:41 * @des 下拉搜索多选 */ /* *
@Author: zhengjie7 * @Date: 2018-12-17 09:51:36 * @Last Modified by: zhengjie7 *
@Last Modified time: 2019-02-20 10:56:58 * @desc 多选搜索框 */
<template>
  <div
    ref="hSelectTreeOption"
    :class="{ 'only-show-panel': onlyShowPanel, 'width-auto': widthAuto }"
    class="h-select-tree-option"
  >
    <div v-if="disabled" class="mask-disabled"></div>
    <div
      v-if="!onlyShowPanel"
      :title="selectNames"
      class="multi-search-tags"
      @click="openPanel"
      @mouseenter="mouseenter"
      @mouseleave="mouseleave"
    >
      <div v-if="type === 'checkbox'" ref="tagContainer" class="tags-container">
        <el-tag
          v-for="(item, index) in showDatas"
          :key="index"
          :title="item[option.name]"
          :closable="true"
          max-width="125px"
          @close.stop="removeItem(item[option.value])"
        >
          {{ item[option.name] }}
        </el-tag>
        <el-tag v-show="lastLength > 0" :title="selectNames" class="add-tag">
          {{ `+${lastLength}` }}
        </el-tag>
        <div ref="calcTagWarpper" class="calc-tag-warpper">
          <el-tag ref="tag" :closable="true"></el-tag>
        </div>
      </div>
      <el-input
        :placeholder="radioValue ? '' : placeholder"
        unselectable="on"
        readonly
      >
        <!-- <i
          slot="suffix"
          :class="['el-input__icon', icon, { 'icon-rotate': showPanel }]"
          @click.stop="removeItem($event, true)"
        /> -->
        <div slot="suffix">
          <i
            v-if="icon"
            :class="['el-input__icon', icon]"
            @click.stop="removeItem($event, true)"
          />
          <i
            style="left: 24px; cursor: pointer;"
            :class="[
              'el-input__icon',
              'h-icon-angle_down_sm',
              { 'icon-rotate': showPanel }
            ]"
          />
        </div>
      </el-input>
      <div
        v-if="type === 'radio'"
        v-show="radioValue"
        :title="radioValue"
        class="single-value"
      >
        {{ radioValue }}
      </div>
    </div>
    <div
      v-show="onlyShowPanel || showPanel"
      ref="option-panel"
      :class="[{ 'has-border': border }, customClass]"
      :style="positionStyle"
      class="select-down-panel"
    >
      <el-scrollbar wrap-class="panel-warp">
        <div
          v-loading="loading"
          :class="{ 'is-borad': isBroad }"
          class="h-select-tree-option-panel"
          :style="{width: panelWidth + 'px'}"
        >
          <div v-if="hasHeader" class="h-option-panel-header">
            <div
              v-if="hasShowNum"
              v-show="type === 'checkbox'"
              class="header-left"
            >
              {{ hasSelectCount }}
            </div>
            <div v-if="$scopedSlots.headerLeft" class="header-left">
              <slot :cacheValue="valueClone" name="headerLeft"></slot>
            </div>
            <div v-if="hasContain" class="header-right">
              <slot name="before-has-contain"></slot>
              <el-checkbox
                v-model="containChildren"
                @change="includeSubordinateChange"
              >
                {{ tm('h.selectTreeOption.containChildren') }}
              </el-checkbox>
              <slot name="after-has-contain"></slot>
            </div>
          </div>
          <div class="h-option-panel-content">
            <div class="h-option-panel-content-left" style="padding-right:0px;padding-left:0px;">
              <div v-if="hasTreeSearch" class="search-container">
                <el-input
                  v-model="treeText"
                  :clear-icon-click="treeClear"
                  :on-icon-click="treeSearch"
                  :maxlength="leftInputMaxLength"
                  :placeholder="
                    treePlaceholder
                      ? treePlaceholder
                      : tm('h.selectTreeOption.search')
                  "
                  suffix-icon="h-icon-search"
                  clearable
                  @keyup.enter.native="treeSearch"
                ></el-input>
              </div>
              <slot name="tree"></slot>
            </div>
            <div class="h-option-panel-content-right">
              <div v-if="hasOptionSearch" class="search-container">
                <el-input
                  v-model="optionText"
                  :clear-icon-click="optionClear"
                  :on-icon-click="optionSearch"
                  :maxlength="rightInputMaxLength"
                  :placeholder="
                    optionPlaceholder
                      ? optionPlaceholder
                      : tm('h.selectTreeOption.search')
                  "
                  suffix-icon="h-icon-search"
                  clearable
                  @keyup.enter.native="optionSearch"
                ></el-input>
              </div>
              <div
                v-if="type === 'checkbox' && maxSelect === 0 && hasCheckAll"
                :class="{
                  'is-disabled': optionDisabled('all'),
                  'is-checkall-border': selectAllBorder
                }"
                class="h-select-tree-option-item"
              >
                <el-checkbox
                  v-model="checkAll"
                  :disabled="optionDisabled('all')"
                  :indeterminate="indeterminate"
                  @change="checkAllChange"
                >
                  {{ cptCheckAllName }}
                </el-checkbox>
              </div>
              <div class="option-container">
                <el-scrollbar
                  ref="scrollbar"
                  wrap-class="h-select-tree-option-warp"
                  @on-scrolling-y="scroll"
                >
                  <slot
                    v-if="$scopedSlots.option"
                    :optionText="optionText"
                    :valueClone="valueClone"
                    :disabled="
                      maxSelect > 0 && maxSelect <= valueClone.values.length
                    "
                    name="option"
                  ></slot>
                  <template v-else>
                    <h-select-tree-option-item
                      v-for="item in optionData"
                      :key="item[option.value]"
                      :option="option"
                      :data="item"
                      :type="type"
                      :option-disabled-fn="optionDisabledFn"
                      :disabled="optionDisabled(item)"
                      :option-text="optionText"
                    ></h-select-tree-option-item>
                  </template>
                  <div v-show="currentOptions.total === 0" class="no-data">
                    {{ noData }}
                  </div>
                </el-scrollbar>
              </div>
              <div v-if="$scopedSlots.pagination" class="option-pagination">
                <slot name="pagination"></slot>
              </div>
            </div>
          </div>
          <div v-if="hasFooter" class="h-option-panel-footer">
            <el-button type="primary" @click="saveValue">
              {{ tm('h.selectTreeOption.confirm') }}
            </el-button>
            <el-button type="default" @click="cancelUpdateModel">
              {{ tm('h.selectTreeOption.cancel') }}
            </el-button>
          </div>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script>
import { t } from '@hui-pro/locale';
import Emitter from './mixins/emitter';
import { width } from '@hui-pro/utils';
export default {
  name: 'HSelectTreeOption',
  componentName: 'HSelectTreeOption',
  mixins: [Emitter],
  props: {
    textMap: {
      // 内部文案 maps 集合
      type: Object,
      default() {
        return {
          'h.selectTreeOption.confirm': ''
        };
      }
    },
    leftInputMaxLength: {
      type: Number,
      default: null
    },
    rightInputMaxLength: {
      type: Number,
      default: null
    },
    widthAuto: {
      type: Boolean,
      default: false
    },
    customClass: {
      type: [Array, String],
      default: ''
    }, // 下拉面板class
    loading: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: true
    },
    type: {
      type: String,
      default: 'checkbox'
    }, // 类型，复选框或单选 checkbox, radio
    maxSelect: {
      type: Number,
      default: 0
    }, // 最大选择的限制
    border: {
      type: Boolean,
      default: false
    }, // 是否有边框
    value: {
      type: Object,
      default() {
        return {
          values: [],
          items: []
        };
      }
    },
    hasShowNum: {
      type: Boolean,
      default: true
    },
    hasContain: {
      type: Boolean,
      default: true
    },
    hasHeader: {
      type: Boolean,
      default: true
    }, // 是否有header部分
    hasTreeSearch: {
      type: Boolean,
      default: true
    }, // 是否有树搜索框
    hasOptionSearch: {
      type: Boolean,
      default: true
    }, // 是否有选项搜索框
    hasFooter: {
      type: Boolean,
      default: true
    }, // 是否有底部操作
    checkAllName: {
      type: String,
      default: ''
    }, // 全选名称
    hasCheckAll: {
      type: Boolean,
      default: true
    }, // 是否有全选按钮
    optionData: {
      required: true,
      type: Array,
      default() {
        return [];
      }
    },
    option: {
      type: Object,
      default() {
        return {
          name: 'name',
          value: 'value'
        };
      }
    },
    optionSearchFn: {
      type: Function,
      default: null
    },
    isBroad: {
      type: Boolean,
      default: false
    }, // 宽面板
    onlyShowPanel: {
      type: Boolean,
      default: false
    },
    inputPlaceholder: {
      type: String,
      default: ''
    },
    treePlaceholder: {
      type: String,
      default: ''
    }, // 树
    optionPlaceholder: {
      type: String,
      default: ''
    }, // 选项
    optionDisabledFn: {
      type: Function,
      default: null
    }, // 选项置灰效果
    containChild: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    // 是否展示全部标签
    showAllTags: {
      type: Boolean,
      default: false
    },
    panelWidthProp: {
      type: Number,
      default: 480
    }
  },
  data() {
    return {
      panelWidth: 480,
      initFlag: true, // 第一次打开下拉面板标注位
      t,
      treeText: '', // 树搜索文本
      optionText: '', // 选项过滤文本
      containChildren: true, // 包含下级
      checkAll: false, // 全选状态
      indeterminate: false, // 全选样式控制
      currentOptions: {
        total: 0, // 当前总共有多少个option
        checked: 0, // 当前有多少个选中的option
        currentLists: [], // 当前的option列表
        key: 'id',
        disabledNum: 0 // 当前置灰的数量
      },
      valueClone: {
        values: [],
        datas: []
      }, // v-model的复制，用于确定和取消的保留
      selectAllBorder: false, // 全选的border
      // 之前的
      selectList: [],
      selectIds: [],
      mouseFlag: false, // 鼠标移入flag
      showPanel: false, // 展示面板
      showLength: 0,
      lastLength: 0,
      positionStyle: {
        left: 0,
        top: '36px'
      },
      targetParent: null,
      showDatas: []
    };
  },
  computed: {
    // 单选值
    radioValue: {
      get() {
        return this.type === 'radio'
          ? this.valueClone.datas[this.option.name]
          : '';
      },
      set() {}
    },
    hasSelectCount() {
      if (this.type === 'radio') {
        return '';
      }
      return this.maxSelect > 0
        ? `${this.tm('h.selectTreeOption.selectedNum')}（${
            this.valueClone.values.length
          }/${this.maxSelect}）`
        : `${this.tm('h.selectTreeOption.selectedNum')}（${
            this.valueClone.values.length
          }）`;
    }, // 已选个数
    cptCheckAllName() {
      return this.checkAllName
        ? this.checkAllName
        : this.tm('h.selectTreeOption.selectAll');
    }, // 全选名称
    icon() {
      const flag =
        this.type === 'checkbox'
          ? this.valueClone.values.length !== 0
          : this.valueClone.values !== '';
      return this.mouseFlag && flag ? 'h-icon-close_f' : '';
    }, // 图标样式
    placeholder() {
      const flag =
        this.type === 'checkbox'
          ? this.valueClone.values.length !== 0
          : this.valueClone.values !== '';
      return flag
        ? ''
        : this.inputPlaceholder
        ? this.inputPlaceholder
        : this.tm('h.selectTreeOption.select');
    }, // 下拉的提示文字
    noData() {
      return this.optionText
        ? this.tm('h.selectTreeOption.noMatchText')
        : this.tm('h.selectTreeOption.noDataText');
    }, // 无数据提示语
    // 面板高度
    panelHeight() {
      return this.hasHeader ? (this.hasFooter ? 400 : 352) : 304;
    },
    // // 面板宽度
    // panelWidth() {
    //   return this.isBroad ? 560 : 480;
    // },
    // 选中名字
    selectNames() {
      return this.valueClone.datas.length
        ? this.valueClone.datas.map(item => item[this.option.name]).join(',')
        : '';
    }
  },
  watch: {
    containChild: {
      immediate: true,
      handler(val) {
        this.containChildren = val;
      }
    },
    optionData(val) {
      this.$nextTick(() => {
        this.$refs.scrollbar && this.$refs.scrollbar.handleScroll(); // 重新计算是全选是否有下边框线
        this.checkUpdate();
      });
    },
    value(val) {
      this.valueClone = JSON.parse(JSON.stringify(val));
      this.checkUpdate();
    },
    'valueClone.datas'() {
      this.calcShowNum();
    },
    showPanel(val) {
      this.$emit('panel-change', val);
    }
  },
  created() {
    if (this.onlyShowPanel) {
      this.initFlag = false;
    }
    this.valueClone = JSON.parse(JSON.stringify(this.value));
    this.$on('changeChecked', this.changeChecked);
    if (typeof window !== 'undefined') {
      window && window.addEventListener('click', this.closeSelect);
      window && window.addEventListener('scroll', this.calcPosition);
      window && window.addEventListener('resize', this.resize);
    }
  },
  mounted() {
    this.checkUpdate();
    if (this.type === 'checkbox') {
      this.calcShowNum();
    }
    this.initParentScroll();
  },
  beforeDestroy() {
    this.removePanel();
    if (typeof window !== 'undefined') {
      window.removeEventListener('click', this.closeSelect);
      window.removeEventListener('scroll', this.calcPosition);
      window.removeEventListener('resize', this.resize);
      if (this.targetParent) {
        this.targetParent.removeEventListener('scroll', this.calcPosition);
      }
    }
  },
  methods: {
    tm(key) {
      return this.textMap[key] || t(key);
    },
    // 处理自定义滚动条的滚动事件
    initParentScroll() {
      this.targetParent = this.getScrollParent(this.$refs.hSelectTreeOption);
      if (
        this.targetParent === window.document.body ||
        this.targetParent === window.document.documentElement
      ) {
        this.targetParent = null;
      } else {
        this.targetParent.addEventListener('scroll', this.calcPosition);
      }
    },
    getScrollParent(element) {
      var parent = element.parentNode;

      if (!parent) {
        return element;
      }

      if (parent === window.document) {
        if (window.document.body.scrollTop) {
          return window.document.body;
        } else {
          return window.document.documentElement;
        }
      }

      if (
        ['scroll', 'auto'].indexOf(
          this.getStyleComputedProperty(parent, 'overflow')
        ) !== -1 ||
        ['scroll', 'auto'].indexOf(
          this.getStyleComputedProperty(parent, 'overflow-x')
        ) !== -1 ||
        ['scroll', 'auto'].indexOf(
          this.getStyleComputedProperty(parent, 'overflow-y')
        ) !== -1
      ) {
        return parent;
      }
      return this.getScrollParent(element.parentNode);
    },
    getStyleComputedProperty(element, property) {
      var css = window.getComputedStyle(element, null);
      return css[property];
    },
    optionDisabled(row) {
      if (this.optionDisabledFn) {
        // 走自动验证
        return this.optionDisabledFn(row);
      } else if (row === 'all') {
        return this.currentOptions.total === 0;
      }
      return (
        this.maxSelect > 0 && this.maxSelect <= this.valueClone.values.length
      );
    },
    // 树搜索框事件
    treeSearch() {
      this.$emit('tree-search', this.treeText, this.containChildren);
    },
    // 树搜索清空事件
    treeClear() {
      this.treeText = '';
      this.treeSearch();
    },
    // 含下级区域切换事件
    includeSubordinateChange(val) {
      this.$emit('has-contain-children', val);
      this.$emit('update:contain-child', val);
    },
    // 选项搜索清空事件
    optionClear() {
      this.optionText = '';
      this.optionSearch();
    },
    // 选项搜索事件
    optionSearch() {
      if (this.optionSearchFn) {
        this.optionSearchFn(this.optionText);
      } else {
        this.checkUpdate();
        this.currentOptions = {
          total: 0,
          checked: 0,
          key: this.currentOptions.key,
          currentLists: [],
          disabledNum: 0
        };
        this.broadcast('HSelectTreeOptionItem', 'checkShow', {
          optionText: this.optionText,
          option: this.currentOptions
        });
      }
    },
    // 全选事件
    checkAllChange(val) {
      if (val) {
        this.currentOptions.checked =
          this.currentOptions.total - this.currentOptions.disabledNum;
        this.update('all', true);
      } else {
        this.currentOptions.checked = 0;
        this.update('all', false);
      }
      this.setCheckState();
      this.broadcast('HSelectTreeOptionItem', 'changeChecked', val);
    },
    // 选项发生变化时
    changeChecked(params) {
      // 通过判断flag来判断是否需要变化选中的数量
      if (this.type === 'checkbox') {
        if (params.flag) {
          if (params.value) {
            this.currentOptions.checked++;
            this.update('single', true, params.key, params.data);
          } else {
            this.currentOptions.checked--;
            this.update('single', false, params.key, params.data);
          }
        }
        this.setCheckState();
      } else {
        if (params.flag) {
          this.valueClone.values = params.value;
          this.valueClone.datas = params.data;
        }
        this.checkUpdate();
        if (!this.hasFooter) {
          this.updateModel();
        }
        if (params.close && !this.hasFooter) {
          this.showPanel = false;
        }
      }
    },
    // 设置全选状态
    setCheckState() {
      this.checkAll =
        this.currentOptions.total > 0 &&
        this.currentOptions.checked > 0 &&
        this.currentOptions.total ===
          this.currentOptions.checked + this.currentOptions.disabledNum;
      this.indeterminate =
        this.currentOptions.checked > 0 &&
        this.currentOptions.checked <
          this.currentOptions.total - this.currentOptions.disabledNum;
    },
    // 更新数据
    update(type, flag, key, data) {
      if (type === 'single') {
        // 单项变化
        if (flag) {
          // 增加
          this.valueClone.values.push(data[key]);
          this.valueClone.datas.push(data);
        } else {
          // 减少
          this.valueClone.values = this.valueClone.values.filter(item => {
            return item !== data[key];
          });
          this.valueClone.datas = this.valueClone.datas.filter(item => {
            return item[key] !== data[key];
          });
        }
      } else {
        // 全选变化
        if (flag) {
          // 全选中
          this.currentOptions.currentLists.forEach(item => {
            if (
              !this.valueClone.values.includes(item[this.currentOptions.key]) &&
              !item.disabled
            ) {
              this.valueClone.values.push(item[this.currentOptions.key]);
              this.valueClone.datas.push(item);
            }
          });
        } else {
          // 全取消
          const keys = [];
          this.currentOptions.currentLists.forEach(item => {
            keys.push(item[this.currentOptions.key]);
          });
          this.valueClone.values = this.valueClone.values.filter(item => {
            return !keys.includes(item);
          });
          this.valueClone.datas = this.valueClone.datas.filter(item => {
            return !keys.includes(item[this.currentOptions.key]);
          });
        }
      }
      // this.calcShowNum();
      if (!this.hasFooter) {
        this.updateModel();
      }
    },
    // 更新v-model
    updateModel() {
      this.$emit('input', this.valueClone);
    },
    // 保存更新
    saveValue() {
      this.updateModel();
      this.showPanel = false;
      this.$emit('save-click');
    },
    // 取消更新
    cancelUpdateModel() {
      this.valueClone = JSON.parse(JSON.stringify(this.value));
      // this.calcShowNum();
      this.checkUpdate();
      this.showPanel = false;
      this.$emit('cancel-click');
    },
    // 通知子组件更新数据
    checkUpdate() {
      this.currentOptions = {
        total: 0,
        checked: 0,
        key: 'id',
        currentLists: [],
        disabledNum: 0
      };
      this.broadcast('HSelectTreeOptionItem', 'checkUpdate', {
        val: this.valueClone.values,
        option: this.currentOptions
      });
    },
    scroll(param) {
      this.selectAllBorder = param.scrollTop !== 0;
      this.$emit('option-scroll-y', param);
    },
    // 原先的
    // 点击空白处，关闭select下拉
    closeSelect(e) {
      if (
        this.showPanel &&
        this.$refs.hSelectTreeOption &&
        !this.$refs.hSelectTreeOption.contains(e.target) &&
        this.$refs['option-panel'] &&
        !this.$refs['option-panel'].contains(e.target)
      ) {
        this.closePanel();
      }
    },
    closePanel() {
      this.showPanel = false;
      if (this.hasFooter) {
        this.cancelUpdateModel();
      }
    },
    // 删除全部或某一项或关闭弹窗（icon下拉和删除图标公用一个事件）
    removeItem(id, flag = false) {
      if (flag) {
        if (this.icon === 'h-icon-close_f') {
          if (this.type === 'checkbox') {
            // 全部删除
            this.valueClone = {
              values: [],
              datas: []
            };
          } else {
            this.valueClone = {
              values: '',
              datas: {}
            };
          }
          this.checkUpdate();
          this.$emit('remove-all');
        } else {
          // 关闭下拉框
          this.openPanel();
        }
      } else {
        // 删除某个id项
        this.valueClone.values = this.valueClone.values.filter(item => {
          return item !== id;
        });
        this.valueClone.datas = this.valueClone.datas.filter(item => {
          return item[this.currentOptions.key] !== id;
        });
        this.checkUpdate();
        this.$emit('remove-single', id);
      }
      if (!this.showPanel || (this.showPanel && !this.hasFooter)) {
        this.updateModel();
      }
    },
    // 鼠标移入
    mouseenter() {
      if (this.clearable) {
        this.mouseFlag = true;
      }
    },
    mouseleave() {
      this.mouseFlag = false;
    },
    // 计算已选的内容
    calcShowNum() {
      if (this.type === 'checkbox') {
        this.$nextTick(() => {
          setTimeout(() => {
            const tagContainerWidth = this.$refs.tagContainer
              ? parseInt(window.getComputedStyle(this.$refs.tagContainer).width)
              : 0;
            const tags = this.$refs.tag;
            if (tags) {
              const dataLength = this.valueClone.datas.length;
              // 展示全部标签，或者根据宽度收起剩余标签
              if (this.showAllTags) {
                this.showLength = dataLength;
              } else {
                const fontSize = window.getComputedStyle(tags.$el).fontSize;
                // const tagBaseWidth = parseInt(
                //   window.getComputedStyle(tags.$el).width
                // );
                const tagBaseWidth = 37;
                let tagWidths = 0;
                let maxLength = 0;
                for (let i = 0; i < dataLength; i++) {
                  tagWidths +=
                    this.calcStringClientWidth(
                      this.valueClone.datas[i][this.option.name],
                      fontSize
                    ) + tagBaseWidth;
                  const addTagWidth =
                    dataLength > i + 1
                      ? this.calcStringClientWidth(
                          `+${dataLength - i - 1}`,
                          fontSize
                        ) + 8 // 8为padding+margin值
                      : 0;
                  // this.calcStringClientWidth(`+${dataLength - i}`, fontSize) +
                  // 4; // 4为padding值
                  if (tagWidths + addTagWidth < tagContainerWidth) {
                    maxLength = i + 1;
                  } else {
                    break;
                  }
                }
                this.showLength = maxLength;
              }
              this.lastLength = this.valueClone.datas.length - this.showLength;
              this.showDatas = this.valueClone.datas.slice(0, this.showLength);
            }
          }, 0);
        });
      }
    },
    // 计算字符串在页面中展示的实际宽度
    calcStringClientWidth(str, fontSize) {
      if (!this.$refs.tag) return;
      const tempDom = document.createElement('div');
      tempDom.style.display = 'inline-block';
      tempDom.style.fontSize = fontSize;
      tempDom.innerHTML = str;
      this.$refs.calcTagWarpper.appendChild(tempDom);
      const width = tempDom.offsetWidth;
      this.$refs.calcTagWarpper.removeChild(tempDom);
      return width > 125 ? 125 : width;
    },
    // 打开或关闭面板
    openPanel() {
      this.calcPosition(true);
      if (this.initFlag) {
        // 初始化这边处理
        this.initFlag = false;
        document.body.appendChild(this.$refs['option-panel']);
      }
      if (this.showPanel) {
        this.closePanel();
      } else {
        this.showPanel = true;
      }
    },
    // 计算展示面板在左侧还是右侧,上侧还是下侧
    calcPosition(flag = false) {
      this.panelWidth = this.panelWidthProp ? this.panelWidthProp : this.isBroad ? 560 : 480
      if (this.showPanel | flag) {
        const scrollTop =
          document.documentElement.scrollTop || document.body.scrollTop;
        const scrollLeft =
          document.documentElement.scrollLeft || document.body.scrollLeft;
        const clientHeight =
          document.documentElement.clientHeight || document.body.clientHeight;
        const clientWidth =
          document.documentElement.clientWidth || document.body.clientWidth;
        const eltop = this.$el.getBoundingClientRect().top;
        const elbottom = this.$el.getBoundingClientRect().bottom;
        const elLeft = this.$el.getBoundingClientRect().left;
        const elRight = this.$el.getBoundingClientRect().right;
        if (
          clientHeight - elbottom > this.panelHeight ||
          eltop < this.panelHeight + 4
        ) {
          // 面板在下方
          if (clientWidth - elLeft > this.panelWidth) {
            // 面板在左侧
            this.positionStyle = {
              left: elLeft + scrollLeft + 'px',
              top: elbottom + scrollTop + 4 + 'px'
            };
          } else {
            // 在右侧
            this.positionStyle = {
              left: elRight + scrollLeft - this.panelWidth + 'px',
              top: elbottom + scrollTop + 4 + 'px'
            };
          }
          // 当面板有header和footer时，在分辨率比较小，比如笔记本中会出现面板在上方和下方都没办法显示全，默认在下方，使用滚动条
          if (clientHeight - elbottom <= this.panelHeight) {
            this.positionStyle.height = clientHeight - elbottom - 10 + 'px';
          }
        } else {
          // 面板在上方
          if (clientWidth - elLeft > this.panelWidth) {
            // 面板在左侧
            this.positionStyle = {
              left: elLeft + scrollLeft + 'px',
              top: elbottom + scrollTop - 36 - this.panelHeight + 'px'
            };
          } else {
            // 在右侧
            this.positionStyle = {
              left: elRight + scrollLeft - this.panelWidth + 'px',
              top: elbottom + scrollTop - 36 - this.panelHeight + 'px'
            };
          }
        }
      }
    },
    // resize事件
    resize() {
      this.calcShowNum();
      this.calcPosition();
    },
    // 移除下拉面板
    removePanel() {
      !this.initFlag &&
        !this.onlyShowPanel &&
        document.body.removeChild(this.$refs['option-panel']);
    }
  }
};
</script>
