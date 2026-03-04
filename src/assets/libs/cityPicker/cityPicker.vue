<template>
  <el-form ref="cityForm" :model="cityForm" :rules="rules" label-width="80px" label-position="top">
    <el-row :gutter="10">
      <el-col :span="8">
        <el-form-item :show-label="false" prop="province">
          <el-select placeholder="请选择省份" v-model="cityForm.province" @change="changeProvince()">
            <el-option v-for="province in cityData.province" :key="province.id" :label="province.name" :value="JSON.stringify(province)"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="8" v-if="isCityShow">
        <el-form-item :show-label="false" prop="city">
          <el-select placeholder="请选择城市" v-model="cityForm.city" @change="changeCity()">
            <el-option v-for="city in cityData.city" :key="city.id" :label="city.name" :value="JSON.stringify(city)"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="8" v-if="cityData.county.length !== 0 || cityForm.city === ''">
        <el-form-item :show-label="false" prop="county">
          <el-select placeholder="请选择区域" v-model="cityForm.county">
            <el-option v-for="county in cityData.county" :key="county.id" :label="county.name" :value="JSON.stringify(county)"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>
<script>
import proxy from './proxy'
export default {
  // props: ['defoutValue'],
  data () {
    return {
      // 所有的省市区数据
      citys: [],
      // 下拉选的所有数据
      cityData: {
        province: [],
        city: [],
        county: []
      },
      // 下拉选选中的数据
      cityForm: {
        province: '',
        city: '',
        county: ''
      },
      // 校验规则
      rules: {
        province: [{
          required: true,
          message: '请选择省',
          trigger: 'change'
        }],
        city: [{
          required: true,
          message: '请选择市',
          trigger: 'change'
        }],
        county: [{
          required: true,
          message: '请选择区',
          trigger: 'change'
        }]
      },
      // 市的下拉选是否显示
      isCityShow: true
    }
  },
  methods: {
    // 加载数据，初始化省的选项
    beforeMount () {
      proxy.getList().then(data => {
        if (data.code * 1 === 0 && data.data !== null) {
          this.citys = data.data
          this.citys.forEach(item => {
            if (item.type === 0) {
              this.cityData.province.push(item)
            }
          })
        }
      })
    },
    // 当省的选项发生变化时
    changeProvince () {
      this.resetCity() // 清空市的选项
      this.resetCounty() // 清空区的选项
      let parentId = this.cityForm.province ? JSON.parse(this.cityForm.province).id : '' // 选中的省的id用来查询所属市
      let code = this.cityForm.province ? JSON.parse(this.cityForm.province).code : '' // 选中的省的code用来判断直辖市
      if (code !== '110000' && code !== '120000' && code !== '310000' && code !== '500000' && code !== '810000' && code !== '820000') { // 当选中的省为直辖市或者香港澳门时，隐藏市的下拉选
        this.isCityShow = true
        this.citys.forEach(item => {
          if (item.parentId === parentId) {
            this.cityData.city.push(item)
          }
        })
      } else { // 当选中的省非直辖市时
        this.isCityShow = false
        this.citys.forEach(item => {
          if (item.parentId === parentId) {
            this.cityData.county.push(item)
          }
        })
      }
    },
    // 当市的选项发生变化时
    changeCity () {
      this.resetCounty() // 清空区的选项
      if (this.cityForm.city !== '') {
        this.citys.forEach(item => {
          if (item.parentId === JSON.parse(this.cityForm.city).id) {
            this.cityData.county.push(item)
          }
        })
      }
    },
    // 清空市的选项
    resetCity () {
      this.cityData.city = []
      this.cityForm.city = ''
      let fields = this.$refs['cityForm'].fields
      fields.forEach(item => {
        if (item.prop === 'city') {
          item.resetField()
        }
      })
    },
    // 清空区的选项
    resetCounty () {
      this.cityData.county = []
      this.cityForm.county = ''
      let fields = this.$refs['cityForm'].fields
      fields.forEach(item => {
        if (item.prop === 'county') {
          item.resetField()
        }
      })
    },
    // 开放给父组件，进行格式校验，校验通过后将省市区以数组的形式回传给父组件
    submit () {
      this.$refs['cityForm'].validate((valid) => {
        if (valid) {
          if (this.cityForm.city === '') { // 当选择为直辖市时
            this.$emit('selectChanged', [
              {code: '', name: ''},
              {code: JSON.parse(this.cityForm.province).code, name: JSON.parse(this.cityForm.province).name},
              {code: JSON.parse(this.cityForm.county).code, name: JSON.parse(this.cityForm.county).name}
            ])
          } else if (this.cityForm.county === '') { // 当该市无可选区时
            this.$emit('selectChanged', [
              {code: JSON.parse(this.cityForm.province).code, name: JSON.parse(this.cityForm.province).name},
              {code: JSON.parse(this.cityForm.city).code, name: JSON.parse(this.cityForm.city).name},
              {code: '', name: ''}
            ])
          } else { // 当选择非直辖市时,且市有可选区
            this.$emit('selectChanged', [
              {code: JSON.parse(this.cityForm.province).code, name: JSON.parse(this.cityForm.province).name},
              {code: JSON.parse(this.cityForm.city).code, name: JSON.parse(this.cityForm.city).name},
              {code: JSON.parse(this.cityForm.county).code, name: JSON.parse(this.cityForm.county).name}
            ])
          }
        } else {
          return false
        }
      })
    },
    // 开放给父组件，用来重置表单验证
    reset () {
      this.$refs['cityForm'].resetFields()
    }
  },
  beforeMount () {
    this.beforeMount()
  }
}
</script>
