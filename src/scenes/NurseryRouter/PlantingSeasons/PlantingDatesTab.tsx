import React, { type JSX, useEffect, useMemo, useState } from 'react';

import { Box, Checkbox, Divider, Typography, useTheme } from '@mui/material';
import { Button, Dropdown, DropdownItem, Icon, Tooltip } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';
import { DateTime } from 'luxon';

import Card from 'src/components/common/Card';
import DatePicker from 'src/components/common/DatePicker';
import TextField from 'src/components/common/Textfield/Textfield';
import { useLocalization, useOrganization } from 'src/providers';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import {
  PlantingSeasonPayload,
  ScheduledDatePayload,
  ScheduledPlantingDateSpeciesPayload,
  SpeciesTargetPayload,
  useCreateScheduledPlantingDateMutation,
  useDeleteScheduledPlantingDateMutation,
  useGetScheduledPlantingDatesQuery,
  useGetSpeciesTargetsQuery,
  useUpdateScheduledPlantingDateMutation,
} from 'src/queries/generated/plantingSeasons';
import {
  PlantingSitePayload,
  StratumResponsePayload,
  SubstratumResponsePayload,
} from 'src/queries/generated/plantingSites';
import strings from 'src/strings';
import { Species } from 'src/types/Species';
import { getMediumDate } from 'src/utils/dateFormatter';
import useSnackbar from 'src/utils/useSnackbar';

import SaveAndNotifyNurseryModal from './SaveAndNotifyNurseryModal';

type PlantingDatesTabProps = {
  plantingSeason: PlantingSeasonPayload;
  plantingSite: PlantingSitePayload;
};

type EditingState = { mode: 'add' } | { mode: 'edit'; scheduledDate: ScheduledDatePayload };

const PlantingDatesTab = ({ plantingSeason, plantingSite }: PlantingDatesTabProps): JSX.Element => {
  const theme = useTheme();
  const { species } = useSpeciesData();
  const { data: scheduledDatesData } = useGetScheduledPlantingDatesQuery(plantingSeason.id);
  const { data: speciesTargetsData } = useGetSpeciesTargetsQuery(plantingSeason.id);

  const [editing, setEditing] = useState<EditingState | undefined>();

  const readOnly = plantingSeason.status === 'Closed';
  const scheduledDates = scheduledDatesData?.scheduledDates ?? [];
  const speciesTargets = speciesTargetsData?.targets ?? [];

  return (
    <Card flushMobile style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      {scheduledDates.length === 0 && !editing ? (
        <EmptyState onAdd={() => setEditing({ mode: 'add' })} readOnly={readOnly} />
      ) : (
        <>
          <Box display='flex' alignItems='center' justifyContent='space-between' marginBottom={theme.spacing(2)}>
            <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary}>
              {strings.PLANTING_DATES_TAB_DESCRIPTION}
            </Typography>
            {!editing && !readOnly && (
              <Button
                icon='plus'
                label={strings.ADD_DATE}
                onClick={() => setEditing({ mode: 'add' })}
                priority='secondary'
                type='productive'
              />
            )}
          </Box>
          {editing && !readOnly ? (
            <PlantingDateForm
              key={editing.mode === 'edit' ? editing.scheduledDate.scheduledPlantingDateId : 'new'}
              plantingSeason={plantingSeason}
              plantingSite={plantingSite}
              species={species}
              speciesTargets={speciesTargets}
              scheduledDates={scheduledDates}
              editingScheduledDate={editing.mode === 'edit' ? editing.scheduledDate : undefined}
              onClose={() => setEditing(undefined)}
            />
          ) : (
            <Box>
              <Divider />
              {scheduledDates.map((scheduledDate) => (
                <PlantingDateListItem
                  key={scheduledDate.scheduledPlantingDateId}
                  scheduledDate={scheduledDate}
                  plantingSite={plantingSite}
                  onEdit={() => setEditing({ mode: 'edit', scheduledDate })}
                  readOnly={readOnly}
                />
              ))}
            </Box>
          )}
        </>
      )}
    </Card>
  );
};

const EmptyState = ({ onAdd, readOnly }: { onAdd: () => void; readOnly: boolean }): JSX.Element => {
  const theme = useTheme();
  return (
    <Box
      display='flex'
      flexDirection='column'
      alignItems='center'
      justifyContent='center'
      padding={theme.spacing(6)}
      gap={theme.spacing(2)}
    >
      <Box component='img' src='/assets/calendar.svg' alt='' sx={{ width: 64, height: 64 }} />
      <Typography fontSize='16px' color={theme.palette.TwClrBaseBlack}>
        {strings.NO_PLANTING_DATES_SCHEDULED}
      </Typography>
      {!readOnly && <Button icon='plus' label={strings.ADD_PLANTING_DATE} onClick={onAdd} size='medium' />}
    </Box>
  );
};

type PlantingDateListItemProps = {
  scheduledDate: ScheduledDatePayload;
  plantingSite: PlantingSitePayload;
  onEdit: () => void;
  readOnly: boolean;
};

const PlantingDateListItem = ({
  scheduledDate,
  plantingSite,
  onEdit,
  readOnly,
}: PlantingDateListItemProps): JSX.Element => {
  const theme = useTheme();
  const { activeLocale } = useLocalization();
  const { isMobile } = useDeviceInfo();

  const totalPlants = scheduledDate.species.reduce((sum, s) => sum + s.quantity, 0);
  const distinctSpecies = new Set(scheduledDate.species.map((s) => s.speciesId)).size;

  const { strataNames, substrataNames } = useMemo(() => {
    const substratumIds = new Set(scheduledDate.species.map((s) => s.substratumId));
    const strataSet = new Set<string>();
    const substrataSet = new Set<string>();
    (plantingSite.strata ?? []).forEach((stratum) => {
      stratum.substrata.forEach((substratum) => {
        if (substratumIds.has(substratum.id)) {
          strataSet.add(stratum.name);
          substrataSet.add(substratum.name);
        }
      });
    });
    return { strataNames: [...strataSet], substrataNames: [...substrataSet] };
  }, [scheduledDate, plantingSite]);

  return (
    <Box
      display='flex'
      flexDirection={isMobile ? 'column' : 'row'}
      alignItems={isMobile ? 'flex-start' : 'center'}
      gap={theme.spacing(2)}
      padding={theme.spacing(2)}
      sx={{ borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}` }}
    >
      <Box flex={1}>
        <Box display='flex' alignItems='center' gap={theme.spacing(1)}>
          <Typography fontSize='20px' fontWeight={600}>
            {getMediumDate(scheduledDate.date, activeLocale)}
          </Typography>
        </Box>
        <Typography fontSize='16px' color={theme.palette.TwClrTxtSecondary}>
          {strings.formatString(strings.X_SPECIES_Y_PLANTS, distinctSpecies, totalPlants).toString()}
        </Typography>
      </Box>
      <Box flex={1} display='flex' gap={theme.spacing(2)}>
        <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary}>
          {strings.STRATA_LABEL}
        </Typography>
        <Box>
          {strataNames.map((name) => (
            <Typography key={name} fontSize='14px' fontWeight={600}>
              {name}
            </Typography>
          ))}
        </Box>
      </Box>
      <Box flex={1} display='flex' gap={theme.spacing(2)}>
        <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary}>
          {strings.SUBSTRATA_LABEL}
        </Typography>
        <Box>
          {substrataNames.map((name) => (
            <Typography key={name} fontSize='14px' fontWeight={600}>
              {name}
            </Typography>
          ))}
        </Box>
      </Box>
      {!readOnly && (
        <Button icon='iconEdit' label={strings.EDIT} onClick={onEdit} priority='secondary' type='productive' />
      )}
    </Box>
  );
};

type PlantingDateFormProps = {
  plantingSeason: PlantingSeasonPayload;
  plantingSite: PlantingSitePayload;
  species: Species[];
  speciesTargets: SpeciesTargetPayload[];
  scheduledDates: ScheduledDatePayload[];
  editingScheduledDate?: ScheduledDatePayload;
  onClose: () => void;
};

type SpeciesDraft = { speciesId: number; quantity: number; allocatedQuantity?: number };
type SubstratumDraft = { selected: boolean; species: SpeciesDraft[] };

const PlantingDateForm = ({
  plantingSeason,
  plantingSite,
  species,
  speciesTargets,
  scheduledDates,
  editingScheduledDate,
  onClose,
}: PlantingDateFormProps): JSX.Element => {
  const theme = useTheme();
  const snackbar = useSnackbar();
  const { selectedOrganization } = useOrganization();
  const [createScheduledPlantingDate, { isLoading: isCreating }] = useCreateScheduledPlantingDateMutation();
  const [updateScheduledPlantingDate, { isLoading: isUpdating }] = useUpdateScheduledPlantingDateMutation();
  const [deleteScheduledPlantingDate, { isLoading: isDeleting }] = useDeleteScheduledPlantingDateMutation();

  const isSaving = isCreating || isUpdating || isDeleting;
  const isEditing = editingScheduledDate !== undefined;

  const timeZoneId = useMemo(() => selectedOrganization?.timeZone ?? 'Etc/UTC', [selectedOrganization]);

  const [date, setDate] = useState<string>(editingScheduledDate?.date ?? '');
  const [substrataDrafts, setSubstrataDrafts] = useState<Record<number, SubstratumDraft>>(() => {
    const drafts: Record<number, SubstratumDraft> = {};
    if (editingScheduledDate) {
      editingScheduledDate.species.forEach((s) => {
        const existing = drafts[s.substratumId] ?? { selected: true, species: [] };
        existing.selected = true;
        existing.species.push({
          speciesId: s.speciesId,
          quantity: s.quantity,
          allocatedQuantity: s.allocatedQuantity,
        });
        drafts[s.substratumId] = existing;
      });
    }
    return drafts;
  });
  const [validate, setValidate] = useState(false);
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);

  const updateSubstratum = (substratumId: number, updater: (draft: SubstratumDraft) => SubstratumDraft) => {
    setSubstrataDrafts((prev) => ({
      ...prev,
      [substratumId]: updater(prev[substratumId] ?? { selected: false, species: [] }),
    }));
  };

  const buildPayloadSpecies = (): ScheduledPlantingDateSpeciesPayload[] => {
    return Object.entries(substrataDrafts).flatMap(([substratumIdStr, draft]) => {
      if (!draft.selected) {
        return [];
      }
      const substratumId = Number(substratumIdStr);
      return draft.species
        .filter((s) => s.quantity > 0)
        .map(
          (s): ScheduledPlantingDateSpeciesPayload => ({
            quantity: s.quantity,
            speciesId: s.speciesId,
            substratumId,
          })
        );
    });
  };

  const performSave = async (notifyOptions?: { note: string }) => {
    if (!date) {
      setValidate(true);
      return false;
    }
    const speciesPayload = buildPayloadSpecies();
    const payload = {
      date,
      species: speciesPayload,
      ...(notifyOptions
        ? {
            createNurseryRequest: true,
            ...(notifyOptions.note ? { nurseryRequestNotes: notifyOptions.note } : {}),
          }
        : {}),
    };
    try {
      if (isEditing && editingScheduledDate) {
        await updateScheduledPlantingDate({
          plantingSeasonId: plantingSeason.id,
          scheduledPlantingDateId: editingScheduledDate.scheduledPlantingDateId,
          scheduledPlantingDateRequestPayload: payload,
        }).unwrap();
      } else {
        await createScheduledPlantingDate({
          plantingSeasonId: plantingSeason.id,
          scheduledPlantingDateRequestPayload: payload,
        }).unwrap();
      }
      return true;
    } catch (e) {
      snackbar.toastError();
      return false;
    }
  };

  const onSave = async () => {
    if (await performSave()) {
      onClose();
    }
  };

  const onSaveAndNotify = async (note: string) => {
    if (await performSave({ note })) {
      setNotifyModalOpen(false);
      onClose();
    }
  };

  const onDelete = async () => {
    if (!editingScheduledDate) {
      return;
    }
    try {
      await deleteScheduledPlantingDate({
        plantingSeasonId: plantingSeason.id,
        scheduledPlantingDateId: editingScheduledDate.scheduledPlantingDateId,
      }).unwrap();
      onClose();
    } catch (e) {
      snackbar.toastError();
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.TwClrBgSecondary,
        borderRadius: '8px',
        padding: theme.spacing(2),
      }}
    >
      <Box maxWidth='240px' marginBottom={theme.spacing(2)}>
        <DatePicker
          id='plantingDate'
          aria-label='planting-date'
          label=''
          value={date}
          onDateChange={(value?: DateTime) => setDate(value?.toISODate() ?? '')}
          errorText={validate && !date ? strings.REQUIRED_FIELD : ''}
          defaultTimeZone={timeZoneId}
        />
      </Box>

      {(plantingSite.strata ?? []).map((stratum) => (
        <StratumDraftSection
          key={stratum.id}
          stratum={stratum}
          substrataDrafts={substrataDrafts}
          species={species}
          speciesTargets={speciesTargets}
          scheduledDates={scheduledDates}
          excludeScheduledDateId={editingScheduledDate?.scheduledPlantingDateId}
          onToggleSubstratum={(substratumId, selected) =>
            updateSubstratum(substratumId, (draft) => ({ ...draft, selected }))
          }
          onUpdateSubstratumSpecies={(substratumId, updater) =>
            updateSubstratum(substratumId, (draft) => ({ ...draft, species: updater(draft.species) }))
          }
        />
      ))}

      <Box display='flex' justifyContent='flex-end' gap={theme.spacing(1)} marginTop={theme.spacing(2)}>
        {isEditing && (
          <Button
            label={strings.DELETE}
            onClick={() => void onDelete()}
            priority='secondary'
            type='destructive'
            disabled={isSaving}
          />
        )}
        <Button label={strings.CANCEL} onClick={onClose} priority='secondary' type='passive' disabled={isSaving} />
        <Tooltip title={strings.SAVE_TOOLTIP}>
          <span>
            <Button label={strings.SAVE} onClick={() => void onSave()} priority='secondary' disabled={isSaving} />
          </span>
        </Tooltip>
        <Tooltip title={strings.SAVE_AND_REQUEST_TOOLTIP} slotProps={{ tooltip: { sx: { maxWidth: '262px' } } }}>
          <span>
            <Button
              label={strings.SAVE_AND_REQUEST}
              onClick={() => setNotifyModalOpen(true)}
              disabled={isSaving || !date}
            />
          </span>
        </Tooltip>
      </Box>

      {notifyModalOpen && (
        <SaveAndNotifyNurseryModal
          open={true}
          onClose={() => setNotifyModalOpen(false)}
          onConfirm={(note) => void onSaveAndNotify(note)}
          busy={isSaving}
        />
      )}
    </Box>
  );
};

type StratumDraftSectionProps = {
  stratum: StratumResponsePayload;
  substrataDrafts: Record<number, SubstratumDraft>;
  species: Species[];
  speciesTargets: SpeciesTargetPayload[];
  scheduledDates: ScheduledDatePayload[];
  excludeScheduledDateId?: number;
  onToggleSubstratum: (substratumId: number, selected: boolean) => void;
  onUpdateSubstratumSpecies: (substratumId: number, updater: (species: SpeciesDraft[]) => SpeciesDraft[]) => void;
};

const StratumDraftSection = ({
  stratum,
  substrataDrafts,
  species,
  speciesTargets,
  scheduledDates,
  excludeScheduledDateId,
  onToggleSubstratum,
  onUpdateSubstratumSpecies,
}: StratumDraftSectionProps): JSX.Element => {
  const theme = useTheme();
  return (
    <Box marginBottom={theme.spacing(2)}>
      <Typography fontSize='16px' fontWeight={600} marginBottom={theme.spacing(1)} color={theme.palette.TwClrTxt}>
        {stratum.name}
      </Typography>
      {stratum.substrata.map((substratum) => (
        <SubstratumDraftSection
          key={substratum.id}
          substratum={substratum}
          draft={substrataDrafts[substratum.id]}
          species={species}
          speciesTargets={speciesTargets}
          scheduledDates={scheduledDates}
          excludeScheduledDateId={excludeScheduledDateId}
          onToggleSubstratum={onToggleSubstratum}
          onUpdateSubstratumSpecies={onUpdateSubstratumSpecies}
        />
      ))}
    </Box>
  );
};

type SubstratumDraftSectionProps = {
  substratum: SubstratumResponsePayload;
  draft?: SubstratumDraft;
  species: Species[];
  speciesTargets: SpeciesTargetPayload[];
  scheduledDates: ScheduledDatePayload[];
  excludeScheduledDateId?: number;
  onToggleSubstratum: (substratumId: number, selected: boolean) => void;
  onUpdateSubstratumSpecies: (substratumId: number, updater: (species: SpeciesDraft[]) => SpeciesDraft[]) => void;
};

const SubstratumDraftSection = ({
  substratum,
  draft,
  species,
  speciesTargets,
  scheduledDates,
  excludeScheduledDateId,
  onToggleSubstratum,
  onUpdateSubstratumSpecies,
}: SubstratumDraftSectionProps): JSX.Element => {
  const theme = useTheme();
  const selected = draft?.selected ?? false;
  const substratumSpecies = draft?.species ?? [];

  const allocatedBySpecies = useMemo(() => {
    const map = new Map<number, number>();
    scheduledDates.forEach((scheduledDate) => {
      scheduledDate.species.forEach((s) => {
        map.set(s.speciesId, s.allocatedQuantity);
      });
    });
    return map;
  }, [scheduledDates]);

  // Pre-populate species rows from species targets when the substratum is selected
  useEffect(() => {
    if (!selected) {
      return;
    }
    if (substratumSpecies.length > 0) {
      return;
    }
    const targetsForSubstratum = speciesTargets.filter((t) => t.substratumId === substratum.id);
    if (targetsForSubstratum.length === 0) {
      return;
    }
    onUpdateSubstratumSpecies(substratum.id, () =>
      targetsForSubstratum.map((t) => ({
        speciesId: t.speciesId,
        quantity: 0,
        allocatedQuantity: allocatedBySpecies.get(t.speciesId),
      }))
    );
  }, [
    allocatedBySpecies,
    selected,
    substratum.id,
    substratumSpecies.length,
    speciesTargets,
    onUpdateSubstratumSpecies,
  ]);

  const scheduledOtherBySpecies = useMemo(() => {
    const map = new Map<number, number>();
    scheduledDates.forEach((scheduledDate) => {
      if (scheduledDate.scheduledPlantingDateId === excludeScheduledDateId) {
        return;
      }
      scheduledDate.species.forEach((s) => {
        if (s.substratumId !== substratum.id) {
          return;
        }
        map.set(s.speciesId, (map.get(s.speciesId) ?? 0) + s.quantity);
      });
    });
    return map;
  }, [scheduledDates, excludeScheduledDateId, substratum.id]);

  const targetsBySpecies = useMemo(() => {
    const map = new Map<number, number>();
    speciesTargets.filter((t) => t.substratumId === substratum.id).forEach((t) => map.set(t.speciesId, t.quantity));
    return map;
  }, [speciesTargets, substratum.id]);

  return (
    <Box marginBottom={theme.spacing(1)}>
      <Box display='flex' alignItems='center' gap={theme.spacing(1)}>
        <Checkbox
          checked={selected}
          onChange={(e) => onToggleSubstratum(substratum.id, e.target.checked)}
          sx={{ padding: 0 }}
        />
        <Typography fontSize='16px' fontWeight={500} color={theme.palette.TwClrTxt}>
          {substratum.name}
        </Typography>
      </Box>
      {selected && (
        <Box marginTop={theme.spacing(1)} sx={{ backgroundColor: theme.palette.TwClrBg, borderRadius: '4px' }}>
          <SpeciesTable
            substratumId={substratum.id}
            substratumSpecies={substratumSpecies}
            species={species}
            targetsBySpecies={targetsBySpecies}
            allocatedBySpecies={allocatedBySpecies}
            scheduledOtherBySpecies={scheduledOtherBySpecies}
            onUpdateSubstratumSpecies={onUpdateSubstratumSpecies}
          />
        </Box>
      )}
    </Box>
  );
};

type SpeciesTableProps = {
  substratumId: number;
  substratumSpecies: SpeciesDraft[];
  species: Species[];
  targetsBySpecies: Map<number, number>;
  allocatedBySpecies: Map<number, number>;
  scheduledOtherBySpecies: Map<number, number>;
  onUpdateSubstratumSpecies: (substratumId: number, updater: (species: SpeciesDraft[]) => SpeciesDraft[]) => void;
};

const SpeciesTable = ({
  substratumId,
  substratumSpecies,
  species,
  targetsBySpecies,
  allocatedBySpecies,
  scheduledOtherBySpecies,
  onUpdateSubstratumSpecies,
}: SpeciesTableProps): JSX.Element => {
  const theme = useTheme();
  const [addingSpecies, setAddingSpecies] = useState(false);
  const usedSpeciesIds = useMemo(() => new Set(substratumSpecies.map((s) => s.speciesId)), [substratumSpecies]);
  const availableSpecies = useMemo(() => species.filter((s) => !usedSpeciesIds.has(s.id)), [species, usedSpeciesIds]);

  return (
    <Box>
      <Box
        display='grid'
        gridTemplateColumns='2fr 1fr 1fr 1fr 1fr 40px'
        sx={{ padding: theme.spacing(1, 2), borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}` }}
      >
        <HeaderCell label={strings.SPECIES} />
        <HeaderCell label={strings.QUANTITY_TO_PLANT} tooltip={strings.QUANTITY_TO_PLANT_TOOLTIP} />
        <HeaderCell label={strings.ALLOCATED} tooltip={strings.ALLOCATED_TOOLTIP} />
        <HeaderCell label={strings.AVAILABLE_TO_SCHEDULE} tooltip={strings.AVAILABLE_TO_SCHEDULE_TOOLTIP} />
        <HeaderCell label={strings.LEFT_TO_PLANT} tooltip={strings.LEFT_TO_PLANT_TOOLTIP} />
        <Box />
      </Box>
      {substratumSpecies.map((draft, index) => (
        <SpeciesRow
          key={draft.speciesId}
          substratumId={substratumId}
          draft={draft}
          index={index}
          species={species}
          target={targetsBySpecies.get(draft.speciesId) ?? 0}
          allocated={draft.allocatedQuantity ?? allocatedBySpecies.get(draft.speciesId) ?? 0}
          scheduledOther={scheduledOtherBySpecies.get(draft.speciesId) ?? 0}
          onUpdateSubstratumSpecies={onUpdateSubstratumSpecies}
        />
      ))}
      <Box padding={theme.spacing(1, 2)}>
        {addingSpecies ? (
          <AddSpeciesRow
            substratumId={substratumId}
            availableSpecies={availableSpecies}
            onAdd={(speciesId, quantity) => {
              onUpdateSubstratumSpecies(substratumId, (current) => [
                ...current,
                { speciesId, quantity, allocatedQuantity: allocatedBySpecies.get(speciesId) },
              ]);
              setAddingSpecies(false);
            }}
            onCancel={() => setAddingSpecies(false)}
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
    </Box>
  );
};

type AddSpeciesRowProps = {
  substratumId: number;
  availableSpecies: Species[];
  onAdd: (speciesId: number, quantity: number) => void;
  onCancel: () => void;
};

const AddSpeciesRow = ({ substratumId, availableSpecies, onAdd, onCancel }: AddSpeciesRowProps): JSX.Element => {
  const theme = useTheme();
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<number | undefined>();
  const [quantity, setQuantity] = useState<string>('0');

  const options = useMemo<DropdownItem[]>(
    () =>
      availableSpecies.map((s) => ({
        label: s.scientificName,
        value: s.id,
      })),
    [availableSpecies]
  );

  const onConfirm = () => {
    if (selectedSpeciesId === undefined) {
      return;
    }
    const parsed = Math.max(0, Number(quantity));
    if (Number.isNaN(parsed)) {
      return;
    }
    onAdd(selectedSpeciesId, parsed);
  };

  return (
    <Box display='flex' alignItems='flex-end' gap={theme.spacing(2)} flexWrap='wrap'>
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
          label={strings.QUANTITY_TO_PLANT}
          value={quantity}
          onChange={(value) => setQuantity(String(value ?? ''))}
          min={0}
        />
      </Box>
      <Button label={strings.SAVE} onClick={onConfirm} disabled={selectedSpeciesId === undefined} />
      <Button label={strings.CANCEL} onClick={onCancel} priority='secondary' type='passive' />
    </Box>
  );
};

const HeaderCell = ({ label, tooltip }: { label: string; tooltip?: string }): JSX.Element => {
  const theme = useTheme();
  return (
    <Box display='flex' alignItems='center' gap={theme.spacing(0.5)}>
      <Typography fontSize='14px' fontWeight={600}>
        {label}
      </Typography>
      {tooltip && (
        <Tooltip title={tooltip}>
          <Box display='flex' alignItems='center'>
            <Icon name='info' size='small' fillColor={theme.palette.TwClrIcnSecondary} />
          </Box>
        </Tooltip>
      )}
    </Box>
  );
};

type SpeciesRowProps = {
  substratumId: number;
  draft: SpeciesDraft;
  index: number;
  species: Species[];
  target: number;
  allocated: number;
  scheduledOther: number;
  onUpdateSubstratumSpecies: (substratumId: number, updater: (species: SpeciesDraft[]) => SpeciesDraft[]) => void;
};

const SpeciesRow = ({
  substratumId,
  draft,
  index,
  species,
  target,
  allocated,
  scheduledOther,
  onUpdateSubstratumSpecies,
}: SpeciesRowProps): JSX.Element => {
  const theme = useTheme();
  const [editing, setEditing] = useState(false);
  const [draftQuantity, setDraftQuantity] = useState<string>(draft.quantity.toString());
  const speciesInfo = useMemo(() => species.find((s) => s.id === draft.speciesId), [species, draft.speciesId]);
  const targetRemaining = Math.max(0, target - scheduledOther);
  const availableToSchedule = Math.max(0, allocated - scheduledOther);
  const leftToPlant = Math.max(0, targetRemaining - draft.quantity);
  const exceedsGoal = target > 0 && draft.quantity > targetRemaining;
  const hasNumbers = draft.quantity > 0;

  const commitQuantity = () => {
    const parsed = Math.max(0, Number(draftQuantity));
    const next = Number.isNaN(parsed) ? draft.quantity : parsed;
    if (next !== draft.quantity) {
      onUpdateSubstratumSpecies(substratumId, (current) =>
        current.map((s) => (s.speciesId === draft.speciesId ? { ...s, quantity: next } : s))
      );
    }
    const nextExceedsGoal = target > 0 && next > targetRemaining;
    if (!nextExceedsGoal) {
      setEditing(false);
    }
  };

  const removeRow = () => {
    onUpdateSubstratumSpecies(substratumId, (current) => current.filter((s) => s.speciesId !== draft.speciesId));
  };

  return (
    <Box
      display='grid'
      gridTemplateColumns='2fr 1fr 1fr 1fr 1fr 40px'
      alignItems='center'
      sx={{
        padding: theme.spacing(1, 2),
        backgroundColor: index % 2 === 0 ? theme.palette.TwClrBgSecondary : 'transparent',
      }}
    >
      <Box>
        <Typography fontSize='16px' fontWeight={400}>
          {speciesInfo?.scientificName ?? `#${draft.speciesId}`}
        </Typography>
        {speciesInfo?.commonName && (
          <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary}>
            {speciesInfo.commonName}
          </Typography>
        )}
      </Box>
      <Box display='flex' alignItems='center' gap={theme.spacing(1)}>
        {editing ? (
          <TextField
            id={`quantity-${substratumId}-${draft.speciesId}`}
            type='number'
            label=''
            value={draftQuantity}
            onChange={(value) => setDraftQuantity(String(value ?? ''))}
            onBlur={commitQuantity}
            min={0}
            errorText={exceedsGoal ? strings.EXCEEDS_GOAL : ''}
            autoFocus
          />
        ) : (
          <>
            <Typography fontSize='16px' fontWeight={400}>
              {draft.quantity.toLocaleString()}
            </Typography>
            <Button
              icon='iconEdit'
              onClick={() => {
                setDraftQuantity(draft.quantity.toString());
                setEditing(true);
              }}
              priority='ghost'
              size='small'
              type='passive'
            />
          </>
        )}
      </Box>
      <Typography fontSize='14px'>{hasNumbers ? allocated.toLocaleString() : ''}</Typography>
      <Typography fontSize='14px'>{hasNumbers ? availableToSchedule.toLocaleString() : ''}</Typography>
      <Typography fontSize='14px'>{hasNumbers ? leftToPlant.toLocaleString() : ''}</Typography>
      <Button icon='iconTrashCan' onClick={removeRow} priority='ghost' size='small' type='passive' />
    </Box>
  );
};

export default PlantingDatesTab;
