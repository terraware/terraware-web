import React, { useEffect, useMemo } from 'react';

import { Box, Card, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';

import { useApplicationData } from '../../provider/Context';
import ApplicationPage from '../ApplicationPage';

type ResultViewProp = {
  isFailure: boolean;
  feedback?: string;
};

const PrescreenResultView = ({ isFailure, feedback }: ResultViewProp) => {
  const theme = useTheme();

  const { goToApplicationPrescreen, goToApplication } = useNavigateTo();
  const { selectedApplication } = useApplicationData();

  if (!selectedApplication) {
    return;
  }

  return (
    <Card
      style={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        alignItems: 'center',
        padding: theme.spacing(3),
      }}
    >
      <Box alignItems={'center'} marginTop={theme.spacing(4)}>
        <img src={isFailure ? '/assets/application-failure-splash.svg' : '/assets/application-success-splash.svg'} />
      </Box>
      <Box alignItems={'center'} marginTop={theme.spacing(4)}>
        <Typography align={'center'} color={theme.palette.TwClrTxt} fontSize='24px' fontWeight={600} lineHeight='32px'>
          {isFailure ? strings.APPLICATION_PRESCREEN_FAILURE_TITLE : strings.APPLICATION_PRESCREEN_SUCCESS_TITLE}
        </Typography>
      </Box>
      <Box alignItems={'center'} marginTop={theme.spacing(4)}>
        <Typography align={'center'} color={theme.palette.TwClrTxt} fontSize='16px' fontWeight={400} lineHeight='24px'>
          {isFailure ? strings.APPLICATION_PRESCREEN_FAILURE_SUBTITLE : strings.APPLICATION_PRESCREEN_SUCCESS_SUBTITLE}
        </Typography>
      </Box>
      {isFailure && feedback && <Box dangerouslySetInnerHTML={{ __html: feedback }} justifyContent={'center'} />}

      <Button
        label={isFailure ? strings.RESTART_PRESCREEN : strings.CONTINUE_TO_APPLICATION}
        onClick={() => {
          !isFailure && goToApplication(selectedApplication.id);
        }}
        priority='secondary'
        style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }}
      />

      <Link
        fontSize='16px'
        onClick={() => goToApplicationPrescreen(selectedApplication.id)}
        style={{ display: 'block', textAlign: 'center' }}
      >
        {`${strings.VIEW} ${strings.VIEW_PRESCREEN_SUBMISSION}`}
      </Link>
    </Card>
  );
};

const PrescreenResultViewWrapper = () => {
  const { activeLocale } = useLocalization();
  const { selectedApplication } = useApplicationData();
  const { goToApplication } = useNavigateTo();

  const crumbs: Crumb[] = useMemo(
    () =>
      activeLocale && selectedApplication?.id
        ? [
            {
              name: strings.ALL_SECTIONS,
              to: APP_PATHS.APPLICATION_OVERVIEW.replace(':applicationId', `${selectedApplication.id}`),
            },
          ]
        : [],
    [activeLocale, selectedApplication?.id]
  );

  useEffect(() => {
    if (selectedApplication && selectedApplication.status === 'Not Submitted') {
      goToApplication(selectedApplication.id);
    }
  }, [selectedApplication]);

  return (
    <ApplicationPage crumbs={crumbs}>
      <PrescreenResultView
        feedback={selectedApplication?.feedback}
        isFailure={!!selectedApplication && selectedApplication.status === 'Failed Pre-screen'}
      />
    </ApplicationPage>
  );
};

export default PrescreenResultViewWrapper;
