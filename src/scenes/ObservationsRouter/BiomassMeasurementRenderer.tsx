import React from 'react';

import Link from 'src/components/common/Link';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';

export default function BiomassMeasurementRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, value, index } = props;

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

  return <CellRenderer {...props} sx={textStyles} />;
}
