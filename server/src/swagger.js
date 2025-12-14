import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import YAML from "yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const docPath = path.resolve(__dirname, "../docs/openapi.yaml");
const swaggerFile = fs.readFileSync(docPath, "utf8");

export const swaggerSpec = YAML.parse(swaggerFile);
