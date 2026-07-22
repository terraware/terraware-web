import React, { useCallback, useEffect, useState } from 'react';

import { Box, useTheme } from '@mui/material';

import Card from 'src/components/common/Card';
import PageForm from 'src/components/common/PageForm';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useUpsertProjectVotesMutation } from 'src/queries/generated/projectVotes';
import { UpsertVoteSelection, VoteOption, VoteSelection } from 'src/types/ProjectVotes';
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
  const snackbar = useSnackbar();
  const theme = useTheme();
  const { phaseVotes, project } = useVotingData();

  const [validate, setValidate] = useState<boolean>(false);
  const [votes, setVotes] = useState<UpsertVoteSelection[]>([]);
  const [upsertProjectVotes, { isLoading: saveIsLoading, isSuccess: saveIsSuccess, isError: saveIsError }] =
    useUpsertProjectVotesMutation();

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

    void upsertProjectVotes({
      projectId: project.id,
      upsertProjectVotesRequestPayload: {
        phase: phaseVotes.phase,
        votes: updatedVotes,
      },
    });
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
    if (saveIsError) {
      snackbar.toastError();
    } else if (saveIsSuccess) {
      goToVotingView();
    }
  }, [goToVotingView, saveIsError, saveIsSuccess, snackbar]);

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
      <PageForm busy={saveIsLoading} cancelID='cancelSave' onCancel={goToVotingView} onSave={onSave} saveID='saveVotes'>
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
