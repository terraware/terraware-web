import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import ConfirmModal from 'src/components/Application/ConfirmModal';
import { Crumb } from 'src/components/BreadCrumbs';
import Card from 'src/components/common/Card';
import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization } from 'src/providers';
import { requestRestartApplication } from 'src/redux/features/application/applicationAsyncThunks';
import { selectApplicationRestart } from 'src/redux/features/application/applicationSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';

import { useApplicationData } from '../../../../providers/Application/Context';
import ApplicationPage from '../ApplicationPage';

type ResultViewProp = {
  isFailure: boolean;
  feedback?: string;
};

const PrescreenResultView = ({ isFailure, feedback }: ResultViewProp) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);

  const { goToApplicationPrescreen, goToApplication } = useNavigateTo();
  const { selectedApplication, reload } = useApplicationData();

  const handleClick = useCallback(() => {
    if (!selectedApplication) {
      return;
    }
    if (!isFailure) {
      goToApplication(selectedApplication.id);
    } else {
      setIsConfirmModalOpen(true);
    }
  }, [selectedApplication, setIsConfirmModalOpen, goToApplication, isFailure]);

  const [restartRequestId, setRestartRequestId] = useState<string>('');
  const restartResult = useAppSelector(selectApplicationRestart(restartRequestId));

  const handleRestart = useCallback(() => {
    if (selectedApplication) {
      const dispatched = dispatch(requestRestartApplication({ applicationId: selectedApplication.id }));
      setRestartRequestId(dispatched.requestId);
    }
  }, [dispatch, selectedApplication, setRestartRequestId]);

  const onReload = useCallback(() => {
    if (!selectedApplication) {
      return;
    }

    setIsConfirmModalOpen(false);
    goToApplication(selectedApplication.id);
  }, [selectedApplication, goToApplication, setIsConfirmModalOpen]);

  useEffect(() => {
    if (restartResult && restartResult.status === 'success' && restartResult.data) {
      reload(onReload);
    }
  }, [restartResult, onReload]);

  if (!selectedApplication) {
    return;
  }

  return (
    <>
      <ConfirmModal
        open={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title={strings.RESTART_PRESCREEN}
        body={`${strings.RESTART_PRESCREEN_CONFIRMATION}\n${strings.ARE_YOU_SURE}`}
        onConfirm={handleRestart}
      />
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
          <Typography
            align={'center'}
            color={theme.palette.TwClrTxt}
            fontSize='24px'
            fontWeight={600}
            lineHeight='32px'
          >
            {isFailure ? strings.APPLICATION_PRESCREEN_FAILURE_TITLE : strings.APPLICATION_PRESCREEN_SUCCESS_TITLE}
          </Typography>
        </Box>
        <Box alignItems={'center'} marginTop={theme.spacing(4)}>
          <Typography
            align={'center'}
            color={theme.palette.TwClrTxt}
            fontSize='16px'
            fontWeight={400}
            lineHeight='24px'
          >
            {isFailure
              ? strings.APPLICATION_PRESCREEN_FAILURE_SUBTITLE
              : strings.APPLICATION_PRESCREEN_SUCCESS_SUBTITLE}
          </Typography>
        </Box>
        {isFailure && feedback && <Box dangerouslySetInnerHTML={{ __html: feedback }} justifyContent={'center'} />}

        <Button
          label={isFailure ? strings.RESTART_PRESCREEN : strings.CONTINUE_TO_APPLICATION}
          onClick={() => handleClick()}
          priority='secondary'
          style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }}
        />

        <Link
          fontSize='16px'
          onClick={() => goToApplicationPrescreen(selectedApplication.id)}
          style={{ display: 'block', textAlign: 'center' }}
        >
          {strings.VIEW_PRESCREEN_SUBMISSION}
        </Link>
      </Card>
    </>
  );
};

const PrescreenResultViewWrapper = () => {
  const { activeLocale } = useLocalization();
  const { selectedApplication } = useApplicationData();

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
