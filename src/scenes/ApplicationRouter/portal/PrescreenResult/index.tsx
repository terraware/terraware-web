import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { skipToken } from '@reduxjs/toolkit/query';
import { Button } from '@terraware/web-components';

import ConfirmModal from 'src/components/Application/ConfirmModal';
import { Crumb } from 'src/components/BreadCrumbs';
import Card from 'src/components/common/Card';
import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import usePathApplicationId from 'src/hooks/usePathApplicationId';
import { useLocalization } from 'src/providers';
import { useGetApplicationQuery, useRestartApplicationMutation } from 'src/queries/generated/applications';
import strings from 'src/strings';
import { ApplicationStatus } from 'src/types/Application';

import ApplicationPage from '../ApplicationPage';

type PrescreenResult = 'Passed' | 'Failed' | 'Pending';

type ResultViewProp = {
  result: Exclude<PrescreenResult, 'Pending'>;
  feedback?: string;
};

const getPrescreenResult = (status: ApplicationStatus): PrescreenResult => {
  switch (status) {
    case 'Not Submitted':
      return 'Pending';
    case 'Failed Pre-screen':
      return 'Failed';
    case 'Passed Pre-screen':
    case 'In Review':
    case 'Submitted':
    case 'Sourcing Team Review':
    case 'GIS Assessment':
    case 'Carbon Assessment':
    case 'Expert Review':
    case 'P0 Eligible':
    case 'Issue Active':
    case 'Issue Reassessment':
    case 'Not Eligible':
    case 'Accepted':
    case 'Waitlist':
      return 'Passed';
  }
};

const RESTART_MUTATION_KEY = 'prescreen-result-restart';

const PrescreenResultView = ({ result, feedback }: ResultViewProp) => {
  const isFailure = result === 'Failed';
  const theme = useTheme();
  const [restartApplication] = useRestartApplicationMutation({ fixedCacheKey: RESTART_MUTATION_KEY });
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);

  const { goToApplicationPrescreen, goToApplication } = useNavigateTo();
  const pathApplicationId = usePathApplicationId();
  const { currentData: applicationData } = useGetApplicationQuery(pathApplicationId ?? skipToken);
  const selectedApplication = applicationData?.application;

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

  const handleRestart = useCallback(() => {
    if (!selectedApplication) {
      return;
    }
    void restartApplication(selectedApplication.id)
      .unwrap()
      .then(() => {
        setIsConfirmModalOpen(false);
        goToApplicationPrescreen(selectedApplication.id);
      })
      .catch(() => undefined);
  }, [goToApplicationPrescreen, restartApplication, selectedApplication]);

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
  const pathApplicationId = usePathApplicationId();
  const { currentData: applicationData } = useGetApplicationQuery(pathApplicationId ?? skipToken);
  const selectedApplication = applicationData?.application;

  const [, { isLoading }] = useRestartApplicationMutation({ fixedCacheKey: RESTART_MUTATION_KEY });
  const { goToApplicationPrescreen } = useNavigateTo();

  const selectedApplicationId = selectedApplication?.id;

  const crumbs: Crumb[] = useMemo(
    () =>
      activeLocale && selectedApplicationId
        ? [
            {
              name: strings.ALL_SECTIONS,
              to: APP_PATHS.APPLICATION_OVERVIEW.replace(':applicationId', `${selectedApplicationId}`),
            },
          ]
        : [],
    [activeLocale, selectedApplicationId]
  );

  const result = selectedApplication ? getPrescreenResult(selectedApplication.status) : undefined;

  useEffect(() => {
    if (selectedApplication && result === 'Pending') {
      goToApplicationPrescreen(selectedApplication.id);
    }
  }, [goToApplicationPrescreen, result, selectedApplication]);

  return (
    <ApplicationPage crumbs={crumbs} hideFeedback isLoading={isLoading}>
      {result && result !== 'Pending' && (
        <PrescreenResultView feedback={selectedApplication?.feedback} result={result} />
      )}
    </ApplicationPage>
  );
};

export default PrescreenResultViewWrapper;
