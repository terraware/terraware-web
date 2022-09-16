import { useTheme, CircularProgress, Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Accession2, AccessionHistoryEntry, getAccessionHistory } from 'src/api/accessions2/accession';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';
import _ from 'lodash';

interface Accession2HistoryProps {
  accession: Accession2;
}

export default function Accession2History(props: Accession2HistoryProps): JSX.Element {
  const { accession } = props;
  const [history, setHistory] = useState<AccessionHistoryEntry[]>();
  const theme = useTheme();
  const snackbar = useSnackbar();

  useEffect(() => {
    const loadHistory = async () => {
      const response = await getAccessionHistory(accession.id);
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
  }, [accession.id, snackbar, history]);

  if (!history) {
    return (
      <Box display='flex' justifyContent='center' padding={theme.spacing(5)}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box display='flex' flexDirection='column'>
      <Typography fontSize='16px' fontWeight={500} marginBottom={theme.spacing(3)}>
        {strings.ACCESSION_HISTORY}
      </Typography>
      {history.map((item, index) => (
        <Box
          key={index}
          display='flex'
          flexDirection='row'
          fontSize='15px'
          fontWeight={400}
          color='#3A4445'
          marginBottom={theme.spacing(3)}
          whiteSpace='break-spaces'
        >
          <Typography whiteSpace='pre' marginRight={theme.spacing(3)}>
            {item.date}
          </Typography>
          <Typography sx={{ wordBreak: 'break-all' }}>
            {item.fullName || strings.NAME_UNKNOWN}&nbsp;{item.description}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
