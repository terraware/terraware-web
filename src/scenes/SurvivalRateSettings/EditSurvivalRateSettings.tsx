import React, { useEffect } from 'react';
import { useParams } from 'react-router';

import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import strings from 'src/strings';

import SurvivalRateInstructions from './SurvivalRateInstructions';

const EditSurvivalRateSettings = () => {
  const { plantingSite, setSelectedPlantingSite } = usePlantingSiteData();
  const params = useParams<{
    plantingSiteId: string;
  }>();

  const plantingSiteId = Number(params.plantingSiteId);

  useEffect(() => {
    setSelectedPlantingSite(plantingSiteId);
  }, [plantingSiteId, setSelectedPlantingSite]);

  return (
    <Page title={strings.formatString(strings.EDIT_SURVIVAL_RATE_SETTINGS_FOR, plantingSite?.name || '')}>
      <Card radius='8px'>
        <SurvivalRateInstructions />
      </Card>
    </Page>
  );
};

export default EditSurvivalRateSettings;
