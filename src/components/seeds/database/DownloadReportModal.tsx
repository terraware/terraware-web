import { SearchCriteria, SearchSortOrder } from 'src/types/Search';
import { SearchService } from 'src/services';
import { useOrganization } from 'src/providers/hooks';
import ExportCsvModal from 'src/components/common/ExportCsvModal';

interface DownloadReportModalProps {
  searchCriteria: SearchCriteria;
  searchSortOrder: SearchSortOrder;
  searchColumns: string[];
  open: boolean;
  onClose: () => void;
}

export default function DownloadReportModal(props: DownloadReportModalProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { searchCriteria, searchSortOrder, searchColumns, open, onClose } = props;

  const onExport = async () => {
    return await SearchService.searchCsv({
      prefix: 'facilities.accessions',
      fields: [...searchColumns],
      sortOrder: [searchSortOrder],
      search: SearchService.convertToSearchNodePayload(searchCriteria, selectedOrganization.id),
      count: 1000,
    });
  };

  return <ExportCsvModal open={open} onExport={onExport} onClose={onClose} />;
}
