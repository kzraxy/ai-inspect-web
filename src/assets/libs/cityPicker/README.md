## 1.省市区联动组件的用法
### (selectChanged为回调函数，接收一个数组[省,市,区]的名称以及code)
`<cityPicker @selectChanged="changeSelectSeven" ref="cityEvent"></cityPicker>`

## 2.组件中submit函数为组件验证并触发回调的方法，reset函数为清空当前验证，可以通过定义ref来调用，如例子中定义为cityEvent，则可以在父组件这样调用：
  `this.$refs.cityEvent.submit()`
  `this.$refs.cityEvent.reset()`

## 3.组件的数据来源要在proxyTable中配置
  `'/citys':{`
    `target:"http://10.33.39.25",`
    `changeOrigin:true,`
    `pathRewrite: {`
      `'^/citys': ''`
    `}`
  `}`
