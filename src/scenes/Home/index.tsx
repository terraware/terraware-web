import React from 'react';

import { Container } from '@mui/material';
import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';

import PageHeader from 'src/components/PageHeader';
import isEnabled from 'src/features';
import { useUser } from 'src/providers/hooks';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import ParticipantHomeView from './ParticipantHomeView';
import TerrawareHomeView from './TerrawareHomeView';

const useStyles = makeStyles((theme: Theme) => ({
  mainContainer: {
    padding: 0,
  },
  main: {
    [theme.breakpoints.down('xl')]: {
      background:
        'url(/assets/home-bg-right-layer-z4.svg) no-repeat 753px 100%/auto 285px, ' +
        'url(/assets/home-bg-left-layer-z4.svg) no-repeat 0 100%/auto 295px, ' +
        'url(/assets/home-bg-water-z2.svg) repeat-x 0 100%/auto 180px, ' +
        'url(/assets/home-bg-left-z4.svg) no-repeat 0 100%/auto 295px, ' +
        'url(/assets/home-bg-right-z3.svg) no-repeat 911px 100%/auto 400px',
      backgroundAttachment: 'fixed',
    },
    [theme.breakpoints.up('xl')]: {
      background:
        'url(/assets/home-bg-right-layer-z4.svg) no-repeat 100% 100%/auto 285px, ' +
        'url(/assets/home-bg-left-layer-z4.svg) no-repeat 0 100%/auto 295px, ' +
        'url(/assets/home-bg-water-z2.svg) repeat-x 0 100%/auto 180px, ' +
        'url(/assets/home-bg-left-z4.svg) no-repeat 0 100%/auto 295px, ' +
        'url(/assets/home-bg-right-z3.svg) no-repeat 100% 100%/auto 400px',
      backgroundAttachment: 'fixed',
    },
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
  },
}));

export default function Home(): JSX.Element {
  const { user } = useUser();
  const { isMobile } = useDeviceInfo();
  const classes = useStyles({ isMobile });
  const featureFlagParticipantExperience = isEnabled('Participant Experience');

  const isParticipant = false;

  return (
    <main className={classes.main}>
      <PageHeader
        title={user?.firstName ? strings.formatString(strings.WELCOME_PERSON, user.firstName) : strings.WELCOME}
        subtitle=''
      />
      <Container maxWidth={false} className={classes.mainContainer}>
        {featureFlagParticipantExperience && isParticipant ? <ParticipantHomeView /> : <TerrawareHomeView />}
      </Container>
    </main>
  );
}
