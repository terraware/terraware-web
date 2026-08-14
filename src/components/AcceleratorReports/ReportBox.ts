import { AcceleratorReportPayload } from 'src/queries/generated/acceleratorReports';
import { PublishedReportPayload } from 'src/queries/generated/publishedReports';

export type ReportBoxProps = {
  report?: AcceleratorReportPayload | PublishedReportPayload;
  projectId: number;
  isConsoleView?: boolean;
  editing?: boolean;
  onChange?: (value: any) => void;
  onEditChange?: (value: boolean) => void;
  canEdit?: boolean;
  funderReportView?: boolean;
  validate?: boolean;
};
