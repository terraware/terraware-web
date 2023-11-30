import { test } from '@playwright/test';

const waitFor = async (page, selector, timeout = 3000) => {
  // Seems weird to await in here with nothing else going on, but I am doing that explicitly so I can
  // ditch the return and keep the signature Promise<void>
  await page.waitForSelector(selector, { timeout });
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test('Login', async ({ page }) => {
  await page.goto('https://staging.terraware.io');
  await waitFor(page, '#username');
  await waitFor(page, '#password');
  await waitFor(page, '#kc-login');

  await page.screenshot({ path: `test-0.png` });

  await page.focus('#username');
  await page.keyboard.type('nick@terraformation.com', { delay: 100 });

  await page.focus('#password');
  await page.keyboard.type('admin', { delay: 100 });

  await page.screenshot({ path: `test-1.png` });

  await page.keyboard.press('Enter');

  await sleep(4000);
  await page.screenshot({ path: `test-2.png` });
});
