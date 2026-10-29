import "dotenv/config";
import { writeFileSync } from "node:fs";
// Only this explicitly public variable is exposed. Server credentials stay private.
const apiUrl = (process.env.VITE_API_URL || "/api").replace(/\/$/, "");
writeFileSync(
  new URL("../public/assets/config.js", import.meta.url),
  `window.QYB_CONFIG = ${JSON.stringify({ apiUrl })};\n`,
);
