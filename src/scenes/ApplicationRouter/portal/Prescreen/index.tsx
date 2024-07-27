import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Crumb } from 'src/components/BreadCrumbs';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import SectionView from 'src/scenes/ApplicationRouter/portal/Sections/SectionView';
import { useApplicationData } from 'src/scenes/ApplicationRouter/provider/Context';
import strings from 'src/strings';

import ApplicationPage from '../ApplicationPage';
import useNavigateTo from 'src/hooks/useNavigateTo';
import Button from 'src/components/common/button/Button';
import ConfirmModal from './ConfirmModal';
import { BusySpinner } from '@terraware/web-components';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { requestRestartApplication, requestSubmitApplication } from 'src/redux/features/application/applicationAsyncThunks';
import { selectApplicationRestart, selectApplicationSubmit } from 'src/redux/features/application/applicationSelectors';

const PrescreenView = () => {
  const { selectedApplication, applicationDeliverables, applicationSections, reload } = useApplicationData();
  const { goToApplication, goToApplicationPrescreenResult } = useNavigateTo();
  const [ isLoading, setIsLoading ] = useState<boolean>(false);
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
    () => applicationDeliverables.filter((deliverable) => deliverable.moduleId === prescreenSection?.moduleId),
    [applicationDeliverables, prescreenSection]
  );

  const allDeliverablesCompleted = useMemo(
    () => prescreenDeliverables.every((deliverable) => deliverable.status !== 'Not Submitted'),
    [prescreenDeliverables]
  );

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);

  const handleRestart = useCallback(async () => {
    if (selectedApplication) {
      setIsLoading(true);
      const dispatched = dispatch(requestRestartApplication({applicationId: selectedApplication.id}))
      setRestartRequestId(dispatched.requestId);
    }

  }, [dispatch, selectedApplication, setIsLoading, setRestartRequestId]);

  const handleSubmit = useCallback(async () => {
    if (selectedApplication) {
      setIsLoading(true);
      const dispatched = dispatch(requestSubmitApplication({applicationId: selectedApplication.id}))
      setSubmitRequestId(dispatched.requestId);
    }

  }, [dispatch, selectedApplication, setIsLoading, setRestartRequestId]);

  const onReload = useCallback(() => {
    if (!selectedApplication) {
      return;
    }
    if (selectedApplication.status === 'Not Submitted') {
      goToApplicationPrescreenResult(selectedApplication.id)
    } else {
      goToApplication(selectedApplication.id);
    }
  }, [selectedApplication, goToApplication, goToApplicationPrescreenResult])

  useEffect(() => {
    if (restartResult.data || submitResult.data) {
      reload(onReload);
    }
  }, [restartResult, submitResult, onReload])


  if (!selectedApplication || !prescreenSection) {
    return null;
  }

  return <>
    <ConfirmModal
      open={isConfirmModalOpen}
      onClose={() => setIsConfirmModalOpen(false)}
      title={''}
      body={''}
      onConfirm={selectedApplication.status === 'Not Submitted' ? handleSubmit : handleRestart}
    />
    { isLoading && <BusySpinner /> }
    <SectionView section={prescreenSection} sectionDeliverables={prescreenDeliverables} >
      {selectedApplication.status === 'Not Submitted' && (
        <Button
          disabled={!allDeliverablesCompleted || !selectedApplication.boundary}
          label={strings.SUBMIT_PRESCREEN}
          onClick={() => {
            handleSubmit();
          }}
          priority='primary'
        />
      )}

      {selectedApplication.status !== 'Not Submitted' && (
        <Button
          label={strings.RESTART_PRESCREEN}
          onClick={() => {
            handleRestart();
          }}
          priority='secondary'
        />
      )}
    </SectionView>;
  </>
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
