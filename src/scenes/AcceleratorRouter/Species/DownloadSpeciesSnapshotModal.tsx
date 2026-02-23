import React, { type JSX } from 'react';

import ExportCsvModal from 'src/components/common/ExportCsvModal';
import AcceleratorProjectSpeciesService from 'src/services/AcceleratorProjectSpeciesService';

interface DownloadSpeciesSnapshotModalProps {
  deliverableId: number;
  open: boolean;
  onClose: () => void;
  projectId: number;
}

export default function DownloadSpeciesSnapshotModal(props: DownloadSpeciesSnapshotModalProps): JSX.Element {
  const { deliverableId, open, onClose, projectId } = props;

  const onExport = async () => {
    return await AcceleratorProjectSpeciesService.downloadSnapshot(deliverableId, projectId);
  };

  return <ExportCsvModal open={open} onExport={onExport} onClose={onClose} />;
}
