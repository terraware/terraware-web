import { AcceleratorReportPayload } from 'src/queries/generated/acceleratorReports';
import { PublishedReportPayload } from 'src/queries/generated/publishedReports';

export type ReportBoxProps = {
  report?: AcceleratorReportPayload | PublishedReportPayload;
  projectId: number;
  isConsoleView?: boolean;
  editing?: boolean;
  onChange?: (value: any) => void;
  onEditChange?: (value: boolean) => void;
  /** rendered for print: no edit chrome, nothing clipped behind a "show more" */
  printMode?: boolean;
  canEdit?: boolean;
  funderReportView?: boolean;
  validate?: boolean;
};
