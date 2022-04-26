module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "node": true
    },
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint",
    ],
    "rules": {
        "indent": ["warn", 4, {
            "SwitchCase": 1
        }],
        "@typescript-eslint/array-type": ["warn", {
            "default": "array-simple"
        }],
        // "@typescript-eslint/await-thenable": 1,
        "@typescript-eslint/member-delimiter-style": [
            "error",
            {
                "multiline": {
                    "delimiter": "semi",
                    "requireLast": true
                },
                "singleline": {
                    "delimiter": "semi",
                    "requireLast": false
                }
            }
        ],
        "@typescript-eslint/no-require-imports": "error",
        "@typescript-eslint/no-var-requires": "error",
        "prefer-function-type": "off",

        quotes: ["error", "double", { "avoidEscape": true }],

        "semi": ["error", "always"],
        "semi-spacing": ["error", {"after": true, "before": false}],
        "semi-style": ["error", "last"],
        "no-extra-semi": "error",
        "no-unexpected-multiline": "error",
        "no-unreachable": "error",

        "camelcase": [
            "error", {
                allow: [
                    "[\\w_]+"
                ]
            }
        ],
        "comma-dangle": "off",
        "curly": [
            "error",
            "multi-line"
        ],
        "id-denylist": "error",
        "id-match": "error", // see https://eslint.org/docs/rules/id-match
        "max-classes-per-file": [
            "error",
            4
        ],
        // see https://eslint.org/docs/rules/max-len
        "max-len": [
            "error", {
                "code": 1500, "comments": 250
            }
        ],
        "no-cond-assign": "off",
        "no-console": [
            "off",
            {
                "allow": [
                    "warn",
                    "dir",
                    "time",
                    "timeEnd",
                    "timeLog",
                    "trace",
                    "assert",
                    "clear",
                    "count",
                    "countReset",
                    "group",
                    "groupEnd",
                    "table",
                    "debug",
                    "info",
                    "dirxml",
                    "groupCollapsed",
                    "Console",
                    "profile",
                    "profileEnd",
                    "timeStamp",
                    "context"
                ]
            }
        ],
        "no-trailing-spaces": [
            "error",
            {
                "ignoreComments": true
            }
        ],
        "no-underscore-dangle": [
            "error",
            {
                // "allow": [
                //     "_a", "_c", "_f", "_l"
                // ]
            }
            // { "allowAfterThis": true }
        ],
        "padding-line-between-statements": [
            "off",
            {
                "blankLine": "always",
                "prev": "*",
                "next": "return"
            }
        ],
        "radix": "off",
        // https://eslint.org/docs/rules/keyword-spacing
        "keyword-spacing": "error",
    }
};
