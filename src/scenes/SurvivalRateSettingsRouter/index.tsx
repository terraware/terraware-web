import React, { type JSX } from 'react';
import { Route, Routes } from 'react-router';

import SurvivalRateSettings from '../SurvivalRateSettings';
import EditSurvivalRateSettings from '../SurvivalRateSettings/EditSurvivalRateSettings';

export default function SurvivalRateSettingsRouter(): JSX.Element {
  return (
    <Routes>
      <Route path={'/:plantingSiteId'} element={<SurvivalRateSettings />} />
      <Route path={'/:plantingSiteId/edit'} element={<EditSurvivalRateSettings />} />
    </Routes>
  );
}
