import { Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';

import IconTooltip from 'src/components/IconTooltip';

const useStyles = makeStyles(() => ({
  panelTitle: {
    fontSize: '20px',
    lineHeight: '28px',
    fontWeight: 600,
    color: '#3A4445',
  },
}));

interface Props {
  title: string;
  id?: string;
  gutterBottom?: boolean;
  tooltipTitle?: NonNullable<React.ReactNode>;
}

export default function PanelTitle({ title, id, gutterBottom, tooltipTitle }: Props): JSX.Element {
  const classes = useStyles();

  return (
    <Typography variant='h6' className={classes.panelTitle} id={id} gutterBottom={gutterBottom}>
      {title} {tooltipTitle && <IconTooltip title={tooltipTitle} />}
    </Typography>
  );
}
