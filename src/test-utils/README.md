# Component test harness

Everything needed to render a Terraware component in a unit test. If you find yourself hand-rolling
providers or a store in a test file, something here is missing — extend it rather than working
around it.

## Writing a test

```tsx
import React from 'react';

import { screen } from '@testing-library/react';

import SpeciesListView from 'src/scenes/Species/SpeciesListView';
import strings from 'src/strings';
import { buildOrganization, mockGet, renderWithProviders } from 'src/test-utils';

describe('SpeciesListView', () => {
  it('lists the organization species', async () => {
    mockGet('/api/v1/species', { species: buildSpeciesList() });

    renderWithProviders(<SpeciesListView />);

    expect(await screen.findByText('Acacia koa')).toBeInTheDocument();
  });
});
```

Run one file while you iterate:

```bash
yarn test src/scenes/Species/SpeciesListView.test.tsx
```

## `renderWithProviders(ui, options)`

Renders inside the same provider stack as the app — redux store, RTK Query, user, organization,
localization, funding entity, MUI theme, dayjs date adapter, and a router — all already
bootstrapped.

The real providers in `src/providers` fetch on mount and hold their children behind a spinner. The
harness supplies context values directly instead, because a test almost never cares how that data
arrived. The practical effect: **you only mock the endpoints the component under test actually
calls**, not the whole bootstrap sequence.

Options let you override any of those contexts, seed redux state, and set the route. They are
documented on `RenderWithProvidersOptions` in `renderWithProviders.tsx` — read the type rather than
a list here, which would go stale.

Returns everything React Testing Library returns, plus a `store` to assert on or dispatch to, and a
`user` (a `userEvent` instance) to drive interactions with. Prefer that over `fireEvent`.

The sections below cover the parts that are not obvious from the type.

### Permissions

`isAllowed` is wired to the real rules in `src/utils/acl`, bound to whichever user is in play. Move
a test across a permission boundary by changing the organization role or the user's global roles,
not by stubbing the check:

```tsx
renderWithProviders(<Thing />, {
  organization: { selectedOrganization: buildOrganization({ role: 'Contributor' }) },
});
```

### Routing

```tsx
renderWithProviders(<SpeciesDetail />, { route: '/species/7', path: '/species/:speciesId' });
```

To assert on navigation, render a small probe next to the component and read the location from it —
see `PlantsDashboardEmptyMessage.test.tsx`.

### Locale

Overriding the locale switches the string tables too, so `strings.SOMETHING` returns translated
copy and components from `@terraware/web-components` change language along with the app — the same
three things the real `LocalizationProvider` moves together. The locale resets to English after each
test.

```tsx
renderWithProviders(<Thing />, { localization: { activeLocale: 'fr', selectedLocale: 'fr' } });
// strings.SAVE === 'Sauvegarder'
```

Useful for locale-dependent formatting (number grouping, dates) as well as translated copy. Assert
via `strings.SOME_KEY` rather than a translated literal so the test doesn't break every time a
translation is revised.

## Mocking the API

MSW intercepts at the network layer, so components run their real query hooks, real cache, and real
loading and error transitions. Only the HTTP response is fake, which means a change to an endpoint's
shape breaks the test — that is the point.

```ts
mockGet('/api/v1/species', { species: buildSpeciesList() }); // wraps in { status: 'ok', ... }
mockPost('/api/v1/species', { id: 7 });
mockError('get', '/api/v1/species'); // 500 with an error envelope
```

Handlers reset between tests. For anything the helpers don't cover — asserting on a request body,
returning different responses across calls, a non-enveloped endpoint — reach for `server.use` with
`http` from `msw` directly, or use `captureRequests`:

```ts
const requests = captureRequests('post', '/api/v1/species', { id: 7 });
await user.click(screen.getByRole('button', { name: strings.SAVE }));
await waitFor(() => expect(requests).toHaveLength(1));
expect(await requests[0].json()).toMatchObject({ scientificName: 'Acacia koa' });
```

**Unhandled requests fail the test.** Any request that reaches the network without a handler is
recorded and thrown in `afterEach`, naming the method and URL. Mock it rather than working around
the check — a test that silently fetches nothing is worse than no test.

Note that `onUnhandledRequest: 'error'` alone would _not_ do this. MSW turns an unhandled request
into a rejected fetch, and RTK Query stores that as ordinary error state, so a test that doesn't
assert on the affected query would stay green. The `afterEach` check is what makes the guarantee
real: add an endpoint to a component and every test rendering it fails until the mock exists.

## Fixtures

`src/test-utils/fixtures` holds `build*` functions for the common domain objects — users,
organizations, facilities, species, and so on. Each fills in plausible defaults and takes an
overrides object, so a test names only what it cares about:

```ts
buildOrganization({ role: 'Contributor', facilities: [] });
buildUser({ globalRoles: ['Accelerator Admin'] });
```

See the directory for what exists. Add a builder there the first time a second test needs the same
shape, and export it from `fixtures/index.ts`.

## Reference tests

Four tests, written to be copied:

1. `src/components/common/Timestamp.test.tsx` — context-driven rendering.
2. `src/components/emptyStatePages/PlantsDashboardEmptyMessage.test.tsx` — permissions and
   interaction.
3. `src/scenes/InventoryRouter/view/InventorySummaryForNursery.test.tsx` — reading with RTK Query
   and MSW, including the error path.
4. `src/scenes/NurseryRouter/UndoWithdrawalModal.test.tsx` — writing: firing a mutation, asserting
   on the request that was sent, and holding the modal open when the write fails.

## What the harness sets up globally

Pulled in by `src/setupTests.js`, so tests never do this themselves:

- **Strings** (`setupStrings.ts`) — `src/strings` exports an _empty_ `LocalizedStrings` instance
  that the app fills in at runtime. Without this, every `strings.SOMETHING` is `undefined` and
  components render blank text. All supported locales are loaded so a locale override switches
  language for real; the active locale resets to English after each test. Assert against
  `strings.SOME_KEY` rather than a literal so assertions don't drift from the CSV.
- **MSW** (`msw/setup.ts`) — starts the server, resets handlers between tests, fails any test that
  made an unmocked request, and shims the global `Request` so root-relative paths resolve against
  the jsdom origin. `src/queries/baseQuery.ts` uses `baseUrl: ''`, which the browser resolves
  against the document but Node's `Request` rejects; the symptom without the shim is a query that
  silently never returns data.
- **Stylesheets** — `@terraware/web-components` imports SCSS, loaded as inert source since jsdom
  applies no styles.

## What to assert

Before writing a test, answer: **what would a failure tell us?** If it is "the component changed,"
don't write it. If it names a requirement someone would want to be consulted about before it
changed, write it.

Assert on what a user can observe — visible text, roles and accessible names, where a click
navigates, what request was sent — never on how the component achieves it. `component-test-agent.md`
has the longer version, including the specific assertion shapes to avoid.

## Known gaps

- Fixtures exist only for the domain objects the current tests needed; add more as you go.
- Map-heavy and 3D components are not covered here. Mapbox and PlayCanvas need a real GL context;
  those stay with the Playwright suites.
- Nothing here can see visual appearance. jsdom applies no styles, so layout, color, and responsive
  behavior belong in the Playwright screenshot suites.
