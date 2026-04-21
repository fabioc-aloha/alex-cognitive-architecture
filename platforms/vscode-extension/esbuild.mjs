import * as esbuild from "esbuild";
import { copyFileSync, mkdirSync } from "fs";

const production = process.argv.includes("--production");

await esbuild.build({
  entryPoints: ["src/extension.ts"],
  bundle: true,
  outfile: "dist/extension.js",
  external: ["vscode"],
  format: "cjs",
  platform: "node",
  target: "node20",
  sourcemap: !production,
  minify: production,
});

// Copy codicon assets so webviews can reference them from dist/
mkdirSync("dist", { recursive: true });
copyFileSync("node_modules/@vscode/codicons/dist/codicon.css", "dist/codicon.css");
copyFileSync("node_modules/@vscode/codicons/dist/codicon.ttf", "dist/codicon.ttf");
