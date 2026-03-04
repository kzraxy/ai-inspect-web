import fs from "fs";
import path from "path";
import dotenv from "dotenv";

const root = process.cwd();
const mode = process.env.MODE;

const baseEnvPath = path.join(root, "build/env/.env");
const modeEnvPath = path.join(root, `build/env/.env.${mode}`);

const baseEnv = fs.existsSync(baseEnvPath) ? dotenv.parse(fs.readFileSync(baseEnvPath)) : {};
const modeEnv = fs.existsSync(modeEnvPath) ? dotenv.parse(fs.readFileSync(modeEnvPath)) : {};
const context = baseEnv.VUE_APP_CONTEXT.replace(/^\/|\/$/g, '');
const extra = { "BASE_URL": !context ?  "/" : `/${context}/` };
const merged = { ...baseEnv, ...modeEnv, ...extra };

const defineEnv = {
  "process.env": JSON.stringify(merged),
  ...Object.fromEntries(Object.entries(merged).map(([key, value]) => [`process.env.${key}`, JSON.stringify(value)]))
};

export default defineEnv;