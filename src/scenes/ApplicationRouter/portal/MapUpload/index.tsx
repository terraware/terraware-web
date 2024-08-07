import React, { useCallback, useMemo } from 'react';

import ApplicationMapUploadCard from 'src/components/Application/ApplicationMapUploadCard';
import { Crumb } from 'src/components/BreadCrumbs';
import { APP_PATHS } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization } from 'src/providers';
import { useApplicationData } from 'src/providers/Application/Context';
import ApplicationPage from 'src/scenes/ApplicationRouter/portal/ApplicationPage';
import strings from 'src/strings';

const MapUploadViewWrapper = () => {
  const { activeLocale } = useLocalization();
  const { selectedApplication, reload } = useApplicationData();
  const { goToApplicationMap } = useNavigateTo();

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

  const navigateToMap = useCallback(() => {
    if (selectedApplication) {
      goToApplicationMap(selectedApplication.id);
    }
  }, [goToApplicationMap, selectedApplication]);

  return (
    <ApplicationPage crumbs={crumbs}>
      {selectedApplication && (
        <ApplicationMapUploadCard application={selectedApplication} onSuccess={() => reload(navigateToMap)} />
      )}
    </ApplicationPage>
  );
};

export default MapUploadViewWrapper;
