import esbuild from "esbuild";

esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  outfile: "dist/index.js",
  platform: "node",
  target: "node20",
  format: "esm",
  // Keep runtime deps external (installed in node_modules, avoids CJS/ESM issues)
  external: ["express", "node-telegram-bot-api", "node-cron", "gray-matter"],
  sourcemap: true,
  banner: {
    js: 'import { createRequire } from "module"; const require = createRequire(import.meta.url);',
  },
});
