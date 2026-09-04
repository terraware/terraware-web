import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, FormControlLabel, Grid, Radio, RadioGroup, Typography, useTheme } from '@mui/material';
import { Dropdown, SelectT, Textfield } from '@terraware/web-components';
import getDateDisplayValue, { getTodaysDateFormatted, isInTheFuture } from '@terraware/web-components/utils/date';

import AddLink from 'src/components/common/AddLink';
import DatePicker from 'src/components/common/DatePicker';
import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Select from 'src/components/common/Select/Select';
import Button from 'src/components/common/button/Button';
import useAccession from 'src/hooks/useAccession';
import { useTrackEvent } from 'src/hooks/useTrackEvent';
import { useTrackModalAbandonment } from 'src/hooks/useTrackModalAbandonment';
import { MIXPANEL_EVENTS } from 'src/mixpanelEvents';
import { useLocalization, useOrganization } from 'src/providers/hooks';
import {
  useCreateNurseryTransferWithdrawalMutation,
  useCreateViabilityTestMutation,
  useCreateWithdrawalMutation,
} from 'src/queries/generated/accessionsV2';
import { useListBatchesForNurseryQuery } from 'src/queries/search/batches';
import CountWithdrawal from 'src/scenes/AccessionsRouter/withdraw/CountWithdrawal';
import WeightWithdrawal from 'src/scenes/AccessionsRouter/withdraw/WeightWithdrawal';
import WithdrawDateWarningModal from 'src/scenes/AccessionsRouter/withdraw/WithdrawDateWarningModal';
import { OrganizationUserService } from 'src/services';
import { ViabilityTestPostRequest } from 'src/services/AccessionService';
import { Accession, Withdrawal, treatments, withdrawalTypes } from 'src/types/Accession';
import { NurseryTransfer } from 'src/types/Batch';
import { Facility } from 'src/types/Facility';
import { SearchNodePayload } from 'src/types/Search';
import { OrganizationUser, User } from 'src/types/User';
import { UnitType, convertUnits } from 'src/units';
import { getAllNurseries, getSeedBank, isContributor } from 'src/utils/organization';
import { renderUser } from 'src/utils/renderUser';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';
import { useLocationTimeZone } from 'src/utils/useTimeZoneUtils';
import { getSubstratesAccordingToType } from 'src/utils/viabilityTest';
import { withdrawalPurposes } from 'src/utils/withdrawalPurposes';

export interface WithdrawDialogProps {
  open: boolean;
  onClose: () => void;
  user: User;
}

export default function WithdrawDialog(props: WithdrawDialogProps): JSX.Element | null {
  const { accessionId } = useParams<{ accessionId: string }>();
  const { accession } = useAccession(Number(accessionId));

  if (!accession) {
    return null;
  }

  return <WithdrawDialogForm {...props} accession={accession} />;
}

interface WithdrawDialogFormProps extends WithdrawDialogProps {
  accession: Accession;
}

function WithdrawDialogForm(props: WithdrawDialogFormProps): JSX.Element {
  const { strings } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const { onClose, open, accession, user } = props;
  const trackEvent = useTrackEvent();
  const markSubmitted = useTrackModalAbandonment('accession_withdraw', open);
  const [createNurseryTransferWithdrawal] = useCreateNurseryTransferWithdrawalMutation();
  const [createViabilityTest] = useCreateViabilityTestMutation();
  const [createWithdrawal] = useCreateWithdrawalMutation();

  const newViabilityTesting: ViabilityTestPostRequest = {
    testType: 'Lab',
    seedsTested: 0,
  };

  const [isNurseryTransfer, setIsNurseryTransfer] = useState<boolean>(true);
  const [viabilityTesting, , , onChangeViabilityCallback] = useForm(newViabilityTesting);
  const [users, setUsers] = useState<OrganizationUser[]>();
  const [isNotesOpened, setIsNotesOpened] = useState(false);
  const [fieldsErrors, setFieldsErrors] = useState<{ [key: string]: string | undefined }>({});
  const theme = useTheme();
  const snackbar = useSnackbar();
  const contributor = isContributor(selectedOrganization);
  const [selectedSeedBank, setSelectedSeedBank] = useState<Facility>();
  const tz = useLocationTimeZone().get(selectedSeedBank);
  const [timeZone, setTimeZone] = useState(tz.id);
  const [isByWeight, setIsByWeight] = useState(accession.remainingQuantity?.units !== 'Seeds');
  const [withdrawalQty, setWithdrawalQty] = useState<number>(0);
  const [withdrawalValid, setWithdrawalValid] = useState<boolean>(false);
  const [withdrawalButtonEnabled, setWithdrawalButtonEnabled] = useState<boolean>(true);
  const [showDateWarning, setShowDateWarning] = useState<boolean>(false);
  const [inventoryBatchNumber, setInventoryBatchNumber] = useState<string>('');

  const newWithdrawal: Withdrawal = useMemo(
    () => ({
      purpose: 'Nursery',
      withdrawnByUserId: user.id,
      date: getTodaysDateFormatted(timeZone),
      withdrawnQuantity: undefined,
      notes: '',
    }),
    [user.id, timeZone]
  );

  const nurseryTransferWithdrawal: NurseryTransfer = useMemo(
    () => ({
      date: getTodaysDateFormatted(timeZone),
      destinationFacilityId: -1,
      germinatingQuantity: 0,
      hardeningOffQuantity: 0,
      notes: '',
      activeGrowthQuantity: 0,
      readyByDate: undefined,
      readyQuantity: 0,
      withdrawnByUserId: user.id,
    }),
    [timeZone, user.id]
  );

  const [record, setRecord, onChange] = useForm(newWithdrawal);
  const [nurseryTransferRecord, setNurseryTransferRecord, onChangeNurseryTransfer] = useForm(nurseryTransferWithdrawal);

  const selectedDestinationFacilityId = Number(nurseryTransferRecord.destinationFacilityId);

  const shouldListInventoryBatches =
    !!selectedOrganization?.id && selectedDestinationFacilityId > 0 && !!accession.speciesId;

  const inventoryBatchSearchFields = useMemo<SearchNodePayload[]>(
    () =>
      accession.speciesId
        ? [
            {
              operation: 'field',
              field: 'species_id',
              type: 'Exact',
              values: [String(accession.speciesId)],
            },
          ]
        : [],
    [accession.speciesId]
  );

  const { currentData: inventoryBatches } = useListBatchesForNurseryQuery(
    {
      organizationId: selectedOrganization?.id ?? -1,
      nurseryId: selectedDestinationFacilityId,
      searchFields: inventoryBatchSearchFields,
      sortOrder: { field: 'batchNumber', direction: 'Descending' },
    },
    { skip: !shouldListInventoryBatches }
  );

  const inventoryBatchesForAccession = useMemo(
    () =>
      [...(inventoryBatches ?? [])]
        .filter((batch) => Number(batch.species_id) === accession.speciesId)
        .sort((a, b) => b.batchNumber.localeCompare(a.batchNumber, undefined, { numeric: true })),
    [accession.speciesId, inventoryBatches]
  );

  const inventoryBatchOptions = useMemo(
    () =>
      inventoryBatchesForAccession
        .filter(
          (batch) =>
            !inventoryBatchNumber ||
            batch.batchNumber.toLocaleLowerCase().includes(inventoryBatchNumber.toLocaleLowerCase())
        )
        .map((batch) => batch.batchNumber),
    [inventoryBatchNumber, inventoryBatchesForAccession]
  );

  const inventoryBatchValue = inventoryBatchNumber.trim();

  const selectedInventoryBatch = useMemo(
    () => inventoryBatchesForAccession.find((batch) => batch.batchNumber === inventoryBatchValue),
    [inventoryBatchValue, inventoryBatchesForAccession]
  );

  const setIndividualError = useCallback((id: string, error?: string) => {
    setFieldsErrors((prev) => ({
      ...prev,
      [id]: error,
    }));
  }, []);

  const onCloseHandler = useCallback(() => {
    setIsNotesOpened(false);
    setRecord(newWithdrawal);
    setNurseryTransferRecord(nurseryTransferWithdrawal);
    setInventoryBatchNumber('');
    onClose();
  }, [newWithdrawal, nurseryTransferWithdrawal, setRecord, setNurseryTransferRecord, onClose]);

  useEffect(() => {
    if (accession.facilityId) {
      const accessionSeedBank = selectedOrganization
        ? getSeedBank(selectedOrganization, accession.facilityId)
        : undefined;
      setSelectedSeedBank(accessionSeedBank);
    }
  }, [selectedOrganization, accession.facilityId]);

  useEffect(() => {
    if (timeZone !== tz.id) {
      setTimeZone(tz.id);
    }
  }, [tz.id, timeZone]);

  useEffect(() => {
    setRecord((previousRecord: Withdrawal): Withdrawal => {
      return {
        ...previousRecord,
        date: getTodaysDateFormatted(timeZone),
      };
    });
  }, [timeZone, setRecord]);

  useEffect(() => {
    if (selectedOrganization) {
      const getOrgUsers = async () => {
        const response = await OrganizationUserService.getOrganizationUsers(selectedOrganization.id);
        if (response.requestSucceeded) {
          setUsers(response.users);
        }
      };
      void getOrgUsers();
    }
  }, [selectedOrganization]);

  useEffect(() => {
    setRecord((previousRecord: Withdrawal): Withdrawal => {
      if (previousRecord.withdrawnQuantity) {
        return {
          ...previousRecord,
          withdrawnQuantity: {
            quantity: previousRecord.withdrawnQuantity?.quantity,
            units:
              isNurseryTransfer || record.purpose === 'Viability Testing' || !isByWeight
                ? 'Seeds'
                : previousRecord.withdrawnQuantity?.units,
          },
        };
      } else {
        return previousRecord;
      }
    });
  }, [record.purpose, isNurseryTransfer, isByWeight, setRecord]);

  const estimatedWithdrawalQty = useMemo(() => {
    let estimated = 0;
    if (isByWeight && accession.subsetCount && accession.subsetWeight) {
      if (
        accession.remainingQuantity?.units &&
        accession.remainingQuantity?.units === 'Seeds' &&
        accession.estimatedWeight?.units
      ) {
        estimated = Math.round(
          convertUnits(withdrawalQty, accession.estimatedWeight?.units, accession.subsetWeight.units) *
            (accession.subsetCount / accession.subsetWeight.quantity)
        );
      } else if (accession.remainingQuantity?.units) {
        estimated = Math.round(
          convertUnits(withdrawalQty, accession.remainingQuantity?.units, accession.subsetWeight.units) *
            (accession.subsetCount / accession.subsetWeight.quantity)
        );
      }
    } else if (!isByWeight) {
      return withdrawalQty;
    }
    return estimated;
  }, [accession, isByWeight, withdrawalQty]);

  const onChangeUser = useCallback(
    (newValue: OrganizationUser) => {
      onChange('withdrawnByUserId', newValue.id);
      onChangeNurseryTransfer('withdrawnByUserId', newValue.id);
    },
    [onChange, onChangeNurseryTransfer]
  );

  const validateDate = useCallback(
    (id: string, value?: any) => {
      if (!value) {
        if (id === 'date') {
          setIndividualError('date', strings.REQUIRED_FIELD);
          return false;
        }
      } else {
        if (isNaN(new Date(value).getTime())) {
          setIndividualError(id, strings.INVALID_DATE);
          return false;
        } else if (isInTheFuture(value, timeZone) && id === 'date') {
          setIndividualError('date', strings.NO_FUTURE_DATES);
          return false;
        } else {
          setIndividualError(id, '');
          return true;
        }
      }
    },
    [setIndividualError, strings, timeZone]
  );

  const onChangeDate = useCallback(
    (id: string, value?: any) => {
      const date = value ? getDateDisplayValue(value.getTime(), timeZone) : null;
      const valid = validateDate(id, value);
      if (valid) {
        if (id === 'date') {
          onChange(id, date);
        }
        onChangeNurseryTransfer(id, date);
      }
    },
    [timeZone, validateDate, onChange, onChangeNurseryTransfer]
  );

  const onChangeNotes = useCallback(
    (id: string, value: unknown) => {
      onChangeNurseryTransfer(id, value);
      onChange(id, value);
    },
    [onChangeNurseryTransfer, onChange]
  );

  const validateInventoryBatch = useCallback(() => {
    if (!isNurseryTransfer || !inventoryBatchValue || inventoryBatchesForAccession.length === 0) {
      setIndividualError('inventoryBatch', '');
      return true;
    }

    if (!selectedInventoryBatch) {
      setIndividualError('inventoryBatch', strings.INVALID_VALUE);
      return false;
    }

    setIndividualError('inventoryBatch', '');
    return true;
  }, [
    inventoryBatchesForAccession.length,
    inventoryBatchValue,
    isNurseryTransfer,
    selectedInventoryBatch,
    setIndividualError,
    strings,
  ]);

  const saveWithdrawalHandler = useCallback(async () => {
    setWithdrawalButtonEnabled(false);
    try {
      if (record) {
        if (isNurseryTransfer && nurseryTransferRecord.destinationFacilityId === -1) {
          trackEvent(MIXPANEL_EVENTS.FORM_VALIDATION_FAILED, {
            form_name: 'accession_withdraw',
            error_count: 1,
            fields_with_errors: ['destinationFacilityId'],
          });
          setIndividualError('destinationFacilityId', strings.REQUIRED_FIELD);
          return;
        }
        if (isNurseryTransfer && !validateInventoryBatch()) {
          trackEvent(MIXPANEL_EVENTS.FORM_VALIDATION_FAILED, {
            form_name: 'accession_withdraw',
            error_count: 1,
            fields_with_errors: ['inventoryBatch'],
          });
          return;
        }
        if (fieldsErrors.date || (isNurseryTransfer && fieldsErrors.readyByDate)) {
          const errored: string[] = [];
          if (fieldsErrors.date) {
            errored.push('date');
          }
          if (isNurseryTransfer && fieldsErrors.readyByDate) {
            errored.push('readyByDate');
          }
          trackEvent(MIXPANEL_EVENTS.FORM_VALIDATION_FAILED, {
            form_name: 'accession_withdraw',
            error_count: errored.length,
            fields_with_errors: errored,
          });
          return;
        }

        try {
          if (isNurseryTransfer) {
            await createNurseryTransferWithdrawal({
              accessionId: accession.id,
              createNurseryTransferRequestPayload: {
                ...nurseryTransferRecord,
                batchId: selectedInventoryBatch?.id ? Number(selectedInventoryBatch.id) : undefined,
                germinatingQuantity: estimatedWithdrawalQty,
              },
            }).unwrap();
          } else if (record.purpose === 'Viability Testing') {
            viabilityTesting.seedsTested = estimatedWithdrawalQty;
            viabilityTesting.startDate = record.date;
            await createViabilityTest({
              accessionId: accession.id,
              createViabilityTestRequestPayload: viabilityTesting,
            }).unwrap();
          } else {
            let units: UnitType;
            if (isByWeight) {
              if (accession.remainingQuantity?.units === 'Seeds') {
                units = 'Grams';
              } else {
                units = accession.remainingQuantity?.units || 'Grams';
              }
            } else {
              units = 'Seeds';
            }
            record.withdrawnQuantity = { quantity: withdrawalQty, units };
            await createWithdrawal({
              accessionId: accession.id,
              createWithdrawalRequestPayload: record,
            }).unwrap();
          }

          trackEvent(MIXPANEL_EVENTS.ACCESSION_WITHDRAWN, {
            purpose: isNurseryTransfer ? 'Nursery' : record.purpose || 'Other',
            quantity: estimatedWithdrawalQty,
          });
          markSubmitted();
          onCloseHandler();
        } catch {
          trackEvent(MIXPANEL_EVENTS.SAVE_FAILED, { entity_type: 'accession_withdrawal' });
          snackbar.toastError();
        }
      }
    } finally {
      setWithdrawalButtonEnabled(true);
    }
  }, [
    accession.id,
    accession.remainingQuantity?.units,
    createNurseryTransferWithdrawal,
    createViabilityTest,
    createWithdrawal,
    estimatedWithdrawalQty,
    fieldsErrors,
    isByWeight,
    isNurseryTransfer,
    nurseryTransferRecord,
    onCloseHandler,
    record,
    markSubmitted,
    selectedInventoryBatch?.id,
    setIndividualError,
    snackbar,
    strings,
    trackEvent,
    validateInventoryBatch,
    viabilityTesting,
    withdrawalQty,
  ]);

  const handleSaveWithdrawal = useCallback(() => {
    // check if withdrawal date predates the accession received date
    if (record.date && accession.receivedDate) {
      const withdrawalDate = new Date(record.date);
      const receivedDate = new Date(accession.receivedDate);

      if (withdrawalDate < receivedDate) {
        setShowDateWarning(true);
        return;
      }
    }

    void saveWithdrawalHandler();
  }, [saveWithdrawalHandler, record.date, accession.receivedDate]);

  const handleContinueWithdrawal = useCallback(() => {
    setShowDateWarning(false);
    void saveWithdrawalHandler();
  }, [saveWithdrawalHandler]);

  const handleCancelWarning = useCallback(() => {
    setShowDateWarning(false);
  }, []);

  const onWithdrawCtUpdate = useCallback(
    (withdrawnQuantity: number, valid: boolean) => {
      if (withdrawnQuantity) {
        setWithdrawalQty(withdrawnQuantity);
      }
      setWithdrawalValid(valid);
    },
    [setWithdrawalQty, setWithdrawalValid]
  );

  const onChangePurpose = useCallback(
    (value: string) => {
      const nurseryTransfer = value === 'Nursery';
      if (nurseryTransfer) {
        setIsNurseryTransfer(true);
      } else {
        setIsNurseryTransfer(false);
        onChange('purpose', value);
      }
    },
    [onChange, setIsNurseryTransfer]
  );

  const onChangeReadyByDate = useCallback((value: any) => onChangeDate('readyByDate', value), [onChangeDate]);

  const onChangeDateHandler = useCallback((value: any) => onChangeDate('date', value), [onChangeDate]);

  const onChangeNotesHandler = useCallback((value: unknown) => onChangeNotes('notes', value), [onChangeNotes]);

  const onClickAddNotes = useCallback(() => setIsNotesOpened(true), []);

  const onChangeDestination = useCallback(
    (value: unknown) => {
      onChangeNurseryTransfer('destinationFacilityId', Number(value));
      setInventoryBatchNumber('');
      setIndividualError('destinationFacilityId', '');
      setIndividualError('inventoryBatch', '');
    },
    [onChangeNurseryTransfer, setIndividualError]
  );

  const onChangeInventoryBatch = useCallback(
    (value: string) => {
      setInventoryBatchNumber(value);

      const typedValue = value.trim();
      if (!typedValue || inventoryBatchesForAccession.some((batch) => batch.batchNumber === typedValue)) {
        setIndividualError('inventoryBatch', '');
      }
    },
    [inventoryBatchesForAccession, setIndividualError]
  );

  const isEqualUsers = useCallback((a: OrganizationUser, b: OrganizationUser) => a.id === b.id, []);

  const toTUser = useCallback(
    (firstName: string) =>
      ({
        firstName,
      }) as OrganizationUser,
    []
  );

  const onChangeWithdrawBy = useCallback(
    (_: React.ChangeEvent<HTMLInputElement>, value: string) => {
      setIndividualError('withdrawnQuantity', '');
      setIsByWeight(value === 'weight');
    },
    [setIndividualError, setIsByWeight]
  );

  return (
    <>
      {showDateWarning && (
        <WithdrawDateWarningModal onClose={handleCancelWarning} onContinue={handleContinueWithdrawal} />
      )}
      <DialogBox
        onClose={onCloseHandler}
        open={open}
        title={strings.WITHDRAW_SEEDS}
        size='medium'
        middleButtons={[
          <Button
            id='cancelWithdraw'
            label={strings.CANCEL}
            type='passive'
            onClick={onCloseHandler}
            priority='secondary'
            key='button-1'
          />,
          <Button
            id='saveWithdraw'
            onClick={handleSaveWithdrawal}
            label={strings.WITHDRAW}
            key='button-2'
            disabled={!withdrawalValid || !withdrawalButtonEnabled}
          />,
        ]}
        scrolled={true}
      >
        <Grid container textAlign='left'>
          <Grid item xs={12} paddingBottom={2}>
            <Dropdown
              label={strings.PURPOSE}
              placeholder={strings.SELECT}
              options={withdrawalPurposes()}
              onChange={onChangePurpose}
              selectedValue={isNurseryTransfer ? 'Nursery' : record?.purpose}
              fullWidth={true}
            />
          </Grid>
          {isNurseryTransfer ? (
            <>
              <Grid item xs={12} paddingBottom={2}>
                <Dropdown
                  id='destinationFacilityId'
                  label={strings.DESTINATION_REQUIRED}
                  selectedValue={nurseryTransferRecord.destinationFacilityId.toString()}
                  options={(selectedOrganization ? getAllNurseries(selectedOrganization) : []).map((nursery) => ({
                    label: nursery.name,
                    value: nursery.id.toString(),
                  }))}
                  onChange={onChangeDestination}
                  errorText={fieldsErrors.destinationFacilityId}
                  fullWidth={true}
                />
              </Grid>
              {inventoryBatchesForAccession.length > 0 && (
                <Grid item xs={12} paddingBottom={2}>
                  <Select
                    id='inventoryBatch'
                    selectedValue={inventoryBatchNumber}
                    onChange={onChangeInventoryBatch}
                    options={inventoryBatchOptions}
                    label={strings.INVENTORY_BATCH}
                    aria-label={strings.INVENTORY_BATCH}
                    editable={true}
                    errorText={fieldsErrors.inventoryBatch}
                    fullWidth={true}
                    hideArrow={true}
                    onBlur={validateInventoryBatch}
                  />
                </Grid>
              )}
            </>
          ) : null}
          {record.purpose === 'Viability Testing' && !isNurseryTransfer ? (
            <>
              <Grid item xs={12} paddingBottom={2}>
                <Dropdown
                  label={strings.TEST_TYPE}
                  placeholder={strings.SELECT}
                  options={withdrawalTypes()}
                  onChange={onChangeViabilityCallback('testType')}
                  selectedValue={viabilityTesting?.testType}
                  fullWidth={true}
                />
              </Grid>
              <Grid item xs={12} paddingBottom={2}>
                <Dropdown
                  label={strings.SUBSTRATE}
                  placeholder={strings.SELECT}
                  options={getSubstratesAccordingToType(viabilityTesting?.testType)}
                  onChange={onChangeViabilityCallback('substrate')}
                  selectedValue={viabilityTesting.substrate}
                  fullWidth={true}
                />
              </Grid>
              <Grid item xs={12} paddingBottom={2}>
                <Dropdown
                  label={strings.TREATMENT}
                  placeholder={strings.SELECT}
                  options={treatments()}
                  onChange={onChangeViabilityCallback('treatment')}
                  selectedValue={viabilityTesting.treatment}
                  fullWidth={true}
                />
              </Grid>
            </>
          ) : null}
          <Box
            sx={{
              borderTop: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
              borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
              paddingTop: theme.spacing(2),
              marginBottom: theme.spacing(2),
            }}
          >
            <Grid item xs={12} textAlign='left'>
              <Typography color={theme.palette.TwClrTxtSecondary} display='flex' fontSize={14}>
                {strings.WITHDRAW_BY}
              </Typography>
              <RadioGroup
                name='radio-buttons-withdraw-by'
                defaultValue={accession.remainingQuantity?.units === 'Seeds' ? 'count' : 'weight'}
                onChange={onChangeWithdrawBy}
              >
                <Grid item xs={12} textAlign='left' display='flex' flexDirection='row'>
                  <FormControlLabel value='count' control={<Radio />} label={strings.SEED_COUNT} />
                  <FormControlLabel value='weight' control={<Radio />} label={strings.SEED_WEIGHT} />
                </Grid>
              </RadioGroup>
            </Grid>
            {isByWeight ? (
              <WeightWithdrawal
                accession={accession}
                purpose={isNurseryTransfer ? 'Nursery' : record.purpose}
                onWithdrawCtUpdate={onWithdrawCtUpdate}
              />
            ) : (
              <CountWithdrawal accession={accession} onWithdrawCtUpdate={onWithdrawCtUpdate} />
            )}
          </Box>
          <Grid item xs={12} paddingBottom={2}>
            <SelectT<OrganizationUser>
              label={strings.WITHDRAWN_BY}
              placeholder={strings.SELECT}
              options={users}
              onChange={onChangeUser}
              isEqual={isEqualUsers}
              renderOption={renderUser}
              displayLabel={renderUser}
              selectedValue={users?.find((userSel) => userSel.id === record.withdrawnByUserId)}
              toT={toTUser}
              fullWidth={true}
              disabled={contributor}
            />
          </Grid>
          {isNurseryTransfer ? (
            <>
              <Grid item xs={12} marginBottom={theme.spacing(2)}>
                <DatePicker
                  id='readyByDate'
                  label={strings.ESTIMATED_READY_DATE}
                  aria-label={strings.ESTIMATED_READY_DATE}
                  value={nurseryTransferRecord.readyByDate}
                  onChange={onChangeReadyByDate}
                  errorText={fieldsErrors.readyByDate}
                  defaultTimeZone={timeZone}
                />
              </Grid>
            </>
          ) : null}
          <Grid item xs={12}>
            <DatePicker
              id='date'
              label={strings.DATE}
              aria-label={strings.DATE}
              value={record.date}
              onChange={onChangeDateHandler}
              errorText={fieldsErrors.date}
              defaultTimeZone={timeZone}
            />
          </Grid>
          <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
            {isNotesOpened ? (
              <Textfield
                id='notes'
                value={record.notes}
                onChange={onChangeNotesHandler}
                type='textarea'
                label={strings.NOTES}
              />
            ) : (
              <Box display='flex' justifyContent='flex-start'>
                <AddLink id='addNotes' onClick={onClickAddNotes} text={strings.ADD_NOTES} large={true} />
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogBox>
    </>
  );
}
