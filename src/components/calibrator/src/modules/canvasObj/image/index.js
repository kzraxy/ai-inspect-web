/*
 * @Description: index:
 * @Author: liushijie
 * @Date:2021-10-28 17:56
 * @Last Modified by: liushijie
 * @Last Modified Date:2021-10-28 17:56
 */
import ImageObj from './image';

ImageObj.getObj = async function (data) {
  const { image: propImage, defaultStyle, width, height } = data;
  // 读取图片,生成图片渲染数据
  let img = null;
  if (propImage.src) {
    img = new ImageObj(propImage, defaultStyle, width, height);
    // 设置图片的位置、裁剪信息
    await img.loading;
  }
  return img;
};
export default ImageObj;
