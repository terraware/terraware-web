import ExportCsvModal from 'src/components/common/ExportCsvModal';
import NurseryInventoryService, { SearchInventoryParams } from 'src/services/NurseryInventoryService';

interface DownloadReportModalProps {
  reportData?: SearchInventoryParams;
  open: boolean;
  onClose: () => void;
}

export default function DownloadReportModal(props: DownloadReportModalProps): JSX.Element {
  const { reportData, open, onClose } = props;

  const onExport = async () => {
    if (reportData) {
      return await NurseryInventoryService.downloadInventory(reportData);
    }
  };

  return <ExportCsvModal open={open} onExport={onExport} onClose={onClose} />;
}
