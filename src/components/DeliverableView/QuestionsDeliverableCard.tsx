import React, { type JSX, useEffect, useMemo, useRef, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Message } from '@terraware/web-components';

import DeliverableDisplayVariableValue from 'src/components/DocumentProducer/DeliverableDisplayVariableValue';
import VariableStatusBadge from 'src/components/Variables/VariableStatusBadge';
import Card from 'src/components/common/Card';
import { useIsVisible } from 'src/hooks/useIsVisible';
import {
  requestListDeliverableVariablesValues,
  requestListSpecificVariablesValues,
} from 'src/redux/features/documentProducer/values/valuesThunks';
import {
  selectDeliverableVariablesWithValues,
  selectSpecificVariablesWithValues,
} from 'src/redux/features/documentProducer/variables/variablesSelector';
import {
  requestListDeliverableVariables,
  requestListSpecificVariables,
} from 'src/redux/features/documentProducer/variables/variablesThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { VariableStatusType, VariableWithValues } from 'src/types/documentProducer/Variable';
import { VariableValue } from 'src/types/documentProducer/VariableValue';
import {
  getDependingVariablesStableIdsFromOtherDeliverable,
  variableDependencyMet,
} from 'src/utils/documentProducer/variables';

import Metadata from './Metadata';
import QuestionsDeliverableStatusMessage from './QuestionsDeliverableStatusMessage';
import { EditProps } from './types';

const QuestionBox = ({
  projectId,
  variable,
  hideStatusBadge,
  hideId,
}: {
  projectId: number;
  variable: VariableWithValues;
  hideStatusBadge?: boolean;
  hideId?: boolean;
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
      {hideId !== true && (
        <Typography fontSize={'14px'} fontWeight={'400'} lineHeight={'20px'}>
          {`${strings.ID}#: ${variable.stableId}`}
        </Typography>
      )}
      <Typography sx={{ fontWeight: '600', marginBottom: '16px' }}>
        {/* Defaults to deliverable question, then variable name */}
        {`${variable.deliverableQuestion ?? variable.name} ${variable.isRequired ? '*' : ''}`}
      </Typography>
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
      {!!firstVariableValue?.feedback && firstVariableValue?.status === 'Rejected' && (
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
  const { deliverable, hideId, hideStatusBadge } = props;
  const [dependentVariableStableIds, setDependentVariableStableIds] = useState<string[]>([]);

  const variablesWithValues: VariableWithValues[] = useAppSelector((state) =>
    selectDeliverableVariablesWithValues(state, deliverable.id, deliverable.projectId)
  );

  const dependentVariablesWithValues = useAppSelector((state) =>
    selectSpecificVariablesWithValues(state, dependentVariableStableIds, deliverable.projectId)
  );

  const filteredVariablesWithValues = useMemo(
    () => variablesWithValues.filter((variable) => !variable.internalOnly),
    [variablesWithValues]
  );

  const allDependentVariablesWithValues = useMemo(
    () =>
      dependentVariablesWithValues
        ? [...dependentVariablesWithValues, ...filteredVariablesWithValues]
        : filteredVariablesWithValues,
    [filteredVariablesWithValues, dependentVariablesWithValues]
  );

  useEffect(() => {
    const ids = getDependingVariablesStableIdsFromOtherDeliverable(variablesWithValues);
    setDependentVariableStableIds(ids);
  }, [variablesWithValues]);

  useEffect(() => {
    void dispatch(requestListDeliverableVariables(deliverable.id));
    void dispatch(
      requestListDeliverableVariablesValues({ deliverableId: deliverable.id, projectId: deliverable.projectId })
    );
  }, [deliverable, dispatch]);

  useEffect(() => {
    if (!(deliverable && dependentVariableStableIds && dependentVariableStableIds.length > 0)) {
      return;
    }

    void dispatch(requestListSpecificVariables(dependentVariableStableIds));
    void dispatch(
      requestListSpecificVariablesValues({
        projectId: deliverable.projectId,
        variablesStableIds: dependentVariableStableIds,
      })
    );
  }, [deliverable, dependentVariableStableIds, dispatch]);

  if (!deliverable) {
    return null;
  }

  return (
    <Box display='flex' flexDirection='column' flexGrow={1}>
      <QuestionsDeliverableStatusMessage deliverable={deliverable} variables={filteredVariablesWithValues} />
      <Card style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <Metadata {...props} />
        <Box
          sx={{
            borderTop: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
            marginBottom: theme.spacing(4),
            paddingTop: theme.spacing(3),
          }}
        >
          {filteredVariablesWithValues.map((variableWithValues: VariableWithValues, index: number) =>
            variableDependencyMet(variableWithValues, allDependentVariablesWithValues) ? (
              <QuestionBox
                key={index}
                projectId={deliverable.projectId}
                variable={variableWithValues}
                hideId={hideId}
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
