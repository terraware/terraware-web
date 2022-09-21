import { Box, Grid, IconButton, Link, Typography, useTheme } from '@mui/material';
import { Button, Checkbox, DatePicker, DialogBox, Select, SelectT } from '@terraware/web-components';
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
import TextField from '@terraware/web-components/components/Textfield/Textfield';
import { postViabilityTest } from 'src/api/accessions2/viabilityTest';
import useSnackbar from 'src/utils/useSnackbar';
import { renderUser } from 'src/utils/renderUser';
import { Close } from '@mui/icons-material';
import { preventDefaultEvent } from '@terraware/web-components/utils';
import { getTodaysDateFormatted } from 'src/utils/date';
import { ViabilityTest } from 'src/api/types/accessions';

export interface NewViabilityTestModalProps {
  open: boolean;
  accession: Accession2;
  onClose: () => void;
  reload: () => void;
  organization: ServerOrganization;
  user: User;
  selectedTest: ViabilityTest | undefined;
}

export default function NewViabilityTestModal(props: NewViabilityTestModalProps): JSX.Element {
  const { onClose, open, accession, organization, user, reload, selectedTest } = props;

  const [record, setRecord, onChange] = useForm(selectedTest);
  const [users, setUsers] = useState<OrganizationUser[]>();
  const [testCompleted, setTestCompleted] = useState<boolean>(false);
  const [totalSeedsTested, setTotalSeedsTested] = useState(0);
  const contributor = isContributor(organization);
  const snackbar = useSnackbar();
  const theme = useTheme();

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
    setTotalSeedsTested(
      (Number(record?.seedsFilled) || 0) + (Number(record?.seedsCompromised) || 0) + (Number(record?.seedsEmpty) || 0)
    );
  }, [record?.seedsFilled, record?.seedsCompromised, record?.seedsEmpty]);

  useEffect(() => {
    const newViabilityTest: ViabilityTestPostRequest = {
      testResults: [],
      withdrawnByUserId: user.id,
      testType: 'Lab',
      seedsTested: 0,
    };

    const initViabilityTest = () => {
      if (selectedTest) {
        return selectedTest;
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
  }, [selectedTest, setRecord, accession, user]);

  const saveTest = async () => {
    if (record) {
      if (testCompleted) {
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
      } else {
        snackbar.toastError();
      }
    }
  };

  const onChangeUser = (newValue: OrganizationUser) => {
    onChange('withdrawnByUserId', newValue.id);
  };

  const onChangeDate = (id: string, value?: any) => {
    const date = new Date(value).getTime();
    const now = Date.now();
    if (isNaN(date) || date > now) {
      return;
    } else {
      onChange(id, value);
    }
  };

  const onCloseHandler = () => {
    setTestCompleted(false);
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

  return (
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
            onChange={(value: string) => onChange('testType', value)}
            selectedValue={record?.testType}
            fullWidth={true}
            label={strings.TEST_METHOD_REQUIRED}
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
            disabled={contributor}
          />
        </Grid>

        <Grid item xs={12}>
          <Grid item sx={{ background: '#F2F4F5', borderRadius: '16px', padding: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }} mb={2}>
              <Grid item xs={12}>
                <DatePicker
                  id='startDate'
                  label={record?.testType === 'Cut' ? strings.TEST_DATE_REQUIRED : strings.START_DATE_REQUIRED}
                  aria-label={strings.DATE}
                  value={record?.startDate}
                  onChange={onChangeDate}
                />
              </Grid>
              <Grid item xs={12} marginLeft={1}>
                {record?.testType === 'Cut' ? (
                  <TextField
                    label={strings.NUMBER_OF_SEEDS_FILLED_REQUIRED}
                    type='text'
                    onChange={onChange}
                    id='seedsFilled'
                    value={record?.seedsFilled}
                  />
                ) : (
                  <TextField
                    label={strings.NUMBER_OF_SEEDS_TESTED_REQUIRED}
                    type='text'
                    onChange={onChange}
                    id='seedsTested'
                    value={record?.seedsTested}
                  />
                )}
              </Grid>
            </Box>

            {record?.testType === 'Cut' && (
              <>
                <Grid item xs={12} display='flex'>
                  <Grid item xs={6}>
                    <TextField
                      label={strings.NUMBER_OF_SEEDS_COMPROMISED_REQUIRED}
                      type='text'
                      onChange={onChange}
                      id='seedsCompromised'
                      value={record?.seedsCompromised}
                    />
                  </Grid>
                  <Grid item xs={6} marginLeft={1}>
                    <TextField
                      label={strings.NUMBER_OF_SEEDS_EMPTY_REQUIRED}
                      type='text'
                      onChange={onChange}
                      id='seedsEmpty'
                      value={record?.seedsEmpty}
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
              <Box key={index} mb={2} display='flex' alignItems='center'>
                <Grid item xs={12}>
                  <DatePicker
                    id='recordingDate'
                    label={strings.CHECK_DATE_REQUIRED}
                    aria-label={strings.DATE}
                    value={testResult.recordingDate}
                    onChange={(id, value) => onResultChange(id, value, index)}
                  />
                </Grid>
                <Grid item xs={12} marginLeft={1} display='flex'>
                  <TextField
                    label={strings.NUMBER_OF_SEEDS_GERMINATED_REQUIRED}
                    type='text'
                    onChange={(id, value) => onResultChange(id, value, index)}
                    id='seedsGerminated'
                    value={testResult.seedsGerminated}
                  />
                  <IconButton
                    id={`delete-result${index}`}
                    aria-label='delete'
                    size='small'
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
                  disabled={testCompleted}
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
                  />
                )}
              </Box>
            )}
          </Grid>
        </Grid>
        <Grid padding={theme.spacing(1, 3, 1, 5)} xs={12}>
          <TextField id='notes' value={record?.notes} onChange={onChange} type='textarea' label={strings.NOTES} />
        </Grid>
      </Grid>
    </DialogBox>
  );
}
