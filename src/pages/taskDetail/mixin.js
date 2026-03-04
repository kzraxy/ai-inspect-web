import pako from 'pako'
import verifyTempResultCreator from '@/common/calibrateJs/createVerifyTempResult.js'
import labelCfg from '@/components/calibrate/config/labels.js'
export default {
  data() {
    return {
    }
  },
  methods: {
    getAllArea (channel) {
      let areas = []
      channel.drawResults && channel.drawResults.forEach((area, index) => {
        let cmpSimilarity = (area.compareResult&&area.compareResult.cmpSimilarity&&area.compareResult.cmpSimilarity.length>0) ? area.compareResult.cmpSimilarity[0] : ''
        let labelList = []
        labelList = ((area && area.aiResultLabelInfo) || []).map(label => {
          let text = area.resultStatus === 'CORRECT' ? '（正报）' : area.resultStatus === 'INCORRECT' ? `（误报：${area.misreportReason}）` : ''
          let selfConfidence = label.confidence ? '(' + label.confidence + ')' : ''
          selfConfidence = cmpSimilarity ? selfConfidence + `(${cmpSimilarity})` : selfConfidence
          return {
            labelId: label.labelId,
            text: label.labelName + text,
            labelLineId: label.labelLineId,
            deletable: false,
            confidence: selfConfidence
          }
        })
        if (area.type && area.points) {
        //  绘制右侧详情大图，需要标签
          areas.push({
            id: `area_${channel.rowKey}_${index}`,
            targetId: area.targetId,
            scope: {
              type: area.type,
              coordinates: area.points
            },
            labelList,
            style: {
              shape: {
                normal: {
                  borderWidth: area.regionColor && area.regionColor === 'red' ? 3 : 2,
                  borderColor: area.regionColor || 'red',
                  color: 'rgba(255,255,255,0)'
                }
              },
              label: {
                normal: {
                  height: '14px',
                  maxWidth: '160px',
                  borderRadius: '2px',
                  padding: '1px',
                  marginBottom: '1px'
                },
                hover: {
                  height: '14px',
                  maxWidth: '160px',
                  borderRadius: '2px',
                  padding: '1px',
                  marginBottom: '1px'
                },
                focus: {
                  height: '14px',
                  maxWidth: '160px',
                  borderRadius: '2px',
                  padding: '1px',
                  marginBottom: '1px'
                }
              }
            }
          })
        }
      })
      return { areas }
    },
    getPolygon (arr, polygon, type) {
      if (!polygon.polygonDetails || !polygon.polygonDetails.length) {
        return false
      }
      // 处理展示区域的数据
      polygon.polygonDetails.forEach((item, index) => {
        arr.unshift({
          id: `${type}_${polygon.rowKey}_${index}`,
          status: 'normal',
          scope: {
            type: 'polygon',
            coordinates: item.polygons
          },
          labelList: [],
          style: item.calibrationType === 'SHIELD_AREA' ? labelCfg.SHIELD_STYLE : labelCfg.NORMAL_STYLE
        })
      })
    },
    async verifyFile(item) {
      let calibrationList = []
      // 处理语义分割的数据格式
      let gzipData = item.results[0].maskInfo.maskData
      let mData = this.decompressGzip(gzipData)
      item.results[0].maskInfo.maskData = mData
      calibrationList = verifyTempResultCreator.createVerifyTempResults(
        { algorithm: '17', taggingMode: '3' }, // 语义分割，
        [ item ],
      )
      // 如果校验结果是没有结果，则显示为不包含目标
      if (calibrationList?.length === 0) {
        const noneObj = {
          id: "-999",
          labelList: [{labelClassId: '-999', labelId: '-999',text:'无结果'}],
          scope: {
            type: "polygon",
            coordinates: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }]
          },
          tagType: '1'
        };
        noneObj.labelList[0].confidence = '--';
        noneObj.labelList[0].text = '无结果';
        calibrationList.push(noneObj);
      } else {
        calibrationList.forEach((tag, index) => {
          tag.id = `area_${tag.id}_${index}`
          tag.labelList && tag.labelList.forEach(lab => {
            lab.deletable = false
            lab.labelId = Math.round(Math.random()*1000)
            lab.labelLineId = Math.round(Math.random()*1000)
          })
        })
      }
      return calibrationList
    },
    decompressGzip(gzipStr) { // 解压缩gzip数据
      const gzipData = new Uint8Array(atob(gzipStr).split('').map(char => char.charCodeAt(0)));
      const uncompressedData = pako.inflate(gzipData, { to: 'string' });
      return uncompressedData
    },
    filterArea (areas, areaSelectLabel, ignoreFirst = false, displayLabel) {
      let finalArea = []
      areas.forEach((area, index) => {
        if (index === 0 && ignoreFirst) {
          finalArea.push(area)
        } else {
          for (let i = 0; i < area.labelList.length; i++) {
            if (areaSelectLabel.indexOf(area.labelList[i].labelLineId) >= 0) {
              if (!displayLabel) {
                area.labelList = []
              }
              finalArea.push(area)
              break
            }
          }
        }
      })
      return finalArea
    },
    //  和上面那个可以合并成一个方法，但是时间太紧急，来不及。后续再改吧。
    filterLabel (areas, ignoreFirst = false, displayLabel) {
      let finalArea = []
      areas.forEach((area, index) => {
        if (index === 0 && ignoreFirst) {
          finalArea.push(area)
        } else {
          if (!displayLabel) {
            area.labelList = []
          }
          finalArea.push(area)
        }
      })
      return finalArea
    }
  }
}