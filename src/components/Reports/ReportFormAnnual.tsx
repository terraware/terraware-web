import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { Textfield } from '@terraware/web-components';
import { Report } from 'src/types/Report';

export type ReportFormAnnualProps = {
  editable?: boolean;
  report: Report;
  onChange?: (report: Report) => void;
};

export default function ReportFormAnnual(props: ReportFormAnnualProps): JSX.Element {
  const { editable, report } = props;
  const theme = useTheme();
  return (
    <Box
      display='flex'
      flexDirection='column'
      borderRadius={theme.spacing(3)}
      padding={theme.spacing(3)}
      sx={{
        backgroundColor: theme.palette.TwClrBg,
      }}
    >
      <Typography key='thing1'>Annual Thing for report {`${report.year}-Q${report.quarter}`}</Typography>
      <Textfield
        key='testInput'
        placeholder={'Test Annual Input...'}
        label='Details'
        id='testInput'
        type='text'
        disabled={!editable}
      />
    </Box>
  );
}
