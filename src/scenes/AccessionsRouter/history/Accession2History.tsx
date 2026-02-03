import React, { type JSX, useEffect, useState } from 'react';

import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import _ from 'lodash';

import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers/hooks';
import AccessionService, { AccessionHistoryEntry } from 'src/services/AccessionService';
import strings from 'src/strings';
import { Accession } from 'src/types/Accession';
import useSnackbar from 'src/utils/useSnackbar';

interface Accession2HistoryProps {
  accession: Accession;
}

export default function Accession2History(props: Accession2HistoryProps): JSX.Element {
  const { activeLocale } = useLocalization();
  const { accession } = props;
  const [history, setHistory] = useState<AccessionHistoryEntry[]>();
  const theme = useTheme();
  const snackbar = useSnackbar();

  useEffect(() => {
    const loadHistory = async () => {
      const response = await AccessionService.getAccessionHistory(accession.id);
      if (response.requestSucceeded) {
        if (!_.isEqual(history, response.history)) {
          setHistory(response.history);
        }
      } else {
        setHistory([]);
        snackbar.toastError();
      }
    };
    void loadHistory();
  }, [accession, activeLocale, snackbar, history]);

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
