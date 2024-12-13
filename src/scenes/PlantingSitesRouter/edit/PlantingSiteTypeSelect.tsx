import React from 'react';
import { useNavigate } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';
import { SiteType } from 'src/types/PlantingSite';

import PlantingSiteSelectTypeModal2 from './PlantingSiteSelectTypeModal2';

export type PlantingSiteTypeSelectProps = {
  onClose: () => void;
};

export default function PlantingSiteTypeSelect(props: PlantingSiteTypeSelectProps): JSX.Element {
  const { onClose } = props;
  const navigate = useNavigate();

  const goTo = (appPath: string, search?: string) => {
    const appPathLocation = {
      pathname: appPath,
      search,
    };
    navigate(appPathLocation);
  };

  return (
    <PlantingSiteSelectTypeModal2
      open={true}
      onNext={(siteType: SiteType) =>
        void goTo(APP_PATHS.PLANTING_SITES_DRAFT_NEW, siteType === 'detailed' ? '?detailed' : '')
      }
      onClose={onClose}
    />
  );
}
