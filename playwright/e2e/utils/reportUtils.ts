import { APIRequestContext, expect } from '@playwright/test';

export type ReportQuarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export type ReportContent = {
  achievements: string[];
  additionalComments: string;
  challenges: { challenge: string; mitigationPlan: string }[];
  financialSummaries: string;
  highlights: string;
};

type ReportConfig = { reportingStartDate: string; reportingEndDate: string };
type Report = { id: number; quarter?: ReportQuarter; status: string };

const expectOk = async (response: Awaited<ReturnType<APIRequestContext['get']>>, description: string) => {
  expect(response.ok(), `${description} failed with ${response.status()}: ${await response.text()}`).toBeTruthy();
};

const reportsUrl = (projectId: number) => `/api/v1/accelerator/projects/${projectId}/reports`;

/**
 * Creates quarterly reports for a calendar year unless a config for that year already exists, so
 * reruns against the same database reuse the reports instead of adding duplicates.
 */
export const ensureYearlyReportConfig = async (request: APIRequestContext, projectId: number, year: number) => {
  const reportingStartDate = `${year}-01-01`;
  const reportingEndDate = `${year}-12-31`;

  const configsResponse = await request.get(`${reportsUrl(projectId)}/configs`);
  await expectOk(configsResponse, 'Listing report configs');
  const { configs } = (await configsResponse.json()) as { configs: ReportConfig[] };

  if (!configs.some((config) => config.reportingStartDate === reportingStartDate)) {
    const createResponse = await request.put(`${reportsUrl(projectId)}/configs`, {
      data: { config: { reportingStartDate, reportingEndDate } },
    });
    await expectOk(createResponse, 'Creating report config');
  }
};

export const getQuarterlyReport = async (
  request: APIRequestContext,
  projectId: number,
  year: number,
  quarter: ReportQuarter
): Promise<Report> => {
  const listResponse = await request.get(`${reportsUrl(projectId)}?year=${year}`);
  await expectOk(listResponse, 'Listing reports');
  const { reports } = (await listResponse.json()) as { reports: Report[] };

  const report = reports.find((candidate) => candidate.quarter === quarter);
  expect(report, `No ${year}-${quarter} report for project ${projectId}`).toBeDefined();
  return report as Report;
};

/**
 * Overwrites the report's content as a reviewer and approves it, submitting it first if needed. Works
 * on reports that are already approved, so tests can reset content left behind by earlier runs.
 */
export const approveReportWithContent = async (
  request: APIRequestContext,
  projectId: number,
  report: Report,
  content: ReportContent
) => {
  if (report.status === 'Not Submitted' || report.status === 'Needs Update') {
    const submitResponse = await request.post(`${reportsUrl(projectId)}/${report.id}/submit`);
    await expectOk(submitResponse, `Submitting report ${report.id}`);
  }

  const reviewResponse = await request.post(`${reportsUrl(projectId)}/${report.id}/review`, {
    data: { review: { ...content, status: 'Approved' } },
  });
  await expectOk(reviewResponse, `Approving report ${report.id}`);
};

export const publishReport = async (request: APIRequestContext, projectId: number, reportId: number) => {
  const publishResponse = await request.post(`${reportsUrl(projectId)}/${reportId}/publish`);
  await expectOk(publishResponse, `Publishing report ${reportId}`);
};
