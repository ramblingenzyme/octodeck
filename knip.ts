import type { KnipConfig } from "knip";

export default {
  compilers: {
    css: (text: string) => [...text.matchAll(/(?<=@)import[^;]+/g)].join("\n"),
  },
  entry: ["functions/api/{callback,login,refresh,session}.ts"],
  project: ["src/**/*", "functions/**/*"],
  ignoreExportsUsedInFile: {
    interface: true,
    type: true,
  },
} satisfies KnipConfig;
