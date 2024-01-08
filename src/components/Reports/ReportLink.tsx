import { APP_PATHS } from '../../constants';
import Link from '../common/Link';
import React from 'react';
import { ListReport } from '../../types/Report';

interface ReportLinkProps {
  report: ListReport & { organizationName?: string };
}

const ReportLink = ({ report }: ReportLinkProps) => {
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

  return <Link to={reportLocation.pathname}>{reportName}</Link>;
};

export default ReportLink;
