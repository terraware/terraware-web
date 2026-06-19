import React, { type JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Button, Dropdown, DropdownItem } from '@terraware/web-components';

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
const justSavedDurationMs = 3000;

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
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
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
  const [savingSpeciesCount, setSavingSpeciesCount] = useState(0);
  const [justSaved, setJustSaved] = useState(false);
  const justSavedTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const stratumTotal = useMemo(() => {
    return stratum.substrata.reduce((sum, substratum) => {
      const targets = targetsBySubstratum.get(substratum.id) ?? [];
      return sum + targets.reduce((s, t) => s + t.quantity, 0);
    }, 0);
  }, [stratum, targetsBySubstratum]);

  const onSpeciesTargetSavingChange = useCallback((isSaving: boolean) => {
    if (isSaving) {
      setJustSaved(false);
      if (justSavedTimeoutRef.current) {
        clearTimeout(justSavedTimeoutRef.current);
      }
    }

    setSavingSpeciesCount((current) => Math.max(0, current + (isSaving ? 1 : -1)));
  }, []);

  const onSpeciesTargetSaved = useCallback(() => {
    setJustSaved(true);
    if (justSavedTimeoutRef.current) {
      clearTimeout(justSavedTimeoutRef.current);
    }
    justSavedTimeoutRef.current = setTimeout(() => setJustSaved(false), justSavedDurationMs);
  }, []);

  useEffect(
    () => () => {
      if (justSavedTimeoutRef.current) {
        clearTimeout(justSavedTimeoutRef.current);
      }
    },
    []
  );

  const saveStatusText = savingSpeciesCount > 0 ? strings.SAVING : justSaved ? strings.JUST_SAVED : undefined;

  return (
    <Card
      flushMobile
      radius={isFirst ? `0 0 ${theme.spacing(1)} ${theme.spacing(1)}` : theme.spacing(1)}
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
        {saveStatusText && (
          <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrBaseBlack}>
            {saveStatusText}
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
          onSpeciesTargetSavingChange={onSpeciesTargetSavingChange}
          onSpeciesTargetSaved={onSpeciesTargetSaved}
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
  onSpeciesTargetSavingChange: (isSaving: boolean) => void;
  onSpeciesTargetSaved: () => void;
};

const SubstratumSection = ({
  substratum,
  targets,
  species,
  plantingSeasonId,
  readOnly,
  onSpeciesTargetSavingChange,
  onSpeciesTargetSaved,
}: SubstratumSectionProps): JSX.Element => {
  const theme = useTheme();
  const [addingSpecies, setAddingSpecies] = useState(false);

  const substratumTotal = useMemo(() => targets.reduce((sum, t) => sum + t.quantity, 0), [targets]);

  const usedSpeciesIds = useMemo(() => new Set(targets.map((t) => t.speciesId)), [targets]);

  const speciesById = useMemo(() => new Map(species.map((s) => [s.id, s])), [species]);

  const availableSpecies = useMemo(
    () =>
      species
        .filter((s) => !usedSpeciesIds.has(s.id))
        .sort((a, b) => compareSpeciesScientificNames(speciesById, a.id, b.id)),
    [species, speciesById, usedSpeciesIds]
  );

  const sortedTargets = useMemo(
    () => [...targets].sort((a, b) => compareSpeciesScientificNames(speciesById, a.speciesId, b.speciesId)),
    [speciesById, targets]
  );

  const hasSpeciesTargetRows = targets.length > 0 || addingSpecies;

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
      {!hasSpeciesTargetRows ? (
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
              onSpeciesTargetSavingChange={onSpeciesTargetSavingChange}
              onSpeciesTargetSaved={onSpeciesTargetSaved}
            />
          ))}
          {addingSpecies && (
            <AddSpeciesRow
              substratumId={substratum.id}
              plantingSeasonId={plantingSeasonId}
              availableSpecies={availableSpecies}
              index={sortedTargets.length}
              onRemove={() => setAddingSpecies(false)}
              onSpeciesTargetSavingChange={onSpeciesTargetSavingChange}
              onSpeciesTargetSaved={onSpeciesTargetSaved}
            />
          )}
        </Box>
      )}
      {!readOnly && (
        <Box>
          {!addingSpecies && (
            <Button
              icon='iconAdd'
              label={strings.ADD_SPECIES}
              onClick={() => setAddingSpecies(true)}
              priority='ghost'
              type='productive'
              disabled={availableSpecies.length === 0}
            />
          )}
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
  onSpeciesTargetSavingChange: (isSaving: boolean) => void;
  onSpeciesTargetSaved: () => void;
};

const SpeciesTargetRow = ({
  target,
  species,
  plantingSeasonId,
  index,
  readOnly,
  onSpeciesTargetSavingChange,
  onSpeciesTargetSaved,
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
    let saved = false;
    onSpeciesTargetSavingChange(true);
    try {
      await upsertSpeciesTarget({
        plantingSeasonId,
        upsertPlantingSeasonSpeciesTargetRequestPayload: {
          quantity: parsed,
          speciesId: target.speciesId,
          substratumId: target.substratumId,
        },
      }).unwrap();
      saved = true;
    } catch (e) {
      snackbar.toastError();
      setDraftQuantity(target.quantity.toString());
    } finally {
      onSpeciesTargetSavingChange(false);
      if (saved) {
        onSpeciesTargetSaved();
      }
      setEditing(false);
    }
  };

  const onDelete = async () => {
    let saved = false;
    onSpeciesTargetSavingChange(true);
    try {
      await deleteSpeciesTarget({
        plantingSeasonId,
        speciesId: target.speciesId,
        substratumId: target.substratumId,
      }).unwrap();
      saved = true;
      setConfirmingDelete(false);
    } catch (e) {
      snackbar.toastError();
    } finally {
      onSpeciesTargetSavingChange(false);
      if (saved) {
        onSpeciesTargetSaved();
      }
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
      <Box display='flex' alignItems='center' gap={theme.spacing(0.5)}>
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
  substratumId: number;
  plantingSeasonId: number;
  availableSpecies: Species[];
  index: number;
  onRemove: () => void;
  onSpeciesTargetSavingChange: (isSaving: boolean) => void;
  onSpeciesTargetSaved: () => void;
};

const AddSpeciesRow = ({
  substratumId,
  plantingSeasonId,
  availableSpecies,
  index,
  onRemove,
  onSpeciesTargetSavingChange,
  onSpeciesTargetSaved,
}: AddSpeciesRowProps): JSX.Element => {
  const theme = useTheme();
  const snackbar = useSnackbar();
  const rowRef = useRef<HTMLDivElement>(null);
  const skipQuantityBlurSaveRef = useRef(false);
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<number | undefined>();
  const [quantity, setQuantity] = useState<string>('');
  const [upsertSpeciesTarget, { isLoading: isUpserting }] = useUpsertSpeciesTargetMutation();

  const options = useMemo<DropdownItem[]>(
    () =>
      availableSpecies.map((s) => ({
        label: s.scientificName,
        value: s.id,
      })),
    [availableSpecies]
  );

  const onSave = async () => {
    if (skipQuantityBlurSaveRef.current) {
      skipQuantityBlurSaveRef.current = false;
      return;
    }
    if (selectedSpeciesId === undefined || quantity === '') {
      return;
    }
    const parsed = Number(quantity);
    if (Number.isNaN(parsed) || parsed < 0) {
      return;
    }
    let saved = false;
    onSpeciesTargetSavingChange(true);
    try {
      await upsertSpeciesTarget({
        plantingSeasonId,
        upsertPlantingSeasonSpeciesTargetRequestPayload: {
          quantity: parsed,
          speciesId: selectedSpeciesId,
          substratumId,
        },
      }).unwrap();
      saved = true;
      onRemove();
    } catch (e) {
      snackbar.toastError();
    } finally {
      onSpeciesTargetSavingChange(false);
      if (saved) {
        onSpeciesTargetSaved();
      }
    }
  };

  const onSpeciesChange = (value: string | number | undefined) => {
    if (value === undefined || value === '') {
      setSelectedSpeciesId(undefined);
      setQuantity('');
      return;
    }

    const speciesId = Number(value);
    setSelectedSpeciesId(speciesId);
    if (speciesId !== selectedSpeciesId) {
      setQuantity('');
    }
  };

  const onQuantityChange = (value: unknown) => {
    setQuantity(String(value ?? ''));
  };

  const scrollRowIntoView = () => {
    rowRef.current?.scrollIntoView({ block: 'center' });
  };

  return (
    <Box
      ref={rowRef}
      display='grid'
      gridTemplateColumns='1fr 1fr 40px'
      alignItems='center'
      onFocusCapture={scrollRowIntoView}
      onMouseDownCapture={scrollRowIntoView}
      onTouchStartCapture={scrollRowIntoView}
      sx={{
        padding: theme.spacing(1, 2),
        backgroundColor: index % 2 === 0 ? theme.palette.TwClrBgSecondary : 'transparent',
      }}
    >
      <Box maxWidth='100%' width='300px'>
        <Dropdown
          id={`add-species-${substratumId}`}
          placeholder={strings.SELECT_SPECIES}
          options={options}
          selectedValue={selectedSpeciesId}
          onChange={onSpeciesChange}
          fullWidth
          autocomplete
          disabled={isUpserting}
        />
      </Box>
      <Box width='100px'>
        {selectedSpeciesId !== undefined && (
          <TextField
            id={`add-quantity-${substratumId}`}
            type='number'
            label=''
            value={quantity}
            onChange={onQuantityChange}
            onBlur={() => void onSave()}
            min={0}
            autoFocus
            sx={targetQuantityTextFieldSx}
            disabled={isUpserting}
          />
        )}
      </Box>
      <Box
        display='contents'
        onMouseDown={(event) => {
          event.preventDefault();
          skipQuantityBlurSaveRef.current = true;
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            skipQuantityBlurSaveRef.current = true;
          }
        }}
      >
        <Button
          icon='iconTrashCan'
          onClick={onRemove}
          priority='ghost'
          size='small'
          type='passive'
          disabled={isUpserting}
        />
      </Box>
    </Box>
  );
};

export default SpeciesTargetsTab;
