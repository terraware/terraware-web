import React, { type JSX, useCallback, useState } from 'react';

import { Button } from '@terraware/web-components';

import DeliverableStatusBadge from 'src/components/DeliverableView/DeliverableStatusBadge';
import Link from 'src/components/common/Link';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import useUpdateAcceleratorProjectSpecies from 'src/hooks/useUpdateAcceleratorProjectSpecies';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { SpeciesForAcceleratorProject } from 'src/types/AcceleratorProjectSpecies';
import { DeliverableStatusType } from 'src/types/Deliverables';

import EditSpeciesModal from './EditSpeciesModal';
import { useRejectSpeciesDialog } from './RejectSpeciesDialog/Context';

export default function SpeciesDeliverableCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, index, row, onRowClick } = props;

  const { update } = useUpdateAcceleratorProjectSpecies();
  const { openRejectDialog } = useRejectSpeciesDialog();
  const { activeLocale } = useLocalization();
  const { isAcceleratorRoute } = useAcceleratorConsole();

  const [openedEditSpeciesModal, setOpenedEditSpeciesModal] = useState(false);

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
            {openedEditSpeciesModal && (
              <EditSpeciesModal onClose={closeEditSpeciesModal} projectSpecies={row as SpeciesForAcceleratorProject} />
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
    return (
      <CellRenderer
        style={{ width: '50px' }}
        column={column}
        index={index}
        row={row}
        value={
          <>
            <Button
              label={strings.REQUEST_UPDATE}
              onClick={() => openRejectDialog(row.participantProjectSpecies)}
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
      void update({ ...row.participantProjectSpecies, submissionStatus: 'Approved' }).catch(() => undefined);
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
