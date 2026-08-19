import React, { type JSX, useMemo } from 'react';

import { Typography } from '@mui/material';
import { Dropdown, DropdownItem } from '@terraware/web-components';

export type ReportOption = {
  reportId: number;
  title: string;
};

type ReportDropdownProps = {
  reports: ReportOption[];
  selectedReportId?: number;
  onChange: (reportId: number) => void;
};

export const REPORT_TITLE_STYLE = {
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '32px',
};

const selectStyles = {
  arrow: {
    height: '32px',
  },
  input: REPORT_TITLE_STYLE,
  inputContainer: {
    border: 0,
    backgroundColor: 'initial',
    paddingLeft: 0,
  },
};

/**
 * Doubles as the report tab's title and its report selector. Reports are rendered in the order
 * given, so callers should pass them straight through from the list endpoints.
 */
const ReportDropdown = ({ reports, selectedReportId, onChange }: ReportDropdownProps): JSX.Element => {
  const options: DropdownItem[] = useMemo(
    () => reports.map((report) => ({ label: report.title, value: report.reportId })),
    [reports]
  );

  const selectedTitle = useMemo(
    () => reports.find((report) => report.reportId === selectedReportId)?.title,
    [reports, selectedReportId]
  );

  if (options.length <= 1) {
    return <Typography sx={selectStyles.input}>{selectedTitle ?? reports[0]?.title}</Typography>;
  }

  return (
    <Dropdown
      onChange={(value: string) => onChange(Number(value))}
      options={options}
      selectStyles={selectStyles}
      selectedValue={selectedReportId}
    />
  );
};

export default ReportDropdown;
