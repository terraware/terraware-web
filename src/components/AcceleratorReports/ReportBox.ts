import { AcceleratorReport } from 'src/types/AcceleratorReport';

export type ReportBoxProps = {
  report?: AcceleratorReport;
  projectId: string;
  reportId: string;
  reload: () => void;
};
