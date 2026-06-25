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
    process.env.CI ? "./__tests__/test.ts$": "./__tests__/.*", ccfrom
  ];
})();

module.exports = {
  testEnvironment: "node",
  verbose: true,
  collectCoverage: true,
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      tsconfig: "<rootDir>/tsconfig.jest.json",
      // ts-jest[config] (WARN) message TS151002: Using hybrid module kind (Node16/18/Next) is only supported in "isolatedModules: true".
      // Please set "isolatedModules: true" in your tsconfig.json. To disable this message, you can set "diagnostics.ignoreCodes" to include 151002 in your ts-jest config.
      // See more at https://kulshekhar.github.io/ts-jest/docs/getting-started/options/diagnostics
      diagnostics: {
        ignoreCodes: [151002]
      }
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
