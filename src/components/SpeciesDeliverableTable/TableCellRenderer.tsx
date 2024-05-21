import React, { useEffect, useState } from 'react';

import { Button } from '@terraware/web-components';

import DeliverableStatusBadge from 'src/components/DeliverableView/DeliverableStatusBadge';
import Link from 'src/components/common/Link';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useLocalization } from 'src/providers';
import { requestUpdateParticipantProjectSpecies } from 'src/redux/features/participantProjectSpecies/participantProjectSpeciesAsyncThunks';
import { selectParticipantProjectSpeciesUpdateRequest } from 'src/redux/features/participantProjectSpecies/participantProjectSpeciesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import RejectDialog from 'src/scenes/AcceleratorRouter/Deliverables/RejectDialog';
import strings from 'src/strings';
import { DeliverableStatusType } from 'src/types/Deliverables';
import { SpeciesForParticipantProject } from 'src/types/ParticipantProjectSpecies';

import EditSpeciesModal from './EditSpeciesModal';

export default function SpeciesDeliverableCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, index, row, value, reloadData, onRowClick } = props;

  const dispatch = useAppDispatch();
  const { activeLocale } = useLocalization();
  const { isAcceleratorRoute } = useAcceleratorConsole();

  const [openedEditSpeciesModal, setOpenedEditSpeciesModal] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState<boolean>(false);

  const [requestId, setRequestId] = useState<string>('');
  const result = useAppSelector(selectParticipantProjectSpeciesUpdateRequest(requestId));

  useEffect(() => {
    if (result?.status === 'success' && reloadData) {
      reloadData();
    }
  }, [result]);

  const createLinkToSpecies = (iValue: React.ReactNode | unknown[]) => {
    return <Link onClick={() => setOpenedEditSpeciesModal(true)}>{iValue as React.ReactNode}</Link>;
  };

  const createLinkToAcceleratorSpecies = (iValue: React.ReactNode | unknown[]) => {
    if (onRowClick) {
      return <Link onClick={() => onRowClick()}>{iValue as React.ReactNode}</Link>;
    }
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
                projectSpecies={row as SpeciesForParticipantProject}
              />
            )}
            {isAcceleratorRoute ? createLinkToAcceleratorSpecies(value) : createLinkToSpecies(value)}
          </>
        }
      />
    );
  }

  if (column.key === 'participantProjectSpeciesSubmissionStatus') {
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
      const request = dispatch(
        requestUpdateParticipantProjectSpecies({
          participantProjectSpecies: {
            id: row.id,
            speciesId: row.speciesId,
            projectId: row.projectId,
            submissionStatus: 'Rejected',
            rationale: feedback,
          },
        })
      );
      setRequestId(request.requestId);

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
              disabled={row.submissionStatus === 'Rejected'}
            />
          </>
        }
      />
    );
  }

  if (column.key === 'approve') {
    const approveHandler = () => {
      const request = dispatch(
        requestUpdateParticipantProjectSpecies({
          participantProjectSpecies: {
            id: row.id,
            speciesId: row.speciesId,
            projectId: row.projectId,
            submissionStatus: 'Approved',
          },
        })
      );
      setRequestId(request.requestId);
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
            disabled={row.submissionStatus === 'Approved'}
          />
        }
      />
    );
  }

  return <CellRenderer {...props} />;
}
