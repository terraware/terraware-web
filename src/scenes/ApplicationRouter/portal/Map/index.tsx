import React, { useCallback, useEffect, useMemo, useState } from 'react';

import ApplicationMapCard from 'src/components/Application/ApplicationMapCard';
import UpdateOrUploadBoundaryModal from 'src/components/Application/UpdateOrUploadBoundaryModal';
import { Crumb } from 'src/components/BreadCrumbs';
import Button from 'src/components/common/button/Button';
import { APP_PATHS } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization } from 'src/providers';
import { useApplicationData } from 'src/providers/Application/Context';
import ApplicationPage from 'src/scenes/ApplicationRouter/portal/ApplicationPage';
import strings from 'src/strings';

const MapViewWrapper = () => {
  const { activeLocale } = useLocalization();
  const { selectedApplication } = useApplicationData();

  const { goToApplicationMapUpdate, goToApplicationMapUpload, goToApplicationPrescreen } = useNavigateTo();

  useEffect(() => {
    if (!selectedApplication) {
      return;
    }

    if (!selectedApplication.boundary) {
      goToApplicationPrescreen(selectedApplication.id);
    }
  }, [selectedApplication]);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const onNext = useCallback(
    (type: 'Update' | 'Upload') => {
      if (selectedApplication !== undefined) {
        if (type === 'Update') {
          goToApplicationMapUpdate(selectedApplication.id);
        } else {
          goToApplicationMapUpload(selectedApplication.id);
        }
      }
    },
    [selectedApplication, goToApplicationMapUpdate, goToApplicationMapUpload]
  );

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
    <ApplicationPage
      crumbs={crumbs}
      rightComponent={
        <Button label={strings.REPLACE_BOUNDARY} onClick={() => setIsOpen(true)} priority={'secondary'} />
      }
    >
      <UpdateOrUploadBoundaryModal
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        onNext={onNext}
      />
      {selectedApplication && <ApplicationMapCard application={selectedApplication} />}
    </ApplicationPage>
  );
};

export default MapViewWrapper;
