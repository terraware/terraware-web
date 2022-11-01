import React from 'react';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material';
import { useDeviceInfo } from '@terraware/web-components/utils';

interface StyleProps {
  isMobile?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  main: {
    background: theme.palette.TwClrBg,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
    paddingLeft: (props: StyleProps) => (props.isMobile ? '24px' : '200px'),
    paddingTop: '64px',
  },
}));

interface Props {
  children?: React.ReactNode;
}

export default function TfMain({ children }: Props): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const classes = useStyles({ isMobile });

  return <main className={classes.main}>{children}</main>;
}
