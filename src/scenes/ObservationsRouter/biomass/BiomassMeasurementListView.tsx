import React from 'react';

import { TableColumnType } from '@terraware/web-components';

import Table from 'src/components/common/table';
import { useLocalization } from 'src/providers/hooks';
import BiomassMeasurementRenderer from 'src/scenes/ObservationsRouter/biomass/BiomassMeasurementRenderer';
import { ObservationResultsPayload } from 'src/types/Observations';

export type BiomassMeasurementListProps = {
  adHocObservationResults?: ObservationResultsPayload[];
};

export default function BiomassMeasurementList({ adHocObservationResults }: BiomassMeasurementListProps): JSX.Element {
  const { strings } = useLocalization();

  const columns: TableColumnType[] = [
    {
      key: 'monitoringPlotNumber',
      name: strings.PLOT,
      type: 'string',
    },
    {
      key: 'monitoringPlotDescription',
      name: strings.PLOT_DESCRIPTION,
      type: 'string',
    },
    {
      key: 'plantingSiteName',
      name: strings.PLANTING_SITE,
      type: 'string',
    },
    {
      key: 'completedTime',
      name: strings.DATE_OBSERVED,
      tooltipTitle: strings.DATE_OBSERVED_TOOLTIP,
      type: 'date',
    },
    {
      key: 'totalPlants',
      name: strings.TOTAL_PLANTS,
      tooltipTitle: strings.TOOLTIP_TOTAL_PLANTS,
      type: 'number',
    },
    {
      key: 'totalSpecies',
      name: strings.SPECIES,
      type: 'number',
    },
    {
      key: 'actionsMenu',
      name: '',
      type: 'string',
    },
  ];

  return (
    <Table
      id='biomass-measurement-table'
      columns={columns}
      rows={adHocObservationResults || []}
      orderBy='startDate'
      showTopBar={true}
      Renderer={BiomassMeasurementRenderer}
    />
  );
}
