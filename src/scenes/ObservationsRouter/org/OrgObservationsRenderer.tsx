import React from 'react';

import { Theme } from '@mui/material';

import Link from 'src/components/common/Link';
import TextTruncated from 'src/components/common/TextTruncated';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import TableRowPopupMenu from 'src/components/common/table/TableRowPopupMenu';
import { RendererProps } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { Observation, ObservationState, getStatus } from 'src/types/Observations';

const NO_DATA_FIELDS = ['totalPlants', 'totalSpecies', 'mortalityRate'];

const OrgObservationsRenderer =
  (
    theme: Theme,
    locale: string | undefined | null,
    goToRescheduleObservation: (observationId: number) => void,
    exportObservationCsv: (observationId: number) => void,
    exportObservationGpx: (observationId: number) => void,
    exportObservationResults: (observationId: number) => void,
    openEndObservationModal: (observationId: Observation) => void
  ) =>
  // eslint-disable-next-line react/display-name
  (props: RendererProps<TableRowType>): JSX.Element => {
    const { column, row, value } = props;
    const observationId = Number(row.observationId);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const getTruncatedNames = (inputNames: string) => {
      const names = inputNames.split('\r');
      return <TextTruncated fontSize={16} stringList={names} moreText={strings.TRUNCATED_TEXT_MORE_LINK} />;
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
      return (
        <CellRenderer
          {...props}
          value={value as string}
          sx={{
            fontSize: '16px',
            '& > p': {
              fontSize: '16px',
            },
          }}
        />
      );
    }

    if (column.key === 'observationDate') {
      return <CellRenderer {...props} value={createLinkToSiteObservation(value as string)} />;
    }

    if (column.key === 'state') {
      return <CellRenderer {...props} value={getStatus(value as ObservationState)} />;
    }

    if (column.key === 'mortalityRate') {
      return <CellRenderer {...props} value={value !== undefined && value !== null ? `${value as number}%` : ''} />;
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
                exportObservationCsv(observationId);
              },
              tooltip: exportDisabled ? strings.EXPORT_LOCATIONS_DISABLED_TOOLTIP : undefined,
            },
            {
              disabled: exportDisabled,
              label: `${strings.EXPORT_LOCATIONS} (${strings.GPX_FILE})`,
              onClick: () => {
                exportObservationGpx(observationId);
              },
              tooltip: exportDisabled ? strings.EXPORT_LOCATIONS_DISABLED_TOOLTIP : undefined,
            },
            {
              disabled: exportDisabled,
              label: strings.EXPORT_RESULTS,
              onClick: () => {
                exportObservationResults(observationId);
              },
            },
            {
              disabled: row.state === 'Completed' || row.hasObservedPermanentPlots || row.hasObservedTemporaryPlots,
              label: strings.RESCHEDULE,
              onClick: () => {
                goToRescheduleObservation(observationId);
              },
            },
            {
              disabled: row.state === 'Completed',
              label: strings.END_OBSERVATION,
              onClick: () => {
                openEndObservationModal(row as Observation);
              },
            },
          ]}
        />
      ) : null;

      return <CellRenderer {...props} value={tableMenuItem} />;
    }

    return <CellRenderer {...props} />;
  };

export default OrgObservationsRenderer;
