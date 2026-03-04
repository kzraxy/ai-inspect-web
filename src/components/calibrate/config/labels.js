// 标注可以复用配置
const LABEL_COLOR_SET = {
  '#C82727': {
    borderColor: '#C82727',
    labelColor: '#C82727',
    normalBackgroundColor: 'rgba(0,0,0, 0)',
    hoverBackgroundColor: 'rgba(200,39,39, 0.1)',// 16进制转换成rgb
    focusBackgroundColor: 'rgba(200,39,39, 0.3)'
  },
  '#BE10A5': {
    borderColor: '#BE10A5',
    labelColor: '#BE10A5',
    normalBackgroundColor: 'rgba(0,0,0, 0)',
    hoverBackgroundColor: 'rgba(190,16,165, 0.1)',
    focusBackgroundColor: 'rgba(190,16,165, 0.3)'
  },
  '#A10AEF': {
    borderColor: '#A10AEF',
    labelColor: '#A10AEF',
    normalBackgroundColor: 'rgba(0,0,0, 0)',
    hoverBackgroundColor: 'rgba(161,10,239, 0.1)',
    focusBackgroundColor: 'rgba(161,10,239, 0.3)'
  },
  '#308FF0': { // 默认绘制色
    borderColor: '#308FF0',
    labelColor: '#308FF0',
    normalBackgroundColor: 'rgba(0,0,0, 0)',
    hoverBackgroundColor: 'rgba(48,143,240, 0.1)',
    focusBackgroundColor: 'rgba(48,143,240, 0.3)'
  },
  // 'rgba(96,69,255)': {
  //   borderColor: '#6045FF',
  //   labelColor: '#6045FF',
  //   normalBackgroundColor: 'rgba(0,0,0, 0)',
  //   hoverBackgroundColor: 'rgba(96,69,255, 0.1)',
  //   focusBackgroundColor: 'rgba(96,69,255, 0.3)'
  // },
  '#1457FB': {
    borderColor: '#1457FB',
    labelColor: '#1457FB',
    normalBackgroundColor: 'rgba(0,0,0, 0)',
    hoverBackgroundColor: 'rgba(20,87,251, 0.1)',
    focusBackgroundColor: 'rgba(20,87,251, 0.3)'
  },
  '#006ABA': {
    borderColor: '#006ABA',
    labelColor: '#006ABA',
    normalBackgroundColor: 'rgba(0,0,0, 0)',
    hoverBackgroundColor: 'rgba(0,106,186, 0.1)',
    focusBackgroundColor: 'rgba(0,106,186, 0.3)'
  },
  '#007855': {
    borderColor: '#007855',
    labelColor: '#007855',
    normalBackgroundColor: 'rgba(0,0,0, 0)',
    hoverBackgroundColor: 'rgba(0,120,85, 0.1)',
    focusBackgroundColor: 'rgba(0,120,85, 0.3)'
  },
  '#397700': {
    borderColor: '#397700',
    labelColor: '#397700',
    normalBackgroundColor: 'rgba(0,0,0, 0)',
    hoverBackgroundColor: 'rgba(57,119,0, 0.1)',
    focusBackgroundColor: 'rgba(57,119,0, 0.3)'
  },
  '#606F00': {
    borderColor: '#606F00',
    labelColor: '#606F00',
    normalBackgroundColor: 'rgba(0,0,0, 0)',
    hoverBackgroundColor: 'rgba(96,111,0, 0.1)',
    focusBackgroundColor: 'rgba(96,111,0, 0.3)'
  },
  '#FFAB00': {
    borderColor: '#FFAB00',
    labelColor: '#FFAB00',
    normalBackgroundColor: 'rgba(0,0,0, 0)',
    hoverBackgroundColor: 'rgba(255,171,0, 0.1)',
    focusBackgroundColor: 'rgba(255,171,0, 0.3)'
  },
  '#FF6F00': {
    borderColor: '#FF6F00',
    labelColor: '#FF6F00',
    normalBackgroundColor: 'rgba(0,0,0, 0)',
    hoverBackgroundColor: 'rgba(255,111,0, 0.1)',
    focusBackgroundColor: 'rgba(255,111,0, 0.3)'
  },
  '#FF5A00': {
    borderColor: '#FF5A00',
    labelColor: '#FF5A00',
    normalBackgroundColor: 'rgba(0,0,0, 0)',
    hoverBackgroundColor: 'rgba(255,90,0, 0.1)',
    focusBackgroundColor: 'rgba(255,90,0, 0.3)'
  },
}
const SHIELD_STYLE = {
  shape: {
    'normal': {
      color: 'rgba(161,151,255,0.3)',
      borderColor: '#A197FF',
      borderWidth: 2
    },
    'hover': {
      color: 'rgba(161,151,255,0.3)',
      borderColor: '#A197FF',
      borderWidth: 2
    },
    'focus': {
      color: 'rgba(161,151,255,0.5)',
      borderColor: '#A197FF',
      borderWidth: 2
    }
  },
  label: {
    'normal': {
      color: '#A197FF'
    },
    'hover': {
      color: '#A197FF'
    },
    'focus': {
      color: '#A197FF'
    }
  }
}
const NORMAL_STYLE = {
  shape: {
    'normal': {
      color: 'rgba(48,143,240,0.1)',
      borderColor: '#308FF0',
      borderWidth: 2
    },
    'hover': {
      color: 'rgba(48,143,240,0.3)',
      borderColor: '#308FF0',
      borderWidth: 2
    },
    'focus': {
      color: 'rgba(48,143,240,0.5)',
      borderColor: '#308FF0',
      borderWidth: 2
    }
  },
  label: {
    'normal': {
      color: '#308FF0'
    },
    'hover': {
      color: '#308FF0'
    },
    'focus': {
      color: '#308FF0'
    }
  }
}
export default {
  LABEL_COLOR_SET,
  SHIELD_STYLE,
  NORMAL_STYLE,
}