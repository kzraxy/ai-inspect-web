<template>
  <div class="inputNameEdit" :style="{
    'fontSize': fontSize + 'px',
    'width': width ? (width + 'px') : 'auto',
    'max-width': (maxWidth < width ? width : maxWidth)  + 'px'
  }" @mouseenter="handleMouseenter($event)" @mouseleave="handleMouseleave($event)">
    <span class="nameText" :title="name" v-if="!isEdit">{{name}}</span>
    <i v-show="isShowEdit && isHover && !isEdit && !disabled" class="editIcon" :style="{
      'fontSize': iconSize + 'px'
    }" @click="goEdit"></i>
    <el-input ref="elInput" :style="{
      'fontSize': fontSize + 'px'
    }" v-if="isEdit" v-model="name" :maxlength="maxlength" @keyup.enter.native="handleEnter"
      @blur="handleSubmit"></el-input>
    <span v-if="isEdit" class="inputNameEditNumber"><span class="txt">{{name.length}}</span>/{{maxlength}}</span>
  </div>
</template>
<script>
  export default {
    name: 'inputNameEdit',
    components: {},
    data() {
      return {
        name: '',
        isEdit: false,
        isHover: false
      }
    },
    props: {
      value: {
        type: String,
        default: ''
      },
      maxlength: {
        type: Number,
        default: 16
      },
      fontSize: {
        type: Number,
        default: 14
      },
      iconSize: {
        type: Number,
        default: 16
      },
      isUpdateImmediate: {
        type: Boolean,
        default: true
      },
      width: {
        type: Number,
        default: 110
      },
      maxWidth: {
        type: Number,
        default: 110
      },
      disabled: {
        type: Boolean,
        default: false
      },
      isShowEdit: {
        type: Boolean,
        default: false
      },
      isAlwaysShowEdit: {
        type: Boolean,
        default: false
      },
      nameReg: {
        type: RegExp,
        default() {
          return /^[a-zA-Z0-9\u4e00-\u9fa5`~!@#\$%\^&\*()_\+\-=\{\}\[\];:><,.，。：“”；‘’【】（）%、？\?○≤《》≥]{1,32}$/
        }
      },
      nameRegMsg: {
        type: String,
        default: '不支持除了`~!@#$%^&*()_+-={}[];:><,.，。：“”；‘’【】（）%、？?○≤《》≥以外的特殊字符'
      }
    },
    watch: {
      value(val) {
        this.name = val
      }
    },
    mounted() {
      this.name = this.value
      if (this.isAlwaysShowEdit) {
        this.isHover = true
      }
    },
    methods: {
      handleEnter() {
        this.$refs.elInput.$el.querySelector('input').blur()
      },
      /**
       * 外部接口失败时重置
       */
      reset() {
        this.name = this.value
      },
      handleMouseenter(e) {
        this.isHover = true
      },
      handleMouseleave() {
        if (!this.isAlwaysShowEdit) {
          this.isHover = false
        }
      },
      handleSubmit() {
        this.$emit('endEdit')
        if (!this.name) {
          this.$message.warning('名称不能为空')
          this.name = this.value
          this.isEdit = false
          return
        }
        // if (!this.nameReg.test(this.name)) {
        //   this.$message.warning(this.nameRegMsg)
        //   this.name = this.value
        //   this.isEdit = false
        //   return
        // }
        this.isEdit = false
        if (this.name === this.value) return
        if (this.isUpdateImmediate) {
          this.$emit('input', this.name)
        } else {
          this.$emit('update', this.name)
        }
      },
      goEdit() {
        if (this.disabled) return
        this.isEdit = true
        this.$emit('startEdit')
        this.$nextTick(() => {
          this.$refs.elInput.$el.querySelector('input').style.fontSize = this.fontSize + 'px'
          this.$refs.elInput.$el.querySelector('input').focus()
          this.$refs.elInput.$el.querySelector('input').select()
        })
      }
    }
  }
</script>
<style lang="scss" scoped>
  .inputNameEdit {
    display: inline-flex;
    align-items: center;

    .nameText {
      display: inline-block;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .editIcon {
      width: 24px;
      height: 24px;
      background-image: url(~@/assets/img/edit.svg);
      background-size: 100% 100%;
      background-repeat: no-repeat;
      cursor: pointer;
      margin-left: 8px;
      flex-shrink: 0;

      &:hover {
        background-image: url(~@/assets/img/editHover.svg);
      }
    }

    .el-input {
      ::v-deep .el-input__inner {
        height: 24px;
        line-height: 24px;
        border: none;
        border-bottom: 1px dashed #e2e3e6;
      }
    }

    .inputNameEditNumber {
      color: rgba(0, 0, 0, 0.20);
      letter-spacing: 0.47px;
      line-height: 18px;
      font-weight: 400;

      .txt {
        color: rgba(0, 0, 0, 0.90);
      }
    }
  }
</style>