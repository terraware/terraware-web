import React from 'react';

import { Theme } from '@mui/material';

import Link from 'src/components/common/Link';
import TextTruncated from 'src/components/common/TextTruncated';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import TableRowPopupMenu from 'src/components/common/table/TableRowPopupMenu';
import { RendererProps } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { ObservationState, getStatus } from 'src/types/Observations';
import { getShortDate } from 'src/utils/dateFormatter';

const NO_DATA_FIELDS = ['totalPlants', 'totalSpecies', 'mortalityRate'];

const OrgObservationsRenderer =
  (
    theme: Theme,
    classes: any,
    locale: string | undefined | null,
    goToRescheduleObservation: (observationId: number) => void
  ) =>
  // eslint-disable-next-line react/display-name
  (props: RendererProps<TableRowType>): JSX.Element => {
    const { column, row, value } = props;

    const getTruncatedNames = (inputNames: string) => {
      const names = inputNames.split('\r');
      return <TextTruncated fontSize={16} stringList={names} />;
    };

    const createLinkToSiteObservation = (date: string) => {
      const url = APP_PATHS.OBSERVATION_DETAILS.replace(':plantingSiteId', row.plantingSiteId.toString()).replace(
        ':observationId',
        row.observationId.toString()
      );
      return (
        <Link fontSize='16px' to={url}>
          {date as React.ReactNode}
        </Link>
      );
    };

    // don't render data if we don't have data
    if (!row.completedTime && value === 0 && NO_DATA_FIELDS.indexOf(column.key) !== -1) {
      return <CellRenderer {...props} value={''} />;
    }

    if (column.key === 'plantingZones' || column.key === 'plantingSubzones') {
      return <CellRenderer {...props} value={getTruncatedNames(value as string)} className={classes.text} />;
    }

    if (column.key === 'completedDate') {
      const dateValue: string = (value as string) || (row.startDate as string);
      return <CellRenderer {...props} value={createLinkToSiteObservation(getShortDate(dateValue, locale))} />;
    }

    if (column.key === 'state') {
      return <CellRenderer {...props} value={getStatus(value as ObservationState)} />;
    }

    if (column.key === 'mortalityRate') {
      return <CellRenderer {...props} value={value !== undefined && value !== null ? `${value}%` : ''} />;
    }

    if (column.key === 'actionsMenu') {
      const tableMenuItem = (
        <TableRowPopupMenu
          menuItems={[
            {
              disabled: row.state === 'Completed' || row.hasObservedPermanentPlots || row.hasObservedTemporaryPlots,
              label: strings.RESCHEDULE,
              onClick: () => {
                goToRescheduleObservation(row.observationId);
              },
            },
          ]}
        />
      );

      return <CellRenderer {...props} value={tableMenuItem} />;
    }

    return <CellRenderer {...props} />;
  };

export default OrgObservationsRenderer;
