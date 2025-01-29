// // import globals from "globals";
// import tseslint from "typescript-eslint";
// import tsparser from "@typescript-eslint/parser";
// import stylistic from "@stylistic/eslint-plugin";

// const globals = require("globals");
const tseslint = require("typescript-eslint");
const tsparser = require("@typescript-eslint/parser");
const stylistic = require("@stylistic/eslint-plugin");

/**
 * [ESLint Config Inspector] - Visually check eslint config
 * npx eslint --inspect-config
 *  - https://ma-vericks.com/blog/eslint-flat-config/
 */
const ignoreConfig = {
  ignores: [
    "etc/**/*.js",
    "tmp/**/*.js",
    "dist/**/*.js",
    "build/**/*.js",
    "samples/**/*.js",
    "scripts/**/*.js",
    "coverage/**/*.js",
  ]
};

// /** @type {import('eslint').Linter.Config[]} */
exports = tseslint.config( // did not work...why?
// // okay, but [MODULE_TYPELESS_PACKAGE_JSON] Warning will appear, which can be ignored.
// export default tseslint.config(
  ignoreConfig,
  {
    ignores: ignoreConfig.ignores,
    files: ["src/**/*.ts"],
    languageOptions: {
      sourceType: "script",
      parser: tsparser,
      // globals: globals.browser
    },
    plugins: {
      // @ts-ignore
      // "@typescript-eslint": tseslint,
      "@stylistic": stylistic,
    },
    rules: {
      "@stylistic/indent": ["warn", 4, {
          SwitchCase: 2
      }],
      "@stylistic/member-delimiter-style": [
          "error", {
              multiline: {
                  delimiter: "semi",
                  requireLast: true
              },
              singleline: {
                  delimiter: "semi",
                  requireLast: false
              }
          }
      ],
      "@stylistic/prefer-function-type": "off",
      "@stylistic/quotes": ["error", "double", { avoidEscape: true }],
      "@stylistic/semi": ["error", "always"],
      "@stylistic/semi-spacing": ["error", {after: true, before: false}],
      "@stylistic/semi-style": ["error", "last"],
      "@stylistic/no-extra-semi": "error",
      "no-unexpected-multiline": "error",
      "no-unreachable": "error",
      "camelcase": [
          "error", {
              allow: [
                  "[\\w_]+"
              ]
          }
      ],
      "@stylistic/comma-dangle": "off",
      "curly": [
          "error", "multi-line"
      ],
      "id-denylist": "error",
      "id-match": "error", // see https://eslint.org/docs/rules/id-match
      "max-classes-per-file": [
          "error", 4
      ],
      "@stylistic/max-len": [
          "error", {
              code: 250, comments: 150
          }
      ],
      "no-cond-assign": "off",
      "@stylistic/no-trailing-spaces": [
          "error", {
              ignoreComments: true
          }
      ],
      "@stylistic/padding-line-between-statements": [
          "off", {
              blankLine: "always",
              prev: "*",
              next: "return"
          }
      ],
      radix: "off",
      // https://eslint.org/docs/rules/keyword-spacing
      "@stylistic/keyword-spacing": "error",
    }
  }
);
