import React, { useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import QuestionsDeliverableEditForm from 'src/components/DeliverableView/QuestionsDeliverableEditForm';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useApplicationData } from 'src/providers/Application/Context';

import ApplicationPage from '../ApplicationPage';

const SectionDeliverableEditView = () => {
  const { applicationId, deliverableId, sectionId } = useParams<{
    applicationId: string;
    deliverableId: string;
    sectionId: string;
  }>();
  const { goToApplicationSectionDeliverable } = useNavigateTo();
  const { selectedApplication, applicationDeliverables, reload } = useApplicationData();

  const exit = useCallback(() => {
    if (!(applicationId && deliverableId && sectionId)) {
      return;
    }
    reload(() => goToApplicationSectionDeliverable(Number(applicationId), Number(sectionId), Number(deliverableId)));
  }, [goToApplicationSectionDeliverable, applicationId, deliverableId, reload, sectionId]);

  const deliverable = applicationDeliverables.find((deliverable) => deliverable.id === Number(deliverableId));

  if (!selectedApplication || !deliverable) {
    return null;
  }

  return <QuestionsDeliverableEditForm deliverable={{ ...deliverable, documents: [] }} exit={exit} hideStatusBadge />;
};

const SectionDeliverableEditWrapper = () => {
  const { deliverableId, sectionId } = useParams<{
    deliverableId: string;
    sectionId: string;
  }>();

  const { applicationDeliverables, applicationSections, selectedApplication } = useApplicationData();
  const { goToApplicationSectionDeliverable } = useNavigateTo();

  const section = useMemo(
    () => applicationSections.find((section) => section.moduleId === Number(sectionId)),
    [applicationSections, sectionId]
  );

  const deliverable = applicationDeliverables.find((deliverable) => deliverable.id === Number(deliverableId));

  useEffect(() => {
    if (!selectedApplication || !section || !deliverable) {
      return;
    }

    if (section.phase === 'Pre-Screen') {
      if (deliverable.type !== 'Questions' || selectedApplication.status !== 'Not Submitted') {
        goToApplicationSectionDeliverable(selectedApplication.id, section.moduleId, deliverable.id);
      }
    } else if (section.phase === 'Application') {
      if (deliverable.type !== 'Questions' || selectedApplication.status !== 'Passed Pre-screen') {
        goToApplicationSectionDeliverable(selectedApplication.id, section.moduleId, deliverable.id);
      }
    }
  }, [deliverable, section, selectedApplication]);
  return (
    <ApplicationPage>
      <SectionDeliverableEditView />
    </ApplicationPage>
  );
};

export default SectionDeliverableEditWrapper;
