import ExportCsvModal from 'src/components/common/ExportCsvModal';
import NurseryInventoryService, { SearchInventoryParams } from 'src/services/NurseryInventoryService';

interface DownloadReportModalProps {
  reportData: SearchInventoryParams;
  open: boolean;
  onClose: () => void;
  tab: string;
}

export default function DownloadReportModal(props: DownloadReportModalProps): JSX.Element {
  const { reportData, open, onClose, tab } = props;

  const onExport = async () => {
    if (tab === 'batches_by_nursery') {
      return await NurseryInventoryService.searchInventoryByNursery({ ...reportData, isDowloading: true });
    }
    return await NurseryInventoryService.downloadInventory(reportData);
  };

  return <ExportCsvModal open={open} onExport={onExport} onClose={onClose} />;
}
