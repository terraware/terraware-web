import React, { type JSX, useCallback, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { BusySpinner, Dropdown, DropdownItem, Textfield } from '@terraware/web-components';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import useOrganizationPlantingSites from 'src/hooks/useOrganizationPlantingSites';
import { useOrganizationSpecies } from 'src/hooks/useOrganizationSpecies';
import { useGetDeliveryQuery, useReassignDeliveryMutation } from 'src/queries/generated/deliveries';
import { PlantingSitePayload } from 'src/queries/generated/plantingSites';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';
import useSnackbar from 'src/utils/useSnackbar';

export type ReassignSeedlingsModalProps = {
  deliveryId: number;
  onClose: () => void;
};

type ReassignmentRow = {
  plantingId: number;
  speciesId: number;
  numPlants: number;
  originalSubstratumId: number;
};

type RowState = {
  newSiteId?: number;
  newStratumId?: number;
  newSubstratumId?: number;
  quantity?: number;
  error?: string;
};

export default function ReassignSeedlingsModal({ deliveryId, onClose }: ReassignSeedlingsModalProps): JSX.Element {
  const theme = useTheme();
  const snackbar = useSnackbar();
  const numberFormatter = useNumberFormatter();

  const getDeliveryResponse = useGetDeliveryQuery(deliveryId);
  const delivery = useMemo(() => getDeliveryResponse.currentData?.delivery, [getDeliveryResponse]);

  const { plantingSites } = useOrganizationPlantingSites({ full: true });
  const { findSpeciesById } = useOrganizationSpecies();

  const [reassignDelivery, { isLoading }] = useReassignDeliveryMutation();

  const [rowStates, setRowStates] = useState<Record<number, RowState>>({});
  const [notes, setNotes] = useState('');
  const [noReassignments, setNoReassignments] = useState(false);

  const rows: ReassignmentRow[] = useMemo(
    () =>
      (delivery?.plantings ?? [])
        .filter((planting) => planting.type === 'Delivery' && planting.substratumId !== undefined)
        .map((planting) => ({
          plantingId: planting.id,
          speciesId: planting.speciesId,
          numPlants: planting.numPlants,
          originalSubstratumId: planting.substratumId as number,
        })),
    [delivery]
  );

  const originalSite = useMemo(
    () => plantingSites.find((site) => site.id === delivery?.plantingSiteId),
    [plantingSites, delivery]
  );

  const { originalStratumName, originalSubstratumName } = useMemo(() => {
    const originalSubstratumId = rows[0]?.originalSubstratumId;
    const stratum = originalSite?.strata?.find((str) => str.substrata.some((sub) => sub.id === originalSubstratumId));
    const substratum = stratum?.substrata.find((sub) => sub.id === originalSubstratumId);
    return { originalStratumName: stratum?.name ?? '', originalSubstratumName: substratum?.name ?? '' };
  }, [originalSite, rows]);

  const getSpeciesName = useCallback(
    (speciesId: number): string => {
      const species = findSpeciesById(speciesId);
      if (!species?.scientificName) {
        return '';
      }
      return species.commonName ? `${species.scientificName} (${species.commonName})` : species.scientificName;
    },
    [findSpeciesById]
  );

  const updateRow = useCallback((plantingId: number, patch: Partial<RowState>) => {
    setNoReassignments(false);
    setRowStates((current) => ({ ...current, [plantingId]: { ...current[plantingId], ...patch } }));
  }, []);

  const onQuantityChange = useCallback(
    (plantingId: number, numPlants: number, value: unknown) => {
      if (value === '' || value === undefined || value === null) {
        updateRow(plantingId, { quantity: undefined, error: undefined });
        return;
      }
      const quantity = Number(value);
      const error = isNaN(quantity) || quantity < 0 || quantity > numPlants ? strings.INVALID_VALUE : undefined;
      updateRow(plantingId, { quantity, error });
    },
    [updateRow]
  );

  const hasError = useMemo(() => Object.values(rowStates).some((row) => row.error !== undefined), [rowStates]);

  const validReassignments = useMemo(
    () =>
      rows
        .map((row) => ({ row, state: rowStates[row.plantingId] }))
        .filter(
          ({ state }) => state && !state.error && state.newSubstratumId !== undefined && Number(state.quantity) > 0
        ),
    [rows, rowStates]
  );

  const onReassign = useCallback(async () => {
    if (hasError) {
      return;
    }
    if (validReassignments.length === 0) {
      setNoReassignments(true);
      return;
    }

    try {
      await reassignDelivery({
        id: deliveryId,
        reassignDeliveryRequestPayload: {
          reassignments: validReassignments.map(({ row, state }) => ({
            fromPlantingId: row.plantingId,
            numPlants: state.quantity as number,
            toSubstratumId: state.newSubstratumId,
            notes: notes.trim() || undefined,
          })),
        },
      }).unwrap();
      snackbar.toastSuccess(strings.REASSIGNMENT_SUCESSFUL);
      onClose();
    } catch {
      snackbar.toastError();
    }
  }, [deliveryId, hasError, notes, onClose, reassignDelivery, snackbar, validReassignments]);

  const isLoaded = delivery !== undefined && originalSite !== undefined;

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      title={strings.REASSIGN_SEEDLINGS}
      size='x-large'
      scrolled
      middleButtons={[
        <Button
          id='cancelReassignSeedlings'
          key='cancel'
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          onClick={onClose}
          disabled={isLoading}
        />,
        <Button
          id='reassignSeedlings'
          key='reassign'
          label={strings.REASSIGN}
          onClick={() => void onReassign()}
          disabled={isLoading || !isLoaded || hasError}
        />,
      ]}
    >
      {(isLoading || !isLoaded) && <BusySpinner withSkrim />}
      {isLoaded && (
        <Box display='flex' flexDirection='column' textAlign='left'>
          <Typography color={theme.palette.TwClrTxt} marginBottom={theme.spacing(3)}>
            {strings.REASSIGN_SEEDLINGS_MODAL_DESCRIPTION}
          </Typography>

          <Box
            sx={{
              backgroundColor: theme.palette.TwClrBgSecondary,
              padding: theme.spacing(2),
              display: 'flex',
              flexWrap: 'wrap',
              gap: theme.spacing(1, 3),
              marginBottom: theme.spacing(2),
            }}
          >
            <LabelledValue label={strings.ORIGINAL_PLANTING_SITE} value={originalSite?.name ?? ''} />
            <LabelledValue label={strings.STRATUM} value={originalStratumName} />
            <LabelledValue label={strings.SUBSTRATUM} value={originalSubstratumName} />
          </Box>

          {noReassignments && (
            <Typography color={theme.palette.TwClrTxtDanger} marginBottom={theme.spacing(2)}>
              {strings.NO_REASSIGNMENTS_TEXT}
            </Typography>
          )}

          {rows.map((row) => (
            <ReassignmentSpeciesSection
              key={row.plantingId}
              row={row}
              speciesName={getSpeciesName(row.speciesId)}
              siteLabel={rows.length === 1 ? strings.NEW_PLANTING_SITE : strings.NEW_SITE}
              plantingSites={plantingSites}
              state={rowStates[row.plantingId] ?? {}}
              numberFormatter={numberFormatter}
              onSiteChange={(newSiteId) =>
                updateRow(row.plantingId, { newSiteId, newStratumId: undefined, newSubstratumId: undefined })
              }
              onStratumChange={(newStratumId) =>
                updateRow(row.plantingId, { newStratumId, newSubstratumId: undefined })
              }
              onSubstratumChange={(newSubstratumId) => updateRow(row.plantingId, { newSubstratumId })}
              onQuantityChange={(value) => onQuantityChange(row.plantingId, row.numPlants, value)}
            />
          ))}

          <Textfield
            id='reassignNotes'
            type='textarea'
            label={strings.NOTES_OPTIONAL}
            value={notes}
            onChange={(value) => setNotes((value as string) ?? '')}
            styles={{ textarea: { minHeight: '76px' } }}
          />
        </Box>
      )}
    </DialogBox>
  );
}

type LabelledValueProps = {
  label: string;
  value: string;
};

const LabelledValue = ({ label, value }: LabelledValueProps): JSX.Element => {
  const theme = useTheme();
  return (
    <Box display='flex' gap={theme.spacing(1)}>
      <Typography color={theme.palette.TwClrTxtSecondary}>{label}</Typography>
      <Typography color={theme.palette.TwClrBaseBlack}>{value}</Typography>
    </Box>
  );
};

type ReassignmentSpeciesSectionProps = {
  row: ReassignmentRow;
  speciesName: string;
  siteLabel: string;
  plantingSites: PlantingSitePayload[];
  state: RowState;
  numberFormatter: ReturnType<typeof useNumberFormatter>;
  onSiteChange: (newSiteId: number) => void;
  onStratumChange: (newStratumId: number) => void;
  onSubstratumChange: (newSubstratumId: number) => void;
  onQuantityChange: (value: unknown) => void;
};

const ReassignmentSpeciesSection = ({
  row,
  speciesName,
  siteLabel,
  plantingSites,
  state,
  numberFormatter,
  onSiteChange,
  onStratumChange,
  onSubstratumChange,
  onQuantityChange,
}: ReassignmentSpeciesSectionProps): JSX.Element => {
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();

  const gridColumns = isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr)) auto';

  const siteOptions: DropdownItem[] = useMemo(
    () =>
      plantingSites
        .filter((site) => (site.strata ?? []).length > 0)
        .map((site) => ({ label: site.name, value: site.id })),
    [plantingSites]
  );

  const selectedSite = useMemo(
    () => plantingSites.find((site) => site.id === state.newSiteId),
    [plantingSites, state.newSiteId]
  );

  const stratumOptions: DropdownItem[] = useMemo(
    () => (selectedSite?.strata ?? []).map((stratum) => ({ label: stratum.name, value: stratum.id })),
    [selectedSite]
  );

  const selectedStratum = useMemo(
    () => selectedSite?.strata?.find((stratum) => stratum.id === state.newStratumId),
    [selectedSite, state.newStratumId]
  );

  const substratumOptions: DropdownItem[] = useMemo(
    () =>
      (selectedStratum?.substrata ?? [])
        .filter((substratum) => substratum.id !== row.originalSubstratumId)
        .map((substratum) => ({ label: substratum.name, value: substratum.id })),
    [selectedStratum, row.originalSubstratumId]
  );

  return (
    <Box
      sx={{
        border: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
        marginBottom: theme.spacing(2),
      }}
    >
      <Box
        sx={{
          backgroundColor: theme.palette.TwClrBgSecondary,
          padding: theme.spacing(1, 2),
          borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
        }}
      >
        <Typography color={theme.palette.TwClrTxt}>{speciesName}</Typography>
      </Box>
      {!isMobile && (
        <Box
          sx={{
            backgroundColor: theme.palette.TwClrBgSecondary,
            padding: theme.spacing(1, 2),
            display: 'grid',
            gridTemplateColumns: gridColumns,
            gap: theme.spacing(2),
          }}
        >
          <Typography color={theme.palette.TwClrTxt} fontSize={'14px'} fontWeight={600}>
            {siteLabel}
          </Typography>
          <Typography color={theme.palette.TwClrTxt} fontSize={'14px'} fontWeight={600}>
            {strings.NEW_STRATUM}
          </Typography>
          <Typography color={theme.palette.TwClrTxt} fontSize={'14px'} fontWeight={600}>
            {strings.NEW_SUBSTRATUM}
          </Typography>
          <Typography color={theme.palette.TwClrTxt} fontSize={'14px'} fontWeight={600}>
            {strings.REASSIGN}
          </Typography>
        </Box>
      )}
      <Box
        sx={{
          padding: theme.spacing(1),
          display: 'grid',
          gridTemplateColumns: gridColumns,
          gap: theme.spacing(2),
          alignItems: 'flex-start',
        }}
      >
        <Dropdown
          id={`newSite_${row.plantingId}`}
          label={isMobile ? siteLabel : ''}
          placeholder={strings.SELECT}
          options={siteOptions}
          selectedValue={state.newSiteId}
          onChange={(value) => onSiteChange(Number(value))}
          fullWidth
          fixedMenu
        />
        <Dropdown
          id={`newStratum_${row.plantingId}`}
          label={isMobile ? strings.NEW_STRATUM : ''}
          placeholder={strings.SELECT}
          options={stratumOptions}
          selectedValue={state.newStratumId}
          onChange={(value) => onStratumChange(Number(value))}
          disabled={!selectedSite}
          fullWidth
          fixedMenu
        />
        <Dropdown
          id={`newSubstratum_${row.plantingId}`}
          label={isMobile ? strings.NEW_SUBSTRATUM : ''}
          placeholder={strings.SELECT}
          options={substratumOptions}
          selectedValue={state.newSubstratumId}
          onChange={(value) => onSubstratumChange(Number(value))}
          disabled={substratumOptions.length === 0}
          fullWidth
          fixedMenu
        />
        <Box display='flex' alignItems='flex-start'>
          <Textfield
            id={`reassignQuantity_${row.plantingId}`}
            type='number'
            min={0}
            max={row.numPlants}
            label={isMobile ? strings.REASSIGN : ''}
            value={state.quantity?.toString() ?? ''}
            errorText={state.error}
            onChange={onQuantityChange}
            sx={{ maxWidth: '96px' }}
          />
          <Typography
            color={theme.palette.TwClrBaseBlack}
            paddingLeft={1}
            paddingTop={isMobile ? (state.error ? '38px' : '34px') : '10px'}
            whiteSpace='nowrap'
          >
            /{numberFormatter.format(row.numPlants)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
