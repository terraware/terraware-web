import { AcceleratorReportPayload } from 'src/queries/generated/reports';
import { PublishedReport } from 'src/types/AcceleratorReport';

export const getReportName = (report: AcceleratorReportPayload | PublishedReport) => {
  const year = report.startDate?.split('-')[0];
  return report.frequency === 'Annual' ? year : report.quarter ? `${year}-${report.quarter}` : '';
};
