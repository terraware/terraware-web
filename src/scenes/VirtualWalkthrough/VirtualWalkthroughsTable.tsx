import React, { type JSX } from 'react';

import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useTheme } from '@mui/material';

import strings from 'src/strings';

export default function VirtualWalkthroughsTable(): JSX.Element {
  const theme = useTheme();

  return (
    <TableContainer component={Paper} elevation={0}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{strings.THUMBNAIL}</TableCell>
            <TableCell>{strings.STATUS}</TableCell>
            <TableCell>{strings.DATE_UPLOADED}</TableCell>
            <TableCell>{strings.MONITORING_PLOT}</TableCell>
            <TableCell>{strings.VIDEO_LINK}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell
              colSpan={5}
              sx={{ textAlign: 'center', color: theme.palette.TwClrTxtSecondary, padding: theme.spacing(4) }}
            >
              {strings.NO_DATA_YET}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
