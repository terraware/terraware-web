import React, { useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router';

import { skipToken } from '@reduxjs/toolkit/query';

import QuestionsDeliverableEditForm from 'src/components/DeliverableView/QuestionsDeliverableEditForm';
import useNavigateTo from 'src/hooks/useNavigateTo';
import usePathApplicationId from 'src/hooks/usePathApplicationId';
import {
  useGetApplicationDeliverablesQuery,
  useGetApplicationModulesQuery,
  useGetApplicationQuery,
} from 'src/queries/generated/applications';

import ApplicationPage from '../ApplicationPage';

const SectionDeliverableEditView = () => {
  const { applicationId, deliverableId, sectionId } = useParams<{
    applicationId: string;
    deliverableId: string;
    sectionId: string;
  }>();
  const { goToApplicationSectionDeliverable } = useNavigateTo();
  const pathApplicationId = usePathApplicationId();
  const { currentData: applicationData } = useGetApplicationQuery(pathApplicationId ?? skipToken);
  const selectedApplication = applicationData?.application;
  const { currentData: deliverablesData } = useGetApplicationDeliverablesQuery(pathApplicationId ?? skipToken);
  const applicationDeliverables = useMemo(() => deliverablesData?.deliverables ?? [], [deliverablesData]);

  const exit = useCallback(() => {
    if (!(applicationId && deliverableId && sectionId)) {
      return;
    }
    goToApplicationSectionDeliverable(Number(applicationId), Number(sectionId), Number(deliverableId));
  }, [goToApplicationSectionDeliverable, applicationId, deliverableId, sectionId]);

  const deliverable = applicationDeliverables.find((_deliverable) => _deliverable.id === Number(deliverableId));

  const hideId = useMemo(() => {
    if (!selectedApplication || !deliverable || deliverable.type !== 'Questions') {
      return undefined;
    }

    return (
      selectedApplication.status === 'Not Submitted' ||
      selectedApplication.status === 'Failed Pre-screen' ||
      selectedApplication.status === 'Passed Pre-screen'
    );
  }, [deliverable, selectedApplication]);

  if (!selectedApplication || !deliverable) {
    return null;
  }

  return (
    <QuestionsDeliverableEditForm
      deliverable={{ ...deliverable, documents: [] }}
      exit={exit}
      hideId={hideId}
      hideStatusBadge
    />
  );
};

const SectionDeliverableEditWrapper = () => {
  const { deliverableId, sectionId } = useParams<{
    deliverableId: string;
    sectionId: string;
  }>();

  const pathApplicationId = usePathApplicationId();
  const { currentData: applicationData } = useGetApplicationQuery(pathApplicationId ?? skipToken);
  const selectedApplication = applicationData?.application;
  const { currentData: modulesData } = useGetApplicationModulesQuery(pathApplicationId ?? skipToken);
  const applicationSections = useMemo(() => modulesData?.modules ?? [], [modulesData]);
  const { currentData: deliverablesData } = useGetApplicationDeliverablesQuery(pathApplicationId ?? skipToken);
  const applicationDeliverables = useMemo(() => deliverablesData?.deliverables ?? [], [deliverablesData]);
  const { goToApplicationSectionDeliverable } = useNavigateTo();

  const section = useMemo(
    () => applicationSections.find((_section) => _section.moduleId === Number(sectionId)),
    [applicationSections, sectionId]
  );

  const deliverable = applicationDeliverables.find((_deliverable) => _deliverable.id === Number(deliverableId));

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
  }, [deliverable, section, selectedApplication, goToApplicationSectionDeliverable]);
  return (
    <ApplicationPage>
      <SectionDeliverableEditView />
    </ApplicationPage>
  );
};

export default SectionDeliverableEditWrapper;
