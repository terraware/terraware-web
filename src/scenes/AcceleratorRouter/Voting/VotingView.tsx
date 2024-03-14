import { useCallback, useMemo } from 'react';
import { useHistory } from 'react-router-dom';

import { Box, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

import { UserVoteView } from './UserVote';
import { useVotingData } from './VotingContext';
import VotingWrapper from './VotingWrapper';

const VotingView = () => {
  const history = useHistory();
  const location = useStateLocation();
  const { activeLocale } = useLocalization();
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const { phaseVotes, projectId } = useVotingData();

  const goToEditVotes = useCallback(() => {
    // keep query state for edit view
    history.push(getLocation(APP_PATHS.ACCELERATOR_VOTING_EDIT.replace(':projectId', `${projectId}`), location));
  }, [history, location, projectId]);

  // Edit Votes button
  const editVotes = useMemo(
    () =>
      activeLocale ? (
        <Button
          label={isMobile ? '' : strings.EDIT_VOTES}
          icon='iconEdit'
          onClick={goToEditVotes}
          size='medium'
          id='editVotes'
        />
      ) : null,
    [activeLocale, isMobile, goToEditVotes]
  );

  return (
    <VotingWrapper rightComponent={editVotes}>
      {phaseVotes?.votes.map((vote) => (
        <Box
          key={vote.userId}
          sx={{
            borderBottom: `1px solid ${theme.palette.TwClrBaseGray050}`,
            gap: theme.spacing(8),
            padding: theme.spacing(2),
            '&:last-child': {
              borderBottom: 'none',
              paddingBottom: 0,
            },
          }}
        >
          <UserVoteView vote={vote} />
        </Box>
      ))}
    </VotingWrapper>
  );
};

export default VotingView;
