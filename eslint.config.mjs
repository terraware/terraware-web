import { fixupConfigRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import stylisticJs from '@stylistic/eslint-plugin-js';
import typescriptEslintTslint from '@typescript-eslint/eslint-plugin-tslint';
import tsParser from '@typescript-eslint/parser';
import jsdoc from 'eslint-plugin-jsdoc';
import nodePlugin from 'eslint-plugin-n';
import preferArrow from 'eslint-plugin-prefer-arrow';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default fixupConfigRules([
  ...compat
    .extends(
      'plugin:@typescript-eslint/recommended',
      'plugin:@typescript-eslint/recommended-requiring-type-checking',
      'plugin:react/recommended',
      'plugin:jest-react/recommended',
      // 'plugin:storybook/recommended',
      'prettier'
    )
    .map((config) => ({
      ...config,
      files: ['**/*.ts', '**/*.tsx'],
      ignores: ['**/generated-schema.ts', 'src/queries/generated/*'],
    })),
  reactHooks.configs['recommended-latest'],
  {
    files: ['**/*.ts', '**/*.tsx'],

    ignores: ['**/generated-schema.ts', 'src/queries/generated/*'],

    plugins: {
      jsdoc,
      n: nodePlugin,
      react: reactPlugin,
      'prefer-arrow': preferArrow,
      '@stylistic/js': stylisticJs,
      '@typescript-eslint/tslint': typescriptEslintTslint,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },

      parser: tsParser,

      parserOptions: {
        parser: tsParser,
        project: './tsconfig.json',
      },
    },

    rules: {
      '@stylistic/js/array-bracket-spacing': ['error', 'never'],

      '@stylistic/js/arrow-spacing': 'error',

      '@stylistic/js/brace-style': ['error', '1tbs', { allowSingleLine: true }],

      '@stylistic/js/no-mixed-spaces-and-tabs': 'error',

      '@typescript-eslint/adjacent-overload-signatures': 'error',

      '@typescript-eslint/array-type': [
        'error',
        {
          default: 'array',
        },
      ],

      '@typescript-eslint/ban-ts-comment': 'error',

      '@typescript-eslint/ban-types': [
        'error',
        {
          types: {
            Object: {
              message: 'Avoid using the `Object` type. Did you mean `object`?',
            },

            Function: {
              message: 'Avoid using the `Function` type. Prefer a specific function type, like `() => void`.',
            },

            Boolean: {
              message: 'Avoid using the `Boolean` type. Did you mean `boolean`?',
            },

            Number: {
              message: 'Avoid using the `Number` type. Did you mean `number`?',
            },

            String: {
              message: 'Avoid using the `String` type. Did you mean `string`?',
            },

            Symbol: {
              message: 'Avoid using the `Symbol` type. Did you mean `symbol`?',
            },
          },
        },
      ],

      '@typescript-eslint/consistent-type-assertions': 'error',
      '@typescript-eslint/dot-notation': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',

      '@typescript-eslint/indent': 'off', // Conflict with prettier

      '@typescript-eslint/member-delimiter-style': [
        'error',
        {
          multiline: {
            delimiter: 'semi',
            requireLast: true,
          },

          singleline: {
            delimiter: 'semi',
            requireLast: false,
          },
        },
      ],

      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'forbid',
        },
      ],

      '@typescript-eslint/no-array-constructor': 'error',
      '@typescript-eslint/no-duplicate-enum-values': 'error',
      '@typescript-eslint/no-empty-function': 'error',
      '@typescript-eslint/no-empty-interface': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-extra-non-null-assertion': 'error',
      '@typescript-eslint/no-loss-of-precision': 'error',
      '@typescript-eslint/no-misused-new': 'error',
      '@typescript-eslint/no-namespace': 'error',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
      '@typescript-eslint/no-parameter-properties': 'off',

      '@typescript-eslint/no-shadow': [
        'error',
        {
          hoist: 'all',
        },
      ],

      '@typescript-eslint/no-this-alias': 'error',
      '@typescript-eslint/no-unnecessary-type-constraint': 'error',
      '@typescript-eslint/no-unsafe-declaration-merging': 'error',
      '@typescript-eslint/no-unused-expressions': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/no-var-requires': 'error',
      '@typescript-eslint/prefer-as-const': 'error',
      '@typescript-eslint/prefer-for-of': 'error',
      '@typescript-eslint/prefer-function-type': 'error',
      '@typescript-eslint/prefer-namespace-keyword': 'error',

      '@typescript-eslint/quotes': [
        'error',
        'single',
        {
          avoidEscape: true,
        },
      ],

      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/semi': ['error', 'always'],

      '@typescript-eslint/triple-slash-reference': [
        'error',
        {
          path: 'always',
          types: 'prefer-import',
          lib: 'always',
        },
      ],

      '@typescript-eslint/typedef': 'off',
      '@typescript-eslint/unified-signatures': 'error',

      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',

      'arrow-parens': ['error', 'always'],
      'brace-style': ['off', 'off'],
      complexity: 'off',
      'constructor-super': 'error',
      curly: 'error',
      'dot-notation': 'off',
      eqeqeq: ['error', 'always'],
      'for-direction': 'error',
      'getter-return': 'error',
      'guard-for-in': 'error',

      'id-denylist': [
        'error',
        'any',
        'Number',
        'number',
        'String',
        'string',
        'Boolean',
        'boolean',
        'Undefined',
        'undefined',
      ],

      'id-match': 'error',
      'jsdoc/check-alignment': 'error',
      'jsdoc/check-indentation': 'off',
      'linebreak-style': ['error', 'unix'],
      'max-classes-per-file': ['error', 1],

      'n/handle-callback-err': ['error', '^(e|err|error)$'],

      'new-parens': 'error',
      'no-array-constructor': 'off',
      'no-async-promise-executor': 'error',
      'no-bitwise': 'error',
      'no-caller': 'error',
      'no-case-declarations': 'error',
      'no-class-assign': 'error',
      'no-compare-neg-zero': 'error',
      'no-cond-assign': 'error',
      'no-console': 'warn',
      'no-const-assign': 'error',
      'no-constant-binary-expression': 'error',
      'no-constant-condition': 'error',
      'no-control-regex': 'error',
      'no-debugger': 'error',
      'no-delete-var': 'error',
      'no-dupe-args': 'error',
      'no-dupe-class-members': 'error',
      'no-dupe-else-if': 'error',
      'no-dupe-keys': 'error',
      'no-duplicate-case': 'error',
      'no-empty': 'error',
      'no-empty-character-class': 'error',
      'no-empty-function': 'off',
      'no-empty-pattern': 'error',
      'no-empty-static-block': 'error',
      'no-eval': 'error',
      'no-ex-assign': 'error',
      'no-extra-boolean-cast': 'error',
      'no-fallthrough': 'off',
      'no-func-assign': 'error',
      'no-global-assign': 'error',
      'no-import-assign': 'error',
      'no-invalid-regexp': 'error',
      'no-invalid-this': 'off',
      'no-irregular-whitespace': 'error',
      'no-loss-of-precision': 'off',
      'no-misleading-character-class': 'error',
      'no-new-native-nonconstructor': 'error',
      'no-new-wrappers': 'error',
      'no-nonoctal-decimal-escape': 'error',
      'no-obj-calls': 'error',
      'no-octal': 'error',
      'no-prototype-builtins': 'error',
      'no-redeclare': 'error',
      'no-regex-spaces': 'error',
      'no-self-assign': 'error',
      'no-setter-return': 'error',
      'no-shadow': 'off',
      'no-shadow-restricted-names': 'error',
      'no-sparse-arrays': 'error',
      'no-this-before-super': 'error',
      'no-throw-literal': 'error',

      'no-trailing-spaces': [
        'error',
        {
          skipBlankLines: true,
        },
      ],

      'no-undef': 'off', // Not needed for Typescript

      'no-undef-init': 'error',
      'no-underscore-dangle': 'off',
      'no-unexpected-multiline': 'error',
      'no-unreachable': 'error',
      'no-unsafe-finally': 'error',
      'no-unsafe-negation': 'error',
      'no-unsafe-optional-chaining': 'error',
      'no-unused-expressions': 'off',
      'no-unused-labels': 'error',
      'no-unused-private-class-members': 'error',
      'no-unused-vars': 'off',
      'no-use-before-define': 'off',
      'no-useless-backreference': 'error',
      'no-useless-catch': 'error',
      'no-useless-escape': 'error',
      'no-var': 'error',
      'no-with': 'error',
      'object-shorthand': 'error',
      'one-var': ['error', 'never'],

      'padded-blocks': [
        'off',
        {
          blocks: 'never',
        },
        {
          allowSingleLineBlocks: true,
        },
      ],

      'prefer-arrow/prefer-arrow-functions': [
        'error',
        {
          allowStandaloneDeclarations: true,
        },
      ],

      'prefer-const': 'error',
      radix: 'error',

      // react
      'react/display-name': 'error',
      'react/jsx-boolean-value': 'off',
      'react/jsx-key': 'error',
      'react/jsx-no-bind': process.env.NODE_ENV === 'development' ? 'off' : 'error',
      'react/jsx-no-comment-textnodes': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-target-blank': 'error',

      'react/jsx-no-undef': 'off', // Not needed for TSX

      'react/jsx-tag-spacing': [
        'off',
        {
          afterOpening: 'allow',
          closingSlash: 'allow',
        },
      ],

      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react/no-children-prop': 'error',
      'react/no-danger-with-children': 'error',
      'react/no-deprecated': 'error',
      'react/no-direct-mutation-state': 'error',
      'react/no-find-dom-node': 'error',
      'react/no-is-mounted': 'error',
      'react/no-render-return-value': 'error',
      'react/no-string-refs': 'error',
      'react/no-unescaped-entities': 'error',
      'react/no-unknown-property': 'error',
      'react/no-unsafe': 'off',
      'react/prop-types': 'error',
      'react/react-in-jsx-scope': 'error',
      'react/require-render-return': 'error',
      'react/self-closing-comp': 'error',

      // react-hooks
      'react-hooks/exhaustive-deps': 'error',

      'require-await': 'off',
      'require-yield': 'error',
      'space-in-parens': ['off', 'never'],

      'spaced-comment': [
        'error',
        'always',
        {
          markers: ['/'],
        },
      ],

      'use-isnan': 'error',
      'valid-typeof': 'off',

      '@typescript-eslint/tslint/config': [
        'error',
        {
          rules: {
            // Deprecated: replaced by @stylistic/js/array-bracket-spacing
            //'array-bracket-spacing': [true, 'never'],

            // Deprecated: replaced by @stylistic/js/brace-style
            // 'brace-style': [
            //   true,
            //   '1tbs',
            //   {
            //     allowSingleLine: true,
            //   },
            // ],

            // Depreacted: replaced by n/handle-callback-err
            // 'handle-callback-err': [true, '^(e|err|error)$'],

            // Replaced by react/jsx-no-string-ref
            // 'jsx-no-string-ref': true,

            // Duplicated
            // 'no-ex-assign': true,

            // Replaced by @stylistic/js/arrow-spacing
            // 'ter-arrow-spacing': true,

            // Replaced by @stylistic/js/no-mixed-spaces-and-tabs
            // 'ter-no-mixed-spaces-and-tabs': true,

            // Duplicated
            // 'ter-prefer-arrow-callback': true,

            whitespace: true,
          },
        },
      ],
    },
  },
]);
