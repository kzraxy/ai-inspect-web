import moment from 'moment'
// import { uploadDuration } from './proxy'
// moment().format('HH:mm:ss') === '23:59:00'
let DurationCollection = function (countStep = 1, uploadStep = 10, needUpload = () => moment().format('HH:mm').endsWith('23:59')) {
  this.countStep = countStep
  this.uploadStep = uploadStep
  this.needUpload = needUpload
  this.reset()
}

DurationCollection.prototype.reset = function () {
  this.count = 0
  this.pauseCount()
}

DurationCollection.prototype.startCount = function () {
  this.reset()
  this.continueCount()
}
// 启动计时器
DurationCollection.prototype.continueCount = function () {
  this.timer = setInterval(() => {
    this.count += this.countStep
    this.triggerUploadIfNeeded()
  }, this.countStep * 60 * 1000)
}
// 清除计时器
DurationCollection.prototype.pauseCount = function () {
  if (this.timer) {
    clearInterval(this.timer)
    this.timer = undefined
  }
}

DurationCollection.prototype.triggerUploadIfNeeded = function () {
  // if (this.count < this.uploadStep && !this.needUpload()) return
  if (!this.needUpload()) return
  this.upload()
}
// 接口不触发本地token刷新时间记录
DurationCollection.prototype.upload = function () {
  if (this.count === 0) return
  // const params = {
  //   duration: this.count,
  //   terminalType: 2
  // }
  // uploadDuration(params)
  this.count = 0
}

DurationCollection.prototype.stopCount = function () {
  this.upload()
  this.reset()
}

export default new DurationCollection()
