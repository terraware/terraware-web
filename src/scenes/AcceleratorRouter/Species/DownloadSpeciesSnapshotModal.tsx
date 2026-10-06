import React, { type JSX } from 'react';

import ExportCsvModal from 'src/components/common/ExportCsvModal';
import { useLazyGetParticipantProjectSpeciesSnapshotQuery } from 'src/queries/generated/acceleratorProjectSpecies';

interface DownloadSpeciesSnapshotModalProps {
  deliverableId: number;
  open: boolean;
  onClose: () => void;
  projectId: number;
}

export default function DownloadSpeciesSnapshotModal(props: DownloadSpeciesSnapshotModalProps): JSX.Element {
  const { deliverableId, open, onClose, projectId } = props;

  const [getSnapshot] = useLazyGetParticipantProjectSpeciesSnapshotQuery();

  const onExport = async () => {
    const result = await getSnapshot({ deliverableId, projectId });
    return result.data;
  };

  return <ExportCsvModal open={open} onExport={onExport} onClose={onClose} />;
}
