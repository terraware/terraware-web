import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { Textfield } from '@terraware/web-components';
import { Report } from 'src/types/Report';

export type ReportFormProps = {
  editable?: boolean;
  report: Report;
  onChange?: (report: Report) => void;
};

export default function ReportForm(props: ReportFormProps): JSX.Element {
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
      <Typography key='thing1'>Thing 1 for report {`${report.year}-Q${report.quarter}`}</Typography>
      <Typography key='thing2'>Thing 2 for report {`${report.year}-Q${report.quarter}`}</Typography>
      <Textfield
        key='testInput'
        placeholder={'Test Input...'}
        label='Details'
        id='testInput'
        type='text'
        disabled={!editable}
      />
    </Box>
  );
}
