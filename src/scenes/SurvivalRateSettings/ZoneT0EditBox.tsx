import React, { useCallback, useMemo, useState } from 'react';

import { Box, Divider, IconButton, Typography, useTheme } from '@mui/material';
import { Button, Icon, IconTooltip, SelectT } from '@terraware/web-components';

import TextField from 'src/components/common/TextField';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import { SpeciesPlot } from 'src/redux/features/nurseryWithdrawals/nurseryWithdrawalsThunks';
import { PlotsWithObservationsSearchResult } from 'src/redux/features/tracking/trackingThunks';
import strings from 'src/strings';
import { Species } from 'src/types/Species';
import { PlotT0Data } from 'src/types/Tracking';

import { AddedSpecies } from './PlotT0EditBox';

type ZoneT0EditBoxProps = {
  plotsWithObservations: PlotsWithObservationsSearchResult[];
  withdrawnSpeciesPlot?: SpeciesPlot[];
  t0Plots?: PlotT0Data[];
};
const ZoneT0EditBox = ({ plotsWithObservations, withdrawnSpeciesPlot, t0Plots }: ZoneT0EditBoxProps) => {
  const theme = useTheme();
  const { species } = useSpeciesData();

  const onAddNewSpecies = useCallback(() => {
    const newRowId = `new-species-${crypto.randomUUID()}`;
    setNewSpeciesRows((prev) => [...prev, { id: newRowId, density: '' }]);
  }, []);

  const allWithdrawnSpecies = React.useMemo(() => {
    if (!withdrawnSpeciesPlot) {
      return [];
    }
    const speciesMap = new Map<number, { density: number; speciesId: number }>();
    withdrawnSpeciesPlot.forEach((plot) => {
      plot.species.forEach((wdSpecies) => {
        if (!speciesMap.has(wdSpecies.speciesId)) {
          speciesMap.set(wdSpecies.speciesId, wdSpecies);
        }
      });
    });
    return Array.from(speciesMap.values());
  }, [withdrawnSpeciesPlot]);

  const initialNewSpecies = useMemo(() => {
    const withdrawnSpeciesIds = allWithdrawnSpecies?.map((ws) => ws.speciesId) || [];
    const speciesToShow: AddedSpecies[] = [];

    t0Plots?.forEach((t0Plot) => {
      t0Plot.densityData.forEach((dd) => {
        if (!withdrawnSpeciesIds.includes(dd.speciesId)) {
          const newRowId = `new-species-${crypto.randomUUID()}`;
          speciesToShow.push({ id: newRowId, speciesId: dd.speciesId, density: dd.plotDensity.toString() });
        }
      });
    });

    return speciesToShow;
  }, [allWithdrawnSpecies, t0Plots]);

  const [newSpeciesRows, setNewSpeciesRows] = useState<AddedSpecies[]>(initialNewSpecies);

  const availableSpecies = useMemo(() => {
    const withdrawnSpeciesIds = allWithdrawnSpecies?.map((ws) => ws.speciesId) || [];
    const existingNewSpeciesIds = newSpeciesRows.map((row) => row.speciesId).filter((id) => id !== undefined);
    return species.filter((s) => !withdrawnSpeciesIds.includes(s.id) && !existingNewSpeciesIds.includes(s.id));
  }, [allWithdrawnSpecies, newSpeciesRows, species]);

  const plotTotalDensity = useMemo(() => {
    return '';
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onChangeDensity = useCallback((id: string, value: unknown) => {
    return true;
  }, []);

  const onNewSpeciesChange = useCallback((rowId: string, speciesId: number) => {
    setNewSpeciesRows((prev) => prev.map((row) => (row.id === rowId ? { ...row, speciesId } : row)));
  }, []);

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

  return (
    <>
      <Box display='flex' paddingY={theme.spacing(2)} gap={theme.spacing(2)}>
        <Box
          minHeight='100px'
          minWidth='80px'
          sx={{ background: theme.palette.TwClrBaseGray050, justifyContent: 'center' }}
          display='flex'
          alignItems='center'
          flexDirection={'column'}
        >
          <Typography fontWeight={600}>{strings.ZONE}</Typography>
          <Typography>{plotsWithObservations?.[0].plantingSubzone_plantingZone_name}</Typography>
        </Box>
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
              {allWithdrawnSpecies.map((withdrawnSpecies, index) => (
                <tr key={index}>
                  <td>{species.find((sp) => sp.id === withdrawnSpecies.speciesId)?.scientificName}</td>
                  <td>
                    <TextField
                      type='number'
                      id={`${withdrawnSpecies.speciesId}`}
                      value={0}
                      onChange={onChangeDensity}
                      label={''}
                      min={0}
                      sx={{ width: '85px' }}
                    />
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
                          optionsContainer: { width: '450px', 'max-width': '100%' },
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
                        value={row.density}
                        onChange={handleNewSpeciesDensityChange(row.id)}
                        label={''}
                        min={0}
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
      </Box>
      <Divider />
    </>
  );
};

export default ZoneT0EditBox;
