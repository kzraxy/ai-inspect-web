import { lastOneYear, today, day } from '@/plugin/utils/util'

const pickerOptions = {
  0: {
    disabledDate (time) {
      return (time.getTime() < lastOneYear) || (time.getTime() > today + day - 1)
    }
  },
  1: {
    disabledDate (time) {
      return (time.getTime() < lastOneYear) || (time.getTime() > today + day - 1)
    },
    shortcuts: [{
      text: '最近一个月',
      onClick (picker) {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
        picker.$emit('pick', [start, end], true)
      }
    }, {
      text: '最近一年',
      onClick (picker) {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 365)
        picker.$emit('pick', [start, end], true)
      }
    }]
  },
  2: {
    disabledDate (time) {
      return (time.getTime() < lastOneYear) || (time.getTime() > today + day - 1)
    },
    shortcuts: [{
      text: '最近一个月',
      onClick (picker) {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
        picker.$emit('pick', [start, end], true)
      }
    }, {
      text: '最近三个月',
      onClick (picker) {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
        picker.$emit('pick', [start, end], true)
      }
    }, {
      text: '最近一年',
      onClick (picker) {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 365)
        picker.$emit('pick', [start, end], true)
      }
    }]
  }
}
const pickerOptionsSimple = {
  disabledDate (time) {
    return (time.getTime() < lastOneYear) || (time.getTime() > today + day - 1)
  }
}

export {
  pickerOptions,
  pickerOptionsSimple
}
