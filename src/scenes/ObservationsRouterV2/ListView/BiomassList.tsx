import React, { type JSX, useCallback, useEffect, useMemo } from 'react';

import { Button, TableColumnType, Tooltip } from '@terraware/web-components';
import sanitize from 'sanitize-filename';

import ClientSideFilterTable from 'src/components/Tables/ClientSideFilterTable';
import Card from 'src/components/common/Card';
import EmptyStateContent from 'src/components/emptyStatePages/EmptyStateContent';
import { useLocalization, useOrganization } from 'src/providers/hooks';
import { useLazyListAdHocObservationResultsQuery } from 'src/queries/generated/observations';
import { useLazyListPlantingSitesQuery } from 'src/queries/generated/plantingSites';
import { ObservationsService } from 'src/services';
import { SearchSortOrder } from 'src/types/Search';
import { downloadCsv } from 'src/utils/csv';

import BiomassCellRenderer from './BiomassCellRenderer';

export type BiomassListProps = {
  plantingSiteId?: number;
};

export default function BiomassList({ plantingSiteId }: BiomassListProps): JSX.Element {
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
    ],
    [strings]
  );

  const defaultSearchOrder: SearchSortOrder = {
    field: 'completedDate',
    direction: 'Descending',
  };

  const fuzzySearchColumns = ['monitoringPlotNumber', 'monitoringPlotDescription'];

  const { selectedOrganization } = useOrganization();
  const [listPlantingSites, listPlantingSitesResult] = useLazyListPlantingSitesQuery();
  const [listAdHocObservationResults, adHocObservationsResultsResponse] = useLazyListAdHocObservationResultsQuery();

  const plantingSitesNames = useMemo(
    () =>
      (listPlantingSitesResult.data?.sites ?? []).reduce(
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
      void listPlantingSites({ organizationId: selectedOrganization.id }, true);
      void listAdHocObservationResults(
        { plantingSiteId, organizationId: selectedOrganization.id, includePlants: true },
        true
      );
    }
  }, [listAdHocObservationResults, listPlantingSites, selectedOrganization, plantingSiteId]);

  const adHocObservationsResults = useMemo(() => {
    if (adHocObservationsResultsResponse.isSuccess) {
      return adHocObservationsResultsResponse.data.observations
        .filter(
          (observation) =>
            observation.type === 'Biomass Measurements' &&
            observation.biomassMeasurements &&
            observation.state !== 'Upcoming'
        )
        .map((observation) => ({
          observationId: observation.observationId,
          monitoringPlotNumber: observation.adHocPlot?.monitoringPlotNumber,
          monitoringPlotDescription: observation.biomassMeasurements?.description,
          plantingSiteId: observation.plantingSiteId,
          plantingSiteName: plantingSitesNames[observation.plantingSiteId],
          completedDate: observation.completedTime,
          totalPlants: observation.biomassMeasurements?.trees.length,
          totalSpecies: observation.biomassMeasurements?.treeSpeciesCount,
        }));
    } else {
      return [];
    }
  }, [adHocObservationsResultsResponse, plantingSitesNames]);

  const onExportBiomassObservations = useCallback(async () => {
    if (!selectedOrganization) {
      return;
    }

    const content = await ObservationsService.exportBiomassObservationsCsv(selectedOrganization.id, plantingSiteId);

    if (content !== null) {
      const siteName = plantingSiteId
        ? plantingSitesNames[plantingSiteId] ?? strings.ALL_PLANTING_SITES
        : strings.ALL_PLANTING_SITES;
      const filename = sanitize(`${siteName}-${strings.BIOMASS_MONITORING}`);
      downloadCsv(filename, content);
    }
  }, [
    plantingSiteId,
    plantingSitesNames,
    selectedOrganization,
    strings.ALL_PLANTING_SITES,
    strings.BIOMASS_MONITORING,
  ]);

  const handleExportClick = useCallback(() => {
    void onExportBiomassObservations();
  }, [onExportBiomassObservations]);

  const exportComponent = useMemo(() => {
    if (adHocObservationsResults.length === 0) {
      return undefined;
    }

    return (
      <Tooltip title={strings.EXPORT}>
        <Button onClick={handleExportClick} icon='iconExport' type='passive' priority='ghost' />
      </Tooltip>
    );
  }, [adHocObservationsResults.length, handleExportClick, strings.EXPORT]);

  const isLoading = useMemo(
    () => adHocObservationsResultsResponse.isFetching || listPlantingSitesResult.isFetching,
    [adHocObservationsResultsResponse.isFetching, listPlantingSitesResult.isFetching]
  );

  return (
    <Card radius={'8px'} style={{ width: '100%' }}>
      <ClientSideFilterTable
        busy={isLoading}
        columns={columns}
        defaultSortOrder={defaultSearchOrder}
        emptyState={
          <EmptyStateContent
            title={''}
            subtitle={[strings.BIOMASS_EMPTY_STATE_MESSAGE_1, strings.BIOMASS_EMPTY_STATE_MESSAGE_2]}
          />
        }
        extraComponent={exportComponent}
        fuzzySearchColumns={fuzzySearchColumns}
        id='biomass-measurement-table'
        Renderer={BiomassCellRenderer}
        rows={adHocObservationsResults}
      />
    </Card>
  );
}
