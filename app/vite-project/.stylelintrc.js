/**
 * @author: Tusi
 * @description: stylelint配置
 */
module.exports = {
    extends: ["stylelint-config-standard", "stylelint-prettier/recommended", "stylelint-config-prettier"],
    plugins: ["stylelint-scss", "stylelint-prettier"],
    rules: {
        'prettier/prettier': true,
        "max-empty-lines": 1,
        "selector-max-empty-lines": 0,
        "function-max-empty-lines": 0,
        "value-list-max-empty-lines": 0,
        "no-descending-specificity": null,
        "selector-pseudo-element-no-unknown": [
            true,
            {
                ignorePseudoElements: ["deep"],
            },
        ],
        "selector-pseudo-class-no-unknown": [
            true,
            {
                ignorePseudoClasses: ["deep", "global"],
            },
        ],
        "at-rule-no-unknown": [
            true,
            {
                ignoreAtRules: ["mixin", "include", "extend", "at-root"]
            }
        ]
    },
};
