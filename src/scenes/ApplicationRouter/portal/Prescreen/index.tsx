import React, { useCallback, useEffect, useMemo, useState } from 'react';

import ConfirmModal from 'src/components/Application/ConfirmModal';
import { Crumb } from 'src/components/BreadCrumbs';
import Button from 'src/components/common/button/Button';
import { APP_PATHS } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization } from 'src/providers';
import { useApplicationData } from 'src/providers/Application/Context';
import {
  requestRestartApplication,
  requestSubmitApplication,
} from 'src/redux/features/application/applicationAsyncThunks';
import { selectApplicationRestart, selectApplicationSubmit } from 'src/redux/features/application/applicationSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import SectionView from 'src/scenes/ApplicationRouter/portal/Sections/SectionView';
import strings from 'src/strings';

import ApplicationPage from '../ApplicationPage';

export const PRESCREEN_BOUNDARY_DELIVERABLE_ID = 68;
export const PRESCREEN_MODULE_ID = 2;

const PrescreenView = () => {
  const { selectedApplication, applicationDeliverables, applicationSections, reload } = useApplicationData();
  const { goToApplication, goToApplicationPrescreenResult } = useNavigateTo();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  const [restartRequestId, setRestartRequestId] = useState<string>('');
  const [submitRequestId, setSubmitRequestId] = useState<string>('');

  const restartResult = useAppSelector(selectApplicationRestart(restartRequestId));
  const submitResult = useAppSelector(selectApplicationSubmit(submitRequestId));

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

  const handleRestart = useCallback(() => {
    if (selectedApplication) {
      setIsLoading(true);
      const dispatched = dispatch(requestRestartApplication({ applicationId: selectedApplication.id }));
      setRestartRequestId(dispatched.requestId);
    }
  }, [dispatch, selectedApplication, setIsLoading, setRestartRequestId]);

  const handleSubmit = useCallback(() => {
    if (selectedApplication) {
      setIsLoading(true);
      const dispatched = dispatch(requestSubmitApplication({ applicationId: selectedApplication.id }));
      setSubmitRequestId(dispatched.requestId);
    }
  }, [dispatch, selectedApplication, setIsLoading, setRestartRequestId]);

  const onReload = useCallback(
    (submit: boolean) => {
      if (!selectedApplication) {
        return;
      }
      setIsLoading(false);
      setIsConfirmModalOpen(false);
      if (submit) {
        setSubmitRequestId('');
        goToApplicationPrescreenResult(selectedApplication.id);
      } else {
        setRestartRequestId('');
      }
    },
    [selectedApplication, goToApplication, goToApplicationPrescreenResult, setIsLoading, setIsConfirmModalOpen]
  );

  useEffect(() => {
    const submitResultSuccess = Boolean(submitResult && submitResult.status === 'success' && submitResult.data);
    if ((restartResult && restartResult.status === 'success' && restartResult.data) || submitResultSuccess) {
      reload(() => onReload(submitResultSuccess));
    }
  }, [restartResult, submitResult, onReload]);

  if (!selectedApplication || !prescreenSection) {
    return null;
  }

  return (
    <>
      <ConfirmModal
        open={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title={selectedApplication.status === 'Not Submitted' ? strings.SUBMIT_PRESCREEN : strings.RESTART_PRESCREEN}
        body={`${selectedApplication.status === 'Not Submitted' ? strings.SUBMIT_PRESCREEN_CONFIRMATION : strings.RESTART_PRESCREEN_CONFIRMATION}\n${strings.ARE_YOU_SURE}`}
        onConfirm={selectedApplication.status === 'Not Submitted' ? handleSubmit : handleRestart}
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

        {selectedApplication.status !== 'Not Submitted' && (
          <Button
            disabled={isLoading}
            label={strings.RESTART_PRESCREEN}
            onClick={() => setIsConfirmModalOpen(true)}
            priority='secondary'
          />
        )}
      </SectionView>
    </>
  );
};

const PrescreenViewWrapper = () => {
  const { activeLocale } = useLocalization();
  const { selectedApplication } = useApplicationData();

  const crumbs: Crumb[] = useMemo(
    () =>
      activeLocale && selectedApplication?.id
        ? [
            {
              name: strings.ALL_SECTIONS,
              to: APP_PATHS.APPLICATION_OVERVIEW.replace(':applicationId', `${selectedApplication.id}`),
            },
          ]
        : [],
    [activeLocale, selectedApplication?.id]
  );

  return (
    <ApplicationPage crumbs={crumbs}>
      <PrescreenView />
    </ApplicationPage>
  );
};

export default PrescreenViewWrapper;
