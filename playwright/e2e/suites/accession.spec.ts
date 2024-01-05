import { test, expect } from '@playwright/test';

const waitFor = async (page, selector, timeout = 3000) => {
  // Seems weird to await in here with nothing else going on, but I am doing that explicitly so I can
  // ditch the return and keep the signature Promise<void>
  await page.waitForSelector(selector, { timeout });
};

//ADE not sure what this is for?
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test.setTimeout(60000);
test.beforeEach(async ({ context }, testInfo) => {
  // Make all requests look like they are associated with an existing login session
  // so we don't have to depend on a Keycloak server to run the test suite. The
  // session value here is the base64-encoded session ID from dump/session.sql.
  await context.addCookies([
    { name: 'SESSION', value: 'Mjc2NzE0YWQtYWIwYS00OGFhLThlZjgtZGI2NWVjMmU5NTBh', url: 'http://127.0.0.1:3000' },
  ]);

  // Pick the new/fake "now" for the test.
  const testDate = new Date("January 1 2024 12:00:00Z-08:00").valueOf();

  // Update the Date accordingly in your test pages
  await context.addInitScript(`{
    // Extend Date constructor to default to testDate
    Date = class extends Date {
      constructor(...args) {
        if (args.length === 0) {
          super(${testDate});
        } else {
          super(...args);
        }
      }
    }
    // Override Date.now() to start from testDate
    const __DateNowOffset = ${testDate} - Date.now();
    const __DateNow = Date.now;
    Date.now = () => __DateNow() + __DateNowOffset;
  }`);

});

test('Add An Accession', async ({ page }, testInfo) => {
  await page.goto('http://127.0.0.1:3000');

  await waitFor(page, '#home');

  await page.getByRole('button', { name: 'Seeds' }).click();
  await page.getByRole('button', { name: 'Accessions' }).click();
  await page.getByRole('button', { name: 'Add Accession' }).click();
  await page.getByPlaceholder('Search or Select...').click();
  await page.locator('li').filter({ hasText: 'Coconut' }).locator('div').click();
  await page.getByLabel('Collection Date *').click();
  await page.getByLabel('Choose date', { exact: true }).click();
  await page.getByRole('gridcell', { name: '1', exact: true }).click();
  await page.getByPlaceholder('Collectors').click();
  await page.getByLabel('Close').click();
  await page.getByPlaceholder('Collectors').click();
  await page.getByPlaceholder('Collectors').fill('Alex');
  await page.locator('#collectionSiteName').getByRole('textbox').click();
  await page.locator('#collectionSiteName').getByRole('textbox').fill("Alex's Mansion");
  await page.locator('#collectionSiteLandowner').getByRole('textbox').click();
  await page.locator('#collectionSiteLandowner').getByRole('textbox').fill('Ashtyn');
  await page.getByRole('button', { name: 'Add GPS Coordinates' }).click();
  await page.locator('#gpsCoords0').getByRole('textbox').click();
  await page.locator('#gpsCoords0').getByRole('textbox').fill('2, 4');
  await page.locator('#addGpsCoordsButton').click();
  await page.locator('#gpsCoords1').getByRole('textbox').click();
  await page.locator('#gpsCoords1').getByRole('textbox').fill('8, 8dfdsf');
  await page.locator('#location').getByRole('img').click();
  await page.getByText('garage').click();
  await page.locator('#sub-location path').click();
  await page.locator('#sub-location path').click();
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByRole('main')).toContainText('24-1-1-001');
  await expect(page.getByRole('main')).toContainText('Coconut');
  await expect(page.getByRole('main')).toContainText('Awaiting Check-In');
  await expect(page.getByRole('main')).toContainText('garage');
  await expect(page.getByRole('main')).toContainText('<1 Month');
  await expect(page.getByLabel('Accession Details')).toContainText('Alex');
  await expect(page.getByLabel('Accession Details').getByRole('paragraph')).toContainText('(Owner: Ashtyn)');
  await expect(page.getByLabel('Accession Details')).toContainText('Collected from plants');
  await page.getByRole('button', { name: 'Check In' }).click();
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('main')).toContainText('Awaiting Processing');
  await page.getByRole('main').getByRole('button').nth(1).click();
  await page.locator('.textfield-value > .tw-icon').click();
  await page.getByText('Processing', { exact: true }).click();
  await page.getByRole('button', { name: 'Save' }).click();
  await page.waitForTimeout(1000); //Wait for modal to close
  await expect(page.getByRole('main')).toContainText('Processing');
  await page.getByRole('main').getByRole('button').nth(1).click();
  await page.getByPlaceholder('Select...').click();
  await page.getByText('Drying').click();
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('main')).toContainText('Drying');
  await expect(page.getByRole('main')).toContainText('End-drying Reminder Off');
  await page.getByRole('main').getByRole('button').nth(3).click();
  await page.getByLabel('Turn on End-drying Reminder').check();
  await page.getByLabel('Choose date').click();
  await page.getByRole('gridcell', { name: '31' }).click();
  await page.getByRole('button', { name: 'Save' }).click();
  await page.waitForTimeout(1000); //Wait for modal to close
  await expect(page.getByRole('main')).toContainText('in 28 days (2024-01-31)');
  await page.locator('a').nth(2).click();
  await page.getByRole('spinbutton').click();
  await page.getByRole('spinbutton').fill('500');
  await page.getByRole('button', { name: 'Add Subset Weight And Count' }).click();
  await page.locator('#subsetWeight').getByRole('spinbutton').click();
  await page.locator('#subsetWeight').getByRole('spinbutton').fill('10');
  await page.locator('#subsetCount').getByRole('spinbutton').click();
  await page.locator('#subsetCount').getByRole('spinbutton').fill('10');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('main')).toContainText('500 Grams');
  await expect(page.getByRole('main')).toContainText('~500 ct');
  await page.getByRole('tab', { name: 'History' }).click();
  await expect(page.getByLabel('History')).toContainText('2024-01-02Test User created accession');
  await expect(page.getByLabel('History')).toContainText(
    '2024-01-02Test User updated the status to Awaiting Processing'
  );
  await expect(page.getByLabel('History')).toContainText('2024-01-02Test User updated the status to Processing');
  await expect(page.getByLabel('History')).toContainText('2024-01-02Test User updated the status to Drying');
  await expect(page.getByLabel('History')).toContainText('2024-01-02Test User updated the quantity to 500 grams');
  await page.getByRole('tab', { name: 'Viability Tests' }).click();
  await page.getByRole('button', { name: 'Add Test' }).click();
  await page.getByPlaceholder('Select...').nth(1).click();
  await page.getByText('Fresh').click();
  await page.getByPlaceholder('Select...').nth(2).click();
  await page.getByText('Nursery Media').click();
  await page.locator('input[type="text"]').click();
  await page.locator('input[type="text"]').fill('5');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('button', { name: '#' }).click();
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByRole('button', { name: 'Add Observation' }).click();
  await page.locator('#seedsGerminated').getByRole('textbox').click();
  await page.locator('#seedsGerminated').getByRole('textbox').fill('3');
  await page.getByLabel('Mark as Complete').check();
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('button', { name: 'Apply Result' }).click();
  await expect(page.locator('#row1-viabilityPercent')).toContainText('60%');
  await expect(page.getByRole('main')).toContainText('60%');
  await expect(page.getByRole('main')).toContainText('495 Grams');
  await expect(page.getByRole('main')).toContainText('~495 ct');

  await page.getByRole('button', { name: 'Accessions' }).click();
  await expect(page.locator('#row1-accessionNumber')).toContainText('24-1-2-001');
  await page.getByText('-1-2-001').click();
  await expect(page.getByRole('main')).toContainText('Coconut');
});

test('Withdraw to Nursery', async ({ page }, testInfo) => {
  await page.goto('http://127.0.0.1:3000');

  await waitFor(page, '#home');


});