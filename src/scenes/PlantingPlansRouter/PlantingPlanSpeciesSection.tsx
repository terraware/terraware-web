import React, { type JSX, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Button, Dropdown, DropdownItem, Icon } from '@terraware/web-components';

import TextField from 'src/components/common/Textfield/Textfield';
import { useOrganizationSpecies } from 'src/hooks/useOrganizationSpecies';
import strings from 'src/strings';

import PlantingPlanPlantsChip from './PlantingPlanPlantsChip';

export type SpeciesTarget = {
  speciesId: number;
  target: string;
};

export type PlantingPlanSpeciesSectionProps = {
  speciesTargets: SpeciesTarget[];
  onAdd: (speciesId: number, target: string) => void;
  onUpdate: (speciesId: number, target: string) => void;
  onRemove: (speciesId: number) => void;
};

const parseTarget = (value: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

const PlantingPlanSpeciesSection = ({
  speciesTargets,
  onAdd,
  onUpdate,
  onRemove,
}: PlantingPlanSpeciesSectionProps): JSX.Element => {
  const theme = useTheme();
  const { species, findSpeciesById } = useOrganizationSpecies();

  const [selectedSpeciesId, setSelectedSpeciesId] = useState<number | undefined>();
  const [targetInput, setTargetInput] = useState<string>('');

  const usedSpeciesIds = useMemo(() => new Set(speciesTargets.map((entry) => entry.speciesId)), [speciesTargets]);

  const availableOptions = useMemo<DropdownItem[]>(
    () =>
      species
        .filter((entry) => !usedSpeciesIds.has(entry.id))
        .map((entry) => ({ label: entry.scientificName ?? `#${entry.id}`, value: entry.id }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [species, usedSpeciesIds]
  );

  const totalPlants = useMemo(
    () => speciesTargets.reduce((sum, entry) => sum + parseTarget(entry.target), 0),
    [speciesTargets]
  );

  const onAddClick = () => {
    if (selectedSpeciesId === undefined) {
      return;
    }
    onAdd(selectedSpeciesId, targetInput.trim());
    setSelectedSpeciesId(undefined);
    setTargetInput('');
  };

  return (
    <Box flex={1} minWidth={0}>
      <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary} marginBottom={theme.spacing(2)}>
        {strings.SELECT_SPECIES_TO_PLANT_DESCRIPTION}
      </Typography>
      <Box display='flex' alignItems='center' gap={theme.spacing(1)} marginBottom={theme.spacing(2)}>
        <Icon name='iconMyLocation' size='medium' fillColor={theme.palette.TwClrIcnSecondary} />
        <Typography fontSize='16px' fontWeight={600} color={theme.palette.TwClrBaseBlack} flex={1}>
          {strings.SPECIES}
        </Typography>
        <PlantingPlanPlantsChip plants={totalPlants} />
      </Box>

      <Box
        display='flex'
        flexDirection='column'
        gap={theme.spacing(1)}
        sx={{
          border: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
          padding: theme.spacing(2),
        }}
      >
        {speciesTargets.map((entry) => (
          <Box key={entry.speciesId} display='flex' alignItems='center' gap={theme.spacing(1)}>
            <Typography fontSize='16px' color={theme.palette.TwClrBaseBlack} flex={1} minWidth={0}>
              {findSpeciesById(entry.speciesId)?.scientificName ?? `#${entry.speciesId}`}
            </Typography>
            <Box width='100px'>
              <TextField
                id={`species-target-${entry.speciesId}`}
                type='number'
                label=''
                value={entry.target}
                onChange={(next) => onUpdate(entry.speciesId, String(next ?? ''))}
                min={0}
              />
            </Box>
            <Button
              icon='iconTrashCan'
              onClick={() => onRemove(entry.speciesId)}
              priority='ghost'
              size='small'
              type='passive'
            />
          </Box>
        ))}

        <Box display='flex' alignItems='center' gap={theme.spacing(1)}>
          <Box flex={1} minWidth={0}>
            <Dropdown
              id='add-species'
              placeholder={strings.SPECIES}
              options={availableOptions}
              selectedValue={selectedSpeciesId}
              onChange={(value) =>
                setSelectedSpeciesId(value === undefined || value === '' ? undefined : Number(value))
              }
              fullWidth
              autocomplete
              hideClearIcon
            />
          </Box>
          <Box width='100px'>
            <TextField
              id='add-species-target'
              type='number'
              label=''
              placeholder={strings.TARGET}
              value={targetInput}
              onChange={(next) => setTargetInput(String(next ?? ''))}
              min={0}
            />
          </Box>
          <Button
            icon='iconAdd'
            onClick={onAddClick}
            priority='ghost'
            size='small'
            type='productive'
            disabled={selectedSpeciesId === undefined}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default PlantingPlanSpeciesSection;
