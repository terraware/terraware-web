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
  const parent = section.getByRole('button', { name: parentName, exact: true });
  await parent.waitFor({ state: 'visible' });
  // Some children render only after their data loads, so a missing child doesn't mean the section is closed.
  if (!(await section.locator('.subnavbar').isVisible())) {
    await parent.click();
  }
  await section.getByRole('button', { name: childName, exact: true }).click();
};
