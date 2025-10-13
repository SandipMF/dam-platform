import { pathsToModuleNameMapper } from "ts-jest";
import { readFileSync } from "fs";
import { resolve } from "path";

const tsconfig = JSON.parse(readFileSync(resolve("./tsconfig.json"), "utf8"));

export default {
  preset: "ts-jest/presets/default-esm", // ESM compatible
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
          ...tsconfig.compilerOptions,
          module: "ESNext", // <-- override NodeNext for Jest
        },
      },
    ],
  },
  extensionsToTreatAsEsm: [".ts"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: pathsToModuleNameMapper(
    tsconfig.compilerOptions?.paths || {},
    { prefix: "<rootDir>/" }
  ),
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
};
