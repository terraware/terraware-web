import React from 'react';

import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';

import useDeviceInfo from 'src/utils/useDeviceInfo';

interface StyleProps {
  backgroundImageVisible?: boolean;
  isMobile?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  main: {
    // TODO: uncomment this line when updating to the new green color theme
    // background: 'linear-gradient(180deg, #FBF9F9 0%, #EFF5EF 100%)',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    padding: (props: StyleProps) => (props.isMobile ? '32px 24px' : '32px'),
    [theme.breakpoints.down('xl')]: {
      background: (props: StyleProps) =>
        !props.backgroundImageVisible
          ? 'initial'
          : 'url(/assets/home-bg-right-layer-z4.svg) no-repeat 753px 100%/auto 285px, ' +
            'url(/assets/home-bg-left-layer-z4.svg) no-repeat 0 100%/auto 295px, ' +
            'url(/assets/home-bg-water-z2.svg) repeat-x 0 100%/auto 180px, ' +
            'url(/assets/home-bg-left-z4.svg) no-repeat 0 100%/auto 295px, ' +
            'url(/assets/home-bg-right-z3.svg) no-repeat 911px 100%/auto 400px',
      backgroundAttachment: 'fixed !important',
    },
    [theme.breakpoints.up('xl')]: {
      background: (props: StyleProps) =>
        !props.backgroundImageVisible
          ? 'initial'
          : 'url(/assets/home-bg-right-layer-z4.svg) no-repeat 100% 100%/auto 285px, ' +
            'url(/assets/home-bg-left-layer-z4.svg) no-repeat 0 100%/auto 295px, ' +
            'url(/assets/home-bg-water-z2.svg) repeat-x 0 100%/auto 180px, ' +
            'url(/assets/home-bg-left-z4.svg) no-repeat 0 100%/auto 295px, ' +
            'url(/assets/home-bg-right-z3.svg) no-repeat 100% 100%/auto 400px',
      backgroundAttachment: 'fixed !important',
    },
  },
}));

interface Props {
  backgroundImageVisible?: boolean;
  children?: React.ReactNode;
}

export default function TfMain({ backgroundImageVisible, children }: Props): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const classes = useStyles({ backgroundImageVisible, isMobile });

  return <main className={classes.main}>{children}</main>;
}
