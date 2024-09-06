import React, { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Box } from '@mui/material';
import { Button } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import DeliverableViewCard from 'src/components/DeliverableView/DeliverableCard';
import useFetchDeliverable from 'src/components/DeliverableView/useFetchDeliverable';
import useSubmitDeliverable from 'src/components/DeliverableView/useSubmitDeliverable';
import Page from 'src/components/Page';
import { APP_PATHS } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';

import DeliverablePage from './DeliverablePage';
import SubmitDeliverableDialog from './SubmitDeliverableDialog';

const DeliverableView = (): JSX.Element => {
  const { activeLocale } = useLocalization();
  const { deliverableId, projectId } = useParams<{ deliverableId: string; projectId: string }>();
  const { goToDeliverableEdit } = useNavigateTo();

  const { deliverable } = useFetchDeliverable({ deliverableId: Number(deliverableId), projectId: Number(projectId) });
  const { status: requestStatus, submit } = useSubmitDeliverable();

  const [submitButtonDisabled, setSubmitButtonDisalbed] = useState<boolean>(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState<boolean>(false);

  const submitDeliverable = useCallback(() => {
    if (deliverable?.id !== undefined) {
      submit(deliverable);
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
        {deliverable.type === 'Questions' && (
          <Button
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
          />
        )}
        {(deliverable.type === 'Questions' || deliverable.type === 'Species') && (
          <Button
            disabled={submitButtonDisabled}
            label={strings.SUBMIT_FOR_APPROVAL}
            onClick={() => setShowSubmitDialog(true)}
            size='medium'
            id='submit-deliverable'
          />
        )}
      </Box>
    );
  }, [activeLocale, deliverable, submitButtonDisabled]);

  const isLoading = useMemo(() => {
    return requestStatus === 'pending';
  }, [requestStatus]);

  const submitMessage = useMemo(() => {
    if (!activeLocale || !deliverable) {
      return '';
    }

    switch (deliverable.type) {
      case 'Species':
        return strings.SUBMIT_SPECIES_CONFIRMATION;
      case 'Questions':
        return strings.SUBMIT_QUESTIONNAIRE_CONFIRMATION;
      default:
        return '';
    }
  }, [activeLocale, deliverable]);

  if (!deliverable) {
    return <Page isLoading crumbs={crumbs} />;
  }

  return (
    <>
      {deliverable && showSubmitDialog && (
        <SubmitDeliverableDialog
          onClose={() => setShowSubmitDialog(false)}
          onSubmit={submitDeliverable}
          submitMessage={submitMessage}
        />
      )}
      <DeliverablePage deliverable={deliverable} crumbs={crumbs} rightComponent={actionMenu} isLoading={isLoading}>
        <DeliverableViewCard deliverable={deliverable} setSubmitButtonDisalbed={setSubmitButtonDisalbed} />
      </DeliverablePage>
    </>
  );
};

export default DeliverableView;
