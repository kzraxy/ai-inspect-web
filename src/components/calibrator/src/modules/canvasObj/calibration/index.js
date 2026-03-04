/*
 * @Description: index:
 * @Author: liushijie
 * @Date:2021-10-14 21:45
 * @Last Modified by: liushijie
 * @Last Modified Date:2021-10-14 21:45
 */
import cfg from '../../../config';
import Calibration from './calibration';
import Rect from './rect';
import Polygon from './polygon';
import Ellipse from './ellipse';
import Line from './line';
import Chain from './chain';
import ABChain from './abchain';
import BAChain from './bachain';
import Pixel from './pixel';
import RectProcess from './rectProcess';
import PolygonProcess from './polygonProcess';
import LineProcess from './lineProcess';
import ChainProcess from './chainProcess';
import ABChainProcess from './abchainProcess';
import BAChainProcess from './bachainProcess';
import EllipseProcess from './ellipseProcess';

// 创建标注
Calibration.getObj = function (option) {
  try {
    switch (option?.data?.scope?.type) {
      case cfg.calibration.TYPES.RECT: {
        return new Rect(option);
      }
      case cfg.calibration.TYPES.POLYGON: {
        return new Polygon(option);
      }
      case cfg.calibration.TYPES.ELLIPSE: {
        return new Ellipse(option);
      }
      case cfg.calibration.TYPES.LINE: {
        return new Line(option);
      }
      case cfg.calibration.TYPES.CHAIN: {
        return new Chain(option);
      }
      case cfg.calibration.TYPES.ABCHAIN: {
        return new ABChain(option);
      }
      case cfg.calibration.TYPES.BACHAIN: {
        return new BAChain(option);
      }
      case cfg.calibration.TYPES.PIXEL: {
        return new Pixel(option);
      }
    }
  } catch (e) {
  }
};
Calibration.getProcessObj = function (parmas) {
  try {
    switch (parmas?.data?.scope?.type) {
      case cfg.calibration.TYPES.RECT: {
        return new RectProcess(parmas);
      }
      case cfg.calibration.TYPES.POLYGON: {
        return new PolygonProcess(parmas);
      }
      case cfg.calibration.TYPES.LINE: {
        return new LineProcess(parmas);
      }
      case cfg.calibration.TYPES.CHAIN: {
        return new ChainProcess(parmas);
      }
      case cfg.calibration.TYPES.ABCHAIN: {
        return new ABChainProcess(parmas);
      }
      case cfg.calibration.TYPES.BACHAIN: {
        return new BAChainProcess(parmas);
      }
      case cfg.calibration.TYPES.ELLIPSE: {
        return new EllipseProcess(parmas);
      }
    }
  } catch (e) {
  }
};
export default Calibration;
