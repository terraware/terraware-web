import React, { useCallback, useMemo, useState } from 'react';

import { Box, Divider, IconButton, Typography, useTheme } from '@mui/material';
import { Button, Checkbox, Icon, IconTooltip, SelectT } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import TextField from 'src/components/common/TextField';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import { PlotsWithObservationsSearchResult } from 'src/redux/features/tracking/trackingThunks';
import strings from 'src/strings';
import { Species } from 'src/types/Species';
import { AssignSiteT0TempData, SpeciesPlot, StratumT0Data } from 'src/types/Tracking';
import { allowOneDecimal, roundToDecimal } from 'src/utils/numbers';

import { AddedSpecies } from './PlotT0EditBox';

type StratumT0EditBoxProps = {
  plotsWithObservations: PlotsWithObservationsSearchResult[];
  withdrawnSpeciesPlot?: SpeciesPlot[];
  zoneData?: StratumT0Data;
  record: AssignSiteT0TempData;
  setRecord: React.Dispatch<React.SetStateAction<AssignSiteT0TempData>>;
};
const StratumT0EditBox = ({
  plotsWithObservations,
  withdrawnSpeciesPlot,
  zoneData,
  record,
  setRecord,
}: StratumT0EditBoxProps) => {
  const theme = useTheme();
  const { species } = useSpeciesData();
  const { isMobile } = useDeviceInfo();

  const onAddNewSpecies = useCallback(() => {
    const newRowId = `new-species-${crypto.randomUUID()}`;
    setNewSpeciesRows((prev) => [...prev, { id: newRowId, density: '' }]);
  }, []);

  const [selectedWithdrawalCheckboxes, setSelectedWithdrawalCheckboxes] = useState<Set<number>>(new Set());

  const allWithdrawnSpecies = React.useMemo(() => {
    if (!withdrawnSpeciesPlot) {
      return [];
    }
    const speciesMap = new Map<number, { density?: number; speciesId: number }>();
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

    zoneData?.densityData.forEach((dd) => {
      if (!withdrawnSpeciesIds.includes(dd.speciesId)) {
        const newRowId = `new-species-${crypto.randomUUID()}`;
        speciesToShow.push({ id: newRowId, speciesId: dd.speciesId, density: dd.plotDensity.toString() });
      }
    });

    return speciesToShow;
  }, [allWithdrawnSpecies, zoneData]);

  const [newSpeciesRows, setNewSpeciesRows] = useState<AddedSpecies[]>(initialNewSpecies);

  const availableSpecies = useMemo(() => {
    const withdrawnSpeciesIds = allWithdrawnSpecies?.map((ws) => ws.speciesId) || [];
    const existingNewSpeciesIds = newSpeciesRows.map((row) => row.speciesId).filter((id) => id !== undefined);
    return species.filter((s) => !withdrawnSpeciesIds.includes(s.id) && !existingNewSpeciesIds.includes(s.id));
  }, [allWithdrawnSpecies, newSpeciesRows, species]);

  const zoneTotalDensity = useMemo(() => {
    const editingZoneId = plotsWithObservations?.length ? plotsWithObservations[0].substratum_stratum_id : null;
    if (editingZoneId) {
      const selectedZone = (record.strata || []).find((z) => z.stratumId.toString() === editingZoneId.toString());
      const total =
        selectedZone?.densityData.reduce((sum, density) => {
          return isNaN(density.density) ? sum : sum + density.density;
        }, 0) || 0;
      return roundToDecimal(total, 1);
    }
    return 0;
  }, [plotsWithObservations, record]);

  const zoneToSave = useMemo(() => {
    if (!plotsWithObservations?.length) {
      return { stratumId: 0, densityData: [] };
    }

    const existingZone = (record.strata || []).find(
      (zone) => plotsWithObservations?.[0].substratum_stratum_id === zone.stratumId.toString()
    );
    if (existingZone) {
      return existingZone;
    }
    return {
      stratumId: Number(plotsWithObservations?.[0].substratum_stratum_id),
      densityData: [],
    };
  }, [plotsWithObservations, record]);

  const onChangeDensity = useCallback(
    (id: string, value: unknown) => {
      if (zoneToSave) {
        const densityDataToUpdate = zoneToSave.densityData.find(
          (densityData) => densityData.speciesId.toString() === id
        );
        let zoneCopy: StratumT0Data;

        if (value !== undefined) {
          if (densityDataToUpdate?.plotDensity !== undefined || densityDataToUpdate?.density !== undefined) {
            const densityDataToUpdateCopy = {
              ...densityDataToUpdate,
              plotDensity: Number(value),
              density: Number(value),
            };

            // Udated plot with modified densityData array
            zoneCopy = {
              ...zoneToSave,
              densityData: zoneToSave.densityData.map((densityData) =>
                densityData.speciesId.toString() === id ? densityDataToUpdateCopy : densityData
              ),
            };
          } else {
            zoneCopy = {
              ...zoneToSave,
              densityData: [
                ...zoneToSave.densityData,
                { density: Number(value), plotDensity: Number(value), speciesId: Number(id) },
              ],
            };
          }
        } else {
          // if new density is null, remove the species in that plot
          const densityDataCopy = zoneToSave.densityData.filter((dd) => dd.speciesId.toString() !== id.toString());
          zoneCopy = {
            ...zoneToSave,
            densityData: densityDataCopy,
          };
        }

        // Remove the existing zone, then add the updated one
        const otherZones = (record.strata || []).filter(
          (z) => z.stratumId.toString() !== plotsWithObservations?.[0].substratum_stratum_id.toString()
        );
        setRecord({ ...record, strata: otherZones ? [...otherZones, zoneCopy] : [zoneCopy] });
      }
    },
    [plotsWithObservations, record, setRecord, zoneToSave]
  );

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

  const onWithdrawalValueSelected = useCallback(
    (speciesId: number) => (value: boolean) => {
      const newSelected = new Set(selectedWithdrawalCheckboxes);

      if (value) {
        newSelected.add(speciesId);
        const withdrawnValue = allWithdrawnSpecies.find(
          (wdSpecies) => wdSpecies.speciesId.toString() === speciesId.toString()
        )?.density;
        onChangeDensity(speciesId.toString(), withdrawnValue);
      } else {
        newSelected.delete(speciesId);
        onChangeDensity(speciesId.toString(), 0);
      }

      setSelectedWithdrawalCheckboxes(newSelected);
    },
    [selectedWithdrawalCheckboxes, allWithdrawnSpecies, onChangeDensity]
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
      const density = zoneToSave?.densityData.find(
        (densityData) => densityData.speciesId === withdrawnSpecies.speciesId
      )?.density;
      if (density !== undefined) {
        return roundToDecimal(density, 1);
      }
    },
    [zoneToSave?.densityData]
  );

  return (
    <>
      <Box
        display='flex'
        flexDirection={isMobile ? 'column' : 'row'}
        paddingY={theme.spacing(2)}
        gap={theme.spacing(2)}
      >
        <Box
          minHeight='100px'
          minWidth='80px'
          sx={{ background: theme.palette.TwClrBaseGray050, justifyContent: 'center' }}
          display='flex'
          alignItems='center'
          flexDirection={'column'}
        >
          <Typography fontWeight={600}>{strings.ZONE}</Typography>
          <Typography>{plotsWithObservations?.[0].substratum_stratum_name}</Typography>
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
                      value={densityValue(withdrawnSpecies)}
                      onChange={onChangeDensity}
                      label={''}
                      min={0}
                      sx={{ width: '85px' }}
                      onKeyDown={allowOneDecimal}
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
                        sx={{ width: '85px' }}
                        onKeyDown={allowOneDecimal}
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
                  <Typography fontWeight={600}>{zoneTotalDensity}</Typography>
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

export default StratumT0EditBox;
