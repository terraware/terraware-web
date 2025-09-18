import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Divider, FormControlLabel, Radio, RadioGroup, Typography, useTheme } from '@mui/material';
import { Checkbox, Message, SelectT } from '@terraware/web-components';

import TextField from 'src/components/common/TextField';
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

const PlotT0EditBox = ({ plot, t0Plot, record, setRecord, withdrawnSpeciesPlot }: PlotT0EditBoxProps) => {
  const theme = useTheme();
  const [t0Origin, setT0Origin] = useState<string>('useObservation');

  const { species } = useSpeciesData();

  const [selectedWithdrawalCheckboxes, setSelectedWithdrawalCheckboxes] = useState<Set<number>>(new Set());

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
    if (t0Plot && !t0Plot.observationId) {
      setT0Origin('manual');
    }
  }, [t0Plot]);

  const plotToSave = useMemo(() => {
    const existingPlot = record.plots.find((rPlot) => rPlot.monitoringPlotId.toString() === plot.id.toString());
    if (existingPlot) {
      return existingPlot;
    }
    return {
      monitoringPlotId: plot.id,
      densityData: [],
    };
  }, [plot.id, record]);

  const onChangeT0Origin = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, value: string) => {
      setT0Origin(value);
      if (value === 'manual') {
        if (plotToSave) {
          const plotCopy = { ...plotToSave };
          plotCopy.observationId = undefined;
          // Remove the existing plot, then add the updated one
          const otherPlots = record.plots.filter((p) => p.monitoringPlotId.toString() !== plot.id.toString());
          setRecord({ ...record, plots: otherPlots ? [...otherPlots, plotCopy] : [plotCopy] });
        }
      }
    },
    [plot.id, plotToSave, record, setRecord]
  );

  const onChangeObservation = useCallback(
    (newValue: PlotT0Observation) => {
      if (plotToSave) {
        const plotCopy = { ...plotToSave };
        plotCopy.observationId = Number(newValue.observation_id);
        plotCopy.densityData = [];
        // Remove the existing plot, then add the updated one
        const otherPlots = record.plots.filter((p) => p.monitoringPlotId.toString() !== plot.id.toString());
        setRecord({ ...record, plots: otherPlots ? [...otherPlots, plotCopy] : [plotCopy] });
      }
    },
    [plot.id, plotToSave, record, setRecord]
  );

  const plotTotalDensity = useMemo(() => {
    const selectedPlot = record.plots.find((pl) => pl.monitoringPlotId === plot.id);
    const total = selectedPlot?.densityData.reduce((sum, density) => sum + density.plotDensity, 0);
    return total;
  }, [plot.id, record]);

  const onChangeDensity = useCallback(
    (id: string, value: unknown) => {
      if (plotToSave) {
        const densityDataToUpdate = plotToSave.densityData.find(
          (densityData) => densityData.speciesId.toString() === id
        );
        let plotCopy: PlotT0Data;

        if (densityDataToUpdate?.plotDensity !== undefined) {
          const densityDataToUpdateCopy = { ...densityDataToUpdate, plotDensity: Number(value) };

          // Udated plot with modified densityData array
          plotCopy = {
            ...plotToSave,
            densityData: plotToSave.densityData.map((densityData) =>
              densityData.speciesId.toString() === id ? densityDataToUpdateCopy : densityData
            ),
          };
        } else {
          plotCopy = {
            ...plotToSave,
            densityData: [...plotToSave.densityData, { plotDensity: Number(value), speciesId: Number(id) }],
          };
        }

        // Remove the existing plot, then add the updated one
        const otherPlots = record.plots.filter((p) => p.monitoringPlotId.toString() !== plot.id.toString());
        setRecord({ ...record, plots: otherPlots ? [...otherPlots, plotCopy] : [plotCopy] });
      }
    },
    [plot.id, plotToSave, record, setRecord]
  );

  const onWithdrawalValueSelected = useCallback(
    (speciesId: number) => (value: boolean) => {
      const newSelected = new Set(selectedWithdrawalCheckboxes);

      if (value) {
        newSelected.add(speciesId);
        const withdrawnValue = withdrawnSpeciesPlot?.species.find(
          (iWithdrawnSpeciesPlot) => iWithdrawnSpeciesPlot.speciesId.toString() === speciesId.toString()
        )?.density;
        onChangeDensity(speciesId.toString(), withdrawnValue);
      } else {
        newSelected.delete(speciesId);
        onChangeDensity(speciesId.toString(), 0);
      }

      setSelectedWithdrawalCheckboxes(newSelected);
    },
    [onChangeDensity, withdrawnSpeciesPlot, selectedWithdrawalCheckboxes]
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
                  selectedValue={plot.observationPlots.find(
                    (obsPlot) => obsPlot.observation_id === plotToSave.observationId?.toString()
                  )}
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
              <Box paddingY={'16px'}>
                <Message type='page' priority='info' body={strings.T0_PLANT_DENSITY_WARNING} />
              </Box>
              <Box>
                <table>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left' }}>{strings.SPECIES_FROM_WITHDRAWALS}</th>
                      <th style={{ textAlign: 'left' }}>{strings.PLANT_DENSITY}</th>
                      <th style={{ textAlign: 'left' }}>{strings.CALCULATED_PLANT_DENSITY_FROM_WITHDRAWALS}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawnSpeciesPlot?.species.map((withdrawnSpecies, index) => (
                      <tr key={index}>
                        <td>{species.find((sp) => sp.id === withdrawnSpecies.speciesId)?.scientificName}</td>
                        <td>
                          <TextField
                            type='number'
                            id={`${withdrawnSpecies.speciesId}`}
                            value={
                              plotToSave?.densityData.find(
                                (densityData) => densityData.speciesId === withdrawnSpecies.speciesId
                              )?.plotDensity
                            }
                            onChange={onChangeDensity}
                            label={''}
                          />
                        </td>
                        <td>
                          <Checkbox
                            id={`density-${withdrawnSpecies.speciesId}`}
                            label={withdrawnSpecies.density}
                            name={`density-${withdrawnSpecies.speciesId}`}
                            value={selectedWithdrawalCheckboxes.has(withdrawnSpecies.speciesId)}
                            onChange={onWithdrawalValueSelected(withdrawnSpecies.speciesId)}
                          />
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td>
                        <Typography fontWeight={600}>{strings.ALL_SPECIES}</Typography>
                      </td>
                      <td>
                        <Typography fontWeight={600}>{plotTotalDensity}</Typography>
                      </td>
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
