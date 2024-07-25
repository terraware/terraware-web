import React, { useCallback, useMemo, useState } from 'react';
;

import { Crumb } from 'src/components/BreadCrumbs';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import DeliverablePage from './DeliverablePage';
import DeliverableViewCard from 'src/components/DeliverableView/DeliverableCard';
import { useParams } from 'react-router-dom';
import useFetchDeliverable from 'src/components/DeliverableView/useFetchDeliverable';
import Page from 'src/components/Page';
import { Box } from '@mui/material';
import { Button } from '@terraware/web-components';
import useNavigateTo from 'src/hooks/useNavigateTo';
import SubmitDeliverableDialog from './SubmitDeliverableDialog';
import useUpdateDeliverable from 'src/components/DeliverableView/useUpdateDeliverable';

const DeliverableView = (): JSX.Element => {
  const { activeLocale } = useLocalization();
  const { deliverableId, projectId } = useParams<{ deliverableId: string; projectId: string }>();
  const { goToDeliverableEdit } = useNavigateTo();

  const { deliverable } = useFetchDeliverable({ deliverableId: Number(deliverableId), projectId: Number(projectId) });
  const { status: requestStatus, update } = useUpdateDeliverable();

  const [submitButtonDisabled, setSubmitButtonDisalbed] = useState<boolean>(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState<boolean>(false);
  const submitDeliverable = useCallback(() => {
    if (deliverable?.id !== undefined) {
      update({ ...deliverable, status: 'In Review' });
    }
    setShowSubmitDialog(false);
  }, [deliverable]);

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
    if (!activeLocale || !deliverable) {
      return null;
    }

    return (
      <Box display='flex' justifyContent='right'>
        {deliverable.type === 'Questions' && <Button
          id='edit-deliverable'
          icon='iconEdit'
          label={strings.EDIT}
          onClick={() => {
            const firstVisibleQuestion = document.querySelector('.question-visible');
            const variableId = firstVisibleQuestion?.getAttribute('data-variable-id');
            const scrolledBeyondViewport = window.scrollY > window.innerHeight;

            goToDeliverableEdit(
              deliverable.id,
              deliverable.projectId,
              Boolean(scrolledBeyondViewport && variableId) ? Number(variableId) : undefined
            );
          }}
          size='medium'
          priority='secondary'
        />}
        {(deliverable.type === 'Questions' || deliverable.type === 'Species') && <Button
          disabled={submitButtonDisabled}
          label={strings.SUBMIT_FOR_APPROVAL}
          onClick={() => setShowSubmitDialog(true)}
          size='medium'
          id='submit-deliverable'
        />}
      </Box>
    );
  }, [activeLocale, deliverable, submitButtonDisabled]);

  const isLoading = useMemo(() => {
    return requestStatus === 'pending'
  }, [requestStatus])

  if (!deliverable) {
    return <Page isLoading crumbs={crumbs}/>
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
      <DeliverablePage deliverable={deliverable} crumbs={crumbs} rightComponent={actionMenu} isLoading={isLoading}>
        <DeliverableViewCard deliverable={deliverable} setSubmitButtonDisalbed={setSubmitButtonDisalbed} />
      </DeliverablePage>
    </>
  );
};

export default DeliverableView;
