import React, { type JSX } from 'react';

import ExportCsvModal from 'src/components/common/ExportCsvModal';
import { useOrganization } from 'src/providers/hooks';
import { SearchService } from 'src/services';
import { SearchCriteria, SearchSortOrder } from 'src/types/Search';

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
    if (!selectedOrganization) {
      return null;
    }

    return await SearchService.searchCsv({
      prefix: 'accessions',
      fields: [...searchColumns],
      sortOrder: [searchSortOrder],
      search: SearchService.convertToSearchNodePayload(searchCriteria, selectedOrganization.id),
      count: 1000,
    });
  };

  return <ExportCsvModal open={open} onExport={onExport} onClose={onClose} />;
}
