/*
 * @Description: loadingDom:
 * @Author: liushijie
 * @Date:2022-05-31 15:22
 * @Last Modified by: liushijie
 * @Last Modified Date:2022-05-31 15:22
 */
import cfg from '../../config';
import Dom from './dom';
class LoadingDom extends Dom {
  constructor(params) {
    const { parentDom } = params;
    super({
      parentDom,
      element: Dom.create({
        parentDom,
        type: 'div',
        text: '处理中...',
        style: {
          ...cfg.style.LOADING,
          display: 'none'
        }
      })
    });
  }
}
LoadingDom.prototype.open = function() {
  this.updateStyle({
    display: cfg.style.LOADING.display
  });
};
LoadingDom.prototype.close = function() {
  this.updateStyle({
    display: 'none'
  });
};
export default LoadingDom;
