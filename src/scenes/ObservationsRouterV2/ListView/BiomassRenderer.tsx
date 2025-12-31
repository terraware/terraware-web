import React from 'react';

import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import TableRowPopupMenu from 'src/components/common/table/TableRowPopupMenu';
import { RendererProps } from 'src/components/common/table/types';
import useExportBiomassDetailsZip from 'src/scenes/ObservationsRouter/biomass/useExportBiomassDetailsZip';
import strings from 'src/strings';

export default function BiomassRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row } = props;
  const exportDetails = useExportBiomassDetailsZip(row.observationId, row.plantingSiteId, row.completedDate);

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
            onClick: () => void exportDetails(),
          },
        ]}
      />
    );

    return <CellRenderer {...props} value={menu} />;
  }

  return <CellRenderer {...props} sx={textStyles} />;
}
