import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { BusySpinner, Message } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import Metadata from 'src/components/DeliverableView/Metadata';
import MobileMessage from 'src/components/DeliverableView/MobileMessage';
import TitleBar from 'src/components/DeliverableView/TitleBar';
import { EditProps } from 'src/components/DeliverableView/types';
import useUpdateDeliverable from 'src/components/DeliverableView/useUpdateDeliverable';
import DeliverableDisplayVariableValue from 'src/components/DocumentProducer/DeliverableDisplayVariableValue';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import Button from 'src/components/common/button/Button';
import { APP_PATHS } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization } from 'src/providers';
import { useDeliverableData } from 'src/providers/Deliverable/DeliverableContext';
import { requestListDeliverableVariablesValues } from 'src/redux/features/documentProducer/values/valuesThunks';
import { selectDeliverableVariablesWithValues } from 'src/redux/features/documentProducer/variables/variablesSelector';
import { requestListDeliverableVariables } from 'src/redux/features/documentProducer/variables/variablesThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { VariableWithValues } from 'src/types/documentProducer/Variable';
import { VariableValue } from 'src/types/documentProducer/VariableValue';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import QuestionsDeliverableStatusMessage from './QuestionsDeliverableStatusMessage';
import SubmitDeliverableDialog from './SubmitDeliverableDialog';

export type Props = EditProps & {
  isBusy?: boolean;
};

const QuestionsDeliverableView = (props: Props): JSX.Element | null => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { goToDeliverableEdit } = useNavigateTo();
  const { isMobile } = useDeviceInfo();
  const { activeLocale } = useLocalization();
  const { currentDeliverable: deliverable, deliverableId, projectId } = useDeliverableData();
  const { status: requestStatus, update } = useUpdateDeliverable();

  const variablesWithValues: VariableWithValues[] = useAppSelector((state) =>
    selectDeliverableVariablesWithValues(state, deliverableId, projectId)
  );

  const [showSubmitDialog, setShowSubmitDialog] = useState<boolean>(false);

  // const submitButtonIsDisabled = useMemo(() => {
  //   return (
  //     !ppsSearchResults?.data?.length ||
  //     ppsSearchResults?.data?.every((species) => species.participantProjectSpecies.submissionStatus === 'Approved')
  //   );
  // }, [ppsSearchResults]);

  const submitDeliverable = useCallback(() => {
    if (deliverable?.id !== undefined) {
      update({ ...deliverable, status: 'In Review' });
    }
    setShowSubmitDialog(false);
  }, [deliverable]);

  useEffect(() => {
    if (!(deliverableId && projectId)) {
      return;
    }

    void dispatch(requestListDeliverableVariables(deliverableId));
    void dispatch(requestListDeliverableVariablesValues({ deliverableId, projectId }));
  }, [deliverableId, projectId]);

  const crumbs: Crumb[] = useMemo(
    () => [
      {
        name: activeLocale ? strings.DELIVERABLES : '',
        to: APP_PATHS.DELIVERABLES,
      },
    ],
    [activeLocale]
  );

  const actionMenu = useMemo(() => {
    if (!activeLocale) {
      return null;
    }

    return (
      <Box display='flex' justifyContent='right'>
        <Button
          id='edit-deliverable'
          icon='iconEdit'
          label={isMobile ? '' : strings.EDIT}
          onClick={() => goToDeliverableEdit(deliverableId, projectId)}
          size='medium'
          priority='secondary'
        />
        <Button
          // disabled={submitButtonIsDisabled}
          disabled={false}
          label={strings.SUBMIT_FOR_APPROVAL}
          onClick={() => setShowSubmitDialog(true)}
          size='medium'
          id='submit-deliverable'
        />
      </Box>
    );
  }, []);

  if (!deliverable) {
    return null;
  }

  if (isMobile) {
    return <MobileMessage deliverable={deliverable} />;
  }

  return (
    <>
      {deliverable && showSubmitDialog && (
        <SubmitDeliverableDialog
          onClose={() => setShowSubmitDialog(false)}
          onSubmit={submitDeliverable}
          submitMessage={strings.SUBMIT_QUESTIONNAIRE_CONFIRMATION}
        />
      )}

      <Page crumbs={crumbs} rightComponent={actionMenu} title={<TitleBar {...props} />}>
        {(props.isBusy || requestStatus === 'pending') && <BusySpinner />}
        <Box display='flex' flexDirection='column' flexGrow={1}>
          <QuestionsDeliverableStatusMessage deliverable={deliverable} variables={variablesWithValues} />
          <Card style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            <Metadata deliverable={deliverable} />
            <Box
              sx={{
                borderTop: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
                marginBottom: theme.spacing(4),
                paddingTop: theme.spacing(3),
              }}
            >
              {variablesWithValues.map((variableWithValues: VariableWithValues, index: number) => {
                const firstVariableValue: VariableValue | undefined = (variableWithValues?.variableValues || [])[0];

                return (
                  <Box key={index} sx={{ marginBottom: theme.spacing(4) }}>
                    <Box sx={{ float: 'right', marginBottom: '16px', marginLeft: '16px' }}>
                      {/* <DeliverableStatusBadge status={variableWithValues.status} /> */}
                    </Box>
                    <Typography sx={{ fontWeight: '600', marginBottom: '16px' }}>{variableWithValues.name}</Typography>
                    {!!variableWithValues.description && (
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
                        {variableWithValues.description}
                      </Typography>
                    )}
                    {!!firstVariableValue?.feedback && (
                      <Box marginBottom={theme.spacing(2)}>
                        <Message body={firstVariableValue.feedback} priority='critical' type='page' />
                      </Box>
                    )}
                    <DeliverableDisplayVariableValue projectId={projectId} variable={variableWithValues} />
                  </Box>
                );
              })}
            </Box>
          </Card>
        </Box>
      </Page>
    </>
  );
};

export default QuestionsDeliverableView;
