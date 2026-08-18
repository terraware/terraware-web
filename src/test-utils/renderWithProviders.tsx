import React, { type JSX, type ReactElement, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router';

import { ThemeProvider } from '@mui/material';
import { LocalizationProvider as MuiLocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { type RenderOptions, type RenderResult, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type {
  ProvidedLocalizationData,
  ProvidedOrganizationData,
  ProvidedUserData,
  ProvidedUserFundingEntityData,
} from 'src/providers/DataTypes';
import {
  LocalizationContext,
  OrganizationContext,
  UserContext,
  UserFundingEntityContext,
} from 'src/providers/contexts';
import { type AppStore, type RootState, makeStore } from 'src/redux/store';
import defaultStrings from 'src/strings';
import theme from 'src/theme';
import { isAllowed as isAllowedACL } from 'src/utils/acl';

import { buildOrganization } from './fixtures/organization';
import { buildUser } from './fixtures/user';
import { setTestLocale } from './setupStrings';

export type RenderWithProvidersOptions = {
  /**
   * Overrides for the user context (`useUser()`). `isAllowed` is wired to the real ACL against
   * whichever user is in play, so permission changes are usually expressed by changing the user's
   * global roles or the organization's role rather than by overriding `isAllowed` itself.
   */
  currentUser?: Partial<ProvidedUserData>;
  /** Overrides for the organization context (`useOrganization()`). */
  organization?: Partial<ProvidedOrganizationData>;
  /** Overrides for the localization context (`useLocalization()`). */
  localization?: Partial<ProvidedLocalizationData>;
  /** Overrides for the funding entity context (`useUserFundingEntity()`). */
  fundingEntity?: Partial<ProvidedUserFundingEntityData>;
  /** Initial redux state, for components that read from a legacy feature slice. */
  preloadedState?: Partial<RootState>;
  /** Supply a store when a test needs to dispatch before rendering, or share one across renders. */
  store?: AppStore;
  /** Initial URL. Pair with `path` when the component reads route params. */
  route?: string;
  /** Route pattern, e.g. `/species/:speciesId`, so `useParams()` resolves against `route`. */
  path?: string;
  /** Passed through to React Testing Library. */
  renderOptions?: Omit<RenderOptions, 'wrapper'>;
};

export type RenderWithProvidersResult = RenderResult & {
  /** The store backing this render — assert on state, or dispatch to drive the component. */
  store: AppStore;
  /** A `userEvent` instance already set up for this render. Prefer it over `fireEvent`. */
  user: ReturnType<typeof userEvent.setup>;
};

const buildUserContext = (overrides: Partial<ProvidedUserData> = {}): ProvidedUserData => {
  const user = 'user' in overrides ? overrides.user : buildUser();

  return {
    bootstrapped: true,
    user,
    userPreferences: {},
    // Bound to the same rules the real UserProvider uses, so permission-gated UI is exercised
    // against `src/utils/acl` rather than a stub that can drift from it. Change the user's global
    // roles or the organization's role to move a test across a permission boundary; override this
    // directly only when a test needs a permission the ACL can't express through those.
    isAllowed: (permission, metadata) => (user ? isAllowedACL(user, permission, metadata) : false),
    reloadUser: () => undefined,
    updateUserCookieConsent: () => Promise.resolve(),
    updateUserPreferences: () => Promise.resolve(true),
    ...overrides,
  };
};

const buildOrganizationContext = (overrides: Partial<ProvidedOrganizationData> = {}): ProvidedOrganizationData => {
  const selectedOrganization = overrides.selectedOrganization ?? buildOrganization();

  return {
    bootstrapped: true,
    selectedOrganization,
    organizations: [selectedOrganization],
    orgPreferences: {},
    setSelectedOrganization: () => undefined,
    redirectAndNotify: () => undefined,
    reloadOrganizations: () => Promise.resolve(),
    ...overrides,
  };
};

const buildLocalizationContext = (overrides: Partial<ProvidedLocalizationData> = {}): ProvidedLocalizationData => ({
  bootstrapped: true,
  activeLocale: 'en',
  selectedLocale: 'en',
  setSelectedLocale: () => undefined,
  strings: defaultStrings,
  countries: [],
  supportedTimeZones: [],
  ...overrides,
});

const buildFundingEntityContext = (
  overrides: Partial<ProvidedUserFundingEntityData> = {}
): ProvidedUserFundingEntityData => ({
  bootstrapped: true,
  userFundingEntity: undefined,
  ...overrides,
});

/**
 * Render a component inside the same provider stack the app uses, with everything already
 * bootstrapped.
 *
 * The real providers in `src/providers` fetch on mount and hold their children behind a spinner
 * until they resolve. Tests almost never care how that data arrived, only what it contains, so
 * this supplies the context values directly. That keeps tests fast and deterministic, and means a
 * test only mocks the endpoints the component under test actually calls.
 *
 * ```tsx
 * const { user } = renderWithProviders(<SpeciesListView />, {
 *   organization: { selectedOrganization: buildOrganization({ role: 'Contributor' }) },
 * });
 * await user.click(screen.getByRole('button', { name: 'Add Species' }));
 * ```
 */
export const renderWithProviders = (
  ui: ReactElement,
  options: RenderWithProvidersOptions = {}
): RenderWithProvidersResult => {
  const {
    currentUser,
    organization,
    localization,
    fundingEntity,
    preloadedState,
    store = makeStore(preloadedState),
    route = '/',
    path,
    renderOptions,
  } = options;

  const userContext = buildUserContext(currentUser);
  const organizationContext = buildOrganizationContext(organization);
  const localizationContext = buildLocalizationContext(localization);
  const fundingEntityContext = buildFundingEntityContext(fundingEntity);

  // Keep the string tables in step with the locale the context claims. Without this the context
  // would report French while `strings.SOMETHING` still returned English, which is a state the
  // application never reaches. Reset after each test by `setupStrings.ts`.
  setTestLocale(localizationContext.activeLocale ?? localizationContext.selectedLocale);

  const Wrapper = ({ children }: { children?: ReactNode }): JSX.Element => (
    <Provider store={store}>
      <UserContext.Provider value={userContext}>
        <OrganizationContext.Provider value={organizationContext}>
          <UserFundingEntityContext.Provider value={fundingEntityContext}>
            <LocalizationContext.Provider value={localizationContext}>
              <ThemeProvider theme={theme}>
                <MuiLocalizationProvider dateAdapter={AdapterDayjs}>
                  <MemoryRouter initialEntries={[route]}>
                    {path ? <Routes>{<Route path={path} element={children} />}</Routes> : children}
                  </MemoryRouter>
                </MuiLocalizationProvider>
              </ThemeProvider>
            </LocalizationContext.Provider>
          </UserFundingEntityContext.Provider>
        </OrganizationContext.Provider>
      </UserContext.Provider>
    </Provider>
  );

  return {
    store,
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};
