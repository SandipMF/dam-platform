/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest/presets/default-esm", // ESM + TypeScript
  testEnvironment: "node",
  setupFilesAfterEnv: ["./jest.setup.ts"],
  extensionsToTreatAsEsm: [".ts"],
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1", // fixes ESM import paths in TS
  },
  // transform: {
  //   "^.+\\.tsx?$": ["ts-jest", { tsconfig: "tsconfig.json" }],
  // },
};
