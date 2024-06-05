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
  }, [result]);

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

  if (column.key === 'species.scientificName') {
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
            {isAcceleratorRoute
              ? createLinkToAcceleratorSpecies(row?.species?.scientificName)
              : createLinkToSpecies(row?.species?.scientificName)}
          </>
        }
      />
    );
  }

  if (column.key === 'participantProjectSpecies.submissionStatus') {
    return (
      <CellRenderer
        style={{ width: '50px' }}
        column={column}
        index={index}
        row={row}
        value={
          activeLocale ? (
            <DeliverableStatusBadge
              status={row?.participantProjectSpecies?.submissionStatus as DeliverableStatusType}
            />
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
            disabled={row.submissionStatus === 'Approved'}
          />
        }
      />
    );
  }

  if (column.key === 'species.commonName') {
    return <CellRenderer {...props} value={row.species.commonName} />;
  }

  if (column.key === 'participantProjectSpecies.rationale') {
    return <CellRenderer {...props} value={row.participantProjectSpecies.rationale} />;
  }

  if (column.key === 'participantProjectSpecies.speciesNativeCategory') {
    return <CellRenderer {...props} value={row.participantProjectSpecies.speciesNativeCategory} />;
  }

  return <CellRenderer {...props} />;
}
