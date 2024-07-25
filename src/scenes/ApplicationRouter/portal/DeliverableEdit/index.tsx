import React, { useCallback } from 'react';
import { useParams } from 'react-router-dom';

import QuestionsDeliverableEditForm from 'src/components/DeliverableView/QuestionsDeliverableEditForm';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useApplicationData } from 'src/scenes/ApplicationRouter/provider/Context';

import ApplicationPage from '../ApplicationPage';

const SectionDeliverableEditView = () => {
  const { applicationId, deliverableId, sectionId } = useParams<{
    applicationId: string;
    deliverableId: string;
    sectionId: string;
  }>();
  const { goToApplicationSectionDeliverable } = useNavigateTo();
  const { selectedApplication, applicationDeliverables } = useApplicationData();

  const exit = useCallback(() => {
    if (!(applicationId && deliverableId && sectionId)) {
      return;
    }
    goToApplicationSectionDeliverable(Number(applicationId), Number(sectionId), Number(deliverableId));
  }, [goToApplicationSectionDeliverable, applicationId, deliverableId, sectionId]);

  const deliverable = applicationDeliverables.find((deliverable) => deliverable.id === Number(deliverableId));

  if (!selectedApplication || !deliverable) {
    return null;
  }

  return <QuestionsDeliverableEditForm deliverable={{ ...deliverable, documents: [] }} exit={exit} hideStatusBadge />;
};

const SectionDeliverableEditWrapper = () => {
  return (
    <ApplicationPage>
      <SectionDeliverableEditView />
    </ApplicationPage>
  );
};

export default SectionDeliverableEditWrapper;
