import React from 'react';

import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import TableRowPopupMenu from 'src/components/common/table/TableRowPopupMenu';
import { RendererProps } from 'src/components/common/table/types';
import { useLocalization } from 'src/providers';

import useObservationExports from '../useObservationExports';

export default function BiomassRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row } = props;
  const { strings } = useLocalization();
  const observationId = row.observationId as number;
  const { downloadBiomassObservationDetails } = useObservationExports();

  const textStyles = {
    fontSize: '16px',
    '& > p': {
      fontSize: '16px',
    },
  };

  if (column.key === 'actionsMenu') {
    const menu = (
      <TableRowPopupMenu
        menuItems={[
          {
            disabled: false,
            label: strings.EXPORT_BIOMASS_MONITORING_DETAILS_CSV,
            onClick: () => void downloadBiomassObservationDetails(observationId),
          },
        ]}
      />
    );

    return <CellRenderer {...props} value={menu} />;
  }

  return <CellRenderer {...props} sx={textStyles} />;
}
