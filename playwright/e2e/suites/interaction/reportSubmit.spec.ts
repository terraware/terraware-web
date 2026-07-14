import { expect, test } from '@playwright/test';

import { changeToSuperAdmin } from '../../utils/userUtils';
import { exactOptions, selectOrg, waitFor } from '../../utils/utils';

// Phase 1 Project (projectId=3) belongs to Terraformation (staging) org (id=1)
// and has a cohort/phase set, making it a valid accelerator project for reports.
const PROJECT_ID = 3;

test.describe('ReportSubmitTests', () => {
  test.describe.configure({ mode: 'serial' });

  let reportId: number;

  test.beforeEach(async ({ page, context, baseURL }) => {
    await changeToSuperAdmin(context, baseURL);
    await page.goto('/');
    await waitFor(page, '#home');
    await selectOrg(page, 'Terraformation (staging)');
  });

  test('Set up report config and verify a report is generated', async ({ page, baseURL }) => {
    // Create a report config for Phase 1 Project via the API.
    // The backend will generate quarterly reports based on the reporting window.
    // We use a past reporting window so a quarterly report already exists.
    const configResponse = await page.request.put(
      `${baseURL}/api/v1/accelerator/projects/${PROJECT_ID}/reports/configs`,
      {
        data: {
          config: {
            reportingStartDate: '2025-01-01',
            reportingEndDate: '2025-12-31',
          },
        },
      }
    );
    expect(configResponse.ok()).toBeTruthy();

    // List reports for the project and capture a report ID for use in subsequent tests.
    const listResponse = await page.request.get(
      `${baseURL}/api/v1/accelerator/projects/${PROJECT_ID}/reports?year=2025`
    );
    expect(listResponse.ok()).toBeTruthy();

    const listBody = await listResponse.json();
    const reports: { id: number; status: string; startDate: string }[] = listBody.reports ?? [];
    expect(reports.length).toBeGreaterThan(0);

    // Pick the first report (earliest quarter) with "Not Submitted" status.
    const notSubmittedReport = reports.find((r) => r.status === 'Not Submitted');
    expect(notSubmittedReport).toBeDefined();
    reportId = notSubmittedReport!.id;
  });

  test('Navigate to Reports and view a Not Submitted report', async ({ page }) => {
    // The Reports nav item is shown only when the org feature is enabled and
    // there are accelerator projects. Guard against the nav item not being visible.
    await expect(page.getByRole('button', { name: 'Reports', ...exactOptions })).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Reports', ...exactOptions }).click();

    // The reports table should load and contain the report.
    await expect(page.getByText('Not Submitted').first()).toBeVisible({ timeout: 10000 });

    // Click the first report link to open the report detail view.
    const reportLink = page.locator('a').filter({ hasText: /^2025/ }).first();
    await expect(reportLink).toBeVisible();
    await reportLink.click();

    // Confirm we are on the report view page.
    await expect(page.getByRole('button', { name: 'Submit for Approval' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Not Submitted')).toBeVisible();
  });

  test('Edit a report — fill in highlights — and save', async ({ page }) => {
    // Navigate directly to the edit page to avoid state dependency on previous test.
    await page.goto(`/reports/${PROJECT_ID}/${reportId}/edit`);
    await expect(page.getByText('Highlights')).toBeVisible({ timeout: 10000 });

    // Fill in the Highlights field.
    await page.locator('label[for="highlights"] + textarea').fill('Test highlights for e2e report submission.');

    // Save the report.
    await page.locator('#saveEditAcceleratorReport').click();

    // After saving, we are redirected back to the report view page.
    await expect(page.getByRole('button', { name: 'Submit for Approval' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Test highlights for e2e report submission.')).toBeVisible();
  });

  test('Submit report for approval and verify status changes to Submitted', async ({ page }) => {
    // Navigate directly to the report view page.
    await page.goto(`/reports/${PROJECT_ID}/${reportId}`);
    await expect(page.getByRole('button', { name: 'Submit for Approval' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Not Submitted')).toBeVisible();

    // Click "Submit for Approval".
    await page.getByRole('button', { name: 'Submit for Approval' }).click();

    // A confirmation dialog should appear.
    await expect(page.getByText('Are you sure you want to submit this report for approval?')).toBeVisible();

    // Confirm the submission.
    await page.locator('#confirmSubmit').click();

    // The status badge should now show "Submitted".
    await expect(page.getByText('Submitted', exactOptions)).toBeVisible({ timeout: 10000 });

    // Submit for Approval button should now be disabled (report is already submitted).
    await expect(page.getByRole('button', { name: 'Submit for Approval' })).toBeDisabled();
  });

  test('Approve report from Accelerator Console and verify Approved status', async ({ page }) => {
    // Navigate to the Accelerator Console report view for this project and report.
    await waitFor(page, '#acceleratorConsoleButton');
    await page.getByRole('link', { name: 'Accelerator Console' }).click();

    // Navigate to the project's reports page via the Projects list.
    await page.getByRole('link', { name: 'Phase 1 Project Deal' }).waitFor({ state: 'visible' });
    await page.getByRole('link', { name: 'Phase 1 Project Deal' }).click();

    // On the project profile page, click "View Reports".
    await expect(page.getByRole('button', { name: 'View Reports' })).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'View Reports' }).click();

    // The reports list should show the submitted report.
    await expect(page.getByText('Submitted', exactOptions)).toBeVisible({ timeout: 10000 });

    // Click the report link to open the console report view.
    const reportLink = page
      .locator('tr')
      .filter({ has: page.getByText('Submitted', { exact: true }) })
      .locator('a')
      .filter({ hasText: /^2025/ });
    await expect(reportLink).toBeVisible();
    await reportLink.click();
    await page.waitForURL(/\/reports\/\d+$/);
    await expect(page.getByText('Submitted', exactOptions)).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: 'Approve' })).toBeVisible();

    // Click Approve.
    await page.getByRole('button', { name: 'Approve' }).click();

    // The approval confirmation dialog should appear.
    await expect(page.getByText('You are about to approve this Report.')).toBeVisible();
    await page.locator('#confirmApprove').click();

    // After approval, the status badge should show "Approved".
    await expect(page.getByText('Approved', exactOptions)).toBeVisible({ timeout: 10000 });
  });

  test('Verify Approved report shows approval message on participant side', async ({ page }) => {
    // Navigate to the participant-side report view.
    await page.goto(`/reports/${PROJECT_ID}/${reportId}`);

    // The status should be Approved and the approval banner should be visible.
    await expect(page.getByText('Approved', exactOptions)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Report Approved')).toBeVisible();
    await expect(page.getByText('This report has been approved.')).toBeVisible();

    // The Submit for Approval button should be disabled.
    await expect(page.getByRole('button', { name: 'Submit for Approval' })).toBeDisabled();
  });
});
