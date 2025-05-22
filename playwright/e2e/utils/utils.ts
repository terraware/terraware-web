import { type BrowserContext, Page } from 'playwright-core';

export const waitFor = async (page: Page, selector: string, timeout = 3000) => {
  // Seems weird to await in here with nothing else going on, but I am doing that explicitly so I can
  // ditch the return and keep the signature Promise<void>
  await page.waitForSelector(selector, { timeout });
};

export const addCookies = async (context: BrowserContext) => {
  // Make all requests look like they are associated with an existing login session
  // so we don't have to depend on a Keycloak server to run the test suite. The
  // session value here is the base64-encoded session ID from dump/session.sql.
  await context.clearCookies({ name: 'SESSION' });
  await context.addCookies([
    { name: 'SESSION', value: 'Mjc2NzE0YWQtYWIwYS00OGFhLThlZjgtZGI2NWVjMmU5NTBh', url: 'http://127.0.0.1:3000' },
  ]);
};

export const addFunderCookies = async (context: BrowserContext) => {
  // Make all requests look like they are associated with an existing funder login session
  // so we don't have to depend on a Keycloak server to run the test suite. The
  // session value here is the base64-encoded session ID from dump/session.sql.
  await context.clearCookies({ name: 'SESSION' });
  await context.addCookies([
    { name: 'SESSION', value: 'YjliMDBkZGEtYzc4OS00MGNkLThjMDItN2VmMjEwMjVjNGQ4', url: 'http://127.0.0.1:3000' },
  ]);
};

// Just a typing saver for `getByText`
export const exactOptions = { exact: true };
