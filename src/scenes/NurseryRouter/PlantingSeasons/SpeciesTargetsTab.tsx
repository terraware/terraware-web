import React, { type JSX, useMemo, useRef, useState } from 'react';

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
    <Card flushMobile style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      {!readOnly && (
        <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary} marginBottom={theme.spacing(2)}>
          {strings.SET_SPECIES_TARGETS_DESCRIPTION}
        </Typography>
      )}
      {(plantingSite.strata ?? []).map((stratum) => (
        <StratumSection
          key={stratum.id}
          stratum={stratum}
          targetsBySubstratum={targetsBySubstratum}
          species={species}
          plantingSeasonId={plantingSeason.id}
          readOnly={readOnly}
        />
      ))}
    </Card>
  );
};

type StratumSectionProps = {
  stratum: StratumResponsePayload;
  targetsBySubstratum: Map<number, SpeciesTargetPayload[]>;
  species: Species[];
  plantingSeasonId: number;
  readOnly: boolean;
};

const StratumSection = ({
  stratum,
  targetsBySubstratum,
  species,
  plantingSeasonId,
  readOnly,
}: StratumSectionProps): JSX.Element => {
  const theme = useTheme();

  const stratumTotal = useMemo(() => {
    return stratum.substrata.reduce((sum, substratum) => {
      const targets = targetsBySubstratum.get(substratum.id) ?? [];
      return sum + targets.reduce((s, t) => s + t.quantity, 0);
    }, 0);
  }, [stratum, targetsBySubstratum]);

  return (
    <Box marginBottom={theme.spacing(2)}>
      <Box
        sx={{
          backgroundColor: theme.palette.TwClrBgSecondary,
          borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
          padding: theme.spacing(1, 2),
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing(1),
        }}
      >
        <Typography fontSize='16px' fontWeight={600} color={theme.palette.TwClrTxtSecondary}>
          {stratum.name}
        </Typography>
        {(stratumTotal || 0) > 0 && (
          <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrTxtSecondary}>
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
    </Box>
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
  const [addingSpecies, setAddingSpecies] = useState(false);

  const substratumTotal = useMemo(() => targets.reduce((sum, t) => sum + t.quantity, 0), [targets]);

  const usedSpeciesIds = useMemo(() => new Set(targets.map((t) => t.speciesId)), [targets]);

  const availableSpecies = useMemo(() => species.filter((s) => !usedSpeciesIds.has(s.id)), [species, usedSpeciesIds]);

  return (
    <Box marginBottom={theme.spacing(3)}>
      <Box
        sx={{
          backgroundColor: theme.palette.TwClrBgSecondary,
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
              padding: theme.spacing(1, 2),
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
          {targets.map((target, index) => (
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
          {addingSpecies ? (
            <AddSpeciesRow
              substratumId={substratum.id}
              plantingSeasonId={plantingSeasonId}
              availableSpecies={availableSpecies}
              onClose={() => setAddingSpecies(false)}
            />
          ) : (
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
  onClose: () => void;
};

const AddSpeciesRow = ({
  substratumId,
  plantingSeasonId,
  availableSpecies,
  onClose,
}: AddSpeciesRowProps): JSX.Element => {
  const theme = useTheme();
  const snackbar = useSnackbar();
  const rowRef = useRef<HTMLDivElement>(null);
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<number | undefined>();
  const [quantity, setQuantity] = useState<string>('0');
  const [upsertSpeciesTarget, { isLoading }] = useUpsertSpeciesTargetMutation();

  const options = useMemo<DropdownItem[]>(
    () =>
      availableSpecies.map((s) => ({
        label: s.scientificName,
        value: s.id,
      })),
    [availableSpecies]
  );

  const onSave = async () => {
    if (selectedSpeciesId === undefined) {
      return;
    }
    const parsed = Number(quantity);
    if (Number.isNaN(parsed) || parsed < 0) {
      return;
    }
    try {
      await upsertSpeciesTarget({
        plantingSeasonId,
        upsertPlantingSeasonSpeciesTargetRequestPayload: {
          quantity: parsed,
          speciesId: selectedSpeciesId,
          substratumId,
        },
      }).unwrap();
      onClose();
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
      <Box flex={1} minWidth='200px'>
        <Dropdown
          id={`add-species-${substratumId}`}
          label={strings.SPECIES}
          placeholder={strings.SELECT_SPECIES}
          options={options}
          selectedValue={selectedSpeciesId}
          onChange={(value) => setSelectedSpeciesId(Number(value))}
          fullWidth
          autocomplete
        />
      </Box>
      <Box minWidth='160px'>
        <TextField
          id={`add-quantity-${substratumId}`}
          type='number'
          label={strings.TARGET_QUANTITY}
          value={quantity}
          onChange={(value) => setQuantity(String(value ?? ''))}
          min={0}
        />
      </Box>
      <Button
        label={strings.ADD}
        onClick={() => void onSave()}
        disabled={isLoading || selectedSpeciesId === undefined}
      />
      <Button label={strings.CANCEL} onClick={onClose} priority='secondary' type='passive' />
    </Box>
  );
};

export default SpeciesTargetsTab;
