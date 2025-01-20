import React, { useEffect, useMemo, useState } from 'react';

import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { Dropdown } from '@terraware/web-components';

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

  const [selectedPlotSelection, setSelectedPlotSelection] = useState('assigned');
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
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography
          sx={{
            fontSize: '20px',
            fontWeight: 600,
            color: theme.palette.TwClrTxt,
          }}
        >
          {strings.PLANT_MONITORING}
        </Typography>
        <Box
          sx={{
            margin: theme.spacing(0, 2),
            width: '1px',
            height: '32px',
            backgroundColor: theme.palette.TwClrBgTertiary,
          }}
        />
        <Box display='flex' alignItems='center' padding={theme.spacing(2, 0)}>
          <Typography sx={{ paddingRight: 1, fontSize: '16px', fontWeight: 500 }}>{strings.PLOT_SELECTION}</Typography>
          <Dropdown
            placeholder={strings.SELECT}
            id='plot-selection-selector'
            onChange={(newValue) => setSelectedPlotSelection(newValue)}
            options={[
              { label: strings.ASSIGNED, value: 'assigned' },
              { label: strings.AD_HOC, value: 'adHoc' },
            ]}
            selectedValue={selectedPlotSelection}
            selectStyles={{ inputContainer: { maxWidth: '160px' }, optionsContainer: { maxWidth: '160px' } }}
          />
        </Box>
      </Box>
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
