import React, { type JSX, useEffect, useState } from 'react';

import { Close } from '@mui/icons-material';
import { Box, Grid, IconButton, Typography, useTheme } from '@mui/material';
import { Button, Checkbox, DialogBox, SelectT, Textfield } from '@terraware/web-components';
import { Dropdown } from '@terraware/web-components';
import { preventDefaultEvent, useDeviceInfo } from '@terraware/web-components/utils';
import getDateDisplayValue, { getTodaysDateFormatted, isInTheFuture } from '@terraware/web-components/utils/date';

import TooltipLearnMoreModal, {
  LearnMoreLink,
  LearnMoreModalContentSeedType,
  LearnMoreModalContentSubstrate,
  LearnMoreModalContentTreatment,
  TooltipLearnMoreModalData,
} from 'src/components/TooltipLearnMoreModal';
import AddLink from 'src/components/common/AddLink';
import DatePicker from 'src/components/common/DatePicker';
import { useOrganization } from 'src/providers/hooks';
import { OrganizationUserService } from 'src/services';
import AccessionService, { ViabilityTestPostRequest } from 'src/services/AccessionService';
import strings from 'src/strings';
import { Accession } from 'src/types/Accession';
import { TEST_TYPES, seedTypes, testMethods, treatments } from 'src/types/Accession';
import { ViabilityTest } from 'src/types/Accession';
import { Facility } from 'src/types/Facility';
import { OrganizationUser, User } from 'src/types/User';
import { getSeedBank, isContributor } from 'src/utils/organization';
import { renderUser } from 'src/utils/renderUser';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';
import { useLocationTimeZone } from 'src/utils/useTimeZoneUtils';
import { getSubstratesAccordingToType } from 'src/utils/viabilityTest';

import ViabilityResultModal from './ViabilityResultModal';

export interface NewViabilityTestModalProps {
  open: boolean;
  accession: Accession;
  onClose: () => void;
  reload: () => void;
  user: User;
  viabilityTest: ViabilityTest | undefined;
}

export default function NewViabilityTestModal(props: NewViabilityTestModalProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { onClose, open, accession, user, reload, viabilityTest } = props;

  const [record, setRecord, onChange, onChangeCallback] = useForm(viabilityTest);
  const [users, setUsers] = useState<OrganizationUser[]>();
  const [testCompleted, setTestCompleted] = useState<boolean>(false);
  const [totalSeedsTested, setTotalSeedsTested] = useState(0);
  const [openViabilityResultModal, setOpenViabilityResultModal] = useState(false);
  const [savedRecord, setSavedRecord] = useState<ViabilityTest>();
  const contributor = isContributor(selectedOrganization);
  const snackbar = useSnackbar();
  const theme = useTheme();
  const [validateFields, setValidateFields] = useState<boolean>(false);
  const [viabilityFieldsErrors, setViabilityFieldsErrors] = useState<{ [key: string]: string | undefined }>({});
  const [selectedSeedBank, setSelectedSeedBank] = useState<Facility>();
  const tz = useLocationTimeZone().get(selectedSeedBank);

  const readOnly = !!viabilityTest?.endDate && !!(viabilityTest?.testResults && viabilityTest?.testResults?.length > 0);
  const { isMobile } = useDeviceInfo();

  const [tooltipLearnMoreModalOpen, setTooltipLearnMoreModalOpen] = useState(false);
  const [tooltipLearnMoreModalData, setTooltipLearnMoreModalData] = useState<TooltipLearnMoreModalData | undefined>(
    undefined
  );
  const openTooltipLearnMoreModal = (data: TooltipLearnMoreModalData) => {
    setTooltipLearnMoreModalData(data);
    setTooltipLearnMoreModalOpen(true);
  };
  const handleTooltipLearnMoreModalClose = () => {
    setTooltipLearnMoreModalOpen(false);
  };

  useEffect(() => {
    if (accession.facilityId) {
      const accessionSeedBank = selectedOrganization
        ? getSeedBank(selectedOrganization, accession.facilityId)
        : undefined;
      setSelectedSeedBank(accessionSeedBank);
    }
  }, [selectedOrganization, accession.facilityId]);

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
    const newViabilityTest: ViabilityTestPostRequest = {
      testResults: [],
      withdrawnByUserId: user.id,
      testType: 'Lab',
      seedsTested: 0,
      startDate: getTodaysDateFormatted(tz.id),
    };

    const initViabilityTest = () => {
      if (viabilityTest) {
        return viabilityTest;
      } else {
        return {
          ...newViabilityTest,
          id: -1,
          accessionId: accession.id,
          testType: 'Lab' as TEST_TYPES,
        };
      }
    };

    setRecord(initViabilityTest());

    if (viabilityTest?.testType === 'Cut') {
      setTotalSeedsTested(
        (viabilityTest.seedsEmpty || 0) + (viabilityTest.seedsFilled || 0) + (viabilityTest.seedsCompromised || 0)
      );
    }
  }, [viabilityTest, setRecord, accession, user, tz.id]);

  useEffect(() => {
    const newTestCompleted = viabilityTest?.endDate !== undefined;
    const hasTestResults = viabilityTest?.testResults && viabilityTest?.testResults?.length > 0;
    if (newTestCompleted && hasTestResults && !testCompleted) {
      setTestCompleted(true);
    }
  }, [viabilityTest?.endDate, viabilityTest?.testResults, testCompleted]);

  const setIndividualError = (id: string, error?: string) => {
    setViabilityFieldsErrors((prev) => ({
      ...prev,
      [id]: error,
    }));
  };

  const validateSeedsTested = (value: any): boolean => {
    if (value) {
      if (isNaN(value)) {
        setIndividualError('seedsTested', strings.INVALID_VALUE);
        return false;
      }
      if (record?.id === -1) {
        // only run this validation if creating a new viability test
        if (accession.estimatedCount !== undefined) {
          if (value > accession.estimatedCount) {
            setIndividualError('seedsTested', strings.TOTAL_SEEDS_TESTED_ERROR);
            return false;
          }
        } else {
          setIndividualError('seedsTested', strings.MISSING_SUBSET_WEIGHT_ERROR_VIABILITY_TEST);
          return false;
        }
      } else {
        // only run this validation if editing an existing viability test
        if (viabilityTest && value > (accession.estimatedCount || 0 + viabilityTest.seedsTested)) {
          setIndividualError('seedsTested', strings.TOTAL_SEEDS_TESTED_ERROR);
          return false;
        }
      }
    } else {
      setIndividualError('seedsTested', strings.REQUIRED_FIELD);
      return false;
    }
    setIndividualError('seedsTested', '');
    return true;
  };

  const validateTotalSeedsTested = (value: any): boolean => {
    setIndividualError('totalSeedsTested', '');
    if (value) {
      if (isNaN(value)) {
        setIndividualError('totalSeedsTested', strings.INVALID_VALUE);
        return false;
      }
      if (accession.estimatedCount !== undefined) {
        if (value > accession.estimatedCount) {
          setIndividualError('totalSeedsTested', strings.TOTAL_SEEDS_TESTED_ERROR);
          return false;
        }
      } else {
        setIndividualError('totalSeedsTested', strings.MISSING_SUBSET_WEIGHT_ERROR_VIABILITY_TEST);
        return false;
      }
      return true;
    } else {
      setIndividualError('totalSeedsTested', strings.REQUIRED_FIELD);
      return false;
    }
  };

  const validateSeedsGerminated = () => {
    if (record?.testResults && record?.testResults.length > 0) {
      let totalSeedsGerminated = 0;
      let errorFound = false;
      record?.testResults.forEach((tr, index) => {
        if (!tr.seedsGerminated) {
          setIndividualError(`seedsGerminated${index}`, strings.REQUIRED_FIELD);
          errorFound = true;
        }
        if (isNaN(tr.seedsGerminated)) {
          setIndividualError(`seedsGerminated${index}`, strings.INVALID_VALUE);
          errorFound = true;
        }
        totalSeedsGerminated = totalSeedsGerminated + Number(tr.seedsGerminated);
      });
      if (errorFound) {
        return false;
      }

      if (totalSeedsGerminated > record.seedsTested) {
        const lastIndex = record.testResults.length - 1;
        setIndividualError(`seedsGerminated${lastIndex}`, strings.TOTAL_SEEDS_GERMINATED_ERROR);
        return false;
      }

      // clean all errors
      record?.testResults.forEach((_tr, index) => {
        setIndividualError(`seedsGerminated${index}`, '');
      });
    }
    return true;
  };

  const validateStartDate = () => {
    if (!record?.startDate) {
      setIndividualError('startDate', strings.REQUIRED_FIELD);
      return false;
    } else {
      const startDateMs = new Date(record.startDate).getTime();
      if (isNaN(startDateMs)) {
        setIndividualError('startDate', strings.INVALID_DATE);
        return false;
      } else {
        if (isInTheFuture(record.startDate, tz.id)) {
          setIndividualError('startDate', strings.NO_FUTURE_DATES);
          return false;
        } else {
          if (accession.collectedDate) {
            const collectedDateMs = new Date(accession.collectedDate).getTime();
            if (startDateMs < collectedDateMs) {
              setIndividualError('startDate', strings.VIABILITY_TEST_START_DATE_ERROR);
              return false;
            }
          }
        }
      }
    }
    setIndividualError('startDate', '');
    return true;
  };

  const validateRecordingDate = () => {
    if (record?.testResults && record?.testResults.length > 0) {
      let errorFound = false;
      record?.testResults.forEach((tr, index) => {
        if (!tr.recordingDate) {
          setIndividualError(`recordingDate${index}`, strings.REQUIRED_FIELD);
          errorFound = true;
        }
        const dateMs = new Date(tr.recordingDate).getTime();
        if (isNaN(dateMs)) {
          setIndividualError(`recordingDate${index}`, strings.INVALID_DATE);
          errorFound = true;
        }
        if (isInTheFuture(tr.recordingDate, tz.id)) {
          setIndividualError(`recordingDate${index}`, strings.NO_FUTURE_DATES);
          errorFound = true;
        }
        if (record.startDate) {
          const startDateMs = new Date(record.startDate).getTime();
          if (dateMs < startDateMs) {
            setIndividualError(`recordingDate${index}`, strings.RECORDING_DATE_ERROR);
            errorFound = true;
          }
        }
      });
      if (errorFound) {
        return false;
      }

      // clean all errors
      record?.testResults.forEach((_tr, index) => {
        setIndividualError(`recordingDate${index}`, '');
      });
    }
    return true;
  };

  const MANDATORY_FIELDS = ['testType', 'startDate'] as const;

  const CUT_MANDATORY_FIELDS = ['seedsFilled', 'seedsCompromised', 'seedsEmpty'] as const;

  type MandatoryField = (typeof MANDATORY_FIELDS)[number];
  type MandatoryCutField = (typeof CUT_MANDATORY_FIELDS)[number];

  const hasErrors = () => {
    if (record) {
      const seedTestedError =
        record.testType !== 'Cut' && record?.id === -1 ? !validateSeedsTested(record.seedsTested) : false;
      const totalSeedsTestedError = record.testType === 'Cut' ? !validateTotalSeedsTested(totalSeedsTested) : false;
      const seedsGerminatedError = !validateSeedsGerminated();
      const startDateError = !validateStartDate();
      const recordingDateError = !validateRecordingDate();
      let missingRequiredField = MANDATORY_FIELDS.some((field: MandatoryField) => !record[field]);
      if (record.testResults && record.testResults.length > 0) {
        missingRequiredField =
          missingRequiredField || record.testResults?.some((tr) => !tr.recordingDate || !tr.seedsGerminated);
      } else if (record.testType === 'Cut') {
        missingRequiredField =
          missingRequiredField || CUT_MANDATORY_FIELDS.some((field: MandatoryCutField) => !record[field]);
      }

      return (
        seedTestedError ||
        seedsGerminatedError ||
        totalSeedsTestedError ||
        startDateError ||
        recordingDateError ||
        missingRequiredField
      );
    }
  };

  const saveTest = async () => {
    if (record) {
      if (hasErrors()) {
        setValidateFields(true);
        return;
      }
      if (testCompleted && !readOnly) {
        record.endDate = getTodaysDateFormatted(tz.id);
      }
      const validSubstrates = getSubstratesAccordingToType(record.testType);
      if (!validSubstrates.find((substrate) => substrate.value === record.substrate)) {
        record.substrate = undefined;
      }
      let response;
      if (record.id === -1) {
        response = await AccessionService.createViabilityTest(record, accession.id);
      } else {
        response = await AccessionService.updateViabilityTest(record, accession.id, record.id);
      }
      if (response.requestSucceeded) {
        reload();
        onCloseHandler();
        const cutTestEdited =
          record.testType === 'Cut' &&
          (!viabilityTest ||
            Number(record.seedsFilled) !== Number(viabilityTest.seedsFilled) ||
            Number(record.seedsCompromised) !== Number(viabilityTest.seedsCompromised) ||
            Number(record.seedsTested) !== Number(viabilityTest.seedsTested));
        if ((testCompleted && !readOnly) || cutTestEdited) {
          setSavedRecord({ ...record });
          setOpenViabilityResultModal(true);
        }
      } else {
        snackbar.toastError();
      }
    }
  };

  const onChangeUser = (newValue: OrganizationUser) => {
    onChange('withdrawnByUserId', newValue.id);
  };

  const cleanAllErrors = () => {
    record?.testResults?.forEach((_tr, index) => {
      setIndividualError(`seedsGerminated${index}`, '');
    });
    record?.testResults?.forEach((_tr, index) => {
      setIndividualError(`recordingDate${index}`, '');
    });
    setIndividualError('seedsTested', '');
    setIndividualError('totalSeedsTested', '');
  };

  const onCloseHandler = () => {
    setValidateFields(false);
    setTestCompleted(false);
    cleanAllErrors();
    onClose();
  };

  const onDeleteResult = (index: number) => {
    if (record?.testResults) {
      const updatedResults = [...record.testResults];
      updatedResults.splice(index, 1);
      onChange('testResults', updatedResults);
      if (updatedResults.length === 0) {
        onChange('endDate', undefined);
        setTestCompleted(false);
      }
    }
  };

  const onAddResult = () => {
    if (record) {
      const updatedResults = [...(record.testResults || [])];
      updatedResults.push({ recordingDate: getTodaysDateFormatted(tz.id), seedsGerminated: 0 });

      onChange('testResults', updatedResults);
    }
  };

  const onResultChange = (id: string, value: any, index: number) => {
    if (record?.testResults) {
      let valueToUse = value;
      if (id === 'recordingDate') {
        valueToUse = value ? getDateDisplayValue(value.getTime(), tz.id) : null;
      }
      const updatedResults = [...record.testResults];
      updatedResults[index] = { ...updatedResults[index], [id]: valueToUse as string };
      onChange('testResults', updatedResults);
    }
  };

  const markTestAsComplete = (value: boolean) => {
    setTestCompleted(value);
  };

  const calculateNewTotal = (id: string, value: string) => {
    if (record) {
      switch (id) {
        case 'seedsCompromised':
          return (Number(record.seedsEmpty) || 0) + (Number(record.seedsFilled) || 0) + Number(value);
        case 'seedsFilled':
          return (Number(record.seedsEmpty) || 0) + (Number(record.seedsCompromised) || 0) + Number(value);
        default:
          return (Number(record.seedsFilled) || 0) + (Number(record.seedsCompromised) || 0) + Number(value);
      }
    }
  };

  const onChangeCutValue = (id: string, value: unknown) => {
    if (record && typeof value === 'string') {
      const calculatedTotal = calculateNewTotal(id, value) || 0;
      const newTotal = isNaN(calculatedTotal) ? 0 : calculatedTotal;
      setRecord({ ...record, [id]: value, seedsTested: newTotal });
      setTotalSeedsTested(newTotal);
    }
  };

  const onChangeTestType = (value: TEST_TYPES) => {
    if (record) {
      if (value === 'Cut') {
        setRecord({
          ...record,
          testType: value,
          accessionId: record.accessionId,
          seedsTested: 0,
          testResults: undefined,
        });
      } else {
        setRecord({ ...record, testType: value, accessionId: record?.accessionId });
      }
    }
  };

  const onChangeSeedsTested = (id: string, value: unknown) => {
    validateSeedsTested(Number(value));
    onChange('seedsTested', value);
  };

  const onChangeDate = (id: string, value: any) => {
    const date = value ? getDateDisplayValue(value.getTime(), tz.id) : null;
    onChange(id, date);
  };

  return (
    <>
      {openViabilityResultModal && savedRecord && (
        <ViabilityResultModal
          open={openViabilityResultModal}
          reload={reload}
          accession={accession}
          onClose={() => {
            setOpenViabilityResultModal(false);
          }}
          viabilityTest={savedRecord}
        />
      )}
      <DialogBox
        onClose={onCloseHandler}
        open={open}
        title={record?.id !== -1 ? strings.EDIT_VIABILITY_TEST : strings.ADD_VIABILITY_TEST}
        size='large'
        middleButtons={[
          <Button
            id='cancelNewViabilityTest'
            label={strings.CANCEL}
            type='passive'
            onClick={onCloseHandler}
            priority='secondary'
            key='button-1'
          />,
          <Button id='saveNewViabilityTest' onClick={() => void saveTest()} label={strings.SAVE} key='button-2' />,
        ]}
        scrolled={true}
      >
        <TooltipLearnMoreModal
          content={tooltipLearnMoreModalData?.content}
          onClose={handleTooltipLearnMoreModalClose}
          open={tooltipLearnMoreModalOpen}
          title={tooltipLearnMoreModalData?.title}
        />
        <Grid container item xs={12} spacing={2} textAlign='left'>
          <Grid item xs={12} padding={theme.spacing(1, 3, 1, 5)}>
            <Dropdown
              id={'test-method'}
              options={testMethods()}
              placeholder={strings.SELECT}
              onChange={(value) => onChangeTestType(value as TEST_TYPES)}
              selectedValue={record?.testType}
              fullWidth={true}
              label={strings.TEST_METHOD_REQUIRED}
              disabled={readOnly || record?.id !== -1}
              errorText={validateFields && !record?.testType ? strings.REQUIRED_FIELD : ''}
            />
          </Grid>
          <Grid item padding={theme.spacing(1, 3, 1, 5)} xs={12}>
            <Dropdown
              id={'seed-type'}
              label={strings.SEED_TYPE}
              placeholder={strings.SELECT}
              options={seedTypes()}
              onChange={onChangeCallback('seedType')}
              selectedValue={record?.seedType}
              fullWidth={true}
              disabled={readOnly}
              tooltipTitle={
                <>
                  {strings.TOOLTIP_VIABILITY_TEST_SEED_TYPE}
                  <LearnMoreLink
                    onClick={() =>
                      openTooltipLearnMoreModal({
                        title: strings.SEED_TYPE,
                        content: <LearnMoreModalContentSeedType />,
                      })
                    }
                  />
                </>
              }
            />
          </Grid>
          {record?.testType !== 'Cut' && (
            <>
              <Grid item padding={theme.spacing(1, 3, 1, 5)} xs={12}>
                <Dropdown
                  id={'substrate'}
                  label={strings.SUBSTRATE}
                  placeholder={strings.SELECT}
                  options={getSubstratesAccordingToType(record?.testType)}
                  onChange={onChangeCallback('substrate')}
                  selectedValue={record?.substrate}
                  fullWidth={true}
                  disabled={readOnly}
                  tooltipTitle={
                    <>
                      {strings.TOOLTIP_VIABILITY_TEST_SUBSTRATE}
                      <LearnMoreLink
                        onClick={() =>
                          openTooltipLearnMoreModal({
                            title: strings.SUBSTRATE,
                            content: <LearnMoreModalContentSubstrate />,
                          })
                        }
                      />
                    </>
                  }
                />
              </Grid>
              <Grid item padding={theme.spacing(1, 3, 1, 5)} xs={12}>
                <Dropdown
                  id={'treatment'}
                  label={strings.TREATMENT}
                  placeholder={strings.SELECT}
                  options={treatments()}
                  onChange={onChangeCallback('treatment')}
                  selectedValue={record?.treatment}
                  fullWidth={true}
                  disabled={readOnly}
                  tooltipTitle={
                    <>
                      {strings.TOOLTIP_VIABILITY_TEST_TREATMENT}
                      <LearnMoreLink
                        onClick={() =>
                          openTooltipLearnMoreModal({
                            title: strings.TREATMENT,
                            content: <LearnMoreModalContentTreatment />,
                          })
                        }
                      />
                    </>
                  }
                />
              </Grid>
            </>
          )}
          <Grid item padding={theme.spacing(1, 3, 1, 5)} xs={12}>
            <SelectT<OrganizationUser>
              label={strings.TESTING_STAFF}
              placeholder={strings.SELECT}
              options={users}
              onChange={onChangeUser}
              isEqual={(a: OrganizationUser, b: OrganizationUser) => a.id === b.id}
              renderOption={(option) => renderUser(option, user, contributor)}
              displayLabel={(option) => renderUser(option, user, contributor)}
              selectedValue={users?.find((userSel) => userSel.id === record?.withdrawnByUserId)}
              toT={(firstName: string) =>
                ({
                  firstName,
                }) as OrganizationUser
              }
              fullWidth={true}
              disabled={contributor || readOnly}
            />
          </Grid>

          <Grid item xs={12}>
            <Grid item sx={{ background: theme.palette.TwClrBgSecondary, borderRadius: '16px', padding: 3 }}>
              <Box sx={{ display: isMobile ? 'block' : 'flex', alignItems: 'baseline' }} mb={2}>
                <Grid item xs={12} marginBottom={isMobile ? 1 : 0}>
                  <DatePicker
                    id='startDate'
                    label={record?.testType === 'Cut' ? strings.TEST_DATE_REQUIRED : strings.START_DATE_REQUIRED}
                    aria-label={strings.DATE}
                    value={record?.startDate}
                    onChange={(value) => onChangeDate('startDate', value)}
                    disabled={readOnly || record?.id !== -1}
                    errorText={viabilityFieldsErrors.startDate}
                    defaultTimeZone={tz.id}
                  />
                </Grid>
                <Grid item xs={12} marginLeft={isMobile ? 0 : 1} marginBottom={isMobile ? 1 : 0}>
                  {record?.testType === 'Cut' ? (
                    <Textfield
                      label={strings.NUMBER_OF_SEEDS_FILLED_REQUIRED}
                      type='text'
                      onChange={(value) => onChangeCutValue('seedsFilled', value)}
                      id='seedsFilled'
                      value={record?.seedsFilled}
                      errorText={
                        viabilityFieldsErrors.totalSeedsTested ||
                        (validateFields && !record?.seedsFilled ? strings.REQUIRED_FIELD : '')
                      }
                    />
                  ) : (
                    <Textfield
                      label={strings.NUMBER_OF_SEEDS_TESTED_REQUIRED}
                      type='text'
                      onChange={(value) => onChangeSeedsTested('seedsTested', value)}
                      id='seedsTested'
                      value={record?.seedsTested}
                      disabled={readOnly || record?.id !== -1}
                      errorText={viabilityFieldsErrors.seedsTested}
                    />
                  )}
                </Grid>
              </Box>

              {record?.testType === 'Cut' && (
                <>
                  <Grid item xs={12} display='flex'>
                    <Grid item xs={6}>
                      <Textfield
                        label={strings.NUMBER_OF_SEEDS_COMPROMISED_REQUIRED}
                        type='text'
                        onChange={(value) => onChangeCutValue('seedsCompromised', value)}
                        id='seedsCompromised'
                        value={record?.seedsCompromised}
                        errorText={validateFields && !record?.seedsCompromised ? strings.REQUIRED_FIELD : ''}
                      />
                    </Grid>
                    <Grid item xs={6} marginLeft={1}>
                      <Textfield
                        label={strings.NUMBER_OF_SEEDS_EMPTY_REQUIRED}
                        type='text'
                        onChange={(value) => onChangeCutValue('seedsEmpty', value)}
                        id='seedsEmpty'
                        value={record?.seedsEmpty}
                        errorText={validateFields && !record?.seedsEmpty ? strings.REQUIRED_FIELD : ''}
                      />
                    </Grid>
                  </Grid>
                  <Grid item xs={12} display='flex' alignItems='center' sx={{ paddingTop: 2 }}>
                    <Typography sx={{ color: theme.palette.TwClrTxtSecondary, paddingRight: 1, fontSize: '14px' }}>
                      # {strings.TOTAL_SEEDS_TESTED}:
                    </Typography>
                    <Typography>{totalSeedsTested}</Typography>
                  </Grid>
                </>
              )}

              {record?.testResults?.map((testResult, index) => (
                <Box
                  key={index}
                  mb={2}
                  display={isMobile ? 'block' : 'flex'}
                  alignItems='baseline'
                  marginRight={isMobile ? '24px' : 0}
                >
                  <Grid item xs={12} marginBottom={isMobile ? 1 : 0}>
                    <DatePicker
                      id='recordingDate'
                      label={strings.CHECK_DATE_REQUIRED}
                      aria-label={strings.DATE}
                      value={testResult.recordingDate}
                      onChange={(value) => onResultChange('recordingDate', value, index)}
                      disabled={readOnly}
                      errorText={viabilityFieldsErrors[`recordingDate${index}`]}
                      defaultTimeZone={tz.id}
                    />
                  </Grid>
                  <Grid item xs={12} marginLeft={isMobile ? 0 : 1} display={isMobile ? 'block' : 'flex'}>
                    <Box sx={{ position: 'relative', display: isMobile ? 'block' : 'flex' }}>
                      <Textfield
                        label={strings.NUMBER_OF_SEEDS_GERMINATED_REQUIRED}
                        type='text'
                        onChange={(value) => onResultChange('seedsGerminated', value, index)}
                        id='seedsGerminated'
                        value={testResult.seedsGerminated}
                        disabled={readOnly}
                        errorText={viabilityFieldsErrors[`seedsGerminated${index}`]}
                      />
                      <IconButton
                        id={`delete-result${index}`}
                        aria-label='delete'
                        size='small'
                        disabled={readOnly}
                        onClick={() => onDeleteResult(index)}
                        sx={{
                          marginTop: 3,
                          position: isMobile ? 'absolute' : 'relative',
                          top: isMobile ? '-33px' : 0,
                          right: isMobile ? '-31px' : 0,
                        }}
                      >
                        <Close />
                      </IconButton>
                    </Box>
                  </Grid>
                </Box>
              ))}
              {record?.testType !== 'Cut' && (
                <Box
                  sx={{
                    display: isMobile ? 'block' : 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <AddLink
                    id='addResultButton'
                    onClick={(event: React.SyntheticEvent) => {
                      preventDefaultEvent(event);
                      onAddResult();
                    }}
                    disabled={testCompleted || readOnly}
                    large={true}
                    text={strings.ADD_OBSERVATION}
                  />
                  {record?.testResults && record.testResults.length > 0 && (
                    <Checkbox
                      label={strings.MARK_AS_COMPLETE}
                      onChange={(value) => markTestAsComplete(value)}
                      id='markAsComplete'
                      name='markAsComplete'
                      value={testCompleted}
                      disabled={readOnly}
                      sx={{ marginTop: 0 }}
                    />
                  )}
                </Box>
              )}
            </Grid>
          </Grid>
          <Grid item padding={theme.spacing(1, 3, 1, 5)} xs={12}>
            <Textfield
              id='notes'
              value={record?.notes}
              onChange={onChangeCallback('notes')}
              type='textarea'
              label={strings.NOTES}
            />
          </Grid>
        </Grid>
      </DialogBox>
    </>
  );
}
