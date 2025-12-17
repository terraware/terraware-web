import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { Dropdown, Icon } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Card from 'src/components/common/Card';
import Link from 'src/components/common/Link';
import { View } from 'src/components/common/ListMapSelector';
import { SearchProps } from 'src/components/common/SearchFiltersWrapper';
import EmptyStateContent from 'src/components/emptyStatePages/EmptyStateContent';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import {
  selectAdHocObservationResults,
  selectObservationsResults,
} from 'src/redux/features/observations/observationsSelectors';
import { selectPlantingSiteT0AllSet, selectPlotsWithObservations } from 'src/redux/features/tracking/trackingSelectors';
import {
  PlotsWithObservationsSearchResult,
  requestGetPlantingSiteT0AllSet,
  requestPermanentPlotsWithObservations,
} from 'src/redux/features/tracking/trackingThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
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
  const [plotsRequestId, setPlotsRequestId] = useState('');
  const [allSetRequestId, setAllSetRequestId] = useState('');
  const plotsWithObservationsResponse = useAppSelector(selectPlotsWithObservations(plotsRequestId));
  const [plotsWithObservations, setPlotsWithObservations] = useState<PlotsWithObservationsSearchResult[]>();
  const t0AllSetResponse = useAppSelector(selectPlantingSiteT0AllSet(allSetRequestId));
  const [survivalRateSet, setSurvivalRateSet] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const allObservationsResults = useAppSelector(selectObservationsResults);
  const allAdHocObservationResults = useAppSelector(selectAdHocObservationResults);
  const { isMobile } = useDeviceInfo();

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

  const adHocObservationResults = useMemo(() => {
    if (!allAdHocObservationResults || !selectedPlantingSite?.id) {
      return [];
    }

    return allAdHocObservationResults?.filter(
      (observationResult) =>
        (selectedPlantingSite.id === -1 || observationResult.plantingSiteId === selectedPlantingSite.id) &&
        observationResult.type === 'Monitoring'
    );
  }, [allAdHocObservationResults, selectedPlantingSite]);

  useEffect(() => {
    if (selectedPlantingSite && selectedPlantingSite.id !== -1) {
      const requestPlots = dispatch(requestPermanentPlotsWithObservations(selectedPlantingSite.id));
      setPlotsRequestId(requestPlots.requestId);
      const requestAllSet = dispatch(requestGetPlantingSiteT0AllSet(selectedPlantingSite.id));
      setAllSetRequestId(requestAllSet.requestId);
    }
  }, [dispatch, selectedPlantingSite]);

  useEffect(() => {
    if (t0AllSetResponse?.status === 'success') {
      setSurvivalRateSet(t0AllSetResponse.data ?? false);
    }
  }, [t0AllSetResponse]);

  useEffect(() => {
    if (plotsWithObservationsResponse?.status === 'success') {
      setPlotsWithObservations(plotsWithObservationsResponse.data);
    }
  }, [plotsWithObservationsResponse]);

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
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
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
        {selectedPlantingSite &&
          selectedPlantingSite?.id !== -1 &&
          selectedPlotSelection === 'assigned' &&
          (observationsResults?.length || 0) > 0 && (
            <Box display={'flex'} alignItems={'center'} flexBasis={isMobile ? '100%' : 'content'}>
              <Link
                onClick={navigateToSurvivalRateSettings}
                fontSize='16px'
                style={{
                  paddingLeft: isMobile ? 0 : theme.spacing(2),
                  paddingRight: theme.spacing(0.5),
                  paddingTop: isMobile ? theme.spacing(1) : 0,
                }}
                disabled={(plotsWithObservations?.length || 0) === 0}
              >
                {strings.SURVIVAL_RATE_SETTINGS}
              </Link>
              {selectedPlantingSite?.id !== -1 && (observationsResults?.length || 0) > 0 && (
                <>
                  {survivalRateSet ? (
                    <Icon name='success' fillColor={theme.palette.TwClrBgSuccess} />
                  ) : (
                    <Icon name='iconUnavailable' fillColor={theme.palette.TwClrBgDanger} />
                  )}
                </>
              )}
            </Box>
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
            subtitle={
              selectedPlotSelection === 'assigned'
                ? [strings.OBSERVATIONS_EMPTY_STATE_MESSAGE_1, strings.OBSERVATIONS_EMPTY_STATE_MESSAGE_2]
                : [strings.AD_HOC_OBSERVATIONS_EMPTY_STATE_MESSAGE_1, strings.AD_HOC_OBSERVATIONS_EMPTY_STATE_MESSAGE_2]
            }
          />
        </Card>
      )}
    </Card>
  );
}
