
module.exports = {
  testEnvironment: "node",
  verbose: true,
  collectCoverage: true,
  transform: {
    "^.+\\.ts$": "ts-jest"
  },
  testRegex: "/__tests__/grmc-test\\.ts",
  collectCoverageFrom: [
    "./src/!(*.d.ts|*.json)",
    "./src/gulp/!(*.d.ts|*.json)",
  ],
  moduleFileExtensions: [
    "ts",
    "js"
  ],
  projects: ["<rootDir>"]
};
