import { Page, expect, test } from '@playwright/test';
import { selectDropdownOption } from 'playwright/e2e/utils/activityUtils';
import { navigateToFunderProjectTab } from 'playwright/e2e/utils/navigation';
import { publishProjectProfileViaApi } from 'playwright/e2e/utils/projectProfile';
import {
  ReportContent,
  ReportQuarter,
  approveReportWithContent,
  ensureYearlyReportConfig,
  getQuarterlyReport,
  publishReport,
} from 'playwright/e2e/utils/reportUtils';
import { changeToFunderUser, changeToSuperAdmin } from 'playwright/e2e/utils/userUtils';
import { exactOptions } from 'playwright/e2e/utils/utils';

// The only project wired to the funder user's funding entity in the dump.
const PHASE_1_PROJECT_ID = 3;

// A year no other suite configures reports for, so these tests own all of its reports.
const REPORT_YEAR = 2024;

const reportContent = (label: string): ReportContent => ({
  achievements: [`${label} achievement`],
  additionalComments: `${label} additional comments`,
  challenges: [{ challenge: `${label} challenge`, mitigationPlan: `${label} mitigation plan` }],
  financialSummaries: `${label} financial summary`,
  highlights: `${label} highlights`,
});

const approveQuarter = async (page: Page, quarter: ReportQuarter, content: ReportContent) => {
  const report = await getQuarterlyReport(page.request, PHASE_1_PROJECT_ID, REPORT_YEAR, quarter);
  await approveReportWithContent(page.request, PHASE_1_PROJECT_ID, report, content);
  return report.id;
};

const publishQuarter = async (page: Page, quarter: ReportQuarter, content: ReportContent) => {
  const reportId = await approveQuarter(page, quarter, content);
  await publishReport(page.request, PHASE_1_PROJECT_ID, reportId);
  return reportId;
};

const expectReportContent = async (page: Page, content: ReportContent) => {
  for (const text of [
    content.highlights,
    ...content.achievements,
    ...content.challenges.flatMap(({ challenge, mitigationPlan }) => [challenge, mitigationPlan]),
    content.financialSummaries,
    content.additionalComments,
  ]) {
    await expect(page.getByText(text, exactOptions)).toBeVisible();
  }
};

const reportTitle = (quarter: ReportQuarter) => `${REPORT_YEAR}-${quarter}`;

// With more than one published report, the report title is a dropdown rather than plain text.
const reportSelect = (page: Page) => page.locator('.select').first();

const viewReport = async (page: Page, quarter: ReportQuarter) => {
  await selectDropdownOption(reportSelect(page), reportTitle(quarter));
  await expect(reportSelect(page).locator('input')).toHaveValue(reportTitle(quarter));
};

test.describe('FunderReportTests', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page, context, baseURL }) => {
    await changeToSuperAdmin(context, baseURL);
    await publishProjectProfileViaApi(page.request, PHASE_1_PROJECT_ID);
    await ensureYearlyReportConfig(page.request, PHASE_1_PROJECT_ID, REPORT_YEAR);
  });

  test('shows the content of a published report without editing controls', async ({ page, context, baseURL }) => {
    const content = reportContent('Funder Q1');
    await publishQuarter(page, 'Q1', content);
    await publishQuarter(page, 'Q2', reportContent('Funder Q2'));

    await changeToFunderUser(context, baseURL);
    await navigateToFunderProjectTab(page, 'Report');
    await viewReport(page, 'Q1');

    for (const heading of [
      'Highlights',
      'Achievements',
      'Challenges and Mitigation Plan',
      'Financial Summaries',
      'Additional Comments',
    ]) {
      await expect(page.getByText(heading, exactOptions).first()).toBeVisible();
    }
    await expectReportContent(page, content);

    await expect(page.getByRole('button', { name: 'Edit' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Submit' })).toHaveCount(0);
  });

  test('shows the published version of a report rather than later edits', async ({ page, context, baseURL }) => {
    const published = reportContent('Published Q1');
    await publishQuarter(page, 'Q1', published);
    await publishQuarter(page, 'Q2', reportContent('Published Q2'));
    const edited = reportContent('Unpublished edit Q1');
    await approveQuarter(page, 'Q1', edited);

    await changeToFunderUser(context, baseURL);
    await navigateToFunderProjectTab(page, 'Report');
    await viewReport(page, 'Q1');

    await expectReportContent(page, published);
    await expect(page.getByText(edited.highlights, exactOptions)).toHaveCount(0);
  });

  test('lists only published reports and switches between them', async ({ page, context, baseURL }) => {
    const q1 = reportContent('Switch Q1');
    const q2 = reportContent('Switch Q2');
    await publishQuarter(page, 'Q1', q1);
    await publishQuarter(page, 'Q2', q2);
    await approveQuarter(page, 'Q3', reportContent('Approved but unpublished Q3'));

    await changeToFunderUser(context, baseURL);
    await navigateToFunderProjectTab(page, 'Report');

    await reportSelect(page).locator('input').click();
    const options = reportSelect(page).locator('.options-container');
    await expect(options.getByText(reportTitle('Q1'), exactOptions)).toBeVisible();
    await expect(options.getByText(reportTitle('Q2'), exactOptions)).toBeVisible();
    await expect(options.getByText(reportTitle('Q3'), exactOptions)).toHaveCount(0);
    await reportSelect(page).locator('input').click();

    await viewReport(page, 'Q1');
    await expectReportContent(page, q1);

    await viewReport(page, 'Q2');
    await expectReportContent(page, q2);
    await expect(page.getByText(q1.highlights, exactOptions)).toHaveCount(0);
  });
});
