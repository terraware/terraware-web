import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

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
import { requestListDeliverableVariablesValues } from 'src/redux/features/documentProducer/values/valuesThunks';
import { selectDeliverableVariablesWithValues } from 'src/redux/features/documentProducer/variables/variablesSelector';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { VariableWithValues } from 'src/types/documentProducer/Variable';
import { missingRequiredFields } from 'src/utils/documentProducer/variables';
import useSnackbar from 'src/utils/useSnackbar';

import DeliverablePage from './DeliverablePage';
import SubmitDeliverableDialog from './SubmitDeliverableDialog';

const DeliverableView = (): JSX.Element => {
  const { activeLocale } = useLocalization();
  const { deliverableId, projectId } = useParams<{ deliverableId: string; projectId: string }>();
  const { goToDeliverableEdit } = useNavigateTo();

  const { deliverable } = useFetchDeliverable({ deliverableId: Number(deliverableId), projectId: Number(projectId) });
  const { status: requestStatus, submit } = useSubmitDeliverable();

  const [submitButtonDisabled, setSubmitButtonDisabled] = useState<boolean>(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();

  const variablesWithValues: VariableWithValues[] = useAppSelector((state) =>
    selectDeliverableVariablesWithValues(state, deliverable?.id || -1, deliverable?.projectId)
  );

  const questionsAreLoading = useMemo(
    () => deliverable?.type === 'Questions' && !variablesWithValues.length,
    [deliverable?.type, variablesWithValues.length]
  );

  useEffect(() => {
    if (deliverable) {
      void dispatch(
        requestListDeliverableVariablesValues({ deliverableId: deliverable.id, projectId: deliverable.projectId })
      );
    }
  }, [deliverable, dispatch]);

  const submitDeliverable = useCallback(() => {
    if (deliverable?.id !== undefined) {
      if (deliverable.type === 'Questions' && missingRequiredFields(variablesWithValues)) {
        snackbar.toastError(strings.CHECK_THAT_ALL_REQUIRED_QUESTIONS_ARE_FILLED_OUT_BEFORE_SUBMITTING);
      } else {
        submit(deliverable);
      }
    }
    setShowSubmitDialog(false);
  }, [deliverable, variablesWithValues, snackbar, submit]);

  const closeSubmitDialog = useCallback(() => {
    setShowSubmitDialog(false);
  }, [setShowSubmitDialog]);

  const openSubmitDialog = useCallback(() => {
    setShowSubmitDialog(true);
  }, [setShowSubmitDialog]);

  const onClickEdit = useCallback(() => {
    if (!deliverable) {
      return;
    }

    const firstVisibleQuestion = document.querySelector('.question-visible');
    const variableId = firstVisibleQuestion?.getAttribute('data-variable-id');
    const scrolledBeyondViewport = window.scrollY > window.innerHeight;

    goToDeliverableEdit(
      deliverable.id,
      deliverable.projectId,
      scrolledBeyondViewport && variableId ? Number(variableId) : undefined
    );
  }, [deliverable, goToDeliverableEdit]);

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
            disabled={!deliverable || questionsAreLoading}
            id='edit-deliverable'
            icon='iconEdit'
            label={strings.EDIT}
            onClick={onClickEdit}
            size='medium'
            priority='secondary'
          />
        )}
        {(deliverable.type === 'Questions' || deliverable.type === 'Species') && (
          <Button
            disabled={submitButtonDisabled || !deliverable || questionsAreLoading}
            label={strings.SUBMIT_FOR_APPROVAL}
            onClick={openSubmitDialog}
            size='medium'
            id='submit-deliverable'
          />
        )}
      </Box>
    );
  }, [activeLocale, deliverable, onClickEdit, openSubmitDialog, questionsAreLoading, submitButtonDisabled]);

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
          onClose={closeSubmitDialog}
          onSubmit={submitDeliverable}
          submitMessage={submitMessage}
        />
      )}
      <DeliverablePage deliverable={deliverable} crumbs={crumbs} rightComponent={actionMenu} isLoading={isLoading}>
        <DeliverableViewCard deliverable={deliverable} setSubmitButtonDisabled={setSubmitButtonDisabled} />
      </DeliverablePage>
    </>
  );
};

export default DeliverableView;
