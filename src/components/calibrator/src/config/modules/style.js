/*
 * @Description: style:
 * @Author: liushijie
 * @Date:2021-10-14 10:01
 * @Last Modified by: liushijie
 * @Last Modified Date:2021-10-14 10:01
 */
import STATUS from './status';
import controlCfg from './control';

const DEFAULT_COLOR = {
  [STATUS.NORMAL]: {
    color: '#308FF0',
    // opacityColor: '#308FF0'
    opacityColor: 'rgba(48,143,240,0.1)'
  },
  [STATUS.HOVER]: {
    color: '#308FF0',
    // opacityColor: '#41B8FE'
    opacityColor: 'rgba(48,143,240,0.3)'
  },
  [STATUS.FOCUS]: {
    // color: '#FFC730',
    // 5.0.2视觉修改
    color: '#308FF0',
    // opacityColor: '#FFC730'
    // 5.0.2视觉修改
    // opacityColor: 'rgba(255,199,48,0.2)',
    opacityColor: 'rgba(48,143,240,0.3)'
  },
  [STATUS.ILLEGAL]: {
    color: '#F56A4B',
    // opacityColor: '#F56A4B'
    opacityColor: 'rgba(245,106,75,0.2)'
  }
};
const DEFAULT_STYLE = {
  labelPoint: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column-reverse',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    overflow: 'visible',
    zIndex: 0
  },
  labelPointReverse: {
    alignItems: 'flex-end'
  },
  labelPointDown: {
    flexDirection: 'column'
  },
  labelsWrap: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    boxSizing: 'content-box',
    maxHeight: '161px',
    margin: '0',
    overflow: 'auto'
  },
  label: {
    height: '24px',
    maxWidth: '160px',
    borderRadius: '2px',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    padding: '1px 8px',
    marginBottom: '1px',
    background: 'rgba(0,0,0,0.8)',
    display: 'inline-flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexShrink: '0',
    boxSizing: 'content-box',
    position: 'relative',
    cursor: `url('${require('../../assets/mouse/mouse_hand.cur')}') 12 0, auto`
  },
  labelSpan: {
    fontSize: '12px',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    flexShrink: '1'
  },
  labelDelete: {
    opacity: '0.8',
    margin: '0 -2px',
    flexShrink: '0'
  }
};
const CALIBRATION = {
  shape: {
    [STATUS.NORMAL]: {
      color: DEFAULT_COLOR[STATUS.NORMAL].opacityColor,
      borderColor: DEFAULT_COLOR[STATUS.NORMAL].color,
      borderWidth: 2
    },
    [STATUS.HOVER]: {
      color: DEFAULT_COLOR[STATUS.HOVER].opacityColor,
      borderColor: DEFAULT_COLOR[STATUS.HOVER].color,
      borderWidth: 3
    },
    [STATUS.FOCUS]: {
      color: DEFAULT_COLOR[STATUS.FOCUS].opacityColor,
      borderColor: DEFAULT_COLOR[STATUS.FOCUS].color,
      borderWidth: 3
    },
    [STATUS.ILLEGAL]: {
      color: DEFAULT_COLOR[STATUS.ILLEGAL].opacityColor,
      borderColor: DEFAULT_COLOR[STATUS.ILLEGAL].color,
      borderWidth: 3
    }
  },
  control: {
    [STATUS.NORMAL]: {
      borderWidth: 1,
      color: '#fff',
      radius: 5
    },
    [STATUS.HOVER]: {
      borderWidth: 1,
      color: '#fff',
      radius: 6
    },
    [STATUS.FOCUS]: {
      borderWidth: 1,
      color: '#fff',
      radius: 6
    },
    [STATUS.ILLEGAL]: {
      borderWidth: 1,
      color: '#fff',
      radius: 6
    }
  },
  labelsWrap: {
    [STATUS.NORMAL]: {
      ...DEFAULT_STYLE.labelsWrap,
      margin: '0',
      overflow: 'visible'
    },
    [STATUS.HOVER]: {
      ...DEFAULT_STYLE.labelsWrap
    },
    [STATUS.FOCUS]: {
      ...DEFAULT_STYLE.labelsWrap,
      margin: `${controlCfg.HOT_RADIUS}px 0`
    },
    [STATUS.ILLEGAL]: {
      ...DEFAULT_STYLE.labelsWrap
    }
  },
  label: {
    [STATUS.NORMAL]: {
      ...DEFAULT_STYLE.label,
      color: DEFAULT_COLOR[STATUS.NORMAL].color
    },
    [STATUS.HOVER]: {
      ...DEFAULT_STYLE.label,
      color: DEFAULT_COLOR[STATUS.HOVER].color
    },
    [STATUS.FOCUS]: {
      ...DEFAULT_STYLE.label,
      color: DEFAULT_COLOR[STATUS.FOCUS].color
    },
    [STATUS.ILLEGAL]: {
      ...DEFAULT_STYLE.label,
      color: DEFAULT_COLOR[STATUS.ILLEGAL].color
    }
  },
  labelSpan: {
    [STATUS.NORMAL]: {
      ...DEFAULT_STYLE.labelSpan
    },
    [STATUS.HOVER]: {
      ...DEFAULT_STYLE.labelSpan
    },
    [STATUS.FOCUS]: {
      ...DEFAULT_STYLE.labelSpan
    },
    [STATUS.ILLEGAL]: {
      ...DEFAULT_STYLE.labelSpan
    }
  }
};
const IMAGE = {
  mask: {
    [STATUS.NORMAL]: {
      color: 'rgba(0,0,0,0.6)',
      borderColor: '#fff',
      borderWidth: 1
    },
    [STATUS.HOVER]: {
      color: 'rgba(0,0,0,0.5)',
      borderColor: '#fff',
      borderWidth: 1
    },
    [STATUS.ILLEGAL]: {
      borderColor: '#F56A4B',
      borderWidth: 1,
      color: 'rgba(245,106,75,0.4)'
    }
  },
  control: {
    [STATUS.NORMAL]: {
      borderColor: '#fff',
      color: '#282E42',
      borderWidth: 1
    },
    [STATUS.HOVER]: {
      borderColor: '#fff',
      color: '#000',
      borderWidth: 1
    },
    [STATUS.ILLEGAL]: {
      borderColor: '#F56A4B',
      borderWidth: 1,
      color: '#f56a4b'
    }
  }
};
const AXES = {
  // 辅助线样式
  borderColor: 'rgba(48,143,240,1)',
  borderWidth: 1,
  color: 'rgba(0,0,0,0)',
  dashArray: [4, 3]
};
const PROMPT = {
  [STATUS.NORMAL]: {
    color: 'rgba(0,0,0,0.70)',
    background: '#fff',
    position: 'absolute',
    whiteSpace: 'nowrap',
    fontSize: '14px',
    padding: '0 4px'
  },
  [STATUS.ILLEGAL]: {
    color: '#fff',
    background: 'rgba(245,106,75,1)',
    position: 'absolute',
    whiteSpace: 'nowrap',
    fontSize: '14px',
    padding: '0 4px'
  }
};
const LOADING = {
  background: 'rgba(255,255,255,0.7)',
  position: 'absolute',
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  justifyContent: 'center',
  color: 'rgba(40, 46, 66, 0.8)',
  alignItems: 'center'
};
export default {
  CALIBRATION,
  IMAGE,
  AXES,
  PROMPT,
  DEFAULT_STYLE,
  LOADING
};
