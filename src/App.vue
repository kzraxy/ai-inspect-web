<template>
  <div id="app">
    <typical-layout>
      <!-- <keep-alive>
        <router-view v-if="$route.meta.keepAlive" />
      </keep-alive>
      <router-view v-if="!$route.meta.keepAlive" /> -->
    </typical-layout>
  </div>
</template>

<script>
import TypicalLayout from '@/pages/layout/layout.vue'
export default {
  name: 'app',
  components: {
    TypicalLayout,
  }
}
</script>
<style lang="scss">
@import '~@/assets/icon/iconfont.css';

.h-page-menu {
  .el-menu-icon {
    font-size: 16px !important;
  }
  .el-scrollbar__bar.is-vertical{
    opacity: 0.4!important;
  }
}

.h-select-tree-option {
  .el-input__suffix {
    .h-icon-close_f {
      z-index: 999;
      background: #fff;
    }
  }
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.page-head {
  border-bottom: 1px solid #dedede;
  padding: 10px 10px;
  font-size: 16px;

  .el-breadcrumb {
    display: flex;
    align-items: center;

    .breadcrumb_item1 {
      display: flex;
      align-items: center;

      .el-breadcrumb__item__inner {
        display: flex;
        align-items: center;
        cursor: pointer;

        :hover {
          color: #2080f7;
        }

        i {
          padding-right: 10px;
          font-size: 18px;
        }
      }
    }

    .breadcrumb_item2 {
      display: flex;
      align-items: center;
    }
  }
}
.self_dropitem{
  background-color: white!important;
}
.self_dropitem{
  &:hover{
    background-color: rgba(0, 0, 0, 0.02)!important;
  }
}
.single_dropitem{
  &:hover{
    color: #2080f7!important;
    background: rgba(30,127,255,0.04)!important;
  }
}
.single_choose_dropitem{
  color: #2080f7!important;
  background: rgba(30,127,255,0.04)!important;
}
.radioGroup{
  .el-radio-button:first-child .el-radio-button__inner {
    border-radius: 4px 0 0 4px;
  }
  .el-radio-button:last-child .el-radio-button__inner {
    border-radius: 0 4px 4px 0;
  }
}
.mr20{
  margin-right: 20px;
}
.el-tooltip__popper{
  background: #474747!important;
  color: #FFFFFF;
  font-size: 12px!important;
  border-radius: 4px!important;
}
.el-tooltip__popper .popper__arrow:after{
  left: -6px;
  top: -6px;
  border-color: #474747!important;
}
.el-dialog__body > .el-scrollbar{
  width: 100%;
}
.org{
  .h-icon-close_f.is-clickable{
    top: 5px;
  }
}
.el-tree .el-tree-node__icon{
  font-size: 16px
}
.el-table__fixed-body-wrapper{
  background-color: #fff;
}
</style>
