import React, { type JSX, useMemo, useRef, useState } from 'react';

import { Box, IconButton, Typography, useTheme } from '@mui/material';
import { Button, Dropdown, DropdownItem, Icon } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Card from 'src/components/common/Card';
import TextField from 'src/components/common/Textfield/Textfield';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import {
  PlantingSeasonPayload,
  SpeciesTargetPayload,
  useDeleteSpeciesTargetMutation,
  useGetSpeciesTargetsQuery,
  useUpsertSpeciesTargetMutation,
} from 'src/queries/generated/plantingSeasons';
import {
  PlantingSitePayload,
  StratumResponsePayload,
  SubstratumResponsePayload,
} from 'src/queries/generated/plantingSites';
import strings from 'src/strings';
import { Species } from 'src/types/Species';
import useSnackbar from 'src/utils/useSnackbar';

import DeleteSpeciesGoalModal from './DeleteSpeciesGoalModal';

type SpeciesTargetsTabProps = {
  plantingSeason: PlantingSeasonPayload;
  plantingSite: PlantingSitePayload;
};

const compareSpeciesScientificNames = (
  speciesById: Map<number, Species>,
  firstSpeciesId: number,
  secondSpeciesId: number
): number => {
  const firstName = speciesById.get(firstSpeciesId)?.scientificName ?? `#${firstSpeciesId}`;
  const secondName = speciesById.get(secondSpeciesId)?.scientificName ?? `#${secondSpeciesId}`;
  return firstName.localeCompare(secondName) || firstSpeciesId - secondSpeciesId;
};

const targetQuantityTextFieldSx = { width: '100px' };

type AddedSpeciesTargetRow = {
  id: string;
  speciesId?: number;
  quantity: string;
  saved: boolean;
  savedSpeciesId?: number;
};

const SpeciesTargetsTab = ({ plantingSeason, plantingSite }: SpeciesTargetsTabProps): JSX.Element => {
  const theme = useTheme();
  const { data: speciesTargetsData } = useGetSpeciesTargetsQuery(plantingSeason.id);
  const { species } = useSpeciesData();

  const readOnly = plantingSeason.status === 'Closed';

  const targetsBySubstratum = useMemo(() => {
    const map = new Map<number, SpeciesTargetPayload[]>();
    (speciesTargetsData?.targets ?? []).forEach((target) => {
      const existing = map.get(target.substratumId) ?? [];
      existing.push(target);
      map.set(target.substratumId, existing);
    });
    return map;
  }, [speciesTargetsData]);

  return (
    <Box>
      {!readOnly && (
        <Box
          sx={{
            backgroundColor: theme.palette.TwClrBaseWhite,
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
          }}
          padding={theme.spacing(3, 3, 0, 3)}
        >
          <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary}>
            {strings.SET_SPECIES_TARGETS_DESCRIPTION}
          </Typography>
        </Box>
      )}
      {(plantingSite.strata ?? []).map((stratum, index) => (
        <StratumSection
          key={stratum.id}
          stratum={stratum}
          targetsBySubstratum={targetsBySubstratum}
          species={species}
          plantingSeasonId={plantingSeason.id}
          readOnly={readOnly}
          isFirst={index === 0}
        />
      ))}
    </Box>
  );
};

type StratumSectionProps = {
  stratum: StratumResponsePayload;
  targetsBySubstratum: Map<number, SpeciesTargetPayload[]>;
  species: Species[];
  plantingSeasonId: number;
  readOnly: boolean;
  isFirst: boolean;
};

const StratumSection = ({
  stratum,
  targetsBySubstratum,
  species,
  plantingSeasonId,
  readOnly,
  isFirst,
}: StratumSectionProps): JSX.Element => {
  const theme = useTheme();

  const stratumTotal = useMemo(() => {
    return stratum.substrata.reduce((sum, substratum) => {
      const targets = targetsBySubstratum.get(substratum.id) ?? [];
      return sum + targets.reduce((s, t) => s + t.quantity, 0);
    }, 0);
  }, [stratum, targetsBySubstratum]);

  return (
    <Card
      flushMobile
      radius={isFirst ? `0 0 ${theme.spacing(3)} ${theme.spacing(3)}` : undefined}
      style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, paddingBottom: 0, marginBottom: 3 }}
    >
      <Box
        sx={{
          backgroundColor: theme.palette.TwClrBaseGray025,
          borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
          padding: theme.spacing(1, 2),
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing(1),
        }}
      >
        <Typography fontSize='16px' fontWeight={600} color={theme.palette.TwClrBaseBlack}>
          {stratum.name}
        </Typography>
        {(stratumTotal || 0) > 0 && (
          <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrBaseBlack}>
            {`${stratumTotal.toLocaleString()} ${strings.TARGET_PLANTS}`}
          </Typography>
        )}
      </Box>
      {stratum.substrata.map((substratum) => (
        <SubstratumSection
          key={substratum.id}
          substratum={substratum}
          targets={targetsBySubstratum.get(substratum.id) ?? []}
          species={species}
          plantingSeasonId={plantingSeasonId}
          readOnly={readOnly}
        />
      ))}
    </Card>
  );
};

type SubstratumSectionProps = {
  substratum: SubstratumResponsePayload;
  targets: SpeciesTargetPayload[];
  species: Species[];
  plantingSeasonId: number;
  readOnly: boolean;
};

const SubstratumSection = ({
  substratum,
  targets,
  species,
  plantingSeasonId,
  readOnly,
}: SubstratumSectionProps): JSX.Element => {
  const theme = useTheme();
  const [addedSpeciesRows, setAddedSpeciesRows] = useState<AddedSpeciesTargetRow[]>([]);

  const substratumTotal = useMemo(() => targets.reduce((sum, t) => sum + t.quantity, 0), [targets]);

  const addedSpeciesIds = useMemo(
    () =>
      new Set(
        addedSpeciesRows
          .flatMap((row) => [row.speciesId, row.savedSpeciesId])
          .filter((speciesId): speciesId is number => speciesId !== undefined)
      ),
    [addedSpeciesRows]
  );

  const usedSpeciesIds = useMemo(
    () => new Set([...targets.map((t) => t.speciesId), ...addedSpeciesIds]),
    [addedSpeciesIds, targets]
  );

  const speciesById = useMemo(() => new Map(species.map((s) => [s.id, s])), [species]);

  const availableSpecies = useMemo(
    () =>
      species
        .filter((s) => !usedSpeciesIds.has(s.id))
        .sort((a, b) => compareSpeciesScientificNames(speciesById, a.id, b.id)),
    [species, speciesById, usedSpeciesIds]
  );

  const sortedTargets = useMemo(
    () =>
      targets
        .filter((target) => !addedSpeciesIds.has(target.speciesId))
        .sort((a, b) => compareSpeciesScientificNames(speciesById, a.speciesId, b.speciesId)),
    [addedSpeciesIds, speciesById, targets]
  );

  const addSpeciesRow = () => {
    setAddedSpeciesRows((current) => [
      ...current,
      { id: `new-species-target-${crypto.randomUUID()}`, quantity: '', saved: false },
    ]);
  };

  const updateAddedSpeciesRow = (row: AddedSpeciesTargetRow) => {
    setAddedSpeciesRows((current) => current.map((currentRow) => (currentRow.id === row.id ? row : currentRow)));
  };

  const removeAddedSpeciesRow = (rowId: string) => {
    setAddedSpeciesRows((current) => current.filter((row) => row.id !== rowId));
  };

  return (
    <Box marginBottom={theme.spacing(3)}>
      <Box
        sx={{
          backgroundColor: theme.palette.TwClrBaseGray025,
          padding: theme.spacing(1, 2),
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing(1),
        }}
      >
        <Typography fontSize='16px' fontWeight={500} color={theme.palette.TwClrTxtSecondary}>
          {substratum.name}
        </Typography>
        {substratumTotal > 0 && (
          <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrTxtSecondary}>
            {`${substratumTotal.toLocaleString()} ${strings.TARGET_PLANTS}`}
          </Typography>
        )}
      </Box>
      {targets.length === 0 ? (
        <Box padding={theme.spacing(2)} textAlign='center'>
          <Typography fontSize='14px'>{strings.NO_SPECIES_TARGETS_FOR_SUBSTRATUM}</Typography>
        </Box>
      ) : (
        <Box>
          <Box
            display='grid'
            gridTemplateColumns={readOnly ? '1fr 1fr' : '1fr 1fr 40px'}
            sx={{
              padding: theme.spacing(2, 2),
              borderBottom: `2px solid ${theme.palette.TwClrBrdrSecondary}`,
            }}
          >
            <Typography fontSize='14px' fontWeight={600} color={theme.palette.TwClrTxt}>
              {strings.SPECIES}
            </Typography>
            <Typography fontSize='14px' fontWeight={600} color={theme.palette.TwClrTxt}>
              {strings.TARGET_QUANTITY}
            </Typography>
            {!readOnly && <Box />}
          </Box>
          {sortedTargets.map((target, index) => (
            <SpeciesTargetRow
              key={`${target.substratumId}-${target.speciesId}`}
              target={target}
              species={species}
              plantingSeasonId={plantingSeasonId}
              index={index}
              readOnly={readOnly}
            />
          ))}
        </Box>
      )}
      {!readOnly && (
        <Box>
          {addedSpeciesRows.map((row) => (
            <AddSpeciesRow
              key={row.id}
              row={row}
              substratumId={substratum.id}
              plantingSeasonId={plantingSeasonId}
              species={species}
              availableSpecies={availableSpecies}
              onChange={updateAddedSpeciesRow}
              onRemove={() => removeAddedSpeciesRow(row.id)}
            />
          ))}
          <Button
            icon='iconAdd'
            label={strings.ADD_SPECIES}
            onClick={addSpeciesRow}
            priority='ghost'
            type='productive'
            disabled={availableSpecies.length === 0}
          />
        </Box>
      )}
    </Box>
  );
};

type SpeciesTargetRowProps = {
  target: SpeciesTargetPayload;
  species: Species[];
  plantingSeasonId: number;
  index: number;
  readOnly: boolean;
};

const SpeciesTargetRow = ({
  target,
  species,
  plantingSeasonId,
  index,
  readOnly,
}: SpeciesTargetRowProps): JSX.Element => {
  const theme = useTheme();
  const snackbar = useSnackbar();
  const [editing, setEditing] = useState(false);
  const [draftQuantity, setDraftQuantity] = useState<string>(target.quantity.toString());
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [upsertSpeciesTarget, { isLoading: isUpserting }] = useUpsertSpeciesTargetMutation();
  const [deleteSpeciesTarget, { isLoading: isDeleting }] = useDeleteSpeciesTargetMutation();

  const speciesInfo = useMemo(() => species.find((s) => s.id === target.speciesId), [species, target.speciesId]);

  const onSave = async () => {
    const parsed = Number(draftQuantity);
    if (Number.isNaN(parsed) || parsed < 0) {
      setDraftQuantity(target.quantity.toString());
      setEditing(false);
      return;
    }
    if (parsed === target.quantity) {
      setEditing(false);
      return;
    }
    try {
      await upsertSpeciesTarget({
        plantingSeasonId,
        upsertPlantingSeasonSpeciesTargetRequestPayload: {
          quantity: parsed,
          speciesId: target.speciesId,
          substratumId: target.substratumId,
        },
      }).unwrap();
    } catch (e) {
      snackbar.toastError();
      setDraftQuantity(target.quantity.toString());
    } finally {
      setEditing(false);
    }
  };

  const onDelete = async () => {
    try {
      await deleteSpeciesTarget({
        plantingSeasonId,
        speciesId: target.speciesId,
        substratumId: target.substratumId,
      }).unwrap();
      setConfirmingDelete(false);
    } catch (e) {
      snackbar.toastError();
    }
  };

  return (
    <Box
      display='grid'
      gridTemplateColumns={readOnly ? '1fr 1fr' : '1fr 1fr 40px'}
      alignItems='center'
      sx={{
        padding: theme.spacing(1, 2),
        backgroundColor: index % 2 === 0 ? theme.palette.TwClrBgSecondary : 'transparent',
      }}
    >
      <Box>
        <Typography fontSize='16px' fontWeight={400} color={theme.palette.TwClrBaseBlack}>
          {speciesInfo?.scientificName ?? `#${target.speciesId}`}
        </Typography>
        {speciesInfo?.commonName && (
          <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrTxtSecondary}>
            {speciesInfo.commonName}
          </Typography>
        )}
      </Box>
      <Box display='flex' alignItems='center' gap={theme.spacing(1)}>
        {readOnly ? (
          <Typography fontSize='16px' fontWeight={400}>
            {target.quantity.toLocaleString()}
          </Typography>
        ) : editing ? (
          <TextField
            id={`target-${target.substratumId}-${target.speciesId}`}
            type='number'
            label=''
            value={draftQuantity}
            onChange={(value) => setDraftQuantity(String(value ?? ''))}
            onBlur={() => void onSave()}
            min={0}
            autoFocus
            sx={targetQuantityTextFieldSx}
          />
        ) : (
          <>
            <Typography fontSize='16px' fontWeight={400}>
              {target.quantity.toLocaleString()}
            </Typography>
            <Button
              icon='iconEdit'
              onClick={() => {
                setDraftQuantity(target.quantity.toString());
                setEditing(true);
              }}
              priority='ghost'
              size='small'
              type='passive'
              disabled={isUpserting}
            />
          </>
        )}
      </Box>
      {!readOnly && (
        <>
          <Button
            icon='iconTrashCan'
            onClick={() => setConfirmingDelete(true)}
            priority='ghost'
            size='small'
            type='passive'
            disabled={isDeleting}
          />
          <DeleteSpeciesGoalModal
            open={confirmingDelete}
            speciesName={speciesInfo?.scientificName ?? `#${target.speciesId}`}
            onClose={() => setConfirmingDelete(false)}
            onConfirm={() => void onDelete()}
          />
        </>
      )}
    </Box>
  );
};

type AddSpeciesRowProps = {
  row: AddedSpeciesTargetRow;
  substratumId: number;
  plantingSeasonId: number;
  species: Species[];
  availableSpecies: Species[];
  onChange: (row: AddedSpeciesTargetRow) => void;
  onRemove: () => void;
};

const AddSpeciesRow = ({
  row,
  substratumId,
  plantingSeasonId,
  species,
  availableSpecies,
  onChange,
  onRemove,
}: AddSpeciesRowProps): JSX.Element => {
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const snackbar = useSnackbar();
  const rowRef = useRef<HTMLDivElement>(null);
  const [upsertSpeciesTarget, { isLoading: isUpserting }] = useUpsertSpeciesTargetMutation();
  const [deleteSpeciesTarget, { isLoading: isDeleting }] = useDeleteSpeciesTargetMutation();
  const selectedSpeciesId = row.speciesId;
  const selectedSpecies = selectedSpeciesId === undefined ? undefined : species.find((s) => s.id === selectedSpeciesId);
  const isSaving = isUpserting || isDeleting;

  const options = useMemo<DropdownItem[]>(() => {
    const speciesOptions = selectedSpecies ? [selectedSpecies, ...availableSpecies] : availableSpecies;
    return speciesOptions.map((s) => ({
      label: s.scientificName,
      value: s.id,
    }));
  }, [availableSpecies, selectedSpecies]);

  const saveIfComplete = async (nextRow: AddedSpeciesTargetRow) => {
    if (nextRow.speciesId === undefined || nextRow.quantity === '') {
      return;
    }
    const parsed = Number(nextRow.quantity);
    if (Number.isNaN(parsed) || parsed < 0) {
      return;
    }
    const previousSavedSpeciesId = nextRow.savedSpeciesId;
    try {
      await upsertSpeciesTarget({
        plantingSeasonId,
        upsertPlantingSeasonSpeciesTargetRequestPayload: {
          quantity: parsed,
          speciesId: nextRow.speciesId,
          substratumId,
        },
      }).unwrap();
      if (previousSavedSpeciesId !== undefined && previousSavedSpeciesId !== nextRow.speciesId) {
        await deleteSpeciesTarget({ plantingSeasonId, speciesId: previousSavedSpeciesId, substratumId }).unwrap();
      }
      onChange({ ...nextRow, saved: true, savedSpeciesId: nextRow.speciesId });
    } catch (e) {
      snackbar.toastError();
    }
  };

  const onSpeciesChange = (value: string | number | undefined) => {
    if (value === undefined || value === '') {
      onChange({ ...row, speciesId: undefined, saved: false, savedSpeciesId: undefined });
      return;
    }

    const speciesId = Number(value);
    const nextRow = { ...row, speciesId, saved: row.savedSpeciesId === speciesId };
    onChange(nextRow);
    void saveIfComplete(nextRow);
  };

  const onQuantityChange = (value: unknown) => {
    onChange({ ...row, quantity: String(value ?? '') });
  };

  const onRemoveClick = async () => {
    if (row.savedSpeciesId === undefined) {
      onRemove();
      return;
    }
    try {
      await deleteSpeciesTarget({ plantingSeasonId, speciesId: row.savedSpeciesId, substratumId }).unwrap();
      onRemove();
    } catch (e) {
      snackbar.toastError();
    }
  };

  const scrollRowIntoView = () => {
    rowRef.current?.scrollIntoView({ block: 'center' });
  };

  return (
    <Box
      ref={rowRef}
      display='flex'
      alignItems='flex-end'
      gap={theme.spacing(2)}
      flexWrap='wrap'
      onFocusCapture={scrollRowIntoView}
      onMouseDownCapture={scrollRowIntoView}
      onTouchStartCapture={scrollRowIntoView}
    >
      <Box width={isMobile ? '100%' : '300px'}>
        <Dropdown
          id={`add-species-${row.id}`}
          label={strings.SPECIES}
          placeholder={strings.SELECT_SPECIES}
          options={options}
          selectedValue={selectedSpeciesId}
          onChange={onSpeciesChange}
          fullWidth
          autocomplete
          disabled={isSaving}
        />
      </Box>
      <Box width='100px'>
        <TextField
          id={`add-quantity-${row.id}`}
          type='number'
          label={strings.TARGET_QUANTITY}
          value={row.quantity}
          onChange={onQuantityChange}
          onBlur={() => void saveIfComplete(row)}
          min={0}
          sx={targetQuantityTextFieldSx}
          disabled={isSaving}
        />
      </Box>
      <IconButton aria-label={strings.REMOVE} size='small' onClick={() => void onRemoveClick()} disabled={isSaving}>
        <Icon name='iconSubtract' size='medium' fillColor={theme.palette.TwClrIcn} />
      </IconButton>
    </Box>
  );
};

export default SpeciesTargetsTab;
