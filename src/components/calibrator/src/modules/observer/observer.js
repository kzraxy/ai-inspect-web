/*
 * @Description: observer:
 * @Author: liushijie
 * @Date:2021-10-25 15:56
 * @Last Modified by: liushijie
 * @Last Modified Date:2021-10-25 15:56
 */
import cfg from '../../config';
const DEBUGGER = false;
const FILTER = '';
class Observer {
  constructor() {
    this._triggers = {};
  }
}
Observer.prototype.addListener = function(signal, { context, name, func }) {
  if (!context) {
  }
  if (!this._triggers[signal]) {
    this._triggers[signal] = [];
  }
  if (!context[name] && !func) {
    return;
  }
  this._triggers[signal].push({ func: func || context[name], context, name });
};
Observer.prototype.send = async function(signal, ...params) {
  let code = cfg.observer.CODE.FAIL;
  let msg = cfg.observer.CODE.DEFAULT_MSG;
  let data = {};
  if (!this._triggers[signal]) {
    return { msg, code, data };
  }
  DEBUGGER && (!FILTER || !signal.includes(FILTER));
  for (let i = 0; i < this._triggers[signal].length; i++) {
    const { func, context, name } = this._triggers[signal][i];
    let res = {};
    DEBUGGER &&
      (!FILTER || !signal.includes(FILTER));
    try {
      if (context) {
        res = await func.call(context, ...params);
      } else {
        res = await func(...params);
      }
      code = typeof res?.code !== 'undefined' ? res.code : cfg.observer.CODE.SUCCESS;
      msg = typeof res?.msg !== 'undefined' ? res.msg : cfg.observer.CODE.DEFAULT_MSG;
      data = typeof res?.data !== 'undefined' ? res.data : {};
      if (code !== cfg.observer.CODE.SUCCESS) {
        return { msg, code, data };
      }
    } catch (e) {
    }
  }
  return { msg, code, data };
};
Observer.prototype.write = function(signal, noSignal) {
  for (const key in this._triggers) {
    if (key.includes(signal) && (!key.includes(noSignal) || !noSignal)) {
      const methods = this._triggers[key].map(me => me.name).join(' => ');
    }
  }
};
export default Observer;
