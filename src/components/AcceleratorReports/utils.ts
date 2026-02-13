import { PublishedReportPayload } from 'src/queries/generated/publishedReports';
import { AcceleratorReportPayload } from 'src/queries/generated/reports';

export const getReportName = (report: AcceleratorReportPayload | PublishedReportPayload) => {
  const year = report.startDate?.split('-')[0];
  return report.frequency === 'Annual' ? year : report.quarter ? `${year}-${report.quarter}` : '';
};
