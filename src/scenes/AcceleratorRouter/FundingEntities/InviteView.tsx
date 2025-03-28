import React, { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Container, Grid, Typography, useTheme } from '@mui/material';
import { Textfield } from '@terraware/web-components';

import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import PageForm from 'src/components/common/PageForm';
import { EMAIL_REGEX } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useFundingEntity } from 'src/providers';
import FundingEntityService from 'src/services/FundingEntityService';
import strings from 'src/strings';
import { Funder } from 'src/types/FundingEntity';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

const InviteView = () => {
  const { goToFundingEntity } = useNavigateTo();
  const { fundingEntity, reload: reloadFundingEntity } = useFundingEntity();
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const pathParams = useParams<{ fundingEntityId: string }>();
  const fundingEntityId = Number(pathParams.fundingEntityId);
  const [record, , onChange] = useForm<Partial<Funder>>({});
  const [emailError, setEmailError] = useState('');
  const snackbar = useSnackbar();

  const onCancel = useCallback(() => {
    if (fundingEntityId) {
      goToFundingEntity(fundingEntityId);
    }
  }, [fundingEntityId]);

  const onSendClick = useCallback(async () => {
    if (!fundingEntityId) {
      snackbar.toastError();
      return;
    }

    if (!record.email || record.email === '') {
      setEmailError(strings.REQUIRED_FIELD);
      return;
    }

    if (!EMAIL_REGEX.test(record.email)) {
      setEmailError(strings.INCORRECT_EMAIL_FORMAT);
      return;
    }

    let successMessage: string | null = null;
    const response = await FundingEntityService.inviteFunder(fundingEntityId, record.email);
    if (!response.requestSucceeded) {
      if (response.errorDetails === 'PRE_EXISTING_USER') {
        setEmailError(strings.EMAIL_ALREADY_EXISTS);
        return;
      } else if (response.errorDetails === 'INVALID_EMAIL') {
        setEmailError(strings.INCORRECT_EMAIL_FORMAT);
        return;
      }
    }

    successMessage = response.requestSucceeded ? strings.FUNDER_ADDED : null;
    if (successMessage) {
      snackbar.toastSuccess(successMessage);
      reloadFundingEntity();
    } else {
      snackbar.toastError();
    }
    goToFundingEntity(fundingEntityId);
  }, [snackbar, record.email, reloadFundingEntity, fundingEntityId]);

  return (
    <Page
      title={strings.INVITE_FUNDER}
      description={strings.INVITE_FUNDER_DESCRIPTION}
      contentStyle={{ display: 'flex', flexDirection: 'column' }}
    >
      <PageForm
        cancelID={'cancelInviteFunder'}
        saveID={'saveInviteFunder'}
        onCancel={onCancel}
        onSave={onSendClick}
        saveButtonText={strings.SEND}
      >
        <Container
          maxWidth={false}
          sx={{
            display: 'flex',
            margin: '0 auto',
            paddingLeft: theme.spacing(isMobile ? 0 : 4),
            paddingRight: theme.spacing(isMobile ? 0 : 4),
            paddingTop: theme.spacing(5),
            width: isMobile ? '100%' : '800px',
          }}
        >
          <Card style={{ width: '800px', margin: 'auto' }}>
            <Grid item xs={12}>
              <Typography fontSize='20px' fontWeight={600} lineHeight='20px'>
                {fundingEntity?.name}
              </Typography>
            </Grid>
            <Grid item xs={12} sx={{ marginTop: theme.spacing(4) }}>
              <Textfield
                id='email'
                label={strings.EMAIL}
                type='text'
                onChange={(value) => onChange('email', value)}
                value={record.email}
                required={true}
                errorText={emailError}
              />
            </Grid>
            <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
              <Textfield
                id='firstName'
                label={strings.FIRST_NAME}
                onChange={() => {}}
                type='text'
                value={'--'}
                disabled
              />
            </Grid>
            <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
              <Textfield
                id='lastName'
                label={strings.LAST_NAME}
                onChange={() => {}}
                type='text'
                value={'--'}
                disabled
              />
            </Grid>
          </Card>
        </Container>
      </PageForm>
    </Page>
  );
};

export default InviteView;
