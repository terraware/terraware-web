import React, { useState } from 'react';

import DeliverableStatusBadge from 'src/components/DeliverableView/DeliverableStatusBadge';
import Link from 'src/components/common/Link';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { useLocalization } from 'src/providers';
import { ParticipantProjectSpecies } from 'src/services/ParticipantProjectSpeciesService';
import { DeliverableStatusType } from 'src/types/Deliverables';

import EditSpeciesModal from './EditSpeciesModal';

export default function SpeciesDeliverableCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { activeLocale } = useLocalization();
  const { column, index, row, value, reloadData } = props;
  const [openedEditSpeciesModal, setOpenedEditSpeciesModal] = useState(false);

  const createLinkToSpecies = (iValue: React.ReactNode | unknown[]) => {
    return <Link onClick={() => setOpenedEditSpeciesModal(true)}>{iValue as React.ReactNode}</Link>;
  };

  if (column.key === 'scientificName') {
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
            {createLinkToSpecies(value)}
          </>
        }
      />
    );
  }

  if (column.key === 'submissionStatus') {
    return (
      <CellRenderer
        column={column}
        index={index}
        row={row}
        value={activeLocale ? <DeliverableStatusBadge status={value as DeliverableStatusType} /> : ''}
      />
    );
  }

  return <CellRenderer {...props} />;
}
