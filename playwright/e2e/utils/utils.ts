import { Page } from 'playwright-core';

export const waitFor = async (page: Page, selector: string, timeout = 3000) => {
  // Seems weird to await in here with nothing else going on, but I am doing that explicitly so I can
  // ditch the return and keep the signature Promise<void>
  await page.waitForSelector(selector, { timeout });
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
