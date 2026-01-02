import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Divider, FormControlLabel, IconButton, Radio, RadioGroup, Typography, useTheme } from '@mui/material';
import { Button, Checkbox, Icon, IconTooltip, Message, SelectT } from '@terraware/web-components';
import { getDateDisplayValue, useDeviceInfo } from '@terraware/web-components/utils';

import TextField from 'src/components/common/TextField';
import usePlantingSite from 'src/hooks/usePlantingSite';
import { useLocalization } from 'src/providers';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import { PlotT0Observation, PlotsWithObservationsSearchResult } from 'src/redux/features/tracking/trackingThunks';
import strings from 'src/strings';
import { Species } from 'src/types/Species';
import { AssignSiteT0Data, PlotT0Data, SpeciesPlot } from 'src/types/Tracking';
import { getShortDate } from 'src/utils/dateFormatter';
import { allowOneDecimal, roundToDecimal } from 'src/utils/numbers';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

export type AddedSpecies = { id: string; speciesId?: number; density: string };

type PlotT0EditBoxProps = {
  plot: PlotsWithObservationsSearchResult;
  plantingSiteId: number;
  t0Plot?: PlotT0Data;
  record: AssignSiteT0Data;
  setRecord: React.Dispatch<React.SetStateAction<AssignSiteT0Data>>;
  withdrawnSpeciesPlot?: SpeciesPlot;
};

const PlotT0EditBox = ({
  plantingSiteId,
  plot,
  t0Plot,
  record,
  setRecord,
  withdrawnSpeciesPlot,
}: PlotT0EditBoxProps) => {
  const theme = useTheme();
  const [t0Origin, setT0Origin] = useState<string>('useObservation');

  const { species } = useSpeciesData();
  const locale = useLocalization().activeLocale;
  const { isMobile } = useDeviceInfo();
  const { plantingSite } = usePlantingSite(plantingSiteId);
  const defaultTimeZone = useDefaultTimeZone().get();

  const [selectedWithdrawalCheckboxes, setSelectedWithdrawalCheckboxes] = useState<Set<number>>(new Set());

  const initialNewSpecies = useMemo(() => {
    const withdrawnSpeciesIds = withdrawnSpeciesPlot?.species.map((ws) => ws.speciesId) || [];
    const speciesToShow: AddedSpecies[] = [];

    t0Plot?.densityData.forEach((dd) => {
      if (!withdrawnSpeciesIds.includes(dd.speciesId)) {
        const newRowId = `new-species-${crypto.randomUUID()}`;
        speciesToShow.push({ id: newRowId, speciesId: dd.speciesId, density: dd.plotDensity.toString() });
      }
    });

    return speciesToShow;
  }, [t0Plot, withdrawnSpeciesPlot]);

  const [newSpeciesRows, setNewSpeciesRows] = useState<AddedSpecies[]>(initialNewSpecies);

  const isEqualObservation = useCallback(
    (a: PlotT0Observation, b: PlotT0Observation) => a.observation_id === b.observation_id,
    []
  );

  const renderOptionObservation = useCallback(
    (option: PlotT0Observation) => {
      if (option) {
        const timeZone = plantingSite?.timeZone ?? defaultTimeZone.id;
        const completedDate = getDateDisplayValue(option.observation_completedTime, timeZone);
        return option?.observation_startDate
          ? `${getShortDate(option.observation_startDate, locale)} ${strings.COMPLETED_ON} ${completedDate}`
          : '';
      }
      return '';
    },
    [defaultTimeZone.id, locale, plantingSite?.timeZone]
  );

  const displayLabelObservation = useCallback(
    (option: PlotT0Observation) => {
      if (option) {
        const timeZone = plantingSite?.timeZone ?? defaultTimeZone.id;
        const completedDate = getDateDisplayValue(option.observation_completedTime, timeZone);
        return option?.observation_startDate
          ? `${getShortDate(option.observation_startDate, locale)} ${strings.COMPLETED_ON} ${completedDate}`
          : '';
      }
      return '';
    },
    [defaultTimeZone.id, locale, plantingSite?.timeZone]
  );

  const toTObservation = useCallback(
    (startDate: string) => ({ observation_startDate: startDate }) as PlotT0Observation,
    []
  );

  useEffect(() => {
    setNewSpeciesRows(initialNewSpecies);
  }, [initialNewSpecies]);

  useEffect(() => {
    if (t0Plot && !t0Plot.observationId) {
      setT0Origin('manual');
    }
  }, [t0Plot, withdrawnSpeciesPlot?.species]);

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
    const selectedPlot = record.plots.find((pl) => pl.monitoringPlotId.toString() === plot.id.toString());
    const total = selectedPlot?.densityData.reduce((sum, density) => {
      return isNaN(density.plotDensity) ? sum : sum + density.plotDensity;
    }, 0);
    if (total) {
      return roundToDecimal(total, 1);
    }
    return total;
  }, [plot.id, record]);

  const onChangeDensity = useCallback(
    (id: string, value: unknown) => {
      if (plotToSave) {
        const densityDataToUpdate = plotToSave.densityData.find(
          (densityData) => densityData.speciesId.toString() === id
        );
        let plotCopy: PlotT0Data;

        if (value !== undefined) {
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
              densityData: [
                ...plotToSave.densityData,
                { density: Number(value), plotDensity: Number(value), speciesId: Number(id) },
              ],
            };
          }
        } else {
          // if new density is null, remove the species in that plot
          const densityDataCopy = plotToSave.densityData.filter((dd) => dd.speciesId.toString() !== id.toString());
          plotCopy = {
            ...plotToSave,
            densityData: densityDataCopy,
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

  const availableSpecies = useMemo(() => {
    const withdrawnSpeciesIds = withdrawnSpeciesPlot?.species.map((ws) => ws.speciesId) || [];
    const existingNewSpeciesIds = newSpeciesRows.map((row) => row.speciesId).filter((id) => id !== undefined);
    return species.filter((s) => !withdrawnSpeciesIds.includes(s.id) && !existingNewSpeciesIds.includes(s.id));
  }, [species, withdrawnSpeciesPlot, newSpeciesRows]);

  const onAddNewSpecies = useCallback(() => {
    const newRowId = `new-species-${crypto.randomUUID()}`;
    setNewSpeciesRows((prev) => [...prev, { id: newRowId, density: '' }]);
  }, []);

  const onNewSpeciesChange = useCallback(
    (rowId: string, speciesId: number) => {
      setNewSpeciesRows((prev) => prev.map((iRow) => (iRow.id === rowId ? { ...iRow, speciesId } : iRow)));
      // If density was already entered before selecting species, save it to the record
      const row = newSpeciesRows.find((r) => r.id === rowId);
      if (row?.density) {
        onChangeDensity(speciesId.toString(), row.density);
      }
    },
    [newSpeciesRows, onChangeDensity]
  );

  const onNewSpeciesDensityChange = useCallback(
    (rowId: string, density: string) => {
      setNewSpeciesRows((prev) => prev.map((prevRow) => (prevRow.id === rowId ? { ...prevRow, density } : prevRow)));

      const row = newSpeciesRows.find((r) => r.id === rowId);
      if (row?.speciesId) {
        onChangeDensity(row.speciesId.toString(), density);
      }
    },
    [newSpeciesRows, onChangeDensity]
  );

  const handleNewSpeciesDensityChange = useCallback(
    (rowId: string) => (id: string, value: unknown) => {
      return onNewSpeciesDensityChange(rowId, value as string);
    },
    [onNewSpeciesDensityChange]
  );

  const handleSpeciesChange = useCallback(
    (rowId: string) => (selectedSpecies: Species) => {
      onNewSpeciesChange(rowId, selectedSpecies.id);
    },
    [onNewSpeciesChange]
  );

  const isEqualSpecies = useCallback(
    (a: { id: number; scientificName: string }, b: { id: number; scientificName: string }) => a.id === b.id,
    []
  );

  const renderOptionSpecies = useCallback((option: Species) => {
    return option?.scientificName;
  }, []);

  const toTSpecies = useCallback((scientificName: string) => ({ scientificName }) as Species, []);

  const onDeleteInput = useCallback(
    (rowId: string) => {
      setNewSpeciesRows((prev) => prev.filter((r) => r.id !== rowId));

      const row = newSpeciesRows.find((r) => r.id === rowId);
      if (row?.speciesId) {
        onChangeDensity(row.speciesId.toString(), undefined);
      }
    },
    [newSpeciesRows, onChangeDensity]
  );

  const onDeleteInputHandler = useCallback(
    (rowId: string) => () => {
      onDeleteInput(rowId);
    },
    [onDeleteInput]
  );

  const speciesSelectedValueHandler = useCallback(
    (row: AddedSpecies) => {
      return species.find((s) => s.id.toString() === row.speciesId?.toString());
    },
    [species]
  );

  const densityValue = useCallback(
    (withdrawnSpecies: { density?: number; speciesId: number }) => {
      const found = plotToSave?.densityData.find((densityData) => densityData.speciesId === withdrawnSpecies.speciesId);
      if (found) {
        return roundToDecimal(found.plotDensity, 1);
      }
    },
    [plotToSave?.densityData]
  );

  return (
    <>
      <Box
        display='flex'
        flexDirection={isMobile ? 'column' : 'row'}
        paddingY={theme.spacing(2)}
        gap={theme.spacing(2)}
      >
        {isMobile && (
          <Box
            sx={{ background: theme.palette.TwClrBgSecondary }}
            display='flex'
            flexDirection='column'
            padding={1}
            height='fit-content'
          >
            <Box display='flex' paddingRight={3}>
              <Typography fontWeight={600} paddingRight={0.5}>
                {strings.STRATUM}
              </Typography>
              <Typography>{plot.substratum_stratum_name}</Typography>
            </Box>
            <Box display='flex'>
              <Typography fontWeight={600} paddingRight={0.5}>
                {strings.SUBSTRATUM}
              </Typography>
              <Typography>{plot.substratum_name}</Typography>
            </Box>
          </Box>
        )}
        <Box
          minHeight='100px'
          minWidth='80px'
          sx={{ background: theme.palette.TwClrBaseGray050, justifyContent: 'center' }}
          display='flex'
          alignItems='center'
        >
          <Typography>{plot.name}</Typography>
        </Box>
        <Box display='flex' flexGrow={1} alignItems='start' flexDirection={'column'}>
          <Box display='flex' flexGrow={1} alignItems={'start'} width={'100%'}>
            <Box flexGrow={1} display={'flex'} alignItems={'center'}>
              <RadioGroup name='radio-buttons-t0' onChange={onChangeT0Origin} value={t0Origin}>
                <Box display='flex' flexDirection={isMobile ? 'column' : 'row'}>
                  <Box display='flex' paddingRight={2} sx={{ alignItems: 'center' }}>
                    <FormControlLabel
                      control={<Radio />}
                      disabled={(plot.observationPlots.length || 0) < 1}
                      label={strings.USE_OBSERVATION_DATA}
                      value={'useObservation'}
                      sx={{ marginRight: '8px' }}
                    />
                    <IconTooltip title={strings.USE_OBSERVATION_DATA_TOOLTIP} />
                  </Box>
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
                    sx={{ width: '375px' }}
                  />
                </Box>
                <Box display='flex' sx={{ alignItems: 'center' }}>
                  <FormControlLabel
                    control={<Radio />}
                    label={strings.PROVIDE_PLANT_DENSITY_PER_SPECIES}
                    value={'manual'}
                    sx={{ marginRight: '8px' }}
                  />
                  <IconTooltip title={strings.PROVIDE_PLANT_DENSITY_PER_SPECIES_TOOLTIP} />
                </Box>
              </RadioGroup>
            </Box>
            {!isMobile && (
              <Box sx={{ background: theme.palette.TwClrBgSecondary }} display='flex' padding={1} height='fit-content'>
                <Box display='flex' paddingRight={3}>
                  <Typography fontWeight={600} paddingRight={0.5}>
                    {strings.STRATUM}
                  </Typography>
                  <Typography>{plot.substratum_stratum_name}</Typography>
                </Box>
                <Box display='flex'>
                  <Typography fontWeight={600} paddingRight={0.5}>
                    {strings.SUBSTRATUM}
                  </Typography>
                  <Typography>{plot.substratum_name}</Typography>
                </Box>
              </Box>
            )}
          </Box>
          {t0Origin === 'manual' && (
            <Box paddingY={'16px'}>
              <Message type='page' priority='info' body={strings.T0_PLANT_DENSITY_WARNING} />
            </Box>
          )}
          {t0Origin === 'manual' && (
            <Box width={'100%'}>
              <table>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', width: '40%' }}>
                      <Box display='flex'>
                        {strings.SPECIES_FROM_WITHDRAWALS}
                        <IconTooltip title={strings.SPECIES_FROM_WITHDRAWALS_TOOLTIP} />
                      </Box>
                    </th>
                    <th style={{ textAlign: 'left', width: '10%' }}>
                      <Box display={'flex'}>
                        {strings.PLANT_DENSITY} <IconTooltip title={strings.PLANT_DENSITY_TITLE_TOOLTIP} />
                      </Box>
                      <Typography fontSize={'14px'} fontWeight={600}>
                        ({strings.PLANTS_PER_HA_LC})
                      </Typography>
                    </th>
                    <th style={{ textAlign: 'left', width: '20%' }}>
                      <Box display={'flex'}>
                        {strings.CALCULATED_PLANT_DENSITY_FROM_WITHDRAWALS}
                        <IconTooltip title={strings.CALCULATED_PLANT_DENSITY_FROM_WITHDRAWALS_TOOLTIP} />
                      </Box>
                      <Typography fontSize={'14px'} fontWeight={600}>
                        ({strings.PLANTS_PER_HA_LC})
                      </Typography>
                    </th>
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
                          value={densityValue(withdrawnSpecies)}
                          onChange={onChangeDensity}
                          label={''}
                          min={0}
                          onKeyDown={allowOneDecimal}
                          sx={{ width: '85px' }}
                        />
                      </td>
                      <td>
                        {withdrawnSpecies.density && (
                          <Checkbox
                            id={`density-${withdrawnSpecies.speciesId}`}
                            label={roundToDecimal(withdrawnSpecies.density, 1)}
                            name={`density-${withdrawnSpecies.speciesId}`}
                            value={selectedWithdrawalCheckboxes.has(withdrawnSpecies.speciesId)}
                            onChange={onWithdrawalValueSelected(withdrawnSpecies.speciesId)}
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                  {newSpeciesRows.length > 0 && (
                    <tr>
                      <td colSpan={3}>
                        <Box display='flex'>
                          <Typography fontWeight={600}>{strings.ADDED_SPECIES}</Typography>
                          <IconTooltip title={strings.ADDED_SPECIES_TOOLTIP} />
                        </Box>
                      </td>
                    </tr>
                  )}
                  {newSpeciesRows.map((row) => {
                    return (
                      <tr key={row.id}>
                        <td>
                          <SelectT<Species>
                            options={availableSpecies}
                            placeholder={strings.SELECT}
                            onChange={handleSpeciesChange(row.id)}
                            isEqual={isEqualSpecies}
                            renderOption={renderOptionSpecies}
                            displayLabel={renderOptionSpecies}
                            selectedValue={speciesSelectedValueHandler(row)}
                            toT={toTSpecies}
                            selectStyles={{
                              inputContainer: { width: '450px', 'max-width': '100%' },
                              optionsContainer: { width: '450px', 'max-width': '100%', maxHeight: '175px' },
                            }}
                            sx={{
                              '.textfield-container': {
                                width: '450px !important',
                                'max-width': '100%',
                              },
                            }}
                          />
                        </td>
                        <td>
                          <TextField
                            type='number'
                            id={`new-${row.id}`}
                            value={row.density ? roundToDecimal(Number(row.density), 1) : row.density}
                            onChange={handleNewSpeciesDensityChange(row.id)}
                            label={''}
                            min={0}
                            onKeyDown={allowOneDecimal}
                            sx={{ width: '85px' }}
                          />
                        </td>
                        <td>
                          <IconButton
                            id={`delete-input-${row.id}`}
                            aria-label='delete'
                            size='small'
                            onClick={onDeleteInputHandler(row.id)}
                            sx={{ cursor: 'pointer' }}
                          >
                            <Icon name='iconSubtract' size='medium' fillColor={theme.palette.TwClrIcn} />
                          </IconButton>
                        </td>
                      </tr>
                    );
                  })}
                  <tr>
                    <td>
                      {availableSpecies.length > 0 && (
                        <Button
                          label={strings.ADD_SPECIES}
                          type='productive'
                          priority='ghost'
                          onClick={onAddNewSpecies}
                          icon='iconAdd'
                          style={{ paddingLeft: 0, marginLeft: 0 }}
                        />
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Box display={'flex'}>
                        <Typography fontWeight={600}>{strings.ALL_SPECIES}</Typography>
                        <IconTooltip title={strings.TOTAL_DENSITY_TOOLTIP} />
                      </Box>
                    </td>
                    <td>
                      <Typography fontWeight={600}>{plotTotalDensity}</Typography>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Box>
          )}
        </Box>
      </Box>
      <Divider />
    </>
  );
};

export default PlotT0EditBox;
