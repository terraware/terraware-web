import { Box, CircularProgress, Theme, Typography, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';
import PanelTitle from 'src/components/PanelTitle';
import strings from 'src/strings';
import Icon from 'src/components/common/icon/Icon';
import { IconName } from '@terraware/web-components';

const useStyles = makeStyles((theme: Theme) => ({
  icon: {
    fill: theme.palette.TwClrIcnSecondary,
    marginRight: theme.spacing(1),
  },
}));

interface Props {
  id: string;
  title: string;
  icon: IconName;
  statistic?: number | string;
  loading: boolean;
  error: boolean;
  tooltipTitle?: NonNullable<React.ReactNode>;
}

export default function SummaryPaper({ id, title, icon, statistic, loading, error, tooltipTitle }: Props): JSX.Element {
  const classes = useStyles();
  const theme = useTheme();
  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: theme.spacing(3) }}>
        <Icon name={icon} className={classes.icon} size='medium' />
        <PanelTitle title={title} gutterBottom={false} tooltipTitle={tooltipTitle} />
      </Box>
      {error && strings.GENERIC_ERROR}
      {loading && <CircularProgress id={`spinner-summary-${id}`} />}
      {statistic !== undefined && (
        <>
          <Typography id={`${id}-current`} component='p' fontSize='32px' fontWeight={600}>
            {statistic}
          </Typography>
        </>
      )}
    </>
  );
}
