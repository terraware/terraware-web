import type { BrowserContext } from 'playwright-core';
import { TERRAWARE_WEB_URL } from '../constants';

// Make all requests look like they are associated with an existing session
// so we don't have to depend on a Keycloak server to run the test suite. The
// session value in each is the base64-encoded session ID from dump/session.sql.

export const changeToSuperAdmin = async (context: BrowserContext) => {
  await context.clearCookies({ name: 'SESSION' });
  await context.addCookies([
    { name: 'SESSION', value: 'Mjc2NzE0YWQtYWIwYS00OGFhLThlZjgtZGI2NWVjMmU5NTBh', url: TERRAWARE_WEB_URL },
  ]);
};

export const changeToFunderUser = async (context: BrowserContext) => {
  await context.clearCookies({ name: 'SESSION' });
  await context.addCookies([
    { name: 'SESSION', value: 'YjliMDBkZGEtYzc4OS00MGNkLThjMDItN2VmMjEwMjVjNGQ4', url: TERRAWARE_WEB_URL },
  ]);
};

export const changeToContributor = async (context: BrowserContext) => {
  await context.clearCookies({ name: 'SESSION' });
  await context.addCookies([
    { name: 'SESSION', value: 'YmQ0Y2Y1MTktOGI0Ny00ODI2LTlmNjYtYjlmZGI5YzAyNWI4', url: TERRAWARE_WEB_URL },
  ]);
};

export const changeToReadOnlyUser = async (context: BrowserContext) => {
  await context.clearCookies({ name: 'SESSION' });
  await context.addCookies([
    { name: 'SESSION', value: 'NGRiYWRkMWUtNzcxZC00Y2E2LWJiYWItNjMxOGFiYmNhOWMw', url: TERRAWARE_WEB_URL },
  ]);
};
