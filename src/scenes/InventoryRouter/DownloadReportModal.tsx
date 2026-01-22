import React, { type JSX } from 'react';

import ExportCsvModal from 'src/components/common/ExportCsvModal';
import { NurseryBatchService } from 'src/services';
import { SEARCH_FIELDS_NON_EMPTY_BATCHES } from 'src/services/NurseryBatchService';
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
      return await NurseryInventoryService.searchInventoryByNursery({ ...reportData, isCsvExport: true });
    }

    if (tab === 'batches_by_batch') {
      return await NurseryBatchService.getAllBatches(
        reportData.organizationId,
        reportData.searchSortOrder,
        reportData.facilityIds,
        reportData.subLocationIds,
        reportData.query,
        true,
        !reportData.showEmptyBatches ? SEARCH_FIELDS_NON_EMPTY_BATCHES : undefined
      );
    }

    return await NurseryInventoryService.downloadInventory(reportData);
  };

  return <ExportCsvModal open={open} onExport={onExport} onClose={onClose} />;
}
