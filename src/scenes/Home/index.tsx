import React, { useMemo } from 'react';

import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';

import isEnabled from 'src/features';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import ParticipantHomeView from './ParticipantHomeView';
import TerrawareHomeView from './TerrawareHomeView';

const useStyles = makeStyles((theme: Theme) => ({
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
  },
}));

export default function Home(): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const { orgHasModules } = useParticipantData();
  const classes = useStyles({ isMobile });

  const homeScreen = useMemo(
    (): JSX.Element =>
      orgHasModules ? <ParticipantHomeView /> : <TerrawareHomeView />,
    [orgHasModules]
  );

  return <main className={classes.main}>{homeScreen}</main>;
}
