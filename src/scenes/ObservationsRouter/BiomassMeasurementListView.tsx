import React from 'react';

import { TableColumnType } from '@terraware/web-components';

import Table from 'src/components/common/table';
import strings from 'src/strings';
import { ObservationResultsPayload } from 'src/types/Observations';

import BiomassMeasurementRenderer from './BiomassMeasurementRenderer';

export type BiomassMeasurementListProps = {
  adHocObservationsResults?: ObservationResultsPayload[];
};

export default function BiomassMeasurementList({ adHocObservationsResults }: BiomassMeasurementListProps): JSX.Element {
  const columns = (): TableColumnType[] => {
    return [
      {
        key: 'monitoringPlotNumber',
        name: strings.PLOT,
        type: 'string',
      },
      {
        key: 'plantingSiteName',
        name: strings.PLANTING_SITE,
        type: 'string',
      },
      {
        key: 'startDate',
        name: strings.DATE,
        type: 'date',
      },
      {
        key: 'totalPlants',
        name: strings.PLANTS,
        type: 'number',
      },
      {
        key: 'totalSpecies',
        name: strings.SPECIES,
        type: 'number',
      },
    ];
  };

  return (
    <Table
      id='biomass-measurement-table'
      columns={columns}
      rows={adHocObservationsResults || []}
      orderBy='startDate'
      Renderer={BiomassMeasurementRenderer}
    />
  );
}
