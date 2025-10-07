import { AcceleratorReport, PublishedReport } from 'src/types/AcceleratorReport';

export type ReportBoxProps = {
  report?: AcceleratorReport | PublishedReport;
  projectId: string;
  reload?: () => void;
  isConsoleView?: boolean;
  editing?: boolean;
  onChange?: (value: any) => void;
  onEditChange?: (value: boolean) => void;
  canEdit?: boolean;
  funderReportView?: boolean;
  validate?: boolean;
};
