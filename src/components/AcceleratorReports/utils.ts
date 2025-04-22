import { AcceleratorReport, PublishedReport } from 'src/types/AcceleratorReport';

export const getReportName = (report: AcceleratorReport | PublishedReport) => {
  const year = report.startDate?.split('-')[0];
  return report.frequency === 'Annual' ? year : report.quarter ? `${year}-${report.quarter}` : '';
};
