import React, { type JSX, useCallback, useMemo, useState } from 'react';

import { Typography, useTheme } from '@mui/material';
import sanitize from 'sanitize-filename';

import ListMapView from 'src/components/ListMapView';
import Card from 'src/components/common/Card';
import { View } from 'src/components/common/ListMapSelector';
import Search, { SearchProps } from 'src/components/common/SearchFiltersWrapper';
import EmptyStateContent from 'src/components/emptyStatePages/EmptyStateContent';
import { useOrganization } from 'src/providers';
import {
  searchAdHocObservations,
  selectAdHocObservationResults,
} from 'src/redux/features/observations/observationsSelectors';
import { useAppSelector } from 'src/redux/store';
import { AllPlantingSitesMapView } from 'src/scenes/ObservationsRouter/ObservationsDataView';
import BiomassMeasurementList from 'src/scenes/ObservationsRouter/biomass/BiomassMeasurementListView';
import BiomassMeasurementMapView from 'src/scenes/ObservationsRouter/biomass/BiomassMeasurementMapView';
import { ObservationsService } from 'src/services';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';
import { downloadCsv } from 'src/utils/csv';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

export type BiomassMeasurementProps = SearchProps & {
  selectedPlantingSite?: PlantingSite;
};

export default function BiomassMeasurement(props: BiomassMeasurementProps): JSX.Element {
  const theme = useTheme();
  const organization = useOrganization();
  const [view, setView] = useState<View>();
  const defaultTimeZone = useDefaultTimeZone();
  const { selectedPlantingSite } = props;
  const { ...searchProps }: SearchProps = props;
  const unfilteredResults = useAppSelector(selectAdHocObservationResults);
  const unfilteredObservationsResults = useMemo(() => {
    if (!unfilteredResults || !selectedPlantingSite?.id) {
      return [];
    }

    return unfilteredResults?.filter((observationResult) => {
      const matchesSite =
        selectedPlantingSite.id !== -1 ? observationResult.plantingSiteId === selectedPlantingSite.id : true;
      const isBiomassMeasurement = observationResult.type === 'Biomass Measurements';
      return matchesSite && isBiomassMeasurement;
    });
  }, [unfilteredResults, selectedPlantingSite]);

  const allAdHocObservationResults = useAppSelector((state) =>
    searchAdHocObservations(state, selectedPlantingSite?.id || -1, defaultTimeZone.get().id, searchProps.search)
  );
  const adHocObservationResults = useMemo(() => {
    if (!allAdHocObservationResults || !selectedPlantingSite?.id) {
      return [];
    }

    return allAdHocObservationResults?.filter((observationResult) => {
      const matchesSite =
        selectedPlantingSite.id !== -1 ? observationResult.plantingSiteId === selectedPlantingSite.id : true;
      const isBiomassMeasurement = observationResult.type === 'Biomass Measurements';
      return matchesSite && isBiomassMeasurement;
    });
  }, [allAdHocObservationResults, selectedPlantingSite]);

  const exportObservationsList = useCallback(async () => {
    const content = await ObservationsService.exportBiomassObservationsCsv(
      organization.selectedOrganization?.id || -1,
      selectedPlantingSite?.id
    );

    if (content !== null) {
      const siteName = selectedPlantingSite?.name ?? organization.selectedOrganization?.name ?? 'Unknown';
      const filename = sanitize(`${siteName}-${strings.BIOMASS_MONITORING}`);
      downloadCsv(filename, content);
    }
  }, [organization, selectedPlantingSite]);

  return (
    <Card>
      <Typography
        sx={{
          fontSize: '20px',
          fontWeight: 600,
          color: theme.palette.TwClrTxt,
          marginBottom: theme.spacing(2),
        }}
      >
        {strings.BIOMASS_MONITORING}
      </Typography>

      {unfilteredObservationsResults && unfilteredObservationsResults.length > 0 ? (
        <ListMapView
          initialView='list'
          list={<BiomassMeasurementList adHocObservationResults={adHocObservationResults} />}
          map={
            selectedPlantingSite && selectedPlantingSite.id !== -1 ? (
              <BiomassMeasurementMapView
                observationsResults={adHocObservationResults}
                selectedPlantingSite={selectedPlantingSite}
              />
            ) : (
              <AllPlantingSitesMapView />
            )
          }
          onView={setView}
          search={<Search {...searchProps} filtersProps={undefined} onExport={() => void exportObservationsList()} />}
          style={view === 'map' ? { display: 'flex', flexGrow: 1, flexDirection: 'column' } : undefined}
        />
      ) : (
        <EmptyStateContent
          title={''}
          subtitle={[strings.BIOMASS_EMPTY_STATE_MESSAGE_1, strings.BIOMASS_EMPTY_STATE_MESSAGE_2]}
        />
      )}
    </Card>
  );
}
