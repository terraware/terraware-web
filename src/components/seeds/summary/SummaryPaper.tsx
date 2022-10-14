import { CircularProgress } from '@mui/material';
import { Typography } from '@mui/material';
import React from 'react';
import PanelTitle from 'src/components/PanelTitle';
import strings from 'src/strings';

interface Props {
  id: string;
  title: string;
  statistic?: number | string;
  loading: boolean;
  error: boolean;
  tooltipTitle?: NonNullable<React.ReactNode>;
}

export default function SummaryPaper({ id, title, statistic, loading, error, tooltipTitle }: Props): JSX.Element {
  return (
    <>
      <PanelTitle title={title} gutterBottom={true} tooltipTitle={tooltipTitle} />
      {error && strings.GENERIC_ERROR}
      {loading && <CircularProgress id={`spinner-summary-${id}`} />}
      {statistic !== undefined && (
        <>
          <Typography id={`${id}-current`} component='p' variant='h4'>
            {statistic}
          </Typography>
        </>
      )}
    </>
  );
}
