import React, { useState } from 'react';

import { Button } from '@terraware/web-components';

import DeliverableStatusBadge from 'src/components/DeliverableView/DeliverableStatusBadge';
import Link from 'src/components/common/Link';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useLocalization } from 'src/providers';
import { requestUpdateParticipantProjectSpecies } from 'src/redux/features/participantProjectSpecies/participantProjectSpeciesAsyncThunks';
import { useAppDispatch } from 'src/redux/store';
import RejectDialog from 'src/scenes/AcceleratorRouter/Deliverables/RejectDialog';
import { ParticipantProjectSpecies } from 'src/services/ParticipantProjectSpeciesService';
import strings from 'src/strings';
import { DeliverableStatusType } from 'src/types/Deliverables';

import EditSpeciesModal from './EditSpeciesModal';

export default function SpeciesDeliverableCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { activeLocale } = useLocalization();
  const { column, index, row, value, reloadData } = props;
  const [openedEditSpeciesModal, setOpenedEditSpeciesModal] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState<boolean>(false);
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const dispatch = useAppDispatch();

  const createLinkToSpecies = (iValue: React.ReactNode | unknown[]) => {
    return <Link onClick={() => setOpenedEditSpeciesModal(true)}>{iValue as React.ReactNode}</Link>;
  };

  const createLinkToAcceleratorSpecies = (iValue: React.ReactNode | unknown[]) => {
    return (
      <Link to={`${APP_PATHS.ACCELERATOR_SPECIES.replace(':speciesId', row.speciesId.toString())}`}>
        {iValue as React.ReactNode}
      </Link>
    );
  };

  if (column.key === 'speciesScientificName') {
    return (
      <CellRenderer
        column={column}
        index={index}
        row={row}
        value={
          <>
            {openedEditSpeciesModal && reloadData && (
              <EditSpeciesModal
                onClose={() => setOpenedEditSpeciesModal(false)}
                reload={reloadData}
                projectSpecies={row as ParticipantProjectSpecies}
              />
            )}
            {isAcceleratorRoute ? createLinkToAcceleratorSpecies(value) : createLinkToSpecies(value)}
          </>
        }
      />
    );
  }

  if (column.key === 'status') {
    return (
      <CellRenderer
        column={column}
        index={index}
        row={row}
        value={activeLocale ? <DeliverableStatusBadge status={value as DeliverableStatusType} /> : ''}
      />
    );
  }

  if (column.key === 'reject') {
    const rejectHandler = (feedback: string) => {
      dispatch(
        requestUpdateParticipantProjectSpecies({
          projectId: row.projectId,
          participantProjectSpeciesId: row.id,
          participantProjectSpecies: {
            id: row.id,
            speciesId: row.speciesId,
            projectId: row.projectId,
            status: 'Rejected',
            feedback: feedback,
          },
        })
      );

      setShowRejectDialog(false);
    };

    return (
      <CellRenderer
        column={column}
        index={index}
        row={row}
        value={
          <>
            {showRejectDialog && <RejectDialog onClose={() => setShowRejectDialog(false)} onSubmit={rejectHandler} />}
            <Button
              label={strings.REJECT_ACTION}
              onClick={() => setShowRejectDialog(true)}
              priority='secondary'
              type='destructive'
              disabled={row.status === 'Rejected'}
            />
          </>
        }
      />
    );
  }

  if (column.key === 'approve') {
    const approveHandler = () => {
      dispatch(
        requestUpdateParticipantProjectSpecies({
          projectId: row.projectId,
          participantProjectSpeciesId: row.id,
          participantProjectSpecies: {
            id: row.id,
            speciesId: row.speciesId,
            projectId: row.projectId,
            status: 'Approved',
          },
        })
      );
    };

    return (
      <CellRenderer
        column={column}
        index={index}
        row={row}
        value={
          <Button
            label={strings.APPROVE}
            onClick={() => approveHandler()}
            priority='secondary'
            disabled={row.status === 'Approved'}
          />
        }
      />
    );
  }

  return <CellRenderer {...props} />;
}
