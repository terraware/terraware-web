import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Card, useTheme } from '@mui/material';
import { BusySpinner } from '@terraware/web-components';
import { FileChooser } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import { APP_PATHS } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization } from 'src/providers';
import { requestUploadApplicationBoundary } from 'src/redux/features/application/applicationAsyncThunks';
import { selectApplicationUploadBoundary } from 'src/redux/features/application/applicationSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import ApplicationPage from 'src/scenes/ApplicationRouter/portal/ApplicationPage';
import { useApplicationData } from 'src/scenes/ApplicationRouter/provider/Context';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';

const MapUploadView = () => {
  const theme = useTheme();

  const dispatch = useAppDispatch();
  const { reload, selectedApplication } = useApplicationData();
  const [requestId, setRequestId] = useState<string>('');
  const { goToApplicationMap } = useNavigateTo();

  const result = useAppSelector(selectApplicationUploadBoundary(requestId));
  const { toastError, toastSuccess } = useSnackbar();

  const handleFiles = useCallback(
    (files: File[]) => {
      if (!selectedApplication || files.length !== 1) {
        return;
      }
      const dispatched = dispatch(
        requestUploadApplicationBoundary({ applicationId: selectedApplication.id, file: files[0] })
      );
      setRequestId(dispatched.requestId);
    },
    [dispatch, selectedApplication, setRequestId]
  );

  const navigateToMap = useCallback(() => {
    if (selectedApplication) {
      goToApplicationMap(selectedApplication.id);
    }
  }, [goToApplicationMap, selectedApplication]);

  useEffect(() => {
    if (!result) {
      return;
    }

    if (result.status === 'success') {
      toastSuccess(strings.SUCCESS);
      reload(navigateToMap);
    } else {
      // TODO make more meaningful error messages
      toastError(strings.GENERIC_ERROR);
    }
  }, [navigateToMap, reload, result, toastError, toastError]);

  return (
    <Card style={{ width: '100%', padding: theme.spacing(2), borderRadius: theme.spacing(3) }}>
      <h3>{strings.UPLOAD_SHAPEFILE}</h3>
      {result?.status === 'pending' && <BusySpinner />}
      <FileChooser
        chooseFileText={strings.CHOOSE_FILE}
        maxFiles={1}
        setFiles={handleFiles}
        uploadDescription={strings.UPLOAD_FILES_DESCRIPTION}
        uploadText={strings.UPLOAD_SHAPEFILE}
      />
    </Card>
  );
};

const MapUploadViewWrapper = () => {
  const { activeLocale } = useLocalization();
  const { selectedApplication } = useApplicationData();

  const crumbs: Crumb[] = useMemo(
    () =>
      activeLocale && selectedApplication?.id
        ? [
            {
              name: strings.PRESCREEN,
              to: APP_PATHS.APPLICATION_PRESCREEN.replace(':applicationId', `${selectedApplication.id}`),
            },
          ]
        : [],
    [activeLocale, selectedApplication?.id]
  );

  return (
    <ApplicationPage crumbs={crumbs}>
      <MapUploadView />
    </ApplicationPage>
  );
};

export default MapUploadViewWrapper;
