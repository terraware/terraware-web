import { Page } from 'playwright-core';

export const waitFor = async (page: Page, selector: string, timeout = 3000) => {
  // Seems weird to await in here with nothing else going on, but I am doing that explicitly so I can
  // ditch the return and keep the signature Promise<void>
  await page.locator(selector).waitFor({ state: 'visible', timeout });
};

// Just a typing saver for various usages
export const exactOptions = { exact: true };

export const selectOrg = async (page: Page, orgName: string) => {
  if (!(await page.locator('#organizationsDropdown').getByText(orgName, exactOptions).isVisible())) {
    await page.locator('#organizationsDropdown').click();
    await page.getByRole('menuitem', { name: orgName }).click();
    await waitFor(page, '#home');
  }
};

export const openNavItem = async (page: Page, parentName: string, childName: string) => {
  const section = page
    .locator('.nav-item--has-children')
    .filter({ has: page.getByRole('button', { name: parentName, exact: true }) });
  await section.getByRole('button', { name: parentName, exact: true }).waitFor({ state: 'visible' });
  const child = section.getByRole('button', { name: childName, exact: true });
  if (!(await child.isVisible().catch(() => false))) {
    await section.getByRole('button', { name: parentName, exact: true }).click();
    await child.waitFor({ state: 'visible' });
  }
  await child.click();
};
