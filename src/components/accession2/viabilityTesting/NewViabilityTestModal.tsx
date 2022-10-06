import { Box, Grid, IconButton, Link, Typography, useTheme } from '@mui/material';
import { Button, Checkbox, DatePicker, DialogBox, Select, SelectT, Textfield } from '@terraware/web-components';
import { Accession2 } from 'src/api/accessions2/accession';
import { putViabilityTest, ViabilityTestPostRequest } from 'src/api/accessions2/viabilityTest';
import strings from 'src/strings';
import useForm from 'src/utils/useForm';
import { Dropdown } from '@terraware/web-components';
import {
  LAB_SUBSTRATES,
  NURSERY_SUBSTRATES,
  SEED_TYPES,
  TEST_METHODS,
  TEST_TYPES,
  TREATMENTS,
} from 'src/types/Accession';
import { OrganizationUser, User } from 'src/types/User';
import { ServerOrganization } from 'src/types/Organization';
import { useEffect, useState } from 'react';
import { getOrganizationUsers } from 'src/api/organization/organization';
import { isContributor } from 'src/utils/organization';
import { postViabilityTest } from 'src/api/accessions2/viabilityTest';
import useSnackbar from 'src/utils/useSnackbar';
import { renderUser } from 'src/utils/renderUser';
import { Close } from '@mui/icons-material';
import { preventDefaultEvent } from '@terraware/web-components/utils';
import { getTodaysDateFormatted, isInTheFuture } from '@terraware/web-components/utils';
import { ViabilityTest } from 'src/api/types/accessions';
import ViabilityResultModal from './ViabilityResultModal';

export interface NewViabilityTestModalProps {
  open: boolean;
  accession: Accession2;
  onClose: () => void;
  reload: () => void;
  organization: ServerOrganization;
  user: User;
  viabilityTest: ViabilityTest | undefined;
}

export default function NewViabilityTestModal(props: NewViabilityTestModalProps): JSX.Element {
  const { onClose, open, accession, organization, user, reload, viabilityTest } = props;

  const [record, setRecord, onChange] = useForm(viabilityTest);
  const [users, setUsers] = useState<OrganizationUser[]>();
  const [testCompleted, setTestCompleted] = useState<boolean>(viabilityTest?.endDate !== undefined);
  const [totalSeedsTested, setTotalSeedsTested] = useState(0);
  const [openViabilityResultModal, setOpenViabilityResultModal] = useState(false);
  const [savedRecord, setSavedRecord] = useState<ViabilityTest>();
  const contributor = isContributor(organization);
  const snackbar = useSnackbar();
  const theme = useTheme();
  const [validateFields, setValidateFields] = useState<boolean>(false);
  const [viabilityFieldsErrors, setViabilityFieldsErrors] = useState<{ [key: string]: string | undefined }>({});

  const readOnly = !!viabilityTest?.endDate;

  useEffect(() => {
    const getOrgUsers = async () => {
      const response = await getOrganizationUsers(organization);
      if (response.requestSucceeded) {
        setUsers(response.users);
      }
    };
    getOrgUsers();
  }, [organization]);

  useEffect(() => {
    const newViabilityTest: ViabilityTestPostRequest = {
      testResults: [],
      withdrawnByUserId: user.id,
      testType: 'Lab',
      seedsTested: 0,
      startDate: getTodaysDateFormatted(),
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
  }, [viabilityTest, setRecord, accession, user]);

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
          setIndividualError('seedsTested', strings.MISSING_SUBSET_WEIGHT_ERROR);
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

  type MandatoryField = typeof MANDATORY_FIELDS[number];
  type MandatoryCutField = typeof CUT_MANDATORY_FIELDS[number];

  const hasErrors = () => {
    if (record) {
      const seedTestedError = record.testType !== 'Cut' ? !validateSeedsTested(record.seedsTested) : false;
      const seedsGerminatedError = !validateSeedsGerminated();
      const recordingDateError = !validateRecordingDate();
      let missingRequiredField = MANDATORY_FIELDS.some((field: MandatoryField) => !record[field]);
      if (record.testResults && record.testResults.length > 0) {
        missingRequiredField =
          missingRequiredField || record.testResults?.some((tr) => !tr.recordingDate || !tr.seedsGerminated);
      } else if (record.testType === 'Cut') {
        missingRequiredField =
          missingRequiredField || CUT_MANDATORY_FIELDS.some((field: MandatoryCutField) => !record[field]);
      }
      return seedTestedError || seedsGerminatedError || recordingDateError || missingRequiredField;
    }
  };

  const saveTest = async () => {
    if (record) {
      if (hasErrors()) {
        setValidateFields(true);
        return;
      }
      if (testCompleted && !readOnly) {
        record.endDate = getTodaysDateFormatted();
      }
      let response;
      if (record.id === -1) {
        response = await postViabilityTest(record, accession.id);
      } else {
        response = await putViabilityTest(record, accession.id, record.id);
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
        snackbar.toastError(response.error);
      }
    }
  };

  const onChangeUser = (newValue: OrganizationUser) => {
    onChange('withdrawnByUserId', newValue.id);
  };

  const onChangeDate = (id: string, value?: any) => {
    const date = new Date(value);
    if (isNaN(date.getTime()) || isInTheFuture(date)) {
      return;
    } else {
      onChange(id, value);
    }
  };

  const cleanAllErrors = () => {
    record?.testResults?.forEach((_tr, index) => {
      setIndividualError(`seedsGerminated${index}`, '');
    });
    record?.testResults?.forEach((_tr, index) => {
      setIndividualError(`recordingDate${index}`, '');
    });
    setIndividualError(`seedsTested`, '');
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
    }
  };

  const onAddResult = () => {
    if (record) {
      const updatedResults = [...(record.testResults || [])];
      updatedResults.push({ recordingDate: '', seedsGerminated: 0 });

      onChange('testResults', updatedResults);
    }
  };

  const onResultChange = (id: string, value: unknown, index: number) => {
    if (record?.testResults) {
      const updatedResults = [...record.testResults];
      updatedResults[index] = { ...updatedResults[index], [id]: value as string };
      onChange('testResults', updatedResults);
    }
  };

  const markTestAsComplete = (value: boolean) => {
    setTestCompleted(value);
  };

  const getSubstratesAccordingToType = (type?: string) => {
    if (type === 'Lab') {
      return LAB_SUBSTRATES;
    } else if (type === 'Nursery') {
      return NURSERY_SUBSTRATES;
    } else {
      return [];
    }
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
        title={strings.VIABILITY_TEST}
        size='large'
        middleButtons={[
          <Button label={strings.CANCEL} type='passive' onClick={onCloseHandler} priority='secondary' key='button-1' />,
          <Button onClick={saveTest} label={strings.SAVE} key='button-2' />,
        ]}
        scrolled={true}
      >
        <Grid container item xs={12} spacing={2} textAlign='left'>
          <Grid xs={12} padding={theme.spacing(1, 3, 1, 5)}>
            <Dropdown
              options={TEST_METHODS}
              placeholder={strings.SELECT}
              onChange={(value) => onChangeTestType(value as TEST_TYPES)}
              selectedValue={record?.testType}
              fullWidth={true}
              label={strings.TEST_METHOD_REQUIRED}
              disabled={readOnly || record?.id !== -1}
              errorText={validateFields && !record?.testType ? strings.REQUIRED_FIELD : ''}
            />
          </Grid>
          <Grid padding={theme.spacing(1, 3, 1, 5)} xs={12}>
            <Select
              label={strings.SEED_TYPE}
              placeholder={strings.SELECT}
              options={SEED_TYPES}
              onChange={(value: string) => onChange('seedType', value)}
              selectedValue={record?.seedType}
              fullWidth={true}
              readonly={true}
              disabled={readOnly}
            />
          </Grid>
          {record?.testType !== 'Cut' && (
            <>
              <Grid padding={theme.spacing(1, 3, 1, 5)} xs={12}>
                <Select
                  label={strings.SUBSTRATE}
                  placeholder={strings.SELECT}
                  options={getSubstratesAccordingToType(record?.testType)}
                  onChange={(value: string) => onChange('substrate', value)}
                  selectedValue={record?.substrate}
                  fullWidth={true}
                  readonly={true}
                  disabled={readOnly}
                />
              </Grid>
              <Grid padding={theme.spacing(1, 3, 1, 5)} xs={12}>
                <Select
                  label={strings.TREATMENT}
                  placeholder={strings.SELECT}
                  options={TREATMENTS}
                  onChange={(value: string) => onChange('treatment', value)}
                  selectedValue={record?.treatment}
                  fullWidth={true}
                  readonly={true}
                  disabled={readOnly}
                />
              </Grid>
            </>
          )}
          <Grid padding={theme.spacing(1, 3, 1, 5)} xs={12}>
            <SelectT<OrganizationUser>
              label={strings.TESTING_STAFF}
              placeholder={strings.SELECT}
              options={users}
              onChange={onChangeUser}
              isEqual={(a: OrganizationUser, b: OrganizationUser) => a.id === b.id}
              renderOption={(option) => renderUser(option, user, contributor)}
              displayLabel={(option) => renderUser(option, user, contributor)}
              selectedValue={users?.find((userSel) => userSel.id === record?.withdrawnByUserId)}
              toT={(firstName: string) => ({ firstName } as OrganizationUser)}
              fullWidth={true}
              disabled={contributor || readOnly}
            />
          </Grid>

          <Grid item xs={12}>
            <Grid item sx={{ background: '#F2F4F5', borderRadius: '16px', padding: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'baseline' }} mb={2}>
                <Grid item xs={12}>
                  <DatePicker
                    id='startDate'
                    label={record?.testType === 'Cut' ? strings.TEST_DATE_REQUIRED : strings.START_DATE_REQUIRED}
                    aria-label={strings.DATE}
                    value={record?.startDate}
                    onChange={onChangeDate}
                    disabled={readOnly}
                    errorText={validateFields && !record?.startDate ? strings.REQUIRED_FIELD : ''}
                  />
                </Grid>
                <Grid item xs={12} marginLeft={1}>
                  {record?.testType === 'Cut' ? (
                    <Textfield
                      label={strings.NUMBER_OF_SEEDS_FILLED_REQUIRED}
                      type='text'
                      onChange={onChangeCutValue}
                      id='seedsFilled'
                      value={record?.seedsFilled}
                      errorText={validateFields && !record?.seedsFilled ? strings.REQUIRED_FIELD : ''}
                    />
                  ) : (
                    <Textfield
                      label={strings.NUMBER_OF_SEEDS_TESTED_REQUIRED}
                      type='text'
                      onChange={onChangeSeedsTested}
                      id='seedsTested'
                      value={record?.seedsTested}
                      disabled={readOnly}
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
                        onChange={onChangeCutValue}
                        id='seedsCompromised'
                        value={record?.seedsCompromised}
                        errorText={validateFields && !record?.seedsCompromised ? strings.REQUIRED_FIELD : ''}
                      />
                    </Grid>
                    <Grid item xs={6} marginLeft={1}>
                      <Textfield
                        label={strings.NUMBER_OF_SEEDS_EMPTY_REQUIRED}
                        type='text'
                        onChange={onChangeCutValue}
                        id='seedsEmpty'
                        value={record?.seedsEmpty}
                        errorText={validateFields && !record?.seedsEmpty ? strings.REQUIRED_FIELD : ''}
                      />
                    </Grid>
                  </Grid>
                  <Grid item xs={12} display='flex' alignItems='center' sx={{ paddingTop: 2 }}>
                    <Typography sx={{ color: '#5C6B6C', paddingRight: 1, fontSize: '14px' }}>
                      # {strings.TOTAL_SEEDS_TESTED}:
                    </Typography>
                    <Typography>{totalSeedsTested}</Typography>
                  </Grid>
                </>
              )}

              {record?.testResults?.map((testResult, index) => (
                <Box key={index} mb={2} display='flex' alignItems='baseline'>
                  <Grid item xs={12}>
                    <DatePicker
                      id='recordingDate'
                      label={strings.CHECK_DATE_REQUIRED}
                      aria-label={strings.DATE}
                      value={testResult.recordingDate}
                      onChange={(id, value) => onResultChange(id, value, index)}
                      disabled={readOnly}
                      errorText={viabilityFieldsErrors[`recordingDate${index}`]}
                    />
                  </Grid>
                  <Grid item xs={12} marginLeft={1} display='flex'>
                    <Textfield
                      label={strings.NUMBER_OF_SEEDS_GERMINATED_REQUIRED}
                      type='text'
                      onChange={(id, value) => onResultChange(id, value, index)}
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
                      sx={{ marginTop: 3 }}
                    >
                      <Close />
                    </IconButton>
                  </Grid>
                </Box>
              ))}
              {record?.testType !== 'Cut' && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Link
                    component='button'
                    id='addResultButton'
                    onClick={(event: React.SyntheticEvent) => {
                      preventDefaultEvent(event);
                      onAddResult();
                    }}
                    sx={{
                      textDecoration: 'none',
                      fontSize: '16px',
                      '&[disabled]': { color: '#0067C84D', pointerEvents: 'none' },
                    }}
                    disabled={testCompleted || readOnly}
                  >
                    + {strings.ADD_OBSERVATION}
                  </Link>
                  {record?.testResults && record.testResults.length > 0 && (
                    <Checkbox
                      label={strings.MARK_AS_COMPLETE}
                      onChange={(id, value) => markTestAsComplete(value)}
                      id='markAsCompplete'
                      name='markAsCompplete'
                      value={testCompleted}
                      disabled={readOnly}
                    />
                  )}
                </Box>
              )}
            </Grid>
          </Grid>
          <Grid padding={theme.spacing(1, 3, 1, 5)} xs={12}>
            <Textfield id='notes' value={record?.notes} onChange={onChange} type='textarea' label={strings.NOTES} />
          </Grid>
        </Grid>
      </DialogBox>
    </>
  );
}
