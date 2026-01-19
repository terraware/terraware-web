import React, { type JSX, useCallback, useEffect, useState } from 'react';

import { Button } from '@terraware/web-components';

import RejectDialog from 'src/components/AcceleratorDeliverableView/RejectDialog';
import DeliverableStatusBadge from 'src/components/DeliverableView/DeliverableStatusBadge';
import Link from 'src/components/common/Link';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useLocalization } from 'src/providers';
import { requestUpdateParticipantProjectSpecies } from 'src/redux/features/participantProjectSpecies/participantProjectSpeciesAsyncThunks';
import { selectParticipantProjectSpeciesUpdateRequest } from 'src/redux/features/participantProjectSpecies/participantProjectSpeciesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { DeliverableStatusType } from 'src/types/Deliverables';
import { SpeciesForParticipantProject } from 'src/types/ParticipantProjectSpecies';

import EditSpeciesModal from './EditSpeciesModal';

export default function SpeciesDeliverableCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, index, row, reloadData, onRowClick } = props;

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
  }, [result, reloadData]);

  const createLinkToSpecies = (iValue: React.ReactNode | unknown[]) => {
    return (
      <Link fontSize='16px' onClick={() => setOpenedEditSpeciesModal(true)}>
        {iValue as React.ReactNode}
      </Link>
    );
  };

  const createLinkToAcceleratorSpecies = (iValue: React.ReactNode | unknown[]) => {
    if (onRowClick) {
      return (
        <Link fontSize='16px' onClick={() => onRowClick()}>
          {iValue as React.ReactNode}
        </Link>
      );
    }
  };

  const closeEditSpeciesModal = useCallback(() => setOpenedEditSpeciesModal(false), []);

  if (column.key === 'species_scientificName') {
    return (
      <CellRenderer
        column={column}
        index={index}
        row={row}
        value={
          <>
            {openedEditSpeciesModal && reloadData && (
              <EditSpeciesModal
                onClose={closeEditSpeciesModal}
                reload={reloadData}
                projectSpecies={row as SpeciesForParticipantProject}
              />
            )}
            {isAcceleratorRoute
              ? createLinkToAcceleratorSpecies(row?.species_scientificName)
              : createLinkToSpecies(row?.species_scientificName)}
          </>
        }
      />
    );
  }

  if (column.key === 'participantProjectSpecies_submissionStatus') {
    return (
      <CellRenderer
        style={{ width: '50px' }}
        column={column}
        index={index}
        row={row}
        value={
          activeLocale ? (
            <DeliverableStatusBadge status={row?.participantProjectSpecies_submissionStatus as DeliverableStatusType} />
          ) : (
            ''
          )
        }
      />
    );
  }

  if (column.key === 'reject') {
    const rejectHandler = (feedback: string) => {
      const request = dispatch(
        requestUpdateParticipantProjectSpecies({
          participantProjectSpecies: {
            ...row.participantProjectSpecies,
            feedback,
            submissionStatus: 'Rejected',
          },
        })
      );
      setRequestId(request.requestId);

      setShowRejectDialog(false);
    };

    return (
      <CellRenderer
        style={{ width: '50px' }}
        column={column}
        index={index}
        row={row}
        value={
          <>
            {showRejectDialog && <RejectDialog onClose={() => setShowRejectDialog(false)} onSubmit={rejectHandler} />}
            <Button
              label={strings.REQUEST_UPDATE}
              onClick={() => setShowRejectDialog(true)}
              priority='secondary'
              type='destructive'
              disabled={
                row.submissionStatus === 'Rejected' || row?.participantProjectSpecies_submissionStatus === 'Rejected'
              }
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
            ...row.participantProjectSpecies,
            submissionStatus: 'Approved',
          },
        })
      );
      setRequestId(request.requestId);
    };

    return (
      <CellRenderer
        style={{ width: '50px' }}
        column={column}
        index={index}
        row={row}
        value={
          <Button
            label={strings.APPROVE}
            onClick={() => approveHandler()}
            priority='secondary'
            disabled={
              row.submissionStatus === 'Approved' || row?.participantProjectSpecies_submissionStatus === 'Approved'
            }
          />
        }
      />
    );
  }

  return <CellRenderer {...props} />;
}
