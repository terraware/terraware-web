# Testing

This doc covers how we test terraware-web, and what we test with: Playwright end-to-end tests, component tests, and
unit tests.

## Summary

- Most PRDs should have a Playwright test file that covers the happy path (s).
- When you fix a regression, add a check to an existing test when possible, instead of writing a new one.
- Check styling and layout changes visually (Storybook or running the app), not with unit tests.
- Use the cheapest kind of test that can catch a bug when fixing. Unit tests are cheaper than component tests, and
  component tests are cheaper than Playwright.

## Running tests

| Command               | What it does                                                   |
| --------------------- | -------------------------------------------------------------- |
| `yarn test`           | Runs all Rstest unit and component tests in watch mode         |
| `yarn test <path>`    | Runs the tests in one file                                     |
| `yarn test-coverage`  | Runs the tests with coverage                                   |
| `yarn server:reset`   | Resets the E2E test data (run it before each Playwright run)   |
| `yarn playwright:run` | Opens the Playwright UI to run the E2E tests against local dev |

See the [Playwright README](../playwright/README.md) for E2E setup and for updating screenshot snapshots.

## E2E Playwright tests

- Cover happy path flows.
- Write tests for features that would be easy to miss if they broke. For example, if the in-app notifications for
  planting seasons stopped working because of some other change, nobody would notice right away.
- Only test with different user roles when they see substantially different pages. For example, funder reports show
  different things than console users see, but there's no need to test both accelerator admins _and_ TF experts. Test
  permissions with unit tests instead (see [Permission tests](#permission-tests)).
- Use Playwright for anything that needs a real browser or backend: maps, PlayCanvas, layout, and journeys across
  several screens.
- Use accessible locators (role, label, placeholder), and wait on a condition instead of using `waitForTimeout`.

Example: `playwright/e2e/suites/interaction/reportSubmit.spec.ts`

## Component tests

Component tests render a component with `renderWithProviders` and check what a user sees and does: form and modal
behavior, loading and error states, permission-gated UI, and the wiring between a request and what renders. Read
`src/test-utils/README.md` for the harness, the MSW mocking helpers, and the fixture builders.

- Before writing a test, ask what a failure would tell you. If the answer is just "the component changed," don't write
  it.
- Avoid tests that only check that a component renders, or that repeat its implementation.
- Assert on visible text, roles, accessible names, and the requests that were sent. Avoid snapshots, class names, and
  `data-testid` where a role or label exists.
- Component tests can't check how things look, because jsdom has no styles or layout. Check these changes manually.

Examples:

- `src/scenes/PeopleRouter/PeopleListView.test.tsx`
- `src/scenes/Species/SpeciesDetailView.test.tsx`

## Unit tests

- Functions that contain logic should have unit tests.
- Functions that mostly pass through to a third-party library usually don't need tests.
- If a component has non-trivial logic, consider moving it into a plain function and unit testing that. It's usually
  easier than testing it through the rendered component.

Examples:

- `src/utils/numbers.ts` has enough logic to be worth testing (`src/utils/numbers.test.ts`).
- `src/utils/color.ts` mostly calls the `hex-rgb` library, so it doesn't really need tests.

### Permission tests

Write permission tests as unit tests for `src/utils/acl.ts` in `src/utils/acl.test.ts`. Don't rely only on component
or E2E tests to cover permissions.

- An exception to this is when a button shouldn't show up for a user with lower permissions. This should be tested with
  a component test.

## AI agents

Claude Code agents in `.claude/agents/` write tests that follow these guidelines:

- `component-test-agent` writes tests that render a component.
- `playwright-test-agent` writes Playwright specs and unit tests for code that doesn't render.
