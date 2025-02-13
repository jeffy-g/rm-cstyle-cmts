// import globals from "globals";
import tsesconfig from "typescript-eslint";
import tsparser from "@typescript-eslint/parser";
import tseslintPlugin from "@typescript-eslint/eslint-plugin";
import stylistic from "@stylistic/eslint-plugin";

/**
 * [ESLint Config Inspector] - Visually check eslint config
 * npx eslint --inspect-config
 *  - https://ma-vericks.com/blog/eslint-flat-config/
 */
const ignoreConfig = {
  ignores: [
    "dist",
    "build",
    "scripts",
    "webpack.config.js",
    "dist/*",
    "coverage/*",
    "build/*",
    "scripts/*",
    "__tests__/*",
    "tmp/*",
  ]
};

// https://typescript-eslint.io/play
export default tsesconfig.config(
  // export default [{
  ignoreConfig,
  {
    ignores: ignoreConfig.ignores,
    files: ["src/**/*.ts"],
    languageOptions: {
      // // The env option has been removed, globals is used instead.
      // globals: {
      //   // ...globals.browser,
      //   // ...globals.node,
      //   ...globals.es2021
      // },
      parser: tsparser,
      sourceType: "module",
      // Same as parserOptions in eslintrc.
      parserOptions: {
        // DEVNOTE: 2025/01/31
        // The paramater `sourceType` can be specified in languageOptions and parserOptions, which is confusing.
        // sourceType: "script",
        // DEVNOTE: 2025/01/31
        // From the above, it took me a while to realize that setting `parser` here was a mistake.
        // Also, `parserOptions` has an entry `[additionalProperties: string]: unknown;`,
        // so it doesn't result in an error...
        // parser: tsparser,
        // ecmaVersion: 2022,
      },
    },

    // It is now possible to specify the name of a plugin, but there are some things to be aware of.
    plugins: {
      "@tseslintPlugin": tseslintPlugin,
      "@stylistic": stylistic,
    },
    rules: {
      // "@tseslintPlugin/array-type": ["warn", {
      //   default: "array-simple"
      // }],
      "@stylistic/indent": ["warn", 4, {
        SwitchCase: 1
      }],
      "@stylistic/member-delimiter-style": [
        "error",
        {
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
      "@stylistic/semi-spacing": ["error", { after: true, before: false }],
      "@stylistic/semi-style": ["error", "last"],
      "@stylistic/no-extra-semi": "error",
      "no-unexpected-multiline": "error",
      "no-unreachable": "error",

      "@stylistic/comma-dangle": "off",
      // https://eslint.org/docs/rules/keyword-spacing
      "@stylistic/keyword-spacing": "error",
      "@stylistic/max-len": [
        "error", {
          code: 250, comments: 180
        }
      ],
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

      "id-denylist": "error",
      "id-match": "error", // see https://eslint.org/docs/rules/id-match
      "no-cond-assign": "off",
      "max-classes-per-file": [
        "error", 4
      ],
      radix: "off",
      camelcase: [
        "error", {
          allow: [
            "[\\w_]+"
          ]
        }
      ],
      curly: [
        "error",
        "multi-line"
      ],
    }
  }
);
