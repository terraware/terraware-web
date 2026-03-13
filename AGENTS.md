# Coding Agent Instructions

## Build and Development Commands

- Build: `yarn build`
- Run: `yarn run`
- Format code: `yarn format`
- Run all unit tests: `yarn test`
- TypeScript check: `yarn ts`
- Run linter:

```shell
yarn lint \
  --rule 'react/jsx-no-bind: 0' \
  --rule 'react-hooks/immutability: 0' \
  --rule 'react-hooks/refs: 0' \
  --rule 'react-hooks/set-state-in-effect: 0' \
  --rule 'react-hooks/static-components: 0'
```

## Code Style Guidelines

- Follow the conventions defined in `.prettierrc`
- Avoid comments that restate what the code already expresses
- Prefer `const`-assigned arrow functions over function declarations

## Workflow

- Install dependencies using `yarn` instead of `npm`
- After completing changes:
  - Run `yarn format`
  - Run `yarn ts`
  - Run `yarn lint:dev`
- Tests do not need to be rerun after formatting

## Internationalization

- Add new strings to `src/strings/csv/en.csv` at the bottom of the file
- After adding new strings:
  - Run `yarn alphabetize-strings`
  - Run `yarn translate`
