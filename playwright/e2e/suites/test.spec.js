import { test, expect } from '@playwright/test';

const waitFor = async (page, selector, timeout = 3000) => {
  // Seems weird to await in here with nothing else going on, but I am doing that explicitly so I can
  // ditch the return and keep the signature Promise<void>
  await page.waitForSelector(selector, { timeout });
};

//ADE not sure what this is for?
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test.setTimeout(1200000);
test.beforeEach(async ({ context }, testInfo) => {
  // Make all requests look like they are associated with an existing login session
  // so we don't have to depend on a Keycloak server to run the test suite. The
  // session value here is the base64-encoded session ID from dump/session.sql.
  await context.addCookies([
    { name: 'SESSION', value: 'YTVhOGIzODQtNDRiMi00NjIzLWIwNzgtZjk5NzI1NDFjOWU4', url: 'https://staging.terraware.io' },
  ]);
});

test('Add A Species', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1600, height: 1200 });

  await page.goto('https://staging.terraware.io');
  await waitFor(page, '#home');

  const newSpeciesName = `Acacia koa-${new Date().getTime()}`;

  await page.getByRole('button', { name: 'Species' }).click();

  while (!(await page.locator('.dialog-box--opened').isVisible())) {
    await sleep(1000);
    await page.getByRole('button', { name: 'Add Species' }).click();
  }

  await page.locator('#scientificName').getByRole('textbox').click();
  await page.locator('#scientificName').getByRole('textbox').fill(newSpeciesName);

  while (await page.locator('.options-container').isVisible()) {
    await sleep(1000);
    await page.locator('.dialog-box--header p.title').click();
  }

  await page.locator('#commonName').getByRole('textbox').click();
  await page.locator('#commonName').getByRole('textbox').fill('Koa');

  await page.locator('#growthForm').getByPlaceholder('Select...').click();

  await page
    .locator('li')
    .filter({ hasText: /^Tree$/ })
    .click();

  await page.locator('#seedStorageBehavior').getByPlaceholder('Select...').click();

  await page
    .locator('li')
    .filter({ hasText: /^Orthodox$/ })
    .click();

  await page
    .locator('div')
    .filter({ hasText: /^Select\.\.\.$/ })
    .nth(1)
    .click();

  await page.getByText('Tropical and subtropical dry').click();

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText(newSpeciesName)).toBeVisible();
  await expect(page.locator(`tr:has(> td[title="${newSpeciesName}"]) td[title="Koa"]`)).toBeVisible();

  await page.getByRole('row', { name: newSpeciesName }).getByRole('checkbox').check();

  // Toolbar delete
  await page.locator('.MuiToolbar-gutters .button.destructive-secondary').click();
  // Dialog delete
  await page.locator('.dialog-box--actions-container .button.destructive-primary').click();

  await expect(page.getByText(newSpeciesName)).toBeHidden();
});
