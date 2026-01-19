import React, { type JSX } from 'react';

import ExportCsvModal from 'src/components/common/ExportCsvModal';
import ParticipantProjectSpeciesService from 'src/services/ParticipantProjectSpeciesService';

interface DownloadSpeciesSnapshotModalProps {
  deliverableId: number;
  open: boolean;
  onClose: () => void;
  projectId: number;
}

export default function DownloadSpeciesSnapshotModal(props: DownloadSpeciesSnapshotModalProps): JSX.Element {
  const { deliverableId, open, onClose, projectId } = props;

  const onExport = async () => {
    return await ParticipantProjectSpeciesService.downloadSnapshot(deliverableId, projectId);
  };

  return <ExportCsvModal open={open} onExport={onExport} onClose={onClose} />;
}
