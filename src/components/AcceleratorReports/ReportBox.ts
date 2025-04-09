import { AcceleratorReport } from 'src/types/AcceleratorReport';

export type ReportBoxProps = {
  report?: AcceleratorReport;
  projectId: string;
  reportId: string;
  reload?: () => void;
  isConsoleView?: boolean;
  editing?: boolean;
  onChange?: (value: any) => void;
  onEditChange?: (value: boolean) => void;
  canEdit?: boolean;
};
