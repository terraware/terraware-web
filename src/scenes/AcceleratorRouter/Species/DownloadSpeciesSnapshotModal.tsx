import React, { type JSX } from 'react';

import ExportCsvModal from 'src/components/common/ExportCsvModal';
import { useLazyGetParticipantProjectSpeciesSnapshotQuery } from 'src/queries/generated/acceleratorProjectSpecies';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';

interface DownloadSpeciesSnapshotModalProps {
  deliverableId: number;
  open: boolean;
  onClose: () => void;
  projectId: number;
}

export default function DownloadSpeciesSnapshotModal(props: DownloadSpeciesSnapshotModalProps): JSX.Element {
  const { deliverableId, open, onClose, projectId } = props;

  const snackbar = useSnackbar();
  const [getSnapshot] = useLazyGetParticipantProjectSpeciesSnapshotQuery();

  const onExport = async () => {
    const { data, isError } = await getSnapshot({ deliverableId, projectId });
    if (isError || data === undefined) {
      snackbar.toastError(strings.GENERIC_ERROR);
      return null;
    }
    return data;
  };

  return <ExportCsvModal open={open} onExport={onExport} onClose={onClose} />;
}
