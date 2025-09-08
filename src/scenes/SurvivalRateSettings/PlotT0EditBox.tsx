import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Divider, FormControlLabel, Radio, RadioGroup, TextField, Typography, useTheme } from '@mui/material';
import { Checkbox, Message, SelectT } from '@terraware/web-components';

import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import { SpeciesPlot } from 'src/redux/features/nurseryWithdrawals/nurseryWithdrawalsThunks';
import { PlotT0Observation, PlotsWithObservationsSearchResult } from 'src/redux/features/tracking/trackingThunks';
import strings from 'src/strings';
import { PlotT0Data, SiteT0Data } from 'src/types/Tracking';

type PlotT0EditBoxProps = {
  plot: PlotsWithObservationsSearchResult;
  plantingSiteId: number;
  t0Plot?: PlotT0Data;
  record: SiteT0Data;
  setRecord: React.Dispatch<React.SetStateAction<SiteT0Data>>;
  withdrawnSpeciesPlot?: SpeciesPlot;
};

const PlotT0EditBox = ({ plot, record, setRecord, withdrawnSpeciesPlot }: PlotT0EditBoxProps) => {
  const theme = useTheme();
  const [t0Origin, setT0Origin] = useState<string>('useObservation');

  const { species } = useSpeciesData();

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

  useEffect(() => {
    console.log('withdrawnSpeciesPlot', withdrawnSpeciesPlot);
  }, [withdrawnSpeciesPlot]);

  useEffect(() => {
    console.log('plot', plot);
  }, [plot]);

  useEffect(() => {
    if (t0Origin === 'useObservation' && selectedObservation) {
      const plotToSave = record.plots.find((rPlot) => rPlot.monitoringPlotId === plot.id);
      if (plotToSave) {
        const plotCopy = { ...plotToSave, observationId: Number(selectedObservation.observation_id) };

        // Remove the existing plot, then add the updated one
        const otherPlots = record.plots.filter((p) => p.monitoringPlotId !== plot.id);
        setRecord({ ...record, plots: otherPlots ? [...otherPlots, plotCopy] : [plotCopy] });
      }
    }
  }, [plot.id, record, record.plots, selectedObservation, setRecord, t0Origin]);

  const getPlotTotalDensity = useMemo(() => {
    const selectedPlot = record.plots.find((pl) => pl.monitoringPlotId === plot.id);
    const total = selectedPlot?.densityData.reduce((sum, density) => sum + density.plotDensity, 0);
    return total;
  }, [plot.id, record]);

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
        <Box>
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
              <FormControlLabel
                control={<Radio />}
                label={strings.PROVIDE_PLANT_DENSITY_PER_SPECIES}
                value={'manual'}
              />
            </RadioGroup>
          </Box>
          {t0Origin === 'manual' && (
            <Box>
              <Message type='page' priority='info' body={strings.T0_PLANT_DENSITY_WARNING} />
              <Box>
                <table>
                  <thead>
                    <tr>
                      <th>{strings.SPECIES_FROM_WITHDRAWALS}</th>
                      <th>{strings.PLANT_DENSITY}</th>
                      <th>{strings.CALCULATED_PLANT_DENSITY_FROM_WITHDRAWALS}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawnSpeciesPlot?.species.map((withdrawnSpecies, index) => (
                      <tr key={index}>
                        <td>{species.find((sp) => sp.id === withdrawnSpecies.speciesId)?.scientificName}</td>
                        <td>
                          <TextField />
                        </td>
                        <td>
                          <Checkbox
                            id={`density-${withdrawnSpecies.speciesId}`}
                            label={withdrawnSpecies.density}
                            name={`density-${withdrawnSpecies.speciesId}`}
                            onChange={() => true}
                          />
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td>{strings.ALL_SPECIES}</td>
                      <td>{getPlotTotalDensity}</td>
                    </tr>
                  </tbody>
                </table>
              </Box>
            </Box>
          )}
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
