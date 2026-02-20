import React, { type JSX } from 'react';

import FormattedNumber from 'src/components/common/FormattedNumber';
import Link from 'src/components/common/Link';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import TableRowPopupMenu from 'src/components/common/table/TableRowPopupMenu';
import { RendererProps } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';

import useObservationExports from '../useObservationExports';

export default function PlantMonitoringCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, value } = props;
  const { strings } = useLocalization();
  const observationId = row.observationId as number;
  const { downloadObservationCsv, downloadObservationGpx, downloadObservationResults } = useObservationExports();

  const textStyles = {
    fontSize: '16px',
    '& > p': {
      fontSize: '16px',
    },
  };

  if (column.key === 'observationDate' || column.key === 'adHocPlotNumber') {
    const url = APP_PATHS.OBSERVATION_DETAILS_V2.replace(':observationId', observationId.toString());
    return (
      <CellRenderer
        {...props}
        value={
          <Link fontSize='16px' to={url}>
            {value as string}
          </Link>
        }
      />
    );
  }

  if (
    column.key === 'totalLive' ||
    column.key === 'totalPlants' ||
    column.key === 'totalSpecies' ||
    column.key === 'plantingDensity'
  ) {
    return (
      <CellRenderer
        {...props}
        sx={textStyles}
        value={typeof value === 'number' ? <FormattedNumber value={value} /> : undefined}
      />
    );
  }

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
          // TODO add reschedule and end observations
        ]}
      />
    ) : null;
    return <CellRenderer {...props} value={tableMenuItem} />;
  }

  return <CellRenderer {...props} sx={textStyles} />;
}
