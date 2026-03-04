<template>
<div>
  <guideModal
    ref="guideModalRef"
    placement="right"
    :title="currentGuide.title"
    :subTitle="currentGuide.subTitle"
    left="150px"
    :top="currentGuide.top"
    @close="close"
    @complete="close"
  >
    <template #footLeft>
      <span class="stepNumber">{{ currentIndex + 1 }} / {{ guides.length }}</span>
    </template>
    <template #footRight>
      <el-button class="prevBtn" v-show="currentIndex>0" type="text" @click="prev">上一步</el-button>
      <el-button class="nextBtn" @click="next">{{ guides.length-1>currentIndex?'下一步':'完成' }}</el-button>
    </template>
  </guideModal>
</div>
</template>
<script>
import guideModal from '@/components/guide/main.vue'
export default {
  name: 'guidesModal',
  components: {
    guideModal
  },
  props: {
    menu: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      localGuideKey: 'Chain_Ai_Inspect_Guide_Complete',
      currentIndex: 0,
      currentGuide: {},
      guides: [
        {
          title: '🎉🎉新增 AI 场景方案',
          subTitle: '基于行业特点，精选数十个 AI 场景方案，只需简单几步配置即可实现开箱即用',
          top: '87px',
          offset: -86,
          menuCode: 'AI00001'
        },
        {
          title: '第一步',
          subTitle: '在“场景任务”模块中快速创建应用',
          top: '87px',
          offset: -62,
          menuCode: 'AI00201'
        },
        {
          title: '第二步',
          subTitle: '在“识别区域管理”中为通道绘制合适的识别区域，以此提升准确率',
          top: '87px',
          offset: -72,
          menuCode: 'AI00205'
        },
        {
          title: '第三步',
          subTitle: '在“检索比对图库管理”中可以自行添加特定的识别内容，如工服、工帽等内容，在“我的应用”中关联相关图库即可提升识别精准度',
          top: '87px',
          offset: -92,
          menuCode: 'AI00206'
        },
      ]
    }
  },
  mounted () {
    this.initGudie()
  },
  methods: {
    initGudie () {
      if (!localStorage.getItem(this.localGuideKey)) {
        // 根据菜单数据计算引导页所在位置
        this.guides.forEach(guide => {
          let top = 96
          let hasFind = false
          for (let menu of this.menu) {
            top += 48
            for (let subMenu of menu.children) {
              if (subMenu.menuCode === guide.menuCode) {
                hasFind = true
                top += 24
                break
              } else {
                top += 48
              }
            }
            if (hasFind) break
          }
          if (hasFind) {
            // 减去元素本身高度的一半
            guide.top = top + guide.offset + 'px'
          }
        })
        this.currentGuide = this.guides[this.currentIndex]
        this.$refs.guideModalRef.renderGuide()
      }
    },
    prev () {
      if (this.currentIndex === 0) return
      this.currentIndex--
      this.currentGuide = this.guides[this.currentIndex]
    },
    next () {
      if (this.currentIndex === this.guides.length - 1) {
        this.$refs.guideModalRef.close()
        return
      }
      this.currentIndex++
      this.currentGuide = this.guides[this.currentIndex]
    },
    close () {
      localStorage.setItem(this.localGuideKey, 1)
    }
  }
}
</script>
<style lang="scss" scoped>
.stepNumber {
  font-family: MicrosoftYaHeiUI;
  font-size: 14px;
  color: rgba(255,255,255,0.70);
  letter-spacing: 0;
  line-height: 20px;
  font-weight: 400;
}
.prevBtn {
  color: #FFFFFF;
  &:hover:not(.is-disabled), &:active:not(.is-disabled) {
    color: #FFFFFF;
  }
}
.nextBtn {
  background: rgba(0,0,0,0.08);
  background-color: rgba(0,0,0,0.08);
  border: 1px solid #FFFFFF;
  color: #FFFFFF;
  border-radius: 4px;
  &:hover:not(.is-disabled), &:active:not(.is-disabled) {
    background: rgba(0,0,0,0.08);
    background-color: rgba(0,0,0,0.08);
    border: 1px solid #FFFFFF;
    color: #FFFFFF;
  }
}
</style>
