import path from "path";
import { rspack } from '@rspack/core';

const root = process.cwd();

export default {
  mode: "production",
  devtool: false,
  extends: path.join(root, "build/rspack.base.config.mjs"),
  optimization: {
    moduleIds: "deterministic",
    chunkIds: "deterministic",
    mergeDuplicateChunks: true,
    minimizer: [
      new rspack.SwcJsMinimizerRspackPlugin({
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
          passes: 2
        },
        mangle: {
          safari10: true
        },
        format: {
          comments: false
        }
      }),
      new rspack.LightningCssMinimizerRspackPlugin({
        cssnano: {
          preset: ['default', {
            discardComments: {
              removeAll: true,
            },
            normalizeWhitespace: true,
            colormin: true,
            minifyFontValues: true,
            minifyGradients: true,
            minifyParams: true,
            minifySelectors: true,
            mergeLonghand: true,
            mergeRules: true,
            reduceIdents: true,
            reduceInitial: true,
            reduceTransforms: true,
            uniqueSelectors: true,
            zindex: false
          }]
        }
      })
    ],
    splitChunks: {
      chunks: "all",
      maxInitialRequests: 10,
      maxAsyncRequests: 10,
      minSize: 20000,
      maxSize: 244000,
      cacheGroups: {
        /** Vue 相关库单独打包 */ 
        vue: {
          name: 'chunk-vue',
          test: /[\\/]node_modules[\\/](vue|vue-router|vue-template-compiler)[\\/]/,
          chunks: 'all',
          priority: 20,
          reuseExistingChunk: true
        },
        /** 工具库单独打包 */ 
        // utils: {
        //   name: 'chunk-utils',
        //   test: /[\\/]node_modules[\\/](core-js|uuid|js-sha256)[\\/]/,
        //   chunks: 'all',
        //   priority: 15,
        //   reuseExistingChunk: true
        // },
        /** 其他第三方库 */
        vendors: {
          name: "chunk-vendors",
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          chunks: "all",
          reuseExistingChunk: true
        },
        /** 公共代码 */
        common: {
          name: "chunk-common",
          minChunks: 2,
          priority: 5,
          chunks: "all",
          reuseExistingChunk: true
        }
      }
    }
  }
};