import axios from 'axios'
exports.getList = function () {
  return axios.get('/v1/basic/queryProvinceCity')
}
