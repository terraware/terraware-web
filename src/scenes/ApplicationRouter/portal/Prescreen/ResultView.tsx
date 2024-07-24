import React from 'react';

import { Box, Card, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import Link from 'src/components/common/Link';
import useNavigateTo from 'src/hooks/useNavigateTo';
import strings from 'src/strings';
import { ApplicationDeliverable, ApplicationModule } from 'src/types/Application';

import { useApplicationData } from '../../provider/Context';

type ResultViewProp = {
  isFailure: boolean;
  feedback?: string;
  prescreenSection: ApplicationModule;
  prescrenDeliverables: ApplicationDeliverable[];
};

const ResultView = ({ isFailure, feedback, prescreenSection, prescrenDeliverables }: ResultViewProp) => {
  const theme = useTheme();

  const { goToApplicationMap, goToApplicationSectionDeliverable } = useNavigateTo();
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
        onClick={() => {}}
        priority='secondary'
        style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }}
      />

      <Link
        fontSize='16px'
        onClick={() => goToApplicationMap(selectedApplication.id)}
        style={{ display: 'block', textAlign: 'center' }}
      >
        {`${strings.VIEW} ${strings.PROPOSED_PROJECT_BOUNDARY}`}
      </Link>

      {prescrenDeliverables.map((deliverable, index) => (
        <Link
          fontSize='16px'
          onClick={() =>
            goToApplicationSectionDeliverable(selectedApplication.id, prescreenSection.moduleId, deliverable.id)
          }
          key={index}
          style={{ display: 'block', textAlign: 'center', marginTop: theme.spacing(1) }}
        >
          {`${strings.VIEW} ${deliverable.name}`}
        </Link>
      ))}
    </Card>
  );
};

export default ResultView;
