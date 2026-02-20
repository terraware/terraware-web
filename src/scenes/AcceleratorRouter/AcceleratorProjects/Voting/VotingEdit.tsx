import React, { useCallback, useEffect, useState } from 'react';

import { Box, useTheme } from '@mui/material';

import Card from 'src/components/common/Card';
import PageForm from 'src/components/common/PageForm';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { requestProjectVotesUpdate } from 'src/redux/features/votes/votesAsyncThunks';
import { selectProjectVotesEditRequest } from 'src/redux/features/votes/votesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { UpsertVoteSelection, VoteOption, VoteSelection } from 'src/types/Votes';
import useQuery from 'src/utils/useQuery';
import useSnackbar from 'src/utils/useSnackbar';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import { UserIdentity } from 'src/utils/user';

import { UserVoteEdit } from './UserVote';
import { useVotingData } from './VotingContext';
import VotingWrapper from './VotingWrapper';

const VotingEdit = () => {
  const navigate = useSyncNavigate();
  const location = useStateLocation();
  const query = useQuery();
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();
  const theme = useTheme();
  const { phaseVotes, project } = useVotingData();

  const [requestId, setRequestId] = useState<string>('');
  const [validate, setValidate] = useState<boolean>(false);
  const [votes, setVotes] = useState<UpsertVoteSelection[]>([]);
  const result = useAppSelector((state) => selectProjectVotesEditRequest(state, requestId));

  const goToVotingView = useCallback(() => {
    if (!project) {
      return;
    }
    navigate(
      getLocation(
        APP_PATHS.ACCELERATOR_PROJECT_VOTES.replace(':projectId', `${project.id}`),
        location,
        query.toString()
      )
    );
  }, [navigate, location, project, query]);

  const onSave = () => {
    if (!phaseVotes || !project) {
      return;
    }
    setValidate(true);
    // we need conditional info/comments for conditional votes
    if (votes.some((vote) => vote.voteOption === 'Conditional' && !vote.conditionalInfo)) {
      return;
    }

    const updatedVotes = votes.filter(({ conditionalInfo, userId, voteOption }) => {
      // eslint-disable-next-line @typescript-eslint/no-extra-non-null-assertion, @typescript-eslint/no-unnecessary-type-assertion
      const orignal = phaseVotes.votes.find((originalVote) => originalVote.userId === userId)!!;
      return !(orignal.conditionalInfo === conditionalInfo && orignal.voteOption === voteOption);
    });

    const request = {
      projectId: project.id,
      payload: {
        phase: phaseVotes.phase,
        votes: updatedVotes,
      },
    };
    const dispatched = dispatch(requestProjectVotesUpdate(request));
    setRequestId(dispatched.requestId);
  };

  const setVoteValue = (index: number, conditionalInfo?: string, voteOption?: VoteOption) => {
    setVotes((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...prev[index],
        conditionalInfo,
        voteOption,
      };
      return updated;
    });
  };

  useEffect(() => {
    if (result?.status === 'error') {
      snackbar.toastError();
    } else if (result?.status === 'success') {
      goToVotingView();
    }
  }, [goToVotingView, result?.status, snackbar]);

  useEffect(() => {
    if (phaseVotes?.votes) {
      setVotes(
        phaseVotes.votes.map((vote) => ({
          conditionalInfo: vote.voteOption === 'Conditional' ? vote.conditionalInfo : undefined,
          userId: vote.userId,
          voteOption: vote.voteOption,
        }))
      );
    }
  }, [phaseVotes]);

  const getUserIdentity = (voteSelection: VoteSelection): UserIdentity => ({
    firstName: voteSelection.firstName,
    lastName: voteSelection.lastName,
    email: voteSelection.email,
  });

  return (
    <VotingWrapper isForm>
      <PageForm
        busy={result?.status === 'pending'}
        cancelID='cancelSave'
        onCancel={goToVotingView}
        onSave={onSave}
        saveID='saveVotes'
      >
        <Card
          style={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            padding: theme.spacing(0, 3, 10),
          }}
        >
          {phaseVotes?.votes.map((vote, index) => (
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
              <UserVoteEdit
                conditionalInfo={votes[index]?.conditionalInfo}
                onConditionalInfoChange={(value) => setVoteValue(index, value, votes[index].voteOption)}
                onVoteChange={(value) => setVoteValue(index, votes[index].conditionalInfo, value)}
                validate={validate}
                user={getUserIdentity(vote)}
                voteOption={votes[index]?.voteOption}
              />
            </Box>
          ))}
        </Card>
      </PageForm>
    </VotingWrapper>
  );
};

export default VotingEdit;
