import { useTheme, CircularProgress, Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Accession } from 'src/types/Accession';
import AccessionsService, { AccessionHistoryEntry } from 'src/services/AccessionsService';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';
import _ from 'lodash';

interface Accession2HistoryProps {
  accession: Accession;
}

export default function Accession2History(props: Accession2HistoryProps): JSX.Element {
  const { accession } = props;
  const [history, setHistory] = useState<AccessionHistoryEntry[]>();
  const theme = useTheme();
  const snackbar = useSnackbar();

  useEffect(() => {
    const loadHistory = async () => {
      const response = await AccessionsService.getAccessionHistory(accession.id);
      if (response.requestSucceeded) {
        if (!_.isEqual(history, response.history)) {
          setHistory(response.history);
        }
      } else {
        setHistory([]);
        snackbar.toastError();
      }
    };
    loadHistory();
  }, [accession, snackbar, history]);

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
          <Typography fontWeight={500}>
            {item.fullName || strings.NAME_UNKNOWN}&nbsp;{item.description}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
