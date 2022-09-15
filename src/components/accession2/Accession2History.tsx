import { useTheme, CircularProgress, Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Accession2, AccessionHistoryEntry, getAccessionHistory } from 'src/api/accessions2/accession';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import _ from 'lodash';

interface Accession2HistoryProps {
  accession: Accession2;
}

export default function Accession2History(props: Accession2HistoryProps): JSX.Element {
  const { accession } = props;
  const [history, setHistory] = useState<AccessionHistoryEntry[]>();
  const theme = useTheme();
  const snackbar = useSnackbar();
  const { isMobile } = useDeviceInfo();

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
          flexDirection={isMobile ? 'column' : 'row'}
          fontSize='15px'
          fontWeight={400}
          color='#3A4445'
          marginBottom={theme.spacing(3)}
          whiteSpace='pre'
        >
          <Typography marginRight={theme.spacing(3)}>{item.date}</Typography>
          <Typography>
            {item.fullName || strings.NAME_UNKNOWN}&nbsp;{item.description}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
