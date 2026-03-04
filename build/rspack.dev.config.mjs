import path from "path";
import detect from "detect-port";
import getToken from "hik-cloud-login-helper";
import proxyConfig from "./rspack.proxy.config.mjs";
import defineEnv from "./rspack.env.config.mjs";
import loginConfig from "./rspack.login.config.mjs";
import baseConfig from "./rspack.base.config.mjs";
import { getLoginConfig } from "./utils.mjs";

const root = process.cwd();
const DEFAULT_PORT = 7778;

const context = JSON.parse(defineEnv["process.env.VUE_APP_CONTEXT"])?.replace(/^\/|\/$/g, '');
const publicPath = !context ? '/' : `/${context}/`;

export default async () => {
  const port = await detect(DEFAULT_PORT);
  const loginData = loginConfig.enable ? await getToken(loginConfig) : "";
  const devConfig =  {
    mode: "development",
    cache: true,
    devtool: "source-map",
    extends: path.join(root, "build/rspack.base.config.mjs"),
    devServer: {
      client: {
        logging: "error",
        overlay: false,
        progress: true      
      },
      devMiddleware: {
        publicPath: publicPath
      },
      historyApiFallback: {
        disableDotRule: true,
        index: '/index.html'
      },
      host: "0.0.0.0",
      hot: true,
      port: port,
      proxy: Object.entries(proxyConfig).map(([prefix, config]) => ({
        context: [prefix.replace(/^\^/, '')], 
        ...config,
        onProxyReq: (proxyReq) => proxyReq.setHeader("Authorization", `Bearer ${getLoginConfig().enable ? loginData.token : getLoginConfig().token}`)
      }))
    }
  }
  const plugins = baseConfig.plugins || [];

  const localStorageKeyValue = loginConfig.enable ? loginData.localStorageString.split(";").map((item) => {
    const [key, value] = item.split(":");
    return `localStorage.setItem(${JSON.stringify(key)}, ${JSON.stringify(value)});`;
  }) : [];
  const sessionStorageKeyValue = loginConfig.enable ? loginData.sessionStorageString.split(",").map((item) => {
    const [key, value] = item.split(":");
    return `sessionStorage.setItem(${JSON.stringify(key)}, ${JSON.stringify(value)});`;
  }) : [];
  
  plugins.forEach((plugin) => {
    if (plugin?.name === "HtmlRspackPlugin" && plugin?._args[0]?.filename === "index.html") {
      plugin._args[0].templateParameters["DEV_INJECT_SCRIPT"] = `<script>${localStorageKeyValue.join("\n")}${sessionStorageKeyValue.join("\n")}</script>`;
    }
  });

  const finalConfig = {...devConfig, plugins};

  return finalConfig;
};