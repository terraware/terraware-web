import React, { useCallback, useState } from 'react';

import { Box, Divider, FormControlLabel, Radio, RadioGroup, Typography, useTheme } from '@mui/material';
import { SelectT } from '@terraware/web-components';

import { SpeciesPlot } from 'src/redux/features/nurseryWithdrawals/nurseryWithdrawalsThunks';
import { PlotT0Observation, PlotsWithObservationsSearchResult } from 'src/redux/features/tracking/trackingThunks';
import strings from 'src/strings';
import { PlotT0Data, SiteT0Data } from 'src/types/Tracking';

type PlotT0EditBoxProps = {
  plot: PlotsWithObservationsSearchResult;
  plantingSiteId: number;
  t0Plot?: PlotT0Data;
  record: SiteT0Data;
  speciesPlot?: SpeciesPlot;
};

const PlotT0EditBox = ({ plot }: PlotT0EditBoxProps) => {
  const theme = useTheme();
  // const { species } = useSpeciesData();
  const [t0Origin, setT0Origin] = useState<string>('useObservation');

  // const getPlotTotalDensity = useMemo(() => {
  //   const total = t0Plot?.densityData.reduce((sum, density) => sum + density.plotDensity, 0);
  //   return total;
  // }, [t0Plot]);

  const onChangeT0Origin = useCallback((event: React.ChangeEvent<HTMLInputElement>, value: string) => {
    setT0Origin(value);
  }, []);

  const [selectedObservation, setSelectedObservation] = useState<PlotT0Observation>();

  const onChangeObservation = useCallback((newValue: PlotT0Observation) => {
    setSelectedObservation(newValue);
  }, []);

  const isEqualObservation = useCallback(
    (a: PlotT0Observation, b: PlotT0Observation) => a.observation_id === b.observation_id,
    []
  );

  const renderOptionObservation = useCallback((option: PlotT0Observation) => option?.observation_startDate, []);

  const displayLabelObservation = useCallback((option: PlotT0Observation) => option?.observation_startDate, []);

  const toTObservation = useCallback(
    (startDate: string) => ({ observation_startDate: startDate }) as PlotT0Observation,
    []
  );

  return (
    <>
      <Box display='flex' paddingY={theme.spacing(2)} gap={theme.spacing(2)}>
        <Box
          minHeight='100px'
          minWidth='80px'
          sx={{ background: theme.palette.TwClrBaseGray050, justifyContent: 'center' }}
          display='flex'
          alignItems='center'
        >
          <Typography>{plot.name}</Typography>
        </Box>
        <Box flexGrow={1} display={'flex'} alignItems={'center'}>
          <RadioGroup name='radio-buttons-t0' onChange={onChangeT0Origin} value={t0Origin}>
            <Box display='flex'>
              <FormControlLabel
                control={<Radio />}
                disabled={(plot.observationPlots.length || 0) < 1}
                label={strings.USE_OBSERVATION_DATA}
                value={'useObservation'}
              />
              <SelectT<PlotT0Observation>
                options={plot.observationPlots}
                placeholder={strings.SELECT}
                onChange={onChangeObservation}
                isEqual={isEqualObservation}
                renderOption={renderOptionObservation}
                displayLabel={displayLabelObservation}
                selectedValue={selectedObservation}
                toT={toTObservation}
                fullWidth={true}
                disabled={t0Origin === 'manual'}
              />
            </Box>
            <FormControlLabel control={<Radio />} label={strings.PROVIDE_PLANT_DENSITY_PER_SPECIES} value={'manual'} />
          </RadioGroup>
        </Box>
        <Box>
          <Box sx={{ background: theme.palette.TwClrBgSecondary }} display='flex' padding={1}>
            <Box display='flex' paddingRight={3}>
              <Typography fontWeight={600} paddingRight={0.5}>
                {strings.ZONE}
              </Typography>
              <Typography>{plot.plantingSubzone_plantingZone_name}</Typography>
            </Box>
            <Box display='flex'>
              <Typography fontWeight={600} paddingRight={0.5}>
                {strings.SUBZONE}
              </Typography>
              <Typography>{plot.plantingSubzone_name}</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      <Divider />
    </>
  );
};

export default PlotT0EditBox;
