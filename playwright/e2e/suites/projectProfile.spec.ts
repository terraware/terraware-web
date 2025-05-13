import { expect, test } from '@playwright/test';

import { addCookies, waitFor } from '../utils/utils';

test.setTimeout(20000);
test.beforeEach(async ({ context }, testInfo) => {
  await addCookies(context);
});

export default function ProjectProfileTests() {
  test('View Project Profile for project in application', async ({ page }, testInfo) => {
    await page.goto('http://127.0.0.1:3000');
    await waitFor(page, '#home');
    await page.getByRole('link', { name: 'Accelerator Console' }).click();
    await page.getByRole('button', { name: 'Applications' }).click();
    await page.getByText('Pre-screen').click();
    await page.getByPlaceholder('Search').click();
    await page.getByPlaceholder('Search').fill('Application');
    await page.locator('#row1-internalName').click();
    await page.getByText('See Project Details').click();

    await expect(page.getByText('COL_Terraformation (staging)')).toBeVisible()
    await expect(page.getByText('Passed Pre-screen')).toBeVisible()
    await expect(page.getByText('Application Project')).toBeVisible()
    await expect(page.getByText('Viewing: Application Site Boundary')).toBeVisible()
    await expect(page.getByText('Native Forest (10,000 ha)')).toBeVisible()
    await expect(page.getByText('None selected')).toBeVisible()
  });

  test.skip('View Project Profile for project in Phase 0', async ({ page }, testInfo) => {
    await page.goto('http://127.0.0.1:3000');
  })

  test.skip('View Project Profile for project in Phase 1', async ({ page }, testInfo) => {
    await page.goto('http://127.0.0.1:3000');
  })

  test.skip('View Project Profile for project in Phase 2', async ({ page }, testInfo) => {
    await page.goto('http://127.0.0.1:3000');
  })

  test.skip('Edit Project Profile', async({ page }, testInfo) => {
    await page.goto('http://127.0.0.1:3000');
  });

}
