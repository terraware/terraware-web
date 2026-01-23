import React, { type JSX } from 'react';

import { Box, useTheme } from '@mui/material';
import { Message } from '@terraware/web-components';

import { ViewProps } from 'src/components/DeliverableView/types';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useLocalization } from 'src/providers/hooks';
import strings from 'src/strings';
import { VariableWithValues } from 'src/types/documentProducer/Variable';
import { VariableValue } from 'src/types/documentProducer/VariableValue';

type Props = ViewProps & {
  variables?: VariableWithValues[] | undefined;
};

const QuestionsDeliverableStatusMessage = ({ deliverable, variables }: Props): JSX.Element | null => {
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const { isAcceleratorRoute } = useAcceleratorConsole();

  const rejectedAnswers = variables?.reduce((acc, variableWithValues) => {
    const rejectedValues = variableWithValues.variableValues.filter(
      (variableValue) => variableValue.status === 'Rejected'
    );
    if (rejectedValues.length) {
      acc.push(...rejectedValues);
    }
    return acc;
  }, [] as VariableValue[]);

  return !activeLocale ? null : (
    <>
      {deliverable?.status === 'Approved' && (
        <Box marginBottom={theme.spacing(4)}>
          <Message
            body={strings.THIS_DELIVERABLE_HAS_BEEN_APPROVED_QUESTIONNAIRE}
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
            title={isAcceleratorRoute ? strings.DELIVERABLE_UPDATE_REQUESTED : strings.DELIVERABLE_UPDATE_NEEDED}
            type='page'
          />
        </Box>
      )}

      {!!rejectedAnswers?.length && (
        <Box marginBottom={theme.spacing(4)}>
          <Message
            body={strings.ONE_OR_MORE_ANSWERS_NEEDED_UPDATES}
            priority='critical'
            title={strings.ANSWERS_UPDATE_NEEDED}
            type='page'
          />
        </Box>
      )}
    </>
  );
};

export default QuestionsDeliverableStatusMessage;
