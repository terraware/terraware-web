import React from 'react';
import { Route, Routes } from 'react-router';

import { useOrganizationSpecies } from 'src/hooks/useOrganizationSpecies';
import NurseryPlantingsAndWithdrawalsView from 'src/scenes/NurseryRouter/NurseryPlantingsAndWithdrawalsView';
import NurseryWithdrawalsDetailsView from 'src/scenes/NurseryRouter/NurseryWithdrawalsDetailsView';

const NurseryRouter = () => {
  const { species } = useOrganizationSpecies();

  return (
    <Routes>
      <Route path={'/withdrawals'} element={<NurseryPlantingsAndWithdrawalsView />} />
      <Route path={'/withdrawals/:withdrawalId'} element={<NurseryWithdrawalsDetailsView species={species} />} />
    </Routes>
  );
};

export default NurseryRouter;
