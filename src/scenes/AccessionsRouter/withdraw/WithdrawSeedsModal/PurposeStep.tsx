import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, FormControlLabel, Grid, Radio, RadioGroup, Tooltip, Typography, useTheme } from '@mui/material';
import { Dropdown, Icon, SelectT, Textfield } from '@terraware/web-components';

import DatePicker from 'src/components/common/DatePicker';
import Select from 'src/components/common/Select/Select';
import { useLocalization, useOrganization } from 'src/providers/hooks';
import { useListBatchesForNurseryQuery } from 'src/queries/search/batches';
import { treatments, withdrawalTypes } from 'src/types/Accession';
import { SearchNodePayload } from 'src/types/Search';
import { OrganizationUser } from 'src/types/User';
import { getAllNurseries } from 'src/utils/organization';
import { renderUser } from 'src/utils/renderUser';
import { getSubstratesAccordingToType } from 'src/utils/viabilityTest';
import { withdrawalPurposes } from 'src/utils/withdrawalPurposes';

import { AccessionWithdrawInfo, WithdrawDraft, WithdrawPurpose } from './types';

type PurposeStepProps = {
  accessions: AccessionWithdrawInfo[];
  isBulk: boolean;
  draft: WithdrawDraft;
  onChange: (next: Partial<WithdrawDraft>) => void;
  fieldErrors: Record<string, string | undefined>;
  setFieldError: (id: string, error?: string) => void;
  onChangeDate: (id: 'date' | 'readyByDate', value: unknown) => void;
  timeZone: string;
  users?: OrganizationUser[];
  userCanEdit: boolean;
};

const PurposeStep = ({
  accessions,
  isBulk,
  draft,
  onChange,
  fieldErrors,
  setFieldError,
  onChangeDate,
  timeZone,
  users,
  userCanEdit,
}: PurposeStepProps): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();
  const { selectedOrganization } = useOrganization();

  const isNursery = draft.purpose === 'Nursery';
  const isViability = draft.purpose === 'Viability Testing';

  const speciesId = accessions[0]?.speciesId;
  const destinationFacilityId = draft.destinationFacilityId ?? -1;

  const nurseries = useMemo(
    () => (selectedOrganization ? getAllNurseries(selectedOrganization) : []),
    [selectedOrganization]
  );
  const hasNoNurseries = nurseries.length === 0;

  const shouldListInventoryBatches =
    !!selectedOrganization?.id && destinationFacilityId > 0 && !!speciesId && isNursery;

  const inventoryBatchSearchFields = useMemo<SearchNodePayload[]>(
    () => (speciesId ? [{ operation: 'field', field: 'species_id', type: 'Exact', values: [String(speciesId)] }] : []),
    [speciesId]
  );

  const { currentData: inventoryBatches } = useListBatchesForNurseryQuery(
    {
      organizationId: selectedOrganization?.id ?? -1,
      nurseryId: destinationFacilityId,
      searchFields: inventoryBatchSearchFields,
      sortOrder: { field: 'batchNumber', direction: 'Descending' },
    },
    { skip: !shouldListInventoryBatches }
  );

  const inventoryBatchesForSpecies = useMemo(
    () =>
      [...(inventoryBatches ?? [])]
        .filter((batch) => Number(batch.species_id) === speciesId)
        .sort((a, b) => b.batchNumber.localeCompare(a.batchNumber, undefined, { numeric: true })),
    [inventoryBatches, speciesId]
  );

  const selectedInventoryBatch = useMemo(
    () => inventoryBatchesForSpecies.find((batch) => Number(batch.id) === draft.batchId),
    [draft.batchId, inventoryBatchesForSpecies]
  );

  // The editable batch field is controlled by the raw typed text; batchId is only set on an exact
  // match. Keep the text in sync with a batch that resolves from a persisted batchId (e.g. after
  // navigating back to this step).
  const [inventoryBatchInput, setInventoryBatchInput] = useState('');
  useEffect(() => {
    if (selectedInventoryBatch) {
      setInventoryBatchInput(selectedInventoryBatch.batchNumber);
    }
  }, [selectedInventoryBatch]);

  const clearInventoryBatch = useCallback(() => {
    setInventoryBatchInput('');
    setFieldError('inventoryBatch', undefined);
  }, [setFieldError]);

  const onChangePurpose = useCallback(
    (_: React.ChangeEvent<HTMLInputElement>, value: string) => {
      clearInventoryBatch();
      onChange({ purpose: value as WithdrawPurpose });
    },
    [clearInventoryBatch, onChange]
  );

  const onChangeDestination = useCallback(
    (value: unknown) => {
      clearInventoryBatch();
      onChange({ destinationFacilityId: Number(value), batchId: undefined });
    },
    [clearInventoryBatch, onChange]
  );

  const onChangeInventoryBatch = useCallback(
    (value: string) => {
      setInventoryBatchInput(value);
      const trimmed = value.trim();
      const match = inventoryBatchesForSpecies.find((batch) => batch.batchNumber === trimmed);
      onChange({ batchId: match ? Number(match.id) : undefined });
      // A typed value that matches no batch would otherwise submit as "no batch" and silently
      // create a duplicate; flag it so the flow can't proceed until it's fixed or cleared.
      setFieldError('inventoryBatch', trimmed && !match ? strings.INVALID_VALUE : undefined);
    },
    [inventoryBatchesForSpecies, onChange, setFieldError, strings]
  );

  const onChangeUser = useCallback(
    (newValue: OrganizationUser) => onChange({ withdrawnByUserId: newValue.id }),
    [onChange]
  );

  const isEqualUsers = useCallback((a: OrganizationUser, b: OrganizationUser) => a.id === b.id, []);
  const toTUser = useCallback((firstName: string) => ({ firstName }) as OrganizationUser, []);

  const labelWithTooltip = (text: string, tooltip: string) => (
    <Box display='flex' alignItems='center' gap={0.5}>
      {text}
      <Tooltip title={tooltip}>
        <Box display='flex' alignItems='center'>
          <Icon name='info' size='small' fillColor={theme.palette.TwClrIcnSecondary} />
        </Box>
      </Tooltip>
    </Box>
  );

  return (
    <Grid container textAlign='left' spacing={2}>
      <Grid item xs={12}>
        <Typography color={theme.palette.TwClrTxtSecondary} fontSize={14}>
          {`${strings.PURPOSE} *`}
        </Typography>
        <RadioGroup row name='withdraw-purpose' value={draft.purpose} onChange={onChangePurpose}>
          {withdrawalPurposes().map((option) => {
            const viabilityDisabled = option.value === 'Viability Testing' && isBulk;
            const nurseryDisabled = option.value === 'Nursery' && hasNoNurseries;
            const label = viabilityDisabled
              ? labelWithTooltip(option.label, strings.VIABILITY_NOT_AVAILABLE_BULK)
              : nurseryDisabled
                ? labelWithTooltip(option.label, strings.NURSERY_WITHDRAWAL_REQUIRES_NURSERY)
                : option.label;
            return (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio />}
                disabled={viabilityDisabled || nurseryDisabled}
                label={label}
              />
            );
          })}
        </RadioGroup>
      </Grid>

      {isNursery && (
        <>
          <Grid item xs={12} sm={6}>
            <Dropdown
              id='destinationFacilityId'
              label={strings.DESTINATION_REQUIRED}
              selectedValue={destinationFacilityId > 0 ? destinationFacilityId.toString() : ''}
              options={nurseries.map((nursery) => ({
                label: nursery.name,
                value: nursery.id.toString(),
              }))}
              onChange={onChangeDestination}
              errorText={fieldErrors.destinationFacilityId}
              fullWidth
            />
          </Grid>
          {inventoryBatchesForSpecies.length > 0 && (
            <Grid item xs={12} sm={6}>
              <Select
                id='inventoryBatch'
                selectedValue={inventoryBatchInput}
                onChange={onChangeInventoryBatch}
                options={inventoryBatchesForSpecies.map((batch) => batch.batchNumber)}
                label={strings.INVENTORY_BATCH}
                aria-label={strings.INVENTORY_BATCH}
                errorText={fieldErrors.inventoryBatch}
                editable
                fullWidth
                hideArrow
              />
            </Grid>
          )}
        </>
      )}

      {isViability && !isBulk && (
        <>
          <Grid item xs={12} sm={6}>
            <Dropdown
              label={strings.TEST_TYPE}
              placeholder={strings.SELECT}
              options={withdrawalTypes()}
              onChange={(value) => onChange({ testType: value })}
              selectedValue={draft.testType}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Dropdown
              label={strings.SUBSTRATE}
              placeholder={strings.SELECT}
              options={getSubstratesAccordingToType(draft.testType)}
              onChange={(value) => onChange({ substrate: value })}
              selectedValue={draft.substrate}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Dropdown
              label={strings.TREATMENT}
              placeholder={strings.SELECT}
              options={treatments()}
              onChange={(value) => onChange({ treatment: value })}
              selectedValue={draft.treatment}
              fullWidth
            />
          </Grid>
        </>
      )}

      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <DatePicker
              id='date'
              label={strings.WITHDRAW_DATE}
              aria-label={strings.WITHDRAW_DATE}
              value={draft.date}
              onChange={(value) => onChangeDate('date', value)}
              errorText={fieldErrors.date}
              defaultTimeZone={timeZone}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <SelectT<OrganizationUser>
              label={strings.WITHDRAWN_BY}
              placeholder={strings.SELECT}
              options={users}
              onChange={onChangeUser}
              isEqual={isEqualUsers}
              renderOption={renderUser}
              displayLabel={renderUser}
              selectedValue={users?.find((userSel) => userSel.id === draft.withdrawnByUserId)}
              toT={toTUser}
              fullWidth
              disabled={!userCanEdit}
            />
          </Grid>
        </Grid>
      </Grid>

      {isNursery && (
        <Grid item xs={12} sm={6}>
          <DatePicker
            id='readyByDate'
            label={strings.ESTIMATED_READY_DATE}
            aria-label={strings.ESTIMATED_READY_DATE}
            value={draft.readyByDate}
            onChange={(value) => onChangeDate('readyByDate', value)}
            errorText={fieldErrors.readyByDate}
            defaultTimeZone={timeZone}
          />
        </Grid>
      )}

      <Grid item xs={12}>
        <Textfield
          id='notes'
          value={draft.notes}
          onChange={(value) => onChange({ notes: value as string })}
          type='textarea'
          label={strings.NOTES_OPTIONAL}
        />
      </Grid>
    </Grid>
  );
};

export default PurposeStep;
