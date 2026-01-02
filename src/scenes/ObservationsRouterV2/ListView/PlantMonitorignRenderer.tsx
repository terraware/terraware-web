import React from 'react';

import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import TableRowPopupMenu from 'src/components/common/table/TableRowPopupMenu';
import { RendererProps } from 'src/components/common/table/types';
import { useLocalization } from 'src/providers';

import useObservationExports from '../useObservationExports';

export default function PlantMonitoringRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row } = props;
  const { strings } = useLocalization();
  const observationId = row.observationId as number;
  const { downloadObservationCsv, downloadObservationGpx, downloadObservationResults } = useObservationExports();

  const textStyles = {
    fontSize: '16px',
    '& > p': {
      fontSize: '16px',
    },
  };

  if (column.key === 'actionsMenu') {
    const exportDisabled = row.state === 'Upcoming';
    const tableMenuItem = observationId ? (
      <TableRowPopupMenu
        menuItems={[
          {
            disabled: exportDisabled,
            label: `${strings.EXPORT_LOCATIONS} (${strings.CSV_FILE})`,
            onClick: () => {
              void downloadObservationCsv(observationId);
            },
            tooltip: exportDisabled ? strings.EXPORT_LOCATIONS_DISABLED_TOOLTIP : undefined,
          },
          {
            disabled: exportDisabled,
            label: `${strings.EXPORT_LOCATIONS} (${strings.GPX_FILE})`,
            onClick: () => {
              void downloadObservationGpx(observationId);
            },
            tooltip: exportDisabled ? strings.EXPORT_LOCATIONS_DISABLED_TOOLTIP : undefined,
          },
          {
            disabled: exportDisabled,
            label: strings.EXPORT_RESULTS,
            onClick: () => {
              void downloadObservationResults(observationId);
            },
          },
        ]}
      />
    ) : null;
    return <CellRenderer {...props} value={tableMenuItem} />;
  }

  return <CellRenderer {...props} sx={textStyles} />;
}
