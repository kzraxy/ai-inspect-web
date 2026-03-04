const fs = require('fs');
const path = require('path');

// 配置文件内容
const configContent = `/**
 * @property {boolean} enable  是否启用配置，默认为 true
 * @property {string} username  登录用户名
 * @property {string} password  登录密码
 * @property {string} bizName   业务线表示标识
 *    - retail：连锁       - hbl：社区           - minerva：普教      - enterprise ：云眸设备
 *    - teach：教学        - aiot：智联          - otapp：OT 应用     - scenic：智慧景区
 *    - portal：门户       - open：开发者服务     - yunlai：云莱       - teach3c：三个课堂
 *    - automat：商品识别   - single：海康云眸     - metis：云眸智课    - discern：小卖柜          
 *    - mdm：海康云眸移动终端运维平台     
 * @property {string} envName   环境名称
 *    - dev：开发环境       - pb：PB测试环境       - online：生产环境
 * 
 *  热更新用法：1)enable字段设置为false 2）调整envName为对应环境 3）复制token粘贴到这里
 * 
 */

export default {
  enable: true, // 支持热更新
  username: "",
  password: "",
  bizName: "",
  envName: "", // 支持热更新
  token: "" // 支持热更新
};
`;

// 确保 build 目录存在
const buildDir = path.join(process.cwd(), 'build');
if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
}

// 检查文件是否已存在
const configPath = path.join(buildDir, 'rspack.login.config.mjs');
if (fs.existsSync(configPath)) {
    console.log(`配置文件已存在：${configPath}`);
    process.exit(0);
}

// 写入配置文件
fs.writeFileSync(configPath, configContent, 'utf8');

console.log(`配置文件已生成：${configPath}`);
