import { SearchResponseElement } from 'src/types/Search';
import ExportCsvModal from 'src/components/common/ExportCsvModal';

interface BatchesExportModalProps {
  batchesExport: () => Promise<SearchResponseElement[] | null>;
  onClose: () => void;
}

export default function BatchesExportModal(props: BatchesExportModalProps): JSX.Element {
  const { batchesExport, onClose } = props;

  return <ExportCsvModal open={true} onExport={batchesExport} onClose={onClose} />;
}
