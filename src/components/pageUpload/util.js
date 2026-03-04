// 素材上传相关组件
import { v1 as uuidv1 } from 'uuid'
import { Notification } from 'hui'
// import COS from 'cos-js-sdk-v5'

// 文件检测
export async function fileCheck (
  file,
  max = 2,
  fileType = ['jpg', 'jpeg', 'png', 'gif', 'bmp'],
  nameMaxLength = 128,
  lessW, lessH, overW, overH
) {
  const size = file.size
  let result = {
    hasErr: false,
    message: null
  }
  if (size > 1024 * 1024 * max) {
    result.message = `文件大小不能超过${max}M`
    result.hasErr = true
    return result
  }
  const name = file.name.split('.').pop().toLowerCase()
  if (!fileType.includes(name)) {
    result.message = `仅支持${fileType.join(',')}格式文件`
    result.hasErr = true
    return result
  }
  if (file.name.length > nameMaxLength) {
    result.message = `文件名称不能超过${nameMaxLength}个字符`
    result.hasErr = true
    return result
  }
  result = await judgeFileRate(file, lessW, lessH, overW, overH)
  return result
}
export function judgeFileRate (file, lessW, lessH, overW, overH) {
  return new Promise(function (resolve) {
    const reader = new FileReader()// 判断图片长宽像素
    reader.readAsDataURL(file)
    reader.onload = () => {
      let image = new Image()
      image.src = reader.result
      image.onload = () => {
        let result = {
          hasErr: false,
          message: null
        }
        let imgWidth = image.width
        let imgHeight = image.height
        const overWFlag = !overW ? false : (imgWidth > overW)
        const overHFlag = !overH ? false : (imgHeight > overH)
        const lessWFlag = !lessW ? false : (imgWidth < lessW)
        const lessHFlag = !lessH ? false : (imgHeight < lessH)
        if (overWFlag || overHFlag || lessWFlag || lessHFlag) { // 判断图片长宽像素
          result.message = overWFlag ? `图片宽大于${overW}像素` : overHFlag ? `图片高大于${overH}像素` : lessWFlag ? `图片宽小于${lessW}像素` : lessHFlag ? `图片宽小于${lessH}像素` : '其他错误'
          result.hasErr = true
        }
        resolve(result)
      }
    }
  })
}
// 计算文件大小
export function getFileSize (size) {
  if (size > 1024 * 1024 && size < 1024 * 1024 * 1024) {
    return (size / (1024 * 1024)).toFixed(2) + 'MB'
  } else if (size > 1024 * 1024 * 1024 && size < 1024 * 1024 * 1024 * 1024) {
    return (size / (1024 * 1024 * 1024)).toFixed(2) + 'GB'
  } else {
    return (size / 1024).toFixed(2) + 'KB'
  }
}
// 获取COS客户端
// export function getClientCos (sign) {
//   return new COS({
//     getAuthorization: function (options, callback) {
//       if (!sign) {
//       }
//       const params = {
//         TmpSecretId: sign.accessKeyId,
//         TmpSecretKey: sign.accessKeySecret,
//         SecurityToken: sign.securityToken,
//         ExpiredTime: sign.expireTime // 时间戳，单位秒，如：1580000000
//       }
//       callback(params)
//     }
//   })
// }
// 获取客户端
export function getClient (sign) {
  return new window.OSS.Wrapper({
    endpoint: sign.endpoint,
    accessKeyId: sign.accessKeyId,
    accessKeySecret: sign.accessKeySecret,
    stsToken: sign.securityToken,
    bucket: sign.bucket,
    cname: sign.cname
  })
}
/**
 * 图片压缩
 * @param {*} file 图片文件
 * @param {*} type 图片输出格式
 * @param {*} scale 压缩率 0-1
 * @param {*} quality 图片质量 0-1
 * @returns 返回blob
 */
export function compressImage (file, type = 'jpeg', scale = 1, quality = 0.92) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.readAsDataURL(file)
    fileReader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.width = img.naturalWidth * scale
        canvas.height = img.naturalHeight * scale
        context.drawImage(img, 0, 0, canvas.width, canvas.height)
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('压缩图片失败'))
          }
        }, `image/${type === 'jpg' ? 'jpeg' : type}`, quality)
      }
      img.src = e.target.result
    }
  })
}
// 上传单个文件
export function uploadFile (filemap) {
  filemap.uploadState = 'runing'
  return new Promise((resolve, reject) => {
    window.$ossUploader.upload(filemap.file, '080103', {
      onProgress: (p) => {
        filemap.percent = p
      },
    }).then(r => {
      if (r.res.status === 200) {
        filemap.uploadState = 'success'
        filemap.res = r
        resolve(filemap)
      }
    }).catch(e => {
      filemap.uploadState = 'error'
      filemap.message = '网络异常'
      reject(filemap)
    })
  })
}
// 延时函数
export function delay (time) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

// 批量上传文件
export async function uploadFiles (files, cb) {
  const promisearr = []
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const imgTypeLists = ['jpg', 'jpeg', 'png', 'bmp']
    if (imgTypeLists.includes(file.type)) {
      const imageObject = await new Promise((resolve, reject) => {
        const fileReader = new FileReader()
        fileReader.readAsDataURL(file.file)
        fileReader.onload = (e) => {
          const img = new Image()
          img.onload = () => {
            resolve({
              width: img.naturalWidth,
              height: img.naturalHeight
            })
          }
          img.src = e.target.result
        }
      })
      const config = Object.create(null)
      config.scale = 1
      let res = file.file
      const { width, height } = imageObject
      if((file.file.size > 1024 * 1024 * 8) || width > 3840 || height > 3840){
        if (width >= height) {
          if (width > 3840) {
            config.scale = 3840 / width
          }
          if (config.scale * height > 2160) {
            config.scale = 2160 / height
          }
        }
        if (width < height) {
          if (height > 3840) {
            config.scale = 3840 / height
          }
          if (config.scale * width > 2160) {
            config.scale = 2160 / width
          }
        }
        if (config.scale) {
          res = await compressImage(file.file, file.type, config.scale)
        }
        if (res.size > 1024 * 1024 * 5) {
          config.quality = 0.8
          res = await compressImage(file.file, file.type, config.scale, config.quality)
        }
        if (config.scale || config.quality) {
          file.file = new window.File([res], file.name, { type: file.type })
        }
      }
    }
    let promise
    try {
      promise = await uploadFile(file).then(res => cb(res))
    } catch {}
    promisearr.push(promise)
    // 延时1000ms
    await delay(500)
  }
  return Promise.all(promisearr)
}

// 删除弹框
export function delAlert(successCount, failCount, unitStr, h) {

  Notification({
    title: '删除提示',
    duration: 0,
    message: h('p', undefined, [
      h('p', undefined, [
        h('span', {
          style: 'color: #0DA835;'
        }, successCount),
        h('span', undefined, `${unitStr}删除成功、`),
        h('span', {
          style: 'color: #E01212;'
        }, failCount),
        h('span', undefined, `${unitStr}删除失败`)
      ]),
      h('p', {
        style: `font-size: 12px; margin: 8px 0; color: rgba(0,0,0,0.6);font-family: MicrosoftYaHeiUI;display: ${failCount > 0 ? 'block': 'none'};`
      }, '删除内容中含有, 正在使用的素材，导致删除失败')
    ]),
    customClass: 'addFailDevicesRetry'
  })
}