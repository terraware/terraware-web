import React from 'react';

import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import { ListReport } from 'src/types/Report';

interface ReportLinkProps {
  report: ListReport & { organizationName?: string };
  fontSize?: string | number;
}

const ReportLink = ({ report, fontSize }: ReportLinkProps) => {
  const reportLocation = {
    pathname: APP_PATHS.REPORTS_VIEW.replace(':reportId', report.id.toString()),
  };

  let reportName = `${report.year}-Q${report.quarter}`;
  if (report.projectName) {
    reportName += ` ${report.projectName}`;
  }

  if (report.organizationName) {
    reportName += ` ${report.organizationName} [Org]`;
  }

  return <Link fontSize={fontSize ?? '14px'} to={reportLocation.pathname}>{reportName}</Link>;
};

export default ReportLink;
