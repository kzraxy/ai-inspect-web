import path from "path";
import { rspack, ProvidePlugin } from "@rspack/core";
import { VueLoaderPlugin } from "vue-loader";
import sass from "sass-embedded";
import { RsdoctorRspackPlugin } from "@rsdoctor/rspack-plugin";
import DevServerInfoRspackPlugin from "dev-server-info-rspack-plugin";
import defineEnv from "./rspack.env.config.mjs";
import AddCharsetWebpackPlugin from "add-charset-webpack-plugin";

const root = process.cwd();
const isDev = process.env.NODE_ENV === "development";

const context = JSON.parse(defineEnv["process.env.VUE_APP_CONTEXT"])?.replace(/^\/|\/$/g, '');
const publicPath = !context ? '/' : `/${context}/`;

export default {
  cache: false,
  context: root,
  entry: path.join(root, "src/main.js"),
  output: {
    publicPath: publicPath,
    path: path.join(root, "dist"),
    filename: "static/js/[name].[contenthash].bundle.js",
    clean: true 
  },
  resolve: {
    extensions: [".js", ".json", ".vue", ".html", ".wasm"],
    fallback: {
      crypto: new URL("crypto-browserify", import.meta.url).pathname,
      stream: new URL("stream-browserify", import.meta.url).pathname,
      vm: new URL("vm-browserify", import.meta.url).pathname,
      querystring: new URL("querystring-es3", import.meta.url).pathname,
      buffer: new URL("buffer", import.meta.url).pathname
    },
    alias: {
      "@": path.join(root, "src"),
      "vue$": "vue/dist/vue.runtime.esm.js",
      "hik-cloud-ui$": "hik-cloud-ui/lib/hik-cloud-ui.umd.js",
      "hui$": "hui/lib/hui.common.js",
      "crypto": "crypto-browserify",
      "stream": "stream-browserify",
      "vm": "vm-browserify",
      "querystring": "querystring-es3"
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/i,
        use: [
          {
            loader: "vue-loader",
            options: {
              experimentalInlineMatchResource: true,
              compilerOptions: { whitespace: "condense" }
            }
          }
        ],
        type: "javascript/auto"
      },
      {
        test: /\.js$/i,
        exclude: /node_modules/,
        use: [
          {
            loader: "builtin:swc-loader",
            options: {
              env: {
                mode: "usage",
                coreJs: "3.42.0",
                targets: [ "chrome >= 60", "edge >= 17", "firefox >= 60", "safari >= 11.1" ]
              },
              isModule: "unknown"
            }
          }
        ]
      },
      {
        test: /\.js$/i,
        include: [
          path.resolve(root, "node_modules/@h-ocx/common"),
          path.resolve(root, "node_modules/web-control"),
          path.resolve(root, "node_modules/@hui-pro/highlight"),
          path.resolve(root, "node_modules/@hui-pro/sync-tree"),
          path.resolve(root, "node_modules/@hui-pro/sync-tree-select"),
          path.resolve(root, "node_modules/@hui-pro/dynamic-form"),
          path.resolve(root, "node_modules/@hui/scrollbar"),
          path.resolve(root, "node_modules/uuid")
        ],
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: {
                    "chrome": "60",
                    "edge": "17",
                    "firefox": "60",
                    "safari": "11.1"
                  },
                  useBuiltIns: "usage",
                  corejs: "3.42.0"
                },
              ]
            ],
            plugins: ["@vue/babel-plugin-transform-vue-jsx"]
          }
        }
      },
      {
        test: /\.(png|gif|jpeg|jpg|svg|cur)$/i,
        type: "asset",
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024
          }
        },
        generator: {
          filename: "static/img/[name].[hash:8].[ext]"
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: "asset/resource",
        generator: {
          filename: "static/fonts/[name].[hash:8].[ext]"
        }
      },
      {
        test: /\.(mp3|mp4|webm|ogg|wav|flac|acc)$/i,
        type: "asset/resource",
        generator: {
          filename: "static/media/[name].[hash:8].[ext]"
        }
      },
      {
        test: /\.(sass|scss)$/i,
        exclude: /\.css$/i,
        use: [
          isDev ? "style-loader" : {
            loader: rspack.CssExtractRspackPlugin.loader,
            options: { publicPath: "auto" }
          },
          "css-loader",
          {
            loader: "sass-loader",
            options: {
              api: "modern-compiler",
              implementation: sass
            },
          }
        ],
        type: "javascript/auto"
      },
      {
        test: /\.css$/i,
        use: [
          isDev ? "style-loader" : {
            loader: rspack.CssExtractRspackPlugin.loader,
            options: { publicPath: "auto" }
          },
          "css-loader"
        ]
      }
    ]
  },
  plugins: [
    new ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
      process: "process/browser"
    }),
    new AddCharsetWebpackPlugin({ charset: "utf-8" }),
    new VueLoaderPlugin(),
    new rspack.HtmlRspackPlugin({
      filename: "index.html",
      template: path.resolve(root, "public/index.tpl"),
      inject: true,
      publicPath: publicPath,
      templateParameters: {
        BASE_URL: publicPath,
        VUE_APP_ASSETS: `${JSON.parse(defineEnv["process.env.VUE_APP_ASSETS"])}`,
        DEV_INJECT_SCRIPT: ""
      }
    }),
    new rspack.CopyRspackPlugin({
      patterns: [{ 
        from: path.resolve(root, "public"),
        globOptions: {
          ignore: ["**/index.tpl", "**/.DS_Store"]
        }
      }]      
    }),
    ...(!isDev ? [
      new rspack.CssExtractRspackPlugin({
        filename: "static/css/[name].[contenthash:12].css",
        chunkFilename: "static/css/[name].[contenthash:12].css",
        ignoreOrder: true
      })
    ] : []),
    new rspack.DefinePlugin(defineEnv),
    new DevServerInfoRspackPlugin({ open: false }),
    process.env.RSDOCTOR && new RsdoctorRspackPlugin({})
  ],
  ignoreWarnings: [
    (warning) => typeof warning.message === "string" && warning.message.includes("Sass @import rules are deprecated"),
    (warning) => typeof warning.message === "string" && warning.message.includes("Global built-in functions are deprecated"),
    (warning) => typeof warning.message === "string" && /\b[a-z]+\(\) is deprecated\. Suggestion:/.test(warning.message),
    (warning) => typeof warning.message === "string" && warning.message.includes("repetitive deprecation warnings omitted"),
    (warning) => typeof warning.message === "string" && warning.message.includes("is deprecated and will be removed in Dart Sass 2.0.0"),
    (warning) => typeof warning.message === "string" && warning.message.includes("More info: https://sass-lang.com/d/mixed-decls"),
    (warning) => typeof warning.message === "string" && warning.message.includes("As of Dart Sass 2.0.0")
  ]
};