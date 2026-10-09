import React, { useCallback, useMemo, useState } from 'react';

import ConfirmModal from 'src/components/Application/ConfirmModal';
import { Crumb } from 'src/components/BreadCrumbs';
import Button from 'src/components/common/button/Button';
import { APP_PATHS } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization } from 'src/providers';
import { useApplicationData } from 'src/providers/Application/Context';
import { useRestartApplicationMutation, useSubmitApplicationMutation } from 'src/queries/generated/applications';
import SectionView from 'src/scenes/ApplicationRouter/portal/Sections/SectionView';
import strings from 'src/strings';

import ApplicationPage from '../ApplicationPage';

export const PRESCREEN_BOUNDARY_DELIVERABLE_ID = 68;
export const PRESCREEN_MODULE_ID = 2;

const PrescreenView = () => {
  const { activeLocale } = useLocalization();
  const { selectedApplication, applicationDeliverables, applicationSections, reload } = useApplicationData();
  const { goToApplicationPrescreenResult } = useNavigateTo();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [restartApplication, restartResult] = useRestartApplicationMutation();
  const [submitApplication, submitResult] = useSubmitApplicationMutation();

  const prescreenSection = useMemo(
    () => applicationSections.find((section) => section.phase === 'Pre-Screen'),
    [applicationSections]
  );

  const prescreenDeliverables = useMemo(
    () =>
      applicationDeliverables
        .filter((deliverable) => deliverable.moduleId === prescreenSection?.moduleId)
        .map((deliverable) =>
          deliverable.id === PRESCREEN_BOUNDARY_DELIVERABLE_ID
            ? { ...deliverable, isBoundary: true }
            : { ...deliverable, isBoundary: false }
        ),
    [applicationDeliverables, prescreenSection]
  );

  const allDeliverablesCompleted = useMemo(
    () =>
      prescreenDeliverables.every((deliverable) =>
        deliverable.isBoundary
          ? deliverable.status !== 'Not Submitted' || selectedApplication?.boundary
          : deliverable.status !== 'Not Submitted'
      ),
    [prescreenDeliverables, selectedApplication]
  );

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);

  const onDone = useCallback(
    (submit: boolean) => {
      if (!selectedApplication) {
        return;
      }
      setIsLoading(false);
      setIsConfirmModalOpen(false);
      if (submit) {
        goToApplicationPrescreenResult(selectedApplication.id);
      }
    },
    [selectedApplication, goToApplicationPrescreenResult, setIsLoading, setIsConfirmModalOpen]
  );

  const handleRestart = useCallback(() => {
    if (selectedApplication) {
      setIsLoading(true);
      void restartApplication(selectedApplication.id)
        .unwrap()
        .then(() => reload(() => onDone(false)))
        .then((reloaded) => {
          if (!reloaded) {
            setIsLoading(false);
          }
        })
        .catch(() => setIsLoading(false));
    }
  }, [onDone, reload, restartApplication, selectedApplication, setIsLoading]);

  const handleSubmit = useCallback(() => {
    if (selectedApplication) {
      setIsLoading(true);
      void submitApplication(selectedApplication.id)
        .unwrap()
        .then(() => reload(() => onDone(true)))
        .then((reloaded) => {
          if (!reloaded) {
            setIsLoading(false);
          }
        })
        .catch(() => setIsLoading(false));
    }
  }, [onDone, reload, selectedApplication, setIsLoading, submitApplication]);

  const handleConfirm = useCallback(() => {
    if (!selectedApplication) {
      return;
    }
    if (selectedApplication.status === 'Not Submitted') {
      handleSubmit();
    } else if (
      selectedApplication.status === 'Failed Pre-screen' ||
      selectedApplication.status === 'Passed Pre-screen'
    ) {
      handleRestart();
    }
  }, [selectedApplication, handleRestart, handleSubmit]);

  const { modalTitle, modalBody } = useMemo(() => {
    if (!activeLocale || !selectedApplication) {
      return { modalTitle: '', modalBody: '' };
    }

    if (selectedApplication.status === 'Not Submitted') {
      return {
        modalTitle: strings.SUBMIT_PRESCREEN,
        modalBody: `${strings.SUBMIT_PRESCREEN_CONFIRMATION}\n${strings.ARE_YOU_SURE}`,
      };
    } else if (
      selectedApplication.status === 'Failed Pre-screen' ||
      selectedApplication.status === 'Passed Pre-screen'
    ) {
      return {
        modalTitle: strings.RESTART_PRESCREEN,
        modalBody: `${strings.RESTART_PRESCREEN_CONFIRMATION}\n${strings.ARE_YOU_SURE}`,
      };
    } else {
      return { modalTitle: '', modalBody: '' };
    }
  }, [activeLocale, selectedApplication]);

  const selectedApplicationId = selectedApplication?.id;

  const crumbs: Crumb[] = useMemo(
    () =>
      activeLocale && selectedApplicationId
        ? [
            {
              name: strings.ALL_SECTIONS,
              to: APP_PATHS.APPLICATION_OVERVIEW.replace(':applicationId', `${selectedApplicationId}`),
            },
          ]
        : [],
    [activeLocale, selectedApplicationId]
  );

  return (
    <ApplicationPage crumbs={crumbs} isLoading={submitResult.isLoading || restartResult.isLoading}>
      {!selectedApplication || !prescreenSection ? null : (
        <>
          <ConfirmModal
            open={isConfirmModalOpen}
            onClose={() => setIsConfirmModalOpen(false)}
            title={modalTitle}
            body={modalBody}
            onConfirm={handleConfirm}
          />
          <SectionView section={prescreenSection} sectionDeliverables={prescreenDeliverables}>
            {selectedApplication.status === 'Not Submitted' && (
              <Button
                disabled={!allDeliverablesCompleted || isLoading}
                label={strings.SUBMIT_PRESCREEN}
                onClick={() => setIsConfirmModalOpen(true)}
                priority='primary'
              />
            )}

            {(selectedApplication.status === 'Failed Pre-screen' ||
              selectedApplication.status === 'Passed Pre-screen') && (
              <Button
                disabled={isLoading}
                label={strings.RESTART_PRESCREEN}
                onClick={() => setIsConfirmModalOpen(true)}
                priority='secondary'
              />
            )}
          </SectionView>
        </>
      )}
    </ApplicationPage>
  );
};

export default PrescreenView;
