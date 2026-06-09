import React, { type JSX, useEffect } from 'react';
import { useParams } from 'react-router';

import { Box, CircularProgress, Typography, useTheme } from '@mui/material';

import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import { useGetAccessionHistoryQuery } from 'src/queries/generated/accessionsV1';
import { AccessionHistoryEntry } from 'src/services/AccessionService';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';

export default function Accession2History(): JSX.Element {
  const { accessionId } = useParams<{ accessionId: string }>();
  const theme = useTheme();
  const snackbar = useSnackbar();

  const { currentData, isError } = useGetAccessionHistoryQuery(Number(accessionId), { skip: !accessionId });
  const history: AccessionHistoryEntry[] | undefined = isError ? [] : currentData?.history;

  useEffect(() => {
    if (isError) {
      snackbar.toastError();
    }
  }, [isError, snackbar]);

  const HistoryText = (item: AccessionHistoryEntry) => (
    <Typography fontWeight={500}>
      {item.fullName || strings.NAME_UNKNOWN}&nbsp;{item.description}
      {item.notes && (
        <Typography fontSize={'14px'} fontWeight={300}>
          {item.notes}
        </Typography>
      )}
    </Typography>
  );

  if (!history) {
    return (
      <Box display='flex' justifyContent='center' padding={theme.spacing(5)}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box display='flex' flexDirection='column'>
      <Typography fontSize='16px' fontWeight={600} marginBottom={theme.spacing(3.5)}>
        {strings.HISTORY}
      </Typography>
      {history.map((item, index) => (
        <Box
          key={index}
          display='flex'
          flexDirection='row'
          fontSize='14px'
          fontWeight={400}
          color={theme.palette.TwClrTxt}
          padding={theme.spacing(2, 0)}
          whiteSpace='break-spaces'
          borderBottom={`1px solid ${theme.palette.TwClrBrdrTertiary}`}
          sx={{ '&:last-child': { border: 'none' } }}
        >
          <Typography color={theme.palette.TwClrTxtSecondary} whiteSpace='pre' marginRight={theme.spacing(3)}>
            {item.date}
          </Typography>

          {item.batchId ? (
            <Link to={APP_PATHS.INVENTORY_BATCH.replace(':batchId', `${item.batchId}`)}>{HistoryText(item)}</Link>
          ) : (
            HistoryText(item)
          )}
        </Box>
      ))}
    </Box>
  );
}
