import React from 'react';

import { Box, Theme, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { IconTooltip } from '@terraware/web-components';

const useStyles = makeStyles((theme: Theme) => ({
  panelTitle: {
    fontSize: '20px',
    lineHeight: '28px',
    fontWeight: 600,
    color: theme.palette.TwClrTxt,
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
    <Box sx={{ display: 'flex', alignItems: 'end' }}>
      <Typography variant='h6' className={classes.panelTitle} id={id} gutterBottom={gutterBottom}>
        {title}
      </Typography>
      {tooltipTitle && <IconTooltip title={tooltipTitle} />}
    </Box>
  );
}
