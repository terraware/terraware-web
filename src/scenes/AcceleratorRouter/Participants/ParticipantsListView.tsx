import { useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { Box, Typography, useTheme } from '@mui/material';
import { BusySpinner, Button } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { Participant } from 'src/types/Participant';

export default function ParticipantListView(): JSX.Element {
  const theme = useTheme();
  const [participants, setParticipants] = useState<Participant[]>();

  // TODO: check for non-empty filters
  const isEmptyState = useMemo<boolean>(() => participants?.length === 0, [participants]);

  useEffect(() => {
    // TODO: fetch participants
    setParticipants([]);
  }, []);

  return (
    <Card style={{ display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <Typography color={theme.palette.TwClrTxt} fontSize='20px' fontWeight={600} lineHeight='28px'>
          {strings.PARTICIPANTS}
        </Typography>
        {!!participants && !isEmptyState && <span>Buttons WIP!</span>}
      </Box>
      {participants === undefined && <BusySpinner />}
      {isEmptyState && <EmptyState />}
      {!!participants && !isEmptyState && <span>This is a list view, WIP!</span>}
    </Card>
  );
}

const EmptyState = (): JSX.Element => {
  const history = useHistory();
  const theme = useTheme();

  const goToNewParticipant = () => {
    history.push(APP_PATHS.ACCELERATOR_PARTICIPANTS_NEW);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 0,
        margin: 'auto',
        padding: theme.spacing(3, 3, 8),
        textAlign: 'center',
      }}
    >
      <Typography
        color={theme.palette.TwClrTxt}
        fontSize='16px'
        fontWeight={400}
        lineHeight='24px'
        marginBottom={theme.spacing(2)}
      >
        {strings.PARTICIPANTS_EMPTY_STATE}
      </Typography>
      <Box sx={{ margin: 'auto' }}>
        <Button
          icon='plus'
          id='new-participant'
          label={strings.ADD_PARTICIPANT}
          onClick={goToNewParticipant}
          size='medium'
        />
      </Box>
    </Box>
  );
};
