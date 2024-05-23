import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Grid, useTheme } from '@mui/material';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import PageForm from 'src/components/common/PageForm';
import Textfield from 'src/components/common/Textfield/Textfield';
import { APP_PATHS } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization, useUser } from 'src/providers';
import { requestSubmitSupportRequest } from 'src/redux/features/support/supportAsyncThunks';
import { selectSupportRequestSubmitRequest } from 'src/redux/features/support/supportSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { SupportRequest } from 'src/types/Support';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import { useSupportData } from './provider/Context';

const ContactUsForm = () => {
  const dispatch = useAppDispatch();
  const { activeLocale } = useLocalization();
  const { user } = useUser();
  const theme = useTheme();
  const pathParams = useParams<{ requestTypeId: string }>();
  const snackbar = useSnackbar();
  const { goToContactUs } = useNavigateTo();

  const styles: Record<string, Record<string, unknown>> = {
    textarea: {
      height: '120px',
    },
  };

  const crumbs: Crumb[] = useMemo(
    () => [
      {
        name: activeLocale ? strings.CONTACT_US : '',
        to: APP_PATHS.CONTACT_US,
      },
    ],
    [activeLocale]
  );

  const { types } = useSupportData();
  const requestTypeId = useMemo(() => Number(pathParams.requestTypeId), [pathParams]);

  const requestType = useMemo(() => {
    return types.find((item) => item.requestTypeId === requestTypeId);
  }, [types, requestTypeId]);

  const [supportRequest, , onChangeSupportRequest] = useForm<SupportRequest>({
    description: '',
    summary: '',
    requestTypeId: requestTypeId,
  });

  // Submit request
  const [submitSupportRequestId, setSubmitSupportRequestId] = useState<string>('');
  const submitSupportRequest = useAppSelector(selectSupportRequestSubmitRequest(submitSupportRequestId));

  const saveParticipantProject = useCallback(() => {
    if (supportRequest.summary && supportRequest.description) {
      const dispatched = dispatch(requestSubmitSupportRequest(supportRequest));
      setSubmitSupportRequestId(dispatched.requestId);
    }
  }, [supportRequest, dispatch]);

  const handleOnSave = useCallback(() => {
    saveParticipantProject();
  }, [supportRequest]);

  useEffect(() => {
    if (!submitSupportRequest) {
      return;
    }

    if (submitSupportRequest.status === 'error') {
      snackbar.toastError();
    } else if (submitSupportRequest.status === 'success') {
      const issueKey = submitSupportRequest.data;
      snackbar.toastSuccess(strings.formatString(strings.THANK_YOU_FOR_CONTACTING_SUPPORT, `${issueKey}`));
      goToContactUs();
    }
  }, [submitSupportRequest, snackbar]);

  return (
    <Page crumbs={crumbs} title={requestType?.name || ''}>
      <PageForm
        busy={submitSupportRequest?.status === 'pending'}
        cancelID='cancelSupportRequest'
        onCancel={() => goToContactUs()}
        onSave={() => handleOnSave()}
        saveID='submitSupportRequest'
        saveButtonText={strings.SUBMIT}
      >
        <Card
          style={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            marginBottom: theme.spacing(3),
            padding: theme.spacing(2),
          }}
        >
          <Grid container columnSpacing={theme.spacing(2)} rowSpacing={theme.spacing(2)}>
            <Grid item xs={12}>
              {requestType?.description}
            </Grid>
            <Grid item xs={6}>
              <Textfield
                id={'name'}
                label={strings.NAME}
                value={user?.firstName + ' ' + user?.lastName}
                type={'text'}
                disabled
              />
            </Grid>
            <Grid item xs={6}>
              <Textfield id={'email'} label={strings.EMAIL} value={user?.email} type={'text'} disabled />
            </Grid>
            <Grid item xs={12}>
              <Textfield
                id={'summary'}
                label={strings.SUMMARY}
                onChange={(value) => onChangeSupportRequest('summary', value as string)}
                value={supportRequest.summary}
                type={'text'}
              />
            </Grid>
            <Grid item xs={12}>
              <Textfield
                id={'description'}
                label={strings.DESCRIPTION}
                onChange={(value) => onChangeSupportRequest('description', value as string)}
                value={supportRequest.description}
                styles={styles}
                type={'textarea'}
              />
            </Grid>
          </Grid>
        </Card>
      </PageForm>
    </Page>
  );
};
export default ContactUsForm;
