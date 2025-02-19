import React, { useMemo, useState } from 'react';

import { Typography, useTheme } from '@mui/material';

import ListMapView from 'src/components/ListMapView';
import Card from 'src/components/common/Card';
import { View } from 'src/components/common/ListMapSelector';
import Search from 'src/components/common/SearchFiltersWrapper';
import EmptyStateContent from 'src/components/emptyStatePages/EmptyStateContent';
import { selectAdHocObservationsResults } from 'src/redux/features/observations/observationsSelectors';
import { useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';

import BiomassMeasurementList from './BiomassMeasurementListView';
import BiomassMeasurementMapView from './BiomassMeasurementMapView';
import { AllPlantingSitesMapView } from './ObservationsDataView';

export type BiomassMeasurementProps = {
  selectedPlantingSite?: PlantingSite;
};

export default function BiomassMeasurement({ selectedPlantingSite }: BiomassMeasurementProps): JSX.Element {
  const theme = useTheme();
  const [view, setView] = useState<View>();

  const allAdHocObservationsResults = useAppSelector(selectAdHocObservationsResults);
  const adHocObservationsResults = useMemo(() => {
    if (!allAdHocObservationsResults || !selectedPlantingSite?.id) {
      return [];
    }

    return allAdHocObservationsResults?.filter((observationResult) => {
      const matchesSite =
        selectedPlantingSite.id !== -1 ? observationResult.plantingSiteId === selectedPlantingSite.id : true;
      const isBiomassMeasurement = observationResult.type === 'Biomass Measurements';
      return matchesSite && isBiomassMeasurement;
    });
  }, [allAdHocObservationsResults, selectedPlantingSite]);

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
        {strings.BIOMASS_MEASUREMENT}
      </Typography>
      <Card style={{ margin: '56px auto 0', borderRadius: '24px', height: 'fit-content' }}>
        {adHocObservationsResults ? (
          <ListMapView
            initialView='list'
            list={<BiomassMeasurementList adHocObservationsResults={adHocObservationsResults} />}
            map={
              selectedPlantingSite && selectedPlantingSite.id !== -1 ? (
                <BiomassMeasurementMapView
                  observationsResults={adHocObservationsResults}
                  selectedPlantingSite={selectedPlantingSite}
                />
              ) : (
                <AllPlantingSitesMapView />
              )
            }
            onView={setView}
            search={<Search search={''} onSearch={() => true} />}
            style={view === 'map' ? { display: 'flex', flexGrow: 1, flexDirection: 'column' } : undefined}
          />
        ) : (
          <EmptyStateContent
            title={''}
            subtitle={[strings.BIOMASS_EMPTY_STATE_MESSAGE_1, strings.BIOMASS_EMPTY_STATE_MESSAGE_2]}
          />
        )}
      </Card>
    </Card>
  );
}
