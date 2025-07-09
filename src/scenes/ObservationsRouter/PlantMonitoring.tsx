import React, { useCallback, useState } from 'react';

import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { Dropdown } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import { View } from 'src/components/common/ListMapSelector';
import { SearchProps } from 'src/components/common/SearchFiltersWrapper';
import EmptyStateContent from 'src/components/emptyStatePages/EmptyStateContent';
import { useOrgTracking } from 'src/hooks/useOrgTracking';
import ObservationsDataView from 'src/scenes/ObservationsRouter/ObservationsDataView';
import strings from 'src/strings';
import { FieldOptionsMap } from 'src/types/Search';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';

export type PlotSelectionType = 'assigned' | 'adHoc';

export type PlantMonitoringProps = SearchProps & {
  setFilterOptions: (value: FieldOptionsMap) => void;
  reload: () => void;
};

export default function PlantMonitoring(props: PlantMonitoringProps): JSX.Element {
  const [view, setView] = useState<View>('list');
  const theme = useTheme();

  const [selectedPlotSelection, setSelectedPlotSelection] = useState<PlotSelectionType>('assigned');

  const { observationResults, adHocObservationResults } = useOrgTracking();
  const { plantingSite } = usePlantingSiteData();

  const selectPlotType = useCallback((value: string) => {
    if (value === 'assigned' || value === 'adHoc') {
      setSelectedPlotSelection(value);
    }
  }, []);

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
                onChange={selectPlotType}
                options={[
                  { label: strings.ASSIGNED, value: 'assigned' },
                  { label: strings.AD_HOC, value: 'adHoc' },
                ]}
                selectedValue={selectedPlotSelection}
                selectStyles={{ inputContainer: { maxWidth: '160px' }, optionsContainer: { maxWidth: '160px' } }}
              />
            </Box>
          </>
        )}
      </Box>
      {(selectedPlotSelection === 'assigned' && observationResults === undefined) ||
      (selectedPlotSelection === 'adHoc' && adHocObservationResults === undefined) ? (
        <CircularProgress sx={{ margin: 'auto' }} />
      ) : ((selectedPlotSelection === 'assigned' && observationResults?.length) ||
          (selectedPlotSelection === 'adHoc' && adHocObservationResults?.length)) ? (
        <ObservationsDataView
          setView={setView}
          view={view}
          selectedPlantingSite={plantingSite}
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
