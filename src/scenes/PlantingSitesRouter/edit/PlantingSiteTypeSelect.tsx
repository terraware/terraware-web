import React, { type JSX } from 'react';

import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { SiteType } from 'src/types/PlantingSite';

import PlantingSiteSelectTypeModal2 from './PlantingSiteSelectTypeModal2';

export type PlantingSiteTypeSelectProps = {
  onClose: () => void;
};

export default function PlantingSiteTypeSelect(props: PlantingSiteTypeSelectProps): JSX.Element {
  const { onClose } = props;
  const navigate = useSyncNavigate();

  const goTo = (appPath: string, search?: string) => {
    const appPathLocation = {
      pathname: appPath,
      search,
    };
    navigate(appPathLocation);
  };

  return (
    <PlantingSiteSelectTypeModal2
      open
      onNext={(siteType: SiteType) =>
        void goTo(APP_PATHS.PLANTING_SITES_DRAFT_NEW, siteType === 'detailed' ? '?detailed' : '')
      }
      onClose={onClose}
    />
  );
}
