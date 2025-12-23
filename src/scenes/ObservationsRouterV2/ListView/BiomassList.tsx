import React, { useEffect, useMemo } from 'react';

import { TableColumnType } from '@terraware/web-components';

import ClientSideFilterTable from 'src/components/Tables/ClientSideFilterTable';
import Card from 'src/components/common/Card';
import { useLocalization, useOrganization } from 'src/providers/hooks';
import { useLazyListAdHocObservationResultsQuery } from 'src/queries/generated/observations';
import { useLazySearchPlantingSitesQuery } from 'src/queries/search/plantingSites';
import { SearchSortOrder } from 'src/types/Search';

import BiomassRenderer from './BiomassRenderer';

export type BiomassListProps = {
  siteId?: number;
};

export default function BiomassList({ siteId }: BiomassListProps): JSX.Element {
  const { strings } = useLocalization();

  const columns: TableColumnType[] = useMemo(
    () => [
      {
        key: 'monitoringPlotNumber',
        name: strings.PLOT,
        type: 'number',
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
        key: 'completedDate',
        name: strings.DATE,
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
    ],
    [strings]
  );

  const defaultSearchOrder: SearchSortOrder = {
    field: 'completedDate',
    direction: 'Descending',
  };

  const fuzzySearchColumns = ['monitoringPlotNumber', 'monitoringPlotDescription'];

  const { selectedOrganization } = useOrganization();
  const [listPlantingSites, listPlantingSitesResult] = useLazySearchPlantingSitesQuery();

  const plantingSitesNames = useMemo(
    () =>
      (listPlantingSitesResult.data ?? []).reduce(
        (siteNames, site) => {
          siteNames[site.id] = site.name;
          return siteNames;
        },
        {} as { [siteId: number]: string }
      ),
    [listPlantingSitesResult.data]
  );

  useEffect(() => {
    if (selectedOrganization) {
      void listPlantingSites({ organizationId: selectedOrganization.id, searchOrder: [{ field: 'name' }] }, true);
    }
  }, [listPlantingSites, selectedOrganization]);
  const [listAdHocObservationResults, adHocObservationsResultsResponse] = useLazyListAdHocObservationResultsQuery();

  useEffect(() => {
    if (selectedOrganization) {
      void listPlantingSites({ organizationId: selectedOrganization.id, searchOrder: [{ field: 'name' }] }, true);
      void listAdHocObservationResults(
        { plantingSiteId: siteId, organizationId: selectedOrganization.id, includePlants: true },
        true
      );
    }
  }, [listAdHocObservationResults, listPlantingSites, selectedOrganization, siteId]);

  const adHocObservationsResults = useMemo(() => {
    if (adHocObservationsResultsResponse.isSuccess) {
      return adHocObservationsResultsResponse.data.observations
        .filter((observation) => observation.type === 'Biomass Measurements' && observation.biomassMeasurements)
        .map((observation) => ({
          id: observation.observationId,
          monitoringPlotNumber: observation.adHocPlot?.monitoringPlotNumber,
          monitoringPlotDescription: observation.biomassMeasurements?.description,
          plantingSiteName: plantingSitesNames[observation.plantingSiteId],
          completedDate: observation.completedTime,
          totalPlants: observation.biomassMeasurements?.trees.length,
          totalSpecies: observation.biomassMeasurements?.treeSpeciesCount,
        }));
    } else {
      return [];
    }
  }, [adHocObservationsResultsResponse, plantingSitesNames]);

  return (
    <Card radius={'8px'} style={{ width: '100%' }}>
      <ClientSideFilterTable
        busy={adHocObservationsResultsResponse.isLoading}
        columns={columns}
        defaultSortOrder={defaultSearchOrder}
        fuzzySearchColumns={fuzzySearchColumns}
        id='accelerator-reports-table'
        Renderer={BiomassRenderer}
        rows={adHocObservationsResults}
        title={strings.BIOMASS_MONITORING}
      />
    </Card>
  );
}
