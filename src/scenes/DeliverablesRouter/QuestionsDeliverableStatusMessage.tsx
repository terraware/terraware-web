import React from 'react';

import { Box, useTheme } from '@mui/material';
import { Message } from '@terraware/web-components';

import { ViewProps } from 'src/components/DeliverableView/types';
import { useLocalization } from 'src/providers/hooks';
import strings from 'src/strings';
import { SpeciesForParticipantProject } from 'src/types/ParticipantProjectSpecies';

type Props = ViewProps & {
  questions?: SpeciesForParticipantProject[] | undefined;
};

const QuestionsDeliverableStatusMessage = ({ deliverable, questions }: Props): JSX.Element | null => {
  const { activeLocale } = useLocalization();
  const theme = useTheme();

  const rejectedAnswers = questions?.filter(
    (question) => question.participantProjectSpecies.submissionStatus === 'Rejected'
  );

  return !activeLocale ? null : (
    <>
      {deliverable?.status === 'Approved' && (
        <Box marginBottom={theme.spacing(4)}>
          <Message
            body={strings.THIS_DELIVERABLE_HAS_BEEN_APPROVED}
            priority='success'
            title={strings.DELIVERABLE_APPROVED}
            type='page'
          />
        </Box>
      )}

      {deliverable?.status === 'Rejected' && (
        <Box marginBottom={theme.spacing(4)}>
          <Message
            body={deliverable?.feedback || ''}
            priority='critical'
            title={strings.DELIVERABLE_NOT_ACCEPTED}
            type='page'
          />
        </Box>
      )}

      {!!rejectedAnswers?.length && (
        <Box marginBottom={theme.spacing(4)}>
          <Message
            body={strings.ONE_OR_MORE_ANSWERS_WERE_NOT_ACCEPTED}
            priority='critical'
            title={strings.ANSWERS_NOT_ACCEPTED}
            type='page'
          />
        </Box>
      )}
    </>
  );
};

export default QuestionsDeliverableStatusMessage;
