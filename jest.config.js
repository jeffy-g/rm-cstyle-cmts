
module.exports = {
  testEnvironment: "node",
  verbose: true,
  // `transform` property implicitly sets preset to "ts-jest"
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  // default: (/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$
  // testRegex: "/__tests__/.*\\.ts$",
  collectCoverageFrom: [
    "./src/!(*.d.ts|*.json)",
    "./dist/cjs/*.js",
    "./dist/webpack/index.js",
    "./dist/umd/index.js",
  ],
  moduleFileExtensions: [
    "ts",
    "js"
  ],
  projects: ["<rootDir>"]
};
