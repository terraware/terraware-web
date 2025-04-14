import React from 'react';

import { getDateDisplayValue } from '@terraware/web-components/utils';

import Link from 'src/components/common/Link';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';

const AdHocObservationsRenderer =
  (timeZone: string) =>
  // eslint-disable-next-line react/display-name
  (props: RendererProps<TableRowType>): JSX.Element => {
    const { column, row, value, index } = props;

    const textStyles = {
      fontSize: '16px',
      '& > p': {
        fontSize: '16px',
      },
    };

    const createLinkToPlot = (iValue: React.ReactNode | unknown[]) => {
      const adHocObservationUrl = APP_PATHS.OBSERVATION_AD_HOC_PLOT_DETAILS;

      const to = adHocObservationUrl
        .replace(':monitoringPlotId', row.adHocPlot?.monitoringPlotId?.toString())
        .replace(':observationId', row.observationId?.toString())
        .replace(':plantingSiteId', row.plantingSiteId?.toString());

      return (
        <Link fontSize='16px' to={to}>
          {iValue as React.ReactNode}
        </Link>
      );
    };

    if (column.key === 'plotNumber') {
      return (
        <CellRenderer
          index={index}
          column={column}
          value={createLinkToPlot(row.plotNumber)}
          row={row}
          sx={textStyles}
          title={value as string}
        />
      );
    }

    if (column.key === 'observationDate') {
      return (
        <CellRenderer
          index={index}
          column={column}
          value={row.completedTime ? getDateDisplayValue(row.completedTime, timeZone) : row.startDate}
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
          value={row.adHocPlot?.totalPlants}
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
          value={row.adHocPlot?.totalSpecies}
          row={row}
          sx={textStyles}
          title={value as string}
        />
      );
    }

    return <CellRenderer {...props} sx={textStyles} />;
  };

export default AdHocObservationsRenderer;
