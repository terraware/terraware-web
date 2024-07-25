import React, { useCallback } from 'react';
import { useParams } from 'react-router-dom';

import QuestionsDeliverableEditForm from 'src/components/DeliverableView/QuestionsDeliverableEditForm';
import useFetchDeliverable from 'src/components/DeliverableView/useFetchDeliverable';
import useNavigateTo from 'src/hooks/useNavigateTo';

import DeliverablePage from './DeliverablePage';

const QuestionsDeliverableEditView = (): JSX.Element | null => {
  const { goToDeliverable } = useNavigateTo();
  const { deliverableId, projectId } = useParams<{ deliverableId: string; projectId: string }>();
  const { deliverable } = useFetchDeliverable({ deliverableId: Number(deliverableId), projectId: Number(projectId) });

  const goToThisDeliverable = useCallback(() => {
    if (deliverable) {
      goToDeliverable(deliverable.id, deliverable?.projectId);
    }
  }, [deliverable]);

  if (!deliverable) {
    return null;
  }

  return (
    <DeliverablePage deliverable={deliverable}>
      <QuestionsDeliverableEditForm deliverable={deliverable} exit={goToThisDeliverable} />
    </DeliverablePage>
  );
};

export default QuestionsDeliverableEditView;
