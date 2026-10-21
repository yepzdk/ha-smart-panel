// Bundles the panel into one ES module that Home Assistant serves as-is.
import * as esbuild from "esbuild";

const options = {
  entryPoints: ["src/smart-panel-app.ts"],
  outfile: "../custom_components/smart_panel/frontend/smart-panel.js",
  bundle: true,
  format: "esm",
  target: "es2021",
  minify: true,
  legalComments: "eof",
  logLevel: "info",
};

if (process.argv.includes("--watch")) {
  const context = await esbuild.context(options);
  await context.watch();
} else {
  await esbuild.build(options);
}
