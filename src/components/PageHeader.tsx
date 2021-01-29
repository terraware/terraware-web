import { createStyles, makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React from 'react';

const useStyles = makeStyles(() =>
  createStyles({
    header: {
      backgroundColor: 'white',
      maxHeight: '156px',
      height: '156px',
      width: '100%',
      paddingLeft: '165px',
      border: '0.5px solid rgba(33, 37, 41, 0.06)',
    },
    firstLine: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      paddingTop: '32px',
      fontFamily: 'Basier Square',
      fontStyle: 'normal',
      fontWeight: 600,
      fontSize: '36px',
      lineHeight: '44px',
    },
    subtitle: {
      fontFamily: 'Basier Square',
      fontStyle: 'normal',
      fontWeight: 'normal',
      fontSize: '18px',
      lineHeight: '24px',
    },
  })
);

interface Props {
  title: string;
  subtitle: string;
}

export default function PageHeader({ title, subtitle }: Props): JSX.Element {
  const classes = useStyles();

  return (
    <div className={classes.header}>
      <Typography className={classes.title}>{title}</Typography>
      <Typography className={classes.subtitle}>{subtitle}</Typography>
    </div>
  );
}
