import { getLoginConfig } from "./utils.mjs";

function getTarget (order = 0) {
  const envName = getLoginConfig().envName;
  return proxyTarget[order][envName];
};

const proxyTarget = [
  { 
    dev: "https://pbchain.hik-cloud.com",
    pb: "https://pbchain.hik-cloud.com",
    online: "https://chain.hik-cloud.com"
  },
  { 
    dev: "https://pbnissan.hik-cloud.com",
    pb: "https://pbnissan.hik-cloud.com",
    online: "https://nissan.hik-cloud.com"
  },
  { 
    dev: "https://pbnissan.hik-cloud.com",
    pb: "https://pbnissan.hik-cloud.com",
    online: "https://nissan.hik-cloud.com"
  },
];
export default {
  '^/v1':{
    target: proxyTarget[0]["dev"],
    changeOrigin:true,
    router: () => getTarget(0)
  },
  '^/oss-sts':{
    target: proxyTarget[0]["dev"],
    changeOrigin:true,
    pathRewrite: {"^/oss-sts": ""},
    router: () => getTarget(0)
  },
  '^/device-api/':{
    target: proxyTarget[1]["dev"],
    changeOrigin:true,
    pathRewrite: {"^/device-api": ""},
    router: () => getTarget(1)
  },
  '^/safe-center/':{
    target: proxyTarget[2]["dev"],
    changeOrigin:true,
    pathRewrite: {"^/safe-center": ""},
    router: () => getTarget(2)
  }
};