import React, { useEffect, useMemo, useState } from 'react';

import { CircularProgress, Typography, useTheme } from '@mui/material';

import Card from 'src/components/common/Card';
import { View } from 'src/components/common/ListMapSelector';
import { SearchProps } from 'src/components/common/SearchFiltersWrapper';
import EmptyStateContent from 'src/components/emptyStatePages/EmptyStateContent';
import { useOrganization } from 'src/providers';
import { selectObservationsResults } from 'src/redux/features/observations/observationsSelectors';
import { requestPlantings } from 'src/redux/features/plantings/plantingsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { FieldOptionsMap } from 'src/types/Search';
import { PlantingSite } from 'src/types/Tracking';

import ObservationsDataView from './ObservationsDataView';

export type PlantMonitoringProps = SearchProps & {
  setFilterOptions: (value: FieldOptionsMap) => void;
  reload: () => void;
  selectedPlantingSite?: PlantingSite;
};

export default function PlantMonitoring(props: PlantMonitoringProps): JSX.Element {
  const dispatch = useAppDispatch();
  const { selectedPlantingSite } = props;
  const { selectedOrganization } = useOrganization();
  const [view, setView] = useState<View>();
  const theme = useTheme();

  const allObservationsResults = useAppSelector(selectObservationsResults);
  const observationsResults = useMemo(() => {
    if (!allObservationsResults || !selectedPlantingSite?.id) {
      return [];
    }

    return allObservationsResults?.filter((observationResult) => {
      const matchesSite =
        selectedPlantingSite.id !== -1 ? observationResult.plantingSiteId === selectedPlantingSite.id : true;
      const matchesState = ['Completed', 'Overdue', 'InProgress'].indexOf(observationResult.state) !== -1;
      return matchesSite && matchesState;
    });
  }, [allObservationsResults, selectedPlantingSite]);

  useEffect(() => {
    if (selectedOrganization.id !== -1) {
      dispatch(requestPlantings(selectedOrganization.id));
    }
  }, [dispatch, selectedOrganization.id]);

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
        {strings.PLANT_MONITORING}
      </Typography>
      {observationsResults === undefined ? (
        <CircularProgress sx={{ margin: 'auto' }} />
      ) : selectedPlantingSite && observationsResults?.length ? (
        <ObservationsDataView
          selectedPlantingSiteId={selectedPlantingSite.id}
          selectedPlantingSite={selectedPlantingSite}
          setView={setView}
          view={view}
          {...props}
        />
      ) : (
        <Card style={{ margin: '56px auto 0', borderRadius: '24px', height: 'fit-content' }}>
          <EmptyStateContent
            title={''}
            subtitle={[strings.OBSERVATIONS_EMPTY_STATE_MESSAGE_1, strings.OBSERVATIONS_EMPTY_STATE_MESSAGE_2]}
          />
        </Card>
      )}
    </Card>
  );
}
