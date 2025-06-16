import React from 'react';

import { BusySpinner } from '@terraware/web-components';

import TfMain from 'src/components/common/TfMain';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';

import GenericSiteView from './GenericSiteView';

export default function PlantingSiteView(): JSX.Element {
  const { plantingSite } = usePlantingSiteData();
  return (
    <TfMain>
      {plantingSite === undefined && <BusySpinner withSkrim={true} />}
      {plantingSite !== undefined && <GenericSiteView plantingSite={plantingSite} />}
    </TfMain>
  );
}
