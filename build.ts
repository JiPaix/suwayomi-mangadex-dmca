import { build, emptyDir } from "@deno/dnt";

await emptyDir("./npm");

await build({
  entryPoints: [{
    kind: "bin",
    name: "suwayomi-mangadex-dmca", // command name
    path: "./src/main.ts",
  }],
  outDir: "./npm",
  shims: {
    // see JS docs for overview and more options
    deno: true,
  },
  package: {
    // package.json properties
    name: "suwayomi-mangadex-dmca",
    version: Deno.args[0],
    description: "CLI utility for identifying manga entries in your Suwayomi library that are either missing chapters or have been removed due to takedowns.",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/jipaix/suwayomi-mangadex-dmca.git",
    },
    bugs: {
      url: "https://github.com/jipaix/suwayomi-mangadex-dmca/issues",
    },
    keywords: ["suwayomi", "tachidesk", "mangadex", "dmca", "missing", "chapters"]
  },
  postBuild() {
    // steps to run after building and before running the tests
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
  },
});