import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Grid, Typography, useTheme } from '@mui/material';
import { useDeviceInfo } from '@terraware/web-components/utils';

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
import {
  AttachmentRequest,
  SupportRequest,
  SupportRequestType,
  getSupportRequestInstructions,
  getSupportRequestName,
} from 'src/types/Support';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import ContactUsAttachments from './ContactUsAttachments';
import { useSupportData } from './provider/Context';

const ContactUsForm = () => {
  const dispatch = useAppDispatch();
  const { isDesktop } = useDeviceInfo();
  const { activeLocale } = useLocalization();
  const { user } = useUser();
  const theme = useTheme();
  const pathParams = useParams<{ requestType: string }>();
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

  const supportRequestType: SupportRequestType | undefined = useMemo(() => {
    switch (pathParams.requestType) {
      case 'bug-report':
        return 'Bug Report';
      case 'contact-us':
        return 'Contact Us';
      case 'feature-request':
        return 'Feature Request';
      default:
        return undefined;
    }
  }, [pathParams]);

  useEffect(() => {
    // Navigate to contact us page for unrecognized or unsupported form type.
    if (
      types !== undefined &&
      supportRequestType !== undefined &&
      types.find((item) => item === supportRequestType) === undefined
    ) {
      goToContactUs();
    }
  }, [types, supportRequestType]);

  const [supportRequest, , onChangeSupportRequest] = useForm<SupportRequest>({
    attachmentIds: [],
    description: '',
    summary: '',
    requestType: supportRequestType ?? 'Contact Us',
  });

  useEffect(() => {
    if (supportRequestType) {
      onChangeSupportRequest('requestType', supportRequestType);
    }
  }, [supportRequestType]);

  const [errorSummary, setErrorSummary] = useState<string>('');
  const [errorDescription, setErrorDescription] = useState<string>('');

  // Submit request
  const [submitSupportRequestId, setSubmitSupportRequestId] = useState<string>('');
  const submitSupportRequest = useAppSelector(selectSupportRequestSubmitRequest(submitSupportRequestId));

  const onChangeAttachments = useCallback(
    (attachments: AttachmentRequest[]) => {
      onChangeSupportRequest(
        'attachmentIds',
        attachments.map(({ temporaryAttachmentId }) => temporaryAttachmentId)
      );
    },
    [supportRequest]
  );

  const submit = useCallback(() => {
    if (!supportRequest.summary) {
      setErrorSummary(strings.REQUIRED_FIELD);
    } else {
      setErrorSummary('');
    }

    if (!supportRequest.description) {
      setErrorDescription(strings.REQUIRED_FIELD);
    } else {
      setErrorDescription('');
    }
    if (supportRequest.summary && supportRequest.description) {
      const dispatched = dispatch(requestSubmitSupportRequest(supportRequest));
      setSubmitSupportRequestId(dispatched.requestId);
    }
  }, [supportRequest, dispatch]);

  const handleOnSave = useCallback(() => {
    submit();
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

  const supportRequestTitle = useMemo(
    () => (supportRequestType ? getSupportRequestName(supportRequestType) : ''),
    [supportRequestType]
  );

  const supportRequestInstructions = useMemo(
    () => (supportRequestType ? getSupportRequestInstructions(supportRequestType) : ''),
    [supportRequestType]
  );

  return (
    <Page crumbs={crumbs} title={supportRequestTitle}>
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
              {supportRequestInstructions}
            </Grid>
            <Grid item xs={isDesktop ? 6 : 12}>
              <Textfield
                id={'name'}
                label={strings.NAME}
                value={user?.firstName + ' ' + user?.lastName}
                type={'text'}
                disabled
              />
            </Grid>
            <Grid item xs={isDesktop ? 6 : 12}>
              <Textfield id={'email'} label={strings.EMAIL} value={user?.email} type={'text'} disabled />
            </Grid>
            <Grid item xs={12}>
              <Textfield
                id={'summary'}
                label={strings.SUMMARY}
                onChange={(value) => onChangeSupportRequest('summary', value as string)}
                value={supportRequest.summary}
                type={'text'}
                errorText={errorSummary}
                required={true}
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
                errorText={errorDescription}
                required={true}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography fontSize={'14px'} lineHeight={'24px'} fontWeight={400} marginBottom={theme.spacing(1)}>
                {strings.ATTACHMENTS}
              </Typography>
              <ContactUsAttachments onChange={onChangeAttachments} />
            </Grid>
          </Grid>
        </Card>
      </PageForm>
    </Page>
  );
};
export default ContactUsForm;
