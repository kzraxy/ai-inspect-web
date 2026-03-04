<template>
  <label
    :id="id"
    :class="[
      border && checkboxSize ? 'el-checkbox--' + checkboxSize : '',
      { 'is-disabled': isDisabled },
      { 'is-bordered': border },
      { 'is-checked': isChecked }
    ]"
    :aria-checked="indeterminate ? 'mixed' : isChecked"
    :aria-disabled="isDisabled"
    class="el-checkbox"
    role="checkbox"
  >
    <span v-if="icon" class="el-checkbox__icon">
      <i :class="icon" />
    </span>
    <span
      v-if="$slots.default || label"
      :title="titleLabel"
      class="el-checkbox__label"
      @mouseover="handleMouseover"
    >
      <slot />
      <template v-if="!$slots.default && showLabel">
        {{ label }}
      </template>
    </span>
    <span
      :class="{
        'is-disabled': isDisabled,
        'is-checked': isChecked && !indeterminate,
        'is-indeterminate': indeterminate,
        'is-focus': focus
      }"
      class="el-checkbox__input"
      aria-checked="mixed"
    >
      <span class="el-checkbox__inner">
        <i
          v-if="isChecked"
          class="h-icon-done"
          style="font-size: 14px; color: #2080f7; font-weight: bold"
        ></i>
        <!-- <h-svg-icon :size="14" :svgs="checkSvg"/> -->
      </span>
      <input
        v-if="trueLabel || falseLabel"
        v-model="model"
        :name="name"
        :disabled="isDisabled"
        :true-value="trueLabel"
        :false-value="falseLabel"
        class="el-checkbox__original"
        type="checkbox"
        aria-hidden="true"
        @change="handleChange"
        @focus="focus = true"
        @blur="focus = false"
      />
      <input
        v-else
        v-model="model"
        :disabled="isDisabled"
        :value="label"
        :name="name"
        class="el-checkbox__original"
        type="checkbox"
        aria-hidden="true"
        @change="handleChange"
        @focus="focus = true"
        @blur="focus = false"
      />
    </span>
  </label>
</template>
<script>
import Emitter from 'hui/src/mixins/emitter';
import hSvgIcon from 'hui/packages/svg-icon';

export default {
  components: {
    hSvgIcon
  },

  mixins: [Emitter],

  inject: {
    elForm: {
      default: ''
    },
    elFormItem: {
      default: ''
    }
  },


  props: {
    value: {
      type: [String, Number, Boolean],
      default: undefined
    },
    label: {
      type: [String, Number, Boolean],
      default: undefined
    },
    indeterminate: {
      type: Boolean,
      default: null
    },
    disabled: {
      type: Boolean,
      default: null
    },
    checked: {
      type: Boolean,
      default: null
    },
    name: {
      type: String,
      default: undefined
    },
    trueLabel: {
      type: [String, Number],
      default: undefined
    },
    falseLabel: {
      type: [String, Number],
      default: undefined
    },
    id: {
      type: String,
      default: undefined
    } /* 当indeterminate为真时，为controls提供相关连的checkbox的id，表明元素间的控制关系 */,
    controls: {
      type: String,
      default: undefined
    } /* 当indeterminate为真时，为controls提供相关连的checkbox的id，表明元素间的控制关系 */,
    border: {
      type: Boolean,
      default: null
    },
    size: {
      type: String,
      default: 'medium'
    },
    icon: {
      type: String,
      default: undefined
    },
    showLabel: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      checkSvg: [require('../../../../assets/svg/checkbox_checked.svg')],
      selfModel: false,
      focus: false,
      isLimitExceeded: false,
      titleLabel: ''
    };
  },

  computed: {
    model: {
      get() {
        return this.isGroup
          ? this.store
          : this.value !== undefined
          ? this.value
          : this.selfModel;
      },

      set(val) {
        if (this.isGroup) {
          this.isLimitExceeded = false;
          this._checkboxGroup.min !== undefined &&
            val.length < this._checkboxGroup.min &&
            (this.isLimitExceeded = true);

          this._checkboxGroup.max !== undefined &&
            val.length > this._checkboxGroup.max &&
            (this.isLimitExceeded = true);

          this.isLimitExceeded === false &&
            this.dispatch('ElCheckboxGroup', 'input', [val]);
        } else {
          this.$emit('input', val);
          this.selfModel = val;
        }
      }
    },

    isChecked() {
      if ({}.toString.call(this.model) === '[object Boolean]') {
        return this.model;
      } else if (Array.isArray(this.model)) {
        return this.model.indexOf(this.label) > -1;
      } else if (this.model !== null && this.model !== undefined) {
        return this.model === this.trueLabel;
      }
      return false;
    },

    isGroup() {
      let parent = this.$parent;
      while (parent) {
        if (parent.$options.componentName !== 'ElCheckboxGroup') {
          parent = parent.$parent;
        } else {
          this._checkboxGroup = parent; // eslint-disable-line
          return true;
        }
      }
      return false;
    },

    store() {
      return this._checkboxGroup ? this._checkboxGroup.value : this.value;
    },

    isDisabled() {
      return this.isGroup
        ? this._checkboxGroup.disabled ||
            this.disabled ||
            (this.elForm || {}).disabled
        : this.disabled || (this.elForm || {}).disabled;
    },

    _elFormItemSize() {
      return (this.elFormItem || {}).elFormItemSize;
    },

    checkboxSize() {
      const temCheckboxSize =
        this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
      return this.isGroup
        ? this._checkboxGroup.checkboxGroupSize || temCheckboxSize
        : temCheckboxSize;
    }
  },

  watch: {
    value(value) {
      this.dispatch('ElFormItem', 'el.form.change', value);
    }
  },

  created() {
    this.checked && this.addToStore();
  },
  mounted() {
    // 为indeterminate元素 添加aria-controls 属性
    if (this.indeterminate) {
      this.$el.setAttribute('aria-controls', this.controls);
    }
  },

  methods: {
    addToStore() {
      if (Array.isArray(this.model) && this.model.indexOf(this.label) === -1) {
        this.model.push(this.label);
      } else {
        this.model = this.trueLabel || true;
      }
    },
    // 鼠标悬停显示Label
    handleMouseover(e) {
      const t = e.target;
      if (t.tagName === 'SPAN') {
        if (t.scrollWidth >= t.offsetWidth) {
          this.titleLabel = t.innerText;
        } else {
          this.titleLabel = '';
        }
      }
    },
    handleChange(ev) {
      if (this.isLimitExceeded) return;
      let value;
      if (ev.target.checked) {
        value = this.trueLabel === undefined ? true : this.trueLabel;
      } else {
        value = this.falseLabel === undefined ? false : this.falseLabel;
      }

      this.$emit('change', value, ev);
      this.$nextTick(() => {
        if (this.isGroup) {
          this.dispatch('ElCheckboxGroup', 'change', [
            this._checkboxGroup.value
          ]);
        }
      });
    }
  }
};
</script>
