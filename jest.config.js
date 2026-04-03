const [testRegex, collectCoverageFrom] = (() => {
  let ccfrom = [
    "./src/!(*.d.ts|*.json)",
    "./dist/cjs/*.js",
    "./dist/webpack/index.js",
    "./dist/umd/index.js",
  ];
  if (!process.env.CI) {
    ccfrom = ccfrom.concat([
    "./src/gulp/!(*.d.ts|*.json)",
    "./dist/cjs/gulp/index.js",
    "./dist/webpack/gulp/index.js",
    ]);
  }
  return [
    process.env.CI? "./__tests__/test.ts$": "./__tests__/.*", ccfrom
  ];
})();

module.exports = {
  testEnvironment: "node",
  verbose: true,
  collectCoverage: true,
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      tsconfig: "<rootDir>/tsconfig.jest.json"
    }]
  },
  // default: (/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$
  testRegex,
  collectCoverageFrom,
  moduleFileExtensions: [
    "ts",
    "js"
  ]
};
