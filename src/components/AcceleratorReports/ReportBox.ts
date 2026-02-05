import { AcceleratorReportPayload } from 'src/queries/generated/reports';
import { PublishedReport } from 'src/types/AcceleratorReport';

export type ReportBoxProps = {
  report?: AcceleratorReportPayload | PublishedReport;
  projectId: number;
  isConsoleView?: boolean;
  editing?: boolean;
  onChange?: (value: any) => void;
  onEditChange?: (value: boolean) => void;
  canEdit?: boolean;
  funderReportView?: boolean;
  validate?: boolean;
};
