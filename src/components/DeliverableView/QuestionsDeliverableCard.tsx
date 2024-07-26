import React, { useEffect, useRef } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Message } from '@terraware/web-components';

import DeliverableDisplayVariableValue from 'src/components/DocumentProducer/DeliverableDisplayVariableValue';
import Card from 'src/components/common/Card';
import { useIsVisible } from 'src/hooks/useIsVisible';
import { requestListDeliverableVariablesValues } from 'src/redux/features/documentProducer/values/valuesThunks';
import { selectDeliverableVariablesWithValues } from 'src/redux/features/documentProducer/variables/variablesSelector';
import { requestListDeliverableVariables } from 'src/redux/features/documentProducer/variables/variablesThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import VariableStatusBadge from 'src/scenes/AcceleratorRouter/Deliverables/VariableStatusBadge';
import { VariableStatusType, VariableWithValues } from 'src/types/documentProducer/Variable';
import { VariableValue } from 'src/types/documentProducer/VariableValue';
import { variableDependencyMet } from 'src/utils/documentProducer/variables';

import Metadata from './Metadata';
import QuestionsDeliverableStatusMessage from './QuestionsDeliverableStatusMessage';
import { EditProps } from './types';

const QuestionBox = ({
  projectId,
  variable,
  hideStatusBadge,
}: {
  projectId: number;
  variable: VariableWithValues;
  hideStatusBadge?: boolean;
}): JSX.Element => {
  const theme = useTheme();
  const containerRef = useRef(null);
  const visible = useIsVisible(containerRef);

  const firstVariableValue: VariableValue | undefined = (variable?.variableValues || [])[0];
  const firstVariableValueStatus: VariableStatusType | undefined = firstVariableValue?.status;

  return (
    <Box
      className={visible ? 'question-visible' : undefined}
      data-variable-id={variable.id}
      ref={containerRef}
      sx={{ marginBottom: theme.spacing(4) }}
    >
      <Box sx={{ float: 'right', marginBottom: '16px', marginLeft: '16px' }}>
        {hideStatusBadge !== true && <VariableStatusBadge status={firstVariableValueStatus} />}
      </Box>
      <Typography sx={{ fontWeight: '600', marginBottom: '16px' }}>{variable.name}</Typography>
      {!!variable.description && (
        <Typography
          sx={{
            color: theme.palette.TwClrTxtSecondary,
            fontSize: '14px',
            fontStyle: 'italic',
            fontWeight: 400,
            lineHeight: '20px',
            marginBottom: '16px',
          }}
        >
          {variable.description}
        </Typography>
      )}
      {!!firstVariableValue?.feedback && (
        <Box marginBottom={theme.spacing(2)}>
          <Message body={firstVariableValue.feedback} priority='critical' type='page' />
        </Box>
      )}
      <DeliverableDisplayVariableValue projectId={projectId} variable={variable} />
    </Box>
  );
};

const QuestionsDeliverableCard = (props: EditProps): JSX.Element | null => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { deliverable, hideStatusBadge } = props;

  const variablesWithValues: VariableWithValues[] = useAppSelector((state) =>
    selectDeliverableVariablesWithValues(state, deliverable.id, deliverable.projectId)
  );

  useEffect(() => {
    void dispatch(requestListDeliverableVariables(deliverable.id));
    void dispatch(
      requestListDeliverableVariablesValues({ deliverableId: deliverable.id, projectId: deliverable.projectId })
    );
  }, [deliverable]);

  if (!deliverable) {
    return null;
  }

  return (
    <Box display='flex' flexDirection='column' flexGrow={1}>
      <QuestionsDeliverableStatusMessage deliverable={deliverable} variables={variablesWithValues} />
      <Card style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <Metadata {...props} />
        <Box
          sx={{
            borderTop: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
            marginBottom: theme.spacing(4),
            paddingTop: theme.spacing(3),
          }}
        >
          {variablesWithValues.map((variableWithValues: VariableWithValues, index: number) =>
            variableDependencyMet(variableWithValues, variablesWithValues) ? (
              <QuestionBox
                key={index}
                projectId={deliverable.projectId}
                variable={variableWithValues}
                hideStatusBadge={hideStatusBadge}
              />
            ) : null
          )}
        </Box>
      </Card>
    </Box>
  );
};

export default QuestionsDeliverableCard;
