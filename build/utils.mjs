
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export function getLoginConfig () {
  const filePath = path.resolve(__dirname, "./rspack.login.config.mjs");
  const content = fs.readFileSync(filePath, "utf-8");
  const match = content.match(/export\s+default\s+({[\s\S]*});?/m);
  const loginConfig = new Function(`return ${match[1]}`)();
  return loginConfig;
}