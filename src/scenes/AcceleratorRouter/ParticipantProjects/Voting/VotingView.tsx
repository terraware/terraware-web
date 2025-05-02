import React, { useCallback, useMemo } from 'react';

import { Box, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useQuery from 'src/utils/useQuery';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

import { UserVoteView } from './UserVote';
import { useVotingData } from './VotingContext';
import VotingWrapper from './VotingWrapper';

const VotingView = () => {
  const navigate = useSyncNavigate();
  const location = useStateLocation();
  const query = useQuery();
  const { activeLocale } = useLocalization();
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const { phaseVotes, project } = useVotingData();

  const goToEditVotes = useCallback(() => {
    if (!project) {
      return;
    }
    // keep query state for edit view
    navigate(
      getLocation(
        APP_PATHS.ACCELERATOR_PROJECT_VOTES_EDIT.replace(':projectId', `${project.id}`),
        location,
        query.toString()
      )
    );
  }, [navigate, location, project, query]);

  // Edit Votes button
  const editVotes = useMemo(
    () =>
      activeLocale && phaseVotes && phaseVotes.votes.length > 0 ? (
        <Button
          label={isMobile ? '' : strings.EDIT_VOTES}
          icon='iconEdit'
          onClick={goToEditVotes}
          size='medium'
          id='editVotes'
        />
      ) : null,
    [activeLocale, isMobile, goToEditVotes, phaseVotes]
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
