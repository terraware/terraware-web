import React, { type JSX, useEffect, useMemo, useState } from 'react';

import { Box, Checkbox, Divider, IconButton, Typography, useTheme } from '@mui/material';
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

const compareSpeciesScientificNames = (
  speciesById: Map<number, Species>,
  firstSpeciesId: number,
  secondSpeciesId: number
): number => {
  const firstName = speciesById.get(firstSpeciesId)?.scientificName ?? `#${firstSpeciesId}`;
  const secondName = speciesById.get(secondSpeciesId)?.scientificName ?? `#${secondSpeciesId}`;
  return firstName.localeCompare(secondName) || firstSpeciesId - secondSpeciesId;
};

const PlantingDatesTab = ({ plantingSeason, plantingSite }: PlantingDatesTabProps): JSX.Element => {
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const { species } = useSpeciesData();
  const { data: scheduledDatesData } = useGetScheduledPlantingDatesQuery(plantingSeason.id);
  const { data: speciesTargetsData } = useGetSpeciesTargetsQuery(plantingSeason.id);

  const [editing, setEditing] = useState<EditingState | undefined>();

  const readOnly = plantingSeason.status === 'Closed';
  const scheduledDates = scheduledDatesData?.scheduledDates ?? [];
  const speciesTargets = speciesTargetsData?.targets ?? [];
  const mobileAddDateButtonSx = isMobile
    ? {
        borderRadius: '28px',
        borderWidth: '2px',
        fontSize: '16px',
        fontWeight: 600,
        justifyContent: 'center',
        minHeight: '52px',
        width: '100%',
      }
    : undefined;

  return (
    <Card flushMobile style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      {scheduledDates.length === 0 && !editing ? (
        <EmptyState onAdd={() => setEditing({ mode: 'add' })} readOnly={readOnly} />
      ) : (
        <>
          <Box
            display='flex'
            flexDirection={isMobile ? 'column' : 'row'}
            alignItems={isMobile ? 'stretch' : 'center'}
            justifyContent='space-between'
            gap={isMobile ? theme.spacing(3) : theme.spacing(2)}
            marginBottom={theme.spacing(2)}
          >
            <Typography
              fontSize={isMobile ? '16px' : '14px'}
              lineHeight={isMobile ? '24px' : undefined}
              color={theme.palette.TwClrTxtSecondary}
            >
              {strings.PLANTING_DATES_TAB_DESCRIPTION}
            </Typography>
            {!editing && !readOnly && (
              <Button
                icon='plus'
                label={strings.ADD_DATE}
                onClick={() => setEditing({ mode: 'add' })}
                priority='secondary'
                type='productive'
                size={isMobile ? 'medium' : undefined}
                sx={mobileAddDateButtonSx}
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
  const { isMobile } = useDeviceInfo();
  const mobileAddPlantingDateButtonSx = isMobile
    ? {
        borderRadius: '28px',
        borderWidth: '2px',
        fontSize: '16px',
        fontWeight: 600,
        justifyContent: 'center',
        minHeight: '52px',
        width: '100%',
      }
    : undefined;

  if (isMobile) {
    return (
      <Box display='flex' flexDirection='column' alignItems='stretch' gap={theme.spacing(3)}>
        <Typography fontSize='16px' lineHeight='24px' color={theme.palette.TwClrTxtSecondary}>
          {strings.PLANTING_DATES_TAB_DESCRIPTION}
        </Typography>
        {!readOnly && (
          <Button
            icon='plus'
            label={strings.ADD_PLANTING_DATE}
            onClick={onAdd}
            priority='secondary'
            type='productive'
            size='medium'
            sx={mobileAddPlantingDateButtonSx}
          />
        )}
      </Box>
    );
  }

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

type SpeciesDraft = {
  id: string;
  speciesId?: number;
  quantity: number;
  quantityInput?: string;
  allocatedQuantity?: number;
  isNew?: boolean;
};
type SubstratumDraft = { selected: boolean; species: SpeciesDraft[] };

const getSpeciesDraftQuantity = (draft: SpeciesDraft): number =>
  Math.max(0, Number(draft.quantityInput ?? draft.quantity));

const quantityTextFieldSx = {
  width: '208px',
  maxWidth: '100%',
  minWidth: 0,
  '& .textfield-error-text': {
    minWidth: 0,
  },
};

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
  const { isMobile } = useDeviceInfo();
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
          id: `${s.substratumId}-${s.speciesId}`,
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

  const mobileFooterButtonSx = isMobile
    ? {
        borderRadius: '28px',
        borderWidth: '2px',
        fontSize: '16px',
        fontWeight: 600,
        justifyContent: 'center',
        margin: 0,
        minHeight: '52px',
        width: '100%',
      }
    : undefined;
  const tooltipButtonWrapperStyle = isMobile ? { display: 'block', width: '100%' } : undefined;

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
      return draft.species.flatMap((s) => {
        const quantity = getSpeciesDraftQuantity(s);
        if (s.speciesId === undefined || Number.isNaN(quantity) || quantity <= 0) {
          return [];
        }
        return [
          {
            quantity,
            speciesId: s.speciesId,
            substratumId,
          },
        ];
      });
    });
  };

  const hasNewSpeciesDraftErrors = useMemo(() => {
    const targetsBySubstratumAndSpecies = new Map<string, number>();
    speciesTargets.forEach((target) => {
      targetsBySubstratumAndSpecies.set(`${target.substratumId}-${target.speciesId}`, target.quantity);
    });

    const scheduledOtherBySubstratumAndSpecies = new Map<string, number>();
    scheduledDates.forEach((scheduledDate) => {
      if (scheduledDate.scheduledPlantingDateId === editingScheduledDate?.scheduledPlantingDateId) {
        return;
      }
      scheduledDate.species.forEach((scheduledSpecies) => {
        const key = `${scheduledSpecies.substratumId}-${scheduledSpecies.speciesId}`;
        scheduledOtherBySubstratumAndSpecies.set(
          key,
          (scheduledOtherBySubstratumAndSpecies.get(key) ?? 0) + scheduledSpecies.quantity
        );
      });
    });

    return Object.entries(substrataDrafts).some(([substratumIdStr, substratumDraft]) => {
      if (!substratumDraft.selected) {
        return false;
      }
      return substratumDraft.species.some((speciesDraft) => {
        if (!speciesDraft.isNew || speciesDraft.speciesId === undefined) {
          return false;
        }
        const key = `${substratumIdStr}-${speciesDraft.speciesId}`;
        const target = targetsBySubstratumAndSpecies.get(key) ?? 0;
        const scheduledOther = scheduledOtherBySubstratumAndSpecies.get(key) ?? 0;
        const quantity = getSpeciesDraftQuantity(speciesDraft);
        return target > 0 && !Number.isNaN(quantity) && quantity > Math.max(0, target - scheduledOther);
      });
    });
  }, [editingScheduledDate?.scheduledPlantingDateId, scheduledDates, speciesTargets, substrataDrafts]);

  const performSave = async (notifyOptions?: { note: string }) => {
    if (!date) {
      setValidate(true);
      return false;
    }
    if (hasNewSpeciesDraftErrors) {
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

      <Box
        display='flex'
        flexDirection={isMobile ? 'column' : 'row'}
        alignItems={isMobile ? 'stretch' : 'center'}
        justifyContent='flex-end'
        gap={isMobile ? theme.spacing(1.5) : theme.spacing(1)}
        marginTop={theme.spacing(2)}
      >
        {isEditing && (
          <Button
            label={strings.DELETE}
            onClick={() => void onDelete()}
            priority='secondary'
            type='destructive'
            disabled={isSaving}
            size={isMobile ? 'medium' : undefined}
            sx={mobileFooterButtonSx}
          />
        )}
        <Button
          label={strings.CANCEL}
          onClick={onClose}
          priority='secondary'
          type='passive'
          disabled={isSaving}
          size={isMobile ? 'medium' : undefined}
          sx={mobileFooterButtonSx}
        />
        <Tooltip title={strings.SAVE_TOOLTIP}>
          <span style={tooltipButtonWrapperStyle}>
            <Button
              label={strings.SAVE}
              onClick={() => void onSave()}
              priority='secondary'
              type={isMobile ? 'passive' : 'productive'}
              disabled={isSaving || hasNewSpeciesDraftErrors}
              size={isMobile ? 'medium' : undefined}
              sx={mobileFooterButtonSx}
            />
          </span>
        </Tooltip>
        <Tooltip title={strings.SAVE_AND_REQUEST_TOOLTIP} slotProps={{ tooltip: { sx: { maxWidth: '262px' } } }}>
          <span style={tooltipButtonWrapperStyle}>
            <Button
              label={strings.SAVE_AND_REQUEST}
              onClick={() => setNotifyModalOpen(true)}
              disabled={isSaving || !date || hasNewSpeciesDraftErrors}
              priority={isMobile ? 'secondary' : 'primary'}
              size={isMobile ? 'medium' : undefined}
              sx={mobileFooterButtonSx}
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
        id: `${substratum.id}-${t.speciesId}`,
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
  const { isMobile } = useDeviceInfo();
  const usedSpeciesIds = useMemo(
    () =>
      new Set(
        substratumSpecies.map((s) => s.speciesId).filter((speciesId): speciesId is number => speciesId !== undefined)
      ),
    [substratumSpecies]
  );
  const speciesById = useMemo(() => new Map(species.map((s) => [s.id, s])), [species]);
  const availableSpecies = useMemo(
    () =>
      species
        .filter((s) => !usedSpeciesIds.has(s.id))
        .sort((a, b) => compareSpeciesScientificNames(speciesById, a.id, b.id)),
    [species, speciesById, usedSpeciesIds]
  );
  const sortedSubstratumSpecies = useMemo(
    () =>
      substratumSpecies
        .filter((draft): draft is SpeciesDraft & { speciesId: number } => !draft.isNew && draft.speciesId !== undefined)
        .sort((a, b) => compareSpeciesScientificNames(speciesById, a.speciesId, b.speciesId)),
    [speciesById, substratumSpecies]
  );
  const newSpeciesDrafts = useMemo(() => substratumSpecies.filter((draft) => draft.isNew), [substratumSpecies]);

  const addSpeciesDraft = () => {
    onUpdateSubstratumSpecies(substratumId, (current) => [
      ...current,
      { id: `new-species-${crypto.randomUUID()}`, quantity: 0, quantityInput: '0', isNew: true },
    ]);
  };

  return (
    <Box sx={{ overflowX: isMobile ? 'auto' : 'visible', WebkitOverflowScrolling: 'touch' }}>
      <Box minWidth={isMobile ? '600px' : undefined}>
        <Box
          display='grid'
          gridTemplateColumns='2fr 1fr 1fr 40px'
          sx={{ padding: theme.spacing(1, 2), borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}` }}
        >
          <HeaderCell label={strings.SPECIES} />
          <HeaderCell label={strings.QUANTITY_TO_PLANT} tooltip={strings.QUANTITY_TO_PLANT_TOOLTIP} />
          <HeaderCell label={strings.AVAILABLE_TO_SCHEDULE} tooltip={strings.AVAILABLE_TO_SCHEDULE_TOOLTIP} />
          <Box />
        </Box>
        {sortedSubstratumSpecies.map((draft, index) => (
          <SpeciesRow
            key={draft.id}
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
        {newSpeciesDrafts.map((draft) => (
          <Box key={draft.id} padding={theme.spacing(1, 2)}>
            <AddSpeciesRow
              substratumId={substratumId}
              draft={draft}
              species={species}
              availableSpecies={availableSpecies}
              targetsBySpecies={targetsBySpecies}
              scheduledOtherBySpecies={scheduledOtherBySpecies}
              allocatedBySpecies={allocatedBySpecies}
              onChange={(updatedDraft) =>
                onUpdateSubstratumSpecies(substratumId, (current) =>
                  current.map((currentDraft) => (currentDraft.id === draft.id ? updatedDraft : currentDraft))
                )
              }
              onRemove={() =>
                onUpdateSubstratumSpecies(substratumId, (current) =>
                  current.filter((currentDraft) => currentDraft.id !== draft.id)
                )
              }
            />
          </Box>
        ))}
        <Box padding={theme.spacing(1, 2)}>
          <Button
            icon='iconAdd'
            label={strings.ADD_SPECIES}
            onClick={addSpeciesDraft}
            priority='ghost'
            type='productive'
            disabled={availableSpecies.length === 0}
          />
        </Box>
      </Box>
    </Box>
  );
};

type AddSpeciesRowProps = {
  substratumId: number;
  draft: SpeciesDraft;
  species: Species[];
  availableSpecies: Species[];
  targetsBySpecies: Map<number, number>;
  scheduledOtherBySpecies: Map<number, number>;
  allocatedBySpecies: Map<number, number>;
  onChange: (draft: SpeciesDraft) => void;
  onRemove: () => void;
};

const AddSpeciesRow = ({
  substratumId,
  draft,
  species,
  availableSpecies,
  targetsBySpecies,
  scheduledOtherBySpecies,
  allocatedBySpecies,
  onChange,
  onRemove,
}: AddSpeciesRowProps): JSX.Element => {
  const theme = useTheme();
  const selectedSpeciesId = draft.speciesId;
  const target = selectedSpeciesId === undefined ? 0 : targetsBySpecies.get(selectedSpeciesId) ?? 0;
  const scheduledOther = selectedSpeciesId === undefined ? 0 : scheduledOtherBySpecies.get(selectedSpeciesId) ?? 0;
  const availableToSchedule = Math.max(0, target - scheduledOther);
  const quantity = draft.quantityInput ?? draft.quantity.toString();
  const parsedQuantity = getSpeciesDraftQuantity(draft);
  const quantityToValidate = Number.isNaN(parsedQuantity) ? 0 : parsedQuantity;
  const exceedsGoal = selectedSpeciesId !== undefined && target > 0 && quantityToValidate > availableToSchedule;
  const selectedSpecies = selectedSpeciesId === undefined ? undefined : species.find((s) => s.id === selectedSpeciesId);

  const options = useMemo<DropdownItem[]>(() => {
    const speciesOptions = selectedSpecies ? [selectedSpecies, ...availableSpecies] : availableSpecies;
    return speciesOptions.map((s) => ({
      label: s.scientificName,
      value: s.id,
    }));
  }, [availableSpecies, selectedSpecies]);

  const onSpeciesChange = (value: string | number) => {
    const speciesId = Number(value);
    onChange({
      ...draft,
      speciesId,
      allocatedQuantity: allocatedBySpecies.get(speciesId),
    });
  };

  const onQuantityChange = (value: unknown) => {
    const quantityInput = String(value ?? '');
    const parsed = getSpeciesDraftQuantity({ ...draft, quantityInput });
    onChange({
      ...draft,
      quantity: Number.isNaN(parsed) ? 0 : parsed,
      quantityInput,
    });
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
          onChange={onSpeciesChange}
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
          onChange={onQuantityChange}
          min={0}
          errorText={exceedsGoal ? strings.EXCEEDS_GOAL : ''}
          sx={quantityTextFieldSx}
        />
      </Box>
      <IconButton aria-label={strings.REMOVE} size='small' onClick={onRemove}>
        <Icon name='iconSubtract' size='medium' fillColor={theme.palette.TwClrIcn} />
      </IconButton>
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
  scheduledOther,
  onUpdateSubstratumSpecies,
}: SpeciesRowProps): JSX.Element => {
  const theme = useTheme();
  const [editing, setEditing] = useState(false);
  const [quantityFocused, setQuantityFocused] = useState(false);
  const [draftQuantity, setDraftQuantity] = useState<string>(draft.quantity.toString());
  const speciesInfo = useMemo(() => species.find((s) => s.id === draft.speciesId), [species, draft.speciesId]);
  const availableToSchedule = Math.max(0, target - scheduledOther);
  const parsedDraftQuantity = Math.max(0, Number(draftQuantity));
  const quantityToValidate = Number.isNaN(parsedDraftQuantity) ? draft.quantity : parsedDraftQuantity;
  const exceedsGoal = target > 0 && quantityToValidate > availableToSchedule;
  const hasNumbers = draft.quantity > 0;

  const commitQuantity = () => {
    setQuantityFocused(false);
    const parsed = Math.max(0, Number(draftQuantity));
    const next = Number.isNaN(parsed) ? draft.quantity : parsed;
    if (next !== draft.quantity) {
      onUpdateSubstratumSpecies(substratumId, (current) =>
        current.map((s) => (s.speciesId === draft.speciesId ? { ...s, quantity: next } : s))
      );
    }
    setEditing(false);
  };

  const removeRow = () => {
    onUpdateSubstratumSpecies(substratumId, (current) => current.filter((s) => s.speciesId !== draft.speciesId));
  };

  return (
    <Box
      display='grid'
      gridTemplateColumns='2fr 1fr 1fr 40px'
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
            onFocus={() => setQuantityFocused(true)}
            min={0}
            errorText={quantityFocused && exceedsGoal ? strings.EXCEEDS_GOAL : ''}
            autoFocus
            sx={quantityTextFieldSx}
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
      <Typography fontSize='14px'>{hasNumbers ? availableToSchedule.toLocaleString() : ''}</Typography>
      <Button icon='iconTrashCan' onClick={removeRow} priority='ghost' size='small' type='passive' />
    </Box>
  );
};

export default PlantingDatesTab;
