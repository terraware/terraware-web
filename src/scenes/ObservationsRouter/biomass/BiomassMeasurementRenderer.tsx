import React, { type JSX } from 'react';

import Link from 'src/components/common/Link';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import TableRowPopupMenu from 'src/components/common/table/TableRowPopupMenu';
import { RendererProps } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import useExportBiomassDetailsZip from 'src/scenes/ObservationsRouter/biomass/useExportBiomassDetailsZip';
import strings from 'src/strings';

export default function BiomassMeasurementRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, value, index } = props;
  const exportDetails = useExportBiomassDetailsZip(row.observationId, row.plantingSiteId, row.startDate);

  const textStyles = {
    fontSize: '16px',
    '& > p': {
      fontSize: '16px',
    },
  };

  const createLinkToPlot = (iValue: React.ReactNode | unknown[]) => {
    const biomassPlotUrl = APP_PATHS.OBSERVATION_BIOMASS_MEASUREMENTS_DETAILS;

    const to = biomassPlotUrl
      .replace(':monitoringPlotId', row.adHocPlot?.monitoringPlotId?.toString())
      .replace(':observationId', row.observationId?.toString())
      .replace(':plantingSiteId', row.plantingSiteId?.toString());

    return (
      <Link fontSize='16px' to={to}>
        {iValue as React.ReactNode}
      </Link>
    );
  };

  if (column.key === 'monitoringPlotNumber') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={createLinkToPlot(row.adHocPlot.monitoringPlotNumber)}
        row={row}
        sx={textStyles}
        title={value as string}
      />
    );
  }

  if (column.key === 'monitoringPlotDescription') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={row.biomassMeasurements?.description ?? ''}
        row={row}
        sx={textStyles}
        title={value as string}
      />
    );
  }

  if (column.key === 'totalPlants') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={row.biomassMeasurements?.trees?.length}
        row={row}
        sx={textStyles}
        title={value as string}
      />
    );
  }

  if (column.key === 'totalSpecies') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={row.biomassMeasurements?.treeSpeciesCount}
        row={row}
        sx={textStyles}
        title={value as string}
      />
    );
  }

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
