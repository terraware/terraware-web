import React, { type JSX, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Button, Dropdown, DropdownItem, Icon } from '@terraware/web-components';

import Link from 'src/components/common/Link';
import TextField from 'src/components/common/Textfield/Textfield';
import { useOrganizationSpecies } from 'src/hooks/useOrganizationSpecies';
import {
  PlantingSitePayload,
  PlantingSiteSpeciesTargetPayload,
  useDeletePlantingSiteSpeciesTargetMutation,
  useListPlantingSiteSpeciesTargetsQuery,
  useUpdatePlantingSiteSpeciesTargetMutation,
} from 'src/queries/generated/plantingSites';
import strings from 'src/strings';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';
import useSnackbar from 'src/utils/useSnackbar';

import PlantingPlanAssignStrataModal from './PlantingPlanAssignStrataModal';
import PlantingPlanPlantsChip from './PlantingPlanPlantsChip';

const PLACEHOLDER = '-';

export type PlantingPlanSpeciesSectionProps = {
  plantingSite: PlantingSitePayload;
};

const PlantingPlanSpeciesSection = ({ plantingSite }: PlantingPlanSpeciesSectionProps): JSX.Element => {
  const theme = useTheme();
  const numberFormatter = useNumberFormatter();
  const snackbar = useSnackbar();
  const { species, findSpeciesById } = useOrganizationSpecies();
  const { data: speciesTargetsData } = useListPlantingSiteSpeciesTargetsQuery(plantingSite.id);
  const [updateSpeciesTarget] = useUpdatePlantingSiteSpeciesTargetMutation();
  const [deleteSpeciesTarget] = useDeletePlantingSiteSpeciesTargetMutation();

  const [assigningSpeciesId, setAssigningSpeciesId] = useState<number | undefined>();
  const [addingSpecies, setAddingSpecies] = useState(false);

  const targets = useMemo(() => speciesTargetsData?.targets ?? [], [speciesTargetsData]);

  const usedSpeciesIds = useMemo(() => new Set(targets.map((entry) => entry.speciesId)), [targets]);

  const availableOptions = useMemo<DropdownItem[]>(
    () =>
      species
        .filter((entry) => !usedSpeciesIds.has(entry.id))
        .map((entry) => ({ label: entry.scientificName ?? `#${entry.id}`, value: entry.id }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [species, usedSpeciesIds]
  );

  const totalPlants = useMemo(() => targets.reduce((sum, entry) => sum + (entry.targetPlants ?? 0), 0), [targets]);

  const stratumName = (stratumId: number) => (plantingSite.strata ?? []).find((s) => s.id === stratumId)?.name;

  const upsertTarget = async (speciesId: number, stratumIds: number[], targetPlants?: number) => {
    try {
      await updateSpeciesTarget({
        plantingSiteId: plantingSite.id,
        speciesId,
        updatePlantingSiteSpeciesTargetRequestPayload: { stratumIds, targetPlants },
      }).unwrap();
    } catch (e) {
      snackbar.toastError();
    }
  };

  const onDelete = async (speciesId: number) => {
    try {
      await deleteSpeciesTarget({ plantingSiteId: plantingSite.id, speciesId }).unwrap();
    } catch (e) {
      snackbar.toastError();
    }
  };

  const assigningTarget = targets.find((entry) => entry.speciesId === assigningSpeciesId);

  return (
    <Box flex={1} minWidth={0}>
      {assigningSpeciesId !== undefined && (
        <PlantingPlanAssignStrataModal
          plantingSite={plantingSite}
          speciesId={assigningSpeciesId}
          targetPlants={assigningTarget?.targetPlants}
          initialStratumIds={assigningTarget?.stratumIds ?? []}
          onClose={() => setAssigningSpeciesId(undefined)}
        />
      )}

      <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary} marginBottom={theme.spacing(2)}>
        {strings.SELECT_SPECIES_TO_PLANT_DESCRIPTION}
      </Typography>
      <Box display='flex' alignItems='center' gap={theme.spacing(1)} marginBottom={theme.spacing(2)}>
        <Icon name='iconMyLocation' size='medium' fillColor={theme.palette.TwClrIcnSecondary} />
        <Typography fontSize='16px' fontWeight={600} color={theme.palette.TwClrBaseBlack} flex={1}>
          {strings.SPECIES_TO_PLANT}
        </Typography>
        <PlantingPlanPlantsChip plants={totalPlants} />
        <Box
          sx={{
            backgroundColor: theme.palette.TwClrBaseOrange200,
            borderRadius: '16px',
            padding: theme.spacing(0.5, 1.5),
          }}
        >
          <Typography fontSize='14px' fontWeight={500} color={theme.palette.TwClrTxt} whiteSpace='nowrap'>
            {strings.formatString(strings.X_SPECIES, numberFormatter.format(targets.length)).toString()}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ border: `1px solid ${theme.palette.TwClrBrdrTertiary}` }}>
        {targets.map((target) => (
          <SpeciesRow
            key={target.speciesId}
            target={target}
            name={findSpeciesById(target.speciesId)?.scientificName ?? `#${target.speciesId}`}
            commonName={findSpeciesById(target.speciesId)?.commonName}
            stratumName={stratumName}
            onUpdateTarget={(targetPlants) => void upsertTarget(target.speciesId, target.stratumIds, targetPlants)}
            onAssignStrata={() => setAssigningSpeciesId(target.speciesId)}
            onDelete={() => void onDelete(target.speciesId)}
          />
        ))}

        {addingSpecies ? (
          <AddSpeciesRow
            options={availableOptions}
            onCancel={() => setAddingSpecies(false)}
            onAdd={async (speciesId, targetPlants) => {
              await upsertTarget(speciesId, [], targetPlants);
              setAddingSpecies(false);
            }}
          />
        ) : (
          <Box padding={theme.spacing(1.5, 2)}>
            <Button
              icon='iconAdd'
              label={strings.ADD_SPECIES}
              onClick={() => setAddingSpecies(true)}
              priority='ghost'
              type='productive'
              disabled={availableOptions.length === 0}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

type SpeciesRowProps = {
  target: PlantingSiteSpeciesTargetPayload;
  name: string;
  commonName?: string;
  stratumName: (stratumId: number) => string | undefined;
  onUpdateTarget: (targetPlants?: number) => void;
  onAssignStrata: () => void;
  onDelete: () => void;
};

const SpeciesRow = ({
  target,
  name,
  commonName,
  stratumName,
  onUpdateTarget,
  onAssignStrata,
  onDelete,
}: SpeciesRowProps): JSX.Element => {
  const theme = useTheme();
  const numberFormatter = useNumberFormatter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed === '') {
      if (target.targetPlants !== undefined) {
        onUpdateTarget(undefined);
      }
      return;
    }
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || parsed <= 0 || parsed === target.targetPlants) {
      return;
    }
    onUpdateTarget(parsed);
  };

  return (
    <Box
      display='flex'
      alignItems='center'
      gap={theme.spacing(2)}
      sx={{ padding: theme.spacing(1.5, 2), borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}` }}
    >
      <Box flex={1} minWidth={0}>
        <Typography fontSize='16px' fontWeight={600} color={theme.palette.TwClrTxt}>
          {name}
        </Typography>
        {commonName && (
          <Typography fontSize='14px' color={theme.palette.TwClrTxt}>
            {commonName}
          </Typography>
        )}
      </Box>

      <Box display='flex' alignItems='center' gap={theme.spacing(0.5)} width='90px' justifyContent='flex-end'>
        {editing ? (
          <TextField
            id={`species-target-${target.speciesId}`}
            type='number'
            label=''
            value={draft}
            onChange={(next) => setDraft(String(next ?? ''))}
            onBlur={commit}
            onKeyDown={(key: string) => {
              if (key === 'Enter' && document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
              }
            }}
            min={0}
            autoFocus
            sx={{ width: '72px' }}
          />
        ) : (
          <>
            <Typography fontSize='16px' color={theme.palette.TwClrTxt}>
              {target.targetPlants === undefined ? PLACEHOLDER : numberFormatter.format(target.targetPlants)}
            </Typography>
            <Button
              icon='iconEdit'
              onClick={() => {
                setDraft(target.targetPlants === undefined ? '' : String(target.targetPlants));
                setEditing(true);
              }}
              priority='ghost'
              size='small'
              type='passive'
            />
          </>
        )}
      </Box>

      <Box width='180px' textAlign='right'>
        {target.stratumIds.length === 0 ? (
          <Link onClick={onAssignStrata}>{strings.ASSIGN_STRATA}</Link>
        ) : (
          <Box display='flex' flexDirection='column' alignItems='flex-end'>
            {target.stratumIds.map((stratumId) => (
              <Link key={stratumId} onClick={onAssignStrata} style={{ fontWeight: 400, textDecoration: 'underline' }}>
                {stratumName(stratumId) ?? `#${stratumId}`}
              </Link>
            ))}
          </Box>
        )}
      </Box>

      <Button icon='iconTrashCan' onClick={onDelete} priority='ghost' size='small' type='passive' />
    </Box>
  );
};

type AddSpeciesRowProps = {
  options: DropdownItem[];
  onCancel: () => void;
  onAdd: (speciesId: number, targetPlants?: number) => Promise<void>;
};

const AddSpeciesRow = ({ options, onCancel, onAdd }: AddSpeciesRowProps): JSX.Element => {
  const theme = useTheme();
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<number | undefined>();
  const [targetInput, setTargetInput] = useState('');

  const onConfirm = () => {
    if (selectedSpeciesId === undefined) {
      return;
    }
    const trimmed = targetInput.trim();
    const parsed = Number(trimmed);
    const targetPlants = trimmed !== '' && Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
    void onAdd(selectedSpeciesId, targetPlants);
  };

  return (
    <Box
      display='flex'
      alignItems='center'
      gap={theme.spacing(1)}
      sx={{ padding: theme.spacing(1.5, 2), borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}` }}
    >
      <Box flex={1} minWidth={0}>
        <Dropdown
          id='add-species'
          placeholder={strings.SPECIES}
          options={options}
          selectedValue={selectedSpeciesId}
          onChange={(value) => setSelectedSpeciesId(value === undefined || value === '' ? undefined : Number(value))}
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
        onClick={onConfirm}
        priority='ghost'
        size='medium'
        type='productive'
        disabled={selectedSpeciesId === undefined}
      />
      <Button icon='close' onClick={onCancel} priority='ghost' size='small' type='passive' />
    </Box>
  );
};

export default PlantingPlanSpeciesSection;
