import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import { NurseryBatchService } from 'src/services';
import ExportCsvModal from 'src/components/common/ExportCsvModal';

interface DownloadReportModalProps {
  organizationId: number;
  speciesId: number;
  searchFields: SearchNodePayload[];
  searchSortOrder?: SearchSortOrder;
  onClose: () => void;
}

export default function DownloadReportModal(props: DownloadReportModalProps): JSX.Element {
  const { organizationId, speciesId, searchFields, searchSortOrder, onClose } = props;

  const onExport = async () => {
    return await NurseryBatchService.exportBatchesForSpeciesById(
      organizationId,
      speciesId,
      searchFields,
      searchSortOrder
    );
  };

  return <ExportCsvModal open={true} onExport={onExport} onClose={onClose} />;
}
