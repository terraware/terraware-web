import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { Box } from '@mui/material';
import { Button } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import DeliverableViewCard from 'src/components/DeliverableView/DeliverableCard';
import { APP_PATHS } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization } from 'src/providers';
import { useApplicationData } from 'src/providers/Application/Context';
import strings from 'src/strings';

import ApplicationPage from '../ApplicationPage';

const SectionDeliverableView = () => {
  const { deliverableId } = useParams<{ deliverableId: string }>();
  const { selectedApplication, applicationDeliverables } = useApplicationData();

  const deliverable = applicationDeliverables.find((deliverable) => deliverable.id === Number(deliverableId));

  if (!selectedApplication || !deliverable) {
    return null;
  }

  return <DeliverableViewCard deliverable={{ ...deliverable, documents: [] }} hideStatusBadge />;
};

const SectionDeliverableWrapper = () => {
  const { applicationId, deliverableId, sectionId } = useParams<{
    applicationId: string;
    deliverableId: string;
    sectionId: string;
  }>();
  const { activeLocale } = useLocalization();
  const { goToApplicationSectionDeliverableEdit } = useNavigateTo();
  const { applicationDeliverables, applicationSections, selectedApplication } = useApplicationData();

  const section = useMemo(
    () => applicationSections.find((section) => section.moduleId === Number(sectionId)),
    [applicationSections, sectionId]
  );

  const deliverable = applicationDeliverables.find((deliverable) => deliverable.id === Number(deliverableId));

  const crumbs: Crumb[] = useMemo(() => {
    if (!activeLocale || !selectedApplication || !section) {
      return [];
    }

    if (section.phase === 'Pre-Screen') {
      return [
        {
          name: strings.APPLICATION_PRESCREEN,
          to: APP_PATHS.APPLICATION_PRESCREEN.replace(':applicationId', `${selectedApplication.id}`),
        },
      ];
    } else {
      return [
        {
          name: section.name,
          to: APP_PATHS.APPLICATION_SECTION.replace(':applicationId', `${selectedApplication.id}`).replace(
            ':sectionId',
            `${section.moduleId}`
          ),
        },
      ];
    }
  }, [activeLocale, selectedApplication, section]);

  const showEditButton = useMemo(() => {
    if (!selectedApplication || !section || !deliverable) {
      return false;
    }

    if (section.phase === 'Pre-Screen') {
      return deliverable.type === 'Questions' && selectedApplication.status === 'Not Submitted';
    } else if (section.phase === 'Application') {
      return deliverable.type === 'Questions' && selectedApplication.status === 'Passed Pre-screen';
    }
  }, [deliverable, section, selectedApplication]);

  const actionMenu = useMemo(() => {
    if (!activeLocale) {
      return null;
    }

    return (
      <Box display='flex' justifyContent='right'>
        <Button
          id='edit-deliverable'
          icon='iconEdit'
          label={strings.EDIT}
          onClick={() => {
            if (!applicationId || !deliverableId || !sectionId) {
              return;
            }
            const firstVisibleQuestion = document.querySelector('.question-visible');
            const variableId = firstVisibleQuestion?.getAttribute('data-variable-id');
            const scrolledBeyondViewport = window.scrollY > window.innerHeight;

            goToApplicationSectionDeliverableEdit(
              Number(applicationId),
              Number(sectionId),
              Number(deliverableId),
              Boolean(scrolledBeyondViewport && variableId) ? Number(variableId) : undefined
            );
          }}
          size='medium'
          priority='secondary'
        />
      </Box>
    );
  }, [activeLocale, applicationId, deliverableId, sectionId]);

  return (
    <ApplicationPage rightComponent={showEditButton ? actionMenu : undefined} crumbs={crumbs}>
      <SectionDeliverableView />
    </ApplicationPage>
  );
};

export default SectionDeliverableWrapper;
