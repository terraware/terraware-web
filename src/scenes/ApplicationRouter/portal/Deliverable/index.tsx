import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Box } from '@mui/material';
import { Button } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import DeliverableViewCard from 'src/components/DeliverableView/DeliverableCard';
import { APP_PATHS } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization } from 'src/providers';
import { useApplicationData } from 'src/scenes/ApplicationRouter/provider/Context';
import strings from 'src/strings';

import ApplicationPage from '../ApplicationPage';

type SectionDeliverableViewProp = {
  setShowEditButton: (showEditButton: boolean) => void;
};

const SectionDeliverableView = ({ setShowEditButton }: SectionDeliverableViewProp) => {
  const { deliverableId } = useParams<{ deliverableId: string }>();
  const { selectedApplication, applicationDeliverables } = useApplicationData();

  const deliverable = applicationDeliverables.find((deliverable) => deliverable.id === Number(deliverableId));

  useEffect(() => {
    setShowEditButton(deliverable?.type === 'Questions');
  }, [deliverable, setShowEditButton]);

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
  const { applicationSections, selectedApplication } = useApplicationData();

  const section = useMemo(
    () => applicationSections.find((section) => section.moduleId === Number(sectionId)),
    [applicationSections, sectionId]
  );

  const [showEditButton, setShowEditButton] = useState<boolean>(false);

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
      <SectionDeliverableView setShowEditButton={setShowEditButton} />
    </ApplicationPage>
  );
};

export default SectionDeliverableWrapper;
