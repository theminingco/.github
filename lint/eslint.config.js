const stylistic = require("@stylistic/eslint-plugin");
const typescript = require("@typescript-eslint/eslint-plugin");
const react = require("eslint-plugin-react");
const next = require("@next/eslint-plugin-next");
const parser = require("@typescript-eslint/parser");
const globals = require("globals");

module.exports = [
  {
    ignores: ["**/lib/**", "**/node_modules/**", ".yarn/**", ".nx/**", "**/.next/**", "**/generated/**"],
  },
  {
    plugins: {
      "@stylistic": stylistic,
    },
    languageOptions: {
      parser,
    },
    files: ["**/*.json"],
    rules: {
      "@stylistic/indent": ["error", 2],
      "@stylistic/linebreak-style": ["error", "unix"],
      "@stylistic/quotes": ["error", "double"],
    },
  },
  {
    plugins: {
      "@stylistic": stylistic,
    },
    languageOptions: {
      parser,
    },
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    rules: {
      ...stylistic.configs["all-flat"].rules,
      "@stylistic/array-bracket-newline": ["error", "consistent"],
      "@stylistic/comma-dangle": ["error", "always-multiline"],
      "@stylistic/arrow-parens": ["error", "as-needed"],
      "@stylistic/dot-location": ["error", "property"],
      "@stylistic/brace-style": ["error", "1tbs", { allowSingleLine: true }],
      "@stylistic/function-paren-newline": ["error", "consistent"],
      "@stylistic/multiline-ternary": ["error", "always-multiline"],
      "@stylistic/no-extra-parens": ["error", "all", { ignoreJSX: "multi-line" }],
      "@stylistic/indent": ["error", 2],
      "@stylistic/linebreak-style": ["error", "unix"],
      "@stylistic/quotes": ["error", "double"],
      "@stylistic/semi": ["error", "always"],
      "@stylistic/quote-props": ["error", "consistent-as-needed"],
      "@stylistic/function-call-argument-newline": ["error", "consistent"],
      "@stylistic/space-before-function-paren": ["error", { anonymous: "always", named: "never", asyncArrow: "always" }],
      "@stylistic/object-curly-spacing": ["error", "always"],
      "@stylistic/object-curly-newline": ["error", { consistent: true }],
      "@stylistic/object-property-newline": ["error", { allowAllPropertiesOnSameLine: true }],
      "@stylistic/member-delimiter-style": ["error", { multiline: { delimiter: "semi", requireLast: true }, singleline: { delimiter: "comma", requireLast: false } }],
      "@stylistic/jsx-wrap-multilines": ["error", { declaration: "parens-new-line" }],
      "@stylistic/multiline-comment-style": ["error", "separate-lines"],
      "@stylistic/array-element-newline": "off",
      "@stylistic/padded-blocks": "off",
      "@stylistic/lines-between-class-members": "off",
      "@stylistic/no-confusing-arrow": "off",
    },
  },
  {
    plugins: {
      "@typescript-eslint": typescript,
    },
    languageOptions: {
      parser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      ...typescript.configs["all"].rules,
      "@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: false }],
      "@typescript-eslint/no-use-before-define": ["error", "nofunc"],
      "@typescript-eslint/no-confusing-void-expression": ["error", { ignoreArrowShorthand: true }],
      "@typescript-eslint/explicit-function-return-type": ["error", { allowExpressions: true }],
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" }],
      "@typescript-eslint/array-type": ["error", { default: "array", readonly: "array" }],
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/naming-convention": "off",
      "@typescript-eslint/space-before-function-paren": "off",
      "@typescript-eslint/member-ordering": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-magic-numbers": "off",
      "@typescript-eslint/prefer-readonly-parameter-types": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/brace-style": "off",
      "@typescript-eslint/sort-type-constituents": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
      "@typescript-eslint/lines-between-class-members": "off",
      "@typescript-eslint/max-params": "off",
      "@typescript-eslint/prefer-destructuring": "off",
      "@typescript-eslint/use-unknown-in-catch-callback-variable": "off",
      "@typescript-eslint/init-declarations": "off",
      "@typescript-eslint/parameter-properties": "off",
      "@typescript-eslint/consistent-return": "off",
    },
  },
  {
    plugins: {
      "@next/next": next,
    },
    languageOptions: {
      parser,
    },
    settings: {
      next: {
        rootDir: "web",
      },
    },
    files: ["web/**/*.ts", "web/**/*.tsx", "web/**/*.js", "web/**/*.jsx"],
    rules: {
      ...next.configs["recommended"].rules,
      // following rules are disabled because then don't work in eslint 9 yet
      "@next/next/no-duplicate-head": "off",
      "@next/next/no-page-custom-font": "off",
    },
  },
  {
    plugins: {
      react,
    },
    languageOptions: {
      parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    rules: {
      ...react.configs["all"].rules,
      "react/jsx-indent": ["error", 2],
      "react/jsx-filename-extension": ["error", { extensions: [".jsx", ".tsx"] }],
      "react/jsx-indent-props": ["error", 2],
      "react/jsx-newline": ["error", { prevent: true }],
      "react/no-unknown-property": ["error", { ignore: ["tw"] }],
      "react/jsx-one-expression-per-line": "off",
      "react/jsx-max-props-per-line": "off",
      "react/jsx-no-literals": "off",
      "react/jsx-no-useless-fragment": "off",
      "react/forbid-component-props": "off",
      "react/jsx-sort-props": "off",
      "react/jsx-props-no-spreading": "off",
      "react/jsx-handler-names": "off",
      "react/jsx-first-prop-new-line": "off",
      "react/jsx-closing-bracket-location": "off",
      "react/no-danger": "off",
      // following rules are disabled because then don't work in eslint 9 yet
      "react/destructuring-assignment": "off",
      "react/jsx-no-bind": "off",
      "react/no-access-state-in-setstate": "off",
      "react/no-unstable-nested-components": "off",
      "react/no-array-index-key": "off",
      "react/no-direct-mutation-state": "off",
      "react/no-string-refs": "off",
      "react/static-property-placement": "off",
      "react/boolean-prop-naming": "off",
      "react/default-props-match-prop-types": "off",
      "react/display-name": "off",
      "react/function-component-definition": "off",
      "react/hook-use-state": "off",
      "react/jsx-no-constructed-context-values": "off",
      "react/no-arrow-function-lifecycle": "off",
      "react/no-multi-comp": "off",
      "react/no-set-state": "off",
      "react/no-this-in-sfc": "off",
      "react/no-typos": "off",
      "react/no-unused-prop-types": "off",
      "react/no-object-type-as-default-prop": "off",
      "react/prefer-exact-props": "off",
      "react/prefer-read-only-props": "off",
      "react/prefer-stateless-function": "off",
      "react/prop-types": "off",
      "react/require-default-props": "off",
      "react/require-optimization": "off",
      "react/require-render-return": "off",
      "react/sort-comp": "off",
      "react/jsx-uses-react": "off",
      "react/jsx-no-undef": "off",
      "react/forbid-prop-types": "off",
      "react/jsx-uses-vars": "off",
      "react/react-in-jsx-scope": "off",
      "react/jsx-max-depth": "off",
      "react/jsx-fragments": "off",
      "react/no-danger-with-children": "off",
      "react/button-has-type": "off",
      "react/checked-requires-onchange-or-readonly": "off",
      "react/forbid-elements": "off",
      "react/iframe-missing-sandbox": "off",
      "react/no-adjacent-inline-elements": "off",
      "react/no-children-prop": "off",
      "react/no-namespace": "off",
      "react/style-prop-object": "off",
      "react/void-dom-elements-no-children": "off",
      "react/sort-default-props": "off",
    },
  },
  {
    plugins: {
      "@typescript-eslint": typescript,
    },
    languageOptions: {
      parser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    files: ["web/**/*.ts", "web/**/*.tsx"],
    rules: {
      "@typescript-eslint/no-restricted-imports": ["error", {
        paths: [{
          name: "@theminingco/core",
          message: "Please use a fully qualified import path instead.",
        }],
      }],
    },
  },
];
