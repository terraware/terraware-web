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

| Option           | Purpose                                                                     |
| ---------------- | --------------------------------------------------------------------------- |
| `currentUser`    | Overrides for `useUser()`.                                                  |
| `organization`   | Overrides for `useOrganization()`.                                          |
| `localization`   | Overrides for `useLocalization()` — locale, countries, time zones.          |
| `fundingEntity`  | Overrides for `useUserFundingEntity()`.                                     |
| `preloadedState` | Initial redux state, for components reading a legacy feature slice.         |
| `store`          | Supply your own store to dispatch before rendering or share across renders. |
| `route` / `path` | Initial URL and route pattern, so `useParams()` resolves.                   |

Returns everything React Testing Library returns, plus:

- `store` — assert on state, or dispatch to drive the component.
- `user` — a `userEvent` instance already set up. Prefer it over `fireEvent`.

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

**Unhandled requests fail the test.** If you see `onUnhandledRequest` error output naming a URL you
didn't expect, the component is fetching something you haven't mocked — mock it rather than
loosening the setting.

## Fixtures

`buildUser`, `buildAcceleratorAdmin`, `buildFunderUser`, `buildOrganization`, `buildFacility`,
`buildSeedBank`, `buildSpecies`, `buildSpeciesList`, `buildWithdrawalRow`. Each takes an overrides
object and fills in plausible defaults, so a test names only what it cares about:

```ts
buildOrganization({ role: 'Contributor', facilities: [] });
```

Add a builder here the first time a second test needs the same shape.

## Exemplars

Four tests, written to be copied:

1. `src/components/common/Timestamp.test.tsx` — context-driven rendering.
2. `src/components/emptyStatePages/PlantsDashboardEmptyMessage.test.tsx` — permissions and
   interaction.
3. `src/scenes/InventoryRouter/view/InventorySummaryForNursery.test.tsx` — reading with RTK Query
   and MSW, including the error path.
4. `src/scenes/NurseryRouter/UndoWithdrawalModal.test.tsx` — writing: firing a mutation, asserting
   on the request that was sent, and holding the modal open when the write fails.

## What the harness sets up globally

Wired through `setupFiles` in `rstest.config.ts`, so tests never do this themselves:

- **Strings** (`setupStrings.ts`) — `src/strings` exports an _empty_ `LocalizedStrings` instance
  that the app fills in at runtime. Without this, every `strings.SOMETHING` is `undefined` and
  components render blank text. Assert against `strings.SOME_KEY` rather than a literal so
  assertions don't drift from the CSV.
- **MSW** (`msw/setup.ts`) — starts the server, resets handlers between tests, and shims the global
  `Request` so root-relative paths resolve against the jsdom origin. `src/queries/baseQuery.ts` uses
  `baseUrl: ''`, which the browser resolves against the document but Node's `Request` rejects; the
  symptom without the shim is a query that silently never returns data.
- **Stylesheets** — `@terraware/web-components` imports SCSS, loaded as inert source since jsdom
  applies no styles.

## Known gaps

- No fixtures yet for batches, planting sites, observations, or deliverables — add them as tests
  need them.
- Map-heavy and 3D components are not covered here. Mapbox and PlayCanvas need a real GL context;
  those stay with the Playwright suites.
