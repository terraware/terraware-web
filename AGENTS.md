# Coding Agent Instructions

## Build/Test Commands

- Build: `yarn build`
- Run: `yarn run`
- Format code: `yarn format`
- Run all unit tests: `yarn test`
- Typescript check: `yarn ts`
- Run linter: `yarn lint --rule "react/jsx-no-bind: 0"`

## Code Style Guidelines

- Use the conventions in .prettierrc or run the format command after changes.
- Avoid adding comments that say obvious things about what the code does.
- Prefer const-assigned arrow functions over function declarations.

## Workflow

Install new dependencies with `yarn` instead of `npm`.

Format the code, run the typescript checker, and run the linter when you're done working. There's no need to rerun tests
after code formatting.
