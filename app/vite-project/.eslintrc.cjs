const path = require("path");

module.exports = {
    root: true,
    env: {
        node: true,
    },
    parser: "vue-eslint-parser",
    parserOptions: {
        // for script
        parser: "@typescript-eslint/parser",
        ecmaVersion: 2020,
    },
    extends: [
        "@fullstack-blog/eslint-config/base.js",
        "plugin:vue/vue3-strongly-recommended",
        "@vue/typescript/recommended",
        "@vue/prettier",
        "@vue/prettier/@typescript-eslint",
    ],
    plugins: ["@typescript-eslint", "vue"],
    rules: {
        "no-debugger": 'error',
        "no-case-declarations": 'off',
        "import/order": 'warn',
        "import/no-unresolved": 'off',
        // https://eslint.vuejs.org/rules/
        "vue/require-default-prop": 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
    overrides: [
        {
            files: ["**/__tests__/*.{j,t}s?(x)", "**/tests/unit/**/*.spec.{j,t}s?(x)"],
            env: {
                jest: true,
            },
        },
        {
            files: ["*.ts", "*.tsx", "*.vue"],
            plugins: ["@typescript-eslint"],
            rules: {
                "no-shadow": "off",
                "@typescript-eslint/no-explicit-any": [2, { ignoreRestArgs: true }],
            },
        },
    ],
};
