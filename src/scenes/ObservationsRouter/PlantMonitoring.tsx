import React, { useCallback, useMemo, useState } from 'react';

import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { Dropdown } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import Link from 'src/components/common/Link';
import { View } from 'src/components/common/ListMapSelector';
import { SearchProps } from 'src/components/common/SearchFiltersWrapper';
import EmptyStateContent from 'src/components/emptyStatePages/EmptyStateContent';
import { APP_PATHS } from 'src/constants';
import isEnabled from 'src/features';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import {
  selectAdHocObservationResults,
  selectObservationsResults,
} from 'src/redux/features/observations/observationsSelectors';
import { useAppSelector } from 'src/redux/store';
import ObservationsDataView from 'src/scenes/ObservationsRouter/ObservationsDataView';
import strings from 'src/strings';
import { FieldOptionsMap } from 'src/types/Search';
import { PlantingSite } from 'src/types/Tracking';

export type PlotSelectionType = 'assigned' | 'adHoc';

export type PlantMonitoringProps = SearchProps & {
  setFilterOptions: (value: FieldOptionsMap) => void;
  reload: () => void;
  selectedPlantingSite?: PlantingSite;
};

export default function PlantMonitoring(props: PlantMonitoringProps): JSX.Element {
  const { selectedPlantingSite } = props;
  const [view, setView] = useState<View>('list');
  const theme = useTheme();
  const navigate = useSyncNavigate();

  const [selectedPlotSelection, setSelectedPlotSelection] = useState<PlotSelectionType>('assigned');
  const allObservationsResults = useAppSelector(selectObservationsResults);
  const isSurvivalRateCalculationEnabled = isEnabled('Survival Rate Calculation');
  const observationsResults = useMemo(() => {
    if (!allObservationsResults || !selectedPlantingSite?.id) {
      return [];
    }

    return allObservationsResults?.filter((observationResult) => {
      const matchesSite =
        selectedPlantingSite.id !== -1 ? observationResult.plantingSiteId === selectedPlantingSite.id : true;
      const matchesState = ['Completed', 'Overdue', 'InProgress', 'Abandoned'].indexOf(observationResult.state) !== -1;
      return matchesSite && matchesState;
    });
  }, [allObservationsResults, selectedPlantingSite]);

  const allAdHocObservationResults = useAppSelector(selectAdHocObservationResults);
  const adHocObservationResults = useMemo(() => {
    if (!allAdHocObservationResults || !selectedPlantingSite?.id) {
      return [];
    }

    return allAdHocObservationResults?.filter((observationResult) => {
      const matchesSite =
        selectedPlantingSite.id !== -1 ? observationResult.plantingSiteId === selectedPlantingSite.id : true;
      return matchesSite;
    });
  }, [allAdHocObservationResults, selectedPlantingSite]);

  const navigateToSurvivalRateSettings = useCallback(
    () =>
      navigate({
        pathname: APP_PATHS.SURVIVAL_RATE_SETTINGS.replace(
          ':plantingSiteId',
          selectedPlantingSite?.id.toString() || ''
        ),
      }),
    [navigate, selectedPlantingSite?.id]
  );

  return (
    <Card>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography
          sx={{
            fontSize: '20px',
            fontWeight: 600,
            color: theme.palette.TwClrTxt,
            paddingTop: '5px',
            paddingBottom: '5px',
          }}
        >
          {strings.PLANT_MONITORING}
        </Typography>
        {view === 'list' && (
          <>
            <Box
              sx={{
                margin: theme.spacing(0, 2),
                width: '1px',
                height: '32px',
                backgroundColor: theme.palette.TwClrBgTertiary,
              }}
            />
            <Box display='flex' alignItems='center'>
              <Typography sx={{ paddingRight: 1, fontSize: '16px', fontWeight: 500 }}>
                {strings.PLOT_SELECTION}
              </Typography>
              <Dropdown
                placeholder={strings.SELECT}
                id='plot-selection-selector'
                onChange={(newValue) => setSelectedPlotSelection(newValue as PlotSelectionType)}
                options={[
                  { label: strings.ASSIGNED, value: 'assigned' },
                  { label: strings.AD_HOC, value: 'adHoc' },
                ]}
                selectedValue={selectedPlotSelection}
                selectStyles={{
                  inputContainer: { maxWidth: '160px' },
                  optionsContainer: { maxWidth: '160px' },
                }}
                fullWidth
              />
            </Box>
          </>
        )}
        {selectedPlantingSite && isSurvivalRateCalculationEnabled && (
          <Link
            onClick={navigateToSurvivalRateSettings}
            fontSize='16px'
            style={{ paddingLeft: theme.spacing(2) }}
            disabled={selectedPlantingSite.id === -1}
          >
            {strings.SURVIVAL_RATE_SETTINGS}
          </Link>
        )}
      </Box>
      {(selectedPlotSelection === 'assigned' && observationsResults === undefined) ||
      (selectedPlotSelection === 'adHoc' && adHocObservationResults === undefined) ? (
        <CircularProgress sx={{ margin: 'auto' }} />
      ) : selectedPlantingSite &&
        ((selectedPlotSelection === 'assigned' && observationsResults?.length) ||
          (selectedPlotSelection === 'adHoc' && adHocObservationResults?.length)) ? (
        <ObservationsDataView
          selectedPlantingSiteId={selectedPlantingSite.id}
          setView={setView}
          view={view}
          selectedPlotSelection={selectedPlotSelection}
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
