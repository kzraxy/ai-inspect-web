/*
 * @Descripttion:
 * @version:
 * @Author: maoyining
 * @Date: 2023-04-10 11:09:39
 * @LastEditors: maoyining
 * @LastEditTime: 2023-06-27 13:32:46
 */
import Calibrator from './src/modules/calibrator'

const AiopCalibrator = {}
AiopCalibrator.install = app => {
  app.prototype.$createCalibrator = params => {
    const instance = new Calibrator(params)
    return instance
  }
}

export { AiopCalibrator }
